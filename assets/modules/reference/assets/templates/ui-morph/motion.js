/* Independent reconstruction of the public UI-morph direction, not original author code. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, p) => a + (b - a) * p;
  const smooth = v => { const p = clamp(v); return p * p * (3 - 2 * p); };
  const defaults = {
    template: 'ui-morph', duration: 14, width: 1440, height: 1440, fps: 60, bpm: 120,
    brand: 'MOTION', accent: '#080808', background: '#eceee8', paper: '#ffffff',
    font: 'Arial,"Microsoft YaHei","PingFang SC",sans-serif',
    provenance: 'independent-reimplementation', reference_url: 'https://prompt-motion.com/twoclipping-5cba86',
    texts: { button: 'Generate', song: 'motion study 02', artist: 'made in code', album: '', songLength: '2:41', tabOne: 'Day', tabTwo: 'Week', tabThree: 'Month', chartLabel: 'total views', chartValue: '84,320', chartWeekValue:'19,204', chartUnit: '', chartChange: '', chartDay: '', chartTooltipValue: '74,835', searchPlaceholder:'Search', commandPlaceholder: 'Type a command', commandQuery: 'frame', commandHint: '', commandNew:'New project',commandExport:'Export video', commandResult: 'Frame rate · 60fps', commandOtherOne: 'Every frame is code', commandOtherTwo: 'Motion blur', commandFooter: '', commandEnter: '', toast: 'Every frame is code', toastDetail: '' }
  };
  window.project = JSON.parse(JSON.stringify(defaults));
  window.duration = 14;
  const renderMode = new URLSearchParams(location.search).get('render') === '1';
  document.body.classList.toggle('render', renderMode);

  // A closed-form damped spring. All target changes are summed analytically;
  // rendering frame 800 never depends on whether frame 799 was rendered.
  function springStep(dt, omega = 26, damping = .84) {
    if (dt <= 0) return 0;
    // The tail is below a pixel by this time. Exact settling makes the loop exact.
    if (dt >= .5) return 1;
    const wd = omega * Math.sqrt(1 - damping * damping);
    return 1 - Math.exp(-damping * omega * dt) * (Math.cos(wd * dt) + damping * omega / wd * Math.sin(wd * dt));
  }
  function steps(t, start, events, omega = 26, damping = .84) {
    let value = start;
    let previous = start;
    for (const [time, target] of events) {
      value += (target - previous) * springStep(t - time, omega, damping);
      previous = target;
    }
    return value;
  }
  const geometry = [
    [0, 368, 112, 56], [.5, 130, 130, 65], [1.5, 130, 130, 65],
    [2, 440, 110, 55], [3, 760, 460, 54], [5, 640, 128, 64],
    [6.5, 256, 128, 64], [7.5, 792, 124, 62], [9, 832, 832, 58],
    [10.5, 640, 124, 62], [11, 760, 590, 40], [11.5,760,432,40], [12, 620, 112, 56], [13, 368, 112, 56]
  ];
  const boundaryEvents = edge => geometry.slice(1).map(([t, w, h, r]) => [t, edge === 'left' ? 720 - w / 2 : edge === 'right' ? 720 + w / 2 : edge === 'top' ? 720 - h / 2 : edge === 'bottom' ? 720 + h / 2 : r]);
  const edgeSchedules = Object.fromEntries(['left', 'right', 'top', 'bottom', 'radius'].map(key => [key, boundaryEvents(key)]));
  const darkEvents = [[7.5, 0], [12, 1]];
  // Small controls get a close-up. Pull back just before the large morphs,
  // so the spring-driven expansion remains framed throughout the transition.
  const zoomEvents = [[.5, 1.9], [2, 2], [2.8, 1.3], [4.8, 1.65], [6.5, 1.9], [7.3, 1.5], [8.8, 1.3], [10.5, 1.36], [10.8, 1.36], [12, 1.55], [13, 1.7]];
  // Observed reference-video time -> mechanism time. Keep the motion equations
  // independent while matching the original's unequal state dwell times.
  const referenceClock = [[0,0],[.5,.5],[.95,1.5],[1.25,2],[1.75,3],[2.6,3.5],[3,4],[3.7,4.7],[3.8,5],[4.45,5.4],[4.7,5.55],[5,5.9],[5.25,6.5],[5.32,7],[6.35,7.5],[6.8,8],[7.15,8.5],[7.35,9],[8.5,10],[9.2,10.2],[9.9,10.5],[10.25,11],[10.5,11.25],[10.75,11.6],[11.05,11.7],[11.55,11.9],[11.8,12],[12.4,13],[12.85,13.5],[14,14]];
  function referenceTime(seconds) {
    for(let i=1;i<referenceClock.length;i++){
      const a=referenceClock[i-1],b=referenceClock[i];
      if(seconds<=b[0])return mix(a[1],b[1],clamp((seconds-a[0])/(b[0]-a[0])));
    }
    return 14;
  }
  const phases = [[0, 'button'], [.5, 'loader'], [1.5, 'check'], [2, 'dynamic-island'], [3, 'player'], [4, 'scrub'], [5, 'volume-drag'], [6.5, 'toggle'], [7.5, 'liquid-tabs'], [9, 'chart-tooltip'], [10.5, 'command-search'], [12, 'toast'], [13, 'button']];
  const cursorKeys = [
    [0,1064,1012], [.12,1064,1012], [.46,793,733], [.65,793,733],
    [1.25,851,823], [1.7,851,823], [2.30,829,729], [2.5,829,729],
    [2.79,851,775], [3.38,724,870], [3.55,724,870],
    [3.92,547,772], [4.02,547,772], [4.7,964,772,'linear'],
    [4.88,1000,830], [5.18,913.5,720], [5.4,535.5,720,'linear'],
    [5.85,1060.5,720,'linear'], [5.9,1060.5,720], [6.2,1015,950],
    [6.44,781,724], [6.53,781,724], [6.83,781,724], [7.0,781,724], [7.2,813,800],
    [7.83,720,720], [8.0,720,720], [8.17,760,780],
    [8.40,974,720], [8.5,974,720], [8.72,1030,787],
    [9.45,426,893], [9.65,426,893], [9.90,976,725], [10.05,976,725],
    [10.16,720,375], [10.2,720,375], [10.43,1055,1110], [10.5,950,723], [10.83,750,727], [11.0,750,727],
    [11.20,1095,1102], [11.64,1095,1102], [11.94,1095,1102], [12.05,1095,1102],
    [12.3,1064,1012], [12.83,1064,1012], [13.0,1064,1012], [13.5,1064,1012], [14,1064,1012]
  ];
  const clicks = [.5, 2.5, 3.5,6.53, 8, 8.5,10.2,10.5,11];
  const dragWindows = [[4.0,4.7],[5.18,5.9]];
  function cursorAt(t) {
    let a = cursorKeys[0], b = cursorKeys[cursorKeys.length - 1];
    for (let i = 1; i < cursorKeys.length; i++) if (t <= cursorKeys[i][0]) { a = cursorKeys[i - 1]; b = cursorKeys[i]; break; }
    const u = clamp((t - a[0]) / Math.max(.001, b[0] - a[0]));
    const p = b[3] === 'linear' ? u : smooth(u);
    return { x: mix(a[1],b[1],p), y: mix(a[2],b[2],p) };
  }
  function envelope(t, enter, leave, fade = .14) {
    return smooth((t - enter) / fade) * (1 - smooth((t - (leave - fade)) / fade));
  }
  function show(id, opacity, offset = 0) {
    const node = $(id);
    const a = clamp(opacity);
    node.style.opacity = a.toFixed(5);
    node.style.transform = `translate(-50%,calc(-50% + ${offset.toFixed(3)}px))`;
    node.style.filter = a >= .9999 || a <= .0001 ? 'none' : `blur(${((1 - a) * 5).toFixed(3)}px)`;
  }
  const rgb = hex => {
    const value = /^#[\da-f]{6}$/i.test(hex || '') ? hex.slice(1) : /^#[\da-f]{3}$/i.test(hex || '') ? hex.slice(1).split('').map(c => c+c).join('') : '111111';
    return [0,2,4].map(i => parseInt(value.slice(i,i+2),16));
  };
  const blend = (a,b,p) => `rgb(${a.map((v,i) => Math.round(mix(v,b[i],clamp(p)))).join(',')})`;
  function applyConfig() {
    const p = window.project;
    const root = document.documentElement;
    root.style.setProperty('--background',p.background || defaults.background);
    root.style.setProperty('--ink',p.accent || defaults.accent);
    root.style.setProperty('--paper',p.paper || defaults.paper);
    root.style.setProperty('--font',p.font || defaults.font);
    for (const node of document.querySelectorAll('[data-text]')) {
      const key = node.dataset.text;
      node.textContent = key === 'brand' ? p.brand || defaults.brand : p.texts?.[key] ?? defaults.texts[key] ?? '';
    }
    window.duration = Number(p.duration) > 0 ? Number(p.duration) : 14;
    $('timeline').max = String(window.duration);
  }
  for (const id of ['island-wave','player-wave']) {
    const count = id === 'island-wave' ? 5 : 8;
    for (let i=0;i<count;i++) $(id).append(document.createElement('i'));
  }
  let diagnostic = {};
  let lastRequested = 0;
  let playing = !renderMode;
  let playbackOrigin = null;
  let chartLength = 820;
  const monthPath = $('chart-line').getAttribute('d');
  const weekPath = 'M0 145C28 153 40 174 74 170S121 127 154 131S203 177 238 170S282 144 312 124S356 118 391 131S432 168 473 148S510 98 555 106S599 143 639 113S702 93 752 106';

  window.seek = requested => {
    applyConfig();
    const inputTime = Number.isFinite(Number(requested)) ? Number(requested) : 0;
    const bounded = clamp(inputTime,0,window.duration);
    const referenceSeconds = bounded >= window.duration ? 0 : bounded / window.duration * 14;
    const t = referenceTime(referenceSeconds);
    const pointer = cursorAt(t);
    let phase = 'button';
    for (const [at,name] of phases) if (t >= at) phase = name;

    // Held drags directly map the pointer to the displayed control value.
    const progress = t < 4 ? .24 + clamp((t-3.5)/.5)*.01 : t <= 4.7 ? clamp((pointer.x - 388)/664) : .86747;
    let volume = .82;
    if (t >= 5.18 && t <= 5.9) volume = (pointer.x - 483)/525;
    else if (t > 5.9) volume = mix(1.10,1,springStep(t-5.9,28,.80));
    const stretch = t >= 5.18 && t <= 5.9 ? Math.max(0,volume-1)*525 : t > 5.9 && t < 6.5 ? 52.5 * (1-springStep(t-5.9,28,.80)) : 0;

    const left = steps(t,536,edgeSchedules.left,23,.87);
    const right = steps(t,904,edgeSchedules.right,27,.87) + stretch;
    const top = steps(t,664,edgeSchedules.top,25,.87);
    const bottom = steps(t,776,edgeSchedules.bottom,27,.87);
    const radius = steps(t,56,edgeSchedules.radius,26,.88);
    const dark = clamp(steps(t,1,darkEvents,26,.9));
    const ink = rgb(window.project.accent || '#111111');
    const paper = rgb(window.project.paper || '#ffffff');
    const shape = $('shape');
    shape.style.left = `${left.toFixed(4)}px`;
    shape.style.top = `${top.toFixed(4)}px`;
    shape.style.width = `${Math.max(1,right-left).toFixed(4)}px`;
    shape.style.height = `${Math.max(1,bottom-top).toFixed(4)}px`;
    shape.style.borderRadius = `${Math.max(0,radius).toFixed(4)}px`;
    shape.style.backgroundColor = blend(paper,ink,dark);
    shape.style.color = blend(ink,paper,dark);
    const zoom = steps(t,1.7,zoomEvents,18,.92);
    $('camera').style.transform = `scale(${zoom.toFixed(6)})`;

    show('button-layer', t < .5 ? 1-smooth((t-.35)/.15) : smooth((t-13.15)/.18));
    show('loader-layer',envelope(t,.6,1.48));
    show('check-layer',envelope(t,1.5,2.10,.08));
    show('island-layer',envelope(t,2.14,2.95),4*(1-envelope(t,2.14,2.95)));
    show('player-layer',envelope(t,3.04,4.98,.12),8*(1-envelope(t,3.04,4.98,.12)));
    show('volume-layer',envelope(t,5.04,6.45,.10));
    show('toggle-layer',envelope(t,6.51,7.49,.08));
    show('tabs-layer',envelope(t,7.52,8.97,.12));
    show('chart-layer',envelope(t,9.02,10.68,.08),7*(1-envelope(t,9.02,10.68,.08)));
    show('command-key-layer',envelope(t,10.61,10.96,.10));
    show('palette-layer',envelope(t,11.04,11.97),7*(1-envelope(t,11.04,11.97)));
    show('toast-layer',envelope(t,12,13.04,.08));

    $('loader-ring').style.transform = `rotate(${((t-.5)*440-90).toFixed(3)}deg)`;
    $('success-check').style.strokeDashoffset = String(70*(1-smooth((t-1.5)/.10)));
    for (const [index,node] of Array.from($('island-wave').children).entries()) node.style.height = `${10+19*(.5+.5*Math.sin(t*15+index*1.7))}px`;
    for (const [index,node] of Array.from($('player-wave').children).entries()) node.style.height = `${7+22*(.5+.5*Math.sin(t*14+index*1.3))*smooth((t-3.5)/.2)}px`;
    const play = clamp(springStep(t-3.5,28,.86));
    // Two paths with compatible vertex counts morph from a triangle to pause bars.
    const triLeft = [[15,11],[22,15.5],[22,28.5],[15,33]];
    const triRight = [[22,15.5],[34,22],[34,22],[22,28.5]];
    const barLeft = [[14,12],[20,12],[20,32],[14,32]];
    const barRight = [[25,12],[31,12],[31,32],[25,32]];
    const morphPath = (a,b) => a.map((v,i) => `${i?'L':'M'}${mix(v[0],b[i][0],play).toFixed(3)} ${mix(v[1],b[i][1],play).toFixed(3)}`).join(' ')+'Z';
    $('play-left').setAttribute('d',morphPath(triLeft,barLeft));
    $('play-right').setAttribute('d',morphPath(triRight,barRight));
    $('progress-fill').style.width = `${664*progress}px`;
    $('progress-thumb').style.left = `${664*progress}px`;
    $('progress-thumb').style.transform = `translateX(-50%) scale(${1+.22*envelope(t,3.95,4.85,.1)})`;
    const elapsed = Math.round(161*progress);
    $('elapsed').textContent = `${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;
    $('scrub-tooltip').textContent = $('elapsed').textContent;
    $('scrub-tooltip').style.left = `${48+664*progress}px`;
    $('scrub-tooltip').style.opacity = String(envelope(t,4,4.82,.1));

    $('volume-layer').style.width = `${640+stretch}px`;
    document.querySelector('.volume-track').style.width = `${525+stretch}px`;
    $('volume-fill').style.width = `${clamp(volume)*100}%`;
    $('volume-thumb').style.left = `${clamp(volume)*(525+stretch)}px`;
    $('volume-value').textContent = String(Math.round(clamp(volume)*100));
    const knobLeft = steps(t,11,[[6.53,139]],21,.85);
    const knobRight = steps(t,117,[[6.53,245]],29,.85);
    $('toggle-knob').style.left = `${knobLeft}px`;
    $('toggle-knob').style.width = `${knobRight-knobLeft}px`;
    $('toggle-knob').firstElementChild.style.opacity = String(smooth((t-7.08)/.15));
    const tabLeft = steps(t,10,[[8,267.333],[8.5,524.666]],22,.85);
    const tabRight = steps(t,267.333,[[8,524.666],[8.5,781.999]],31,.85);
    $('tab-indicator').style.left = `${tabLeft}px`;
    $('tab-indicator').style.width = `${tabRight-tabLeft}px`;
    Array.from($('tabs-layer').querySelectorAll(':scope>span')).forEach((node,i) => {
      const center = 10+257.333*(i+.5);
      const inside = smooth((center-tabLeft)/44)*smooth((tabRight-center)/44);
      node.style.color = blend(ink,paper,inside);
    });

    const week = t>=10.2;
    const chartReveal = week ? smooth((t-10.2)/.16) : smooth((t-9.14)/.45);
    const chartPath = week ? weekPath : monthPath;
    $('chart-line').setAttribute('d',chartPath);
    chartLength=$('chart-line').getTotalLength();
    $('chart-area').setAttribute('d',`${chartPath} L752 240 L0 240 Z`);
    $('chart-line').style.strokeDasharray = String(chartLength);
    $('chart-line').style.strokeDashoffset = String(chartLength*(1-chartReveal));
    $('chart-area').style.opacity = String(.035*chartReveal);
    const leftHover = envelope(t,9.43,9.73,.08);
    const rightHover = envelope(t,9.88,10.12,.08);
    const chartHover = Math.max(leftHover,rightHover);
    const hoverX = t<9.8?74:639,hoverY=t<9.8?172:46;
    $('chart-point').setAttribute('cx',String(hoverX));
    $('chart-point').setAttribute('cy',String(hoverY));
    $('chart-hover-line').setAttribute('x1',String(hoverX));
    $('chart-hover-line').setAttribute('x2',String(hoverX));
    $('chart-tooltip').style.left=`${50+hoverX*732/752}px`;
    $('chart-tooltip').style.top=`${360+hoverY*320/240-75}px`;
    $('chart-tooltip').querySelector('strong').textContent=t<9.8?'22,510':window.project.texts?.chartTooltipValue??defaults.texts.chartTooltipValue;
    const targetNumber = Number(String(week ? window.project.texts?.chartWeekValue??defaults.texts.chartWeekValue : window.project.texts?.chartValue??defaults.texts.chartValue).replace(/[^\d.-]/g,''));
    $('chart-number').textContent=Number.isFinite(targetNumber)?Math.round(targetNumber*(week?smooth((t-10.2)/.12):.5+.5*smooth((t-9.04)/.28))).toLocaleString('en-US'):window.project.texts.chartValue;
    const chartTabLeft=steps(t,314.666,[[10.2,157.333]],24,.86);
    $('chart-tab-indicator').style.left=`${chartTabLeft}px`;
    Array.from(document.querySelectorAll('.chart-tabs>span')).forEach((node,i)=>node.style.color=i===(week?1:2)?'white':'#858585');
    for (const id of ['chart-tooltip','chart-hover-line','chart-point']) $(id).style.opacity = String(chartHover);
    const query = window.project.texts?.commandQuery ?? defaults.texts.commandQuery;
    const typed = Math.floor(clamp((t-11.28)/.37)*Array.from(query).length);
    const queryVisible = t >= 11.28;
    $('query-text').textContent = queryVisible ? Array.from(query).slice(0,typed).join('') : window.project.texts?.commandPlaceholder ?? defaults.texts.commandPlaceholder;
    $('query-text').style.color = queryVisible ? window.project.accent : '#aaa69e';
    $('text-caret').style.opacity = String(queryVisible ? (.55+.45*Math.cos(t*16)**2) : 0);
    const filtered = smooth((t-11.34)/.16);
    $('palette-layer').style.height=`${bottom-top}px`;
    for(const id of ['result-new','result-export','result-three']) $(id).style.opacity=String(1-filtered);
    $('result-one').style.top=`${mix(306,142,filtered)}px`;
    $('result-two').style.top=`${mix(470,224,filtered)}px`;
    $('result-one').classList.toggle('selected',filtered>.5&&t<11.75);
    $('result-two').classList.toggle('selected',filtered>.5&&t>=11.75);
    $('result-one').style.transform = `scale(${1-.015*envelope(t,11.95,12.12,.05)})`;

    const held = dragWindows.some(([a,b]) => t >= a && t <= b);
    let clickTime = Infinity;
    for (const at of clicks) if (t>=at && t-at<clickTime) clickTime=t-at;
    const press = held ? 1 : clickTime<.16 ? Math.sin(Math.PI*clamp(clickTime/.16)) : 0;
    // Move the vector geometry inside a stable full-canvas SVG viewport.
    // CSS transforms on a tiny SVG/filter surface can retain a raster texture
    // from a previous camera scale, making repeated seek pixels history-dependent.
    const cursorScale=1-.105*press;
    $('cursor-glyph').setAttribute('transform',`translate(${pointer.x} ${pointer.y}) scale(${cursorScale}) translate(-8 -5)`);
    $('click-ring').style.opacity = String(clickTime<.3 ? .36*(1-clamp(clickTime/.3)) : 0);
    $('click-ring').setAttribute('cx',String(pointer.x));
    $('click-ring').setAttribute('cy',String(pointer.y));
    $('click-ring').setAttribute('r',String(29*(.28+clamp(clickTime/.3))*cursorScale));
    $('click-ring').setAttribute('stroke-width',String(2*cursorScale));

    $('timeline').value = String(bounded);
    $('time-label').textContent = `${bounded.toFixed(2)} / ${window.duration.toFixed(2)} s`;
    lastRequested = bounded;
    diagnostic = {
      time:bounded, referenceTime:referenceSeconds, logicalTime:t, phase, beat:Math.floor(referenceSeconds*2),
      container:{x:left,y:top,width:right-left,height:bottom-top,radius,dark},
      cursor:{x:pointer.x,y:pointer.y,pressed:held||press>.1,dragging:held},
      camera:{zoom}, progress, volume:clamp(volume), volumeStretch:stretch,
      toggle:clamp(springStep(t-6.53,24,.86)), tabIndex:week?1:t<8?0:t<8.5?1:2,
      tabEdges:{left:tabLeft,right:tabRight}, chartReveal, chartHover,
      query:queryVisible?Array.from(query).slice(0,typed).join(''):'', renderMode
    };
    return JSON.parse(JSON.stringify(diagnostic));
  };
  window.getState = () => JSON.parse(JSON.stringify(diagnostic));
  window.beats = Array.from({length:29},(_,i) => i*.5);

  function fit() {
    const scale = Math.min(innerWidth/1440,innerHeight/1440);
    // Translate the unscaled 1440px layout back from its 50% viewport anchor.
    // A grid auto-column would otherwise retain its 1440px min-content width.
    $('canvas').style.transform = `translate(-50%,-50%) scale(${scale})`;
  }
  addEventListener('resize',fit);
  fit();
  $('timeline').addEventListener('input',event => {
    playing=false; playbackOrigin=null; $('play-toggle').textContent='播放'; window.seek(Number(event.target.value));
  });
  $('play-toggle').addEventListener('click',() => {
    playing=!playing; playbackOrigin=null; $('play-toggle').textContent=playing?'暂停':'播放';
  });
  function preview(timestamp) {
    if (playing) {
      if (playbackOrigin===null) playbackOrigin=timestamp-lastRequested*1000;
      const elapsed = (timestamp-playbackOrigin)/1000;
      window.seek(elapsed % window.duration);
    }
    requestAnimationFrame(preview);
  }
  const readyPromise = (async () => {
    try {
      const response = await fetch('./project.json');
      if (!response.ok) throw new Error(`project.json: HTTP ${response.status}`);
      const loaded = await response.json();
      window.project = {...defaults,...loaded,texts:{...defaults.texts,...loaded.texts}};
    } catch (error) {
      // file:// previews can still run using the embedded editable fallback.
      console.warn('UI morph configuration fallback:',error.message);
    }
    applyConfig();
    // Start layout/font requests for the loaded project font before awaiting them.
    document.body.getBoundingClientRect();
    if (document.fonts?.ready) await document.fonts.ready;
    chartLength=$('chart-line').getTotalLength();
    const d=$('chart-line').getAttribute('d');
    $('chart-area').setAttribute('d',`${d} L752 240 L0 240 Z`);
    window.seek(0);
    if (!renderMode) requestAnimationFrame(preview);
    return true;
  })();
  window.ready = () => readyPromise;
})();
