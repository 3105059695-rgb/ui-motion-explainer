/* Each live example and its PNG use the same DOM factory. */
(() => {
  'use strict';
  const byId = new Map(UI_CATALOG.components.map(c => [c.id, c]));
  const renderers = new Map();
  let serial = 0;
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (k === 'style') Object.assign(node.style, v);
      else if (['value','checked','disabled','selected','readOnly','multiple','tabIndex'].includes(k)) node[k] = v;
      else node.setAttribute(k, v === true ? '' : String(v));
    }
    for (const child of children.flat(Infinity)) if (child !== undefined && child !== null && child !== false) node.append(child instanceof Node ? child : String(child));
    return node;
  }
  const box=(classes,...content)=>el('div',{class:classes},...content);
  const row=(...content)=>box('vu-row',...content);
  const col=(...content)=>box('vu-stack',...content);
  const note=t=>el('span',{class:'vu-note'},t);
  const heading=t=>el('strong',{class:'vu-heading'},t);
  const field=(label,control)=>el('label',{class:'vu-field'},el('span',{class:'vu-label'},label),control);
  const panel=(...content)=>box('vu-panel',...content);
  const btn=(label,click,kind='',attrs={})=>el('button',{type:'button',class:'vu-btn '+kind,onclick:click,...attrs},label);
  const tag=(text,kind='')=>el('span',{class:'vu-tag '+kind},text);
  const bounds=(v,min,max)=>Math.max(min,Math.min(max,Number(v)));
  const truth=v=>v?'true':'false';
  const setAt=(a,i)=>a.includes(i)?a.filter(v=>v!==i):[...a,i];
  const ariaLabel=(s)=>({'aria-label':s});
  const glyphs={
    arrow:'M4 12h15m-6-6 6 6-6 6',up:'m5 15 7-7 7 7',down:'m5 9 7 7 7-7',left:'m15 5-7 7 7 7',right:'m9 5 7 7-7 7',
    check:'m4 12 5 5L20 6',plus:'M12 4v16M4 12h16',minus:'M4 12h16',close:'m5 5 14 14M19 5 5 19',
    search:'M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 1 1 16 0',file:'M5 2h9l5 5v15H5zM14 2v6h5',
    folder:'M2 5h8l3 3h9v12H2z',clock:'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0M12 6v6l4 2',
    upload:'M12 16V3m-6 6 6-6 6 6M3 16v5h18v-5',calendar:'M3 5h18v16H3zM3 10h18M8 2v6m8-6v6',
    info:'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0M12 11v6M12 7v.2',alert:'m12 3 10 17H2zM12 9v5m0 3v.2',
    inbox:'m3 5-2 13v2h22v-2L20 5zM2 15h6l2 3h4l2-3h6',align0:'M3 5h18M3 10h11M3 15h18M3 20h9',
    align1:'M3 5h18M7 10h10M3 15h18M7 20h10',align2:'M3 5h18M10 10h11M3 15h18M12 20h9',
    menu:'M3 5h18M3 12h18M3 19h18',bookmark:'M6 3h12v19l-6-4-6 4z',sort:'M8 4v16m-4-4 4 4 4-4M17 20V4m-4 4 4-4 4 4',
    copy:'M8 8h13v13H8zM3 16V3h13',edit:'m4 16 12-12 4 4L8 20l-5 1z',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    audio:'M4 10v4m4-8v12m4-16v20m4-16v12m4-8v4',layers:'m12 2 10 6-10 6L2 8zM3 12l9 5 9-5M3 16l9 5 9-5'};
  const ns='http://www.w3.org/2000/svg';
  function svg(tag,attrs){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;}
  function icon(id){const s=svg('svg',{class:'vu-icon',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':true});s.append(svg('path',{d:glyphs[id]}));return s;}
  function register(map){for(const [k,fn] of Object.entries(map)){if(!byId.has(k)||renderers.has(k))throw Error('未知或重复组件 '+k);renderers.set(k,fn);}}
  function enhance(map){for(const [id,fn] of Object.entries(map)){if(!renderers.has(id))throw Error('找不到要扩展的组件 '+id);renderers.set(id,fn);}}
  function checked(def,values){
    if(!values||Array.isArray(values)||typeof values!=='object')throw Error('参数应为一个 JSON 对象。');
    const data=structuredClone(def.example);
    for(const [k,v] of Object.entries(values)){
      if(!Object.hasOwn(data,k))throw Error('没有这个参数：'+k);
      const base=data[k];if(Array.isArray(base)?!Array.isArray(v):typeof v!==typeof base)throw Error('参数类型不符：'+k);
      data[k]=structuredClone(v);
    }
    const p=data;
    if(p.items){if(!p.items.length||p.items.length>35||!p.items.every(x=>typeof x==='string'))throw Error('items 应为 1–35 项文字。');
      for(const k of ['bodies','meta','times','values'])if(Array.isArray(p[k])&&p[k].length!==p.items.length)throw Error(k+' 应与 items 逐项对应。');
      if('active' in p&&(!Number.isInteger(p.active)||p.active<(def.id==='accordion'?-1:0)||p.active>=p.items.length))throw Error('active 应指向现有项目。');
      if(p.selected&&(!p.selected.every(x=>Number.isInteger(x)&&x>=0&&x<p.items.length)||new Set(p.selected).size!==p.selected.length))throw Error('selected 需使用现有、不重复的序号。');
    }
    if(p.rows&&(!p.rows.length||p.rows.some(r=>!Array.isArray(r)||r.length!==(p.headers?p.headers.length:2))))throw Error('表格或键值项的列数不一致。');
    if(p.rows&&p.headers&&p.rows.some(r=>!Number.isFinite(Number(r.at(-1)))))throw Error('表格的末列需填写可排序的数值。');
    if(['bar-chart','line-chart'].includes(def.id)&&p.values.some(v=>typeof v!=='number'||!Number.isFinite(v)||(def.id==='bar-chart'&&v<0)))throw Error('图表数值无效。');
    if('min' in p&&(!(p.min<p.max)||p.value<p.min||p.value>p.max))throw Error('数值需要在有效的上下限内。');
    if(def.id==='pagination'&&(!Number.isInteger(p.total)||p.total<1||p.total>12||!Number.isInteger(p.page)||p.page<1||p.page>p.total))throw Error('分页示例支持 1–12 页，当前页须在范围内。');
    if(def.id==='progress'&&(p.value<0||p.value>100))throw Error('进度取值为 0–100。');
    if(def.id==='date-picker'&&(!/^\d{4}-(0[1-9]|1[0-2])$/.test(p.month)||!/^\d{4}-\d{2}-\d{2}$/.test(p.value)||isNaN(Date.parse(p.value))||new Date(p.value).toISOString().slice(0,10)!==p.value))throw Error('日期需为有效的 YYYY-MM-DD，月份为 YYYY-MM。');
    if(def.id==='grid'&&(!Number.isInteger(p.cols)||p.cols<1||p.cols>4))throw Error('网格支持 1–4 列。');
    if(def.id==='tree'&&(!p.children.length||!Number.isInteger(p.active)||p.active<0||p.active>p.children.length))throw Error('目录树需要子项与有效的选中序号。');
    if(window.VideoUI.validateExtra)window.VideoUI.validateExtra(def.id,p);
    return data;
  }
  function mount(host,id,overrides={}){
    const def=byId.get(id), render=renderers.get(id);if(!def||!render)throw Error('找不到组件 '+id);
    let data;const uid='vu'+(++serial), clone=v=>structuredClone(v);
    const publish=()=>host.dispatchEvent(new CustomEvent('ui:change',{bubbles:true,detail:{id,props:clone(data)}}));
    function update(values,refresh=true){Object.assign(data,values);if(refresh)paint();publish();}
    function paint(){
      const old=document.activeElement;const focusKey=host.contains(old)?old.dataset.key:null;
      host.classList.add('vu-piece');host.dataset.part=id;host.replaceChildren(render({p:data,set:update,uid,host}));
      if(focusKey) [...host.querySelectorAll('[data-key]')].find(n=>n.dataset.key===focusKey)?.focus({preventScroll:true});
    }
    function replace(values={}){data=checked(def,values);paint();}
    replace(overrides);
    return {id,getProps:()=>clone(data),replace,update};
  }
  window.VideoUI={mount,register,enhance,byId,helpers:{el,box,row,col,note,heading,field,panel,btn,tag,bounds,truth,setAt,ariaLabel,svg,icon}};
})();

(() => {
  'use strict';
  const {el,box,row,col,note,heading,field,panel,btn,tag,bounds,truth,setAt,ariaLabel,icon}=VideoUI.helpers;
  const opt=(text,action,chosen=false)=>btn([text,chosen?icon('check'):null],action,'vu-option'+(chosen?' selected':''),{'aria-pressed':truth(chosen)});
  const opts=(...children)=>box('vu-options',...children);
  const menuKey=(evt)=>{const buttons=[...evt.currentTarget.querySelectorAll('button:not(:disabled)')];const i=buttons.indexOf(document.activeElement);if(i<0)return;if(['ArrowDown','ArrowUp'].includes(evt.key)){evt.preventDefault();buttons[(i+(evt.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}};
  const stepped=(items,i,set,kind)=>items.map((n,j)=>btn(n,()=>set({active:j}),kind+(j===i?' current':''),{'aria-pressed':truth(j===i),'data-key':kind+j}));
  function selectBox({p,set,uid},many=false){
    const selected=many?p.selected:[p.active];const current=many?selected.map(i=>p.items[i]).join('、')||'选择筛选项':p.items[p.active];
    const control=btn([el('span',{},current),icon('down')],()=>set({open:!p.open}),'vu-control',{'aria-expanded':truth(p.open),'aria-controls':uid+'list','data-key':'select',...ariaLabel(p.label+'，'+current)});
    const list=p.open?opts(...p.items.map((t,i)=>opt(t,()=>many?set({selected:setAt(p.selected,i)}):set({active:i,open:false}),selected.includes(i)))):null;
    if(list){list.id=uid+'list';list.addEventListener('keydown',menuKey);}
    const chips=many&&p.selected.length?row(...p.selected.map(i=>btn([p.items[i],icon('close')],()=>set({selected:setAt(p.selected,i)}),'vu-chip',ariaLabel('移除 '+p.items[i])))):null;
    const node=col(heading(p.label),control,chips,list);node.onkeydown=e=>{if(e.key==='Escape'&&p.open){set({open:false});}};return node;
  }
  function datePicker({p,set}){
    const [y,m]=p.month.split('-').map(Number);const first=new Date(Date.UTC(y,m-1,1));const offset=(first.getUTCDay()+6)%7;
    const max=new Date(Date.UTC(y,m,0)).getUTCDate();
    const shift=n=>{const d=new Date(Date.UTC(y,m-1+n,1));set({month:d.toISOString().slice(0,7)});};
    const control=btn([icon('calendar'),p.value,icon('down')],()=>set({open:!p.open}),'vu-control',{'aria-expanded':truth(p.open),...ariaLabel(p.label+' '+p.value)});
    if(!p.open)return col(heading(p.label),control);
    const dates=box('vu-calgrid',...'一二三四五六日'.split('').map(d=>note(d)),...Array.from({length:offset},()=>el('i')));
    for(let i=1;i<=max;i++){const iso=p.month+'-'+String(i).padStart(2,'0');dates.append(btn(i,()=>set({value:iso,open:false}),'vu-day'+(iso===p.value?' current':''),ariaLabel(iso)));}
    return col(heading(p.label),control,panel(box('vu-between',btn(icon('left'),()=>shift(-1),'vu-iconbtn',ariaLabel('上个月')),heading(y+' 年 '+m+' 月'),btn(icon('right'),()=>shift(1),'vu-iconbtn',ariaLabel('下个月'))),dates));
  }
  VideoUI.register({
    button:({p,set})=>row(btn([icon(p.pressed?'check':'layers'),p.pressed?p.done:p.label],()=>set({pressed:!p.pressed}),'primary',{disabled:p.disabled,'aria-pressed':truth(p.pressed),'data-key':'act'})),
    link:({p,set,uid})=>col(el('a',{class:'vu-link',href:'#'+uid+'target',onclick:e=>{e.preventDefault();set({open:!p.open});},'aria-expanded':truth(p.open)},p.label,icon('arrow')),p.open?el('div',{id:uid+'target',class:'vu-inset'},p.detail):null),
    'split-button':({p,set})=>col(box('vu-splitbtn',btn(p.done?'已导出 · '+p.items[p.active].split(' ').at(-1):p.items[p.active],()=>set({done:true,open:false}),'primary'),btn(icon('down'),()=>set({open:!p.open}),'primary',{'aria-expanded':truth(p.open),...ariaLabel('其他导出操作')})),p.open?opts(...p.items.map((v,i)=>opt(v,()=>set({active:i,open:false,done:false}),i===p.active))):null),
    'menu-button':({p,set})=>col(btn([icon('menu'),p.label,icon('down')],()=>set({open:!p.open}),'',{'aria-expanded':truth(p.open)}),p.open?opts(...p.items.map((v,i)=>opt(v,()=>set({open:false,selection:v}),false))):p.selection?note('已选择 · '+p.selection):null),
    toolbar:({p,set})=>col(el('div',{class:'vu-toolstrip',role:'toolbar',...ariaLabel(p.label)},...p.items.map((v,i)=>btn(icon('align'+i),()=>set({active:i}),'vu-iconbtn'+(p.active===i?' current':''),{'aria-pressed':truth(p.active===i),title:v,'data-key':'tool'+i,...ariaLabel(v)}))),el('div',{class:'vu-tooltext',style:{textAlign:['left','center','right'][p.active]}},p.text)),
    breadcrumbs:({p,set})=>el('nav',{class:'vu-crumbs',...ariaLabel('文件路径')},...p.items.slice(0,p.active+1).map((s,i)=>[i?icon('right'):null,i===p.active?el('strong',{'aria-current':'page'},s):btn(s,()=>set({active:i}),'text')]),p.active<p.items.length-1?btn(icon('right'),()=>set({active:p.active+1}),'vu-iconbtn',ariaLabel('进入下一级')):null),
    tabs:({p,set,uid})=>{const list=el('div',{class:'vu-tabs',role:'tablist',...ariaLabel('项目内容')},...p.items.map((s,i)=>btn(s,()=>set({active:i}),'vu-tab'+(i===p.active?' current':''),{role:'tab',id:uid+'t'+i,'aria-selected':truth(i===p.active),'aria-controls':uid+'panel',tabIndex:i===p.active?0:-1,'data-key':'tab'+i})));list.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=p.items.length,i=e.key==='Home'?0:e.key==='End'?n-1:(p.active+(e.key==='ArrowRight'?1:-1)+n)%n;set({active:i});document.getElementById(uid+'t'+i)?.focus();};return col(list,el('div',{class:'vu-inset',role:'tabpanel',id:uid+'panel','aria-labelledby':uid+'t'+p.active},p.bodies[p.active]));},
    'side-nav':({p,set})=>el('nav',{class:'vu-sidenav',...ariaLabel(p.label)},heading(p.label),...p.items.map((s,i)=>btn([icon(['layers','folder','clock'][i%3]),s],()=>set({active:i}),'vu-sideitem'+(p.active===i?' current':''),{'aria-current':p.active===i?'page':null}))),
    pagination:({p,set})=>el('nav',{class:'vu-paging',...ariaLabel('分页')},btn(icon('left'),()=>set({page:p.page-1}),'vu-iconbtn',{disabled:p.page<=1,...ariaLabel('上一页')}),...Array.from({length:p.total},(_,i)=>btn(i+1,()=>set({page:i+1}),'vu-page'+(p.page===i+1?' current':''),{'aria-current':p.page===i+1?'page':null,...ariaLabel('第 '+(i+1)+' 页')})),btn(icon('right'),()=>set({page:p.page+1}),'vu-iconbtn',{disabled:p.page>=p.total,...ariaLabel('下一页')})),
    steps:({p,set})=>el('ol',{class:'vu-steps'},...p.items.map((s,i)=>el('li',{class:i<p.active?'complete':i===p.active?'active':''},btn([el('span',{class:'vu-stepdot'},i<p.active?icon('check'):i+1),el('span',{},s)],()=>set({active:i}),'vu-step',{'aria-current':i===p.active?'step':null})))),
    tree:({p,set})=>col(row(icon('folder'),heading(p.root)),box('vu-tree',btn([icon(p.open?'down':'right'),icon('folder'),p.folder],()=>set({open:!p.open}),'vu-treebtn',{'aria-expanded':truth(p.open)}),p.open?box('vu-children',...p.children.map((s,i)=>btn([icon('audio'),s],()=>set({active:i}),'vu-treerow'+(p.active===i?' current':'')))):null,btn([icon('file'),p.other],()=>set({active:p.children.length}),'vu-treerow'+(p.active===p.children.length?' current':'')))),
    contents:({p,set,uid})=>box('vu-contents',el('nav',ariaLabel('本文目录'),...p.items.map((s,i)=>el('a',{href:'#'+uid+'body',class:i===p.active?'current':'','aria-current':i===p.active?'location':null,onclick:e=>{e.preventDefault();set({active:i});}},s))),el('section',{id:uid+'body'},heading(p.items[p.active]),el('p',{},p.bodies[p.active]))),
    'text-field':({p,set})=>field(p.label,el('input',{class:'vu-input',value:p.value,placeholder:p.placeholder,readOnly:p.disabled,oninput:e=>set({value:e.target.value},false)})),
    textarea:({p,set})=>{const count=note(p.value.length+' / '+p.limit);const area=el('textarea',{class:'vu-input',maxlength:p.limit,rows:2,value:p.value,oninput:e=>{set({value:e.target.value},false);count.textContent=e.target.value.length+' / '+p.limit;}});return col(field(p.label,area),box('vu-end',count));},
    search:({p,set})=>{const results=box('vu-searchrows');function list(){const hits=p.items.filter(v=>v.toLowerCase().includes(p.value.toLowerCase()));results.replaceChildren(...(hits.length?hits.map(v=>row(icon('file'),v)):[note('没有匹配项')]));}const inp=el('input',{type:'search',value:p.value,placeholder:p.label,...ariaLabel(p.label),oninput:e=>{set({value:e.target.value},false);list();}});list();return col(box('vu-control',icon('search'),inp),results);},
    'number-input':({p,set})=>{const input=el('input',{type:'number',value:p.value,min:p.min,max:p.max,step:p.step,...ariaLabel(p.label),onchange:e=>set({value:bounds(e.target.value,p.min,p.max)})});return col(heading(p.label),row(box('vu-counter',btn(icon('minus'),()=>set({value:bounds(p.value-p.step,p.min,p.max)}),'vu-iconbtn',{disabled:p.value<=p.min,...ariaLabel('减少')}),input,btn(icon('plus'),()=>set({value:bounds(p.value+p.step,p.min,p.max)}),'vu-iconbtn',{disabled:p.value>=p.max,...ariaLabel('增加')})),note(p.unit)));},
    select:ctx=>selectBox(ctx),
    autocomplete:({p,set})=>{const list=opts();function suggest(){list.replaceChildren();const hits=p.items.filter(s=>s.includes(p.value));list.hidden=!p.open;if(!p.open)return;for(const hit of hits)list.append(opt(hit,()=>set({value:hit,open:false})));if(!hits.length)list.append(note('没有匹配建议'));}const input=el('input',{class:'vu-input',value:p.value,...ariaLabel(p.label),autocomplete:'off',oninput:e=>{set({value:e.target.value,open:true},false);suggest();},onkeydown:e=>{if(e.key==='ArrowDown'){e.preventDefault();list.querySelector('button')?.focus();}if(e.key==='Escape'){set({open:false},false);suggest();}}});list.onkeydown=menuKey;suggest();return col(field(p.label,input),list);},
    slider:({p,set})=>{const output=el('output',{class:'vu-pill'},p.value+p.unit);const input=el('input',{class:'vu-range',type:'range',min:p.min,max:p.max,value:p.value,...ariaLabel(p.label),oninput:e=>{set({value:Number(e.target.value)},false);output.textContent=e.target.value+p.unit;}});return panel(box('vu-between',heading(p.label),output),input,box('vu-between',note(p.min+p.unit),note(p.max+p.unit)));},
    'date-picker':datePicker,
    'file-upload':({p,set,uid})=>{const file=el('input',{class:'vu-fileinput',type:'file',id:uid+'file',onchange:e=>{if(e.target.files[0])set({value:e.target.files[0].name});}});return col(el('label',{class:'vu-drop',for:uid+'file'},file,icon(p.value?'file':'upload'),heading(p.value||p.label),note(p.value?'点击更换文件':p.hint)),p.value?btn('移除文件',()=>set({value:''}),'text'):null);},
    checkbox:({p,set})=>el('fieldset',{class:'vu-fieldset'},el('legend',{},p.label),...p.items.map((v,i)=>el('label',{class:'vu-choice'},el('input',{type:'checkbox',checked:p.selected.includes(i),onchange:()=>set({selected:setAt(p.selected,i)}),'data-key':'c'+i}),v))),
    radio:({p,set,uid})=>el('fieldset',{class:'vu-fieldset'},el('legend',{},p.label),...p.items.map((v,i)=>el('label',{class:'vu-choice'},el('input',{type:'radio',name:uid,checked:i===p.active,onchange:()=>set({active:i}),'data-key':'r'+i}),v))),
    switch:({p,set})=>box('vu-between vu-switchrow',heading(p.label),row(note(p.on?'已开启':'已关闭'),btn(el('i'),()=>set({on:!p.on}),'vu-switch'+(p.on?' current':''),{role:'switch','aria-checked':truth(p.on),'data-key':'toggle',...ariaLabel(p.label)}))),
    segmented:({p,set})=>col(heading(p.label),el('div',{class:'vu-segment',role:'group',...ariaLabel(p.label)},...stepped(p.items,p.active,set,'vu-seg'))),
    'multi-select':ctx=>selectBox(ctx,true)
  });
})();

(() => {
  'use strict';
  const {el,box,row,col,note,heading,field,panel,btn,tag,bounds,truth,ariaLabel,icon,svg}=VideoUI.helpers;
  const pairs=rows=>el('dl',{class:'vu-pairs'},...rows.map(([k,v])=>[el('dt',{},k),el('dd',{},v)]));
  function chart({p,set}){
    const width=388,height=128, margin=18, inner=height-margin*2;
    const lo=Math.min(0,...p.values),hi=Math.max(1,...p.values);
    const xx=i=>margin+i*(width-margin*2)/Math.max(1,p.values.length-1);
    const yy=v=>height-margin-(v-lo)/(hi-lo)*inner;
    const picture=svg('svg',{viewBox:`0 0 ${width} ${height}`,class:'vu-trend',role:'img','aria-label':p.items.map((s,i)=>s+' '+p.values[i]+p.unit).join('，')});
    for(const y of [margin,height/2,height-margin])picture.append(svg('path',{d:`M${margin} ${y}H${width-margin}`,stroke:'var(--vu-rim)',opacity:'.24','stroke-width':2}));
    picture.append(svg('polyline',{points:p.values.map((v,i)=>`${xx(i)},${yy(v)}`).join(' '),fill:'none',stroke:'var(--vu-ink)','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'}));
    p.values.forEach((v,i)=>{const circle=svg('circle',{cx:xx(i),cy:yy(v),r:i===p.active?7:4,stroke:'var(--vu-ink)','stroke-width':3,fill:i===p.active?'var(--vu-accent)':'var(--vu-paper)'});picture.append(circle);});
    return col(box('vu-between',heading(p.label),tag(p.items[p.active]+' · '+p.values[p.active]+p.unit,'accent')),picture,box('vu-axis',...p.items.map((v,i)=>btn(v,()=>set({active:i}),'text'+(i===p.active?' chosen':''),{'aria-pressed':truth(i===p.active)}))));
  }
  VideoUI.register({
    'avatar-group':({p,set})=>col(heading(p.label),box('vu-avatars',...p.items.slice(0,p.open?p.items.length:p.limit).map((n,i)=>el('span',{class:'vu-avatar '+(i%2?'dark':''),title:n,'aria-label':n},n.slice(-1))),p.items.length>p.limit?btn(p.open?'收起':'+'+(p.items.length-p.limit),()=>set({open:!p.open}),'vu-avmore',{'aria-expanded':truth(p.open),...ariaLabel(p.open?'收起成员':'展开其余成员')}):null),p.open?note(p.items.join('、')):null),
    tags:({p})=>col(heading(p.label),row(...p.items.map(s=>tag(s)))),
    badge:({p})=>row(el('span',{class:'vu-badgeWrap'},icon('inbox'),p.count?el('b',{class:'vu-badge'},p.count):null),heading(p.label)),
    'status-label':({p})=>box('vu-between',heading(p.label),tag(p.state,p.emphasis?'accent':'outline')),
    card:({p})=>panel(heading(p.title),el('p',{},p.body),note(p.meta)),
    'item-list':({p,set})=>el('ul',{class:'vu-items'},...p.items.map((s,i)=>el('li',{},btn([icon(['audio','file','layers'][i%3]),el('span',{},s),note(p.meta[i])],()=>set({active:i}),'vu-listbtn'+(p.active===i?' current':''),{'aria-pressed':truth(i===p.active)})))),
    descriptions:({p})=>col(heading(p.title),pairs(p.rows)),
    accordion:({p,set,uid})=>box('vu-accordion',...p.items.map((s,i)=>box('vu-panelitem',btn([s,icon(i===p.active?'minus':'plus')],()=>set({active:p.active===i?-1:i}),'vu-accordhead',{'aria-expanded':truth(i===p.active),'aria-controls':uid+'a'+i,'data-key':'accordion'+i}),el('p',{id:uid+'a'+i,hidden:i!==p.active},p.bodies[i])))),
    'code-snippet':({p})=>box('vu-code',el('div',{class:'vu-codehead'},icon('file'),p.label),el('pre',{},el('code',{},...p.lines.map((s,i)=>el('span',{},el('i',{'aria-hidden':'true'},i+1),s))))),
    statistic:({p})=>box('vu-stat',note(p.label),row(el('b',{},p.value),el('strong',{},p.unit)),note(p.note)),
    'data-table':({p,set})=>{const rows=p.rows.map(r=>[...r]);const index=p.headers.length-1;
      if(p.sort!=='none')rows.sort((a,b)=>(Number(a[index])-Number(b[index]))*(p.sort==='asc'?1:-1));
      return el('table',{class:'vu-table'},el('thead',{},el('tr',{},...p.headers.map((h,i)=>el('th',{scope:'col','aria-sort':i===index?({asc:'ascending',desc:'descending',none:'none'}[p.sort]):null},i===index?btn([h,icon('sort')],()=>set({sort:p.sort==='asc'?'desc':'asc'}),'text',ariaLabel('按'+h+'排序')):h)))),el('tbody',{},...rows.map(r=>el('tr',{},...r.map(v=>el('td',{},v))))));},
    'bar-chart':({p,set})=>{const max=Math.max(1,...p.values);return col(box('vu-between',heading(p.label),note(p.unit)),...p.items.map((s,i)=>btn([el('span',{class:'vu-barname'},s),el('span',{class:'vu-bartrack'},el('i',{class:p.active===i?'hot':'',style:{width:(p.values[i]/max*100)+'%'}})),el('b',{},p.values[i])],()=>set({active:i}),'vu-bar',{'aria-pressed':truth(p.active===i)})));},
    'line-chart':chart,
    timeline:({p,set})=>el('ol',{class:'vu-timeline'},...p.items.map((s,i)=>el('li',{class:i===p.active?'active':''},btn([el('i'),el('time',{},p.times[i]),el('strong',{},s)],()=>set({active:i}),'vu-moment',{'aria-pressed':truth(i===p.active)})))),
    'pair-compare':({p,set})=>col(heading(p.label),box('vu-compare',...p.items.map((s,i)=>btn([note(s),row(el('b',{},p.values[i]),el('strong',{},p.unit))],()=>set({active:i}),'vu-readcard'+(p.active===i?' current':''),{'aria-pressed':truth(i===p.active)})))),
    divider:({p})=>el('div',{class:'vu-separator',role:'separator',...ariaLabel(p.label||'分隔线')},el('i'),p.label?el('strong',{},p.label):null,el('i')),
    panel:({p})=>el('section',{class:'vu-groupbox'},el('h3',{},p.title),el('p',{},p.body)),
    grid:({p})=>el('div',{class:'vu-grid',style:{gridTemplateColumns:`repeat(${p.cols},minmax(0,1fr))`}},...p.items.map((s,i)=>box('vu-gridcell',icon(['audio','file','layers','grid'][i%4]),s))),
    splitter:({p,set})=>{const left=el('div',{class:'vu-pane left',style:{flexBasis:p.value+'%'}},icon('folder'),p.left),right=box('vu-pane',icon('layers'),p.right);const wrap=box('vu-split',left,right);
      const handle=el('button',{type:'button',class:'vu-handle',role:'separator',...ariaLabel('调整两栏宽度'),'aria-orientation':'vertical','aria-valuemin':20,'aria-valuemax':80,'aria-valuenow':p.value});
      function change(value){const v=bounds(Math.round(value),20,80);left.style.flexBasis=v+'%';handle.setAttribute('aria-valuenow',v);set({value:v},false);}
      handle.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();change(e.key==='Home'?20:e.key==='End'?80:p.value+(e.key==='ArrowRight'?5:-5));}};
      handle.onpointerdown=e=>{e.preventDefault();handle.focus();handle.setPointerCapture(e.pointerId);};handle.onpointermove=e=>{if(handle.hasPointerCapture(e.pointerId)){const r=wrap.getBoundingClientRect();change(100*(e.clientX-r.left)/r.width);}};
      wrap.insertBefore(handle,right);return wrap;},
    'app-window':({p,set})=>box('vu-window',box('vu-winbar',el('span',{class:'vu-dots','aria-hidden':'true'},el('i'),el('i'),el('i')),p.title),box('vu-windowbody',...p.items.map((v,i)=>i===0?note(v):btn([icon('file'),v],()=>set({active:i}),'vu-winrow'+(i===p.active?' current':'')))))
  });
})();

(() => {
  'use strict';
  const {el,box,row,col,note,heading,field,panel,btn,tag,bounds,truth,ariaLabel,icon}=VideoUI.helpers;
  const quit=(set,label='关闭')=>btn(icon('close'),()=>set({open:false}),'vu-iconbtn',ariaLabel(label));
  function esc(box,p,set){box.addEventListener('keydown',e=>{if(e.key==='Escape'&&p.open){e.preventDefault();e.stopPropagation();set({open:false});}});return box;}
  function overlay(ctx,drawer){
    const {p,set,uid}=ctx;
    const launch=btn([icon(drawer?'file':'edit'),p.done?'草稿已保存':p.label],()=>{set({open:true,done:false});document.getElementById(uid+'layer')?.focus();},'');
    if(!p.open)return launch;
    const sheet=el('section',{class:drawer?'vu-drawer':'vu-dialog',id:uid+'layer',tabIndex:-1,role:'dialog',...ariaLabel(p.title)},box('vu-between',heading(p.title),quit(set)),drawer?el('dl',{class:'vu-pairs'},...p.rows.map(([k,v])=>[el('dt',{},k),el('dd',{},v)])):el('p',{},p.body),drawer?null:row(btn('取消',()=>set({open:false})),btn(p.action,()=>set({open:false,done:true}),'primary')));
    return esc(box('vu-overlaystage'+(drawer?' with-drawer':''),el('div',{class:'vu-pagehint','aria-hidden':'true'},el('i'),el('i'),el('i')),sheet),p,set);
  }
  VideoUI.register({
    progress:({p})=>col(box('vu-between',heading(p.label),tag(p.value+'%','accent')),el('div',{class:'vu-progress',role:'progressbar',...ariaLabel(p.label),'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':p.value},el('i',{style:{width:p.value+'%'}}))),
    loading:({p})=>el('div',{class:'vu-loading',role:'status'},p.done?icon('check'):el('span',{class:'vu-spin','aria-hidden':'true'}),heading(p.done?'素材已就绪':p.label)),
    skeleton:({p})=>p.loaded?panel(heading(p.title),el('p',{},p.body)):el('div',{class:'vu-skeleton',role:'status',...ariaLabel('内容加载中')},el('span'),box('vu-stack',el('i'),el('i'),el('i'))),
    alert:({p,set})=>p.open?el('div',{class:'vu-alert',role:'status'},icon('alert'),col(heading(p.title),el('p',{},p.body)),quit(set)):btn('显示提示',()=>set({open:true}),'text'),
    toast:({p,set})=>col(btn(p.label,()=>set({open:true})),p.open?el('div',{class:'vu-toast',role:'status'},icon('check'),p.message,quit(set)):null),
    validation:({p,set,uid})=>{const msg=el('span',{class:'vu-validation',id:uid+'msg',role:'status'});const input=el('input',{class:'vu-input',value:p.value,placeholder:'输入文件名','aria-describedby':uid+'msg'});
      const valid=()=>{const missing=p.touched&&!p.value.trim();input.classList.toggle('invalid',missing);input.setAttribute('aria-invalid',truth(missing));msg.replaceChildren(...(missing?[icon('alert'),'需要填写文件名']:p.value.trim()?[icon('check'),'可以使用']:[]));};
      input.oninput=e=>{set({value:e.target.value,touched:true},false);valid();};input.onblur=()=>{set({touched:true},false);valid();};valid();return col(field(p.label,input),msg);},
    empty:({p,set})=>p.open?col(heading('可用素材'),row(icon('file'),'采访提纲.md'),row(icon('audio'),'采访录音.wav'),btn('返回',()=>set({open:false}),'text')):box('vu-state',icon('inbox'),heading(p.title),el('p',{},p.body),btn(p.action,()=>set({open:true}))),
    result:({p,set})=>box('vu-state',box('vu-seal'+(p.success?' ok':''),icon(p.success?'check':'alert')),heading(p.title),el('p',{},p.body),btn(p.action,()=>set({open:!p.open}),'primary',{'aria-expanded':truth(p.open)}),p.open?note(p.success?'交付文件 · 视频与字幕':'待处理 · 选择字幕文件'):null),
    tooltip:({p,set,uid})=>{const area=box('vu-tiparea');const tip=el('span',{class:'vu-tip',role:'tooltip',id:uid+'tip',hidden:!p.open},p.tip);const trigger=btn([p.label,icon('info')],()=>show(true),'',{'aria-describedby':uid+'tip'});
      function show(v){tip.hidden=!v;set({open:v},false);}trigger.onfocus=()=>show(true);trigger.onblur=()=>show(false);trigger.onmouseenter=()=>show(true);trigger.onmouseleave=()=>show(false);trigger.onkeydown=e=>{if(e.key==='Escape')show(false);};area.append(trigger,tip);return area;},
    popover:({p,set})=>esc(col(btn([p.label,icon('info')],()=>set({open:!p.open}),'',{'aria-expanded':truth(p.open)}),p.open?box('vu-bubble',box('vu-between',heading(p.title),quit(set)),el('p',{},p.body)):null),p,set),
    popconfirm:({p,set})=>{
      const trigger=btn(p.done?'已移出':p.label,()=>set({open:true,done:false}),'',{'aria-expanded':truth(p.open)});
      const actions=row(btn('取消',()=>set({open:false})),btn('确认移出',()=>set({open:false,done:true}),'primary'));
      return esc(col(trigger,p.open?box('vu-bubble',row(icon('alert'),heading(p.message)),actions):null),p,set);
    },
    modal:ctx=>overlay(ctx,false),drawer:ctx=>overlay(ctx,true),
    tour:({p,set})=>{if(!p.open)return btn('开始引导',()=>set({open:true,active:0}));const n=p.items.length;
      return esc(col(box('vu-tourrail',...p.items.map((s,i)=>el('span',{class:i===p.active?'current':''},s))),box('vu-bubble',box('vu-between',tag((p.active+1)+' / '+n,'accent'),quit(set,'结束引导')),heading(p.items[p.active]),el('p',{},p.bodies[p.active]),row(btn('上一步',()=>set({active:p.active-1}),'',{disabled:p.active===0}),btn(p.active===n-1?'完成':'下一步',()=>set(p.active===n-1?{open:false}:{active:p.active+1}),'primary')))),p,set);}
  });
})();

(() => {
  'use strict';
  const {el, box, row, col, note, heading, btn, truth, svg} = VideoUI.helpers;
  function mediaURL(file) {
    if (typeof file==='string' && /^(data:image\/|blob:)/.test(file)) return file;
    const url=window.PortraitMedia[file];if(!url)throw Error('未找到素材 '+file);return url;
  }
  const picture = (file, alt, cls='') => el('img',{src:mediaURL(file),alt,class:'ux-img '+cls,draggable:'false'});
  const selected = (label,action,on,key) => btn(label,action,'ux-choice'+(on?' is-active':''),{'aria-pressed':truth(on),'data-key':key});
  const dark = (label,action,disabled=false) => btn(label,action,'primary',{disabled});
  const small = (label,action,disabled=false) => btn(label,action,'ux-small',{disabled});
  const readout = value => el('strong',{class:'ux-read'},value);
  const bar = (a,b) => box('vu-between ux-bar',heading(a),b);
  const surface = (...nodes) => box('ux-surface',...nodes);
  const desktop = (title,...nodes) => box('ux-desktop',box('ux-chrome',el('i'),el('i'),el('i'),el('strong',{},title)),box('ux-workarea',...nodes));
  const text = (value, name, oninput, attrs={}) => el('input',{class:'vu-input',type:'text',value,'aria-label':name,oninput:e=>oninput(e.target.value),...attrs});
  function slider(name,value,min,max,step,change) {
    const s=el('input',{class:'ux-slider',type:'range',min,max,step,value,'aria-label':name});
    function tint(v){s.style.setProperty('--ux-track-pct',(100*(v-min)/Math.max(.001,max-min))+'%');}
    tint(value);s.oninput=()=>{const v=Number(s.value);tint(v);change(v);};return s;
  }
  const select = (name,items,idx,change) => {
    const s=el('select',{class:'ux-select','aria-label':name,onchange:e=>change(e.target.selectedIndex)},items.map(v=>el('option',{},v)));s.selectedIndex=idx;return s;
  };
  const clock = n => {
    const c=Math.round(Math.max(0,n)*100);return Math.floor(c/6000)+':'+String(Math.floor(c/100)%60).padStart(2,'0')+'.'+String(c%100).padStart(2,'0');
  };
  const bounded=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
  const toggle=(a,i)=>a.includes(i)?a.filter(n=>n!==i):[...a,i];
  function gesture(target,axis,complete) {
    let start=null, pointer=null;
    const coordinate=e=>axis==='x'?e.clientX:e.clientY;
    target.addEventListener('pointerdown',e=>{if(e.button!==0)return;start=coordinate(e);pointer=e.pointerId;});
    target.addEventListener('pointermove',e=>{if(start!==null&&e.pointerId===pointer&&Math.abs(coordinate(e)-start)>8&&!target.hasPointerCapture(pointer))target.setPointerCapture(pointer);});
    function finish(e){if(start===null||e.pointerId!==pointer)return;const d=coordinate(e)-start;start=null;pointer=null;if(Math.abs(d)>23){e.stopPropagation();complete(d);}}
    target.addEventListener('pointerup',finish);
    target.addEventListener('pointercancel',()=>{start=null});
    target.style.touchAction=axis==='x'?'pan-y':'pan-x';
  }
  function sheetSVG(width,height,label,...nodes){
    const root=svg('svg',{viewBox:'0 0 '+width+' '+height,class:'ux-svg',role:'img','aria-label':label});
    root.append(...nodes.flat(Infinity));return root;
  }
  function markSvg(tag,attrs,children=[]){const n=svg(tag,attrs);n.append(...children);return n;}
  function checked(id,p){
    const need=(ok,msg)=>{if(!ok)throw Error(msg);};
    const idx=(n,len)=>Number.isInteger(n)&&n>=0&&n<len;
    const indices=(xs,len)=>Array.isArray(xs)&&xs.every(x=>idx(x,len))&&new Set(xs).size===xs.length;
    const strings=a=>Array.isArray(a)&&a.every(s=>typeof s==='string');
    const between=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
    const matrix=(a,h,w)=>a.length===h&&a.every(r=>Array.isArray(r)&&r.length===w&&r.every(Number.isFinite));
    if(p.images)need(strings(p.images)&&p.images.length===p.items.length,'图片需要与名称逐项对应。');
    for(const s of [...p.images||[],...p.frames||[],...['image','poster','src'].filter(k=>typeof p[k]==='string').map(k=>p[k])])mediaURL(s);
    if(p.wave)need(p.wave.length>=2&&p.wave.every(n=>between(n,0,1.2)),'波形需要至少两个有效振幅。');
    if('duration' in p)need(p.duration>0,'片段时长必须大于零。');
    if('time' in p)need(between(p.time,0,p.duration),'定位时间超出片段。');
    if(id==='trim')need(p.start>=0&&p.start<p.end&&p.end<=p.duration,'出点须在入点后、片尾内。');
    if(id==='range-pair')need(p.low>=p.min&&p.low<=p.high&&p.high<=p.max,'上下限应落在标尺上，起点不能超过终点。');
    if(id==='bottom-sheet')need(idx(p.level,3)&&strings(p.details)&&p.details.length>0,'面板高度应为 0、1、2，详情要有文字。');
    if(id==='date-range'){
      const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
      need(valid(p.start)&&valid(p.end)&&p.start<=p.end,'请填写有效日期，结束不能早于开始。');
    }
    if(id==='time-picker')need(idx(p.hour,24)&&idx(p.minute,60),'小时或分钟超出范围。');
    if(id==='cascader')need(p.children.length===p.items.length&&p.children.every(a=>strings(a)&&a.length)&&idx(p.child,p.children[p.active].length),'每个上级需要子项，当前子项须存在。');
    if(id==='inspector')need(matrix(p.settings,p.items.length,3)&&p.settings.every(r=>r.every(v=>between(v,0,100))),'每个图层需要三个 0 到 100 的属性值。');
    if(id==='layer-panel')need(indices(p.hidden,p.items.length),'隐藏图层编号无效。');
    if(id==='transfer')need(indices(p.assigned,p.items.length)&&indices(p.marked,p.items.length),'选择项应使用有效编号。');
    if(id==='upload-queue')need(p.progress.length===p.items.length&&p.progress.every(v=>between(v,0,100))&&indices(p.failed,p.items.length),'每项文件需要自己的进度和有效状态。');
    if(id==='rule-filter')need(strings(p.formats)&&p.formats.length===p.items.length&&p.seconds.length===p.items.length&&p.seconds.every(v=>v>=0)&&p.limit>=0,'素材类型和时长需要逐项对应。');
    if('zoom' in p)need(between(p.zoom,50,250),'预览比例为 50% 至 250%。');
    if(id==='filmstrip')need(p.frames.length===p.marks.length&&p.frames.length>0&&idx(p.active,p.frames.length)&&p.marks.every((v,i)=>v>=0&&(!i||v>p.marks[i-1])),'请让帧图逐项对应递增时间。');
    if(id==='caption-track')need(between(p.viewStart,0,p.duration)&&p.viewStart<p.duration&&p.starts.length===p.items.length&&p.ends.length===p.items.length&&p.starts.every((v,i)=>v>=p.viewStart&&p.ends[i]>v&&p.ends[i]<=p.duration&&(!i||v>=p.ends[i-1])),'字幕起止需在视窗内逐项对应，按时间排列且互不重叠。');
    if(id==='level-meter')need(p.levels.length>0&&matrix(p.levels,p.levels.length,2)&&idx(p.active,p.levels.length),'每个采样点需对应左右两个电平。');
    if(id==='donut')need(p.values.every(v=>Number.isFinite(v)&&v>=0)&&p.values.some(v=>v>0),'占比数据需要非负值，合计须大于零。');
    if(id==='stacked')need(strings(p.series)&&p.series.length>0&&matrix(p.matrix,p.items.length,p.series.length)&&p.matrix.every(r=>r.every(v=>v>=0)),'每个组须有对应系列的非负值。');
    if(id==='waterfall')need(p.values.every(Number.isFinite),'瀑布图须使用数值。');
    if(id==='scatter')need(matrix(p.points,p.items.length,2),'每个点需要横纵两个数值。');
    if(id==='node-map')need(p.items.length<=12&&p.edges.every(edge=>Array.isArray(edge)&&edge.length===2&&edge.every(v=>idx(v,p.items.length))),'节点连线应指向现有节点，示例最多容纳 12 个。');
    if(id==='heatmap')need(strings(p.labels)&&strings(p.columns)&&p.labels.length&&p.columns.length&&matrix(p.matrix,p.labels.length,p.columns.length)&&idx(p.cell[0],p.labels.length)&&idx(p.cell[1],p.columns.length),'热力数据和选中格须与行列对应。');
    if(id==='plan-checklist')need(Number.isInteger(p.completed)&&between(p.completed,0,p.items.length),'完成项数超出任务数。');
    if(id==='source-quote')need(strings(p.paragraphs)&&idx(p.active,p.paragraphs.length),'引用段编号须指向原文。');
    if(id==='line-diff')need(strings(p.oldLines)&&strings(p.newLines)&&Math.max(p.oldLines.length,p.newLines.length)<=100,'两版请按行提供文字，最多各 100 行。');
    if(id==='source-link'){let u;try{u=new URL(p.url);}catch{}need(u&&['https:','http:'].includes(u.protocol),'请使用有效的网页链接。');}
    if(id==='tag-entry')need(strings(p.tags),'标签应为文字。');
    if(id==='key-chord')need(['mac','windows'].includes(p.platform)&&strings(p.mac)&&p.mac.length&&strings(p.windows)&&p.windows.length,'平台请选择 mac 或 windows，并提供相应键帽。');
    if(id==='dock-panel')need(['left','right','float'].includes(p.dock)&&strings(p.tools),'停靠位置请选择 left、right 或 float。');
    if(id==='tool-call')need(['running','done','error'].includes(p.phase),'运行阶段请选择 running、done 或 error。');
    if(id==='find-replace')need(Number.isInteger(p.match)&&p.match>=0,'匹配位置从零开始。');
    if(id==='search')need(strings(p.recent),'搜索历史应为文字列表。');
    if(id==='data-table'){
      need(indices(p.selectedRows,p.rows.length)&&indices(p.expandedRows,p.rows.length),'所选表格行已超出数据范围。');
      need(strings(p.details),'行详情应为文字。');
    }
  }
  VideoUI.validateExtra=checked;
  VideoUI.ext={mediaURL,picture,selected,dark,small,readout,bar,surface,desktop,text,slider,select,clock,bounded,toggle,gesture,sheetSVG,markSvg};
})();

(() => {
  'use strict';
  const {el,box,row,col,note,heading,btn,icon}=VideoUI.helpers;
  const {picture,selected,dark,small,readout,bar,surface,desktop,text,slider,select,bounded,toggle,gesture}=VideoUI.ext;
  function bottomNav({p,set}){
    const nav=el('nav',{class:'ux-bottomnav','aria-label':'底部导航'},p.items.map((name,i)=>
      selected([icon(['grid','folder','bookmark'][i%3]),name],()=>set({active:i}),i===p.active,'bottom'+i)));
    return box('ux-mobile',box('ux-screen-title',note('工作区'),heading(p.bodies[p.active])),nav);
  }
  function bottomSheet({p,set}){
    const change=n=>set({level:bounded(n,0,2)});
    const grip=btn(el('i'),()=>change((p.level+1)%3),'ux-grip',{'aria-label':'切换面板高度'});
    const area=box('ux-sheet size'+p.level,grip,bar(p.title,note(['收拢','半屏','展开'][p.level])),
      p.level?col(...p.details.slice(0,p.level===1?1:p.details.length).map(s=>el('p',{},s))):null);
    let pressed=null;
    const stops=[49,101,164];
    area.style.touchAction='none';
    area.onpointerdown=e=>{if(e.button===0)pressed={y:e.clientY,moved:false,id:e.pointerId};};
    area.onpointermove=e=>{
      if(!pressed||e.pointerId!==pressed.id)return;
      const delta=pressed.y-e.clientY;
      if(Math.abs(delta)>5){pressed.moved=true;area.setPointerCapture(e.pointerId);area.style.minHeight=bounded(stops[p.level]+delta,49,170)+'px';}
    };
    area.onpointerup=e=>{
      if(!pressed)return;const delta=pressed.y-e.clientY,moved=pressed.moved;pressed=null;
      if(moved){area.style.minHeight='';change(p.level+(Math.abs(delta)>18?Math.sign(delta):0));}
    };
    area.onpointercancel=()=>{pressed=null;area.style.minHeight='';};
    return box('ux-mobile ux-sheet-stage',box('ux-sheet-back',icon('layers'),p.background),area);
  }
  function wheel({p,set}){
    const move=d=>set({active:bounded(p.active+d,0,p.items.length-1)});
    const track=el('div',{class:'ux-wheel',tabIndex:0,role:'spinbutton','aria-label':p.label,'aria-valuemin':1,'aria-valuemax':p.items.length,'aria-valuenow':p.active+1,'aria-valuetext':p.items[p.active],'data-key':'wheel'},
      small(p.items[p.active-1]||'—',()=>move(-1),p.active===0),readout(p.items[p.active]),small(p.items[p.active+1]||'—',()=>move(1),p.active===p.items.length-1));
    track.onkeydown=e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();move(e.key==='ArrowUp'?-1:1);}};
    track.onwheel=e=>{if(e.deltaY){e.preventDefault();move(Math.sign(e.deltaY));}};
    gesture(track,'y',d=>move(d<0?1:-1));
    return surface(heading(p.label),track);
  }
  function swipe({p,set}){
    if(p.archived)return surface(bar('已归档',small('撤回',()=>set({archived:false,open:false}))),note(p.label));
    const front=btn([icon('audio'),col(heading(p.label),note(p.meta))],()=>set({open:!p.open}),'ux-swipefront',{'aria-expanded':String(p.open)});
    const shell=box('ux-swiperow',front,p.open?dark('归档',()=>set({archived:true,open:false})):null);
    gesture(shell,'x',d=>set({open:d<0}));return shell;
  }
  function refresh({p,set}){
    const apply=()=>set({refreshed:true});
    const pane=surface(bar(p.title,small(p.refreshed?'重置':'下拉刷新',p.refreshed?()=>set({refreshed:false}):apply)),
      el('p',{class:'ux-status'},icon(p.refreshed?'check':'down'),p.refreshed?'已更新 1 项':'下拉后松开刷新'),
      el('ul',{class:'ux-lines'},(p.refreshed?[p.incoming,...p.items]:p.items).map((v,i)=>el('li',{class:p.refreshed&&i===0?'is-active':''},icon('file'),v))));
    gesture(pane,'y',d=>{if(d>0)apply();});return pane;
  }
  function gallery({p,set}){
    const next=d=>set({active:(p.active+d+p.items.length)%p.items.length});
    const shot=box('ux-photo',picture(p.images[p.active],p.items[p.active]));
    gesture(shot,'x',d=>next(d<0?1:-1));
    return col(shot,bar(p.items[p.active],box('ux-dots',...p.items.map((s,i)=>btn('',()=>set({active:i}),'ux-page-dot'+(i===p.active?' is-active':''),{'aria-label':s,'aria-pressed':String(i===p.active)})))));
  }
  function commands({p,set}){
    const list=box('ux-command-list'), result=el('div',{class:'ux-help',role:'status'},p.result?'已执行 · '+p.result:'↑ ↓ 选择　Enter 执行');
    const matches=()=>p.items.map((v,i)=>({v,i})).filter(x=>x.v.includes(p.query.trim()));
    const run=i=>{set({result:p.items[i],active:i},false);result.textContent='已执行 · '+p.items[i];draw();};
    function draw(){const candidates=matches();list.replaceChildren(...(candidates.length?candidates.map(({v,i})=>selected([icon('arrow'),v],()=>run(i),p.active===i,'cmd'+i)):[note('没有匹配命令')]));}
    const input=text(p.query,'查找命令',v=>{set({query:v,result:''},false);const m=matches();if(m.length)set({active:m[0].i},false);result.textContent='↑ ↓ 选择　Enter 执行';draw();});
    input.placeholder=p.title;input.onkeydown=e=>{const m=matches();if(!m.length)return;if(e.key==='Enter'){e.preventDefault();run(p.active);}else if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const at=m.findIndex(x=>x.i===p.active);set({active:m[(at+(e.key==='ArrowDown'?1:-1)+m.length)%m.length].i},false);draw();}};draw();
    return desktop(p.title,box('ux-command-search',icon('search'),input),list,result);
  }
  function keyChord({p,set}){
    return col(bar(p.label,row(...['mac','windows'].map((v,i)=>selected(['Mac','Windows'][i],()=>set({platform:v}),p.platform===v,'os'+i)))),
      box('ux-keys',...p[p.platform].map(v=>el('kbd',{},v))));
  }
  function dock({p,set}){
    const tools=box('ux-dock-tools',heading(p.title),...p.tools.map(v=>note(v)));
    tools.draggable=true;tools.ondragstart=e=>e.dataTransfer.setData('text/plain','dock');
    const canvas=box('ux-dock-canvas',icon('grid'),p.canvas);
    const content=box('ux-dock dock-'+p.dock,canvas,tools);
    content.ondragover=e=>e.preventDefault();
    content.ondrop=e=>{e.preventDefault();const r=content.getBoundingClientRect(),t=(e.clientX-r.left)/r.width;set({dock:t<.34?'left':t>.66?'right':'float'});};
    return desktop(p.title,content,row(...['left','float','right'].map((v,i)=>selected(['靠左','浮动','靠右'][i],()=>set({dock:v}),p.dock===v))));
  }
  function layers({p,set}){
    function reorder(d){const j=p.active+d;if(j<0||j>=p.items.length)return;const order=p.items.map((_,i)=>i);[order[p.active],order[j]]=[order[j],order[p.active]];
      set({items:order.map(i=>p.items[i]),active:j,hidden:order.map((v,i)=>p.hidden.includes(v)?i:-1).filter(i=>i>=0)});}
    return desktop('图层',box('ux-layer-list',...p.items.map((name,i)=>box('ux-layer'+(p.active===i?' is-active':''),
        btn([icon('layers'),name],()=>set({active:i}),'ux-plain'),small(p.hidden.includes(i)?'隐藏':'显示',()=>set({hidden:toggle(p.hidden,i)}))))),
      row(small('上移一层',()=>reorder(-1),!p.active),small('下移一层',()=>reorder(1),p.active===p.items.length-1)));
  }
  function inspector({p,set}){
    const obj=box('ux-object',p.items[p.active]), fields=box('ux-properties');
    function paint(){const [x,y,opacity]=p.settings[p.active];Object.assign(obj.style,{left:x*.65+'%',top:y*.6+'%',opacity:opacity/100});}
    ['水平位置','垂直位置','不透明度'].forEach((s,i)=>{
      const v=p.settings[p.active][i],o=el('output',{},v+'%');
      const control=slider(s,v,0,100,1,n=>{const vals=p.settings.map(a=>a.slice());vals[p.active][i]=n;set({settings:vals},false);o.textContent=n+'%';paint();});
      fields.append(el('label',{},s,control,o));
    });paint();return desktop('属性检查器',bar('当前对象',select('当前对象',p.items,p.active,i=>set({active:i}))),box('ux-inspect-canvas',obj),fields);
  }
  function zoom({p,set}){
    return col(box('ux-zoomphoto',picture(p.image,p.label)),bar(p.label,row(small('−',()=>set({zoom:bounded(p.zoom-25,50,250)}),p.zoom<=50),readout(p.zoom+'%'),small('＋',()=>set({zoom:bounded(p.zoom+25,50,250)}),p.zoom>=250),small('适配',()=>set({zoom:100})))));
  }
  VideoUI.register({'bottom-nav':bottomNav,'bottom-sheet':bottomSheet,'wheel-picker':wheel,'swipe-row':swipe,'pull-refresh':refresh,'swipe-gallery':gallery,
    'command-palette':commands,'key-chord':keyChord,'dock-panel':dock,'layer-panel':layers,inspector,'zoom-fit':ctx=>{
      const node=zoom(ctx);node.querySelector('img').style.transform='scale('+ctx.p.zoom/100+')';return node;
    }});
})();

