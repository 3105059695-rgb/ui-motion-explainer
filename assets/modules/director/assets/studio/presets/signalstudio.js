/* Node patching study. The source footage is referenced, never embedded. */
(function(){
  'use strict';
  const curve=(a,b)=>`M${a[0]} ${a[1]} C${a[0]+160} ${a[1]} ${b[0]-160} ${b[1]} ${b[0]} ${b[1]}`;
  const mainRoute=curve([970,137],[1190,380]);
  function sphere(cx,cy,r){
    let dots='';
    for(let row=1;row<14;row++)for(let col=0;col<25;col++){
      const lat=row*Math.PI/14,lon=col*2*Math.PI/25;
      const z=Math.sin(lat)*Math.cos(lon);
      if(z<-.18)continue;
      const x=cx+r*Math.sin(lat)*Math.sin(lon),y=cy+r*Math.cos(lat);
      dots+=`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(1.4+2.3*(z+1)/2).toFixed(2)}" fill="#eee" opacity="${(.14+.8*(z+1)/2).toFixed(2)}"/>`;
    }
    return dots;
  }
  const thumb=(kind)=>`<svg viewBox="0 0 210 82" aria-hidden="true"><rect width="210" height="82" fill="${(kind===1||kind===5)?'#e2d717':'#101112'}"/>${kind===0?sphere(106,40,36):kind===1?'<text x="13" y="57" fill="#141414" font-size="53" font-family="monospace" font-weight="700">FX—01</text>':kind===2?Array.from({length:12},(_,i)=>`<path d="M0 ${i*7}L${50+i*4} ${i*7-6}H${110+i*3}L210 ${i*7}" stroke="${i%3?'#fafafa':'#dace17'}" stroke-width="${i%3+1}"/>`).join(''):kind===3?'<path d="M10 69 60 17 92 56 126 25 198 70Z" fill="#eee"/><path d="M16 71 67 35 104 70Z" fill="#aaa"/>':kind===4?'<circle cx="105" cy="41" r="34" fill="none" stroke="#ddd" stroke-dasharray="1 4" stroke-width="9"/><path d="M105 20V41l19 11" fill="none" stroke="#ddd" stroke-width="2"/>':Array.from({length:45},(_,i)=>`<path d="M${8+i*4.4} ${41-(10+25*Math.abs(Math.sin(i*.6)))}v${20+50*Math.abs(Math.sin(i*.6))}" stroke="#171717" stroke-width="2"/>`).join('')}</svg>`;
  UIFX.register({
    id:'software-signal-node-patch',title:'Signal Studio · 拖线接入实时预览',category:'software',duration:18,
    source:'https://x.com/mrblackstudio/status/2086949571712999904',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2086949356255539200/vid/avc1/2880x2160/tWKpBAlJfbFfRJED-optimized.mp4',
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'黑黄音画工作台：启用 Glitch Cut、参数原位变化，光标把 Mic words glitch 的 FX out 拖到 Scene output；虚线吸附成实线，预览短暂清空后显示原创点阵故障画面。',
    adaptationNotes:'依据Lee Black视频的参数面板、拖线中间态及连线完成态重建，重新编排为18秒横屏。原人物背景、媒体与音轨不分发，缩略图和可视化为原创SVG；密集已有线路按可见结构概括重排，不代表完整56秒原片或音频驱动引擎。',
    tags:['Collect UI','AI Flow','节点拖拽','实时预览','黑黄','参数面板'],
    params:{title:'One Hour Set',result:'FLOW / 026'}
  },function(c,p){
    const e=c.esc;
    const effects=[
      {id:'mic',title:'Mic words glitch',type:'Effect',x:750,y:80,ins:['Audio data in','Control in','Media in','Visual in'],outs:['FX out','Visual out']},
      {id:'glitch',title:'Glitch',type:'Effect',x:750,y:275,ins:['Audio data in','Control in','Media in'],outs:['FX out','Visual out']},
      {id:'map',title:'Map range',type:'Number',x:750,y:435,ins:['Audio data in'],outs:['Control out']},
      {id:'dither',title:'3D dither',type:'Visual',x:750,y:535,ins:['Audio data in','Media in','FX in'],outs:['Visual out']},
      {id:'storm',title:'Data storm',type:'Effect',x:750,y:665,ins:['Audio data in','Control in','Media in','Visual in'],outs:['FX out','Visual out']},
      {id:'output',title:'Scene output',type:'Scene',x:1190,y:300,ins:['Visual in','FX in'],outs:['Screen out']},
      {id:'map-right',title:'Map range',type:'Number',x:1190,y:470,ins:['Audio data in'],outs:['Control out']}
    ];
    const node=d=>`<div class="sig-node sig-${d.id}" style="left:${d.x}px;top:${d.y}px;height:${47+Math.max(d.ins.length,d.outs.length)*23}px"><div class="sig-node-title">${e(d.title)}<span>◉ ◇</span></div><div class="sig-type">${d.type}</div><div class="sig-ports">${d.ins.map((x,i)=>`<div class="sig-port in" style="top:${i*23}px"><i></i>${e(x)}</div>`).join('')}${d.outs.map((x,i)=>`<div class="sig-port out" style="top:${i*23}px">${e(x)}<i></i></div>`).join('')}</div></div>`;
    const media=['Video','Typography','Glitch','Blocks','Clock','Soundscape'];
    const mediaHTML=media.map((name,i)=>`<div class="sig-media" style="left:${i%2?285:40}px;top:${235+Math.floor(i/2)*187}px"><div class="sig-node-title">${name}<span>◉ ◇</span></div><div class="sig-type">Media</div>${thumb(i)}<div class="sig-media-out">Media out <i></i></div></div>`).join('');
    const paths=[[[250,159],[750,332]],[[250,159],[750,492]],[[250,159],[750,722]],[[250,374],[750,183]],[[250,374],[750,378]],[[250,374],[750,615]],[[495,374],[750,768]],[[250,561],[750,768]],[[495,561],[750,592]],[[250,748],[750,768]],[[495,748],[750,768]],[[970,332],[1190,380]],[[970,592],[1190,527]],[[1410,527],[1190,357]],[[970,722],[1190,380]]];
    const sliderNames=['Scene glitch','Video mix','Slow motion','Frame jump'];
    const initial=[.23,.28,.42,.38],final=[.72,1,.22,.78];
    c.root.innerHTML=`<style>
      .sig-scene{background:#e3d914;color:#d6d6d6;font-family:ProjectSans,sans-serif}.sig-scene *{box-sizing:border-box}.sig-app{position:absolute;left:70px;top:62px;width:1780px;height:950px;overflow:hidden;border-radius:19px;background:#151515;border:1px solid #4d4a18;box-shadow:0 17px 38px -16px #17170d77}
      .sig-top{height:58px;background:#101010;border-bottom:1px solid #232323;display:flex;align-items:center;justify-content:space-between;padding:0 26px;font-size:20px;color:#ddd}.sig-title{position:absolute;width:600px;text-align:center;left:590px;font-size:22px;line-height:34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sig-logo{width:16px;height:16px;background:#efdf21;border-radius:50%;box-shadow:0 0 0 5px #e1d82115}.sig-top-tools{display:flex;gap:18px;align-items:center;font-size:18px}.sig-play{width:29px;height:29px;background:#e8dc1b;color:#222;border-radius:6px;display:grid;place-items:center}
      .sig-toolbar{position:absolute;left:37px;right:338px;top:72px;display:flex;align-items:center;justify-content:space-between;font-size:18px;line-height:29px;color:#9b9b9b;z-index:3;pointer-events:none}.sig-add{background:#ddd225;color:#191919;border-radius:5px;width:28px;height:28px;text-align:center;font-size:22px}.sig-toolbar span{background:#222;border:1px solid #272727;padding:4px 9px;border-radius:5px;margin-left:7px}
      .sig-canvas{position:absolute;left:20px;top:75px;width:1430px;height:825px;overflow:hidden}.sig-wires{position:absolute;inset:0;width:1430px;height:825px;overflow:visible;pointer-events:none}.sig-wire{fill:none;stroke:#b6ad26;stroke-width:1.7;opacity:.59}.sig-route{fill:none;stroke:#f4e745;stroke-width:2.4}.sig-drag-route{stroke-dasharray:5 6;opacity:0}.sig-new-route{opacity:0}.sig-node,.sig-media,.sig-audio{position:absolute;background:#101111;border:1px solid #242424;border-radius:9px;box-shadow:0 3px 6px #0003}.sig-node{width:220px;padding:7px 10px}.sig-node-title{font-size:19px;line-height:24px;color:#c3c3c3;display:flex;align-items:center;justify-content:space-between;white-space:nowrap;letter-spacing:-.2px}.sig-node-title span{font-size:15px;letter-spacing:5px;color:#777}.sig-type{color:#626266;font-size:14px;line-height:17px}.sig-ports{position:absolute;left:0;right:0;top:46px;font-size:14px;line-height:20px;color:#858585}.sig-port{position:absolute;width:106px;height:20px;background:#1b1b1c;padding:0 7px;white-space:nowrap}.sig-port.in{left:0;padding-left:13px}.sig-port.out{right:0;padding-right:13px;text-align:right}.sig-port i,.sig-media-out i{position:absolute;top:7px;width:6px;height:6px;border-radius:50%;background:#dace22}.sig-port.in i{left:-3px}.sig-port.out i{right:-3px}.sig-mic{border-color:#655e23;box-shadow:0 0 0 1px #eadd1025}.sig-output .sig-port.in:nth-child(2){background:#24231a}
      .sig-media{width:210px;height:154px;padding:6px 8px}.sig-media svg{display:block;width:192px;height:75px;margin-top:3px;overflow:hidden;border-radius:3px}.sig-media-out{position:absolute;bottom:4px;left:8px;right:0;font-size:14px;line-height:20px;color:#8e8e8e}.sig-media-out i{right:-3px}.sig-audio{left:40px;top:90px;width:210px;height:82px;padding:7px 10px}.sig-audio .sig-audio-out{font-size:14px;line-height:22px;background:#1c1c1d;margin-top:8px;color:#929292;position:relative}.sig-audio-out i{position:absolute;right:-13px;top:8px;width:6px;height:6px;background:#e2d521;border-radius:50%}
      .sig-target-plus{position:absolute;left:1177px;top:367px;width:27px;height:27px;border-radius:50%;background:#17a66d;border:2px solid #88edc9;display:grid;place-items:center;font-size:22px;line-height:24px;color:#fff;opacity:0;z-index:5}
      .sig-preview{position:absolute;left:963px;top:605px;width:460px;height:214px;border-radius:11px;background:#060607;border:1px solid #292929;overflow:hidden;box-shadow:0 8px 22px #0005}.sig-preview-head{height:34px;display:flex;align-items:center;justify-content:space-between;background:#0c0d0e;padding:0 12px;font-size:17px;color:#bdbfc4}.sig-preview-head span{padding:2px 9px;background:#222;border-radius:4px;color:#aaa}.sig-preview svg{width:460px;height:159px;display:block;background:#010203}.sig-preview-foot{height:19px;padding:0 10px;font-size:11px;line-height:19px;color:#777;display:flex;justify-content:space-between}.sig-preview-foot i{width:4px;height:4px;background:#69b291;border-radius:50%;display:inline-block;margin-right:5px}.sig-preview-blank{position:absolute;top:34px;left:0;right:0;height:159px;background:#000;opacity:0}.sig-preview-title{font-family:monospace;letter-spacing:5px;font-size:24px;fill:#bbb;opacity:.52}
      .sig-inspector{position:absolute;left:1450px;top:75px;width:306px;bottom:47px;padding:0 17px;background:#131313;border-left:1px solid #1c1c1c}.sig-tabs{height:36px;display:flex;gap:5px;font-size:17px;line-height:29px;margin-bottom:25px}.sig-tabs span{padding:1px 12px;background:#1b1b1c;border-radius:5px}.sig-tabs span:first-child{background:#303031;color:#fff}.sig-field-label{font-size:16px;color:#737377;line-height:27px;margin-top:21px}.sig-value{height:38px;line-height:38px;background:#1b1b1c;border-radius:5px;padding:0 12px;font-size:19px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sig-enabled{height:39px;line-height:39px;text-align:center;background:#303030;border-radius:5px;font-size:18px;color:#cecece}.sig-amount{margin-top:20px}.sig-slider-label{font-size:16px;color:#909094;display:flex;justify-content:space-between;line-height:25px}.sig-slider-label b{font-weight:400;color:#bebebe;font-size:17px}.sig-slider{height:3px;position:relative;background:#424240;margin:12px 0 17px;width:268px}.sig-slider-fill{position:absolute;height:3px;left:0;width:100%;transform-origin:0 50%;background:#dfd024}.sig-knob{position:absolute;top:-5px;width:13px;height:13px;background:#e3e3e1;border-radius:50%;box-shadow:0 1px 2px #0006;left:0}
      .sig-cut{height:37px;background:#333;border-radius:5px;color:#ddd;font-size:18px;line-height:37px;text-align:center}.sig-modes{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:6px 0 12px;font-size:14px;color:#acacac}.sig-modes span{background:#222;border-radius:4px;line-height:23px;text-align:center}.sig-edit-controls{display:flex;gap:8px;margin-top:28px}.sig-edit-controls span{background:#292929;border-radius:5px;line-height:36px;text-align:center;font-size:17px;flex:1;color:#aaa}.sig-simple-controls{position:absolute;left:17px;right:17px;top:211px;opacity:0}.sig-simple-controls .sig-edit-controls{margin-top:20px}.sig-bottom{position:absolute;left:30px;bottom:11px;display:flex;gap:10px;color:#c3c3c3;font-size:16px}.sig-bottom span{padding:7px 13px;background:#242424;border-radius:4px}.sig-pointer{position:absolute;left:0;top:0;z-index:20;width:38px;height:46px;transform-origin:4px 3px}.sig-pointer .fx-cursor path{fill:#e8e8e8;stroke:#171717;stroke-width:2.4}.sig-ring{position:absolute;left:0;top:0;width:48px;height:48px;border:2px solid #e8dd29;border-radius:50%;opacity:0;z-index:19}.sig-proof{position:absolute;right:71px;bottom:19px;font-size:17px;line-height:25px;color:#666017}
    </style><div class="fx-scene sig-scene"><div class="sig-app"><header class="sig-top"><i class="sig-logo"></i><div class="sig-title">${e(p.title||'One Hour Set')} ⌄</div><div class="sig-top-tools">Output <span class="sig-play">▶</span></div></header><div class="sig-toolbar"><b class="sig-add">+</b><div><span>−</span><span>+</span><span>Fit</span><span>Reset</span><span>72%</span></div></div>
      <div class="sig-canvas"><svg class="sig-wires" viewBox="0 0 1430 825">${paths.map(x=>`<path class="sig-wire" d="${curve(x[0],x[1])}"/>`).join('')}<path class="sig-route sig-drag-route" d="M970 137 C970 137 970 137 970 137"/><path class="sig-route sig-new-route" d="${mainRoute}"/></svg><div class="sig-audio"><div class="sig-node-title">My input<span>◉ ◇</span></div><div class="sig-type">Audio</div><div class="sig-audio-out">Audio data out<i></i></div></div>${mediaHTML}${effects.map(node).join('')}<span class="sig-target-plus">+</span>
      <div class="sig-preview"><div class="sig-preview-head">Scene preview <span>Ⅱ</span></div><svg viewBox="0 0 460 159"><defs><clipPath id="sig-preview-clip"><rect width="460" height="159"/></clipPath></defs><g clip-path="url(#sig-preview-clip)"><g class="sig-sphere">${sphere(230,80,71)}</g><g class="sig-scanlines">${Array.from({length:11},(_,i)=>`<rect x="${i%3*29}" y="${i*15}" width="${320+i%4*48}" height="${i%3+1}" fill="${i%4?'#dfe3e6':'#e7da22'}" opacity="${i%3===0?.45:.19}"/>`).join('')}</g><g class="sig-glitch-bars">${Array.from({length:9},(_,i)=>`<rect x="${(i*67)%360}" y="${i*19}" width="${20+(i*17)%86}" height="${3+i%4*2}" fill="${i%3?'#e7e8eb':'#f0df24'}" opacity=".75"/>`).join('')}</g><text class="sig-preview-title" x="36" y="116">${e(String(p.result||'FLOW / 026').slice(0,24))}</text></g></svg><div class="sig-preview-foot"><span><i></i>graph valid</span><span>示例输出 · 14 nodes</span></div><div class="sig-preview-blank"></div></div></div>
      <aside class="sig-inspector"><div class="sig-tabs"><span>Inspect</span><span>Scene</span><span>Graph</span></div><div class="sig-field-label">Node title</div><div class="sig-value">Mic words glitch</div><div class="sig-field-label sig-kind-label">Effect</div><div class="sig-enabled">Enabled</div><div class="sig-effect-controls"><div class="sig-amount"><div class="sig-slider-label">Mode amount<b>0.65</b></div><div class="sig-slider"><i class="sig-slider-fill" style="transform:scaleX(.65)"></i><i class="sig-knob" style="left:174px"></i></div></div><div class="sig-field-label">Effect controls</div><div class="sig-cut">Use Glitch Cut</div><div class="sig-field-label">Animation submode</div><div class="sig-modes">${['Auto','Corner Net','Acid Arrows','Label Drift','Micro Grid','Rave Mesh','Blue Slow','Sequencer','Heat Tags','Scan Strings','All Points','Glitch Cut'].map(s=>`<span>${s}</span>`).join('')}</div>${sliderNames.map((s,i)=>`<div class="sig-value-slider slider-${i}"><div class="sig-slider-label">${s}<b>${initial[i].toFixed(2)}</b></div><div class="sig-slider"><i class="sig-slider-fill"></i><i class="sig-knob"></i></div></div>`).join('')}<div class="sig-edit-controls"><span>Duplicate</span><span>Delete</span></div></div><div class="sig-simple-controls"><div class="sig-edit-controls"><span>Duplicate</span><span>Delete</span></div></div></aside>
      <div class="sig-bottom"><span>Visual Build Up</span><span>High Energy</span><span>+</span></div><div class="sig-pointer">${c.cursor()}</div><div class="sig-ring"></div></div><div class="sig-proof">界面与连线机制重建 · 原创图形预览 · 无音频输入</div></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true}),pointer=q('.sig-pointer'),ring=q('.sig-ring');
    tl.set(pointer,{x:1570,y:260,opacity:0,scale:1},0).set(ring,{x:0,y:0,opacity:0,scale:.3},0)
      .set(q('.sig-drag-route'),{opacity:0,attr:{d:'M970 137 C970 137 970 137 970 137'}},0)
      .set(q('.sig-new-route'),{opacity:0},0).set(q('.sig-target-plus'),{opacity:0,scale:.7},0)
      .set(q('.sig-preview-blank'),{opacity:0},0).set(q('.sig-glitch-bars'),{opacity:.1},0)
      .set(q('.sig-sphere'),{transformOrigin:'230px 80px',scaleX:1,opacity:.72},0)
      .set(q('.sig-scanlines'),{y:0,opacity:.2},0);
    initial.forEach((value,i)=>tl.set(q('.slider-'+i+' .sig-slider-fill'),{scaleX:value},0).set(q('.slider-'+i+' .sig-knob'),{x:268*value},0));
    tl.to(pointer,{opacity:1,x:1600,y:415,duration:.8,ease:'power2.inOut'},1.2);
    c.click(tl,pointer,ring,1600,415,2.3);
    tl.set(q('.sig-cut'),{textContent:'Glitch Cut active',backgroundColor:'#484322',color:'#e4daa0'},2.4);
    final.forEach((value,i)=>{
      tl.to(q('.slider-'+i+' .sig-slider-fill'),{scaleX:value,duration:.55,ease:'power2.inOut'},2.5+i*.11)
        .to(q('.slider-'+i+' .sig-knob'),{x:268*value,duration:.55,ease:'power2.inOut'},2.5+i*.11)
        .set(q('.slider-'+i+' b'),{textContent:value.toFixed(2)},2.85+i*.11);
    });
    tl.to(q('.sig-glitch-bars'),{opacity:.7,duration:.45},2.6)
      .to(pointer,{x:990,y:212,duration:1.2,ease:'power2.inOut'},4.7);
    c.click(tl,pointer,ring,990,212,6.1);
    tl.set(q('.sig-drag-route'),{opacity:1},6.2)
      .to(q('.sig-drag-route'),{attr:{d:mainRoute},duration:1.6,ease:'power2.inOut'},6.25)
      .to(pointer,{x:1210,y:455,duration:1.6,ease:'power2.inOut'},6.25)
      .to(q('.sig-target-plus'),{opacity:1,scale:1,duration:.18},7.6)
      .to(q('.sig-output'),{borderColor:'#b8ad40',boxShadow:'0 0 0 2px #e2d11d22',duration:.2},7.6)
      .set(q('.sig-drag-route'),{opacity:0},8.08).set(q('.sig-new-route'),{opacity:1},8.08)
      .to(q('.sig-target-plus'),{opacity:0,scale:.7,duration:.2},8.12)
      .to(pointer,{x:1292,y:507,duration:.5,ease:'power2.out'},8.1)
      .set(q('.sig-value'),{textContent:'Scene output'},8.1).set(q('.sig-kind-label'),{textContent:'Scene'},8.1)
      .to(q('.sig-effect-controls'),{opacity:0,duration:.25},8.1).to(q('.sig-simple-controls'),{opacity:1,duration:.25},8.15)
      .to(q('.sig-preview-blank'),{opacity:1,duration:.1},8.15).to(q('.sig-preview-blank'),{opacity:0,duration:.45},9.2)
      .to(pointer,{opacity:0,duration:.25},9.2)
      .to(q('.sig-mic'),{borderColor:'#242424',boxShadow:'0 3px 6px #0003',duration:.3},8.2);
    // All preview movement is deterministic artwork, not a captured or live audio stream.
    tl.to(q('.sig-sphere'),{scaleX:.65,duration:1.3,repeat:11,yoyo:true,ease:'sine.inOut'},0)
      .to(q('.sig-scanlines'),{y:14,duration:.42,repeat:37,yoyo:true,ease:'none'},0)
      .to(q('.sig-glitch-bars'),{x:27,duration:.17,repeat:81,yoyo:true,ease:'steps(2)'},2.5)
      .to(q('.sig-scanlines'),{opacity:.75,duration:.3},9.45)
      .to(q('.sig-preview-title'),{opacity:.8,duration:.3},9.6)
      .to(q('.sig-preview'),{borderColor:'#7b762d',duration:.3,yoyo:true,repeat:1},9.5)
      .to({}, {duration:.01},17.99);
    return{timeline:tl,duration:18};
  });
})();
