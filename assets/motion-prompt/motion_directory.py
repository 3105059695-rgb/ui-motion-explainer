"""Read and maintain editorial folders in catalog.json. An entry has one primary folder."""
from urllib.parse import urlencode


def folders(data):
    for section in data.get('directory',{}).get('sections',[]):
        for folder in section['folders']:
            yield section,folder


def by_id(data):
    return {ident:(section,folder) for section,folder in folders(data) for ident in folder['ids']}


def resolve(data,value):
    term=str(value).strip().casefold()
    for section,folder in folders(data):
        if term in (folder['key'].casefold(),folder['name'].casefold()):
            return section,folder
    raise ValueError('找不到这个二级分类。运行 directory 查看可用名称与 key。')


def format_name(data,row):
    for fmt in data.get('directory',{}).get('formats',[]):
        if all(row.get(k) in vals for k,vals in fmt['match'].items()):
            return fmt['name']
    return ''


def validate(data):
    ids={r['id'] for r in data['entries']}
    section_keys=set();folder_keys=set();mapped=set()
    for section in data['directory']['sections']:
        if section['key'] in section_keys:raise ValueError('重复的一级分类 '+section['key'])
        section_keys.add(section['key'])
        for f in section['folders']:
            primary=set(f['ids']);related=set(f['related'])
            if f['key'] in folder_keys or primary & mapped or len(primary)!=len(f['ids']):
                raise ValueError('分类或主编号重复 '+f['key'])
            if (primary|related)-ids or primary & related or len(related)!=len(f['related']):
                raise ValueError('无效的主分类或关联编号 '+f['key'])
            mapped.update(primary);folder_keys.add(f['key'])
    if ids!=mapped:raise ValueError('缺少主分类 '+', '.join(sorted(ids-mapped)))
    for group in data['directory'].get('collections',[]):
        if set(group['ids'])-ids or len(set(group['ids']))!=len(group['ids']):
            raise ValueError('专题含无效编号 '+group['key'])


def assign(data,row,explicit=None):
    if 'directory' not in data:return None
    if explicit:
        dest=resolve(data,explicit)[1]
    else:
        lookup=by_id(data)
        base=next((lookup[k] for k in row.get('baseIds',[]) if k in lookup),None)
        if base:dest=base[1]
        else:
            title=row['name'].casefold();detail=row['meaning'].casefold()
            ranked=[]
            for _,f in folders(data):
                terms=[term.casefold() for term in f['terms'] if len(term)>=2]
                exact=max((len(term) for term in terms if term in title),default=0)
                detail_hit=max((len(term) for term in terms if term in detail),default=0)
                ranked.append((exact*4+detail_hit,f))
            ranked.sort(key=lambda x:x[0],reverse=True)
            if ranked and ranked[0][0]>=8 and (len(ranked)==1 or ranked[0][0]>ranked[1][0]):
                dest=ranked[0][1]
            else:
                dest=next((f for _,f in folders(data) if f['key']=='inbox'),None)
                if dest is None:
                    dest={'key':'inbox','name':'待细分的新动作','terms':[],'ids':[],'related':[]}
                    data['directory']['sections'].append({'key':'incoming','name':'新入库待细分','folders':[dest]})
    for _,f in folders(data):
        if row['id'] in f['ids'] and f is not dest:f['ids'].remove(row['id'])
    if row['id'] in dest['related']:dest['related'].remove(row['id'])
    if row['id'] not in dest['ids']:dest['ids'].append(row['id'])
    data['directory']['sections'][:]=[s for s in data['directory']['sections']
        if s['key']!='incoming' or any(f['ids'] for f in s['folders'])]
    return dest


def timecode(t):
    cs=round(t*100)
    return f'{cs//6000:02}:{cs//100%60:02}.{cs%100:02}'


def row_card(data,row,path):
    section,folder=path
    return {'id':row['id'],'name':row['name'],'meaning':row['meaning'],
            'section':section['name'],'folder':folder['name'],'folderKey':folder['key'],
            'format':format_name(data,row),'preview':'index.html#'+row['id'],
            'baseIds':row.get('baseIds',[]),'references':row.get('references',[])}


