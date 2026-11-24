"""Search, take, and append motions in this offline editing library."""
import argparse
import base64
from contextlib import contextmanager
from functools import lru_cache
import hashlib
import html
import importlib.util
import io
import json
import mimetypes
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time


ROOT=Path(__file__).resolve().parent
SHARED='packs/editing/'
LOCK='.motion-edit.lock'

@lru_cache(maxsize=1)
def directory_tools():
    spec=importlib.util.spec_from_file_location('editorial_motion_directory',ROOT/'motion_directory.py')
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    return mod


def read(p):return json.loads(p.read_bytes())
def formatted(obj):return (json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode('utf8')
def dump_js(obj):return json.dumps(obj,ensure_ascii=False,separators=(',',':'))
def read_js(p):return json.loads(p.read_text(encoding='utf8').split('=',1)[1].strip().removesuffix(';'))
def safe_json(obj):return dump_js(obj).replace('<','\\u003c')
def digest(raw):return hashlib.sha256(raw).hexdigest()


def atomic(path,raw):
    path.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent,delete=False) as f:
        tmp=Path(f.name);f.write(raw)
    try:os.replace(tmp,path)
    finally:tmp.unlink(missing_ok=True)


@contextmanager
def locked(root):
    with (root/LOCK).open('a+b') as f:
        if f.tell()==0:f.write(b'0');f.flush()
        if os.name=='nt':
            import msvcrt
            deadline=time.monotonic()+100
            while True:
                f.seek(0)
                try:msvcrt.locking(f.fileno(),msvcrt.LK_NBLCK,1);break
                except OSError:
                    if time.monotonic()>deadline:raise TimeoutError('其他剪辑工程正在更新动作库。')
                    time.sleep(.12)
            try:yield
            finally:f.seek(0);msvcrt.locking(f.fileno(),msvcrt.LK_UNLCK,1)
        else:
            import fcntl
            fcntl.flock(f,fcntl.LOCK_EX)
            try:yield
            finally:fcntl.flock(f,fcntl.LOCK_UN)


def select(data,ident):
    match=re.fullmatch(r'#?([Mm]?)(\d+)(@[A-Za-z][A-Za-z0-9_-]*)?',str(ident).strip())
    if not match:raise ValueError('无效编号 '+str(ident))
    key=match[1].upper()+match[2].zfill(3)+(match[3] or '').upper()
    row=next((r for r in data['entries'] if r['id']==key),None)
    if row is None:raise ValueError('库内没有 #'+key)
    return row


def scripts_for(root,row):
    def file(path):return (root/path).read_text(encoding='utf8')
    r=row.get('engine')
    snippets=[file('runtime.js')]
    if not r:
        snippets.append(file(row['code']))
    elif r=='scene':
        for name in ['motion-core.js','agent-editorial.js','current-ui.js','scene-runtime.js','member-batch1.js','member-batch2.js','member-batch3.js']:
            snippets.append(file(SHARED+name))
        graph=read(root/row['code']);all_media=read_js(root/SHARED/'materials.js')
        snippets+=['window.MotionScenePrograms='+safe_json({row['id']:graph})+';',
                   'window.MotionSceneMedia='+safe_json({k:all_media[k] for k in graph['assets'].values()})+';']
    elif r=='dom':
        snippets.extend(file(SHARED+n) for n in ('semantic-motion.js','demo-fixtures.js','dom-theme.js'))
    elif r=='reference':
        prefix='packs/portraits/'
        spec=read(root/row['code'])
        snippets.extend(file(prefix+n) for n in ('ui-definitions.js','media.js','ui-components.js','theme.js'))
        machine=read_js(root/prefix/'machine.js')
        keys={l['strip'] for l in spec['layers'] if l['kind']=='live'}
        snippets+=['window.PortraitPrograms='+safe_json({row['id']:spec})+';',
                   'window.PortraitMachine='+safe_json({'originals':{},'strips':{k:machine['strips'][k] for k in keys if k in machine['strips']}})+';']
    if r:snippets.append(file(SHARED+'adapter.js'))
    if r=='reference':snippets.append(file('packs/portraits/portrait-runtime.js'))
    if r=='project':snippets.append(file(row['code']))
    snippets.append(file('player.js'))
    return snippets


