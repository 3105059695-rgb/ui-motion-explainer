/* Full Stop: dedicated editable figure sequence. Own WebGL materials and generated map texture. */
const canvas=document.getElementById('scene'),g=canvas.getContext('2d');let P,tNow=0,state={},playing=false,last=0;
const clamp=x=>Math.max(0,Math.min(1,x)),progress=(t,a,b)=>clamp((t-a)/(b-a)),smooth=x=>x*x*(3-2*x),out=x=>1-Math.pow(1-x,3),mix=(a,b,x)=>a+(b-a)*x;
const hash=x=>{let n=Math.sin(x*127.1+311.7)*43758.5453;return n-Math.floor(n)};
const W=1920,H=1080,PI=Math.PI;const gpu=document.createElement('canvas');gpu.width=600;gpu.height=600;
const gl=gpu.getContext('webgl',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL required for editable sphere/refraction/world');
const vs='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const fs=`precision highp float;varying vec2 uv;uniform float mode,glass,rot,tilt;uniform sampler2D land,code;
vec3 turn(vec3 n){float ct=cos(tilt),st=sin(tilt);n=vec3(n.x*ct-n.y*st,n.x*st+n.y*ct,n.z);float c=cos(rot),s=sin(rot);return vec3(n.x*c+n.z*s,n.y,-n.x*s+n.z*c);}
void main(){vec2 q=(uv-.5)*2.;float rr=dot(q,q);if(rr>1.){gl_FragColor=vec4(0.);return;}float z=sqrt(max(0.,1.-rr));vec3 n=vec3(q.x,q.y,z),light=normalize(vec3(-.45,.72,.6));float diff=max(0.,dot(n,light));vec3 paper=vec3(.941,.929,.874);
float spec=pow(max(0.,dot(reflect(-light,n),vec3(0.,0.,1.))),100.);float edge=pow(1.-z,3.);vec3 c=vec3(.047,.056,.050)+diff*.065;
// Rectangular windows reflected by the actual spherical surface normal.
vec3 reflection=reflect(vec3(0.,0.,-1.),n);float box1=step(.38,reflection.y)*step(reflection.y,.76)*step(-.82,reflection.x)*step(reflection.x,-.45);float box2=step(.03,reflection.y)*step(reflection.y,.36)*step(.55,reflection.x)*step(reflection.x,.83);
c+=vec3(.68)*box1+vec3(.28)*box2+spec*.9+edge*.075;
if(mode<.5){vec2 warped=uv+(n.xy*(1.-z)*.22)+vec2(sin(q.y*13.)*.013,cos(q.x*11.)*.009);vec3 refr=texture2D(code,vec2(warped.x,1.-warped.y)).rgb;vec3 lens=mix(paper*.96,refr,.18+z*.72)+spec*.58+box1*.52+box2*.2;float fres=.10+edge*.72;c=mix(c,mix(lens,c,fres),glass);}
else{vec3 nn=turn(n);vec2 ll=vec2(atan(nn.x,nn.z)/6.2831853+.5,acos(clamp(nn.y,-1.,1.))/3.14159265);vec3 tex=texture2D(land,ll).rgb;c=tex*(.88+.12*diff);float line=min(abs(fract(ll.x*12.+.5)-.5),abs(fract(ll.y*6.+.5)-.5));c=mix(vec3(.76,.76,.70),c,smoothstep(.002,.007,line));c*=1.-edge*.06;}
gl_FragColor=vec4(c,smoothstep(1.,.985,rr));}`;
function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
let buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);let p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);gl.disable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
function texture(unit,element,name){gl.activeTexture(gl.TEXTURE0+unit);let t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,element);gl.uniform1i(gl.getUniformLocation(program,name),unit);return t;}
function sphere(x,y,r,glass=0,mode=0,rot=0){gl.useProgram(program);gl.viewport(0,0,600,600);gl.uniform1f(gl.getUniformLocation(program,'glass'),glass);gl.uniform1f(gl.getUniformLocation(program,'mode'),mode);gl.uniform1f(gl.getUniformLocation(program,'rot'),rot);gl.uniform1f(gl.getUniformLocation(program,'tilt'),mode?P.physics.globe_tilt_degrees*PI/180:0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);g.drawImage(gpu,x-r,y-r,r*2,r*2);}
const scriptLines=['vec3 through(float ior) {','  vec3 t1 = refract(V, N, 1.0 / ior);','  float chord = 2.0 * R * dot(t1, -N);','  vec3 P2 = P + t1 * chord;','  vec3 N2 = (P2 - C) / R;','  vec3 t2 = refract(t1, -N2, ior);','  return trace(P2, t2);','}'];
const codeSurface=document.createElement('canvas');codeSurface.width=2048;codeSurface.height=1024;let cg=codeSurface.getContext('2d');
function prepareCode(){cg.fillStyle=P.colors.paper;cg.fillRect(0,0,2048,1024);cg.fillStyle='#56554b';cg.font='48px monospace';scriptLines.forEach((s,i)=>cg.fillText(s,80,215+i*74));texture(1,codeSurface,'code');}
function prepareLand(data){
  const mask=document.createElement('canvas');mask.width=4096;mask.height=2048;let m=mask.getContext('2d');m.fillStyle='#fff';
  for(const f of data.features){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const rings of polys){m.beginPath();for(const ring of rings){ring.forEach(([lon,lat],i)=>{let x=(lon+180)/360*4096,y=(90-lat)/180*2048;i?m.lineTo(x,y):m.moveTo(x,y)});m.closePath();}m.fill('evenodd');}}
  const dots=document.createElement('canvas');dots.width=4096;dots.height=2048;let d=dots.getContext('2d');d.fillStyle='#171915';for(let y=0;y<2048;y+=8)for(let x=(y/8)%2?4:0;x<4096;x+=8){d.beginPath();d.arc(x,y,2.3,0,7);d.fill();}d.globalCompositeOperation='destination-in';d.drawImage(mask,0,0);
  const map=document.createElement('canvas');map.width=4096;map.height=2048;let c=map.getContext('2d');c.fillStyle=P.colors.paper;c.fillRect(0,0,4096,2048);c.drawImage(dots,0,0);texture(0,map,'land');
}
function text(s,x,y,size,italic=false,color=P.colors.ink,align='left'){g.font=`${italic?'italic ':''}${size}px 'Times New Roman','Instrument Serif'`;g.textAlign=align;g.textBaseline='alphabetic';g.fillStyle=color;g.fillText(s,x,y);}
function tracked(s,x,y,size,spacing,color,align='left'){g.font=`bold ${size}px 'Times New Roman',serif`;g.fillStyle=color;g.textAlign='left';const chars=[...s],width=chars.reduce((n,ch)=>n+g.measureText(ch).width,0)+Math.max(0,chars.length-1)*spacing;if(align==='right')x-=width;if(align==='center')x-=width/2;for(const ch of chars){g.fillText(ch,x,y);x+=g.measureText(ch).width+spacing;}return width;}
function paper(){g.fillStyle=P.colors.paper;g.fillRect(0,0,W,H);let shade=g.createRadialGradient(960,540,180,960,540,1100);shade.addColorStop(0,'#ffffff04');shade.addColorStop(1,'#69604b11');g.fillStyle=shade;g.fillRect(0,0,W,H);}
function cursor(x,y,h){g.strokeStyle=P.colors.accent;g.lineWidth=3;g.beginPath();g.moveTo(x,y-h);g.lineTo(x,y+7);g.stroke();}
function figure(index,t,start){
  const label=P.content.figures[index-1],n=Math.floor(progress(t,start+.04,start+.30)*label.length),shown=label.slice(0,n);g.font="bold 27px 'Times New Roman',serif";let left=960-(116+(shown?32:0)+label.length*17)/2;
  tracked('FIG. '+index,left,970,27,3,P.colors.accent);text(shown,left+147,970,48,true);if(n<label.length||t%1<.55)cursor(left+147+g.measureText(shown).width,970,43);
}
function dot(x,y,r){g.fillStyle=P.colors.ink;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();}
function handPath(points,color=P.colors.ink,width=4){g.strokeStyle=color;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();}
function ring(x,y,rx,ry,amount=1,angle=0,width=4){g.save();g.translate(x,y);g.rotate(angle);let pts=[];for(let i=0;i<=Math.round(220*amount);i++){let a=PI+i/220*PI*2,noise=hash(i)*1.3;pts.push([Math.cos(a)*(rx+noise),Math.sin(a)*(ry+noise)]);}if(pts.length>1)handPath(pts,P.colors.ink,width);g.restore();}
function shadow(x,y,rx,ry,opacity=.35,blur=8){g.save();g.filter=`blur(${blur}px)`;g.globalAlpha=opacity;g.fillStyle='#59625a';g.beginPath();g.ellipse(x,y,rx,ry,-.06,0,PI*2);g.fill();g.restore();}
function circleShot(t){let a=t-4,angle=-progress(a,.5,1.5)*PI*2,r=250;handPath([[710,540],[1210,540]],P.colors.ink,3);ring(960,540,r,r,progress(a,.5,1.5),0,3);dot(a<.5?mix(960,1210,out(progress(a,0,.5))):a>1.5?mix(1210,960,smooth(progress(a,1.5,2))):960+Math.cos(angle)*r,a<.5||a>1.5?540:540+Math.sin(angle)*r,43);if(a>.6)text('r',856,514,24,true,P.colors.accent);}
function sphereShot(t){let a=t-6,z=smooth(progress(a,.35,2)),r=mix(42,139,z),ringR=mix(250,805,z),ry=mix(250,410,z),angle=-mix(0,.15,z);ring(960,540,ringR,ry,1,angle,mix(3,5,z));g.save();g.translate(960,540);g.rotate(angle);handPath([[-ringR,0],[ringR,0]],P.colors.ink,4);g.restore();shadow(960+r*.9,540+r*.9,r*.95,r*.60,.31,3+z*7);sphere(960,540-r*.08,r);text('d',855,515,28,true,P.colors.accent);text('πd',960-ringR*.94,540-ry*.72,30,true,P.colors.accent);}
function lensShot(t){let a=t-8,glas=smooth(progress(a,.10,.8))*(1-smooth(progress(a,2.5,3.5))),r=mix(145,132,smooth(progress(a,0,1))),x=960+Math.sin(a*.6)*8;
  if(a<3.1){g.save();g.translate(880+Math.sin(a*.5)*110,460);g.transform(1,-.12,.44,.57,0,0);g.translate(-1024,-512);g.globalAlpha=1-smooth(progress(a,2.6,3.1));g.font='48px monospace';g.fillStyle='#56554b';scriptLines.forEach((line,i)=>g.fillText(line,80,215+i*74));g.restore();}
  shadow(x+114,640,170,73,.37,6);if(glas>.5){g.save();g.globalAlpha=glas*.9;g.filter='blur(10px)';g.fillStyle='#fff';g.beginPath();g.ellipse(x+82,624,39,14,-.2,0,PI*2);g.fill();g.restore();}
  sphere(x,515,r,glas);if(a>.7&&a<2.5)text('n=1.5',x-112,725,30,true,P.colors.accent);
}
function bouncePosition(t){
  const a=Math.max(0,t-12.08),e=P.physics.bounce_restitution;let remain=a,start=0,period=.98,height=630,index=0;
  while(remain>period&&index<10){remain-=period;start+=period;period*=Math.sqrt(e);height*=e;index++;}
  const z=smooth(progress(t,12,15.7)),floor=mix(625,840,z),radius=mix(61,125,z),camera=Math.max(0,a-1.25)*155;
  return {x:880+a*95-camera,y:floor-radius-height*mix(.5,1.0,z)*Math.sin(PI*clamp(remain/period)),floor,radius,height,index,age:a,period,start};
}
function ballShot(t){const b=bouncePosition(t),raised=b.floor-b.y-b.radius;
  let points=[];for(let q=12.08;q<t;q+=.022){let pp=bouncePosition(q),f=clamp((q-12.08-pp.start)/pp.period),sc=mix(.5,1.0,smooth(progress(t,12,15.7)));points.push([b.x-(t-q)*330,b.floor-b.radius-pp.height*sc*Math.sin(PI*f)]);}g.fillStyle=P.colors.accent;for(let i=0;i<points.length;i+=3){g.beginPath();g.arc(...points[i],2.8,0,7);g.fill();}
  shadow(b.x+95,b.floor+20,113,27,.43*(1-raised/900),3);sphere(b.x,b.y,b.radius);if(t>13)text('e=0.75',1160,270,30,true,P.colors.accent);
}
const flock=Array.from({length:8192},(_,i)=>({u:hash(i*3),v:hash(i*3+1),w:hash(i*3+2)}));
function smoothedFlock(a){return smooth(progress(a,.8,2.8));}
function flockShot(t){let a=t-16,open=out(progress(a,0,.75)),theta=a*1.8,omega=Math.sin(a*1.6),centerX=960+Math.sin(a*1.9)*100,centerY=520-Math.sin(a*.9)*85; if(a<.72){g.save();g.beginPath();g.rect(790,590,400,200);g.clip();sphere(960,590,100);g.restore();}
  shadow(centerX+180,760,260+open*60,45+open*16,.21,18);g.fillStyle=P.colors.ink;
  const globeMix=smooth(progress(t,20.55,21.1));
  for(let i=0;i<flock.length;i++){
    let b=flock[i],phi=b.u*PI*2,th=Math.acos(2*b.v-1),rad=Math.pow(b.w,.5),bend=smoothedFlock(a),x=(b.u-.5)*240,y=(b.v-.5)*250,z=(b.w-.5)*235;let curl=Math.sin(b.u*PI*1.3+a*.8);y+=bend*170*curl;z+=bend*120*Math.sin(b.v*PI+a);x+=bend*90*Math.sin(b.w*4+a);
    x+=(1-open)*b.u*20;y+=(1-open)*220*(b.v-.5);let xx=x*Math.cos(theta)+z*Math.sin(theta),zz=-x*Math.sin(theta)+z*Math.cos(theta);
    let sx=centerX+xx*open,sy=centerY+y*open+omega*Math.sin(phi)*110*open;
    if(globeMix>0){const lon=b.u*PI*2,lat=Math.acos(2*b.v-1),gx=960+Math.cos(lon)*Math.sin(lat)*210,gy=530+Math.cos(lat)*210;sx=mix(sx,gx,globeMix);sy=mix(sy,gy,globeMix);}
    g.globalAlpha=.64+.30*(zz/450+.5);let s=1.9+2.0*b.w;g.fillRect(sx,sy,s,s*.7);
  }g.globalAlpha=1;if(a>2.4)text('n = 8,192',1090,185,38,true,P.colors.accent,'center');
}
function worldShot(t){let a=t-21,r=210+out(progress(a,0,1))*70-out(progress(a,2,3))*215,x=960-out(progress(a,0,1))*126+out(progress(a,2,3))*126,y=520-out(progress(a,0,1))*69+out(progress(a,2,3))*89;
  shadow(x+280,y+r+170,r*1.28,r*.34,.28,15);g.save();g.translate(x,y);g.rotate(.40);handPath([[0,-r-55],[0,r+55]],P.colors.accent,5);g.restore();sphere(x,y,r,0,1,.65-(a-.8)*.52);g.strokeStyle=P.colors.ink;g.lineWidth=3;g.beginPath();g.arc(x,y,r,0,7);g.stroke();if(a>.4)text('23.4°',x+r*.61,y-r-70,36,true,P.colors.accent);
}
function finalShot(t){let a=t-23.78;if(a<.92)dot(960,540,mix(65,5,out(progress(a,0,.92))));else if(t<26)dot(1380,632,5);
  if(t>=24.99){const lines=P.content.claim,n=Math.floor(progress(t,24.99,26.03)*(lines[0].length+lines[1].length));let first=lines[0].slice(0,n),second=lines[1].slice(0,Math.max(0,n-lines[0].length));text(first,310,470,135);text(second,310,630,135);const sy=second?630:470,sx=310+g.measureText(second||first).width;if(n<lines[0].length+lines[1].length||t%1<.58)cursor(sx+7,sy,130);}
  if(t>26.6){g.globalAlpha=smooth(progress(t,26.6,27.1));tracked(P.content.footer,960,1030,20,1.2,'#777568','center');g.globalAlpha=1;}
}
function seek(t){if(!P)return;tNow=Math.max(0,Math.min(P.duration,Number(t)));const v=tNow;g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);g.globalAlpha=1;g.filter='none';paper();let index=1,start=0,chapter='point';
  if(v<2){let p=smooth(progress(v,.90,2.0));dot(mix(1355,960,smooth(progress(v,.65,2))),540,Math.max(.8,64*p));if(v<.9)cursor(1355,555,125);}
  else if(v<4){index=2;start=2;chapter='line';const a=v-2,px=960+Math.sin(a*PI)*330;let l=960,r=960;for(let q=0;q<a;q+=.02){let x=960+Math.sin(q*PI)*330;l=Math.min(l,x);r=Math.max(r,x);}handPath([[l,540],[r,540]],P.colors.ink,4);dot(px,540,mix(64,44,smooth(progress(a,0,1.8))));}
  else if(v<6){index=3;start=4;chapter='circle';circleShot(v);}
  else if(v<8){index=4;start=6;chapter='sphere';sphereShot(v);}
  else if(v<12){index=5;start=8;chapter='lens';lensShot(v);}
  else if(v<16){index=6;start=12;chapter='ball';ballShot(v);}
  else if(v<21){index=7;start=16;chapter='flock';flockShot(v);}
  else if(v<23.78){index=8;start=21;chapter='world';worldShot(v);}
  else{index=9;start=26;chapter='full-stop';finalShot(v);}
  tracked(P.content.header,80,65,24,5,'#66665a');tracked(P.content.credit,1845,65,24,4.5,'#66665a','right');if(v>.85&&(index!==9||v>26))figure(index,v,start);
  // Stable subtle paper grain; no pre-rendered movie or reference pixels.
  g.globalAlpha=.027;g.fillStyle='#514c3c';for(let i=0;i<2200;i++)g.fillRect(hash(i)*W,hash(i+4422)*H,.8,.8);g.globalAlpha=1;
  state={t:Number(v.toFixed(6)),chapter,figure:index,flockPoints:chapter==='flock'?P.physics.flock_points:0,bounce:chapter==='ball'?bouncePosition(v).index:null};document.getElementById('scrub').value=v;document.getElementById('time').textContent=v.toFixed(2)+'s';return state;
}
window.seek=seek;window.getState=()=>state;
const readyPromise=(async()=>{P=await(await fetch('project.json')).json();const faces=[new FontFace('Instrument Serif','url(../../reference-shared/fonts/498efd461f6ddfcb7a11.ttf)'),new FontFace('Instrument Serif','url(../../reference-shared/fonts/08939b8bdf534afec24a.ttf)',{style:'italic'})];await Promise.all(faces.map(async f=>{await f.load();document.fonts.add(f)}));await document.fonts.ready;prepareCode();prepareLand(await(await fetch('assets/data/ne_110m_land.geojson')).json());canvas.width=innerWidth;canvas.height=innerHeight;if(new URLSearchParams(location.search).get('render')==='1')document.body.classList.add('render');seek(0);})();window.ready=()=>readyPromise;
document.getElementById('scrub').oninput=e=>{playing=false;seek(+e.target.value)};document.getElementById('play').onclick=()=>{playing=!playing;last=performance.now()};function tick(now){if(playing&&P)seek((tNow+(now-last)/1000)%P.duration);last=now;requestAnimationFrame(tick)}requestAnimationFrame(tick);addEventListener('resize',()=>{canvas.width=innerWidth;canvas.height=innerHeight;seek(tNow)});
