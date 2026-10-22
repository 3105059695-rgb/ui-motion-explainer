"""Resolve local style evidence without choosing an account or granting approval.

Only paths registered here are evidence candidates. Project tokens, a new render,
or a project-supplied baseline path never establish aesthetic approval.
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = 'references/profiles/registry.json'
LOCAL_REGISTRY = 'references/profiles/registry.local.json'
PROJECT_FILES = ('project.json', 'current-project.json', 'director-plan.json', 'director-context.json')
PROFILE_KEYS = ('profile', 'profile_id', 'profileId', 'styleProfile', 'styleProfileDocument', 'account', 'workflow')


def local_path(value, root):
    if not isinstance(value, str) or not value.strip() or '://' in value:
        raise ValueError('Expected a nonempty local path.')
    return (Path(root) / Path(value).expanduser()).resolve()


def read_json(path):
    return json.loads(Path(path).read_bytes().decode('utf-8-sig'))


def load_registry(root=ROOT, include_historical=False):
    """Merge an optional, explicit machine-local overlay without changing defaults.

    Account data may be local, but the current shared UI is package-owned.
    Reading lists are additive so older local profiles cannot hide current rules.
    Project UI exceptions are resolved separately from account routing.
    """
    root = Path(root)
    registry = read_json(root / REGISTRY)
    if unified_production(registry) and not include_historical:
        # A stale private account overlay must not choose or block the unified
        # design source. The existing explicit listing still opens that history.
        return registry
    overlay_path = root / LOCAL_REGISTRY
    if not overlay_path.exists():
        return registry
    if not overlay_path.is_file():
        raise ValueError('Local style registry must be a file: ' + str(overlay_path))
    try:
        overlay = read_json(overlay_path)
        if (not isinstance(overlay, dict) or set(overlay) - {'schema_version', 'profiles'}
                or type(overlay.get('schema_version')) is not int or overlay['schema_version'] != 1
                or not isinstance(overlay.get('profiles'), list)):
            raise ValueError('expected schema_version=1 and profiles:[...] with no other root fields')
        allowed = {'id', 'profile_path', 'project_roots', 'sources', 'required_reading'}
        known = {profile['id']: profile for profile in registry['profiles']}
        seen = set()
        patches = []
        for item in overlay['profiles']:
            if not isinstance(item, dict) or set(item) - allowed:
                raise ValueError('profile entries allow only id, profile_path, project_roots, sources, required_reading')
            ident = item.get('id')
            if not isinstance(ident, str) or ident not in known or ident in seen:
                raise ValueError('profile ID must be registered and appear once: ' + str(ident))
            seen.add(ident)
            if 'profile_path' in item:
                local_path(item['profile_path'], root)
            for field in ('project_roots', 'required_reading'):
                if field not in item:
                    continue
                if not isinstance(item[field], list):
                    raise ValueError(field + ' must be a list of local paths')
                for value in item[field]:
                    local_path(value, root)
            if 'sources' in item:
                if not isinstance(item['sources'], list):
                    raise ValueError('sources must be a list of source adapter objects')
                for source in item['sources']:
                    if not isinstance(source, dict) or source.get('kind') not in {
                            'documented-baseline', 'adiao-current-opening', 'asset-map'}:
                        raise ValueError('sources contains an unknown or malformed adapter')
                    local_path(source.get('path'), root)
                    if source['kind'] == 'documented-baseline':
                        if not isinstance(source.get('acceptance_marker'), str) or not source['acceptance_marker'].strip():
                            raise ValueError('documented-baseline requires an acceptance_marker')
                        baseline = source.get('baseline')
                        if not isinstance(baseline, dict) or not all(key in baseline for key in
                                ('id', 'path', 'status', 'scope', 'media_kind', 'implementations')):
                            raise ValueError('documented-baseline requires the complete baseline record')
                        local_path(baseline['path'], root)
                        for field in ('implementations', 'related_visuals', 'evidence'):
                            values = baseline.get(field, [])
                            if not isinstance(values, list):
                                raise ValueError('baseline.' + field + ' must be a list')
                            for value in values:
                                local_path(value, root)
                    if source['kind'] == 'asset-map' and (
                            not isinstance(source.get('accepted_statuses'), list) or
                            not all(isinstance(value, str) and value for value in source['accepted_statuses'])):
                        raise ValueError('asset-map requires accepted_statuses as a list of strings')
                    if source['kind'] == 'adiao-current-opening' and (
                            not isinstance(source.get('accepted_status'), str) or not source['accepted_status']):
                        raise ValueError('adiao-current-opening requires accepted_status')
            patches.append(item)
        for item in patches:
            current = known[item['id']]
            reading = list(current.get('required_reading', []))
            if item.get('profile_path') and item['profile_path'] != current['profile_path']:
                reading.append(current['profile_path'])
            reading.extend(item.get('required_reading', []))
            # Private resource overlays must not hide newly registered methods.
            if 'sources' in item:
                def source_key(source):
                    return (source['kind'], (source.get('baseline') or {}).get('id') or source['path'])
                sources = {source_key(source): source for source in current.get('sources', [])}
                sources.update({source_key(source): source for source in item['sources']})
                current['sources'] = list(sources.values())
            current.update({key: value for key, value in item.items() if key not in {'id', 'required_reading', 'sources'}})
            if reading:
                current['required_reading'] = list(dict.fromkeys(reading))
        return registry
    except (OSError, ValueError, KeyError, TypeError) as exc:
        raise ValueError('Invalid local style registry ' + str(overlay_path) + ': ' + str(exc)) from exc


def path_fact(value, root, role='resource'):
    path = local_path(value, root)
    return {'path': str(path), 'exists': path.is_file(), 'role': role}


def content_sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def contract_sha256(contract):
    """Formatting-independent fingerprint; not a signature or visual approval."""
    raw = json.dumps(contract, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(raw).hexdigest()


def current_binding(resolution):
    """Portable identities/hashes for a plan; absolute install paths stay out."""
    def directions(rows):
        return [{'id': row['id'], 'revision': row.get('contract_revision'),
                 'sha256': row.get('contract_sha256'),
                 'anchors': [{'index': index, 'sha256': fact.get('sha256')}
                             for index, fact in enumerate(row.get('visual_anchors', []))]}
                for row in rows]

    if resolution.get('unified_production', {}).get('enabled') is True:
        guide = resolution.get('guidance', {})
        if not guide.get('exists'):
            return None
        binding = {'schema_version': 1, 'mode': 'unified-production',
                'profile_id': resolution['resolved_profile'],
                'guidance_sha256': content_sha256(guide['path']),
                'directions': directions(resolution.get('reference_directions', []))}
        if resolution.get('ui_override'):
            binding['ui_override'] = {key: resolution['ui_override'][key] for key in
                                     ('id', 'scope', 'approval_source_sha256', 'quote_sha256')}
            binding['default_directions'] = directions(resolution.get('default_reference_directions', []))
        return binding
    profile = resolution.get('profile_path')
    if not resolution.get('resolved_profile') or not profile or not Path(profile).is_file():
        return None
    binding = {'schema_version': 1, 'profile_id': resolution['resolved_profile'],
            'profile_sha256': content_sha256(profile),
            'directions': [
                {'id': row['id'], 'revision': row.get('contract_revision'),
                 'sha256': row.get('contract_sha256'),
                 'anchors': [{'index': index, 'sha256': fact.get('sha256')}
                             for index, fact in enumerate(row.get('visual_anchors', []))]}
                for row in resolution.get('reference_directions', [])]}
    exception = resolution.get('ui_override')
    if exception:
        binding['ui_override'] = {key: exception[key] for key in
                                 ('id', 'scope', 'approval_source_sha256', 'quote_sha256')}
    return binding


def under(path, folder):
    try:
        Path(path).resolve().relative_to(Path(folder).resolve())
        return True
    except ValueError:
        return False


def _excluded_path(path, registry, root):
    normalized = local_path(str(path), root)
    for item in registry.get('excluded_ui_projects', []):
        if under(normalized, local_path(item['path'], root)) or item.get('path_component') in normalized.parts:
            return {'path': str(normalized), 'reason': item['reason'],
                    'source': path_fact(item['evidence'], root, 'feedback')}
    return None


def known_exclusions(registry, root, project=None):
    """A rejected reference remains rejected in every future project."""
    rows = []
    current = local_path(str(project), root) if project is not None else None
    for item in registry.get('excluded_ui_projects', []):
        path = local_path(item['path'], root)
        matches = current is not None and (under(current, path) or item.get('path_component') in current.parts)
        rows.append({'path': str(path), 'status': 'rejected-ui-baseline', 'reason': item['reason'],
                     'source': path_fact(item['evidence'], root, 'feedback'),
                     'matches_current_project': matches})
    return rows


def load_profile(config, registry, root=ROOT):
    """Read current source indices on every call; do not cache their approval state."""
    profile = path_fact(config['profile_path'], root, 'profile')
    result = {'id': config['id'], 'label': config['label'], 'profile_path': profile['path'],
              'profile_exists': profile['exists'], 'confirmed_baselines': [], 'confirmed_methods': [],
              'reference_directions': [], 'required_reading': [profile],
              'excluded_baselines': [], 'sources': [], 'missing': [], 'warnings': [],
              'project_roots': [str(local_path(p, root)) for p in config.get('project_roots', [])]}
    facts = [profile]

    def add_reading(value, target=None, base=None):
        fact = path_fact(value, root if base is None else base, 'profile-required-reading')
        facts.append(fact)
        if fact['path'] not in {item['path'] for item in result['required_reading']}:
            result['required_reading'].append(fact)
        if target is not None and fact['path'] not in {item['path'] for item in target}:
            target.append(fact)

    for value in config.get('required_reading', []):
        add_reading(value)
    directions = config.get('reference_directions', [])
    if config.get('ui_direction') == 'shared':
        shared = registry.get('shared_ui_direction') or registry.get('historical_shared_ui_direction')
        if not isinstance(shared, dict) or not shared.get('id') or not shared.get('guidance_path'):
            result['warnings'].append('The shared body UI direction is missing or malformed; no historical palette fallback is allowed.')
            result['style_references_ready'] = False
            return result
        directions = [shared]
    result['ui_direction_source'] = ('shared-body-ui' if config.get('ui_direction') == 'shared' else
                                     'project-body-ui' if config.get('ui_direction') == 'project' else 'profile')
    for spec in directions:
        direction_root = spec.get('resource_root', root)
        # A chosen reference is independent of an approved reproduction. Load its
        # current machine-readable contract, not a cached or project-authored copy.
        source = path_fact(spec['guidance_path'], root, 'reference-direction-evidence')
        facts.append(source)
        result['sources'].append(source)
        direction = {'id': spec['id'], 'label': spec.get('label', spec['id']),
                     'guidance_source': source, 'guidance_loaded': False,
                      'direction_contract': {}, 'required_reading': [],
                      'visual_anchors': [], 'visual_references_ready': False}
        result['reference_directions'].append(direction)
        try:
            for value in spec.get('reading', []):
                add_reading(value, direction['required_reading'])
            if not source['exists']:
                result['warnings'].append('Reference direction evidence is missing: ' + source['path'])
                continue
            doc = read_json(source['path'])
            if not isinstance(doc, dict) or not isinstance(doc.get('direction_contract'), dict) or not doc['direction_contract']:
                raise ValueError('Reference direction evidence must contain a nonempty direction_contract object.')
            if doc.get('id') != spec['id']:
                raise ValueError('Reference direction ID does not match its registry entry.')
            if doc.get('status') not in {'user_selected_reference_direction', 'approved_reference_direction'}:
                raise ValueError('Reference direction is not recorded as selected/approved; rejected or trial records cannot bind a current plan.')
            contract = doc['direction_contract']
            reading = contract.get('reading', [])
            if not isinstance(reading, list) or any(not isinstance(p, str) or not p.strip() for p in reading):
                raise ValueError('direction_contract.reading must be a list of local paths.')
            for value in reading:
                add_reading(value, direction['required_reading'], direction_root)
            calibration = contract.get('visual_calibration', {})
            if not isinstance(calibration, dict):
                raise ValueError('direction_contract.visual_calibration must be an object.')
            anchors = calibration.get('anchors', [])
            if not isinstance(anchors, list):
                raise ValueError('visual_calibration.anchors must be a list.')
            for anchor in anchors:
                if not isinstance(anchor, dict):
                    raise ValueError('Every visual anchor must be an object with a local frame path.')
                fact = {**path_fact(anchor.get('frame'), direction_root, 'visual-calibration-anchor'),
                        'source': anchor.get('source'), 'event': anchor.get('event'),
                        'learn': anchor.get('learn')}
                if fact['exists']:
                    fact['sha256'] = content_sha256(fact['path'])
                else:
                    result['warnings'].append('Required visual calibration anchor is missing: ' + fact['path'])
                facts.append(fact)
                direction['visual_anchors'].append(fact)
            anchors_ready = all(f['exists'] for f in direction['visual_anchors'])
            if calibration.get('view_before_design') and not anchors:
                anchors_ready = False
                result['warnings'].append('Visual calibration requires viewing but declares no anchors: ' + spec['id'])
            direction.update(direction_contract=contract, guidance_loaded=True,
                             contract_revision=contract.get('revision'),
                             contract_sha256=contract_sha256(contract),
                             visual_references_ready=anchors_ready)
            for key in ('status', 'quote', 'scope', 'scope_updates', 'review', 'approval', 'source', 'source_range'):
                if key in doc:
                    direction[key] = doc[key]
        except (OSError, ValueError, KeyError, TypeError) as exc:
            result['warnings'].append('Cannot read reference direction ' + spec['id'] + ': ' + str(exc))

    def add_baseline(item):
        item['profile_id'] = config['id']
        # Partial AIGC method approval may coexist with rejected UI. It cannot
        # revive the same video as a visual baseline.
        if item.get('approval_kind') == 'method-only':
            if not (item.get('retrieval') or {}).get('method_scope'):
                result['warnings'].append('Method-only approval requires an explicit method scope: ' + item['id'])
                return
            result['confirmed_methods'].append(item)
            return
        rejected = _excluded_path(item['path'], registry, root)
        if rejected:
            result['excluded_baselines'].append(rejected)
            return
        result['confirmed_baselines'].append(item)

    for spec in config.get('sources', []):
        source = path_fact(spec['path'], root, 'evidence-index')
        facts.append(source)
        result['sources'].append(source)
        if not source['exists']:
            continue
        path = Path(source['path'])
        try:
            if spec['kind'] == 'documented-baseline':
                if spec['acceptance_marker'] not in path.read_text(encoding='utf-8-sig'):
                    result['warnings'].append('Recorded acceptance marker is absent: ' + str(path))
                    continue
                record = spec['baseline']
                visual = path_fact(record['path'], root, 'confirmed-visual')
                impl = [path_fact(p, root, 'implementation') for p in record['implementations']]
                related = [path_fact(p, root, 'reference-media') for p in record.get('related_visuals', [])]
                evidence = [source, *[path_fact(p, root, 'supporting-evidence') for p in record.get('evidence', [])]]
                facts.extend([visual, *impl, *related, *evidence])
                boundaries = {key: record[key] for key in ('quote', 'source_range', 'audio_review',
                              'new_projects_approved', 'boundaries', 'current_usage', 'superseded_visual_scope',
                              'retrieval', 'approval_kind', 'whole_film_approved', 'media_range') if key in record}
                add_baseline({**visual, 'id': record['id'], 'status': record['status'],
                              'scope': record['scope'], 'media_kind': record['media_kind'],
                              'source': source, 'evidence': evidence, 'implementations': impl,
                              'related_visuals': related, **boundaries})
                continue
            doc = read_json(path)
            if not isinstance(doc, dict):
                raise ValueError('Evidence index must be an object.')
            if spec['kind'] == 'adiao-current-opening':
                current = doc.get('current_project')
                if current:
                    result['project_roots'].append(str(local_path(current, path.parent)))
                acceptance = doc.get('opening_revision_acceptance', {})
                if (doc.get('status') != spec['accepted_status'] or not isinstance(acceptance, dict)
                        or not acceptance.get('quote') or not acceptance.get('scope') or not doc.get('intro_preview')):
                    result['warnings'].append('Current pointer does not establish opening acceptance: ' + str(path))
                    continue
                visual = path_fact(doc['intro_preview'], path.parent, 'confirmed-opening')
                impl = [path_fact('opening.js', local_path(current, path.parent), 'implementation')]
                evidence = [source]
                if doc.get('handoff_path'):
                    evidence.append(path_fact(doc['handoff_path'], path.parent, 'handoff'))
                facts.extend([visual, *impl, *evidence])
                add_baseline({**visual, 'id': 'current-opening-revision',
                              'status': 'approved_opening_revision_only', 'scope': acceptance['scope'],
                              'quote': acceptance['quote'], 'source': source, 'evidence': evidence,
                              'implementations': impl, 'source_range': [0, doc.get('intro_boundary_seconds')],
                              'whole_film_approved': False, 'retrieval': spec.get('retrieval', {})})
                continue
            if spec['kind'] != 'asset-map':
                result['warnings'].append('Unsupported source adapter: ' + spec['kind'])
                continue
            implementations = {x['id']: x for x in doc.get('implementations', []) if isinstance(x, dict) and 'id' in x}
            for sample in doc.get('samples', []):
                if not isinstance(sample, dict) or not sample.get('path'):
                    continue
                visual = path_fact(sample['path'], path.parent, 'sample')
                approved = (sample.get('status') in spec['accepted_statuses'] and
                            not any(sample.get(k) is False for k in
                                    ('aestheticApproval', 'fullFilmUserApproval', 'separateAestheticApprovalRecorded')))
                if not approved:
                    result['excluded_baselines'].append({**visual, 'status': sample.get('status'),
                        'reason': 'Source does not record this sample as an approved visual baseline.', 'source': source})
                    continue
                impl, evidence = [], [source]
                for ident in sample.get('implementationIds', []):
                    record = implementations.get(ident)
                    if record is None:
                        result['warnings'].append('Missing implementation ID: ' + ident)
                        continue
                    paths = ([record['entry']] if record.get('entry') else []) + record.get('files', [])
                    impl.extend({**path_fact(p, path.parent, 'implementation'), 'id': ident,
                                 'reuse': record.get('reuse')} for p in paths)
                if sample.get('record'):
                    evidence.append(path_fact(sample['record'], path.parent, 'approval-record'))
                facts.extend([visual, *impl, *evidence])
                approval = sample.get('approval') or {}
                boundaries = [value for value in (sample.get('doesNotAssert'), approval.get('doesNotAssert')) if value]
                for key in ('fullFilmUserApproval', 'aigcUserApproval', 'fullHumanPlaybackAndListening', 'humanFullAVReview'):
                    if sample.get(key) is False or approval.get(key) is False:
                        boundaries.append(key + '=false')
                retrieval = (spec.get('sample_retrieval') or {}).get(sample.get('id'), sample.get('retrieval', {}))
                add_baseline({**visual, 'id': sample.get('id'), 'status': sample['status'],
                              'scope': sample.get('approvalScope'), 'source': source, 'evidence': evidence,
                              'implementations': impl, 'source_range': sample.get('sourceRange'),
                              'later_reference_calibration': sample.get('laterReferenceCalibration'),
                              'quote': approval.get('quote', approval.get('approvalQuote')),
                              'boundaries': boundaries, 'retrieval': retrieval,
                              'media_range': [0, sample.get('durationSeconds')],
                              'whole_film_approved': sample.get('fullFilmUserApproval', approval.get('fullFilmUserApproval'))})
            # Current trial exports are not silently promoted just because they exist.
            for key, trial in doc.get('openingTrialStatus', {}).items():
                if isinstance(trial, dict) and trial.get('path'):
                    visual = path_fact(trial['path'], path.parent, 'trial')
                    matching = [item for item in result['confirmed_baselines']
                                if item['path'] == visual['path'] and item['source']['path'] == source['path']]
                    denied = any(trial.get(flag) is False for flag in
                                 ('aestheticApproval', 'fullFilmUserApproval', 'separateAestheticApprovalRecorded'))
                    rejected = 'rejected' in str(trial.get('status', '')).split('_')
                    # A current accepted trial may repeat the same approved sample.
                    # Neither a matching path alone nor historical approvalAtDelivery
                    # can override the current entry's explicit rejection.
                    if (not denied and not rejected and trial.get('status') in spec['accepted_statuses']
                            and any(item['status'] == trial['status'] for item in matching)):
                        continue
                    if matching and (denied or rejected):
                        result['confirmed_baselines'] = [item for item in result['confirmed_baselines']
                                                        if item not in matching]
                        result['warnings'].append('Current opening trial rejects a previously listed baseline: ' + visual['path'])
                    result['excluded_baselines'].append({**visual,
                        'id': key, 'status': trial.get('status'), 'source': source,
                        'reason': 'Trial status is separate from confirmed samples; use the current profile and index.'})
            for key in ('implementationGuide',):
                if doc.get(key):
                    fact = path_fact(doc[key], path.parent, 'implementation-guide')
                    facts.append(fact)
                    result['sources'].append(fact)
            target = doc.get('openingReferenceTarget', {})
            if isinstance(target, dict):
                for key in ('referenceMap', 'analysis'):
                    if target.get(key):
                        fact = path_fact(target[key], path.parent, 'current-reference-not-approved-reproduction')
                        facts.append(fact)
                        result['sources'].append(fact)
        except (OSError, ValueError, KeyError, TypeError) as exc:
            result['warnings'].append('Cannot read current source ' + str(path) + ': ' + str(exc))
    result['missing'] = list({f['path']: f for f in facts if not f['exists']}.values())
    visual_basis_ready = (all(d['guidance_loaded'] and d['visual_references_ready']
                             for d in result['reference_directions']) if result['reference_directions']
                          else any(item.get('exists') for item in result['confirmed_baselines']))
    result['style_references_ready'] = (profile['exists'] and visual_basis_ready and
        all(f['exists'] for f in result['required_reading']))
    return result


def identify(value, configs, root, base):
    if not isinstance(value, str):
        return None
    for config in configs:
        if value.casefold() in [s.casefold() for s in [config['id'], *config.get('aliases', [])]]:
            return config['id']
        try:
            if local_path(value, base) == local_path(config['profile_path'], root):
                return config['id']
        except (ValueError, OSError):
            pass
    return None


def project_ui_override(declaration, metadata, config, registry, root):
    """Check a scoped project exception's files, not the human's identity.

    A local file/hash is provenance evidence, not authentication. The production
    Agent must read the actual user conversation before treating it as approval.
    A profile ID, palette string, or a plan's own 'approved' flag is insufficient.
    """
    if not isinstance(declaration, dict) or declaration.get('scope') != 'body-ui':
        raise ValueError('style.ui_override requires scope="body-ui"; AIGC-only choices do not override UI')
    source = declaration.get('source', {})
    if not isinstance(source, dict):
        raise ValueError('style.ui_override.source must contain path, sha256 and the exact user quote')
    evidence = local_path(source.get('path'), metadata.parent)
    if evidence.name in PROJECT_FILES or evidence == metadata.resolve():
        raise ValueError('UI override evidence must be separate from project/plan/derived metadata')
    expected = source.get('sha256')
    quote = source.get('quote')
    if not isinstance(expected, str) or len(expected) != 64 or content_sha256(evidence) != expected:
        raise ValueError('UI override source sha256 does not match its actual file')
    if not isinstance(quote, str) or not quote.strip():
        raise ValueError('UI override requires the exact nonempty user quote')
    text = evidence.read_text(encoding='utf-8-sig')
    if evidence.suffix.lower() == '.jsonl':
        user_messages = []
        for line in text.splitlines():
            if not line.strip():
                continue
            row = json.loads(line)
            if not isinstance(row, dict):
                raise ValueError('UI override conversation records must be JSON objects')
            payload = row.get('payload', {})
            if not isinstance(payload, dict):
                continue
            if row.get('type') == 'response_item' and payload.get('role') == 'user':
                user_messages.extend(item.get('text', '') for item in payload.get('content', [])
                                     if isinstance(item, dict) and item.get('type') in {'input_text', 'text'})
            elif row.get('type') == 'event_msg' and payload.get('type') == 'user_message':
                user_messages.append(payload.get('message', ''))
        text = '\n'.join(message for message in user_messages if isinstance(message, str))
    if quote not in text:
        raise ValueError('UI override quote is absent from the source (JSONL requires an actual user-message record)')
    spec = declaration.get('direction')
    if not isinstance(spec, dict) or not spec.get('id') or not spec.get('guidance_path'):
        raise ValueError('UI override direction requires id and an independent guidance_path')
    spec = {**spec, 'guidance_path': str(local_path(spec['guidance_path'], metadata.parent)),
            'resource_root': str(metadata.parent),
            'reading': [str(local_path(value, metadata.parent)) for value in spec.get('reading', [])]}
    exception = {**config, 'ui_direction': 'project', 'reference_directions': [spec]}
    resolved = load_profile(exception, registry, root)
    if (not resolved['reference_directions'] or not resolved['reference_directions'][0]['visual_anchors']):
        raise ValueError('Project UI exception requires actual visual calibration anchors, not a prose-only palette')
    resolved['ui_override'] = {'id': spec['id'], 'scope': 'body-ui',
        'approval_source_sha256': expected, 'quote_sha256': hashlib.sha256(quote.encode('utf-8')).hexdigest(),
        'source': {**source, 'path': str(evidence)}, 'metadata_path': str(metadata),
        'evidence_files_verified': True, 'user_identity_verified': False,
        'boundary': 'File/hash/quote checks only; the Agent must verify the actual human request and scope in its conversation.'}
    return resolved


def unified_production(registry):
    """Only the package's explicit switch retires legacy account visual routing."""
    value = registry.get('unified_production')
    return value if isinstance(value, dict) and value.get('enabled') is True else None


