const THREE=window.THREE;
const host=document.querySelector('#scene'),status=document.querySelector('#scene-status');
try{
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;host.append(renderer.domElement);status.hidden=true;host.dataset.renderer="webgl";renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();window.startFoodFallback(host,"taco")});
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);let distance=11.8;let yaw=.38,pitch=.32;let auto=!matchMedia('(prefers-reduced-motion: reduce)').matches;let exploded=false;
scene.add(new THREE.HemisphereLight(0xfff5d5,0x363e20,3));const key=new THREE.DirectionalLight(0xffe3ac,3.2);key.position.set(-4,8,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;key.shadow.normalBias=.03;scene.add(key);const rim=new THREE.DirectionalLight(0xeaffb6,2.6);rim.position.set(4,3,-5);scene.add(rim);const fill=new THREE.DirectionalLight(0xffffff,1);fill.position.set(0,2,8);scene.add(fill);
const root=new THREE.Group();scene.add(root);const taco=new THREE.Group();root.add(taco);taco.scale.y=.72;const layers={};let seed=8192;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
function texture(type){const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle=type==='bread'?'#d6af69':type==='crumb'?'#bf7929':'#b9823b';ctx.fillRect(0,0,1024,1024);for(let i=0;i<22000;i++){let x=rnd()*1024,y=rnd()*1024,r=rnd()*(type==='bread'?9:5)+.5;ctx.fillStyle=type==='bread'?`rgba(${90+Math.floor(rnd()*50)},${45+Math.floor(rnd()*25)},15,${rnd()*.17})`:`rgba(79,35,9,${rnd()*.25})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.6,rnd()*Math.PI,0,Math.PI*2);ctx.fill()}if(type==='bread'){for(let i=0;i<90;i++){let x=rnd()*1024,y=rnd()*1024,r=3+rnd()*28;let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#75422099');g.addColorStop(1,'#935a2800');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}ctx.save();ctx.rotate(-.24);for(let y=-100;y<1500;y+=120){ctx.fillStyle='#67300d87';ctx.fillRect(-300,y,1800,12);ctx.fillStyle='#8b4e2044';ctx.fillRect(-300,y+12,1800,7)}ctx.restore()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
const breadTex=texture('bread'),meatTex=texture('meat'),crumbTex=texture('crumb');const mats={bread:new THREE.MeshStandardMaterial({map:breadTex,bumpMap:breadTex,bumpScale:.055,roughness:.9,color:0xffe9c4,side:THREE.DoubleSide}),chicken:new THREE.MeshStandardMaterial({map:meatTex,color:0xdcb070,roughness:.7,bumpMap:meatTex,bumpScale:.1}),beef:new THREE.MeshStandardMaterial({map:meatTex,color:0x755139,roughness:.72}),falafel:new THREE.MeshStandardMaterial({map:meatTex,color:0x6f6c2d,roughness:.95}),cheese:new THREE.MeshPhysicalMaterial({color:0xffd26b,roughness:.28,clearcoat:.35}),fries:new THREE.MeshStandardMaterial({color:0xe8b14b,roughness:.62,map:meatTex}),tomato:new THREE.MeshPhysicalMaterial({color:0xdb3c21,roughness:.28,clearcoat:.45}),onion:new THREE.MeshPhysicalMaterial({color:0xdcc4d7,roughness:.4}),lettuce:new THREE.MeshStandardMaterial({color:0x6d9e2c,roughness:.75,side:THREE.DoubleSide}),sauce:new THREE.MeshPhysicalMaterial({color:0xf2dfb1,roughness:.25,clearcoat:.5})};
function rounded(w,d,h,r,mat){const s=new THREE.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.055,bevelThickness:.045,curveSegments:12});g.rotateX(-Math.PI/2);const pos=g.attributes.position;const uv=g.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getZ(i)+d/2)/d);return mesh(g,mat)}
function mesh(g,m){const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;return o}
function layer(name,y){const g=new THREE.Group();g.position.y=y;g.userData.base=y;taco.add(g);layers[name]=g;return g}
// One continuous pillow-shaped tortilla, partitioned at identical boundary rings.
// Every segment uses the same texture, coordinate system and edge vertices.
const shell={a:2.28,b:1.3,center:.74,height:.74,cut:.73};
function tortillaBand(from,to,base){
 const positions=[],uvs=[],indices=[],rings=28,around=128;
 for(let j=0;j<=rings;j++){
  const latitude=from+(to-from)*j/rings;
  const radius=Math.pow(Math.max(0,Math.cos(latitude)),.28);
  const y=shell.center+shell.height*Math.sin(latitude);
  for(let i=0;i<=around;i++){
   const angle=i/around*Math.PI*2,c=Math.cos(angle),q=Math.sin(angle);
   const x=shell.a*Math.sign(c)*Math.pow(Math.abs(c),.57)*radius;
   const z=shell.b*Math.sign(q)*Math.pow(Math.abs(q),.57)*radius;
   positions.push(x,y-base,z);
   // The y offset prevents the toasted texture collapsing into vertical streaks.
   uvs.push(x/4.8+.5+(y-.74)*.11,z/2.9+.5+(y-.74)*.14);
   if(j<rings&&i<around){const v=j*(around+1)+i;indices.push(v,v+around+1,v+1,v+1,v+around+1,v+around+2)}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
 const normals=g.attributes.normal;
 const point=(lat,ang)=>{const r=Math.pow(Math.max(0,Math.cos(lat)),.28),c=Math.cos(ang),q=Math.sin(ang);return new THREE.Vector3(shell.a*Math.sign(c)*Math.pow(Math.abs(c),.57)*r,shell.center+shell.height*Math.sin(lat),shell.b*Math.sign(q)*Math.pow(Math.abs(q),.57)*r)};
 for(let j=0;j<=rings;j++)for(let i=0;i<=around;i++){
  const lat=from+(to-from)*j/rings,ang=i/around*Math.PI*2;
  const dl=point(Math.min(Math.PI/2,lat+.0001),ang).sub(point(Math.max(-Math.PI/2,lat-.0001),ang));
  const da=point(lat,ang+.0001).sub(point(lat,ang-.0001));
  const n=dl.cross(da).normalize();if(Math.abs(lat)>Math.PI/2-.001)n.set(0,Math.sign(lat),0);
  normals.setXYZ(j*(around+1)+i,n.x,n.y,n.z);
 }
 return mesh(g,mats.bread);
}
const bottom=layer('bottom',0);bottom.add(tortillaBand(-Math.PI/2,-shell.cut,0));
const proteins=layer('protein',.25);proteins.scale.set(.88,1,.88);
const nuggetMat=new THREE.MeshStandardMaterial({color:0xe5ad50,map:crumbTex,bumpMap:crumbTex,bumpScale:.09,roughness:.9});
const sausageMat=new THREE.MeshStandardMaterial({color:0xb65c3c,roughness:.5,map:meatTex});
function irregularChunk(w,d,h,mat){
 const g=new THREE.BoxGeometry(w,h,d,4,3,4),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const n=Math.sin(x*31+y*47+z*23)*Math.cos(x*19-z*37)*.022;
  p.setXYZ(i,x+n,y+n*.7,z+n);
 }
 g.computeVertexNormals();return mesh(g,mat);
}
function nugget(){
 const shape=new THREE.Shape(),N=40;
 for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;const r=1+.25*Math.sin(a*3+.8)+.09*Math.sin(a*5);const x=Math.cos(a)*r*.29,z=Math.sin(a)*r*.22;i?shape.lineTo(x,z):shape.moveTo(x,z)}
 const g=new THREE.ExtrudeGeometry(shape,{depth:.15,steps:1,bevelEnabled:true,bevelSize:.07,bevelThickness:.06,bevelSegments:3,curveSegments:16});g.rotateX(-Math.PI/2);const pos=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),n=Math.sin(x*73+z*37)*Math.sin(y*63+z*91)*.012;pos.setXYZ(i,x+n,y+n,z+n);uv.setXY(i,x/.85+.5,z/.7+.5)}g.computeVertexNormals();
 const body=mesh(g,nuggetMat);
 const crumbs=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.012,0),new THREE.MeshStandardMaterial({color:0xf4c66a,roughness:1}),65);const transform=new THREE.Object3D();
 for(let i=0;i<65;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.9;transform.position.set(Math.cos(a)*r*.27,.215+rnd()*.016,Math.sin(a)*r*.21);transform.scale.setScalar(.7+rnd()*1.2);transform.rotation.set(rnd()*3,rnd()*3,rnd()*3);transform.updateMatrix();crumbs.setMatrixAt(i,transform.matrix)}crumbs.castShadow=true;body.add(crumbs);return body;
}
function chickenStrip(){
 const s=new THREE.Shape();s.moveTo(-.31,-.075);s.lineTo(-.16,-.12);s.lineTo(.06,-.08);s.lineTo(.29,-.13);s.lineTo(.35,-.015);s.lineTo(.18,.07);s.lineTo(-.04,.085);s.lineTo(-.26,.12);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.085,bevelEnabled:true,bevelSize:.025,bevelThickness:.018,bevelSegments:2});g.rotateX(-Math.PI/2);const strip=mesh(g,mats.chicken);
 // Fine pale fibres follow the torn meat, rather than a smooth bean silhouette.
 for(let i=0;i<3;i++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.22,.11,-.055+i*.045),new THREE.Vector3(0,.12,-.05+i*.045),new THREE.Vector3(.22,.11,-.06+i*.045)]);strip.add(mesh(new THREE.TubeGeometry(curve,6,.006,3,false),fibreMat))}return strip;
}
const fibreMat=new THREE.MeshStandardMaterial({color:0xeacb95,roughness:.8});
let currentProtein='';
function rebuildProtein(type){
 if(type===currentProtein)return;currentProtein=type;
 proteins.traverse(o=>{if(o.isMesh)o.geometry.dispose()});proteins.clear();
 const count=type==='Nuggets'?13:type==='Falafel'?16:type==='Salchicha'?28:64;
 for(let i=0;i<count;i++){
  let o;
  if(type==='Nuggets')o=nugget();
  else if(type==='Salchicha'){o=mesh(new THREE.CylinderGeometry(.17,.17,.105,22),sausageMat);const center=mesh(new THREE.CylinderGeometry(.143,.143,.109,22),new THREE.MeshStandardMaterial({color:0xe49372,roughness:.55}));o.add(center)}
  else if(type==='Falafel'){o=mesh(new THREE.IcosahedronGeometry(.22,1),mats.falafel);o.scale.set(1,.7,1)}
  else if(type==='Ternera'||type==='Mixto'&&i%2){o=irregularChunk(.1+rnd()*.12,.1+rnd()*.12,.1+rnd()*.1,mats.beef)}
  else o=chickenStrip();
  // Uniform distribution across the wrap, with a staggered second layer.
  const columns=type==='Nuggets'?5:type==='Falafel'?5:type==='Salchicha'?7:10;
  o.position.set((i%columns/(columns-1)-.5)*3.6+(rnd()-.5)*.11,.05+rnd()*.15,(Math.floor(i/columns)/Math.max(1,Math.ceil(count/columns)-1)-.5)*1.75);
  o.rotation.y=(rnd()-.5)*2.8;o.rotation.z=(rnd()-.5)*.12;proteins.add(o);
 }
}
rebuildProtein('Pollo');
const fries=layer('Patatas',.6);fries.scale.set(.85,1,.85);for(let i=0;i<32;i++){const b=rounded(.105+rnd()*.065,.7+rnd()*.65,.11,.035,mats.fries);b.position.set((rnd()-.5)*3.7,rnd()*.15,(rnd()-.5)*1.6);b.rotation.y=rnd()*3;fries.add(b)}
const cheese=layer('Queso',.83);const melted=rounded(4.12,2.15,.07,.3,mats.cheese);cheese.add(melted);for(let i=0;i<12;i++){const o=mesh(new THREE.SphereGeometry(.08+rnd()*.07,10,8),mats.cheese);o.position.set((rnd()-.5)*3.7,-rnd()*.12,1.03);o.scale.y=1.8;cheese.add(o)}
const tomato=layer('Tomate',.98);for(let i=0;i<12;i++){const o=mesh(new THREE.SphereGeometry(.22,12,8),mats.tomato);o.scale.set(1,.26,.8);o.position.set((rnd()-.5)*3.8,rnd()*.05,(rnd()-.5)*1.7);tomato.add(o)}
const onion=layer('Cebolla',1.03);for(let i=0;i<12;i++){const o=mesh(new THREE.TorusGeometry(.14+rnd()*.1,.025,5,18,Math.PI*1.6),mats.onion);o.rotation.x=Math.PI/2;o.rotation.z=rnd()*4;o.position.set((rnd()-.5)*3.7,rnd()*.04,(rnd()-.5)*1.8);onion.add(o)}
const lettuce=layer('Lechuga',1.13);for(let i=0;i<16;i++){const g=new THREE.PlaneGeometry(.55+rnd()*.3,.4+rnd()*.3,5,5);const p=g.attributes.position;for(let j=0;j<p.count;j++)p.setZ(j,Math.sin(p.getX(j)*23)*.05+rnd()*.04);g.computeVertexNormals();const o=mesh(g,mats.lettuce);o.rotation.set(-Math.PI/2,rnd()*.4,rnd()*5);o.position.set((rnd()-.5)*3.7,rnd()*.04,(rnd()-.5)*1.8);lettuce.add(o)}
const sauce=layer('Salsa',1.2);for(let i=0;i<8;i++){const points=[];for(let j=0;j<12;j++)points.push(new THREE.Vector3(-1.7+j*.3,.02+Math.sin(j*.8)*.015,-.9+i*.25+Math.sin(j)*.07));sauce.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),25,.035,6,false),mats.sauce))}
const top=layer('top',1.27);top.add(tortillaBand(shell.cut,Math.PI/2,1.27));
const fold=layer('fold',0);fold.add(tortillaBand(-shell.cut,shell.cut,0));
const plate=mesh(new THREE.CylinderGeometry(3.65,3.8,.12,80),new THREE.MeshStandardMaterial({color:0x303329,roughness:.85}));plate.position.y=-.18;plate.receiveShadow=true;root.add(plate);
const drinkGroup=new THREE.Group();drinkGroup.position.set(3.2,.4,-1);root.add(drinkGroup);const can=mesh(new THREE.CylinderGeometry(.37,.37,1.35,40),new THREE.MeshPhysicalMaterial({color:0x983021,metalness:.45,roughness:.28}));can.position.y=.6;drinkGroup.add(can);for(const y of [-.08,1.28]){const lid=mesh(new THREE.CylinderGeometry(.37,.37,.04,40),new THREE.MeshStandardMaterial({color:0xbec1b7,metalness:.8,roughness:.3}));lid.position.y=y;drinkGroup.add(lid)}const drinkLabel=document.createElement('canvas');drinkLabel.width=512;drinkLabel.height=256;const dc=drinkLabel.getContext('2d');function labelDrink(name){dc.fillStyle='#87291d';dc.fillRect(0,0,512,256);dc.fillStyle='#fff6da';dc.textAlign='center';dc.font='bold 30px sans-serif';dc.fillText(name.toUpperCase(),256,136);const t=new THREE.CanvasTexture(drinkLabel);t.colorSpace=THREE.SRGBColorSpace;can.material.map=t;can.material.needsUpdate=true}drinkGroup.visible=false;
const bravas=new THREE.Group();bravas.position.set(-3.05,.1,-1);root.add(bravas);const bowl=mesh(new THREE.CylinderGeometry(.78,.5,.35,30,1,true),new THREE.MeshStandardMaterial({color:0x726c50,side:THREE.DoubleSide,roughness:.8}));bravas.add(bowl);const bravaMat=new THREE.MeshStandardMaterial({color:0xf1bb60,map:crumbTex,bumpMap:crumbTex,bumpScale:.06,roughness:.85});
const bravaSauce=new THREE.MeshPhysicalMaterial({color:0xb83d19,roughness:.35,clearcoat:.3});
for(let i=0;i<16;i++){
 const b=irregularChunk(.28+rnd()*.14,.27+rnd()*.15,.24+rnd()*.08,bravaMat);
 b.position.set((i%4-1.5)*.29,.08+Math.floor(i/8)*.22,(Math.floor(i/4)%2-.5)*.52);
 b.rotation.set((rnd()-.5)*.3,rnd()*2,(rnd()-.5)*.3);bravas.add(b);
 if(i>4){const dollop=mesh(new THREE.SphereGeometry(.14,12,7),bravaSauce);dollop.scale.set(1.25,.25,1);dollop.position.set(b.position.x,b.position.y+.17,b.position.z);bravas.add(dollop)}
}
bravas.visible=false;
const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.25}));floor.rotation.x=-Math.PI/2;floor.position.y=-.26;scene.add(floor);
let config={ingredients:['Patatas','Queso','Tomate','Cebolla','Lechuga','Salsa'],protein:'Pollo',giant:false,drink:'none',menu:false};window.addEventListener('taco-change',e=>{config=e.detail;for(const n of ['Patatas','Queso','Tomate','Cebolla','Lechuga','Salsa'])layers[n].visible=config.ingredients.includes(n);rebuildProtein(config.protein);taco.scale.set(config.giant?1.12:1,(config.giant?1.12:1)*.72,config.giant?1.12:1);drinkGroup.visible=config.drink!=='none';bravas.visible=config.menu;const names={cola:'Coca-Cola',orange:'Fanta naranja',lemon:'Fanta limón',nestea:'Nestea',hawai:'Hawai',poms:'Poms',water:'Agua',bigwater:'Agua'};if(drinkGroup.visible)labelDrink(names[config.drink]||'Bebida')});
host.tabIndex=0;host.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();yaw+=e.key==="ArrowLeft"?-.2:.2;auto=false;rotBtn.setAttribute("aria-pressed",false)}});const rotBtn=document.querySelector('#rotate');rotBtn.setAttribute('aria-pressed',auto);rotBtn.onclick=()=>{auto=!auto;rotBtn.setAttribute('aria-pressed',auto)};document.querySelector('#explode').onclick=e=>{exploded=!exploded;e.currentTarget.setAttribute('aria-pressed',exploded);e.currentTarget.textContent=exploded?'☷ Cerrar capas':'☷ Ver capas'};document.querySelector('#reset-view').onclick=()=>{yaw=.38;pitch=.32;distance=11.8;exploded=false;const b=document.querySelector('#explode');b.setAttribute('aria-pressed',false);b.textContent='☷ Ver capas'};
const pointers=new Map();let pinch=0;host.onpointerdown=e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});host.setPointerCapture(e.pointerId);host.style.cursor='grabbing'};host.onpointermove=e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);if(pointers.size===1){yaw+=(e.clientX-old.x)*.009;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-old.y)*.006,-.1,1.1);auto=false;rotBtn.setAttribute('aria-pressed',false)}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)distance=THREE.MathUtils.clamp(distance+(pinch-d)*.025,8,19);pinch=d}};for(const ev of ['onpointerup','onpointercancel'])host[ev]=e=>{pointers.delete(e.pointerId);pinch=0;host.style.cursor='grab'};host.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.008,8,19)},{passive:false});
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();let last=0;let visible=true;new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);
let expansion=0;const order=['bottom','protein','Patatas','Queso','Tomate','Cebolla','Lechuga','Salsa','top'];function animate(t){requestAnimationFrame(animate);if(!visible||document.hidden||host.dataset.renderer!=="webgl")return;const dt=Math.min((t-last)/1000,.05);last=t;if(auto)yaw+=dt*.14;expansion=THREE.MathUtils.lerp(expansion,exploded?1:0,1-Math.exp(-dt*8));if(expansion<.0005)expansion=0;if(expansion>.9995)expansion=1;order.forEach((n,i)=>{layers[n].position.y=layers[n].userData.base+expansion*i*.25});layers.fold.visible=expansion<.035;layers.protein.visible=expansion>0;for(const n of ['Patatas','Queso','Tomate','Cebolla','Lechuga','Salsa'])layers[n].visible=expansion>0&&config.ingredients.includes(n);const target=new THREE.Vector3(0,exploded?1.8:.6,0);const viewDistance=Math.max(distance+(config.menu?2.8:config.drink!=='none'?1.3:0),(config.menu?8.4:config.drink!=='none'?7.7:5.8)/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));camera.position.set(Math.sin(yaw)*Math.cos(pitch)*viewDistance,Math.sin(pitch)*viewDistance+1,Math.cos(yaw)*Math.cos(pitch)*viewDistance);camera.lookAt(target);renderer.render(scene,camera)}requestAnimationFrame(animate);
}catch(e){window.startFoodFallback(host,"taco");console.warn("Vista ilustrada activada: WebGL no disponible",e)}
