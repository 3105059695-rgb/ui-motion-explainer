/* Abhijeet Singh: observed dropdown summary mechanics; independently drawn SVG. */
(function(){
  'use strict';
  const source='https://x.com/abjt14/status/2097316524436627688';
  const media='https://cdn.collectui.com/amplify_video/2097242849330995200/vid/avc1/1322x1058/ZHzABr7hFweHl5Va-optimized.mp4';
  const defaults={title:'All Chains',prompt:'Ethereum',result:'Chains'};
  const limits={title:20,prompt:20,result:12};
  const glyphs={
    ethereum:'<circle cx="36" cy="36" r="35" fill="#353d47"/><path d="m36 12-15 24 15 9 15-9z" fill="#edf0f6"/><path d="m21 40 15 20 15-20-15 9z" fill="#f6f7fb"/><path d="m36 12-15 24 15 9z" fill="#fff"/>',
    base:'<circle cx="36" cy="36" r="35" fill="#0756ed"/><circle cx="36" cy="36" r="22" fill="#fff"/><path d="M11 35h43v5H11z" fill="#0756ed"/>',
    polygon:'<circle cx="36" cy="36" r="35" fill="#7039c9"/><path d="m22 24 10 6v12l-10 6-10-6V30zm28 0 10 6v12l-10 6-10-6V30zM27 33l18 10m-18 0 18-10" fill="none" stroke="#eee6ff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>',
    optimism:'<circle cx="36" cy="36" r="35" fill="#ea163e"/><path d="M30 21c-13 0-17 11-17 19 0 10 8 14 16 10l9-9-8-7-6 7c-5 2-7-1-6-5 1-5 4-10 9-9zm11-6h9c14 1 14 19 4 25l-10 5-5 13h-8l8-21 10-4c6-3 6-10 0-11h-6z" fill="#fff"/>'
  };
  const glyph=name=>'<svg viewBox="0 0 72 72" aria-hidden="true">'+glyphs[name]+'</svg>';
  const names=['ethereum','base','polygon','optimism'];
  const mini=()=>'<span class="dd21-mini">'+names.map((name,i)=>'<i style="left:'+(i%2)*36+'px;top:'+Math.floor(i/2)*36+'px">'+glyph(name)+'</i>').join('')+'</span>';
  const arrow='<svg viewBox="0 0 38 46" aria-hidden="true"><path d="M5 3v33l10-9 8 15 7-4-8-14 12-1z" fill="#161616" stroke="#fafafa" stroke-width="2.7" stroke-linejoin="round"/></svg>';
  UIFX.register({id:'interaction-dropdown-chain-multiselect',title:'链菜单 · 多选数量与图标联动',category:'interaction',duration:30,
    source,referenceMedia:media,sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'同一链菜单展开后，两轮呈现Ethereum单链、2 Chains双图标斜叠、3 Chains三格与空占位、All Chains四格；菜单末尾闭合。五行选项始终完整可读。',
    adaptationNotes:'依据1322×1058、13.366667秒来源的14个真正解码暂停帧，独立代码重建为1920×1080、30秒。保留深色画布、汇总胶囊、双向小箭头及All Chains/Ethereum/Base/Polygon/Optimism完整五行。两轮实见All→Ethereum→2 Chains→3 Chains→All，最后关闭。来源推近会裁掉下方列表，横屏实现保持五行可读；被裁掉的逐行勾选按可见汇总图标与Ethereum部分勾选推导呈现，并非这些低位行已直接观察。连续指针、行悬停、点击提示环、精确点击顺序与阅读时长是原创操作映射，不能当作原事件记录。SVG品牌glyph独立绘制，无远程像素、源代码或业务调用。未验证源声音、链过滤结果、账户或资金行为。',
    parameterNotes:'title替换All Chains组名与汇总全链状态，限20字符；prompt替换Ethereum菜单与单链汇总名称，限20字符；result替换数量后的Chains单位，限12字符。数量2/3、其他三链名称、图标与两轮状态顺序固定。',
    params:defaults,paramLimits:limits,tags:['Collect UI','Dropdown','多选菜单','图标联动','连续交互']
  },function(c,p){
    const clean=(v,f,n)=>Array.from(String(v??f).replace(/\s+/g,' ').trim()||f).slice(0,n).join('');
    const all=clean(p.title,defaults.title,20),eth=clean(p.prompt,defaults.prompt,20),unit=clean(p.result,defaults.result,12),e=c.esc;
    const units=text=>Array.from(text).reduce((sum,char)=>sum+(/[^\x00-\x7f]/.test(char)?1:/[MW@#%]/.test(char)?.78:/[ilI .]/.test(char)?.28:.56),0);
    const font=(text,width,max)=>Math.min(max,width/Math.max(1,units(text)*1.08));
    const headerWidth=Math.min(800,Math.max(620,240+46*Math.max(units(all),units(eth),units('3 '+unit))));
    const labels=[all,eth,'Base','Polygon','Optimism'],tops=[16,155,267,379,491];
    const row=(label,index)=>'<div class="dd21-row dd21-row-'+index+'" style="top:'+tops[index]+'px"><span class="dd21-circle"><svg viewBox="0 0 60 60" aria-hidden="true"><path d="m17 31 9 9 18-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="dd21-rowglyph">'+(index===0?mini():glyph(names[index-1]))+'</span><span class="dd21-label" style="font-size:'+font(label,544,44)+'px">'+e(label)+'</span></div>';
    c.root.innerHTML=`<style>
      .dd21{position:absolute;inset:0;background:#111;overflow:hidden;color:#f7f7f7;font-family:ProjectSans,sans-serif}.dd21 *{box-sizing:border-box}.dd21-component{position:absolute;left:560px;top:136px;width:800px;height:800px;transform-origin:0 0}.dd21-trigger{position:absolute;left:0;top:0;width:${headerWidth}px;height:124px;border:2px solid #292929;border-radius:68px;background:linear-gradient(135deg,#202020,#1c1c1c);box-shadow:inset 0 1px 2px #ffffff06,0 10px 35px #0002}.dd21-summary{position:absolute;left:140px;right:72px;top:0;height:120px;display:flex;align-items:center;white-space:nowrap;overflow:hidden;font-size:${font(all,headerWidth-214,46)}px;line-height:1.2;font-weight:500;letter-spacing:-.5px}.dd21-chevrons{position:absolute;right:36px;top:41px;width:27px;height:42px;color:#7d7d7d}.dd21-chevrons svg{display:block;width:27px;height:42px}.dd21-badges{position:absolute;left:38px;top:26px;width:78px;height:78px}.dd21-badge{position:absolute;left:0;top:0;width:72px;height:72px;transform-origin:0 0}.dd21-badge svg{display:block;width:72px;height:72px}.dd21-empty{position:absolute;left:36px;top:36px;width:35px;height:35px;border-radius:50%;background:#292929}.dd21-popup{position:absolute;left:0;top:170px;width:800px;height:624px;border:2px solid #292929;border-radius:44px;background:linear-gradient(120deg,#202020,#1b1b1b);box-shadow:inset 0 1px 2px #ffffff04,0 25px 55px #0003;transform-origin:26px 0}.dd21-divider{position:absolute;left:25px;right:25px;top:144px;height:2px;background:#2d2d2d}.dd21-row{position:absolute;left:18px;right:18px;height:112px;border-radius:23px}.dd21-circle{position:absolute;left:28px;top:26px;width:60px;height:60px;border:3px solid #3b3b3b;border-radius:50%;background:#1e1e1e}.dd21-circle svg{width:54px;height:54px;display:block;opacity:0}.dd21-rowglyph{position:absolute;left:125px;top:22px;width:70px;height:70px}.dd21-rowglyph>svg{width:66px;height:66px;display:block}.dd21-mini{position:relative;display:block;width:72px;height:72px}.dd21-mini>i{position:absolute;width:32px;height:32px}.dd21-mini svg{display:block;width:32px;height:32px}.dd21-label{position:absolute;left:216px;right:22px;top:0;height:112px;display:flex;align-items:center;line-height:1.2;white-space:nowrap;overflow:hidden;color:#969696;letter-spacing:-.4px;font-weight:500}.dd21-hover{position:absolute;left:18px;top:16px;width:760px;height:112px;border-radius:23px;background:#282828;opacity:0}.dd21-pointer{position:absolute;left:0;top:0;width:38px;height:46px;z-index:9;transform-origin:5px 3px;filter:drop-shadow(0 3px 2px #0008)}.dd21-pointer svg{width:38px;height:46px;display:block}.dd21-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:2px solid #a694ff;border-radius:50%;z-index:8;pointer-events:none}.dd21-proof{position:absolute;right:92px;bottom:32px;color:#737373;font-size:18px;line-height:26px}
    </style><div class="dd21"><div class="dd21-component"><div class="dd21-trigger"><div class="dd21-badges"><i class="dd21-empty"></i>${names.map(name=>'<span class="dd21-badge dd21-badge-'+name+'">'+glyph(name)+'</span>').join('')}</div><span class="dd21-summary">${e(all)}</span><span class="dd21-chevrons"><svg viewBox="0 0 27 42" aria-hidden="true"><path d="m5 11 8-7 8 7m-16 20 8 7 8-7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="dd21-popup"><div class="dd21-hover"></div><div class="dd21-divider"></div>${labels.map(row).join('')}</div></div><div class="dd21-ring"></div><div class="dd21-pointer">${arrow}</div><div class="dd21-proof">界面示意 · 独立矢量与时序适配</div></div>`;
    const q=selector=>c.q(selector),tl=c.gsap.timeline({paused:true}),popup=q('.dd21-popup'),summary=q('.dd21-summary'),pointer=q('.dd21-pointer'),hover=q('.dd21-hover'),ring=q('.dd21-ring');
    const layouts={
      1:[{x:0,y:0,scale:1,opacity:1},{x:32,y:30,scale:.3,opacity:0},{x:0,y:36,scale:.3,opacity:0},{x:36,y:36,scale:.3,opacity:0}],
      2:[{x:0,y:0,scale:.76,opacity:1},{x:28,y:28,scale:.76,opacity:1},{x:0,y:36,scale:.3,opacity:0},{x:36,y:36,scale:.3,opacity:0}],
      3:[{x:0,y:0,scale:.48,opacity:1},{x:36,y:0,scale:.48,opacity:1},{x:0,y:36,scale:.48,opacity:1},{x:36,y:36,scale:.3,opacity:0}],
      4:[{x:0,y:0,scale:.48,opacity:1},{x:36,y:0,scale:.48,opacity:1},{x:0,y:36,scale:.48,opacity:1},{x:36,y:36,scale:.48,opacity:1}]
    };
    tl.set(q('.dd21-component'),{x:0,y:0,scale:1,rotation:0,opacity:1},0)
      .set(popup,{x:0,y:-12,scale:.98,rotation:0,opacity:0},0)
      .set(hover,{x:0,y:0,scale:1,rotation:0,opacity:0},0)
      .set(pointer,{x:1100,y:460,scale:1,rotation:0,opacity:0},0)
      .set(ring,{x:0,y:0,scale:.35,rotation:0,opacity:0},0)
      .set(summary,{textContent:all,fontSize:font(all,headerWidth-214,46),opacity:1,x:0,y:0,scale:1},0)
      .set(q('.dd21-empty'),{opacity:0,x:0,y:0,scale:1},0);
    names.forEach((name,index)=>tl.set(q('.dd21-badge-'+name),{...layouts[4][index],rotation:0},0));
    labels.forEach((_,index)=>{
      tl.set(q('.dd21-row-'+index+' .dd21-circle'),{backgroundColor:index===0?'#9486fa':'#1e1e1e',borderColor:index===0?'#9486fa':'#3b3b3b',scale:1,rotation:0},0)
        .set(q('.dd21-row-'+index+' .dd21-circle svg'),{opacity:index===0?1:0,scale:1,rotation:0},0)
        .set(q('.dd21-row-'+index+' .dd21-label'),{color:index===0?'#fafafa':'#969696'},0);
    });
    const target=index=>index==='trigger'?{x:560+headerWidth-70,y:198}:{x:632,y:306+tops[index]+56};
    function move(index,time,duration=.5){const point=target(index);tl.to(pointer,{x:point.x-5,y:point.y-3,opacity:1,duration,ease:'power2.inOut'},time);if(index==='trigger')tl.to(hover,{opacity:0,duration:.14},time);else tl.to(hover,{y:tops[index]-16,opacity:.55,duration:.2},time+.15);}
    function press(index,time){const point=target(index);tl.set(ring,{x:point.x-25,y:point.y-25,scale:.3,opacity:0},time).to(ring,{scale:1.08,opacity:.68,duration:.16},time).to(ring,{scale:1.3,opacity:0,duration:.26},time+.16).to(pointer,{scale:.9,duration:.08},time).to(pointer,{scale:1,duration:.14},time+.08);}
    function select(count,time){
      const text=count===4?all:count===1?eth:count+' '+unit;
      tl.to(summary,{opacity:0,y:-4,duration:.12},time)
        .set(summary,{textContent:text,fontSize:font(text,headerWidth-214,46),y:4},time+.12)
        .to(summary,{opacity:1,y:0,duration:.24,ease:'power2.out'},time+.12);
      names.forEach((name,index)=>tl.to(q('.dd21-badge-'+name),{...layouts[count][index],duration:.45,ease:'power2.inOut'},time));
      tl.to(q('.dd21-empty'),{opacity:count===3?1:0,duration:.25},time);
      labels.forEach((_,index)=>{const checked=count===4?index===0:index>0&&index<=count;
        tl.to(q('.dd21-row-'+index+' .dd21-circle'),{backgroundColor:checked?'#9486fa':'#1e1e1e',borderColor:checked?'#9486fa':'#3b3b3b',duration:.25},time)
          .to(q('.dd21-row-'+index+' .dd21-circle svg'),{opacity:checked?1:0,duration:.2},time)
          .to(q('.dd21-row-'+index+' .dd21-label'),{color:checked?'#fafafa':'#969696',duration:.2},time);
      });
    }
    move('trigger',.85,.6);press('trigger',2);tl.to(popup,{opacity:1,y:0,scale:1,duration:.45,ease:'power2.out'},2.1);
    const changes=[{row:1,count:1,time:4.7},{row:2,count:2,time:7.2},{row:3,count:3,time:9.7},{row:4,count:4,time:12.2},{row:1,count:1,time:15.2},{row:2,count:2,time:17.7},{row:3,count:3,time:20.2},{row:4,count:4,time:22.7}];
    changes.forEach(({row,count,time})=>{move(row,time-.85,.55);press(row,time);select(count,time+.1);});
    tl.to(hover,{opacity:0,duration:.3},23.5);move('trigger',24.85,.6);press('trigger',25.8);
    tl.to(popup,{opacity:0,y:-12,scale:.98,duration:.4,ease:'power2.in'},25.9)
      .to(pointer,{x:1450,y:510,opacity:0,duration:.7,ease:'power2.inOut'},26.8).set({}, {},30);
    return {timeline:tl,duration:30};
  });
})();
