"""Resolve packaged implementations and explicitly configured local overrides."""
import json
from pathlib import Path
from resource_inventory import load_overlay

ROOT = Path(__file__).resolve().parents[1]


class ResourceRegistry:
    def __init__(self, root=ROOT, registry_path=None, overrides=None):
        self.root = Path(root).expanduser().resolve()
        self.path = (Path(registry_path).expanduser().resolve() if registry_path else
                     self.root / 'references/resource-registry.json')
        try:
            self.data = json.loads(self.path.read_text(encoding='utf-8-sig'))
        except (OSError, ValueError) as exc:
            raise ValueError(f'Cannot read resource registry {self.path}: {exc}') from exc
        if self.data.get('schemaVersion') != 1 or self.data.get('pathBase') != 'skillRoot':
            raise ValueError(f'Unsupported resource registry schema: {self.path}')
        self.modules = {}
        for module in self.data.get('modules', []):
            name = module.get('id')
            if not name or name in self.modules or not isinstance(module.get('path'), str):
                raise ValueError(f'Invalid or duplicate module in {self.path}: {name}')
            self.modules[name] = module
        self.local_overrides = load_overlay(self.root)['modules']
        self.overrides = overrides or {}
        if not isinstance(self.overrides, dict) or any(name not in self.modules for name in self.overrides):
            raise ValueError('Module overrides must map registered module IDs to local paths.')

    def definition(self, name):
        try:
            return self.modules[name]
        except KeyError as exc:
            raise ValueError(f'Unknown registered module: {name}') from exc

    def inspect(self, name):
        module = self.definition(name)
        override = self.overrides.get(name) or self.local_overrides.get(name)
        folder = (self.root / Path(override or module['path']).expanduser()).resolve()
        required = list(dict.fromkeys([*module.get('required', []),
                                      *module.get('commands', {}).values()]))
        missing = [item for item in required if not (folder / item).exists()]
        if not folder.is_dir() and not missing:
            missing = ['.']
        return {'library': name, 'path': str(folder), 'actual_root': str(folder),
                'purpose': module.get('purpose', ''), 'available': not missing,
                'required_for_install': module.get('required_for_install', True),
                'selection_source': ('explicit-override' if name in self.overrides else 'local-overlay') if override else 'packaged-registry',
                'distribution': module.get('distribution', {}),
                'missing': missing, 'required': required,
                'commands': {key: str((folder / value).resolve())
                             for key, value in module.get('commands', {}).items()}}

    def resolve(self, name, required=True):
        row = self.inspect(name)
        if required and not row['available']:
            raise ValueError(f"Local module {name} is incomplete at {row['actual_root']}: "
                             f"{', '.join(row['missing'])}. No download was attempted.")
        return Path(row['actual_root'])

    def script(self, name, command):
        module = self.definition(name)
        try:
            relative = module.get('commands', {})[command]
        except KeyError as exc:
            raise ValueError(f'Module {name} has no registered command: {command}') from exc
        path = self.resolve(name) / relative
        if not path.is_file():
            raise ValueError(f'Registered command is not a file: {path}')
        return path

    def select_base(self, explicit=None):
        if explicit:
            base = Path(explicit).expanduser().resolve()
            required = self.definition('base-packaged')['required']
            missing = [name for name in required if not (base / name).exists()]
            if not missing:
                return base
            raise ValueError(f'Explicit base is incomplete at {base}: {", ".join(missing)}')
        for name in self.data.get('basePreference', []):
            if self.inspect(name)['available']:
                return self.resolve(name)
        raise ValueError('No complete registered base found. Supply --base with the original skill resources.')

    def report(self, name=None):
        rows = [self.inspect(name)] if name else [self.inspect(key) for key in self.modules]
        checked = rows if name else [row for row in rows if row['required_for_install']]
        return {'entry': self.data.get('entry'), 'actual_root': str(self.root),
                'registry': str(self.path), 'available': all(row['available'] for row in checked),
                'all_registered_available': all(row['available'] for row in rows),
                'optional_unavailable': [row['library'] for row in rows
                                         if not row['required_for_install'] and not row['available']],
                'modules': rows,
                'scope': 'Local file presence and explicit routing only; no renderer, service, or aesthetic validation.'}
