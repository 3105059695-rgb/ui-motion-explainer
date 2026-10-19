/* Scroll-linked article and DNS diagram; observed from nanda's Collect UI clip. */
(function () {
  'use strict';
  const groups = [
    {suffix:'.com', domains:['map.com','api.com','cdn.com','app.com','web.com'], addresses:['192.0.2.10','192.0.2.20','192.0.2.30','192.0.2.40','192.0.2.50']},
    {suffix:'.fyi', domains:['map.fyi','api.fyi','cdn.fyi','app.fyi','web.fyi'], addresses:['198.51.100.1','198.51.100.2','198.51.100.3','198.51.100.4','198.51.100.5']}
  ];
  UIFX.register({
    id:'interaction-dns-scroll-explain', title:'DNS · 文章滚动与驻留图解', category:'interaction', duration:12,
    source:'https://x.com/nandafyi/status/2007467074957045907',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2007467022662414337/vid/avc1/1152x720/rF9pRkpx3FLh8B2h-optimized.mp4',
    sourceStatus:'observed-reconstruction', sourceObservation:'multiple-video-times',
    description:'左侧文章持续滚动，右侧后缀表保持驻留；表格连续下移、根服务器卡片显现，四条连接线依次绘制，最后停留在完整网络。',
    adaptationNotes:'参考nanda的6.946秒DNS图解视频，横屏重排为12秒。新增文档外壳、中文概述与示例地址；未发起DNS请求，原作未观察到聊天发送、打字或光标点击。',
    tags:['Collect UI','AI Flow','Chat Layout','连续滚动','驻留图解','SVG连线'],
    params:{title:'让域名找到正确的服务器',result:'根服务器指向每个后缀组'}
  },function(c,p){
    const e=c.esc;
    const title=String(p.title||'让域名找到正确的服务器');
    const result=String(p.result||'根服务器指向每个后缀组');
    const rootCard=(x,i)=>`<g class="dna-root root-${i}"><g transform="translate(${x} 111)"><rect x="0" y="0" width="100" height="76" rx="12" fill="#fafafa" stroke="#dedede" stroke-width="2"/><circle cx="19" cy="19" r="7" fill="#70d59b"/><rect x="33" y="13" width="49" height="5" rx="2.5" fill="#dddddd"/><rect x="33" y="23" width="35" height="4" rx="2" fill="#e5e5e5"/><rect x="14" y="40" width="11" height="11" rx="3" fill="#e2e2e2"/><rect x="33" y="40" width="47" height="5" rx="2.5" fill="#dfdfdf"/><rect x="33" y="51" width="35" height="4" rx="2" fill="#e8e8e8"/></g></g>`;
    const table=(group,i)=>`<g class="dna-table table-${i}"><g transform="translate(${i?418:20} 250)"><rect x="13" y="0" width="76" height="35" rx="6" fill="#f9f9f9" stroke="#d6d6d6" stroke-width="2"/><text x="22" y="27" class="dna-suffix">${e(group.suffix)}</text><rect x="0" y="30" width="332" height="239" rx="15" fill="#f9f9f9" stroke="#d1d1d1" stroke-width="2"/><rect x="6" y="36" width="320" height="227" rx="10" fill="none" stroke="#eeeeee" stroke-width="2"/><line x1="134" y1="36" x2="134" y2="263" stroke="#eeeeee" stroke-width="1.5"/>${group.domains.map((name,j)=>`${j?`<line x1="7" y1="${36+j*45}" x2="325" y2="${36+j*45}" stroke="#ececec" stroke-width="1.5"/>`:''}<text x="17" y="${66+j*45}" class="dna-domain">${e(name)}</text><text x="148" y="${66+j*45}" class="dna-address">${e(group.addresses[j])}</text>`).join('')}</g></g>`;
    c.root.innerHTML=`<style>
      .dna-scene{background:#f3f3f2;color:#252525;font-family:ProjectSans,sans-serif}.dna-scene *{box-sizing:border-box}
      .dna-page{position:absolute;left:104px;top:62px;width:1712px;height:900px;border:1px solid #dcdcdc;border-radius:24px;background:#ededed;box-shadow:0 18px 45px -36px #0007;overflow:hidden}
      .dna-header{height:88px;border-bottom:1px solid #dedede;display:flex;align-items:center;padding:0 44px;gap:18px;background:#f1f1f1}.dna-mark{width:38px;height:38px;color:#777;flex:none}.dna-title{font-size:35px;font-weight:550;line-height:50px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:1350px}.dna-header-meta{margin-left:auto;flex:none;font-family:ProjectSans,sans-serif;font-size:19px;letter-spacing:1px;color:#8a8a8a}
      .dna-divider{position:absolute;left:855px;top:88px;bottom:0;width:1px;background:#d7d7d7}.dna-article-viewport{position:absolute;left:68px;top:144px;width:715px;height:662px;overflow:hidden}.dna-article{position:absolute;left:0;top:0;width:668px;height:1430px}.dna-intro,.dna-problem,.dna-outcome{position:absolute;left:0;width:100%}.dna-intro{top:0}.dna-problem{top:580px}.dna-outcome{top:1120px}
      .dna-kicker{font-family:ProjectSans,sans-serif;font-size:19px;color:#999;letter-spacing:1.5px;margin-bottom:21px}.dna-article h2{font-size:34px;line-height:49px;font-weight:600;margin-bottom:22px}.dna-article p{font-size:29px;line-height:49px;letter-spacing:.1px;margin-top:22px;color:#414141}.dna-article code{font-family:ProjectSans,sans-serif;font-size:25px;border-radius:4px;background:#e2e2e2;padding:1px 6px;color:#2f2f2f}.dna-article strong{font-weight:590;color:#252525}.dna-problem-intro{font-size:28px;line-height:42px;color:#454545;margin-bottom:24px}
      .dna-question{border:1px solid #d2d2d2;background:#f5f5f5;border-radius:12px;box-shadow:inset 0 1px 0 #fff;overflow:hidden}.dna-question-label{font-size:19px;line-height:32px;color:#919191;padding:4px 17px;border-bottom:1px solid #dedede;background:#eeeeee}.dna-question-text{font-size:28px;line-height:46px;padding:10px 17px;color:#2c2c2c}.dna-outcome h2{font-size:31px;line-height:48px;margin-bottom:12px}.dna-outcome p{font-size:27px;line-height:44px;margin-top:12px;color:#606060}
      .dna-scroll-track{position:absolute;right:28px;top:162px;width:4px;height:595px;background:#e3e3e3;border-radius:5px}.dna-scroll-thumb{position:absolute;left:0;top:0;width:4px;height:126px;border-radius:5px;background:#c5c5c5}
      .dna-diagram{position:absolute;left:884px;top:135px;width:770px;height:670px;overflow:visible}.dna-suffix{font:25px ProjectSans,sans-serif;fill:#282828}.dna-domain{font:23px ProjectSans,sans-serif;fill:#242424}.dna-address{font:20px ProjectSans,sans-serif;font-variant-numeric:tabular-nums;fill:#161616}.dna-route{fill:none;stroke:#bababa;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.dna-endpoint{fill:#b6b6b6}
      .dna-proof{position:absolute;bottom:24px;width:100%;text-align:center;font-size:19px;line-height:27px;color:#9a9a9a}
    </style><div class="fx-scene dna-scene"><div class="dna-page">
      <header class="dna-header"><svg class="dna-mark" viewBox="0 0 38 38" aria-hidden="true"><path d="M19 11v7M19 18H8v9M19 18h11v9" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><rect x="12" y="3" width="14" height="10" rx="3" fill="#f9f9f9" stroke="currentColor" stroke-width="1.8"/><rect x="2" y="26" width="12" height="9" rx="3" fill="#f9f9f9" stroke="currentColor" stroke-width="1.8"/><rect x="24" y="26" width="12" height="9" rx="3" fill="#f9f9f9" stroke="currentColor" stroke-width="1.8"/></svg><div class="dna-title">${e(title)}</div><span class="dna-header-meta">DNS GUIDE</span></header>
      <div class="dna-divider"></div>
      <div class="dna-article-viewport"><article class="dna-article">
        <section class="dna-intro"><div class="dna-kicker">01 / GROUP BY SUFFIX</div><h2>把域名按后缀分组</h2><p>将 <code>.com</code> 与 <code>.fyi</code> 放进独立的数据表。每个组维护自己的<strong>域名与地址</strong>。</p><p>一张巨大的列表，被拆成几张更小、更容易查找的表。</p></section>
        <section class="dna-problem"><div class="dna-problem-intro">接着，新的问题出现了：</div><div class="dna-question"><div class="dna-question-label">Problem</div><div class="dna-question-text">电脑怎么知道每个后缀由谁负责？</div></div><p>后缀和服务器地址会变化。如果每台电脑都保存全部信息，更新就会变得复杂。</p><p>于是引入稳定的<strong>根服务器</strong>。它们负责指向各个后缀的服务器。</p></section>
        <section class="dna-outcome"><h2>${e(result)}</h2><p>查询先找到入口，再沿着连接进入对应的数据表。</p></section>
      </article></div>
      <div class="dna-scroll-track"><div class="dna-scroll-thumb"></div></div>
      <svg class="dna-diagram" viewBox="0 0 770 670" aria-hidden="true">
        <path class="dna-route route-0" d="M184 187V394"/>
        <path class="dna-route route-1" d="M184 187C184 310 582 266 582 394"/>
        <path class="dna-route route-2" d="M582 187V394"/>
        <path class="dna-route route-3" d="M582 187C582 310 184 266 184 394"/>
        <circle class="dna-endpoint endpoint-0" cx="184" cy="394" r="4.5"/><circle class="dna-endpoint endpoint-1" cx="582" cy="394" r="4.5"/>
        ${rootCard(134,0)}${rootCard(532,1)}${table(groups[0],0)}${table(groups[1],1)}
      </svg>
    </div><div class="dna-proof">参考滚动机制重建 · 示例域名与地址 · 未发起真实请求</div></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true});
    tl.set(q('.dna-article'),{y:0},0)
      .set(q('.dna-scroll-thumb'),{y:0},0)
      .set(qa('.dna-table'),{y:0},0)
      .set(qa('.dna-root'),{opacity:0,y:-18},0)
      .set(qa('.dna-endpoint'),{opacity:0},0)
      .set(q('.dna-intro'),{opacity:1},0)
      .set(q('.dna-problem'),{opacity:0},0)
      .set(q('.dna-outcome'),{opacity:0},0);
    qa('.dna-route').forEach(path=>{
      const length=path.getTotalLength();
      tl.set(path,{strokeDasharray:length,strokeDashoffset:length},0);
    });
    // Text remains in a single moving article. Off-viewport sections are hidden
    // only after leaving / before entering the clip, including on reverse seek.
    tl.to(q('.dna-article'),{y:-525,duration:6,ease:'power1.inOut'},1.5)
      .to(q('.dna-scroll-thumb'),{y:330,duration:6,ease:'power1.inOut'},1.5)
      .set(q('.dna-problem'),{opacity:1},2.2)
      .to(qa('.dna-table'),{y:114,duration:.72,ease:'power2.inOut'},5)
      .to(qa('.dna-root'),{opacity:1,y:0,duration:.5,ease:'power2.out',stagger:.07},5.08)
      .set(q('.dna-intro'),{opacity:0},6.55)
      .to(q('.dna-article'),{y:-655,duration:1.8,ease:'power1.inOut'},7.9)
      .to(q('.dna-scroll-thumb'),{y:414,duration:1.8,ease:'power1.inOut'},7.9)
      .set(q('.dna-outcome'),{opacity:1},8.4);
    [5.72,5.88,6.04,6.2].forEach((start,i)=>{
      tl.to(q('.route-'+i),{strokeDashoffset:0,duration:i%2?.9:.65,ease:'power1.inOut'},start);
    });
    tl.to(q('.endpoint-0'),{opacity:1,duration:.16},6.32)
      .to(q('.endpoint-1'),{opacity:1,duration:.16},6.64)
      .to({}, {duration:.01},11.99);
    return{timeline:tl,duration:12};
  });
})();
