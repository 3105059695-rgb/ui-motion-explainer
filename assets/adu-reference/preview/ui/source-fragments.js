/* Exact source HTML expressions lifted for individual UI viewing. */
window.UI_SOURCE_BUILDERS={
"slider":function(parent){const sc={el:parent};const PX=1000;  const rs = mk(sc.el, `<div class="dcard" style="width:440px;height:150px"><div class="lb">// 推理程度</div>
     <div style="position:absolute;left:28px;right:28px;top:78px;height:10px;border-radius:5px;background:#2a2a2a"><div class="rf" style="height:100%;width:30%;border-radius:5px;background:linear-gradient(90deg,#2462EA,#E5484D)"></div>
       <div class="rk" style="position:absolute;top:-11px;left:30%;width:32px;height:32px;margin-left:-16px;border-radius:50%;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.5)"></div></div>
     <div class="mono rv" style="position:absolute;right:28px;top:104px;font-size:22px;color:#fff">medium</div>
     <div class="mono" style="position:absolute;left:28px;top:104px;font-size:18px;color:#555">low</div></div>`, PX - 130, 524);
  const rf = rs.querySelector('.rf'), rk = rs.querySelector('.rk'), rv = rs.querySelector('.rv');
return {el:rs,rf,rk,rv};},
"ring":function(parent){const sc={el:parent};const PX=1000;  const ring = mk(sc.el, `<div style="position:relative;width:250px;height:250px">
     <svg width="250" height="250" viewBox="0 0 250 250" style="position:absolute;inset:0;transform:rotate(-90deg)"><circle cx="125" cy="125" r="108" fill="none" stroke="#2a2a2a" stroke-width="12"/><circle class="rc" cx="125" cy="125" r="108" fill="none" stroke="#2462EA" stroke-width="12" stroke-linecap="round" stroke-dasharray="678.6" stroke-dashoffset="678.6"/></svg>
     <div class="mono rt" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:56px;font-weight:600;color:#fff">00:00</div>
     <div class="mono" style="position:absolute;left:0;right:0;top:164px;text-align:center;font-size:17px;color:#888">分钟 · 出片</div></div>`, 1450, 300, { ax: .5, ay: .5 });
  const rc = ring.querySelector('.rc'), rt = ring.querySelector('.rt');
return {el:ring,rc,rt};},
"account":function(parent){const sc={el:parent};const PX=1000;  const acct = mk(sc.el, `<div style="width:1180px;background:#fff;border-radius:34px;padding:40px 46px 36px;box-shadow:0 40px 100px rgba(0,0,0,.35)">
     <div style="display:flex;align-items:center;gap:34px">
       <img src="assets/presenter.png" style="width:170px;height:170px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 6px #fff,0 0 0 9px #2462EA">
       <div style="flex:1"><div class="mono" style="font-size:20px;color:#8C8C8C">// 第一时间 · 启动</div>
         <div style="font:700 76px -apple-system,'PingFang SC';letter-spacing:-1.5px;line-height:1.1">示例<span style="color:var(--blue)">品牌</span></div>
         <div style="font:500 27px -apple-system,'PingFang SC';color:#3a3a3a;margin-top:6px">创作者简介 · 请按本期内容填写</div></div>
       <div class="sw" style="width:130px;height:74px;border-radius:37px;background:#E7E7E4;position:relative;flex:none"><div class="kn" style="position:absolute;top:7px;left:7px;width:60px;height:60px;border-radius:50%;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25)"></div></div></div>
     <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px">
       ${[['开始时间', '第 <b class="sv0">0</b> 天'], ['消耗时间', '<b class="sv1">0</b> 小时'], ['粉丝数', '<b class="sv2">0</b>'], ['收入', '¥ <b class="sv3">0</b>']].map(([k, v], i) => `<div class="stc" style="background:#F4F4F2;border-radius:20px;padding:18px 22px;opacity:0"><div class="mono" style="font-size:19px;color:#8C8C8C">// ${k}</div><div style="font:600 46px -apple-system,'PingFang SC';margin-top:4px;color:${i === 2 ? 'var(--blue)' : '#0A0A0A'}">${v}</div></div>`).join('')}</div></div>`, 960, 560, { ax: .5, ay: .5 });
  const stc = [...acct.querySelectorAll('.stc')], sv = [0, 1, 2, 3].map(i => acct.querySelector('.sv' + i));
  const sw = acct.querySelector('.sw'), kn = acct.querySelector('.kn');
return {el:acct,stc,sv,sw,kn};},
"nle":function(parent){const sc={el:parent};const PX=1000;  const tl = mk(sc.el, `<div class="card" style="width:1040px;height:300px;padding:64px 26px 20px;overflow:hidden">
     <div class="lb">// 手动剪辑 · timeline</div><div class="ix fc">frame 000000</div>
     ${[0, 1, 2, 3].map(r => `<div style="position:relative;height:44px;margin-bottom:10px">${Array.from({ length: 16 }, (_, i) => { const w = 30 + ((i * 37 + r * 13) % 70); const x = (i * 61 + r * 23) % 960; return `<div style="position:absolute;left:${x}px;top:0;width:${w}px;height:44px;border-radius:7px;background:${r === 3 ? '#cfe0ff' : ['#e8e8e5', '#dcdcd8', '#d2d2ce'][r % 3]};border:1.5px solid rgba(0,0,0,.06)"></div>`; }).join('')}</div>`).join('')}
     <div class="ph" style="position:absolute;top:52px;left:120px;width:3px;height:230px;background:#E5484D"><div style="position:absolute;top:-10px;left:-9px;width:21px;height:14px;border-radius:3px;background:#E5484D"></div></div>
     </div>`, 146, 560);
  const ph = tl.querySelector('.ph'), fc = tl.querySelector('.fc');
  const strike = mk(sc.el, `<div style="width:1100px;height:10px;background:#E5484D;border-radius:5px;transform-origin:0 50%"></div>`, 120, 712);
return {el:tl,ph,fc};},
"comment":function(parent){const sc={el:parent};const PX=1000;function packNumber(id,n){return n;}
  const cm = [['示例评论：整理后更容易找到资料', packNumber('s12.like_1', 328)], ['示例评论：新的工作区更清晰', packNumber('s12.like_2', 215)], ['示例评论：希望增加更多比较', packNumber('s12.like_3', 196)]];
  const ce = cm.map((c, i) => mk(sc.el, `<div class="dcard" style="width:760px;height:120px"><div style="position:absolute;left:22px;top:30px;width:60px;height:60px;border-radius:50%;background:${['#ff7eb3', '#6d9bff', '#ffb347'][i]}"></div><div style="position:absolute;left:104px;top:26px;font-size:30px">${c[0]}</div><div class="mono" style="position:absolute;left:104px;bottom:20px;font-size:19px;color:#777">♥ <span class="lk">${c[1]}</span></div></div>`, 146, 440 + i * 140));
return {el:ce[0],ce};},
"toggle":function(parent){const sc={el:parent};const PX=1000;const el=mk(sc.el,`<div class="sw" style="width:130px;height:74px;border-radius:37px;background:#E7E7E4;position:relative;flex:none"><div class="kn" style="position:absolute;top:7px;left:7px;width:60px;height:60px;border-radius:50%;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25)"></div></div>`,0,0,{ax:.5,ay:.5});return {el,sw:el.querySelector('.sw'),kn:el.querySelector('.kn')};}
};
