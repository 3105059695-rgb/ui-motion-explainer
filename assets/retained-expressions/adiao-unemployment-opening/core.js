(()=>{'use strict';const g=document.getElementById('ui').getContext('2d');
const C={white:'#FFFFFF',ink:'#101112',light:'#F3F4F5',lav:'#D6C2FF',purple:'#8B67B2',muted:'#6F7075'};
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,p)=>a+(b-a)*p,E=(t,a,b)=>{let p=clamp((t-a)/(b-a));return p*p*p*(10+p*(-15+6*p));};
const images={},entries={};let promise;
function rect(x,y,w,h,r=16){g.beginPath();g.roundRect(x,y,Math.max(.01,w),Math.max(.01,h),Math.max(0,Math.min(r,w/2,h/2)));}
function box(x,y,w,h,col=C.white,r=16){if(w<=0||h<=0)return;rect(x,y,w,h,r);g.fillStyle=col;g.fill();}
function text(s,x,y,size=30,col=C.ink,weight=650,align='left'){g.font=`${weight} ${size}px CN,sans-serif`;g.textAlign=align;g.textBaseline='alphabetic';g.fillStyle=col;g.fillText(String(s),x,y);}
function path(points,col=C.purple,width=3){if(points.length<2)return;g.beginPath();g.moveTo(...points[0]);points.slice(1).forEach(p=>g.lineTo(...p));g.strokeStyle=col;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();}
function line(x,y,X,Y,col=C.purple,width=3){if(Array.isArray(x)){path(x,y,X);return;}path([[x,y],[X,Y]],col,width);}
function wrap(s,x,y,width,size=30,col=C.ink,weight=650,lh=1.42){g.save();g.font=`${weight} ${size}px CN`;let row='',yy=y;const step=lh>5?lh:size*lh;for(let ch of String(s)){if(ch==='\n'){text(row,x,yy,size,col,weight);row='';yy+=step;}else if(row&&g.measureText(row+ch).width>width){text(row,x,yy,size,col,weight);row=ch;yy+=step;}else row+=ch;}if(row)text(row,x,yy,size,col,weight);g.restore();return yy;}
function shot(id,x,y,w,h,roi=null){const im=images[id];if(!im)throw new Error('Missing real asset: '+id);let q=roi||entries[id]?.focus_roi||[0,0,im.width,im.height];if(!Array.isArray(q))q=[q.x*im.width,q.y*im.height,q.w*im.width,q.h*im.height];const [sx,sy,sw,sh]=q,k=Math.min(w/sw,h/sh);g.drawImage(im,sx,sy,sw,sh,x+(w-sw*k)/2,y+(h-sh*k)/2,sw*k,sh*k);}
function iconFile(x,y,scale=1,label='',color=C.ink){g.save();g.translate(x,y);g.scale(scale,scale);box(0,0,48,59,C.white,6);g.strokeStyle=color;g.lineWidth=2;rect(0,0,48,59,6);g.stroke();path([[32,2],[32,16],[46,16]],color,2);path([[10,28],[37,28]],color,2);path([[10,36],[37,36]],color,2);path([[10,44],[27,44]],color,2);if(label)text(label,24,79,17,color,650,'center');g.restore();}
function cursor(x,y,click=0){g.save();g.translate(x,y);if(click>0&&click<1){g.save();g.globalAlpha*=1-click;g.beginPath();g.arc(1,2,10+28*click,0,Math.PI*2);g.strokeStyle=C.purple;g.lineWidth=4;g.stroke();g.restore();}path([[0,0],[1,31],[10,23],[20,40],[28,35],[18,19],[31,15],[0,0]],C.white,5);g.fillStyle=C.ink;g.fill();g.restore();}
function windowFrame(x,y,w,h,label=''){g.save();g.shadowColor='#1011121D';g.shadowBlur=24;g.shadowOffsetY=12;box(x,y,w,h,C.white,20);g.restore();box(x,y,w,54,C.ink,20);box(x,y+28,w,26,C.ink,0);['#F17870','#E4BE73','#86BD96'].forEach((c,i)=>box(x+19+i*20,y+20,11,11,c,6));text(label,x+102,y+36,24,C.white,650);g.strokeStyle='#D8DBDF';g.lineWidth=1;rect(x,y,w,h,20);g.stroke();}
function pill(s,x,y,size=25,color=C.ink,bg=C.lav){g.font=`700 ${size}px CN`;const w=g.measureText(String(s)).width+26;box(x,y-size-8,w,size+22,bg,10);text(s,x+13,y,size,color,700);return w;}
function arrow(x,y,angle=0,color=C.purple){g.save();g.translate(x,y);g.rotate(angle);path([[-10,-8],[0,0],[-10,8]],color,3);g.restore();}
function button(s,x,y,w,h,active=true){box(x,y,w,h,active?C.purple:C.light,12);text(s,x+w/2,y+h/2+11,29,active?C.white:C.ink,750,'center');}
function typeText(s,x,y,width,size,t,start,duration,color=C.ink){const p=clamp((t-start)/duration),str=Array.from(String(s)),n=Math.floor(str.length*p),part=str.slice(0,n).join('');wrap(part,x,y,width,size,color,650,1.45);return {progress:p,text:part,complete:p>=1};}
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Cannot load '+src));im.src=src;});
function cover(id,x,y,w,h,roi=null,r=0){const im=images[id];if(!im)throw Error('Missing photo '+id);let q=roi||[0,0,im.width,im.height];const [sx,sy,sw,sh]=q,k=Math.max(w/sw,h/sh);g.save();rect(x,y,w,h,r);g.clip();g.drawImage(im,sx,sy,sw,sh,x+(w-sw*k)/2,y+(h-sh*k)/2,sw*k,sh*k);g.restore();}
function portrait(id,x,y,d,roi=null){g.save();g.beginPath();g.arc(x+d/2,y+d/2,d/2,0,Math.PI*2);g.clip();cover(id,x,y,d,d,roi||entries[id]?.safe_roi);g.restore();}
function alpha(v,fn){if(v<=0)return;g.save();g.globalAlpha*=clamp(v);fn();g.restore();}
function panel(x,y,w,h,bg=C.white,r=18){g.save();g.shadowColor='#10111218';g.shadowBlur=28;g.shadowOffsetY=10;box(x,y,w,h,bg,r);g.restore();}
function stroke(x,y,w,h,col='#D7D8DD',width=1.5,r=16){g.strokeStyle=col;g.lineWidth=width;rect(x,y,w,h,r);g.stroke();}
function tick(x,y,color=C.purple,size=1){path([[x-8*size,y],[x,y+7*size],[x+15*size,y-13*size]],color,4*size);}
function rule(s,x,y,w=1100,size=28){text(s,x,y,size,C.muted,550);line(x,y+22,x+w,y+22,'#DDDEE2',1);}
function credit(id,x,y,align='right'){text(entries[id]?.credit||'资料图片',x,y,20,C.muted,500,align);}
function scene(t){return B.story.find(s=>t>=s.start&&t<s.end)||B.story.at(-1);}
function beat(s,needle,pct=.5){const c=B.captions.find(c=>c.start>=s.start-.2&&c.start<s.end&&c.text.includes(needle));return c?c.start:lerp(s.start,s.spoken_end||s.end,pct);}
async function ready(){return promise||=(async()=>{await document.fonts.load('850 54px CN');await document.fonts.ready;images.home=await load('assets/current-product.svg');B.captions=await fetch('captions.json').then(r=>r.json());B.config={width:1920,height:1080,duration:7.4};})();}
window.B={g,C,E,lerp,clamp,box,rect,text,wrap,line,path,shot,cover,portrait,alpha,panel,stroke,tick,rule,credit,scene,beat,iconFile,cursor,windowFrame,pill,arrow,button,typeText,images,entries,ready,story:[],captions:[],config:{}};})();
