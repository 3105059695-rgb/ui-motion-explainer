/* X21 · Depth takeover. Pure, seekable 9 s scene; host owns font loading and blur. */
window.makeDepth = function makeDepth(gsap, mount) {
  mount.innerHTML = `
    <style>
      .d-scene { position:relative; width:1920px; height:1080px; overflow:hidden; background:#FAF9FC; color:#17131E; font-family:ProjectSans,sans-serif; font-weight:400; }
      .d-scene * { box-sizing:border-box; }
      .d-scene h1,.d-scene h2,.d-scene p { margin:0; }
      .d-title { position:absolute; left:120px; top:105px; font-size:62px; line-height:1.16; letter-spacing:-1.5px; font-weight:700; }
      .d-top-note { position:absolute; left:124px; top:187px; font-size:28px; color:#807889; }
      .d-stage { position:absolute; right:120px; top:124px; font-size:30px; font-weight:700; color:#7950B8; }
      .d-numeral { font-family:ProjectDisplay,ProjectSans,sans-serif; font-weight:700; }
      .d-wash { position:absolute; left:822px; top:240px; width:900px; height:580px; border-radius:50%; background:radial-gradient(ellipse,rgba(191,166,223,.14),rgba(191,166,223,0) 70%); }
      .d-source { position:absolute; left:0; top:0; width:610px; height:442px; transform-origin:0 0; }
      .d-shadow { position:absolute; inset:0; border-radius:25px; box-shadow:0 28px 45px -26px rgba(42,24,61,.30),0 3px 7px rgba(42,24,61,.055); }
      .d-shell { position:absolute; left:0; top:0; width:100%; height:442px; overflow:hidden; border:1.5px solid #D9D3E0; border-radius:24px; background:#FFF; }
      .d-chrome { position:absolute; left:0; top:0; width:100%; height:62px; display:flex; align-items:center; gap:9px; padding:0 24px; background:#211A2B; color:#FAF9FC; }
      .d-dot { width:10px; height:10px; border-radius:50%; background:#857B8F; }
      .d-chrome-name { margin-left:14px; font-size:22px; line-height:1; }
      .d-source-body { position:absolute; left:36px; right:36px; top:97px; }
      .d-source-heading { font-weight:700; font-size:42px; line-height:1.25; letter-spacing:-.5px; }
      .d-quote { margin-top:25px; padding:20px 20px 20px 23px; border-left:5px solid #7950B8; background:#F0E9F8; font-size:38px; line-height:1.48; letter-spacing:-.5px; }
      .d-source-meta { position:absolute; left:37px; bottom:26px; font-size:25px; line-height:1.3; color:#8B8392; }
      .d-note-row { display:flex; gap:16px; align-items:flex-start; margin-top:24px; font-size:35px; line-height:1.42; }
      .d-note-number { margin-top:4px; color:#7950B8; font-size:27px; }
      .d-note-rule { position:absolute; left:36px; right:36px; top:333px; height:2px; background:#EDE8F1; }
      .d-folded-label { position:absolute; left:29px; top:32px; right:22px; display:flex; align-items:center; gap:17px; font-size:52px; line-height:1; font-weight:700; white-space:nowrap; color:#51415F; opacity:0; }
      .d-small-file { width:39px; height:49px; border:3px solid #9677B6; border-radius:5px; position:relative; flex:none; }
      .d-small-file:before,.d-small-file:after { content:""; position:absolute; left:7px; right:7px; height:3px; background:#9677B6; }
      .d-small-file:before { top:15px; } .d-small-file:after { top:27px; }
      .d-document { position:absolute; left:0; top:0; width:1040px; height:620px; transform-origin:0 0; }
      .d-document-shadow { position:absolute; inset:0; border-radius:26px; box-shadow:0 33px 62px -30px rgba(42,24,61,.32),0 3px 7px rgba(42,24,61,.04); }
      .d-document-shell { position:absolute; inset:0; overflow:hidden; border:1.5px solid #D6CEDE; border-radius:25px; background:#FFF; }
      .d-document-chrome { position:absolute; left:0; top:0; right:0; height:75px; background:#ECE7F1; border-bottom:1px solid #DCD4E4; display:flex; align-items:center; padding:0 35px; gap:12px; }
      .d-doc-icon { width:24px; height:31px; border:2px solid #8C70A7; border-radius:4px; flex:none; }
      .d-doc-tab { font-size:30px; color:#6F617C; }
      .d-doc-tab-final { position:absolute; left:73px; top:20px; font-size:29px; color:#6F617C; opacity:0; }
      .d-preview { position:absolute; left:51px; right:48px; top:120px; }
      .d-preview-title { font-size:54px; line-height:1.22; font-weight:700; letter-spacing:-1px; }
      .d-preview-rule { height:3px; width:100%; background:#EAE4EF; margin:29px 0; }
      .d-outline-row { display:flex; gap:26px; align-items:center; margin:25px 0; }
      .d-outline-label { flex:none; color:#7950B8; background:#F0E9F8; padding:7px 15px; border-radius:9px; font-size:33px; }
      .d-outline-text { font-size:42px; line-height:1.3; }
      .d-preview-foot { position:absolute; left:54px; bottom:39px; color:#75677F; font-size:27px; }
      .d-result { position:absolute; left:57px; right:57px; top:119px; opacity:0; }
      .d-result-title { font-size:54px; line-height:1.25; letter-spacing:-1px; font-weight:700; }
      .d-result-meta { margin-top:18px !important; font-size:31px; color:#8A7D96; }
      .d-result-summary { margin-top:33px; padding:25px 26px; background:#F4EFF9; border-radius:15px; }
      .d-result-kicker { font-size:27px; color:#8A729F; margin-bottom:11px !important; }
      .d-result-text { font-size:42px; line-height:1.25; font-weight:700; }
      .d-citation-caption { position:absolute; left:58px; top:419px; font-size:27px; color:#8A7D96; opacity:0; }
      .d-saved { position:absolute; left:1510px; top:690px; display:flex; align-items:center; gap:13px; color:#7950B8; font-size:35px; font-weight:700; opacity:0; }
      .d-saved-icon { width:36px; height:36px; border-radius:50%; background:#E9DDF5; display:grid; place-items:center; font-size:25px; }
      .d-footer { position:absolute; left:120px; top:867px; font-size:23px; line-height:1.4; color:#75677F; }
    </style>
    <section id="d-scene" class="d-scene">
      <div class="d-wash" aria-hidden="true"></div>
      <h1 class="d-title">散落的资料，归到一处</h1>
      <p class="d-top-note">让来源留下，让下一步继续</p>
      <div id="d-stage-1" class="d-stage"><span class="d-numeral">01</span> / 阅读摘录</div>
      <div id="d-stage-2" class="d-stage"><span class="d-numeral">02</span> / 选题笔记</div>
      <div id="d-stage-3" class="d-stage"><span class="d-numeral">03</span> / 归入资料库</div>

      <article id="d-web" class="d-source" data-hf-motion-blur='{"shutterAngle":360,"shutterPhase":-180,"samplesPerFrame":8,"fps":50}'>
        <div id="d-web-shadow" class="d-shadow"></div>
        <div id="d-web-shell" class="d-shell">
          <div id="d-web-chrome" class="d-chrome"><i class="d-dot"></i><i class="d-dot"></i><i class="d-dot"></i><span class="d-chrome-name">网页 · 阅读摘录</span></div>
          <div id="d-web-body" class="d-source-body"><h2 class="d-source-heading">最该保留的，是出处</h2><div class="d-quote">资料不难找，难的是<br>下次还能找得到。</div></div>
          <p id="d-web-meta" class="d-source-meta">摘录 03 · 已保留原链接</p>
          <div id="d-web-folded" class="d-folded-label"><span class="d-small-file" aria-hidden="true"></span>网页摘录 · 3 条</div>
        </div>
      </article>

      <article id="d-notes" class="d-source" data-hf-motion-blur='{"shutterAngle":360,"shutterPhase":-180,"samplesPerFrame":8,"fps":50}'>
        <div id="d-notes-shadow" class="d-shadow"></div>
        <div id="d-notes-shell" class="d-shell">
          <div id="d-notes-chrome" class="d-chrome"><i class="d-dot"></i><i class="d-dot"></i><i class="d-dot"></i><span class="d-chrome-name">工作笔记 · 选题池</span></div>
          <div id="d-notes-body" class="d-source-body"><h2 class="d-source-heading">先把问题记下来</h2><div class="d-note-row"><span class="d-note-number d-numeral">01</span><span>为什么总要重复搜索？</span></div><div class="d-note-row"><span class="d-note-number d-numeral">02</span><span>能否从资料直接做成稿？</span></div></div>
          <div id="d-notes-rule" class="d-note-rule"></div>
          <p id="d-notes-meta" class="d-source-meta">选题方向 / 工作流工具</p>
          <div id="d-notes-folded" class="d-folded-label"><span class="d-small-file" aria-hidden="true"></span>选题笔记 · 2 条</div>
        </div>
      </article>

      <article id="d-file" class="d-document">
        <div class="d-document-shadow"></div>
        <div id="d-file-shell" class="d-document-shell">
          <div id="d-file-chrome" class="d-document-chrome"><span class="d-doc-icon" aria-hidden="true"></span><span id="d-file-tab" class="d-doc-tab">内容提纲 · 第 1 版</span><span id="d-file-tab-final" class="d-doc-tab-final">资料库 / 工作流</span></div>
          <div id="d-preview" class="d-preview"><h2 class="d-preview-title">一条工具选题，怎么成稿</h2><div class="d-preview-rule"></div><div class="d-outline-row"><span class="d-outline-label">开头</span><span class="d-outline-text">先展示散乱资料</span></div><div class="d-outline-row"><span class="d-outline-label">操作</span><span class="d-outline-text">三个来源归成一个文件</span></div><div class="d-outline-row"><span class="d-outline-label">结尾</span><span class="d-outline-text">保留出处，继续编辑</span></div></div>
          <p id="d-preview-foot" class="d-preview-foot">提纲已建立，等待资料归入</p>
          <div id="d-result" class="d-result"><h2 class="d-result-title">工具工作流选题.md</h2><p class="d-result-meta">3 个来源 · 引用已保留</p><div class="d-result-summary"><p class="d-result-kicker">核心问题</p><p class="d-result-text">让资料，直接成为下一步</p></div></div>
          <p id="d-citation-caption" class="d-citation-caption">提纲与引用，放在同一个文件里</p>
        </div>
      </article>
      <div id="d-saved" class="d-saved"><span class="d-saved-icon">✓</span>已归档</div>
      <p class="d-footer">原创流程示意</p>
    </section>`;

  // The upstream shutter caches descendant styles: stop its copies before folding
  // the cards' contents. Only static-content travel receives temporal blur.
  const blurStyle=document.createElement('style');
  blurStyle.textContent='#d-scene [data-hf-motion-blur-group]{opacity:var(--shutter-opacity,1)!important}';
  mount.appendChild(blurStyle);
  // Back papers are deliberately occluded by the current foreground paper.
  mount.querySelectorAll('.d-source,.d-document').forEach(e=>e.setAttribute('data-layout-allow-occlusion','depth ordering; foreground paper is the reading focus'));
  mount.querySelectorAll('.d-source span,.d-source p,.d-source h2,.d-document span,.d-document p,.d-document h2').forEach(e=>e.setAttribute('data-layout-allow-overlap','stacked papers; inspect focused paper at the reading holds'));
  // Capture original elements before the host installs motion-blur copies.
  const el = (id) => mount.querySelector('#' + id);
  const web = el('d-web');
  const notes = el('d-notes');
  const file = el('d-file');
  const tl = gsap.timeline({ paused: true });
  const ease = 'power3.inOut';

  tl.set(el('d-scene'),{'--shutter-opacity':1},0)
    .set(el('d-scene'),{'--shutter-opacity':0},5.12)
    .set(web, { x:140, y:277, scale:1.16, zIndex:30 }, 0)
    .set(notes, { x:788, y:314, scale:0.95, zIndex:20 }, 0)
    .set(file, { x:1117, y:378, scale:0.64, zIndex:10 }, 0)
    .set([el('d-stage-2'), el('d-stage-3')], { autoAlpha:0, y:8 }, 0)
    // A brief forward settle: content is already present on frame zero.
    .to(web, { x:244, y:266, scale:1.22, duration:0.55, ease:'power3.out' }, 0.24)
    .to(notes, { x:986, y:339, scale:0.82, duration:0.55, ease }, 0.24)
    .to(file, { x:1222, y:404, scale:0.54, duration:0.55, ease }, 0.24)

    // Second source takes the same visual focus; outgoing paper stays visible.
    .set(notes, { zIndex:40 }, 1.75)
    .to(web, { x:136, y:354, scale:0.91, duration:0.62, ease }, 1.75)
    .to(notes, { x:639, y:256, scale:1.24, duration:0.62, ease }, 1.75)
    .to(file, { x:1164, y:362, scale:0.59, duration:0.62, ease }, 1.75)
    .to(el('d-stage-1'), { autoAlpha:0, y:-8, duration:0.22 }, 1.83)
    .to(el('d-stage-2'), { autoAlpha:1, y:0, duration:0.26 }, 2.03)

    // The outline becomes the foreground document without changing identity.
    .set(file, { zIndex:50 }, 3.42)
    .to(web, { x:125, y:372, scale:0.86, duration:0.66, ease }, 3.42)
    .to(notes, { x:289, y:345, scale:0.89, duration:0.66, ease }, 3.42)
    .to(file, { x:676, y:233, scale:0.96, duration:0.66, ease }, 3.42)
    .to(el('d-stage-2'), { autoAlpha:0, y:-8, duration:0.22 }, 3.6)
    .to(el('d-stage-3'), { autoAlpha:1, y:0, duration:0.26 }, 3.82)

    // Fold each original source to a reference strip, still in its original parent.
    .to([el('d-web-body'),el('d-web-meta'),el('d-notes-body'),el('d-notes-meta'),el('d-notes-rule')], { autoAlpha:0, duration:0.22 }, 5.19)
    .to([el('d-web-chrome'),el('d-notes-chrome')], { autoAlpha:0, duration:0.22 }, 5.19)
    .to([el('d-web-shell'),el('d-notes-shell'),el('d-web-shadow'),el('d-notes-shadow')], { height:124, borderRadius:18, duration:0.5, ease }, 5.25)
    .to([el('d-web-shell'),el('d-notes-shell')], { backgroundColor:'#F7F4FA', borderColor:'#DED4E8', duration:0.5 }, 5.25)
    .to([el('d-web-shadow'),el('d-notes-shadow')], { opacity:0, duration:0.38 }, 5.25)
    .to([el('d-web-folded'),el('d-notes-folded')], { autoAlpha:1, duration:0.26 }, 5.56)
    .to(file, { x:440, y:220, scale:1, duration:0.65, ease }, 5.25)
    .to([el('d-preview'),el('d-preview-foot'),el('d-file-tab')], { autoAlpha:0, y:-12, duration:0.27 }, 5.29)
    .to(el('d-result'), { autoAlpha:1, duration:0.45 }, 5.62)
    .to([el('d-file-tab-final'),el('d-citation-caption')], { autoAlpha:1, duration:0.4 }, 5.72)
    // Depth crossing is authored once, rather than depending on a callback.
    .set(web, { zIndex:60 }, 5.68)
    .set(notes, { zIndex:61 }, 5.68)
    .to(web, { x:500, y:691, scale:0.7, duration:0.65, ease }, 5.54)
    .to(notes, { x:970, y:691, scale:0.7, duration:0.65, ease }, 5.64)
    .fromTo(el('d-saved'), { x:-12, autoAlpha:0 }, { x:0, autoAlpha:1, duration:0.42, ease:'power2.out', immediateRender:false }, 6.67)
    // Dedicated steady reading tail, independent of playback speed or seek order.
    .to(el('d-scene'), { duration:1, opacity:1 }, 8);

  return tl;
};