(() => {
  'use strict';
  const {el,box,row,col,note,heading,btn,icon,tag}=VideoUI.helpers;
  const {picture,selected,dark,small,readout,bar,surface,text,slider,select,bounded,toggle}=VideoUI.ext;
  function tiles({p,set}) {
    return box('ux-filetiles',...p.items.map((name,i)=>selected([picture(p.images[i],name),el('span',{},name)],()=>set({active:i}),p.active===i,'tile'+i)));
  }
  function attachment({p,set}) {
    return p.attached?box('ux-fileline',icon('file'),col(heading(p.name),note(p.meta)),small('移除',()=>set({attached:false}))):small('附上 '+p.name,()=>set({attached:true}));
  }
  function queue({p,set}) {
    const update=i=>{
      const next=p.progress.slice();next[i]=p.failed.includes(i)?0:Math.min(100,next[i]+25);
      set({progress:next,failed:p.failed.filter(v=>v!==i)});
    };
    return surface(heading('上传队列'),...p.items.map((name,i)=>{
      const value=p.progress[i],failed=p.failed.includes(i);
      return box('ux-queuerow',bar(name,note(failed?'连接中断':value===100?'已就绪':value+'%')),
        box('ux-track',el('i',{style:{width:value+'%'}})),failed?small('重试',()=>update(i)):value<100?small('推进示例进度',()=>update(i)):null);
    }));
  }
  function preview({p,set}) {
    const img=picture(p.images[p.active],p.items[p.active]);img.style.transform='scale('+p.zoom/100+')';
    return surface(bar(p.title,tag((p.active+1)+' / '+p.items.length,'accent')),box('ux-docpreview',img),
      bar(p.items[p.active],row(small('上一页',()=>set({active:p.active-1}),p.active===0),small('下一页',()=>set({active:p.active+1}),p.active===p.items.length-1))),
      row(note('缩放'),...[100,140,170].map(n=>selected(n+'%',()=>set({zoom:n}),p.zoom===n))));
  }
  function transfer({p,set}) {
    const side=right=>box('ux-transfer-side',heading(right?'本期清单':'可用素材'),...p.items.flatMap((v,i)=>p.assigned.includes(i)===right?[selected(v,()=>set({marked:toggle(p.marked,i)}),p.marked.includes(i),'f'+i)]:[]));
    function move(right){const keys=p.marked.filter(i=>p.assigned.includes(i)!==right);
      set({assigned:right?[...p.assigned,...keys]:p.assigned.filter(i=>!keys.includes(i)),marked:p.marked.filter(i=>!keys.includes(i))});}
    return col(box('ux-transfer',side(false),side(true)),row(small('移入本期 →',()=>move(true),!p.marked.some(i=>!p.assigned.includes(i))),small('← 移回素材库',()=>move(false),!p.marked.some(i=>p.assigned.includes(i)))));
  }
  function history({p,set}){
    return surface(heading('修订记录'),box('ux-history',...p.items.map((s,i)=>selected([el('i'),heading(s),note(p.meta[i])],()=>set({active:i}),i===p.active,'version'+i))),box('ux-excerpt',p.bodies[p.active]));
  }
  function cascader({p,set}) {
    const list=(items,i,fn)=>box('ux-cascade-col',...items.map((v,j)=>selected(v,()=>fn(j),i===j)));
    return col(bar(p.label,note(p.items[p.active]+' / '+p.children[p.active][p.child])),
      box('ux-cascade',list(p.items,p.active,i=>set({active:i,child:0})),list(p.children[p.active],p.child,j=>set({child:j}))));
  }
  function dates({p,set}) {
    const input=(key,label)=>el('label',{class:'ux-date'},note(label),el('input',{type:'date',value:p[key],'aria-label':label,onchange:e=>{
      const v=e.target.value;if(!v){e.target.value=p[key];return;}
      const start=key==='start'?v:p.start,end=key==='end'?v:p.end;set({start:start>end?v:start,end:end<start?v:end});
    }}));
    const days=Math.round((Date.parse(p.end)-Date.parse(p.start))/86400000)+1;
    return surface(bar(p.label,tag('含首尾 '+days+' 天','accent')),box('ux-dates',input('start','开始日期'),input('end','结束日期')));
  }
  // A shared track positions both handles. Each handle remains focusable for arrow keys.
  function dualTrack({label,min,max,low,high,step,delta=0,format,update}){
    let a=low,b=high;
    const out=readout(format(a)+' — '+format(b)),fill=el('i',{class:'ux-range-fill'});
    const track=el('div',{class:'ux-dualtrack'},el('i',{class:'ux-range-base'}),fill);
    const handles=['起点','终点'].map((name,i)=>{
      const h=el('button',{type:'button',class:'ux-thumb',role:'slider','aria-label':label+name});
      h.onpointerdown=e=>{e.preventDefault();h.focus();h.setPointerCapture(e.pointerId);};
      function drag(e){const r=track.getBoundingClientRect();change(i,min+bounded((e.clientX-r.left)/r.width,0,1)*(max-min));}
      h.onpointermove=e=>{if(h.hasPointerCapture(e.pointerId))drag(e);};
      h.onkeydown=e=>{const v=i?b:a;const choices={ArrowRight:v+step,ArrowLeft:v-step,ArrowUp:v+step,ArrowDown:v-step,Home:min,End:max};if(e.key in choices){e.preventDefault();change(i,choices[e.key]);}};
      track.append(h);return h;
    });
    function draw(){const percent=v=>(v-min)/(max-min)*100;
      fill.style.left=percent(a)+'%';fill.style.width=(percent(b)-percent(a))+'%';
      handles.forEach((h,i)=>{const n=i?b:a;h.style.left=percent(n)+'%';h.setAttribute('aria-valuenow',n);h.setAttribute('aria-valuemin',i?a+delta:min);h.setAttribute('aria-valuemax',i?max:b-delta);h.setAttribute('aria-valuetext',format(n));});
      out.textContent=format(a)+' — '+format(b);
    }
    function change(i,v){v=Number((min+Math.round((v-min)/step)*step).toFixed(3));if(i)b=bounded(v,a+delta,max);else a=bounded(v,min,b-delta);draw();update(a,b);}
    track.onpointerdown=e=>{if(e.target.closest('button'))return;const r=track.getBoundingClientRect();const v=min+bounded((e.clientX-r.left)/r.width,0,1)*(max-min);change(Math.abs(v-a)<=Math.abs(v-b)?0:1,v);};
    draw();return col(bar(label,out),track,bar(note(format(min)),note(format(max))));
  }
  function pair({p,set}){
    return surface(dualTrack({label:p.label,min:p.min,max:p.max,low:p.low,high:p.high,step:1,format:x=>x+' '+p.unit,update:(low,high)=>set({low,high},false)}));
  }
  function tags({p,set}) {
    const add=()=>{const s=p.draft.trim();if(s&&!p.tags.includes(s))set({tags:[...p.tags,s],draft:''});};
    const input=text(p.draft,'新标签',v=>set({draft:v},false),{placeholder:'输入后按回车','data-key':'newtag'});
    input.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();add();}};
    return surface(heading(p.label),row(...p.tags.map((s,i)=>btn([s,icon('close')],()=>set({tags:p.tags.filter((_,j)=>i!==j)}),'ux-chip',{'aria-label':'移除标签 '+s}))),box('ux-inline',input,small('添加',add)));
  }
  function filter({p,set}) {
    const kinds=[...new Set(p.formats)],res=el('ul',{class:'ux-lines'});
    function draw(){const ids=p.items.map((_,i)=>i).filter(i=>p.andMode?(p.formats[i]===p.kind&&p.seconds[i]<=p.limit):(p.formats[i]===p.kind||p.seconds[i]<=p.limit));
      res.replaceChildren(...(ids.length?ids.map(i=>el('li',{},p.items[i],note(p.formats[i]+' · '+p.seconds[i]+' 秒'))):[el('li',{},'没有匹配素材')]));}
    const val=readout(p.limit+' 秒'),range=slider('最长时长',p.limit,0,Math.max(60,...p.seconds,p.limit),1,v=>{set({limit:v},false);val.textContent=v+' 秒';draw();});draw();
    return surface(bar('筛选条件',row(selected('同时满足',()=>set({andMode:true}),p.andMode),selected('满足其一',()=>set({andMode:false}),!p.andMode))),
      bar('素材类型',select('素材类型',kinds,kinds.indexOf(p.kind),i=>set({kind:kinds[i]}))),bar('最长时长',val),range,res);
  }
  function time({p,set}){
    const options=n=>Array.from({length:n},(_,i)=>String(i).padStart(2,'0'));
    return surface(bar(p.label,readout(options(24)[p.hour]+':'+options(60)[p.minute])),row(note('小时'),select('小时',options(24),p.hour,hour=>set({hour})),note('分钟'),select('分钟',options(60),p.minute,minute=>set({minute}))));
  }
  VideoUI.ext.dualTrack=dualTrack;
  VideoUI.register({'file-tiles':tiles,attachment,'upload-queue':queue,'file-preview':preview,transfer,'version-history':history,cascader,'date-range':dates,'range-pair':pair,'tag-entry':tags,'rule-filter':filter,'time-picker':time});
})();

