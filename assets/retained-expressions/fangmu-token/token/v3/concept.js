/* Concept V3: editable text -> visible boundaries -> IDs -> reusable vocabulary.
 * These are explicitly conceptual views, not a real model's tokenizer output.
 * No subtitles/presenter; y >= 880 belongs to the host's UI captions.
 * Optional geometric metaphor reuses the approved window.ToyCar asset unchanged. */
window.ConceptV3=(()=>{
  const C={paper:'#F8F8F6',ink:'#17171B',muted:'#827C89',line:'#E7E3EA',lav:'#D8C4F5',accent:'#9470BE',soft:'#F3F0F7'};
  function draw(c,t,s,h){
    const P=h.p,L=h.lerp,Q=(k,v)=>s.cues?.[k]??v;
    const tx=(a,x,y,z,o={})=>h.txt(c,a,x,y,z,{weight:650,...o});
    const box=(x,y,w,z,r=12,fill='#FFFFFF',stroke)=>h.box(c,x,y,w,z,r,fill,stroke);
    const line=(x,y,x2,y2,col=C.line,w=2)=>h.line(c,x,y,x2,y2,col,w);
    const group=(x,y,z,a,fn)=>h.group(c,x,y,z,0,a,fn);
    const bg=(dark=0)=>{const a=Math.round(L(248,20,dark)),b=Math.round(L(248,21,dark)),d=Math.round(L(246,24,dark));c.fillStyle=`rgb(${a},${b},${d})`;c.fillRect(0,0,1920,1080)};
    function shadow(x,y,w,z,r=24){c.save();c.shadowColor='#22162D18';c.shadowBlur=42;c.shadowOffsetY=17;box(x,y,w,z,r,'#FFFFFF');c.restore();box(x+.7,y+.7,w-1.4,z-1.4,r,'#FFFFFF','#E8E5EC')}
    function frame(title='文本分词演示',a=1){c.save();c.globalAlpha*=a;shadow(480,198,1350,620);box(481,199,1348,56,23,'#F0EEF3');for(let i=0;i<3;i++){c.beginPath();c.arc(513+i*22,228,5,0,7);c.fillStyle=['#AC9DBB','#C7BCD3','#DCD5E3'][i];c.fill()}tx(title,603,227,25,{weight:550,color:'#6A6276'});tx('概念示意',1787,227,22,{align:'right',color:'#968C9F',weight:450});c.restore()}
    function note(dark=false,text='边界、编号与数量均为概念示意，不代表实际模型输出'){tx(text,1145,855,22,{align:'center',weight:450,color:dark?'#ADA5B8':'#958B9E'})}
    function cursor(x,y,a=1,click=0){c.save();c.globalAlpha*=a;c.translate(x,y);c.beginPath();c.moveTo(0,0);c.lineTo(0,28);c.lineTo(7.5,20);c.lineTo(14,33);c.lineTo(20,30);c.lineTo(13,18);c.lineTo(25,18);c.closePath();c.fillStyle='#202026';c.fill();c.strokeStyle='#FFFFFF';c.lineWidth=2;c.stroke();if(click>0){c.beginPath();c.arc(4,7,20+click*14,0,7);c.strokeStyle=`rgba(148,112,190,${(1-click)*.75})`;c.lineWidth=3;c.stroke()}c.restore()}
    function button(text,x,y,w,active=0){box(x,y,w,53,10,active>.5?C.ink:'#F0EDF4');tx(text,x+w/2,y+26,25,{align:'center',weight:600,color:active>.5?'#FFFFFF':'#72687E'})}
    function fontSize(text,size){return `${/^[a-zA-Z0-9 ]+$/.test(text)?700:650} ${size}px ${/^[a-zA-Z0-9 ]+$/.test(text)?'EN':'CN'}`}
    // Widths are derived from the actual loaded fonts so selection and cut lines
    // remain on the original glyphs. No physical pieces are manufactured here.
    function run(text,x,y,size=76){let at=[0],w=0;c.save();for(let i=0;i<text.length;i++){c.font=fontSize(text[i],size);w+=c.measureText(text[i]).width;at.push(w)}c.restore();return {text,x,y,size,width:w,at}}
    function glyphs(r,a=1){c.save();c.globalAlpha*=a;for(let i=0;i<r.text.length;i++){c.font=fontSize(r.text[i],r.size);c.fillStyle=C.ink;c.textAlign='left';c.textBaseline='middle';c.fillText(r.text[i],r.x+r.at[i],r.y)}c.restore()}
    function selection(r,from,to,p=1){if(p<=0)return;box(r.x+r.at[from]-3,r.y-r.size*.59,(r.at[to]-r.at[from]+6)*p,r.size*1.19,5,C.lav);line(r.x+r.at[from],r.y-r.size*.67,r.x+r.at[from],r.y+r.size*.67,C.accent,2)}
    function boundaries(r,cuts,p=1){cuts.forEach((j,i)=>{const x=r.x+r.at[j];line(x,r.y-r.size*.68,x,r.y+r.size*.73*p,C.accent,2.4);if(p>.5){c.beginPath();c.arc(x,r.y-r.size*.68,3,0,7);c.fillStyle=C.accent;c.fill()}})}
    function ids(values,y=611,progress=1,x0=676,width=1010){
      tx('对应编号',558,y,24,{color:C.muted,weight:500});
      const slot=width/Math.max(1,values.length);
      values.forEach((v,i)=>{const a=P(progress,Math.max(0,i*.07),Math.min(1,.38+i*.07));c.save();c.globalAlpha*=a;const x=x0+i*slot;line(x-6,y+36,x+slot-24,y+36,'#E2D8ED',2);tx(String(v),x+slot/2-13,y,42,{font:'EN',weight:700,align:'center'});tx(String(i+1).padStart(2,'0'),x+slot/2-13,y+62,17,{font:'EN',align:'center',color:'#A99EAF',weight:500});c.restore()});
    }
    function inputLabel(text='输入文本'){tx(text,558,300,24,{color:C.muted,weight:500})}

    function intro(){
      bg();
      const enter=P(t,12.52,14.2),into=P(t,Q('先记住一句话',20.7185),22.30),focus=P(t,Q('处理文字',23.3985),24.30);
      const questions=['Token 是什么？','为什么要用它？','怎样影响费用与容量？'];
      const times=[Q('Token 是什么',15.9185),Q('为什么要用它',17.1585),Q('以及它怎么影响收费和上下文容量',18.0585)];
      tx('从三个问题开始',555,123,32,{weight:550,color:C.muted,alpha:enter*(1-into)});
      questions.forEach((str,i)=>{const e=P(t,12.80+i*.15,13.9+i*.15),on=P(t,times[i]-.08,times[i]+.42);c.save();c.globalAlpha*=e*(1-P(into,0,.22));const y=260+i*188-into*65;tx(str,555,y,i===2?69:86,{weight:780});line(557,y+68,L(557,1640,on),y+68,C.lav,9);tx(`0${i+1}`,1725,y,35,{font:'EN',color:C.muted,align:'right',weight:700});c.restore()});
      if(into<1){const idx=t<times[1]?0:t<times[2]?1:2;cursor(1645,318+188*idx,enter*(1-P(into,0,.3)))}
      if(into>0){
        group(1150,480,L(.82,1.03,into),P(into,0,.55),()=>{c.translate(-1150,-480);frame('一句话，进入语言模型');inputLabel('你输入的文字');const r=run('今天，我们来学习 AI。',601,416,77);const typed=Math.floor(r.text.length*P(t,21.2,22.45));const select=P(t,22.55,23.65);selection(r,3,5,select);glyphs({...r,text:r.text.slice(0,typed)});line(r.x+r.at[typed]+4,371,r.x+r.at[typed]+4,464,C.accent,3);
          tx('选中的小块',615,557,29,{weight:500,color:C.muted,alpha:select});tx('Token',1115,572,L(81,116,focus),{font:'EN',weight:700,align:'center',alpha:select});if(select>.001){c.save();c.globalAlpha*=select;line(899,474,1115,506,C.accent,2);c.restore()}
          tx('处理文字时使用的基本单位',1115,732,46,{align:'center',weight:650,alpha:P(t,23.1,25.15)});
        });
      }
      if(into>.5)note(false,'文本选区仅作概念示意');
    }

    function correspondence(){
      bg();
      if(t<47.05){tx('1 Token',1140,361,153,{font:'EN',align:'center',weight:700});tx('≠ 一个汉字，也 ≠ 一个单词',1140,546,60,{align:'center',weight:700});return}
      const close=P(t,50.42,51.24)*(1-P(t,53.24,54.10)),pickWord=P(t,Q('几个字',48.4749),48.9),pickEnglish=P(t,Q('或者单词的一部分',49.0949),49.65),char=P(t,Q('一个汉字也会拆成多个 Token',51.1949),52.40),mode=P(t,53.65,54.8),swap=P(t,Q('换个模型',57.3549),58.40);
      group(1150,430,L(1,1.065,close),P(t,47.0,47.42),()=>{c.translate(-1150,-430);frame('边界与编号 · 同一段文字');inputLabel();
        const r=run('我喜欢学习 reading',600,391,86);
        if(mode<1){
          let from=0,to=1;if(pickWord>.5){from=1;to=3}if(pickEnglish>.5){from=6;to=10}if(close>.4){from=3;to=4}
          c.save();c.globalAlpha*=1-P(mode,0,.42);selection(r,from,to,P(t,47.15,47.72));c.restore();
          if(char>0){c.save();c.globalAlpha*=char*(1-P(mode,0,.42));const x=r.x+(r.at[3]+r.at[4])/2;[892.3,1229,1565.7].forEach(xx=>{line(x,454,x,492,C.accent,2);line(x,492,xx,531,C.accent,2);line(xx,531,xx,548,C.accent,2)});ids(['314','826','907'],591,char,737,1010);tx('一个汉字，也可能对应多个编号',1175,740,38,{align:'center',color:C.muted,weight:550});c.restore()}
          else{c.save();c.globalAlpha*=1-mode;const labels=pickEnglish>.5?['单词的一部分','read']:pickWord>.5?['几个字','喜欢']:['一个字','我'];tx('当前选区',558,581,24,{weight:500,color:C.muted});tx(labels[1],755,577,57,{font:pickEnglish>.5?'EN':'CN'});tx('→',1100,577,47,{color:C.accent,align:'center'});tx('一个处理单位',1430,581,40,{align:'center',weight:650});tx(labels[0],755,677,30,{weight:500,color:C.muted});c.restore()}
        }
        if(mode>0){
          c.save();c.globalAlpha*=P(mode,.50,1);
          tx('切分示意',558,492,24,{color:C.muted,weight:500});button('方案甲',1270,469,176,1-swap);button('方案乙',1458,469,176,swap);
          const oldCuts=[1,3,5],newCuts=[1,2,3,4,5,10];
          c.save();c.globalAlpha*=1-swap;oldCuts.forEach((j,i)=>selection(r,[0,1,3,5][i],j,.98));boundaries(r,oldCuts,1);c.restore();
          c.save();c.globalAlpha*=swap;newCuts.forEach((j,i)=>selection(r,[0,1,2,3,4,5][i],j,.95));boundaries(r,newCuts,1);c.restore();
          const fadeOld=1-P(swap,.02,.45),fadeNew=P(swap,.53,1);c.save();c.globalAlpha*=fadeOld;ids(['018','027','081','319'],611,1,711,1020);c.restore();c.save();c.globalAlpha*=fadeNew;ids(['018','011','024','082','083','320','321'],611,1,711,1020);c.restore();
          tx(swap<.5?'4 个小块':'7 个小块',1135,743,39,{align:'center',weight:750});cursor(L(1426,1565,P(t,57.05,57.50)),505,1,P(t,57.35,57.85)*(1-P(t,57.85,58.05)));
          c.restore();
        }
        glyphs(r);
      });
      note();
    }

    function vocabulary(){
      bg();
      const fill=P(t,Q('因为语言的组合太多了',61.507),66.80),scroll=P(t,Q('如果每一种完整写法',66.967),70.78),shared=P(t,Q('会利用能够重复使用的片段',73.567),75.1),balance=P(t,Q('在词汇表大小和序列长度之间做取舍',75.707),77.5);
      const zoom=P(t,64.20,65.10)*(1-P(t,66.75,67.65));
      group(1100,470,1+zoom*.045,1,()=>{c.translate(-1100,-470);frame('词汇表实验 · 观察同一句文本');
        line(1125,275,1125,775);tx('词汇表',558,302,38,{weight:740});tx('当前文本',1190,302,27,{color:C.muted,weight:500});
        const words=['play','playing','played','replay','player','playful','plays','playable','playfully','replaying','replayed','players'];
        const fragments=['play','ing','ed','re','er','ful','s','able','ly'];
        tx(shared>.6?'共享片段':'完整写法',1071,302,23,{align:'right',weight:500,color:C.muted});
        c.save();c.beginPath();c.rect(540,346,545,359);c.clip();
        words.forEach((word,i)=>{
          const visible=i===0?1:P(t,62.0+(i-1)*.34,62.28+(i-1)*.34),y=385+i*60-scroll*360;
          const old=1-P(t,73.62,74.15);
          if(y<311||y>755)return;c.save();c.globalAlpha*=visible*old;
          line(553,y+29,1073,y+29,'#ECE8F1',1);tx(String(i+1).padStart(3,'0'),557,y,23,{font:'EN',color:'#AEA3B6'});
          const r=run(word,649,y,40),at=word.indexOf('play');selection(r,at,at+4,P(t,64.35,65.20));glyphs(r);c.restore();
        });
        fragments.forEach((word,i)=>{const a=P(t,74.10+i*.035,74.62+i*.035);c.save();c.globalAlpha*=a;const col=i<5?0:1,y=385+(i<5?i:i-5)*60,x=col?830:565;
          tx(String(i+1).padStart(2,'0'),x,y,21,{font:'EN',color:'#A89BAF'});const r=run(word,x+58,y,38);if(i===0)selection(r,0,4,1);glyphs(r);c.restore()});
        c.restore();
        tx('playing replay',1190,395,57,{font:'EN',weight:700});
        tx('切分后的序列',1190,490,25,{color:C.muted,weight:500});
        const old=1-P(t,74.45,74.96),nw=P(t,75.03,75.62);
        c.save();c.globalAlpha*=old;tx('playing',1190,560,48,{font:'EN'});line(1390,523,1390,590,C.accent,2);tx('replay',1420,560,48,{font:'EN'});tx('2 个单位',1465,664,40,{align:'center'});c.restore();
        c.save();c.globalAlpha*=nw;const seq=run('play ing re play',1190,560,43);[4,8,11].forEach(i=>line(seq.x+seq.at[i],523,seq.x+seq.at[i],590,C.accent,2));selection(seq,0,4,1);selection(seq,12,16,1);glyphs(seq);tx('4 个单位',1465,664,40,{align:'center'});c.restore();
        button('复用片段',798,732,260,shared);cursor(L(1097,1027,P(t,72.9,73.57)),765,1,P(t,73.56,74.06)*(1-P(t,74.06,74.32)));
        tx(shared>.5?'9 条共享片段':`${Math.min(12,Math.max(1,2+Math.floor((t-62.0)/.34)))} 种完整写法`,590,749,25,{weight:650,color:C.muted});
      });
      tx(balance>.1?'词汇表更小，序列可能更长':'同一片段，可以多次使用',1140,115,balance>.1?59:56,{align:'center',weight:750,alpha:P(t,63.85,64.7)});
      note(false,'词根与片段复用示意；实际分词不保证沿词根切分');
    }

    function process(){
      const carIn=P(t,Q('这有点像积木',81.9833),82.70),carOut=P(t,Q('至于一个具体单词怎么切',86.4433)-.2,87.0),car=carIn*(1-carOut);
      const fine=P(t,Q('也可以继续拆成更小的片段',79.9433),81.18),root=P(t,Q('不一定刚好按照它的词根来',88.4633),89.60),naming=P(t,Q('这个拆分过程',90.5833),91.46),tool=P(t,Q('叫 Tokenizer',95.5233),96.38);
      const dark=P(t,90.5,91.28);bg(dark);
      const x=L(1150,300,car),y=L(500,310,car),z=L(1,.255,car);
      group(x,y,z,L(1,.78,car),()=>{c.translate(-1150,-500);frame(tool>.5?'Tokenizer · 分词器':'观察一个陌生写法');inputLabel();
        const r=run('microarchitectures',580,392,72);
        const drawCuts=[2,5,9,13],processRun=P(t,90.88,92.37);
        // The actual readable text remains intact; segmentation changes the
        // boundary overlay and corresponding ID row, not the glyph positions.
        [5].forEach(j=>{c.save();c.globalAlpha*=1-fine;boundaries(r,[j],1);c.restore()});
        if(naming>0){let prev=0;[...drawCuts,r.text.length].forEach((j,i)=>{selection(r,prev,j,P(t,90.82+i*.20,91.19+i*.20));prev=j})}
        c.save();c.globalAlpha*=fine;boundaries(r,drawCuts,1);c.restore();glyphs(r);
        if(root>0&&naming<1){c.save();c.globalAlpha*=root*(1-naming);c.setLineDash([8,9]);line(r.x+r.at[5],451,r.x+r.at[5],493,'#A097AF',2);c.setLineDash([]);tx('词根位置 ≠ 固定切分规则',1140,505,30,{align:'center',color:C.muted,weight:500});c.restore()}
        else tx('原文保持不变，只更新边界与编号',1138,500,29,{align:'center',color:C.muted,weight:500,alpha:1-tool});
        ids(['024','117','082','316','409'],625,fine,765,958);
        button(naming>.5?'重新分词':'查看切分',1458,726,248,naming>.2?1:fine);
        cursor(1640,763,1,P(t,90.7,91.07)*(1-P(t,91.07,91.35)));
        tx(tool>.1?'执行这个过程的工具':'同一输入 → 边界 → 编号',568,753,31,{color:C.muted,weight:550});
      });
      if(car>.001&&window.ToyCar){
        const apart=P(t,82.60,83.55)*(1-P(t,84.42,85.75));
        window.ToyCar.draw(c,{cx:1195,cy:575,scale:.76,yaw:L(-.57,.14,P(t,83.55,85.76)),pitch:.28,explode:apart*.80,focus:0,opacity:car,time:t});
        tx('同一批零件，拆开后还能重新连接',1170,134,55,{align:'center',alpha:car,weight:720});
      }
      const oldTitle=1-P(t,94.72,95.30);
      if(naming>0){tx('Tokenization',1135,109,93,{align:'center',font:'EN',weight:700,color:'#F8F6FA',alpha:naming*oldTitle});tx('Tokenizer',1135,109,99,{align:'center',font:'EN',weight:700,color:'#F8F6FA',alpha:tool})}
      else if(car<.8)tx('陌生写法，还可以继续拆小',1135,117,56,{align:'center',weight:720,alpha:(1-car)*(1-P(t,88.18,88.7))});
      note(dark>.5,'切分过程与编号均为概念示意；非真实分词器运行结果');
    }
    c.save();
    if(s.index===1)intro();else if(s.index===3)correspondence();else if(s.index===4)vocabulary();else if(s.index===5)process();
    c.restore();
  }
  return {draw,motionActive:t=>(t>=12.52&&t<25.64)||(t>=42.64&&t<97.56)};
})();
