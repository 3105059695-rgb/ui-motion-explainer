(()=>{
/* A content-owned camera route: car -> exploded parts -> one block -> message
   -> token pieces -> numeric IDs -> Token. No persistent slide/sidebar frame.
   Times use the original (42) narration. Images here are conceptual drawings. */
const cv=document.getElementById('frame'),g=cv.getContext('2d'),h=window.FilmHelpers;
const source=document.getElementById('source');
const layer=Object.assign(document.createElement('canvas'),{width:1920,height:1080}),cg=layer.getContext('2d');
const light='#FAFAF8',ink='#101112',lav='#D6C2FF',gray='#EFEEF2';
let config,readyTask,exportMode=false;
const lerp=h.lerp,P=h.p,O=h.o;
const easeColor=(a,b,p)=>{const rgb=v=>v.match(/[a-f0-9]{2}/ig).map(x=>parseInt(x,16));const aa=rgb(a),bb=rgb(b);return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],p)).toString(16).padStart(2,'0')).join('')};
function tx(s,x,y,size,opt={}){h.txt(g,s,x,y,size,{weight:750,...opt})}
function group(x,y,s,angle,alpha,fn){h.group(g,x,y,s,angle,alpha,fn)}
function shadowBox(x,y,w,z,r,color,depth=18){g.save();g.shadowColor='#00000027';g.shadowBlur=depth*2;g.shadowOffsetY=depth;h.box(g,x,y,w,z,r,color);g.restore()}
function tile(label,x,y,w,z,s=1,angle=0,a=1,color=lav,flip=0){group(x,y,s,angle,a,()=>{
 const xx=Math.max(.045,Math.abs(Math.cos(flip*Math.PI)));g.scale(xx,1);
 shadowBox(-w/2,-z/2+10,w,z,20,'#A897C6',14);h.box(g,-w/2,-z/2,w,z,20,color);
 h.line(g,-w/2+20,-z/2+4,w/2-20,-z/2+4,'#FFFFFF80',2);
 tx(label,0,3,Math.min(label.length>3?43:61,w*.40),{align:'center',color:ink,font:/^[0-9]+$/.test(label)?'EN':'CN'});
})}
function tinyWindow(x,y,s,angle,a,contentAlpha=1){group(x,y,s,angle,a,()=>{
 shadowBox(-650,-182,1300,365,28,'#FFFFFF',22);h.box(g,-650,-182,1300,58,28,'#ECEBF0');
 for(let i=0;i<3;i++){g.beginPath();g.arc(-612+i*23,-153,6,0,7);g.fillStyle=['#A69DB6','#C5B8D7','#D5CDD9'][i];g.fill()}
 tx('你的问题',-543,-152,24,{weight:500,color:'#716A7D'});tx('概念示意',601,-151,20,{align:'right',weight:450,color:'#928A9C'});
 tx('今天，我们来学习 AI。',0,14,74,{align:'center',weight:650,alpha:contentAlpha});
 h.line(g,-584,111,482,111,'#DED9E5',2);h.box(g,537,83,53,53,17,ink);
 tx('↑',563,109,35,{align:'center',color:'#FFFFFF'});
 })}
