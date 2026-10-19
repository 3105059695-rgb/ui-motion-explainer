/* Adapter records generated media and keeps the source runtime API available. */
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
