'use client';
import {useEffect,useRef,useState} from 'react';
import {magneticWorld,magneticStep,rigidWorld,rigidStep,rotateVector,rigidMomentum,rigidEnergy} from '@/lib/uncommon-physics.mjs';
import WorkConnection from './WorkConnection';

type Kind='magnet'|'tumble';
const names={magnet:'Magnetic beam sculptor',tumble:'Intermediate-axis rigid body'};
export default function UncommonPhysics({kind}:{kind:Kind}) {
 const canvas=useRef<HTMLCanvasElement>(null),api=useRef<(action:string,value?:number)=>void>(()=>{}),pauseRef=useRef(false);
 const [paused,setPaused]=useState(false),[readout,setReadout]=useState(''),[event,setEvent]=useState('');
 const [strength,setStrength]=useState(3.8),[fieldX,setFieldX]=useState(0),[fieldY,setFieldY]=useState(0),[axis,setAxis]=useState(1),[speed,setSpeed]=useState(4.8);
 const toggle=()=>{pauseRef.current=!pauseRef.current;setPaused(pauseRef.current);api.current('pause');};
 useEffect(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  let magnetic=magneticWorld(),rigid=rigidWorld(),spinAxis=1,spinSpeed=4.8;
  let width=1,height=1,scale=1,visible=false,raf=0,last=0,acc=0,sample=0,report=0,disposed=false;
  let pointer:{x:number;y:number;sx:number;sy:number;id:number}|null=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');pauseRef.current=media.matches;setPaused(media.matches);
  function step(){if(kind==='magnet')magneticStep(magnetic);else{rigidStep(rigid);if(++sample%3===0){rigid.trail.push(rotateVector(rigid.state.slice(3),[1.4,.65,0]));if(rigid.trail.length>300)rigid.trail.shift();}}}
  for(let i=0;i<(kind==='magnet'?600:650);i++)step();
  function sync(){const time=kind==='magnet'?magnetic.time:rigid.time;el!.dataset.time=time.toFixed(3);
   if(kind==='magnet'){el!.dataset.fieldX=magnetic.field.x.toFixed(3);el!.dataset.fieldY=magnetic.field.y.toFixed(3);el!.dataset.field=magnetic.field.strength.toFixed(1);setReadout(`${magnetic.particles.length} PARTICLES / B ${magnetic.field.strength.toFixed(1)}`);}
   else{el!.dataset.axis=String(spinAxis);el!.dataset.flips=String(rigid.flips);setReadout(`${rigid.flips} FLIPS / ENERGY ${rigidEnergy(rigid.state).toFixed(2)}`);}
  }
  function backdrop(){ctx!.fillStyle='#080b17';ctx!.fillRect(0,0,width,height);for(let i=0;i<65;i++){ctx!.fillStyle=i%4===0?'#b38ce26b':'#86a9df38';ctx!.beginPath();ctx!.arc((i*139.51+11)%width,(i*271.17+31)%height,.7,0,Math.PI*2);ctx!.fill();}}
  function drawMagnetic(){const cx=width/2,cy=height/2,field=magnetic.field,fx=cx+field.x*scale,fy=cy+field.y*scale;
   const glow=ctx!.createRadialGradient(fx,fy,0,fx,fy,field.radius*scale*1.8);glow.addColorStop(0,'#763bb845');glow.addColorStop(1,'#763bb800');ctx!.fillStyle=glow;ctx!.fillRect(0,0,width,height);
   for(let ring=1;ring<=4;ring++){ctx!.strokeStyle=ring===2?'#b8a4ff66':'#b8a4ff20';ctx!.lineWidth=1;ctx!.beginPath();ctx!.arc(fx,fy,field.radius*scale*ring/2,0,Math.PI*2);ctx!.stroke();}
   ctx!.font='15px monospace';ctx!.fillStyle='#b8a4ff90';ctx!.textAlign='center';for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)ctx!.fillText(field.strength>=0?'×':'·',fx+x*scale*.28,fy+y*scale*.28+5);ctx!.textAlign='left';
   magnetic.particles.forEach(p=>{if(p.age<0)return;const color=p.charge>0?'#77f0ef':p.charge<0?'#ff86db':'#b8a4ff';ctx!.strokeStyle=color;ctx!.lineWidth=p.charge===0?.7:1.15;ctx!.globalAlpha=p.charge===0?.2:.56;ctx!.beginPath();p.trail.forEach((v,i)=>{const x=cx+v[0]*scale,y=cy+v[1]*scale;if(i===0)ctx!.moveTo(x,y);else ctx!.lineTo(x,y);});ctx!.stroke();ctx!.globalAlpha=1;ctx!.fillStyle=color;ctx!.beginPath();ctx!.arc(cx+p.x*scale,cy+p.y*scale,p.charge===0?1.2:2.2,0,Math.PI*2);ctx!.fill();});
   ctx!.strokeStyle='#d5ff43';ctx!.lineWidth=2;ctx!.beginPath();ctx!.moveTo(cx-2.05*scale,cy-.7*scale);ctx!.lineTo(cx-2.05*scale,cy+.7*scale);ctx!.stroke();ctx!.fillStyle='#d5ff43';ctx!.font='12px monospace';ctx!.fillText('BEAM',Math.max(12,cx-2.15*scale),cy+.9*scale);
   ctx!.strokeStyle='#f4f1ff';ctx!.lineWidth=1;ctx!.beginPath();ctx!.arc(fx,fy,9,0,Math.PI*2);ctx!.stroke();ctx!.fillStyle='#f4f1ff';ctx!.font='12px monospace';ctx!.fillText('DRAG FIELD',Math.max(10,Math.min(width-95,fx+15)),fy-14);
  }
  function project(v:number[]){const x=.825*v[0]+.565*v[2],z=-.565*v[0]+.825*v[2],y=.9*v[1]-.435*z,depth=.435*v[1]+.9*z,k=5.5/(5.5-depth);return [width/2+x*scale*k,height*.48+y*scale*k,depth];}
  function drawRigid(){const q=rigid.state.slice(3),world=(v:number[])=>project(rotateVector(q,v));
   ctx!.strokeStyle='#b8a4ff22';ctx!.lineWidth=1;for(let r=1;r<=3;r++){ctx!.beginPath();ctx!.ellipse(width/2,height*.48,r*scale*.58,r*scale*.2,-.24,0,Math.PI*2);ctx!.stroke();}
   ctx!.strokeStyle='#ff86db75';ctx!.lineWidth=1.2;ctx!.beginPath();rigid.trail.forEach((p,i)=>{const v=project(p);if(i===0)ctx!.moveTo(v[0],v[1]);else ctx!.lineTo(v[0],v[1]);});ctx!.stroke();
   const corners=[[-1.4,-.65,-.18],[1.4,-.65,-.18],[1.4,.65,-.18],[-1.4,.65,-.18],[-1.4,-.65,.18],[1.4,-.65,.18],[1.4,.65,.18],[-1.4,.65,.18]].map(world);
   const faces=[{ids:[0,1,2,3],fill:'#45203c',line:'#ff86db'},{ids:[4,5,6,7],fill:'#123842',line:'#77f0ef'},{ids:[0,4,7,3],fill:'#171c35',line:'#b8a4ff'},{ids:[1,5,6,2],fill:'#171c35',line:'#b8a4ff'},{ids:[0,1,5,4],fill:'#333343',line:'#a7aac7'},{ids:[3,2,6,7],fill:'#333343',line:'#a7aac7'}];
   faces.sort((a,b)=>a.ids.reduce((s,i)=>s+corners[i][2],0)-b.ids.reduce((s,i)=>s+corners[i][2],0));
   faces.forEach(face=>{ctx!.beginPath();face.ids.forEach((id,i)=>{if(i===0)ctx!.moveTo(corners[id][0],corners[id][1]);else ctx!.lineTo(corners[id][0],corners[id][1]);});ctx!.closePath();ctx!.fillStyle=face.fill;ctx!.fill();ctx!.strokeStyle=face.line;ctx!.lineWidth=1.5;ctx!.stroke();});
   const normal=rotateVector(q,[0,0,1]),front=.435*normal[1]+.9*(-.565*normal[0]+.825*normal[2])>0,z=front?.185:-.185;ctx!.strokeStyle=front?'#77f0ef88':'#ff86db88';ctx!.lineWidth=1;
   for(let i=-3;i<=3;i++){const a=world([i*.33,-.48,z]),b=world([i*.33,.48,z]);ctx!.beginPath();ctx!.moveTo(a[0],a[1]);ctx!.lineTo(b[0],b[1]);ctx!.stroke();}
   const center=project([0,0,0]),l=rigidMomentum(rigid.state),length=Math.hypot(...l),tip=project(l.map(v=>v/length*2));ctx!.strokeStyle='#d5ff43';ctx!.lineWidth=2;ctx!.beginPath();ctx!.moveTo(center[0],center[1]);ctx!.lineTo(tip[0],tip[1]);ctx!.stroke();ctx!.fillStyle='#d5ff43';ctx!.beginPath();ctx!.arc(tip[0],tip[1],4,0,Math.PI*2);ctx!.fill();ctx!.font='12px monospace';ctx!.fillText('ANGULAR MOMENTUM',Math.max(12,Math.min(width-150,tip[0]+12)),tip[1]-12);
   if(pointer){ctx!.setLineDash([5,5]);ctx!.strokeStyle='#ff86db';ctx!.beginPath();ctx!.moveTo(pointer.sx*width,pointer.sy*height);ctx!.lineTo(pointer.x*width,pointer.y*height);ctx!.stroke();ctx!.setLineDash([]);}
  }
  function draw(){if(disposed)return;backdrop();if(kind==='magnet')drawMagnetic();else drawRigid();}
  function resize(){const r=el!.getBoundingClientRect();width=r.width;height=r.height;scale=kind==='magnet'?Math.min(width/4.7,height/2.9):Math.min(width/4.5,height/3.8);const dpr=Math.min(devicePixelRatio||1,1.5);el!.width=Math.round(width*dpr);el!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw();}
  function animate(now:number){raf=0;if(disposed||!visible||document.hidden||pauseRef.current)return;acc+=last?Math.min(.04,(now-last)/1000):0;last=now;const dt=kind==='magnet'?.008:.004;let steps=0;while(acc>=dt&&steps++<12){step();acc-=dt;}draw();if(now-report>220){sync();report=now;}raf=requestAnimationFrame(animate);}
  function start(){if(!raf&&visible&&!document.hidden&&!pauseRef.current){last=0;acc=0;raf=requestAnimationFrame(animate);}}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  function visibility(){if(document.hidden)stop();else start();}
  function changeMotion(){pauseRef.current=media.matches;setPaused(media.matches);if(media.matches)stop();else start();}
  function previewMagnet(){if(!pauseRef.current)return;const field={...magnetic.field};magnetic=magneticWorld();magnetic.field=field;for(let i=0;i<600;i++)magneticStep(magnetic);}
  function moveField(x:number,y:number){magnetic.field.x=Math.max(-1.75,Math.min(1.75,(x*width-width/2)/scale));magnetic.field.y=Math.max(-1.1,Math.min(1.1,(y*height-height/2)/scale));setFieldX(Math.round(magnetic.field.x*100));setFieldY(Math.round(magnetic.field.y*100));}
  const position=(e:PointerEvent)=>{const r=el!.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
  const down=(e:PointerEvent)=>{if(e.button!==0)return;const p=position(e);pointer={...p,sx:p.x,sy:p.y,id:e.pointerId};el!.setPointerCapture(e.pointerId);if(kind==='magnet')moveField(p.x,p.y);draw();};
  const move=(e:PointerEvent)=>{if(!pointer||pointer.id!==e.pointerId)return;const p=position(e);pointer.x=p.x;pointer.y=p.y;if(kind==='magnet')moveField(p.x,p.y);draw();};
  function kick(x=.35,y=.1){rigid.state[0]+=Math.max(-1.4,Math.min(1.4,x));rigid.state[2]+=Math.max(-1.4,Math.min(1.4,y));setEvent('You changed its rotation. I explore what numerical models do next.');}
  const up=(e:PointerEvent)=>{if(!pointer||pointer.id!==e.pointerId)return;
   if(kind==='magnet'){previewMagnet();setEvent('You bent the path without changing the particle speed.');}
   else{const dx=pointer.x-pointer.sx,dy=pointer.y-pointer.sy;kick(Math.abs(dx)+Math.abs(dy)<.02?.35:dx*4,dy*4);}
   pointer=null;sync();draw();if(el!.hasPointerCapture(e.pointerId))el!.releasePointerCapture(e.pointerId);
  };
  const cancel=()=>{pointer=null;draw();};
  api.current=(action,value)=>{
   if(action==='pause'){if(pauseRef.current)stop();else start();}
   if(action==='step'){for(let i=0;i<48;i++)step();setEvent(kind==='magnet'?'You stepped the solver. My DPDL work explores model-to-solver workflows.':'You stepped the equations. My C++ work explores numerical motion.');}
   if(action==='field'){magnetic.field.strength=value!;previewMagnet();setEvent('You changed a model parameter. DPDL starts with physical descriptions.');}
   if(action==='x'||action==='y'){magnetic.field[action]=value!/100;previewMagnet();setEvent('You moved an invisible field and made its effect visible.');}
   if(action==='axis'){spinAxis=value!;rigid=rigidWorld(spinAxis,spinSpeed);setEvent(spinAxis===1?'The middle axis flips. Unexpected behaviour is worth inspecting.':'A different axis gives stable rotation. I like testing the assumptions.');}
   if(action==='speed'){spinSpeed=value!;rigid=rigidWorld(spinAxis,spinSpeed);setEvent('You changed the release. The model follows its equations.');}
   if(action==='kick')kick();
   if(action==='reset'){magnetic=magneticWorld();rigid=rigidWorld(spinAxis,spinSpeed);for(let i=0;i<(kind==='magnet'?600:650);i++)step();setStrength(3.8);setFieldX(0);setFieldY(0);setEvent('A fresh experiment. The project behind this curiosity is below.');}
   sync();draw();
  };
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});observer.observe(el);const resizer=new ResizeObserver(resize);resizer.observe(el);document.addEventListener('visibilitychange',visibility);media.addEventListener('change',changeMotion);resize();sync();
  return()=>{disposed=true;stop();api.current=()=>{};observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',changeMotion);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);};
 },[kind]);
 return <><div className={`physics-stage physics-${kind}`}><div className="experiment-toolbar"><span><i/>{kind==='magnet'?'LORENTZ FIELD':'TORQUE-FREE ROTATION'}</span>{kind==='tumble'&&<label className="spin-axis-label"><span className="sr-only">Spin axis</span><select aria-label="Spin axis" value={axis} onChange={e=>{setAxis(+e.target.value);api.current('axis',+e.target.value);}}><option value="0">Long axis</option><option value="1">Middle axis</option><option value="2">Short axis</option></select></label>}<button onClick={toggle} aria-label={`${paused?'Resume':'Pause'} ${names[kind]}`}>{paused?'Resume ↗':'Pause Ⅱ'}</button></div>
  <canvas ref={canvas} tabIndex={0} role="img" aria-label={names[kind]} aria-describedby={`${kind}-hint`} onKeyDown={e=>{if(e.key===' '){e.preventDefault();toggle();}if(e.key==='Enter'){e.preventDefault();api.current(kind==='magnet'?'step':'kick');}if(e.key.toLowerCase()==='r')api.current('reset');}}>{kind==='magnet'?'Opposite charges bend in opposite directions through a movable magnetic field.':'A rectangular rigid body flips about its intermediate principal axis.'}</canvas>
  <div className="experiment-caption"><p id={`${kind}-hint`}>{kind==='magnet'?'Drag the field. Opposite charges take different paths.':'Flick the body. Try its middle axis. Compare the other two.'}</p><output aria-label={`${kind} experiment readout`}>{readout}</output></div>
  <details className="experiment-controls"><summary>Controls & keyboard <span>+</span></summary><div className="experiment-control-grid"><p>Space pauses · Enter {kind==='magnet'?'steps time':'adds a small spin impulse'} · R resets. Tap or drag the canvas. These controls also work without dragging. Reduced motion starts paused.</p>
  {kind==='magnet'?<><label>Magnetic strength <span className="control-value">{strength.toFixed(1)}</span><input aria-label="Magnetic strength" type="range" min="-6" max="6" step=".2" value={strength} onChange={e=>{setStrength(+e.target.value);api.current('field',+e.target.value);}}/></label><label>Field X<input aria-label="Field X" type="range" min="-175" max="175" value={fieldX} onChange={e=>{setFieldX(+e.target.value);api.current('x',+e.target.value);}}/></label><label>Field Y<input aria-label="Field Y" type="range" min="-110" max="110" value={fieldY} onChange={e=>{setFieldY(+e.target.value);api.current('y',+e.target.value);}}/></label></>:<><label>Spin speed <span className="control-value">{speed.toFixed(1)}</span><input aria-label="Spin speed" type="range" min="2" max="7" step=".2" value={speed} onChange={e=>{setSpeed(+e.target.value);api.current('speed',+e.target.value);}}/></label><button onClick={()=>api.current('kick')}>Add a spin impulse</button></>}
  <div className="experiment-buttons"><button onClick={()=>api.current('step')}>Step forward</button><button onClick={()=>api.current('reset')}>Reset experiment</button></div></div></details></div><WorkConnection topic={kind} event={event}/></>;
}
