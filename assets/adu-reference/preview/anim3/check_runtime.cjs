const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/山有扶苏/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root='E:/ui/adu-motion-extracted-20260930';
const items=JSON.parse(fs.readFileSync(root+'/macro-items.json','utf8'));
async function main(){
 const browser=await chromium.launch({headless:true,args:['--allow-file-access-from-files']});
 const result=[];
 for(const group of ['anim3','anim4']){
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
  await page.goto(pathToFileURL(root+`/preview/${group}/index.html`).href);
  await page.evaluate(async()=>await window.READY);
  const selected=items.filter(i=>i.group===group);const times=new Set();
  for(const item of selected){times.add(item.start+.05);times.add((item.start+item.end)/2);times.add(item.end-.05);for(const cue of item.cues){for(const d of [-.05,0,.1]){const t=cue.time+d;if(t>=item.start&&t<item.end)times.add(+t.toFixed(4))}}for(const win of item.windows)times.add((win.start+win.end)/2)}
  const ordered=[...times].sort((a,b)=>a-b);let count=0;
  async function frame(t){return await page.evaluate(async t=>{window.renderAt(t);await window.imgWait();const broken=[...document.images].filter(im=>im.src&&im.complete&&!im.naturalWidth).map(im=>im.src);if(broken.length)throw Error('Broken media: '+broken.join(', '));return {t,visible:[...document.querySelectorAll('.sc')].filter(e=>e.style.display!=='none').length};},t)}
  for(const t of ordered){const stat=await frame(t);if(stat.visible===0)throw Error('No active scene '+group+' '+t);count++}
  for(const t of [...ordered].reverse())await frame(t);
  const checkDir=root+`/preview/${group}/checks`;fs.mkdirSync(checkDir,{recursive:true});
  const screenshots=[];for(const t of (group==='anim3'?[1,8,39,67]:[1.5,14,39,61.9])){
   await frame(t);const file=checkDir+`/frame-${t}.png`;await page.screenshot({path:file});screenshots.push(file);
   const first=crypto.createHash('sha256').update(await page.screenshot()).digest('hex');
   await frame(group==='anim3'?79.8:101);await frame(.1);await frame(t);
   const second=crypto.createHash('sha256').update(await page.screenshot()).digest('hex');
   if(first!==second)errors.push('Reverse seek image mismatch at '+t);
  }
  result.push({group,scenes:selected.length,sampleTimes:count,reverseTimes:ordered.length,errors,screenshots,info:await page.evaluate(()=>window.PREVIEW_INFO)});
  await page.close();
 }
 await browser.close();fs.writeFileSync(root+'/preview/anim3/runtime-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(result.some(r=>r.errors.length))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
