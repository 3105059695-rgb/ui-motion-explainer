attribute vec3 position;attribute vec3 normal;attribute vec2 uv;
uniform mat4 vp;uniform vec3 eye;uniform bool sky;
varying vec2 texCoord;varying float light;varying float distanceEye;
void main(){vec3 p=position+(sky?eye:vec3(0.));gl_Position=vp*vec4(p,1.);texCoord=uv;light=sky?1.:.55+.35*max(0.,dot(normal,normalize(vec3(-.3,.8,.4))));distanceEye=sky?0.:length(position-eye);}
