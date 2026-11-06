// Executed only inside ego-browser nodejs after its installed skill is read.
// Existing Page only; no browser launch, login bypass, cookies, or private API.
export async function run(request) {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const task = await taskSpace(request.space_id);
  const page = task.page(request.page);
  const output = request.output;
  try { await fs.access(output); throw new Error('Refusing to overwrite ' + output); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.mkdir(path.dirname(output), {recursive: true});
  const sourcePage = await page.url();
  if (request.action === 'download') {
    if (sourcePage !== request.source_page) throw new Error('Page changed; inspect the actual source page before downloading.');
    if (!/^https?:\/\//.test(request.url)) throw new Error('Only an observed HTTP media URL is supported; blob/DRM sources are not bypassed.');
    const result = await page.fetch(request.url, {saveAs: output, timeout: 30000});
    if (!result.ok) throw new Error('Browser download failed: HTTP ' + result.status);
    console.log({output, page: sourcePage, status: result.status, mediaValidation: 'Run materials record/check; HTTP success is not a valid-video or matching-content claim.'});
    return;
  }
  if (request.action === 'screenshot') {
    await page.screenshot({path: output});
    console.log({output, sourcePage, type: 'viewport-screenshot', semanticMatch: 'not-assessed'});
    return;
  }
  const observation = await page.evaluate(() => {
    const clean = value => (value || '').replace(/\s+/g, ' ').trim();
    const visible = node => { const r=node.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(node).visibility!=='hidden'; };
    const platformLink = url => {
      try { const u=new URL(url); return ((u.hostname==='x.com'||u.hostname==='twitter.com')&&/\/status\/\d+/.test(u.pathname)) ||
        (/bilibili\.com$/.test(u.hostname)&&/\/video\//.test(u.pathname)) ||
        (/douyin\.com$/.test(u.hostname)&&/\/video\/\d+/.test(u.pathname)); }
      catch { return false; }
    };
    const canonical = value => {
      const u=new URL(value);
      if (u.hostname==='x.com'||u.hostname==='twitter.com') return 'https://x.com'+u.pathname.match(/^.*?\/status\/\d+/)[0];
      return u.origin+u.pathname.replace(/\/$/,'');
    };
    const links=[...document.querySelectorAll('a[href]')].filter(a=>visible(a)&&platformLink(a.href))
      .map(a=>({page_url:canonical(a.href), label:clean(a.innerText||a.getAttribute('title')),
                context:clean(a.closest('article,li,[class*=card]')?.innerText).slice(0,900)}));
    const images=[...document.images].filter(visible).map(img=>({url:img.currentSrc||img.src,alt:img.alt,width:img.naturalWidth,height:img.naturalHeight,usage:'unreviewed; may be a search cover, not a usable production still'})).filter(x=>x.width>=160&&x.height>=90);
    const videos=[...document.querySelectorAll('video')].map(v=>({url:v.currentSrc||v.src,poster:v.poster,duration:Number.isFinite(v.duration)?v.duration:null,width:v.videoWidth,height:v.videoHeight,currentTime:v.currentTime}));
    const author=document.querySelector('meta[name=author]')?.content||null;
    return {page_url:location.href,title:document.title,author,
      visible_text:clean(document.body?.innerText).slice(0,16000),
      candidates:[...new Map(links.map(x=>[x.page_url,x])).values()].slice(0,60),
      images:images.slice(0,60),videos,
      times:[...document.querySelectorAll('time')].map(x=>({text:clean(x.innerText),datetime:x.dateTime})).slice(0,30)};
  });
  observation.collected_at = new Date().toISOString();
  observation.selection = 'candidates-only';
  observation.semantic_match = false;
  observation.downloaded = false;
  await fs.writeFile(output, JSON.stringify(observation,null,2), {encoding:'utf8',flag:'wx'});
  console.log({output,page:sourcePage,candidates:observation.candidates.length,images:observation.images.length,videos:observation.videos.length});
  console.log(await page.snapshot());
}