def listing(data,key=None,include_related=False):
    if not key:
        return [{'section':s['name'],'key':s['key'],'count':sum(len(f['ids']) for f in s['folders']),
                 'folders':[{'key':f['key'],'name':f['name'],'count':len(f['ids'])} for f in s['folders']]}
                for s in data.get('directory',{}).get('sections',[])]
    collection=next((c for c in data['directory'].get('collections',[]) if key in (c['key'],c['name'])),None)
    if collection:ids=collection['ids']
    else:
        group=next((s for s in data['directory']['sections'] if key in (s['key'],s['name'])),None)
        leaves=group['folders'] if group else [resolve(data,key)[1]]
        ids=list(dict.fromkeys(i for f in leaves for i in f['ids']+(f['related'] if include_related else [])))
    paths=by_id(data);rows={r['id']:r for r in data['entries']}
    return [row_card(data,rows[v],paths[v]) for v in ids]


def vocabulary(data):
    by_action={}
    for section,f in folders(data):
        words=' '.join([section['name'],f['name'],f['key'],*f['terms']])
        for ident in f['ids']+f['related']:by_action.setdefault(ident,[]).append(words)
    return {ident:' '.join(terms).casefold() for ident,terms in by_action.items()}


def markdown(data):
    validate(data)
    directory=data['directory'];entries={r['id']:r for r in data['entries']};sects=directory['sections']
    counted=sum(len(s['folders']) for s in sects)
    def link(i):return f'[#{i}](index.html#{i})'
    def cell(s):return str(s).replace('|','\\|').replace('\r',' ').replace('\n',' ')
    def page(**keys):return '<动作目录.html?'+urlencode(keys)+'>'
    lines=['# 口播动作目录','',f'{len(entries)} 个可选条目，{len(sects)} 个一级分类，{counted} 个二级分类。每个编号按主要剪辑用途归入一处。关联编号可从二级分类继续查找。','',
           '[浏览可筛选目录](<动作目录.html>) · [打开动态预览与选用](index.html) · [结构化索引](catalog.json) · [取用说明](<使用说明.md>)','',
           '剪辑窗口可以在本目录运行 `python -B -X utf8 入库.py get M052@J066` 读取动作、素材槽和来源。将示例编号换成选中的完整编号；导入本期工程用 `take`。','']
    for c in directory.get('collections',[]):
        entry=f'[{c["name"]} · {len(c["ids"])} 段，按原片时码查看]({page(collection=c["key"])})'
        if c.get('review'):entry+=' · [原片同步连播](<'+c['review']+'>)'
        lines.extend([entry,''])
    lines+=['## 分类导航','','| 剪辑任务 | 二级分类 | 主分类条目 |','| --- | --- | ---: |']
    for s in sects:
        sub='、'.join(f'[{f["name"]}](#dir-{f["key"]})' for f in s['folders'])
        lines.append(f'| [{s["name"]}](#sec-{s["key"]}) | {sub} | {sum(len(f["ids"]) for f in s["folders"])} |')
    for s in sects:
        lines+=['',f'<a id="sec-{s["key"]}"></a>','',f'## {s["name"]}','','[在网页中查看本类]('+page(section=s['key'])+')']
        for f in s['folders']:
            lines+=['',f'<a id="dir-{f["key"]}"></a>','',f'### {f["name"]}','','[打开此分类]('+page(folder=f['key'])+')',
                    '','| 编号与预览 | 动作 | 使用形式 | 画面变化与取用线索 |','| --- | --- | --- | --- |']
            for i in f['ids']:
                row=entries[i];notes=[cell(row['meaning'])]
                if row.get('baseIds'):notes.append('沿用 '+'、'.join(link(v) for v in row['baseIds']))
                for ref in row.get('references',[]):
                    film=data.get('referenceFilms',{}).get(ref['video'],{}).get('name',ref['video'])
                    notes.append(f'{cell(film)} {timecode(ref["start"])}–{timecode(ref["end"])}')
                lines.append(f'| {link(i)} | {cell(row["name"])} | {format_name(data,row)} | '+' · '.join(notes)+' |')
            if f['related']:lines+=['','其他分类中也用到这一下的动作　'+'、'.join(map(link,f['related']))]
    return ('\n'.join(lines)+'\n').encode('utf8')
