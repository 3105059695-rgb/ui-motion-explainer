/* Portable URL adapter. Original animation code remains intact. */
(()=>{'use strict';const source={"../../assets/fonts/GeistMono.ttf": "../../reference-shared/fonts/d00e590b8eb3a59acc32.ttf", "../../assets/fonts/Korean.ttf": "../../reference-shared/fonts/194018e6b2b293a7964f.ttf", "asset-provenance.json": "asset-provenance.json", "assets/fonts/GeistMono.ttf": "../../reference-shared/fonts/d00e590b8eb3a59acc32.ttf", "assets/fonts/Korean.ttf": "../../reference-shared/fonts/194018e6b2b293a7964f.ttf", "composition.js": "composition.js", "index.html": "index.html", "project.json": "project.json", "GeistMono.ttf": "../../reference-shared/fonts/d00e590b8eb3a59acc32.ttf", "Korean.ttf": "../../reference-shared/fonts/194018e6b2b293a7964f.ttf"},base=document.baseURI,byURL=new Map();
for(const [key,value] of Object.entries(source)){try{byURL.set(new URL(key,base).href,new URL(value,base).href);}catch{}}
const resolve=value=>{if(typeof value!=='string')return value;try{return byURL.get(new URL(value,base).href)||value;}catch{return value;}};
const css=value=>value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g,(all,q,url)=>'url("'+resolve(url)+'")');
const fetchOriginal=window.fetch.bind(window);window.fetch=(input,init)=>fetchOriginal(typeof input==='string'?resolve(input):input,init);
for(const Klass of [HTMLImageElement,HTMLVideoElement,HTMLAudioElement]){const desc=Object.getOwnPropertyDescriptor(Klass.prototype,'src');if(desc?.set)Object.defineProperty(Klass.prototype,'src',{...desc,set(value){desc.set.call(this,resolve(value));}});}
if(window.FontFace){const FontFaceOriginal=window.FontFace;window.FontFace=class extends FontFaceOriginal{constructor(family,source,descriptors){super(family,typeof source==='string'?css(source):source,descriptors);}};}
const insert=CSSStyleSheet.prototype.insertRule;CSSStyleSheet.prototype.insertRule=function(rule,index){return insert.call(this,css(rule),index);};
window.__portableAssets={originalReferenceMedia:false,sourceMotionPreserved:true,replaceableSchematicTextures:true,urlMappings:Object.keys(source).length};
})();
