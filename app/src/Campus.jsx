import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import data from './campus-data.json';

export default function Campus({ theme, selected, floor = 0, expanded = false, onSelect, compact = false }) {
  const host = useRef(null), engine = useRef(null), callback = useRef(onSelect), compass = useRef(null);
  const [flat, setFlat] = useState(false), [failed, setFailed] = useState(false);
  callback.current = onSelect;
  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); }
    catch { setFailed(true); return; }
    const el = host.current;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.domElement.setAttribute('aria-label', 'Interactive approximate DPS-MIS campus model. Select locations with the buttons below.');
    el.prepend(renderer.domElement);
    const dark = theme === 'dark';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 1, 500);
    const home = new THREE.Vector3(108, 118, 132);
    camera.position.copy(home);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, -2);
    controls.enableDamping = true;
    controls.dampingFactor = .08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = .12;
    controls.maxPolarAngle = Math.PI / 2.5;
    const hemi = new THREE.HemisphereLight(0xf8fbff, dark ? 0x66635a : 0xb5aa96, 2); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4df, 3);
    sun.position.set(-50, 90, -40); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 1, far: 260 });
    sun.shadow.normalBias = .3; sun.shadow.bias = -.00015;
    sun.shadow.radius = 4; scene.add(sun);
    const fill = new THREE.DirectionalLight(0xd9eaff, 1.1); fill.position.set(60, 40, 60); scene.add(fill);
    const kit = new THREE.Group(); scene.add(kit);
    const mats = {};
    function material(color) { return mats[color] ||= new THREE.MeshStandardMaterial({ color, roughness: .78 }); }
    function box(x, y, z, w, h, d, color, group = kit, place) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color));
      m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true;
      if (place) m.userData.place = place;
      m.userData.baseMaterial=m.material;
      group.add(m); return m;
    }
    function slab(x, y, z, w, d, h, color, r = 2, group = kit) {
      const s = new THREE.Shape(), a = -w/2, b = -d/2;
      s.moveTo(a+r,b); s.lineTo(a+w-r,b); s.quadraticCurveTo(a+w,b,a+w,b+r); s.lineTo(a+w,b+d-r); s.quadraticCurveTo(a+w,b+d,a+w-r,b+d); s.lineTo(a+r,b+d); s.quadraticCurveTo(a,b+d,a,b+d-r); s.lineTo(a,b+r); s.quadraticCurveTo(a,b,a+r,b);
      const g = new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:12});
      g.rotateX(-Math.PI/2);
      const m = new THREE.Mesh(g, material(color)); m.position.set(x,y,z); m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), new THREE.ShadowMaterial({opacity:dark?.24:.13})); ground.rotation.x=-Math.PI/2;ground.position.y=-2.5;ground.receiveShadow=true;scene.add(ground);
    slab(0,-1.8,-4,87,113,1.8,dark?'#b5b6a7':'#dadbd0',3);
    slab(0,.04,-4,81,107,.35,'#e7e1d2',2);
    // Public street edges are schematic; no navigation or evacuation route is inferred.
    box(-40,.5,-4,2,.15,105,'#a7aaa4');box(40,.5,-4,2,.15,105,'#a7aaa4');box(0,.5,-56,80,.15,2,'#a7aaa4');box(0,.5,48,80,.15,2,'#a7aaa4');
    box(-30,.55,-40,17,.12,25,'#cfcdc2');
    for (let i=0;i<6;i++) box(-36+i*2.3,.7,-47,1.3,.35,3.3,'#fbfaf0');
    const floors = [], roofs = [];
    for (const place of data.places.filter(p=>p.kind==='building')) {
      for(let f=0;f<place.floors;f++) {
        const group=new THREE.Group();group.position.y=f*3.5+.8;group.userData={place:place.id,floor:f};kit.add(group);floors.push(group);
        for(const [x,z,w,d] of place.parts) {
          box(x,0,z,w,3.05,d,'#e9e3d5',group,place.id);
          box(x,3.05,z,w+.5,.32,d+.5,'#f9f7ee',group,place.id);
          // Window ribbons and vertical reveals make the massing readable at campus scale.
          for(let v=x-w/2+1;v<x+w/2-1;v+=2.15) {
            box(v,.95,z+d/2+.04,.88,1.3,.08,'#697c7b',group,place.id);
            box(v,.95,z-d/2-.04,.88,1.3,.08,'#697c7b',group,place.id);
          }
          for(let v=z-d/2+1;v<z+d/2-1;v+=2.8) {
            box(x+w/2+.04,.95,v,.08,1.3,1.05,'#697c7b',group,place.id);
            box(x-w/2-.04,.95,v,.08,1.3,1.05,'#697c7b',group,place.id);
          }
          const border=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w+.5,.32,d+.5)),new THREE.LineBasicMaterial({color:'#b8b6a8',transparent:true,opacity:.5}));border.position.set(x,3.2,z);group.add(border);
        }
      }
      const rg=new THREE.Group();rg.position.y=place.floors*3.5+.8;kit.add(rg);roofs.push({group:rg,place});
      for(const [x,z,w,d]of place.parts){
        box(x,0,z,w,.3,d,'#d7d3c5',rg,place.id);
        box(x-w/2,.3,z,.3,.65,d,'#f4f0e6',rg,place.id);box(x+w/2,.3,z,.3,.65,d,'#f4f0e6',rg,place.id);box(x,.3,z-d/2,w,.65,.3,'#f4f0e6',rg,place.id);box(x,.3,z+d/2,w,.65,.3,'#f4f0e6',rg,place.id);
        if(w>10&&d>10)for(let n=0;n<3;n++)box(x-3+n*3,.4,z,1.7,.8,2,'#b9b9ac',rg,place.id);
      }
    }
    // The north-west area is a playground, as corrected by the participant.
    box(-8,.68,-41,13,.16,19,'#c1a98b',kit,'north');
    box(-8,.86,-41,11,.04,17,'#b8c2a3',kit,'north');
    // Open passage between A and C; schematic access to the two small courts.
    box(-19,.59,-14.25,36,.06,2.7,'#f3eddf');
    box(-37,.59,4,1.6,.06,38,'#f3eddf');
    // South-east playing field and track, visible in the satellite reference.
    slab(18,.6,17,27,44,.15,'#bd8a72',5);
    slab(18,.8,17,23.5,40,.12,'#738b76',4);
    for(let i=0;i<8;i++)box(18,.95,1+i*4.4,20,.025,2.2,i%2?'#819984':'#79927c');
    box(18,1.02,17,20,.035,.12,'#e3e7d4');
    for(const z of [-1.5,35.5])box(18,1.02,z,20,.035,.14,'#e3e7d4');
    for(const x of [8,28])box(x,1.02,17,.14,.035,37,'#e3e7d4');
    const ring=new THREE.Mesh(new THREE.RingGeometry(3.4,3.52,64),material('#e3e7d4'));ring.rotation.x=-Math.PI/2;ring.position.set(18,1.04,17);kit.add(ring);
    for(let i=0;i<6;i++){box(5.5,1.1,2+i*5,1.6,.5,3,'#eee9d9');}
    // Two small western courts: volleyball and basketball.
    box(-31,.7,16,10,.2,37,'#be8e7c');
    for(let i=0;i<2;i++){
      const z=6+i*19;box(-31,.95,z,7.8,.06,15.5,i?'#66829a':'#7c8c8d');
      for(const x of[-34.4,-27.6])box(x,1.04,z,.1,.02,13.5,'#eef0e2');
      for(const zz of[z-6.7,z,z+6.7])box(-31,1.04,zz,6.9,.02,.1,'#eef0e2');
    }
    // Stylised planting marks visible landscaped edges; exact tree locations are not surveyed.
    const foliage=material('#70907d');
    for(let i=0;i<9;i++){
      const x=-25+i*6.6,z=-52;box(x,.65,z,.3,1.7,.3,'#ae9d83');
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.55,1),foliage);crown.scale.y=1.25;crown.position.set(x,3.3,z);crown.castShadow=true;kit.add(crown);
    }

    // Exterior auditorium projects in front of C Block's ground-facing facade.
    // Its mass obscures part of that facade from the sports ground, per participant feedback.
    box(-10,.8,-11,20,6.2,8,'#d4caba',kit,'stage');
    box(-10,7,-11,21,.35,8.8,'#c7c1b3',kit,'stage');
    box(-10,1.35,-6.95,15,4.4,.12,'#697c7b',kit,'stage');
    box(-10,.85,-5.8,21,.35,2,'#e3ded0',kit,'stage');
    // Canteen at the ground-facing C Block corner, beside the nearest stadium edge.
    box(3.4,.8,-9.3,5.2,3.3,5,'#e5d3b8',kit,'canteen');
    box(3.4,4.1,-9.3,5.7,.3,5.5,'#d3b194',kit,'canteen');
    box(3.4,1.7,-6.75,3.3,1,.12,'#698b88',kit,'canteen');
    const pin=new THREE.Group();kit.add(pin);
    const pinStem=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,5,12),material('#f3542b'));pinStem.position.y=2.5;pin.add(pinStem);
    const pinHead=new THREE.Mesh(new THREE.SphereGeometry(1.5,28,28),material('#f3542b'));pinHead.position.y=6;pinHead.castShadow=true;pin.add(pinHead);
    const halo=new THREE.Mesh(new THREE.RingGeometry(2.8,3.1,64),new THREE.MeshBasicMaterial({color:'#f3542b',side:THREE.DoubleSide,transparent:true,opacity:.6}));halo.rotation.x=-Math.PI/2;halo.position.y=.05;pin.add(halo);pin.visible=false;
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let start;
    function down(e){start=[e.clientX,e.clientY]}
    function up(e){if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>7)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(kit.children,true).find(h=>h.object.userData.place);if(hit)callback.current?.(hit.object.userData.place);}
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const state={hemi,ground,camera,controls,home,floors,roofs,pin,selected:null,floor:0,expanded:false};engine.current=state;
    let frame;const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animate(){frame=requestAnimationFrame(animate);controls.update();for(const g of floors){const lift=state.expanded&&g.userData.place===state.selected?g.userData.floor*5.8:0;const target=g.userData.floor*3.5+.8+lift;g.position.y=reduce?target:THREE.MathUtils.lerp(g.position.y,target,.12);for(const m of g.children){if(m.isMesh){const chosen=g.userData.place===state.selected&&g.userData.floor===state.floor;m.material=chosen&&m.geometry.parameters.height===.32?material('#f7784e'):m.userData.baseMaterial;}}}for(const r of roofs)r.group.visible=!(state.expanded&&r.place.id===state.selected);if(compass.current){const n=new THREE.Vector3(0,0,-30).project(camera),c=new THREE.Vector3(0,0,0).project(camera);compass.current.style.transform=`rotate(${Math.atan2(-(n.y-c.y),n.x-c.x)*180/Math.PI+90}deg)`;}renderer.render(scene,camera);}
    animate();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();});for(const m of Object.values(mats))m.dispose();renderer.domElement.remove();engine.current=null;};
  },[]);
  useEffect(()=>{const e=engine.current;if(e){e.hemi.groundColor.set(theme==='dark'?0x66635a:0xb5aa96);e.ground.material.opacity=theme==='dark'?.24:.13;}},[theme]);
  useEffect(()=>{const e=engine.current;if(!e)return;e.selected=selected;e.floor=floor;e.expanded=expanded;const p=data.places.find(x=>x.id===selected);e.pin.visible=!!p;if(p)e.pin.position.set(p.x,p.kind==='building'?(floor+1)*3.5+(expanded?floor*5.8:0)+1:1.3,p.z);},[selected,floor,expanded,theme]);
  const turn=(v)=>{const e=engine.current;if(!e)return;const offset=e.camera.position.clone().sub(e.controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),v);e.camera.position.copy(e.controls.target).add(offset);e.controls.update();};
  const reset=()=>{const e=engine.current;if(e){e.camera.position.copy(e.home);e.controls.target.set(0,0,-2);e.controls.update();setFlat(false)}};
  const plan=()=>{const e=engine.current;if(!e)return;if(flat)reset();else{e.camera.position.set(0,185,.1);e.controls.update();setFlat(true)}};
  return <div className={'campus-stage '+(compact?'compact':'')}>
    <div className="map-graticule" aria-hidden="true"/>
    <div ref={host} className="three-host" data-testid="campus-model"/>
    {failed&&<div className="model-fallback">3D is unavailable on this device.<br/>Choose a location using the list.</div>}
    <div className="map-top"><span className="tiny-cap">DPS–MIS / CAMPUS</span><span className="model-tag">ILLUSTRATIVE MODEL</span></div>
    <div className="map-compass" aria-label="Approximate north direction">N <span ref={compass}>↑</span></div>
    {!compact&&<div className="map-note"><span className="status-dot"/> Approximate campus layout<br/><small>Exterior model · Locations selected manually</small></div>}
    <div className="map-tools"><button onClick={()=>turn(-Math.PI/6)} aria-label="Rotate campus left">↶</button><button onClick={()=>turn(Math.PI/6)} aria-label="Rotate campus right">↷</button><button onClick={plan} aria-pressed={flat}>{flat?'3D':'Plan'}</button><button onClick={reset} aria-label="Reset campus view">⌖</button></div>
    <span className="drag-hint">DRAG TO EXPLORE · TAP A BUILDING</span>
  </div>;
}
