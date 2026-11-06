/* Billing V3 — deterministic, editable concept UI, 1920 × 1080.
 * Request → response → usage → cost. All content is a fictional demonstration.
 * No real service, prices, tokenizer results, or hidden reasoning are invented.
 */
(() => {
  'use strict';
  const C={bg:'#F5F5F3',white:'#FFFFFF',ink:'#19191E',muted:'#797783',line:'#E5E3E9',soft:'#F1EFF5',lav:'#D4C0EF',deep:'#765391',pale:'#EEE6F8',dark:'#15151A'};
  const clamp=v=>Math.max(0,Math.min(1,v));
  const mix=(a,b,p)=>a+(b-a)*p;
  const ease=(t,a,b)=>{const u=clamp((t-a)/Math.max(.001,b-a));return u*u*u*(10-15*u+6*u*u)};
  const at=(s,k,f)=>s.cues?.[k]??f;
  function text(c,s,x,y,z,o={}){c.save();c.globalAlpha*=o.alpha??1;c.fillStyle=o.color??C.ink;c.font=`${o.weight??600} ${z}px ${o.en?'EN, ':''}CN, sans-serif`;c.textAlign=o.align??'left';c.textBaseline='middle';c.fillText(s,x,y);c.restore()}
  function box(c,x,y,w,h,r,fill,stroke){if(w<=0||h<=0)return;c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}}
  function line(c,x,y,x2,y2,color=C.line,w=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke()}
  function group(c,x,y,s,a,fn){if(a<=.001)return;c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=a;fn();c.restore()}
  function clip(c,x,y,w,h,fn,r=0){c.save();c.beginPath();c.roundRect(x,y,w,h,r);c.clip();fn();c.restore()}
  function alpha(c,a,fn){if(a<=.001)return;c.save();c.globalAlpha*=a;fn();c.restore()}
  function shadow(c,fn){c.save();c.shadowColor='#1E15231B';c.shadowBlur=46;c.shadowOffsetY=20;fn();c.restore()}
  function bg(c,dark=0){const v=Math.round(mix(245,21,dark));c.fillStyle=`rgb(${v},${v},${Math.round(mix(243,26,dark))})`;c.fillRect(0,0,1920,1080)}
  function heading(c,title,subtitle='',dark=0,a=1){alpha(c,a,()=>{text(c,title,450,107,64,{weight:780,color:dark>.5?C.white:C.ink});if(subtitle)text(c,subtitle,454,164,27,{weight:450,color:dark>.5?'#BAB4C4':C.muted})})}
  function chrome(c,x=440,y=220,w=1400,h=620,label='API 请求',tab='请求',note='示例界面'){shadow(c,()=>box(c,x,y,w,h,24,C.white));box(c,x,y,w,h,24,C.white,C.line);box(c,x+1,y+1,w-2,66,23,'#FBFAFC');line(c,x,y+66,x+w,y+66);box(c,x+24,y+23,18,18,6,C.lav);text(c,label,x+57,y+33,27,{weight:670});text(c,note,x+w-27,y+33,22,{align:'right',weight:450,color:C.muted});if(tab){const bx=x+w*.52;box(c,bx,y+15,100,36,12,C.pale);text(c,tab,bx+50,y+33,23,{align:'center',color:C.deep,weight:600})}}
  function tag(c,label,x,y,w,fill=C.soft,color=C.muted){box(c,x,y,w,34,10,fill);text(c,label,x+w/2,y+17,21,{align:'center',weight:550,color})}
  function arrow(c,x,y,col=C.ink){line(c,x-11,y,x+11,y,col,3);line(c,x+11,y,x+3,y-8,col,3);line(c,x+11,y,x+3,y+8,col,3)}
  function pointer(c,x,y,t,click=Infinity,a=1){alpha(c,a,()=>{c.save();c.translate(x,y);c.beginPath();c.moveTo(0,0);c.lineTo(0,31);c.lineTo(9,23);c.lineTo(15,36);c.lineTo(22,32);c.lineTo(16,20);c.lineTo(28,18);c.closePath();c.fillStyle=C.ink;c.fill();c.strokeStyle=C.white;c.lineWidth=2;c.stroke();c.restore();const p=ease(t,click,click+.45);if(p>0&&p<1){c.beginPath();c.arc(x+5,y+9,13+26*p,0,Math.PI*2);c.strokeStyle=`rgba(133,93,170,${1-p})`;c.lineWidth=3;c.stroke()}})}
  function check(c,x,y,a=1){alpha(c,a,()=>{line(c,x-8,y,x-1,y+7,C.deep,3);line(c,x-1,y+7,x+12,y-9,C.deep,3)})}
  function caret(c,x,y,h,a=1){alpha(c,a,()=>line(c,x,y-h/2,x,y+h/2,C.deep,3))}
  function typed(c,s,x,y,z,t,a,b,o={}){const p=ease(t,a,b),n=Math.min(s.length,Math.floor(s.length*p)),sub=s.slice(0,n);text(c,sub,x,y,z,o);if(p>0&&p<1){c.save();c.font=`${o.weight??600} ${z}px CN`;const w=c.measureText(sub).width;c.restore();caret(c,x+w+6,y,z)}return p}
  function stream(c,rows,x,y,z,t,a,b,gap=53,col=C.ink){const full=rows.join(''),p=ease(t,a,b);let remaining=Math.floor(full.length*p),cy=y;rows.forEach(row=>{const n=Math.max(0,Math.min(row.length,remaining));if(n>0)text(c,row.slice(0,n),x,cy,z,{color:col,weight:500});if(remaining>=0&&remaining<row.length&&p>0&&p<1){c.save();c.font=`500 ${z}px CN`;const w=c.measureText(row.slice(0,n)).width;c.restore();caret(c,x+w+5,cy,z)}remaining-=row.length;cy+=gap});return p}
  function metric(c,x,y,w,label,p,col=C.lav){text(c,label,x,y,26,{weight:550,color:C.muted});box(c,x+78,y-8,w-78,16,8,C.soft);box(c,x+78,y-8,(w-78)*clamp(p),16,8,col)}
  function docIcon(c,x,y,s=1){group(c,x,y,s,1,()=>{box(c,0,0,31,40,5,'#FFFFFF','#BFB6CB');line(c,8,13,22,13,'#A191B3',2);line(c,8,21,22,21,'#A191B3',2);line(c,8,29,18,29,'#A191B3',2)})}
  function chevron(c,x,y,p=0){const a=p*Math.PI/2;c.save();c.translate(x,y);c.rotate(a);line(c,-4,-7,4,0,C.muted,2);line(c,4,0,-4,7,C.muted,2);c.restore()}
  function tabbar(c,x,y,labels,selected){labels.forEach((label,i)=>{const xx=x+i*168,textColor=i===selected?C.ink:C.muted;text(c,label,xx,y,28,{color:textColor});if(i===selected)line(c,xx,y+26,xx+115,y+26,C.deep,4)})}

  function p06(c,t,s){
    const api=at(s,'API',102.3485),read=at(s,'读取内容',107.5685),write=at(s,'生成内容',108.5085),names=at(s,'输入和输出',112.5485);
    bg(c);const open=ease(t,s.start,s.start+1.10),grow=ease(t,api-.50,api+.95),sent=ease(t,read-.30,read+.35),out=ease(t,write,write+2.1),usage=ease(t,at(s,'都需要计算资源',109.4285),111.03);
    heading(c,'一次请求，怎样计算用量？','从输入内容，到生成回答',0,ease(t,s.start+.1,s.start+.8));
    group(c,mix(82,0,grow),mix(37,0,open),mix(.94,1,grow),open,()=>{
      chrome(c,440,220,1400,620,'API · 请求示意','请求');
      text(c,'请求内容',486,326,32,{weight:700});text(c,'模型响应',1194,326,32,{weight:700});line(c,1142,307,1142,767);
      box(c,477,369,616,216,16,'#FCFBFD',t<read?C.lav:C.line);
      tag(c,'用户消息',500,391,116,C.pale,C.deep);
      typed(c,'请帮我查看订单状态。',500,476,38,t,99.00,101.30);
      const button=sent>.6?'已提交':'发送请求';box(c,878,522,186,45,12,sent>.6?C.soft:C.ink);text(c,button,957,545,23,{align:'center',color:sent>.6?C.muted:C.white,weight:550});if(sent<.6)arrow(c,1040,545,C.white);else check(c,1035,545);
      alpha(c,ease(t,api,api+.75),()=>{text(c,'程序调用接口',497,616,27,{weight:450,color:C.muted});line(c,500,647,1060,647,C.line,2)});
      alpha(c,sent,()=>{tag(c,out>.96?'已生成':'正在生成',1192,371,127,C.pale,C.deep);stream(c,['订单已发出。','可在订单页查看物流。'],1196,454,38,t,write,write+2.08,65);});
      const hilite=ease(t,read,read+.30)*(1-ease(t,read+.6,read+1.15));alpha(c,hilite,()=>box(c,497,450,549,55,9,'#D4C0EF42'));
      alpha(c,usage,()=>{line(c,478,689,1800,689);metric(c,489,737,572,'读取',sent*.82);metric(c,1195,737,565,'生成',out*.73);text(c,'输入',489,791,34,{alpha:ease(t,names,names+.45),weight:720});text(c,'输出',1195,791,34,{alpha:ease(t,at(s,'输出',113.3085),113.70),weight:720})});
      const ptr=ease(t,read-1.2,read-.5)*(1-ease(t,read+.48,read+.85));pointer(c,mix(1077,1003,ease(t,read-1.1,read-.2)),mix(612,548,ease(t,read-1.1,read-.2)),t,read,ptr);
      alpha(c,ease(t,at(s,'用量和费用',105.8085),106.28)*(1-usage),()=>{text(c,'Token 计量',1195,690,34,{weight:650});text(c,'读入与生成，都消耗计算',1195,741,27,{weight:450,color:C.muted})});
    });
  }

  function p07(c,t,s){
    bg(c);const expand=ease(t,114.15,115.2),docs=ease(t,at(s,'它还可能包含本次请求带上的资料',117.2395),119.3),history=ease(t,at(s,'历史对话',119.9595)-.20,120.58),system=ease(t,at(s,'系统指令',120.7995)-.18,121.54),output=at(s,'输出 Token',122.3195),reason=ease(t,at(s,'有些推理模型',125.5795),126.46),hidden=ease(t,at(s,'看不到的推理部分',127.6195),128.42);
    heading(c,'一次输入，不只是一句问题','展开本次请求，看到带上的内容');
    chrome(c,440,220,1400,620,'API · 同一次请求','请求');
    const divider=mix(1142,1272,expand);line(c,divider,307,divider,805);
    text(c,'本次输入',484,326,32,{weight:720});text(c,'生成回答',1311,326,32,{weight:720});
    text(c,'用户消息',489,376,25,{color:C.muted,weight:500});text(c,'请帮我查看订单状态。',489,421,37);
    const docY=462,docH=140*docs;alpha(c,docs,()=>{
      box(c,484,docY,750,docH,13,C.soft);docIcon(c,504,477,.72);text(c,'订单资料.txt',542,493,27,{weight:650});chevron(c,1208,493,1);clip(c,499,519,715,Math.max(1,docH-61),()=>{text(c,'订单状态：已发出',509,537,31,{weight:500});text(c,'物流入口：订单详情页',509,578,31,{weight:500})});
    });
    const hy=docY+docH+22;alpha(c,history,()=>{text(c,'历史对话',490,hy+12,25,{weight:500,color:C.muted});text(c,'用户：周五前能收到吗？',490,hy+55,33,{weight:500})});
    const sy=hy+94*history;alpha(c,system,()=>{text(c,'系统指令',490,sy+14,25,{weight:500,color:C.muted});text(c,'不承诺具体送达时间。',490,sy+56,33,{weight:500});});
    const extra=ease(t,117.16,117.68)*(1-ease(t,118.0,118.5));pointer(c,1210,337,t,117.25,extra);alpha(c,1-docs,()=>{text(c,'＋ 添加上下文',1080,326,24,{align:'center',color:C.deep,weight:500})});
    stream(c,['订单已发出。','请在订单页查看物流。','送达时间以物流为准。'],1312,403,32,t,output+.10,125.47,57);
    alpha(c,ease(t,output,output+.55),()=>{line(c,1312,584,1798,584);text(c,'输出用量',1312,627,27,{weight:500,color:C.muted});box(c,1464,618,310,16,8,C.soft);box(c,1464,618,310*.82*ease(t,output+.1,125.47),16,8,C.lav)});
    alpha(c,reason,()=>{
      box(c,1300,681,508,mix(62,128,hidden),14,C.soft);chevron(c,1328,709,hidden);text(c,'推理用量',1351,710,29,{weight:650});text(c,'部分服务',1787,710,23,{align:'right',weight:500,color:C.muted});
      clip(c,1320,742,470,64*hidden,()=>{text(c,'统计与收费按服务商说明',1327,769,29,{weight:500,color:C.deep})});
    });
    pointer(c,1337,709,t,127.6195,ease(t,126.9,127.4)*(1-ease(t,128.1,128.6)));
    alpha(c,ease(t,at(s,'具体统计和收费',128.8595),129.7),()=>{line(c,1329,794,1716,794,C.lav,4)});
  }

  function p08(c,t,s){
    const inp=at(s,'五百个',137.9714),out=at(s,'一千个',140.0914),sum=at(s,'一千五百',142.8714),money=at(s,'算钱的时候',144.3914),same=at(s,'同一个价格',146.8714),split=at(s,'而是输入和输出',147.9314),sep=at(s,'分别',149.7914);
    const inputP=ease(t,at(s,'一共五百个 Token',137.6514),inp+.58),outputP=ease(t,at(s,'生成回答用了一千个 Token',139.0914),out+.66),add=ease(t,at(s,'加起来就是一千五百',141.9914),sum+.62),rate=ease(t,split,split+.85),pricing=ease(t,money-.1,money+.75),dark=ease(t,141.99,143.24);
    bg(c,dark);
    heading(c,'同一次请求的用量','AI 客服 · 假设示例',dark,1-ease(t,money-.36,money-.08));heading(c,'输入和输出，分别算费用','数字是示例；单价留给实际服务规则',dark,ease(t,money+.02,money+.40));
    chrome(c,440,220,1400,620,'API · 用量明细',pricing>.5?'费用':'用量','简化示例');
    const intro=ease(t,132.35,134.05);text(c,'计量项目',492,326,27,{weight:500,color:C.muted});text(c,'Token 数',980,326,27,{weight:500,color:C.muted,align:'right'});
    alpha(c,pricing,()=>text(c,'对应单价',1465,326,27,{align:'center',weight:500,color:C.muted}));line(c,485,357,1798,357);
    const labels=[['输入',421],['输出',557]];
    labels.forEach(([label,y],i)=>{text(c,label,493,y,43,{weight:700});if(i===0)text(c,'本次请求的全部内容',493,y+48,27,{weight:450,color:C.muted});else text(c,'本次生成的回答',493,y+48,27,{weight:450,color:C.muted});});
    line(c,487,494,1795,494);
    alpha(c,intro,()=>{const values=[Math.round(500*inputP),Math.round(1000*outputP)];[421,557].forEach((y,i)=>{text(c,(i===0?inputP:outputP)>.001?String(values[i]):'—',1045,y,96,{align:'right',en:true,weight:700,color:(i===0?inputP:outputP)>.001?C.ink:'#C5C0CD'});});});
    // Numeric identity stays in its row as the price column unfolds.
    alpha(c,rate,()=>{[421,557].forEach((y,i)=>{text(c,'×',1130,y,44,{align:'center'});box(c,1190,y-40,553,83,14,i===0?C.pale:C.soft);text(c,i===0?'输入单价':'输出单价',1467,y,43,{align:'center',weight:650});});});
    const caution=ease(t,same-.3,same+.2)*(1-ease(t,split-.15,split+.22));alpha(c,caution,()=>{text(c,'不可默认同价',1468,489,34,{align:'center',color:C.deep,weight:650});line(c,1264,413,1228,413,C.lav,4);line(c,1228,413,1228,561,C.lav,4);line(c,1228,561,1264,561,C.lav,4)});
    const rise=ease(t,sum,sum+.57);line(c,487,640,1795,640);
    alpha(c,add*(1-ease(pricing,0,.40)),()=>{
      text(c,'500 + 1000',492,711,45,{en:true,weight:700});line(c,830,711,930,711,C.deep,3);arrow(c,928,711,C.deep);text(c,'合计用量',1550,714,32,{align:'center',weight:550,color:C.muted});
    });
    alpha(c,add,()=>text(c,String(Math.round(1500*rise)),mix(1100,764,pricing),mix(714,713,pricing),mix(85,58,pricing),{en:true,weight:700}));
    alpha(c,ease(pricing,.48,1),()=>{text(c,'用量合计',493,712,28,{weight:500,color:C.muted});text(c,'两项费用相加',1490,713,38,{align:'center',alpha:rate,weight:650});});
    const sel=ease(t,sep,sep+.50);alpha(c,sel,()=>{check(c,1767,421);check(c,1767,557);line(c,1190,626,1741,626,C.lav,4)});
    text(c,'仅计算这个例子的输入与输出 · 不展示真实价格',489,801,25,{weight:450,color:C.muted});
    pointer(c,1601,263,t,money,ease(t,money-.8,money-.3)*(1-ease(t,money+.2,money+.8)));
    const inputSweep=ease(t,inp-.35,inp+.15)*(1-ease(t,inp+.5,inp+.95));const outputSweep=ease(t,out-.35,out+.15)*(1-ease(t,out+.5,out+.95));alpha(c,inputSweep,()=>line(c,491,482,1050,482,C.lav,5));alpha(c,outputSweep,()=>line(c,491,619,1050,619,C.lav,5));
  }

  function taskEditor(c,t,s,a=1){
    const longStart=at(s,'跟让它读几十页资料',154.6133),report=at(s,'再写一篇长报告',156.6933),l=ease(t,longStart,longStart+1.1);
    alpha(c,a,()=>{
      chrome(c,440,220,1400,620,'API · 任务内容','请求');text(c,'输入',485,326,32,{weight:720});text(c,'输出',1187,326,32,{weight:720});line(c,1141,307,1141,801);
      alpha(c,1-l,()=>{tag(c,'用户消息',487,372,117,C.pale,C.deep);text(c,'订单到哪了？',490,452,44);stream(c,['订单已发出，','请在订单页查看物流。'],1190,415,36,t,152.3133,154.20,60)});
      alpha(c,l,()=>{
        box(c,480,366,611,366,14,'#FCFBFD',C.line);docIcon(c,499,383,.85);text(c,'客服资料.pdf',546,403,29,{weight:650});text(c,'章节预览',1068,403,23,{align:'right',color:C.muted,weight:450});line(c,499,438,1068,438);
        const scroll=92*ease(t,155.40,158.43);
        clip(c,500,452,561,258,()=>{
          const rows=[['订单与配送',35,700],['订单发出后，可查询物流信息。',28,500],['回复前，先核对当前订单状态。',28,500],['配送时效',35,700],['预计送达时间需以物流信息为准。',28,500],['遇到异常状态，先确认具体原因。',28,500],['客服回复建议',35,700],['清楚说明下一步查询入口。',28,500]];
          rows.forEach((r,i)=>text(c,r[0],509,482+i*53-scroll,r[1],{weight:r[2]}));
          alpha(c,ease(t,155.84,156.3)*(1-ease(t,157.4,157.8)),()=>box(c,505,487,538,46,7,'#D4C0EF50'));
        });box(c,1072,458,5,244,3,C.soft);box(c,1072,460+scroll*.85,5,73,3,'#B7AEC3');
        text(c,'整理为一篇客服流程报告',1190,379,27,{weight:500,color:C.muted});
        const lines=['客服流程报告','一、核对当前订单状态','查询订单记录，并确认物流状态。','二、清楚说明查询入口','引导用户在订单详情查看物流。','三、处理配送异常','先确认异常原因，再给出下一步。'];
        const rp=ease(t,report,159.15),shift=96*ease(t,158.10,159.18);
        clip(c,1184,413,601,292,()=>{stream(c,lines,1191,442-shift,29,t,report,159.15,50)});
        box(c,1790,417,5,286,3,C.soft);box(c,1790,418+shift*.9,5,85,3,'#B7AEC3');
        alpha(c,rp,()=>tag(c,rp>.99?'报告已生成':'正在生成报告',1496,743,225,C.pale,C.deep));
      });
      metric(c,488,791,575,'输入',mix(.20,.87,l));metric(c,1189,791,577,'输出',mix(.13,.88,ease(t,report,159.15)));
      text(c,'相对用量示意',1804,325,21,{align:'right',weight:450,color:C.muted});
    });
  }

  function requestLog(c,t,s,a=1){
    const start=at(s,'做智能客服或者自动化流程',159.3533),daily=at(s,'每天调用',161.7133),cache=at(s,'缓存',166.1333),search=at(s,'搜索',166.5933),detail=ease(t,at(s,'如果还用了缓存',165.4533),166.25),roll=ease(t,start,start+1.0);
    alpha(c,a,()=>{
      chrome(c,440,220,1400,620,'API · 调用记录','用量');
      text(c,'本次调用',489,326,28,{weight:600});text(c,'输入',1023,326,27,{color:C.muted,weight:500});text(c,'输出',1197,326,27,{color:C.muted,weight:500});line(c,485,357,1355,357);line(c,1387,307,1387,800);
      const rows=[['01','订单状态查询',.25,.16],['02','资料整理报告',.88,.82],['03','客服资料.pdf',.81,.33],['04','订单回复建议',.40,.25],['05','客服资料.pdf',.81,.35],['06','批量问题整理',.67,.62]];
      rows.forEach((r,i)=>{
        const q=ease(t,start+.2+i*.54,start+.68+i*.54),y=396+i*66;
        alpha(c,q,()=>{const yy=y+18*(1-q);if(i%2===1)box(c,483,yy-26,872,54,8,'#F8F7FA');text(c,r[0],499,yy,24,{en:true,color:C.muted});text(c,r[1],566,yy,29,{weight:500});box(c,1019,yy-7,137,14,7,C.soft);box(c,1019,yy-7,137*r[2]*q,14,7,C.lav);box(c,1194,yy-7,130,14,7,C.soft);box(c,1194,yy-7,130*r[3]*q,14,7,'#A69AB7');});
      });
      alpha(c,1-ease(t,at(s,'如果还用了缓存',165.4533)-.10,165.6333),()=>{
        text(c,'累计用量',1431,330,32,{weight:700});text(c,'每次调用都计入',1432,389,26,{weight:450,color:C.muted});
        const aggregate=ease(t,start+.2,daily+1.85);text(c,'输入',1431,468,29,{weight:550});box(c,1434,504,333,22,11,C.soft);box(c,1434,504,333*aggregate,22,11,C.lav);text(c,'输出',1431,591,29,{weight:550});box(c,1434,627,333,22,11,C.soft);box(c,1434,627,333*.79*aggregate,22,11,'#AA9FBA');
        text(c,'按实际请求累积',1433,747,26,{weight:450,color:C.muted});
      });
      alpha(c,ease(t,at(s,'如果还用了缓存',165.4533)+.25,166.1533),()=>{
        box(c,1397,300,425,514,13,C.white);text(c,'计费项目',1430,331,33,{weight:700});line(c,1428,363,1785,363);
        text(c,'输入 / 输出',1432,410,31,{weight:650});text(c,'分别按对应规则',1432,453,25,{color:C.muted,weight:450});
        const cp=ease(t,cache,cache+.55),sp=ease(t,search,search+.66);
        alpha(c,cp,()=>{box(c,1422,493,368,105,13,C.pale);text(c,'缓存',1443,523,32,{weight:650});text(c,'重复内容的复用',1443,566,25,{weight:450,color:C.muted})});
        alpha(c,sp,()=>{box(c,1422,616,368,105,13,C.soft);text(c,'搜索等工具',1443,647,32,{weight:650});text(c,'可能另有计费项目',1443,690,25,{weight:450,color:C.muted})});
        text(c,'按服务商规则',1434,769,27,{color:C.deep,weight:650,alpha:ease(t,167.8133,168.40)});
        // The same file name remains in two rows; a reuse link joins them.
        alpha(c,cp,()=>{box(c,556,501,319,49,8,'#D4C0EF35');box(c,556,633,319,49,8,'#D4C0EF35');line(c,906,526,925,526,C.deep,3);line(c,925,526,925,658,C.deep,3);line(c,925,658,906,658,C.deep,3);arrow(c,1269,785,C.deep);text(c,'同一资料，可能复用',986,785,25,{weight:500,color:C.deep})});
      });
      text(c,'示例记录 · 条形仅表示相对用量',491,801,23,{weight:450,color:C.muted});
    });
  }

  function productRules(c,t,s,a){
    const product=at(s,'普通聊天产品',170.6333),free=at(s,'免费额度',172.1933),sub=at(s,'会员订阅',173.6333),p=ease(t,product-.30,product+.8);
    alpha(c,a,()=>{
      chrome(c,440,220,1400,620,'收费方式 · 示意','','按产品说明');
      line(c,1080,309,1080,801);text(c,'API',492,337,51,{en:true,weight:700});text(c,'按调用查看明细',491,402,31,{weight:500,color:C.muted});
      text(c,'输入用量',495,489,31,{weight:550});box(c,716,478,276,19,9,C.soft);box(c,716,478,227,19,9,C.lav);
      text(c,'输出用量',495,575,31,{weight:550});box(c,716,564,276,19,9,C.soft);box(c,716,564,168,19,9,'#B2A6C2');line(c,491,634,1008,634);
      text(c,'各项费用按服务规则',492,688,29,{weight:500,color:C.muted});
      text(c,'普通聊天产品',1130,337,43,{weight:720});text(c,'可能采用不同收费方式',1133,402,29,{weight:450,color:C.muted});
      const f=ease(t,at(s,'有的用免费额度',171.7133),free+.50),m=ease(t,at(s,'有的按会员订阅',173.1133),sub+.54);
      alpha(c,f,()=>{box(c,1121,450,656,102,14,C.soft);text(c,'免费额度',1148,487,37,{weight:650});text(c,'依产品提供的额度使用',1148,527,24,{weight:450,color:C.muted});check(c,1744,499)});
      alpha(c,m,()=>{box(c,1121,576,656,102,14,C.pale);text(c,'会员订阅',1148,614,37,{weight:650});text(c,'按订阅方案提供服务',1148,653,24,{weight:450,color:C.muted});check(c,1744,625)});
      alpha(c,ease(t,at(s,'不是都让你按 Token 单独付钱',174.6533),175.62),()=>{line(c,1127,728,1776,728,C.line,2);text(c,'不一定按 Token 单独付费',1130,778,32,{weight:650,color:C.deep})});
      pointer(c,1438,334,t,product,ease(t,product-.5,product)*(1-ease(t,product+.3,product+.8)));
    });
  }

  function p09(c,t,s){
    const record=at(s,'做智能客服或者自动化流程',159.3533),product=at(s,'至于普通聊天产品',170.2933),log=ease(t,record-.22,record+.7),plans=ease(t,product,product+.90),detail=ease(t,at(s,'如果还用了缓存',165.4533)-.15,165.95);
    const detailStart=at(s,'如果还用了缓存',165.4533);
    bg(c);heading(c,'任务不同，用量也不同','同一个界面，看读入和生成怎样增加',0,1-ease(t,record-.38,record-.10));
    heading(c,'每次调用，都计入用量','从单次请求，到每天的累计',0,ease(t,record+.03,record+.45)*(1-ease(t,detailStart-.30,detailStart-.05)));
    heading(c,'计费项目，按服务规则展开','缓存与工具能力可能分别计量',0,ease(t,detailStart+.03,detailStart+.45)*(1-ease(t,product-.24,product-.02)));
    heading(c,'聊天产品，也可能按订阅收费','产品收费方式，与 API 调用明细分别看',0,ease(t,product+.06,product+.56));
    // Keep the shell in place; old content yields before the next page takes it.
    chrome(c,440,220,1400,620,'','','');
    taskEditor(c,t,s,1-ease(t,record-.22,record+.12));
    requestLog(c,t,s,ease(t,record+.15,record+.70)*(1-ease(t,product,product+.32)));
    productRules(c,t,s,ease(t,product+.34,product+.90));
  }

  function draw(c,t,scene,h){if(scene.index<6||scene.index>9)return;c.save();c.textBaseline='middle';[p06,p07,p08,p09][scene.index-6](c,t,scene);c.restore()}
  window.BillingV3={draw,motionActive:t=>t>=97.56&&t<177.60};
})();
