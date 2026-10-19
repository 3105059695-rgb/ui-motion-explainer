from pathlib import Path
import json,re
ROOT=Path(r'E:\ui\adu-motion-extracted-20260930');OUT=ROOT/'preview'/'ui';OUT.mkdir(parents=True,exist_ok=True)
items=json.loads((ROOT/'inventory-extra.json').read_text(encoding='utf8'))['ui']
src4=(ROOT/'source/packs/anim4/scenes.js').read_text(encoding='utf8').splitlines();src3=(ROOT/'source/packs/anim3/scenes.js').read_text(encoding='utf8').splitlines()
def block(lines,a,b):return '\n'.join(lines[a-1:b])
fragments={
 'slider':block(src4,189,194)+'\nreturn {el:rs,rf,rk,rv};',
 'ring':block(src4,265,269)+'\nreturn {el:ring,rc,rt};',
 'account':block(src4,506,516)+'\nreturn {el:acct,stc,sv,sw,kn};',
 'nle':block(src4,96,102)+'\nreturn {el:tl,ph,fc};',
 'comment':"function packNumber(id,n){return n;}\n"+block(src3,448,449)+'\nreturn {el:ce[0],ce};'
}
account=block(src4,506,514);m=re.search(r'<div class="sw"',account);p=m.start();depth=0
for match in re.finditer(r'</?div\b[^>]*>',account[p:]):
 depth+= -1 if match.group(0).startswith('</') else 1
 if depth==0:
  toggle=account[p:p+match.end()];break
fragments['toggle']=f"const el=mk(sc.el,`{toggle}`,0,0,{{ax:.5,ay:.5}});return {{el,sw:el.querySelector('.sw'),kn:el.querySelector('.kn')}};"
js='/* Exact source HTML expressions lifted for individual UI viewing. */\nwindow.UI_SOURCE_BUILDERS={\n'+',\n'.join(json.dumps(k)+':function(parent){const sc={el:parent};const PX=1000;'+v+'}' for k,v in fragments.items())+'\n};\n'
(OUT/'source-fragments.js').write_text(js,encoding='utf8')

rules={
 'paper-card':(19,21),'dark-card':(22,23),'grid-paper':(16,16),'grid-dark':(17,17),'grid-blue':(18,18),'title-system':(13,15),'accent':(12,12),'pill':(27,27),'bubble':(26,26),'terminal':(28,28),
 'cam-portrait':(32,34),'cam-round':(37,39),'win95':(35,38),'glass':(39,41),'dock-icon':(42,42),'video-tile':(40,41),'glass-dark':(42,42),'chip':(43,43),'check':(50,50),
 'slider':(189,194),'toggle':(506,516),'ring':(265,269),'account':(506,516),'comment':(448,449),'nle':(96,102),'portrait-shell':(24,43),'tag-timecode':(92,103),'mac-window':(172,177)
}
# Resolve CSS/function source starts from actual files to avoid stale scan offsets.
needles={'cam-portrait':'.cam{','cam-round':'.cam.round{','win95':'.win95{','glass':'.glass{','dock-icon':'.appic{','video-tile':'.vt{','glass-dark':'.glassD{','chip':'.chip{','check':'.check{','tag-timecode':'function tags(','mac-window':'function macWin('}
out=[]
for item in items:
 id=item['id'];lines=(ROOT/'source'/item['sourceFile']).read_text(encoding='utf8').splitlines();a,b=rules[id]
 if id in needles:
  a=next(i+1 for i,l in enumerate(lines) if needles[id] in l)
  if id in ('tag-timecode','mac-window'):
   b=next(i+1 for i in range(a,len(lines)) if lines[i].startswith('}'))
  else:b=min(len(lines),a+{'cam-portrait':2,'cam-round':2,'win95':3,'glass':2,'video-tile':1}.get(id,0))
 if id=='accent':b=29
 out.append({'id':'ui-'+id,'title':item['title'],'group':'ui','description':item['description'],'start':0,'end':4,'preview':'preview/ui/index.html?item='+id,'source':item['source'],'line':a,'endLine':b,'tags':item['tags']+['原样式','独立展示'],'mediaNote':'直接使用仓库原CSS和助手；人物、录屏为程序生成示意。状态动画按原代码时间映射演示。','cues':[]})
(ROOT/'ui-items.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
(OUT/'items.js').write_text('window.UI_ITEMS='+json.dumps(out,ensure_ascii=False)+';',encoding='utf8')

native=(ROOT/'source/examples/portrait-shell.html').read_text(encoding='utf8')
native=native.replace('href="style.css"','href="../../source/template/style.css"').replace('src="assets/presenter.png"','src="../anim3/assets/presenter.svg"')
start=native.index('<script src=');last=native.index('<script>\n',start)
deps='<script src="../anim3/demo-bootstrap.js"></script>\n<script>window.DEMO_ASSET_BASE="../anim3/assets/";window.SUBS=[{t0:4,t1:9,zh:"示意字幕 · 原竖屏布局",en:"Illustrative subtitle · portrait layout",sp:[[4,9,12]]}];</script>\n<script src="../anim4/lib.js"></script>\n<script src="../anim3/demo-media.js"></script>\n<script src="../anim4/scenes.js"></script>\n<script src="../anim4/main.js"></script>\n<script src="../anim3/demo-runtime.js"></script>\n'
native=native[:start]+deps+native[last:]
(OUT/'portrait-shell-native.html').write_text(native,encoding='utf8')
print(json.dumps({'ui':len(out),'fragments':list(fragments)},ensure_ascii=False))
