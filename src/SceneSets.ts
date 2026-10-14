import * as THREE from 'three';
export default function createSceneSets(){
 const sets:Record<string,THREE.Group>={};
 for(const section of ['About me','Projects','Skills','Contact']){
 const group=new THREE.Group();sets[section]=group;group.visible=false;
 const mat=(color:string,glow=false)=>new THREE.MeshStandardMaterial({color,roughness:.7,emissive:glow?color:'#000000',emissiveIntensity:glow?.7:0});
 const wood=mat('#88664c'),dark=mat('#202d3e'),cream=mat('#e3d4b9'),green=mat('#548164'),cyan=mat('#55c9d1',true);
 const box=(w:number,h:number,d:number,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o};
 const orb=(r:number,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),m);o.position.set(x,y,z);o.castShadow=true;group.add(o);return o};
 const isTech=section==='Projects'||section==='Skills';
 box(18,.2,12,isTech?dark:wood,0,-.18,3);box(18,7,.2,isTech?mat('#182637'):cream,0,3.4,-.5);
 if(section==='About me'){
  box(5,.16,1.4,wood,-3,1.25,.6);for(const x of [-5,-1])box(.14,2.5,1.3,wood,x,1.2,.6);
  const colors=['#a96651','#d5b574','#587989','#68816c'];for(let i=0;i<18;i++)box(.16+(i%3)*.05,.55+(i%4)*.08,.5,mat(colors[i%4]),-4.8+i*.21,1.65,.6);
  box(3.6,.14,1.2,wood,-3,2.9,.6);for(let i=0;i<7;i++)box(.27,.62,.45,mat(colors[i%4]),-4+i*.4,3.28,.6);
  box(2.7,.85,1.35,mat('#aa715c'),3.6,.6,1);box(2.7,.9,.3,mat('#bd8c72'),3.6,1.3,.5);
  for(const x of [2.5,4.7])box(.35,.55,1.5,mat('#aa715c'),x,1,1);
  box(1,.12,1,wood,3.5,.65,2.9);box(.12,.6,.12,wood,3.5,.3,2.9);
  orb(.35,green,5.9,1.35,.6);orb(.4,green,5.6,1.7,.6);box(.45,.7,.45,cream,5.8,.35,.6);
 }else if(section==='Projects'){
  box(5,.16,1.8,wood,-3,1.4,1);for(const x of [-5,-1])box(.12,1.4,1.5,dark,x,.65,1);
  for(const x of [-4.1,-2]){box(1.7,1.15,.13,dark,x,2.3,.6);box(1.5,.95,.02,cyan,x,2.3,.68);box(.12,.45,.12,dark,x,1.65,.6);for(let i=0;i<5;i++)box(.7+(i%2)*.35,.035,.025,mat('#b8f5de',true),x-.15,2.6-i*.13,.70);}
  box(1.7,.06,.55,dark,-3,1.53,1.45);
  for(let i=0;i<2;i++){box(1.3,3.9,.8,dark,3.5+i*1.5,1.95,.1);for(let j=0;j<9;j++){box(1.1,.25,.1,mat('#34495c'),3.5+i*1.5,.3+j*.4,.55);orb(.035,cyan,3.1+i*1.5,.3+j*.4,.62);}}
 }else if(section==='Skills'){
  for(let i=0;i<5;i++){const x=-5+i*2.5;const h=1+(i%3)*.55;box(1,h,1,dark,x,h/2,.5);const ring=new THREE.Mesh(new THREE.TorusGeometry(.52,.055,10,40),cyan);ring.position.set(x,h+.8,.6);group.add(ring);const core=orb(.22,mat(['#eeaa68','#62ceba','#83a5ef','#d48fe3','#e7d47a'][i],true),x,h+.8,.6);core.name='floating';}
  for(let i=0;i<18;i++)box(.035,4,.04,mat('#2b4558'),-8+i,2,-.32);
 }else{
  box(4,.18,1.8,wood,3.7,1.1,1);for(const x of [2.1,5.3])box(.12,1.1,1.5,wood,x,.5,1);
  box(1.3,.8,.08,dark,3.5,1.65,1);box(1.3,.06,.8,dark,3.5,1.24,1.4);
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(.13,.1,.25,20),cream);cup.position.set(4.7,1.32,1.5);group.add(cup);
  box(3,3.2,.1,wood,-4,2.8,-.28);box(2.7,2.9,.1,mat('#c1d9d2',true),-4,2.8,-.2);box(.1,2.9,.12,cream,-4,2.8,-.1);box(2.7,.1,.12,cream,-4,2.8,-.1);
  for(let i=0;i<6;i++)orb(.27,green,-6+(i%2)*.4,1+i*.2,.6);box(.6,.7,.6,cream,-5.8,.35,.6);
 }
 }
 return sets;
}
