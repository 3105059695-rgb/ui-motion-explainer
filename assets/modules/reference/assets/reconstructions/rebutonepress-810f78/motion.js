/* Independent scene for Prompt Motion case 155. Native procedural geometry,
   sampled camera anchors, analytic visual lensing; no original video/image layers. */
(()=>{'use strict';
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d',{alpha:false});let C,GL,prog,uniforms,readyPromise,state={},physics=[];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,t)=>{let x=clamp((t-a)/(b-a));return x*x*(3-2*x)},fade=(t,a,b,d=.4)=>smooth(a,a+d,t)*(1-smooth(b-d,b,t));
const lut=(t,rows)=>{if(t<=rows[0][0])return rows[0][1];for(let i=1;i<rows.length;i++)if(t<=rows[i][0])return mix(rows[i-1][1],rows[i][1],smooth(rows[i-1][0],rows[i][0],t));return rows.at(-1)[1]},rnd=seed=>{let z=seed>>>0;return()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}};
function compile(type,source){const sh=GL.createShader(type);GL.shaderSource(sh,source);GL.compileShader(sh);if(!GL.getShaderParameter(sh,GL.COMPILE_STATUS))throw Error(GL.getShaderInfoLog(sh));return sh}
const vertex=`#version 300 es
in vec2 pos;out vec2 uv;void main(){uv=pos*.5+.5;gl_Position=vec4(pos,0,1);}`;
const fragment=`#version 300 es
precision highp float;
in vec2 uv;out vec4 color;
uniform vec4 cam;uniform float tm;uniform float intensity;uniform vec3 diskColor;uniform sampler2D stars;uniform sampler2D noiseTex;
float sat(float x){return clamp(x,0.,1.);}float bell(float x){return exp(-x*x);}float noise(vec2 p){return texture(noiseTex,p).r;}
float strands(float distance,float angle,float w){
 float n=noise(vec2(angle*.008+tm*.00005,distance*.008));
 float f=sin(distance*87.+n*2.5+sin(angle*2.-tm*.08)*.25);
 float f2=sin(distance*157.+n*1.4+angle*.8+tm*.015);
 return .50+.31*f+.13*f2+.13*n;
}
void main(){
 vec2 pixel=vec2(uv.x,1.-uv.y)*vec2(960.,540.);
 if(pixel.y<69.||pixel.y>=471.){color=vec4(0,0,0,1);return;}
 vec2 q=(pixel-cam.xy)/max(cam.z,1.);float rr=length(q);float th=atan(q.y,q.x);
 float lens=.26/(rr*rr+.18);vec2 su=vec2(pixel.x/960.,pixel.y/540.);
 vec2 sp=(su-.5)*mat2(cos(cam.w),-sin(cam.w),sin(cam.w),cos(cam.w));
 sp+=.5;sp+=vec2(tm*.000055,-tm*.000022);
 sp+=(q/max(rr,.05))*.04*lens;
 vec3 bg=texture(stars,sp).rgb;
 // Narrow arcs around the critical radius stretch the star texture, not a video.
 bg+=texture(stars,sp+vec2(cos(th+.01),sin(th+.01))*.014*lens).rgb*.18;
 bg*=1.-smoothstep(.89,1.04,1./max(rr,.001));
 float outside=smoothstep(.975,1.015,rr);
 float top=-1.56*exp(-pow(abs(q.x)/1.65,2.5))+.04;
 float topDist=(q.y-top)/.30;
 float topMask=bell(topDist)*smoothstep(3.65,2.50,abs(q.x));
 float topBand=strands(topDist*.31,atan(q.x,q.y-1.4),.1);
 float upper=topMask*(.52+.70*topBand);
 float bottom=1.18*sqrt(max(0.,1.-pow(q.x/1.13,2.)));
 float bottomD=(q.y-bottom)/.155;
 float lower=bell(bottomD)*smoothstep(1.20,1.06,abs(q.x))*(.38+.62*strands(bottomD*.20,th,.1));
 float er=length(vec2(q.x,q.y/.28));
 float rear=smoothstep(1.32,1.62,er)*smoothstep(3.9,2.7,er)*bell(q.y/.45);
 rear*=.30+.60*strands(er*.28,th,.1);
 float frontBase=mix(.29,.50,smoothstep(75.,160.,cam.z))+.095*(q.x*q.x)/8.;
 float frontDistance=(q.y-frontBase)/(.12+.045*sqrt(max(0.,1.-pow(q.x/3.8,2.))));
 float front=bell(frontDistance)*smoothstep(3.8,2.7,abs(q.x));
 front*=.45+.63*strands(frontDistance*.28,atan(q.y/.21,q.x),.1);
 front*=smoothstep(-.02,.05,q.y);
 float side=1.-smoothstep(-.9,.9,q.x);float boost=mix(.68,2.55,side);
 vec3 warm=mix(diskColor,vec3(1.07,1.025,.96),pow(side,.75));
 float visible=(upper+lower+rear)*outside+front;
 vec3 disk=warm*visible*boost;
 // Analytic glow replaces expensive per-frame blur passes.
 float halo=bell((q.x+1.05)/.65)*bell((q.y+.05)/.85)*1.1;
 halo+=bell((q.x+1.1)/1.3)*bell(q.y/.62)*.15;
 disk+=vec3(.97,.93,.86)*halo;
 float photon=bell((rr-1.)/.0035)*(.09+.24*side);
 disk+=vec3(.74,.68,.58)*photon;
 // Left bloom can spill over the silhouette; the central hole stays dark.
 float spill=bell((q.x+.96)/.54)*bell(q.y/.95)*.32;
 bg*=outside;disk+=vec3(.7,.65,.56)*spill;
 vec3 col=bg+vec3(1.)-exp(-max(disk,vec3(0.))*.84);
 float vign=1.-.32*pow(length((pixel-vec2(480,270))/vec2(650,360)),2.);
 color=vec4(max(vec3(0),col)*sat(vign)*intensity,1.);
}`;
function makeStars(){const c=document.createElement('canvas');c.width=c.height=1536;const g=c.getContext('2d'),rand=rnd(44255);g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);
 for(let i=0;i<155;i++){let x=rand()*1536,y=rand()*1536,r=60+rand()*150;const b=g.createRadialGradient(x,y,0,x,y,r);b.addColorStop(0,`rgba(54,45,66,${.025+rand()*.040})`);b.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=b;g.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<6700;i++){let x=rand()*1536,y=rand()*1536,s=.2+Math.pow(rand(),12)*1.9,a=.08+Math.pow(rand(),2)*.57;g.fillStyle=`rgba(214,217,222,${a})`;g.fillRect(x,y,s,s)}
 for(let i=0;i<44;i++){let x=rand()*1536,y=rand()*1536,r=3+rand()*10;const b=g.createRadialGradient(x,y,0,x,y,r);let cold=rand()>.2;b.addColorStop(0,'rgba(255,255,255,.85)');b.addColorStop(.11,cold?'rgba(193,218,255,.47)':'rgba(247,191,130,.42)');b.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=b;g.fillRect(x-r,y-r,r*2,r*2)}return c}
