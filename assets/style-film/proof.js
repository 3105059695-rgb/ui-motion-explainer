/* Public calibration shot. The SVG is original demonstration material. */
(() => {
  const canvas=document.getElementById('art'),ctx=canvas.getContext('2d');
  const image=new Image();image.src='print-proof.svg';
  const ready=Promise.all([image.decode(),document.fonts.load('850 94px Noto'),document.fonts.load('500 31px Noto')]);
  const copies=[
    {title:['一张纸，','两层墨。'],caption:'实地黑和雾紫叠在同一张纸上。'},
    {title:['靠近看，','是细线。'],caption:'放大交接处，黑线之间透出雾紫底色。'},
    {title:['退远看，','是一体。'],caption:'同一组线条，回到全版就连成了形。'},
  ];
  const smooth=(t,start,end)=>{const p=Math.max(0,Math.min(1,(t-start)/(end-start)));return p*p*p*(p*(p*6-15)+10);};
  let now=0,raf=0,start=0;
  function draw(t,width=1920,height=1080) {
    now=Math.max(0,Math.min(14,t));
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    const D=AgentEditorial.create(ctx),i=now<4.25?0:now<10?1:2;
    EvidenceSpread.draw(D,{frame:{x:0,y:0,w:width,h:height},image,
      focus:{x:.345,y:.48,w:.265,h:.245},source:'印刷校样',...copies[i],
      amount:smooth(now,4.05,5.42)-smooth(now,9.8,11.25),
      mark:smooth(now,2.75,3.15)-smooth(now,5.45,5.95)+smooth(now,9.35,9.75)-smooth(now,11.15,11.65)});
    document.getElementById('seek').value=now;document.getElementById('clock').textContent=now.toFixed(1)+' / 14 秒';
  }
  const narrow=()=>matchMedia('(max-width:650px)').matches;
  const renderMode=new URLSearchParams(location.search).has('render');
  function display(t){
    const portrait=!renderMode&&narrow();
    const w=portrait?1080:1920,h=portrait?1440:1080;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    draw(t,w,h);
  }
  const stop=()=>{cancelAnimationFrame(raf);raf=0;document.getElementById('play').textContent='播放';};
  function play(){if(raf){stop();return;}start=performance.now()-(now>=14?0:now)*1000;
    document.getElementById('play').textContent='暂停';
    const tick=t=>{display((t-start)/1000);if(now>=14)stop();else raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);
  }
  window.PrintProof={ready,draw,canvas};
  ready.then(()=>{display(0);document.getElementById('play').onclick=play;document.getElementById('seek').oninput=e=>{stop();display(+e.target.value);};window.addEventListener('resize',()=>display(now));})
       .catch(e=>{document.getElementById('clock').textContent='样张或字体加载失败';console.error(e);});
})();
