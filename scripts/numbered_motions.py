"""Use a numbered action from the same offline catalog the editor bookmarks."""
import base64
import hashlib
import importlib.util
import json
import mimetypes
from pathlib import Path
import re

from style_registry import confirmed_workflow, ROOT


def number(value):
    match=re.fullmatch(r'#?([Mm]?)(\d+)(@[A-Za-z][A-Za-z0-9_-]*)?',str(value).strip())
    return match[1].upper()+match[2].zfill(3)+(match[3] or '').upper() if match else None


def tools_for(root=ROOT):
    settings=confirmed_workflow(root)['motion_library']
    folder=Path(settings['catalog']).parent
    # Older personal catalogs can use the current portable exporter without migrating their files.
    for script in dict.fromkeys((Path(settings['intake']),Path(root)/'assets/motion-prompt/入库.py')):
        if script.is_file():
            spec=importlib.util.spec_from_file_location('episode_motion_intake',script)
            mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
            if hasattr(mod,'program_hash'):return mod,folder
    raise ValueError('动作库缺少可校验的取用程序，请补齐随 Skill 分发的 assets/motion-prompt/入库.py。')


def card(ident, root=ROOT):
    api,folder=tools_for(root)
    data=api.read(folder/'catalog.json')
    row=api.select(data,ident)
    duration=row.get('duration') or data['upstreamCycles'][row['pack']]
    ref={'motion_id':row['id'],'path':str(folder/'index.html')+'#'+row['id'],'basis':'replay',
         'label':'动作库 #'+row['id']+' '+row['name'],'range':[0,duration],'suggested_seconds':[0,duration]}
    result={'id':row['id'],'title':row['name'],'explains':row['meaning'],'change':row['binding'],
            'inputs':row.get('defaults',{}),'material_slots':row.get('mediaSlots',[]),'motion_id':row['id'],
            'base_ids':row.get('baseIds',[]),'reference_variant':row.get('variant'),'added_action':row.get('missing'),
            'timing_steps':row.get('upstreamSpec',[]),'verified_order':row.get('verifiedOrder',[]),
            'mechanism':row.get('sourceKey') or 'motion-prompt:'+row['id'],'implementation':str(folder/row['code']),
            'continuous_example':ref,'source_intervals':[{**f,'title':data.get('referenceFilms',{}).get(f['video'],{}).get('name',f['video'])} for f in row.get('references',[])],
            'portrait_template':row.get('adaptation')=='portrait','native_size':[row.get('width'),row.get('height')],
            'ui_components':row.get('components',[]),'slot_labels':row.get('slotLabels',{}) or {s:s for s in row.get('mediaSlots',[])},'audition':'direct -- watch 指定本镜头与编号',
            'apply':'direct -- trial 使用本镜头 motion 字段中的文字、数字及图片绑定。'}
    if data.get('directory'):
        section,leaf=api.directory_tools().by_id(data)[row['id']]
        result['directory']={'section':section['name'],'folder':leaf['name'],'key':leaf['key']}
    if row.get('projectMediaSlots'):
        result['project_media_to_bind']=row['projectMediaSlots']
    return result


def editable(parent,ident,bindings,project):
    api,library=tools_for()
    row=api.select(api.read(library/'catalog.json'),ident)
    options={'inputs':row.get('defaults',{}),'assets':{},'text':{},**(bindings or {})}
    options['assets']=dict(options['assets'])
    index=project/options.pop('material_index','materials-bindings.json')
    materials=[]
    recipe=api.read(library/row['code']) if row.get('engine')=='reference' else {}
    videos=set(row.get('videoSlots',[])) | {l['slot'] for l in recipe.get('layers',[]) if l['kind']=='live'}
    for slot,value in options.get('assets',{}).items():
        if isinstance(value,dict) and 'material_id' in value:
            from material_sourcing import bound_file
            value=str(bound_file(index,value['material_id'],project))
            if index not in materials:materials.append(index)
        if not isinstance(value,str):raise ValueError('图片槽需填写本期图片路径。')
        if value.startswith('data:image/') or (slot in videos and value.startswith('data:video/')):continue
        path=(project/value).resolve(strict=True)
        kind=mimetypes.guess_type(path.name)[0]
        if not kind or not (kind.startswith('image/') or slot in videos and kind.startswith('video/')):raise ValueError('素材与本镜头槽位不符 '+str(path))
        options['assets'][slot]='data:'+kind+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
        materials.append(path)
    program=api.program_hash(api.scripts_for(library,row))
    key=hashlib.sha256(json.dumps([row['id'],options,program],
        ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
    dest=parent/(row['id']+'-'+key)
    stem=dest.name;version=1
    binding=('window.SHOT_BINDING='+json.dumps(options,ensure_ascii=False,indent=2)+';\n').encode()
    while dest.exists():
        try:
            origin=api.read(dest/'动作来源.json')
            if (origin['id']==row['id'] and origin['program_sha256']==program and
                    origin['page_sha256']==api.digest((dest/'动作.html').read_bytes()) and
                    origin['binding_sha256']==api.digest(binding)==api.digest((dest/'绑定.js').read_bytes())):
                return api,dest,materials
        except (OSError,KeyError,ValueError):
            pass
        # Preserve an editor's hand-modified or interrupted take when restoring the library version.
        version+=1;dest=parent/(stem+'-'+str(version))
    api.export_page(library,row,options,dest)
    return api,dest,materials


def reference(project,ident):
    api,shot,_=editable(project/'editorial/references/motions',ident,{},project)
    movie=shot/'参考.mp4'
    if not movie.is_file():api.render_shot(shot,movie,fps=15,width=640)
    return movie


def picture(project,folder,temp,ident,bindings,fps,width,height,seconds):
    from episode_media import ff
    api,shot,materials=editable(folder/'motions',ident,bindings,project)
    silent=temp/'picture.mp4'
    native=temp/'native.mp4'
    report=api.render_shot(shot,native,fps=fps,width=width,seconds=seconds)
    if report['size']==[width,height]:
        native.replace(silent)
    else:
        ff('-i',native,'-an','-vf',f'scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1',
           '-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p',silent)
    return silent,shot/'动作.html',[shot/'动作.html',shot/'绑定.js',shot/'动作来源.json',*materials]
