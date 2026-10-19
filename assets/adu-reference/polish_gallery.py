from pathlib import Path
p=Path(__file__).resolve().parent/'index.html'
s=p.read_text(encoding='utf-8')
s=s.replace('if(!current&&filtered.length)select(filtered[0]);','if(filtered.length&&(!current||!filtered.some(x=>x.id===current.id)))select(filtered[0]);')
s=s.replace('if(b)select(D.items.find(x=>x.id===b.dataset.id))',"if(b){select(D.items.find(x=>x.id===b.dataset.id));window.scrollTo({top:0,behavior:'smooth'})}")
s=s.replace('fit();updateTime();location.hash=encodeURIComponent(item.id);',"fit();updateTime();if(!item.image&&!item.audio&&!matchMedia('(prefers-reduced-motion:reduce)').matches){playing=true;last=performance.now();$('play').textContent='Ⅱ 暂停';}location.hash=encodeURIComponent(item.id);")
mobile='@media(max-width:680px){.workspace{grid-template-columns:minmax(0,1fr)}.transport{flex-wrap:wrap}.transport .time{margin-left:auto}.transport .play{width:65px;flex:none}.plain{flex:none}.fileshead{flex-wrap:wrap}}\n'
s=s.replace(mobile,'').replace('</style>',mobile+'</style>',1)
s=s.replace('onerror="this.remove()"',"onload=\"this.previousElementSibling.style.display='none'\" onerror=\"this.remove()\"") if "this.previousElementSibling.style.display='none'" not in s else s
if 'const startupHash=' not in s:
    s=s.replace('const D=window.CATALOG,$=',"const startupHash=decodeURIComponent(location.hash.slice(1));const D=window.CATALOG,$=")
    s=s.replace('x.id===decodeURIComponent(location.hash.slice(1))','x.id===startupHash')
p.write_text(s,encoding='utf-8')
for name in ['showcase-recipe.html','portrait-shell.html']:
    f=p.parent/'preview/examples'/name
    v=f.read_text(encoding='utf-8')
    v=v.replace('../anim4/style.css','../anim4/preview-style.css')
    v=v.replace('../../source/packs/anim4/style.css','../anim4/preview-style.css')
    v=v.replace("src:url('file:///System/Library/Fonts/SFNSMono.ttf')","src:local('Consolas')")
    f.write_text(v,encoding='utf-8')
