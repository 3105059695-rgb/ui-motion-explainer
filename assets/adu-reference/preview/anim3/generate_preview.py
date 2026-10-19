from pathlib import Path
import json,re,shutil,html

ROOT=Path(r'E:\ui\adu-motion-extracted-20260930')
TITLES4=['开场标题与作品墙','九宫格分组高亮','中心作品放大与审片报告','四品类、作品墙与镜头语言','软件窗口与竞争赛道','迭代时间轴与账号卡','工作流与代码演示','产能对比与行动号召','片尾制作说明与打字机']

def svg(w,h,body):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'

def presenter(transparent=False,pose='normal'):
 bg='' if transparent else '<defs><linearGradient id="b" x2="0.9" y2="1"><stop stop-color="#152447"/><stop offset="1" stop-color="#526dda"/></linearGradient><radialGradient id="g"><stop stop-color="#97bbff" stop-opacity=".5"/><stop offset="1" stop-color="#97bbff" stop-opacity="0"/></radialGradient></defs><rect width="720" height="1280" fill="url(#b)"/><circle cx="360" cy="450" r="460" fill="url(#g)"/>'
 arm='<path d="M200 810 Q125 800 95 640 M515 805 Q610 720 595 590" fill="none" stroke="#2462ea" stroke-width="95" stroke-linecap="round"/>' if pose=='wave' else '<path d="M200 830 Q100 1050 90 1170 M510 830 Q610 1050 630 1170" fill="none" stroke="#2462ea" stroke-width="90" stroke-linecap="round"/>'
 face='<ellipse cx="360" cy="476" rx="151" ry="176" fill="#edbd9b"/><path d="M209 438 Q200 255 360 260 Q535 260 514 455 Q480 430 466 360 Q390 407 272 357 Q254 437 209 438" fill="#142438"/><rect x="238" y="438" width="110" height="67" rx="23" fill="#fff" fill-opacity=".24" stroke="#172b42" stroke-width="13"/><rect x="373" y="438" width="110" height="67" rx="23" fill="#fff" fill-opacity=".24" stroke="#172b42" stroke-width="13"/><path d="M348 465 H373" stroke="#172b42" stroke-width="12"/><circle cx="294" cy="472" r="8" fill="#142438"/><circle cx="424" cy="472" r="8" fill="#142438"/><path d="M316 558 Q360 593 405 558" fill="none" stroke="#a0514b" stroke-width="9" stroke-linecap="round"/>'
 body=f'{bg}<path d="M200 1280 V920 Q200 754 360 738 Q520 754 520 920 V1280" fill="#2462ea"/>{arm}<path d="M322 652 V737 Q358 770 398 737 V652" fill="#dba78d"/>{face}<text x="360" y="941" fill="white" text-anchor="middle" font-family="Microsoft YaHei,sans-serif" font-size="36" font-weight="700">示意人物</text>'
 if not transparent: body+='<rect x="110" y="1110" width="500" height="80" rx="40" fill="#0a1425" fill-opacity=".65"/><text x="360" y="1161" fill="#c9d9ff" text-anchor="middle" font-family="Microsoft YaHei,sans-serif" font-size="28">无真实口播 · 动效结构演示</text>'
 return svg(720,1280,body)

def laptop():
 return svg(740,500,'<defs><linearGradient id="m" y2="1"><stop stop-color="#e8ebef"/><stop offset="1" stop-color="#788394"/></linearGradient></defs><rect x="95" y="25" width="550" height="340" rx="30" fill="url(#m)" stroke="#303846" stroke-width="8"/><rect x="117" y="49" width="506" height="288" rx="12" fill="#15264a"/><rect x="144" y="89" width="230" height="27" rx="8" fill="#7b9bff"/><rect x="144" y="141" width="310" height="14" rx="5" fill="#536ca6"/><rect x="144" y="172" width="270" height="14" rx="5" fill="#536ca6"/><text x="370" y="264" text-anchor="middle" fill="#fff" font-family="Microsoft YaHei" font-size="44">示意设备</text><path d="M90 365 H650 L730 433 Q740 460 710 466 H30 Q0 460 10 433 Z" fill="url(#m)" stroke="#626c7b" stroke-width="6"/><path d="M285 368 H455 L430 396 H310Z" fill="#a8b1bd"/>')

