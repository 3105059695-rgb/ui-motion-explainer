const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/山有扶苏/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root='E:/ui/adu-motion-extracted-20260930';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/山有扶苏/AppData/Local/ms-playwright/chromium-1237/chrome-win64/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 const items=['template','example','primitive'].flatMap(x=>JSON.parse(fs.readFileSync(path.join(root,x+'-items.json'),'utf8')));
 const tested=[];
 for(const item of items){
  const errs=[]; const listener=e=>errs.push(e.message);page.on('pageerror',listener);
  const preview=item.preview.split('?');const file=pathToFileURL(path.join(root,preview[0])).href+(preview[1]?'?'+preview[1]:'');
  await page.goto(file,{waitUntil:'load',timeout:20000});
  try{await page.evaluate(async()=>{await window.READY;});
   for(const t of [item.start+.04,(item.start+item.end)/2,item.end-.03,item.start+.05]){await page.evaluate(async t=>{await window.renderAt(t);if(window.imgWait)await window.imgWait();},t);}
   const info=await page.evaluate(()=>({render:typeof window.renderAt,images:[...document.images].filter(x=>x.src&&(!x.complete||x.naturalWidth===0)).length}));
   if(info.images)errs.push('Failed images: '+info.images);
  }catch(e){errs.push(e.message.slice(0,300));}
  tested.push({id:item.id,errors:errs});page.off('pageerror',listener);
  if(errs.length)console.log(item.id,JSON.stringify(errs));
 }
 fs.writeFileSync(path.join(root,'preview/primitives/check-results.json'),JSON.stringify(tested,null,2));
 console.log(JSON.stringify({items:tested.length,failed:tested.filter(x=>x.errors.length).length}));
 await browser.close();
})();
