/* Independent vector reconstruction. All motion is an analytic function of time. */
(()=>{'use strict';
const canvas=document.querySelector('#scene'),g=canvas.getContext('2d'),stage=document.querySelector('#stage');
let config,mesh,state={},time=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,p)=>a+(b-a)*p;
const smooth=p=>{p=clamp(p);return p*p*(3-2*p)},ease=p=>1-Math.pow(1-clamp(p),3);
const hash=i=>{let a=Math.sin(i*127.1+311.7)*43758.5453;return a-Math.floor(a)};
function fit(){stage.style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/1920,innerHeight/1080)})`;}
addEventListener('resize',fit);fit();
function path(points){g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();}
function background(t){g.fillStyle=config.colors.background;g.fillRect(0,0,1920,1080);const glow=g.createRadialGradient(960,540,0,960,540,780);glow.addColorStop(0,'#151020');glow.addColorStop(.45,'#0d0b17');glow.addColorStop(1,'#020305');g.fillStyle=glow;g.fillRect(0,0,1920,1080);}
function icon(x,y,size,p,t){g.save();g.translate(x,y);g.globalAlpha=p;g.shadowColor='#000';g.shadowBlur=45;g.shadowOffsetY=30;g.fillStyle='#182031';g.beginPath();g.roundRect(-size/2,-size/2,size,size,size*.22);g.fill();g.shadowBlur=0;g.shadowOffsetY=0;g.clip();const base=g.createLinearGradient(-size/2,-size/2,size/2,size/2);base.addColorStop(0,'#431c48');base.addColorStop(.4,'#324350');base.addColorStop(1,'#031c39');g.fillStyle=base;g.fillRect(-size/2,-size/2,size,size);const a=g.createRadialGradient(size*.1,-size*.32,0,size*.1,-size*.32,size*.74);a.addColorStop(0,'#9a632c');a.addColorStop(1,'#9a632c00');g.fillStyle=a;g.fillRect(-size/2,-size/2,size,size);const b=g.createRadialGradient(-size*.4,-size*.26,0,-size*.4,-size*.26,size*.58);b.addColorStop(0,'#862357ae');b.addColorStop(1,'#71265700');g.fillStyle=b;g.fillRect(-size/2,-size/2,size,size);g.restore();}
function brain(t,cx,cy,scale){
 g.save();g.translate(cx,cy);g.scale(scale,scale);
 const wire=smooth((t-.35)/1.35)*(1-smooth((t-13.0)/1.4));
 g.strokeStyle=`rgba(125,140,185,${wire*.45})`;g.lineWidth=1.05/scale;
 for(const tri of mesh.triangles){path(tri.points);g.stroke();for(const point of tri.points){g.fillStyle=`rgba(160,170,195,${wire*.5})`;g.beginPath();g.arc(point[0],point[1],1.55/scale,0,Math.PI*2);g.fill();}}
 let settled=0,flying=0;
 for(const tri of mesh.triangles){
  const arrival=tri.arrival+config.assemblyOffset,flight=.82+hash(tri.id+9)*.32,start=arrival-flight;
  if(t<start)continue;
  const p=ease((t-start)/flight),done=t>=arrival;
  if(done)settled++;else flying++;
  const center=tri.points.reduce((a,b)=>[a[0]+b[0]/3,a[1]+b[1]/3],[0,0]);
  const theta=hash(tri.id+2)*Math.PI*2,dist=600+hash(tri.id+40)*420;
  const dx=Math.cos(theta)*dist*(1-p),dy=Math.sin(theta)*dist*(1-p)+Math.sin(p*Math.PI)*(hash(tri.id+4)-.5)*90;
  const rot=(hash(tri.id+12)-.5)*2.2*(1-p),s=mix(.78,1,p);
  g.save();g.translate(center[0]+dx,center[1]+dy);g.rotate(rot);g.scale(s,s);g.translate(-center[0],-center[1]);
  g.globalAlpha=done?1:smooth((t-start)/.18);path(tri.points);g.fillStyle=config.paletteOverrides[tri.id]||tri.color;g.fill();g.strokeStyle=g.fillStyle;g.lineWidth=.6;g.stroke();g.restore();
 }
 g.restore();return{settled,flying};
}
function render(t){
 t=clamp(Number(t)||0,0,config.duration);time=t;background(t);
 const dock=smooth((t-15.8)/.34),iconP=ease((t-14.48)/.65);
 const centerX=mix(960,495,dock),centerY=mix(554,522,dock),iconSize=mix(676,284,dock);
 const iconScale=mix(.97,1,ease((t-14.48)/.55));
 if(t>=14.48&&t<15.5){const p=clamp((t-14.48)/1.02);g.save();g.globalAlpha=(1-p)*.32;g.strokeStyle='#788195';g.lineWidth=1;g.beginPath();g.arc(960,554,330+p*370,0,Math.PI*2);g.stroke();g.restore();}
 icon(centerX,centerY,iconSize*iconScale,iconP,t);
 const logoScale=mix(mix(.91,1,smooth(t/13.4)),.424,dock),counts=brain(t,centerX,centerY,logoScale);
 const chars=clamp(Math.floor((t-16.32)/.137)+1,0,config.brand.length),label=config.brand.slice(0,chars);
 if(dock){g.save();g.globalAlpha=dock;g.font='600 158px Geist, Arial';g.fillStyle=config.colors.text;g.textAlign='left';g.textBaseline='alphabetic';g.fillText(label,698,558);const tw=g.measureText(label).width;const cursor=t<19.9?(.35+.65*(Math.cos(t*9)>-.15?1:0)):0;g.globalAlpha*=cursor;g.shadowColor=config.colors.cursor;g.shadowBlur=25;g.fillStyle=config.colors.cursor;g.fillRect(698+tw+12,449,8,124);g.restore();}
 const subtitle=smooth((t-18.13)/.58);g.save();g.globalAlpha=subtitle;g.fillStyle=config.colors.subtitle;g.font='500 48px Geist, Arial';g.textAlign='left';g.fillText(config.tagline,698,653);g.restore();
 state={time:t,phase:t<1.65?'wireframe':t<13.4?'triangle-assembly':t<14.48?'assembled-brain':t<15.8?'app-icon-reveal':t<18.13?'wordmark-typing':'brand-hold',trianglesSettled:counts.settled,trianglesFlying:counts.flying,wordmarkCharacters:chars,icon:{x:centerX,y:centerY,size:iconSize,opacity:iconP},subtitleOpacity:subtitle};return state;
}
window.seek=t=>{if(!config)return;return render(t)};window.getState=()=>JSON.parse(JSON.stringify(state));
const ready=Promise.all([fetch('project.json').then(r=>r.json()),fetch('assets/brain-mesh.json').then(r=>r.json())]).then(async([c,m])=>{config=c;mesh=m;window.project=config;window.duration=config.duration;await document.fonts.load('600 158px Geist');await document.fonts.load('500 48px Geist');await document.fonts.ready;render(0);if(!new URLSearchParams(location.search).has('render')){const start=performance.now();const tick=now=>{render((now-start)/1000);if(time<config.duration)requestAnimationFrame(tick)};requestAnimationFrame(tick)}});
window.ready=()=>ready;
})();
