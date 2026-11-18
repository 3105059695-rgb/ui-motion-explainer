const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '../assets/agent-editorial');
const editorial = require(path.join(base, 'agent-editorial.js'));
const designs = require(path.join(base, 'source-designs.js'));
const roles = require('../assets/library-runtime/current-ui/roles.js');
const manifest = JSON.parse(fs.readFileSync(path.join(base, 'source-designs.json'), 'utf8'));
designs.configure(manifest);
for (const name of ['body-a', 'body-b']) {
  vm.runInNewContext(fs.readFileSync(path.join(base, 'current', name+'.js'), 'utf8'), {window:globalThis});
}
function recording() {
  const rows = [], boxes = [], canvas = {width:1920,height:1080};
  const state = {canvas,globalAlpha:1,save(){},restore(){},fillText(s,x,y){rows.push({s,x,y,ink:this.fillStyle});},
    roundRect(x,y,w,h){boxes.push({x,y,w,h});},
    measureText(s){return {width:Array.from(s).length*Number((this.font||'32px').match(/([\d.]+)px/)[1])};}};
  const ctx = new Proxy(state,{get(object,key){return key in object?object[key]:(()=>{});}});
  return {ctx,rows,boxes};
}
function paint(id,sourceTime,copy={}) {
  const d = designs.inspect(id), [start,end] = d.source_range;
  const media = Object.fromEntries(d.media_slots.map(s=>[s.key,'proof']));
  const logos = Object.fromEntries(d.logo_slots.map(s=>[s.key,'mark']));
  const scene = designs.createScene({design:id,duration:end-start,demo:true,copy,media,logos});
  const instance=recording();
  scene({ctx:instance.ctx,localTime:sourceTime-start,mediaTime:sourceTime,asset:()=>({width:3000,height:3000})});
  return {...instance,trace:scene.sourceDesign};
}
test('paper, ink and focus have consistent foregrounds across Canvas and DOM', () => {
  const C=editorial.palette;
  assert.deepEqual(C,JSON.parse(fs.readFileSync(path.join(base,'palette.json'),'utf8')));
  assert.equal(editorial.onSurface(C.purple),C.black);
  assert.equal(editorial.onSurface(C.black),C.white);
  assert.equal(roles.style({backgroundColor:C.purple,color:'white'},'button').color,C.black);
  const win=roles.style({backgroundColor:C.black,color:'black'},'window');
  assert.equal(win.color,C.white);
  assert.equal(win['--fusion-accent-ink'],C.purple);
  assert.equal(roles.style({backgroundColor:C.white,color:C.purple},'sheet').color,C.accentInk);
  assert.deepEqual(roles.style({backgroundColor:'#ff8500',color:'white'},'brand-logo'),{backgroundColor:'#ff8500',color:'white'});
});
test('long task names move the track onto a separate baseline', () => {
  const a=paint('parallel-workflow',34,{'改页面':'核对三份供应商报价单'});
  const label=a.rows.find(r=>r.s==='核对三份供应商报价单');
  assert.equal(a.trace.drawingFile,'current/body-a.js');
  assert.ok(a.boxes.some(b=>b.x===label.x&&b.y>=label.y+15&&b.w>610&&b.h<=8));
});
test('a selected filename sits fully within its highlight and a dark window has light chrome', () => {
  const d=designs.inspect('editable-change-undo');
  const t=d.cues.find(c=>c.id==='find-change-run').source_time+.5;
  const b=paint(d.id,t);
  const selected=b.rows.find(r=>r.s.trim()==='app.tsx');
  assert.equal(b.trace.drawingFile,'current/body-b.js');
  assert.equal(selected.ink,editorial.palette.black);
  assert.ok(b.boxes.some(r=>r.w===225&&r.y<selected.y-22&&r.y+r.h>selected.y+3));
  assert.equal(b.rows.find(r=>r.s==='PROJECT / 编辑器工作流').ink,editorial.palette.white);
});
