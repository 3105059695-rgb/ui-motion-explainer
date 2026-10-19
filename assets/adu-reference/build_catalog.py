from pathlib import Path
import ast, hashlib, importlib.util, json, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SRC = ROOT/'source'
def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

def audio_library():
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('adu_audio', SRC/'scripts/audiolib.py')
    A = importlib.util.module_from_spec(spec); spec.loader.exec_module(A)
    folder = ROOT/'preview/audio'; folder.mkdir(parents=True, exist_ok=True)
    posters = ROOT/'posters'; posters.mkdir(exist_ok=True)
    code = (SRC/'scripts/audiolib.py').read_text(encoding='utf-8')
    tree = ast.parse(code)
    functions = {n.name:n for n in tree.body if isinstance(n, ast.FunctionDef)}
    lines = code.splitlines()
    names = {'whoosh':'转场气流','pop':'弹出','hit':'重击','ding':'提示铃','click':'点击','boing':'弹簧','err':'错误提示','win_pop':'窗口弹出','glitch':'故障噪声','crash':'撞击','bsod':'蓝屏','flap':'振翅','chirp':'鸟鸣','squawk':'鸣叫','peck':'啄击','land':'落地','rise':'上升','notif':'通知','bubble_pop':'气泡破裂','dock':'停靠','coin':'金币','agent':'智能体','hum':'低频嗡鸣','powerdown':'关机','snore':'呼噜','slide':'滑动','record_scratch':'唱片刹停','steps':'脚步','swoosh':'快速掠过','typing':'键盘打字','tick_run':'连续滴答','counter':'数字滚动','game_bleeps':'游戏提示','creak':'吱呀','sparkle':'闪光','chime':'风铃','write':'书写','thud':'闷响','msg':'消息','check':'勾选','stamp':'盖章','marker':'标记','achieve':'成就','key_thock':'按键','tick':'单次滴答','swipe':'划动','card':'卡片滑入','clock':'时钟','crack':'裂开','alert':'警报','scroll':'滚动','suck':'吸入','enter':'回车','fall':'下落','rep':'重复冲击','slash':'划线','shine':'高光','fill':'填充','type':'快速输入','crt':'显像管','hdd':'硬盘','dissolve':'消散','fill_up':'递增填充','bleeps':'电子提示','levelup':'升级','ff':'快进','jump':'跳跃','rise_s':'短上升'}
    records = []; waves = {}; failures = []
    recipes = [(k,names.get(k,k),lambda k=k:A.GEN[k]({'d':1.2,'n':0}),k) for k in A.GEN]
    instruments = [('kick','底鼓',lambda:A.kick()),('snare','军鼓',lambda:A.snare()),('clap','拍手',lambda:A.clap()),('hat','踩镲',lambda:A.hat()),('shaker','沙锤',lambda:A.shaker()),('pad','铺底和弦',lambda:A.pad([60,64,67],2)),('epiano','电钢琴',lambda:A.epiano(72,1.6)),('pluck','拨弦',lambda:A.pluck(72)),('bassn','合成贝斯',lambda:A.bassn(36,1.3)),('chip','芯片音色',lambda:A.chip(72,.6)),('bell','钟声',lambda:A.bell(84)),('glock','钟琴',lambda:A.glock(84)),('sub_drop','低频下沉',lambda:A.sub_drop()),('riser','噪声上升',lambda:A.riser(1.5)),('crash_cym','镲片',lambda:A.crash_cym()),('reverb','混响',lambda:A.reverb(A.pan(A.epiano(72,2),0),1.1,.45))]
    recipes += [(k,title,f,k) for k,title,f in instruments]
    for key,title,fn,source_name in recipes:
        try:
            A.rng = np.random.default_rng(11)
            signal = np.asarray(fn())
            if signal.ndim == 1: signal = A.pan(signal,0)
            peak = float(np.max(np.abs(signal)))
            signal = signal * min(1,.82/(peak+1e-9))
            mono = signal.mean(axis=1)
            duration = len(signal)/A.SR
            A.write_wav(str(folder/(key+'.wav')),signal)
            bounds = np.linspace(0,len(mono),321,dtype=int)
            samples = [float(np.max(np.abs(mono[a:max(a+1,b)]))) for a,b in zip(bounds[:-1],bounds[1:])]
            norm = max(samples)+1e-9; samples = [round(x/norm,4) for x in samples]
            waves[key] = dict(title=title,values=samples,duration=duration)
            im = Image.new('RGB',(640,360),'#17283e'); draw = ImageDraw.Draw(im)
            for i,v in enumerate(samples):
                x=28+i*1.83; draw.line((x,180-v*104,x,180+v*104),fill='#72a0ff',width=1)
            im.save(posters/('audio-'+key+'.jpg'),quality=90)
            if key in A.GEN:
                at = next(i for i,l in enumerate(lines,1) if re.search(r"['\"]"+re.escape(key)+r"['\"]\s*:",l))
                refs = re.findall(r'\b([a-zA-Z_]\w*)\(',lines[at-1]); target = next((v for v in refs if v in functions),None)
                node = functions.get(target); start = node.lineno if node else at; end = node.end_lineno if node else at
            else:
                node=functions[key]; start=node.lineno; end=node.end_lineno
            records.append(dict(id='audio-'+key,title=title+' · '+key,group='audio',description='直接调用仓库的合成函数生成，可试听并下载 WAV。'+('参数示例 d=1.2、n=0。' if key in A.GEN else '仓库配乐音色 / 处理函数。'),start=0,end=max(.4,duration),preview='preview/audio/index.html?clip='+key,source='source/scripts/audiolib.py',line=start,endLine=end,tags=['声音', '音效' if key in A.GEN else '配乐音色'],mediaNote='仓库原函数合成，未使用第三方音乐。',audio='preview/audio/'+key+'.wav',poster='posters/audio-'+key+'.jpg',cues=[]))
        except Exception as exc: failures.append(dict(id=key,error=str(exc)))
    write_json(ROOT/'audio-items.json',records)
    write_json(ROOT/'audio-generation.json',dict(soundTypes=len(A.GEN),instruments=len(instruments),generated=len(records),failures=failures))
    (folder/'waves.js').write_text('window.WAVES='+json.dumps(waves,ensure_ascii=False)+';',encoding='utf-8')

