(() => {
const row={"id":"M211@J042","pack":"edit-project","cell":27,"duration":2.37,"presentation":"canvas","defaults":{"标题":"27B 到底是多少？","B值":27,"换算倍率":10,"口播字幕":["27B也就是270亿个参数","你可以把显存想象成一张桌子"],"字幕落点":[0,1.95]}};
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

const profiles={"M211":{"sourceWindow":[0.3125,0.6875],"progress":[0.0,0.44175,0.73784,0.74272,0.74554,0.74675,0.74686,0.74686,0.74686,0.74686,0.74686,0.84812,1.0]},"007":{"sourceWindow":[0.0,0.9375],"progress":[0.0,0.01263,0.02938,0.07393,0.13044,0.20415,0.26113,0.31376,0.36183,0.41363,0.46676,0.51313,0.5575,0.60139,0.64432,0.68077,0.70567,0.72851,0.74299,0.77614,0.81094,0.85025,0.86761,0.87324,0.87436,0.87549,0.87549,0.8884,0.91624,0.9575,1.0]}};
const plates={};
// Keep product names and numbers together, and give both subtitle lines a natural reading break.
function captionLayout(f,value){
  const s=String(value||'').trim();
  if(s.includes('\n')||f.width(s,'sub')<=878)return s;
  const breaks=['但是','还是','到底','怎么','根本','一个','一台','多少','显存','都整理','都要','普通电脑','的速度','要比','还要','在自己','自己的','闭源','开源','再决定','就能够','这个','这几','而且','有多少',' 8','8-','NVIDIA','JEV','AI'];
  const chars=Array.from(s);let best=null;
  for(let j=1;j<chars.length;j++){
    const a=chars.slice(0,j).join('').trimEnd(),b=chars.slice(j).join('').trimStart();
    if(!a||!b||/[A-Za-z\d.%+-]/.test(chars[j-1])&&/[A-Za-z\d.%+-]/.test(chars[j])||/^[，。！？、）]/.test(b))continue;
    const wa=f.width(a,'sub'),wb=f.width(b,'sub');if(Math.max(wa,wb)>878)continue;
    const score=Math.abs(wa-wb)-(breaks.some(w=>b.startsWith(w))||/[，。！？、]$/.test(a)?200:0);
    if(!best||score<best.score)best={score,a,b};
  }
  return best?best.a+'\n'+best.b:s;
}
// Every scene draws in the same 1080 × 1920 coordinate system as the approved UI.
function toolsFor(f,p,assets){
  const {c,box,text,width,line,disc,tag,group,clip,check,arrow}=f;
  const used=new Set();
  function q(id,a,b,at=p){
    used.add(id);const v=ramp(at,a,b),curve=profiles[id].progress,pos=v*(curve.length-1),k=Math.floor(pos);
    const legacy=lerp(curve[k],curve[Math.min(k+1,curve.length-1)],pos-k);
    return .65*ease(v)+.35*legacy;
  }
  function polygon(points,fill,stroke=null,edge=8){c.beginPath();for(let j=0;j<points.length;j+=2){if(j)c.lineTo(points[j],points[j+1]);else c.moveTo(points[j],points[j+1]);}
    c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineJoin='round';c.lineWidth=edge;c.stroke();}}
  function local(x,y,s,draw,rot=0,sx=s){c.save();c.translate(x,y);c.rotate(rot);c.scale(sx,s);draw();c.restore();}
  function roundedClip(x,y,w,h,r,fn){if(w<=0||h<=0)return;c.save();c.beginPath();c.roundRect(x,y,w,h,Math.max(0,Math.min(w/2,h/2,r)));c.clip();fn();c.restore();}
  function plate(name,x,y,w,h,progress=0,mode='contain',slice=null){
    if(w<=0||h<=0)return;
    const entry=plates[name],override=assets[entry.slot],im=override?.frames?override.frames[Math.min(override.frames.length-1,Math.floor(clamp(progress)*override.frames.length))]:override||entry.image;
    if(!im||!((im.naturalWidth||im.width)>0))return;
    let sw=im.naturalWidth||im.width,sh=im.naturalHeight||im.height,sx=0,sy=0;
    if(!override&&entry.frames){const n=Math.min(entry.frames-1,Math.floor(clamp(progress)*entry.frames));[sw,sh]=entry.size;sx=n%entry.cols*sw;sy=Math.floor(n/entry.cols)*sh;}
    if(slice){sx+=slice[0]*sw;sy+=slice[1]*sh;sw*=slice[2];sh*=slice[3];}
    let dx=x,dy=y,dw=w,dh=h;
    if(mode==='cover'){const s=Math.max(w/sw,h/sh);sx+=(sw-w/s)/2;sy+=(sh-h/s)/2;sw=w/s;sh=h/s;}
    else if(mode==='contain'){const s=Math.min(w/sw,h/sh);dw=sw*s;dh=sh*s;dx+=(w-dw)/2;dy+=(h-dh)/2;}
    // Bilinear sampling keeps the same pixels on reverse seeks as a report grows from a thumbnail.
    c.save();c.imageSmoothingQuality='low';c.drawImage(im,sx,sy,sw,sh,dx,dy,dw,dh);c.restore();
  }
  function icon(kind,x,y,size=90,fg=C.ink,background=C.paper,option=0){
    local(x,y,size/100,()=>{
      if(kind==='lock'){
        c.save();c.translate(option*18,-option*9);c.rotate(option*.42);
        c.beginPath();c.moveTo(-22,0);c.lineTo(-22,-16);c.arc(0,-16,22,Math.PI,Math.PI*2);c.lineTo(22,-2-option*20);c.lineWidth=10;c.strokeStyle=fg;c.stroke();c.restore();
        box(-32,-3,64,51,fg,null,0,8);disc(0,15,6,background);line([0,17,0,26],background,5);
      }else if(kind==='file'){polygon([-31,-44,13,-44,34,-24,34,45,-31,45],background,fg);line([12,-40,12,-21,30,-21],fg,6);line([-18,0,19,0],fg,6);line([-18,16,15,16],fg,6);}
      else if(kind==='gpu'){box(-52,-31,104,62,background,fg,8,10);for(const xx of [-24,24]){disc(xx,0,19,background,fg,6);for(let j=0;j<4;j++){c.save();c.translate(xx,0);c.rotate(j*Math.PI/2);line([0,0,3,-10,10,-10],fg,5);c.restore();}}line([-28,36,22,36],fg,6);}
      else if(kind==='rack'){for(let j=0;j<3;j++){box(-49,-40+j*29,98,24,fg,null,0,5);disc(-35,-29+j*29,4,background);line([13,-29+j*29,34,-29+j*29],background,4);}}
      else if(kind==='dish'){c.beginPath();c.arc(0,14,37,Math.PI,2*Math.PI);c.fillStyle=fg;c.fill();disc(0,-28,6,fg);line([-48,19,48,19],fg,9);}
      else if(kind==='monitor'){box(-46,-32,92,59,background,fg,8,7);line([0,29,0,39,-21,39,21,39],fg,7);}
      else if(kind==='cloud'){disc(-24,5,18,fg);disc(0,-7,25,fg);disc(25,4,17,fg);box(-27,4,53,20,fg,null,0,8);}
      else if(kind==='folder'){polygon([-43,-25,-9,-25,0,-15,43,-15,43,33,-43,33],background,fg);}
      else if(kind==='like'){polygon([-35,2,-17,2,-3,-12,3,-35,12,-32,16,-23,13,-5,34,-5,38,2,31,27,22,34,-17,34,-17,4,-35,4],fg);box(-41,1,16,35,fg,null,0,3);}
      else if(kind==='share'){polygon([-39,29,-31,4,-11,-13,9,-16,9,-34,38,-4,9,23,9,7,-10,9,-25,18],fg);}
      else if(kind==='book'){line([-36,-24,-17,-25,0,-16,17,-25,36,-24,36,26,16,24,0,32,-16,24,-36,26,-36,-24],fg,7);line([0,-15,0,29],fg,6);}
    });
  }
  function cursor(x,y,flash=0){
    if(flash>0&&flash<1)group(1-flash,()=>{disc(x,y,12+48*flash,C.iris,C.ink,6);});
    polygon([x,y,x+8,y+54,x+22,y+37,x+41,y+34],C.ink,C.paper,5);
  }
  function cross(x,y,size=15,fg=C.iris){line([x-size,y-size,x+size,y+size],fg);line([x+size,y-size,x-size,y+size],fg);}
  function object(x,y,w,h,name,pict,opts={}){
    const dark=!!opts.dark,back=dark?C.ink:C.paper,fg=dark?C.paper:C.ink;
    box(x,y,w,h,back,dark?null:C.ink,8,24);
    icon(pict,x+w/2,y+h*.35,Math.min(w*.33,h*.35),fg,back,opts.open||0);
    text(name,x+w/2,y+h*.69,'label',fg,'center',w-28);
    if(opts.note)text(opts.note,x+w/2,y+h*.88,'label',dark?C.iris:C.gray,'center',w-26);
  }
  function windowFrame(x,y,w,h,body,dark=false){
    box(x,y,w,h,C.ink,null,0,32);roundedClip(x+24,y+24,w-48,h-48,10,()=>{
      c.fillStyle=dark?C.well:C.paper;c.fillRect(x+24,y+24,w-48,h-48);body(x+24,y+24,w-48,h-48);});
  }
  function laptop(x,y,w,h,body){windowFrame(x,y,w,h,body);box(x-w*.055,y+h-3,w*1.11,28,C.ink,null,0,12);}
  function fillBar(x,y,w,h,v,bg=C.well,fg=C.iris){box(x,y,w,h,bg,null,0,Math.min(12,h/2));box(x,y,w*clamp(v),h,fg,null,0,Math.min(12,h/2));}
  function chip(s,x,y,w=null,dark=true){
    const ww=w||Math.min(900,width(s,'label')+60);
    box(x-ww/2,y-37,ww,74,dark?C.ink:C.paper,dark?null:C.ink,8,37);
    text(s,x,y,'label',dark?C.paper:C.ink,'center',ww-28);return ww;
  }
  function chapter(s,alpha=1){group(alpha,()=>chip(s,259,467,354));}
  function dishCard(x,y,w,h,steam=0,verdict=''){
    object(x,y,w,h,'一盘好菜','dish');
    const cx=x+w/2,cy=y+h*.35,sz=Math.min(w*.33,h*.35);
    if(steam>0)for(let k=0;k<3;k++){const phase=(steam+k/3)%1;
      group(Math.sin(Math.PI*phase)*.83,()=>{const ax=cx+sz*(k-1)*.19,ay=cy-sz*.29-phase*48;
        c.beginPath();c.moveTo(ax,ay);c.bezierCurveTo(ax-13,ay-11,ax+14,ay-22,ax+3,ay-39);
        c.strokeStyle=C.gray;c.lineWidth=8;c.lineCap='round';c.stroke();});}
    if(verdict){disc(cx-57,y+h*.87,17,C.ink);check(cx-57,y+h*.87,.56,C.iris);text(verdict,cx+20,y+h*.87,'label',C.ink,'center',w-86);}
  }
  function recipe(x,y,w,h,open=0){
    box(x,y,w,h,C.paper,C.ink,8,18);text('菜谱',x+w/2,y+h*.22,'label',C.ink,'center',w*.79);
    for(let k=0;k<2;k++)line([x+w*.23,y+h*(.38+.12*k),x+w*(.78-.08*k),y+h*(.38+.12*k)],C.gray,7);
    icon('lock',x+w*.5,y+h*.77,Math.min(w*.37,h*.30),C.ink,C.paper,open);
  }
  function kitchen(x,y,w,h,withRecipe=true){
    box(x,y,w,h,C.ink,null,0,24);
    for(let k=0;k<7;k+=2)box(x+16+(w-32)/7*k,y+9,(w-32)/7,29,C.paper,null,0,10);
    text('后厨',x+23,y+h*.28,'label',C.paper,'left',w*.52);icon('dish',x+w*.23,y+h*.64,w*.24,C.paper,C.ink);
    const r=[x+w*.53,y+h*.37,w*.37,h*.53];if(withRecipe)recipe(...r);return r;
  }
  function menu(x,y,w,h,names,prices,chosen,reveal){
    box(x,y,w,h,C.paper,C.ink);text('菜单',x+30,y+52,'label');
    for(let k=0;k<names.length;k++){const yy=y+95+k*(h-118)/names.length,hh=(h-118)/names.length-6,on=chosen&&k===0;
      if(on)box(x+15,yy,w-30,hh,C.ink,null,0,10);
      text(names[k],x+28,yy+hh/2,'label',on?C.paper:C.ink,'left',w*.52);
      group(reveal,()=>text(prices[k],x+w-25,yy+hh/2,'unit',on?C.iris:C.ink,'right',w*.39));}
  }
  function nav(labels,active,y=510,scale=1){const step=211*scale;
    labels.forEach((s,k)=>{const x=540+(k-(labels.length-1)/2)*step;
      local(x,y,scale,()=>chip(s,0,0,196,k===active));});}
  function resultTag(s,x,y,max=700){return tag(s,x,y,C.ink,C.iris,max);}
  function shadeWithHoles(x,y,w,h,holes,amount){
    if(amount<=0)return;c.save();c.globalAlpha*=.62*amount;c.fillStyle=C.ink;c.beginPath();c.rect(x,y,w,h);
    for(const [hx,hy,hw,hh] of holes)c.roundRect(hx,hy,hw,hh,Math.min(12,hw/2,hh/2));
    c.fill('evenodd');c.restore();
    group(amount,()=>{for(const [hx,hy,hw,hh] of holes){c.strokeStyle=C.ink;c.lineWidth=8;c.beginPath();c.roundRect(hx,hy,hw,hh,12);c.stroke();}});
  }
  function pairedReports(source,subject,values,note,light,reveal,margin=0){
    const pretty=values.map(v=>Number(v).toFixed(2)+'%');
    group(reveal,()=>chip(note,540,492,865));
    for(let k=0;k<2;k++){const x=80+470*k, y=661, w=451, h=593;
      box(x,y,w,h,C.paper,C.ink,8,24);text(k?'官方 JEV':'开源 JEV',x+w/2,y+60,'body',C.ink,'center',w-38);
      const start=k*.505+.014;roundedClip(x+15,y+110,w-30,343,8,()=>{
        plate(source,x+15,y+110,w-30,343,0,'contain',[start,source==='scoreB'?.11:.05,.46,source==='scoreB'?.36:.64]);});
      plate(source,x+40,y+422,w-80,33,0,'contain',[start,source==='scoreB'?.775:.75,.23,.052]);
      text(pretty[k],x+w*.5,y+507,'sub',C.ink,'center',w-55);
      shadeWithHoles(x+9,y+97,w-18,h-106,[[x+28-margin,y+455-margin,w-56+2*margin,109+2*margin]],light);}
    group(reveal,()=>{const l=Number(values[0]),r=Number(values[1]),op=l>r?' > ':l<r?' < ':' = ';
      box(143,1309,794,92,C.ink,null,0,46);text(subject+'   '+pretty[0]+op+pretty[1],540,1355,'label',C.paper,'center',742);});
  }
  function advice(labels,visibility,connections,opacity=1){
    const ws=labels.map(s=>Math.min(399,width(s,'label')+44)),gap=58,full=ws[0]+(ws[1]+gap)*visibility[1]+(ws[2]+gap)*visibility[2];
    const scale=Math.min(1,920/(ws.reduce((a,b)=>a+b,0)+gap*2));
    group(opacity,()=>local(540,1000,scale,()=>{let left=-full/2;
      labels.forEach((s,k)=>{if(k){const len=gap*connections[k-1];
        if(len>4){line([left+5,0,left+len-7,0],C.ink,8);if(len>22)arrow(left+len-7,0,.65);}
        left+=gap;}
        group(visibility[k],()=>chip(s,left+ws[k]/2,0,ws[k]));left+=ws[k];});}));
    return {widths:ws,center:540,total:full};
  }
  return {q,used,polygon,local,roundedClip,plate,icon,cursor,cross,object,windowFrame,laptop,fillBar,chip,chapter,dishCard,recipe,kitchen,menu,nav,resultTag,shadeWithHoles,pairedReports,advice};
}

return function(c,nativeWidth,nativeHeight,t,i,assets){
const p=clamp(t/2.37);
const f=frame(c,t,i), {text,box,line,disc,group,clip,title,caption,mark,check,arrow,width,tag}=f;
const {q,used,polygon,local,roundedClip,plate,icon,cursor,cross,object,windowFrame,laptop,fillBar,chip,chapter,dishCard,recipe,kitchen,menu,nav,resultTag,shadeWithHoles,pairedReports,advice}=toolsFor(f,p,assets);
{

title();const a=Math.max(0,Number(i.B值)||0),multiple=Math.max(0,Number(i.换算倍率)||0),total=a*multiple;
const join=q('M211',.23,.47),count=q('007',.31,.73);chip(a+'B',254,925,302);
group(join,()=>{text('=',474,921,'sub',C.ink,'center');text(Math.round(total*count),709,904,'number',C.ink,'center',340);
  text('亿个参数',705,1018,'unit',C.gray,'center');});mark({left:a+'B',right:Math.round(total*count),total,xLeft:254,unit:join});

}
const at=Array.isArray(i.字幕落点)?i.字幕落点:[0],lines=Array.isArray(i.口播字幕)?i.口播字幕:[String(i.口播字幕||'')];
const index=at.reduce((n,v,k)=>Number(v)<=t?k:n,-1);
if(index>=0&&lines[index])caption(captionLayout(f,lines[index]));
mark({parents:[...used],caption:index,normalized:p,platesReady:Object.values(plates).every(e=>e.image?.width>0)});
};})());
const p=MotionPrompt.packs[row.pack] || MotionPrompt.pack(row.pack,()=>({width:1280,height:720,cycle:row.duration,cells:[],mounts:[]}));
p.cycle=Math.max(p.cycle,row.duration);
if (row.presentation==='dom') p.mounts[row.cell]=(host,binding={})=>action(host,{...binding,inputs:{...row.defaults,...binding.inputs}});
else p.cells[row.cell]=(ctx,w,h,t,inputs,assets)=>action(ctx,w,h,t,{...row.defaults,...inputs},assets||{});
})();