import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import symbols from './symbols.json';

export default function Symbol3D({color='#5587ff',kind='medical',theme='light',onCapture}){
 const host=useRef(null),engine=useRef(null),capture=useRef(onCapture),previousKind=useRef(kind);
 const [failed,setFailed]=useState(false),[paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 capture.current=onCapture;
 useEffect(()=>{
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});}catch{setFailed(true);return;}
  const el=host.current;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','A 3D help symbol floats automatically. Use Pause motion to stop the movement.');el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,1.6,10);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.035);scene.environment=env.texture;room.dispose();pmrem.dispose();
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5});key.shadow.normalBias=.03;scene.add(key,new THREE.HemisphereLight(0xffffff,0x6a7791,1.2));
  const edge=new THREE.DirectionalLight(0xc6dcff,3);edge.position.set(5,2,-2);scene.add(edge);
  const silver=new THREE.MeshPhysicalMaterial({color:'#a3adbc',metalness:1,roughness:.18,clearcoat:1});
  const glass=new THREE.MeshPhysicalMaterial({color,metalness:.16,roughness:.085,clearcoat:1,clearcoatRoughness:.07,transmission:.16,thickness:.7,ior:1.47,envMapIntensity:1.05});
  const rim=new THREE.MeshPhysicalMaterial({color,metalness:.65,roughness:.11,clearcoat:1,envMapIntensity:2});
  const ivory=new THREE.MeshPhysicalMaterial({color:'#f6f8ff',metalness:.18,roughness:.18,clearcoat:1});
  function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function mesh(shape,depth,bevel,mat,z){const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:6,steps:1,curveSegments:32});const m=new THREE.Mesh(geo,mat);m.position.z=z;m.castShadow=true;m.receiveShadow=true;return m;}
  const tilt=new THREE.Group();scene.add(tilt);tilt.rotation.set(.1,-.36,-.19);
  tilt.add(mesh(rounded(3.5,3.5,.62),.24,.12,silver,-.34));tilt.add(mesh(rounded(3.34,3.34,.56),.25,.115,rim,-.05));tilt.add(mesh(rounded(3.15,3.15,.5),.14,.11,glass,.19));
  const glyph=new THREE.Group();tilt.add(glyph);
  camera.lookAt(0,-.2,0);
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(engine.current)engine.current.dirty=true;};const ro=new ResizeObserver(resize);ro.observe(el);resize();
  engine.current={scene,camera,glass,rim,glyph,ivory,tilt,paused,visible:true,dirty:true,kind:null,renderer};let frame,last=performance.now(),elapsed=0,renderedAt=0,captured=false;
  const observer=new IntersectionObserver(([entry])=>{if(engine.current){engine.current.visible=entry.isIntersecting;engine.current.dirty=true;}});observer.observe(el);
  function animate(now=performance.now()){frame=requestAnimationFrame(animate);const e=engine.current;if(!e)return;const delta=Math.min(now-last,50)/1000;last=now;const moving=!e.paused&&e.visible&&!document.hidden;if(moving){elapsed+=delta;tilt.position.x=Math.sin(elapsed*.52)*.26;tilt.position.y=-.08+Math.sin(elapsed*.82)*.13;}if((moving&&now-renderedAt>=1000/30)||e.dirty){renderer.render(scene,camera);renderedAt=now;e.dirty=false;}if(!captured&&elapsed>.5){captured=true;capture.current?.(renderer.domElement.toDataURL('image/png'));}}
  animate();return()=>{cancelAnimationFrame(frame);ro.disconnect();observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();});[silver,glass,rim,ivory].forEach(m=>m.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();engine.current=null;};
 },[]);
 useEffect(()=>{const e=engine.current;if(!e)return;e.glass.color.set(color).multiplyScalar(.55);e.rim.color.set(color).multiplyScalar(.8);while(e.glyph.children.length){const child=e.glyph.children[0];child.geometry?.dispose();e.glyph.remove(child);}
  if(kind==='medical'){const s=new THREE.Shape();const a=.34,b=1.03;s.moveTo(-a,-b);s.lineTo(a,-b);s.lineTo(a,-a);s.lineTo(b,-a);s.lineTo(b,a);s.lineTo(a,a);s.lineTo(a,b);s.lineTo(-a,b);s.lineTo(-a,a);s.lineTo(-b,a);s.lineTo(-b,-a);s.lineTo(-a,-a);s.closePath();const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:5}),e.ivory);m.position.z=.48;m.castShadow=true;e.glyph.add(m);}
  else{const icon=kind==='unsafe'?'shield-check':kind==='fire'?'flame':kind==='lost'?'map-pin':'help-circle';const parsed=new SVGLoader().parse(symbols[icon]);const container=new THREE.Group();for(const path of parsed.paths){if(path.userData?.style?.fill==='none')continue;for(const shape of SVGLoader.createShapes(path)){const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:1.7,bevelEnabled:true,bevelSize:.3,bevelThickness:.3,bevelSegments:4}),e.ivory);m.castShadow=true;container.add(m);}}container.scale.set(.105,-.105,.105);container.position.set(-1.26,1.26,.48);e.glyph.add(container);}e.kind=kind;e.dirty=true;
 },[color,kind]);
 useEffect(()=>{if(previousKind.current===kind)return;previousKind.current=kind;if(matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).has('export'))return;const canvas=host.current?.querySelector('canvas');const animation=canvas?.animate([{opacity:.4,transform:'translateY(7px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:240,easing:'cubic-bezier(.2,.7,.2,1)'});return()=>animation?.cancel();},[kind]);
 useEffect(()=>{if(engine.current){engine.current.paused=paused;engine.current.dirty=true;}},[paused]);
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)');const update=e=>setPaused(e.matches);preference.addEventListener('change',update);return()=>preference.removeEventListener('change',update);},[]);
 return <div className="symbol-view"><div className="symbol-stage" ref={host} data-testid="symbol-stage">{failed&&<div className="symbol-fallback">Your help type is selected below.</div>}</div><div className="model-controls"><button aria-label={paused?'Resume symbol motion':'Pause symbol motion'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Resume motion':'Pause motion'}</button></div></div>;
}
