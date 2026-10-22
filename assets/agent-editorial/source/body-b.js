/* Five continuous object-led explainers. All interface reconstructions are labelled. */
(function () {
  'use strict';
  function draw(ctx, t, ch, H) {
    const {C, rr, txt, line, arrow, img, logo, pill, mix, clamp} = H;
    if (!['trae', 'openclaw', 'kimi', 'cursor', 'qwen'].includes(ch.id)) return;
    const at = id => (ch.cues.find(c => c.id === id) || {start: ch.start}).start;
    const has = id => t >= at(id);
    const p = (id, duration = .48, delay = 0) => clamp((t - at(id) - delay) / duration);
    // Extra readable exposure is inside the existing narration, never a source retime.
    const materialEnd = {trae:153.2, kimi:211.1, qwen:272.9};
    const material = {
      trae: {rect:[470,260,950,430], title:'TRAE Work · 从一个工作区开始', sub:'官方未登录网页局部 · 原始静态素材'},
      kimi: {rect:[1040,600,1820,720], title:'Kimi Work · 官方任务入口', sub:'官方界面素材局部 · Agent / Agent 集群入口'},
      qwen: {rect:[470,235,790,270], title:'千问办公 · 多项能力聚在这里', sub:'官方界面素材局部 · 任务输入与办公能力入口'}
    };
    const smooth = n => 1 - Math.pow(1 - clamp(n), 3);
    const move = (a,b,n) => mix(a,b,smooth(n));
    const label = (s,x,y,size=28,color=C.muted,weight=500) => txt(s,x,y,size,color,weight);
    const headline = s => txt(s,462,245,52,C.black,850);
    const note = s => txt(s,465,834,27,C.muted,500);
    const tag = () => pill('讲解示意',1650,207,152,40,C.paper,C.muted,22);
    const withAlpha = (a,fn) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); };
    const dot = (x,y,r,color) => {ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();};
    function tick(x,y,color=C.purple,s=1) {line(x,y+8*s,x+10*s,y+18*s,color,5*s);line(x+10*s,y+18*s,x+30*s,y-8*s,color,5*s);}
    function cross(x,y,s=1,color=C.black) {line(x,y,x+18*s,y+18*s,color,4*s);line(x+18*s,y,x,y+18*s,color,4*s);}
    function file(x,y,w,h,name,color=C.purple,detail='') {
      rr(x+6,y+7,w,h,12,C.line);rr(x,y,w,h,12,C.white,C.black,2.2);
      rr(x+16,y+18,8,h-36,4,color); txt(name,x+40,y+41,25,C.black,750);
      if(detail) label(detail,x+40,y+73,19);
      else {line(x+40,y+60,x+w-24,y+60,C.line,4);line(x+40,y+77,x+w-52,y+77,C.line,4);}
    }
    function screen(x,y,w,h,title,fill=C.white) {
      rr(x+8,y+9,w,h,18,C.line);rr(x,y,w,h,18,fill,C.black,3);
      line(x,y+49,x+w,y+49,C.black,2);dot(x+24,y+24,5,C.black);dot(x+42,y+24,5,C.line);
      label(title,x+67,y+33,22,C.black,700);
    }
    function task(x,y,w,phase,amount=0.58) {
      rr(x,y,w,119,15,C.black);txt('本期项目',x+24,y+35,27,C.white,750);
      label(phase,x+24,y+68,23,'#C9B3FF');rr(x+24,y+87,w-48,8,4,'#3B3B44');
      rr(x+24,y+87,(w-48)*amount,8,4,C.purple);
    }
    function hero(slug,title,sub) {
      const a=H.assets[slug];headline(title);
      rr(488,284,1290,500,20,C.paper,C.line,2);
      if(a && a.hero) img(a.hero,508,298,1250,474,'contain',12);
      label(sub,492,824,26,C.muted,500);
    }
    function cropAsset(slug,source,x,y,w,h) {
      const a=H.assets[slug];
      if(!a) return;
      // Official Qwen SVG contains foreignObject blur layers: its faithful PNG avoids Canvas taint.
      const key=slug==='qwen'?'assets/qwen-hero-safe.png':a.hero;
      const im=H.images&&H.images[key];
      if(!im) {img(key,x,y,w,h,'contain',10);return;}
      const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
      const [sx,sy,sw,sh]=source;
      const rw=Math.min(sw,iw-sx),rh=Math.min(sh,ih-sy),k=Math.min(w/rw,h/rh);
      ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.clip();
      ctx.drawImage(im,sx,sy,rw,rh,x+(w-rw*k)/2,y+(h-rh*k)/2,rw*k,rh*k);ctx.restore();
    }
    function materialFrame(slug,x,y,w,h,caption=true) {
      rr(x+7,y+8,w,h,18,C.line);rr(x,y,w,h,18,C.white,C.line,2);
      cropAsset(slug,material[slug].rect,x+11,y+11,w-22,h-22);
      if(caption) label('官方素材局部',x,y+h+34,23,C.muted,600);
    }
    function materialIntro(slug) {
      const m=material[slug];headline(m.title);
      materialFrame(slug,488,293,1290,478,false);
      note(m.sub);
    }
    function materialProof(slug,target,end) {
      if(t<materialEnd[slug]||t>=end)return;
      const q=smooth(clamp((t-materialEnd[slug])/.48));
      materialFrame(slug,mix(488,target[0],q),mix(293,target[1],q),mix(1290,target[2],q),mix(478,target[3],q),q>.95);
    }
    ctx.save();
    // The parent owns the full-frame stage, presenter, product navigation and subtitles.
    ctx.beginPath();ctx.rect(426,178,1400,691);ctx.clip();
    if(ch.id === 'trae') {
      if(t < materialEnd.trae) {materialIntro('trae');ctx.restore();return;}
      tag();
      const crossDevice=has('cross-device'), quota=has('quota'), queue=has('rules-queue');
      headline(quota?'活干到一半，额度先归零':queue?'修改还在继续，规则先变了':crossDevice?'同一个项目，换个入口接着做':has('history')?'资料、代码、页面，都留在项目里':'办公 · 代码 · 设计 → 同一工作区');
      if(!crossDevice) {
        const gather=smooth(clamp((t-materialEnd.trae)/.48));
        rr(885,335,630,383,26,C.black);
        txt('项目 A',923,381,38,C.white,800);
        label('同一工作区',923,420,25,'#BDBDC6');
        ['办公','代码','设计'].forEach((s,i)=>{
          const sx=[520,1030,1535][i], sy=[357,600,357][i];
          const x=mix(sx,925+i*180,gather),y=mix(sy,464,gather);
          rr(x,y,150,135,15,i===1?C.purple:C.white);
          txt(['DOC','</>','Aa'][i],x+75,y+54,38,i===1?C.white:C.black,850,'center');
          txt(s,x+75,y+103,25,i===1?C.white:C.black,650,'center');
        });
        withAlpha(p('history'),()=>{
          ['资料.pdf','页面.tsx','修改记录'].forEach((s,i)=>{
            const q=smooth(p('history',.4,i*.06));
            file(move(650,520,q),458+i*108,286,88,s,i===2?C.black:C.purple);
            arrow(817,501+i*108,881,501+i*82,C.purple,3);
          });
          label('历史跟着项目走',940,672,31,C.white,700);
        });
        note('一份项目承接资料、代码、页面与历史');
        materialProof('trae',[472,368,370,220],at('history'));
      } else {
        const relay=smooth(p('cross-device'));
        screen(474,347,565,365,'桌面端');screen(1160,347,605,365,'网页端');
        rr(700,712,116,25,3,C.black);rr(620,737,275,12,5,C.black);
        arrow(1064,505,1136,505,C.purple,5);
        const tx=mix(543,1224,relay);
        task(tx,451,475,quota?'额度不足 · 已暂停':queue?'排队等待':has('revision')?'修改第 2 版':'接续当前进度',quota?.58:has('revision')?.72:.58);
        withAlpha(relay,()=>{label('同一项目 A',1235,630,28,C.black,750);tick(1692,609,C.purple,.8);});
        withAlpha(p('revision'),()=>{
          rr(1230,576,420,35,6,C.paper);label('修改记录 01 → 02',1245,602,22,C.muted);
        });
        if(queue) {
          const q=p('rules-queue');
          withAlpha(q,()=>{
            rr(507,419,500,234,14,C.paper);
            label('积分余额',535,461,27,C.black,650);
            const drain=quota?smooth(p('quota')):0;
            txt(String(Math.round(mix(36,0,drain))),535,548,76,quota?C.purple:C.black,850);
            rr(663,493,286,14,7,C.line);rr(663,493,286*(1-drain),14,7,C.purple);
            label(quota?'余额耗尽':'排队 · 计费 · 规则',535,609,26,C.muted);
          });
        }
        if(quota) {line(1458,542,1458,574,C.purple,7);line(1475,542,1475,574,C.purple,7);}
        note(quota?'任务进度停住，接力链路也被切断':'桌面 → 网页：交接的是同一个任务');
      }
    } else if(ch.id === 'openclaw') {
      if(t < at('remote')) {hero('openclaw','OpenClaw · 小龙虾','官方品牌宣传图 · 非软件操作界面');ctx.restore();return;}
      tag();
      const setup=has('setup'), broken=has('maintenance'), ordinary=has('ordinary-user');
      headline(ordinary?'最后，维护工作回到你手里':broken?'一处故障，整条链路停住':setup?'能力跑起来之前，要先自己装好':has('common')?'远程、定时，逐渐成为常见能力':'手机发指令，电脑接着干活');
      const collapse=smooth(p('setup'));
      const phoneX=move(500,455,collapse),pcX=move(1040,1045,collapse);
      rr(phoneX,333,259,430,30,C.black);rr(phoneX+13,349,233,397,22,C.white);
      rr(phoneX+85,360,88,13,6,C.black);
      label('手机消息',phoneX+34,418,26,C.black,750);
      rr(phoneX+28,458,204,90,12,C.purple);txt('把任务跑完',phoneX+45,495,25,C.white,750);
      label('远程指令',phoneX+45,529,20,C.white);
      rr(phoneX+28,576,204,71,10,C.paper);label('已发送',phoneX+49,620,24,C.muted);
      screen(pcX,361,703,339,'你的电脑',C.black);
      rr(pcX+250,700,200,27,4,C.black);rr(pcX+195,728,310,12,6,C.black);
      if(!setup) {
        arrow(791,516,1000,516,C.purple,5);
        const q=smooth(p('remote',.55));dot(mix(797,992,q),516,12,C.purple);
        task(pcX+57,458,588,'定时执行 · 持续运行',.76);
        label('24 h',pcX+60,657,49,C.white,850);
        if(has('common')) {
          withAlpha(p('common'),()=>{
            ['远程调用','定时任务','结果回传'].forEach((s,i)=>pill(s,800+i*310,275,280,49,C.paper,C.black,26));
            label('这些能力不再稀缺',825,794,34,C.purple,800);
          });
        }
      } else {
        ['模型','API','插件'].forEach((s,i)=>{
          const q=smooth(p('setup',.44,i*.045));
          const x=move(720+i*80,800,q),y=move(480,350+i*130,q);
          rr(x,y,191,99,12,broken&&i===1?C.white:C.black,broken&&i===1?C.purple:C.black,3);
          txt(s,x+95,y+60,33,broken&&i===1?C.purple:C.white,800,'center');
          line(x+191,y+50,pcX,y+50,broken&&i===1?C.line:C.purple,4);
          if(broken&&i===1) {cross(x+144,y+14,.7,C.purple);}
        });
        txt(broken?'任务中断':'等待接通',pcX+351,508,48,broken?C.purple:C.white,850,'center');
        label(broken?'检查模型 / 密钥 / 插件':'把零件逐一接入',pcX+351,572,29,'#C5C5CF');
        if(ordinary) {
          withAlpha(p('ordinary-user'),()=>{
            rr(1175,610,473,65,12,C.white);label('待你处理：修复并重启',1200,654,28,C.black,750);
            arrow(1151,640,1090,640,C.purple,4);
          });
        }
      }
      note(setup?'装配、排障、维护成本，由使用者承担':'消息触发任务；场景动画为功能讲解');
    } else if(ch.id === 'kimi') {
      if(t < materialEnd.kimi) {materialIntro('kimi');ctx.restore();return;}
      tag();
      const slower=has('not-300-speed'), lag=has('lag'), thinking=has('thinking'), broken=has('broken-code'), restore=has('restore-yourself');
      headline(restore?'原版恢复，又交回给使用者':broken?'同一份代码，改完却跑不起来':thinking?'任务仍停在“思考中”':lag?'更多单元，挤过同一段上下文':slower?'300 个 Agent ≠ 300 倍效率':has('database')?'并发分工，汇入一份研究结果':'300 个小单位，聚合一项任务');
      if(!broken) {
        const intro=smooth(clamp((t-materialEnd.kimi)/.48));
        const tight=smooth(p('lag'));
        for(let i=0;i<300;i++) {
          const col=i%20,row=Math.floor(i/20);
          const x=move(498+col*40,650+col*17,tight),y=move(338+row*26,378+row*18,tight);
          const appear=clamp(intro*1.1-i/300*.1);
          withAlpha(appear,()=>rr(x,y,move(24,11,tight),move(15,10,tight),3,i%7===0?C.purple:C.black));
        }
        label('20 × 15 = 300',500,779,31,C.black,800);
        const pipeline=has('database');
        if(pipeline) {
          const q=smooth(p('database'));
          arrow(1330,490,1425,490,C.purple,5);
          withAlpha(q,()=>{
            file(1450,385,320,214,'研究报告',C.purple,'投研 / 论文');
            label('资料 → 分析 → 汇总',1380,680,28,C.muted);
          });
        }
        if(slower) {
          withAlpha(p('not-300-speed'),()=>{
            rr(1331,295,450,81,12,C.white);
            txt('≠ 300×',1351,357,61,C.purple,850);
          });
        }
        if(lag) {
          rr(1033,368,52,301,8,C.black);
          rr(1023,490,72,36,4,C.white);
          label('上下文',1008,724,29,C.black,800);
          for(let i=0;i<7;i++) rr(1110+i*31,497,20,20,3,i<2?C.purple:C.line);
          label('处理瓶颈',1121,597,31,C.purple,800);
          if(thinking) {
            rr(1428,621,349,83,12,C.black);
            txt('思考中…',1451,673,38,C.white,800);
            // A single landing movement, then a deliberate hold. No spinning loader.
            rr(1447,692,310,5,2,'#383840');rr(1447,692,move(28,90,p('thinking')),5,2,C.purple);
          }
        }
        note('数量是分工规模，不能直接当作效率倍数');
        materialProof('kimi',[1370,404,410,226],at('database'));
      } else {
        const x=598,y=336,w=1054,h=388;
        screen(x,y,w,h,'project / app.tsx',C.black);
        const lines=['function buildReport(data) {','  const result = analyze(data);','  return result.rows.map(render);','}'];
        lines.forEach((s,i)=>{
          if(i===2) rr(x+87,y+187,w-126,48,5,restore?'#33313D':'#6C2948');
          txt(String(i+1),x+27,y+114+i*55,25,'#777780',500);
          txt(s,x+91,y+114+i*55,30,i===2?'#D9C8FF':'#E5E5EA',550);
        });
        rr(x+28,y+306,w-56,58,9,restore?C.paper:C.purple);
        txt(restore?'请找回之前的版本':'运行失败：报告未生成',x+50,y+345,30,restore?C.black:C.white,750);
        if(restore) {
          const q=smooth(p('restore-yourself'));
          file(move(1330,477,q),move(485,687,q),320,108,'原版文件',C.purple,'恢复动作交回用户');
          arrow(1138,766,836,766,C.purple,5);
        }
        if(has('promise-reality')) {
          withAlpha(p('promise-reality'),()=>pill('承诺  ≠  落地',1249,757,457,64,C.black,C.white,35));
        }
        note('代码修改与恢复动作均为讲解示意');
      }
    } else if(ch.id === 'cursor') {
      if(t < at('editor')) {
        const q=smooth(p('models'));
        headline(has('models')?'同一个编辑器，容纳不同模型':'Cursor · 先看真实工作区');
        const x=488,y=300,w=mix(1290,910,q),h=472;
        rr(x+7,y+8,w,h,18,C.line);rr(x,y,w,h,18,C.white,C.line,2);
        // 1600 × 1000 official page: crop the Desktop work area, exclude site navigation.
        const source=[mix(260,260,q),mix(367,395,q),mix(1080,560,q),mix(403,340,q)];
        cropAsset('cursor',source,x+10,y+10,w-20,h-20);
        if(has('models')) withAlpha(q,()=>{
          label('稿中提到的模型',1430,340,25,C.muted,650);
          ['Claude','GPT','Gemini','自有模型'].forEach((s,i)=>pill(s,1430,369+i*87,337,66,i===0?C.purple:C.black,C.white,33));
        });
        note('官网 Desktop 展示区局部 · 静态官方素材，非实操录屏');
        ctx.restore();return;
      }
      tag();
      const editor=has('editor'), request=has('request'), changing=has('find-change-run'), diff=has('diff'), undo=has('undo'), own=has('own-model');
      headline(has('beginner-editor')?'把编程操作收进一个编辑器':own?'模型选择，仍要匹配任务':undo?'同一处修改，一键撤回':diff?'改在哪里，看得见':changing?'找文件 → 改代码 → 跑命令':request?'打开项目，直接提需求':editor?'文件、模型、命令，集中在同一处':'从同一个入口，选择不同模型');
      const x=478,y=316,w=1300,h=455;
      screen(x,y,w,h,'PROJECT / 编辑器工作流',C.black);
      rr(x+18,y+65,252,h-84,8,'#19191F');
      ['项目 A','  src/','  app.tsx','  utils.ts','  package.json'].forEach((s,i)=>{
        if(i===2&&changing) rr(x+30,y+146,225,43,5,C.purple);
        txt(s,x+37,y+101+i*46,25,i===2&&changing?C.white:'#BDBDC8',i===0?750:500);
      });
      line(x+285,y+65,x+285,y+h-18,'#41414A',2);
      const models=['Claude','GPT','Gemini','自有模型'];
      models.forEach((s,i)=>{
        const selected=i===0&&!own||i===3&&own;
        pill(s,x+316+i*225,y+71,207,49,selected?C.purple:'#2A2A32',C.white,25);
      });
      if(!editor) {
        label('同一个项目，自由切换模型',x+337,y+229,40,C.white,800);
        line(x+337,y+257,x+1216,y+257,'#48484F',3);
        label('模型承担推理，编辑器承接操作',x+337,y+320,29,'#BDBDC8');
      } else {
        const changed=changing&&!undo;
        const code=['const project = open("project-a");',changed?'const output = await agent.run(task);':'const output = run(task);','render(output);'];
        code.forEach((s,i)=>{
          const yy=y+188+i*49;
          if(i===1&&changing) rr(x+314,yy-34,938,45,5,undo?'#24242C':diff?'#40412B':'#282035');
          txt(String(i+1),x+314,yy,24,'#7B7B87',500);
          txt(s,x+356,yy,28,i===1&&diff&&!undo?'#DADBA8':'#D6C3FF',550);
        });
        rr(x+313,y+320,943,105,9,'#202027');
        label(request?'需求：让这个任务自动完成':'终端与任务区',x+333,y+356,25,C.white,650);
        label(changing?undo?'已撤回到修改前':'$ run project   →  执行完成':'等待输入',x+333,y+397,26,undo?'#B9A2ED':'#A3A3B0',600);
        if(diff&&!undo) pill('+ 修改高亮',x+1041,y+269,213,44,C.purple,C.white,24);
        if(undo) {
          const q=smooth(p('undo'));
          pill('↶ 撤回',x+1041,y+269,213,44,C.white,C.black,26);
          withAlpha(q,()=>{line(x+370,y+248,x+1036,y+248,C.purple,4);});
        }
      }
      note('代码与操作为讲解示意；真实产品页面在本段开头展示');
    } else if(ch.id === 'qwen') {
      if(t < materialEnd.qwen) {materialIntro('qwen');ctx.restore();return;}
      tag();
      const gathered=has('chat-office-web'), connected=has('internal-tools'), team=has('team'), membership=has('memberships');
      headline(membership?'少几份单独订阅，少几次来回切换':team?'团队在同一处接着协作':connected?'内部办公工具，也接进来':gathered?'聊天、Office、网页，围绕同一项工作':'把分散的能力，收进一个工作台');
      const q=smooth(clamp((t-materialEnd.qwen)/.48));
      const cx=1100,cy=520;
      rr(820,331,626,403,25,C.black);
      logo('qwen',850,353,48);txt('工作台',920,389,36,C.white,800);
      label('同一份任务',861,441,26,'#C3C3CC');
      const nodes=[{s:'聊天',icon:'Aa',x:489,y:341},{s:'Office',icon:'W / X',x:1500,y:342},{s:'网页',icon:'www',x:1500,y:653}];
      nodes.forEach((n,i)=>{
        const x=mix(n.x,856+i*182,q),y=mix(n.y,480,q);
        rr(x+5,y+6,160,151,13,C.line);rr(x,y,160,151,13,C.white);
        txt(n.icon,x+80,y+61,i===1?32:39,C.black,850,'center');
        txt(n.s,x+80,y+118,29,C.black,750,'center');
      });
      withAlpha(p('chat-office-web'),()=>{
        rr(855,663,557,44,7,C.purple);txt('资料 → 处理 → 交付',1133,695,27,C.white,750,'center');
      });
      if(connected) {
        ['内部文档','团队系统'].forEach((s,i)=>{
          const z=smooth(p('internal-tools',.45,i*.04));
          const x=move(480,491,z),y=395+i*157;
          rr(x,y,252,106,12,C.paper,C.black,2);
          txt(s,x+126,y+61,31,C.black,750,'center');
          line(x+252,y+53,820,y+53,C.purple,4);
          dot(move(x+263,804,z),y+53,8,C.purple);
        });
      }
      if(team) {
        const z=smooth(p('team'));
        [0,1,2].forEach(i=>{
          const x=move(1790,1541+i*82,z);
          dot(x,450,22,i===1?C.purple:C.black);
          rr(x-27,480,54,54,17,i===1?C.purple:C.black);
        });
        label('共同工作',1512,584,31,C.black,800);
        arrow(1482,626,1739,626,C.purple,4);
      }
      if(membership) {
        withAlpha(p('memberships'),()=>{
          rr(1481,675,307,94,12,C.paper);
          txt('多入口 → 一处',1635,733,32,C.purple,850,'center');
        });
      }
      note('围绕同一项工作汇合，减少工具间搬运');
      materialProof('qwen',[1480,368,310,200],at('chat-office-web'));
    }
    ctx.restore();
  }
  window.BodyB = {draw};
})();
