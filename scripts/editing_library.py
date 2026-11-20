"""Look up submitted editing techniques by the relationship the audience needs to see."""
from functools import lru_cache
from pathlib import Path
import json
import re
from urllib.parse import parse_qs, urlsplit

import reference_edits as edits
import shot_direction as art
from video_routing import Router, _evidence
from video_sources import Catalog, ROOT

# Ranked by the editorial operation; the same technique can answer more than one question.
FUNCTIONS = {
    'compare': ('arun-membership', 'fred-jev', 'fred-argon', 'sample:A01', 'interview-l'),
    'handoff': ('girl-handoff', 'interview-k', 'workflow', 'girl-aigc-approved', 'girl-takeover',
                'photographic-transfer', 'girl-manual', 'sample:A01', 'fangmu-ten-agents-final-20261021'),
    'cause': ('claude', 'network', 'fred-jev', 'creative', 'fangmu-ten-agents-final-20261021', 'base-token'),
    'operate': ('workflow', 'base-codex', 'creative', 'girl-manual', 'interview-m', 'base-doubao',
                'girl-takeover', 'photographic-transfer', 'network', 'claude'),
    'focus': ('sample:fangmu/material-captions-v3', 'fred-argon', 'interview-i', 'fred-weekly',
              'interview-j', 'sample:fangmu/opening-v5', 'sample:adiao/unemployment-v3-opening', 'interview-n'),
    'hierarchy': ('interview-l', 'base-token', 'interview-o', 'base-doubao', 'editorial-b8a8d304',
                  'sample:fangmu/full-v3', 'adiao-anime-semantic', 'local-video-5c2f8b41'),
}
KEEP = {'id':'original','explains':'原画面或真人已能给出观众需要的信息。','change':'保持视点和原声',
        'inputs':{'picture':'当前真人、实物或录屏'},'implementation':'本期原素材','mechanism':'original'}


@lru_cache(maxsize=2)
def library(root=ROOT):
    root = Path(root)
    catalog = Catalog(root)
    recipes, _ = edits.rules(catalog)
    direction = edits.read(root / art.DIRECTION)
    return catalog, Router(catalog), recipes, direction


def card(ident, root=ROOT):
    if ident == 'original':
        return dict(KEEP)
    catalog, _, recipes, directions = library(root)
    recipe = recipes[ident]
    row = catalog.lookup(ident)
    use = next(u for u in row['uses'] if u['capability'] == recipe['capability'])
    source = {'source_id':ident, 'capability':recipe['capability'], 'clip':row.get('media'),
              'locator':_evidence(row, use), 'source_resource_id':row.get('atlas',{}).get('source_resource_id'),
              'motion_evidence':{'approved_ranges':row.get('atlas',{}).get('approved_ranges',[])}}
    ref = art.source_reference(Path(root), source, directions[ident])
    if ident=='arun-membership' and ref['basis']=='replay':
        ref={'path':'assets/reference-edits/fixed-comparison.html','basis':'replay','range':[0,6],
             'label':'同题比较 · 依据本来源剪法源码重演，数值为示意'}
    ref['suggested_seconds']=audition_span(Path(root),ref)
    return {'id':ident, 'title':row['title'], 'functions':[key for key, ids in FUNCTIONS.items() if ident in ids],
            'explains':recipe['action'], 'change':directions[ident]['watch'], 'inputs':recipe['slots'],
            'mechanism':recipe['capability'], 'implementation':edits.RECIPES+'#/recipes/'+ident,
            'continuous_example':ref,'source_intervals':[{k:e[k] for k in ('start','end') if k in e}
                for e in use.get('examples',[])[:4] if 'start' in e and 'end' in e],
            'audition':'direct -- watch --project PROJECT --unit UNIT --id '+ident,
            'apply':'direct -- trial --project PROJECT --unit UNIT --spec SPEC.json',
            **({'variants':{'pair':'两项同条件比较，仅绑定 condition、a、b，切点进度 .5 可对齐原声。'}} if ident=='arun-membership' else {})}


def audition_span(root, ref):
    if ref.get('range'):
        return list(ref['range'])
    entry,_,query=ref['path'].partition('?')
    path=root/entry
    if path.suffix.lower()!='.html':
        try:return [0,min(8,float(edits.probe(path)['format']['duration']))]
        except (OSError,ValueError):return None
    steps=parse_qs(query).get('steps')
    if steps and path.name=='study.html':
        # Each registered mechanism uses the six-second fixture clock in demo-fixtures.js.
        return [0,6*len(steps[0].split(','))]
    config=path.parent/'project.json'
    if config.is_file():
        record=json.loads(config.read_text(encoding='utf-8-sig'))
        if isinstance(record.get('duration'),(float,int)):return [0,record['duration']]
    match=re.search(r'["\']?duration["\']?\s*[:=]\s*([\d.]+)',path.read_text(encoding='utf-8-sig'))
    return [0,float(match[1].rstrip('.'))] if match else None


def options(unit, root=ROOT):
    _, router, recipes, _ = library(root)
    job = unit['decision']['job']
    ranked = router.match(unit['quote'], limit=len(recipes), allowed=recipes)
    matches = {r['source_id']:r for r in ranked}
    preferred = FUNCTIONS.get(job, ())
    items = sorted(recipes, key=lambda k: (k not in preferred,
        -len(matches.get(k,{}).get('matched',[])), preferred.index(k) if k in preferred else len(preferred)))
    return items
