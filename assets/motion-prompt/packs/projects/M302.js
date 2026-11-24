(() => {
const row={"id":"M302","pack":"edit-project","cell":0,"duration":4.75,"presentation":"canvas","defaults":{"标题":"同一批任务，谁先完成？","左对象":"JEV","右对象":"Codex","任务总数":100,"等待秒数":480,"字幕一":"左边先跑这一批","字幕二":"右边还在跑"}};
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
const {box,text,line,disc,group,title,caption,check,mark}=f;
title();
const n=integer(i.任务总数,1,999), secs=integer(i.等待秒数,1,5999);
const p=path(t,.16,1.64), done=t>=1.64, swap=path(t,1.82,2.25);
const elapsed=Math.round(secs*path(t,2.25,3.83));
const clock=Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0');
const y=685,cardH=465,cardW=445;
box(80,y,cardW,cardH,C.ink);box(555,y,cardW,cardH,C.paper,C.ink);
text(i.左对象,116,y+69,'label',C.paper,'left',300);text(i.右对象,592,y+69,'label');
line([116,y+124,488,y+124],C.well);line([592,y+124,962,y+124],C.ink);
text(Math.floor(n*p),116,y+228,'number',C.iris,'left',232);
text('/ '+n,487,y+245,'unit',C.paper,'right',147);
box(116,y+320,371,24,C.well,null,0,12);box(116,y+320,371*p,24,C.iris,null,0,12);
text(done?'已完成':'处理中',116,y+391,'body',C.paper);
group(path(t,1.64,1.84),()=>{disc(459,y+389,27,C.iris);check(459,y+389,.8);});
group(1-path(t,1.82,2.00),()=>{text('0',592,y+228-swap*22,'number');text('/ '+n,964,y+245-swap*22,'unit',C.ink,'right',150);
  box(592,y+320,371,24,C.paper,C.ink,8,12);text('等待开始',592,y+391,'body',C.gray);});
group(path(t,2.00,2.25),()=>{text(clock,592,y+228+(1-swap)*22,'number',C.ink,'left',369);
  box(592,y+320,371,24,C.paper,C.ink,8,12);box(600,y+328,355*elapsed/secs,8,C.ink,null,0,4);
  text('分 : 秒',592,y+391,'unit',C.gray);});
caption(done?i.字幕二:i.字幕一);
mark({done,swap,elapsed,count:Math.floor(n*p),clock,leftX:80,rightX:555});

};
})());
const p=MotionPrompt.packs[row.pack] || MotionPrompt.pack(row.pack,()=>({width:1280,height:720,cycle:row.duration,cells:[],mounts:[]}));
p.cycle=Math.max(p.cycle,row.duration);
if (row.presentation==='dom') p.mounts[row.cell]=(host,binding={})=>action(host,{...binding,inputs:{...row.defaults,...binding.inputs}});
else p.cells[row.cell]=(ctx,w,h,t,inputs,assets)=>action(ctx,w,h,t,{...row.defaults,...inputs},assets||{});
})();