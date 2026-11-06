/* Specific Lidlezz laptop film. Analytic camera and lid hinge, procedural
 * terminal/keybed/material textures; localized static logo polygons only. */
(()=>{'use strict';
const canvas=document.getElementById('stage'),output=canvas.getContext('2d',{alpha:false});
const film=document.createElement('canvas');film.width=film.height=1080;const c=film.getContext('2d'),W=1080;
let P,logo,state={},last=0,keyboard,outerLid,screen,screenCtx,readyDone=false;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,v)=>a+(b-a)*v;
const ease=v=>{v=clamp(v);return v*v*(3-2*v);},out=v=>1-(1-clamp(v))**3;
const p=(t,a,b)=>ease((t-a)/(b-a));
function rect(x,y,w,h,r,col,g=c){g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=col;g.fill();}
function line(x,y,xx,yy,col,width=1,g=c){g.beginPath();g.moveTo(x,y);g.lineTo(xx,yy);g.strokeStyle=col;g.lineWidth=width;g.stroke();}
function text(s,x,y,size,weight=500,col='#fff',align='left',gap=0,g=c,serif=false,mono=false){
g.save();g.font=`${serif?'italic ':''}${weight} ${size}px ${serif?'InstrumentSerif':mono?'GeistMono':'Geist'}`;g.textBaseline='alphabetic';g.textAlign=align;g.fillStyle=col;
if(!gap)g.fillText(s,x,y);else{let chars=[...s],widths=chars.map(ch=>g.measureText(ch).width),len=widths.reduce((a,b)=>a+b,0)+gap*(chars.length-1);let xx=x-(align==='center'?len/2:align==='right'?len:0);g.textAlign='left';chars.forEach((ch,i)=>{g.fillText(ch,xx,y);xx+=widths[i]+gap;});}g.restore();}
function ellipse(x,y,rx,ry,col,alpha=1){c.save();c.globalAlpha*=alpha;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();c.restore();}
function logoDraw(x,y,width,col='#fff',alpha=1,filter='all'){
c.save();c.globalAlpha*=alpha;c.translate(x,y);c.scale(width/740,width/740);c.fillStyle=col;
if(P.brand===logo.brand){for(const v of logo.parts)if(filter==='all'||v.role===filter)c.fill(new Path2D(v.path),'evenodd');}
else{c.transform(1,0,-.17,1,25,0);text(P.brand+'.',0,204,219,850,col,'left',-13,c);}
c.restore();}
function zzDraw(x,y,h,col='#fff',alpha=1,outline=false,single=false){
c.save();c.globalAlpha*=alpha;c.translate(x,y);c.scale(h/165,h/165);c.translate(-481,-55);c.fillStyle=c.strokeStyle=col;c.lineWidth=outline?2.5*165/h:1;
let items=logo.parts.filter(v=>v.role==='zz').sort((a,b)=>a.bounds[0]-b.bounds[0]);if(single)items=items.slice(0,1);
for(const v of items){if(outline)c.stroke(new Path2D(v.path));else c.fill(new Path2D(v.path),'evenodd');}c.restore();}
function bg(t,blue=false){
let gr=c.createLinearGradient(0,0,0,W);if(blue)P.gradient.forEach(([q,col])=>gr.addColorStop(q,col));else{gr.addColorStop(0,P.background);gr.addColorStop(.56,'#0b0d14');gr.addColorStop(1,'#151922');}c.fillStyle=gr;c.fillRect(0,0,W,W);
if(!blue){const vg=c.createRadialGradient(540,670,200,540,670,730);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.64)');c.fillStyle=vg;c.fillRect(0,0,W,W);}}
function reveal(s,x,y,size,t,start,span,col='#fff',serif=false,weight=600){
const enter=serif?ease((t-start)/span):out((t-start)/span);if(enter<=0)return;c.save();c.globalAlpha*=enter;c.beginPath();c.rect(0,y-size*1.4,W,size*1.4);c.clip();text(s,x,y+(1-enter)*size*.86,size,weight,col,'center',serif?-2.0:-3,c,serif);c.restore();}
function heading(t,lines,start,end,intro=false){
const fade=1-p(t,end-.22,end-.06),col=intro&&start>2.7?'#98999f':'#fff';c.save();c.globalAlpha=fade;reveal(lines[0],540,intro?161:183,intro?84:76,t,start,intro?.19:.12,col,false,600);reveal(lines[1],540,intro?258:281,intro?104:105,t,start+(intro&&start>1.5?.02:.12),intro&&start>1.5?.19:.22,col,true,400);c.restore();}
function makeMaterial(){
keyboard=document.createElement('canvas');keyboard.width=750;keyboard.height=530;let g=keyboard.getContext('2d'),silver=g.createLinearGradient(0,0,750,530);
silver.addColorStop(0,'#d6dfed');silver.addColorStop(.22,'#f9fcff');silver.addColorStop(.45,'#bac8dd');silver.addColorStop(.69,'#fafdff');silver.addColorStop(1,'#d4dded');rect(0,0,750,530,19,silver,g);
rect(43,35,664,309,15,'#9faac0',g);for(let row=0;row<6;row++)for(let col=0;col<14;col++){
let kw=40,kh=row===0?28:42,x=54+col*46,y=48+row*47;
if(row===5){if(col>=4&&col<=8)continue;if(col===3)kw=266;}
rect(x,y,kw,kh,5,row===0?'#66778f':'#5a6a81',g);g.strokeStyle='#b8c8db';g.lineWidth=1;g.stroke();if(row<5)text(row===0?'F'+(col+1):['QWERTYUIOP{}','ASDFGHJKL;[]','ZXCVBNM,./<>'][row%3][col%12],x+kw/2,y+kh/2+3,7,500,'#9aacc4','center',0,g);}
const track=g.createLinearGradient(200,365,490,520);track.addColorStop(0,'#becadd');track.addColorStop(.48,'#edf3fb');track.addColorStop(1,'#f8fcff');rect(225,367,299,143,9,track,g);g.strokeStyle='#d5deeb';g.lineWidth=1;g.stroke();
outerLid=document.createElement('canvas');outerLid.width=750;outerLid.height=530;let l=outerLid.getContext('2d');let metal=l.createLinearGradient(0,0,750,0);metal.addColorStop(0,'#cdd8e8');metal.addColorStop(.23,'#f3f7fd');metal.addColorStop(.48,'#f9fcff');metal.addColorStop(.62,'#e8eff8');metal.addColorStop(1,'#dbe4f0');rect(0,0,750,530,20,metal,l);l.strokeStyle='#dae2ef';l.lineWidth=3;l.stroke();
screen=document.createElement('canvas');screen.width=750;screen.height=532;screenCtx=screen.getContext('2d');
}
function terminalTexture(t){const g=screenCtx;g.clearRect(0,0,750,532);rect(0,0,750,532,21,'#858890',g);rect(3,3,744,526,20,'#090a10',g);const wallpaper=g.createLinearGradient(15,15,735,515);wallpaper.addColorStop(0,'#10193d');wallpaper.addColorStop(.57,'#151134');wallpaper.addColorStop(1,'#37115c');rect(20,23,710,481,6,wallpaper,g);
text('Terminal',46,45,10,600,'#e5e5e9','left',0,g);text('Wed 23:41',709,45,10,600,'#e5e5e9','right',0,g);
rect(47,62,656,421,11,'#121314',g);rect(47,62,656,28,10,'#242429',g);rect(47,78,656,13,0,'#242429',g);
['#ff5a56','#ffbd2b','#24ce4c'].forEach((col,i)=>{g.beginPath();g.arc(63+i*14,76,4.5,0,Math.PI*2);g.fillStyle=col;g.fill();});text(P.terminal_path,375,81,10,450,'#bbbbc4','center',0,g);
text('> '+P.terminal_command,68,111,13,650,'#eeeef1','left',0,g,false,true);
const rows=[['Read','src/auth/session.ts','Read 214 lines'],['Update','src/auth/session.ts','Updated with 38 additions and 12 removals'],['Bash','npm test','128 passed, 0 failed'],['Update','src/middleware/refresh.ts','Updated with 21 additions'],['Bash','npm run typecheck','No errors'],['Update','src/auth/tokens.ts','Updated with 9 additions']];
const visible=clamp(2+Math.floor(t*3.7),2,6);let yy=153;
rows.slice(0,visible).forEach(([cmd,path,note],i)=>{g.beginPath();g.arc(69,yy-4,3.3,0,Math.PI*2);g.fillStyle='#43d58d';g.fill();text(cmd+'('+path+')',80,yy,13,600,'#f1f1f5','left',-.2,g,false,true);text('└ '+note,83,yy+18,12,400,i===1||i===3?'#57cc91':'#b0b0b6','left',-.25,g,false,true);yy+=43;});
text('✦ Refactoring auth…',64,Math.min(yy+9,426),12,500,'#de9771','left',0,g,false,true);text(`(${21+Math.floor(t)}m · ↓ 48.9k tokens · esc to interrupt)`,215,Math.min(yy+9,426),11,400,'#b7b5bb','left',0,g,false,true);
rect(59,446,633,24,5,'#151517',g);g.strokeStyle='#45444a';g.lineWidth=1;g.stroke();text('> '+(Math.floor(t*3)%2?'▏':''),66,464,12,450,'#dddddf','left',0,g,false,true);}
function projection(v,cam){let[x,y,z]=v,co=Math.cos(cam.yaw),si=Math.sin(cam.yaw);[x,z]=[x*co+z*si,z*co-x*si];let dy=-y*Math.cos(cam.elevation)+z*Math.sin(cam.elevation),depth=z*Math.cos(cam.elevation)+y*Math.sin(cam.elevation),k=cam.focal/(cam.focal-depth),xx=x*k*cam.scale,yy=dy*k*cam.scale;return[cam.cx+xx*Math.cos(cam.roll)-yy*Math.sin(cam.roll),cam.cy+xx*Math.sin(cam.roll)+yy*Math.cos(cam.roll),depth];}
function polygon(points,fill,stroke=null,width=1){c.beginPath();points.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function tri(image,uv,xy){const[[u0,v0],[u1,v1],[u2,v2]]=uv,[[x0,y0],[x1,y1],[x2,y2]]=xy,den=(u1-u0)*(v2-v0)-(u2-u0)*(v1-v0);
const a=((x1-x0)*(v2-v0)-(x2-x0)*(v1-v0))/den,b=((y1-y0)*(v2-v0)-(y2-y0)*(v1-v0))/den,d=((y2-y0)*(u1-u0)-(y1-y0)*(u2-u0))/den,cc=((x2-x0)*(u1-u0)-(x1-x0)*(u2-u0))/den;
c.save();c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x2,y2);c.closePath();c.clip();c.transform(a,b,cc,d,x0-a*u0-cc*v0,y0-b*u0-d*v0);c.drawImage(image,0,0);c.restore();}
function planeTexture(image,world,cam){const div=6;for(let j=0;j<div;j++)for(let i=0;i<div;i++){
let u=i/div,v=j/div,u1=(i+1)/div,v1=(j+1)/div,a=projection(world(u,v),cam),b=projection(world(u1,v),cam),cc=projection(world(u1,v1),cam),d=projection(world(u,v1),cam);
tri(image,[[u*image.width,v*image.height],[u1*image.width,v*image.height],[u1*image.width,v1*image.height]],[a,b,cc]);tri(image,[[u*image.width,v*image.height],[u1*image.width,v1*image.height],[u*image.width,v1*image.height]],[a,cc,d]);}}
function outlineXZ(w,d,r,y){let points=[];for(const[cx,cz,a]of[[w/2-r,-d/2+r,-Math.PI/2],[w/2-r,d/2-r,0],[-w/2+r,d/2-r,Math.PI/2],[-w/2+r,-d/2+r,Math.PI]])for(let j=0;j<=5;j++){let ang=a+j*Math.PI/10;points.push([cx+Math.cos(ang)*r,y,cz+Math.sin(ang)*r]);}return points;}
function laptop(t,cam,angle,blue=false){
const baseTop=outlineXZ(750,530,20,0),baseBottom=outlineXZ(750,530,20,-19),faces=[];
for(let i=0;i<baseTop.length;i++){const j=(i+1)%baseTop.length,pts=[baseTop[i],baseTop[j],baseBottom[j],baseBottom[i]].map(v=>projection(v,cam));faces.push({pts,depth:pts.reduce((a,b)=>a+b[2],0)/4,col:i<12?'#737e93':'#b3bccb'});}faces.sort((a,b)=>a.depth-b.depth);faces.forEach(f=>polygon(f.pts,f.col,'#c6cfdb',.7));
const top=baseTop.map(v=>projection(v,cam));polygon(top,'#dfe6f0');c.save();c.beginPath();top.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x,y));c.closePath();c.clip();planeTexture(keyboard,(u,v)=>[-375+750*u,0,-265+530*v],cam);c.restore();
const LH=532,T=15,normal=[0,-Math.cos(angle),Math.sin(angle)];
function lidPoint(x,d,offset){return[x,11+d*Math.sin(angle)+normal[1]*offset,-265+d*Math.cos(angle)+normal[2]*offset];}
const front=outlineXZ(750,LH,20,0).map(([x,,z])=>lidPoint(x,z+LH/2,T/2)),back=outlineXZ(750,LH,20,0).map(([x,,z])=>lidPoint(x,z+LH/2,-T/2));
const visibleFront=Math.sin(angle-cam.elevation)>0,skin=(visibleFront?front:back).map(v=>projection(v,cam));
let edgeFaces=[];for(let i=0;i<front.length;i++){const j=(i+1)%front.length,pts=[front[i],front[j],back[j],back[i]].map(v=>projection(v,cam));edgeFaces.push({pts,depth:pts.reduce((a,b)=>a+b[2],0)/4});}edgeFaces.sort((a,b)=>a.depth-b.depth);edgeFaces.forEach(v=>polygon(v.pts,'#8f9caf','#e2e9f3',.85));
polygon(skin,visibleFront?'#080a0f':blue?'#b7c2d5':'#e4eaf5','#e0e6ef',1.8);
c.save();c.beginPath();skin.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x,y));c.closePath();c.clip();
if(visibleFront){terminalTexture(t);planeTexture(screen,(u,v)=>lidPoint(-375+750*u,LH*(1-v),T/2),cam);}else{
planeTexture(outerLid,(u,v)=>lidPoint(-375+750*u,LH*(1-v),-T/2),cam);
if(blue){const shade=c.createLinearGradient(180,400,930,650);shade.addColorStop(0,'rgba(72,92,135,.16)');shade.addColorStop(.4,'rgba(106,123,161,.28)');shade.addColorStop(1,'rgba(85,106,149,.25)');c.fillStyle=shade;c.fillRect(0,0,W,W);}}
c.restore();state.lidAngle=+angle.toFixed(6);state.lidFrontVisible=visibleFront;state.camera=Object.fromEntries(Object.entries(cam).map(([k,v])=>[k,+v.toFixed(5)]));
}
function introCamera(t){const q=p(t,1.60,2.30);return{yaw:.2545,elevation:mix(.278,.415,q),focal:2840.14,scale:mix(.9611,.902,q),roll:-.00676,cx:mix(564.5,556,q),cy:mix(873.2,650,q)};}
function blueCamera(t){const f=p(t,6.06,6.34),r=clamp((t-6.50)/5.20);return{yaw:interpolate([[6.3,.75],[7.7,.65],[8.6,.25],[9.2,0],[9.9,-.10],[11.5,-.32]],t),elevation:.405+.075*Math.sin(r*Math.PI),focal:7500,scale:.825+.01*Math.sin(t*1.9),roll:.008*Math.sin(t*.9),cx:540,cy:mix(1300,535,f)+Math.sin((t-6.3)*1.5)*5};}
function sleepZ(t,start,x,y,outline=true){for(let i=0;i<3;i++){const q=t-start-i*.20,a=p(t,start+i*.20,start+.18+i*.20)*(1-p(t,start+1.10+i*.20,start+1.36+i*.20));if(a<=0)continue;zzDraw(x+i*38,y-q*80,43+i*10,'#fff',a*.8,outline,true);}}
function darkIntro(t){let angle=1.9581*(1-clamp((t-1.94)/.32))**1.45,cam=introCamera(t);
c.save();c.filter='blur(33px)';ellipse(569,992,395,50,'#000',.6);c.restore();laptop(t,cam,angle,false);
if(t<1.55)heading(t,P.intro[0],.03,1.55,true);else if(t<2.77)heading(t,P.intro[1],1.55,2.77,true);else heading(t,P.intro[2],2.77,4.02,true);
if(t>=2.78&&t<4.02){for(let i=0;i<3;i++){let a=p(t,2.8+i*.18,3.0+i*.18),q=t-2.8-i*.18;zzDraw([635,687,740][i],[589,502,398][i]-q*95,[60,110,185][i],'#dbe2ee',a*.65,true,true);}}
if(t>3.96){let a=p(t,3.96,4.14);zzDraw(260,310,400,'#fff',a*.82,false);}}
function brandIntro(t){const expand=out((t-4.15)/.16);if(expand<1){bg(t,false);c.save();c.beginPath();c.arc(540,540,50+expand*850,0,Math.PI*2);c.clip();bg(t,true);c.restore();}else bg(t,true);
const ring=1-p(t,4.23,4.42);if(ring>0){c.beginPath();c.arc(540,540,expand*730,0,Math.PI*2);c.strokeStyle=`rgba(255,255,255,${ring*.45})`;c.lineWidth=27;c.stroke();}
let shrink=p(t,4.56,4.81),h=mix(400,181,shrink),merge=p(t,4.82,4.91),prefix=p(t,4.83,5.09);let fullX=130,fullY=385,fullScale=810/740;
zzDraw(mix(260,fullX+481*fullScale,merge),mix(310,fullY+55*fullScale,merge),mix(h,165*fullScale,merge),'#fff');
if(prefix>0){c.save();c.globalAlpha=prefix;c.beginPath();c.rect(0,0,fullX+490*fullScale,W);c.clip();logoDraw(fullX-(1-prefix)*70,fullY,810,'#fff',1,'letter');c.restore();}
if(t>5.13)logoDraw(fullX,fullY,810,'#fff');c.save();c.globalAlpha=p(t,5.02,5.30);text(P.subtitle,540,664,29,400,'#fff','center',-.8);c.restore();}
function widgetBox(t){const values=[[6.35,638,150,795],[7.62,638,150,795],[7.78,788,210,796],[8.97,788,210,796],[9.12,704,161,799],[10.4,704,161,799],[10.64,638,156,800]],a=values.findIndex((v,i)=>i<values.length-1&&t>=v[0]&&t<values[i+1][0]);
if(a<0){let v=t<values[0][0]?values[0]:values[values.length-1];return{w:v[1],h:v[2],y:v[3]};}let v=values[a],vv=values[a+1],q=p(t,v[0],vv[0]);return{w:mix(v[1],vv[1],q),h:mix(v[2],vv[2],q),y:mix(v[3],vv[3],q)};}
function panel(t){let box=widgetBox(t),x=(W-box.w)/2,y=box.y-box.h/2;const enter=p(t,6.30,6.48);c.save();c.globalAlpha=enter;c.translate(0,(1-enter)*45);c.shadowColor='rgba(17,68,120,.18)';c.shadowBlur=30;c.shadowOffsetY=20;rect(x,y,box.w,box.h,32,'rgba(220,248,255,.82)');c.shadowBlur=0;c.shadowOffsetY=0;
function content(alpha,fn){if(alpha<=0)return;c.save();c.globalAlpha*=alpha;fn();c.restore();}
const temp=p(t,7.65,7.77),batt=p(t,9.02,9.12),done=p(t,10.43,10.68),sleep=p(t,11.18,11.37);
content(1-temp,()=>{const agent=t<7.03?P.agents[0]:t<7.16?P.agents[1]:t<7.32?P.agents[2]:P.agents[3];let n=Math.floor(132+(t-6.45)*34);c.save();c.shadowColor='#34ce69';c.shadowBlur=9;ellipse(x+57,y+76,12,12,'#38cf71');c.restore();text(P.runtime_label,x+88,y+59,18,500,'#7095a5');text(agent,x+88,y+105,34,650,'#142633','left',-1);line(x+412,y+30,x+412,y+box.h-30,'#9dcadb',1);text(P.tool_label,x+441,y+58,18,450,'#7095a5');text(String(n),x+441,y+105,38,600,'#193343','left',-1,c,false,true);state.agent=agent;state.toolCalls=n;});
content(temp*(1-batt),()=>{const keys=[[7.74,50],[7.8,53],[7.95,59],[8.1,61],[8.55,62],[8.9,61]],n=Math.round(interpolate(keys,t));text(P.temperature_label,x+105,y+57,18,600,'#72929f');text(n+'°',x+103,y+119,72,650,'#112e3d','left',-3);
let bar=c.createLinearGradient(x+255,0,x+438,0);bar.addColorStop(0,'#43d678');bar.addColorStop(.53,'#dddf3b');bar.addColorStop(1,'#f69149');rect(x+255,y+35,421,18,9,'#a8d4e3');rect(x+255,y+35,Math.min(240,(n-45)*8+120),18,9,bar);line(x+575,y+25,x+575,y+56,'#354b5c',3);line(x+645,y+25,x+645,y+56,'#354b5c',3);text('85° throttle',x+507,y+82,17,400,'#718e9b');text('95° sleep',x+665,y+82,17,400,'#718e9b');
P.temperature_chips.forEach((s,i)=>{const xx=x+261+i*114;rect(xx,y+134,i===2?251:110,31,10,'#badce8');text(s,xx+13,y+155,17,500,'#34576c');});state.temperature=n;});
content(batt*(1-done),()=>{const percentage=t<9.44?86:t<10.02?85:84;const bx=x+97,by=y+59;rect(bx,by,105,58,10,'#effbf8');c.strokeStyle='#294f4b';c.lineWidth=3;c.stroke();rect(bx+106,by+20,6,18,2,'#294f4b');rect(bx+6,by+6,87*percentage/100,46,5,'#31d665');line(bx+20,by-11,bx+20,by+68,'#ea8777',2);text(percentage+'%',x+230,y+109,62,600,'#173847','left',-3);line(x+402,y+37,x+402,y+127,'#9ac7d7',1);text(P.battery_label,x+437,y+64,18,500,'#7597a7');text(P.battery_threshold,x+437,y+108,32,650,'#1b3847','left',-1);text('15%',x+437,y+108,32,650,'#e47873','left',-1);state.battery=percentage;});
content(done*(1-sleep),()=>{ellipse(x+71,y+78,29,29,'#38ca6f');line(x+60,y+79,x+69,y+88,'#fff',5);line(x+69,y+88,x+85,y+69,'#fff',5);text(P.finished_title,x+122,y+74,39,650,'#142d3b','left',-1.5);text(P.finished_detail,x+122,y+110,21,400,'#6d919f');});
content(sleep,()=>{ellipse(x+71,y+78,30,30,'#141e2c');zzDraw(x+48,y+66,24,'#fff');text(P.sleep_title,x+122,y+75,39,650,'#142d3b','left',-1.5);text(P.sleep_detail,x+122,y+110,22,400,'#6d919f');});
c.restore();state.panel={type:t<7.74?'working':t<9.08?'temperature':t<10.45?'battery':t<11.23?'task-finished':'mac-sleeps',x:+x.toFixed(4),y:+y.toFixed(4),w:+box.w.toFixed(4),h:+box.h.toFixed(4)};}
function interpolate(keys,t){if(t<=keys[0][0])return keys[0][1];for(let i=0;i<keys.length-1;i++)if(t<keys[i+1][0])return mix(keys[i][1],keys[i+1][1],clamp((t-keys[i][0])/(keys[i+1][0]-keys[i][0])));return keys[keys.length-1][1];}
function features(t){bg(t,true);const entering=p(t,6.0,6.30);if(t<6.30){logoDraw(mix(130,46,entering),mix(385,31,entering),mix(810,192,entering),'#fff');c.save();c.globalAlpha=1-entering;text(P.subtitle,540,664,29,400,'#fff','center',-.8);c.restore();}else logoDraw(46,31,192,'#fff');
const cam=blueCamera(t);c.save();c.filter='blur(34px)';ellipse(540,725,385,56,'#247cae',.34);c.restore();laptop(t,cam,0,true);
if(t<7.74)heading(t,P.headlines[0],6.30,7.74);else if(t<9.08)heading(t,P.headlines[1],7.74,9.08);else if(t<10.45)heading(t,P.headlines[2],9.08,10.45);else heading(t,P.headlines[3],10.45,11.93);
panel(t);if(t>=11.2&&t<12.2){const q=t-11.2;for(let i=0;i<3;i++){let alpha=p(t,11.25+i*.16,11.45+i*.16)*(1-p(t,11.9,12.2));zzDraw(718+i*60,454-q*92-i*34,45+i*10,'#fff',alpha*.95,false,true);}}}
function finale(t){const wipe=1-(1-clamp((t-12.03)/.38))**1.8;c.save();c.translate(0,-wipe*890);features(Math.min(t,12.02));c.restore();let white=c.createLinearGradient(0,W*(1-wipe)-120,0,W*(1-wipe)+100);white.addColorStop(0,'rgba(255,255,255,0)');white.addColorStop(1,'#fff');c.fillStyle=white;c.fillRect(0,W*(1-wipe)-120,W,W+120);
if(t>=12.33){c.fillStyle='#fff';c.fillRect(0,0,W,W);const pale=c.createLinearGradient(0,0,0,160);pale.addColorStop(0,'#f6fbff');pale.addColorStop(1,'#fff');c.fillStyle=pale;c.fillRect(0,0,W,160);}const a=p(t,12.02,12.38);logoDraw(170,mix(360,200,p(t,12.15,12.42)),740,'#070709',a);
reveal(P.cta_head,540,524,68,t,12.58,.22,'#060809',false,650);reveal(P.cta_serif,540,612,95,t,12.73,.29,'#151516',true,400);
c.save();c.globalAlpha=p(t,12.84,13.05);rect(374,693,332,99,33,'#000');text(P.url,505,758,41,650,'#fff','center',-1.6);line(633,741,655,741,'#fff',5);line(647,732,656,741,'#fff',5);line(647,750,656,741,'#fff',5);c.restore();c.save();c.globalAlpha=p(t,13.28,13.48);text(P.offer,540,864,25,400,'#87888e','center',-.7);c.restore();}
function seek(seconds){if(!readyDone)return;let t=clamp(Number(seconds)||0,0,P.duration);last=t;state={time:+t.toFixed(6),phase:P.marks.reduce((v,m)=>t>=m.time?m.phase:v,'open-agent'),loop:false,agent:null,toolCalls:null,temperature:null,battery:null,panel:null};c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.filter='none';c.shadowBlur=c.shadowOffsetY=0;c.lineCap='round';c.clearRect(0,0,W,W);
if(t<4.15){bg(t);darkIntro(t);}else if(t<6.0)brandIntro(t);else if(t<12.03)features(t);else finale(t);
const ww=innerWidth,hh=innerHeight;if(canvas.width!==ww||canvas.height!==hh){canvas.width=ww;canvas.height=hh;}output.setTransform(1,0,0,1,0,0);output.fillStyle=P.background;output.fillRect(0,0,ww,hh);const scale=Math.min(ww,hh)/W;output.drawImage(film,(ww-W*scale)/2,(hh-W*scale)/2,W*scale,W*scale);return state;}
window.seek=seek;window.getState=()=>JSON.parse(JSON.stringify(state));const loaded=(async()=>{[P,logo]=await Promise.all([fetch('project.json').then(r=>r.json()),fetch('assets/logo-path.json').then(r=>r.json())]);window.project=P;window.duration=P.duration;await Promise.all([400,500,600,650,850].map(w=>document.fonts.load(`${w} 84px Geist`)).concat([document.fonts.load('400 14px GeistMono'),document.fonts.load('600 14px GeistMono'),document.fonts.load('italic 400 105px InstrumentSerif')]));await document.fonts.ready;makeMaterial();readyDone=true;seek(0);if(new URLSearchParams(location.search).get('render')!=='1'){const start=performance.now();requestAnimationFrame(function play(now){seek(Math.min(P.duration,(now-start)/1000));if(last<P.duration)requestAnimationFrame(play);});}return true;})();window.ready=()=>loaded;addEventListener('resize',()=>seek(last));
})();
