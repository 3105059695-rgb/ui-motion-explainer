(() => {
const row={"id":"M305","pack":"edit-project","cell":3,"duration":3.55,"presentation":"canvas","defaults":{"标题":"从闭源到开源","下一场标题":"开源 JEV\n怎么部署？","撞点横比":0.51,"撞点纵比":0.46,"字幕一":"这次换开源版","字幕二":"先看部署条件"}};
const action=((()=>{
// Shared drawing vocabulary for the eight editable 1080 × 1920 stages.
const C = { paper:'#FFFFFF', ink:'#0B0B0F', gray:'#62616C', well:'#393840', iris:'#D6C2FF' };
const typography = { title:[800,88], body:[550,42], label:[700,38], sub:[700,60], number:[850,104], unit:[700,40] };
const clamp = (n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ramp = (t,a,b)=>clamp((t-a)/(b-a));
const ease = p=>p*p*(3-2*p);
const path = (t,a,b)=>ease(ramp(t,a,b));
const lerp = (a,b,p)=>a+(b-a)*p;
const integer = (v,a,b)=>clamp(Math.round(Number(v)||0),a,b);
function frame(c,t,input){
  const audit = window.MOTION_INSPECT ? {words:[],boxes:[],marks:{}} : null;
  if(audit)c.canvas.motionInspection=audit;
  c.fillStyle=C.paper;c.fillRect(0,0,1080,1920);
  const wordFont=(role,size)=>typography[role][0]+' '+size+'px "MotionCatalogSC","Noto Sans SC",sans-serif';
  function text(value,x,y,role='body',color=C.ink,align='left',limit=920) {
    const s=String(value),normal=typography[role][1];
    if(!s||limit<=0)return 0;
    let size=normal;c.font=wordFont(role,size);
    let m=c.measureText(s);
    if(m.width>limit){size=normal*limit/m.width;c.font=wordFont(role,size);m=c.measureText(s);}
    c.fillStyle=color;c.textAlign=align;c.textBaseline='alphabetic';
    const base=y+(m.fontBoundingBoxAscent-m.fontBoundingBoxDescent)/2;
    c.fillText(s,x,base);
    if(audit&&c.globalAlpha>.94)audit.words.push({s,role,size,weight:typography[role][0],color,nominal:normal,
      x:x-(align==='center'?m.width/2:align==='right'?m.width:0),y:base-m.actualBoundingBoxAscent,
      w:m.width,h:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent});
    return m.width;
  }
  function width(s,role='body'){c.font=wordFont(role,typography[role][1]);return c.measureText(String(s)).width;}
  function box(x,y,w,h,fill=C.paper,stroke=null,edge=8,r=24){
    if(w<=0||h<=0)return;
    // Outline lies inside the declared bounds.
    c.beginPath();c.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)));c.fillStyle=fill;c.fill();
    if(stroke&&w>edge&&h>edge){c.beginPath();c.roundRect(x+edge/2,y+edge/2,w-edge,h-edge,Math.max(0,Math.min(r-edge/2,(w-edge)/2,(h-edge)/2)));c.strokeStyle=stroke;c.lineWidth=edge;c.stroke();}
    if(audit)audit.boxes.push([x,y,w,h,fill,stroke,edge,r]);
  }
  function line(points,color=C.ink,weight=8,dash=[]){
    c.save();c.beginPath();for(let k=0;k<points.length;k+=2){if(!k)c.moveTo(points[k],points[k+1]);else c.lineTo(points[k],points[k+1]);}
    c.strokeStyle=color;c.lineWidth=weight;c.lineCap='round';c.lineJoin='round';c.setLineDash(dash);c.stroke();c.restore();
  }
  function disc(x,y,r,fill=C.ink,stroke=null,weight=8){
    if(r<=0)return;c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fillStyle=fill;c.fill();
    if(stroke){c.strokeStyle=stroke;c.lineWidth=weight;c.stroke();}
  }
  function group(alpha,fn){if(alpha<=0)return;c.save();c.globalAlpha*=clamp(alpha);fn();c.restore();}
  function clip(x,y,w,h,fn){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();fn();c.restore();}
  function split(s,role,limit){
    const out=[];let current='';
    for(const ch of String(s)){if(ch==='\n'){out.push(current);current='';continue;}
      if(current&&width(current+ch,role)>limit){out.push(current);current=ch;}else current+=ch;}
    if(current||!out.length)out.push(current);return out;
  }
  function title(){
    let s=String(input.标题);
    if(width(s,'title')>920&&!s.includes('\n'))s=s.replace(/([，、])(?=.{2,}$)/u,'$1\n');
    const lines=split(s,'title',920);
    if(lines.length>=2&&/^[？?！!。]$/.test(lines.at(-1))){
      const prior=[...lines.at(-2)],last=prior.splice(-3).join('');
      lines[lines.length-2]=prior.join('');lines[lines.length-1]=last+lines.at(-1);
    }
    lines.forEach((word,n)=>text(word,80,236+n*107,'title'));
  }
  function caption(s){
    if(!s)return;
    let lines=split(s,'sub',878);
    if(lines.length>2){const all=lines.join('');let mid=Math.ceil([...all].length/2);
      const chars=[...all];lines=[chars.slice(0,mid).join(''),chars.slice(mid).join('')];}
    const h=82, space=5,top=1670-(lines.length*h+(lines.length-1)*space);
    lines.forEach((l,n)=>{const y=top+n*(h+space),w=Math.min(920,width(l,'sub')+42);
      box((1080-w)/2,y,w,h,C.ink,null,0,10);text(l,540,y+h/2,'sub',C.paper,'center',w-42);});
  }
  function tag(s,x,y,fill=C.iris,fg=C.ink,max=380){
    const w=Math.min(max,width(s,'label')+46);box(x-w/2,y-34,w,68,fill,null,0,14);text(s,x,y,'label',fg,'center',w-36);return w;
  }
  function check(x,y,scale=1,color=C.ink){line([x-18*scale,y,x-5*scale,y+13*scale,x+20*scale,y-16*scale],color,8*scale);}
  function arrow(x,y,size=1,color=C.ink){line([x-size*14,y-size*14,x,y,x-size*14,y+size*14],color,8*size);}
  function mark(values){if(audit)Object.assign(audit.marks,values);}
  return {c,t,i:input,text,width,box,line,disc,group,clip,title,caption,tag,check,arrow,mark,split};
}

const contactImage=new Image();contactImage.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjEyIiBoZWlnaHQ9IjIxNjAiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwIiB3aWR0aD0iMzAzIiBoZWlnaHQ9IjU0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjMwMyIgaGVpZ2h0PSI1NDAiIGZpbGw9IiNmNWY0ZjgiLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAzIiBoZWlnaHQ9IjE4IiBmaWxsPSIjZDZjMmZmIi8+PHRleHQgeD0iMTUxLjUiIHk9IjMwMi40MDAwMDAwMDAwMDAwMyIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzOTM4NDAiPuacrOacn+e0oOadkCDCtyDmjqXop6bniYfmrrU8L3RleHQ+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3ApIi8+PC9zdmc+';
const pk=MotionPrompt.packs['edit-project']||MotionPrompt.pack('edit-project',()=>({width:1080,height:1920,cycle:3.55,cells:[],mounts:[]}));
pk.ready=Promise.all([pk.ready,contactImage.decode()]);
return function(c,nativeWidth,nativeHeight,t,i,assets){
const f=frame(c,t,i);
const {box,text,line,group,title,caption,mark}=f;
const contact=1.63,expose=path(t,.98,contact),q=path(t,contact+.01,2.01),open=path(t,2.10,2.66);
const x=lerp(218,0,expose),y=lerp(465,0,expose),w=lerp(644,1080,expose),h=lerp(956,1920,expose);
const cx=1080*clamp(Number(i.撞点横比),.02,.98),cy=1920*clamp(Number(i.撞点纵比),.02,.98);
function cover(image,sx,sy,sw,sh,dx,dy,dw,dh){
  if(!image||!sw||!sh)return;
  const a=Math.max(dw/sw,dh/sh),cropW=dw/a,cropH=dh/a;
  c.drawImage(image,sx+(sw-cropW)/2,sy+(sh-cropH)/2,cropW,cropH,dx,dy,dw,dh);
}
function brush(){
  // Three staggered, unaligned ink edges leave a continuous slash on the next board.
  c.save();c.beginPath();c.moveTo(0,1296);c.lineTo(1080,904);c.lineTo(1080,1920);c.lineTo(0,1920);c.closePath();c.fillStyle=C.ink;c.fill();
  for(let k=0;k<29;k++){const x0=k*51-190,yy=1374-x0*.37;
    line([x0,yy,x0+142+(k%7)*18,yy-83-(k%4)*16],k%6===0?C.iris:C.ink,k%6===0?14:24);}
  c.restore();
}
function nextBoard(){
  c.fillStyle=C.paper;c.fillRect(0,0,1080,1920);
  const pic=assets['下一场底图'];
  if(pic)cover(pic,0,0,pic.naturalWidth||pic.width,pic.naturalHeight||pic.height,0,0,1080,1920);else brush();
  // On a replacement plate the title sits on paper for consistent contrast.
  if(pic)box(80,238,920,236,C.paper,null,0,24);
  const lines=f.split(i.下一场标题,'title',pic?850:920);
  lines.forEach((s,n)=>text(s,pic?115:80,311+106*n,'title',C.ink,'left',pic?850:920));
}
function star(radius,seed,color,short,long){
  c.beginPath();const count=84;
  for(let j=0;j<count;j++){
    const k=Math.floor(j/2),v=Math.sin((k+seed)*127.1)*43758.5453,noise=v-Math.floor(v);
    const a=(j+seed*.035)*Math.PI*2/count;
    const r=radius*(j%2?short:long*(.71+.29*noise));
    const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;
    if(j)c.lineTo(px,py);else c.moveTo(px,py);
  }
  c.closePath();c.fillStyle=color;c.fill();
}
const live=assets['接触片段'],p=path(t,.52,contact),nativeFrame=Math.min(15,Math.floor(p*16));
if(t<2.10){
  title();const edge=24*(1-expose);box(x,y,w,h,C.ink,null,0,32*(1-expose));
  c.save();c.beginPath();c.roundRect(x+edge,y+edge,w-2*edge,h-2*edge,Math.max(0,12*(1-expose)));c.clip();
  if(live){
    const im=live.frames?live.frames[Math.min(live.frames.length-1,Math.floor(p*live.frames.length))]:live;
    cover(im,0,0,im.naturalWidth||im.width,im.naturalHeight||im.height,x+edge,y+edge,w-2*edge,h-2*edge);
  }else if(contactImage.complete&&contactImage.naturalWidth){
    cover(contactImage,nativeFrame%4*303,Math.floor(nativeFrame/4)*540,303,540,x+edge,y+edge,w-2*edge,h-2*edge);
  }
  c.restore();
  if(t>=contact){
    // First streaks touch the shoe, then lavender/white/black outrun each other.
    const spread=14+q*3490;
    star(spread,2,C.iris,.32,1.00);star(spread*.94,7,C.paper,.32,.99);
    star(spread*.93,19,C.ink,.50,1.01);
  }
  if(t<contact)caption(i.字幕一);
}else{
  nextBoard();
  if(open<1){const off=lerp(-550,1750,open);
    c.beginPath();c.moveTo(-5,off+310);for(let k=0;k<=35;k++){const xx=k*32;c.lineTo(xx,off+310+xx*.63-Math.sin(k*3.4)*43);}
    c.lineTo(1100,2100);c.lineTo(-5,2100);c.closePath();c.fillStyle=C.ink;c.fill();}
  if(open>.76)caption(i.字幕二);
}
mark({contact:[cx,cy],phase:t<contact?'approach':t<2.10?'impact':'plate',nativeFrame,open});

};
})());
const p=MotionPrompt.packs[row.pack] || MotionPrompt.pack(row.pack,()=>({width:1280,height:720,cycle:row.duration,cells:[],mounts:[]}));
p.cycle=Math.max(p.cycle,row.duration);
if (row.presentation==='dom') p.mounts[row.cell]=(host,binding={})=>action(host,{...binding,inputs:{...row.defaults,...binding.inputs}});
else p.cells[row.cell]=(ctx,w,h,t,inputs,assets)=>action(ctx,w,h,t,{...row.defaults,...inputs},assets||{});
})();