"""Read every registered current requirement in deterministic, lossless pages.

This is a content reader. Its hashes and page counts do not establish that an
Agent understood the requirements or watched any reference video.
"""
import hashlib
import json
from pathlib import Path, PurePosixPath, PureWindowsPath

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = 'references/requirements.json'
PAGE_CHARACTERS = 4000
STATUS = 'content-available-not-proof-of-reading'


def _sha256(content):
    return hashlib.sha256(content).hexdigest()


def _local_path(root, relative, label):
    if not isinstance(relative, str) or not relative.strip() or '\x00' in relative:
        raise ValueError(f'{label} must be a nonempty Skill-relative path.')
    normalized = relative.replace('\\', '/')
    windows = PureWindowsPath(relative)
    posix = PurePosixPath(normalized)
    if windows.drive or windows.root or posix.is_absolute() or ':' in normalized or '..' in posix.parts:
        raise ValueError(f'{label} must stay inside the Skill: {relative}')
    candidate = (root / posix).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise ValueError(f'{label} resolves outside the Skill: {relative}') from exc
    return candidate, posix.as_posix()


def _read_bytes(path, label):
    if not path.is_file():
        raise ValueError(f'{label} is missing or is not a file: {path}')
    try:
        return path.read_bytes()
    except OSError as exc:
        raise ValueError(f'Cannot read {label}: {path}: {exc}') from exc


def _required_string(row, key, label):
    value = row.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f'{label} requires a nonempty {key}.')
    return value


def _page_command(bundle, number):
    script = Path(bundle['manifest_path']).parent.parent / 'scripts/ui.py'
    return f'python -B -X utf8 "{script}" requirements --part {number}'


def _format_part(bundle, part):
    number, count = part['number'], bundle['part_count']
    output = [f"现行要求正文 {number}/{count}\n",
              f"Bundle SHA-256: {bundle['bundle_sha256']}\n",
              '字符位置采用从 0 开始、左闭右开的区间；分隔标记不属于原文。\n']
    for segment in part['segments']:
        output.append(f"\n--- 原文开始 | {segment['document_id']} | {segment['relative_path']}"
                      f" | 字符 [{segment['start']}, {segment['end']}) ---\n")
        output.append(segment['text'])
        output.append('\n--- 原文结束 ---\n')
    if number < count:
        output.append(f'\n下一页：{_page_command(bundle, number + 1)}\n')
    else:
        output.append(f'\n这是最后一页（{number}/{count}）。若已依次输出第 1 至 {count} 页，'
                      '本清单的全部正文已输出；单独输出本页不代表前页已经输出。\n'
                      '该输出不证明 Agent 已读懂要求、已观看参考视频或已获审美批准。\n')
    return ''.join(output)


