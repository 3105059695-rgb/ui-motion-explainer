from pathlib import Path
import re, json, shutil

ROOT=Path(r'E:\ui\adu-motion-extracted-20260930')
SRC=ROOT/'source'
TP=ROOT/'preview/template'; EX=ROOT/'preview/examples'; PR=ROOT/'preview/primitives'
for p in [TP,EX,PR]: p.mkdir(parents=True,exist_ok=True)
def read(p): return p.read_text(encoding='utf-8')
def write(p,s): p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
def save(p,a): write(ROOT/p,json.dumps(a,ensure_ascii=False,indent=2))
def styles(html): return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',html,re.S))
BASE_STYLES=styles(read(SRC/'template/index.html'))
NOTE='<div id="extract-note" style="position:absolute;right:52px;bottom:40px;font:500 22px Microsoft YaHei,sans-serif;color:#a0b3d8;background:rgba(10,15,25,.86);padding:10px 18px;border-radius:12px;z-index:999;pointer-events:none">源码动效预览 · 人物与媒体为示意 · 无音频原片</div>'
FRAME='<div id="stage"><div id="world"></div><div id="fx"></div><div id="ov" style="position:absolute;inset:0;pointer-events:none"></div></div>'
def html(body,scripts,style=BASE_STYLES,css='../../source/template/style.css',note=True):
    return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><link rel="stylesheet" href="'+css+'"><style>'+style+'</style></head><body>'+body+scripts+(NOTE if note else '')+'</body></html>'
def script(path): return '<script src="'+path+'"></script>'
config=read(SRC/'template/config.js').replace("'YOUR BRAND'","'源码预览 / TPL'").replace("'你的账号'","'示意人物'")
write(TP/'config.js',config)
(TP/'assets').mkdir(exist_ok=True)
shutil.copyfile(SRC/'template/assets/demo-presenter.svg',TP/'assets/demo-presenter.svg')
write(TP/'index.html',html(FRAME,script('config.js')+script('../../source/template/lib.js')+script('../../source/template/templates.js')+script('../../source/template/scenes.js')+script('../../source/template/main.js')))
template_names=[('hero','开场标题 · 砸入与震动','第一行迅速从大缩小，第二行强调字砸入；右侧口播卡轻弹，镜头震动。',0,4,37,49,[0,.12,1.2,1.4,2.0]),('point','观点文字 · 滑入要点卡','逐词抬升；强调词冲击放大，三张黑色要点卡依次从右侧滑入。',4,8,52,61,[4.3,4.8,5.8,6.3,6.8]),('number','数字滚动 · 进度条填充','关键数字从 480 滚动到 60，横向进度条随同填满，随后出现说明。数值为仓库示意数据。',8,12,64,79,[8.4,9.2,10,11]),('compare','双栏对比 · 划线与盖章','左右卡片入场，旧做法被红线划掉，随后红色印章砸入并震动。',12,16,82,98,[12.2,13,14,14.35,14.6]),('steps','步骤时间线 · 逐节点点亮','三步圆节点弹入，连接线按时间逐段延伸。',16,20,101,114,[16.4,17.2,18,18.5]),('quote','整屏金句 · 冲击与慢推','两行金句在蓝色背景砸入，震动后缓慢推近。',20,23,117,127,[20.2,20.4,21.4,22.4]),('demo','软件窗口 · 功能卡打勾','macOS 风格窗口缩放入场，右侧三条功能卡逐项滑入。原仓库自带录屏占位界面。',23,27,130,145,[23.1,23.6,24.3,25,25.6]),('checklist','检查清单 · 弹性打勾','每一行清单从左侧滑入，蓝色勾选圆弹性放大。',27,31,148,158,[27.4,28,28.6,29.2]),('outro','终端片尾 · 逐字输入','标题与说明上移入场，终端提示词逐字打出，光标周期闪烁。',31,36,161,173,[31.15,31.7,32,33.4,35])]
items=[]
for name,title,desc,start,end,line,endline,cues in template_names:
    items.append(dict(id='tpl-'+name,title=title,group='template',description=desc,start=start,end=end,preview='preview/template/index.html',source='source/template/templates.js',line=line,endLine=endline,tags=['TPL.'+name,'基础模板','1920×1080'],mediaNote='运行仓库原模板和原 scenes.js 时间表；插画人物为仓库自带 demo-presenter.svg；媒体与统计为示意，无音频。',cues=[dict(id='cue-'+str(i),title=('动作节点 '+str(i+1)),time=v) for i,v in enumerate(cues)]))
