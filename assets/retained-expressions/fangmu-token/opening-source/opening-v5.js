/* Original choreography for the complete 0–12.52s opening.
   The original photographed background is retained throughout, without
   removal, replacement, recoloring or reframing. Matte is only an occluder.
   Reference mechanisms: O03 depth, O05 extraction, O28 focus promotion,
   ADU figure/type staging. No upstream scene code or media is copied.
   The source video and matte always share one fixed narration clock. */
const W=1920,H=1080,cv=document.getElementById('frame'),g=cv.getContext('2d');
const video=document.getElementById('source'),mask=document.getElementById('matte');
const mk=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const alpha=mk(960,540),ag=alpha.getContext('2d',{willReadFrequently:true}),person=mk(W,H),pg=person.getContext('2d');
const paper='#F6F6F3',ink='#111214',accent='#C9AFE9';
const lim=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,p)=>a+(b-a)*p,pct=(t,a,b)=>lim((t-a)/(b-a));
const smooth=x=>{x=lim(x);return x*x*x*(10-15*x+6*x*x)},out=x=>1-Math.pow(1-lim(x),5),ein=x=>Math.pow(lim(x),3);
const E=(t,a,b)=>smooth(pct(t,a,b)),O=(t,a,b)=>out(pct(t,a,b));
let readyTask,sourceTime=-1,config;
function text(s,x,y,size,{color=ink,weight=800,font='CN',align='left',a=1,sx=1,angle=0}={}){
 if(a<.001)return;g.save();g.globalAlpha*=a;g.translate(x,y);g.rotate(angle);g.scale(sx,1);g.font=`${weight} ${size}px ${font}`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;g.fillText(s,0,0);g.restore();
}
function round(x,y,w,h,r,fill){if(w<=0||h<=0)return;g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=fill;g.fill()}
function stroke(x1,y1,x2,y2,col=ink,width=2){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=col;g.lineWidth=width;g.stroke()}
function local(x,y,s,r,fn,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.rotate(r);g.scale(s,s);fn();g.restore()}
function arrow(x,y,size,col){stroke(x-size,y,x+size,y,col,3);stroke(x+size,y,x+size-9,y-9,col,3);stroke(x+size,y,x+size-9,y+9,col,3)}
function glyph(s,x,y,size,{p=1,color=paper,angle=0,sx=1,align='center',font='CN',a=1}={}){
 g.save();g.globalAlpha*=a;g.translate(x,y);g.rotate(angle);g.scale(sx,1);
 g.font=`850 ${size}px ${font}`;g.textAlign=align;g.textBaseline='middle';
 // Short, directional extrusion gives the moving type a physical edge.
 for(let z=12;z>=2;z-=2){g.fillStyle=color===paper?'#77757B':'#B2B0B5';g.globalAlpha=a*.25;g.fillText(s,z*(1-p*.78),z*(1-p*.65));}
 g.globalAlpha=a;g.fillStyle=color;g.fillText(s,0,0);g.restore();
}
function presenter(t){
 return {s:1,x:0,y:0};
}
function drawPerson(t){const q=presenter(t);g.drawImage(person,(W-W*q.s)/2+q.x,H-H*q.s+q.y,W*q.s,H*q.s)}
function wordAI(t){
 const e=O(t,.32,1.12),travel=E(t,1.77,2.58),fade=1-E(t,2.50,2.75);
 // Exact same AI title moves into the course masthead.
 const x=lerp(lerp(2100,1550,e),1336,travel),y=lerp(475,325,travel),size=lerp(400,42,travel);
 glyph('AI',x,y,size,{font:'EN',angle:lerp(.20,0,e)*(1-travel),sx:lerp(.66,1,e),color:travel>.65?ink:paper,a:fade});
}
function hook(t){
 const leave=E(t,1.73,2.25);if(leave>.999)return;
 const chars=[{s:'想',x:170,y:375,t:.03},{s:'好',x:365,y:375,t:.14},{s:'好',x:170,y:584,t:.30},{s:'学',x:365,y:584,t:.42}];
 chars.forEach((c,i)=>{const p=O(t,c.t,c.t+.52);local(-leave*580,leave*-100,1,-.09*leave,()=>glyph(c.s,c.x+(1-p)*(i%2?-100:-300),c.y+(1-p)*130,189,{p,angle:(1-p)*-.15,a:p*(1-leave)}));});
 const a=O(t,.64,1.08)*(1-leave);
 local(112,753,1,0,()=>{stroke(0,0,375*a,0,accent,7);text('从这里开始',0,46,27,{color:paper,weight:450,a});arrow(354,47,20,paper)},a);
 const at=O(t,.70,1.2)*(1-leave);text('人工智能',1555,697,37,{color:paper,weight:450,align:'center',a:at});
}
function courseShell(t){
 const e=O(t,1.83,2.67),exit=E(t,3.96,4.46);if(e<.001||exit>.999)return;
 const cx=1530,cy=530,rot=(1-e)*.15-exit*.09;
 local(cx+exit*220,cy-exit*100,1-.17*exit,rot,()=>{
  g.globalAlpha*=e*(1-exit);
  // Layered real page geometry; the photographed room stays visible around it.
  for(let i=2;i>0;i--)local(8*i,-11*i,1,-i*.025,()=>{
   round(-276,-262,552,524,14,i===2?'#A5A0AE':'#DAD7DF');
   stroke(-250,-190,245,-190,'#BAB6C1',2);
  });
  g.save();g.shadowColor='#00000050';g.shadowBlur=26;g.shadowOffsetY=15;round(-282,-270,564,540,15,'#F7F7FA');g.restore();
  g.save();g.beginPath();g.roundRect(-282,-270,564,540,15);g.clip();
  round(-282,-270,564,52,0,'#E6E4E9');
  for(let i=0;i<3;i++){g.fillStyle=['#A8A3B1','#BFBAC8','#D1CBD8'][i];g.beginPath();g.arc(-254+i*18,-244,5,0,7);g.fill()}
  text('AI 学习笔记',-180,-244,18,{weight:500,color:'#77717F'});
  text('示意',253,-244,15,{weight:450,color:'#88818E',align:'right'});
  g.restore();
  text('AI',-222,-205,42,{font:'EN',a:E(t,2.48,2.72)});text('入门教程',-145,-205,32,{a:E(t,2.36,2.72)});
  text('从基础概念开始',-249,-142,21,{weight:450,color:'#8B8493'});
  stroke(-250,-105,250,-105,'#D8D4DE',1.4);
  const rows=[['01','什么是','认识 AI 的语言单位'],['02','输入','提问、资料和上下文'],['03','输出','AI 生成的文字和回答']];
  rows.forEach((row,i)=>{
   const p=O(t,2.21+i*.09,2.74+i*.09),y=-61+i*100+(1-p)*40,sel=E(t,2.89+i*.15,3.10+i*.15),gone=E(t,[3.03,3.22,3.43][i],[3.03,3.22,3.43][i]+.2);
   local(0,y,1,0,()=>{
    text(row[0],-250,0,19,{font:'EN',color:'#ABA4B4'});
    text(row[1],-201,0,32,{weight:700});
    const tx=i===0?-91:-122;
    round(tx-5,-25,125*sel,47,3,'#DAC7F0');
    text('Token',tx,0,32,{weight:700,a:1-gone});
    text(row[2],-201,38,19,{weight:450,color:'#8C8495'});
    stroke(-201,68,250,68,'#E3DFE8',1);
    arrow(232,0,10,'#A49AAC');
   },p);
  });
  text('概念  /  理解  /  应用',-249,235,17,{weight:450,color:'#928B99'});
 },1);
}
const copies=[
 {label:'Token',x:1455,y:166,size:72,a:3.03,rot:-.07},
 {label:'Token',x:1652,y:731,size:81,a:3.22,rot:.08},
 {label:'Token',x:138,y:782,size:60,a:3.43,rot:-.05},
 {label:'Token',x:352,y:285,size:83,a:3.62,rot:.04},
 {label:'Token',x:1734,y:424,size:49,a:3.78,rot:-.12}
];
function liberatedWords(t){
 copies.forEach((v,i)=>{
  const p=O(t,v.a,v.a+.45),r=E(t,4.04+i*.012,4.40+i*.012);if(p<.001||r>.998)return;
  const fromX=[1490,1460,1460,1455,1652][i],fromY=[469,569,669,166,731][i];
  let x=lerp(fromX,v.x,p),y=lerp(fromY,v.y,p)-Math.sin(p*Math.PI)*140;
  x=lerp(x,960,r);y=lerp(y,540,r);
  const alpha=p*(1-r);g.save();
  glyph(v.label,x,y,lerp(lerp(32,v.size,p),145,r),{font:'CN',color:paper,angle:v.rot*(1-r),p,a:alpha});
  g.restore();
 });
}
function title(t){
 const grow=E(t,4.27,4.80);if(grow<.001)return;
 const shrink=E(t,5.15,5.75);if(shrink>.999)return;
 // Words converge into a shared typographic focus, then camera gently settles.
 const letters='TOKEN',total=1680,size=455,centers=[-675,-357,-25,329,656];
 for(let i=0;i<5;i++){
  const p=O(t,4.28+i*.027,4.76+i*.027);
  g.font='850 120px EN';const finalX=1490-g.measureText(letters).width/2+g.measureText(letters.slice(0,i)).width+g.measureText(letters[i]).width/2;
  const x=lerp(960+centers[i]*lerp(.2,1,p),finalX,shrink),y=lerp(547+Math.sin((1-p)*Math.PI)*100+(1-p)*(i%2?-90:60),286,shrink);
  glyph(letters[i],x,y,lerp(lerp(95,size,p),120,shrink),{font:'EN',color:paper,p,angle:(1-p)*(i%2?.35:-.35),sx:lerp(.55,1,p),a:grow*(1-E(t,5.68,5.75))});
 }
 const a=E(t,4.68,4.93)*(1-shrink);text('每个教程，都在讲它',112,220,31,{weight:450,color:paper,a});
 text('TOKEN',112,168,23,{font:'EN',a,color:paper});
 // A selection baseline connects the extracted topic to the next explanatory beat.
 g.save();g.globalAlpha=a;round(112,751,1693*grow,8,4,accent);g.restore();
}
function frontType(t){
 const p=E(t,4.73,5.08)*(1-E(t,5.16,5.65));if(!p)return;
 text('到处都是',1490,837+25*(1-p),41,{weight:650,color:paper,a:p});
}
function curve(points,p,col=accent,width=3){
 const at=u=>{const v=1-u;return [v*v*v*points[0][0]+3*v*v*u*points[1][0]+3*v*u*u*points[2][0]+u*u*u*points[3][0],v*v*v*points[0][1]+3*v*v*u*points[1][1]+3*v*u*u*points[2][1]+u*u*u*points[3][1]]};
 g.beginPath();let pos=at(0);g.moveTo(...pos);for(let i=1;i<=100;i++){pos=at(p*i/100);g.lineTo(...pos)}g.strokeStyle=col;g.lineWidth=width;g.stroke();return at(p);
}
function terms(t){
 if(t<5.15||t>9.3)return;
 const go=E(t,8.08,8.78),label=E(t,5.68,5.75)*(1-go);
 text('TOKEN',1490,286,120,{font:'EN',align:'center',color:paper,a:label});
 const million=E(t,5.27,5.62)*(1-E(t,6.17,6.73));
 if(million>.001){
  local(-110*E(t,6.17,6.73),-100*E(t,6.17,6.73),1,0,()=>{
   text('百万',111,307,73,{color:paper,a:million});
   const str='1,000,000';for(let i=0;i<str.length;i++){
    const p=O(t,5.37+i*.027,5.89+i*.027),x=111+i*61;
    g.save();g.beginPath();g.rect(x-3,370,67,130);g.clip();
    text(str[i],x,424+(1-p)*125,108,{font:'EN',color:paper,a:million});
    if(str[i]!==',')text(String((+str[i]+7)%10),x,299+(1-p)*125,108,{font:'EN',color:accent,a:million*(1-p)});g.restore();
   }
   text('Token',111,557,47,{font:'EN',color:paper,a:million});
   g.save();g.globalAlpha=million;stroke(111,612,591,612,accent,5);g.restore();
  });
 }
 const input=O(t,6.30,6.77)*(1-go),output=O(t,7.13,7.64)*(1-go);
 if(input>.001){
  local(-120*(1-input)-180*go,45*(1-input)-160*go,1-go*.15,-go*.12,()=>{
   text('输入',113,335,100,{color:paper,a:input});
   g.save();g.globalAlpha=input;
   round(100,429,470,220,14,'#181921DD');
   text('向 AI 提问',129,464,20,{color:'#BDB5CA',weight:450});
   stroke(126,493,543,493,'#655D71',1);
   const msg='帮我解释这个概念';text(msg.slice(0,Math.ceil(msg.length*E(t,6.43,6.84))),128,545,30,{color:paper,weight:500});
   round(128,591,80,30,6,'#D4BEEF');text('示意',168,606,17,{align:'center',weight:500});
   arrow(521,606,13,accent);g.restore();
  });
  g.save();g.globalAlpha=input*.78;const pos=curve([[577,540],[700,167],[1240,78],[1449,228]],E(t,6.57,7.10));
  if(t<7.13)text('Token',pos[0],pos[1]-24,27,{font:'EN',color:paper,align:'center'});g.restore();
 }
 if(output>.001){
  local(75*(1-output)+120*go,40*(1-output)-60*go,1-go*.15,go*.1,()=>{
   text('输出',1460,466,95,{color:paper,a:output});
   g.save();g.globalAlpha=output;
   round(1375,556,449,228,14,'#181921DD');
   text('AI 的回答',1404,590,20,{color:'#BDB5CA',weight:450});stroke(1401,617,1797,617,'#655D71',1);
   const a='这是 AI 返回的内容';text(a.slice(0,Math.ceil(a.length*E(t,7.32,7.72))),1402,661,29,{color:paper,weight:500});
   text('文字、解释、总结……',1402,709,24,{color:'#BDB5CA',weight:450});
   text('示意',1796,754,17,{color:'#BDB5CA',align:'right',weight:450});g.restore();
  });
  g.save();g.globalAlpha=output*.8;curve([[1701,287],[1880,345],[1809,441],[1784,536]],E(t,7.23,7.82));g.restore();
 }
}
function questions(t){
 if(t<7.9)return;
 const puzzled=E(t,7.96,8.50)*(1-E(t,9.18,9.65));
 if(puzzled>.001){
  const gather=E(t,8.18,8.97);
  ['输入','输出','百万'].forEach((s,i)=>{
   const x=lerp([350,1580,1530][i],[540,1330,1330][i],gather),y=lerp([220,740,150][i],[390,660,270][i],gather);
   text(s,x,y,lerp(46,32,gather),{color:paper,align:'center',a:puzzled*(1-gather*.65),angle:(i-1)*.06});
  });
  glyph('?',1502,525,420,{font:'EN',color:paper,p:O(t,8.09,8.65),a:puzzled,angle:(1-E(t,8.04,8.60))*.15});
  text('一头',111,351,130,{color:paper,a:puzzled});text('雾水',111,514,130,{color:paper,a:puzzled});
 }
 const q=E(t,9.20,9.88);if(q<.001)return;
 const relate=E(t,10.60,11.24);
 glyph('Token',lerp(360,340,relate),lerp(360,363,q),156,{font:'EN',color:paper,a:q,p:q,angle:(1-q)*-.15});
 const explain=q*(1-relate);text('到底是',124,531,68,{color:paper,a:explain});text('什么？',122,642,102,{color:paper,a:explain});
 if(relate>.001){
  glyph('AI',1576,421,250,{font:'EN',color:paper,a:relate,p:relate,angle:(1-relate)*.16});
  text('我们用',1441,219,46,{color:paper,a:relate,weight:550});
  text('有什么关系？',1320,643,67,{color:paper,a:E(t,10.95,11.59)});
  g.save();g.globalAlpha=relate;const p=E(t,10.73,11.46);curve([[587,380],[742,56],[1177,90],[1411,370]],p,accent,5);g.restore();
  text('从认识一个词，到用好 AI',123,762,25,{color:paper,weight:450,a:E(t,11.58,12.08)});
 }
}
function captions(t){const cap=config.captions.find(c=>t>=c.start&&t<c.end);if(!cap)return;
 g.save();g.font='550 42px CN';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=7;
 g.strokeStyle='#050505B0';g.fillStyle=paper;g.strokeText(cap.text,960,1000);g.fillText(cap.text,960,1000);g.restore();
}
function draw(t,mt){
 g.clearRect(0,0,W,H);g.drawImage(video,0,0,W,H);
 hook(t);courseShell(t);wordAI(t);liberatedWords(t);title(t);terms(t);questions(t);window.openingStickers.draw(g,t);drawPerson(t);frontType(t);captions(mt);
}
async function seek(el,t){let v=Math.max(.0001,Math.min(t+.002,el.duration-.038));if(Math.abs(el.currentTime-v)<.00005&&el.readyState>=2)return;
 await new Promise((resolve,reject)=>{let timer=setTimeout(()=>reject(Error('seek timeout')),8000);el.addEventListener('seeked',()=>{clearTimeout(timer);resolve()},{once:true});el.currentTime=v;});
}
async function media(t){if(Math.abs(sourceTime-t)<.00005)return;await Promise.all([seek(video,t),seek(mask,t)]);
 ag.drawImage(mask,0,0,960,540);let d=ag.getImageData(0,0,960,540);for(let i=0;i<d.data.length;i+=4){d.data[i+3]=d.data[i];d.data[i]=d.data[i+1]=d.data[i+2]=255}ag.putImageData(d,0,0);
 pg.clearRect(0,0,W,H);pg.globalCompositeOperation='source-over';pg.drawImage(video,0,0,W,H);pg.globalCompositeOperation='destination-in';pg.drawImage(alpha,0,0,W,H);pg.globalCompositeOperation='source-over';sourceTime=t;
}
window.ready=()=>readyTask??=(async()=>{
 await window.openingStickers.ready;config=await(await fetch('project.json')).json();await Promise.all([document.fonts.load('850 189px CN'),document.fonts.load('400 28px CN'),document.fonts.load('700 450px EN')]);await document.fonts.ready;
 await Promise.all([video,mask].map(async v=>{let b=await(await fetch(v.dataset.src)).blob();await new Promise((res,rej)=>{v.addEventListener('loadeddata',res,{once:true});v.addEventListener('error',rej,{once:true});v.src=URL.createObjectURL(b);v.load()})}));await media(0);draw(0,0);
})();
window.render=async(t,mt=t)=>{await window.ready();await media(mt);draw(t,mt)};
window.motionActive=t=>[[0,1.2],[1.7,4.98],[5.14,5.96],[6.16,7.1],[7.13,7.84],[7.96,9.86],[10.58,12.12]].some(([a,b])=>t>=a&&t<b);
window.getState=()=>({sourceTime:video.currentTime,matteTime:mask.currentTime,version:'5-stickers-original-background',fontStatus:document.fonts.status});
if(location.search.includes('render'))document.documentElement.classList.add('render');
else{
 const audio=new Audio(),button=document.getElementById('play'),scrub=document.getElementById('scrub');let playing=false,busy=false;
 async function loop(){if(playing&&!busy){busy=true;if(audio.currentTime>=12.52){audio.pause();playing=false;button.textContent='重播'}const t=Math.min(audio.currentTime,12.48);await window.render(t);scrub.value=t;document.getElementById('clock').textContent=t.toFixed(2)+' / 12.52';busy=false}requestAnimationFrame(loop)}
 button.onclick=async()=>{await window.ready();if(!audio.src)audio.src=video.src;playing=!playing;if(playing){if(audio.currentTime>=12.48)audio.currentTime=0;await audio.play();button.textContent='暂停'}else{audio.pause();button.textContent='播放原声样段'}};
 scrub.oninput=async()=>{playing=false;audio.pause();await window.ready();if(!audio.src)audio.src=video.src;audio.currentTime=+scrub.value;await window.render(+scrub.value);button.textContent='播放原声样段'};
 window.ready();requestAnimationFrame(loop);
}