(() => {
  'use strict';
  const {el,box,col,row,note,heading,btn,svg,tag}=VideoUI.helpers;
  const {mediaURL,picture,selected,small,readout,bar,surface,slider,clock,bounded,sheetSVG,dualTrack}=VideoUI.ext;
  function waveform(samples){
    const max=Math.max(.01,...samples),w=396,h=62;
    const bars=samples.map((n,i)=>{const height=Math.max(1.5,Math.abs(n)/max*(h-5));return svg('rect',{x:i*w/samples.length,y:(h-height)/2,width:Math.max(.65,w/samples.length*.65),height,rx:1,fill:'var(--vu-rim)'});});
    return sheetSVG(w,h,'原声振幅波形',bars);
  }
  function player({p,set},audioMode){
    const media=el(audioMode?'audio':'video',{preload:'auto',src:mediaURL(p.src),playsinline:true,'aria-label':p.label,class:'ux-video'});
    media.muted=audioMode?false:p.muted;
    if(!audioMode)media.poster=mediaURL(p.poster);
    const time=readout(clock(p.time)+' / '+clock(p.duration)),state=note(''),play=btn('播放',()=>{
      if(!media.paused){media.pause();return;}
      if(media.currentTime>=p.duration-.02)media.currentTime=0;
      media.play().catch(()=>{state.textContent='请检查本地媒体文件';});
    },'primary');
    const marker=el('i',{class:'ux-playhead'});
    const scrub=slider('播放位置',p.time,0,p.duration,.01,v=>seek(v));
    function show(t){
      const v=bounded(Number(t.toFixed(2)),0,p.duration);
      set({time:v},false);time.textContent=clock(v)+' / '+clock(p.duration);scrub.value=v;scrub.style.setProperty('--ux-track-pct',(100*v/p.duration)+'%');marker.style.left=(100*v/p.duration)+'%';
    }
    function seek(t){if(media.readyState>=1)media.currentTime=bounded(t,0,p.duration);show(t);}
    const start=p.time;media.dataset.captureTime=start;
    media.addEventListener('loadedmetadata',()=>{media.currentTime=Math.min(start,media.duration);});
    media.addEventListener('timeupdate',()=>{if(!media.isConnected)return;show(media.currentTime);if(media.currentTime>=p.duration&&!media.paused)media.pause();});
    media.onplay=()=>{play.textContent='暂停';};media.onpause=()=>{play.textContent='播放';};
    media.onerror=()=>{state.textContent='媒体无法打开';};
    const wave=audioMode?box('ux-wave',waveform(p.wave),marker):null;
    marker.style.left=100*p.time/p.duration+'%';
    if(wave)wave.onclick=e=>{const r=wave.getBoundingClientRect();seek(bounded((e.clientX-r.left)/r.width,0,1)*p.duration);};
    const mute=audioMode?null:small(p.muted?'开启声音':'静音',()=>{media.muted=!media.muted;set({muted:media.muted},false);mute.textContent=media.muted?'开启声音':'静音';});
    return surface(bar(p.label,time),audioMode?col(media,wave):box('ux-video-stage',media),scrub,row(play,mute,state));
  }
  function trim({p,set}){
    const mask=el('i',{class:'ux-selection'}),length=readout(clock(p.end-p.start));
    const wave=box('ux-wave',waveform(p.wave),mask);
    function position(a,b){mask.style.left=(100*a/p.duration)+'%';mask.style.width=(100*(b-a)/p.duration)+'%';length.textContent=clock(b-a);}
    position(p.start,p.end);
    const controls=dualTrack({label:'入点 / 出点',min:0,max:p.duration,low:p.start,high:p.end,step:.01,delta:.01,format:clock,update:(start,end)=>{set({start,end},false);position(start,end);}});
    return surface(bar(p.label,length),wave,controls);
  }
  function film({p,set}){
    const shot=picture(p.frames[p.active],'当前口播帧');
    return col(bar(p.label,tag(clock(p.marks[p.active]),'accent')),box('ux-film-focus',shot),
      box('ux-filmstrip',...p.frames.map((file,i)=>selected(picture(file,clock(p.marks[i])),()=>set({active:i}),i===p.active,'frame'+i))));
  }
  function captions({p,set}){
    const i=p.active, maxEnd=i<p.items.length-1?p.starts[i+1]:p.duration;
    const span=p.duration-p.viewStart;
    const info=readout(clock(p.starts[i])+' — '+clock(p.ends[i]));
    const segments=p.items.map((line,j)=>{
      const s=selected(line,()=>set({active:j}),j===i,'cue'+j);
      s.style.left=100*(p.starts[j]-p.viewStart)/span+'%';s.style.width=100*(p.ends[j]-p.starts[j])/span+'%';return s;
    });
    const range=slider('当前字幕出点',p.ends[i],Math.min(maxEnd,p.starts[i]+.01),maxEnd,.01,v=>{
      const ends=p.ends.slice();ends[i]=v;set({ends},false);segments[i].style.width=100*(v-p.starts[i])/span+'%';info.textContent=clock(p.starts[i])+' — '+clock(v);
    });
    return surface(bar('字幕轨',info),box('ux-cues',...segments),note('片段视窗 '+clock(p.viewStart)+' — '+clock(p.duration)),el('p',{class:'ux-caption'},p.items[i]),bar('调整本句出点',note('秒')),range);
  }
  function levels({p,set}){
    const labels=[],fills=[];
    const lines=['L','R'].map(letter=>{
      const fill=el('i');fills.push(fill);const value=readout('');labels.push(value);
      return box('ux-meter-row',heading(letter),box('ux-meter-track',fill),value);
    });
    const time=note('');
    function show(i){p.levels[i].forEach((db,j)=>{labels[j].textContent=db.toFixed(1)+' dBFS';fills[j].style.width=(bounded(db+60,0,60)/60*100)+'%';});time.textContent=clock((i+.5)*p.duration/p.levels.length);}
    show(p.active);
    return surface(bar(p.label,time),...lines,slider('采样窗口',p.active,0,p.levels.length-1,1,i=>{set({active:i},false);show(i);}));
  }
  VideoUI.register({'video-player':ctx=>player(ctx,false),'wave-seek':ctx=>player(ctx,true),trim,filmstrip:film,'caption-track':captions,'level-meter':levels});
})();