def resolve_unified(project, profile, registry, root):
    """Resolve the current shared direction without account or whole-film routing.

    Existing account/profile metadata is a history hint, not a visual choice.
    Current project inputs and sourced UI overrides survive independently; they
    cannot promote a prior export or its style.applied flag to approval.
    """
    config = unified_production(registry)
    guide = path_fact(config['guidance_path'], root, 'primary-design-library')
    target = Path(project or Path.cwd()).expanduser().resolve()
    directory = target.parent if target.is_file() else target
    result = {'status': 'resolved' if guide['exists'] else 'missing-guidance',
              'resolved_profile': config.get('profile_id', 'user-ui'),
              'profile_path': guide['path'], 'guidance': guide,
              'project': str(directory), 'selection_source': 'unified-production',
              'ui_direction_source': 'effect-library', 'editing_mode': 'continuous-ui',
              'unified_production': {**config, 'account_visual_routing': False,
                                     'whole_film_recommendations': False},
              'confirmed_baselines': [], 'confirmed_methods': [], 'method_examples': [],
              'reference_directions': [], 'available_profiles': [],
              'required_reading': [guide], 'missing': [] if guide['exists'] else [guide],
              'style_references_ready': guide['exists'], 'requires_visual_comparison': True,
              'excluded_baselines': known_exclusions(registry, root, directory),
              'historical_profile_hints': [], 'warnings': [],
              'historical_query': 'ui.py styles -- list',
              'scope': 'Effect-library resource discovery only; no visual review or aesthetic approval. '
                       'Account history, AIGC art references and current source identity do not choose UI aesthetics.'}
    # A current user-selected direction is separate from historical profiles.
    # Loading it here persists the choice across directories and fresh chats.
    direction = config.get('default_direction')
    if direction is not None:
        if not isinstance(direction, dict) or not direction.get('id') or not direction.get('guidance_path'):
            result['style_references_ready'] = False
            result['warnings'].append('The configured default UI direction is invalid; do not choose another style.')
        else:
            selected = load_profile({
                'id': result['resolved_profile'], 'label': config.get('label', 'Shared direction'),
                'profile_path': config['guidance_path'], 'sources': [],
                'reference_directions': [direction],
                'required_reading': config.get('required_reading', []),
            }, registry, root)
            for key in ('reference_directions', 'required_reading', 'missing', 'style_references_ready'):
                result[key] = selected[key]
            result['default_reference_directions'] = selected['reference_directions']
            result['warnings'].extend(selected['warnings'])
            result['ui_direction_source'] = config.get('direction_source', 'shared-default')
            result['scope'] = ('The user-selected default visual/editing direction applies across new chats and '
                               'project directories. Library entries implement that direction; an explicit sourced '
                               'project request may override it. Resource checks do not certify visual application.')
    if profile:
        result['historical_profile_hints'].append({'value': str(profile), 'source': 'explicit-profile'})
    # A new child directory is not an implicit continuation of its parent.
    # Continuing an existing project means passing that project's actual root.
    for folder in (directory,):
        metadata = folder / 'project.json'
        if not metadata.is_file():
            continue
        try:
            doc = read_json(metadata)
            if not isinstance(doc, dict):
                raise ValueError('project metadata must be an object')
        except (OSError, ValueError) as exc:
            result['warnings'].append('Unreadable project metadata: ' + str(metadata) + ': ' + str(exc))
            break
        style = doc.get('style') if isinstance(doc.get('style'), dict) else {}
        for record in (doc, style):
            for key in PROFILE_KEYS:
                if isinstance(record.get(key), str) and record[key].strip():
                    result['historical_profile_hints'].append({'value': record[key], 'source': str(metadata)})
        mode = style.get('mode') or doc.get('editing_mode') or doc.get('mode')
        if mode in {'whiteboard', 'continuous-ui'}:
            result.update(editing_mode=mode, mode_source=str(metadata))
        # Keep current inputs and identity as supplied. Do not import another
        # account's presenter, voice, character or baseline through its profile.
        result['current_project_inputs'] = {key: doc[key] for key in
            ('source', 'presenter', 'identity', 'character', 'ip', 'audio', 'audio_source', 'narration') if key in doc}
        result['current_project_style'] = {key: style[key] for key in
                                          ('tokens', 'profile', 'baseline', 'ui_override') if key in style}
        result['current_project_metadata_path'] = str(metadata)
        if 'ui_override' in style:
            try:
                # Reuse the existing sourced request contract, but do not pull
                # account sources or old whole-film baselines into this project.
                project_config = {'id': result['resolved_profile'], 'label': config.get('label', 'Unified production'),
                                  'profile_path': guide['path'], 'sources': []}
                override = project_ui_override(style['ui_override'], metadata, project_config, registry, root)
                # Only body UI changes. Global preferences, opening/exclusions
                # and their reading/reference readiness remain independently bound.
                for key in ('required_reading', 'missing'):
                    known = {item['path'] for item in result[key]}
                    result[key].extend(item for item in override[key] if item['path'] not in known)
                result['style_references_ready'] = (
                    result['style_references_ready'] and override['style_references_ready'])
                for key in ('ui_override', 'reference_directions'):
                    result[key] = override[key]
                result['ui_direction_source'] = override.get('ui_direction_source', 'project-body-ui')
                result['warnings'].extend(override['warnings'])
            except (OSError, ValueError, KeyError, TypeError) as exc:
                result['style_references_ready'] = False
                result['warnings'].append('Invalid project UI override: ' + str(exc))
        break
    return result


