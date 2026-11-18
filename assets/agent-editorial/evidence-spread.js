/* An editable material shot for a StoryScenes event. All copy, media, focus and timing
 * come from the episode. Coordinates passed to focus are fractions of the source image. */
(function(root) {
  'use strict';
  function draw(D,{frame,image,focus,title,caption='',source='',amount=0,mark=0}) {
    const {ctx,C}=D;
    const iw=image?.videoWidth||image?.naturalWidth||image?.width;
    const ih=image?.videoHeight||image?.naturalHeight||image?.height;
    const {x,y,w,h}=frame;
    if(!iw||!ih||![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw Error('A decoded material and a positive frame are required');
    if(!focus||![focus.x,focus.y,focus.w,focus.h].every(Number.isFinite)||focus.x<0||focus.y<0||focus.w<=0||focus.h<=0||focus.x+focus.w>1.000001||focus.y+focus.h>1.000001)throw Error('The focus rectangle must be inside the source image');
    const limit=n=>Math.min(1,Math.max(0,n)),blend=(a,b,t)=>a+(b-a)*t;
    const t=limit(amount),portrait=w/h<1.15,unit=portrait?w/1080:w/1920;
    const margin=portrait?65:92;
    const width=w/unit,height=h/unit;
    const left=margin,top=portrait?54:Math.max(54,height*.20);
    const copyWidth=portrait?width-2*margin:width*.34;
    const lines=Array.isArray(title)?title.map(String):[String(title||'')];
    const font=D.fontFamily||'Noto, "Microsoft YaHei", sans-serif';
    function fitted(lines,normal,width,weight) {
      ctx.font=`${weight} ${normal}px ${font}`;
      const longest=Math.max(1,...lines.map(s=>ctx.measureText(s).width));
      return normal*Math.min(1,width/longest);
    }
    function paragraphs(words,maxWidth,size) {
      ctx.font=`500 ${size}px ${font}`;
      const result=[];
      for(const paragraph of String(words).split('\n')){
        let row='';
        for(const char of Array.from(paragraph)){
          if(row&&ctx.measureText(row+char).width>maxWidth){result.push(row.trimEnd());row='';}
          row+=char;
        }
        if(row)result.push(row.trimEnd());
      }
      return result;
    }
    ctx.save();
    try {
      ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.translate(x,y);ctx.scale(unit,unit);
      ctx.fillStyle=C.paper;ctx.fillRect(0,0,width,height);
      let cursor=top;
      if(source){
        D.line(left,cursor+8,left+45,cursor+8,C.accentInk,3);
        D.text(source,left+62,cursor+17,24,C.muted,650,'left',copyWidth-62);
        cursor+=portrait?88:118;
      }
      const size=fitted(lines,portrait?88:103,copyWidth,850);
      lines.forEach(s=>{D.text(s,left,cursor+size*.80,size,C.black,850);cursor+=size*1.12;});
      if(caption){
        const bodySize=portrait?29:31;
        cursor+=portrait?18:42;
        for(const s of paragraphs(caption,copyWidth,bodySize)){
          D.text(s,left,cursor+bodySize*.82,bodySize,C.muted,500);cursor+=bodySize*1.52;
        }
      }
      const bx=portrait?left:width*.426,by=portrait?cursor+54:height*.077;
      const bw=width-margin-bx,bh=height-by-(portrait?65:height*.077);
      if(bh<48||bw<48)throw Error('Material shot has insufficient space. Shorten the text or give the material its own shot.');
      const full=Math.min(bw/iw,bh/ih),pw=iw*full,ph=ih*full;
      const sx=bx+(bw-pw)/2,sy=by+(bh-ph)/2;
      const fx=focus.x*iw,fy=focus.y*ih,fw=focus.w*iw,fh=focus.h*ih;
      const zoom=Math.max(full,Math.min(pw/fw,ph/fh)*.79);
      // Log scale gives a steady perceived zoom. Clamp translation to the actual paper edge.
      const k=full*Math.pow(zoom/full,t);
      const clampTo=(n,a,b)=>Math.max(a,Math.min(b,n));
      const ox=clampTo(sx+pw/2-k*blend(iw/2,fx+fw/2,t),sx+pw-iw*k,sx);
      const oy=clampTo(sy+ph/2-k*blend(ih/2,fy+fh/2,t),sy+ph-ih*k,sy);
      D.card({x:sx-2,y:sy-2,w:pw+4,h:ph+4},{radius:3,depth:3,shadow:26,shadowOffsetY:11,shadowColor:'#1713232A'});
      ctx.save();
      try {
        ctx.beginPath();ctx.rect(sx,sy,pw,ph);ctx.clip();
        ctx.drawImage(image,ox,oy,iw*k,ih*k);
        if(mark>0){
          const mx=ox+fx*k,my=oy+fy*k,mw=fw*k,mh=fh*k;
          const arm=Math.min(32,mw*.15,mh*.15);
          ctx.globalAlpha*=limit(mark);
          for(const [cx,cy,dx,dy] of [[mx,my,1,1],[mx+mw,my,-1,1],[mx,my+mh,1,-1],[mx+mw,my+mh,-1,-1]]){
            for(const [color,lw] of [[C.white,6],[C.black,2]]){
              D.line(cx+dx*arm,cy,cx,cy,color,lw);D.line(cx,cy,cx,cy+dy*arm,color,lw);
            }
          }
        }
      } finally {ctx.restore();}
    } finally {ctx.restore();}
  }
  const api=Object.freeze({draw});
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.EvidenceSpread=api;
})(typeof globalThis==='undefined'?window:globalThis);
