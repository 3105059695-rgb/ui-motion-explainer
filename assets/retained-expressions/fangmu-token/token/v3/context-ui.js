/* Neutral digital workflows. All text is original illustrative content.
 * API: ContextUIV3.draw(ctx, absoluteSeconds, scene, helpers).
 * Main content stays above y=850 and to the right of the presenter region.
 */
(() => {
  'use strict';
  const K='#17181B',W='#FAFAF8',L='#D6C2FF',G='#F1EFF4',M='#706B78',B='#DDD9E3';
  const cl=x=>Math.max(0,Math.min(1,x)),mix=(a,b,p)=>a+(b-a)*p;
  const P=(t,a,b)=>{let x=cl((t-a)/Math.max(.001,b-a));return x*x*x*(10-15*x+6*x*x)};
  const cue=(s,k,f)=>s.cues?.[k]??f;
  function txt(c,s,x,y,n=32,o={}){c.save();c.font=`${o.weight??550} ${n}px ${o.en?'EN':'CN'},sans-serif`;c.fillStyle=o.color??K;c.textAlign=o.align??'left';c.textBaseline='middle';c.globalAlpha*=o.alpha??1;c.fillText(s,x,y);c.restore()}
  function rr(c,x,y,w,h,r,fill,stroke){if(w<=0||h<=0)return;c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}}
  function line(c,x,y,xx,yy,color=B,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
  function alpha(c,a,fn){if(a<=.001)return;c.save();c.globalAlpha*=cl(a);fn();c.restore()}
  function clip(c,x,y,w,h,fn){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();fn();c.restore()}
  function para(c,s,x,y,w,n=31,lh=45,o={}){c.save();c.font=`${o.weight??550} ${n}px CN,sans-serif`;let row='',r=0;for(const ch of s){if(ch==='\n'||c.measureText(row+ch).width>w){txt(c,row,x,y+r*lh,n,o);row=ch==='\n'?'':ch;r++;}else row+=ch;}if(row)txt(c,row,x,y+r*lh,n,o);c.restore();return y+(r+1)*lh;}
  function typed(c,s,x,y,w,t,a,d,n=31,lh=45,o={}){const q=cl((t-a)/d);para(c,s.slice(0,Math.ceil(s.length*q)),x,y,w,n,lh,o);}
  function check(c,x,y,p=1,color=K){if(p<=0)return;c.save();c.strokeStyle=color;c.lineWidth=3.5;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x-9,y);if(p<.35)c.lineTo(mix(x-9,x-2,p/.35),mix(y,y+7,p/.35));else{c.lineTo(x-2,y+7);c.lineTo(mix(x-2,x+13,(p-.35)/.65),mix(y+7,y-10,(p-.35)/.65));}c.stroke();c.restore()}
  function cursor(c,x,y,press=0){c.save();c.translate(x,y);c.scale(1-press*.08,1-press*.08);c.beginPath();c.moveTo(0,0);c.lineTo(0,31);c.lineTo(9,22);c.lineTo(17,38);c.lineTo(24,35);c.lineTo(16,19);c.lineTo(30,18);c.closePath();c.fillStyle=K;c.fill();c.strokeStyle='#FFFFFF';c.lineWidth=2.3;c.stroke();c.restore()}
  function pill(c,label,x,y,w,fill=G,color=K,size=27){rr(c,x,y,w,42,11,fill);txt(c,label,x+w/2,y+21,size,{align:'center',color,weight:600})}
  function bg(c){c.fillStyle=W;c.fillRect(0,0,1920,1080)}
  function headline(c,s,alphaValue=1){txt(c,s,1142,101,61,{align:'center',weight:800,alpha:alphaValue})}
  function windowFrame(c,label,sub='',active=''){
    c.save();c.shadowColor='#22192B12';c.shadowBlur=36;c.shadowOffsetY=14;rr(c,442,166,1412,675,19,'#FFFFFF');c.restore();
    rr(c,442,166,1412,675,19,null,B);rr(c,442,166,1412,72,19,'#F4F3F5');rr(c,442,212,1412,26,0,'#F4F3F5');
    txt(c,label,477,202,34,{weight:730});if(sub)txt(c,sub,945,202,27,{color:M,weight:500});txt(c,'界面示意',1818,202,25,{align:'right',color:M});line(c,442,238,1854,238);
  }
  function fileIcon(c,x,y){rr(c,x,y,29,37,3,'#F6F1EC','#C9BCB0');line(c,x+7,y+11,x+21,y+11,'#887A6A',2);line(c,x+7,y+18,x+21,y+18,'#887A6A',2);line(c,x+7,y+25,x+17,y+25,'#887A6A',2)}
  const pages=[
    {title:'01 Token 是什么',subtitle:'基本单位',lines:['模型处理文字时，','会先将内容拆成片段。','Token 不固定等于','一个汉字或一个单词。'],excerpt:'Token 不固定等于一个汉字或一个单词。'},
    {title:'02 计量读写用量',subtitle:'输入与输出',lines:['问题和资料属于输入。','模型生成的回答是输出。','两类用量可以分别统计，','收费按相应规则计算。'],excerpt:'输入与输出是两类用量，需要分别统计。'},
    {title:'03 上下文与资料',subtitle:'当前工作空间',lines:['问题、历史和参考资料，','占用本次可用的空间。','还要为接下来的回答，','预留足够的可用位置。'],excerpt:'还要为接下来的回答，预留足够的可用位置。'}
  ];
  function thumb(c,index,x,y,selected){rr(c,x-7,y-6,103,132,7,selected?'#E9DDF7':'#F4F3F5',selected?'#BA9ADC':B);rr(c,x+9,y+7,72,98,1,'#FFFFFF','#E2DEE5');txt(c,String(index+1).padStart(2,'0'),x+15,y+24,15,{en:true,color:'#625B6B'});for(let k=0;k<5;k++)line(c,x+18,y+41+k*9,x+64-(k%2)*8,y+41+k*9,k===0?'#BDA4D8':'#D2CDD9',2);txt(c,String(index+1),x+43,y+120,20,{align:'center',color:M})}
  function pageView(c,index,x,y,w,h,selection=0){
    const p=pages[index];rr(c,x+4,y+7,w,h,2,'#E5E1E8');rr(c,x,y,w,h,1,'#FFFEFA','#DAD5DD');
    txt(c,'TOKEN  ·  入门资料',x+32,y+31,20,{color:M,weight:600});line(c,x+32,y+53,x+w-32,y+53,'#D8D3DC',1);
    txt(c,p.title,x+32,y+91,31,{weight:750});txt(c,p.subtitle,x+32,y+139,24,{color:M});
    p.lines.forEach((s,j)=>{if(j>=2)rr(c,x+27,y+175+j*47,w-55,39,4,`rgba(205,183,245,${selection*.67})`);txt(c,s,x+32,y+195+j*47,27,{weight:500});});
    txt(c,'示例文档 · 内容节选',x+32,y+h-45,21,{color:'#8D8596',weight:450});txt(c,String(index+1),x+w-35,y+h-44,20,{align:'right',en:true,color:M});
  }
  function p14(c,t,s){
    const choose=cue(s,'它遗漏重点',251.0797),parse=cue(s,'解析',255.5797),search=cue(s,'只检索',257.6797),done=cue(s,'上传成功',261.4797);
    const chosen=P(t,choose-.1,choose+.65),extract=P(t,parse-.3,parse+.55),hit=P(t,search-.15,search+.65),finish=P(t,done,done+.5);
    bg(c);headline(c,finish>.5?'上传成功 ≠ 全文已读':'文件已上传，实际用了哪些内容？');
    windowFrame(c,'Token 入门资料.pdf','PDF 阅读与检索');
    rr(c,443,239,151,601,0,'#F6F5F7');line(c,594,239,594,840);txt(c,'示例页',517,270,25,{align:'center',color:M});
    for(let i=0;i<3;i++)thumb(c,i,478,309+i*151,(chosen>.5?2:0)===i);
    pageView(c,chosen>.5?2:0,626,267,498,535,P(t,choose+.55,choose+1.2));
    line(c,1155,238,1155,840);fileIcon(c,1190,269);txt(c,'上传完成',1232,287,29,{weight:650});check(c,1796,286,1,'#737B69');
    txt(c,'当前问题',1191,350,27,{color:M});rr(c,1188,378,628,68,12,G);txt(c,'回答也需要预留空间吗？',1213,412,34,{weight:650});
    if(extract<.01){txt(c,'文件保留在来源中',1190,522,33,{color:M,weight:550});para(c,'被解析、检索到的内容，才可能成为本次参考。',1190,579,570,31,48,{color:'#938B9D',weight:450});}
    alpha(c,extract,()=>{
      txt(c,hit>.4?'检索结果':'解析文本',1190,490,29,{weight:700});pill(c,'第 3 页',1681,468,135,'#EBE5F2',M,25);
      rr(c,1189,526,627,169,12,hit>.5?'#EEE5F9':'#F7F5F8',hit>.5?'#BBA5D3':B);
      typed(c,pages[2].excerpt,1213,567,570,t,parse-.10,.85,33,49,{weight:580});
      alpha(c,hit,()=>{txt(c,'出处：第 3 页 · 上下文与资料',1214,666,25,{color:'#79688F',weight:550});check(c,1791,550,hit,'#756087');});
      alpha(c,P(t,search+.7,search+1.2),()=>{pill(c,'加入本次参考',1190,732,245,L,K,28);txt(c,'仅选中的段落',1471,753,29,{color:M});});
    });
    const cp=P(t,choose-.4,choose+.3),cx=mix(814,557,cp),cy=mix(469,670,cp);alpha(c,1-P(t,parse-.7,parse-.2),()=>cursor(c,cx,cy,Math.sin(chosen*Math.PI)));
    alpha(c,extract*(1-hit),()=>cursor(c,mix(929,1530,extract),mix(615,599,extract),0));
    alpha(c,hit,()=>cursor(c,mix(1530,1351,P(t,search+.5,search+1.1)),mix(599,754,P(t,search+.5,search+1.1)),0));
    alpha(c,finish,()=>{rr(c,1206,806,594,4,2,L);});
  }
  function editor(c,t,s,opacity){
    const g=cue(s,'目标',285.5459),b=cue(s,'背景',286.4059),r=cue(s,'要求',286.9059),del=cue(s,'减少没必要的重复',287.9259),limit=cue(s,'把关键条件也删了',290.7459);
    const gp=P(t,g-.2,g+.35),bp=P(t,b-.2,b+.35),rp=P(t,r-.2,r+.35),selected=P(t,del,del+.45),removed=P(t,del+.85,del+1.45);
    alpha(c,opacity,()=>{
      txt(c,'同一份提示词',486,281,30,{weight:650});pill(c,'编辑中',1680,258,136,G,M,25);
      rr(c,481,321,1334,418,13,'#FCFBFD',B);
      txt(c,'帮我讲讲 Token。',519,373,44,{alpha:1-gp,weight:650});
      alpha(c,gp,()=>txt(c,'目标：写一段 60 秒 Token 讲解。',519,373,42,{weight:650}));
      alpha(c,bp,()=>typed(c,'背景：读者没有技术基础。',519,446,1200,t,b-.16,.48,38,48));
      alpha(c,rp,()=>{
        typed(c,'要求：先举例，再总结；保留关键限制。',519,519,1200,t,r-.15,.57,38,48);
        txt(c,'限制：不给具体价格，避免技术术语。',519,592,38,{alpha:P(t,r+.03,r+.48)});
      });
      const yy=mix(665,645,removed);alpha(c,(1-removed)*rp,()=>{rr(c,511,yy-27,1063*selected,54,4,'#E3D8EE');txt(c,'讲得通俗一点，通俗易懂一些。',519,yy,38,{color:'#8C8495'});line(c,519,yy,519+795*P(t,del+.4,del+.8),yy,'#766982',3)});
      alpha(c,removed,()=>{check(c,535,686,removed,'#86709F');txt(c,'重复已删，关键条件保留',563,686,31,{color:'#756582',weight:650});});
      txt(c,'目标、背景与要求，都留在正文里',486,793,32,{color:M,alpha:1-P(t,limit,limit+.4)});
      alpha(c,P(t,limit-.2,limit+.5),()=>{rr(c,510,565,1134,52,8,null,'#BBA3D1');txt(c,'省字，也要保留条件',486,793,33,{weight:650,color:'#746080'});});
      const key=P(t,del-.25,del+.35);alpha(c,P(t,283.6,284.1)*(1-P(t,del+1.3,del+1.7)),()=>cursor(c,mix(1268,1420,key),mix(372,665,key),selected*(1-removed)));
    });
  }
  const chapterParagraphs=[
    ['Token 是模型处理文字时使用的基本单位。','一个字，不一定对应一个 Token。'],
    ['输入、历史与回答，','会共同使用可用空间。']
  ];
  function chapters(c,t,s,opacity){
    const a=cue(s,'分章节处理',293.9059),citeAt=cue(s,'保留出处',294.9859),combine=cue(s,'再整合重点',296.1659),cross=cue(s,'涉及跨章节的问题',297.3859),back=cue(s,'还要回头核对',298.8859);
    const second=P(t,cross+.1,cross+.6),cited=P(t,citeAt-.1,citeAt+.45),collected=P(t,combine-.1,combine+.45),verified=P(t,back-.3,back+.45);
    alpha(c,opacity,()=>{
      txt(c,'Token 入门资料',481,280,31,{weight:680});pill(c,'按章节处理',1645,258,170,G,M,24);
      rr(c,462,314,254,503,12,'#F6F5F7');txt(c,'章节',484,349,26,{color:M});
      ['01  基本单位','02  上下文容量'].forEach((v,i)=>{rr(c,477,384+i*91,225,71,9,(second>.5?1:0)===i?'#E3D7F0':'#F6F5F7');txt(c,v,494,420+i*91,28,{weight:(second>.5?1:0)===i?680:500});});
      txt(c,'原文',751,347,27,{color:M});rr(c,742,382,517,381,8,'#FFFEFB','#DED9D0');
      txt(c,second>.5?'第 2 章 · 上下文容量':'第 1 章 · 基本单位',771,427,32,{weight:700});line(c,771,461,1231,461,'#DFDAD1',1);
      const rows=chapterParagraphs[second>.5?1:0];rows.forEach((v,i)=>{rr(c,762,487+i*79,474,66,5,verified>.1?'#E7DCF4':'#F7F5F0');para(c,v,774,520+i*79,456,32,45,{weight:530});});
      txt(c,second>.5?'来源：第 3 页':'来源：第 1 页',771,716,26,{color:M});
      line(c,1284,319,1284,813);txt(c,'整理要点',1316,346,30,{weight:700});
      alpha(c,P(t,a,a+.55),()=>{txt(c,'Token 是基本处理单位。',1317,407,32,{weight:600});alpha(c,cited,()=>pill(c,'第 1 章 · 第 1 页',1317,442,284,'#EDE7F4','#715B8D',25));});
      alpha(c,collected,()=>{txt(c,'输入和回答，共用空间。',1317,551,32,{weight:600});pill(c,'第 2 章 · 第 3 页',1317,587,284,second>.1?L:'#EDE7F4','#715B8D',25);});
      alpha(c,verified,()=>{check(c,1334,721,verified,'#7F6798');txt(c,'已回到原文核对',1363,721,30,{color:'#715E86',weight:650});});
      if(t>cross-.1){const q=P(t,cross-.1,cross+.6);cursor(c,mix(1716,1543,q),mix(749,613,q),Math.sin(q*Math.PI));}
      else if(t>a)cursor(c,676,mix(420,450,P(t,a,a+.5)),0);
    });
  }
  function p16(c,t,s){
    bg(c);const turn=cue(s,'第二',292.2859),ch=P(t,turn-.15,turn+.65);
    headline(c,ch<.5?'先把问题说完整，再删重复':'按章整理，带着出处回查');
    windowFrame(c,'任务编辑器',ch>.5?'资料 / 章节整理':'提示词 / 正文');
    editor(c,t,s,1-ch);chapters(c,t,s,ch);
  }
  const facts=[
    {label:'目标',history:'写一段 60 秒 Token 讲解。',summary:'60 秒讲清 Token',key:'目标',at:303.2517},
    {label:'限制',history:'不报价格，保留关键限制。',summary:'不报价格；保留关键限制',key:'重要约束',at:303.8117},
    {label:'结论',history:'已确认：先用积木举例。',summary:'先用积木举例',key:'结论',at:305.2717},
    {label:'进度',history:'开头已定，接着写正文。',summary:'开头已定，正文待写',key:'进度',at:306.0517}
  ];
  function p17(c,t,s){
    const organize=cue(s,'整理成一份交接总结',306.5717),review=cue(s,'自己检查一下',308.4917),handoff=cue(s,'再放进后续对话',309.4117);
    const gathered=P(t,organize-.2,organize+.55),checked=P(t,review-.15,review+.5),move=P(t,handoff-.05,handoff+.85);
    bg(c);headline(c,move>.5?'带着已确认的信息，继续做':gathered>.5?'摘要要核对，再交给下一次对话':'从长聊天里，留下真正重要的事实');
    windowFrame(c,'任务会话','Token 科普短片');
    line(c,1076,238,1076,840);txt(c,'旧会话',481,278,32,{weight:700});txt(c,move>.5?'新会话':gathered>.5?'交接总结':'待整理要点',1111,278,32,{weight:700});
    alpha(c,1-move*.55,()=>{
      facts.forEach((f,i)=>{const y=327+i*112,q=P(t,cue(s,f.key,f.at)-.15,cue(s,f.key,f.at)+.4);rr(c,478,y,557,91,13,q>.01?'#E9DFF3':'#F4F2F6');txt(c,i===2?'助手':'用户',496,y+23,21,{color:M,weight:650});txt(c,f.history,496,y+60,31,{weight:550});alpha(c,q,()=>{check(c,1008,y+23,q,'#806295');});});
      txt(c,'事实都能在旧聊天中找到',484,809,28,{color:M});
    });
    const shrink=move;const rowH=mix(110,52,shrink),firstY=mix(363,369,shrink),textSize=mix(33,29,shrink);
    if(move>.01)rr(c,1109,322,705,260,13,'#F4F0F8','#D8CCE7');
    facts.forEach((f,i)=>{
      const q=P(t,cue(s,f.key,f.at)+.15,cue(s,f.key,f.at)+.65),y=firstY+i*rowH;
      alpha(c,q,()=>{
        txt(c,f.label,1130,y,28,{color:M,weight:600});
        let value=i===1&&checked<.55?'不给具体价格':f.summary;
        if(i===1&&checked>0&&move<.95)rr(c,1214,y-25,568,51,6,`rgba(205,183,245,${checked*(1-move)*.55})`);
        txt(c,value,1226,y,textSize,{weight:620});
      });
    });
    alpha(c,gathered*(1-move),()=>{rr(c,1117,750,685,58,11,'#F3F0F6');if(checked>.9){check(c,1151,780,checked,'#7C638E');txt(c,'已核对目标、限制和进度',1180,780,28,{color:'#766183',weight:650});}else txt(c,'检查：有没有漏掉原来的条件？',1140,780,30,{color:M});});
    alpha(c,move,()=>{
      txt(c,'已带入交接总结',1141,611,27,{color:'#806692',weight:650});check(c,1776,610,move,'#806692');
      rr(c,1109,653,705,150,13,'#F7F6F8');
      typed(c,'我会保留这些条件，接着写正文。\n先从积木例子过渡到 Token 的含义。',1131,690,653,t,handoff+.92,1.65,31,48,{weight:570});
    });
    const checkMove=P(t,review-.4,review+.05);if(t<review+.65&&t>organize+.2)cursor(c,mix(1757,1664,checkMove),mix(780,firstY+rowH,checkMove),Math.sin(checked*Math.PI));
    alpha(c,P(t,review+.5,review+.8)*(1-move),()=>{pill(c,'放入新会话',1542,749,247,L,K,29);cursor(c,1738,783,0)});
  }
  function draw(c,t,scene,h){const fn={14:p14,16:p16,17:p17}[scene.index];if(!fn)return;c.save();fn(c,t,scene);c.restore();}
  window.ContextUIV3={draw,motionActive:t=>(t>=248.32&&t<264.72)||(t>=280.84&&t<300.28)||(t>=300.28&&t<315.32)};
})();
