/* Physical editorial props adapted from the reading sample. No external assets; deterministic
   paper grain is prepared once, so every render frame has the same printed surface. */
(()=>{'use strict';
 const grain=document.createElement('canvas');grain.width=grain.height=128;
 const gc=grain.getContext('2d'),pixels=gc.createImageData(128,128);let seed=984713;
 for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=seed>>>24;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=26;}
 gc.putImageData(pixels,0,0);const patterns=new WeakMap();
 function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,Math.max(.01,w),Math.max(.01,h),Math.min(r,w/2,h/2));}
 function fill(c,x,y,w,h,r,color){rr(c,x,y,w,h,r);c.fillStyle=color;c.fill();}
 function rule(c,x,y,x2,y2,col,width){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=width;c.stroke();}
 function type(c,s,x,y,size,color,weight=700,font='Microsoft YaHei'){c.font=`${weight} ${size}px "${font}",sans-serif`;c.fillStyle=color;c.textAlign='left';c.textBaseline='alphabetic';c.fillText(s,x,y);}
 function hash(s){let n=0;for(const a of s)n=(Math.imul(n,31)+a.charCodeAt(0))>>>0;return n;}
 function darkOf(col){const v=/^#([a-f\d]{6})$/i.exec(col||'');if(!v)return false;const x=parseInt(v[1],16);return .2126*(x>>16)+.7152*((x>>8)&255)+.0722*(x&255)<110;}
 function book(c,x,y,w,h,title='书目',color='#eee9df',rot=0,sub='READING',small=false,time=0){
  if(w<.5||h<.5)return;
  const dark=darkOf(color),id=hash(title+sub),variant=id%3;
  const base=dark?'#202123':['#eae7df','#e5e6e4','#eae8e5'][variant];
  const ink=dark?'#faf9f4':'#202123',muted=dark?'#b3b3b3':'#777772';
  const accent=dark?'#c9b5ef':'#7650b6',u=w/250,depth=Math.max(7,w*.044);
  c.save();c.translate(x,y);c.rotate(rot*Math.PI/180);
  const l=-w/2,t=-h/2,r=w/2,b=h/2;
  // A broad penumbra plus a near contact shadow supplies physical separation.
  c.save();c.shadowColor='rgba(10,11,16,.23)';c.shadowBlur=38*u;c.shadowOffsetX=8*u;c.shadowOffsetY=25*u;
  fill(c,l+6*u,t+8*u,w-2*u,h,6*u,'#d5d3cd');c.restore();
  c.save();c.shadowColor='rgba(12,12,14,.24)';c.shadowBlur=8*u;c.shadowOffsetY=7*u;
  fill(c,l+8*u,t+8*u,w-3*u,h-2*u,4*u,'#c6c2b9');c.restore();
  // Back board, tightly bound page block, then the front board.
  fill(c,l+depth*.8,t+depth*.9,w-2*u,h,4*u,dark?'#28292b':'#999990');
  const paper=c.createLinearGradient(l,t,r+depth,b);paper.addColorStop(0,'#e4e0d5');paper.addColorStop(.28,'#faf7ed');paper.addColorStop(.83,'#e6e2d8');paper.addColorStop(1,'#c0bdb4');
  fill(c,l+12*u,t+8*u,w-9*u+depth*.55,h+depth*.42,3*u,paper);
  for(let i=1;i<7;i++){
   const d=i*depth/7;rule(c,l+20*u,b+d*.73,r+depth*.55,b+d*.73,'rgba(91,84,68,.17)',.7*u);
   rule(c,r+d*.65,t+14*u,r+d*.65,b+2*u,'rgba(110,104,88,.14)',.55*u);
  }
  const face=c.createLinearGradient(l,t,r,t);face.addColorStop(0,dark?'#45464a':'#b1b1aa');face.addColorStop(.035,dark?'#202123':'#dad8d0');face.addColorStop(.095,base);face.addColorStop(.15,dark?'#303133':'#f1efe8');face.addColorStop(.23,base);face.addColorStop(.85,base);face.addColorStop(1,dark?'#1c1d1f':'#d4d3cb');
  fill(c,l,t,w,h,4*u,face);
  // Rounded book hinge is lit separately from the printed board.
  rule(c,l+19*u,t+5*u,l+19*u,b-5*u,dark?'rgba(0,0,0,.6)':'rgba(71,66,56,.27)',1.3*u);
  rule(c,l+21*u,t+6*u,l+21*u,b-7*u,dark?'rgba(255,255,255,.09)':'rgba(255,255,255,.58)',.8*u);
  rule(c,l+5*u,t+.7*u,r-3*u,t+.7*u,dark?'rgba(255,255,255,.22)':'rgba(255,255,255,.88)',1*u);
  rule(c,r-1*u,t+3*u,r-1*u,b-3*u,'rgba(0,0,0,.12)',.8*u);
  const px=l+36*u,pw=w-57*u,top=t+30*u;
  type(c,'READING   /   COLLECTION',px,top,8.4*u,muted,600);
  rule(c,px,top+11*u,px+pw,top+11*u,dark?'#59595c':'#aaa99f',.7*u);
  fill(c,px,top+20*u,25*u,4*u,0,accent);
  // Hierarchical typography: one principal title; crisp printed information below.
  const lines=String(title).split('\n');const longest=Math.max(...lines.map(s=>s.length));
  const fs=Math.min(small?39:44,pw/u/Math.max(2,longest)*.92)*u;
  const titleY=t+h*.29;
  lines.forEach((s,i)=>type(c,s,px,titleY+i*fs*1.24,fs,ink,900,'Heavy'));
  const artTop=Math.max(t+h*.43,titleY+(lines.length-1)*fs*1.24+23*u),artBottom=b-53*u;
  if(artBottom>artTop+20*u){
   const ah=artBottom-artTop;
   // An embossed-looking editorial index, not stock circles or empty decoration.
   fill(c,px,artTop,pw,ah,1*u,dark?'#17181a':'#dddcd4');
   const panel=c.createLinearGradient(px,artTop,px+pw,artBottom);panel.addColorStop(0,dark?'#303135':'#f0eee6');panel.addColorStop(.55,dark?'#1e1f22':'#e2e0d7');panel.addColorStop(1,dark?'#151618':'#c7c8c0');
   fill(c,px,artTop,pw,ah,1*u,panel);
   c.save();rr(c,px,artTop,pw,ah,1*u);c.clip();
   const num=String((String(sub).match(/\d+/)||['01'])[0]).padStart(2,'0');
   type(c,num,px+10*u,artBottom-8*u,Math.min(ah*.84,pw*.7),dark?'#85868b':'#656762',900,'Arial');
   fill(c,px+pw-13*u,artTop,13*u,ah,0,accent);
   rule(c,px+10*u,artTop+12*u,px+pw-26*u,artTop+12*u,dark?'#88888c':'#999b95',.6*u);
   type(c,'THINK / READ / CONNECT',px+10*u,artTop+25*u,6.4*u,dark?'#c2c2c4':'#70736d',600);
   c.restore();
   rule(c,px,artBottom,px+pw,artBottom,dark?'rgba(255,255,255,.13)':'rgba(255,255,255,.8)',.8*u);
  }
  type(c,String(sub).slice(0,25),px,b-29*u,9*u,muted,600);
  type(c,'书目示意',px,b-14*u,8.5*u,muted,500);
  // Edge glint and subtle static fibre texture unify print and board material.
  c.save();rr(c,l+22*u,t+2*u,w-24*u,h-4*u,2*u);c.clip();
  let pattern=patterns.get(c);if(!pattern){pattern=c.createPattern(grain,'repeat');patterns.set(c,pattern);}
  c.globalAlpha*=dark?.20:.31;c.globalCompositeOperation='soft-light';c.fillStyle=pattern;c.fillRect(l,t,w,h);c.restore();
  c.restore();
 }
 window.PremiumMaterials=Object.freeze({book});
})();
