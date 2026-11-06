window.FilmHelpers=(()=>{
 const h={ink:'#17171A',muted:'#73717B',accent:'#C9AFE9',paper:'#F7F7F5'};
 h.clamp=x=>Math.max(0,Math.min(1,x)); h.lerp=(a,b,p)=>a+(b-a)*p;
 h.p=(t,a,b)=>{const x=h.clamp((t-a)/(b-a));return x*x*x*(10-15*x+6*x*x)};
 h.o=(t,a,b)=>1-Math.pow(1-h.clamp((t-a)/(b-a)),5);
 h.txt=(c,s,x,y,size,o={})=>{c.save();c.globalAlpha*=o.alpha??1;c.font=`${o.weight??650} ${size}px ${o.font??'CN'}, CN`;c.fillStyle=o.color??h.ink;c.textAlign=o.align??'left';c.textBaseline='middle';c.fillText(s,x,y);c.restore()};
 h.box=(c,x,y,w,z,r,fill,stroke)=>{if(w<=0||z<=0)return;c.beginPath();c.roundRect(x,y,w,z,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}};
 h.line=(c,x,y,x2,y2,color=h.ink,width=2)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()};
 h.group=(c,x,y,s,r,a,fn)=>{c.save();c.translate(x,y);c.rotate(r);c.scale(s,s);c.globalAlpha*=a;fn();c.restore()};
 h.cue=(scene,key,fallback=0)=>scene.cues?.[key]??(scene.start+fallback);
 h.arrow=(c,x,y,x2,y2,p=1,col=h.accent,width=4)=>{const xx=h.lerp(x,x2,p),yy=h.lerp(y,y2,p),r=Math.atan2(y2-y,x2-x);h.line(c,x,y,xx,yy,col,width);if(p>.02){h.line(c,xx,yy,xx-13*Math.cos(r-.55),yy-13*Math.sin(r-.55),col,width);h.line(c,xx,yy,xx-13*Math.cos(r+.55),yy-13*Math.sin(r+.55),col,width)}};
 h.pill=(c,label,x,y,w,fill=h.accent,col=h.ink)=>{h.box(c,x,y,w,48,24,fill);h.txt(c,label,x+w/2,y+24,23,{align:'center',color:col,weight:550})};
 return h;
})();
