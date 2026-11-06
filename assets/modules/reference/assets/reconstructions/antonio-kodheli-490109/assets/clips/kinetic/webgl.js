/* Independent procedural geometry. No source video, screenshots, or remote assets. */
(function(){
 'use strict';
 const V=(x,y,z)=>[x,y,z],add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
 function surface(fn,nu,nv){
  const p=[],n=[],uv=[],idx=[];
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){
   const u=i/nu,v=j/nv,q=fn(u,v),du=sub(fn(u+.0002,v),fn(u-.0002,v)),dv=sub(fn(u,v+.0002),fn(u,v-.0002)),normal=norm(cross(dv,du));
   p.push(...q);n.push(...normal);uv.push(u,v);
  }
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,a+1,b,b+1)}
  return{p:new Float32Array(p),n:new Float32Array(n),uv:new Float32Array(uv),idx:new Uint16Array(idx)};
 }
 function knot(tall=false){
  function path(u){const a=u*2*Math.PI;if(tall)return[(175+70*Math.cos(2*a))*Math.cos(a),(175+70*Math.cos(2*a))*Math.sin(a)*1.45,120*Math.sin(2*a)];return[(203+91*Math.cos(3*a))*Math.cos(2*a),(203+91*Math.cos(3*a))*Math.sin(2*a),91*Math.sin(3*a)]}
  return surface((u,v)=>{const q=path(u),T=norm(sub(path(u+.0001),path(u-.0001))),N=norm(cross(T,[0,0,1])),B=norm(cross(T,N)),r=tall?34:37,a=v*2*Math.PI;return add(q,add(mul(N,r*Math.cos(a)),mul(B,r*Math.sin(a))))},240,20);
 }
 function star(){return surface((u,v)=>{const a=u*2*Math.PI-Math.PI/2,p=v*Math.PI,r=266*(.79+.23*Math.cos(5*(a+Math.PI/2))),s=Math.sin(p);return[r*s*Math.cos(a),r*s*Math.sin(a),96*Math.cos(p)]},150,48)}
 function sphere(){return surface((u,v)=>{const a=u*2*Math.PI,p=v*Math.PI;return[85*Math.sin(p)*Math.cos(a),85*Math.sin(p)*Math.sin(a),85*Math.cos(p)]},72,36)}
 function ring(){return surface((u,v)=>{const a=u*2*Math.PI,b=v*2*Math.PI;return[(280+9*Math.cos(b))*Math.cos(a),(280+9*Math.cos(b))*Math.sin(a),74*Math.sin(b)]},200,24)}
 window.createSolidRenderer=function(canvas){
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL is required for the procedural 3D objects');
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
  const vs=shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 normal;attribute vec2 texcoord;uniform vec3 rotation;uniform vec2 center;uniform float scale;varying vec3 N;varying vec3 P;varying vec3 Local;varying vec2 UV;
   vec3 rot(vec3 p){float x=rotation.x,y=rotation.y,z=rotation.z;p=vec3(p.x,p.y*cos(x)-p.z*sin(x),p.y*sin(x)+p.z*cos(x));p=vec3(p.x*cos(y)+p.z*sin(y),p.y,-p.x*sin(y)+p.z*cos(y));return vec3(p.x*cos(z)-p.y*sin(z),p.x*sin(z)+p.y*cos(z),p.z);}
   void main(){vec3 p=rot(position)*scale;N=normalize(rot(normal));P=p;Local=position;UV=texcoord;float d=1400.0-p.z;vec2 s=center+p.xy*1400.0/d;gl_Position=vec4((s.x/960.0-1.0)*d,(1.0-s.y/540.0)*d,-p.z/1000.0*d,d);}`);
  const fs=shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 N;varying vec3 P;varying vec3 Local;varying vec2 UV;uniform float material;uniform sampler2D lettering;uniform vec3 lime;
   float strip(float v,float c,float w){return exp(-pow((v-c)/w,2.0));}
   void main(){vec3 n=normalize(N);vec3 eye=normalize(vec3(-P.xy,1400.0-P.z));vec3 r=reflect(-eye,n);float fr=pow(1.0-abs(dot(n,eye)),3.0);
    float white=strip(r.x,.12,.055)+.7*strip(r.x,-.6,.12)+.75*strip(r.y,-.46,.065)+.4*strip(r.y,.5,.17);
    float env=.12+.3*(r.y*.5+.5)+white*.84;vec3 color=vec3(env);float panel=smoothstep(.15,.6,sin(r.x*3.3+r.y*2.2+.6));color=mix(color,color*lime*.8+lime*.11,panel*.86);color+=vec3(fr*.28);
    if(material>0.5&&material<1.5){float diff=.74+.26*max(dot(n,normalize(vec3(-.6,-.8,1.1))),0.0);color=lime*diff+vec3(white*.24+fr*.25);}
    if(material>1.5&&material<2.5){color=vec3(.018,.035,.012)+vec3(white*.27+fr*.17);}
    if(material>2.5){vec2 uv=vec2(fract(UV.x),clamp(Local.z/148.0+.5,0.0,1.0));vec3 ink=texture2D(lettering,uv).rgb;color=ink*(.68+.32*max(n.z,0.0));}
    gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);}`);
  const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));gl.useProgram(pr);
  const A={};for(const name of ['position','normal','texcoord'])A[name]=gl.getAttribLocation(pr,name);const U={};for(const name of ['rotation','center','scale','material','lettering','lime'])U[name]=gl.getUniformLocation(pr,name);
  const meshes={};for(const [name,data]of Object.entries({knot:knot(),fold:knot(true),star:star(),sphere:sphere(),ring:ring()})){const m={count:data.idx.length};for(const [key,arr]of [['position',data.p],['normal',data.n],['texcoord',data.uv]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);m[key]=b}m.idx=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.idx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,data.idx,gl.STATIC_DRAW);meshes[name]=m}
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
  const label=document.createElement('canvas');label.width=2048;label.height=256;const lc=label.getContext('2d');
  function setRingText(value,lime){lc.fillStyle='#0b0c07';lc.fillRect(0,0,2048,256);lc.fillStyle=lime;lc.font='900 122px PMGeist';lc.textAlign='center';lc.textBaseline='middle';lc.fillText((value+' • ').repeat(2),1024,128,2000);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,label)}
  function clear(){gl.viewport(0,0,1920,1080);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.useProgram(pr)}
  function draw(name,o){const m=meshes[name];for(const key of ['position','normal','texcoord']){gl.bindBuffer(gl.ARRAY_BUFFER,m[key]);gl.enableVertexAttribArray(A[key]);gl.vertexAttribPointer(A[key],key==='texcoord'?2:3,gl.FLOAT,false,0,0)}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.idx);gl.uniform3fv(U.rotation,o.rotation||[0,0,0]);gl.uniform2fv(U.center,o.center||[1380,550]);gl.uniform1f(U.scale,o.scale||1);gl.uniform1f(U.material,o.material||0);const accent=window.project?.colors?.lime||'#ccff23';const rgb=accent==='#ccff23'?[.8,1,.137]:[1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)/255);gl.uniform3fv(U.lime,o.lime||rgb);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.lettering,0);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);gl.finish()}
  return{clear,draw,setRingText,meshStats:Object.fromEntries(Object.entries(meshes).map(([k,v])=>[k,v.count/3]))};
 };
})();
