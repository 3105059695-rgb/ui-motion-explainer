/* Case 076: independent timeline reconstruction. Fonts are bundled under SIL OFL. */
const mix=(a,b,t)=>a+(b-a)*t;
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
const off=document.createElement('canvas');off.width=1920;off.height=1080;const g=off.getContext('2d');
let P,tNow=0,playing=false,lastClock=0,state={};const W=1920,H=1080;
const clamp=x=>Math.max(0,Math.min(1,x)),progress=(t,a,b)=>clamp((t-a)/(b-a)),smooth=x=>x*x*(3-2*x),out=x=>1-Math.pow(1-x,3);
const hash=x=>{const n=Math.sin(x*127.1+311.7)*43758.5453;return n-Math.floor(n)};
const stars=Array.from({length:1800},(_,i)=>({x:(hash(i*3+1)-.5)*3100,y:(hash(i*3+2)-.5)*1750,z:hash(i*3+3),bright:hash(i+90)}));
function pathRound(x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r);}
function tracked(text,x,y,size,weight=400,color=P.colors.white,spacing=0,align='left',family='Geist'){
  g.font=`${weight} ${size}px ${family}`;g.textBaseline='alphabetic';g.textAlign='left';g.fillStyle=color;
  const letters=[...text],width=letters.reduce((v,ch)=>v+g.measureText(ch).width,0)+Math.max(0,letters.length-1)*spacing;
  if(align==='center')x-=width/2;if(align==='right')x-=width;
  for(const ch of letters){g.fillText(ch,x,y);x+=g.measureText(ch).width+spacing;}return width;
}
function baselineText(text,x,y,size,weight,color,align='center'){
  return tracked(text,x,y,size,weight,color,0,align);
}
function backdrop(t){
  g.fillStyle='#010309';g.fillRect(0,0,W,H);
  let bg=g.createRadialGradient(960,510,10,960,510,1010);bg.addColorStop(0,'#051333');bg.addColorStop(.6,'#030d20');bg.addColorStop(1,'#000204');g.fillStyle=bg;g.fillRect(0,80,W,920);
  g.save();g.beginPath();g.rect(0,80,W,920);g.clip();
  g.strokeStyle='#35517420';g.lineWidth=1;
  for(let i=-10;i<=10;i++){g.beginPath();g.moveTo(960+i*60,710);g.lineTo(960+i*680,1000);g.stroke();}
  for(let i=0;i<10;i++){let y=710+Math.pow(i/9,2.25)*290;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  // Perspective motion is a closed-form function of time, so arbitrary seeks reproduce identical pixels.
  const speed=t<1.45?.13:t<4.45?.27:t<6.45?.64:t<7.966?.42:t<12.733?.74:t<14?.15:.50;
  const distance=t*.36+(t>=1.45?(t-1.45)*.07:0)+(t>=4.45?(t-4.45)*.15:0);
  for(let i=0;i<stars.length;i++){
    const s=stars[i],z=.16+((s.z+distance)%1)*2.5,px=960+s.x/z,py=540+s.y/z;
    if(px<0||px>W||py<80||py>1000)continue;
    const tail=Math.max(.002,speed*.13/z),prev=z+tail,ax=960+s.x/prev,ay=540+s.y/prev;
    g.globalAlpha=(.28+.65*s.bright)*Math.min(1,.8/z);g.strokeStyle=i%3===0?'#93b8ff':i%3===1?'#d4defb':'#546aae';g.lineWidth=.6+s.bright*.9;
    g.beginPath();g.moveTo(ax,ay);g.lineTo(px,py);g.stroke();
  }g.globalAlpha=1;g.restore();
}
function emblem(x,y,r){
  g.save();g.translate(x,y);let grad=g.createLinearGradient(0,-r,0,r);grad.addColorStop(0,P.colors.blue);grad.addColorStop(.56,'#b5d4ed');grad.addColorStop(1,'#ebf4e9');
  g.beginPath();g.arc(0,0,r,-Math.PI/2+.08,Math.PI/2-.08);g.arc(0,0,r*.54,Math.PI/2-.13,-Math.PI/2+.13,true);g.closePath();g.fillStyle=grad;g.fill();
  g.beginPath();g.arc(0,0,r,Math.PI/2+.08,Math.PI*1.5-.08);g.arc(0,0,r*.54,Math.PI*1.5-.13,Math.PI/2+.13,true);g.closePath();g.fillStyle='#e6ebef';g.fill();
  for(let i=0;i<5;i++){g.beginPath();g.arc(0,(i-2)*r*.275,7,0,Math.PI*2);g.fillStyle=i%3===0?'#a3bad1':'#6f829e';g.fill();}g.restore();
}
function brand(t,ending=false){
  const start=ending?14:6.45,a=t-start,scale=1+.07*(1-out(progress(a,.14,.5)));
  g.save();g.translate(960,540);g.scale(scale,scale);g.translate(-960,-540);
  emblem(406,514,146);
  let x=615;x+=tracked('DATA',x,570,196,500,P.colors.white,28);tracked('NO',x+28,570,196,350,P.colors.blue,28);
  g.save();g.globalAlpha=ending?1-smooth(progress(t,15.8,16.1)):1;tracked(P.content.tagline,616,658,45,400,'#d8dfeb',9);g.restore();
  if(!ending)tracked(P.content.technology,960,738,29,400,'#6e7990',3,'center','monospace');
  else{g.save();g.globalAlpha=smooth(progress(t,15.25,15.6));tracked(P.content.website,960,mix(795,735,smooth(progress(t,15.8,16.1))),31,400,'#92a6ce',4,'center','monospace');g.restore();}
  g.restore();
}
function transition(a,force=1){
  if(a<0||a>.35)return;
  let ring=out(progress(a,.01,.32)),opacity=(1-ring)*.7*force;
  g.save();g.strokeStyle='#849cff';g.globalAlpha=opacity;g.lineWidth=4;g.beginPath();g.ellipse(960,540,110+ring*1050,90+ring*750,0,0,Math.PI*2);g.stroke();
  if(a<.30){let glow=g.createRadialGradient(960,535,5,960,535,1600);glow.addColorStop(0,'#ffffff');glow.addColorStop(.2,'#eafaff');glow.addColorStop(.52,'#aec2ff95');glow.addColorStop(1,'#66a0ff00');g.globalAlpha=Math.pow(1-a/.30,1.05)*force;g.fillStyle=glow;g.fillRect(0,80,W,920);}
  g.restore();
}
function title(t,row){
  const a=t-row.start,amount=1+.06*(1-out(progress(a,.12,.34)));
  g.save();g.translate(960,510);g.scale(amount,amount);g.translate(-960,-510);
  if(a<.19){g.save();g.globalAlpha=(1-a/.19)*.85;baselineText(row.text,975,590,row.size,900,P.colors.cyan);baselineText(row.text,945,590,row.size,900,P.colors.pink);g.restore();}
  baselineText(row.text,960,590,row.size,900,P.colors[row.color]);
  tracked(row.subtitle,960,695,29,400,'#9ea9bf',7,'center','monospace');g.restore();
  if(a<.28)transition(a,1);
}
function network(t){
  const a=t-4.45,z=out(progress(a,.24,1.25)),opacity=smooth(progress(a,0,.14))*(1-smooth(progress(a,1.60,2.0))),cy=540,r=61+85*z,c=smooth(progress(a,1.25,1.85)),lx=mix(435,795,c),rx=mix(1470,1125,c);
  g.save();g.globalAlpha=opacity;
  tracked('SAP',lx,325+smooth(progress(a,1.25,1.85))*195,38+22*z,700,P.colors.white,3,'center');tracked('CARDANO',960,267+smooth(progress(a,1.25,1.85))*240,38+22*z,700,P.colors.blue,3,'center');tracked('MIDNIGHT',rx,325+smooth(progress(a,1.25,1.85))*195,38+22*z,700,P.colors.midnight,3,'center');
  g.strokeStyle='#86a9ee';g.lineWidth=2;
  for(const p of [[lx,347+smooth(progress(a,1.25,1.85))*195],[960,295+smooth(progress(a,1.25,1.85))*240],[rx,347+smooth(progress(a,1.25,1.85))*195]]){g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(960,cy);g.stroke();}
  if(a>.7){g.save();g.globalAlpha=.30;g.filter='hue-rotate(105deg)';emblem(960+13*Math.sin(a*24),cy,r);g.restore();}
  g.save();g.translate(960,cy);g.rotate(Math.sin(a*4)*.26);emblem(0,0,r);g.restore();g.restore();
}
function icon(kind,x,y){
  const s=146;g.save();g.translate(x,y);pathRound(0,0,s,s,25);g.fillStyle='#0b1420';g.fill();g.lineWidth=5;g.strokeStyle='#293144';g.stroke();
  g.strokeStyle=P.colors.midnight;g.fillStyle=P.colors.midnight;g.lineWidth=7;g.lineCap='round';g.lineJoin='round';
  const line=points=>{g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();};
  if(kind==='core'){for(let i=0;i<2;i++){pathRound(34,38+i*36,77,26,5);g.stroke();g.beginPath();g.arc(47,51+i*36,3,0,7);g.fill();}}
  if(kind==='gate'){g.beginPath();g.moveTo(35,110);g.lineTo(35,71);g.bezierCurveTo(35,22,112,22,112,71);g.lineTo(112,110);g.stroke();g.beginPath();g.moveTo(56,110);g.lineTo(56,71);g.bezierCurveTo(56,48,91,48,91,71);g.lineTo(91,110);g.stroke();line([[32,115],[116,115]]);}
  if(kind==='target'){for(const r of [16,34,51]){g.beginPath();g.arc(73,73,r,0,7);g.stroke();}}
  if(kind==='hub'){line([[44,105],[73,44],[105,105],[44,105]]);for(const p of [[44,105],[73,44],[105,105]]){g.beginPath();g.arc(...p,11,0,7);g.fill();}}
  if(kind==='trace'){line([[34,108],[34,42]]);line([[34,108],[116,108]]);line([[45,86],[65,72],[82,84],[110,47]]);line([[94,47],[110,47],[110,62]]);}
  if(kind==='bars'){for(let i=0;i<3;i++){pathRound(35+i*29,88-i*23,17,30+i*23,3);g.fill();}}
  if(kind==='ledger'){for(let i=0;i<3;i++){pathRound(36,35+i*31,76,22,4);g.stroke();line([[49,46+i*31],[89,46+i*31]]);}}
  if(kind==='robot'){pathRound(36,52,76,59,10);g.stroke();line([[73,52],[73,28]]);for(const x of [56,91]){g.beginPath();g.arc(x,76,5,0,7);g.fill();}line([[54,96],[95,96]]);}
  if(kind==='id'){pathRound(39,37,68,81,6);g.stroke();pathRound(55,30,36,16,4);g.fill();line([[53,83],[68,98],[95,66]]);}
  if(kind==='zero'){g.beginPath();g.arc(73,73,44,0,7);g.stroke();line([[40,105],[105,40]]);}
  if(kind==='eye'){g.beginPath();g.moveTo(23,73);g.bezierCurveTo(49,33,97,33,123,73);g.bezierCurveTo(97,113,49,113,23,73);g.stroke();g.beginPath();g.arc(73,73,18,0,7);g.stroke();}
  g.restore();
}
function feature(t,row,index){
  const a=t-row.start,enter=out(progress(a,0,.10)),xShift=(1-enter)*95;
  g.save();g.globalAlpha=.073;tracked(String(index+1).padStart(2,'0'),110,730,640,950,'#e0ebff',0);g.restore();
  const band=g.createLinearGradient(0,0,W,0);band.addColorStop(0,'#0a245200');band.addColorStop(.23,'#0c235b80');band.addColorStop(.75,'#10295880');band.addColorStop(1,'#0a245200');g.fillStyle=band;g.fillRect(0,382,1920,310);
  tracked(P.content.ecosystem,88,146,24,400,'#53617a',5,'left','monospace');tracked(String(index+1).padStart(2,'0')+' / 12',1775,146,24,400,'#7588b2',5,'right','monospace');
  g.font='850 128px Geist';let tw=g.measureText(row.white).width,bw=g.measureText(row.blue).width,total=146+58+tw+bw,left=960-total/2+xShift;
  icon(row.icon,left,466);let x=left+204;x+=tracked(row.white,x,590,128,850,P.colors.white);tracked(row.blue,x,590,128,850,P.colors.blue);
  if(a<.10)transition(a*2.8,.34);
}
function glitch(t,age){
  if(age<0||age>.17)return;
  // Thin displaced scan bands and chromatic echoes are drawn from our composition, never source pixels.
  ctx.save();const k=1-age/.17,phase=Math.floor(t*90);
  for(let i=0;i<8;i++){
    const y=80+hash(i+phase*17)*920,h=4+hash(i*7+phase)*20,dx=(hash(i*11+phase)-.5)*100*k;
    ctx.drawImage(off,0,y,W,h,dx*canvas.width/W,y*canvas.height/H,canvas.width,h*canvas.height/H);
  }
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=.19*k;
  ctx.drawImage(off,(-11*k)*canvas.width/W,0,canvas.width,canvas.height);ctx.drawImage(off,11*k*canvas.width/W,0,canvas.width,canvas.height);
  ctx.restore();
}
function seek(t){
  if(!P)return;tNow=Math.max(0,Math.min(P.duration,Number(t)));const v=tNow;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';backdrop(v);
  let chapter='',age=-1,index=-1;
  if(v<1.45){chapter='enterprise-connection-command';const text=P.content.intro.slice(0,Math.floor(progress(v,.05,1.12)*P.content.intro.length));tracked(text,960,550,34,400,'#a0acbf',3,'center','monospace');}
  else if(v<4.45){index=Math.min(2,Math.floor(v-1.45));const row=P.titles[index];chapter=row.text;age=v-row.start;title(v,row);}
  else if(v<6.45){chapter='network-convergence';network(v);}
  else if(v<7.966){chapter='brand-reveal';brand(v);age=v-6.45;transition(age,1.3);}
  else if(v<12.733){index=P.features.findIndex(row=>v>=row.start&&v<row.end);if(index<0)index=11;const row=P.features[index];chapter='feature-'+row.icon;age=v-row.start;feature(v,row,index);}
  else if(v<14){chapter='connect-command';g.fillStyle='#000000d5';g.fillRect(0,80,W,920);const a=v-12.94,n=Math.floor(progress(a,0,.57)*P.content.command.length);let s=P.content.command.slice(0,n)+(n===P.content.command.length&&v%1<.7?'_':'');tracked(s,960,550,35,400,'#a7b4cb',3,'center','monospace');}
  else{chapter='brand-and-website';brand(v,true);age=v-14;transition(age,1.2);}
  // Analytic raster/CRT texture remains stable across repeated or backwards seeks.
  g.fillStyle='#00000017';for(let y=80;y<1000;y+=4)g.fillRect(0,y,W,1);
  let vignette=g.createRadialGradient(960,540,220,960,540,1100);vignette.addColorStop(0,'#00000000');vignette.addColorStop(.68,'#00000008');vignette.addColorStop(1,'#000000b8');g.fillStyle=vignette;g.fillRect(0,80,W,920);
  g.fillStyle='#000';g.fillRect(0,0,W,80);g.fillRect(0,1000,W,80);
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(off,0,0,canvas.width,canvas.height);glitch(v,age);
  if(v<.22){ctx.fillStyle=`rgba(0,0,0,${1-smooth(progress(v,0,.22))})`;ctx.fillRect(0,0,canvas.width,canvas.height);}
  if(v>17.38){ctx.fillStyle=`rgba(0,0,0,${smooth(progress(v,17.38,17.98))})`;ctx.fillRect(0,0,canvas.width,canvas.height);}
  state={t:Number(v.toFixed(6)),chapter,featureIndex:chapter.startsWith('feature-')?index+1:null};document.getElementById('scrub').value=v;document.getElementById('time').textContent=v.toFixed(2)+'s';return state;
}
window.seek=seek;window.getState=()=>state;
const readyPromise=(async()=>{P=await(await fetch('project.json')).json();const font=new FontFace('Geist','url(../../reference-shared/fonts/73894e0448cae90a92b6.ttf)',{weight:'100 900'});await font.load();document.fonts.add(font);await document.fonts.ready;canvas.width=innerWidth;canvas.height=innerHeight;if(new URLSearchParams(location.search).get('render')==='1')document.body.classList.add('render');seek(0);})();window.ready=()=>readyPromise;
document.getElementById('scrub').oninput=e=>{playing=false;seek(+e.target.value)};document.getElementById('play').onclick=()=>{playing=!playing;lastClock=performance.now()};
function tick(now){if(playing&&P){seek((tNow+(now-lastClock)/1000)%P.duration);}lastClock=now;requestAnimationFrame(tick)}requestAnimationFrame(tick);addEventListener('resize',()=>{canvas.width=innerWidth;canvas.height=innerHeight;seek(tNow)});
