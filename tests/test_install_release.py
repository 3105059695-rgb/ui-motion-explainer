"""Exercise real portable installation, safe updates and ZIP payload selection."""
from pathlib import Path
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from release_manifest import MANIFEST, build_manifest, validate_resources, verify_release
from package import package

spec = importlib.util.spec_from_file_location('fusion_installer', ROOT / 'install.py')
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


def write(root, relative, data='fixture'):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data) if isinstance(data, (dict, list)) else data, encoding='utf-8')


def fixture(root):
    root.mkdir(parents=True)
    for relative in ['install.py', 'scripts/release_manifest.py', 'scripts/package.py',
                     'scripts/verify_package.py']:
        destination = root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / relative, destination)
    for relative in ['SKILL.md', 'agents/openai.yaml', 'scripts/ui.py', 'assets/core/source.js']:
        write(root, relative)
    write(root, 'references/resource-registry.json', {'modules': [
        {'id': 'core', 'path': '.', 'required': ['assets/core/source.js'],
         'commands': {'ui': 'scripts/ui.py'}, 'required_for_install': True},
        {'id': 'optional-private', 'path': 'assets/local-only',
         'required': ['missing.json'], 'required_for_install': False}]})
    anchors = [{'frame': f'assets/fred/anchor-{i}.jpg'} for i in range(3)]
    for row in anchors:
        write(root, row['frame'])
    write(root, 'references/evidence/fred-reference-approved-20261015.json', {
        'direction_contract': {'visual_calibration': {'anchors': anchors}}})
    characters = ['assets/girl/identity-1.png', 'assets/girl/identity-2.png']
    scenes = [{'gallery_asset_id': str(i), 'image_path': f'assets/girl/scene-{i}.png'} for i in range(8)]
    for name in characters + [row['image_path'] for row in scenes]:
        write(root, name)
    write(root, 'references/aigc-assets.json', {'style_sets': [{
        'id': 'qiuzhi-girl-painterly', 'character_references': characters,
        'approval': {'approved_asset_ids': [str(i) for i in range(8)]}, 'assets': scenes}]})
    build_manifest(root, '1')
    return root


class InstallReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.source = fixture(self.base / 'download' / 'ui-motion-fusion')
        self.target = self.base / 'profile' / 'skills' / 'ui-motion-fusion'

    def install(self, **kwargs):
        return installer.install(self.source, self.target, **kwargs)

    def test_new_install_with_spaces_and_chinese_path_and_cli(self):
        target = self.base / '中文 profile' / 'skills' / 'ui-motion-fusion'
        completed = subprocess.run([sys.executable, '-B', '-X', 'utf8', str(self.source / 'install.py'),
                                    '--target', str(target)], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(0, completed.returncode, completed.stderr)
        self.assertEqual('installed', json.loads(completed.stdout)['action'])
        self.assertTrue(verify_release(target, exact=False)['ok'])
        self.assertEqual(['ui-motion-fusion'], [p.name for p in target.parent.iterdir()])

    def test_update_requires_explicit_flag_and_does_not_change_files(self):
        self.install()
        write(self.source, 'SKILL.md', 'new rules')
        build_manifest(self.source, '2')
        with self.assertRaisesRegex(ValueError, 'Use --update'):
            self.install()
        self.assertEqual('fixture', (self.target / 'SKILL.md').read_text())

    def test_update_preserves_user_files_and_private_local_overrides(self):
        self.install()
        write(self.target, 'local-profile.json', {'private_setting': True})
        write(self.target, '.env', 'TOKEN=private_fixture_value')
        write(self.target, 'references/profiles/registry.local.json', {'schema_version': 1, 'profiles': []})
        write(self.target, 'references/resources.local.json', {'schema_version': 1, 'modules': {}, 'files': {}})
        write(self.target, 'references/profiles/local/private-account.md', 'keep local account rules')
        write(self.source, 'SKILL.md', 'new rules')
        build_manifest(self.source, '2')
        result = self.install(update=True)
        self.assertEqual('updated', result['action'])
        self.assertEqual('new rules', (self.target / 'SKILL.md').read_text())
        self.assertTrue((self.target / 'local-profile.json').is_file())
        self.assertEqual('TOKEN=private_fixture_value', (self.target / '.env').read_text())
        self.assertEqual({'schema_version': 1, 'profiles': []}, json.loads(
            (self.target / 'references/profiles/registry.local.json').read_text()))
        self.assertEqual('keep local account rules', (self.target / 'references/profiles/local/private-account.md').read_text())
        self.assertEqual({'schema_version': 1, 'modules': {}, 'files': {}}, json.loads(
            (self.target / 'references/resources.local.json').read_text()))
        backup = Path(result['backup'])
        self.assertFalse(backup.is_relative_to(self.target.parent))
        self.assertEqual('fixture', (backup / 'files/SKILL.md').read_text())
        self.assertEqual(['ui-motion-fusion'], [p.name for p in self.target.parent.iterdir()])

    def test_modified_managed_file_blocks_whole_update_then_explicit_backup(self):
        self.install()
        write(self.target, 'SKILL.md', 'user custom rules')
        write(self.source, 'SKILL.md', 'new official rules')
        write(self.source, 'added.txt', 'new file')
        build_manifest(self.source, '2')
        with self.assertRaisesRegex(ValueError, 'Modified managed files'):
            self.install(update=True)
        self.assertEqual('user custom rules', (self.target / 'SKILL.md').read_text())
        self.assertFalse((self.target / 'added.txt').exists())
        result = self.install(update=True, replace_modified=True)
        self.assertIn('SKILL.md', result['replaced_local_modifications'])
        self.assertEqual('user custom rules', (Path(result['backup']) / 'files/SKILL.md').read_text())

    def test_unmanaged_legacy_collision_is_never_silently_overwritten(self):
        self.target.mkdir(parents=True)
        write(self.target, 'SKILL.md', 'legacy customized skill')
        write(self.target, 'personal.txt', 'keep me')
        with self.assertRaisesRegex(ValueError, 'local-name collisions'):
            self.install(update=True)
        result = self.install(update=True, replace_modified=True)
        self.assertEqual('keep me', (self.target / 'personal.txt').read_text())
        self.assertEqual('legacy customized skill', (Path(result['backup']) / 'files/SKILL.md').read_text())

    def test_removed_managed_files_backup_and_modified_obsolete_files_stay(self):
        write(self.source, 'obsolete.txt', 'old release file')
        write(self.source, 'custom-obsolete.txt', 'old release file')
        build_manifest(self.source, '1')
        self.install()
        write(self.target, 'custom-obsolete.txt', 'local edits')
        (self.source / 'obsolete.txt').unlink()
        (self.source / 'custom-obsolete.txt').unlink()
        build_manifest(self.source, '2')
        result = self.install(update=True)
        self.assertFalse((self.target / 'obsolete.txt').exists())
        self.assertEqual('old release file', (Path(result['backup']) / 'files/obsolete.txt').read_text())
        self.assertEqual('local edits', (self.target / 'custom-obsolete.txt').read_text())
        self.assertEqual(['custom-obsolete.txt'], result['preserved_modified_obsolete_files'])

    def test_failed_update_restores_previous_files_and_manifest(self):
        write(self.source, 'a-change.txt', 'old')
        build_manifest(self.source, '1')
        self.install()
        manifest_before = (self.target / MANIFEST).read_bytes()
        write(self.source, 'a-change.txt', 'new')
        write(self.source, 'b-added.txt', 'new')
        write(self.source, 'z-fail.txt', 'new')
        build_manifest(self.source, '2')
        real_copy = shutil.copy2
        def failing_copy(source, destination, *args, **kwargs):
            if (Path(destination).resolve() == (self.target / 'z-fail.txt').resolve()
                    and '.ui-motion-fusion-incoming-' in str(source)):
                raise OSError('fixture simulated disk error')
            return real_copy(source, destination, *args, **kwargs)
        with patch.object(installer.shutil, 'copy2', side_effect=failing_copy):
            with self.assertRaisesRegex(RuntimeError, 'rolled_back'):
                self.install(update=True)
        self.assertEqual('old', (self.target / 'a-change.txt').read_text())
        self.assertFalse((self.target / 'b-added.txt').exists())
        self.assertEqual(manifest_before, (self.target / MANIFEST).read_bytes())
        self.assertTrue(verify_release(self.target, exact=False)['ok'])

    def test_package_excludes_caches_git_dependencies_and_installer_state(self):
        for name in ['.git/config', 'node_modules/example/index.js', '.cache/render.bin',
                     'scripts/__pycache__/test.pyc', '.venv/python.exe', 'runtime/python.exe',
                     '.install-state.json']:
            write(self.source, name)
        build_manifest(self.source)
        archive = self.base / 'release.zip'
        package(self.source, archive)
        with zipfile.ZipFile(archive) as zip_file:
            names = zip_file.namelist()
        self.assertTrue(all(name.startswith('ui-motion-fusion/') for name in names))
        self.assertFalse(any('/.git/' in name or '/node_modules/' in name or '/.cache/' in name
                             or '__pycache__' in name or '/runtime/' in name or '/.venv/' in name
                             or name.endswith('.install-state.json') for name in names))
        with self.assertRaisesRegex(ValueError, 'already exists'):
            package(self.source, archive)

    def test_manifest_rejects_private_keys_missing_visuals_and_hash_changes(self):
        write(self.source, '.env', 'TOKEN=not_real')
        with self.assertRaisesRegex(ValueError, 'Private credential'):
            build_manifest(self.source)
        (self.source / '.env').unlink()
        write(self.source, 'keys/token.txt', 'not_real')
        with self.assertRaisesRegex(ValueError, 'Private credential'):
            build_manifest(self.source)
        shutil.rmtree(self.source / 'keys')
        (self.source / 'assets/girl/identity-1.png').unlink()
        with self.assertRaisesRegex(ValueError, 'Missing approved girl image'):
            build_manifest(self.source)
        write(self.source, 'assets/girl/identity-1.png')
        write(self.source, 'SKILL.md', 'tampered')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            verify_release(self.source)

    def test_machine_local_account_routes_and_docs_never_enter_release_payload(self):
        local_files = ['references/resources.local.json', 'references/profiles/registry.local.json',
                       'references/profiles/local/fangmu.md',
                       'references/profiles/local/nested/account.json',
                       'references/profiles/local/keys/private-fixture.txt']
        for name in local_files:
            write(self.source, name, 'private local fixture')
        manifest = build_manifest(self.source)
        names = {row['path'] for row in manifest['files']}
        self.assertFalse(names.intersection(local_files))
        self.assertTrue(verify_release(self.source)['ok'])
        archive = self.base / 'without-local-accounts.zip'
        package(self.source, archive)
        with zipfile.ZipFile(archive) as zip_file:
            members = set(zip_file.namelist())
        self.assertFalse(any('ui-motion-fusion/' + name in members for name in local_files))
        self.install()
        self.assertTrue(all(not (self.target / name).exists() for name in local_files))

    def test_manifest_cannot_explicitly_include_a_machine_local_override(self):
        name = 'references/profiles/registry.local.json'
        write(self.source, name, 'private fixture')
        manifest_path = self.source / MANIFEST
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        manifest['files'].append({'path': name, 'size': 15, 'sha256': '0' * 64})
        write(self.source, MANIFEST, manifest)
        with self.assertRaisesRegex(ValueError, 'Forbidden or duplicate manifest path'):
            verify_release(self.source)

    def test_active_library_cannot_link_to_missing_or_external_old_skill(self):
        write(self.source, 'references/library.md', '[old](../../../old-skill/SKILL.md)')
        with self.assertRaisesRegex(ValueError, 'Broken active documentation link'):
            build_manifest(self.source)
        write(self.source, 'references/library.md', '[source](../assets/core/source.js)')
        build_manifest(self.source)
        self.assertEqual(1, verify_release(self.source)['active_document_links'])

    def test_private_profile_exclusion_does_not_bypass_parent_link_guard(self):
        write(self.source, 'references/profiles/registry.local.json', 'private fixture')
        parent = (self.source / 'references/profiles').resolve()
        # Exercise the traversal guard without requiring OS symlink privilege.
        with patch('release_manifest.is_link', side_effect=lambda path: path.resolve() == parent):
            with self.assertRaisesRegex(ValueError, 'Links/reparse'):
                build_manifest(self.source)

    def test_rejects_escaping_symlinks_when_platform_allows(self):
        outside = self.base / 'outside.txt'
        outside.write_text('private', encoding='utf-8')
        link = self.source / 'escape.txt'
        try:
            link.symlink_to(outside)
        except (OSError, NotImplementedError):
            self.skipTest('Creating symlinks needs OS permission on this host')
        with self.assertRaisesRegex(ValueError, 'Links/reparse'):
            build_manifest(self.source)

    def test_rejects_skills_parent_as_install_target(self):
        with self.assertRaisesRegex(ValueError, 'directory itself'):
            installer.install(self.source, self.target.parent)

    def test_optional_external_module_is_not_a_portable_install_dependency(self):
        registry_path = self.source / 'references/resource-registry.json'
        registry = json.loads(registry_path.read_text(encoding='utf-8'))
        registry['modules'].append({
            'id': 'base-local', 'path': '../ui-motion-explainer',
            'required': ['scripts/render_portable.py'],
            'required_for_install': False})
        write(self.source, 'references/resource-registry.json', registry)
        self.assertEqual(['core'], validate_resources(self.source)['required_modules'])
        build_manifest(self.source)
        self.assertEqual('installed', self.install()['action'])
        registry['modules'][-1]['required_for_install'] = True
        write(self.source, 'references/resource-registry.json', registry)
        with self.assertRaisesRegex(ValueError, 'Not a portable relative path'):
            validate_resources(self.source)


if __name__ == '__main__':
    unittest.main()
