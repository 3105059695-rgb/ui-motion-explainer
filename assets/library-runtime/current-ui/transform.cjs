/* TS AST edits production copies only. Positional/temporal source is never rewritten. */
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const req=createRequire(path.join(cfg.node_modules,'__ui_ast.cjs')),ts=req('typescript');
const reports=[];
const UI_COLORS={paper:'#FFFFFF',page:'#FFFFFF',background:'#FFFFFF',bg:'#FFFFFF',canvas:'#FFFFFF',white:'#FFFFFF',cream:'#FFFFFF',ivory:'#FFFFFF',panel:'#F3F3F5',surface:'#F3F3F5',card:'#FFFFFF',ink:'#0B0B0F',black:'#0B0B0F',dark:'#0B0B0F',text:'#0B0B0F',foreground:'#0B0B0F',edge:'#DBDBE0',line:'#DBDBE0',border:'#DBDBE0',muted:'#777780',gray:'#777780',accent:'#D6C2FF',purple:'#D6C2FF',violet:'#D6C2FF',lavender:'#D6C2FF'};
for(const file of cfg.files){
 const source=fs.readFileSync(file,'utf8'),already=source.includes('/* ui-fusion-role-adapted */');
 const kind=cfg.kinds?.[file]||file;
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,/\.tsx$/.test(kind)?ts.ScriptKind.TSX:/\.jsx$/.test(kind)?ts.ScriptKind.JSX:ts.ScriptKind.JS);
 const edits=[],counts={jsxStyles:0,canvasFonts:0,canvasSurfaces:0,canvasPathMaterials:0,paletteProperties:0},unhandled=[];
 function visit(n){
  if(ts.isCallExpression(n)&&/^(React\.)?createElement$/.test(n.expression.getText(ast))&&n.arguments.length>=2&&ts.isStringLiteral(n.arguments[0])&&ts.isObjectLiteralExpression(n.arguments[1])){
   const tag=n.arguments[0].text;
   if(/^(div|span|p|h[1-6]|section|article|header|footer|aside|main|button|label|ul|li)$/.test(tag)){
    const s=n.arguments[1].properties.find(x=>(ts.isPropertyAssignment(x)||ts.isShorthandPropertyAssignment(x))&&x.name.getText(ast)==='style');
    if(s){const e=ts.isShorthandPropertyAssignment(s)?s:s.initializer;const original=ts.isShorthandPropertyAssignment(s)?'style':e.getText(ast);edits.push([e.getStart(ast),e.end,(ts.isShorthandPropertyAssignment(s)?'style:':'')+`globalThis.__uiFusionCurrent.style((${original}),${JSON.stringify(tag)})`]);counts.jsxStyles++;}
   }
  }
  if(ts.isJsxAttribute(n)&&n.name.text==='style'&&n.initializer&&ts.isJsxExpression(n.initializer)&&n.initializer.expression){
   const parent=n.parent.parent,tag=parent.tagName.getText(ast),attrs=n.parent.properties;
   const cls=attrs.find(a=>ts.isJsxAttribute(a)&&a.name.text==='className');
   const hint=tag+' '+(cls?.initializer?.getText(ast)||'');
   if(/^(div|span|p|h[1-6]|section|article|header|footer|aside|main|button|label|ul|li|text|tspan|AbsoluteFill)$/.test(tag)){
    const e=n.initializer.expression;edits.push([e.getStart(ast),e.end,`globalThis.__uiFusionCurrent.style((${e.getText(ast)}),${JSON.stringify(hint)})`]);counts.jsxStyles++;return;
   }
  }
  if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isPropertyAccessExpression(n.left)&&n.left.name.text==='font'){
   const fn=closestFunction(n),fname=fn?.name?.getText(ast)||'';
   if(/^(text|txt|label|heading|title|drawText|caption)$/i.test(fname)){
    edits.push([n.right.getStart(ast),n.right.end,`globalThis.__uiFusionCurrent.font(${n.right.getText(ast)})`]);counts.canvasFonts++;return;
   }
  }
  if((ts.isFunctionDeclaration(n)||ts.isArrowFunction(n)||ts.isFunctionExpression(n))&&n.body){
   const name=n.name?.text||(ts.isVariableDeclaration(n.parent)?n.parent.name.getText(ast):''),params=n.parameters.map(p=>p.name.getText(ast)),body=n.body.getText(ast);
   // Only a flat, color-filled 2D primitive with named coordinates. Never
   // replace any primitive containing images, callbacks, text, projection or 3D.
   const wi=params.indexOf('w'),coords=wi>=2&&params[wi+1]==='h'?params.slice(wi-2,wi+2):[];
   const unsafe=/drawImage|fillText|strokeText|\bdraw\b|\bproject\b|globalAlpha|globalCompositeOperation|\.\s*(?:transform|translate|rotate|scale|clip|filter|setTransform|resetTransform|setLineDash)\b|\b(?:for|while|switch|return|throw)\b/.test(body)||params.some(p=>/^(?:z|t|time|frame|progress|opacity|alpha|scale|rotation|matrix|clip|state)$/.test(p));
   if(/^(box|rect|fill|panel|card|rr|rrect|roundRect|roundedRect|rounded|roundbox|round|roundedBox)$/i.test(name)&&coords.length===4&&!unsafe&&body.length<850){
    const ctx=(body.match(/\b([a-zA-Z_$][\w$]*)\.(?:fillRect|roundRect|fillStyle)\b/)||[])[1];
    const fill=params.find(p=>['fill','color','col','c'].includes(p)&&p!==ctx),radius=params.find(p=>['r','radius'].includes(p));
    const options=['shadow','stroke','lw','depth'].filter(k=>params.includes(k)).map(k=>k+':'+k).join(',');
    if(ctx&&fill){edits.push([n.body.getStart(ast),n.body.end,`{return globalThis.__uiFusionCurrent.rect(${ctx},${coords.join(',')},${fill},${JSON.stringify(name==='panel'?'window':'panel')},${radius||0},{${options}});}`]);counts.canvasSurfaces++;return;}
    unhandled.push(name);
   }
  }
  if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&['fill','fillRect'].includes(n.expression.name.text)){
   const fn=closestFunction(n),fname=fn?.name?.getText(ast)||'',ctx=n.expression.expression.getText(ast);
   const reviewed=(cfg.guarded_ui_primitives?.[file]||[]).includes(fname),params=fn?.parameters.map(p=>p.name.getText(ast))||[],wi=params.indexOf('w');
   // Reviewed UI primitive families keep their entire authored body, including
   // alpha, clipping, guarded returns and strokes; only the fill call is wrapped.
   if(reviewed&&wi>=2&&params[wi+1]==='h'&&((n.expression.name.text==='fill'&&!n.arguments.length)||(n.expression.name.text==='fillRect'&&n.arguments.length===4))){
    edits.push([n.getStart(ast),n.end,`globalThis.__uiFusionCurrent.paintSurface(${ctx},()=>${n.getText(ast)},${params[wi]},${params[wi+1]})`]);counts.canvasPathMaterials++;return;
   }
   if(n.expression.name.text!=='fill'||n.arguments.length)return;
   if(/^(card|panel|screen|window|sheet|document|file|browser|phone|pill|chip|badge|drawCard|drawPanel|drawWindow)$/i.test(fname)){
    const preceding=source.slice(Math.max(fn.body?.getStart(ast)||0,n.getStart(ast)-300),n.getStart(ast));
    if(new RegExp('\\b'+ctx+'\\.(?:roundRect|rect)\\s*\\(').test(preceding)&&!/(?:arc|ellipse|lineTo)\s*\(/.test(preceding)){
     edits.push([n.getStart(ast),n.end,`globalThis.__uiFusionCurrent.paintSurface(${ctx},()=>${n.getText(ast)})`]);counts.canvasPathMaterials++;return;
    }
   }
  }
  ts.forEachChild(n,visit);
 }
 function closestFunction(n){for(let p=n.parent;p;p=p.parent)if(ts.isFunctionDeclaration(p)||ts.isFunctionExpression(p)||ts.isArrowFunction(p))return p;return null;}
 if(!already)visit(ast);
 // Palette objects are source-authored wrapper tokens. Literal product/UI
 // screenshots, image pixels and status-specific object properties aren't touched.
 if(counts.canvasSurfaces+counts.canvasPathMaterials>0&&!/pixel scene|pixel art|voxel|raymarch|webgl/i.test(source.slice(0,800))){
  function palette(n){
   if(ts.isVariableDeclaration(n)&&/^(P|COLORS|PALETTE|colors|palette)$/.test(n.name.getText(ast))&&n.initializer&&ts.isObjectLiteralExpression(n.initializer)){
    for(const p of n.initializer.properties){if(ts.isPropertyAssignment(p)&&ts.isStringLiteral(p.initializer)){const key=p.name.getText(ast).replace(/["']/g,'').toLowerCase();if(UI_COLORS[key]&&/^#[\da-f]{3,8}$/i.test(p.initializer.text)){let target=UI_COLORS[key];if(/^(background|bg|canvas|ink|text|foreground)$/.test(key)&&/^#[0-5][\da-f]/i.test(p.initializer.text))target='#0B0B0F';edits.push([p.initializer.getStart(ast),p.initializer.end,JSON.stringify(target)]);counts.paletteProperties++;}}}
   }ts.forEachChild(n,palette);
  }palette(ast);
 }
 let out=source;
 for(const [a,b,value]of edits.sort((a,b)=>b[0]-a[0]))out=out.slice(0,a)+value+out.slice(b);
 const checked=ts.createSourceFile(file,out,ts.ScriptTarget.Latest,true,/\.tsx$/.test(kind)?ts.ScriptKind.TSX:/\.jsx$/.test(kind)?ts.ScriptKind.JSX:ts.ScriptKind.JS);
 if(checked.parseDiagnostics.length>ast.parseDiagnostics.length)throw Error('UI transformation introduced syntax diagnostics in '+file+': '+checked.parseDiagnostics.map(x=>ts.flattenDiagnosticMessageText(x.messageText,' ')).join('; '));
 if(edits.length&&!cfg.dry_run)fs.writeFileSync(file,'/* ui-fusion-role-adapted */\n'+out);
 reports.push({file:path.relative(cfg.project,file).replaceAll('\\','/'),...counts,unhandledPrimitiveNames:unhandled,syntax:{introduced:0,existing:ast.parseDiagnostics.length,after:checked.parseDiagnostics.length}});
}
fs.writeFileSync(cfg.report,JSON.stringify(reports,null,2));
