"""Resolve a film lesson to the existing production adapter and its real binding format."""
from __future__ import annotations

import json
from pathlib import Path

import capability_catalog
import capability_runtime
import library_runner
import method_programs
import source_designs


def _write_new(path, data):
    with Path(path).open('x', encoding='utf-8', newline='\n') as out:
        json.dump(data, out, ensure_ascii=False, indent=2)
        out.write('\n')


def select(catalog, source, capability, out=None):
    row = catalog.lookup(source)
    if row['status'] not in ('available', 'archived'):
        raise ValueError('This source is for evidence or diagnosis only: ' + row['scope'])
    options = [u for u in row['uses'] if u['capability'] == capability]
    if not options:
        raise ValueError('Choose one of this source’s capabilities with videos inspect --id ' + row['id'])
    detail = capability_catalog.inspect(capability, catalog.root)
    call = detail['call']
    receipt = {'source_id': row['id'], 'source_title': row['title'], 'scope': row['scope'],
               'evidence': row['evidence'], 'use': options[0], 'capability': capability,
               'execution_state': detail['execution_state'], 'commands': call,
               'source_files': detail.get('source_files', []), 'bound_to_timeline': False}
    if out is None:
        return receipt
    dest = Path(out).resolve()
    if dest.exists() or Path(out).is_symlink() or not dest.parent.is_dir():
        raise ValueError('Choose a new binding file in an existing directory.')
    kind, ident = capability.split(':', 1)
    if 'scaffold' in call and call.get('inspect', '').startswith('ui.py library inspect --id '):
        library_id = call['inspect'].split('--id ', 1)[1]
        library_runner.scaffold(library_id, dest, catalog.root)
    elif kind in ('method', 'recipe'):
        method_programs.scaffold(ident, dest, catalog.root)
    elif kind == 'design':
        bounds = options[0].get('examples', [{}])[0]
        selected = [bounds['start'], bounds['end']] if 'start' in bounds and 'end' in bounds else None
        source_designs.scaffold(ident, dest, catalog.root, source_range=selected)
    elif kind == 'native':
        capability_runtime.scaffold(ident, dest, catalog.root)
    elif detail.get('adapter_kind') == 'director-preset':
        _write_new(dest, detail['example'])
    elif kind == 'capability' and ident[:1] in ('O', 'R'):
        from video_sources import read
        effect = next(e for e in read(catalog.root, 'assets/semantic-motion/manifest.json')['effects']
                      if e['id'] == ident)
        _write_new(dest, {'duration': 6, 'options': {}, 'text': {}, 'media': {},
                          '_binding_fields': effect['parameters'], '_source': row['id']})
    else:
        raise ValueError('This adapter exposes an API rather than a binding file. Use videos use without --out for its entry.')
    receipt['binding_file'] = str(dest)
    receipt['next'] = '将本期材料、对象与时间填入绑定文件，按 commands.build 或 commands.materialize 调用。'
    return receipt
