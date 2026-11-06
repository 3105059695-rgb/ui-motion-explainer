/* Editable UI captions. Original source time, original text, maximum two lines.
   Built-in capacity cues below come from the existing corrected ASR word spans.
   No TTS, time redistribution, source mutation, or fake word-level timing. */
window.UICaptions=(()=>{
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*x*(10-15*x+6*x*x)};
  const normalize=s=>String(s).normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'').toLowerCase();
  const sample=[
    {at:196.8285,text:'但桌面不是无限大的',marks:[{text:'不是无限大',mode:'underline',words:[['不是',197.4885,197.7685],['无',197.7685,197.9485],['限',197.9485,198.1085],['大',198.1085,198.4885]]}]},
    {at:198.4885,text:'假设一个模型的上下文上限是十万 Token',breakAfter:'假设一个模型的上下文上限是',marks:[{text:'十万 Token',mode:'selection',words:[['十',200.5685,200.7685],['万',200.7685,200.8685],['T',200.8685,201.0685],['oken',201.0685,201.2485]]}]},
    {at:201.2485,text:'你就得在这个范围内安排本次信息',marks:[{text:'这个范围内',mode:'underline',words:[['这个',201.9885,202.2085],['范',202.2085,202.3485],['围',202.3485,202.4685],['内',202.4685,202.6085]]}]},
    {at:203.9485,text:'而且通常还要给生成的输出留空间',breakAfter:'而且通常还要给',marks:[{text:'留空间',mode:'selection',words:[['留',205.9085,206.0285],['空',206.0285,206.2885],['间',206.2885,206.7485]]}]},
    {at:206.7485,text:'不能简单理解成',marks:[{text:'不能',mode:'underline',words:[['不能',206.7485,207.0485]]}]},
    {at:208.0485,text:'我能先塞满十万 Token 的资料',marks:[{text:'塞满',mode:'underline',words:[['塞',208.7485,208.8485],['满',208.8485,209.0085]]},{text:'十万 Token',mode:'selection',words:[['十',209.0085,209.2285],['万',209.2285,209.3085],['T',209.3085,209.4685],['oken',209.4685,209.5485]]}]},
    {at:209.9885,text:'再让它无限往下写',marks:[{text:'无限往下写',mode:'underline',words:[['无',210.4285,210.6085],['限',210.6085,210.7085],['往',210.7085,210.8285],['下',210.8285,211.0285],['写',211.0285,211.6085]]}]},
    {at:211.6085,text:'具体上限，要看模型和产品的规则',marks:[{text:'模型和产品的规则',mode:'underline',words:[['模',212.8885,213.1485],['型',213.1485,213.2885],['和',213.2885,213.4685],['产',213.4685,213.5885],['品',213.5885,213.7085],['的',213.7085,213.8485],['规',213.8485,213.9685],['则',213.9685,214.0485]]}]}
  ];
  let rows=[],config={},lastIndex=-1,layoutCache=new Map();
  function locate(text,phrase){
    const map=[],chars=[];
    for(let i=0;i<text.length;){const ch=String.fromCodePoint(text.codePointAt(i)),n=normalize(ch);for(const v of n){chars.push(v);map.push([i,i+ch.length])}i+=ch.length}
    const wanted=normalize(phrase),idx=chars.join('').indexOf(wanted);
    return idx<0||!wanted?null:{from:map[idx][0],to:map[idx+wanted.length-1][1]};
  }
  function bindMark(row,hint){
    const span=locate(row.text,hint.text);if(!span)return null;
    let offset=span.from,words=[];
    if(Array.isArray(hint.words))for(const w of hint.words){
      const text=Array.isArray(w)?w[0]:w.text,start=+(Array.isArray(w)?w[1]:w.start),end=+(Array.isArray(w)?w[2]:w.end);
      if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)continue;
      const at=locate(row.text.slice(offset,span.to),text);if(!at)continue;
      words.push({from:offset+at.from,to:offset+at.to,start,end});offset+=at.to;
    }
    const first=words[0]?.start??+hint.start;
    if(!Number.isFinite(first)||first<row.start-.025||first>=row.end)return null;
    // With only a scene cue, emphasize the complete phrase at that measured cue.
    // Never manufacture per-word times by dividing its characters.
    if(!words.length)words=[{...span,start:first,end:Math.min(row.end,first+.15)}];
    return {...span,text:hint.text,mode:hint.mode==='selection'?'selection':'underline',words,start:first};
  }
  function prepare(input){
    config=input||{};layoutCache.clear();lastIndex=-1;
    rows=(config.captions||[]).map((r,i)=>({id:r.id??i,start:+r.start,end:+r.end,text:String(r.text??''),marks:[],breakAt:null})).filter(r=>Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.end>r.start);
    for(const row of rows){
      const known=sample.find(s=>normalize(s.text)===normalize(row.text)&&Math.abs(s.at-row.start)<.025);
      const custom=(config.uiCaptionHints||[]).find(s=>normalize(s.text)===normalize(row.text)&&Math.abs((s.start??s.at)-row.start)<.025);
      const hint=custom??known;
      if(hint){
        const b=hint.breakAfter?row.text.indexOf(hint.breakAfter):-1;
        if(b===0)row.breakAt=hint.breakAfter.length;
        row.marks=(hint.marks||[]).map(m=>bindMark(row,m)).filter(Boolean);
      }else{
        // Conservative whole-film fallback: only existing, measured scene cues
        // for meaningful phrases already present in this exact caption.
        const scene=(config.scenes||[]).find(s=>row.start>=s.start-.03&&row.start<s.end);
        const candidates=Object.entries(scene?.cues||{}).filter(([k,v])=>normalize(k).length>=2&&normalize(k).length<=11&&+v>=row.start&&+v<row.end&&locate(row.text,k)&&/Token|上下文|容量|收费|输入|输出|上限|空间|基本单位|分词|记忆/i.test(k)).sort((a,b)=>normalize(b[0]).length-normalize(a[0]).length);
        for(const [key,start]of candidates){const m=bindMark(row,{text:key,start,mode:/Token|容量|上限|基本单位/i.test(key)?'selection':'underline'});if(m&&!row.marks.some(a=>a.from<m.to&&a.to>m.from))row.marks.push(m);if(row.marks.length===2)break}
      }
    }
    return {captions:rows.length,timedEmphases:rows.reduce((n,r)=>n+r.marks.length,0),sampleCaptions:rows.filter(r=>r.start>=196.56&&r.start<214.20).length,maxLines:2,preservesSourceTextAndTimes:true};
  }
  function darkTheme(opts){
    if(typeof opts.dark==='boolean')return opts.dark;
    const b=typeof opts.background==='object'?opts.background?.color:opts.background;
    if(b==='dark')return true;if(b==='light'||!b)return false;
    let rgb;
    if(/^#[a-f\d]{3}$/i.test(b))rgb=b.slice(1).split('').map(v=>parseInt(v+v,16));
    else if(/^#[a-f\d]{6,8}$/i.test(b))rgb=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));
    else {const m=String(b).match(/^rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)/i);if(m)rgb=m.slice(1,4).map(Number)}
    return rgb?(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2])<123:false;
  }
  function fontFor(ch,size){return /^[a-z\d]$/i.test(ch)?`700 ${size}px EN, CN`:`800 ${size}px CN`}
  function measure(ctx,text,size,tracking){
    const chars=[],at=[0];let x=0;
    for(let i=0;i<text.length;){const ch=String.fromCodePoint(text.codePointAt(i)),font=fontFor(ch,size);ctx.font=font;const w=ctx.measureText(ch).width+(i+ch.length<text.length?tracking:0);chars.push({ch,offset:i,x,w,font});for(let k=0;k<ch.length;k++)at[i+k]=x;x+=w;i+=ch.length;at[i]=x}
    return {text,chars,at,width:x};
  }
  function layout(ctx,row,size,tracking){
    const cacheKey=`${row.id}:${size}:${tracking}`;if(layoutCache.has(cacheKey))return layoutCache.get(cacheKey);
    const max=1320;let all=measure(ctx,row.text,size,tracking),split=row.breakAt;
    if(!split&&all.width>max){
      let best=Infinity;
      for(let i=1;i<row.text.length;i++){
        if(/[A-Za-z0-9]/.test(row.text[i-1])&&/[A-Za-z0-9]/.test(row.text[i]))continue;
        if(/[，。！？、；：,.!?;:]/.test(row.text[i]))continue;
        const a=measure(ctx,row.text.slice(0,i),size,tracking).width,b=measure(ctx,row.text.slice(i),size,tracking).width;
        const score=Math.max(a,b)+(a>max||b>max?10000:0)+Math.abs(a-b)*.14-(/[，。！？；：]/.test(row.text[i-1])?120:0);
        if(score<best){best=score;split=i}
      }
    }
    const texts=split?[row.text.slice(0,split),row.text.slice(split)]:[row.text];
    let lines=texts.map(s=>measure(ctx,s,size,tracking));
    // Existing project captions fit at 52–60px. This handles a future longer
    // supplied row without omission; no new temporal slices are introduced.
    if(lines.some(l=>l.width>max)&&size>52)return layout(ctx,row,52,tracking);
    let offset=0;
    const result={size,lines:lines.map((l,i)=>{const o={...l,offset,x:1130-l.width/2,baseline:lines.length===2?940+i*76:1016};offset+=l.text.length;return o})};
    layoutCache.set(cacheKey,result);return result;
  }
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
  function activeRow(t){
    const known=rows[lastIndex];if(known&&t>=known.start&&t<known.end)return known;
    // The input order is retained verbatim, even when arbitrary seeking occurs.
    lastIndex=rows.findIndex(r=>t>=r.start&&t<r.end);return rows[lastIndex];
  }
  function revealTo(mark,t){
    let to=mark.from;
    for(const word of mark.words){
      if(t<word.start)break;
      const p=ease((t-word.start)/Math.min(.12,Math.max(.04,word.end-word.start)));
      to=Math.max(to,word.from+(word.to-word.from)*p);
    }
    return Math.min(mark.to,to);
  }
  function advance(line,index){const j=clamp((index-line.offset)/Math.max(1,line.text.length))*line.text.length,k=Math.floor(j),f=j-k;return (line.at[k]??line.width)*(1-f)+(line.at[k+1]??line.width)*f}
  function draw(ctx,mediaTime,opts={}){
    const row=activeRow(mediaTime);if(!row)return null;
    const dark=darkTheme(opts),size=Math.max(52,Math.min(60,opts.fontSize??58)),tracking=opts.tracking??.38;
    ctx.save();
    const arrangement=layout(ctx,row,size,tracking),enter=ease((mediaTime-row.start)/Math.min(.16,(row.end-row.start)*.16));
    const lift=10*(1-enter),alpha=.38+.62*enter;
    ctx.beginPath();ctx.rect(430,880,1400,165);ctx.clip();ctx.globalAlpha*=alpha;ctx.translate(0,lift);
    // Each line gets a fitted translucent surface, never a full-width black bar.
    for(const line of arrangement.lines){
      const width=Math.min(1376,line.width+46),left=1130-width/2;
      if(opts.glass!==false){
        ctx.save();ctx.shadowColor=dark?'#0000002B':'#22202B14';ctx.shadowBlur=14;ctx.shadowOffsetY=4;
        rounded(ctx,left,line.baseline-57,width,76,13);ctx.fillStyle=dark?'rgba(23,25,29,.52)':'rgba(255,255,255,.86)';ctx.fill();ctx.restore();
        rounded(ctx,left+.6,line.baseline-56.4,width-1.2,74.8,12.4);ctx.strokeStyle=dark?'rgba(245,244,255,.13)':'rgba(255,255,255,.94)';ctx.lineWidth=1.2;ctx.stroke();
      }
      for(const mark of row.marks){
        const until=revealTo(mark,mediaTime),start=Math.max(line.offset,mark.from),end=Math.min(line.offset+line.text.length,mark.to);
        if(end<=start||until<=start)continue;
        const x=line.x+advance(line,start),w=advance(line,end)-advance(line,start),shown=advance(line,Math.min(end,until))-advance(line,start);
        if(mark.mode==='selection'){
          ctx.save();ctx.beginPath();ctx.rect(x-5,line.baseline-55,shown+10,69);ctx.clip();rounded(ctx,x-5,line.baseline-53,w+10,65,7);ctx.fillStyle=dark?'#DAC7FA':'#D8C4F5';ctx.fill();ctx.restore();
        }else{
          rounded(ctx,x,line.baseline+8,Math.max(.1,shown),5,2.5);ctx.fillStyle=dark?'#D9C1F8':'#AB80D5';ctx.fill();
        }
      }
      ctx.textAlign='left';ctx.textBaseline='alphabetic';
      for(const ch of line.chars){
        const index=line.offset+ch.offset;
        const selected=row.marks.some(m=>m.mode==='selection'&&index>=m.from&&index<m.to&&revealTo(m,mediaTime)>index+.5);
        ctx.font=ch.font;ctx.fillStyle=selected?'#21192D':dark?'#F8F6FC':'#211E25';ctx.fillText(ch.ch,line.x+ch.x,line.baseline);
      }
    }
    ctx.restore();
    return {id:row.id,start:row.start,end:row.end,text:row.text,lines:arrangement.lines.map(l=>l.text),fontSize:arrangement.size,dark,safeArea:{x:430,y:880,width:1400,height:165},emphasis:row.marks.map(m=>({text:m.text,start:m.start,mode:m.mode}))};
  }
  return {prepare,draw};
})();
