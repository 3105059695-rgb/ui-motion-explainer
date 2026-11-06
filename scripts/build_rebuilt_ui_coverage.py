"""Index the current-UI adapter on every independent scene without altering its graph."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = Path('assets/rebuilt-library')
COMMON = ['assets/agent-editorial/agent-editorial.js', str(BASE / 'current-ui.js').replace('\\', '/'), str(BASE / 'scene-runtime.js').replace('\\', '/')]
SOURCE = ['assets/agent-editorial/source/body-a.js', 'assets/agent-editorial/source/body-b.js', 'assets/agent-editorial/palette.json']

# Every renderer is intentionally named. No unknown kind is silently treated as
# a generic card, and content imagery/physical materials keep their own colors.
KINDS = {
    'group': ['transform'], 'rect': ['flat-geometry'], 'circle': ['flat-geometry'],
    'line': ['connector'], 'arrow': ['connector'], 'path': ['connector'],
    'text': ['fitted-typography'], 'typeLine': ['fitted-typography'],
    'filledNumber': ['outline-fill-typography'], 'rollingNumber': ['rolling-typography'],
    'card': ['panel'], 'window': ['screen'], 'file': ['file'], 'document': ['sheet'],
    'image': ['unchanged-current-media'], 'pageFlip': ['unchanged-current-media', 'page-deformation'],
    'pill': ['label-contrast'], 'bar': ['progress'], 'toggle': ['control'],
    'check': ['drawn-check'], 'code': ['dark-panel', 'fitted-typography'],
    'b2-number': ['fitted-typography'], 'b2-decode': ['fitted-typography'],
    'b2-flip': ['tile', 'face-contrast'], 'b2-flip-clock': ['tile', 'fitted-typography'],
    'b2-perspective-media': ['unchanged-current-media', 'perspective'],
    'b2-tile-media': ['unchanged-current-media', 'tile-mask'],
    'b2-text-media': ['unchanged-current-media', 'fitted-type-mask'],
    'b2-lens': ['unchanged-current-media', 'lens-mask'],
    'b2-donut': ['chart'], 'b2-gauge': ['chart'], 'b2-line-chart': ['chart'],
    'b2-cursor': ['cursor'], 'b2-key': ['symbol'], 'b2-lock': ['symbol'],
    'b2-overflow': ['pattern-mask'], 'b2-growing-line': ['connector'],
    'b2-share-legend': ['chart', 'fitted-typography'],
    'b2-code-boxes': ['button', 'fitted-typography'],
    'b2-capacity-set': ['measured-geometry', 'panel', 'pattern-mask'],
    'b3-bars': ['chart'], 'b3-race': ['chart', 'check'],
    'b3-bill': ['table', 'button'], 'b3-delta': ['button', 'connector'],
    'b3-checklist': ['button', 'panel', 'check'],
    'b3-slider': ['unchanged-current-media', 'comparison-control'],
    'b3-crop-media': ['unchanged-current-media', 'crop-mask'],
    'b3-rating': ['chart'], 'b3-price': ['button', 'fitted-typography'],
    'b3-table': ['table', 'fitted-typography'],
    'celestialCycle': ['natural-shader-colors-preserved', 'fitted-typography'],
    'woodTileStory': ['physical-materials-preserved', 'fitted-typography'],
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get('children', []))


def build(root=ROOT):
    root = Path(root)
    evidence = root / BASE / 'verification/ui-adaptation.json'
    observed = {}
    smoke = {}
    smoke_path = root / BASE / 'verification/ui-adaptation-all.json'
    if smoke_path.exists():
        raw = json.loads(smoke_path.read_text(encoding='utf-8-sig'))
        smoke = {r['id']: r for r in raw.get('items', []) if r.get('ok') and r.get('runtime_sha256') == digest(root / BASE / 'scene-runtime.js') and r.get('ui_adapter_sha256') == digest(root / BASE / 'current-ui.js')}
    if evidence.exists():
        raw = json.loads(evidence.read_text(encoding='utf-8-sig'))
        if raw.get('adapter_sha256') == digest(root / BASE / 'current-ui.js') and raw.get('runtime_sha256') == digest(root / BASE / 'scene-runtime.js'):
            observed = {row['id']: row for row in raw.get('rows', [])}
    items = []
    for path in sorted((root / BASE / 'scenes').glob('*.json')):
        scene = json.loads(path.read_text(encoding='utf-8-sig'))
        nodes = list(walk(scene['nodes']))
        kinds = sorted({node['kind'] for node in nodes})
        unknown = set(kinds) - KINDS.keys()
        if unknown:
            raise ValueError(f"Unmapped UI renderers in {scene['id']}: {sorted(unknown)}")
        files = COMMON + [(BASE / ext).as_posix() for ext in scene.get('extensions', [])]
        checked = observed.get(scene['id'])
        roles = sorted({role for kind in kinds for role in KINDS[kind]})
        changes = []
        if set(roles) & {'panel', 'screen', 'file', 'sheet', 'dark-panel', 'tile', 'button', 'table'}:
            changes.append('role-specific surfaces use accepted AgentEditorial geometry, edges, physical depth and soft shadow')
        if any('typography' in r or 'type-mask' in r for r in roles):
            changes.append('glyphs fit uniformly rather than horizontal squeezing; content shape remains unchanged')
        if 'label-contrast' in roles or 'face-contrast' in roles:
            changes.append('dark ink on the light-purple label/face; dark-panel default fill corrected')
        if not changes:
            changes.append('primitive/media-only scene keeps its original geometry and content; current UI runtime is connected')
        layout_correction = smoke.get(scene['id'], {}).get('ui_layout_correction')
        if layout_correction:
            changes.append(layout_correction)
        items.append({
            'id': scene['id'], 'status': 'current-ui-connected',
            'adapter_files': files, 'adapter_sha256': {name: digest(root / name) for name in files},
            'roles': roles, 'node_kinds': kinds,
            'scene_sha256': digest(path), 'objects': len(nodes), 'duration': scene['duration'],
            'changes': changes, 'ui_layout_correction': layout_correction,
            'preserved': ['scene graph', 'object identities and geometry', 'camera and keyframe timing',
                          'masks and per-reference event sequence', 'input/media bindings',
                          'actual image/video pixels and non-UI natural materials'],
            'validation': {
                'adapter_coverage': 'all-node-kinds-explicitly-mapped',
                'render': checked['status'] if checked else 'not-rendered-in-this-ui-pass',
                'evidence': 'assets/rebuilt-library/verification/ui-adaptation.json' if checked else None,
                'authored_graph_states_unchanged': checked.get('authored_graph_states_unchanged') if checked else None,
                'actual_browser_seek': 'passed' if scene['id'] in smoke else 'not-run-in-this-ui-pass',
                'seek_evidence': 'assets/rebuilt-library/verification/ui-adaptation-all.json' if scene['id'] in smoke else None,
                'full_realtime_av_review': False, 'user_approved': False,
            },
        })
    output = {'schema': 'ui-motion-fusion/rebuilt-ui-coverage@1', 'count': len(items),
              'ui_binding': 'ten-agents-body-a', 'accent': '#D6C2FF',
              'baseline_sources': {name: digest(root / name) for name in SOURCE},
              'default': 'current', 'historic': 'explicit demo only',
              'scope': 'Executable role binding coverage; coverage is not per-item aesthetic approval.',
              'items': items}
    (root / BASE / 'ui-adaptation.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8',newline='\n')
    return {'count': len(items), 'current_render_evidence': len(observed), 'output': str(root / BASE / 'ui-adaptation.json')}


def build_adu(root=ROOT):
    root = Path(root)
    files = ['scripts/scene_builder.py', 'scripts/library_ui_style.py',
             'assets/rebuilt-library/adu-current-ui.css',
             'assets/library-runtime/current-ui/roles.js',
             'assets/library-runtime/current-ui/transform.cjs',
             'assets/library-runtime/current-ui/content-scopes.json',
             'assets/library-runtime/current-ui/scene-overrides.json',
             'assets/modules/director/assets/studio/fonts/NotoSansSC.ttf']
    adapter_hashes = {p: digest(root / p) for p in files}
    roles = {'card': 'panel', 'dcard': 'dark-panel', 'term': 'terminal', 'bubble': 'speech-surface',
             'pill': 'label', 'chip': 'label', 'glass': 'glass', 'glassD': 'dark-glass',
             'macwin': 'screen', 'cam': 'presenter-frame', 'check': 'check', 'ck': 'check',
             'h1': 'headline', 'h2': 'headline', 'h3': 'headline', 'tag': 'label'}
    proof_path = root / 'assets/adu-reference/ui-adaptation-verification.json'
    proof = json.loads(proof_path.read_text(encoding='utf-8-sig')) if proof_path.exists() else {}
    proof_current = (proof.get('compiled') is True and proof.get('browser_errors') == []
                     and proof.get('computed_accent') == '#D6C2FF'
                     and proof.get('adapter_sha256') == adapter_hashes)
    proven = set(proof.get('selected_scenes', [])) if proof_current else set()
    items = []
    for pack in ('anim3', 'anim4'):
        folder = root / 'assets/adu-reference/source/packs' / pack
        manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8-sig'))
        source = (folder / 'scenes.js').read_text(encoding='utf-8-sig')
        starts = list(re.finditer(r'(?m)^\(\(\) => \{\s*$', source))
        ends = list(re.finditer(r'(?m)^\}\)\(\);\s*$', source))
        blocks = [source[a.start():b.end()] for a, b in zip(starts, ends)]
        blocks = [block for block in blocks if re.search(r'\bnew Scene\s*\(', block)]
        if len(blocks) != len(manifest['scenes']):
            raise ValueError('Complete source scene count changed for ' + pack)
        for scene, block in zip(manifest['scenes'], blocks):
            block_hash = hashlib.sha256(block.encode('utf-8')).hexdigest()
            if block_hash != scene['sourceBlockSha256']:
                raise ValueError('Original source block changed for ' + pack + ':' + scene['id'])
            ident = 'adu:' + pack + ':' + scene['id']
            present = {role for cls, role in roles.items() if re.search(r'(?<![\w-])' + re.escape(cls) + r'(?![\w-])', block)}
            if 'camCard(' in block:
                present.add('presenter-frame')
            items.append({'id': ident, 'status': 'current-ui-connected', 'adapter_files': files,
                          'adapter_sha256': adapter_hashes,
                          'roles': sorted(present | {'current-palette', 'portable-typography', 'subtitles'}),
                          'source_block_sha256': block_hash,
                          'changes': ['source-specific material CSS after original scene CSS', 'current UI tokens and literal UI shadows/fonts on generated copy', 'subtitle accent uses current A'],
                          'preserved': ['original source block', 'motion/events and layout', 'narration content', 'media pixels', 'historical OS examples'],
                          'validation': {'source_block_integrity': 'passed', 'build_and_browser_seek': 'passed' if ident in proven else 'not-run-in-this-ui-pass',
                                         'evidence': 'assets/adu-reference/ui-adaptation-verification.json' if ident in proven else None,
                                         'full_realtime_av_review': False, 'user_approved': False}})
    target = root / 'assets/adu-reference/ui-adaptation.json'
    target.write_text(json.dumps({'schema': 'ui-motion-fusion/complete-scene-ui-coverage@1', 'count': len(items),
                                  'scope': 'All complete source scenes bind to the generated-copy role adapter. Three scene runtime samples do not claim visual approval for all scenes.', 'items': items}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8',newline='\n')
    return {'count': len(items), 'output': str(target)}


if __name__ == '__main__':
    print(json.dumps({'rebuilt': build(), 'complete_scenes': build_adu()}, ensure_ascii=False))