def resolve(project=None, profile=None, root=ROOT, registry=None):
    registry = load_registry(root) if registry is None else registry
    if unified_production(registry):
        return resolve_unified(project, profile, registry, root)
    configs = registry['profiles']
    available = [load_profile(config, registry, root) for config in configs]
    project_path = Path(project or Path.cwd()).expanduser().resolve()
    directory = project_path.parent if project_path.is_file() else project_path
    result = {'status': 'unresolved', 'resolved_profile': None, 'profile_path': None,
              'project': str(directory), 'confirmed_baselines': [], 'confirmed_methods': [], 'method_examples': [], 'missing': [],
              'editing_mode': 'continuous-ui',
              'reference_directions': [], 'required_reading': [], 'style_references_ready': False,
              'requires_visual_comparison': True, 'selection_source': None,
              'warnings': [], 'excluded_baselines': known_exclusions(registry, root, directory),
              'available_profiles': available,
              'scope': 'Local routing and file existence only; no visual review, render, or approval is performed.'}
    selection = identify(profile, configs, root, directory) if profile else None
    if profile:
        result['selection_source'] = 'explicit-profile'
        if not selection:
            result['warnings'].append(registry.get('unregistered_profiles', {}).get(profile, 'Unknown registered profile: ' + profile))
            return result
    declared_baselines = []
    declared_ui = []
    # Nearest project metadata takes precedence over folder routing. Parent lookup
    # permits calling from project/src without scanning unrelated workspace files.
    for folder in [directory, *list(directory.parents)[:5]]:
        found = set()
        unknown = []
        folder_ui = []
        for name in PROJECT_FILES:
            path = folder / name
            if not path.is_file():
                continue
            try:
                doc = read_json(path)
            except (OSError, ValueError) as exc:
                result['warnings'].append('Unreadable project metadata: ' + str(path) + ': ' + str(exc))
                continue
            if not isinstance(doc, dict):
                continue
            if name == 'director-context.json' and doc.get('generated_by') == 'ui-motion-fusion/director.py':
                # A derived lookup result is not a user-authored profile choice.
                # Reading it back would freeze old routing and make prepare drift.
                continue
            style = doc.get('style', {})
            if name == 'project.json' and not result.get('mode_source'):
                mode = style.get('mode') if isinstance(style, dict) else None
                mode = mode or doc.get('editing_mode') or doc.get('mode')
                if mode in {'whiteboard', 'continuous-ui'}:
                    result['editing_mode'] = mode
                    result['mode_source'] = str(path)
            values = [(k, doc.get(k)) for k in PROFILE_KEYS]
            if isinstance(style, dict):
                values += [(k, style.get(k)) for k in PROFILE_KEYS]
                if style.get('baseline'):
                    declared_baselines.append((style['baseline'], folder))
                if 'ui_override' in style:
                    folder_ui.append((style['ui_override'], path))
            if doc.get('baseline'):
                declared_baselines.append((doc['baseline'], folder))
            for key, value in values:
                ident = identify(value, configs, root, folder)
                if ident:
                    found.add(ident)
                elif key != 'workflow' and isinstance(value, str) and value.strip():
                    unknown.append(value)
        if not declared_ui and folder_ui:
            declared_ui = folder_ui
        if unknown and not profile:
            result['selection_source'] = 'unregistered-project-profile:' + str(folder)
            result['warnings'].append('Project declares an unregistered profile; folder routing must not replace it: ' + ', '.join(unknown))
            return result
        if found:
            if not profile:
                if len(found) == 1:
                    selection = next(iter(found))
                    result['selection_source'] = 'project-metadata:' + str(folder)
                else:
                    result['warnings'].append('Project metadata names conflicting profiles; resolve the conflict instead of guessing.')
                    return result
            break
        if any(str(folder) in item['project_roots'] for item in available):
            break
    if not selection:
        routes = [(len(Path(p).parts), item['id']) for item in available
                  for p in item['project_roots'] if under(directory, p)]
        nearest = max((depth for depth, _ in routes), default=0)
        matches = {ident for depth, ident in routes if depth == nearest}
        if len(matches) == 1:
            selection = next(iter(matches))
            result['selection_source'] = 'registered-project-root'
        elif len(matches) > 1:
            result['warnings'].append('Folder belongs to multiple registered profiles; no profile was assumed.')
            return result
        elif registry.get('default_profile'):
            selection = identify(registry['default_profile'], configs, root, directory)
            result['selection_source'] = 'registry-default'
            if not selection:
                result['warnings'].append('The registry default profile is not registered; no profile was assumed.')
    selected = next((item for item in available if item['id'] == selection), None)
    if selected:
        if declared_ui:
            try:
                if len(declared_ui) != 1 or declared_ui[0][1].name != 'project.json':
                    raise ValueError('Declare one UI exception in project.json; plans and copied contexts cannot establish it')
                declaration, metadata = declared_ui[0]
                config = next(item for item in configs if item['id'] == selection)
                selected = project_ui_override(declaration, metadata, config, registry, root)
            except (OSError, ValueError, KeyError, TypeError) as exc:
                selected = {**selected, 'style_references_ready': False,
                            'warnings': [*selected['warnings'], 'Invalid project UI override: ' + str(exc)]}
        result.update(status='resolved' if selected['profile_exists'] else 'missing-profile',
                      resolved_profile=selection, profile_path=selected['profile_path'],
                      reference_directions=selected['reference_directions'],
                      required_reading=selected['required_reading'],
                      style_references_ready=selected['style_references_ready'],
                      confirmed_baselines=selected['confirmed_baselines'], confirmed_methods=selected['confirmed_methods'], missing=selected['missing'])
        result['ui_direction_source'] = selected.get('ui_direction_source')
        if selected.get('ui_override'):
            result['ui_override'] = selected['ui_override']
        result['excluded_baselines'].extend(selected['excluded_baselines'])
        result['warnings'].extend(selected['warnings'])
        for account in available:
            for row in [*account['confirmed_baselines'], *account['confirmed_methods']]:
                retrieval = row.get('retrieval') or {}
                same_account = account['id'] == selection
                if retrieval and (same_account or (retrieval.get('cross_profile') is True and retrieval.get('method_scope'))):
                    result['method_examples'].append({**row,
                        'usage': 'account-reference' if same_account else 'method-reference-only',
                        'identity_reuse_allowed': False, 'media_reuse_automatic': False,
                        'style_reuse_automatic': False})
        result['available_profiles'] = []
    else:
        result['warnings'].append('No applicable account is identified. Inspect the listed baselines; do not treat palette tokens or a new sample as approval.')
    confirmed = {item['path'] for item in result['confirmed_baselines']}
    for value, base in declared_baselines:
        try:
            candidate = str(local_path(value, base))
        except (ValueError, OSError):
            continue
        if candidate not in confirmed:
            result['excluded_baselines'].append({'path': candidate,
                'reason': 'Project-declared baseline is not a confirmed baseline of the resolved profile.'})
    return result


def listing(root=ROOT):
    registry = load_registry(root, include_historical=True)
    return {'status': 'listed', 'resolved_profile': None, 'profile_path': None,
            'confirmed_baselines': [], 'missing': [], 'requires_visual_comparison': True,
            'reference_directions': [], 'required_reading': [],
            'excluded_baselines': known_exclusions(registry, root),
            'available_profiles': [load_profile(c, registry, root) for c in registry['profiles']],
            'usage': 'Historical query only; these profiles and whole films are not ordinary production defaults.',
            'unregistered_profiles': registry.get('unregistered_profiles', {})}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('list')
    command = commands.add_parser('resolve')
    command.add_argument('--project', type=Path, default=Path.cwd())
    command.add_argument('--profile', help='Legacy account hint; new work retains the shared default visual direction.')
    args = parser.parse_args(argv)
    try:
        output = listing() if args.command == 'list' else resolve(args.project, args.profile)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(json.dumps({'status': 'error', 'error': str(exc), 'requires_visual_comparison': True}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
