const fs=require('fs'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/山有扶苏/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root='E:/ui/adu-motion-extracted-20260930';const items=JSON.parse(fs.readFileSync(root+'/ui-items.json','utf8'));
async function main(){const browser=await chromium.launch({headless:true,args:['--allow-file-access-from-files']});const results=[];
for(const item of items){const page=await browser.newPage({viewport:{width:1920,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));await page.goto(pathToFileURL(root+'/'+item.preview.split('?')[0]).href+'?'+item.preview.split('?')[1]);await page.evaluate(async()=>{await window.READY});
for(const t of [0,.65,1.6,3.2,.1])await page.evaluate(async t=>{await window.renderAt(t);await window.imgWait();const broken=[...document.images].filter(i=>i.src&&i.complete&&!i.naturalWidth);if(broken.length)throw Error('Bad image');},t);
if(['ui-slider','ui-account','ui-mac-window','ui-portrait-shell'].includes(item.id)){await page.evaluate(async()=>{await window.renderAt(2.5);await window.imgWait()});fs.mkdirSync(root+'/preview/ui/checks',{recursive:true});await page.screenshot({path:root+'/preview/ui/checks/'+item.id+'.png'});}
results.push({id:item.id,errors,samples:5});await page.close();}
await browser.close();fs.writeFileSync(root+'/preview/ui/runtime-check.json',JSON.stringify(results,null,2));console.log(JSON.stringify({items:results.length,samples:results.length*5,errors:results.filter(x=>x.errors.length)}));if(results.some(x=>x.errors.length))process.exitCode=1;}
main().catch(e=>{console.error(e);process.exitCode=1});
