/* Nils: observed inline design-token completion, no request submission. */
(function(){
  'use strict';
  const source='https://x.com/nilseller/status/2064754224014238183';
  const media='https://cdn.collectui.com/amplify_video/2064749832552513536/vid/avc1/2240x1604/XuvCEQ-xbzAqhTsb-optimized.mp4';
  const limit=(s,n)=>Array.from(String(s??'')).slice(0,n).join('');
  const blues=[['blue-50','#f5faff'],['blue-100','#eaf5ff'],['blue-200','#cbe6fb'],['blue-300','#9fd0f6'],['blue-400','#37a7f1'],['blue-500','#258acc'],['blue-600','#146bb0'],['blue-700','#105487'],['blue-800','#083b5b']];
  const backgrounds=[['bg-primary','#ffffff'],['bg-secondary','#f8f8f8'],['bg-tertiary','#eeeeee'],['bg-surface','#f2f2f2'],['bg-elevated','#ffffff'],['bg-inverted','#0c0c0c']];
  const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const plus='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const settings='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v5m0 5v8M12 3v11m0 5v2M19 3v3m0 5v10M2 10h6m1 7h6m1-9h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  UIFX.register({
    id:'interaction-prompt-design-token-autocomplete',title:'提示词里的设计令牌 · 连续两次补全',category:'interaction',duration:16,
    description:'同一提示框中输入颜色与背景前缀，候选菜单逐项移动、确认后变成带色块的内联令牌；停在可发送的完整提示，不提交请求。',
    source,referenceMedia:media,sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    tags:['Collect UI','Command Bar','Dropdown','UI Interaction','AI','提示词','设计令牌','内联补全'],
    params:{title:'把设计令牌写进提示词',prompt:'更新为',result:'两个设计令牌已插入'},
    adaptationNotes:'6.767442秒2240×1604参考适配为16秒1920×1080。保留同一白色提示框、两个工具图标、蓝色发送按钮、蓝色和背景两轮建议及两枚内联令牌。顶部标题与末段说明、输入框聚焦鼠标、方向键/Enter提示是原创解释；原片不显示实际按键，键盘方式为演示选择。只重建读清的blue-50到blue-800，菜单底部未读清项不补造。未点发送。',
    parameterNotes:'title限24字符；prompt作为命令前缀限12字符；result作为框外末段说明限32字符。blue/bg前缀、候选名称与目标令牌保持真实观察值。'
  },function(c,p){
    const e=c.esc,title=limit(p.title||'把设计令牌写进提示词',24),prefix=limit(p.prompt||'更新为',12),result=limit(p.result||'两个设计令牌已插入',32);
    const word=(name,text)=>`<span class="nct-word ${name}">${Array.from(text).map(ch=>`<span class="nct-letter">${e(ch)}</span>`).join('')}</span>`;
    const options=(rows,name)=>`<div class="nct-menu ${name}" aria-label="${name==='nct-blue-menu'?'蓝色候选':'背景候选'}"><div class="nct-highlight"></div>${rows.map(([label,color])=>`<div class="nct-option" data-token="${e(label)}"><i style="background:${color}"></i><span>${e(label)}</span></div>`).join('')}</div>`;
    c.root.innerHTML=`<style>
      .nct-scene{background:#f8f8f8;color:#181818;font-family:ProjectSans,sans-serif}.nct-scene button{border:0;padding:0;font:inherit;background:none;color:inherit}.nct-title{position:absolute;left:360px;top:119px;width:1200px;height:86px;font-size:54px;line-height:1.5;font-weight:550;letter-spacing:-1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nct-shell{position:absolute;left:360px;top:310px;width:1200px;height:206px;background:#fff;border:1px solid #e9e9e9;border-radius:34px;box-shadow:0 16px 23px #0000000a,0 4px 5px #00000005;transform-origin:50% 50%}.nct-input{position:absolute;left:43px;right:43px;top:28px;height:65px;display:flex;align-items:center;gap:12px;white-space:nowrap;font-size:36px;line-height:1.55;letter-spacing:-.5px}.nct-placeholder{position:absolute;left:0;top:0;color:#989898;line-height:65px;pointer-events:none}.nct-word{display:flex;align-items:baseline;flex-shrink:0;letter-spacing:-.5px}.nct-letter{display:none;opacity:0}.nct-segment{position:relative;display:inline-flex;align-items:center;flex-shrink:0}.nct-token{display:none;align-items:center;gap:10px;padding:2px 12px;height:47px;border:1px solid #e9e9e9;border-radius:15px;background:#fff;box-shadow:0 1px 2px #00000003;font-size:30px;line-height:43px;white-space:nowrap}.nct-token i{width:26px;height:26px;border-radius:7px;border:1.3px solid #00000015;flex-shrink:0}.nct-color-token i{background:#37a7f1}.nct-background-token i{background:#eee}.nct-caret{width:2px;height:38px;background:#2c2c2c;flex-shrink:0;margin-left:-5px}.nct-tools{position:absolute;left:44px;bottom:39px;display:flex;gap:36px}.nct-tools button{width:28px;height:28px;color:#737373}.nct-tools svg{width:28px;height:28px}.nct-send{position:absolute;right:27px;bottom:25px;width:67px;height:67px;border-radius:17px;background:#258acc!important;color:#fff!important;display:grid;place-items:center;box-shadow:0 1px 1px #00000008}.nct-send svg{width:30px;height:30px}.nct-menu{position:absolute;left:100%;top:65px;width:376px;padding:6px;border:1px solid #e5e5e5;border-radius:23px;background:#fdfdfd;box-shadow:0 9px 15px #0000000b,0 2px 4px #00000008;z-index:5;transform-origin:0 0;overflow:hidden}.nct-blue-menu:after{content:'';position:absolute;bottom:0;left:0;right:0;height:16px;background:linear-gradient(transparent,#fdfdfd);pointer-events:none}.nct-highlight{position:absolute;left:6px;right:6px;top:6px;height:50px;border-radius:15px;background:#efefef}.nct-option{position:relative;height:50px;display:flex;align-items:center;gap:20px;padding:0 17px;font-size:28px;line-height:42px;letter-spacing:-.3px;white-space:nowrap}.nct-option i{width:30px;height:30px;border-radius:8px;border:1.5px solid #00000013;box-shadow:0 0 0 1px #ffffffaa;flex-shrink:0}.nct-input-help{position:absolute;left:363px;top:890px;display:flex;align-items:center;gap:11px;font-size:22px;line-height:36px;color:#9b9b9b}.nct-key{min-width:37px;height:35px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:7px;background:#fff;color:#676767;line-height:32px;box-shadow:0 2px 0 #e8e8e8;font-family:ProjectSans,sans-serif;font-size:20px}.nct-result{position:absolute;left:360px;top:795px;width:1200px;max-height:100px;font-size:34px;line-height:1.5;color:#6b6b6b;overflow:hidden;overflow-wrap:anywhere}.nct-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:2px solid #258acc;border-radius:50%;z-index:91;pointer-events:none}.nct-proof{position:absolute;bottom:27px;right:70px;font-size:20px;line-height:30px;color:#9b9b9b}.nct-scene .fx-cursor{width:38px;height:46px}
    </style><div class="fx-scene nct-scene"><div class="nct-title">${e(title)}</div><div class="nct-shell"><div class="nct-input"><span class="nct-placeholder">想创建什么？</span>${word('nct-prefix',prefix)}<span class="nct-segment nct-segment-one">${word('nct-blue-query','blue')}<span class="nct-token nct-color-token"><i></i><span>blue-400</span></span>${options(blues,'nct-blue-menu')}</span>${word('nct-connector','和')}<span class="nct-segment nct-segment-two">${word('nct-background-query','bg-')}<span class="nct-token nct-background-token"><i></i><span>bg-tertiary</span></span>${options(backgrounds,'nct-background-menu')}</span><i class="nct-caret"></i></div><div class="nct-tools"><button aria-label="添加附件示意">${plus}</button><button aria-label="输入设置示意">${settings}</button></div><button class="nct-send" aria-label="发送按钮未触发">${arrow}</button></div><div class="nct-result">${e(result)}</div><div class="nct-input-help"><span>输入示意</span><kbd class="nct-key nct-key-down">↓</kbd><span>选择</span><kbd class="nct-key nct-key-enter">Enter</kbd><span>插入</span></div><div class="nct-proof">界面示意 · 令牌补全，未发送请求</div>${c.cursor()}<i class="nct-ring"></i></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true});
    tl.set(qa('.nct-letter'),{display:'none',opacity:0},0)
      .set([q('.nct-connector'),q('.nct-segment-two')],{display:'none'},0)
      .set(qa('.nct-token'),{display:'none',scale:1},0)
      .set(qa('.nct-key'),{y:0},0).set(qa('.nct-menu'),{opacity:0,y:8,scale:.97},0).set(qa('.nct-highlight'),{y:0},0)
      .set(q('.nct-caret'),{opacity:0},0).set(q('.nct-send'),{opacity:.42},0)
      .set(q('.nct-shell'),{opacity:0,scale:.975,y:18},0).set(q('.nct-title'),{opacity:0,y:10},0)
      .set(q('.nct-result'),{opacity:0,y:12},0).set(q('.nct-input-help'),{opacity:0},0)
      .set(q('.fx-cursor'),{x:1630,y:760,opacity:0,scale:1},0).set(q('.nct-ring'),{x:0,y:0,opacity:0,scale:.3},0)
      .to(q('.nct-title'),{opacity:1,y:0,duration:.55,ease:'power2.out'},0)
      .to(q('.nct-shell'),{opacity:1,scale:1,y:0,duration:.65,ease:'power3.out'},.1)
      .to(q('.fx-cursor'),{x:487,y:371,opacity:1,duration:.6,ease:'power2.inOut'},.35);
    c.click(tl,q('.fx-cursor'),q('.nct-ring'),487,371,1.0);
    tl.set(q('.nct-caret'),{opacity:1},1.12).to(q('.fx-cursor'),{opacity:0,duration:.22},1.3)
      .to(q('.nct-placeholder'),{opacity:0,duration:.12},1.4).to(q('.nct-send'),{opacity:1,duration:.22},1.7);
    const type=(selector,start,duration)=>{const letters=qa(selector+' .nct-letter');letters.forEach((el,i)=>tl.set(el,{display:'inline',opacity:1},start+duration*(i+1)/letters.length));};
    const key=(selector,at)=>tl.to(q(selector),{backgroundColor:'#edf5fc',color:'#258acc',borderColor:'#bddbf0',y:2,duration:.07},at).to(q(selector),{backgroundColor:'#fff',color:'#676767',borderColor:'#ddd',y:0,duration:.16},at+.09);
    type('.nct-prefix',1.45,.8);type('.nct-blue-query',2.3,.65);
    tl.to(q('.nct-blue-menu'),{opacity:1,y:0,scale:1,duration:.22,ease:'power2.out'},3.02)
      .to(q('.nct-input-help'),{opacity:1,duration:.25},3.05);
    [3.9,4.45,5.0,5.55].forEach((t,i)=>{key('.nct-key-down',t-.08);tl.to(q('.nct-blue-menu .nct-highlight'),{y:(i+1)*50,duration:.13,ease:'power1.out'},t);});
    key('.nct-key-enter',6.18);
    tl.to(q('.nct-blue-menu'),{opacity:0,duration:.1},6.23)
      .set(q('.nct-blue-query'),{display:'none'},6.34).set(q('.nct-color-token'),{display:'inline-flex'},6.34)
      .fromTo(q('.nct-color-token'),{scale:.96},{scale:1,duration:.2,ease:'power2.out',immediateRender:false},6.34)
      .set(q('.nct-connector'),{display:'inline-flex'},7.08);
    type('.nct-connector',7.08,.3);
    tl.set(q('.nct-segment-two'),{display:'inline-flex'},8.06);
    type('.nct-background-query',8.06,.65);
    tl.to(q('.nct-background-menu'),{opacity:1,y:0,scale:1,duration:.22,ease:'power2.out'},8.8);
    [9.8,10.55].forEach((t,i)=>{key('.nct-key-down',t-.08);tl.to(q('.nct-background-menu .nct-highlight'),{y:(i+1)*50,duration:.13,ease:'power1.out'},t);});
    key('.nct-key-enter',11.6);
    tl.to(q('.nct-background-menu'),{opacity:0,duration:.1},11.65)
      .set(q('.nct-background-query'),{display:'none'},11.76).set(q('.nct-background-token'),{display:'inline-flex'},11.76)
      .fromTo(q('.nct-background-token'),{scale:.96},{scale:1,duration:.2,ease:'power2.out',immediateRender:false},11.76)
      .to(q('.nct-caret'),{opacity:0,duration:.3},12.2)
      .to(q('.nct-input-help'),{opacity:0,duration:.3},12.35)
      .to(q('.nct-result'),{opacity:1,y:0,duration:.4,ease:'power2.out'},12.6)
      .to({}, {duration:.01},15.99);
    return {timeline:tl,duration:16};
  });
})();

