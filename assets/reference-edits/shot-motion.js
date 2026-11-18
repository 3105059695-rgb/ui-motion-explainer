/* Source-relative poses shared by the encoded edit and a native HyperFrames timeline. */
(function (root) {
  'use strict';
  const regions = {
    full:[0,0,1,1], paper:[.09,.13,.82,.76], center:[.28,.26,.44,.48],
    left:[.035,.16,.45,.68], right:[.515,.16,.45,.68], top:[.1,.025,.8,.14],
    bottom:[.1,.78,.8,.17], lower:[.16,.54,.68,.4], chip:[.42,.43,.16,.14],
    thumb:[.04,.67,.27,.27], upperLeft:[.06,.08,.42,.39], upperRight:[.52,.08,.42,.39],
    lowerLeft:[.06,.53,.42,.39], lowerRight:[.52,.53,.42,.39]
  };
  function pose(key, material) {
    const rect = key.frame === 'safe' ? material.placement : regions[key.frame];
    if (!rect || rect.length !== 4) throw Error('请为当前素材填写实测位置：'+key.frame);
    return [...rect, key.opacity ?? 1, key.zoom ?? 1, key.iris ?? 1, key.wipe ?? 1];
  }
  function at(keys, position, material) {
    if (position < keys[0].at || position > keys[keys.length-1].at) return null;
    let index = 1;
    while (index < keys.length-1 && position > keys[index].at) index++;
    const a = keys[index-1], b = keys[index];
    const t = Math.min(1, Math.max(0, (position-a.at)/(b.at-a.at)));
    let ease = t*t*(3-2*t);
    if (b.cut) ease = position < b.at ? 0 : 1;
    else if ((b.wipe??1)!==(a.wipe??1) || (b.iris??1)!==(a.iris??1)) ease = root.AgentEditorial.out(t);
    else if ((b.zoom??1)!==(a.zoom??1) || b.frame!==a.frame) ease = root.AgentEditorial.ease(t);
    const start = pose(a, material), end = pose(b, material);
    return start.map((value, i) => value + (end[i]-value)*ease);
  }
  function attach(timeline, stage, shot, options={}) {
    const clock = shot.clock;
    const duration = options.duration ?? ((clock.end_frame-clock.start_frame)/clock.fps);
    const start = options.start ?? 0;
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(start) || start < 0)
      throw Error('按本期原声给本镜确定起点和时长。');
    const rect = shot.rect || regions.full;
    const layers = shot.layers.map((layer, i) => {
      const node = stage.querySelector('[data-fusion-layer="'+i+'"]');
      if (!node) throw Error('缺少本镜图层 '+i+' / '+layer.slot);
      return {layer, node, child:node.querySelector('[data-fusion-content]'), slot:shot.slots[layer.slot]};
    });
    function seek(position) {
      for (const {layer, node, child, slot} of layers) {
        const material = slot.binding || {};
        const p = at(layer.keys, position, material);
        node.style.visibility = p && p[4]>0 && p[6]>0 && p[7]>0 ? 'visible' : 'hidden';
        if (!p) continue;
        const [x,y,w,h,alpha,zoom,iris,wipe] = p;
        Object.assign(node.style,{left:100*(rect[0]+x*rect[2])+'%', top:100*(rect[1]+y*rect[3])+'%',
          width:100*w*rect[2]+'%', height:100*h*rect[3]+'%', opacity:String(alpha)});
        const [fx,fy] = material.focus || [.5,.5];
        const radius = iris*Math.hypot(node.clientWidth,node.clientHeight);
        node.style.clipPath = iris<1 ? 'circle('+radius+'px at '+(100*fx)+'% '+(100*fy)+'%)' : '';
        node.style.maskImage = wipe<1 ? 'linear-gradient(to right, black '+(100*wipe)+'%, transparent '+(100*wipe)+'%)' : '';
        if (child) {
          child.style.transformOrigin = (100*fx)+'% '+(100*fy)+'%';
          if (material.fit==='cover') child.style.objectPosition = (100*fx)+'% '+(100*fy)+'%';
          child.style.transform = zoom===1 ? '' : 'scale('+zoom+')';
          if (slot.surface==='query' && material.text)
            child.textContent = [...material.text].slice(0,Math.max(1,Math.ceil([...material.text].length*Math.min(1,position/.15)))).join('');
        }
      }
    }
    // Sample the same pure pose function on forward playback, scrubbing and reverse seeks.
    let value=0;
    const playhead = {get position(){return value;},set position(next){value=next;seek(next);}};
    seek(0);
    timeline.to(playhead,{position:1,duration,ease:'none'},start);
    return {seek};
  }
  root.FusionShot = Object.freeze({at,attach});
})(globalThis);
