import * as THREE from 'three';

/* Original desk still life, in metres. Call after document.fonts.ready (CN is used
 * if supplied by the film). No remote textures, models, image files or fonts.
 * Object origins: desk floor y=0; work surface y=.78. Paper is real A4 ratio.
 * Animation owns stacks[].position/rotation and outputPad.position/rotation.
 */
export function createDeskProps() {
  const group = new THREE.Group(); group.name = 'physical-context-desk';
  const materials = new Set(), geometries = new Set(), textures = new Set();
  let seed = 9731;
  const rnd = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const own = (x, set) => (set.add(x), x);
  const mat = p => own(new THREE.MeshStandardMaterial(p), materials);
  const canvas = (w,h) => { const c=document.createElement('canvas');c.width=w;c.height=h;return c; };
  function texture(c, color=true) {const t=own(new THREE.CanvasTexture(c),textures);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=8;return t;}
  const ink='#24252A', grey='#65635C';

  // Fine, irregular oak fibres. Low-contrast colour and micro-height are separate.
  const oakCanvas=canvas(2048,1024), oc=oakCanvas.getContext('2d');
  const grainCanvas=canvas(1024,512), gc=grainCanvas.getContext('2d');
  const pixels=oc.createImageData(2048,1024);
  const knots=[[.23,.38,.034],[.79,.72,.027]];
  for(let y=0;y<1024;y++)for(let x=0;x<2048;x++){
    let u=x/2048,v=y/1024;
    let warp=.006*Math.sin(u*17+v*9)+.002*Math.sin(u*53+v*12);
    for(const [kx,ky,s] of knots){const dx=(u-kx)*.38,dy=v-ky;warp+=s*.24*Math.exp(-(dx*dx+dy*dy)/(s*s))*Math.sin(Math.atan2(dy,dx)*2);}
    const q=v+warp;
    const fine=Math.sin(q*1997+Math.sin(q*209)*2)*1.65;
    const broad=Math.sin(q*117+Math.sin(u*5)*.6)*4.3;
    const pore=Math.pow(Math.max(0,Math.sin(q*747+Math.sin(u*31)*.8)),16)*6;
    const n=(rnd()-.5)*2.3+fine+broad-pore, i=(y*2048+x)*4;
    pixels.data[i]=188+n;pixels.data[i+1]=156+n*.91;pixels.data[i+2]=113+n*.79;pixels.data[i+3]=255;
  }
  oc.putImageData(pixels,0,0);
  for(let i=0;i<950;i++){const y=rnd()*1024,x=rnd()*1900;oc.beginPath();oc.moveTo(x,y);oc.bezierCurveTo(x+90,y-2,x+200,y+2,x+90+rnd()*650,y+rnd()*3);oc.strokeStyle=`rgba(94,66,32,${.028+rnd()*.067})`;oc.lineWidth=.3+rnd()*.65;oc.stroke();}
  gc.fillStyle='#808080';gc.fillRect(0,0,1024,512);
  for(let i=0;i<1200;i++){const y=rnd()*512;gc.strokeStyle=`rgba(${rnd()>.5?'255,255,255':'0,0,0'},.07)`;gc.lineWidth=.4;gc.beginPath();gc.moveTo(rnd()*80,y);gc.bezierCurveTo(280,y-1,730,y+1,1024,y);gc.stroke();}
  const wood=mat({map:texture(oakCanvas),bumpMap:texture(grainCanvas,false),bumpScale:.00018,roughness:.68,metalness:0,color:'#FFFFFF'});
  const metal=mat({color:'#27292B',roughness:.37,metalness:.76});
  const chrome=mat({color:'#C9CCD0',roughness:.19,metalness:1});
  const darkChrome=mat({color:'#4C5054',roughness:.27,metalness:.92});
  const rubber=mat({color:'#17191A',roughness:.92});
  const paperEdge=mat({color:'#E8E5DA',roughness:.95});
  const edgeLayerMat=mat({color:'#FFFFFF',vertexColors:true,roughness:.96});
  const manila=mat({color:'#C4A36B',roughness:.89});
  const manilaInner=mat({color:'#D4B780',roughness:.93});
  const padMat=mat({color:'#B9A9CF',roughness:.76});
  const padEdge=mat({color:'#9887AD',roughness:.85});
  const penMat=mat({color:'#24262B',roughness:.27,metalness:.3});

  function mesh(geo, material, parent=group){own(geo,geometries);const m=new THREE.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function roundedSolid(w,h,d,r,material,parent=group){
    const b=Math.min(.004,h*.22,r*.28),hw=w/2-b,hd=d/2-b,rr=Math.max(.0001,r-b),s=new THREE.Shape();
    s.moveTo(-hw+rr,-hd);s.lineTo(hw-rr,-hd);s.quadraticCurveTo(hw,-hd,hw,-hd+rr);s.lineTo(hw,hd-rr);s.quadraticCurveTo(hw,hd,hw-rr,hd);s.lineTo(-hw+rr,hd);s.quadraticCurveTo(-hw,hd,-hw,hd-rr);s.lineTo(-hw,-hd+rr);s.quadraticCurveTo(-hw,-hd,-hw+rr,-hd);
    const geo=new THREE.ExtrudeGeometry(s,{steps:1,depth:h-2*b,bevelEnabled:true,bevelSegments:3,bevelSize:b,bevelThickness:b,curveSegments:5});geo.rotateX(-Math.PI/2);geo.translate(0,-h/2+b,0);
    const a=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<a.count;i++)uv.setXY(i,a.getX(i)/w+.5,a.getZ(i)/d+.5);
    return mesh(geo,material,parent);
  }
  function box(w,h,d,material,parent=group){return mesh(new THREE.BoxGeometry(w,h,d),material,parent);}
  function cylinder(r1,r2,h,material,parent=group,segments=24){return mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material,parent);}
  function wire(points,r,material,parent){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,7,false),material,parent);}
  const top=roundedSolid(1.8,.04,.9,.026,wood);top.position.y=.76;top.name='solid-oak-top';
  // Powder-coated steel legs, horizontal structural rails, small levelling feet.
  for(const x of [-.76,.76]){
    const legFrame=new THREE.Group();group.add(legFrame);
    for(const z of [-.325,.325]){const leg=roundedSolid(.043,.715,.043,.0035,metal,legFrame);leg.position.set(x,.3775,z);const foot=cylinder(.023,.023,.012,rubber,legFrame);foot.position.set(x,.014,z);}
    const rail=roundedSolid(.045,.033,.69,.003,metal,legFrame);rail.position.set(x,.727,0);
    const lower=roundedSolid(.029,.026,.66,.003,metal,legFrame);lower.position.set(x,.115,0);
  }
  for(const z of [-.325,.325]){const rail=roundedSolid(1.55,.052,.027,.003,metal);rail.position.set(0,.71,z);}
  // Corner mounting plates and screws remain physical under the desktop.
  for(const x of [-.76,.76])for(const z of [-.325,.325]){
    const plate=box(.1,.004,.1,darkChrome);plate.position.set(x,.737,z);
    for(const dx of [-.03,.03]){const screw=cylinder(.005,.005,.003,chrome);screw.position.set(x+dx,.734,z+.029);}
  }

  function fibreBase(c,base='#F2EFE6'){
    const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,c.width,c.height);
    for(let i=0;i<13000;i++){x.fillStyle=`rgba(${rnd()>.55?'84,77,64':'255,255,255'},${.015+rnd()*.035})`;x.fillRect(rnd()*c.width,rnd()*c.height,.5+rnd()*1.7,.5+rnd()*.9);}
    return x;
  }
  // Fibre relief is only a few tens of microns; no coarse embossed paper noise.
  const paperReliefCanvas=canvas(512,512),pr=paperReliefCanvas.getContext('2d');
  const relief=pr.createImageData(512,512);
  for(let i=0;i<relief.data.length;i+=4){const v=124+rnd()*8;relief.data[i]=v;relief.data[i+1]=v;relief.data[i+2]=v;relief.data[i+3]=255;}
  pr.putImageData(relief,0,0);
  for(let i=0;i<1500;i++){const x=rnd()*512,y=rnd()*512;pr.strokeStyle='rgba(225,225,225,.075)';pr.lineWidth=.4;pr.beginPath();pr.moveTo(x,y);pr.lineTo(x+2+rnd()*5,y+(rnd()-.5)*2);pr.stroke();}
  const paperRelief=texture(paperReliefCanvas,false);
  const font=(x,size,weight=450)=>{x.font=`${weight} ${size}px CN, "Microsoft YaHei", sans-serif`;};
  function write(x,str,l,y,size=38,weight=450,color=ink){font(x,size,weight);x.fillStyle=color;x.fillText(str,l,y);}
  function paragraph(x,str,l,y,width,size=39,lh=65){font(x,size);x.fillStyle=ink;let row='',line=0;for(const ch of str){if(ch==='\n'){x.fillText(row,l,y+line*lh);row='';line++;continue;}if(x.measureText(row+ch).width>width){x.fillText(row,l,y+line*lh);row=ch;line++;}else row+=ch;}if(row)x.fillText(row,l,y+line*lh);return y+(line+1)*lh;}
  function makePrint(kind){
    const c=canvas(1024,1448),x=fibreBase(c);x.textBaseline='alphabetic';
    write(x,'TOKEN  /  工作资料',78,88,27,600,grey);write(x,'概念示意',945,88,25,400,grey); // right aligned below
    x.clearRect(830,45,190,55);x.fillStyle='#F2EFE6';x.fillRect(830,45,190,55);write(x,'概念示意',834,88,26,450,grey);
    x.fillStyle='#393934';x.fillRect(78,116,867,3);
    const title=['聊天记录','当前问题','参考资料'][kind];write(x,title,77,281,113,760);
    write(x,['对话归档 / 最近轮次','本次请求 / 阅读与回答','阅读摘要 / Token 基础'][kind],81,354,34,500,grey);
    if(kind===0){
      const rows=[['用户 · 上一轮','请先说明，Token 是什么？'],['助手 · 上一轮','可以把 Token 理解为模型处理文字时使用的基本单位。'],['用户 · 继续追问','刚才的聊天内容，也要一起传给模型吗？'],['助手 · 说明','模型处理当前请求时，会读取请求中带上的相关历史。']];
      let y=457;
      rows.forEach(([who,s],i)=>{write(x,who,82,y,31,700,i%2?'#6D5D83':'#4A4945');y+=63;y=paragraph(x,s,82,y,842,42,68)+36;x.fillStyle='#D1CEC4';x.fillRect(82,y-9,852,1);y+=33;});
    } else if(kind===1){
      write(x,'请解释 Token 是什么。',82,507,59,650);
      let y=paragraph(x,'再说明：为什么聊天历史、当前问题和参考资料，都会占用上下文空间？',82,617,842,48,79);
      write(x,'回答要求',82,y+92,43,700);
      y=paragraph(x,'用普通人听得懂的方式解释；把桌面比作工作空间，说明输入与回答如何共享有限容量。',82,y+164,842,43,73);
      x.strokeStyle='#988756';x.lineWidth=3;x.beginPath();x.moveTo(87,532);x.bezierCurveTo(220,547,561,528,776,536);x.stroke();
      write(x,'问题明确，才能保留相关资料。',82,1280,33,500,grey);
    } else {
      let y=448;
      [['01','什么会占空间？','当前问题、需要参考的资料，以及这次请求带上的历史对话。'],['02','还需要为回答留位置','输入并不是唯一的内容。模型接下来生成的回答，也需要使用可用空间。'],['03','保留真正相关的内容','空间有限时，可以整理旧对话、提炼任务摘要，把与本次问题无关的内容移开。']].forEach(([n,head,p])=>{write(x,n,81,y,38,650,'#807051');write(x,head,169,y,43,700);y=paragraph(x,p,170,y+68,747,40,65)+58;});
    }
    x.fillStyle='#CAC6BB';x.fillRect(80,1352,866,2);write(x,'TOKEN EXPLAINED',82,1393,22,500,grey);write(x,'01',900,1394,26,600,grey);
    return mat({map:texture(c),bumpMap:paperRelief,bumpScale:.000025,roughness:.92,metalness:0,side:THREE.DoubleSide});
  }
  const printMats=[0,1,2].map(makePrint);
  // A bound, slightly bent paper surface. Curl is geometry, including thin rims.
  function sheet(parent,w,d,y,material,curl=.003,rx=0,rz=0){
    const nx=14,nz=20,positions=[],uv=[],indices=[];
    for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
      const u=i/nx,v=j/nz,corner=Math.pow(u,6)*Math.pow(v,7);
      const bend=curl*corner+.00032*Math.sin(u*3.2)*Math.sin(v*4.5);
      positions.push((u-.5)*w,bend,(v-.5)*d);uv.push(u,1-v);
    }
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,e=a+nx+1,f=e+1;indices.push(a,e,b,b,e,f);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    const m=mesh(g,material,parent);m.position.set(rx,y,rz);m.userData.isPaper=true;
    // Edge at the bent corner reveals actual thickness rather than a folded icon.
    const rim=[],normal=[];const pts=g.attributes.position;
    const border=[...Array.from({length:nx+1},(_,i)=>i),...Array.from({length:nz},(_,j)=>(j+1)*(nx+1)+nx),...Array.from({length:nx},(_,i)=>nz*(nx+1)+nx-1-i),...Array.from({length:nz-1},(_,j)=>(nz-1-j)*(nx+1))];
    for(let i=0;i<border.length;i++){const a=border[i],b=border[(i+1)%border.length],aa=[pts.getX(a),pts.getY(a),pts.getZ(a)],bb=[pts.getX(b),pts.getY(b),pts.getZ(b)];rim.push(...aa,...bb,bb[0],bb[1]-.0002,bb[2],...aa,bb[0],bb[1]-.0002,bb[2],aa[0],aa[1]-.0002,aa[2]);}
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rim,3));rg.computeVertexNormals();const r=mesh(rg,paperEdge,parent);r.position.copy(m.position);
    return m;
  }
  // Many individual uneven paper edges, merged into one draw call per stack.
  function layeredPages(parent,count,w,d,baseY){
    const pos=[],colors=[],thick=.00019;
    function tri(a,b,c,col){pos.push(...a,...b,...c);for(let k=0;k<3;k++)colors.push(...col);}
    for(let n=0;n<count;n++){
      const ox=(rnd()-.5)*.0022,oz=(rnd()-.5)*.0022,angle=(rnd()-.5)*.007,y=baseY+n*thick;
      const co=Math.cos(angle),si=Math.sin(angle);const p=(x,yy,z)=>[x*co-z*si+ox,yy,x*si+z*co+oz];
      const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],v=.81+rnd()*.155,col=[v,v*.986,v*.947];
      for(let k=0;k<4;k++){const a=corners[k],b=corners[(k+1)%4],aa=p(a[0],y,a[1]),bb=p(b[0],y,b[1]),cc=p(b[0],y+thick,b[1]),dd=p(a[0],y+thick,a[1]);tri(aa,dd,bb,col);tri(bb,dd,cc,col);}
      // Each page has a top, so offset edges catch highlights and cast shadows.
      const a=p(-w/2,y+thick,-d/2),b=p(w/2,y+thick,-d/2),c=p(w/2,y+thick,d/2),e=p(-w/2,y+thick,d/2);
      tri(a,e,b,[.936,.926,.888]);tri(b,e,c,[.936,.926,.888]);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();const m=mesh(g,edgeLayerMat,parent);m.name='separate-paper-layer-edges';return baseY+count*thick;
  }
  function binderClip(parent,x,y,z,size=1){
    const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(size);parent.add(g);g.name='steel-binder-clip';
    // The folded body is an actual tapered black spring-steel shell.
    const shape=new THREE.Shape();shape.moveTo(-.019,0);shape.lineTo(.019,0);shape.lineTo(.013,.011);shape.lineTo(-.013,.011);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.015,bevelEnabled:true,bevelSize:.0008,bevelThickness:.0007,bevelSegments:2,steps:1});const body=mesh(geo,metal,g);body.position.z=-.0075;
    for(const side of [-1,1]){wire([[-.012,.009,side*.007],[ -.012,.026,side*.014],[-.006,.032,side*.016],[.006,.032,side*.016],[.012,.026,side*.014],[.012,.009,side*.007]],.0009,chrome,g);const pivot=cylinder(.0016,.0016,.029,chrome,g,12);pivot.rotation.z=Math.PI/2;pivot.position.set(0,.01,side*.007);}
    return g;
  }
  function folder(parent,thick,label){
    const base=roundedSolid(.246,.00115,.335,.003,manila,parent);base.position.y=.0007;
    // Raised back panel, centre score and a real projecting folder tab.
    const spine=box(.244,thick,.0011,manilaInner,parent);spine.position.set(0,thick/2,-.166);
    const tab=roundedSolid(.102,.0012,.025,.004,manila,parent);tab.position.set(-.058,thick+.001,-.173);tab.rotation.x=-.12;
    const tabC=canvas(640,156),tx=fibreBase(tabC,'#D3B783');write(tx,label,40,106,73,600,'#514535');
    const tabM=mat({map:texture(tabC),roughness:.92});const tabG=mesh(new THREE.PlaneGeometry(.092,.022),tabM,parent);tabG.rotation.x=-Math.PI/2-.12;tabG.position.set(-.058,thick+.0018,-.173);
    const lip=roundedSolid(.246,.0009,.019,.0018,manilaInner,parent);lip.position.set(0,thick,-.158);lip.rotation.x=-.15;
    // Curled scored folder edge on the left, with three subtle fold grooves.
    const edge=box(.011,.0012,.319,manila,parent);edge.position.set(-.119,.0021,0);edge.rotation.z=.12;
    for(let i=0;i<3;i++){const crease=box(.0005,.00015,.302,manila,parent);crease.position.set(-.115+i*.002,.00142,0);}
  }
  const labels=['聊天记录','当前问题','参考资料'];
  const counts=[54,5,114];
  const positions=[[-.60,.783,.11],[-.10,.783,.12],[.42,.783,.12]];
  const rotations=[-.065,.055,-.035];
  const stacks=labels.map((label,i)=>{
    const s=new THREE.Group();s.name=['chat-history-stack','current-question-stack','reference-document-stack'][i];group.add(s);s.position.set(...positions[i]);s.rotation.y=rotations[i];
    const baseY=.0022;
    folder(s,baseY+counts[i]*.00019,label);
    const height=layeredPages(s,counts[i],.210,.297,baseY);
    sheet(s,.21,.297,height+.00028,paperEdge,.0025,-.0015,.0008);
    sheet(s,.21,.297,height+.00065,paperEdge,.004,.001,-.001);
    const topSheet=sheet(s,.21,.297,height+.0012,printMats[i],i===1?.009:.006,0,0);topSheet.name='printed-top-page';
    if(i!==1)binderClip(s,-.071,height+.001,-.14,i===2?1:.84);
    // Physical adhesive page flags, only one subtle lavender flag per file.
    const flag=box(.022,.00011,.028,padMat,s);flag.position.set(.111,height-.0003,i===0?.05:.082);
    s.userData={title:label,pageCount:counts[i],initialPosition:s.position.toArray(),initialRotation:s.rotation.toArray(),footprint:[.26,.36],height:height+.011,topSheet};
    return s;
  });

  const outputPad=new THREE.Group();outputPad.name='reserved-answer-workspace';group.add(outputPad);
  // It is intentionally parked to the rear. Director reveals/moves the full group.
  outputPad.position.set(.55,.783,-.26);outputPad.rotation.y=-.02;
  const leatherC=canvas(512,512),lc=fibreBase(leatherC,'#C0B2D0');
  for(let i=0;i<2300;i++){lc.strokeStyle='rgba(80,64,97,.06)';lc.lineWidth=.5;const x=rnd()*512,y=rnd()*512;lc.beginPath();lc.moveTo(x,y);lc.lineTo(x+2+rnd()*3,y+1);lc.stroke();}
  const leather=mat({map:texture(leatherC),bumpMap:texture(leatherC,false),bumpScale:.00009,roughness:.8});
  const pad=roundedSolid(.302,.0045,.371,.009,padEdge,outputPad);pad.position.y=.00225;
  const padTop=roundedSolid(.298,.0009,.367,.008,leather,outputPad);padTop.position.y=.00475;
  // An inset stitched line adds scale cues without turning the pad into a UI card.
  const stitchPositions=[];
  for(const x of [-.141,.141])for(let z=-.165;z<.167;z+=.006){stitchPositions.push(x-.0003,.00526,z-.0014,x-.0003,.00526,z+.0014,x+.0003,.00526,z-.0014,x+.0003,.00526,z-.0014,x-.0003,.00526,z+.0014,x+.0003,.00526,z+.0014);}
  const stitchesGeo=new THREE.BufferGeometry();stitchesGeo.setAttribute('position',new THREE.Float32BufferAttribute(stitchPositions,3));stitchesGeo.computeVertexNormals();const stitches=mesh(stitchesGeo,padMat,outputPad);stitches.castShadow=false;
  const blank=canvas(1024,1448),bc=fibreBase(blank,'#F4F1E9');
  write(bc,'回答草稿',79,150,75,650,'#8C8880');write(bc,'为接下来的回答预留空间',81,218,32,450,'#A29C91');
  const blankMat=mat({map:texture(blank),bumpMap:paperRelief,bumpScale:.000025,roughness:.94,side:THREE.DoubleSide});
  layeredPages(outputPad,8,.21,.297,.0054);const blankSheet=sheet(outputPad,.21,.297,.0075,blankMat,.005);blankSheet.name='answer-draft-paper';
  // A proper ballpoint pen: barrel, chrome nose, nib, rings, and raised pocket clip.
  const pen=new THREE.Group();outputPad.add(pen);pen.name='black-metal-ballpoint';pen.position.set(.127,.011,.015);pen.rotation.set(Math.PI/2,0,-.08);
  const barrel=cylinder(.0041,.0041,.118,penMat,pen,32);barrel.position.y=.007;
  const nose=cylinder(.0038,.00065,.019,chrome,pen,24);nose.position.y=-.0615;
  const nib=cylinder(.00065,.00035,.003,darkChrome,pen,16);nib.position.y=-.0725;
  const cap=cylinder(.00415,.00415,.022,penMat,pen,24);cap.position.y=.077;
  for(const y of [-.05,.064,.089]){const ring=cylinder(.00435,.00435,.0014,chrome,pen,24);ring.position.y=y;}
  wire([[.002,.086,.004],[.002,.08,.006],[.002,.047,.006],[.002,.043,.0045]],.0008,chrome,pen);
  outputPad.userData={initialPosition:outputPad.position.toArray(),initialRotation:outputPad.rotation.toArray(),footprint:[.302,.371],title:'预留回答空间'};

  const props={desk:top,pen,blankSheet,desktopY:.78,dimensions:{width:1.8,depth:.9,height:.78},materials:{wood,metal,chrome,paperEdge,manila,leather},notes:'Original procedural physical still-life, not a photographed desk or product UI.'};
  function dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  return {group,stacks,outputPad,props,dispose};
}
