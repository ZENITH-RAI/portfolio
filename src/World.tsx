import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import createAvatar from './Avatar';
import createSceneSets from './SceneSets';
type Props = { section:string; zoom:number; reset:number; ambient:boolean; onSelect:(section:string)=>void };
export default function World({section,zoom,reset,ambient,onSelect}:Props){
 const host=useRef<HTMLDivElement>(null);const api=useRef<{camera:THREE.PerspectiveCamera;controls:OrbitControls;sun:THREE.DirectionalLight;setSection?:(section:string)=>void}|null>(null);const select=useRef(onSelect);select.current=onSelect;const [failed,setFailed]=useState(false);
 useEffect(()=>{if(!host.current)return;const el=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;el.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Photo-inspired Himalayan courtyard. Drag to look around, scroll to move closer, and meet Zenith waving hello, and click a red door to explore.');
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#f0f2e8',27,65);const camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(1.2,3.1,12);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2.25,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=7;controls.maxDistance=19;controls.minPolarAngle=1.1;controls.maxPolarAngle=1.65;controls.minAzimuthAngle=-.55;controls.maxAzimuthAngle=.55;controls.enablePan=false;api.current={camera,controls,sun:null!};
 scene.add(new THREE.HemisphereLight('#e4f1ff','#6a6944',2.2));const sun=new THREE.DirectionalLight('#fff0d0',3.7);sun.position.set(-7,12,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:1,far:45});sun.shadow.bias=-.0003;sun.shadow.normalBias=.04;scene.add(sun);api.current.sun=sun;
 let seed=82;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const textures:THREE.Texture[]=[];
 function texture(kind:'wood'|'stone'|'paving'){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle=kind==='wood'?'#a4291d':kind==='stone'?'#ddd8c4':'#b6ad96';ctx.fillRect(0,0,512,512);
  for(let i=0;i<16000;i++){const x=rand()*512,y=rand()*512;ctx.fillStyle=rand()>.5?'rgba(255,244,211,.10)':'rgba(39,24,15,.12)';ctx.fillRect(x,y,kind==='wood'?12+rand()*60:rand()*4+1,kind==='wood'?.4+rand():rand()*3+1);}
  if(kind==='stone'||kind==='paving'){ctx.strokeStyle=kind==='stone'?'#aaa58e':'#8c8674';ctx.lineWidth=3;for(let row=0;row<8;row++){const y=row*64;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y+rand()*5);ctx.stroke();for(let col=0;col<5;col++){const x=col*128+(row%2)*64;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*12,y+64);ctx.stroke();}}}
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;textures.push(t);return t;
 }
 const woodMap=texture('wood'),stoneMap=texture('stone'),paveMap=texture('paving');
 const red=new THREE.MeshStandardMaterial({map:woodMap,bumpMap:woodMap,bumpScale:.035,roughness:.66,color:'#c35c42'});
 const darkRed=new THREE.MeshStandardMaterial({map:woodMap,bumpMap:woodMap,bumpScale:.04,roughness:.8,color:'#78332a'});
 const stone=new THREE.MeshStandardMaterial({map:stoneMap,bumpMap:stoneMap,bumpScale:.08,roughness:.96,color:'#f6f3da'});
 const paving=new THREE.MeshStandardMaterial({map:paveMap,bumpMap:paveMap,bumpScale:.06,roughness:.95});paveMap.repeat.set(5,4);
 const iron=new THREE.MeshStandardMaterial({color:'#36332a',metalness:.65,roughness:.65});
 function mesh(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w:number,h:number,d:number,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent)}
 box(16,.22,10,paving,0,-.15,3.6);box(14,5.6,.55,stone,0,2.7,-.35);
 // Uneven whitewashed masonry around the doors, like the reference wall.
 for(let row=0;row<13;row++)for(let col=0;col<19;col++){const x=-7+col*.76+(row%2)*.3,y=.2+row*.43;if(y<3.9&&Math.abs(x)<5.75)continue;const m=box(.70+rand()*.07,.34+rand()*.07,.11+rand()*.08,stone,x,y,.015);m.rotation.z=(rand()-.5)*.035;}
 const hitTargets:THREE.Object3D[]=[];
 const doors=[{x:-4.35,section:'About me'},{x:-1.45,section:'Projects'},{x:1.45,section:'Skills'},{x:4.35,section:'Contact'}];
 doors.forEach(({x,section})=>{const group=new THREE.Group();group.position.x=x;scene.add(group);box(2.68,3.85,.15,darkRed,0,1.95,.04,group);
  for(let j=0;j<9;j++){const plank=box(2.43,.39,.09,red,0,.29+j*.405,.16,group);plank.rotation.z=(rand()-.5)*.008;}
  for(const xx of [-1.31,1.31])box(.17,4.03,.22,darkRed,xx,2,.2,group);
  for(const yy of [.12,3.93])box(2.78,.17,.22,darkRed,0,yy,.2,group);
  for(const yy of [1.05,2.9]){box(2.3,.055,.055,darkRed,0,yy,.24,group);for(const xx of [-1.06,1.06])mesh(new THREE.SphereGeometry(.027,7,6),iron,xx,yy,.28,group);}
  box(.06,.22,.06,iron,.88,1.85,.28,group);const ring=mesh(new THREE.TorusGeometry(.065,.014,8,16),iron,.88,1.74,.33,group);ring.rotation.x=.15;
  group.traverse(o=>{if(o instanceof THREE.Mesh){o.userData.section=section;hitTargets.push(o)}});
 });
 box(14.3,.6,.38,red,0,4.35,.19);box(14.5,.13,.65,darkRed,0,4.73,.25);box(12,.14,.8,stone,0,.015,.55);
 for(let j=0;j<2;j++)box(12.8,.12,1.1,paving,0,-.03-j*.12,.95+j*.65);
 // Black utility wires drape across the vermilion facade.
 const wire=(points:THREE.Vector3[])=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),50,.014,6,false),iron,0,0,0);
 wire([new THREE.Vector3(-5,5,.55),new THREE.Vector3(-3.9,3.7,.7),new THREE.Vector3(-1,3.5,.68),new THREE.Vector3(2.8,5.6,.42)]);
 wire([new THREE.Vector3(-5.1,5.1,.56),new THREE.Vector3(-3.6,3.85,.76),new THREE.Vector3(-.5,3.85,.69),new THREE.Vector3(3.2,5.7,.4)]);
 const flagColors=['#bb7966','#d7ceb3','#728c9b','#b8b578','#b77b69','#dcd5bc'];const flags:THREE.Mesh[]=[];
 for(let i=0;i<18;i++){const x=-6.8+i*.79,y=5.55-.26*Math.sin(i/17*Math.PI);const geometry=new THREE.PlaneGeometry(.68,.92,8,12);const p=geometry.attributes.position;for(let k=0;k<p.count;k++)p.setZ(k,Math.sin(p.getX(k)*10)*.04+Math.sin(p.getY(k)*5)*.035);geometry.computeVertexNormals();
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=192;const c=canvas.getContext('2d')!;c.fillStyle=flagColors[i%6];c.fillRect(0,0,128,192);c.strokeStyle='#524d384c';c.lineWidth=1;c.strokeRect(8,8,112,176);c.fillStyle='#514a3b66';for(let row=0;row<23;row++){for(let k=0;k<12;k++)c.fillRect(14+k*8,17+row*7,3+rand()*4,1+rand());}const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);const f=mesh(geometry,new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide,roughness:1,transparent:true,opacity:.87}),x,y,.65);flags.push(f);}
 wire([new THREE.Vector3(-7,6.05,.65),new THREE.Vector3(0,5.78,.65),new THREE.Vector3(7,6.05,.65)]);
 // A framed copy of the actual portrait grounds the modeled space in the reference.
 box(1.36,1.72,.1,darkRed,6.3,2.25,.17);const portrait=new THREE.TextureLoader().load('/zenith.jpg');portrait.colorSpace=THREE.SRGBColorSpace;textures.push(portrait);mesh(new THREE.PlaneGeometry(1.22,1.56),new THREE.MeshBasicMaterial({map:portrait}),6.3,2.25,.24);
 const anchors=doors.map(d=>({name:d.section,point:new THREE.Vector3(d.x,2.15,.5)}));
 const courtyard=scene.children.filter(o=>!(o instanceof THREE.Light));
 const sets=createSceneSets();Object.values(sets).forEach(g=>scene.add(g));
 const accentLight=new THREE.PointLight('#66ccdd',0,13,2);accentLight.position.set(3,3,3);scene.add(accentLight);
 const character=createAvatar();scene.add(character.avatar);
 let entrance=0;
 api.current.setSection=(next)=>{
 entrance=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1;
 renderer.domElement.setAttribute('aria-label',`Interactive 3D scene: ${next}. Drag to look around and use the controls to zoom.`);
 courtyard.forEach(o=>o.visible=next==='My world');Object.entries(sets).forEach(([name,g])=>g.visible=name===next);
 character.setSection(next);accentLight.intensity=next==='Projects'||next==='Skills'?12:0;scene.background=next==='Projects'||next==='Skills'?new THREE.Color('#e0e7e8'):null;
 sun.color.set(next==='Projects'||next==='Skills'?'#c8e8ff':'#fff0d0');
 camera.position.set(entrance?2:1.2,entrance?3.3:3.1,entrance?13:12);controls.target.set(0,2.25,0);controls.update();
 };
 const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(el);resize();let frame=0;const clock=new THREE.Clock();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;function animate(){frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);const t=clock.elapsedTime;if(entrance>0){entrance=Math.max(0,entrance-dt);camera.position.lerp(new THREE.Vector3(1.2,3.1,12),1-Math.exp(-dt*5));}controls.update();character.animate(t,camera,reduced);if(!reduced){flags.forEach((f,i)=>{f.rotation.y=Math.sin(t*2+i*.5)*.23;f.rotation.x=Math.sin(t*1.8+i)*.12});}for(const a of anchors){const p=a.point.clone().project(camera);const label=el.querySelector<HTMLButtonElement>(`[data-section="${a.name}"]`);if(label){label.style.left=`${(p.x*.5+.5)*100}%`;label.style.top=`${(-p.y*.5+.5)*100}%`;label.style.visibility=p.z>1?'hidden':'visible';}}renderer.render(scene,camera);}animate();
 const raycaster=new THREE.Raycaster();let startX=0,startY=0;const down=(e:PointerEvent)=>{entrance=0;startX=e.clientX;startY=e.clientY};const click=(e:PointerEvent)=>{if(Math.hypot(e.clientX-startX,e.clientY-startY)>6)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=raycaster.intersectObjects(hitTargets.filter(o=>o.parent?.visible&&o.visible))[0];if(hit)select.current(hit.object.userData.section)};renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',click);
 return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});character.dispose();textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();api.current=null};
 },[]);
 useEffect(()=>{api.current?.setSection?.(section)},[section]);
 useEffect(()=>{const a=api.current;if(a){a.camera.position.set(1.2/zoom,2.25+.85/zoom,12/zoom);a.controls.target.set(0,2.25,0);a.controls.update()}},[zoom,reset]);useEffect(()=>{if(api.current){api.current.sun.intensity=ambient?2:3.7;api.current.sun.color.set(ambient?'#ffc28a':section==='Projects'||section==='Skills'?'#c8e8ff':'#fff0d0')}},[ambient,section]);
 return <div className="webgl-world" ref={host}>{failed?<div className="webgl-fallback">WebGL is unavailable in this browser. Use the navigation above to explore my portfolio.</div>:section==='My world'&&['About me','Projects','Skills','Contact'].map((s,i)=><button key={s} data-section={s} className="landmark scene-label" onClick={()=>onSelect(s)}><span className="pin">{['⌂','▧','✧','↗'][i]}</span>{['About me','Project studio','My toolkit','Say hello'][i]}<b>↗</b></button>)}</div>
}
