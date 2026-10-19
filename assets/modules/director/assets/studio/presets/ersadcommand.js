/* Erşad / AlignUI command menu: observed filtering and reset chain; independent vector reconstruction. */
(function () {
  'use strict';
  const duration = 28;
  UIFX.register({
    id: 'interaction-hr-command-multigroup-search',
    title: 'HR Command · 四组筛选与清空', category: 'interaction', duration,
    source: 'https://x.com/ersadwork/status/2052762430854369481',
    referenceMedia: 'https://cdn.collectui.com/amplify_video/2052762363133132802/vid/avc1/2532x2050/QFg2Okzdnhsan-oB-optimized.mp4',
    sourceStatus: 'observed-reconstruction', sourceObservation: 'multiple-video-times',
    description: '同一个浅色命令菜单，跨工具、员工、团队和地区移动；查询时保留四组结构，匹配行重新排序，清空后恢复完整列表。',
    adaptationNotes: '已在22.270833秒、2532×2050原片中实看28个暂停点。保留初段行悬停、Monday筛选、五个Recent标签悬停、选中文本、Asana、清空、Laura、清空、Italy、清空、S到Synergy及最后清空。横屏1920×1080，时序延长到28秒，四组与标签中文化；所有图标、头像、旗帜为独立矢量示意。指针轨迹和文字选区按所见机制近似重建，不声称原作源码；未证明具体按键，故不标Ctrl+A或Esc。默认检索词保留英文名称；prompt/result覆盖时同步替换对应工具/团队名称并保留英文检索别名，可见筛选由文字变化触发。原片没有打开详情或业务成功，本版也只有筛选、选中与清空，不调用业务或网络。',
    tags: ['Collect UI', 'Command Bar', 'Search', 'UI Interaction', '四组结果', '清空复位', '完整交互链'],
    params: { title: '搜索 HR 工具或输入关键词', prompt: 'Monday', result: 'Synergy' },
    paramLimits: { title: 26, prompt: 18, result: 18 },
    paramMeaning: { title: '搜索框占位文字', prompt: '第一轮工具检索词，同时替换对应工具名称', result: '最后一轮团队检索词，同时替换对应团队名称；不是执行结果' }
  }, function (c, p) {
    const e = c.esc;
    const clean = (v, fallback, max) => Array.from(String(v || fallback).replace(/\s+/g, ' ').trim() || fallback).slice(0, max).join('');
    const title = clean(p.title, '搜索 HR 工具或输入关键词', 26);
    const prompt = clean(p.prompt, 'Monday', 18);
    const result = clean(p.result, 'Synergy', 18);
    const names = [prompt === 'Monday' ? 'Monday.com' : prompt, 'Loom', 'Asana', 'James Brown', 'Sophia Williams', 'Laura Perez', 'Aurora Solutions', 'Pulse Medical', result === 'Synergy' ? 'Synergy HR' : result, 'United States', 'Spain', 'Italy'];
    const aliases = names.map(x => [x]); aliases[0].push('Monday.com'); aliases[8].push('Synergy HR');
    function icon(i) {
      const svg = inner => `<svg viewBox="0 0 40 40" aria-hidden="true">${inner}</svg>`;
      if (i === 0) return svg('<rect x="5" y="11" width="8" height="21" rx="4" fill="#f53c68" transform="rotate(28 9 21)"/><rect x="17" y="8" width="8" height="24" rx="4" fill="#f9cc3f" transform="rotate(28 21 20)"/><circle cx="32" cy="28" r="4" fill="#31bd91"/>');
      if (i === 1 || i === 8) return svg(`<circle cx="20" cy="20" r="18" fill="${i === 1 ? '#6255eb' : '#814fe1'}"/>${Array.from({length:10},(_,j)=>`<path d="M20 8v8" stroke="white" stroke-width="2.3" transform="rotate(${j*36} 20 20)"/>`).join('')}<circle cx="20" cy="20" r="4" fill="white"/>`);
      if (i === 2) return svg('<circle cx="20" cy="20" r="18" fill="#f36889"/><circle cx="20" cy="12" r="5" fill="#ffd58b"/><circle cx="12" cy="26" r="5" fill="#ffd58b"/><circle cx="28" cy="26" r="5" fill="#ffd58b"/>');
      if (i >= 3 && i <= 5) return svg(`<circle cx="20" cy="20" r="19" fill="${['#badeca','#e4c4ee','#cce3fb'][i-3]}"/><path d="M7 37c0-12 25-12 26 0" fill="${['#437067','#795270','#e39050'][i-3]}"/><path d="M11 18c-2-17 23-18 20 1v8H10z" fill="#463139"/><ellipse cx="20" cy="19" rx="8" ry="10" fill="${['#b57c5d','#e5a887','#f2bd96'][i-3]}"/><path d="M11 17c8-1 7-9 10-7 2 6 7 6 10 6-1-13-21-14-20 1" fill="#463139"/><circle cx="34" cy="33" r="5" fill="#38c48e" stroke="white" stroke-width="2"/>`);
      if (i === 6) return svg('<circle cx="20" cy="20" r="18" fill="#ff4969"/><path d="M7 15q13-7 26 1M7 21q13-7 26 1M10 27q12-5 20 1" fill="none" stroke="#fff" stroke-width="2"/>');
      if (i === 7) return svg('<circle cx="20" cy="20" r="18" fill="#53b8ed"/><path d="M20 8v24M8 20h24" stroke="white" stroke-width="7"/><circle cx="20" cy="20" r="6" fill="#90d6f4"/>');
      if (i === 9) return svg('<defs><clipPath id="ers16-us"><circle cx="20" cy="20" r="18"/></clipPath></defs><g clip-path="url(#ers16-us)"><rect x="2" y="2" width="36" height="36" fill="white"/>'+[3,9,15,21,27,33].map(y=>`<rect x="2" y="${y}" width="36" height="3" fill="#dc3e52"/>`).join('')+'<rect x="2" y="2" width="17" height="19" fill="#3169bb"/><path d="M6 6h10M6 11h10M6 16h10" stroke="white" stroke-dasharray="2 2"/></g>');
      if (i === 10) return svg('<circle cx="20" cy="20" r="18" fill="#e43743"/><path d="M3 13h34v14H3z" fill="#ffcf36"/>');
      return svg('<circle cx="20" cy="20" r="18" fill="#fff"/><path d="M14 3v34A18 18 0 0 1 14 3" fill="#65a742"/><path d="M26 3v34A18 18 0 0 0 26 3" fill="#e54e58"/>');
    }
    const groups = ['工具与应用', '员工', '团队', '地区'];
    const recent = ['入职', '评审', '招聘', '福利', '学习'];
    c.root.innerHTML = `<style>
      .ers16-scene{background:#cecece;color:#242529;font-family:ProjectSans,sans-serif}.ers16-scene *{box-sizing:border-box}
      .ers16-menu{position:absolute;left:290px;top:123px;width:1340px;height:805px;background:#fff;border-radius:32px;box-shadow:0 5px 7px #00000008,0 30px 54px #00000012;overflow:hidden}
      .ers16-search{height:104px;border-bottom:1px solid #e8e8ea;display:flex;align-items:center;gap:26px;padding:0 44px;position:relative}
      .ers16-magnify{width:34px;height:34px;fill:none;stroke:#4864ec;stroke-width:2;flex:none}.ers16-inputbox{position:relative;min-width:0;flex:1;font-size:34px;line-height:50px;white-space:nowrap;overflow:hidden;height:52px;display:flex;align-items:center}.ers16-placeholder{position:absolute;left:0;color:#50515a;font-size:30px;max-width:100%;overflow:hidden;text-overflow:ellipsis}.ers16-input{white-space:pre;max-width:100%;overflow:hidden}.ers16-caret{display:block;height:37px;width:2px;background:#333;margin-left:2px;flex:none;opacity:0}.ers16-selection{position:absolute;left:0;top:5px;height:43px;background:#a9b2c742;pointer-events:none;opacity:0}.ers16-key{flex:none;font-size:23px;color:#92939a;border:1px solid #e5e5e7;box-shadow:0 2px 3px #00000006;border-radius:6px;padding:3px 10px}
      .ers16-recent{height:144px;padding:23px 42px;border-bottom:1px solid #e6e6e8}.ers16-label{font-size:25px;line-height:36px;color:#8b8c92}.ers16-chips{display:flex;gap:13px;margin-top:9px}.ers16-chip{font-size:27px;line-height:36px;padding:7px 18px;border-radius:12px;background:#f5f5f6;border:1px solid transparent;min-width:94px;text-align:center}
      .ers16-grid{height:474px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:237px 237px}.ers16-group{position:relative;padding:24px 37px;border-right:1px solid #e6e6e8;border-bottom:1px solid #e6e6e8}.ers16-group:nth-child(even){border-right:0}.ers16-heading{display:flex;justify-content:space-between;font-size:25px;line-height:36px;color:#8d8e93}.ers16-heading b{font-size:23px;font-weight:400}.ers16-rows{position:relative;height:166px;margin-top:11px}.ers16-row{position:absolute;left:-15px;right:-15px;top:0;height:53px;padding:0 16px;display:flex;align-items:center;gap:22px;border-radius:12px;background:transparent;font-size:29px;line-height:40px}.ers16-row:nth-child(2){transform:translateY(53px)}.ers16-row:nth-child(3){transform:translateY(106px)}.ers16-icon{width:37px;height:37px;flex:none}.ers16-icon svg{width:100%;height:100%;display:block}.ers16-name{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}.ers16-forward{display:grid;place-items:center;background:white;border-radius:8px;box-shadow:0 2px 4px #00000003;width:34px;height:34px;font-size:29px;line-height:32px;color:#8f9198;flex:none;opacity:0}
      .ers16-footer{height:83px;display:flex;align-items:center;gap:16px;padding:0 42px;color:#999ba1;font-size:23px}.ers16-footer kbd{font:22px ProjectSans,sans-serif;display:inline-block;background:#f8f8f9;padding:1px 6px;border-radius:4px}.ers16-contact{margin-left:auto}.ers16-contact u{color:#595b62;text-underline-offset:5px}.ers16-proof{position:absolute;top:952px;left:0;width:100%;text-align:center;color:#77797e;font-size:20px;line-height:28px;letter-spacing:1px}
      .ers16-pointer{position:absolute;left:0;top:0;width:32px;height:38px;z-index:10;pointer-events:none;filter:drop-shadow(0 2px 2px #0002)}.ers16-pointer svg{width:32px;height:38px}.ers16-ibeam{position:absolute;left:0;top:0;width:16px;height:35px;z-index:11;opacity:0;pointer-events:none}
    </style><div class="fx-scene ers16-scene"><section class="ers16-menu" aria-label="HR 命令菜单界面示意"><div class="ers16-search"><svg class="ers16-magnify" viewBox="0 0 32 32"><circle cx="13" cy="13" r="9"/><path d="m20 20 8 8"/></svg><div class="ers16-inputbox"><span class="ers16-placeholder">${e(title)}</span><span class="ers16-input"></span><i class="ers16-caret"></i><i class="ers16-selection"></i></div><span class="ers16-key">⌘K</span></div><div class="ers16-recent"><div class="ers16-label">最近</div><div class="ers16-chips">${recent.map((x,i)=>`<span class="ers16-chip" data-chip="${i}">${x}</span>`).join('')}</div></div><div class="ers16-grid">${groups.map((g,k)=>`<div class="ers16-group"><div class="ers16-heading"><span>${g}</span><b>↗</b></div><div class="ers16-rows">${[0,1,2].map(j=>{const i=k*3+j;return `<div class="ers16-row" data-row="${i}"><span class="ers16-icon">${icon(i)}</span><span class="ers16-name">${e(names[i])}</span><span class="ers16-forward">›</span></div>`;}).join('')}</div></div>`).join('')}</div><div class="ers16-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> 移动</span><span><kbd>↵</kbd> 选择</span><span class="ers16-contact">遇到问题？ <u>联系</u></span></div></section><div class="ers16-pointer"><svg viewBox="0 0 32 38"><path d="M4 3 5 29 12 22 19 34 25 30 18 19 28 18Z" fill="#222" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg></div><span class="ers16-ibeam" aria-hidden="true"><svg viewBox="0 0 16 35" width="16" height="35" style="display:block" aria-hidden="true"><path d="M3 3h10M8 3v29M3 32h10" fill="none" stroke="#34343a" stroke-width="1.4"/></svg></span><div class="ers16-proof">界面动效示意 · 检索与筛选 · 无实际业务调用</div></div>`;
    const tl = c.gsap.timeline({ paused: true });
    const rows = c.qa('.ers16-row'), arrows = c.qa('.ers16-forward'), chips = c.qa('.ers16-chip');
    const input = c.q('.ers16-input'), placeholder = c.q('.ers16-placeholder'), selection = c.q('.ers16-selection');
    const pointer = c.q('.ers16-pointer'), ibeam = c.q('.ers16-ibeam'), caret = c.q('.ers16-caret');
    const rowPoint = i => ({x: 518 + (Math.floor(i/3)%2)*670, y: 451 + Math.floor(i/6)*237 + (i%3)*53});
    const highlight = (id, at) => { rows.forEach((el,i)=>tl.set(el,{backgroundColor:i===id?'#f5f5f6':'transparent'},at)); arrows.forEach((el,i)=>tl.set(el,{opacity:i===id?1:0},at)); };
    function filtered(value, at) {
      const query = value.toLocaleLowerCase();
      const matches = [];
      for(let group=0;group<4;group++) {
        const found = [group*3,group*3+1,group*3+2].filter(i=>!query||aliases[i].some(s=>s.toLocaleLowerCase().includes(query)));
        if(query) found.sort((a,b)=>Number(!aliases[a].some(s=>s.toLocaleLowerCase().startsWith(query)))-Number(!aliases[b].some(s=>s.toLocaleLowerCase().startsWith(query))));
        [group*3,group*3+1,group*3+2].forEach(i=>tl.set(rows[i],{opacity:found.includes(i)?1:0,y:found.includes(i)?found.indexOf(i)*53:(i%3)*53},at));
        matches.push(...found);
      }
      highlight(matches[0] ?? -1,at);
      tl.set(input,{textContent:value},at).set(placeholder,{opacity:value?0:1},at).set(selection,{opacity:0},at);
    }
    function type(value, start, span) { const chars=Array.from(value); chars.forEach((_,i)=>filtered(chars.slice(0,i+1).join(''),start+span*(i+1)/chars.length)); }
    function clear(at) { filtered('',at); tl.set(caret,{opacity:1},at); }
    function select(value, at) { tl.set(selection,{width:Math.min(760,Array.from(value).reduce((w,ch)=>w+(/[\u2e80-\uffff]/.test(ch)?34:20),0)),opacity:1},at).set(caret,{opacity:0},at); }
    const focus = at => tl.to(pointer,{opacity:0,duration:.1},at).set(ibeam,{x:435,y:155,opacity:1},at+.1).set(caret,{opacity:1},at+.1);
    tl.set(input,{textContent:''},0).set(placeholder,{opacity:1},0).set(selection,{opacity:0},0).set(caret,{opacity:0},0)
      .set(pointer,{...rowPoint(1),opacity:1},0).set(ibeam,{x:435,y:155,opacity:0},0);
    rows.forEach((el,i)=>tl.set(el,{opacity:1,y:(i%3)*53},0)); highlight(1,0);
    [[2,1],[7,2],[11,3],[5,4],[3,5]].forEach(([id,at])=> {tl.to(pointer,{...rowPoint(id),duration:.32,ease:'power2.inOut'},at-.32);highlight(id,at);});
    tl.to(pointer,{x:437,y:169,duration:.45,ease:'power2.inOut'},5.5); focus(6);
    type(prompt,6.35,.8);
    // Recent chips only hover; the active query is retained throughout.
    tl.set(ibeam,{opacity:0},8.4).set(pointer,{opacity:1},8.4);
    for(let i=0;i<5;i++) {
      const at=8.7+i*.4;
      tl.to(pointer,{x:374+i*107,y:326,duration:.24,ease:'power1.inOut'},at-.24);
      chips.forEach((el,j)=>tl.set(el,{backgroundColor:i===j?'#fff':'#f5f5f6',borderColor:i===j?'#e8e8ea':'transparent'},at));
    }
    tl.set(chips,{backgroundColor:'#f5f5f6',borderColor:'transparent'},10.55);
    focus(10.7); select(prompt,11.15); type('Asana',11.55,.7); select('Asana',13.0);
    clear(13.65); type('Laura',14.1,.65); select('Laura',15.85); clear(16.35);
    type('Italy',16.8,.65); select('Italy',18.55); clear(19.15);
    // The source shows S cross-group matches before the final Synergy team filter.
    type('S',19.6,.2);
    if(result === 'Synergy') type(result,20.65,.7);
    else { select('S',20.5); type(result,20.75,.7); }
    select(result,23.0); clear(23.75);
    tl.set(ibeam,{opacity:0},25.2).set(caret,{opacity:0},25.2).set(pointer,{x:470,y:446,opacity:1},25.2);
    tl.to(c.q('.ers16-proof'),{opacity:1,duration:.01},duration-.01);
    return { timeline: tl, duration };
  });
})();