def program_hash(snippets):
    return digest('\0'.join(snippets).encode('utf8'))


def missing_unicode_ranges(cmap):
    ranges=[];start=0
    for code in sorted(cmap)+[0x110000]:
        if start<code:
            ranges.append(f'U+{start:X}' if start==code-1 else f'U+{start:X}-{code-1:X}')
        start=code+1
    return ','.join(ranges)


def full_font_path(root):
    local=root/'定稿全字库.ttf'
    return local if local.is_file() else root.parent/'modules/director/assets/studio/fonts/NotoSansSC.ttf'


def shot_font(root,options):
    compact=root/'定稿字体.woff2'
    full=full_font_path(root)
    if not full.is_file():
        return 'woff2','woff2',compact.read_bytes(),None
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
    except ImportError:
        return 'ttf','truetype',full.read_bytes(),None
    words=json.dumps([options.get('inputs',{}),options.get('text',{})],ensure_ascii=False)
    needed={ord(ch) for ch in words if ord(ch)>31}
    with TTFont(compact) as font:
        base=set(font.getBestCmap())
    if needed<=base:
        return 'woff2','woff2',compact.read_bytes(),missing_unicode_ranges(base)
    with TTFont(full) as font:
        extra=(needed-base)&set(font.getBestCmap())
        if not extra:return 'woff2','woff2',compact.read_bytes(),missing_unicode_ranges(base)
        config=subset.Options();config.layout_features=['kern','liga','ccmp','locl']
        carve=subset.Subsetter(options=config);carve.populate(unicodes=base|extra);carve.subset(font)
        buffer=io.BytesIO();font.flavor='woff2';font.save(buffer)
        return 'woff2','woff2',buffer.getvalue(),missing_unicode_ranges(base|extra)


