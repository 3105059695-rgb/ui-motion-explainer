/* Authored adaptation of observed explanation mechanisms, not the author's project.
 * Load AgentEditorial first. Every pose is an absolute-time calculation.
 * No source palette, source verdicts, old narration or brand identities are defaults.
 */
(function(root,factory){
  const sdk=typeof module==='object'&&module.exports?require('../../agent-editorial/agent-editorial.js'):root.AgentEditorial;
  const api=factory(sdk);if(typeof module==='object'&&module.exports)module.exports=api;root.ArunReference=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(A){
  'use strict';
  if(!A)throw new Error('Load AgentEditorial before ArunReference');
  const kinds=Object.freeze(['objects','evidence','dock','ecosystem','quota','blocked','blackbox','independent','versions','comparison','decision']);
  const C=A.clamp, mix=A.mix, out=A.out;
  const defaults={x:300,y:250,w:1320,h:650};
  function eventProgress(t,events,id,start=0,duration=.6){
    const event=(events||[]).find(e=>e.id===id);
    const at=event?.at??event?.start??start;
    const span=event?.start!==undefined&&event?.end!==undefined
      ? (Number.isFinite(event.start)&&Number.isFinite(event.end)?event.end-event.start:NaN) : duration;
    const length=event?.duration??span;
    if(!Number.isFinite(at)||!Number.isFinite(length)||length<=0)throw new Error('Invalid motion event '+id);
    return out((t-at)/length);
  }
  function rect(r,base=defaults){return {...base,...r};}
  function interpolate(a,b,p){return A.rectMix(rect(a),rect(b),p);}
  function slot(i,count,r){const gap=32,w=(r.w-gap*(count-1))/Math.max(1,count);return{x:r.x+i*(w+gap),y:r.y,w,h:r.h};}
  function stateAt(spec,t){
    if(!kinds.includes(spec.kind))throw new Error('Unknown reference mechanism: '+spec.kind);
    if(!Number.isFinite(t))throw new Error('Finite localTime required');
    const events=spec.events||[],p=(id,start,duration)=>eventProgress(t,events,id,start,duration);
    const items=(spec.objects||spec.items||[]).map((item,i)=>({...item,id:item.id||'object-'+i}));
    if(new Set(items.map(x=>x.id)).size!==items.length)throw new Error('Object IDs must be unique');
    const focus=spec.focus??0;
    const state={kind:spec.kind,time:t,focus,items:[],progress:p('enter',0,.65),exit:p('exit',1e9,.55)};
    if(spec.kind==='objects'||spec.kind==='evidence'){
      const start=rect(spec.region,{x:310,y:340,w:1300,h:310});
      const focusP=p('focus',spec.kind==='evidence'?0:1e9,.75),returnP=p('return',1e9,.65);
      state.focusProgress=focusP*(1-returnP);
      state.items=items.map((item,i)=>{
        const a=rect(item.from,slot(i,items.length,start));
        const b=rect(item.to,{x:330+i*260,y:760,w:224,h:130});
        const r=interpolate(a,b,state.focusProgress);
        const entry=p('enter-'+item.id,i*.1,.6);
        return {...item,rect:{...r,y:r.y+80*(1-entry)},opacity:entry,rotation:(item.rotation??(i-(items.length-1)/2)*.025)*(1-state.focusProgress)};
      });
      state.evidenceProgress=p('reveal',spec.kind==='evidence'||spec.evidence ? .35:1e9,.7)*(1-returnP);
      state.evidenceRect=interpolate(spec.evidenceFrom||{x:800,y:720,w:120,h:90},spec.evidenceRect||{x:370,y:205,w:1160,h:510},state.evidenceProgress);
      state.annotation=p('annotate',1.4,.6);
    }else if(spec.kind==='dock'){
      state.rect=interpolate(spec.from||defaults,spec.to||{x:1510,y:90,w:315,h:205},p('dock',.65,.75));
      state.docked=p('dock',.65,.75);
      state.items=items;
    }else if(spec.kind==='ecosystem'){
      const region=rect(spec.region,{x:310,y:250,w:1300,h:610}),cx=region.x+region.w/2,cy=region.y+region.h/2;
      state.center={x:cx-130,y:cy-100,w:260,h:200};
      state.items=items.map((item,i)=>{const a=(i/Math.max(items.length,1))*Math.PI*2-Math.PI/2;
        const q=p('node-'+item.id,.15+i*.12,.65)*(1-p('gather',1e9,.65));
        return {...item,rect:{x:cx+Math.cos(a)*region.w*.38*q-95,y:cy+Math.sin(a)*region.h*.39*q-65,w:190,h:130},progress:q};});
    }else if(spec.kind==='quota'||spec.kind==='blocked'){
      state.amount=mix(spec.fromAmount??(spec.kind==='quota'?1:0),spec.toAmount??(spec.kind==='quota'?0:.5),p('change',.45,1.4));
      state.blocked=spec.kind==='blocked'?p('block',1.9,.35):0;
      state.elapsed=mix(spec.fromSeconds??0,spec.toSeconds??15,p('change',.45,1.4));
      state.cursor=p('takeover',2.3,.65);
    }else if(spec.kind==='blackbox'){
      state.close=p('close',0,.6);state.open=p('open',1.5,.8);
      state.wait=mix(spec.waitSeconds??5,0,p('wait',.6,.9));
      state.result=p('result',2.0,.55)*state.open;
    }else if(spec.kind==='independent'){
      state.items=items.map((item,i)=>({...item,entry:p('enter-'+item.id,i*.15,.55),amount:mix(item.fromAmount??1,item.toAmount??(i===focus?0:1),p('change',1,1.25))}));
    }else if(spec.kind==='versions'){
      state.items=items.map((item,i)=>({...item,entry:p('version-'+item.id,i*.8,.55),strike:p('strike-'+item.id,i<items.length-1?i*.8+.45:1e9,.35)}));
    }else if(spec.kind==='comparison'||spec.kind==='decision'){
      state.items=items.map((item,i)=>({...item,entry:p('row-'+item.id,i*.48,.55),answer:p('answer-'+item.id,i*.48+.3,.55)}));
    }
    return state;
  }
  function stamp(D,word,x,y,amount=1){
    const {ctx,C}=D;ctx.save();ctx.globalAlpha*=amount;ctx.translate(x,y);ctx.rotate(-.16);
    const scale=1+.2*(1-amount);ctx.scale(scale,scale);ctx.strokeStyle=C.black;ctx.lineWidth=4;
    ctx.beginPath();ctx.ellipse(0,0,106,47,0,0,Math.PI*2);ctx.stroke();D.text(word,0,13,36,C.black,850,'center',180);ctx.restore();
  }
  function cursor(D,x,y,p=1){const{ctx,C}=D;ctx.save();ctx.globalAlpha*=p;ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,49);ctx.lineTo(14,37);ctx.lineTo(24,57);ctx.lineTo(35,51);ctx.lineTo(23,32);ctx.lineTo(43,29);ctx.closePath();ctx.fillStyle=C.white;ctx.strokeStyle=C.black;ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.restore();}
  function imageOrSchematic(D,item,r,asset){
    if(item.asset){
      let im;try{im=asset?.(item.asset);}catch(e){throw new Error('Missing reference material '+item.asset+': '+e.message);}
      if(!im)throw new Error('Missing reference material '+item.asset);
      D.image(im,r,{fit:item.fit||'contain',crop:item.crop,radius:12});return;
    }
    if(item.draw){item.draw(D,r);return;}
    D.rr(r.x,r.y,r.w,r.h,12,D.C.paper);D.text('示意 · '+(item.label||'待替换材料'),r.x+r.w/2,r.y+r.h/2,28,D.C.muted,650,'center',r.w-40);
  }
  function product(D,item,r,asset,opts={}){
    D.card(r,{radius:20,depth:7,dark:opts.dark});
    const ink=opts.dark?D.C.white:D.C.black;
    if(item.asset){imageOrSchematic(D,item,{x:r.x+20,y:r.y+20,w:r.w-40,h:Math.max(40,r.h*.4)},asset);}
    else {const size=Math.min(36,r.h*.18),y=r.y+Math.min(25,r.h*.13);D.rr(r.x+24,y,size,size,Math.min(10,size*.28),D.C.purple);D.text(item.mark||String(item.id).slice(-1).toUpperCase(),r.x+24+size/2,y+size*.73,Math.min(22,size*.62),D.C.black,800,'center');}
    D.text(item.label||item.id,r.x+24,r.y+r.h*.58,Math.min(38,r.h*.2),ink,850,'left',r.w-48);
    if(item.detail)D.text(item.detail,r.x+24,r.y+r.h*.8,Math.min(25,r.h*.14),opts.dark?D.C.line:D.C.muted,550,'left',r.w-48);
    D.rr(r.x+20,r.y+r.h-12,r.w-40,5,2,D.C.purple);
  }
  function board(D,items,r){
    const gap=9,rowH=(r.h-gap*(items.length-1))/Math.max(items.length,1),size=Math.min(30,rowH*.38);
    items.forEach((item,i)=>{const y=r.y+i*(rowH+gap);D.card({x:r.x,y,w:r.w,h:rowH},{dark:true,depth:4,radius:Math.min(14,rowH*.2),shadow:15});
      D.text(item.label||item.id,r.x+18,y+rowH*.65,size,D.C.white,750,'left',r.w*.65);
      D.pill(item.status||'待确认',{x:r.x+r.w*.71,y:y+rowH*.18,w:r.w*.23,h:rowH*.65},{size:size*.7,fill:D.C.purple});});
  }
  function drawFrame(spec,state,env){
    const {D,asset}=env,{ctx,C}=D;
    const title=spec.title;
    if(title)D.text(title,130,122,48,C.black,850,'left',1400);
    const region=rect(spec.region);
    if(spec.kind==='objects'||spec.kind==='evidence'){
      state.items.forEach(item=>D.place(item.rect,(_,r)=>product(D,item,r,asset),{opacity:item.opacity,rotation:item.rotation}));
      if(state.evidenceProgress>0){
        ctx.save();ctx.globalAlpha*=state.evidenceProgress;
        const inset=D.screen(state.evidenceRect,spec.evidence?.title||'材料与结果',{titleSize:25});
        imageOrSchematic(D,spec.evidence||{},inset,asset);
        if(state.annotation>0){const f=spec.annotation||{x:.55,y:.28,w:.3,h:.26};ctx.save();ctx.beginPath();ctx.rect(inset.x,inset.y,inset.w*state.annotation,inset.h);ctx.clip();ctx.strokeStyle=C.black;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(inset.x+(f.x+f.w/2)*inset.w,inset.y+(f.y+f.h/2)*inset.h,f.w*inset.w/2,f.h*inset.h/2,-.035,0,Math.PI*2);ctx.stroke();ctx.restore();cursor(D,inset.x+f.x*inset.w+f.w*inset.w*.8,inset.y+(f.y+f.h)*inset.h,state.annotation);}
        ctx.restore();
      }
    }else if(spec.kind==='dock'){
      board(D,state.items,state.rect);
      if(state.docked>.5&&spec.next){const q=(state.docked-.5)*2;const r=rect(spec.next.rect,{x:650,y:390,w:400,h:280});D.place({...r,y:r.y+(1-q)*150},(_,rr)=>product(D,spec.next,rr,asset),{opacity:q});}
    }else if(spec.kind==='ecosystem'){
      const c=state.center;
      state.items.forEach(item=>{ctx.save();ctx.globalAlpha*=item.progress;ctx.setLineDash([7,9]);D.line(c.x+c.w/2,c.y+c.h/2,item.rect.x+95,item.rect.y+65,C.muted,3);ctx.restore();});
      state.items.forEach(item=>D.place(item.rect,(_,r)=>product(D,item,r,asset),{opacity:item.progress}));
      product(D,spec.center||{id:'center',label:'共同来源'},c,asset,{dark:true});
    }else if(spec.kind==='quota'||spec.kind==='blocked'){
      const r=rect(spec.track,{x:330,y:475,w:1260,h:82});
      D.pill(spec.label||'任务过程',{x:r.x,y:r.y-100,w:360,h:60},{size:31});
      D.progress(r,state.amount,{fill:state.blocked>.1?C.line:C.purple});
      D.text(Math.round(state.amount*100)+'%',r.x+r.w*state.amount,r.y-25,54,C.black,850,'center');
      if(spec.kind==='quota')D.text(Math.round(state.elapsed)+' 秒',r.x+r.w,r.y+150,44,C.black,800,'right');
      if(state.blocked>0)stamp(D,spec.blockLabel||'停在这里',r.x+r.w*state.amount,r.y+20,state.blocked);
      if(state.cursor>0){cursor(D,r.x+r.w*.62,r.y+140,state.cursor);D.pill(spec.takeoverLabel||'需要可见结果',{x:r.x+r.w*.55,y:r.y+215,w:340,h:58},{size:25,fill:C.purple});}
    }else if(spec.kind==='blackbox'){
      const r=rect(spec.box,{x:570,y:360,w:780,h:310}),depth=70,open=state.open;
      ctx.save();ctx.globalAlpha*=state.close;
      // The lid and result move independently, so waiting/opening is a visible event.
      D.shadow(()=>D.rr(r.x,r.y,r.w,r.h,4,C.black),{blur:35,offsetY:25});
      ctx.beginPath();ctx.moveTo(r.x+r.w,r.y);ctx.lineTo(r.x+r.w+depth,r.y-depth*.7);ctx.lineTo(r.x+r.w+depth,r.y+r.h-depth*.7);ctx.lineTo(r.x+r.w,r.y+r.h);ctx.closePath();ctx.fillStyle=C.muted;ctx.fill();
      ctx.save();ctx.translate(r.x,r.y);ctx.rotate(-open*.035);ctx.translate(0,-open*100);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(depth,-depth*.7);ctx.lineTo(r.w+depth,-depth*.7);ctx.lineTo(r.w,0);ctx.closePath();ctx.fillStyle=C.line;ctx.fill();ctx.restore();
      D.text(spec.label||'处理中',r.x+r.w/2,r.y+r.h*.62,70,C.white,850,'center');
      D.text(state.open<.1?Math.ceil(state.wait)+'s':spec.resultLabel||'结果待核对',r.x+r.w/2,r.y+r.h+100,38,C.black,750,'center');
      if(state.result>0){D.pill(spec.resultSymbol||'?',{x:r.x+r.w/2-55,y:r.y-65-state.result*25,w:110,h:110},{size:65,fill:C.purple});}
      ctx.restore();
    }else if(spec.kind==='independent'){
      const r=rect(spec.region,{x:470,y:320,w:980,h:430});
      state.items.forEach((item,i)=>{const s=slot(i,state.items.length,r);ctx.save();ctx.globalAlpha*=item.entry;const y=s.y+80*(1-item.entry);
        D.card({x:s.x,y,w:s.w,h:s.h},{dark:true,radius:24,depth:8});
        const inner={x:s.x+25,y:y+28,w:s.w-50,h:s.h-115};ctx.save();ctx.beginPath();ctx.roundRect(inner.x,inner.y,inner.w,inner.h,12);ctx.clip();D.rr(inner.x,inner.y+inner.h*(1-item.amount),inner.w,inner.h*item.amount,0,C.purple);ctx.restore();
        D.text(item.label||item.id,s.x+s.w/2,y+s.h-37,32,C.white,750,'center',s.w-30);
        if(item.amount<.01)D.text(item.emptyLabel||'已耗尽',s.x+s.w/2,y+inner.h*.55,30,C.white,750,'center');
        else if(state.time>2.3)D.check(s.x+s.w-20,y+20,24);
        ctx.restore();});
    }else if(spec.kind==='versions'){
      state.items.forEach((item,i)=>{const p=item.entry,r={x:450+i*145+(1-p)*480,y:285+i*55,w:760,h:445};ctx.save();ctx.globalAlpha*=p;
        D.place(r,(_,rr)=>{D.sheet(rr,item.label||'版本 '+(i+1),{size:35,lines:item.lines||['示意内容 · 请换成本期真实材料'],bodySize:26});if(item.strike>0){D.line(rr.x+25,rr.y+140,rr.x+25+(rr.w-80)*item.strike,rr.y+132,C.black,4);}}, {rotation:(i%2?1:-1)*.018});ctx.restore();});
    }else if(spec.kind==='comparison'){
      const r=rect(spec.region,{x:340,y:245,w:1240,h:590}),heads=spec.columns||['方案一','方案二'];
      heads.forEach((label,i)=>D.pill(label,{x:r.x+r.w*.45+i*r.w*.26,y:r.y-55,w:r.w*.23,h:65},{size:30,fill:i===(spec.selected??0)?C.purple:C.black}));
      const rowH=Math.min(112,r.h/Math.max(state.items.length,1));
      state.items.forEach((item,i)=>{ctx.save();ctx.globalAlpha*=item.entry;const y=r.y+50+i*rowH+(1-item.entry)*45;D.card({x:r.x,y,w:r.w,h:rowH-15},{dark:true,depth:5});D.text(item.label||item.id,r.x+28,y+rowH*.54,30,C.white,650,'left',r.w*.38);(item.values||[]).forEach((value,j)=>D.text(value,r.x+r.w*.56+j*r.w*.26,y+rowH*.54,30,j===(spec.selected??0)?C.purple:C.white,750,'center',r.w*.22));ctx.restore();});
    }else if(spec.kind==='decision'){
      const r=rect(spec.region,{x:340,y:260,w:1240,h:570}),rowH=Math.min(160,r.h/Math.max(state.items.length,1));
      state.items.forEach((item,i)=>{const y=r.y+i*rowH;ctx.save();ctx.globalAlpha*=item.entry;D.card({x:r.x,y:y+(1-item.entry)*40,w:r.w,h:rowH-22},{dark:true,radius:20,depth:6});D.text(item.label||item.id,r.x+35,y+rowH*.52,33,C.white,700,'left',r.w*.52);ctx.restore();if(item.answer>0){ctx.save();ctx.globalAlpha*=item.answer;D.arrow(r.x+r.w*.57,y+rowH*.43,r.x+r.w*(.57+.15*item.answer),y+rowH*.43,C.purple,5);D.text(item.result||'待本期证据决定',r.x+r.w*.77,y+rowH*.52,34,C.white,800,'left',r.w*.21);ctx.restore();}});
    }
    return state;
  }
  function createScene(spec){
    if(!spec||!kinds.includes(spec.kind))throw new Error('A known mechanism kind is required');
    return function(env){
      if(!env?.D)throw new Error('StoryScenes environment requires D');
      const current={...spec,...(env.segment?.params||{}),events:env.segment?.events||spec.events||[]};
      return drawFrame(current,stateAt(current,env.localTime??env.t??0),env);
    };
  }
  return Object.freeze({version:'1.0.0',kinds,eventProgress,stateAt,createScene,drawFrame});
});