function carScene(t){
 const intro=O(t,25.64,26.50),apart=P(t,29.96,31.30),focus=P(t,31.70,33.12),exit=P(t,33.15,34.35);
 cg.clearRect(0,0,1920,1080);
 const car=window.ToyCar.draw(cg,{cx:1180,cy:582+100*(1-intro),scale:1.15,yaw:lerp(-.58,-.37,P(t,26,30)),pitch:.28,explode:apart*.78,focus,opacity:intro,time:t});
 const b=car?.focusPiece||{x:1110,y:500,w:200,h:130};
 const bx=b.cx??(b.x+b.w/2),by=b.cy??(b.y+b.h/2);
 const overview=lerp(1,.85,apart),cam=lerp(overview,1.60,focus),dx=lerp(1180*(1-overview),1115-bx*cam,focus),dy=lerp(582*(1-overview),510-by*cam,focus);
 // A continuous camera pushes toward the same highlighted car piece.
 g.save();g.globalAlpha=1-exit;g.translate(dx,dy);g.scale(cam,cam);g.drawImage(layer,0,0);g.restore();
 const label=1-P(t,29.80,30.45);
 tx('像积木一样',1115,171,91,{align:'center',alpha:label*intro,weight:850});
 tx('完整的汽车',1116,864,39,{align:'center',alpha:(1-apart)*label,weight:550,color:'#5C5765'});
 tx('拆开，看见组成它的小块',1120,914,39,{align:'center',alpha:apart*(1-focus),weight:550,color:'#5C5765'});
 tx('文字，也可以这样理解',1130,179,71,{align:'center',alpha:focus*(1-P(t,32.98,33.34)),weight:750});
 return {x:bx*cam+dx,y:by*cam+dy,w:b.w*cam,h:b.h*cam};
}
const words=['今天','，','我们','来','学习','AI','。'],widths=[172,93,172,116,172,148,93],ids=['018','006','027','052','081','319','004'];
const total=widths.reduce((a,b)=>a+b,0)+18*6;
function sentence(t,origin){
 const open=P(t,33.14,34.46),d=P(t,33.36,34.26),breaks=P(t,35.72,37.47),codes=P(t,37.70,39.70),hero=P(t,40.60,41.44);
 if(open<.001)return;
 // The selected piece supplies the origin of the expanding input surface.
 const x=lerp(origin.x,1115,open),y=lerp(origin.y,453,open),w=lerp(origin.w,1300,open),z=lerp(origin.h,365,open);
 const shrink=P(t,36.21,37.53);
 if(shrink<.001){
  group(x,y,1,0,P(open,0,.24),()=>{
   shadowBox(-w/2,-z/2,w,z,lerp(22,28,open),easeColor(lav,'#FFFFFF',open),24);
   if(open>.5){const a=P(open,.5,1);g.save();g.globalAlpha=a;h.box(g,-w/2,-z/2,w,58,28,'#ECEBF0');
    for(let i=0;i<3;i++){g.beginPath();g.arc(-w/2+38+i*23,-z/2+29,6,0,7);g.fillStyle=['#A69DB6','#C5B8D7','#D5CDD9'][i];g.fill()}
    tx('你的问题',-w/2+106,-z/2+29,24,{weight:500,color:'#716A7D'});tx('概念示意',w/2-46,-z/2+29,20,{align:'right',color:'#928A9C',weight:450});h.line(g,-w/2+66,z/2-71,w/2-168,z/2-71,'#DED9E5',2);h.box(g,w/2-113,z/2-99,53,53,17,ink);tx('↑',w/2-87,z/2-73,35,{align:'center',color:'#FFFFFF'});g.restore();
   }
  });
 }else tinyWindow(lerp(1115,367,shrink),lerp(453,285,shrink),lerp(1,.37,shrink),-.06*shrink,(1-hero)*lerp(1,.65,shrink),P(shrink,.60,.96));
 const typing=O(t,34.37,35.48),start=1115-total/2;let offset=0;
 words.forEach((word,i)=>{
  const fromX=start+offset+widths[i]/2,toX=1118+(start+offset+widths[i]/2-1115)*1.10;
  const peel=P(t,35.72+i*.065,36.66+i*.065),lift=Math.sin(peel*Math.PI)*(-85-(i%2)*38);
  const tx0=lerp(fromX,toX,peel),ty=lerp(466,542,peel)+lift;
  const flip=P(t,37.72+i*.10,38.42+i*.10);
  const rowSize=lerp(1,.67,hero),toSmallX=615+i*184;
  if(i===0&&hero>0){
   // This same first numbered piece rises into the definition, then grows.
   const takeoff=P(t,40.60,41.04),grow=P(t,40.90,41.48);
   const px=lerp(tx0,1140,takeoff),py=lerp(ty,511,takeoff)-Math.sin(takeoff*Math.PI)*150;
   const ww=lerp(widths[i],1040,grow),hh=lerp(147,340,grow);
   group(px,py,1,0,1,()=>{shadowBox(-ww/2,-hh/2+10,ww,hh,26,'#A897C6',24);h.box(g,-ww/2,-hh/2,ww,hh,26,lav);
    tx(ids[0],0,3,61,{font:'EN',align:'center',weight:700,alpha:1-P(grow,.02,.25)});
    tx('Token',0,3,lerp(70,215,grow),{font:'EN',align:'center',weight:700,alpha:P(grow,.18,.56)});
   });
   offset+=widths[i]+18;return;
  }
  if(peel<.03&&shrink<.02){
   tx(word,fromX,466,74,{align:'center',weight:650,alpha:typing>i/7?1:0});
   const select=P(t,35.25+i*.05,35.55+i*.05)*(1-peel);g.save();g.globalAlpha=select*.32;h.box(g,fromX-widths[i]/2,413,widths[i],99,8,lav);g.restore();
  }else{
   tile(flip>.5?ids[i]:word,lerp(tx0,toSmallX,hero),lerp(ty,826,hero),widths[i],147,rowSize,
    Math.sin(peel*Math.PI)*(i%2?.065:-.065),1, i%3===0?'#D6C2FF':i%3===1?'#EAE6F0':'#FFFFFF',flip);
  }
  offset+=widths[i]+18;
 });
 const headA=P(t,34.0,34.56)*(1-P(t,35.75,36.23));tx('一句话，进入分词器',1115,175,69,{align:'center',color:light,alpha:headA,weight:750});
 const headB=P(t,35.88,36.43)*(1-P(t,37.55,38.04));tx('拆成可以处理的小块',1180,175,73,{align:'center',color:light,alpha:headB,weight:800});
 const headC=P(t,37.92,38.35)*(1-P(t,40.60,40.92));tx('再转换成数字编号',1150,175,75,{align:'center',color:light,alpha:headC,weight:800});
 if(codes>0&&hero<1){
  g.save();g.globalAlpha=codes*(1-P(t,40.55,40.90));h.line(g,651,696,651+1050*codes,696,'#7D6C92',3);tx('送入模型继续处理',1175,774,42,{align:'center',color:'#D9D4DF',weight:500});g.restore();
 }
 if(hero>0){
  tx('这些小块，就叫',1140,233,57,{align:'center',color:light,alpha:P(t,41.05,41.47),weight:600});
 }
 tx('切分与编号均为概念示意',1180,926,24,{align:'center',color:'#A69FAC',weight:450,alpha:d});
}
function body(t){g.fillStyle=light;g.fillRect(0,0,1920,1080);
 const dark=P(t,33.30,34.20);let origin={x:1115,y:510,w:260,h:160};
 if(t<34.4)origin=carScene(t);
 if(dark>0){g.save();g.beginPath();g.arc(1115,510,2200*dark,0,Math.PI*2);g.fillStyle=ink;g.fill();g.restore();}
 sentence(t,origin);
 tx('方木',1810,66,27,{align:'right',color:dark>.5?'#FFFFFF':'#25232A',weight:750});
 g.save();g.strokeStyle=dark>.5?'#FFFFFF':'#FFFFFF';g.lineWidth=7;g.beginPath();g.arc(224,796,161,0,7);g.stroke();g.restore();
}

window.ApprovedSample={draw:body,motionActive:t=>[[25.64,27],[29.8,34.6],[35.1,39.7],[40.5,41.65]].some(([a,b])=>t>=a&&t<b)};
})();