def export_page(root,row,options,out):
    if out.exists() and any(out.iterdir()):
        raise ValueError('目标文件夹已含文件。可直接编辑原绑定文件，或选一个新的镜头目录。')
    snippets=scripts_for(root,row)
    miniature={'entries':[row],'packs':[{'id':row['pack']}],'localScripts':[]}
    scripts=['window.MOTION_CATALOG='+safe_json(miniature)+';',*snippets]
    html_scripts='\n'.join('<script>'+re.sub(r'</script',r'<\\/script',s,flags=re.I)+'</script>' for s in scripts)
    subtype,fmt,font_data,other_ranges=shot_font(root,options)
    font=base64.b64encode(font_data).decode('ascii')
    full_font=full_font_path(root)
    fallback=("@font-face{font-family:MotionCatalogSC;src:url('"+full_font.resolve().as_uri()+"') format('truetype');font-weight:100 900;unicode-range:"+other_ranges+"}" if other_ranges else '')
    title=html.escape('#'+row['id']+' '+row['name'])
    page="""<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title><style>
__FALLBACK__@font-face{font-family:MotionCatalogSC;src:url(data:font/__SUBTYPE__;base64,__FONT__) format('__FORMAT__');font-weight:100 900}
*{box-sizing:border-box}body{font:550 16px MotionCatalogSC,sans-serif;margin:0;color:#0b0b0f}main{max-width:1000px;margin:auto;padding:22px}h1{font-size:25px}#box{width:100%;overflow:hidden;position:relative;border-radius:8px}#box>canvas,#box>div{display:block;width:100%;height:auto;overflow:hidden;position:relative}.bar{display:flex;align-items:center;gap:12px;margin-top:16px}input{flex:1}button{cursor:pointer;padding:5px 15px;font:inherit;border:2px solid #0b0b0f;background:white;border-radius:7px}output{font-variant-numeric:tabular-nums}
</style><main><h1>__TITLE__</h1><div id="box"></div><div class="bar"><button id="play">播放</button><input aria-label="时间" id="track" type="range" min="0" step=".001"><output id="readout"></output></div></main>
<script src="绑定.js"></script>__SCRIPTS__<script>
const row=MOTION_CATALOG.entries[0],box=document.getElementById('box');
let instance,frame,pos=0,playing=false,last=null;
const track=document.getElementById('track'),button=document.getElementById('play');
window.ready=(async()=>{await MotionEdition.ready;instance=await MotionEdition.bind(row.id,window.SHOT_BINDING||{});
 const p=MotionPrompt.packs[row.pack],w=row.width||p.width,h=row.height||p.height;
 frame=document.createElement(MotionEdition.isDom(row)?'div':'canvas');frame.style.aspectRatio=w+'/'+h;
 if(frame.tagName==='CANVAS'){frame.width=w;frame.height=h;}box.append(frame);track.max=instance.duration;
 window.seek=t=>{pos=Math.max(0,Math.min(instance.duration,Number(t)));instance.seek(frame,pos);track.value=pos;document.getElementById('readout').value=pos.toFixed(2)+' s';return pos;};
 window.seek(0);return true;})().catch(e=>{box.textContent=e.message;throw e;});
track.oninput=()=>{playing=false;button.textContent='播放';window.seek(track.value);};
button.onclick=async()=>{await window.ready;if(pos>=instance.duration-.001)window.seek(0);playing=!playing;button.textContent=playing?'暂停':'播放';last=performance.now();};
function tick(now){if(playing){window.seek(pos+(now-last)/1000);if(pos>=instance.duration){playing=false;button.textContent='播放';}}last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);
</script></html>"""
    payload=page.replace('__TITLE__',title).replace('__FALLBACK__',fallback).replace('__SUBTYPE__',subtype).replace('__FORMAT__',fmt).replace('__FONT__',font).replace('__SCRIPTS__',html_scripts)
    out.mkdir(parents=True,exist_ok=True)
    atomic(out/'绑定.js',('window.SHOT_BINDING='+json.dumps(options,ensure_ascii=False,indent=2)+';\n').encode())
    duration=row.get('duration') or read(root/'catalog.json')['upstreamCycles'][row['pack']]
    metadata={'id':row['id'],'name':row['name'],'sourceKey':row.get('sourceKey',row.get('source')),
              'implementation':row['code'],'implementation_sha256':digest((root/row['code']).read_bytes()),
              'program_sha256':program_hash(snippets),'page_sha256':digest(payload.encode('utf8')),
              'binding_sha256':digest((out/'绑定.js').read_bytes()),
              'duration':duration,'binding':'绑定.js','preview':'动作.html'}
    if row.get('engine')=='reference':
        metadata.update(size=[row['width'],row['height']],references=row['references'],components=row['components'],mediaSlots=row['slotLabels'])
    elif row.get('adaptation')=='portrait':
        metadata.update(size=[row['width'],row['height']],references=row.get('references',[]),
                        mediaSlots=row.get('mediaSlots',[]),videoSlots=row.get('videoSlots',[]))
    if row.get('baseIds'):metadata.update(baseIds=row['baseIds'],variant=row['variant'],missing=row['missing'])
    atomic(out/'动作来源.json',formatted(metadata))
    notices=[(root/'字体授权.txt').read_text(encoding='utf8')]
    if not row.get('engine'):
        notices += [(root/'LICENSE').read_text(encoding='utf8'),(root/'THIRD-PARTY-NOTICES.md').read_text(encoding='utf8')]
    else:
        notices.append((root/SHARED/'出处与素材.md').read_text(encoding='utf8'))
        if row.get('origin'):notices.append('来源　'+row['origin'])
        if row.get('engine')=='reference':notices.append((root/'packs/portraits/来源与使用.md').read_text(encoding='utf8'))
    atomic(out/'许可.txt','\n\n'.join(notices).encode('utf8'))
    atomic(out/'动作.html',payload.encode('utf8'))
    return {'id':row['id'],'preview':str(out/'动作.html'),'binding':str(out/'绑定.js')}


