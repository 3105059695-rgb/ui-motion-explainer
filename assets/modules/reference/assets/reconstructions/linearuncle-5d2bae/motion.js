/* Full-length derivative lesson. Canvas curves are sampled from actual functions;
 * secants, tangents and magnified local curves are computed rather than frame assets.
 */
(()=>{'use strict';const canvas=document.querySelector('#scene'),g=canvas.getContext('2d'),stage=document.querySelector('#stage');let P,state={},now=0;
const C=v=>Math.max(0,Math.min(1,v)),mix=(a,b,p)=>a+(b-a)*p,E=v=>1-Math.pow(1-C(v),3),S=v=>{v=C(v);return v*v*(3-2*v)};
const color=n=>P.colors[n];
function fit(){stage.style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/1920,innerHeight/1080)})`;}fit();addEventListener('resize',fit);
function text(s,x,y,size=58,c='#fff',align='left',font=P.font,weight=400){g.font=`${weight} ${size}px ${font},Arial`;g.fillStyle=c;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y);return g.measureText(s).width;}
function rect(x,y,w,h,c,r=0,stroke=false){g.beginPath();g.roundRect(x,y,w,h,r);if(stroke){g.strokeStyle=c;g.lineWidth=2.5;g.stroke();}else{g.fillStyle=c;g.fill();}}
function line(x1,y1,x2,y2,c,w=2,dash=[]){g.strokeStyle=c;g.lineWidth=w;g.setLineDash(dash);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);}
function dot(x,y,c=color('gold'),r=10){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
function key(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<=keys[i][0])return mix(keys[i-1][1],keys[i][1],S((t-keys[i-1][0])/(keys[i][0]-keys[i-1][0])));}return keys[keys.length-1][1];}
function fade(t,start,length=1){return E((t-start)/length);}
function header(s){text(s,64,131,66,color('gold'));}
function arrow(x1,y1,x2,y2,c=color('axis'),width=2){line(x1,y1,x2,y2,c,width);const a=Math.atan2(y2-y1,x2-x1),l=43;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-l*Math.cos(a-.46),y2-l*Math.sin(a-.46));g.lineTo(x2-l*Math.cos(a+.46),y2-l*Math.sin(a+.46));g.closePath();g.fillStyle=c;g.fill();}
function axes(o,nums=true){
 const p=(x,y)=>[o.x+x*o.sx,o.y-y*o.sy];if(o.arrows===false){line(...p(o.minX,0),...p(o.maxX,0),color('axis'),2);line(...p(0,o.minY),...p(0,o.maxY),color('axis'),2);}else{arrow(...p(o.minX,0),...p(o.maxX,0));arrow(...p(0,o.minY),...p(0,o.maxY));}
 for(let x=Math.ceil(o.minX);x<o.maxX;x++){if(x===0)continue;const q=p(x,0);line(q[0],q[1]-12,q[0],q[1]+12,color('axis'),2);if(nums)text(String(x),q[0],q[1]+47,38,color('axis'),'center','Arial');}
 for(let y=Math.ceil(o.minY);y<o.maxY;y++){if(y===0||y%(o.tickY||1)!==0)continue;const q=p(0,y);line(q[0]-12,q[1],q[0]+12,q[1],color('axis'),2);if(nums)text(String(y),q[0]-22,q[1]+13,38,color('axis'),'right','Arial');}return p;
}
function curve(o,f,min,max,c=color('cyan'),w=6,reveal=1){g.save();g.beginPath();g.rect(o.x+o.minX*o.sx,o.y-o.maxY*o.sy,(o.maxX-o.minX)*o.sx,(o.maxY-o.minY)*o.sy);g.clip();g.strokeStyle=c;g.lineWidth=w;g.beginPath();for(let i=0;i<=240*C(reveal);i++){const x=mix(min,max,i/240),y=f(x),px=o.x+x*o.sx,py=o.y-y*o.sy;i?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();g.restore();}
function fraction(top,bottom,cx,cy,size=68,c='#fff'){const a=text(top,cx,cy,size,c,'center','Arial'),b=text(bottom,cx,cy+size*1.14,size*.9,c,'center','Arial'),w=Math.max(a,b)+15;line(cx-w/2,cy+size*.22,cx+w/2,cy+size*.22,c,2);return w;}
function caption(t){const item=P.captions.filter(x=>t>=x.at).at(-1);if(!item||!item.text)return;g.font=`400 47px ${P.font},Arial`;const w=g.measureText(item.text).width;rect(960-w/2-20,975,w+40,88,'#000000ae');text(item.text,960,1035,47,'#fff','center');}
function car(x,y){g.save();g.translate(x,y);rect(-75,-69,149,65,color('cyan'),12);rect(-40,-99,77,49,color('cyan'),10);rect(-31,-91,31,26,'#c3e5ec',4);rect(5,-91,24,26,'#c3e5ec',4);for(const a of [-44,45]){dot(a,0,'#7d8897',20);dot(a,0,'#202a35',11);}g.restore();}
function opening(t){
 if(t>3.1){const p=E((t-3.1)/3.0);line(0,755,1920*p,755,'#9398a5',2);line(0,824,1920*p,824,'#383f50',3,[57,39]);car(mix(100,1430,E((t-3.5)/6.3)),746);}
 if(t>7){g.save();g.globalAlpha=fade(t,7,.7);const x=1665,y=255,r=150;g.strokeStyle=color('axis');g.lineWidth=5;g.beginPath();g.arc(x,y,r,Math.PI*.77,Math.PI*2.23);g.stroke();for(let i=0;i<9;i++){const a=Math.PI*.77+i*(Math.PI*1.46/8);line(x+Math.cos(a)*r*.77,y+Math.sin(a)*r*.77,x+Math.cos(a)*r*.94,y+Math.sin(a)*r*.94,color('axis'),2);}line(x,y,x-82,y-85,color('red'),6);dot(x,y,color('red'),7);text('60 km/h',x,375,46,color('gold'),'center','Arial');g.restore();}
 if(t>12.3){g.globalAlpha=fade(t,12.3);text(P.text.speedFormula,960,228,77,'#fff','center');g.globalAlpha=1;}
 if(t>18){g.globalAlpha=fade(t,18);text(P.text.instantProblem,960,376,63,color('orange'),'center');g.globalAlpha=1;}
 if(t>22.3){g.globalAlpha=fade(t,22.3);text('0 ÷ 0 = ?',960,539,108,color('red'),'center','Arial');g.globalAlpha=1;}
 if(t>28){g.globalAlpha=S((t-28)/2);rect(0,0,1920,1080,color('background'));g.globalAlpha=1;}
}
function road(t){
 header(P.text.averageHeading);const y=602;line(218,y,1744,y,color('axis'),2);for(let x=0;x<=10;x++){const xx=250+x*147;line(xx,y-13,xx,y+13,color('axis'),2);text(String(x),xx,y+54,38,color('axis'),'center','Arial');}text('(米)',1780,y+54,38,color('axis'));const move=t<48?0:t<52?mix(0,9,E((t-48)/3)):9;car(250+move*147,y-10);
 if(t>41){g.globalAlpha=fade(t,41,2);text('s = t²',960,290,106,color('cyan'),'center','Arial');g.globalAlpha=1;}
 if(t>49.8){g.globalAlpha=fade(t,49.8);[1,4,9].forEach((d,i)=>{dot(250+d*147,y,color('gold'),12);text('第'+(i+1)+'秒',250+d*147,y+130,44,color('gold'),'center');});g.globalAlpha=1;}
 if(t>54.5){g.globalAlpha=fade(t,54.5);[[0,1,'1米'],[1,4,'3米'],[4,9,'5米']].forEach(([a,b,s])=>{const xa=250+a*147,xb=250+b*147;line(xa,y-50,xb,y-50,[color('green'),color('cyan'),color('cyan')][a===0?0:1],3);line(xa,y-50,xa,y-34,color('green'),3);line(xb,y-50,xb,y-34,color('cyan'),3);text(s,(xa+xb)/2,y-81,43,color('cyan'),'center');});g.globalAlpha=1;}
}
const single={x:131,y:898,sx:232,sy:70,minX:0,maxX:3.6,minY:0,maxY:10.1,tickY:2};
function quadraticPlot(t,instant=false){
 header(instant?P.text.instantHeading:P.text.averageHeading);const a=axes(single);text('s（米）',155,205,46,'#fff');text('t（秒）',902,862,47,'#fff');curve(single,x=>x*x,0,3.16,color('cyan'),6,fade(t,63,3));text('s = t²',690,216,51,color('cyan'),'left','Arial');
 if(!instant&&t<69.7)return;
 let h=instant?key(t,[[99,2],[105,2],[112,.1],[117,.01],[121,.001]]):2;
 const A=a(1,1),B=a(1+h,(1+h)**2),slope=2+h;
 if(instant&&t>132)h=.001;
 dot(...A,color('gold'),12);if(!instant){dot(...B,color('orange'),13);text('A (1, 1)',A[0]-167,A[1]-37,45,color('gold'));text('B (3, 9)',B[0]-194,B[1]+17,45,color('orange'));line(A[0],A[1],B[0],A[1],color('green'),5,[6,7]);line(B[0],A[1],B[0],B[1],color('red'),5,[6,7]);text('Δt = 2 秒',(A[0]+B[0])/2,A[1]+48,45,color('green'),'center');text('Δs = 8 米',B[0]+16,(A[1]+B[1])/2+16,45,color('red'));}
 if(t>78||instant){curve(single,x=>1+(t>132?2:slope)*(x-1),0.73,3.25,t>132?color('gold'):color('orange'),5,instant?1:fade(t,78,1));if(instant&&t<132)dot(...B,color('orange'),10);}
 if(!instant&&t>74){g.globalAlpha=fade(t,74,1);text('平均速度',1280,254,66,color('gold'));text('= Δs ÷ Δt',1280,354,67,'#fff','left','Arial');text('= 8 ÷ 2',1280,443,67,'#fff','left','Arial');text('= 4 米/秒',1280,544,76,color('gold'));if(t>84.8){g.globalAlpha=fade(t,84.8);text('割线的斜率 = 平均变化率',1280,680,53,color('orange'));}g.globalAlpha=1;}
 if(instant){text(`Δt = ${h.toFixed(3)} 秒`,1220,228,57,color('green'));text(`平均速度 = ${(2+h).toFixed(3)} 米/秒`,1220,306,51,color('orange'));if(t>104){text('Δt（秒）',1290,423,47,color('green'));text('平均速度',1590,423,47,color('orange'));line(1173,449,1840,449,color('axis'),1);const rows=[['1','3'],['0.1','2.1'],['0.01','2.01'],['0.001','2.001']];rows.forEach((r,i)=>{if(t>107+i*4.5){text(r[0],1300,536+i*69,50,'#fff','center','Arial');text(r[1],1590,536+i*69,50,'#fff','center','Arial');}});if(t>126)text('↓ 越来越接近 2',1490,835,51,color('gold'));}
  if(t>132)text('切线：斜率 = 2',560,838,49,color('gold'));
  if(t>146){rect(1160,177,730,731,color('background'));text('我们没有计算 0 ÷ 0',1475,426,54,'#fff','center');text('而是看它“趋向于”哪个数',1475,521,48,'#fff','center');}
  state.h=h;state.secantSlope=2+h;
 }
}
function definition(t){
 header(P.text.definitionHeading);const p=fade(t,160.5,2);g.globalAlpha=p;text("f′(x) = lim",386,436,100,'#fff','left','Arial');text('h→0',771,488,52,'#fff','center','Arial');fraction('f(x + h) − f(x)', 'h',1210,379,96);g.globalAlpha=1;
 if(t>165.1){g.globalAlpha=fade(t,165.1);text('函数值变化了多少',1202,247,55,color('cyan'),'center');rect(880,275,655,127,color('cyan'),0,true);g.globalAlpha=1;}
 if(t>168){g.globalAlpha=fade(t,168);rect(1168,407,75,101,color('green'),0,true);text('自变量变化了多少',1207,576,55,color('green'),'center');g.globalAlpha=1;}
 if(t>175.9){g.globalAlpha=fade(t,175.9);rect(702,352,145,154,color('gold'),0,true);text('让 h 无限趋近 0',753,738,48,color('gold'),'center');g.globalAlpha=1;}
 if(t>190.3){g.globalAlpha=fade(t,190.3);rect(198,778,763,205,color('gold'),20,true);text('几何意义',579,854,52,color('gold'),'center');text('曲线在该点的切线斜率',579,925,47,'#fff','center');g.globalAlpha=1;}
 if(t>193.1){g.globalAlpha=fade(t,193.1);rect(1025,778,753,205,color('green'),20,true);text('物理意义',1400,854,52,color('green'),'center');text('瞬时变化率，如瞬时速度',1400,925,47,'#fff','center');g.globalAlpha=1;}
}
function expansion(t){
 header(P.text.exampleHeading);if(t<230){if(t>203){g.globalAlpha=fade(t,203);fraction('(x + h)² − x²','h',523,407,69);g.globalAlpha=1;}
  if(t>208){g.globalAlpha=fade(t,208);text('=',874,462,72,'#fff','center','Arial');fraction('x² + 2xh + h² − x²','h',1260,407,69);g.globalAlpha=1;}
  if(t>214.5){g.globalAlpha=fade(t,214.5);text('=',874,682,72,'#fff','center','Arial');fraction('2xh + h²','h',1106,624,69);g.globalAlpha=1;}
  if(t>219.1){g.globalAlpha=fade(t,219.1);text('= 2x + h',1470,682,72,'#fff','center','Arial');g.globalAlpha=1;}
  if(t>225.5){g.globalAlpha=fade(t,225.5);text('当 h → 0 时：2x + h  →  2x',1183,858,61,color('green'),'center');g.globalAlpha=1;}
 }else{const p=fade(t,230,3);g.globalAlpha=p;text('(x²)′ = 2x',960,588,117,color('gold'),'center','Arial');rect(632,445,656,227,color('gold'),17,true);if(t>234.5){text('x = 1 时：2 × 1 = 2 ✓ 正是小车第 1 秒的速度',960,807,53,color('green'),'center');}g.globalAlpha=1;}
}
function derivativeFunction(t){
 header(P.text.derivativeFunctionHeading);
 const a={x:488,y:786,sx:173,sy:148,minX:-2.2,maxX:2.55,minY:-.3,maxY:4.18},b={x:1432,y:582,sx:174,sy:74,minX:-2.2,maxX:2.2,minY:-4.5,maxY:4.5,tickY:2};axes(a);axes(b);curve(a,x=>x*x,-2.12,2.12);curve(b,x=>2*x,-2.15,2.15,color('green'),6,C((t-244)/15));text('原函数 y = x²',488,223,56,color('cyan'),'center');text('斜率（导数）',1432,224,56,color('green'),'center');
 const x=key(t,[[243,-2],[248,-1.8],[254,.98],[259,2],[264,2],[268,1.92],[272,0],[280,0]]),slope=2*x;
 curve(a,u=>x*x+slope*(u-x),x-.85,x+.85,color('gold'),6);dot(a.x+x*a.sx,a.y-x*x*a.sy,color('gold'),12);dot(b.x+x*b.sx,b.y-slope*b.sy,color('green'),12);text('斜率 = '+(slope>=0?'+':'')+slope.toFixed(2),677,300,57,color('gold'),'center','Arial');
 if(t>256){text("f′(x) = 2x",1570,528,64,color('green'),'left','Arial');}state.x=x;state.derivative=slope;
}
const cubic=x=>.5*x*x*x-1.5*x,dcubic=x=>1.5*x*x-1.5;
function landscape(t){
 header(P.text.landscapeHeading);const o={x:650,y:581,sx:216,sy:122,minX:-2.5,maxX:2.52,minY:-2.75,maxY:2.8,arrows:false};g.globalAlpha=.36;axes(o,false);g.globalAlpha=1;curve(o,cubic,-2.25,2.42,color('cyan'),7,fade(t,281,.8));
 const x=key(t,[[281,-2.2],[288,-2.2],[292,-1.46059],[296,-1],[299,-1],[302,.62716],[306,1],[309,1],[312,1.927],[316,2.2],[335,2.2]]),slope=dcubic(x),near=Math.abs(slope)<.018,co=near?color('gold'):slope>0?color('green'):color('red');
 if(t>286){curve(o,u=>cubic(x)+slope*(u-x),x-.47,x+.47,co,6);dot(o.x+x*o.sx,o.y-cubic(x)*o.sy,'#f6f4df',12);if(t<319){text('坡度 f′(x) = '+(slope>=0?'+':'')+slope.toFixed(2),1460,363,55,'#fff','center');text(near?'→ 平地：导数 = 0':slope>0?'↗ 上坡：导数 > 0':'↘ 下坡：导数 < 0',1460,459,53,co,'center');}}
 if(t>300){dot(o.x-o.sx,o.y-cubic(-1)*o.sy,color('gold'),10);text('山顶 f′ = 0',433,409,53,color('gold'),'center');}
 if(t>309){dot(o.x+o.sx,o.y-cubic(1)*o.sy,color('gold'),10);text('谷底 f′ = 0',865,790,53,color('gold'),'center');}
 if(t>318.3){text('找最大 / 最小值',1550,306,66,color('gold'),'center');text('先找 f′(x) = 0 的点',1550,394,64,color('gold'),'center');}
 if(t>328){text('▸ 工厂：最低成本',1550,665,49,'#fff','center');text('▸ 导航：最短时间',1550,737,49,'#fff','center');text('▸ 火箭：最省燃料',1550,809,49,'#fff','center');}state.x=x;state.derivative=slope;
}
function magnifier(t){
 header(P.text.magnifierHeading);const absolute=t>=371,zoom=absolute?key(t,[[371,1],[376,1],[379,3],[384,100]]):key(t,[[335,1],[340,1],[345,100]]),cx=554,cy=580,r=413;
 const opacity=fade(t,335,.8);g.save();g.globalAlpha=opacity;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.strokeStyle=color('axis');g.lineWidth=7;g.stroke();line(cx+r*.70,cy+r*.70,cx+r*.92,cy+r*.92,color('axis'),17);g.beginPath();g.arc(cx,cy,r-5,0,Math.PI*2);g.clip();g.strokeStyle=color('cyan');g.lineWidth=7;g.beginPath();
 for(let i=0;i<=300;i++){const range=absolute?1.55:mix(2.15,1,C(Math.log(zoom)/Math.log(100))),u=mix(-range,range,i/300),k=1/zoom,x=cx+u*172,y=cy-(absolute?Math.abs(u):2*u+u*u*k)*172;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();dot(cx,cy,color('gold'),12);g.restore();
 text('放大倍数：× '+Math.round(zoom),1450,269,64,'#fff','center');text(absolute?'y = |x|，镜头对准原点 (0, 0)':'y = x²，镜头对准点 (1, 1)',1450,378,53,color('cyan'),'center');
 if(!absolute&&t>346){text('这条直线的斜率 = 2 = 导数',1450,511,55,color('gold'),'center');}
 if(!absolute&&t>357){text('看得足够近，',1135,652,55,'#fff');if(t>362)text('光滑曲线就是一条直线；',1135,727,55,'#fff');if(t>365)text('导数 = 这条直线的斜率',1135,802,55,color('gold'));}
 if(absolute&&t>386){text('斜率 −1',cx-238,cy-24,53,color('red'),'center');text('斜率 +1',cx+226,cy-24,53,color('green'),'center');}
 if(absolute&&t>391){text('|x| 在原点没有导数',1450,602,64,color('red'),'center');text('可导 ⇔ 足够“光滑”',1450,702,63,color('gold'),'center');}state.zoom=zoom;state.focus=absolute?'absolute-value-origin':'quadratic-at-1';
}
function review(t){header(P.text.reviewHeading);P.text.review.forEach((s,i)=>{if(t>402.7+i*4.3){g.globalAlpha=fade(t,402.7+i*4.3,.8);text(s,459,369+i*134,57,'#fff');g.globalAlpha=1;}});}
function questions(t){text(P.text.thinkHeading,960,166,72,color('gold'),'center');const starts=[427.6,434.2,441.0];P.text.questions.forEach((s,i)=>{if(t>starts[i]){g.globalAlpha=fade(t,starts[i],.8);text(s[0],316,332+i*149,52,'#fff');if(s[1])text(s[1],316,394+i*149,52,'#fff');g.globalAlpha=1;}});}
function render(t){t=Math.max(0,Math.min(P.duration,Number(t)||0));now=t;state={time:t};g.globalAlpha=1;rect(0,0,1920,1080,color('background'));
 if(t<31){state.phase='instant-speed-paradox';opening(t);}else if(t<37){state.phase='derivative-title';text(P.text.title,960,624,205,color('gold'),'center',P.font,600);}
 else if(t<61){state.phase='quadratic-car-distance';road(t);}else if(t<98.5){state.phase='average-speed-secant';quadraticPlot(t);}else if(t<156.6){state.phase='secant-to-tangent-limit';quadraticPlot(t,true);}else if(t<200){state.phase='derivative-definition';definition(t);}else if(t<243){state.phase='quadratic-symbolic-derivative';expansion(t);}else if(t<281){state.phase='derivative-function-tracking';derivativeFunction(t);}else if(t<335){state.phase='cubic-slope-and-extrema';landscape(t);}else if(t<402){state.phase='magnifier-local-linearization';magnifier(t);}else if(t<425){state.phase='one-minute-review';review(t);}else if(t<449){state.phase='thought-questions';questions(t);}else if(t<453.2){state.phase='instrument-ending';text('下次看到仪表盘上的数字，',960,547,82,'#fff','center');text('别忘了——那就是一个导数。',960,658,82,color('gold'),'center');}else{state.phase='final-title';text(P.text.closing,960,596,94,color('gold'),'center',P.font,600);}
 if(t<453.2)caption(t);return state;
}
window.seek=t=>P?render(t):null;window.getState=()=>JSON.parse(JSON.stringify(state));const ready=fetch('project.json').then(r=>r.json()).then(async p=>{P=p;window.project=P;window.duration=P.duration;await document.fonts.load(`400 66px ${P.font}`);await document.fonts.ready;render(0);if(!new URLSearchParams(location.search).has('render')){const s=performance.now(),tick=n=>{render((n-s)/1000);if(now<P.duration)requestAnimationFrame(tick)};requestAnimationFrame(tick)}});window.ready=()=>ready;
})();