def load(root=ROOT):
    """Load exactly the manifest's ordered documents, without recursive scans.

    Document ``text`` preserves every UTF-8 character, including line endings
    and a possible BOM. Document hashes describe the original file bytes.
    Page segments use Python character offsets [start, end), so joining the
    segments of each document reproduces its full text without any separators.
    ``parts[].text`` is the readable page, including separately marked headers.
    """
    root = Path(root).expanduser().resolve()
    if not root.is_dir():
        raise ValueError(f'Skill root is not a directory: {root}')
    manifest_path, _ = _local_path(root, MANIFEST, 'Requirement manifest')
    manifest_bytes = _read_bytes(manifest_path, 'Requirement manifest')
    try:
        manifest = json.loads(manifest_bytes.decode('utf-8-sig'))
    except (UnicodeDecodeError, ValueError) as exc:
        raise ValueError(f'Invalid UTF-8 JSON requirement manifest: {manifest_path}: {exc}') from exc
    if (not isinstance(manifest, dict) or type(manifest.get('schema_version')) is not int
            or manifest['schema_version'] != 1 or not isinstance(manifest.get('documents'), list)
            or not manifest['documents']):
        raise ValueError('Requirement manifest needs schema_version 1 and a nonempty documents list.')
    documents, seen_ids, seen_paths = [], set(), set()
    for index, row in enumerate(manifest['documents'], 1):
        label = f'Requirement document {index}'
        if not isinstance(row, dict):
            raise ValueError(f'{label} must be an object.')
        document_id = _required_string(row, 'id', label)
        title = _required_string(row, 'title', label)
        path, relative_path = _local_path(root, row.get('path'), label)
        # Case-insensitive identity is portable to the supported Windows host.
        identity = str(path).casefold()
        if document_id in seen_ids:
            raise ValueError(f'Duplicate requirement document ID: {document_id}')
        if identity in seen_paths:
            raise ValueError(f'Duplicate requirement document path: {relative_path}')
        seen_ids.add(document_id)
        seen_paths.add(identity)
        content = _read_bytes(path, label)
        try:
            text = content.decode('utf-8')
        except UnicodeDecodeError as exc:
            raise ValueError(f'Requirement document is not UTF-8: {path}: {exc}') from exc
        if not text.lstrip('\ufeff').strip():
            raise ValueError(f'Requirement document is empty: {path}')
        documents.append({'id': document_id, 'title': title, 'path': str(path),
                          'relative_path': relative_path, 'sha256': _sha256(content),
                          'characters': len(text), 'text': text})
    manifest_sha256 = _sha256(manifest_bytes)
    identity = {'schema_version': 1, 'manifest_sha256': manifest_sha256,
                'documents': [{key: row[key] for key in ('id', 'title', 'relative_path', 'sha256')}
                              for row in documents]}
    bundle_sha256 = _sha256(json.dumps(identity, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode('utf-8'))
    # Pages are fixed-size slices of the ordered document stream. A page can
    # cross document boundaries; every boundary retains its own source marker.
    parts, segments, remaining = [], [], PAGE_CHARACTERS
    for document in documents:
        offset = 0
        while offset < document['characters']:
            end = min(offset + remaining, document['characters'])
            segments.append({'document_id': document['id'], 'relative_path': document['relative_path'],
                             'start': offset, 'end': end, 'text': document['text'][offset:end]})
            remaining -= end - offset
            offset = end
            if remaining == 0:
                parts.append({'number': len(parts) + 1, 'segments': segments})
                segments, remaining = [], PAGE_CHARACTERS
    if segments:
        parts.append({'number': len(parts) + 1, 'segments': segments})
    # Keep the registered entry path for commands even when the manifest is an
    # in-root symlink; the resolved target above is used for safety and reading.
    bundle = {'schema_version': 1, 'manifest_path': str(root / MANIFEST),
              'manifest_sha256': manifest_sha256, 'bundle_sha256': bundle_sha256,
              'document_count': len(documents), 'part_count': len(parts),
              'documents': documents, 'parts': parts, 'status': STATUS}
    for part in parts:
        part['text'] = _format_part(bundle, part)
    return bundle


def render_part(bundle, number):
    """Return a complete readable page, never a JSON-escaped text fragment."""
    if type(number) is not int or number < 1 or number > bundle['part_count']:
        raise ValueError(f"Requirement part must be between 1 and {bundle['part_count']}.")
    return bundle['parts'][number - 1]['text']


def overview(bundle):
    """List every current document and the command that starts full reading."""
    lines = [f"现行要求完整清单：{bundle['document_count']} 份文档，{bundle['part_count']} 页正文。",
             f"清单：{bundle['manifest_path']}", f"Bundle SHA-256: {bundle['bundle_sha256']}"]
    for index, document in enumerate(bundle['documents'], 1):
        lines.append(f"{index}. {document['title']} [{document['id']}] — "
                     f"{document['relative_path']}（{document['characters']} 字符）")
    lines.extend(['此处仅列目录；正文需按页完整读取。',
                  f"状态：{bundle['status']}", f"下一命令：{_page_command(bundle, 1)}"])
    return '\n'.join(lines)


def metadata(bundle):
    """Return hashes, inventory and page offsets, excluding all body text."""
    return {**{key: value for key, value in bundle.items() if key not in ('documents', 'parts')},
            'documents': [{key: value for key, value in row.items() if key != 'text'}
                          for row in bundle['documents']],
            'parts': [{'number': part['number'],
                       'segments': [{key: value for key, value in segment.items() if key != 'text'}
                                    for segment in part['segments']]}
                      for part in bundle['parts']]}