def browser_executable():
    return next((p for p in (os.environ.get('MOTION_BROWSER'),shutil.which('msedge'),shutil.which('chrome'),
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe') if p and Path(p).is_file()),None)


def render_shot(shot,out,fps=30,width=1080,seconds=None):
    from playwright.sync_api import sync_playwright
    if not 1<=fps<=60 or not 32<=width<=4096 or width%2:raise ValueError('渲染宽度须为 32–4096 的偶数，帧率为 1–60。')
    if seconds is not None and not (0<seconds<=3600):raise ValueError('镜头时长须在一小时内。')
    if out.exists():raise ValueError('目标影片已存在，请使用新的名称。')
    if out.suffix.lower()!='.mp4':raise ValueError('影片输出请使用 .mp4。')
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.motion-render-',dir=out.parent) as temporary, sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=browser_executable())
        page=browser.new_page(viewport={'width':width,'height':720},device_scale_factor=1)
        page.add_init_script('window.MOTION_EXPORT=true;')
        page.route(re.compile('^https?://'),lambda route:route.abort())
        page.goto((shot/'动作.html').resolve().as_uri());page.evaluate('window.ready')
        native=page.evaluate("""()=>{const r=MOTION_CATALOG.entries[0],p=MotionPrompt.packs[r.pack];
          return [r.width||p.width,r.height||p.height,MotionEdition.cycle(r)];}""")
        height=max(2,round(width*native[1]/native[0]/2)*2)
        page.set_viewport_size({'width':width,'height':height})
        page.add_style_tag(content='body,main,#box{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;max-width:none!important}h1,.bar{display:none!important}#box{position:fixed;inset:0}#box>*{width:100%!important;height:100%!important}')
        canvas=page.evaluate("""([w,h])=>{const c=document.querySelector('#box canvas');if(c){c.width=w;c.height=h;}return !!c;}""",[width,height])
        frames=max(1,round((seconds or native[2])*fps))
        target=Path(temporary)/'picture.mp4'
        ffmpeg=shutil.which('ffmpeg') or 'ffmpeg'
        command=[ffmpeg,'-nostdin','-hide_banner','-loglevel','error','-framerate',str(fps),'-f','image2pipe','-c:v','png',
                 '-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',str(target)]
        with tempfile.TemporaryFile() as log:
            encoder=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=log)
            try:
                for i in range(frames):
                    stamp=min(native[2],i*native[2]/max(1,frames-1))
                    if canvas:
                        body=page.evaluate("""t=>{window.seek(t);return document.querySelector('#box canvas').toDataURL('image/png').split(',')[1];}""",stamp)
                        image=base64.b64decode(body)
                    else:
                        page.evaluate('async t=>{window.seek(t);await window.portraitFrameReady;}',stamp);image=page.locator('#box').screenshot()
                    encoder.stdin.write(image)
                encoder.stdin.close()
                if encoder.wait():log.seek(0);raise ValueError(log.read().decode('utf8','replace')[-1000:])
            finally:
                if encoder.poll() is None:encoder.kill();encoder.wait()
                if not encoder.stdin.closed:encoder.stdin.close()
                browser.close()
        if out.exists():raise ValueError('渲染期间目标影片已由另一工程创建。')
        if os.name=='nt':os.rename(target,out)
        else:os.link(target,out)
    return {'video':str(out),'frames':frames,'fps':fps,'seconds':frames/fps,'size':[width,height]}


def register_script(row,source):
    # The original project function is kept verbatim; the wrapper supplies timing and project bindings.
    js_source=source.strip().removesuffix(';')
    start="""(() => {
const row=__ROW__;
const action=(__ACTION__);
const p=MotionPrompt.packs[row.pack] || MotionPrompt.pack(row.pack,()=>({width:1280,height:720,cycle:row.duration,cells:[],mounts:[]}));
p.cycle=Math.max(p.cycle,row.duration);
if (row.presentation==='dom') p.mounts[row.cell]=(host,binding={})=>action(host,{...binding,inputs:{...row.defaults,...binding.inputs}});
else p.cells[row.cell]=(ctx,w,h,t,inputs,assets)=>action(ctx,w,h,t,{...row.defaults,...inputs},assets||{});
})();"""
    info={k:row[k] for k in ('id','pack','cell','duration','presentation','defaults')}
    return start.replace('__ROW__',safe_json(info)).replace('__ACTION__',js_source).encode('utf8')


def inspect_candidate(path):
    desc=read(path);base=path.resolve().parent
    for key in ('key','name','meaning','file'):
        if not isinstance(desc.get(key),str) or not desc[key].strip():raise ValueError('缺少 '+key)
    src=(base/desc['file']).resolve()
    if not src.is_relative_to(base) or src.suffix.lower()!='.js':raise ValueError('file 应是本动作目录中的 JS 文件。')
    size=[desc.get(k) for k in ('duration','width','height')]
    if not all(isinstance(x,(int,float)) and 0<x<100000 for x in size):raise ValueError('时长和画幅需为正数。')
    if int(size[1])!=size[1] or int(size[2])!=size[2]:raise ValueError('画幅应使用整数像素。')
    if desc.get('engine','canvas') not in ('canvas','dom'):raise ValueError('engine 可选 canvas 或 dom。')
    if not isinstance(desc.get('inputs',{}),dict):raise ValueError('inputs 需要为字段对象。')
    source=src.read_text(encoding='utf-8-sig').replace('\r\n','\n').strip()
    return desc,source,digest((desc.get('engine','canvas')+'\n'+source).encode('utf8'))


def test_candidate(root,row,code):
    from playwright.sync_api import sync_playwright
    executable=browser_executable()
    with tempfile.TemporaryDirectory(prefix='motion-preview-') as temp:
        file=Path(temp)/'test.html'
        file.write_text('<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0}#f{display:block;position:relative;overflow:hidden}</style>'+
            '<script src="'+(root/'runtime.js').as_uri()+'"></script><script>'+
            re.sub(r'</script',r'<\\/script',code.decode(),flags=re.I)+'</script>',encoding='utf8')
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path=executable)
            page=browser.new_page(viewport={'width':720,'height':720},reduced_motion='reduce')
            page.route(re.compile('^https?://'),lambda route:route.abort())
            page.goto(file.as_uri())
            page.evaluate("""async r=>{const p=MotionPrompt.packs[r.pack];await p.ready;let f,ctl;
              if(r.presentation==='dom'){f=document.createElement('div');Object.assign(f.style,{width:r.width+'px',height:r.height+'px',transformOrigin:'0 0'});
                document.body.append(f);ctl=p.mounts[r.cell](f,{});window.testAt=t=>ctl.seek(t);}
              else{f=document.createElement('canvas');f.width=r.width;f.height=r.height;document.body.append(f);
                const c=r.variant?f.getContext('2d',{willReadFrequently:true}):f.getContext('2d');window.testAt=t=>{c.save();try{c.clearRect(0,0,f.width,f.height);p.cells[r.cell](c,f.width,f.height,t);}finally{c.restore();}};}
              f.id='f';f.style.transform='scale('+Math.min(1,600/r.width,620/r.height)+')';}""",row)
            hashes=[]
            for phase in (.09,.31,.57,.84,.31):
                page.evaluate('async t=>{await window.testAt(t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}',row['duration']*phase)
                hashes.append(digest(page.locator('#f').screenshot()))
            browser.close()
            if len(set(hashes[:4]))<2:raise ValueError('试播未看到画面变化；源文件留在本期工程。')
            if hashes[1]!=hashes[-1]:raise ValueError('回拖到同一时刻时画面不一致；可修改后再次入库。')


def attach_references(data,row,desc):
    refs=desc.get('references',[])
    if not refs:return False
    if not isinstance(refs,list):raise ValueError('references 填写片名编号、起点、终点的数组')
    films=data.setdefault('referenceFilms',{})
    for f in desc.get('sourceFilms',[]):
        if f.get('id') and f.get('name') and f['id'] not in films:
            films[f['id']]={'id':f['id'],'name':f['name'],'scope':f.get('scope','本期参考'),
                'duration':f.get('duration'),'allowed':f.get('allowed',[]),'historical':False,
                'evidence':f.get('evidence','本期原片记录'),'status':'待转镜头','componentIds':[],'portraitIds':[]}
    is_template=desc.get('adaptation',row.get('adaptation'))=='portrait'
    if is_template and (not row.get('width') or row['width']*16!=row.get('height',0)*9):raise ValueError('竖屏镜头的原始画幅应为 9:16')
    touched=False
    for f in refs:
        film=films.get(f['video']);a=f['start'];b=f['end']
        if not film or not isinstance(a,(int,float)) or not isinstance(b,(int,float)) or not 0<=a<b:raise ValueError('请登记参考片及有效的起止秒数。')
        if film.get('duration') and b>film['duration']+.1:raise ValueError('片段超出参考片时长。')
        if film.get('historical') or film.get('allowed') and not any(x<=a<b<=y+.1 for x,y in film['allowed']):raise ValueError('片段超出已登记的参考范围。')
        if f not in row.setdefault('references',[]):row['references'].append(f);touched=True
        ids=film['portraitIds' if is_template else 'componentIds']
        if row['id'] not in ids:ids.append(row['id']);touched=True
        if is_template and film['status']=='待转镜头':film['status']='随剪辑入库'
    if is_template:row['adaptation']='portrait'
    return touched

def save_reference_update(root,data):
    writes={root/'catalog.json':formatted(data),root/'catalog.js':('window.MOTION_CATALOG='+dump_js(data)+';\n').encode('utf8')}
    if data.get('directory'):writes[root/'动作目录.md']=directory_tools().markdown(data)
    previous={p:p.read_bytes() if p.is_file() else None for p in writes}
    changed=[]
    try:
        for file,raw in writes.items():
            if previous[file]!=raw:atomic(file,raw);changed.append(file)
    except BaseException:
        for file in reversed(changed):
            if previous[file] is None:file.unlink(missing_ok=True)
            else:atomic(file,previous[file])
        raise

def add(root,path):
    with locked(root):
        cat=root/'catalog.json';offline=root/'catalog.js';data=read(cat)
        canonical=('window.MOTION_CATALOG='+dump_js(data)+';\n').encode('utf8')
        if not offline.is_file() or offline.read_bytes()!=canonical:atomic(offline,canonical)
        request=read(path)
        if request.get('reuseId'):
            r=select(data,request['reuseId'])
            if attach_references(data,r,request):save_reference_update(root,data)
            return {'id':r['id'],'status':'reused','name':r['name']}
        desc,source,source_hash=inspect_candidate(path)
        key='project:'+desc['key']
        for r in data['entries']:
            if r.get('sourceKey')==key and r.get('codeHash')!=source_hash:
                raise ValueError('同一来源已有 #'+r['id']+'。若为新的动作机制，请给它独立的 key。')
            if r.get('codeHash')==source_hash:
                if attach_references(data,r,desc):save_reference_update(root,data)
                return {'id':r['id'],'status':'reused','name':r['name']}
        uses=desc.get('uses')
        if not isinstance(uses,list) or not uses or not all(u in data['groups'] for u in uses):raise ValueError('uses 请选择目录内的口播用途。')
        number=max([int(r['id'][1:]) for r in data['entries'] if re.fullmatch(r'M\d+',r['id'])] or [0])+1
        ident='M'+str(number).zfill(3)
        bases=desc.get('baseIds',[])
        if bases or desc.get('variant'):
            suffix=desc.get('variant','')
            if not isinstance(bases,list) or not bases or len(set(bases))!=len(bases) or not re.fullmatch('[A-Z][A-Z0-9_-]*',suffix):
                raise ValueError('编号变体需要原动作编号及唯一标记。')
            if any('@' in k or select(data,k)['id']!=k for k in bases):raise ValueError('需要规范的原动作编号。')
            ident=bases[0]+'@'+suffix
            if any(r['id']==ident for r in data['entries']):raise ValueError('此编号变体已登记 '+ident)
        pack='edit-project';loc='packs/projects/'+ident+'.js'
        project=path.resolve().parent.parent.parent
        row={'id':ident,'pack':pack,'cell':sum(r['pack']==pack for r in data['entries']),
             'code':loc,'name':desc['name'],'en':'','meaning':desc['meaning'],'category':'本期剪辑沉淀','uses':uses,
             'binding':desc.get('binding',desc['meaning']),'prompt':desc['meaning'],'upstreamSpec':desc.get('timing',[]),
             'source':loc,'origin':desc.get('credit','本期剪辑工程'),'sourceKey':key,'codeHash':source_hash,
             'duration':desc['duration'],'width':desc['width'],'height':desc['height'],'defaults':desc.get('inputs',{}),
             'mediaSlots':desc.get('mediaSlots',[]),'engine':'project','presentation':desc.get('engine','canvas'),
             'batch':'project-'+digest(os.path.normcase(str(project)).encode('utf8'))[:16]}
        if bases:
            row.update(baseIds=bases,variant=desc['variant'],missing=desc['missing'],category='原编号的参考片变体')
        if not isinstance(row['upstreamSpec'],list) or not all(isinstance(x,str) for x in row['upstreamSpec']):
            raise ValueError('timing 应为时间描述列表。')
        if not isinstance(row['mediaSlots'],list) or not all(isinstance(x,str) for x in row['mediaSlots']):
            raise ValueError('mediaSlots 应为素材槽名称列表。')
        if desc.get('videoSlots'):
            slots=desc['videoSlots']
            if not isinstance(slots,list) or not all(s in row['mediaSlots'] for s in slots):
                raise ValueError('视频槽需要同时登记在 mediaSlots 中。')
            row['videoSlots']=slots
        attach_references(data,row,desc)
        folder=directory_tools().assign(data,row,desc.get('directory')) if data.get('directory') else None
        code=register_script(row,source)
        test_candidate(root,row,code)
        if not any(p['id']==pack for p in data['packs']):data['packs'].append({'id':pack,'name':'本期剪辑沉淀','scope':'editing'})
        data['entries'].append(row);data['localScripts'].append(loc);data['currentBatch']=row['batch']
        old_code=(root/loc).read_bytes() if (root/loc).is_file() else None
        atomic(root/loc,code)
        try:save_reference_update(root,data)
        except BaseException:
            if old_code is None:(root/loc).unlink(missing_ok=True)
            else:atomic(root/loc,old_code)
            raise
        result={'id':ident,'status':'added','name':row['name']}
        if folder:result['folder']=folder['name']
        return result


def collect(root,project):
    folder=project/'motion-additions'
    result={'added':[],'reused':[],'pending':[]}
    for path in sorted(folder.glob('*/motion.json')):
        try:
            item=add(root,path);result[item['status']].append(item)
            receipt=path.parent/'motion-receipt.json'
            raw=formatted({'id':item['id'],'library':str(root/'index.html')})
            if not receipt.exists() or receipt.read_bytes()!=raw:atomic(receipt,raw)
        except Exception as exc:result['pending'].append({'file':str(path),'reason':str(exc)})
    return result


def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--library',type=Path,default=ROOT)
    sub=ap.add_subparsers(dest='action',required=True)
    q=sub.add_parser('search');q.add_argument('query');q.add_argument('--limit',type=int,default=16)
    q.add_argument('--folder',help='限定一级、二级分类或专题')
    directory=sub.add_parser('directory');directory.add_argument('key',nargs='?');directory.add_argument('--related',action='store_true')
    classify=sub.add_parser('classify');classify.add_argument('id');classify.add_argument('folder')
    get=sub.add_parser('get');get.add_argument('id')
    take=sub.add_parser('take');take.add_argument('id');take.add_argument('--out',type=Path,required=True);take.add_argument('--bind',type=Path)
    render=sub.add_parser('render');render.add_argument('--shot',type=Path,required=True);render.add_argument('--out',type=Path,required=True)
    render.add_argument('--fps',type=int,default=30);render.add_argument('--width',type=int,default=1080);render.add_argument('--seconds',type=float)
    reg=sub.add_parser('add');reg.add_argument('manifest',type=Path)
    scan=sub.add_parser('collect');scan.add_argument('--project',type=Path,required=True)
    args=ap.parse_args();root=args.library.resolve()
    data=read(root/'catalog.json')
    if args.action=='search':
        terms=args.query.casefold().split()
        vocab=directory_tools().vocabulary(data) if data.get('directory') else {}
        subset={r['id'] for r in directory_tools().listing(data,args.folder)} if args.folder else None
        def keywords(r):
            film=[data.get('referenceFilms',{}).get(f['video'],{}).get('name',f['video']) for f in r.get('references',[])]
            return ' '.join([r['id'],r['name'],r['en'],r['meaning'],r['category'],r.get('variant',''),r.get('missing',''),*r.get('baseIds',[]),*r['uses'],*film,vocab.get(r['id'],'')]).casefold()
        hits=[r for r in data['entries'] if (subset is None or r['id'] in subset) and all(t.lstrip('#') in keywords(r) for t in terms)]
        exact=args.query.lstrip('#').casefold()
        hits.sort(key=lambda r:(r['id'].casefold()!=exact,not any(t in r['name'].casefold() for t in terms),r.get('adaptation')!='portrait'))
        result=[{k:r[k] for k in ('id','name','meaning')} for r in hits[:args.limit]]
    elif args.action=='directory':result=directory_tools().listing(data,args.key,args.related)
    elif args.action=='classify':
        with locked(root):
            data=read(root/'catalog.json')
            if 'directory' not in data:raise ValueError('此库尚未建立分类目录。')
            row=select(data,args.id);folder=directory_tools().assign(data,row,args.folder)
            save_reference_update(root,data);result={'id':row['id'],'folder':folder['name'],'key':folder['key']}
    elif args.action=='get':result=select(data,args.id)
    elif args.action=='render':result=render_shot(args.shot,args.out.resolve(),args.fps,args.width,args.seconds)
    elif args.action=='take':
        row=select(data,args.id);initial={'inputs':row.get('defaults',{}),'assets':{},'text':{}}
        if args.bind:
            initial.update(read(args.bind))
            for slot,value in initial.get('assets',{}).items():
                if isinstance(value,str) and not value.startswith(('data:','https:','http:','file:')):
                    path=(args.bind.resolve().parent/value).resolve()
                    if not path.is_file():raise ValueError('找不到绑定的图片 '+str(path))
                    kind=mimetypes.guess_type(path.name)[0]
                    allowed=['image/']
                    if slot in row.get('videoSlots',[]):allowed.append('video/')
                    if row.get('engine')=='reference' and any(l.get('slot')==slot and l['kind']=='live' for l in read(root/row['code'])['layers']):allowed.append('video/')
                    if not kind or not kind.startswith(tuple(allowed)):raise ValueError('素材的格式与所选槽位不符 '+str(path))
                    initial['assets'][slot]='data:'+kind+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
        result=export_page(root,row,initial,args.out.resolve())
    elif args.action=='add':result=add(root,args.manifest.resolve())
    else:result=collect(root,args.project.resolve())
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
