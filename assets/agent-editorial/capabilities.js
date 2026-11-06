/* Standalone public preview. Uses only local scripts and original vector fixtures. */
(function(){
  'use strict';
  const byId=id=>document.getElementById(id),canvas=byId('stage'),ctx=canvas.getContext('2d');
  const ui={count:byId('count'),duration:byId('duration'),camera:byId('camera'),reveal:byId('reveal'),progress:byId('progress'),seek:byId('seek'),play:byId('play')};
  const labels={
    'material-focus':'真实材料先完整展示，再聚焦行动项，最后回到原来的全局。',
    'input-result':'纸张保留身份，归整之后形成一个可继续补充的结果。',
    'parallel-groups':'对象按负责人归组，数量由当前参数决定；可关闭进度，单独表达分配关系。',
    'compare-change':'同一组对象使用稳定 ID。改一处日期，相关视图同步更新。',
    'presenter-safe':'用原创人物示意验证安全区裁切。制作真人视频时，应换成完整原帧并重新测量人物与字幕区域。'
  };
  let type='material-focus',duration=10,time=0,playing=false,previous=0,scene,spec,ready=false;
  const assets={};
  const load=(id,src)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[id]=im;resolve();};im.onerror=()=>reject(new Error('示意材料无法载入：'+src));im.src=src;});
  const stage={x:0,y:0,w:1920,h:1080},body={x:55,y:45,w:1810,h:980};
  function makeEvent(){
    const n=Math.min(500,Math.max(1,Math.floor(Number(ui.count.value)||3)));
    const common={id:'live-preview',type,at:0,end:duration,rect:body,transition:Math.min(.75,duration*.08)};
    let event;
    if(type==='material-focus') event={...common,title:'从一页纪要中，找到要行动的部分',asset:'minutes',focusCrop:{x:100,y:390,w:1390,h:390},cues:{focus:duration*.25,return:duration*.65,dock:duration*.8},caption:'原创示意纪要 · 可替换为本期截图'};
    if(type==='input-result') event={...common,title:'把讨论，整理成可以继续编辑的待办',inputArea:{x:35,y:160,w:510,h:365},inputs:Array.from({length:n},(_,i)=>({id:'task-'+i,label:['竞品资料','预算意见','设计需求'][i%3]+(n>3?' '+(i+1):''),detail:['补齐对比维度','明确预算上限','确认交付范围'][i%3]})),output:{title:'行动清单',asset:'task-after',rect:{x:675,y:145,w:500,h:400}},cues:{gather:duration*.2,result:duration*.45,revise:duration*.75}};
    if(type==='parallel-groups') event={...common,title:n+' 个对象，按负责人继续推进',groupArea:{x:15,y:175,w:1170,h:n<=6?290:430},objects:Array.from({length:n},(_,i)=>({id:'task-'+i,label:['竞品清单','预算确认','第一版设计'][i%3]+(n>3?' '+(i+1):''),detail:['周一 18:00','周二 12:00','周三 17:00'][i%3],group:'group-'+i%3})),groups:[{id:'group-0',label:'小林 · 资料整理'},{id:'group-1',label:'陈经理 · 预算确认'},{id:'group-2',label:'设计组 · 设计交付'}],cues:{group:duration*.23,run:duration*.43,complete:duration*.8},showProgress:ui.progress.checked};
    if(type==='compare-change'){
      const forms=['task','calendar','reminder'];
      const poses=n===3?[{x:25,y:160,w:500,h:360},{x:560,y:190,w:335,h:300},{x:925,y:225,w:250,h:235}]:null;
      event={...common,title:'改一次日期，关联视图一起更新',stagger:0,comparisonArea:{x:35,y:155,w:1130,h:370},showPrevious:false,before:Array.from({length:n},(_,i)=>({id:'view-'+i,label:['待办','日历','提醒'][i%3]+' · 周三',asset:forms[i%3]+'-before',...(poses?{from:poses[i]}:{})})),after:Array.from({length:n},(_,i)=>({id:'view-'+i,label:['待办','日历','提醒'][i%3]+' · 周四',asset:forms[i%3]+'-after',...(poses?{to:poses[i]}:{})})),cues:{change:duration*.35,compare:duration*.65},summary:'同一事项，保持同一份信息'};
    }
    if(type==='presenter-safe') event={...common,rect:stage,presenter:'presenter',regions:[{x:1040,y:90,w:830,h:770}],protectedRects:[{x:0,y:0,w:1005,h:1080},{x:0,y:900,w:1920,h:180}],overlays:[{id:'safe-proof',type:'material-focus',at:0,end:duration,rect:{x:1040,y:90,w:830,h:770},title:'材料放在这里',asset:'minutes',focusCrop:{x:100,y:390,w:1390,h:390},cues:{focus:duration*.25,return:duration*.65,dock:duration*.8}}]};
    const target=type==='presenter-safe'?event.overlays[0]:event;
    if(ui.camera.checked)target.camera={from:{x:0,y:0,w:1200,h:650},to:{x:240,y:130,w:760,h:412},at:duration*.25,duration:duration*.1,returnAt:duration*.7,returnDuration:duration*.1};
    if(ui.reveal.checked)target.reveal={axis:'x',at:0,duration:duration*.13,bandSize:72};
    return event;
  }
  function render(value=time){
    if(!ready||!scene)return;
    time=Math.min(duration,Math.max(0,value));ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,canvas.width,canvas.height);
    scene({ctx,localTime:time,mediaTime:time,layout:{stage,contentRect:body},asset:id=>assets[id]});
    ui.seek.value=String(time);byId('time').textContent=time.toFixed(2)+' / '+duration+' 秒';
    byId('status').textContent='正在执行 '+scene.capabilityTrace.events.length+' 个能力事件 · '+(type==='presenter-safe'?'保护区外显示材料':'当前画面由参数实时绘制');
  }
  function rebuild(){
    duration=Number(ui.duration.value);ui.seek.max=String(duration);byId('duration-label').textContent=duration+' 秒';
    spec={duration,events:[makeEvent()]};scene=CapabilityRuntime.createScene(spec);
    ui.count.disabled=['material-focus','presenter-safe'].includes(type);ui.progress.disabled=type!=='parallel-groups';
    byId('description').textContent=labels[type];byId('parameters').textContent=JSON.stringify(spec,null,2);time=0;previous=0;render(.03);
  }
  function setPlaying(value){playing=value;previous=0;ui.play.textContent=value?'暂停':'播放';ui.play.setAttribute('aria-label',value?'暂停动画':'播放动画');}
  function select(value){if(!(value in labels))throw new Error('Unknown native preview '+value);type=value;document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===type)));rebuild();}
  document.querySelectorAll('[data-type]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.type)));
  [ui.count,ui.duration,ui.camera,ui.reveal,ui.progress].forEach(input=>input.addEventListener('input',()=>{try{rebuild();}catch(error){byId('status').textContent=error.message;setPlaying(false);}}));
  ui.play.addEventListener('click',()=>setPlaying(!playing));ui.seek.addEventListener('input',()=>{setPlaying(false);render(Number(ui.seek.value));});
  function tick(now){if(ready&&playing){if(previous)time+=(now-previous)/1000;if(time>duration)time=0;render(time);previous=now;}requestAnimationFrame(tick);}
  const fixtures=[load('minutes','capability-preview-minutes.svg'),load('presenter','capability-preview-presenter.svg')];
  for(const kind of ['task','calendar','reminder'])for(const state of ['before','after'])fixtures.push(load(kind+'-'+state,'capability-preview-'+kind+'-'+state+'.svg'));
  const loaded=Promise.all(fixtures).then(()=>{ready=true;rebuild();requestAnimationFrame(tick);return true;}).catch(error=>{byId('status').textContent=error.message;throw error;});
  window.CapabilityPreview={ready:loaded,select,render,rebuild,getState:()=>({type,duration,time,ready,spec,trace:scene?.capabilityTrace})};
})();
