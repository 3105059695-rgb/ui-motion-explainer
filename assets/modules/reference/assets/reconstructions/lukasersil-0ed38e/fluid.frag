precision highp float;
varying vec2 uv;
uniform float time;
uniform float zoom;
float field(vec2 p){
 for(int i=0;i<7;i++){float f=float(i);vec2 center=.69*vec2(cos(f*2.399+time*.045),sin(f*2.399+time*.045));vec2 q=p-center;float r=length(q),a=atan(q.y,q.x)+(4.6+.4*sin(time*.35+f))*exp(-r*r*3.1);p=center+vec2(cos(a),sin(a))*r;}
 return sin(p.x*2.2+sin(p.y*1.9+time*.12))*.5+sin(p.y*2.7-cos(p.x*2.8-time*.08))*.5;
}
void main(){vec2 p=(uv-.5)*vec2(3.55,2.0)/zoom;float angle=atan(p.y,p.x),radius=length(p),edge=1.0+.07*sin(angle*6.+time*.8)+.10*sin(angle*11.-time*.3);float mask=1.-smoothstep(edge-.018,edge+.018,radius);if(mask<.001){gl_FragColor=vec4(0.);return;}
 float f=field(p),dx=field(p+vec2(.004,0.))-f,dy=field(p+vec2(0.,.004))-f;vec3 n=normalize(vec3(dx*65.,dy*65.,.26));float spec=pow(max(0.,dot(n,normalize(vec3(-.3,.6,.7)))),28.);
 float band=sin(f*2.4+time*.12);vec3 col=vec3(.035,.025,.05);if(band>.60)col=vec3(.96,.95,.91);else if(band>.02)col=vec3(.12,.08,.66);else if(band>-.58)col=vec3(.58,.025,.07);else col=vec3(.44,.32,.035);
 float rims=pow(abs(sin(f*9.)),32.);col=mix(col,vec3(.85,.82,.71),rims*.68);col*=.53+.47*max(0.,n.z);col+=spec*vec3(.91,.94,1.);float boundary=pow(radius/edge,16.);col+=boundary*vec3(.25,.20,.025);gl_FragColor=vec4(col,mask);
}