save('template-items.json',items)

# Standalone examples retain their original drawing/animation code.
silent=read(SRC/'examples/silent-demo.html').replace('../template/','../../source/template/')
write(EX/'silent-demo.html',silent)
write(EX/'handdrawn-continuity.html',read(SRC/'examples/handdrawn-continuity.html'))
subtitle=read(SRC/'examples/subtitle-options.html').replace('../template/','../../source/template/')
write(EX/'subtitle-options.html',subtitle)
examples=[]
def example(id,title,desc,start,end,file,line,endline,cues=None,preview=None,**kw):
    x=dict(id=id,title=title,group='example',description=desc,start=start,end=end,preview=preview or 'preview/examples/'+file,source='source/examples/'+file,line=line,endLine=endline,tags=['独立示例'],mediaNote='运行仓库原示例；文案与数据均为教学示意，无音频。',cues=cues or [])
    x.update(kw);examples.append(x)
for i,(title,start,end) in enumerate([('纸白图文 · 标题抬升',0,2),('墨黑图文 · 标题抬升',2,4),('科技蓝图文 · 标题抬升',4,6)]):
    example('example-silent-'+str(i+1),title,'原 6 秒无声示例中的一个完整段落；标题与副标题先后向上抬升。',start,end,'silent-demo.html',10,16,[dict(id='headline',title='标题入场',time=start+.08),dict(id='subtitle',title='副标题入场',time=start+.25)])
phases=[('手绘续接 · 接住姿态',0,1.8,'人物、纸张与镜头沿用上一刻位置。'),('手绘续接 · 收拢与攥紧',1.8,4.6,'纸张逐步汇向双手，双手收拢并攥紧。'),('手绘续接 · 释放成果',4.6,6,'先压缩，再弹出成果卡，脸部表情跟随释放。'),('手绘续接 · 缓慢停稳',6,8,'手、表情和卡片依次停稳，保留阅读时间。')]
for i,(title,start,end,desc) in enumerate(phases):
    example('example-handdrawn-'+str(i+1),title,desc,start,end,'handdrawn-continuity.html',140,206,[dict(id='phase',title='阶段主动作',time=(start+end)/2)],tags=['Canvas2D','手绘','连续动作'])
example('example-subtitle-standard','标准双语字幕 · 逐字变色','中文字 44px、英文字 26px；白字描边、当前字变蓝和微幅抬升。',.95,2.75,'subtitle-options.html',6,10,[dict(id='mid',title='逐字高亮',time=1.8)],preview='preview/examples/subtitle-options.html?preset=standard')
example('example-subtitle-large','英文加大字幕 · 长句示例','中文字 44px、英文字 30px；紧凑下移，用原例长英文比较字体尺寸与位置。',.95,2.75,'subtitle-options.html',6,10,[dict(id='mid',title='长句显示',time=1.8)],preview='preview/examples/subtitle-options.html?preset=large-en')
for preset,title in [('standard','标准字幕 · 局部避让'),('large-en','英文加大字幕 · 局部避让')]:
    example('example-subtitle-offset-'+preset,title,'第二组字幕中心改为 x=1480，为左侧画面大字留出空间。',3.95,5.85,'subtitle-options.html',6,10,[dict(id='offset',title='右移字幕',time=4.8)],preview='preview/examples/subtitle-options.html?preset='+preset)