def crt():
 return svg(700,650,'<rect x="42" y="25" width="616" height="472" rx="50" fill="#d5d2c4" stroke="#817f78" stroke-width="12"/><rect x="90" y="76" width="520" height="355" rx="45" fill="#17828a" stroke="#464745" stroke-width="15"/><path d="M280 500 V590 H422 V500" fill="#aaa797"/><rect x="203" y="580" width="298" height="55" rx="12" fill="#d5d2c4"/><rect x="129" y="131" width="235" height="211" fill="#c0c0c0" stroke="#fff" stroke-width="4"/><rect x="132" y="135" width="226" height="36" fill="#000080"/><text x="246" y="275" text-anchor="middle" font-family="Microsoft YaHei" font-size="30">示意旧设备</text><circle cx="565" cy="466" r="7" fill="#69a94c"/>')

def bird():
 return svg(420,420,'<ellipse cx="200" cy="243" rx="130" ry="110" fill="#f5bd4e" stroke="#9a5f20" stroke-width="7"/><path d="M93 255 Q10 168 57 100 Q168 156 196 260" fill="#fbe0a1" stroke="#9a5f20" stroke-width="7"/><circle cx="294" cy="155" r="89" fill="#f8cf69" stroke="#9a5f20" stroke-width="7"/><circle cx="326" cy="135" r="13" fill="#172b42"/><path d="M362 160 L415 185 L355 194" fill="#ed8751" stroke="#9a5f20" stroke-width="5"/><path d="M154 349 L134 393 M233 348 L253 393" stroke="#9a5f20" stroke-width="12" stroke-linecap="round"/><text x="208" y="269" text-anchor="middle" font-family="Microsoft YaHei" font-size="33" fill="#795019">示意</text>')

def icon(label,color='#2462ea'):
 return svg(256,256,f'<rect width="256" height="256" rx="56" fill="{color}"/><path d="M76 80 L191 128 L76 176Z" fill="white"/><rect x="22" y="206" width="212" height="38" rx="17" fill="#102552"/><text x="128" y="233" fill="white" text-anchor="middle" font-family="Microsoft YaHei" font-size="23">{html.escape(label)}</text>')

