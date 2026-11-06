/* Production-only material adaptation from agent-editorial.js card/screen/sheet.
 * Does not own layout, transforms, camera, duration, clip paths or media pixels. */
(function(root){
  const P={white:'#FFFFFF',paper:'#F3F3F5',black:'#0B0B0F',purple:'#D6C2FF',muted:'#777780',line:'#DBDBE0'};
  const FONT='"UIFusionApproved", "Noto Sans SC", "Microsoft YaHei", sans-serif';
  const color=c=>{
    if(typeof c!=='string')return null;
    let h=c.trim().toLowerCase(),m;
    if(h==='white')return [255,255,255,1];if(h==='black')return [0,0,0,1];
    if((m=h.match(/^#([a-f\d]{3}|[a-f\d]{6}|[a-f\d]{8})$/i))){let z=m[1];if(z.length===3)z=[...z].map(x=>x+x).join('');return [parseInt(z.slice(0,2),16),parseInt(z.slice(2,4),16),parseInt(z.slice(4,6),16),z.length===8?parseInt(z.slice(6),16)/255:1];}
    if((m=h.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/)))return [+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]];
    return null;
  };
  function tone(c){const a=color(c);if(!a||a[3]<.9)return null;const hi=Math.max(...a.slice(0,3)),lo=Math.min(...a.slice(0,3));if(hi-lo<38){if(hi<86)return 'dark';if(lo>228)return 'light';return 'neutral';}if(a[2]>a[1]+20&&a[0]>a[1]&&a[2]>a[0]-12)return 'accent';return null;}
  function surface(c){const t=tone(c);return t==='dark'?P.black:t==='light'?P.white:t==='neutral'?P.paper:t==='accent'?P.purple:c;}
  function ink(c){const t=tone(c);return t==='dark'?P.black:t==='light'?P.white:t==='neutral'?P.muted:t==='accent'?P.purple:c;}
  function role(hint,style={}){
    const h=String(hint||'').toLowerCase();
    if(/(?:brand|logo|avatar|photo|image|media|video|canvas|icon|sprite|texture|artwork|status|success|error|warning|danger)/.test(h))return 'content';
    if(/(?:^|[^a-z])(?:pill|capsule|chip|badge|tag|button)(?:$|[^a-z])/.test(h))return 'chip';
    if(/(?:^|[^a-z])(?:screen|window|browser|dialog|terminal|phone|device|modal)(?:$|[^a-z])/.test(h))return 'window';
    if(/(?:^|[^a-z])(?:sheet|paper|document|file|report|receipt)(?:$|[^a-z])/.test(h))return 'sheet';
    if(/(?:card|panel|tile)/.test(h))return 'panel';
    if(/(?:heading|headline|title|h[1-6])/.test(h))return 'heading';
    if(/(?:body|paragraph|caption|text|label|span|p$)/.test(h))return 'text';
    // A neutral painted rectangle with an existing edge is an authored surface;
    // an anonymous spacer/transform group is not.
    if((style.background||style.backgroundColor)&&(style.border||style.borderRadius||style.boxShadow))return 'surface';
    return 'layout';
  }
  function style(input,hint){
    if(!input||typeof input!=='object')return input;
    const s={...input};let r=role(hint,s);if(r==='content')return s;
    if(r==='surface'&&Number(s.height)>0&&Number(s.height)<=64&&Number(s.width)>0&&Number(s.width)<=220)r='chip';
    if(s.fontFamily&&!/mono|code|symbol|icon/i.test(s.fontFamily))s.fontFamily=FONT;
    if(tone(s.color)==='accent')s.color=P.purple;
    if(s.fontSize&&r!=='layout'){const n=Number.parseFloat(s.fontSize);s.fontWeight=Math.max(Number.parseFloat(s.fontWeight)||400,r==='heading'||n>=40?800:550);}
    const bg=s.backgroundColor||s.background,solid=color(bg);let t=tone(bg),paint=surface(bg);
    // A named UI surface is presentation chrome. Its solid legacy color can
    // become neutral; anonymous/brand/status/media surfaces remain untouched.
    if(!t&&solid&&solid[3]>=.9&&['window','sheet','panel'].includes(r)){
      t=solid[0]*.2126+solid[1]*.7152+solid[2]*.0722>160?'light':'dark';
      paint=t==='dark'?P.black:P.white;
      if(!s.color||tone(s.color))s.color=t==='dark'?P.white:P.black;
    }
    if(!t)return s;
    if(s.backgroundColor)s.backgroundColor=paint;else s.background=paint;
    if(s.color)s.color=ink(s.color);
    if(!['window','sheet','panel','surface','chip'].includes(r))return s;
    const radius=String(s.borderRadius||'');
    if(radius.includes('%')||Number(s.width)>0&&Number(s.height)>0&&Math.max(Number(s.width),Number(s.height))<65)return s;
    const edge=t==='dark'?P.black:P.line;
    // Respect circular silhouettes, authored radii, and asymmetric folded sheets.
    if(s.borderRadius===undefined)s.borderRadius=r==='sheet'?12:r==='chip'?16:18;
    // Inset outlines do not change source box metrics or text wrapping.
    s.outline=(r==='window'?3:2)+'px solid '+edge;s.outlineOffset=-(r==='window'?3:2);
    const d=r==='window'?9:r==='sheet'?10:r==='chip'?0:8;
    s.boxShadow=d?`${Math.round(d*.8)}px ${d}px 0 ${P.line}, 0 12px 25px #00000020`:'0 4px 12px #00000016';
    return s;
  }
  function font(original){
    if(typeof original!=='string'||/mono|pixel|symbol|icon|bitmap|hand|script|brush|recipe|engraving|japanese|comic/i.test(original))return original;
    const m=original.match(/([\d.]+)px/);if(!m)return original;
    const size=Number(m[1]),w=original.match(/(?:^|\s)([1-9]00)(?:\s|$)/);
    return `${Math.max(w?Number(w[1]):400,size>=40?800:550)} ${m[1]}px ${FONT}`;
  }
  function rect(ctx,x,y,w,h,fill,roleName='panel',radius=0,options={}){
    if(!ctx||![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return;
    const scale=Math.max(.25,Math.min(1,(ctx.canvas?.width||1920)/1920));
    const threshold=40*scale;
    // Bars, pixels, grids and flat field fills remain flat primitives.
    if(w<threshold||h<threshold||!tone(fill)||w>=(ctx.canvas?.width||1920)*.94&&h>=(ctx.canvas?.height||1080)*.88){ctx.fillStyle=surface(fill);if(radius>0){ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(radius,w/2,h/2));ctx.fill();}else ctx.fillRect(x,y,w,h);return;}
    const rad=Math.max(0,Math.min(radius||0,w/2,h/2)),depth=options.shadow===false?0:Number.isFinite(options.depth)?options.depth:(roleName==='window'?9:roleName==='sheet'?10:8)*scale;
    ctx.save();ctx.shadowColor='#00000020';ctx.shadowBlur=25*scale;ctx.shadowOffsetY=12*scale;
    if(depth){ctx.fillStyle=P.line;ctx.beginPath();ctx.roundRect(x+depth*.8,y+depth,w,h,rad);ctx.fill();}
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.fillStyle=surface(fill);ctx.strokeStyle=options.stroke|| (tone(fill)==='dark'?P.black:P.line);ctx.lineWidth=options.lw||(roleName==='window'?3:2)*scale;
    ctx.beginPath();ctx.roundRect(x,y,w,h,rad);ctx.fill();ctx.stroke();ctx.restore();
  }
  function paintSurface(ctx,draw,w,h){
    if(!tone(ctx.fillStyle)||ctx.globalCompositeOperation&&ctx.globalCompositeOperation!=='source-over')return draw();
    const scale=Math.max(.25,Math.min(1,(ctx.canvas?.width||1920)/1920));
    if(Number.isFinite(w)&&Number.isFinite(h)&&(w<40*scale||h<40*scale||w>=(ctx.canvas?.width||1920)*.94&&h>=(ctx.canvas?.height||1080)*.88))return draw();
    // Stateful paths are painted exactly once: repeated face draws would change
    // the source alpha during fades. Their own path, stroke and depth survive.
    ctx.save();ctx.fillStyle=surface(ctx.fillStyle);ctx.shadowColor='#00000020';ctx.shadowBlur=25*scale;ctx.shadowOffsetX=0;ctx.shadowOffsetY=12*scale;draw();ctx.restore();
  }
  const api={version:'agent-editorial-material-v1',palette:P,font,style,role,surface,ink,rect,paintSurface};
  if(typeof module!=='undefined')module.exports=api;root.__uiFusionCurrent=api;
})(typeof globalThis==='undefined'?window:globalThis);
