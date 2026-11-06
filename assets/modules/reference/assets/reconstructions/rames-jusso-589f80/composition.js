'use strict';
const stage=document.getElementById('stage'),ctx=stage.getContext('2d'),surface=document.createElement('canvas'),g=surface.getContext('2d');surface.width=surface.height=720;let C,P,time=0,readyPromise,maskCache={};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,q)=>a+(b-a)*q,ease=q=>{q=clamp(q);return q*q*(3-2*q)},TAU=Math.PI*2,rand=i=>{let x=Math.sin(i*127.1+121.121)*43758.5453;return x-Math.floor(x)};
const scenes=[[0,1.2,'Typed producer comment in the empty editor'],[1.2,2.1,'Full Strudel music code enters and scrolls to harmony'],[2.1,8.3,'Cyan chord and sub patterns with animated note boxes and punchcard'],[8.3,9,'Gray flash and downward editor scroll'],[9,15.5,'Half-time drums and noise hats highlighted in the gray editor'],[15.5,16,'Dark transition and scroll toward build/vocal code'],[16,20.5,'Green room/build controls and vocal phrase sequence'],[20.5,22.5,'Code fragments scramble and RGB characters glitch'],[22.5,24.4,'First ASCII DUB word with outlined gold and blue shadow'],[24.4,26.1,'First large ASCII 2 with pulse and glyph trail'],[26.1,29.5,'Spoke wobble with staggered horizontal gold bars'],[29.5,32.8,'Magenta concentric tunnel of warped ASCII rings'],[32.8,34.7,'Horizontal waveform with layered gold/pink/blue glyphs'],[34.7,36.9,'Tunnel, bars and waveform combine, then pale flash'],[36.9,37.3,'Pale editor emerges from the ASCII field'],[37.3,42.3,'White/purple wobble, punchcard and build source editor'],[42.3,43.2,'White gray green glitch transition into second drop'],[43.2,44.9,'Monochrome green ASCII LOUD word'],[44.9,46.65,'Green ASCII number 2'],[46.65,50.2,'Green spoke wobble and moving bars'],[50.2,53.5,'Green concentric ASCII tunnel'],[53.5,55.2,'Green glyph waveform'],[55.2,57.5,'Green tunnel, bars and waveform combine'],[57.5,58.65,'Editor returns at a small scale then zooms to the last code lines'],[58.65,60.1,'Scope line and typed big lights out comment'],[60.1,61.43333333333333,'Code and comment fade to black']];
const music=`// prod by claude
// BIG LIGHTS - strudel - 140 BPM - F minor, half-time

setcpm(140/4)

// i VI III VII, one root per bar
const ROOTS = "<f1 db1 ab1 eb1>"
const CHORDS = \`<[f3,ab3,c4] [f3,ab3,db4]
  [eb3,ab3,c4] [eb3,g3,bb3]>\`

// the skank: offbeat stabs, rusko style
skank: note(CHORDS).struct("[- x]*4")
  .sound("square").decay(.09).sustain(0)
  .lpf(slider(3200, 400, 6000))
    .mul(".2 .35 .55 .8 1!28>")
  .delay(.3).delaysync(3/16).delayfeedback(.4)
  .o(4).postgain(.34)
  ._punchcard()

sub: note(ROOTS).struct("x@10 x@6")
  .sound("sine").o(2)
  .decay(.8).sustain(.9).release(.2)
  .gain(.6)
  .mask("<0!4 1!16 0!2 1!10>")

// half-time drums, all built-in sounds
kick: s("sbd")
  .struct("x - - - - - - - x - - - - - - -")
  .decay(.6).gain(.75).duck("2:4")
  .mask("<0!4 1!16 0!4 1!8>")

snare: s("- - [white, pink] -")
  .decay(.18).sustain(0).hpf(900)
  .gain(.5).room(.3).o(3)
  .mask("<0!4 1!16 0!4 1!8>")

hats: s("white*<8 8 8 16>").decay(.035)
  .sustain(0).hpf(8000).o(3)
  .gain("[.1 .32]*4")
  .mask("<0!4 1!28>")

roll: s("white*16").decay(.05).sustain(0).hpf(2500)
  .gain(saw.range(.05, .45)).o(3)
  .mask("<0!11 1 0!11 1 0!8>")

// the wobble: filter envelope on every hit
wobble: note(ROOTS).trans("[0, 12]")
  .struct("<x*4 x*8 [x*6 x*3] [x*8 x*16]>")
  .sound("[sawtooth, square]").o(2)
  .lpf(160).lpenv(6).lpd(.09).lps(0).lpq(6)
  .decay(.3).sustain(.8).shape(.3)
  .gain(.34)
  .mask("<0!12 1!8 0!4 1!8>")
  ._punchcard()

// dj knobs + the build sweeps
const ROOM = slider(.2, 0, 1)
const BUILD = saw.mul(.25)
  .add("<0!8 0 .25 .5 .75 0!8 0 .25 .5 .75 0!8>")
  .mul("<0!8 1!4 0!8 1!4 0!8>")
all(x => x
  .hpf(BUILD.mul(BUILD).mul(1800))
  .hpq(BUILD.mul(5).add(.7))
  .room(BUILD.mul(.5).add(ROOM))
  .velocity(.52))

// vocal chop chain: a saw through a moving vowel
vox: note(\`<[f5 - - c5 - - ab5 - g5 - f5 - - - c5 -]
  [f5 - - db5 - - ab5 - f5 - eb5 - - - db5 -]
  [eb5 - - c5 - - ab5 - g5 - eb5 - - - c5 -]
  [g5 - - eb5 - - bb5 - ab5 - g5 - f5 - eb5 -]>\`)
  .sound("sawtooth").vowel("[a o e o]*4")
  .decay(.12).sustain(0).release(.05).lpf(3200)
  .transpose("<0!24 [0, 12]!8>")
  .delay(.3).delaysync(3/16).delayfeedback(.4)
  .o(4).gain(.38)
  .mask("<0!4 1!28>")
  ._scope()

// big lights out`;
const lines=music.split('\n');
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function punch(y,t,color,width=640){g.fillStyle=color;let phase=(t*C.bpm/60)%4;for(let i=0;i<8;i++){if(color==='#703191'&&i>0&&!(t>41.9&&i>5))continue;let x=75+i*81;if(x>720)continue;let notes=i%3===0?3:2;for(let n=0;n<notes;n++)g.fillRect(x,y+n*11,39,4)}g.fillRect(75+phase/4*width,y-4,1,34)}
function editor(t,alpha=1){g.save();g.globalAlpha=alpha;let second=t>=36.9&&t<43.2,end=t>=57.5,section=t<8.6?0:t<15.7?1:t<36.9?2:second?3:4;
 let bg=section===1?'#4e5b5d':section===3?'#fafafc':'#000';rect(0,0,720,720,bg);
 let fontsize=19,lh=28.6,top=10,x=45,scroll=3*lh;
 if(t<1.2){let s=lines[0].slice(0,Math.floor(t*19.3));g.font='26px '+C.mono_font;g.fillStyle=P.gray;g.fillText('1',32,310);g.fillText(s,60,310);rect(60+g.measureText(s).width,285,2,31,P.cyan);g.restore();return}
 if(t<2.1)scroll=mix(-320,3*lh,ease((t-1.2)/.9));
 if(t>=8.3&&t<9)scroll=mix(3*lh,16*lh+18,ease((t-8.3)/.7));
 if(t>=9&&t<15.5)scroll=16*lh+18+mix(0,3*lh+66,ease((t-9)/.9))+mix(0,4*lh,ease((t-11.8)/1.45));
 if(t>=15.5&&t<16)scroll=mix(23.5*lh+88,52*lh+66+10,ease((t-15.5)/.5));
 if(t>=16&&t<22.5)scroll=52*lh+66+10;
 if(second){fontsize=18;lh=25.4;scroll=37*lh+66+10;top=10}
 if(end){let z=ease((t-57.5)/1.25);let scale=mix(.43,1,z);g.translate(mix(125,0,z),0);g.scale(scale,scale);scroll=mix(16*lh+88,69*lh+136,z);top=10}
 g.font=fontsize+'px '+C.mono_font;g.textBaseline='alphabetic';let advance=g.measureText('M').width;
 for(let i=0;i<lines.length;i++){let y=top+i*lh-scroll+(i>17?66:0)+(i>53?(section===2?0:72):0)+(end&&i>=78?86:0);if(y<-lh||y>1680)continue;g.fillStyle=section===3?'#686977':'#657773';g.font=(fontsize*.7)+'px '+C.mono_font;g.fillText(String(i+1),Math.max(10,x-29),y+fontsize*.78);g.font=fontsize+'px '+C.mono_font;let s=lines[i];if(i===79)s=lines[i].slice(0,Math.floor(Math.max(0,t-58.8)*22));let comment=s.trim().startsWith('//'),col=comment?(second?'#6b6c79':P.gray):section===0?(i<18?P.cyan:P.gray):section===1?'#d1ddda':section===3?P.purple:P.green;
 let isglitch=t>=20.5&&t<22.5||t>=42.3&&t<43.2,q=clamp((t-20.5)/2);for(let j=0;j<s.length;j++){let ch=s[j],xx=x+j*advance,shade=col;if(!comment){let quoted=(s.slice(0,j+1).match(/["`]/g)||[]).length%2;shade=section===3?(quoted?'#667b35':P.purple):section===1?(quoted?'#c7d983':shade):shade;let keyword=/^(const |kick:|hats:|all\()/;if(keyword.test(s)&&j<6)shade=section===3?'#79653b':'#d9dd69'}if(isglitch&&rand(i*107+j+Math.floor(t*16))>mix(.99,.72,q)){ch='@#$*+%!?=R'[Math.floor(rand(i*83+j+Math.floor(t*13))*10)];shade=[P.pink,'#d8da67','#a2aafa','#eee'][j%4];if(j%5===0)rect(xx,y-1,advance,fontsize+2,'#d7ddca')}g.fillStyle=shade;g.fillText(ch,xx,y+fontsize*.78)}
 if(t<58.65&&(!comment&&s.includes('"')||s.includes('`'))){let pieces=[...s.matchAll(/(?:[A-Za-z]\w*|\d+(?:\.\d+)?)/g)].filter(m=>m.index>7);let beat=Math.floor(t*C.bpm/60*2);for(let m of pieces){if((m.index+i+beat)%11>1)continue;g.strokeStyle=section===3?'#85855f':section===1?'#b1c3ae':section===0?'#559ba6':'#4b812e';g.lineWidth=1;g.strokeRect(x+m.index*advance-1,y,advance*m[0].length+2,fontsize+2)}}
 if(end&&i===79&&t>=58.8){rect(x+s.length*advance,y-1,1.5,fontsize+6,P.green)}if(i===13||i===56){let sx=x+advance*(i===13?14:21);rect(sx,y+10,58,5,section===3?'#77737c':'#32594c');rect(sx,y+10,26,5,col);g.fillStyle=col;g.beginPath();g.arc(sx+26,y+12.5,6,0,TAU);g.fill()}
 if(i===17||i===53&&section!==2)punch(y+lh+16,t,second?'#703191':section===0?'#3c8291':section===1?'#a2bcb0':'#477b28');
 if(i===77&&end){rect(x+20,y+lh+41,680,1,'#4c7c24');rect(0,y+lh+120,720,27,'#111')} }
 if(t>=8.05&&t<8.65){g.globalAlpha*=.65*Math.sin(clamp((t-8.05)/.6)*Math.PI);rect(0,0,720,720,'#7b9290')}
 if(t>=42.3&&t<43.2){g.globalAlpha*=clamp((t-42.3)/.9)*.7;rect(0,0,720,720,'#699347')}
 if(t>=60.1){g.globalAlpha=clamp((t-60.1)/1.22);rect(0,0,720,720,'#000')}
 g.restore();
}
function customWord(word,m){m.save();m.translate(70,word==='2'?210:200);m.fillStyle='#fff';m.beginPath();
 if(word==='DUB'){m.moveTo(0,10);m.lineTo(78,0);m.quadraticCurveTo(167,0,168,118);m.quadraticCurveTo(171,235,79,237);m.lineTo(0,228);m.closePath();m.moveTo(54,66);m.lineTo(53,173);m.quadraticCurveTo(106,182,108,118);m.quadraticCurveTo(109,60,54,66);m.closePath();m.moveTo(188,8);m.lineTo(245,17);m.lineTo(242,157);m.quadraticCurveTo(260,208,284,157);m.lineTo(284,7);m.lineTo(347,0);m.lineTo(347,157);m.quadraticCurveTo(350,245,264,246);m.quadraticCurveTo(183,241,187,158);m.closePath();m.moveTo(368,6);m.lineTo(452,0);m.quadraticCurveTo(550,0,547,74);m.quadraticCurveTo(549,104,523,116);m.quadraticCurveTo(568,132,558,186);m.quadraticCurveTo(550,241,453,243);m.lineTo(366,228);m.closePath();m.moveTo(424,54);m.lineTo(423,95);m.quadraticCurveTo(488,111,489,75);m.quadraticCurveTo(486,50,424,54);m.closePath();m.moveTo(423,145);m.lineTo(422,184);m.quadraticCurveTo(496,199,494,165);m.quadraticCurveTo(489,140,423,145);m.closePath();m.fill('evenodd')}
 else if(word==='2'){m.translate(140,-55);m.moveTo(10,77);m.quadraticCurveTo(35,-2,134,0);m.quadraticCurveTo(258,-6,260,96);m.quadraticCurveTo(267,168,144,205);m.lineTo(261,205);m.lineTo(259,296);m.lineTo(0,302);m.lineTo(0,229);m.quadraticCurveTo(40,173,137,126);m.quadraticCurveTo(192,75,122,81);m.quadraticCurveTo(86,79,74,111);m.closePath();m.fill()}
 else {m.translate(-25,24);m.scale(.94,1);m.moveTo(0,0);m.lineTo(55,0);m.lineTo(55,163);m.lineTo(123,163);m.lineTo(123,219);m.lineTo(0,217);m.closePath();m.moveTo(210,0);m.bezierCurveTo(296,-4,308,74,301,132);m.bezierCurveTo(299,210,270,226,211,222);m.bezierCurveTo(128,220,126,139,131,84);m.bezierCurveTo(131,15,166,0,210,0);m.closePath();m.moveTo(209,53);m.bezierCurveTo(179,52,182,167,209,169);m.bezierCurveTo(241,169,244,54,209,53);m.closePath();m.moveTo(328,0);m.lineTo(382,0);m.lineTo(382,154);m.quadraticCurveTo(407,193,432,154);m.lineTo(432,0);m.lineTo(486,0);m.lineTo(485,157);m.quadraticCurveTo(475,226,407,223);m.quadraticCurveTo(325,220,328,147);m.closePath();m.moveTo(514,0);m.lineTo(579,0);m.bezierCurveTo(669,-4,678,55,677,110);m.bezierCurveTo(683,211,649,222,579,222);m.lineTo(514,215);m.closePath();m.moveTo(568,53);m.lineTo(568,165);m.quadraticCurveTo(617,173,620,111);m.quadraticCurveTo(620,49,568,53);m.closePath();m.fill('evenodd')}m.restore()}
function getMask(word){if(maskCache[word])return maskCache[word];let c=document.createElement('canvas');c.width=c.height=720;let m=c.getContext('2d');customWord(word,m);let pixels=m.getImageData(0,0,720,720).data;return maskCache[word]=(x,y)=>{x=Math.round(x);y=Math.round(y);return x>=0&&x<720&&y>=0&&y<720&&pixels[(y*720+x)*4+3]>80}}
function glyphField(t,mode,green=false,alpha=1){g.save();g.globalAlpha=alpha;let flash=green&&(t>=55.98&&t<56.055||t>=56.175&&t<56.25);rect(0,0,720,720,flash?'#67c72b':'#000');g.font='700 10px '+C.mono_font;g.textBaseline='top';let q=t*C.bpm/60,beat=Math.exp(-((q%1)/.23)),base=green?'#70a23f':'#d1d0c5',accent=green?'#6f9c39':'#b30870',edge=green?'#85ac4a':'#ccc65b',shadow=green?'#3b611c':'#363274',word=mode==='word'?(green?'LOUD':'DUB'):mode==='number'?'2':null,mask=word?getMask(word):null,chars=' .,:;-~=+*#%@',symbols='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/{}[]=-+!';
 for(let y=0;y<C.rows;y++)for(let x=0;x<C.columns;x++){let xx=x*720/C.columns,yy=y*720/C.rows,cx=xx-360,cy=yy-360,rad=Math.hypot(cx,cy),a=Math.atan2(cy,cx),warp=18*Math.sin(a*3+t*3)+7*Math.sin(a*7-t*4),char='.',color=base,intensity=.5,field=Math.sin(xx*.022+t*.7)+Math.sin(yy*.033-t*1.1)+Math.sin(rad*.04-t*2),spoke=Math.abs(Math.sin(a*3+t*.27)),ring=((rad+warp-t*58)%66+66)%66;
  if(mode==='word'||mode==='number'){let dx=9*Math.sin(yy*.012+t*4)*beat,dy=6*Math.sin(xx*.013+t*3)*beat;let hit=mask(xx+dx,yy+dy),outline=false;for(let oy of [-12,0,12])for(let ox of [-12,0,12])if(mask(xx+dx+ox,yy+dy+oy))outline=true;let sh=mask(xx-19+dx,yy-23+dy);if(hit){char='@';color=accent;intensity=1}else if(outline){char='@';color=edge;intensity=.95}else if(sh){char='/';color=shadow;intensity=1}else{let stripe=Math.abs(cx-140-22*Math.sin(yy*.025+t*.7));if(stripe<9){char='0';intensity=.85}else if(Math.abs(Math.sin(rad*.015-t))<.065){char=symbols[Math.floor(rand(x*101+y+Math.floor(t*8))*symbols.length)];intensity=.75}else {char=(x+y)%5===0?':':'.';intensity=.54}}if(yy>470&&yy<565&&Math.abs(cx)<260&&rand(x*11+y+Math.floor(t*5))>.83){char='@';color=accent;intensity=.75}}
  else {let n=clamp((field+3)/6),idx=Math.floor(n*(symbols.length-1));let ramp='..::---===++++++x****##@';char=ramp[Math.min(ramp.length-1,Math.floor(n*ramp.length))];if(rand(x*77+y*199+Math.floor(t*14))>.72)char=symbols[Math.floor(rand(x*119+y*83+Math.floor(t*7))*symbols.length)];intensity=.43+.55*n;if(mode==='spoke'||mode==='combined'){let line=Math.abs(spoke-.48)<.045;if(line||Math.abs(cx-95*Math.sin(yy*.018+t*.5))<10){intensity=1;char='0';color=green?'#659535':'#babfb5'}let bars=Math.abs(((yy+Math.sin(t)*30)%166)-80)<16&&Math.abs((xx+t*59+yy*.7)%560-280)<140;if(bars){char='@';color=edge;intensity=.85;if(Math.abs(cx)<24){color=accent}}}
   if(mode==='tunnel'||mode==='combined'){let active=Math.abs(ring-30)<8;if(active){char='@';color=accent;intensity=.95}if(Math.abs(ring-48)<4){color=edge;intensity=.7}}
   if(mode==='wave'||mode==='combined'){let amp=mode==='wave'?23+beat*48:18+beat*34,wave=cy-amp*Math.sin(xx*.035+t*5)-beat*13*Math.sin(xx*.12-t*13);if(Math.abs(wave)<13){char='@';color=accent;intensity=1}else if(Math.abs(wave)<23){char='@';color=edge;intensity=.9}else if(Math.abs(wave)<50){char='/';color=shadow;intensity=.95}}
   if(green)intensity*=.85;
  }g.globalAlpha=alpha*clamp(intensity);g.fillStyle=flash?'#2d6017':color;g.fillText(char,xx,yy)}
 g.restore();
}
function modeAt(t){if(t<24.4||t>=43.2&&t<44.9)return'word';if(t<26.1||t>=44.9&&t<46.65)return'number';if(t<29.5||t>=46.65&&t<50.2)return'spoke';if(t<32.8||t>=50.2&&t<53.5)return'tunnel';if(t<34.7||t>=53.5&&t<55.2)return'wave';return'combined'}
function render(t){time=clamp(t,0,C.duration);g.globalAlpha=1;rect(0,0,720,720,'#000');if(time<22.5||time>=36.9&&time<43.2||time>=57.5)editor(time);else glyphField(time,modeAt(time),time>=43.2);if(time>=22.35&&time<22.65){let a=1-Math.abs(time-22.5)/.15;g.save();g.globalAlpha=a*.35;rect(0,0,720,720,'#bfc5c4');g.restore()}
 if(time>=36.3&&time<37.3){let a=ease((time-36.3)/.8);if(time<36.9){g.save();g.globalAlpha=a*.95;rect(0,0,720,720,'#fcfcfc');g.restore()}else {glyphField(time,'combined',false,(1-a)*.45)}}
 if(time>=57.25&&time<57.75&&time>=57.5){let a=1-ease((time-57.25)/.5);glyphField(time,'combined',true,a)}
 stage.width=innerWidth;stage.height=innerHeight;let s=Math.min(stage.width/720,stage.height/720);ctx.fillStyle='#000';ctx.fillRect(0,0,stage.width,stage.height);ctx.drawImage(surface,(stage.width-720*s)/2,(stage.height-720*s)/2,720*s,720*s)}
window.ready=()=>readyPromise||(readyPromise=(async()=>{C=await(await fetch('project.json')).json();P=C.palette;await document.fonts.load('20px JMono');await document.fonts.ready;window.duration=C.duration;render(0);return true})());window.seek=t=>{render(t);return window.getState()};window.getState=()=>({time,duration:C.duration,scene_index:time>=C.duration?scenes.length-1:scenes.findIndex(s=>time>=s[0]&&time<s[1]),source_video_loaded:false,source_full_frames_loaded:false,reference_image_assets:0,displayed_music_code_executed:false,beat:time*C.bpm/60,ascii_mode:time>=22.5&&time<36.9||time>=43.2&&time<57.5?modeAt(time):null,green_drop:time>=43.2&&time<57.5});window.addEventListener('resize',()=>C&&render(time));window.ready().then(()=>{if(!new URLSearchParams(location.search).has('render')){let start=performance.now();const tick=n=>{render(((n-start)/1000)%C.duration);requestAnimationFrame(tick)};requestAnimationFrame(tick)}});
