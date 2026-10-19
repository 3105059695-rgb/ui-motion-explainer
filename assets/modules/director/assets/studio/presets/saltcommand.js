/* saltjsx command palette: observed interaction chain, independently drawn demo. */
(function () {
  'use strict';
  const duration = 18;
  UIFX.register({
    id: 'interaction-command-search-assistant',
    title: 'Command Palette · 搜索转入助手',
    category: 'interaction', duration,
    source: 'https://x.com/saltjsx/status/2093677497347121360',
    referenceMedia: 'https://cdn.collectui.com/amplify_video/2093677464384081920/vid/avc1/1260x1298/vPR3slsfI-SYYcPX-optimized.mp4',
    sourceStatus: 'observed-reconstruction', sourceObservation: 'multiple-video-times',
    description: '同一深色命令面板从导航、命令筛选和知识/信号结果，连续缩为搜索空态，再转入彩色边框与白色粒子加载，最后保留回答和追问入口。',
    adaptationNotes: '原片11.169002秒、1260×1298，已实看初中尾和Searching转折；横屏重排为1920×1080，延长到18秒。界面、图标和粒子独立绘制；模糊软件背景内容无法辨认，背景为原创示意。中文标签附英文检索词，固定c/cust/hel演示保留匹配因果；原片hel继续输入hello，这里清空后输入可编辑prompt，以支持中文。粒子路径、数量和边框色光为观察后的近似重建，非原作源码。原片没有可见鼠标或可辨认按键动作，本版也不添加鼠标、点击或实际业务调用；仅按所见选中行到助手状态转场。result为示例回答，非真实AI执行证明。',
    tags: ['Collect UI', 'Command Bar', '命令面板', '搜索空态', '助手', '粒子加载', '完整交互链'],
    params: { title: '工作台', prompt: '你好', result: '你好。' },
    paramLimits: { title: 20, prompt: 24, result: 48 },
    paramMeaning: { title: '原创背景软件名称', prompt: '替换后送入助手的示例查询', result: '加载结束后保留的示例回答' }
  }, function (c, p) {
    const e = c.esc;
    const clean = (value, fallback, limit) => Array.from(String(value || fallback).replace(/\s+/g, ' ').trim() || fallback).slice(0, limit).join('');
    const title = clean(p.title, '工作台', 20);
    const prompt = clean(p.prompt, '你好', 24);
    const result = clean(p.result, '你好。', 48);
    const icon = name => {
      const paths = {
        search: '<circle cx="13" cy="13" r="8"/><path d="m19 19 7 7"/>',
        grid: '<rect x="5" y="5" width="8" height="8" rx="1"/><rect x="19" y="5" width="8" height="8" rx="1"/><rect x="5" y="19" width="8" height="8" rx="1"/><rect x="19" y="19" width="8" height="8" rx="1"/>',
        chart: '<path d="M4 27h24M7 26V17h4v9M15 26V10h4v16M23 26V4h4v22"/>',
        inbox: '<path d="M5 6h22v20H5zM5 20h7l2 4h4l2-4h7"/>',
        people: '<circle cx="12" cy="10" r="5"/><path d="M3 27v-3c0-5 3-8 9-8s9 3 9 8v3M23 6a5 5 0 0 1 0 9M24 18c4 1 5 4 5 9"/>',
        bot: '<rect x="5" y="9" width="22" height="17" rx="4"/><path d="M16 9V3M1 15v6M31 15v6M11 16v2M21 16v2M12 23h8"/>',
        book: '<path d="M16 7C12 3 5 4 3 5v21c5-2 9-1 13 2 4-3 8-4 13-2V5c-3-1-9-2-13 2zM16 7v21M21 10h4M21 15h4"/>',
        signal: '<path d="M12 5h8M10 10h12M7 15h18M5 20h22M10 25h12"/>',
        plug: '<path d="m10 6 16 16M22 4l6 6M6 16l10 10M17 9l-8 8c-5 5 2 12 7 7l8-8M4 28l6-6"/>',
        file: '<path d="M8 3h12l7 7v19H8zM20 3v8h7M12 17h11M12 22h8"/>',
        plus: '<path d="M16 4v24M4 16h24"/>',
        pencil: '<path d="m5 23 18-18 5 5-18 18-6 1zM20 8l5 5"/>',
        sparkle: '<path d="M15 3l4 9 9 4-9 4-4 9-4-9-9-4 9-4zM26 2v6M23 5h6"/>',
        back: '<path d="M25 6v13H8M13 13l-6 6 6 6"/>',
        chat: '<path d="M5 5h22v17H14l-7 6v-6H5zM10 11h12M10 16h8"/>'
      };
      return `<svg class="salt15-icon" viewBox="0 0 32 32" aria-hidden="true">${paths[name] || paths.file}</svg>`;
    };
    const row = (name, label, selected, more = '') => `<div class="salt15-row${selected ? ' salt15-selected' : ''}">${icon(name)}<span>${label}</span>${more}${selected ? '<span class="salt15-return">'+icon('back')+'</span>' : ''}</div>`;
    const navigation = [ ['grid','总览 · Dashboard'], ['chart','分析 · Analytics'], ['inbox','收件箱 · Inbox'], ['people','客户 · Customers'], ['bot','代理 · Agent'], ['book','知识 · Knowledge'], ['signal','信号 · Signal'], ['plug','集成 · Integrations'] ];
    const commands = [ ['people','客户 · Customers'], ['chart','分析 · Analytics'], ['inbox','收件箱 · Inbox'], ['plug','集成 · Integrations'], ['pencil','新建文档 · New document'], ['plus','新建组织 · New organization'], ['chat','集成 · Discord'], ['chat','集成 · Slack'] ];
    const particles = Array.from({ length: 36 }, (_, i) => `<i class="salt15-dot" style="width:${3 + i % 3}px;height:${3 + i % 3}px"></i>`).join('');
    c.root.innerHTML = `<style>
      .salt15-scene{background:#0d0e10;color:#e5e5e7;font-family:ProjectSans,sans-serif}
      .salt15-scene *{box-sizing:border-box}
      .salt15-underlay{position:absolute;inset:90px 100px 150px;border:1px solid #27282c;border-radius:30px;background:#131417;overflow:hidden;opacity:.33;filter:blur(8px)}
      .salt15-appbar{height:84px;border-bottom:1px solid #36373d;padding:20px 48px;font-size:30px;color:#9c9da2}
      .salt15-sidebar{position:absolute;left:0;top:84px;bottom:0;width:250px;border-right:1px solid #36373d;padding:40px 38px;color:#82848c;font-size:24px;line-height:70px}
      .salt15-context{position:absolute;left:292px;right:56px;top:145px;height:455px}
      .salt15-context-line{height:18px;width:62%;border-radius:6px;background:#3b3d44;margin-bottom:36px}.salt15-context-line:nth-child(2){width:35%}
      .salt15-context-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:52px}.salt15-context-grid i{display:block;height:260px;border:1px solid #383a41;border-radius:20px;background:#202127}
      .salt15-dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 22%,#00000019,transparent 80%)}
      .salt15-palette{position:absolute;left:380px;top:135px;width:1160px;height:754px;border:2px solid #323336;border-radius:34px;background:linear-gradient(115deg,#111214,#0f1012);box-shadow:0 8px 10px #0005,0 40px 90px #000a;overflow:hidden;will-change:height}
      .salt15-querybar{position:relative;z-index:3;height:106px;display:flex;align-items:center;padding:0 48px;gap:26px;border-bottom:1px solid #252629;font-size:38px;line-height:54px;white-space:nowrap}
      .salt15-querybar .salt15-icon{width:40px;height:40px}.salt15-search-icon,.salt15-ai-icon{position:absolute;left:48px;top:32px}.salt15-ai-icon{opacity:0}
      .salt15-inputwrap{margin-left:66px;display:flex;max-width:944px;overflow:hidden;align-items:center}.salt15-input{white-space:nowrap;display:block}.salt15-placeholder{position:absolute;left:114px;color:#75767b;font-size:34px}.salt15-caret{height:43px;width:3px;margin-left:3px;background:#578ffc;flex:none}
      .salt15-content{position:absolute;left:12px;right:12px;top:112px;bottom:10px;border:1px solid #28292c;border-radius:25px;overflow:hidden;box-shadow:inset 0 0 8px #ffffff08}
      .salt15-state{position:absolute;inset:0;padding:20px 16px;opacity:0}.salt15-nav{opacity:1}
      .salt15-label{color:#85868b;font-size:27px;line-height:40px;margin:0 26px 8px}
      .salt15-row{height:67px;border-radius:17px;display:flex;align-items:center;gap:25px;padding:0 25px;color:#dddde0;font-size:32px;line-height:46px;white-space:nowrap;position:relative}
      .salt15-row>span:first-of-type{overflow:hidden;text-overflow:ellipsis;max-width:925px}.salt15-selected{background:#242528;color:#f1f1f3}.salt15-icon{width:32px;height:32px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round;flex:none;color:#b3b4b8}
      .salt15-return{margin-left:auto;color:#9c9da2;flex:none}.salt15-return .salt15-icon{width:28px;height:28px}
      .salt15-cross .salt15-label{margin-top:15px}.salt15-cross .salt15-label:first-child{margin-top:0}.salt15-cross .salt15-row{height:76px}.salt15-assistline{height:78px;border-top:1px solid #242528;margin:18px 7px 0;padding-top:12px}
      .salt15-hel .salt15-assistline{margin-top:18px}.salt15-empty{padding:0 16px}.salt15-search-note{height:187px;display:flex;align-items:center;justify-content:center;color:#84858a;font-size:30px}.salt15-empty .salt15-assistline{margin-top:0}.salt15-empty .salt15-row{height:75px}
      .salt15-answer{padding:39px 43px}.salt15-question{color:#85868b;font-size:32px;line-height:46px;max-width:1000px;white-space:nowrap;overflow:hidden}.salt15-response{margin-top:24px;font-size:36px;line-height:52px;max-width:1010px;overflow-wrap:anywhere}
      .salt15-loading{position:absolute;left:50%;top:50%;width:160px;height:160px;transform:translate(-50%,-50%);opacity:0}.salt15-dot{display:block;position:absolute;left:77px;top:77px;border-radius:50%;background:#dedee1;will-change:transform,opacity}
      .salt15-rim{position:absolute;inset:-1px;z-index:4;border-radius:34px;padding:3px;background:radial-gradient(ellipse at 8% 52%,#68d39c,transparent 22%),radial-gradient(ellipse at 88% 2%,#d67487,transparent 23%),radial-gradient(ellipse at 99% 61%,#9f5ee4,transparent 22%),radial-gradient(ellipse at 59% 99%,#518edc,transparent 22%);background-size:160% 160%;opacity:0;pointer-events:none;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude}
      .salt15-softlight{position:absolute;inset:2px;z-index:2;border-radius:32px;padding:20px;background:radial-gradient(ellipse at 2% 55%,#45a86b72,transparent 18%),radial-gradient(ellipse at 99% 18%,#944bd469,transparent 18%),radial-gradient(ellipse at 60% 100%,#356ad760,transparent 20%);background-size:150% 150%;filter:blur(11px);opacity:0;pointer-events:none;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude}
      .salt15-proof{position:absolute;top:940px;left:0;right:0;text-align:center;font-size:20px;line-height:28px;color:#686b73;letter-spacing:1px}
    </style><div class="fx-scene salt15-scene"><div class="salt15-underlay"><div class="salt15-appbar">${e(title)}</div><aside class="salt15-sidebar">总览<br>收件箱<br>客户<br>知识<br>集成</aside><div class="salt15-context"><div class="salt15-context-line"></div><div class="salt15-context-line"></div><div class="salt15-context-grid"><i></i><i></i><i></i></div></div></div><div class="salt15-dim"></div><section class="salt15-palette" aria-label="命令搜索与助手界面示意"><div class="salt15-softlight"></div><div class="salt15-rim"></div><div class="salt15-querybar"><span class="salt15-search-icon">${icon('search')}</span><span class="salt15-ai-icon">${icon('sparkle')}</span><span class="salt15-placeholder">输入命令或搜索</span><span class="salt15-inputwrap"><span class="salt15-input"></span><i class="salt15-caret"></i></span></div><div class="salt15-content"><div class="salt15-state salt15-nav"><div class="salt15-label">前往</div>${navigation.map((x,i)=>row(x[0],x[1],i===0)).join('')}</div><div class="salt15-state salt15-commands"><div class="salt15-label">命令</div>${commands.map((x,i)=>row(x[0],x[1],i===0)).join('')}</div><div class="salt15-state salt15-cross"><div class="salt15-label">命令</div>${row('people','客户 · Customers',true)}<div class="salt15-label">知识</div>${row('file','邮件通知的标题来自…',false)}<div class="salt15-label">信号</div>${row('signal','文档站点同步未关联 openapi.json…',false)}<div class="salt15-assistline">${row('sparkle','询问助手',false)}</div></div><div class="salt15-state salt15-hel"><div class="salt15-label">命令</div>${row('book','帮助文档 · help',true)}<div class="salt15-assistline">${row('sparkle','询问助手',false)}</div></div><div class="salt15-state salt15-empty"><div class="salt15-search-note"></div><div class="salt15-assistline">${row('sparkle','询问助手',true)}</div></div><div class="salt15-state salt15-answer"><div class="salt15-question">${e(prompt)}</div><div class="salt15-response">${e(result)}</div></div><div class="salt15-loading" aria-label="助手加载粒子">${particles}</div></div></section><div class="salt15-proof">界面动效示意 · 命令搜索 → 助手回答</div></div>`;
    const tl = c.gsap.timeline({ paused: true });
    const states = c.qa('.salt15-state');
    const input = c.q('.salt15-input');
    const show = (selector, at) => { tl.set(states, { opacity: 0 }, at); tl.set(c.q(selector), { opacity: 1 }, at); };
    tl.set(states.filter(el=>!el.classList.contains('salt15-nav')), { opacity: 0 }, 0).set(c.q('.salt15-nav'), { opacity: 1 }, 0)
      .set(c.q('.salt15-placeholder'), { opacity: 1 }, 0)
      .set(input, { textContent: '', color: '#e5e5e7' }, 0)
      .set(c.q('.salt15-search-note'), { textContent: '' }, 0)
      .set(c.q('.salt15-search-icon'), { opacity: 1 }, 0)
      .set(c.q('.salt15-ai-icon'), { opacity: 0 }, 0)
      .set(c.q('.salt15-loading'), { opacity: 0 }, 0)
      .set(c.q('.salt15-question'), { textContent: prompt }, 0)
      .set(c.q('.salt15-response'), { textContent: result }, 0)
      .set(c.q('.salt15-palette'), { height: 754 }, 0);
    // Every query mutation is a timed set, including deletions and parameter replacement.
    tl.set(c.q('.salt15-placeholder'), { opacity: 0 }, 1.15).set(input, { textContent: 'c' }, 1.15);
    show('.salt15-commands', 1.15);
    [['cu',2.15],['cus',2.3],['cust',2.45]].forEach(([value,at])=>tl.set(input,{textContent:value},at));
    show('.salt15-cross', 2.45);
    tl.to(c.q('.salt15-palette'), { height: 716, duration: .45, ease: 'power2.inOut' }, 2.45);
    [['cus',4.3],['cu',4.42],['c',4.54]].forEach(([value,at])=>tl.set(input,{textContent:value},at));
    show('.salt15-commands', 4.54);
    tl.to(c.q('.salt15-palette'), { height: 754, duration: .38, ease: 'power2.inOut' }, 4.54)
      .set(input,{textContent:''},4.95).set(c.q('.salt15-placeholder'),{opacity:1},4.95);
    show('.salt15-nav', 4.95);
    tl.set(c.q('.salt15-placeholder'),{opacity:0},5.18).set(input,{textContent:'h'},5.18)
      .set(input,{textContent:'he'},5.33).set(input,{textContent:'hel'},5.48);
    show('.salt15-hel', 5.48);
    tl.to(c.q('.salt15-palette'), { height: 470, duration: .48, ease: 'power2.inOut' }, 5.48);
    [['he',6.12],['h',6.22],['',6.32]].forEach(([value,at])=>tl.set(input,{textContent:value},at));
    show('.salt15-nav', 6.32);
    tl.set(c.q('.salt15-placeholder'),{opacity:1},6.32);
    const chars = Array.from(prompt);
    chars.forEach((_,i)=>tl.set(input,{textContent:chars.slice(0,i+1).join('')},6.45 + .55*(i+1)/chars.length));
    const firstQuery = 6.45 + .55/chars.length;
    show('.salt15-empty', firstQuery);
    tl.set(c.q('.salt15-placeholder'),{opacity:0},firstQuery)
      .set(c.q('.salt15-search-note'),{textContent:'正在搜索'},firstQuery)
      .to(c.q('.salt15-palette'), { height: 418, duration: .4, ease: 'power2.inOut' }, firstQuery)
      .set(c.q('.salt15-search-note'),{textContent:'没有搜索结果'},8.08);
    tl.set(states,{opacity:0},9.42).set(c.q('.salt15-search-icon'),{opacity:0},9.42)
      .set(c.q('.salt15-ai-icon'),{opacity:1},9.42).set(input,{color:'#83858b'},9.42)
      .set(c.q('.salt15-caret'),{opacity:0},9.42)
      .to(c.q('.salt15-palette'),{height:482,duration:.35,ease:'power2.inOut'},9.42)
      .to(c.q('.salt15-loading'),{opacity:1,duration:.2},9.42)
      .to(c.q('.salt15-rim'),{opacity:.65,duration:.25},9.42)
      .to(c.q('.salt15-softlight'),{opacity:.8,duration:.25},9.42);
    const dots = c.qa('.salt15-dot');
    function point(i, step) {
      const theta = i * 2.399963 + step * .38;
      const radius = 23 + (i % 7) * 6;
      const depth = Math.sin(i * 1.91 + step * .35);
      return { x: Math.cos(theta) * radius * (.75 + depth * .17), y: Math.sin(theta) * radius * .8 + 7*Math.cos(i + step*.4), opacity: .38 + (depth + 1) * .28 };
    }
    dots.forEach((dot,i)=>tl.set(dot,point(i,0),0));
    for (let step=1;step<=14;step++) dots.forEach((dot,i)=>tl.to(dot,{...point(i,step),duration:.27,ease:'none'},9.42 + (step-1)*.27));
    const rims = [c.q('.salt15-rim'),c.q('.salt15-softlight')];
    tl.set(rims,{backgroundPosition:'0% 0%'},0)
      .to(rims,{backgroundPosition:'100% 75%',duration:1.3,ease:'none'},9.42)
      .to(rims,{backgroundPosition:'5% 100%',duration:1.3,ease:'none'},10.72)
      .to(rims,{backgroundPosition:'80% 0%',duration:1.18,ease:'none'},12.02)
      .to(c.q('.salt15-loading'),{opacity:0,duration:.2},13.12)
      .set(input,{textContent:'继续追问',color:'#85868b'},13.2)
      .to(c.q('.salt15-palette'),{height:Array.from(result).length > 26 ? 420 : 360,duration:.45,ease:'power2.inOut'},13.2)
      .set(c.q('.salt15-answer'),{opacity:0},13.2)
      .to(c.q('.salt15-answer'),{opacity:1,duration:.32},13.34)
      .to(rims,{opacity:0,duration:.65},13.4);
    // A finite caret sequence remains reversible and never relies on CSS animation time.
    tl.set(c.q('.salt15-caret'),{opacity:1},0);
    for(let at=.46;at<9.42;at+=.92) tl.set(c.q('.salt15-caret'),{opacity:0},at).set(c.q('.salt15-caret'),{opacity:1},at+.46);
    tl.set(c.q('.salt15-caret'),{opacity:0},9.42);
    tl.to(c.q('.salt15-proof'),{opacity:1,duration:.01},duration-.01);
    return { timeline: tl, duration };
  });
})();