(() => {
  'use strict';
  const {el,box,col,row,note,heading,svg}=VideoUI.helpers;
  const {selected,readout,bar,surface,sheetSVG,markSvg}=VideoUI.ext;
  const ink='var(--vu-ink)',muted='var(--vu-muted)',rim='var(--vu-rim)',paper='var(--vu-paper)',focus='var(--vu-accent)';
  const line=(x1,y1,x2,y2,more={})=>svg('line',{x1,y1,x2,y2,stroke:rim,'stroke-width':2,...more});
  const label=(x,y,s,extra={})=>markSvg('text',{x,y,fill:ink,'font-size':13,'font-weight':700,...extra},[String(s)]);
  const sum=a=>a.reduce((v,x)=>v+x,0);
  const clean=x=>Number(x.toFixed(2)).toString();
  function interactive(node,name,fn){
    node.setAttribute('role','button');node.setAttribute('aria-label',name);node.setAttribute('tabindex','0');node.style.cursor='pointer';
    node.addEventListener('click',fn);node.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();fn();}});return node;
  }
  function hatch(uid){
    const pat=markSvg('pattern',{id:uid,width:7,height:7,patternUnits:'userSpaceOnUse'},[
      svg('rect',{width:7,height:7,fill:paper}),svg('path',{d:'M-1 1l2-2M0 7l7-7M6 8l2-2',fill:'none',stroke:rim,'stroke-width':1.8})]);
    return markSvg('defs',{},[pat]);
  }
  function donut({p,set,uid}){
    const total=sum(p.values);let cursor=0;
    const arcs=p.values.map((v,i)=>{
      const size=v/total*100;
      const node=svg('circle',{cx:80,cy:80,r:59,fill:'none',stroke:i===p.active?focus:[ink,rim,'url(#'+uid+')',muted][i%4],
        'stroke-width':i===p.active?23:18,pathLength:100,'stroke-dasharray':size+' '+(100-size),'stroke-dashoffset':-cursor,transform:'rotate(-90 80 80)'});
      cursor+=size;return node;
    });
    const view=sheetSVG(160,160,p.label,[hatch(uid),...arcs,label(80,88,clean(100*p.values[p.active]/total)+'%',{'text-anchor':'middle','font-size':25,'font-weight':850})]);
    return surface(heading(p.label),box('ux-donut',view,box('ux-legend',...p.items.map((s,i)=>selected(s+'　'+clean(p.values[i]/total*100)+'%',()=>set({active:i}),p.active===i)))));
  }
  function stacked({p,set,uid}){
    const totals=p.matrix.map(sum),max=Math.max(1,...totals);
    const lines=p.items.map((name,i)=>{
      let x=0;
      const bars=p.matrix[i].map((v,j)=>{
        const width=v/max*360;
        const r=svg('rect',{x,y:3,width,height:19,fill:j===0?(i===p.active?focus:paper):j%2===1?rim:'url(#'+uid+')',stroke:ink,'stroke-width':1.8});
        x+=width;return r;
      });
      return col(bar(name,note(clean(totals[i])+' '+p.unit)),sheetSVG(360,25,name,i===0?[hatch(uid),...bars]:bars));
    });
    return surface(heading(p.label),...lines,
      row(...p.items.map((s,i)=>selected(s,()=>set({active:i}),p.active===i))),
      el('p',{class:'ux-help'},p.series.map((v,j)=>v+' '+p.matrix[p.active][j]+p.unit).join('　')));
  }
  function waterfall({p,set}){
    let running=0;
    const bars=p.values.map(v=>{const before=running;running+=v;return [before,running];});
    bars.push([0,running]);const names=[...p.items,'终值'];
    const all=bars.flat(),lo=Math.min(0,...all),hi=Math.max(1,...all),width=375,gap=width/bars.length;
    const y=v=>104-(v-lo)/(hi-lo)*77;
    const art=[line(12,y(0),391,y(0))];
    bars.forEach(([a,b],i)=>{
      const x=16+i*gap+gap*.16,w=gap*.58;
      if(i<bars.length-2)art.push(line(x+w,y(b),16+(i+1)*gap+gap*.16,y(b),{'stroke-dasharray':'4 3'}));
      const rect=svg('rect',{x,y:Math.min(y(a),y(b)),width:w,height:Math.max(2,Math.abs(y(a)-y(b))),fill:i===p.active?focus:i===bars.length-1?ink:paper,stroke:ink,'stroke-width':3});
      art.push(i===bars.length-1?rect:interactive(rect,names[i],()=>set({active:i})));
      const val=i===bars.length-1?running:p.values[i];
      art.push(label(x+w/2,Math.min(y(a),y(b))-6,(val>0&&i>0&&i<bars.length-1?'+':'')+clean(val),{'text-anchor':'middle'}));
    });
    return surface(bar(p.label,readout(clean(running)+' '+p.unit)),sheetSVG(405,117,p.label,art),
      box('ux-axisnames',...names.map(v=>note(v))),el('p',{class:'ux-help'},p.items[p.active]+'后累计 '+clean(bars[p.active][1])+' '+p.unit));
  }
  function scatter({p,set}){
    const xs=p.points.map(a=>a[0]),ys=p.points.map(a=>a[1]);
    const xmin=Math.min(0,...xs),xmax=Math.max(xmin+1,...xs),ymin=Math.min(0,...ys),ymax=Math.max(ymin+1,...ys);
    const x=v=>37+(v-xmin)/(xmax-xmin)*325,y=v=>130-(v-ymin)/(ymax-ymin)*96;
    const art=[line(34,132,380,132),line(34,132,34,23),label(37,17,p.yLabel),label(382,166,p.xLabel,{'text-anchor':'end'}),label(29,147,clean(xmin)),label(352,147,clean(xmax)),label(4,37,clean(ymax)),label(4,133,clean(ymin))];
    p.points.forEach(([a,b],i)=>{art.push(interactive(svg('circle',{cx:x(a),cy:y(b),r:i===p.active?8:5,fill:i===p.active?focus:paper,stroke:ink,'stroke-width':3}),p.items[i],()=>set({active:i})));});
    return surface(bar(p.label,readout(p.items[p.active]+' · '+p.points[p.active].join(' / '))),sheetSVG(403,176,p.label,art));
  }
  function nodes({p,set,uid}){
    const n=p.items.length,height=Math.max(156,n*17);
    const pos=p.items.map((_,i)=>[200+147*Math.cos(Math.PI+i*2*Math.PI/n),height/2+(height/2-30)*Math.sin(Math.PI+i*2*Math.PI/n)]);
    const marker=markSvg('marker',{id:uid,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},[svg('path',{d:'M0 0L10 5L0 10Z',fill:ink})]);
    const art=[markSvg('defs',{},[marker])];
    p.edges.forEach(([a,b])=>{const [x,y]=pos[a],[xx,yy]=pos[b],dx=xx-x,dy=yy-y;
      if(!dx&&!dy)return;const frac=Math.min(.43,1/Math.max(Math.abs(dx)/40,Math.abs(dy)/18));
      art.push(line(x+dx*frac,y+dy*frac,xx-dx*frac,yy-dy*frac,{stroke:a===p.active||b===p.active?ink:muted,'stroke-width':a===p.active||b===p.active?3:1.8,'marker-end':'url(#'+uid+')'}));});
    p.items.forEach((s,i)=>{const [x,y]=pos[i];art.push(interactive(markSvg('g',{},[svg('rect',{x:x-38,y:y-16,width:76,height:32,rx:7,stroke:ink,'stroke-width':3,fill:i===p.active?focus:paper}),label(x,y+5,s.length>5?s.slice(0,4)+'…':s,{'text-anchor':'middle'})]),s,()=>set({active:i})));});
    const outgoing=p.edges.filter(([a])=>a===p.active).map(([,b])=>p.items[b]),incoming=p.edges.filter(([,b])=>b===p.active).map(([a])=>p.items[a]);
    return surface(heading(p.label),sheetSVG(400,height,p.label,art),note(p.items[p.active]+'　接收自 '+(incoming.join('、')||'—')+'　交给 '+(outgoing.join('、')||'—')));
  }
  function heat({p,set}){
    const highest=Math.max(1,...p.matrix.flat());
    const grid=el('table',{class:'ux-heat'},el('thead',{},el('tr',{},el('th',{}),...p.columns.map(s=>el('th',{scope:'col'},s)))),
      el('tbody',{},...p.matrix.map((r,i)=>el('tr',{},el('th',{scope:'row'},p.labels[i]),...r.map((v,j)=>{
        const is=p.cell[0]===i&&p.cell[1]===j;
        return el('td',{},el('button',{type:'button',class:is?'is-active':v/highest>.6?'strong':v>0?'some':'','aria-label':p.labels[i]+' '+p.columns[j]+' '+v,onclick:()=>set({cell:[i,j]})},v));
      })))));
    const [i,j]=p.cell;return surface(heading(p.label),grid,bar(p.labels[i]+' / '+p.columns[j],readout(p.matrix[i][j]+' 次')));
  }
  VideoUI.register({donut,stacked,waterfall,scatter,'node-map':nodes,heatmap:heat});
})();

