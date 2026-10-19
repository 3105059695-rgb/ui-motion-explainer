/* Paco Vitiello command study: scroll masking, hover commands, and live filtering. */
(function () {
  'use strict';
  const book = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 8c-5-5-9-4-12-2v19c4-2 8-2 12 2 4-4 8-4 12-2V6c-3-2-7-3-12 2ZM16 8v19M8 7v13M23 6v15"/></svg>';
  const component = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="5"/><path d="M7 6a14 14 0 0 1 18 0M6 25a14 14 0 0 1 0-18M25 26a14 14 0 0 1-18 0M26 7a14 14 0 0 1 0 18"/><circle cx="16" cy="2" r="1"/><circle cx="30" cy="16" r="1"/><circle cx="16" cy="30" r="1"/><circle cx="2" cy="16" r="1"/></svg>';
  const search = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="10"/><path d="m21 21 8 8"/></svg>';
  const cursor = '<svg class="pc-cursor" viewBox="0 0 38 46" aria-hidden="true"><path d="M4 3 6 35 14 27 21 41 28 37 21 24 33 23Z" fill="#f0f0f0" stroke="#151515" stroke-width="2.6" stroke-linejoin="round"/></svg>';
  const catalogue = [
    ['docs','Docs','文档','pages',64], ['particles','Particles','粒子','pages',128],
    ['introduction','Introduction','介绍','overview',260], ['get-started','Get Started','快速开始','overview',324],
    ['styling','Styling','样式','overview',388], ['roadmap','Roadmap','路线图','overview',452],
    ['accordion','Accordion','折叠列表','components',584], ['alert','Alert','警告','components',648],
    ['alert-dialog','Alert Dialog','警告对话框','components',712], ['autocomplete','Autocomplete','自动补全','components',776],
    ['avatar','Avatar','头像','components',840], ['badge','Badge','徽章','components',904],
    ['breadcrumb','Breadcrumb','面包屑','components',968], ['button','Button','按钮','components',1032],
    ['card','Card','卡片','components',1096], ['checkbox','Checkbox','复选框','components',1160],
    ['collapsible','Collapsible','折叠容器','components',1224], ['combobox','Combobox','组合框','components',1288],
    ['command','Command','命令面板','components',1352], ['dialog','Dialog','对话框','components',1416],
    ['empty','Empty','空状态','components',1480], ['field','Field','字段','components',1544],
    ['fieldset','Fieldset','字段组','components',1608], ['form','Form','表单','components',1672],
    ['frame','Frame','框架','components',1736], ['group','Group','分组','components',1800],
    ['input','Input','输入框','components',1864], ['input-group','Input Group','输入组合','components',1928],
    ['kbd','Kbd','按键','components',1992]
  ];
  const groups = [['pages','页面',20],['overview','概览',212],['components','组件',536]];
  UIFX.register({
    id:'interaction-command-scroll-filter',title:'命令窗口 · 滚动渐隐与实时筛选',category:'interaction',duration:22,
    source:'https://x.com/pacovitiello/status/2001972145413656601',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2001971521216995328/vid/avc1/1440x1080/P-RFE-YGmj6v_Bzt-optimized.mp4',
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'同一深色命令窗口中滚动文档与组件，上下边缘渐隐；指针悬停同步底部命令，拖动滚动条后输入查询，列表连续收拢成单条匹配。',
    adaptationNotes:'依据9.466667秒1440×1080原片完整主要链，横屏重排为22秒。中文与英文标识并存，镜头幅度、图标、滚动/过滤时序独立编排；未读条目不补造，滚动条几何为观察后的近似。仅显示示例安装命令，不复制、执行或打开真实页面。',
    tags:['Collect UI','Command Bar','Search','Dark Mode','UI Interaction','滚动遮罩','悬停联动','实时筛选'],
    params:{title:'组件文档',prompt:'comm',result:'命令面板'},
    paramLimits:{title:18,prompt:18,result:24,combinedTargetLabel:28}
  },function(c,p){
    const e=c.esc;
    const clean=(value,fallback,limit)=>Array.from(String(value||fallback).replace(/\s+/g,' ').trim()||fallback).slice(0,limit).join('');
    const title=clean(p.title,'组件文档',18),query=clean(p.prompt,'comm',18),result=clean(p.result,'命令面板',24);
    const asciiQuery=/^[a-z]+$/i.test(query);
    const targetLabel=asciiQuery||result.toLocaleLowerCase().includes(query.toLocaleLowerCase())?result:query+' · '+result;
    if(Array.from(targetLabel).length>28)throw Error('Query and result together must fit 28 Unicode characters.');
    const rows=catalogue.map(([key,english,chinese,group,top])=>({
      key,english,group,top,label:key==='docs'?title:key==='command'?targetLabel:chinese,
      search:(key==='docs'?title:key==='command'?targetLabel:chinese)+' '+english+' '+(key==='command'?query:'')
    }));
    c.root.innerHTML=`<style>
      .pc-scene{background:#0b0b0c;color:#ececec;font-family:ProjectSans,sans-serif;isolation:isolate}.pc-scene *{box-sizing:border-box}
      .pc-backdrop{position:absolute;inset:0;background:radial-gradient(ellipse at 52% 20%,#2929294d,transparent 60%),linear-gradient(#0c0c0d,#111112);overflow:hidden}
      .pc-document{position:absolute;left:280px;top:80px;width:1380px;height:1000px;opacity:.17;filter:blur(12px)}
      .pc-document-head{font-size:36px;margin-bottom:52px}.pc-document-lines{display:grid;gap:32px}.pc-document-lines i{display:block;height:20px;border-radius:5px;background:#747474}.pc-document-lines i:nth-child(3n){width:64%}.pc-document-lines i:nth-child(3n + 1){width:85%}
      .pc-frame{position:absolute;left:300px;top:128px;width:1320px;height:768px;border:1.8px solid #424244;border-radius:32px;background:#181819;overflow:hidden;box-shadow:0 28px 80px #0008;transform-origin:50% 112px}
      .pc-search{height:112px;padding:0 42px;display:flex;align-items:center;gap:20px;color:#d6d6d6}.pc-search svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:2.2;flex:none}
      .pc-input{position:relative;font-size:34px;line-height:50px;max-width:1150px;white-space:nowrap}.pc-placeholder{color:#777}.pc-query{white-space:pre}.pc-caret{display:inline-block;width:2px;height:37px;margin-left:3px;vertical-align:-6px;background:#b0b0b0}
      .pc-list{position:absolute;left:0;right:0;top:112px;height:568px;border-top:1.6px solid #414143;border-radius:30px 30px 0 0;background:#151516;overflow:hidden}
      .pc-viewport{position:absolute;left:17px;right:26px;top:0;bottom:0;overflow:hidden;mask-image:linear-gradient(to bottom,transparent 0,#000 32px,#000 calc(100% - 34px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 32px,#000 calc(100% - 34px),transparent 100%)}
      .pc-content{position:absolute;left:0;right:0;top:0;height:2080px}.pc-group{position:absolute;left:22px;font-size:27px;line-height:40px;color:#858586;height:44px}
      .pc-row{position:absolute;left:0;right:0;height:64px;border-radius:12px;display:flex;align-items:center;padding:0 22px;gap:20px;font-size:34px;line-height:48px;white-space:nowrap;color:#e1e1e1}
      .pc-row svg{width:34px;height:34px;stroke:#b8b8b8;stroke-width:2;fill:none;flex:none}.pc-row-label{display:block;max-width:860px;overflow:hidden;text-overflow:ellipsis}.pc-row-command .pc-row-label{font-size:${Array.from(targetLabel).length>23?28:34}px}.pc-row-english{font-family:ProjectSans,sans-serif;font-size:25px;color:#979798;margin-left:8px}
      .pc-thumb{position:absolute;right:10px;top:0;width:10px;height:74px;border-radius:8px;background:#4b4b4d}.pc-footer{position:absolute;left:0;right:0;top:680px;height:88px;border-top:1.6px solid #363638;display:flex;align-items:center;padding:0 38px;gap:20px;color:#969697;background:#171718;font-size:25px}
      .pc-go{display:flex;align-items:center;gap:14px;white-space:nowrap;width:230px;flex:none}.pc-key{display:grid;place-items:center;min-width:36px;height:36px;border-radius:7px;background:#242426;font-size:24px;color:#929295}
      .pc-command{margin-left:auto;white-space:nowrap;font:25px/36px Consolas,monospace;max-width:855px;overflow:hidden}.pc-shortcut{display:flex;gap:7px;flex:none}
      .pc-proof{position:absolute;left:0;right:0;top:946px;text-align:center;color:#68686d;font-size:20px;line-height:28px}.pc-cursor{position:absolute;left:0;top:0;width:32px;height:39px;z-index:5}
    </style><div class="fx-scene pc-scene"><div class="pc-backdrop"><div class="pc-document"><div class="pc-document-head">${e(title)}</div><div class="pc-document-lines">${Array.from({length:21},()=>'<i></i>').join('')}</div></div></div>
      <section class="pc-frame" aria-label="命令窗口界面示意" data-selected="docs" data-query=""><div class="pc-search">${search}<div class="pc-input"><span class="pc-placeholder">搜索${e(title)}…</span><span class="pc-query"></span><i class="pc-caret"></i></div></div>
      <div class="pc-list"><div class="pc-viewport"><div class="pc-content">${groups.map(([key,name,top])=>`<div class="pc-group pc-group-${key}" style="top:${top}px">${name}</div>`).join('')}${rows.map(row=>`<div class="pc-row pc-row-${row.key}" style="top:${row.top}px" data-key="${row.key}">${row.group==='components'?component:book}<span class="pc-row-label">${e(row.label)}</span><span class="pc-row-english">${e(row.english)}</span></div>`).join('')}</div></div><i class="pc-thumb"></i></div>
      <div class="pc-footer"><span class="pc-go">前往页面 <i class="pc-key">↵</i></span><span class="pc-command"></span><span class="pc-shortcut"><i class="pc-key">⌘</i><i class="pc-key">C</i></span></div></section>
      <div class="pc-proof">界面动效示意 · 命令仅供阅读，未复制或执行</div>${cursor}</div>`;
    const q=c.q,tl=c.gsap.timeline({paused:true}),pointer=q('.pc-cursor'),frame=q('.pc-frame');
    const cmd=key=>'bunx --bun shadcn@latest add @coss/'+key;
    let previousSelection='docs',previousCommand='',previousShortcut=0;
    function select(key,time,showCommand=true){
      rows.forEach(row=>tl.to(q('.pc-row-'+row.key),{backgroundColor:row.key===key?'#242425':'rgba(36,36,37,0)',duration:.18,ease:'power1.out'},time));
      const nextCommand=showCommand&&rows.find(row=>row.key===key)?.group==='components'?cmd(key):'',nextShortcut=nextCommand?1:0;
      tl.fromTo(frame,{attr:{'data-selected':previousSelection}},{attr:{'data-selected':key},duration:0,immediateRender:false},time)
        .fromTo(q('.pc-command'),{textContent:previousCommand},{textContent:nextCommand,duration:0,immediateRender:false},time)
        .fromTo(q('.pc-shortcut'),{opacity:previousShortcut},{opacity:nextShortcut,duration:0,immediateRender:false},time);
      previousSelection=key;previousCommand=nextCommand;previousShortcut=nextShortcut;
    }
    tl.set(frame,{opacity:0,scale:1,x:0,y:0,height:768,attr:{'data-selected':'docs','data-query':'','data-phase':'scrolling'}},0)
      .set(q('.pc-list'),{height:568},0).set(q('.pc-footer'),{y:0},0)
      .set(q('.pc-content'),{y:0},0).set(q('.pc-thumb'),{y:8,opacity:0},0)
      .set(q('.pc-placeholder'),{opacity:1,display:'inline'},0).set(q('.pc-query'),{textContent:''},0)
      .set(q('.pc-caret'),{opacity:0},0).set(q('.pc-command'),{textContent:''},0).set(q('.pc-shortcut'),{opacity:0},0)
      .set(pointer,{x:1640,y:118,opacity:0,scale:1},0);
    rows.forEach(row=>tl.set(q('.pc-row-'+row.key),{y:0,opacity:1,backgroundColor:row.key==='docs'?'#242425':'rgba(36,36,37,0)'},0));
    groups.forEach(([key])=>tl.set(q('.pc-group-'+key),{y:0,opacity:1},0));
    tl.to(frame,{opacity:1,duration:.5,ease:'power2.out'},.12)
      .to(pointer,{opacity:1,x:1490,y:515,duration:.7,ease:'power2.inOut'},1.6)
      .to(frame,{scale:1.045,x:32,y:-8,duration:.7,ease:'power2.inOut'},2)
      .to(q('.pc-content'),{y:-140,duration:1.2,ease:'power1.inOut'},2.25)
      .to(q('.pc-content'),{y:-350,duration:1.3,ease:'power1.inOut'},3.5)
      .to(q('.pc-content'),{y:-624,duration:1.1,ease:'power2.inOut'},4.85)
      .to(q('.pc-thumb'),{y:98,opacity:1,duration:1.1,ease:'power2.inOut'},4.85)
      .to(frame,{scale:1,x:0,y:0,duration:.7,ease:'power2.inOut'},5.9)
      .to(pointer,{x:1370,y:680,duration:.65,ease:'power2.inOut'},6.45);
    select('button',7.1);
    tl.to(pointer,{x:1410,y:424,duration:.68,ease:'power2.inOut'},8.2);select('autocomplete',8.88);
    tl.to(pointer,{x:1594,y:383,duration:.75,ease:'power2.inOut'},10)
      .to(q('.pc-thumb'),{y:220,duration:1.55,ease:'power1.inOut'},11)
      .to(pointer,{y:505,duration:1.55,ease:'power1.inOut'},11)
      .to(q('.pc-content'),{y:-1400,duration:1.55,ease:'power1.inOut'},11)
      .to(pointer,{x:1430,y:416,duration:.6,ease:'power2.inOut'},13.1);
    select('field',13.7);
    tl.to(pointer,{x:1450,y:288,duration:.6,ease:'power2.inOut'},14.6);select('dialog',15.2);
    tl.to(pointer,{x:1420,y:188,duration:.55,ease:'power2.inOut'},15.6)
      .set(q('.pc-caret'),{opacity:1},16.15)
      .set(q('.pc-placeholder'),{opacity:0,display:'none'},16.5)
      .set(q('.pc-content'),{y:0},16.5)
      .to(pointer,{opacity:0,duration:.25},16.5);
    const chars=Array.from(query),typeStart=16.5,typeDuration=1.45;
    chars.forEach((_,index)=>{
      const prefix=chars.slice(0,index+1).join('').toLocaleLowerCase(),time=typeStart+typeDuration*(index+1)/chars.length;
      tl.fromTo(q('.pc-query'),{textContent:chars.slice(0,index).join('')},{textContent:chars.slice(0,index+1).join(''),duration:0,immediateRender:false},time);
      const matches=rows.filter(row=>row.search.toLocaleLowerCase().includes(prefix));
      let position=20;
      groups.forEach(([key,,base])=>{
        const members=matches.filter(row=>row.group===key);
        if(members.length){
          tl.to(q('.pc-group-'+key),{y:position-base,opacity:1,duration:.25,ease:'power2.out'},time);
          position+=48;
          members.forEach(row=>{tl.to(q('.pc-row-'+row.key),{y:position-row.top,opacity:1,duration:.25,ease:'power2.out'},time);position+=64;});
          position+=14;
        }else tl.to(q('.pc-group-'+key),{opacity:0,duration:.18},time);
      });
      rows.filter(row=>!matches.includes(row)).forEach(row=>tl.to(q('.pc-row-'+row.key),{opacity:0,duration:.18},time));
      const listHeight=Math.min(568,Math.max(146,position+12));
      tl.to(q('.pc-list'),{height:listHeight,duration:.3,ease:'power2.inOut'},time)
        .to(q('.pc-footer'),{y:listHeight-568,duration:.3,ease:'power2.inOut'},time)
        .to(frame,{height:112+listHeight+88,duration:.3,ease:'power2.inOut'},time)
        .to(q('.pc-thumb'),{opacity:listHeight===568?1:0,y:8,duration:.2},time)
        .fromTo(frame,{attr:{'data-query':chars.slice(0,index).join('')}},{attr:{'data-query':chars.slice(0,index+1).join('')},duration:0,immediateRender:false},time);
      select(matches[0]?.key||'command',time);
    });
    tl.to(q('.pc-caret'),{opacity:0,duration:.4,repeat:5,yoyo:true,ease:'none'},18.1)
      .to(pointer,{x:1370,y:338,opacity:1,duration:.65,ease:'power2.inOut'},19.4)
      .set(frame,{attr:{'data-phase':'filtered-result'}},19)
      .set(frame,{attr:{'data-phase':'complete'}},22);
    return {timeline:tl,duration:22};
  });
})();
