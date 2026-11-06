/* Select original declarations and their real lexical/import dependencies.
 * Registration isolation never substitutes the retained animation algorithms. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const [configPath]=process.argv.slice(2),cfg=JSON.parse(fs.readFileSync(configPath,'utf8'));
const req=createRequire(path.join(cfg.node_modules,'__ui_select.cjs')),ts=req('typescript');
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed}),active=new Set(),done=new Map();
function bindingNames(n){return ts.isIdentifier(n)?[n.text]:(ts.isObjectBindingPattern(n)||ts.isArrayBindingPattern(n))?n.elements.flatMap(e=>ts.isBindingElement(e)?bindingNames(e.name):[]):[];}
function names(n){return ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n)||ts.isInterfaceDeclaration(n)||ts.isTypeAliasDeclaration(n)||ts.isEnumDeclaration(n)?[n.name?.text].filter(Boolean):ts.isVariableStatement(n)?n.declarationList.declarations.flatMap(d=>bindingNames(d.name)):[];}
function localModule(owner,importPath){if(!importPath.startsWith('.'))return;const base=path.resolve(path.dirname(owner),importPath);return [base,base+'.tsx',base+'.ts',base+'.jsx',base+'.js',path.join(base,'index.tsx'),path.join(base,'index.ts')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()&&/\.[tj]sx?$/.test(p));}
function select(source,symbols,composition,dest){
 const key=source+JSON.stringify([...symbols].sort())+(composition||'');if(done.has(key))return done.get(key);if(active.has(source))return source;
 const ast=ts.createSourceFile(source,fs.readFileSync(source,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),named=new Map(),imports=[];let defaultName;
 for(const s of ast.statements){if(ts.isImportDeclaration(s))imports.push(s);for(const n of names(s))named.set(n,s);if(s.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword))defaultName=names(s)[0];if(ts.isExportAssignment(s)&&ts.isIdentifier(s.expression))defaultName=s.expression.text;}
 const requested=symbols.map(n=>n==='default'?defaultName:n);if(requested.some(n=>!n||!named.has(n)))return source;
 let chosen;
 if(composition){function visit(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='Composition'){const id=n.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)==='id');if(id?.initializer&&ts.isStringLiteral(id.initializer)&&id.initializer.text===composition)chosen=n;}ts.forEachChild(n,visit);}visit(ast);if(!chosen)throw Error('Literal original composition not found: '+composition);}
 active.add(source);const wanted=new Set(requested),nodes=new Set();let changed=true;
 function refs(n){if(ts.isIdentifier(n))wanted.add(n.text);ts.forEachChild(n,refs);}
 if(chosen){refs(chosen);wanted.add('registerRoot');}
 while(changed){changed=false;for(const n of [...wanted]){const s=named.get(n);if(s&&!nodes.has(s)){nodes.add(s);refs(s);changed=true;}}}
 const out=[];
 for(const s of imports){const c=s.importClause;if(!c){out.push(printer.printNode(ts.EmitHint.Unspecified,s,ast));continue;}
 const def=c.name&&wanted.has(c.name.text)?c.name:undefined,b=c.namedBindings;
 const bindings=b&&ts.isNamespaceImport(b)?(wanted.has(b.name.text)?b:undefined):b&&ts.isNamedImports(b)?ts.factory.updateNamedImports(b,b.elements.filter(e=>wanted.has(e.name.text))):undefined;
 if(!def&&(!bindings||ts.isNamedImports(bindings)&&!bindings.elements.length))continue;
 let module=s.moduleSpecifier;const imported=localModule(source,module.text);
 if(imported&&(!bindings||ts.isNamedImports(bindings))){const needed=[...(def?['default']:[]),...(bindings?bindings.elements.map(e=>(e.propertyName||e.name).text):[])];const sub=select(imported,needed);if(sub!==imported){let rel=path.relative(path.dirname(dest||source),sub).replaceAll('\\','/');if(!rel.startsWith('.'))rel='./'+rel;module=ts.factory.createStringLiteral(rel);}}
 out.push(printer.printNode(ts.EmitHint.Unspecified,ts.factory.updateImportDeclaration(s,s.modifiers,ts.factory.updateImportClause(c,c.isTypeOnly,def,bindings),module,s.attributes),ast));}
 for(const s of ast.statements)if(nodes.has(s))out.push(printer.printNode(ts.EmitHint.Unspecified,s,ast));
 if(chosen)out.push('registerRoot(()=>('+printer.printNode(ts.EmitHint.Unspecified,chosen,ast)+'));');
 else for(let ix=0;ix<requested.length;ix++){const n=requested[ix],s=named.get(n),isDefault=s.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword),exported=s.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword);if(symbols[ix]==='default'&&!isDefault)out.push('export default '+n+';');else if(!exported||isDefault)out.push('export {'+n+'};');}
 dest=dest||path.join(path.dirname(source),'_selected_'+crypto.createHash('sha256').update(key).digest('hex').slice(0,10)+'_'+path.basename(source));
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,'/* Original source dependency selection; no animation substituted. */\n'+out.join('\n')+'\n');active.delete(source);done.set(key,dest);return dest;
}
for(const p of cfg.source_selections||[]){const src=path.resolve(cfg.project,p.source),dest=path.resolve(cfg.project,p.target),result=select(src,p.symbol?[p.symbol]:[],p.composition,dest);if(result!==dest)throw Error('Selected original symbol missing: '+p.symbol+' in '+p.source);console.log(JSON.stringify({source:p.source,target:p.target,symbol:p.symbol,composition:p.composition,dependencyModules:done.size}));}
