/* Execute the selected original Remotion registration. No replacement scene. */
const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');
async function main(){
 const [action,configPath]=process.argv.slice(2);const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
 const modules=path.resolve(config.node_modules);const req=createRequire(path.join(modules,'__library_runner.cjs'));
 const bundler=req('@remotion/bundler'), renderer=req('@remotion/renderer');
 const project=path.resolve(config.project), report={id:config.id,action,source_entry:config.entry,actual_source_execution:true,browser_logs:[]};
 let serveUrl=config.bundle||path.join(project,'bundle');
 if(action==='compile'){
  serveUrl=await bundler.bundle({entryPoint:path.resolve(project,config.entry),outDir:serveUrl,publicDir:path.join(project,'public'),enableCaching:true,
    webpackOverride:c=>({...c,resolve:{...c.resolve,modules:[modules,...(config.additional_node_modules||[]),...(c.resolve?.modules||[])],alias:{...(c.resolve?.alias||{}),react:path.join(modules,'react'),'react-dom':path.join(modules,'react-dom'),remotion:path.join(modules,'remotion')}}})});
  report.bundle=serveUrl;
 }
 const browser={browserExecutable:config.browser,logLevel:'error',timeoutInMilliseconds:20000,onBrowserLog:log=>{if(log.type==='error'||log.type==='warning')report.browser_logs.push({type:log.type,text:log.text});}};
 const compositions=await renderer.getCompositions(serveUrl,{...browser,inputProps:config.props||{}});
 report.compositions=compositions.map(c=>({id:c.id,width:c.width,height:c.height,fps:c.fps,durationInFrames:c.durationInFrames}));
 const picked=compositions.find(c=>c.id===config.composition)||(!config.composition&&compositions.length===1?compositions[0]:null);
 if(!picked)throw new Error('Selected composition is not registered: '+config.composition+'; available: '+compositions.map(c=>c.id).join(', '));
 report.composition={id:picked.id,width:picked.width,height:picked.height,fps:picked.fps,durationInFrames:picked.durationInFrames};
 if(action==='smoke'){
  report.frames=[];
  for(const ratio of config.ratios||[.1,.5,.9]){
   const frame=Math.min(picked.durationInFrames-1,Math.floor(picked.durationInFrames*ratio));
   const output=path.join(project,'checks','frame-'+frame+'.png');fs.mkdirSync(path.dirname(output),{recursive:true});
   await renderer.renderStill({...browser,composition:picked,serveUrl,output,frame,inputProps:config.props||{},scale:config.scale||.5,imageFormat:'png'});
   report.frames.push({frame,path:output});
  }
 }
 if(action==='render'){
  const output=config.output||path.join(project,'render.mp4');
  await renderer.renderMedia({...browser,composition:picked,serveUrl,outputLocation:output,inputProps:config.props||{},codec:'h264',scale:config.scale||1,concurrency:config.concurrency||2});report.output=output;
 }
 report.status='passed';fs.writeFileSync(path.join(project,'runtime-'+action+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
main().catch(error=>{console.error(error.stack||String(error));process.exit(1);});