(() => {
  'use strict';
  const {el,box,col,row,note,heading,btn,icon,tag}=VideoUI.helpers;
  const {picture,selected,dark,small,bar,surface,desktop,text}=VideoUI.ext;
  function bubbles({p,set}){
    return col(box('ux-bubble mine',note('提问'),el('p',{},p.question)),p.showAnswer?box('ux-bubble reply',note('回答'),el('p',{},p.answer)):null,
      small(p.showAnswer?'收起回答':'显示回答',()=>set({showAnswer:!p.showAnswer})));
  }
  function composer({p,set,uid}){
    if(p.sent)return col(box('ux-bubble mine',note('已发送'),el('p',{},p.text),p.attached?tag(p.file):null),small('返回草稿',()=>set({sent:false})));
    const send=dark('发送',()=>{if(p.text.trim()||p.attached)set({sent:true});},!p.text.trim()&&!p.attached);
    const area=el('textarea',{class:'ux-compose',rows:2,value:p.text,'aria-label':'消息内容',oninput:e=>{set({text:e.target.value},false);send.disabled=!p.text.trim()&&!p.attached;}});
    const file=el('input',{id:uid+'attach',type:'file',class:'ux-file-input','aria-label':'选择附件',onchange:e=>{if(e.target.files[0])set({file:e.target.files[0].name,attached:true});}});
    return surface(area,p.attached?btn([icon('file'),p.file,icon('close')],()=>set({attached:false}),'ux-chip',{'aria-label':'移除附件'}):null,
      box('vu-between',el('label',{class:'ux-pickfile',for:uid+'attach'},file,icon('plus'),'附件'),send));
  }
  function tool({p,set}){
    const status={done:'已完成',running:'运行中',error:'失败'}[p.phase];
    return desktop('工具调用',bar(p.tool,tag(status,p.phase==='done'?'accent':'')),small(p.open?'收起详情':'展开详情',()=>set({open:!p.open})),
      p.open?col(box('ux-call-field',note('输入'),heading(p.arg)),box('ux-call-field',note(p.phase==='error'?'错误':'输出'),heading(p.phase==='done'?p.output:p.phase==='running'?'等待返回':p.error))):null);
  }
  function versions({p,set}){
    return surface(bar(p.label,note((p.active+1)+' / '+p.items.length)),box('ux-answer',note(p.items[p.active]),el('p',{},p.bodies[p.active])),
      row(small('上一版',()=>set({active:p.active-1}),p.active===0),small('下一版',()=>set({active:p.active+1}),p.active===p.items.length-1)));
  }
  function citation({p,set}){
    return col(el('p',{class:'ux-cite-body'},p.answer,' ',...p.items.map((s,i)=>btn(String(i+1),()=>set({active:i,open:p.active!==i||!p.open}),'ux-cite'+(i===p.active&&p.open?' is-active':''),{'aria-label':'引用 '+(i+1)+' '+s}))),
      p.open?box('ux-sourcecard',tag('来源 '+(p.active+1),'accent'),heading(p.items[p.active]),note(p.bodies[p.active])):null);
  }
  function plan({p,set}){
    return surface(bar('执行清单',tag(p.completed+' / '+p.items.length,'accent')),
      el('ol',{class:'ux-plan'},...p.items.map((s,i)=>el('li',{class:i===p.completed?'is-active':''},icon(i<p.completed?'check':i===p.completed?'clock':'layers'),s,note(i<p.completed?'完成':i===p.completed?'进行中':'待处理')))),
      row(small('退回一步',()=>set({completed:p.completed-1}),p.completed===0),small('完成当前项',()=>set({completed:p.completed+1}),p.completed===p.items.length)));
  }
  function quote({p,set}){
    if(!p.located)return col(el('blockquote',{class:'ux-quote'},p.paragraphs[p.active]),bar(p.title,small('定位原文',()=>set({located:true}))));
    return surface(bar(p.title,small('返回引文',()=>set({located:false}))),...p.paragraphs.map((s,i)=>el('p',{class:'ux-paragraph'+(i===p.active?' is-active':'')},note('§ '+(i+1)),s)));
  }
  function foot({p,set}){
    return col(el('p',{class:'ux-cite-body'},p.text,el('sup',{},btn(p.mark,()=>set({open:!p.open}),'ux-cite',{'aria-expanded':String(p.open),'aria-label':'脚注 '+p.mark}))),
      p.open?el('aside',{class:'ux-foot'},el('strong',{},p.mark),el('p',{},p.body)):null);
  }
  function link({p,set}){
    return box('ux-linkcard',picture(p.image,p.title),col(note(p.publisher),heading(p.title),
      small(p.expanded?'隐藏地址':'查看出处',()=>set({expanded:!p.expanded})),
      p.expanded?el('a',{href:p.url,target:'_blank',rel:'noopener noreferrer',class:'ux-url'},p.url):null));
  }
  function margin({p,set}){
    return col(el('p',{class:'ux-cite-body'},p.before,btn(p.quote,()=>set({open:!p.open}),'ux-anchor',{'aria-expanded':String(p.open)}),p.after),
      p.open?box('ux-marginnote',note(p.author+' · 批注'),el('p',{},p.comment)):null);
  }
  // Align by longest common subsequence so an inserted line does not mark later unchanged lines.
  function diffRows(a,b) {
    const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>new Uint16Array(n+1));
    for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)dp[i][j]=a[i]===b[j]?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
    let i=0,j=0;const result=[],removed=[],added=[];
    function flush(){while(removed.length||added.length)result.push([removed.shift(),added.shift(),true]);}
    while(i<m||j<n){
      if(i<m&&j<n&&a[i]===b[j]){flush();result.push([a[i],b[j],false]);i++;j++;}
      else if(i<m&&(j===n||dp[i+1][j]>=dp[i][j+1]))removed.push(a[i++]);
      else added.push(b[j++]);
    }
    flush();return result;
  }
  function diff({p,set}){
    const rows=diffRows(p.oldLines,p.newLines).filter(r=>!p.onlyChanges||r[2]);
    const item=(s,changed,sign)=>el('td',{class:changed&&s!==undefined?(sign==='＋'?'ux-added':'ux-removed'):''},s===undefined?'':(changed?sign+' ':'')+s);
    return surface(bar(p.title,small(p.onlyChanges?'显示全文':'只看改动',()=>set({onlyChanges:!p.onlyChanges}))),
      el('table',{class:'ux-diff'},el('thead',{},el('tr',{},el('th',{},'原版'),el('th',{},'新版'))),el('tbody',{},...rows.map(([a,b,changed])=>el('tr',{},item(a,changed,'−'),item(b,changed,'＋'))))),!rows.length?note('两版内容相同'):null);
  }
  function findReplace({p,set}){
    const doc=el('p',{class:'ux-find-doc'}),counter=note('');
    const starts=()=>{const a=[];if(p.query)for(let j=0;(j=p.text.indexOf(p.query,j))>=0;j+=p.query.length)a.push(j);return a;};
    const next=small('下一处',()=>{const a=starts();if(a.length){set({match:(p.match+1)%a.length},false);draw();}});
    const replace=small('替换本处',()=>{const a=starts();if(!a.length)return;const at=a[Math.min(p.match,a.length-1)];set({text:p.text.slice(0,at)+p.replacement+p.text.slice(at+p.query.length),match:0},false);draw();});
    function draw(){
      const a=starts(), n=a.length?Math.min(p.match,a.length-1):0;
      if(n!==p.match)set({match:n},false);
      const chunks=[];let last=0;
      a.forEach((v,i)=>{chunks.push(p.text.slice(last,v),el('mark',{class:i===n?'is-active':''},p.query));last=v+p.query.length;});
      doc.replaceChildren(...chunks,p.text.slice(last));counter.textContent=a.length?(n+1)+' / '+a.length:'0 处';next.disabled=replace.disabled=!a.length;
    }
    draw();return surface(bar('文中查找',counter),el('label',{class:'ux-formrow'},'查找',text(p.query,'查找词',v=>{set({query:v,match:0},false);draw();})),
      el('label',{class:'ux-formrow'},'替换',text(p.replacement,'替换为',v=>set({replacement:v},false))),doc,row(next,replace));
  }
  VideoUI.register({'chat-bubbles':bubbles,composer,'tool-call':tool,'answer-versions':versions,'inline-citation':citation,'plan-checklist':plan,
    'source-quote':quote,footnote:foot,'source-link':link,'margin-note':margin,'line-diff':diff,'find-replace':findReplace});
})();