# Historical recipe versions have their own source code and scene mappings.
for pack,file,prefix in [('anim3','card-layout-scenes.js','card-recipe'),('anim4','showcase-scenes.js','showcase-recipe')]:
    manifest=json.loads(read(SRC/'packs'/pack/'manifest.json'))
    txt=read(SRC/'examples'/file); lines=txt.splitlines()
    scene_lines=[i+1 for i,s in enumerate(lines) if re.search(r'const sc = new Scene\(',s)]
    # Only stateless seek fixes; original motion values, text, geometry and timing stay intact.
    adapted=txt
    if pack=='anim4':
        adapted=adapted.replace("VG.style.cssText += gL ? ';background:#fff;color:#0A0A0A;border-color:#fff' : ''; VC.style.cssText += cL ? ';background:var(--blue);color:#fff;border-color:var(--blue)' : '';", "VG.style.background=gL?'#fff':'#1d1d1d';VG.style.color=gL?'#0A0A0A':'#bbb';VG.style.borderColor=gL?'#fff':'#333';VC.style.background=cL?'var(--blue)':'#1d1d1d';VC.style.color=cL?'#fff':'#bbb';VC.style.borderColor=cL?'var(--blue)':'#333';")
        adapted=adapted.replace("if (toEnd > 0) cam.style.zIndex = 5;", "cam.style.zIndex=toEnd>0?'5':'';")
        adapted=adapted.replace("camAt(cam, t, { x: lerp(1570, 1745, toC)", "cam._sm=toC;\n    camAt(cam, t, { x: lerp(1570, 1745, toC)")
    write(EX/file,adapted)
    scripts=script('../'+pack+'/demo-bootstrap.js')+'<script>window.DEMO_ASSET_BASE="../'+pack+'/assets/";</script>'+script('../../source/packs/'+pack+'/lib.js')+script('../'+pack+'/demo-media.js')+script(file)
    if pack=='anim3': scripts+=script('../../source/template/subtitles.js')+script('../../source/template/main.js')
    else: scripts+=script('../../source/packs/anim4/main.js')
    scripts+=script('../'+pack+'/demo-runtime.js')
    write(EX/(prefix+'.html'),html(FRAME,scripts,styles(read(SRC/'packs'/pack/'index.html')),css='../../source/packs/'+pack+'/style.css'))
    for i,sc in enumerate(manifest['scenes']):
        line=scene_lines[i]; endline=next((j+1 for j in range(line,len(lines)) if lines[j].strip()=='})();'),len(lines))
        title=sc.get('title') or sc.get('role','场景').split('，')[0][:24]
        example(prefix+'-'+sc['id'],'历史配方 '+str(i+1).zfill(2)+' · '+title,sc.get('role','')+'；与 '+pack+'/'+sc['id']+' 对应，历史版本仍有原文案或动作参数差异。',sc['source']['start'],sc['source']['end'],file,line,endline,[dict(id=c['id'],title=c['id'],time=c['at']) for c in sc.get('cues',[])],preview='preview/examples/'+prefix+'.html',tags=['历史配方',pack,sc['id']],mediaNote='原 examples 场景编舞；引用共享示意人物/道具/录屏/作品墙，无原作者媒体与音轨。与完整包同场景结构；showcase 仅补无状态拖动所需的状态复原。',codeMapping='source/packs/'+pack+'/scenes.js')

# Portrait shell uses its original wrapper with the matching historical showcase runtime.
portrait=read(SRC/'examples/portrait-shell.html').replace('href="style.css"','href="../../source/packs/anim4/style.css"')
portrait=re.sub(r'<script src="(?:talkmap|wall|face|subs|lib|scenes|main)\.js"></script>','',portrait)
insertion=script('../anim4/demo-bootstrap.js')+'<script>window.DEMO_ASSET_BASE="../anim4/assets/";</script>'+script('../../source/packs/anim4/lib.js')+script('../anim4/demo-media.js')+script('showcase-scenes.js')+script('../../source/packs/anim4/main.js')+script('../anim4/demo-runtime.js')
portrait=portrait.replace('<script>\n(() => {',insertion+'<script>\n(() => {')
portrait=portrait.replace('src="assets/presenter.png"','src="../anim4/assets/presenter.svg"')
# Fix source readiness: the original READY callback had run before the portrait wrapper was installed.
portrait=portrait.replace('</body>','<script>window.READY=Promise.resolve(window.READY).then(()=>{renderAt(Number(new URLSearchParams(location.search).get("t")||0))});</script></body>')
write(EX/'portrait-shell.html',portrait)
for id,title,start,end in [('opening','竖屏分区 · 标题与横版内容',0,8.8),('middle','竖屏分区 · 横版软件演示与人物',8.8,25.9),('outro','竖屏分区 · 人物转品牌片尾',99.8,108.4)]:
    example('example-portrait-'+id,title,'运行原 1080×1920 竖屏外壳：顶部标题，中部 16:9 动效，下部人物，字幕置于竖屏安全区。',start,end,'portrait-shell.html',29,58,[dict(id='mid',title='分区视图',time=(start+end)/2)],width=1080,height=1920,tags=['竖屏','布局分区','人物'],mediaNote='原 portrait-shell 配合历史 showcase-scenes；人物及录屏为明确的示意素材，无原作者媒体或音轨。')
save('example-items.json',examples)

