"""Read local source-study methods and sentence evidence; text retrieval only.

No semantic matching, source-media inspection, generation, downloads or approval
occur. Optional plan references use {method_id, usage: adapt|avoid,
examples: [{video, row_ids: [...]}]}; their existence is not proof of suitability.
"""
import argparse
import json
from pathlib import Path
import unicodedata
from resource_inventory import resource_fact

ROOT = Path(__file__).resolve().parents[1]
CATALOG_FILE = 'references/source-study-methods.json'
EVIDENCE_DIR = 'references/evidence/qiuzhi2046-study'
MANIFEST_FILE = EVIDENCE_DIR + '/index.json'
# The old constants remain a compatibility route for pre-registry installations.
SOURCE_REGISTRY_FILE = 'references/source-study-sources.json'
VIDEOS = ('workflow', 'creative', 'network', 'claude')
COMPACT_KEYS = ('id', 'title', 'category', 'semantic_use', 'viewer_gap',
                'state_chain', 'polarity', 'avoid', 'source_examples',
                'implementation', 'validation')


def load_json(path):
    return json.loads(Path(path).read_bytes().decode('utf-8-sig'))


def populated(value):
    return isinstance(value, str) and bool(value.strip())


def source_records(root=ROOT):
    """Resolve only explicitly registered local sources; never derive new paths from IDs."""
    path = Path(root) / SOURCE_REGISTRY_FILE
    if not path.is_file():
        return [{'id': video, 'alignment': EVIDENCE_DIR + '/' + video + '.json',
                 'manifest': MANIFEST_FILE, 'collection_id': 'qiuzhi2046-20261014'}
                for video in VIDEOS]
    payload = load_json(path)
    records = payload.get('sources') if isinstance(payload, dict) else None
    if not isinstance(payload, dict) or payload.get('schema_version') != 1 or not isinstance(records, list):
        raise ValueError('Source registry must have schema_version:1 and sources:[...].')
    ids = [row.get('id') if isinstance(row, dict) else None for row in records]
    if any(not populated(i) for i in ids) or len(set(ids)) != len(ids):
        raise ValueError('Source registry IDs must be nonempty and unique.')
    for row in records:
        for key in ('alignment', 'manifest'):
            if not populated(row.get(key)) or '://' in row[key]:
                raise ValueError('Source registry requires local ' + key + ': ' + row['id'])
    return records


def source_record(video, root=ROOT):
    for row in source_records(root):
        if row['id'] == video:
            return row
    raise ValueError('Unknown source video: ' + str(video))


def original_media(row, root=ROOT, payload=None, verify_hash=False):
    manifest = Path(root) / row['manifest']
    document = load_json(manifest) if manifest.is_file() else {}
    video = next((item for item in document.get('videos', []) if item.get('id') == row['id']), {})
    if payload is None and not video.get('source'):
        path = Path(root) / row['alignment']
        payload = load_json(path) if path.is_file() else {}
    payload = payload or {}
    return resource_fact('source-video:' + row['id'], video.get('source') or payload.get('source'),
                         root, verify_hash, video.get('source_sha256') or payload.get('source_sha256'))


def source_facts(root=ROOT, verify_hash=False):
    facts = []
    for row in source_records(root):
        alignment_path = (Path(root) / row['alignment']).resolve()
        manifest_path = (Path(root) / row['manifest']).resolve()
        facts.append({**row, 'alignment': str(alignment_path), 'manifest': str(manifest_path),
                      'alignment_exists': alignment_path.is_file(),
                      'manifest_exists': manifest_path.is_file(),
                      'original_media': original_media(row, root, verify_hash=verify_hash)})
    return facts


def method_records(root=ROOT):
    payload = load_json(Path(root) / CATALOG_FILE)
    records = payload.get('methods') if isinstance(payload, dict) else None
    if not isinstance(records, list):
        raise ValueError('Source-study catalog must contain methods:[...].')
    ids = [r.get('id') if isinstance(r, dict) else None for r in records]
    if any(not populated(i) for i in ids) or len(set(ids)) != len(ids):
        raise ValueError('Source-study method IDs must be nonempty and unique.')
    return records


def read_method(ident, root=ROOT):
    for record in method_records(root):
        if record['id'] == ident:
            return record
    raise ValueError('Unknown source-study method ID: ' + str(ident))


def compact(record):
    return {key: record[key] for key in COMPACT_KEYS if key in record}