(() => {
  'use strict';
  const {el,box,row,col,note,heading,icon,btn}=VideoUI.helpers;
  const {small,selected,toggle}=VideoUI.ext;
  function search({p,set}){
    const results=box('vu-searchrows'),recent=box('ux-recents');
    const input=el('input',{type:'search',value:p.value,placeholder:p.label,'aria-label':p.label,
      oninput:e=>{set({value:e.target.value},false);render();},onkeydown:e=>{if(e.key==='Enter'){e.preventDefault();remember(p.value);}}});
    function remember(v){if(!v.trim())return;const q=v.trim();set({value:q,recent:[q,...p.recent.filter(x=>x!==q)].slice(0,6)},false);input.value=q;render();}
    function render(){
      const hits=p.items.filter(v=>v.toLowerCase().includes(p.value.trim().toLowerCase()));
      results.replaceChildren(...(hits.length?hits.map(s=>row(icon('file'),s)):[note('没有匹配项')]));
      recent.replaceChildren();
      if(!p.value&&p.recent.length)recent.append(note('最近搜索'),row(...p.recent.map(v=>small(v,()=>remember(v))),small('清除记录',()=>{set({recent:[]},false);render();})));
    }
    render();return col(box('vu-control',icon('search'),input),recent,results);
  }
  function menu({p,set}){
    const launch=btn([icon('menu'),p.label,icon('down')],()=>set({open:!p.open}),'',{'aria-expanded':String(p.open),'data-key':'menu'});
    const trigger=p.context?box('ux-context-target',heading('项目文件'),el('p',{},'右键打开操作菜单，或按下面的按钮。'),launch):launch;
    const options=p.open?box('vu-options',...p.items.map(v=>btn(v,()=>set({open:false,selection:v}),'vu-option'))):null;
    const wrap=col(trigger,options,!p.open&&p.selection?note('已选择 · '+p.selection):null);
    wrap.oncontextmenu=e=>{e.preventDefault();set({context:true,open:true});};
    wrap.onkeydown=e=>{if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();set({context:true,open:true});}else if(e.key==='Escape'&&p.open){e.preventDefault();e.stopPropagation();set({open:false});}};
    return wrap;
  }
  function table({p,set}){
    const ix=p.headers.length-1;
    const order=p.rows.map((_,i)=>i);
    if(p.sort!=='none')order.sort((i,j)=>(Number(p.rows[i][ix])-Number(p.rows[j][ix]))*(p.sort==='desc'?-1:1));
    const thead=el('thead',{},el('tr',{},...p.headers.map((v,i)=>el('th',{scope:'col','aria-sort':i===ix?({asc:'ascending',desc:'descending',none:'none'}[p.sort]):null},
      i===ix?btn([v,icon('sort')],()=>set({sort:p.sort==='asc'?'desc':'asc'}),'text',{'aria-label':'按'+v+'排序'}):v))));
    const tbody=el('tbody');
    for(const id of order){
      const values=p.rows[id], open=p.expandedRows.includes(id);
      const name=el('button',{type:'button',class:'ux-rowexpand','aria-expanded':String(open),'aria-label':'展开或收起 '+values[0],onclick:()=>set({expandedRows:toggle(p.expandedRows,id)})},icon(open?'down':'right'),values[0]);
      const check=p.selectable?el('input',{type:'checkbox',checked:p.selectedRows.includes(id),'aria-label':'选择 '+values[0],onchange:()=>set({selectedRows:toggle(p.selectedRows,id),batch:''})}):null;
      tbody.append(el('tr',{},el('td',{},check,name),...values.slice(1).map(v=>el('td',{},v))));
      if(open)tbody.append(el('tr',{class:'ux-rowdetail'},el('td',{colspan:p.headers.length},p.details[id]||values.map((v,i)=>p.headers[i]+' '+v).join(' · '))));
    }
    const wrap=box('ux-table-scroll'+(p.wide?' wide':'')+(p.frozen?' freeze':''),el('table',{class:'vu-table'},thead,tbody));
    const all=p.selectedRows.length===p.rows.length;
    const actions=p.selectable?row(small(all?'取消全选':'全选',()=>set({selectedRows:all?[]:p.rows.map((_,i)=>i),batch:''})),
      small('汇总选中项',()=>set({batch:p.selectedRows.map(i=>p.rows[i][0]).join('、')}),!p.selectedRows.length),note('已选 '+p.selectedRows.length+' 项')):null;
    return col(wrap,actions,p.batch&&p.selectable?note('本期清单 · '+p.batch):null,p.wide?selected(p.frozen?'首列已固定':'固定首列',()=>set({frozen:!p.frozen}),p.frozen):null);
  }
  VideoUI.enhance({search,'menu-button':menu,'data-table':table});
})();