# Common primitives. Every selected page runs the actual template/lib.js implementation.
config='window.CONFIG={brand:"动效原语",account:"示意人物",demo:true,fps:60,width:1920,height:1080,end:6,subtitles:false,talkFrames:0,race:{labels:["起点","过程","完成"],keys:[0,2,4,6]}};window.WALL=Array.from({length:36},(_,i)=>i);'
write(PR/'config.js',config)
(PR/'assets').mkdir(exist_ok=True);shutil.copyfile(SRC/'template/assets/demo-presenter.svg',PR/'assets/demo-presenter.svg')
shutil.copyfile(SRC/'template/assets/demo-presenter.svg',PR/'assets/sample-presenter.svg')
write(PR/'assets/sample-ui.svg','<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="960" height="540" fill="#141b2a"/><rect x="28" y="28" width="176" height="484" rx="14" fill="#202b40"/><text x="55" y="85" fill="#71a0ff" font-size="28" font-family="sans-serif">DEMO UI</text><g fill="#304465"><rect x="230" y="28" width="702" height="55" rx="12"/><rect x="230" y="110" width="320" height="230" rx="16"/><rect x="578" y="110" width="354" height="230" rx="16"/><rect x="230" y="366" width="702" height="146" rx="16"/></g><text x="470" y="458" fill="#fff" font-size="26" font-family="sans-serif">ILLUSTRATIVE MEDIA</text></svg>')
from PIL import Image,ImageDraw
wall_dir=PR/'sc/wall';wall_dir.mkdir(parents=True,exist_ok=True)
for n in range(36):
    im=Image.new('RGB',(640,360));d=ImageDraw.Draw(im)
    for k in range(16):
        x=(k%4)*160;y=(k//4)*90;c=[(35,93,216),(23,28,42),(128,93,189),(56,123,131)][(n+k)%4]
        d.rectangle([x,y,x+159,y+89],fill=c);d.rounded_rectangle([x+14,y+15,x+146,y+72],radius=10,outline='white',width=2);d.text((x+24,y+30),f'DEMO {n+1:02d} / {k+1:02d}',fill='white')
    im.save(wall_dir/f'{n:03d}.jpg',quality=85)
seq_dir=PR/'sc/sample';seq_dir.mkdir(parents=True,exist_ok=True)
for n in range(1,31):
    im=Image.new('RGB',(960,540),(18,25,41));d=ImageDraw.Draw(im);d.rounded_rectangle([50,50,910,490],radius=30,outline=(71,122,221),width=5);x=100+(n-1)*23;d.ellipse([x,210,x+70,280],fill=(83,150,255));d.text((100,80),f'ILLUSTRATIVE SEQUENCE / FRAME {n:02d}',fill='white');im.save(seq_dir/f'f_{n:04d}.jpg',quality=87)
write(PR/'index.html',html(FRAME,script('config.js')+script('../../source/template/lib.js')+script('demos.js')+script('../../source/template/main.js')))
prims=[]
def primitive(id,title,desc,line,endline=0,source='source/template/lib.js',start=0,end=6,cues=None):
    prims.append(dict(id='primitive-'+id,title=title,group='effect',description=desc,start=start,end=end,preview='preview/primitives/index.html?demo='+id,source=source,line=line,endLine=endline or line,tags=['公共原语',id],mediaNote='用仓库实际函数制作的独立展示；展示参数与媒体为示意，动画未替代原函数。',cues=cues or [dict(id='start',title='入场/启动',time=.7),dict(id='motion',title='运动中',time=1.05),dict(id='hold',title='结果停留',time=3),dict(id='exit',title='退出阶段',time=4.5)]))
entrances=[('up','上移淡入 · up',46),('down','下移淡入 · down',47),('left','左侧滑入 · left',48),('right','右侧滑入 · right',49),('pop','弹性缩放 · pop',50),('zoom','缩放去模糊 · zoom',51),('slam','冲击大字 · slam',52),('blur','模糊清晰化 · blur',53),('mask','遮罩向上揭示 · mask',54)]
for id,title,line in entrances: primitive('entrance-'+id,title,'运行 show(..., {k:"'+id+'"})，在 0.7 秒入场，4.4 秒按原函数淡出并增添模糊。',line,58)
for id,title,line in [('out','立方减速 · EZ.out',8),('out5','五次减速 · EZ.out5',9),('expo','指数减速 · EZ.expo',10),('inout','三次加减速 · EZ.inout',11),('in','三次加速 · EZ.in',12),('back','回越终点 · EZ.back',13),('spring','阻尼弹簧 · EZ.spring',15)]:
    primitive('ease-'+id,title,'原缓动函数控制方块从左向右移动；蓝曲线显示该函数的进度，灰色直线为线性参照。',line,cues=[dict(id='begin',title='曲线起点',time=.7),dict(id='middle',title='曲线与位移',time=1.7),dict(id='end',title='达到终点',time=3)])
specs=[('exit','统一出场 · 淡出/位移/缩放/模糊','show 的 out、ox、oy、os、ob 参数共同控制离场。',55,58),('place','基础变换 · 位移/旋转/缩放/透明度','place 每帧写入绝对位置、非等比缩放、旋转、透明度与模糊。',31,40),('mk','绝对定位与锚点 · mk','展示 mk 创建的左上锚点与中心锚点，两块元素由 place 驱动。',20,26),('img','透明素材定位 · img','原 img 工具创建示意人物图片，默认底部中心锚点；用 place 展示锚点的旋转与轻微弹性。',27,29),('words','逐词出现 · words / wordsAt','普通抬升、slam 冲击与 pop 弹出按原文字分段时间先后出现。',63,84),('counter','数字滚动与千分位 · counter / fmt','从 0 到 12,480 的原 counter 缓动计数与 fmt 千分位格式。示意数值。',107,107),('shake','衰减噪声震动 · shake','原 shake 用两路 noise 产生衰减震动；左右框比较固定参照与实际震动。',106,106),('bob','人物待机摇动 · bob','原 bob 小幅正弦上下摆动，旁边曲线显示位置变化。',102,102),('breathe','人物呼吸缩放 · breathe','原 breathe 缩放幅度为 ±0.006；数值显示真实微幅缩放。',103,103),('hop','换姿态跳入 · hopIn','原 hopIn 在 0.45 秒内弹性上移、放大与显现。',105,105),('cam-card','大口播卡 · camCard / camAt','原口播卡创建与位置缩放，展示仓库演示插画，不含真人口型。',136,167),('cam-round','圆形人物窗 · faceAt / camAt','原圆窗依据 faceAt 的演示默认脸部位置计算裁切与缩放。',140,167),('cam-morph','人物卡缩小与脸部居中','原 camAt 读取 _sm 从 0 到 1，矩形卡逐渐缩小并把人物脸部居中。',153,167),('video-tile','视频卡片 · vtile / seqAt / setFrame','原视频卡片播放 30 帧示意序列，展示帧序列读取与圆角媒体容器。',168,171),('mac-window','macOS 窗口 · macWin','原窗口外框、三色交通灯、标题栏、内容图的布局与缩放入场。',172,175),('wall','作品墙 · buildWall / wallTick','36 张示意精灵格按中心距离波纹入场，每格 4×4 帧按原算法循环。',176,197),('race','底部赛道 · race / raceAt','原赛道标记和蓝色发光进度点按三段时间前进。',198,210),('tags','角标与时间码 · tags / tc','原角标淡入、右上品牌和 60fps 时码随时间更新。',95,100),('scene','场景与网格 · Scene','原 Scene 创建三类纸白/墨黑/科技蓝网格，按时间切换完整场景。',86,93),('camera','整屏镜头 · 推近/平移/震动','Scene.cam 输出位置与缩放；原 main.js 用整屏 transform 实现镜头，再叠加原 shake。',33,40)]
for id,title,desc,line,endline in specs: primitive(id,title,desc,line,endline,source='source/template/main.js' if id=='camera' else 'source/template/lib.js')
for id,title,line,endline in [('wipe','横向色板擦除 · wipe',18,21),('circle','圆形遮罩扩张 · circle',22,26),('flash','白色闪屏 · flash',27,27),('blur','整屏模糊转场 · blur',28,28)]:
    primitive('transition-'+id,title,'运行原 main.js 的 '+id+' 转场，中心位于 3 秒；前后画面用 A/B 标记便于看清遮罩关系。',line,endline,source='source/template/main.js',start=2.4,end=3.6,cues=[dict(id='before',title='转场前',time=2.78),dict(id='middle',title='转场中',time=3),dict(id='after',title='转场后',time=3.22)])
primitive('transition-fade','片尾淡黑 · fade','原 main.js 在 END 前 0.45 秒开始黑色透明罩，0.4 秒内淡黑。',42,42,source='source/template/main.js',start=5.3,end=5.99,cues=[dict(id='begin',title='开始淡黑',time=5.55),dict(id='mid',title='淡黑中',time=5.75),dict(id='end',title='完全淡黑',time=5.98)])
primitive('terminal-cursor','终端输入光标 · 周期闪烁','使用 TPL.outro 原逐字切片与光标 opacity 公式；仓库没有独立鼠标 cursor API。',168,170,source='source/template/templates.js')
save('primitive-items.json',prims)
print(json.dumps({'templates':len(items),'examples':len(examples),'primitives':len(prims)},ensure_ascii=False))
