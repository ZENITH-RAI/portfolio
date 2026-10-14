import * as THREE from 'three';

// A stylized interpretation of Zenith's cream-and-navy traditional outfit.
export default function createAvatar() {
  const avatar = new THREE.Group();
  avatar.position.set(-.25, .08, 2.1);
  const material = (color: string, roughness = .8) =>
    new THREE.MeshStandardMaterial({ color, roughness });
  const skin = material('#c28b62');
  const cream = material('#e7d6aa');
  const navy = material('#233445');
  const hair = material('#211d1b');
  const black = material('#242728');
  const white = material('#fff8e8');
  const gold = material('#c5a363', .4);
  function part(geometry: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = avatar) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function sphere(mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number, parent: THREE.Object3D = avatar) {
    const mesh = part(new THREE.SphereGeometry(1, 28, 20), mat, x, y, z, parent);
    mesh.scale.set(sx, sy, sz);
    return mesh;
  }
  for (const x of [-.24, .24]) {
    part(new THREE.CapsuleGeometry(.13, .5, 8, 16), navy, x, .48, 0);
    sphere(black, x, .12, .13, .19, .13, .32);
  }
  const robe = part(new THREE.CylinderGeometry(.45, .61, 1.65, 32), cream, 0, 1.7, 0);
  const wrap = part(new THREE.CylinderGeometry(.48, .6, .82, 32, 1, false, 0, Math.PI), navy, 0, 1.31, .015);
  part(new THREE.CylinderGeometry(.48, .48, .14, 32), navy, 0, 1.93, 0);
  const sash = part(new THREE.BoxGeometry(.23, 1.05, .07), navy, .17, 2.18, .43);
  sash.rotation.z = -.45;
  part(new THREE.CylinderGeometry(.15, .18, .3, 20), skin, 0, 2.61, 0);
  sphere(skin, 0, 3.13, .015, .48, .58, .4);
  for (const x of [-.47, .47]) sphere(skin, x, 3.1, 0, .09, .15, .09);
  sphere(hair, 0, 3.48, -.04, .49, .31, .38);
  for (let i = 0; i < 17; i++) {
    const angle = i * 2.399;
    const radius = .36 * Math.sqrt((i + 1) / 17);
    sphere(hair, Math.cos(angle) * radius, 3.57 + Math.sin(i * 1.7) * .06, .07 + Math.sin(angle) * radius * .7, .14, .14, .14);
  }
  for (const x of [-.17, .17]) {
    sphere(white, x, 3.17, .366, .105, .075, .035);
    sphere(hair, x + .009, 3.17, .397, .043, .051, .025);
    sphere(white, x + .022, 3.19, .418, .012, .014, .009);
    const brow = part(new THREE.CapsuleGeometry(.024, .16, 4, 8), hair, x, 3.32, .36);
    brow.rotation.z = Math.PI / 2 + (x < 0 ? -.12 : .12);
  }
  sphere(skin, 0, 3.04, .41, .07, .095, .08);
  const smile = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.14, 2.93, .37),
    new THREE.Vector3(0, 2.87, .413),
    new THREE.Vector3(.14, 2.93, .37),
  ]);
  part(new THREE.TubeGeometry(smile, 20, .019, 8, false), hair, 0, 0, 0);
  // Small beads follow the front of the robe's collar.
  for (let i = 0; i < 17; i++) {
    const a = i / 16 * Math.PI;
    sphere(gold, Math.cos(a) * .23, 2.51 - Math.sin(a) * .34, .42, .025, .029, .025);
  }
  const resting = part(new THREE.CapsuleGeometry(.17, .82, 8, 18), cream, -.52, 2.04, .02);
  resting.rotation.z = -.17;
  sphere(skin, -.62, 1.49, .08, .13, .18, .12);
  const waving = new THREE.Group();
  waving.position.set(.44, 2.4, 0);
  waving.rotation.z = -.65;
  avatar.add(waving);
  part(new THREE.CapsuleGeometry(.18, .67, 8, 18), cream, 0, .39, 0, waving);
  part(new THREE.CylinderGeometry(.185, .185, .16, 20), navy, 0, .86, 0, waving);
  sphere(skin, 0, 1.09, .015, .17, .22, .09, waving);
  for (let i = 0; i < 4; i++) {
    const finger = part(new THREE.CapsuleGeometry(.036, .17 + (i === 1 || i === 2 ? .04 : 0), 6, 10), skin, -.115 + i * .076, 1.31, .015, waving);
    finger.rotation.z = (.5 - i / 3) * .2;
  }
  const thumb = part(new THREE.CapsuleGeometry(.045, .14, 6, 10), skin, -.19, 1.08, .02, waving);
  thumb.rotation.z = -.65;

  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff9e9';
  ctx.beginPath(); ctx.roundRect(12, 12, 744, 192, 48); ctx.fill();
  ctx.beginPath(); ctx.moveTo(300, 201); ctx.lineTo(270, 244); ctx.lineTo(365, 201); ctx.fill();
  ctx.fillStyle = '#883d2e'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Hi, I’m Zenith!', 384, 104);
  ctx.fillStyle = '#7b7565'; ctx.font = '28px sans-serif';
  ctx.fillText('Welcome to my world.', 384, 157);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const greeting = part(new THREE.PlaneGeometry(3.3, 1.1), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }), .4, 4.35, .15);
  greeting.castShadow = false;
  const glasses = new THREE.Group(); avatar.add(glasses);
  for(const x of [-.17,.17]) part(new THREE.TorusGeometry(.125,.018,8,24),black,x,3.17,.42,glasses);
  part(new THREE.BoxGeometry(.1,.02,.025),black,0,3.18,.43,glasses);glasses.visible=false;
  const cap=part(new THREE.SphereGeometry(.5,24,12,0,Math.PI*2,0,Math.PI/2),navy,0,3.45,-.02);cap.visible=false;
  const brim=part(new THREE.BoxGeometry(.65,.05,.4),navy,0,3.46,.34);brim.visible=false;
  const trousers = [-.23,.23].map(x => part(new THREE.CapsuleGeometry(.18,.72,8,16),navy,x,1.12,0));
  trousers.forEach(p => p.visible=false);
  return {
    avatar,
    setSection(section:string) {
      const traditional=section==='My world'||section==='About me';
      const tech=section==='Projects'||section==='Skills';
      cream.color.set(traditional?'#e7d6aa':section==='Projects'?'#344960':section==='Skills'?'#b7d8cf':'#d89c7c');
      navy.color.set(traditional?'#233445':section==='Projects'?'#182336':section==='Skills'?'#355c57':'#6b5149');
      wrap.visible=sash.visible=traditional;glasses.visible=tech;cap.visible=brim.visible=section==='Contact';
      trousers.forEach(p => p.visible=!traditional);
      avatar.traverse(o=>{if(o instanceof THREE.Mesh&&o.material===gold)o.visible=traditional});
      robe.scale.y=traditional?1:.65;robe.position.y=traditional?1.7:2;
      ctx.clearRect(0,0,768,256);ctx.fillStyle='#fff9e9';ctx.beginPath();ctx.roundRect(12,12,744,192,48);ctx.fill();
      ctx.beginPath();ctx.moveTo(300,201);ctx.lineTo(270,244);ctx.lineTo(365,201);ctx.fill();
      ctx.fillStyle='#883d2e';ctx.font='bold 54px sans-serif';ctx.textAlign='center';
      ctx.fillText(section==='My world'?'Hi, I’m Zenith!':section==='About me'?'A little about me.':section==='Projects'?'Let’s build something.':section==='Skills'?'Inside my toolkit.':'Let’s connect!',384,104);
      ctx.fillStyle='#7b7565';ctx.font='28px sans-serif';ctx.fillText(traditional?'Rooted in Nepal. Always curious.':tech?'Turning curiosity into code.':'Good conversations start here.',384,157);texture.needsUpdate=true;
    },
    animate(time: number, camera: THREE.Camera, reduced: boolean) {
      greeting.quaternion.copy(camera.quaternion);
      if (!reduced) {
        waving.rotation.z = -.65 + Math.sin(time * 3.6) * .23;
        waving.rotation.x = Math.sin(time * 2.8) * .08;
        avatar.position.y = .08 + Math.sin(time * 1.7) * .018;
      }
    },
    dispose() { texture.dispose(); },
  };
}