def wall(seed):
 colors=['#2462ea','#7958df','#1d9a9b','#b7566e','#e59045','#4470a6']
 body='<rect width="512" height="288" fill="#111"/>'
 for k in range(16):
  x=(k%4)*128;y=(k//4)*72;c=colors[seed%len(colors)];phase=k/15
  body+=f'<g transform="translate({x},{y})"><rect width="128" height="72" fill="{c}"/><circle cx="{25+phase*75:.1f}" cy="{22+20*phase:.1f}" r="25" fill="#fff" fill-opacity=".15"/><path d="M0 {61-20*phase:.1f} Q60 10 128 {35+phase*20:.1f} V72 H0Z" fill="#fff" fill-opacity=".13"/><text x="10" y="20" font-family="Microsoft YaHei" fill="white" font-size="10">示意 {seed+1:02}</text><rect x="10" y="48" width="{30+phase*69:.1f}" height="3" rx="2" fill="white"/></g>'
 return svg(512,288,body)

BOOT='''/* Explicit, generated demonstration inputs. No author media is included. */
window.CONFIG={fps:60,end:82,demo:true,brand:'动效结构示意',account:'示意人物',race:{labels:['开场','历史','痛点','迁移','转折','网络','机会','知识','操作','创作','总结','结束'],keys:[0,3.3,11.9,20.67,28.37,36.8,44.53,55.67,59.9,63,69.6,73.25,82]}};
window.TALKF=['demo']; window.TALKMAP=Array.from({length:6600},(_,i)=>[0,i+1]);
window.FACE={demo:{f:[1,6600],cx:[.5,.5],cy:[.365,.365],h:[.26,.26]}};
window.WALL=Array.from({length:389},(_,i)=>({slug:'demo-'+(i%27+1),author:'程序生成示意',category:'结构演示'}));
window.PACK_WALL_UNIQUE_COUNT=27;window.PACK_PRESENTER_LABEL='// 示意人物 · 无真实口播';
window.SUBS=[];window.DEMO_MEDIA=true;
'''

MEDIA=r'''/* Preview-only media adapter. Source scenes, timing and choreography are unchanged. */
(() => {
 const base=window.DEMO_ASSET_BASE||'assets/';
 const aliases={'x_macbook.png':'device-laptop.svg','x_crt.png':'device-crt.svg','b_fly.png':'bird.svg','b_squawk.png':'bird.svg','p_crt_stress.png':'person.svg','p_gamepad.png':'person.svg','p_typing_excited.png':'person.svg','c_a.png':'person-wave.svg','presenter.png':'presenter.svg','app-logo.png':'app-logo.svg','wall-badge.png':'wall-badge.svg'};
 const originalMk=mk;
 mk=function(parent,content,...args){
   content=content.replace(/assets\/([^'"\s<>]+)/g,(_,name)=>base+(aliases[name]||'app-logo.svg'));
   return originalMk(parent,content,...args);
 };
 const oldFrame=setFrame; const cache=new Map();
 const color=['#2462ea','#7958df','#11a59c','#d65885','#f59b42','#4b88be','#6072d6','#277775','#ab709c'];
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 function data(w,h,body){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);}
 function frame(dir,n){
   const key=dir+':'+n;if(cache.has(key))return cache.get(key);
   let hash=0;for(const c of dir)hash=(hash*31+c.charCodeAt(0))>>>0;const C=color[hash%color.length],p=(n%180)/180;
   const software=/soft|work|coding/.test(dir);let body='';
   if(software){
     const code=dir==='coding';
     body=`<rect width="960" height="540" fill="#111821"/><rect width="960" height="40" fill="#273140"/><circle cx="22" cy="20" r="6" fill="#ee6264"/><circle cx="43" cy="20" r="6" fill="#eec263"/><circle cx="64" cy="20" r="6" fill="#67c295"/><text x="90" y="26" font-family="Microsoft YaHei" fill="#d7e0ef" font-size="16">${code?'示意代码操作':'示意剪辑软件 · 界面机制演示'}</text><rect x="0" y="40" width="172" height="500" fill="#1b2431"/>`;
     for(let i=0;i<6;i++)body+=`<rect x="18" y="${72+i*53}" width="135" height="34" rx="6" fill="${i===Math.floor(p*6)?C:'#2c3849'}"/><text x="30" y="${94+i*53}" font-family="Microsoft YaHei" fill="#c4d1e2" font-size="14">${['项目 / 示例','媒体示意','动效参数','时间轴','导出预览','操作日志'][i]}</text>`;
     if(code){const lines=['const clip = createScene();','clip.duration = 8.0;','clip.motion = spring(0.6);','clip.camera.pushIn(1.04);','clip.timeline.add(title);','preview.renderAt(time);','// 示意代码 · 非真实录屏'];const count=Math.floor((n%150)/150*7)+1;for(let i=0;i<7;i++){let s=i<count?lines[i]:'';body+=`<text x="198" y="${102+i*46}" font-family="Consolas,monospace" fill="${i%2? '#87b5ff':'#a6ddc6'}" font-size="24">${esc(s)}</text>`;}body+=`<rect x="198" y="454" width="${120+560*p}" height="8" rx="4" fill="${C}"/>`;}
     else {
       const x=350+Math.sin(n*.028)*62,rot=Math.sin(n*.02)*9;
       body+=`<rect x="197" y="62" width="735" height="305" rx="10" fill="#0c111a"/><g transform="translate(${x.toFixed(1)},190) rotate(${rot.toFixed(1)})"><rect x="-66" y="-67" width="132" height="132" rx="25" fill="${C}"/><path d="M-20 -37L39 0L-20 37Z" fill="white"/></g><text x="650" y="157" text-anchor="middle" font-family="Microsoft YaHei" font-size="31" fill="#fff">结构示意</text><text x="650" y="199" text-anchor="middle" font-family="Microsoft YaHei" font-size="18" fill="#7e94b1">鼠标 → 状态 → 动作 → 反馈</text>`;
       for(let r=0;r<3;r++)for(let j=0;j<7;j++)body+=`<rect x="${200+j*101}" y="${408+r*31}" width="92" height="22" rx="4" fill="${r===1?C:'#435068'}" opacity="${.55+(j%3)*.16}"/>`;
       body+=`<rect x="${220+680*p}" y="391" width="3" height="130" fill="#f47484"/><path d="M${570+120*Math.sin(n*.03)} ${251+45*Math.cos(n*.03)}l-13-23v30l8-5 5 11 7-3-6-12z" fill="white"/>`;
     }
   }else{
     const lens=dir==='mv_lens', q=lens?Math.min(1,n/345):p;
     body=`<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#10182a"/><stop offset="1" stop-color="${C}"/></linearGradient></defs><rect width="960" height="540" fill="url(#bg)"/>`;
     const cx=360+160*Math.sin(n*.017+hash%7),cy=250+50*Math.cos(n*.023),z=lens?1+q*.7:1;
     body+=`<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${(n*.3)%360}) scale(${z})"><rect x="-105" y="-105" width="210" height="210" rx="48" fill="white" opacity=".9"/><circle r="65" fill="${C}"/><path d="M-19-35L38 0L-19 35Z" fill="white"/></g><circle cx="${780-190*p}" cy="${110+270*p}" r="98" fill="white" opacity=".12"/><path d="M-20 510 Q480 ${200-200*p} 990 490" stroke="white" stroke-width="5" opacity=".25" fill="none"/>`;
     body+=`<text x="42" y="60" font-family="Microsoft YaHei" font-size="24" font-weight="700" fill="white">示意作品 ${String(hash%27+1).padStart(2,'0')}</text><text x="42" y="490" font-family="Microsoft YaHei" font-size="22" fill="white">${lens?'镜头位移与缩放 · 示例':dir==='opus_hero'?'重点作品演示 · 生成图形':dir==='prev'?'上一作品 · 生成图形':'动态媒体占位 · '+esc(dir)}</text><rect x="42" y="511" width="${40+875*p}" height="3" rx="2" fill="white"/>`;
   }
   const url=data(960,540,body);if(cache.size>1500)cache.clear();cache.set(key,url);return url;
 }
 setFrame=function(im,src){
   let out=src;
   if(src.startsWith('talk/'))out=base+'presenter.svg';
   else{const m=src.match(/^sc\/([^/]+)\/f_(\d+)\.jpg$/);if(m)out=frame(m[1],+m[2]);}
   if(src.startsWith('assets/'))out=base+(aliases[src.substring(7)]||'app-logo.svg');
   oldFrame(im,out);
 };
 window.DEMO_WALL_BASE=base;
 window.DEMO_FRAME_GENERATOR=frame;
})();
'''

RUNTIME=r'''/* Adapter records generated media and keeps the source runtime API available. */
(() => {
 const images=[...document.images];
 for(const el of document.querySelectorAll('*')) {
  const s=el.style.backgroundImage;
  if(s&&s.includes('sc/wall/')){const m=s.match(/sc\/wall\/(\d+)\.jpg/);if(m)el.style.backgroundImage=`url("${window.DEMO_WALL_BASE}wall-demo-${String((+m[1])%27).padStart(2,'0')}.svg")`;}
 }
 const st=document.createElement('style');st.textContent='body{font-family:-apple-system,"Microsoft YaHei","PingFang SC",sans-serif}.mono,.tag{font-family:Consolas,"Microsoft YaHei",monospace}';document.head.appendChild(st);
 const badge=document.createElement('div');badge.id='media-demonstration-label';badge.textContent='媒体均为程序生成示意 · 原仓库不附人物 / 录屏 / 作品';badge.style.cssText='position:absolute;left:18px;bottom:12px;z-index:2000;color:#d6e1ff;background:rgba(9,19,40,.78);border:1px solid rgba(152,179,238,.35);border-radius:10px;padding:7px 13px;font:19px "Microsoft YaHei",sans-serif;pointer-events:none';document.getElementById('stage').appendChild(badge);
 window.PREVIEW_INFO={width:1920,height:1080,scenes:SCENES.map((s,i)=>({index:i,start:s.s,end:s.e})),media:'Generated illustration; no original footage',audio:false};
 const original=window.renderAt;
 window.renderAt=function(t){window.PACK_OUTPUT_TIME=+t;original(+t);window.PREVIEW_TIME=+t;};
 const prior=window.READY;
 window.READY=(async()=>{await prior;await window.imgWait();await Promise.all(images.filter(im=>im.src).map(im=>im.decode?im.decode().catch(()=>{}):Promise.resolve()));const t=+(new URLSearchParams(location.search).get('t')||.05);window.renderAt(t);await window.imgWait();window.PREVIEW_READY=true;return window.PREVIEW_INFO;})();
})();
'''

all_items=[]
for group in ['anim3','anim4']:
 source=ROOT/'source'/'packs'/group;out=ROOT/'preview'/group
 out.mkdir(parents=True,exist_ok=True)
 for f in source.iterdir():
  if f.is_file(): shutil.copy2(f,out/f.name)
 assets=out/'assets';assets.mkdir(exist_ok=True)
 static={'device-laptop.svg':laptop(),'device-crt.svg':crt(),'person.svg':presenter(True),'person-wave.svg':presenter(True,'wave'),'presenter.svg':presenter(),'bird.svg':bird(),'app-logo.svg':icon('示意软件'),'wall-badge.svg':icon('示意作品','#7958df')}
 for name,s in static.items():(assets/name).write_text(s,encoding='utf8')
 for seed in range(27):(assets/f'wall-demo-{seed:02}.svg').write_text(wall(seed),encoding='utf8')
 (out/'demo-bootstrap.js').write_text(BOOT,encoding='utf8');(out/'demo-media.js').write_text(MEDIA,encoding='utf8');(out/'demo-runtime.js').write_text(RUNTIME,encoding='utf8')
 entry=(source/'index.html').read_text(encoding='utf8')
 entry=re.sub(r'<style>@font-face.*?</style>','',entry,flags=re.S)
 if group=='anim4':
  preview_css=re.sub(r"@font-face\{font-family:'SFM';src:url\('file:///System/Library/Fonts/SFNSMono.ttf'\)\}","@font-face{font-family:'SFM';src:local('Consolas')}",(source/'style.css').read_text(encoding='utf8'))
  (out/'preview-style.css').write_text(preview_css,encoding='utf8')
  entry=entry.replace('href="style.css"','href="preview-style.css"')
 entry=entry[:entry.index('<script')]+f'<script src="demo-bootstrap.js"></script>\n<script src="lib.js"></script>\n<script src="demo-media.js"></script>\n<script src="scenes.js"></script>\n<script src="{"main-source.js" if group=="anim3" else "main.js"}"></script>\n<script src="demo-runtime.js"></script>\n</body></html>\n'
 (out/'index.html').write_text(entry,encoding='utf8')
 manifest=json.loads((source/'manifest.json').read_text(encoding='utf8'))
 lines=(source/'scenes.js').read_text(encoding='utf8').splitlines()
 ranges=[]
 for j,line in enumerate(lines):
  if re.search(r'const sc = new Scene\(',line):
   b=j
   while b>0 and lines[b].strip()!='(() => {':b-=1
   e=j
   while e+1<len(lines) and lines[e].strip()!='})();':e+=1
   ranges.append((b+1,e+1))
 for i,s in enumerate(manifest['scenes']):
  ln,en=ranges[i];title=s.get('title') or TITLES4[i]
  cues=[{'id':c['id'],'title':c.get('label') or c.get('kind') or c['id'],'time':c['at']} for c in s['cues']]
  item={'id':group+'-'+s['id'],'title':title,'group':group,'description':s['role'],'start':s['source']['start'],'end':s['source']['end'],'preview':f'preview/{group}/index.html','source':f'source/packs/{group}/scenes.js','line':ln,'endLine':en,'tags':['完整宏场景','源编舞','1920×1080', '示意媒体'],'mediaNote':'人物、设备、录屏和作品均为本次程序生成示意；原仓库未分发这些媒体。静音预览保留音效调用源码；不代表原片复刻。','cues':cues,'windows':s.get('motionWindows',[])}
  all_items.append(item)
 (out/'PREVIEW-NOTES.md').write_text('''# 完整宏场景预览适配说明

本目录拷贝原 packs 源码，scenes.js / lib.js / style.css / 主调度脚本内容不变。新增三个 demo 脚本负责明确的示意输入、缺少媒体的替代和预览接口。人物为静态矢量插画，不伪造原作者口播；序列媒体由帧号生成不同状态的 SVG，保持原作品推进、镜头缩放、九格独立更新及软件窗口动画。作品墙 389 格循环使用 27 个标为示意的图样，不能称 389 个独立作品。

接口：await window.READY；window.renderAt(绝对源秒)；await window.imgWait()。1920×1080 舞台由外部 iframe 等比缩放。时间轴未拉伸，完整 Scene 多阶段更新与跨场转场由原主调度运行。预览静音，原音效调用、配方及事件清单在文件中。

anim3 原入口引用未随包分发的 macro_main.js、subtitles.js；预览使用同包 main-source.js。anim4 原入口缺 talkmap.js、face.js、wall.js 和 subs.js；这里通过显式 demo 输入补齐。
''',encoding='utf8')

(ROOT/'macro-items.json').write_text(json.dumps(all_items,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'macroItems':len(all_items),'ranges':{g:sum(x['group']==g for x in all_items) for g in ('anim3','anim4')},'previews':['preview/anim3/index.html','preview/anim4/index.html']},ensure_ascii=False))
