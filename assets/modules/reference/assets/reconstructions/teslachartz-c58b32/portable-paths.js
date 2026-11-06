/* Portable URL adapter. Original animation code remains intact. */
(()=>{'use strict';const source={"assets/fonts/Anton.ttf": "../../reference-shared/fonts/a4ba3a92350ebb031da0.ttf", "assets/fonts/Mono.ttf": "../../reference-shared/fonts/48715a42ec242c21e9f0.ttf", "assets/fonts/Sans.ttf": "../../reference-shared/fonts/73894e0448cae90a92b6.ttf", "assets/fonts/sources.json": "assets/fonts/sources.json", "composition.js": "composition.js", "index.html": "index.html", "project.json": "project.json", "Anton.ttf": "../../reference-shared/fonts/a4ba3a92350ebb031da0.ttf", "Mono.ttf": "../../reference-shared/fonts/48715a42ec242c21e9f0.ttf", "Sans.ttf": "../../reference-shared/fonts/73894e0448cae90a92b6.ttf", "sources.json": "assets/fonts/sources.json"},base=document.baseURI,byURL=new Map();
for(const [key,value] of Object.entries(source)){try{byURL.set(new URL(key,base).href,new URL(value,base).href);}catch{}}
const resolve=value=>{if(typeof value!=='string')return value;try{return byURL.get(new URL(value,base).href)||value;}catch{return value;}};
const css=value=>value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g,(all,q,url)=>'url("'+resolve(url)+'")');
const fetchOriginal=window.fetch.bind(window);window.fetch=(input,init)=>fetchOriginal(typeof input==='string'?resolve(input):input,init);
for(const Klass of [HTMLImageElement,HTMLVideoElement,HTMLAudioElement]){const desc=Object.getOwnPropertyDescriptor(Klass.prototype,'src');if(desc?.set)Object.defineProperty(Klass.prototype,'src',{...desc,set(value){desc.set.call(this,resolve(value));}});}
if(window.FontFace){const FontFaceOriginal=window.FontFace;window.FontFace=class extends FontFaceOriginal{constructor(family,source,descriptors){super(family,typeof source==='string'?css(source):source,descriptors);}};}
const insert=CSSStyleSheet.prototype.insertRule;CSSStyleSheet.prototype.insertRule=function(rule,index){return insert.call(this,css(rule),index);};
window.__portableAssets={originalReferenceMedia:false,sourceMotionPreserved:true,replaceableSchematicTextures:true,urlMappings:Object.keys(source).length};
})();