(() => {
  'use strict';
  const {el,box} = VideoUI.helpers;
  const {picture,mediaURL} = VideoUI.ext;
  const line = (...content) => box('fr-line',...content);
  const title = value => el('strong',{class:'fr-title'},value);
  const label = value => el('span',{class:'fr-label'},value);
  const fine = value => el('span',{class:'fr-fine'},value);
  const big = value => el('strong',{class:'fr-number'},value);
  const chip = value => el('span',{class:'fr-chip'},value);
  const card = (cls,...content) => box('fr-piece '+cls,...content);
  const action = (cls, name, fn, children, on) => el('button',{
    type:'button',class:cls,'aria-label':name,'aria-pressed':on===undefined?undefined:String(on),'data-key':name,onclick:fn
  },children);
  const tabs = (items,active,choose) => box('fr-tabs',...items.map((v,i)=>action('fr-tab',v,()=>choose(i),v,i===active)));
  const fmt = n => new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n);
  const kb = n => (n/1000).toFixed(1)+' kB';
  const pct = (value,max) => (value/max*100)+'%';
  const chooseNext = (p,set) => set({active:(p.active+1)%p.items.length});
  function crop(file,rect,aspect,description) {
    const [x,y,w,h]=rect;
    const result=el('div',{class:'fr-excerpt',role:'img','aria-label':description});
    result.style.aspectRatio=(aspect*w/h).toString();
    result.style.backgroundImage='url("'+mediaURL(file)+'")';
    result.style.backgroundSize=(10000/w)+'% '+(10000/h)+'%';
    result.style.backgroundPosition=(w===100?0:x*100/(100-w))+'% '+(h===100?0:y*100/(100-h))+'%';
    return result;
  }
  function markAt(node,[x,y,w,h]){
    Object.assign(node.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
    return node;
  }
  function pins({p,set}){
    const figure=box('fr-landmarks',picture(p.image,p.credit));
    if(p.showPin){
      const [x,y]=p.points[p.active];
      const pin=action('fr-pin '+(x>50?'points-left':'points-right')+(y<24?' points-down':''),'下一个部位',()=>chooseNext(p,set),
        [el('i',{class:'fr-dot'}),el('b',{},p.items[p.active])]);
      Object.assign(pin.style,{left:x+'%',top:y+'%'});figure.append(pin);
    }
    return card('fr-photo-card',figure,line(fine(p.credit),tabs(p.items,p.showPin?p.active:-1,i=>set({active:i,showPin:true}))));
  }
  function spotlight({p,set}){
    const rect=p.rects[p.active];
    const screen=box('fr-screen',picture(p.image,p.title+' 操作截图'),markAt(el('i',{class:'fr-screen-focus'}),rect));
    return card('fr-window',line(label(p.title),fine('操作定位')),screen,
      box('fr-window-foot',tabs(p.items,p.active,i=>set({active:i})),crop(p.image,rect,1.6,p.items[p.active]+' 原始控件')));
  }
  function loupes({p,set}){
    const pair=[p.left[p.active],p.right[p.active]].map((file,i)=>box('fr-loupe',box('fr-crop',picture(file,p.names[i]+' · '+p.items[p.active]),p.showLocator?el('i',{class:'fr-cross'}):null),label(p.names[i])));
    return card('fr-paper',line(title(p.title),tabs(p.items,p.active,i=>set({active:i}))),box('fr-pair',...pair));
  }
  function exhibits({p,set}){
    return card('fr-evidence',box('fr-quads',...p.items.map((v,i)=>action('fr-exhibit',v,()=>set({active:i}),
      [picture(p.images[i],v),el('span',{},v)],p.active===i))),line(chip(p.items[p.active]),label(p.bodies[p.active])));
  }
  function fieldReadout({p,set}){
    const n=p.items.length;
    const mark=markAt(el('i',{class:'fr-record-focus'}),[0,100*p.active/n,100,100/n]);
    return card('fr-paper',line(title(p.title),fine('原件摘读')),box('fr-record',picture(p.image,p.title+'原始字段'),mark),
      action('fr-quote-read','下一项原始字段',()=>chooseNext(p,set),[fine(p.items[p.active]),el('strong',{},p.values[p.active])]));
  }
  function capacity({p,set}){
    const threshold=p.limitKB*1000;
    const maximum=Math.max(threshold,...p.values)*1.04;
    const rails=p.items.map((name,i)=>{
      const v=p.values[i], pass=v<=threshold;
      const lane=box('fr-meter-lane',el('i',{class:'fr-value-fill'+(pass?' fits':'')}),el('i',{class:'fr-limit-tick'}));
      lane.firstChild.style.width=pct(v,maximum);lane.lastChild.style.left=pct(threshold,maximum);
      return box('fr-meter-row',line(label(name),fine(kb(v))),lane,el('span',{class:'fr-margin'},(pass?'余量 ':'超出 ')+kb(Math.abs(v-threshold))));
    });
    const input=el('input',{type:'number',min:'1',step:'1','aria-label':'文件上限 kB',value:p.limitKB});
    input.addEventListener('change',()=>{const n=Number(input.value);if(Number.isFinite(n)&&n>0)set({limitKB:n});else input.value=p.limitKB;});
    return card('fr-paper fr-capacity',line(title(p.title),box('fr-unit-control',input,label('kB'))),...rails);
  }
  function criteria({p,set}){
    const i=p.active, passes=[p.pixels[i]>=p.minPixel,p.values[i]<=p.limitKB*1000];
    const rows=[['像素宽度',p.pixels[i]+' px','至少 '+p.minPixel+' px'],['文件体积',kb(p.values[i]),'上限 '+p.limitKB+' kB']];
    return card('fr-paper',tabs(p.items,i,v=>set({active:v})),
      ...rows.map(([what,value,rule],n)=>box('fr-check-row',el('span',{class:'fr-check '+(passes[n]?'pass':'fail')},passes[n]?'✓':'×'),
        box('fr-stack',label(what),fine(rule)),el('strong',{},value))));
  }
  function choice({p,set}){
    const n=p.preferred[p.active];
    return card('fr-paper',tabs(p.items,p.active,v=>set({active:v})),
      box('fr-options',...p.options.map((s,i)=>box('fr-option'+(i===n?' current':''),fine(i===n?'当前选用':'另一方案'),title(s)))),
      line(el('i',{class:'fr-lead'}),label(p.reasons[p.active])));
  }
  function proofs({p,set}){
    const i=p.active;
    const change=(p.values[i]/p.inputBytes-1)*100;
    const delta=change===0?'体积相同':(change>0?'增大 ':'减少 ')+Math.abs(change).toFixed(1)+'%';
    return card('fr-paper',line(title(p.title),tabs(p.items,i,v=>set({active:v}))),
      box('fr-proof-pair',box('fr-proof-ref',picture(p.referenceImage,'原件同一取样区'),label('输入原图')),
        box('fr-proof-now',picture(p.images[i],p.items[i]+'同一取样区'),label(p.items[i]))),
      line(fine('当前副本 '+kb(p.values[i])),p.showDelta?chip(delta):null));
  }
  function scorecard({p,set}){
    return card('fr-paper fr-score',line(title(p.title),fine('测评记录')),
      ...p.items.map((s,i)=>action('fr-score-row'+(i>p.active?' pending':''),s,()=>set({active:i}),
        [el('span',{class:'fr-index'},String(i+1).padStart(2,'0')),box('fr-stack',label(s),i<=p.active?fine(p.bodies[i]):null),
        el('strong',{},i<=p.active?p.values[i]:'⋯')],i===p.active)));
  }
  VideoUI.fred={line,title,label,fine,big,chip,card,action,tabs,fmt,kb,pct,chooseNext};
  VideoUI.register({'fred-pins':pins,'fred-spotlight':spotlight,'fred-loupes':loupes,'fred-exhibits':exhibits,'fred-field':fieldReadout,
    'fred-capacity':capacity,'fred-criteria':criteria,'fred-choice':choice,'fred-proofs':proofs,'fred-scorecard':scorecard});
})();