function makeNoise(){let c=document.createElement('canvas');c.width=256;c.height=256;let g=c.getContext('2d'),im=g.createImageData(256,256),rand=rnd(1005);for(let i=0;i<256*256;i++){let v=Math.floor(rand()*255);im.data[i*4]=v;im.data[i*4+1]=v;im.data[i*4+2]=v;im.data[i*4+3]=255}g.putImageData(im,0,0);return c}
function texture(c,unit){const t=GL.createTexture();GL.activeTexture(GL.TEXTURE0+unit);GL.bindTexture(GL.TEXTURE_2D,t);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MIN_FILTER,GL.LINEAR);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MAG_FILTER,GL.LINEAR);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_S,GL.REPEAT);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_T,GL.REPEAT);GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,GL.RGBA,GL.UNSIGNED_BYTE,c)}
let glCanvas;
function setupGL(){glCanvas=document.createElement('canvas');glCanvas.width=960;glCanvas.height=540;GL=glCanvas.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:true});if(!GL)throw Error('WebGL2 required');prog=GL.createProgram();GL.attachShader(prog,compile(GL.VERTEX_SHADER,vertex));GL.attachShader(prog,compile(GL.FRAGMENT_SHADER,fragment));GL.linkProgram(prog);if(!GL.getProgramParameter(prog,GL.LINK_STATUS))throw Error(GL.getProgramInfoLog(prog));GL.useProgram(prog);let b=GL.createBuffer();GL.bindBuffer(GL.ARRAY_BUFFER,b);GL.bufferData(GL.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),GL.STATIC_DRAW);let loc=GL.getAttribLocation(prog,'pos');GL.enableVertexAttribArray(loc);GL.vertexAttribPointer(loc,2,GL.FLOAT,false,0,0);uniforms={};for(const n of ['cam','tm','intensity','diskColor','stars','noiseTex'])uniforms[n]=GL.getUniformLocation(prog,n);texture(makeStars(),0);texture(makeNoise(),1);GL.uniform1i(uniforms.stars,0);GL.uniform1i(uniforms.noiseTex,1);GL.viewport(0,0,960,540)}
function makePhysics(){physics=[];let R=C.initial_radius_rs,E=Math.sqrt((R-1)/R),end=Math.acos(1/Math.sqrt(R))-1e-7,N=24000,prevTau=0,mother=0,received=0,prevV=0;
 for(let i=0;i<=N;i++){let eta=end*i/N,r=R*Math.cos(eta)**2,tau=R**1.5*(eta+Math.sin(eta)*Math.cos(eta)),v=Math.sqrt(Math.max(0,(R-r)/(r*(R-1))));if(i){let dt=tau-prevTau;mother+=dt*.5*(1/(1-prevV)+1/(1-v));received+=dt*.5*(1/(1+prevV)+1/(1+v))}physics.push({r,tau,v,mother,received});prevTau=tau;prevV=v}
}
function samplePhysics(value,key){if(value<0)return{r:C.initial_radius_rs,tau:value,v:0,mother:value,received:value};let lo=0,hi=physics.length-1;while(hi-lo>1){let mid=(lo+hi)>>1;if(physics[mid][key]<=value)lo=mid;else hi=mid}const a=physics[lo],b=physics[hi],u=clamp((value-a[key])/(b[key]-a[key]));let o={};for(const n of ['r','tau','v','mother','received'])o[n]=mix(a[n],b[n],u);return o}
function camera(t){
 let r=lut(t,[[0,7],[5,10],[10,13],[20,17],[30,24],[40,32],[50,44],[60,56],[75,77],[85,96],[95,121],[105,146],[112,157],[120,160],[130,167],[140,169],[150,178],[160,188],[170,216],[182.5,235],[190,243],[214,246],[214.3,119],[216,126],[220,128],[227.5,128],[232,141],[235,150],[240,171],[247.5,205],[252,298],[255,370],[260,455],[265,739],[266.7,2100],[267.5,2100],[268,245],[270,245],[290,244],[300,243]]);
 let x=lut(t,[[0,480],[214,480],[216,480],[227.5,480],[231,540],[234,810],[236,1085],[242,1085],[247.5,1100],[249,610],[252,505],[255,494],[260,480],[265,480],[300,480]]);
 let y=lut(t,[[0,270],[120,270],[180,272],[214,272],[216,262],[227.5,256],[240,270],[247.5,270],[252,270],[265,300],[268,270],[300,270]]);
 let roll=lut(t,[[0,0],[80,.02],[95,-.05],[112,.08],[135,.03],[160,.05],[214,.08],[216,0],[227.5,0],[240,-.03],[252,0],[265,.02],[268,0]]);
 return{x,y,r,roll};
}
function text(s,x,y,size,color='#e9e7df',align='left',font=C.chinese_font){ctx.font=`400 ${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y)}
function timeStr(value){let sign=value<0?'-':'+';let abs=Math.abs(value),minute=Math.floor(abs/60);return sign+String(minute).padStart(2,'0')+':'+(abs%60).toFixed(2).padStart(5,'0')}
function hud(t){let own=t>=214.3&&t<267.1,alpha=fade(t,114.2,267.1,.65);if(alpha<=0)return null;const p=own?samplePhysics(t-C.probe_perspective_offset,'tau'):samplePhysics(t-C.release_time,'mother'),dark='rgba(233,230,218,.42)';ctx.save();ctx.globalAlpha=alpha;
 text(own?C.probe:C.mothership,48,101,12,'#c9a164');text(own?C.received_mothership:C.received_probe,912,101,12,'#c9a164','right');ctx.strokeStyle='rgba(212,201,177,.22)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(48,109);ctx.lineTo(198,109);ctx.moveTo(762,109);ctx.lineTo(912,109);ctx.stroke();
 let left=own?[['τ',timeStr(p.tau)],['r',p.r.toFixed(3)+' rₛ'],['v',p.v.toFixed(3)+' c']]:[['r',C.initial_radius_rs.toFixed(2)+' rₛ'],['T',timeStr(t-C.release_time)]];
 let z=1/Math.max(.000001,1-p.v)-1,db=40*Math.log10(Math.max(.000001,1-p.v));let right=own?[['T',timeStr(p.received)],['速率','×'+(1/(1+p.v)).toFixed(3)]]:[['τ',timeStr(p.tau)],['z',z.toFixed(3)],['dB',db.toFixed(1)]];
 for(let i=0;i<left.length;i++){text(left[i][0],48,129+i*21,14,dark,'left','GeistMono,monospace');text(left[i][1],198,129+i*21,14,'#dedbd1','right','GeistMono,monospace')}
 for(let i=0;i<right.length;i++){text(right[i][0],762,129+i*21,14,dark,'left',i===1&&own?C.chinese_font:'GeistMono,monospace');text(right[i][1],912,129+i*21,14,'#dedbd1','right','GeistMono,monospace')}
 let badge=fade(t,214.3,220.4,.35);if(badge>0){ctx.globalAlpha=alpha*badge;text(C.probe_view,480,101,13,'#e4b56d','center')}ctx.restore();return{perspective:own?'probe':'mothership',tau:p.tau,r:p.r,v:p.v,z,db,received_mothership:p.received};
}
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill()}
function probe(t,p){if(t<115||t>213.5)return;let elapsed=t-C.release_time,a=fade(t,115,126,.55),x=lut(t,[[115,235],[120,243],[122,326],[125,421],[128,470],[140,478],[213,480]]),y=lut(t,[[115,400],[120,378],[122,337],[125,290],[128,268],[213,271]]),size=lut(t,[[115,1],[120,.8],[122,.46],[125,.15],[128,.04],[130,0]]);
 if(size>.005){ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.globalAlpha=a;
 polygon([[-202,-23],[-42,-38],[43,-3],[-85,13]],'#898276');let material=ctx.createLinearGradient(-92,-20,10,-10);material.addColorStop(0,'#47443e');material.addColorStop(.3,'#504b42');material.addColorStop(1,'#6e6252');polygon([[-92,-85],[10,-99],[10,96],[-92,110]],material);let side=ctx.createLinearGradient(10,0,78,10);side.addColorStop(0,'#b5a08a');side.addColorStop(1,'#726350');polygon([[10,-99],[78,-90],[78,83],[10,96]],side);polygon([[-92,-85],[-55,-104],[78,-90],[10,-99]],'#9c9380');polygon([[-10,-12],[253,13],[231,29],[0,5]],'#6e6759');polygon([[-122,-109],[91,-100],[18,-74],[-66,-88]],'#897b68');ctx.fillStyle='#90836b';ctx.fillRect(-32,-157,2,65);ctx.restore()}
 if(elapsed>=0){let sig=samplePhysics(elapsed,'mother'),u=sig.tau-Math.floor(sig.tau),blink=Math.exp(-u*u/0.05)*Math.pow(1-sig.v,1.5)*C.signal_brightness;let warm=smooth(48,64.6,sig.tau),r=2+6*blink;ctx.save();ctx.globalAlpha=clamp(blink);const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,warm>.6?'#ffc4a0':'#fff9ed');g.addColorStop(.3,warm>.6?'rgba(228,116,65,.7)':'rgba(228,215,190,.7)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore()}
}
function title(t){let a=fade(t,6.6,19.2,1.2);if(t>289)a=fade(t,289.2,299,1.2);if(a<=0)return;ctx.save();ctx.globalAlpha=a;text(C.title,480,289,C.title_size,'#e5e2d6','center');ctx.globalAlpha=a*.52;ctx.font=`400 15px ${C.chinese_font}`;ctx.fillStyle='#c9c8c0';ctx.textAlign='center';ctx.letterSpacing='5px';ctx.fillText(C.subtitle,480,335);ctx.letterSpacing='0px';ctx.restore()}
function phase(t){return t<6.6?'black-hole-approach':t<19.2?'opening-title':t<101.68?'disk-and-lensing':t<114.2?'mothership-12rs':t<122?'probe-release':t<159.67?'synchronous-to-stretched-signal':t<175.67?'interval-stretches':t<198.67?'redshift-and-freeze':t<214.3?'mothership-outside-horizon':t<231?'probe-perspective':t<249?'look-back-at-mothership':t<267.1?'crossing-horizon':t<268?'black-cut':t<289.2?'late-mothership-view':'closing-title'}
function seek(time){if(!C||!GL)return;let external=clamp(Number(time)||0,0,C.duration),t=external*300/C.duration,cam=camera(t),brightness=smooth(0,3.5,t)*(1-smooth(298.1,300,t));brightness*=1-.64*smooth(268,272,t);if(t>=266.7&&t<268)brightness*=1-smooth(266.7,267.05,t);
 ctx.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,960,540);GL.useProgram(prog);GL.uniform4f(uniforms.cam,cam.x,cam.y,cam.r,cam.roll);GL.uniform1f(uniforms.tm,t);GL.uniform1f(uniforms.intensity,brightness*C.scene_brightness);const col=C.disk_color.replace('#','');GL.uniform3f(uniforms.diskColor,parseInt(col.slice(0,2),16)/255,parseInt(col.slice(2,4),16)/255,parseInt(col.slice(4,6),16)/255);GL.drawArrays(GL.TRIANGLES,0,6);ctx.drawImage(glCanvas,0,0,960,540);
 ctx.save();ctx.beginPath();ctx.rect(0,69,960,402);ctx.clip();probe(t);let h=hud(t);ctx.restore();title(t);
 let caption=C.subtitles.find(s=>t>=s.start&&t<s.end),captionAlpha=0;if(caption){captionAlpha=fade(t,caption.start,caption.end,.27);ctx.save();ctx.globalAlpha=captionAlpha;text(caption.text,480,513,C.subtitle_size,'#e6e6df','center');ctx.restore()}
 state={time:external,internal_time:t,phase:phase(t),camera:cam,subtitle:caption?.text||'',subtitle_alpha:captionAlpha,hud:h||null,brightness,physics_table_samples:physics.length,visual_model:'independent analytic approximation; not recovered GR renderer'};
}
function ready(){if(readyPromise)return readyPromise;readyPromise=(async()=>{C=await(await fetch('project.json')).json();canvas.width=C.width;canvas.height=C.height;window.project=C;window.duration=C.duration;const f=new FontFace('GeistMono','url(../../reference-shared/fonts/d00e590b8eb3a59acc32.ttf)',{weight:'100 900'});await f.load();document.fonts.add(f);await document.fonts.load(`20px ${C.chinese_font}`);await document.fonts.ready;makePhysics();setupGL();seek(0);if(!new URLSearchParams(location.search).has('render')){let epoch=performance.now();function frame(now){seek(((now-epoch)/1000)%C.duration);requestAnimationFrame(frame)}requestAnimationFrame(frame)}return true})();return readyPromise}
window.seek=seek;window.ready=ready;window.getState=()=>JSON.parse(JSON.stringify(state));ready();
})();
