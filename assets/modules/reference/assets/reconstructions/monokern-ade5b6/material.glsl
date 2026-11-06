precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScene;
const float PI=3.14159265359;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
vec3 palette(float a){return .5+.5*cos(a+vec3(0.,2.1,4.2));}
vec2 map(vec3 p){
 if(uScene<.5){
  float blend=smoothstep(9.2,10.3,uTime);vec3 q=p;q.xy=rot(.32*sin(uTime*1.4))*q.xy;q.xz=rot(mix((uTime-8.)*.73,.18*sin(uTime*1.4),blend))*q.xz;
  float d=length(q)-.69;
  d=smin(d,length(q-vec3(.02,1.,0.))-.36,.5);
  d=smin(d,length(q-vec3(-.18,-.91,.05))-.47,.5);
  d=smin(d,length(q-vec3(.66,.3,.03))-.28,.37);
  d=smin(d,length(q-vec3(-.54,-.61,.15))-.26,.33);
  float a=atan(q.y,q.x),major=.8+.11*cos(a*8.+uTime*1.3);
  float tor=length(vec2(length(q.xy)-major,q.z))-(.28+.085*sin(a*8.-uTime));
  d=mix(d,tor,blend);
  d+=.025*sin(q.x*7.+uTime)*sin(q.y*8.-uTime*.7)*sin(q.z*8.);
  return vec2(d,1.);
 }
 vec3 q=p;q.xz=mod(q.xz+1.6,3.2)-1.6;q.y=mod(q.y+.75,1.5)-.75;
 float column=length(q)-.72;
 column=smin(column,length(q.xz)-.13,.12);
 vec3 b=p;b.xz=mod(b.xz+1.6,3.2)-1.6;b.y=mod(b.y+.125,.25)-.125;
 float beads=length(b)-.23;
 column=min(column,beads);
 vec3 a=p;a.xz=mod(a.xz,3.2)-1.6;
 float arch=length(vec2(length(a.xy)-1.28,a.z))-.15;
 arch=min(arch,length(vec2(length(a.zy)-1.28,a.x))-.15);
 column=min(column,arch);
 float disk=max(abs(abs(p.y)-1.52)-.08,length(a.xz)-1.46);
 return disk<column?vec2(disk,2.):vec2(column,1.);
}
vec3 normal(vec3 p){vec2 e=vec2(.0015,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
vec3 environment(vec3 r){
 float a=atan(r.y,r.x),l=length(r.xy),stripes=sin(a*7.+sin(r.z*8.+uTime*.8)*2.+l*11.);
 vec3 c=palette(a*2.2+r.z*7.+uTime*.35)*(.19+.46*pow(.5+.5*stripes,4.));
 float strip=pow(max(0.,cos(a*2.+r.z*3.)),65.);c+=vec3(1.,.64,.99)*strip*3.;
 c+=vec3(.72,1.,.82)*pow(max(0.,dot(r,normalize(vec3(-.45,.7,.55)))),40.)*3.;return c;
}
void main(){
 vec2 uv=(2.*gl_FragCoord.xy-uResolution)/uResolution.y;
 vec3 ro,rd;
 if(uScene<.5){ro=vec3(0.,0.,3.35);rd=normalize(vec3(uv,-2.));}
 else{float age=uTime-14.;ro=vec3(1.6+.18*sin(age*1.2),.18*sin(age),3.2+age*1.35);rd=normalize(vec3(uv,1.35));rd.xy=rot(age*.28)*rd.xy;rd.xz=rot(.16*sin(age*1.5))*rd.xz;}
 float dist=0.;vec2 res;bool hit=false;
 for(int i=0;i<72;i++){res=map(ro+rd*dist);if(res.x<.0025){hit=true;break;}dist+=max(.004,res.x*.65);if(dist>28.)break;}
 if(!hit){gl_FragColor=vec4(uScene>.5?vec3(.04,.015,.08):vec3(0.),uScene>.5?1.:0.);return;}
 vec3 p=ro+rd*dist,n=normal(p),ref=reflect(rd,n);float fres=pow(1.-max(0.,dot(-rd,n)),2.3);
 vec3 c=environment(ref);
 float rings=sin(length(p.xy)*22.+atan(p.y,p.x)*4.-uTime*1.5);
 c+=palette(rings*1.3+p.z*3.+uTime*.2)*(.06+.12*pow(.5+.5*rings,5.));
 c+=vec3(.88,.78,1.)*fres*.75;
 float diffuse=max(0.,dot(n,normalize(vec3(-.4,.7,1.))));c+=vec3(.03,.04,.1)*diffuse;
 if(uScene>.5){
  if(res.y>1.5){vec2 q=mod(p.xz,3.2)-1.6;float pattern=sin((abs(q.x)+abs(q.y))*13.+uTime*.4);c=.58+.24*palette(pattern*1.7);c*=.78+.2*diffuse;}
  else c=c*.68+vec3(.13,.05,.17);
  c=mix(c,vec3(.08,.02,.115),1.-exp(-dist*.045));
 }
 c=c/(1.+c*.28);gl_FragColor=vec4(c,1.);
}
