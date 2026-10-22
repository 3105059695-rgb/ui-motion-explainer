(function(root){
  'use strict';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,p)=>a+(b-a)*p;
  const ease=v=>{v=clamp(v);return v<.5?16*v**5:1-(-2*v+2)**5/2;};
  const progress=(t,start,duration)=>ease((t-start)/Math.max(.001,duration));
  const spring=v=>{if(v<=0)return 0;if(v>=1)return 1;const d=.81,w=12,q=Math.sqrt(1-d*d);return 1-Math.exp(-d*w*v)*(Math.cos(w*q*v)+d/q*Math.sin(w*q*v));};
  /** Pure, seekable geometry. Coordinates describe the measured vacant region in
   * the actual presenter shot. Timings are caller supplied or relative to duration.
   * Cards remain individual objects; there is no built-in subject, palette or text. */
  function layout(t,options={}){
    const b=options.bounds||{x:0,y:0,width:1,height:1};
    const duration=Math.max(.1,options.duration||1),tim=options.timing||{};
    const enter=tim.enter??duration*.06,stagger=tim.stagger??duration*.07;
    const settle=tim.settle??duration*.17,focusAt=tim.focusAt??duration*.52;
    const focusDuration=tim.focusDuration??duration*.12;
    const exitAt=tim.exitAt??duration*.88,exitDuration=tim.exitDuration??duration*.12;
    const cards=options.cards||[{}],focus=progress(t,focusAt,focusDuration);
    const result=cards.map((card,index)=>{
      const rank=card.depth??index,isHero=index===(options.hero??0);
      const entry=spring((t-enter-rank*stagger)/settle);
      const width=card.width??b.width*.46,height=card.height??b.height*.62;
      const targetX=card.x??b.x+b.width*(.48+rank*.16);
      const targetY=card.y??b.y+b.height*(.56-rank*.05);
      const focusScale=isHero?(options.focusScale??1.07):.965;
      const scale=mix(.9,1,entry)*mix(1,focusScale,focus);
      return {index,z:isHero?cards.length+1:cards.length-rank,x:targetX+(1-entry)*b.width*(.36+rank*.08)+(isHero?-b.width*.018:0)*focus,
        y:targetY+(1-entry)*b.height*.10-(isHero?b.height*.025:0)*focus,
        width:width*scale,height:height*scale,rotate:mix(card.enterRotate??12,card.rotate??-4,entry)*(1-(isHero?.5:0)*focus),
        opacity:clamp(entry*2.5)*(isHero?1:mix(1,.78,focus)),depth:(card.depthPx??6)*scale,
        focus,entry,highlight:progress(t,enter+rank*stagger+settle*.2,settle*.9)};
    });
    const hero=result[options.hero??0];
    return {bounds:b,cards:result.sort((a,b)=>a.z-b.z),hero,focus,
      exit:progress(t,exitAt,exitDuration),title:progress(t,tim.titleAt??duration*.37,tim.titleDuration??duration*.1)};
  }
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));}
  /** Actual image preserved, with restrained board thickness and directional light.
   * No blur is applied to factual source pixels. */
  function drawCard(ctx,image,state,material={}){
    const w=state.width,h=state.height,r=material.radius??14,d=state.depth;
    ctx.save();ctx.globalAlpha*=state.opacity;ctx.translate(state.x,state.y);ctx.rotate(state.rotate*Math.PI/180);
    ctx.shadowColor=material.shadow??'rgba(15,18,25,.22)';ctx.shadowBlur=material.shadowBlur??28;ctx.shadowOffsetY=material.shadowY??17;
    rounded(ctx,-w/2+d,-h/2+d,w,h,r);ctx.fillStyle=material.edge??'#a7a9af';ctx.fill();ctx.shadowColor='transparent';
    for(let i=3;i>0;i--){rounded(ctx,-w/2+i*d/3,-h/2+i*d/3,w,h,r);ctx.fillStyle=i%2?'#dbdce1':'#f8f9fb';ctx.fill();}
    rounded(ctx,-w/2,-h/2,w,h,r);ctx.fillStyle=material.face??'#fff';ctx.fill();
    ctx.save();rounded(ctx,-w/2+3,-h/2+3,w-6,h-6,Math.max(1,r-3));ctx.clip();ctx.drawImage(image,-w/2+3,-h/2+3,w-6,h-6);
    const light=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);light.addColorStop(0,'rgba(255,255,255,.10)');light.addColorStop(.4,'rgba(255,255,255,0)');light.addColorStop(1,'rgba(11,15,25,.025)');ctx.fillStyle=light;ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();
    rounded(ctx,-w/2+.6,-h/2+.6,w-1.2,h-1.2,r);ctx.strokeStyle=material.rim??'rgba(255,255,255,.95)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.restore();
  }
  /** Reveal next actual scene from the featured material's location. It never
   * inserts a blank frame. Callers provide the next scene and screen bounds. */
  function revealNext(ctx,state,drawNext,screen={x:0,y:0,width:1920,height:1080},nextFocus=null){
    if(state.exit<=0)return;
    const p=state.exit,h=state.hero;
    const x=mix(h.x-h.width/2,screen.x,p),y=mix(h.y-h.height/2,screen.y,p);
    const w=mix(h.width,screen.width,p),height=mix(h.height,screen.height,p);
    ctx.save();ctx.shadowColor='rgba(8,12,20,.24)';ctx.shadowBlur=30*(1-p);ctx.shadowOffsetY=12*(1-p);
    rounded(ctx,x,y,w,height,14*(1-p));ctx.fillStyle='#f8f9fb';ctx.fill();ctx.shadowColor='transparent';
    rounded(ctx,x,y,w,height,14*(1-p));ctx.clip();
    const scale=Math.max(w/screen.width,height/screen.height);
    const focus=nextFocus||{x:screen.x+screen.width/2,y:screen.y+screen.height/2};
    const ax=mix(focus.x,screen.x+screen.width/2,p),ay=mix(focus.y,screen.y+screen.height/2,p);
    ctx.translate(x+w/2-ax*scale,y+height/2-ay*scale);ctx.scale(scale,scale);
    drawNext();ctx.restore();
  }
  root.OpeningStage={layout,drawCard,revealNext};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.OpeningStage;
})(typeof window!=='undefined'?window:globalThis);