def list_methods(root=ROOT):
    records = method_records(root)
    return {'catalog': str((Path(root) / CATALOG_FILE).resolve()),
            'manifest': str((Path(root) / MANIFEST_FILE).resolve()),
            'source_registry': str((Path(root) / SOURCE_REGISTRY_FILE).resolve()),
            'sources': source_facts(root),
            'count': len(records), 'methods': [compact(r) for r in records],
            'selection': 'Read narration and examples before selection; no semantic routing.'}


def normalize(text):
    return unicodedata.normalize('NFKC', text).casefold()


def find_methods(query, root=ROOT, limit=10):
    if not populated(query):
        raise ValueError('Query must contain text.')
    if type(limit) is not int or not 1 <= limit <= 100:
        raise ValueError('Limit must be an integer from 1 to 100.')
    terms = normalize(query).split()
    matches = []
    for record in method_records(root):
        fields = {k: record[k] for k in (*COMPACT_KEYS, 'editing_steps', 'avoid')
                  if k in record and k != 'source_examples'}
        haystack = normalize(json.dumps(fields, ensure_ascii=False))
        if all(term in haystack for term in terms):
            matches.append(compact(record))
    return {'query': query, 'match_mode': 'literal_text_all_terms',
            'total_matches': len(matches), 'candidates': matches[:limit],
            'semantic_match': False,
            'notice': 'Text candidates only, including mentions in avoid conditions. '
                      'Empty means no literal match; do not force a method.'}


def alignment(video, root=ROOT):
    registered = source_record(video, root)
    path = Path(root) / registered['alignment']
    payload = load_json(path)
    records = alignment_rows(payload)
    ids = [r.get('id') if isinstance(r, dict) else None for r in records]
    if any(not populated(i) for i in ids) or len(set(ids)) != len(ids):
        raise ValueError('Source alignment row IDs must be nonempty and unique: ' + video)
    return payload


def alignment_rows(payload):
    """ASR rows and explicitly supplemented speech remain separately stored."""
    if not isinstance(payload, dict) or not isinstance(payload.get('rows'), list):
        raise ValueError('Source alignment must contain rows:[...].')
    supplemental = payload.get('supplemental_rows', [])
    if not isinstance(supplemental, list):
        raise ValueError('Source alignment supplemental_rows must be a list.')
    return payload['rows'] + supplemental


def example(video, row_id, root=ROOT):
    registered = source_record(video, root)
    payload = alignment(video, root)
    row = next((r for r in alignment_rows(payload) if r['id'] == row_id), None)
    if row is None:
        raise ValueError('Unknown source row: ' + video + '/' + str(row_id))
    shot_ids = row.get('shot_ids', [])
    return {'video': video,
            'alignment': str((Path(root) / registered['alignment']).resolve()),
            'manifest': str((Path(root) / registered['manifest']).resolve()),
            'source': payload.get('source'), 'review': payload.get('review', {}),
            'original_media': original_media(registered, root, payload),
            'row': row,
            'shots': [s for s in payload.get('shots', [])
                      if isinstance(s, dict) and s.get('id') in shot_ids],
            'media_accessed': False,
            'scope': 'Recorded local analysis only; evidence paths are preserved, not opened or revalidated.'}


def directing_context(root=ROOT):
    """Missing study files remain explicit, keeping legacy local setups usable."""
    root = Path(root)
    catalog, manifest = root / CATALOG_FILE, root / MANIFEST_FILE
    result = {'catalog': str(catalog.resolve()), 'manifest': str(manifest.resolve()),
              'catalog_exists': catalog.is_file(), 'manifest_exists': manifest.is_file(),
              'source_registry': str((root / SOURCE_REGISTRY_FILE).resolve()),
              'source_registry_exists': (root / SOURCE_REGISTRY_FILE).is_file(),
              'sources': source_facts(root),
              'methods': [], 'selection': 'Agent interprets narration; these are candidates, not selected effects.'}
    if catalog.is_file():
        result['methods'] = [compact(r) for r in method_records(root)]
    result['count'] = len(result['methods'])
    result['all_sources_exist'] = all(s['alignment_exists'] and s['manifest_exists']
                                      for s in result['sources'])
    result['original_media_present'] = sum(s['original_media']['file_exists'] for s in result['sources'])
    result['original_media_scope'] = 'Current explicit local mappings and file presence only; hash_status states whether bytes were verified. Text research remains usable when original media is absent.'
    result['warnings'] = [
        'Source-study registered files are missing for ' + s['id']
        for s in result['sources'] if not s['alignment_exists'] or not s['manifest_exists']]
    return result


def explicitly_negative(record):
    """Only declared markers; never infer a negative example from prose."""
    return (record.get('is_negative') is True
            or record.get('polarity') == 'negative'
            or record.get('role') in ('negative', 'counterexample')
            or record.get('usage') == 'avoid')