def catalog():
    items=[]
    for filename in ['macro-items.json','template-items.json','example-items.json','primitive-items.json','ui-items.json','audio-items.json']:
        if (ROOT/filename).exists(): items+=json.loads((ROOT/filename).read_text(encoding='utf-8-sig'))
    if (ROOT/'inventory-extra.json').exists():
        raw=json.loads((ROOT/'inventory-extra.json').read_text(encoding='utf-8-sig'))
        extra=raw if isinstance(raw,list) else raw.get('subeffects',raw.get('items',raw.get('effects',[])))
        for i,r in enumerate(extra):
            p=r.get('pack',r.get('group','anim3'))
            if p not in ['anim3','anim4']: continue
            r=dict(r); r.update(id='detail-'+p+'-'+str(i+1),group='detail',preview='preview/'+p+'/index.html')
            r['start']=r.get('previewStart',r.get('start',0));r['end']=r.get('previewEnd',r.get('end',r['start']+4))
            r.setdefault('source','source/packs/'+p+'/scenes.js'); r.setdefault('start',0); r.setdefault('end',r['start']+4)
            r.setdefault('line',1);r.setdefault('endLine',r['line']);r.setdefault('tags',['细分动作',p]);r.setdefault('mediaNote','人物、作品和录屏为明确标注的示意素材，动作调用原场景代码。');r.setdefault('description','');r.setdefault('cues',[])
            items.append(r)
    assets=[]
    for p in sorted(list((SRC/'assets').rglob('*'))+list((SRC/'template/assets').rglob('*'))):
        if p.suffix.lower() not in ['.png','.svg','.gif','.jpg']: continue
        rel=p.relative_to(SRC).as_posix(); assets.append(dict(id='asset-'+str(len(assets)+1),title=p.stem,group='asset',description='仓库随附的原始图示 / 图片。',start=0,end=4,image='source/'+rel,poster='source/'+rel,source='source/'+rel,line=1,endLine=1,tags=['原始素材'],mediaNote='仓库原文件。',cues=[]))
    items+=assets
    files=[]; text={}
    tracked=subprocess.check_output(['git','-C',str(SRC),'ls-files','-z']).decode('utf-8').split('\x00')
    for relpath in sorted(x for x in tracked if x):
        p=SRC/relpath
        b=p.read_bytes(); rel='source/'+p.relative_to(SRC).as_posix()
        row=dict(path=rel,size=len(b),sha256=hashlib.sha256(b).hexdigest(),extension=p.suffix)
        try:
            s=b.decode('utf-8-sig'); text[rel]=s;row['lines']=len(s.splitlines());row['text']=True
        except UnicodeDecodeError: row['text']=False
        files.append(row)
    counts={}
    for item in items:
        counts[item['group']]=counts.get(item['group'],0)+1
        item.setdefault('width',1920);item.setdefault('height',1080)
        item.setdefault('poster','posters/'+item['id']+'.jpg')
    sha=(SRC/'.git/refs/heads/main').read_text().strip() if (SRC/'.git/refs/heads/main').exists() else '7d91de4af1365954e4317367519c6b3513fa4f6e'
    data=dict(items=items,files=files,source=text,counts=counts,commit=sha,repository='https://github.com/adunext/adu-motion-video',date='2026-09-30')
    write_json(ROOT/'catalog.json',{k:v for k,v in data.items() if k!='source'})
    write_json(ROOT/'source-manifest.json',files)
    (ROOT/'gallery-data.js').write_text('window.CATALOG='+json.dumps(data,ensure_ascii=False)+';',encoding='utf-8')
    print(json.dumps(dict(items=len(items),files=len(files),counts=counts),ensure_ascii=False))

if __name__=='__main__':
    import sys
    if '--audio' in sys.argv:audio_library()
    catalog()
