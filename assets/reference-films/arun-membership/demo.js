/* Mechanism demonstration only. The material below is explicitly an authored diagram. */
(function(){
  const canvas=document.querySelector('#frame'),ctx=canvas.getContext('2d');
  const D=AgentEditorial.create(ctx,{width:1920,height:1080,fontFamily:'Noto, sans-serif'});
  const objects=[{id:'a',label:'方案 A',detail:'共同目标 · 资料处理',mark:'A'},{id:'b',label:'方案 B',detail:'共同目标 · 资料处理',mark:'B'},{id:'c',label:'方案 C',detail:'共同目标 · 资料处理',mark:'C'}];
  function proof(d,r){
    d.rr(r.x,r.y,r.w,r.h,10,d.C.paper);
    d.text('示意成果 · 资料整理报告',r.x+38,r.y+65,36,d.C.black,800);
    d.text('本示意用来展示展开与聚焦，不代表真实产品测试',r.x+38,r.y+112,22,d.C.muted,500);
    [0,1,2].forEach(i=>{const h=90+i*60,x=r.x+55+i*125;d.rr(x,r.y+r.h-45-h,80,h,10,i===2?d.C.purple:d.C.black);});
    d.text('来源',r.x+r.w*.56,r.y+175,28,d.C.muted,550);
    d.text('处理过程与结果',r.x+r.w*.56,r.y+225,36,d.C.black,800);
    for(let i=0;i<3;i++)d.rr(r.x+r.w*.56,r.y+260+i*37,r.w*.34-i*25,9,4,d.C.line);
  }
  const ranges=[
    {start:0,end:7.3,kind:'objects',title:'先建立对象，再让对应证据展开',objects,events:[{id:'focus',at:2.1,duration:.75},{id:'reveal',at:2.5,duration:.7},{id:'annotate',at:4,duration:.6},{id:'return',at:6.2,duration:.6}],evidence:{title:'对应成果 · 自绘示意',draw:proof}},
    {start:7.3,end:10.5,kind:'dock',title:'总览保留身份，缩成导航继续解释',objects:objects.map(x=>({...x,status:'待比较'})),from:{x:310,y:280,w:1300,h:480},to:{x:1530,y:190,w:280,h:180},next:objects[1]},
    {start:10.5,end:13.6,kind:'quota',title:'用可见变化解释消耗',label:'资源额度 · 示意',events:[{id:'change',at:.3,duration:1.9}],toSeconds:15},
    {start:13.6,end:16.6,kind:'blocked',title:'任务只做到一半，画面真的停住',label:'完成进度 · 示意',events:[{id:'change',at:0,duration:.75},{id:'block',at:.9,duration:.3},{id:'takeover',at:1.5,duration:.6}],blockLabel:'卡住'},
    {start:16.6,end:20,kind:'blackbox',title:'等待之后才打开结果',label:'不可见过程',resultLabel:'等待结束，核对结果',events:[{id:'wait',at:.5,duration:1.1},{id:'open',at:1.8,duration:.7},{id:'result',at:2.1,duration:.6}]},
    {start:20,end:23.8,kind:'independent',title:'独立额度，只改变被讨论的一项',objects:[{id:'text',label:'文字'},{id:'image',label:'图片'},{id:'task',label:'任务'}],focus:2},
    {start:23.8,end:28,kind:'decision',title:'最后用需求连接答案',objects:[{id:'need-a',label:'希望看清具体过程',result:'真实材料'},{id:'need-b',label:'希望理解抽象关系',result:'可见事件'},{id:'need-c',label:'希望判断差异与选择',result:'证据对照'}]}
  ];
  let current=0,playing=false,last=0,state={};
  const draw=t=>{
    current=Math.max(0,Math.min(28,t));ctx.clearRect(0,0,1920,1080);ctx.fillStyle=D.C.white;ctx.fillRect(0,0,1920,1080);
    const chapter=ranges.find(r=>current>=r.start&&current<r.end)||ranges[ranges.length-1];
    state=ArunReference.createScene(chapter)({ctx,D,localTime:current-chapter.start,segment:{events:chapter.events},asset:()=>null});
    D.pill('机制演示',{x:130,y:940,w:200,h:55},{size:23,fill:D.C.purple});D.text('自绘示意材料 / 沿用当前 UI / 无音轨',360,977,25,D.C.muted,550);
    D.text(String(ranges.indexOf(chapter)+1).padStart(2,'0')+' / 07',1790,975,27,D.C.muted,600,'right');
    document.querySelector('#time').value=current;document.querySelector('#label').textContent=current.toFixed(2)+'s';return state;
  };
  const tick=now=>{if(playing){if(last)draw(Math.min(28,current+(now-last)/1000));if(current>=28)playing=false;}last=now;requestAnimationFrame(tick);};
  window.duration=28;window.ready=()=>document.fonts.ready.then(()=>draw(current));window.render=draw;window.seek=draw;window.getState=()=>({time:current,mechanism:state.kind,pose:state,demonstrationOnly:true});
  document.querySelector('#toggle').onclick=()=>{if(current>=28)draw(0);playing=!playing;document.querySelector('#toggle').textContent=playing?'暂停':'播放';last=0;};
  document.querySelector('#time').oninput=e=>{playing=false;draw(+e.target.value);document.querySelector('#toggle').textContent='播放';};
  window.ready();requestAnimationFrame(tick);
})();
