/* Preview-only media adapter. Source scenes, timing and choreography are unchanged. */
(() => {
 const base=window.DEMO_ASSET_BASE||'assets/';
 const aliases={'x_macbook.png':'device-laptop.svg','x_crt.png':'device-crt.svg','b_fly.png':'bird.svg','b_squawk.png':'bird.svg','p_crt_stress.png':'person.svg','p_gamepad.png':'person.svg','p_typing_excited.png':'person.svg','c_a.png':'person-wave.svg','presenter.png':'presenter.svg','app-logo.png':'app-logo.svg','wall-badge.png':'wall-badge.svg'};
 const originalMk=mk;
 mk=function(parent,content,...args){
   content=content.replace(/assets\/([^'"\s<>]+)/g,(_,name)=>base+(aliases[name]||'app-logo.svg'));
   return originalMk(parent,content,...args);
 };
 const oldFrame=setFrame; const cache=new Map();
 const color=['#2462ea','#7958df','#11a59c','#d65885','#f59b42','#4b88be','#6072d6','#277775','#ab709c'];
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 function data(w,h,body){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);}
 function frame(dir,n){
   const key=dir+':'+n;if(cache.has(key))return cache.get(key);
   let hash=0;for(const c of dir)hash=(hash*31+c.charCodeAt(0))>>>0;const C=color[hash%color.length],p=(n%180)/180;
   const software=/soft|work|coding/.test(dir);let body='';
   if(software){
     const code=dir==='coding';
     body=`<rect width="960" height="540" fill="#111821"/><rect width="960" height="40" fill="#273140"/><circle cx="22" cy="20" r="6" fill="#ee6264"/><circle cx="43" cy="20" r="6" fill="#eec263"/><circle cx="64" cy="20" r="6" fill="#67c295"/><text x="90" y="26" font-family="Microsoft YaHei" fill="#d7e0ef" font-size="16">${code?'示意代码操作':'示意剪辑软件 · 界面机制演示'}</text><rect x="0" y="40" width="172" height="500" fill="#1b2431"/>`;
     for(let i=0;i<6;i++)body+=`<rect x="18" y="${72+i*53}" width="135" height="34" rx="6" fill="${i===Math.floor(p*6)?C:'#2c3849'}"/><text x="30" y="${94+i*53}" font-family="Microsoft YaHei" fill="#c4d1e2" font-size="14">${['项目 / 示例','媒体示意','动效参数','时间轴','导出预览','操作日志'][i]}</text>`;
     if(code){const lines=['const clip = createScene();','clip.duration = 8.0;','clip.motion = spring(0.6);','clip.camera.pushIn(1.04);','clip.timeline.add(title);','preview.renderAt(time);','// 示意代码 · 非真实录屏'];const count=Math.floor((n%150)/150*7)+1;for(let i=0;i<7;i++){let s=i<count?lines[i]:'';body+=`<text x="198" y="${102+i*46}" font-family="Consolas,monospace" fill="${i%2? '#87b5ff':'#a6ddc6'}" font-size="24">${esc(s)}</text>`;}body+=`<rect x="198" y="454" width="${120+560*p}" height="8" rx="4" fill="${C}"/>`;}
     else {
       const x=350+Math.sin(n*.028)*62,rot=Math.sin(n*.02)*9;
       body+=`<rect x="197" y="62" width="735" height="305" rx="10" fill="#0c111a"/><g transform="translate(${x.toFixed(1)},190) rotate(${rot.toFixed(1)})"><rect x="-66" y="-67" width="132" height="132" rx="25" fill="${C}"/><path d="M-20 -37L39 0L-20 37Z" fill="white"/></g><text x="650" y="157" text-anchor="middle" font-family="Microsoft YaHei" font-size="31" fill="#fff">结构示意</text><text x="650" y="199" text-anchor="middle" font-family="Microsoft YaHei" font-size="18" fill="#7e94b1">鼠标 → 状态 → 动作 → 反馈</text>`;
       for(let r=0;r<3;r++)for(let j=0;j<7;j++)body+=`<rect x="${200+j*101}" y="${408+r*31}" width="92" height="22" rx="4" fill="${r===1?C:'#435068'}" opacity="${.55+(j%3)*.16}"/>`;
       body+=`<rect x="${220+680*p}" y="391" width="3" height="130" fill="#f47484"/><path d="M${570+120*Math.sin(n*.03)} ${251+45*Math.cos(n*.03)}l-13-23v30l8-5 5 11 7-3-6-12z" fill="white"/>`;
     }
   }else{
     const lens=dir==='mv_lens', q=lens?Math.min(1,n/345):p;
     body=`<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#10182a"/><stop offset="1" stop-color="${C}"/></linearGradient></defs><rect width="960" height="540" fill="url(#bg)"/>`;
     const cx=360+160*Math.sin(n*.017+hash%7),cy=250+50*Math.cos(n*.023),z=lens?1+q*.7:1;
     body+=`<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${(n*.3)%360}) scale(${z})"><rect x="-105" y="-105" width="210" height="210" rx="48" fill="white" opacity=".9"/><circle r="65" fill="${C}"/><path d="M-19-35L38 0L-19 35Z" fill="white"/></g><circle cx="${780-190*p}" cy="${110+270*p}" r="98" fill="white" opacity=".12"/><path d="M-20 510 Q480 ${200-200*p} 990 490" stroke="white" stroke-width="5" opacity=".25" fill="none"/>`;
     body+=`<text x="42" y="60" font-family="Microsoft YaHei" font-size="24" font-weight="700" fill="white">示意作品 ${String(hash%27+1).padStart(2,'0')}</text><text x="42" y="490" font-family="Microsoft YaHei" font-size="22" fill="white">${lens?'镜头位移与缩放 · 示例':dir==='opus_hero'?'重点作品演示 · 生成图形':dir==='prev'?'上一作品 · 生成图形':'动态媒体占位 · '+esc(dir)}</text><rect x="42" y="511" width="${40+875*p}" height="3" rx="2" fill="white"/>`;
   }
   const url=data(960,540,body);if(cache.size>1500)cache.clear();cache.set(key,url);return url;
 }
 setFrame=function(im,src){
   let out=src;
   if(src.startsWith('talk/'))out=base+'presenter.svg';
   else{const m=src.match(/^sc\/([^/]+)\/f_(\d+)\.jpg$/);if(m)out=frame(m[1],+m[2]);}
   if(src.startsWith('assets/'))out=base+(aliases[src.substring(7)]||'app-logo.svg');
   oldFrame(im,out);
 };
 window.DEMO_WALL_BASE=base;
 window.DEMO_FRAME_GENERATOR=frame;
})();
