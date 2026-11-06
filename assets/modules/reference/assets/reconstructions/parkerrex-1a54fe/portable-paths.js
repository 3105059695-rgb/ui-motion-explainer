/* Portable URL adapter. Original animation code remains intact. */
(()=>{'use strict';const source={"../../assets/fonts/Mono.ttf": "../../reference-shared/fonts/48715a42ec242c21e9f0.ttf", "assets/fonts/Mono.ttf": "../../reference-shared/fonts/48715a42ec242c21e9f0.ttf", "index.html": "index.html", "motion.js": "motion.js", "project.json": "project.json", "style.css": "style.css", "Mono.ttf": "../../reference-shared/fonts/48715a42ec242c21e9f0.ttf"},base=document.baseURI,byURL=new Map();
for(const [key,value] of Object.entries(source)){try{byURL.set(new URL(key,base).href,new URL(value,base).href);}catch{}}
const resolve=value=>{if(typeof value!=='string')return value;try{return byURL.get(new URL(value,base).href)||value;}catch{return value;}};
const css=value=>value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g,(all,q,url)=>'url("'+resolve(url)+'")');
const fetchOriginal=window.fetch.bind(window);window.fetch=(input,init)=>fetchOriginal(typeof input==='string'?resolve(input):input,init);
for(const Klass of [HTMLImageElement,HTMLVideoElement,HTMLAudioElement]){const desc=Object.getOwnPropertyDescriptor(Klass.prototype,'src');if(desc?.set)Object.defineProperty(Klass.prototype,'src',{...desc,set(value){desc.set.call(this,resolve(value));}});}
if(window.FontFace){const FontFaceOriginal=window.FontFace;window.FontFace=class extends FontFaceOriginal{constructor(family,source,descriptors){super(family,typeof source==='string'?css(source):source,descriptors);}};}
const insert=CSSStyleSheet.prototype.insertRule;CSSStyleSheet.prototype.insertRule=function(rule,index){return insert.call(this,css(rule),index);};
window.__portableAssets={originalReferenceMedia:false,sourceMotionPreserved:true,replaceableSchematicTextures:true,urlMappings:Object.keys(source).length};
})();
