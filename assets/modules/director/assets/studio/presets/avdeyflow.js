/* Add-job hub hover study: Alexander Avdeev's observed four-second concept. */
(function () {
  'use strict';
  const media='https://cdn.collectui.com/amplify_video/1997994636682625024/vid/avc1/1308x1306/dEWjRhOKBHfI20mH-optimized.mp4';
  const defs=[
    ['采集','fetch','#64af53','M15 17Q32 35 51 17M15 49Q32 31 51 49',[[15,17],[51,17],[15,49],[51,49]]],
    ['监听','listen','#6b86df','M13 33Q33 5 53 33Q33 61 13 33',[[13,33],[33,33],[53,33]]],
    ['校验','validate','#39b6db','M16 16H44M16 33H53M16 50H39',[[16,16],[44,16],[16,33],[53,33],[16,50],[39,50]]],
    ['标记','flag','#e77167','M16 16L49 49M49 16L16 49',[[16,16],[49,16],[33,33],[16,49],[49,49]]],
    ['丰富','enrich','#a575db','M15 33Q33 33 49 15M15 33H49M15 33Q33 33 49 51',[[15,33],[49,15],[49,33],[49,51]]],
    ['通知','notify','#ed9b76','M33 15A18 18 0 1 1 32.9 15',[[33,15],[15,33],[33,33],[51,33],[33,51]]]
  ];
  const microphone='<svg viewBox="0 0 32 40" aria-hidden="true"><rect x="10" y="3" width="12" height="23" rx="6" fill="currentColor"/><path d="M5 18v4a11 11 0 0 0 22 0v-4M16 33v5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  UIFX.register({
    id:'interaction-add-job-hub-hover',title:'Add Job · 任务枢纽悬停展开',category:'interaction',duration:9,
    source:'https://x.com/privetavdey/status/1997994747408101448',referenceMedia:media,
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'光标离开六类任务面板后，面板、四端口和连线同步收缩为小枢纽；光标返回后恢复同一组任务入口与描述输入框。',
    adaptationNotes:'原片1308×1306、4.25秒；保留完整的展开—离开—收拢—进入—再展开循环，改成9秒1920×1080横屏并延长阅读停留。六任务标签翻译成中文，补充外部说明。参考未显示点击、输入、麦克风录音或任务执行，重建也不添加这些操作。',
    tags:['Collect UI','AI Flow','悬停','任务入口','端口收拢','连续变形'],
    params:{title:'添加任务',prompt:'或用一句话描述任务',result:'任务入口随光标展开'}
  },function(c,p){
    const e=c.esc;
    const cards=defs.map(([label,en,color,path,dots],i)=>`<div class="avh-task task-${i}" style="--accent:${color}"><svg class="avh-icon" viewBox="0 0 66 66" aria-hidden="true"><path d="${path}" fill="none" stroke="${color}" stroke-width="9" opacity=".12" stroke-linecap="round"/><g class="avh-icon-pulse">${dots.map(([x,y],j)=>`<circle class="avh-dot dot-${j}" cx="${x}" cy="${y}" r="4.1" fill="${color}"/>`).join('')}</g></svg><span class="avh-label">${e(label)}</span><span class="avh-en">${e(en)}</span></div>`).join('');
    c.root.innerHTML=`<style>
      .avh-scene{background:#e9e9e8;background-image:radial-gradient(circle,#ffffffba 2.2px,transparent 3px);background-size:54px 54px;color:#171717;font-family:ProjectSans,sans-serif}.avh-scene *{box-sizing:border-box}
      .avh-caption{position:absolute;left:100px;top:103px;max-width:700px;font-size:28px;line-height:44px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .avh-wires{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none}.avh-wires path{stroke:#5a5a5a;stroke-width:2.4;fill:none;stroke-linecap:round}
      .avh-menu{position:absolute;left:490px;top:216px;width:940px;height:632px;border-radius:56px;background:#fff;overflow:hidden;box-shadow:0 16px 60px #00000006;transform-origin:50% 50%}
      .avh-content{position:absolute;left:50%;top:50%;width:940px;height:632px;transform:translate(-50%,-50%)}
      .avh-header{position:absolute;left:36px;top:28px;width:868px;height:60px;display:flex;align-items:center;justify-content:space-between;gap:20px}.avh-title{font-size:38px;font-weight:600;line-height:58px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:650px}.avh-more{color:#999;font-size:29px;line-height:46px;display:flex;align-items:center;gap:8px;flex:none}.avh-more svg{width:12px;height:18px}
      .avh-grid{position:absolute;left:36px;top:110px;width:868px;height:346px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:8px}
      .avh-task{position:relative;border-radius:36px;background:#f7f7f7;overflow:hidden}.avh-icon{position:absolute;left:27px;top:18px;width:66px;height:66px;overflow:visible}.avh-icon-pulse{transform-origin:33px 33px}.avh-label{position:absolute;left:31px;bottom:23px;font-size:35px;font-weight:600;line-height:52px}.avh-en{position:absolute;right:22px;bottom:27px;color:#a1a1a1;font:20px/34px ProjectSans,sans-serif}
      .avh-composer{position:absolute;left:36px;top:492px;width:868px;height:104px;border:2px solid #ebebeb;border-radius:28px;display:flex;align-items:center;padding:0 30px;color:#909090}.avh-placeholder{max-width:730px;font-size:32px;line-height:48px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.avh-mic{position:absolute;right:20px;top:21px;width:68px;height:62px;border-radius:32px;background:#f3f3f3;display:grid;place-items:center;color:#989898}.avh-mic svg{width:25px;height:33px}
      .avh-port,.avh-core{position:absolute;width:12px;height:12px;border-radius:50%;background:#161616;transform:translate(-50%,-50%)}.avh-left{left:466px;top:532px}.avh-right{left:1454px;top:532px}.avh-top{left:960px;top:192px}.avh-bottom{left:960px;top:872px}.avh-core{left:960px;top:532px;background:#555}
      .avh-scene .fx-cursor{width:43px;height:52px;filter:drop-shadow(0 3px 4px #0003)}.avh-note{position:absolute;left:100px;bottom:28px;max-width:1720px;color:#919191;font-size:18px;line-height:28px}
    </style><div class="fx-scene avh-scene"><div class="avh-caption">${e(p.result||'任务入口随光标展开')}</div><svg class="avh-wires" viewBox="0 0 1920 1080" aria-hidden="true"><path class="avh-wire-left" d="M100 532H442"/><path class="avh-wire-right" d="M1478 532H1820"/></svg><div class="avh-menu"><div class="avh-content"><div class="avh-header"><span class="avh-title">${e(p.title||'添加任务')}</span><span class="avh-more">更多<svg viewBox="0 0 12 18" aria-hidden="true"><path d="m3 3 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="avh-grid">${cards}</div><div class="avh-composer"><span class="avh-placeholder">${e(p.prompt||'或用一句话描述任务')}</span><span class="avh-mic">${microphone}</span></div></div></div><i class="avh-port avh-left"></i><i class="avh-port avh-right"></i><i class="avh-port avh-top"></i><i class="avh-port avh-bottom"></i><i class="avh-core"></i>${c.cursor()}<div class="avh-note">参考交互重建 · 界面示意 · 未点击任务、输入文字或录音</div></div>`;
    const q=c.q,tl=c.gsap.timeline({paused:true});
    tl.set(q('.avh-menu'),{left:490,top:216,width:940,height:632,opacity:1,borderRadius:56},0)
      .set(q('.avh-content'),{opacity:1},0).set(q('.avh-core'),{opacity:0},0)
      .set(q('.avh-left'),{left:466,top:532},0).set(q('.avh-right'),{left:1454,top:532},0)
      .set(q('.avh-top'),{left:960,top:192},0).set(q('.avh-bottom'),{left:960,top:872},0)
      .set(q('.avh-wire-left'),{attr:{d:'M100 532H442'}},0).set(q('.avh-wire-right'),{attr:{d:'M1478 532H1820'}},0)
      .set(q('.fx-cursor'),{x:989,y:509,opacity:1},0);
    // Subtle color-icon breathing is authored; no selection or task execution is implied.
    c.qa('.avh-icon-pulse').forEach((el,i)=>{
      tl.set(el,{scale:1,opacity:1},0).to(el,{scale:1.06,opacity:.8,duration:.72,repeat:10,yoyo:true,ease:'sine.inOut'},i*.08);
    });
    tl.to(q('.fx-cursor'),{x:1130,y:935,duration:.58,ease:'power2.inOut'},1.2);
    function morph(t,open){
      const dur=.52;
      tl.to(q('.avh-menu'),{left:open?490:955,top:open?216:527,width:open?940:10,height:open?632:10,borderRadius:open?56:999,opacity:open?1:0,duration:dur,ease:'power3.inOut'},t)
        .to(q('.avh-content'),{opacity:open?1:0,duration:open?.27:.18,ease:'power2.inOut'},t+(open?.19:0))
        .to(q('.avh-left'),{left:open?466:938,duration:dur,ease:'power3.inOut'},t)
        .to(q('.avh-right'),{left:open?1454:982,duration:dur,ease:'power3.inOut'},t)
        .to(q('.avh-top'),{top:open?192:510,duration:dur,ease:'power3.inOut'},t)
        .to(q('.avh-bottom'),{top:open?872:554,duration:dur,ease:'power3.inOut'},t)
        .to(q('.avh-core'),{opacity:open?0:1,duration:.18},t+(open?0:.28))
        .to(q('.avh-wire-left'),{attr:{d:open?'M100 532H442':'M100 532H914'},duration:dur,ease:'power3.inOut'},t)
        .to(q('.avh-wire-right'),{attr:{d:open?'M1478 532H1820':'M1006 532H1820'},duration:dur,ease:'power3.inOut'},t);
    }
    morph(2.25,false);
    tl.to(q('.fx-cursor'),{x:974,y:548,duration:.55,ease:'power2.inOut'},4.85);
    morph(6.0,true);
    tl.to(q('.fx-cursor'),{x:989,y:509,duration:.3,ease:'power2.out'},6.12)
      .to({}, {duration:.01},8.99);
    return {timeline:tl,duration:9};
  });
})();