def validate_refs(refs, root=ROOT):
    """Validate IDs, membership and explicit negative markers, not meaning."""
    errors, warnings = [], []
    if not isinstance(refs, list):
        return ['must be a list of source-study references'], warnings
    if not refs:
        return errors, warnings
    try:
        known = {m['id']: m for m in method_records(root)}
        known_sources = {s['id'] for s in source_records(root)}
    except (OSError, ValueError, UnicodeError) as exc:
        return ['catalog: ' + str(exc)], warnings
    cache = {}
    for i, ref in enumerate(refs):
        label = f'[{i}]'
        if not isinstance(ref, dict):
            errors.append(label + ': must be an object')
            continue
        ident = ref.get('method_id')
        if not populated(ident) or ident not in known:
            errors.append(label + '.method_id: unknown method: ' + str(ident))
            continue
        method = known[ident]
        usage = ref.get('usage', 'adapt')
        if not isinstance(usage, str) or usage not in ('adapt', 'avoid'):
            errors.append(label + '.usage: must be adapt or avoid')
            continue
        if usage == 'adapt' and explicitly_negative(method):
            errors.append(label + ': explicitly negative method cannot be an adaptation example')
        implementation = method.get('implementation') or {}
        if usage == 'adapt' and isinstance(implementation, dict):
            scope = implementation.get('scope')
            customization = implementation.get('customization_required')
            if populated(scope) or customization:
                notes = [scope] if populated(scope) else []
                if customization:
                    notes.append('本期仍需定制：' + (customization if isinstance(customization, str)
                                 else '；'.join(str(item) for item in customization)))
                warnings.append(label + ' ' + ident + '：' + '；'.join(notes)
                                + '；须核对本期实际实现，引用或原语入口存在不证明已经使用、完成或获认可。')
        examples = ref.get('examples', [])
        if not isinstance(examples, list):
            errors.append(label + '.examples: must be a list')
            continue
        if not examples:
            warnings.append(label + ': no specific source row chosen; inspect the method examples before adapting')
        for j, ex in enumerate(examples):
            place = label + f'.examples[{j}]'
            if not isinstance(ex, dict):
                errors.append(place + ': must contain video and row_ids')
                continue
            video, row_ids = ex.get('video'), ex.get('row_ids')
            if not isinstance(row_ids, list) or not row_ids or any(not populated(r) for r in row_ids):
                errors.append(place + '.row_ids: must be a nonempty list of IDs')
                continue
            if not isinstance(video, str) or video not in known_sources:
                errors.append(place + '.video: unknown video: ' + str(video))
                continue
            try:
                if video not in cache:
                    cache[video] = {r['id']: r for r in alignment_rows(alignment(video, root))}
            except (OSError, ValueError, UnicodeError) as exc:
                errors.append(place + ': ' + str(exc))
                continue
            registered = method.get('source_examples', [])
            if not isinstance(registered, list):
                errors.append(label + ': method source_examples must be a list')
                continue
            for row_id in row_ids:
                row = cache[video].get(row_id)
                if row is None:
                    errors.append(place + ': unknown source row: ' + video + '/' + row_id)
                    continue
                linked = [e for e in registered if isinstance(e, dict)
                          and e.get('video') == video and isinstance(e.get('row_ids'), list)
                          and row_id in e['row_ids']]
                if not linked:
                    errors.append(place + ': row not registered for method ' + ident + ': ' + row_id)
                if usage == 'adapt' and (explicitly_negative(row) or any(explicitly_negative(e) for e in linked)):
                    errors.append(place + ': explicitly negative source row cannot be an adaptation example: ' + row_id)
                if row.get('status') == 'unverified':
                    warnings.append(place + ': source row remains unverified: ' + row_id)
    return errors, warnings


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('list', help='List the local source-study method directory.')
    read = sub.add_parser('read', help='Read one complete method, including boundaries.')
    read.add_argument('--id', required=True)
    find = sub.add_parser('find', help='Literal text candidates; not semantic matching.')
    find.add_argument('--query', required=True)
    find.add_argument('--limit', type=int, default=10)
    ex = sub.add_parser('example', help='Read one source row and its recorded shots.')
    ex.add_argument('--video', required=True, help='Exact ID in the local source registry.')
    ex.add_argument('--row', required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == 'list':
            result = list_methods()
        elif args.command == 'read':
            result = read_method(args.id)
        elif args.command == 'find':
            result = find_methods(args.query, limit=args.limit)
        else:
            result = example(args.video, args.row)
    except (OSError, ValueError, UnicodeError) as exc:
        print(json.dumps({'errors': [str(exc)], 'media_accessed': False}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
