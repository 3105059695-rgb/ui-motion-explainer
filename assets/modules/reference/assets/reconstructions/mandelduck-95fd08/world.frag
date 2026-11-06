precision mediump float;
uniform sampler2D image;uniform bool sky;uniform float glow;
varying vec2 texCoord;varying float light;varying float distanceEye;
void main(){vec3 col=texture2D(image,texCoord).rgb;if(sky){col*=.88;}else{col*=light;col=mix(col,vec3(.043,.067,.11),min(.38,distanceEye*.003));col+=glow*vec3(.30,.17,.025);}gl_FragColor=vec4(col,1.);}
