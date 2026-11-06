// Independent procedural chrome disc, with eight through-holes and extruded bevel/rim surfaces.
// No reference image, environment photograph, model download or source movie is sampled.
window.makeChromeDisc = () => {
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1280;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL unavailable');
  const vert=`attribute vec3 p;attribute vec3 n;uniform vec3 rot;uniform vec3 placement;varying vec3 P;varying vec3 N;varying float radius;
  vec3 turn(vec3 p){float a=rot.x,b=rot.y,c=rot.z;p=vec3(p.x,p.y*cos(a)-p.z*sin(a),p.y*sin(a)+p.z*cos(a));p=vec3(p.x*cos(b)+p.z*sin(b),p.y,-p.x*sin(b)+p.z*cos(b));return vec3(p.x*cos(c)-p.y*sin(c),p.x*sin(c)+p.y*cos(c),p.z);}
  void main(){radius=length(p.xy);P=turn(p);N=turn(n);float persp=1.0/(1.0+P.z*.26);vec2 pt=P.xy*placement.z*persp+placement.xy;gl_Position=vec4((pt.x-540.0)/540.0,-(pt.y-960.0)/960.0,P.z*.22,1.0);}`;
  const frag=`precision mediump float;varying vec3 P;varying vec3 N;varying float radius;uniform float clock;
  void main(){float rr=length(P.xy);float ridge=rr>.87?sin(rr*200.0)*.34:0.0;vec3 norm=normalize(N+vec3(P.xy*(.27+ridge),0.0)*abs(N.z));vec3 view=normalize(vec3(P.xy*.09,2.7-P.z));vec3 R=reflect(-view,norm);float stripe=pow(max(0.0,sin(R.x*7.2+R.y*5.5+clock*.45)),10.0);float broad=pow(max(0.0,dot(R,normalize(vec3(.1,-.92,.5)))),14.0);float edge=pow(1.0-abs(dot(norm,view)),2.0);float bands=.025+.23*(.5+.5*sin(R.y*10.0+R.x*6.0))+.75*stripe+2.8*broad+1.5*edge;vec3 c=vec3(bands);c+=vec3(.065,.04,.12)*edge;float side=.5+.5*abs(norm.z);c*=side*(.13+.87*smoothstep(.68,.96,radius));gl_FragColor=vec4(c,1.0);}`;
  const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
  const verts=[];const push=(p,n)=>verts.push(...p,...n),tri=(a,b,c,n)=>{push(a,n);push(b,n);push(c,n);};const pt=(r,a,z)=>[r*Math.cos(a),r*Math.sin(a),z];
  const hole=(r,a)=>{const q=((a+Math.PI/8)%(Math.PI/4)+Math.PI/4)%(Math.PI/4)-Math.PI/8;const k=(r-.43)/.40;return k>0&&k<1&&Math.abs(q)<.185*Math.pow(Math.sin(k*Math.PI),.3);};
  const NR=96,NA=512;
  const gap=r=>r>.43&&r<.83?.185*Math.pow(Math.sin((r-.43)/.4*Math.PI),.3):0;
  // Direct analytic curved boundaries: no polar-grid stair steps along the eight holes.
  for(let h=0;h<8;h++)for(let ir=0;ir<NR;ir++)for(let ia=0;ia<32;ia++){
    const r0=ir/NR,r1=(ir+1)/NR,g0=gap(r0),g1=gap(r1),base=h*Math.PI/4;
    const a0=base+g0+(Math.PI/4-2*g0)*ia/32,a1=base+g0+(Math.PI/4-2*g0)*(ia+1)/32;
    const b0=base+g1+(Math.PI/4-2*g1)*ia/32,b1=base+g1+(Math.PI/4-2*g1)*(ia+1)/32;
    for(const side of [1,-1]){const z=side*.044,n=[0,0,side],A=pt(r0,a0,z),B=pt(r1,b0,z),C=pt(r1,b1,z),D=pt(r0,a1,z);tri(A,B,C,n);tri(A,C,D,n);}
  }
  // Polished cylindrical outer rim, with a shallow front bevel.
  for(let i=0;i<NA;i++){const a=i/NA*Math.PI*2,b=(i+1)/NA*Math.PI*2,m=(a+b)/2,n=[Math.cos(m),Math.sin(m),0];tri(pt(1,a,-.044),pt(1,b,-.044),pt(1,b,.044),n);tri(pt(1,a,-.044),pt(1,b,.044),pt(1,a,.044),n);
    const nb=[Math.cos(m)*.5,Math.sin(m)*.5,.866];tri(pt(.965,a,.044),pt(1,a,.025),pt(1,b,.025),nb);tri(pt(.965,a,.044),pt(1,b,.025),pt(.965,b,.044),nb);
  }
  // Curved black-through-hole walls give a physical thickness at grazing angles.
  for(let h=0;h<8;h++)for(let side of [-1,1])for(let j=0;j<60;j++){
    const f=j/60,g=(j+1)/60,ra=.43+f*.4,rb=.43+g*.4,aa=h*Math.PI/4+side*.185*Math.pow(Math.sin(f*Math.PI),.3),ab=h*Math.PI/4+side*.185*Math.pow(Math.sin(g*Math.PI),.3);const A=pt(ra,aa,-.044),B=pt(rb,ab,-.044),C=pt(rb,ab,.044),D=pt(ra,aa,.044),dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,n=[-side*dy/len,side*dx/len,0];tri(A,B,C,n);tri(A,C,D,n);
  }
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);for(const [name,off]of [['p',0],['n',12]]){const a=gl.getAttribLocation(prog,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,24,off);}const U=Object.fromEntries(['rot','placement','clock'].map(n=>[n,gl.getUniformLocation(prog,n)]));gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
  return {canvas,vertices:verts.length/6,paint(t,x=540,y=1070,r=540,rx=.58,ry=.10,rz=-.32){gl.viewport(0,0,720,1280);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3f(U.rot,rx,ry,rz);gl.uniform3f(U.placement,x,y,r);gl.uniform1f(U.clock,t);gl.drawArrays(gl.TRIANGLES,0,verts.length/6);}};
};
