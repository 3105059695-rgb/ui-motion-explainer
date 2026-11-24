(() => {
const row={"id":"M307","pack":"edit-project","cell":5,"duration":4.1,"presentation":"canvas","defaults":{"标题":"请求发出去了吗？","请求":"请帮我部署开源版 JEV","会话名":"部署助手","字幕一":"先把请求写进输入框","字幕二":"发出去，聊天里才有这条"}};
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

return function(c,nativeWidth,nativeHeight,t,i,assets){
const f=frame(c,t,i);
const {box,text,line,disc,group,title,caption,clip,mark}=f;
title();const message=String(i.请求),chars=[...message],keyProgress=path(t,.12,1.36);
const visible=chars.slice(0,Math.floor(chars.length*keyProgress)).join('');
const sent=2.12,move=path(t,sent,2.74),pressed=path(t,1.74,2.07)*(1-path(t,2.10,2.34));
const x=80,y=544,w=920,h=813;
box(x,y,w,h,C.ink,null,0,32);box(x+24,y+24,w-48,h-48,C.paper,null,0,10);
disc(143,616,11);disc(184,616,11,C.gray);disc(225,616,11,C.gray);
text(i.会话名,949,616,'label',C.ink,'right',595);line([104,671,976,671],C.ink);
text('会话',144,738,'label',C.gray);
const lineText=(value,ax,ay,tint,max)=>{
  const lines=f.split(value,'body',max);
  if(lines.length>2){const chars=[...String(value)],n=Math.ceil(chars.length/2);
    lines.splice(0,lines.length,chars.slice(0,n).join(''),chars.slice(n).join(''));}
  lines.forEach((s,n)=>text(s,ax,ay+n*58,'body',tint,'left',max));
};
box(128,1091,824,209,C.paper,C.ink,8,24);
const bx=870,by=1232;
disc(bx,by,40-pressed*5,t<sent||pressed>.1?C.ink:C.well);
line([bx,by+16,bx,by-16,bx-12,by-4],C.paper,8);line([bx,by-16,bx+12,by-4],C.paper,8);
if(t<sent){
  if(visible)lineText(visible,164,1153,C.ink,668);
  if(t<1.4&&!visible)line([166,1135,166,1172]);
  const at=path(t,1.50,1.92),away=path(t,2.14,2.38);
  group(at*(1-away),()=>{const px=lerp(933,879,at),py=lerp(1306,1247,at);
    c.beginPath();c.moveTo(px,py);c.lineTo(px+9,py+54);c.lineTo(px+22,py+38);c.lineTo(px+43,py+35);c.closePath();
    c.fillStyle=C.paper;c.fill();c.lineWidth=6;c.strokeStyle=C.ink;c.stroke();});
}else{
  text('输入消息',164,1153,'body',C.gray);
  const bw=740,bh=166,xx=lerp(130,206,move),yy=lerp(1095,826,move);
  box(xx,yy,bw,bh,C.iris,C.ink,8,24);
  lineText(message,xx+32,yy+61,C.ink,bw-64);
  group(path(t,2.74,3.02),()=>text('已发送',944,1032,'label',C.gray,'right'));
}
caption(t<sent?i.字幕一:i.字幕二);mark({sent:t>=sent,field:t<sent?visible:'',bubble:t>=sent?message:'',move});

};
})());
const p=MotionPrompt.packs[row.pack] || MotionPrompt.pack(row.pack,()=>({width:1280,height:720,cycle:row.duration,cells:[],mounts:[]}));
p.cycle=Math.max(p.cycle,row.duration);
if (row.presentation==='dom') p.mounts[row.cell]=(host,binding={})=>action(host,{...binding,inputs:{...row.defaults,...binding.inputs}});
else p.cells[row.cell]=(ctx,w,h,t,inputs,assets)=>action(ctx,w,h,t,{...row.defaults,...inputs},assets||{});
})();