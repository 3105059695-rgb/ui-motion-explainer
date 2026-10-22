/* Episode-specific causal scenes. All illustrative interface content is marked as a diagram. */
(function(){
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=p=>1-Math.pow(1-clamp(p),4);
  const lerp=(a,b,p)=>a+(b-a)*p;
  const at=(ch,id)=>ch.cues.find(c=>c.id===id)?.start??ch.start;
  const phase=(t,ch,id,d=.55)=>ease((t-at(ch,id))/d);
  const current=(t,ch)=>{let q=ch.cues[0]?.id;for(const c of ch.cues)if(t>=c.start)q=c.id;return q;};
  function draw(ctx,t,ch,H){
    const {C,rr,txt,line,arrow,img,logo,pill}=H;
    ctx.save();
    const p=(id,d=.55)=>phase(t,ch,id,d);
    const label=(s='内容解释示意')=>txt(s,1818,887,21,C.muted,400,'right');
    const pop=(start,x,y,fn,delay=0)=>{const a=ease((t-start-delay)/.48);ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y+35*(1-a));ctx.scale(.94+.06*a,.94+.06*a);fn();ctx.restore();};
    const sheet=(x,y,w,h,title,opts={})=>{
      rr(x+8,y+10,w,h,12,'#D7D7DF');rr(x,y,w,h,12,opts.dark?C.black:C.white,opts.dark?C.black:C.line,2);
      rr(x+25,y+24,48,7,3,C.purple);txt(title,x+25,y+80,opts.size||32,opts.dark?C.white:C.black,800);
      for(let k=0;k<3;k++)rr(x+25,y+110+k*25,w-50-(k===2?45:0),5,2,opts.dark?'#66666F':'#D9D9E1');
    };
    const iconFile=(x,y,w,h,title)=>{rr(x+9,y+10,w,h,16,'#C5C4CC');rr(x,y,w,h,16,C.white,C.line);ctx.beginPath();ctx.moveTo(x+w-43,y);ctx.lineTo(x+w-43,y+43);ctx.lineTo(x+w,y+43);ctx.closePath();ctx.fillStyle=C.paper;ctx.fill();txt(title,x+w/2,y+h*.57,27,C.black,800,'center');};
    const caption=(s,x=1130,y=825)=>txt(s,x,y,38,C.black,800,'center');
    const check=(x,y,r=22)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=C.purple;ctx.fill();line(x-r*.43,y,x-r*.08,y+r*.32,C.white,4);line(x-r*.08,y+r*.32,x+r*.5,y-r*.35,C.white,4);};
    const cropped=(key,x,y,w,h,sx=0,sy=0,scale=1)=>{ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,20);ctx.clip();img(key,x+sx,y+sy,w*scale,h*scale,'contain');ctx.restore();};
    const pixelCrop=(key,sx,sy,sw,sh,x,y,w,h,r=20)=>{const im=H.images[key];if(!im)return;ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.clip();ctx.drawImage(im,sx,sy,sw,sh,x,y,w,h);ctx.restore();};
    const blackSign=(text,x,y,w=340)=>{rr(x+6,y+8,w,82,14,'#BEBCC8');rr(x,y,w,82,14,C.black);txt(text,x+w/2,y+54,31,C.white,750,'center');};
    const titlePhase=current(t,ch);
    if(ch.id==='codex'){
      const folder=(x,y,s=1)=>{ctx.save();ctx.translate(x,y);ctx.scale(s,s);rr(0,0,125,45,12,C.purple);rr(0,28,280,190,17,C.black);rr(15,47,250,135,10,'#262630');txt('你的项目',140,128,37,C.white,800,'center');txt('文件夹',140,170,21,'#B0ADB9',500,'center');ctx.restore();};
      if(t<at(ch,'old-terminal-branch')){
        pop(ch.start,565,240,()=>{logo('codex',0,0,130);txt('Codex',165,90,73,C.black,850);});
        const q=p('expert-to-beginner');
        rr(570,445,480,185,25,C.black);txt('专业工作流',810,515,45,C.white,800,'center');txt('终端 · 分支 · 并行',810,574,28,'#B6B4C1',500,'center');
        arrow(1080,537,1200,537,C.purple,7);
        pop(at(ch,'expert-to-beginner'),1250,443,()=>{rr(0,0,480,190,25,C.paper);txt('直接说需求',240,80,48,C.black,850,'center');txt('普通人也能上手',240,137,28,C.purple,700,'center');});
        caption('把操作门槛，藏进工作流里');
      }else if(t<at(ch,'folder-request')){
        const q=p('old-terminal-branch');
        cropped('assets/codex-cli-official.png',500,242,930,550,0,-35,1.07);
        txt('以前',1530,298,37,C.muted,600,'center');
        blackSign('终端命令',1475,370,300);line(1625,452,1625,540,C.line,4);
        line(1530,540,1720,540,C.purple,4);line(1530,540,1530,595,C.purple,4);line(1720,540,1720,595,C.purple,4);
        pill('分支 A',1442,595,175,69,C.paper,C.black,27);pill('分支 B',1633,595,175,69,C.paper,C.black,27);
        txt('官方 CLI 历史界面',510,817,21,C.muted,450);
      }else{
        const f=p('folder-request'),work=p('work'),parallel=p('parallel'),slow=p('slow'),tok=p('token'),done=p('workflow');
        const fx=lerp(680,485,parallel),fy=lerp(327,366,parallel);folder(fx,fy,.86);
        pop(at(ch,'folder-request'),875,247,()=>{rr(0,0,850,106,25,C.paper);txt('帮我把这个项目做好',425,68,42,C.black,750,'center');});
        if(work>0){arrow(745,476,855,476,C.purple,6);}
        const labels=['改页面','补测试','整理文件'];
        const starts=[at(ch,'work'),at(ch,'parallel'),at(ch,'parallel')+.13];
        for(let i=0;i<3;i++){
          if(i>0&&parallel<=0)continue;
          const rowy=394+i*123;
          pop(starts[i],905,rowy,()=>{
            rr(0,0,795,94,18,C.black);txt(labels[i],33,58,35,C.white,800);
            const amount=done>0?lerp(.62,1,done):clamp((t-starts[i])*.14,.02,.62);
            rr(240,40,405,13,7,'#42414D');rr(240,40,405*amount,13,7,C.purple);
            if(done>.8)check(739,47,20);else txt('执行中',735,57,24,'#C1BBCF',600,'center');
          });
        }
        if(slow>0&&done<1){
          ctx.save();ctx.globalAlpha=slow*(1-done);rr(485,652,326,152,22,C.paper);txt('复杂任务',648,698,27,C.muted,650,'center');
          ctx.beginPath();ctx.arc(535,754,27,0,Math.PI*2);ctx.strokeStyle=C.black;ctx.lineWidth=4;ctx.stroke();line(535,754,535,733,C.black,4);const angle=(t-at(ch,'slow'))*1.2;line(535,754,535+18*Math.sin(angle),754-18*Math.cos(angle),C.purple,4);txt('要等一会儿',682,769,30,C.black,750,'center');ctx.restore();
        }
        if(tok>0&&done<1){ctx.save();ctx.globalAlpha=tok*(1-done);txt('TOKEN',1110,831,26,C.muted,700);rr(1235,813,450,19,9,C.line);rr(1235,813,450*(.95-.75*clamp((t-at(ch,'token'))/1.6)),19,9,C.purple);ctx.restore();}
        if(done>0){ctx.save();ctx.globalAlpha=done;caption('一个目标，多条任务同时推进',1140,833);ctx.restore();}
        label();
      }
    }
    if(ch.id==='doubao'){
      const easy=p('easy'),agree=p('agree'),wrong=p('wrong-premise'),fake=p('fake-report');
      if(t<at(ch,'agree')){
        txt('挑一个功能',495,232,35,C.black,800);txt('直接追加任务要求',1120,232,35,C.purple,800);
        pixelCrop('assets/doubao-hero.png',75,235,720,755,495,260,530,556);
        pixelCrop('assets/doubao-hero.png',914,277,670,585,1120,262,670,585);
        pop(at(ch,'easy'),545,850,()=>{pill('入口浅',0,0,180,47,C.black,C.white,26);pill('说人话',200,0,180,47,C.purple,C.white,26);pill('易上手',400,0,180,47,C.black,C.white,26);});
        txt('官方功能宣传图 · 局部放大',1818,887,20,C.muted,400,'right');
      }else{
        const q=fake,dx=lerp(0,-45,q);
        logo('doubao',480+dx,267,92);txt('豆包工作',600+dx,327,43,C.black,800);
        pop(at(ch,'agree'),520+dx,390,()=>{rr(0,0,780,128,22,C.paper);txt(wrong>.4?'假设：一个月有 32 天':'我有一个想法……',35,78,39,C.black,750);});
        pop(at(ch,'agree')+.25,630+dx,555,()=>{rr(0,0,680,135,24,C.black);txt(wrong>.4?'顺着错误前提继续解释':'“你说得对……”',340,82,39,C.white,750,'center');});
        if(wrong>0){ctx.save();ctx.globalAlpha=wrong;rr(521+dx,391,780,128,22,'transparent',C.purple,5);pill('前提就错了',988+dx,355,290,58,C.purple,C.white,27);ctx.restore();}
        if(fake>0){
          const x=lerp(1670,1395,q),y=lerp(400,300,q);ctx.save();ctx.globalAlpha=q;sheet(x,y,365,448,'分析报告',{size:35});
          [0,1,2].forEach(i=>{rr(x+48+i*87,y+277-(i+1)*42,47,(i+1)*42,5,i===1?C.purple:'#AAAAAF');});
          line(x+30,y+286,x+330,y+286,C.line,3);txt('看着像，不代表对',x+182,y+347,27,C.black,700,'center');
          const stamp=ease((t-at(ch,'fake-report')-.8)/.35);ctx.translate(x+184,y+404);ctx.rotate(-.13);ctx.globalAlpha*=stamp;rr(-145,-36,290,69,9,'#FFFFFFEE',C.purple,5);txt('未核实',0,14,40,C.purple,900,'center');ctx.restore();
        }
        caption(fake>.5?'资料排得再漂亮，也要核对事实':'附和感，不等于可靠性',1115,818);label('情景示意 · 非实际对话录屏');
      }
    }
    if(ch.id==='workbuddy'){
      const con=p('connections'),task=p('task'),split=p('split-deliver'),rev=p('revise');
      if(t<at(ch,'connections')){
        pixelCrop('assets/workbuddy-hero.webp',540,210,1350,660,500,225,1280,626);
        txt('官方客户端 · 任务输入区放大',1818,887,21,C.muted,400,'right');
      }else{
        const cx=lerp(1095,642,task),cy=lerp(470,380,task);
        const names=['微信','企微','腾讯文档','腾讯会议'];
        const pos=[[-445,-155],[260,-155],[-445,145],[260,145]];
        for(let i=0;i<4;i++){
          const pp=ease((t-at(ch,'connections')-i*.09)/.42);const x=lerp(cx+pos[i][0],490+(i%2)*195,task),y=lerp(cy+pos[i][1],560+Math.floor(i/2)*110,task);
          ctx.save();ctx.globalAlpha=pp;line(x+125,y+45,cx+60,cy+60,task<.5?C.line:'#E7E7EC',3);rr(x,y,task>.5?175:250,88,17,C.paper);txt(names[i],x+(task>.5?87:125),y+56,task>.5?27:31,C.black,800,'center');ctx.restore();
        }
        rr(cx-20,cy-20,166,166,30,C.black);logo('workbuddy',cx+12,cy+12,102);
        if(task>0){
          const things=['资料','表格','方案'];
          for(let i=0;i<3;i++)pop(at(ch,'task'),910+i*270,276,()=>{iconFile(0,0,210,172,things[i]);},i*.1);
          arrow(1250,476,1250,539,C.purple,7);
          const x=905,y=565;
          pop(at(ch,'task')+.4,x,y,()=>{rr(0,0,770,155,22,C.black);txt('先拆步骤，再动手',385,62,38,C.white,800,'center');
            ['收集','整理','制作'].forEach((s,i)=>{pill(s,35+i*250,91,205,45,i===Math.min(2,Math.floor((t-at(ch,'task'))/1.1))?C.purple:'#383741',C.white,23);});});
        }
        if(split>0){
          const a=split;ctx.save();ctx.globalAlpha=a;
          rr(885,232,860,535,24,C.white,C.line,2);rr(885,232,860,64,24,C.black);txt('项目方案.pptx',922,276,29,C.white,750);txt(rev>.5?'修改后':'可继续编辑',1708,276,23,'#C8C3D1',600,'right');
          txt(rev>.4?'结论：先做好最关键的一步':'项目计划',944,370,39,C.black,850);
          const bars=[155,235,315];for(let i=0;i<3;i++){rr(969+i*135,685-bars[i],75,bars[i],8,i===2?C.purple:C.black);txt(['资料','方案','交付'][i],1006+i*135,727,23,C.muted,600,'center');}
          line(1438,425,1685,425,C.line,8);line(1438,467,1660,467,C.line,8);line(1438,509,1685,509,C.line,8);
          if(rev>0){ctx.globalAlpha*=rev;pill('补充结论 ✓',1394,567,295,93,C.purple,C.white,32);}
          ctx.restore();
        }
        caption(split>.5?'结果能打开，也能接着改':'办公工具连起来，工作接着做',1140,842);label();
      }
    }
    if(ch.id==='harness'){
      const lego=p('lego'),mods=p('modules'),swap=p('swap'),personal=p('personal-agent'),high=p('ceiling');
      if(t<at(ch,'lego')){
        txt('插件管理',500,240,40,C.black,800);
        const cropY=lerp(625,1098,p('not-finished-app',.55));
        pixelCrop('assets/deepseek-hero.webp',80,cropY,1100,490,500,278,1265,564);
        if(t>=at(ch,'plugins')){pill('一切皆可插件',1290,199,475,68,C.black,C.white,34);}
        txt('官方插件管理界面 · 列表局部放大',1818,887,21,C.muted,400,'right');
      }else{
        const names=['模型','工具','记忆','界面'];
        const from=[[540,330],[890,250],[1240,330],[1590,410]],to=[[1065,320],[1390,320],[1065,558],[1390,558]];
        for(let i=0;i<4;i++){
          const enter=ease((t-at(ch,'lego')-i*.09)/.45);let x=lerp(from[i][0],to[i][0],personal),y=lerp(from[i][1],to[i][1],personal);
          if(i===2&&swap>0&&personal<1)y-=Math.sin(swap*Math.PI)*105;
          const repl=i===2&&swap>.5;
          ctx.save();ctx.globalAlpha=enter;ctx.translate(x,y+60*(1-enter));
          rr(10,21,235,175,19,'#B9B6C4');rr(0,0,235,175,19,repl?C.purple:C.black);
          for(let k=0;k<2;k++){rr(40+k*105,-15,48,31,12,repl?'#6131CE':'#303039');rr(40+k*105,-22,48,27,12,repl?'#A87FFF':'#55535E');}
          txt(repl?'新记忆':names[i],117,89,47,C.white,850,'center');txt(mods>.5?'可独立替换':'插件模块',117,135,23,'#C9C4D6',550,'center');ctx.restore();
        }
        if(personal>0){ctx.save();ctx.globalAlpha=personal;rr(495,302,385,416,26,C.paper);logo('deepseek',605,347,150);txt('你的专属',688,568,40,C.black,800,'center');txt('Agent',688,640,61,C.purple,900,'center');arrow(900,510,1030,510,C.purple,7);ctx.restore();}
        if(swap>0&&personal<.5)txt('拔出 → 换上',1360,245,36,C.purple,850,'center');
        caption(personal>.5?'按你的习惯，组合工作方式':mods>.5?'模型、工具、记忆、界面，都能换':'不是固定成品，是一套可组合模块',1155,835);label();
      }
    }
    if(ch.id==='claude'){
      const messy=p('messy-to-clear'),clean=p('clean-output'),access=p('access'),ban=p('ban');
      if(t<at(ch,'messy-to-clear')){
        pixelCrop('assets/claude-hero.webp',300,125,1045,465,500,275,1300,578);
        pill('处理复杂需求',500,205,420,60,C.black,C.white,32);txt('官方历史界面 · 终端功能区放大',1818,887,21,C.muted,400,'right');
      }else if(t<at(ch,'access')){
        const settle=ease((t-at(ch,'messy-to-clear')-.9)/1.2);const names=['改页面','写文案','补测试','查资料','修问题'];
        const poses=[[505,270,-.12],[730,335,.09],[510,590,.08],[760,615,-.1],[620,440,.04]];
        for(let i=0;i<5;i++){
          const [xx,yy,rot]=poses[i];const x=lerp(xx,520,settle),y=lerp(yy,258+i*102,settle);ctx.save();ctx.translate(x,y);ctx.rotate(rot*(1-settle));rr(7,10,300,80,12,'#D0CFD6');rr(0,0,300,80,12,C.paper);txt(names[i],150,53,33,C.black,800,'center');ctx.restore();
        }
        arrow(876,514,1010,514,C.purple,7);
        const outX=1060,outY=265;
        pop(at(ch,'messy-to-clear')+.4,outX,outY,()=>{rr(0,0,670,484,23,C.black);txt('整理清楚',335,73,42,C.white,850,'center');
          for(let i=0;i<3;i++){const y=140+i*94;rr(35,y,600,69,12,'#24242F');txt(['1  明确目标','2  拆出步骤','3  形成交付'][i],62,y+46,31,C.white,650);if(settle>.3+i*.23)check(582,y+34,18);}
        });
        if(clean>0){ctx.save();ctx.globalAlpha=clean;rr(1015,240,740,540,22,C.white,C.line);rr(1015,240,740,67,22,C.black);txt('整理后的交付',1050,284,31,C.white,750);pill('代码',1049,340,160,58,C.black,C.white,27);pill('文案',1230,340,160,58,C.purple,C.white,27);
          const code=['function deliver() {','  clarifyGoal();','  executePlan();','  return result;','}'];code.forEach((s,i)=>txt(s,1060,460+i*48,32,i===3?C.purple:C.black,650));check(1680,706,25);ctx.restore();}
        caption(clean>.5?'复杂需求，变成清楚的交付':'先把混乱理顺，再往下做',1140,842);label();
      }else{
        const gate=ban;sheet(530,290,590,430,'工作正在进行',{dark:true,size:43});txt('文案  /  代码  /  任务',565,655,31,'#C7C1D3',650);
        arrow(1155,500,1280,500,C.purple,6);
        const gx=1320,gy=280,gw=420,gh=470;
        rr(gx,gy,gw,gh,29,C.paper);txt('账号通行',gx+gw/2,gy+76,40,C.black,850,'center');logo('claude',gx+174,gy+135,72);
        const open=1-gate;ctx.save();ctx.beginPath();ctx.roundRect(gx+23,gy+250,gw-46,180,17);ctx.clip();rr(gx+23-160*open,gy+250,187,180,0,C.black);rr(gx+210+160*open,gy+250,187,180,0,C.black);ctx.restore();
        if(gate>.4){ctx.save();ctx.globalAlpha=gate;rr(gx+167,gy+291,86,75,15,C.purple);ctx.beginPath();ctx.arc(gx+210,gy+291,24,Math.PI,0);ctx.strokeStyle=C.purple;ctx.lineWidth=9;ctx.stroke();txt('Ⅱ',gx+210,gy+342,36,C.white,900,'center');ctx.restore();}
        txt(gate>.5?'工作被中断':'使用门槛',gx+gw/2,gy+470,37,gate>.5?C.purple:C.black,850,'center');
        caption('能力之外，还要考虑使用体验',1140,842);label('使用风险示意 · 非实际报错界面');
      }
    }
    ctx.restore();
  }
  window.BodyA={draw};
})();
