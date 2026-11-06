/* Small semantic additions to the user-approved v4 choreography.
   Assets are preloaded; render(time) remains deterministic and seekable. */
window.openingStickers = (() => {
  const files = {
    brand: 'deepseek-official.png', book: 'open-book.svg', blocks: 'token-blocks.svg',
    dizzy: 'dizzy.svg', blink: 'dizzy-blink.svg'
  };
  const assets = {};
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x*x*x*(10-15*x+6*x*x); };
  const progress = (t,a,b) => ease((t-a)/(b-a));
  const ready = Promise.all(Object.entries(files).map(([key,file]) => new Promise((resolve,reject) => {
    const im = new Image(); im.onload = () => { assets[key] = im; resolve(); };
    im.onerror = () => reject(new Error('Sticker failed to load: ' + file));
    im.src = 'assets/stickers-v5/' + file;
  })));
  function star(ctx,x,y,r,rotation,opacity) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rotation); ctx.globalAlpha *= opacity;
    ctx.beginPath();
    for(let i=0;i<8;i++) { const a=i*Math.PI/4,rad=i%2?r*.24:r; const xx=Math.cos(a)*rad,yy=Math.sin(a)*rad;
      i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); }
    ctx.closePath(); ctx.fillStyle='#E0CCFA'; ctx.fill(); ctx.restore();
  }
  function sticker(ctx,t,{key,x,y,size,start,end,angle=0,exitX=50,exitY=-32,badge=false}) {
    const age=t-start,enter=progress(t,start,start+.48);
    const leave=end===undefined?0:progress(t,end-.32,end);
    if(age<=0||leave>=1)return;
    const bounce = age<.82 ? Math.sin(Math.min(age/.82,1)*Math.PI*2)*Math.exp(-age*6)*.18 : 0;
    const scale=(.68+.32*enter+bounce)*(1-.17*leave);
    ctx.save(); ctx.globalAlpha*=progress(t,start,start+.14)*(1-leave);
    ctx.translate(x+exitX*leave, y+48*(1-enter)+exitY*leave);
    ctx.rotate(angle + .28*(1-enter) - .12*leave);
    ctx.scale(scale*(.74+.26*enter),scale);
    if(badge){
      ctx.save();ctx.shadowColor='#00000045';ctx.shadowBlur=14;ctx.shadowOffsetY=9;
      ctx.beginPath();ctx.roundRect(-size/2,-size/2,size,size,31);ctx.fillStyle='#FFFFFF';ctx.fill();ctx.restore();
      ctx.drawImage(assets[key],-size*.36,-size*.36,size*.72,size*.72);
    }else ctx.drawImage(assets[key],-size/2,-size/2,size,size);
    ctx.restore();
  }
  function draw(ctx,t) {
    // Real product identity in the free room space below the opening AI title.
    sticker(ctx,t,{key:'brand',x:1550,y:834,size:126,start:.88,end:2.00,angle:-.065,exitX:85,badge:true});
    if(t>.98&&t<1.88){const a=progress(t,.98,1.25)*(1-progress(t,1.64,1.88));
      star(ctx,1658,789,15,.10+t*.18,a);star(ctx,1452,864,8,-.25,a*.8);}
    // The book stays outside the course window and the extracted Token paths.
    sticker(ctx,t,{key:'book',x:312,y:540,size:250,start:2.17,end:3.95,angle:-.12,exitX:115,exitY:-145});
    // These are language pieces rather than money, matching the topic.
    sticker(ctx,t,{key:'blocks',x:1609,y:547,size:267,start:5.35,end:6.55,angle:.045,exitX:75,exitY:35});
    // A single brief blink adds expression during “一头雾水”.
    const blink=(t>=8.68&&t<8.82);
    sticker(ctx,t,{key:blink?'blink':'dizzy',x:314,y:746,size:247,start:8.12,end:9.36,
      angle:-.07+Math.sin(clamp((t-8.18)/.85)*Math.PI*2)*.035,exitX:-80,exitY:-12});
    // Return the same logo at the final “用 AI” phrase for visual continuity.
    sticker(ctx,t,{key:'brand',x:1560,y:828,size:133,start:11.28,angle:.065,badge:true});
    if(t>11.4){const a=progress(t,11.40,11.84);star(ctx,1665,774,14,-.12,a);star(ctx,1455,864,8,.28,a*.75);}
  }
  return {ready,draw};
})();