(() => {
  'use strict';
  const {el,box}=VideoUI.helpers;
  const {picture}=VideoUI.ext;
  const {line,title,label,fine,big,chip,card,action,tabs,fmt,pct,chooseNext}=VideoUI.fred;
  function receipt({p,set}){
    const n=p.active;
    return card('fr-terminal',line(el('span',{class:'fr-terminal-dots'},'● ● ●'),fine('config.json')),
      el('code',{},el('b',{},'› '),p.command),el('div',{class:'fr-terminal-file'},p.inputs[n]),
      n>0?box('fr-return',el('b',{},n===2?'✓':'×'),el('span',{},n===1?'第 '+p.errorColumn+' 列 · '+p.outputs[n]:p.outputs[n])):null,
      tabs(p.items,n,i=>set({active:i})));
  }
  function paperedit({p,set}){
    const kept=[...p.kept].sort((a,b)=>a-b), total=kept.reduce((s,i)=>s+p.ends[i]-p.starts[i],0);
    const rail=box('fr-time-rail');
    for(let i=0;i<p.items.length;i++){
      const node=action('fr-source-piece'+(kept.includes(i)?' kept':''),'定位'+p.items[i],()=>set({active:i}),String(i+1),p.active===i);
      Object.assign(node.style,{left:pct(p.starts[i],p.duration),width:pct(p.ends[i]-p.starts[i],p.duration)});rail.append(node);
    }
    const compact=box('fr-compact');
    for(const i of kept){const item=action('fr-edit-piece',p.items[i],()=>set({active:i}),p.items[i],i===p.active);
      item.style.flexGrow=p.ends[i]-p.starts[i];compact.append(item);}
    if(!kept.length)compact.append(fine('尚未保留句子'));
    const i=p.active;
    return card('fr-paper',line(title(p.title),fine('完整 '+p.duration.toFixed(2)+' 秒')),rail,
      line(label('保留段落'),chip(total.toFixed(2)+' 秒')),compact,
      line(fine(p.starts[i].toFixed(2)+'–'+p.ends[i].toFixed(2)+' 秒'),action('fr-text-action',kept.includes(i)?'移出这句':'保留这句',
        ()=>set({kept:kept.includes(i)?kept.filter(n=>n!==i):[...kept,i].sort((a,b)=>a-b)}),kept.includes(i)?'移出这句':'保留这句')));
  }
  function extract({p,set}){
    return card('fr-paper',fine(p.title),box('fr-speech',...p.items.map((s,i)=>action('fr-word',s,()=>set({active:i}),s,i===p.active))),
      box('fr-downline',el('span',{},'↓')),box('fr-fields',...p.labels.map((s,i)=>action('fr-field',s,()=>set({active:i}),
        [fine(s),el('strong',{},p.values[i])],i===p.active))));
  }
  function deliveries({p,set}){
    const rail=box('fr-fan-rule',...p.items.map(()=>el('i')));
    rail.style.setProperty('--branch-end',(50/p.items.length)+'%');
    const choices=tabs(p.items,p.active,v=>set({active:v}));
    choices.style.gridTemplateColumns='repeat('+p.items.length+',minmax(0,1fr))';
    return card('fr-deliveries',box('fr-source-page',fine('同一份原稿'),title(p.source)),
      rail,choices,box('fr-delivery-page',label(p.items[p.active]),el('p',{},p.bodies[p.active])));
  }
  function handoff({p,set}){
    const ok=p.delivered.length===p.items.length;
    return card('fr-paper',box('fr-gate',box('fr-endpoint',el('b',{},'↑'),label(p.sender)),box('fr-bridge'+(ok?' open':''),el('i'),el('b',{},ok?'→':'×'),el('i')),box('fr-endpoint',el('b',{},'↓'),label(p.recipient))),
      box('fr-parcels',...p.items.map((s,i)=>action('fr-parcel',s,()=>set({delivered:p.delivered.includes(i)?p.delivered.filter(x=>x!==i):[...p.delivered,i].sort((a,b)=>a-b)}),
        [label(s),el('strong',{},p.delivered.includes(i)?'已送达':'待发送')],p.delivered.includes(i)))),
      fine(ok?'两端材料齐全':'接收方仍缺 '+p.items.filter((s,i)=>!p.delivered.includes(i)).join('、')));
  }
  function chapter({p,set}){
    const num=String(p.first+p.active).padStart(2,'0');
    return card('fr-chapter',action('fr-flip-group','下一章',()=>chooseNext(p,set),
      [...num].map(d=>el('span',{class:'fr-flip-digit'},d))),p.showTitle?el('strong',{class:'fr-chapter-title'},p.items[p.active]):null);
  }
  function verdict({p,set}){
    return card('fr-verdict',action('fr-verdict-frame','切换结论层',()=>set({stage:(p.stage+1)%3}),
      [picture(p.image,'判断依据的原始画面'),p.stage>0?box('fr-verdict-ink',fine(p.evidence),el('strong',{},p.title),p.stage===2?el('span',{},p.condition):null):null]));
  }
  function stress({p,set}){
    const segment=(words,index)=>el('span',{class:'fr-subline'},el('span',{},words[0]),el('b',{class:p.active===index?'stressed':''},words[1]));
    return card('fr-stress',action('fr-subtitle','切换重读词',()=>set({active:(p.active+1)%3}),[segment(p.firstLine,0),segment(p.secondLine,1)]));
  }
  function units({p,set}){
    const i=p.active, factors=[1,1000,1024],value=i?(p.valueBytes/factors[i]).toFixed(1):fmt(p.valueBytes);
    return card('fr-paper fr-units',fine('文件体积'),action('fr-read-main','换一种单位',()=>chooseNext(p,set),[big(value),label(p.items[i])]),
      line(fine(i?'1 '+p.items[i]+' = '+fmt(factors[i])+' 字节':'原文件逐字节计数'),tabs(p.items,i,v=>set({active:v}))),
      i?el('div',{class:'fr-equation'},fmt(p.valueBytes)+' 字节 ÷ '+fmt(factors[i])):null);
  }
  function dates({p,set}){
    const days=(Date.parse(p.dates[1])-Date.parse(p.dates[0]))/86400000;
    const dot=i=>box('fr-date-point'+(i===1&&p.stage<1?' later':''),
      el('b',{},p.dates[i].slice(5).replace('-','.')),el('i'),label(p.items[i]));
    return card('fr-paper',fine(p.title),action('fr-date-track','推进日期说明',()=>set({stage:(p.stage+1)%3}),[dot(0),p.stage?el('span',{class:'fr-date-line'}):null,dot(1)]),
      p.stage===2?line(chip('相隔 '+days+' 天'),fine(p.dates[0]+' — '+p.dates[1])):null);
  }
  VideoUI.register({'fred-receipt':receipt,'fred-paperedit':paperedit,'fred-extract':extract,'fred-deliveries':deliveries,'fred-handoff':handoff,
    'fred-chapter':chapter,'fred-verdict':verdict,'fred-stress':stress,'fred-units':units,'fred-dates':dates});
})();

(() => {
  'use strict';
  const original = VideoUI.validateExtra;
  VideoUI.validateExtra = function(id,p){
    original(id,p);
    if(!id.startsWith('fred-'))return;
    const require=(ok,message)=>{if(!ok)throw Error(message);};
    const strings=a=>Array.isArray(a)&&a.every(x=>typeof x==='string'&&x.trim());
    const numeric=a=>Array.isArray(a)&&a.every(n=>Number.isFinite(n)&&n>=0);
    const index=(n,a)=>Number.isInteger(n)&&n>=0&&n<a.length;
    const indices=(xs,a)=>xs.every(x=>index(x,a))&&new Set(xs).size===xs.length;
    const pairs=(xs,n)=>Array.isArray(xs)&&xs.every(v=>numeric(v)&&v.length===n&&v.every(x=>x<=100));
    const matching=(...keys)=>keys.forEach(k=>require(p[k].length===p.items.length,k+' 的数量需要和 items 相同。'));
    if(p.items)require(strings(p.items)&&p.items.length<=12,'每个选项需要名称，最多 12 项。');
    for(const k of ['left','right','inputs','outputs','labels','reasons'])if(p[k])matching(k);
    for(const k of ['left','right'])if(p[k])for(const file of p[k])VideoUI.ext.mediaURL(file);
    if(p.referenceImage)VideoUI.ext.mediaURL(p.referenceImage);
    if(p.stage!==undefined)require(Number.isInteger(p.stage)&&p.stage>=0&&p.stage<=2,'阶段应在 0–2 之间。');
    if(id==='fred-pins'){matching('points');require(pairs(p.points,2),'点位使用 0–100 的横纵坐标。');}
    if(id==='fred-spotlight'){matching('rects');require(pairs(p.rects,4)&&p.rects.every(([x,y,w,h])=>w>0&&h>0&&x+w<=100&&y+h<=100),'定位框须完整落在原图内。');}
    if(id==='fred-loupes')require(strings(p.names)&&p.names.length===2,'请为两个取样区填写名称。');
    if(id==='fred-exhibits')require(p.items.length===4,'四格窗需要四份材料及各自的说明。');
    if(['fred-capacity','fred-criteria','fred-proofs'].includes(id))require(numeric(p.values),'文件体积需要非负的字节数。');
    if('limitKB' in p)require(Number.isFinite(p.limitKB)&&p.limitKB>0,'体积上限需要大于零。');
    if(id==='fred-criteria'){matching('pixels');require(numeric(p.pixels)&&Number.isFinite(p.minPixel)&&p.minPixel>0,'请填写各文件的像素宽度和验收下限。');}
    if(id==='fred-choice'){matching('preferred');require(strings(p.options)&&p.options.length>=2&&p.preferred.every(v=>index(v,p.options)),'每个情境须指向已有方案。');}
    if(id==='fred-proofs')require(Number.isFinite(p.inputBytes)&&p.inputBytes>0,'输入文件的字节数应大于零。');
    if(id==='fred-receipt')require(p.items.length===3&&p.inputs.every(s=>typeof s==='string')&&p.outputs.every(s=>typeof s==='string')&&Number.isInteger(p.errorColumn)&&p.errorColumn>0,'命令回执需要三个阶段和有效的报错列。');
    if(id==='fred-paperedit'){
      matching('starts','ends');require(Number.isFinite(p.duration)&&p.duration>0&&numeric(p.starts)&&numeric(p.ends)&&indices(p.kept,p.items)&&
        p.starts.every((s,i)=>s<p.ends[i]&&p.ends[i]<=p.duration&&(i===0||s>=p.ends[i-1])),'选段必须按时间先后排列，起止在原片内，保留项需有效。');
    }
    if(id==='fred-handoff')require(indices(p.delivered,p.items),'收到的材料需要在清单中。');
    if(id==='fred-chapter')require(Number.isInteger(p.first)&&p.first>0&&p.first+p.items.length-1<=99,'翻页章号支持 01–99。');
    if(id==='fred-stress')require([p.firstLine,p.secondLine].every(a=>strings(a)&&a.length===2)&&Number.isInteger(p.active)&&p.active>=0&&p.active<=2,'两行各填前半句和重读部分，重读状态为 0–2。');
    if(id==='fred-units')require(p.items.length===3&&Number.isSafeInteger(p.valueBytes)&&p.valueBytes>=0,'请给出整数个字节及字节、kB、KiB 三个单位名称。');
    if(id==='fred-dates'){
      const isDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
      require(p.items.length===2&&p.dates.length===2&&p.dates.every(isDate)&&p.dates[1]>=p.dates[0],'请使用两个先后有效的 ISO 日历日期 YYYY-MM-DD。');
    }
  };
})();
