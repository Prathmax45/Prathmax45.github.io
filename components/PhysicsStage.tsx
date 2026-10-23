'use client';
import { useEffect, useRef, useState } from 'react';
import { gravityWorld, gravityStep, launchBody } from '@/lib/physics.mjs';
import WorkConnection from './WorkConnection';
const colors = ['#d5ff43', '#77f0ef', '#ff86db', '#b8a4ff'];
export default function PhysicsStage() {
 const canvas=useRef<HTMLCanvasElement>(null),api=useRef<(action:string,value?:number)=>void>(()=>{}),pausedRef=useRef(false);
 const [paused,setPaused]=useState(false),[heading,setHeading]=useState(155),[readout,setReadout]=useState(''),[notice,setNotice]=useState('');
 const toggle=()=>{pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);api.current('pause');};
 useEffect(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  let gravity=gravityWorld(),width=1,height=1,visible=false,frame=0,last=0,accumulator=0,sample=0,report=0,disposed=false,launchAngle=155;
  let pointer:{x:number;y:number;sx:number;sy:number;id:number}|null=null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');pausedRef.current=motion.matches;setPaused(motion.matches);
  function step(){gravityStep(gravity);if(++sample%3===0)gravity.bodies.forEach(b=>{b.trail.push([b.x,b.y]);if(b.trail.length>220)b.trail.shift();});}
  for(let n=0;n<1500;n++)step();
  const position=(event:PointerEvent)=>{const r=el.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};};
  const scale=()=>Math.min(width*.28,height*.36);
  const worldPoint=(x:number,y:number)=>({x:(x*width-width/2)/scale(),y:(y*height-height/2)/scale()});
  function updateReadout(){el!.dataset.time=gravity.time.toFixed(3);el!.dataset.bodies=String(gravity.bodies.length);setReadout(`${gravity.bodies.length} BODIES / t ${gravity.time.toFixed(1)}`);}
  function backdrop(){ctx!.fillStyle='#070911';ctx!.fillRect(0,0,width,height);for(let i=0;i<76;i++){ctx!.fillStyle=`rgba(170,182,220,${.1+(i%5)*.055})`;ctx!.beginPath();ctx!.arc(((i*137.508)%997)/997*width,((i*271.113)%613)/613*height,i%7===0?1.2:.6,0,Math.PI*2);ctx!.fill();}}
    function drawGravity() {
      const s=scale(),cx=width/2,cy=height/2;
      // Marching squares of the actual softened Newtonian potential; not spacetime.
      const cols=50,rows=28,cw=width/cols,ch=height/rows,values=new Float32Array((cols+1)*(rows+1));
      for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
        const wx=(x*cw-cx)/s,wy=(y*ch-cy)/s;
        values[y*(cols+1)+x]=gravity.bodies.reduce((v,b)=>v-b.mass/Math.sqrt((wx-b.x)**2+(wy-b.y)**2+.025**2),0);
      }
      ctx!.strokeStyle='#719edb32';ctx!.lineWidth=.8;
      for(const level of [-1.6,-2.2,-3,-4.5,-7]){
        ctx!.beginPath();
        for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
          const k=y*(cols+1)+x,v=[values[k],values[k+1],values[k+cols+2],values[k+cols+1]],corners=[[x*cw,y*ch],[(x+1)*cw,y*ch],[(x+1)*cw,(y+1)*ch],[x*cw,(y+1)*ch]],hits:number[][]=[];
          for(let e=0;e<4;e++){const n=(e+1)%4;if((v[e]<level)!==(v[n]<level)){const t=(level-v[e])/(v[n]-v[e]);hits.push([corners[e][0]+t*(corners[n][0]-corners[e][0]),corners[e][1]+t*(corners[n][1]-corners[e][1])]);}}
          for(let i=0;i+1<hits.length;i+=2){ctx!.moveTo(hits[i][0],hits[i][1]);ctx!.lineTo(hits[i+1][0],hits[i+1][1]);}
        }ctx!.stroke();
      }
      gravity.bodies.forEach((b,i)=>{
        const color=colors[i%colors.length];ctx!.strokeStyle=color;ctx!.globalAlpha=i<3?.65:.36;ctx!.lineWidth=i<3?1.5:1;
        ctx!.beginPath();b.trail.forEach((p,j)=>{const x=cx+p[0]*s,y=cy+p[1]*s;if(j===0)ctx!.moveTo(x,y);else ctx!.lineTo(x,y);});ctx!.stroke();ctx!.globalAlpha=1;
        const x=cx+b.x*s,y=cy+b.y*s,r=i<3?9:4;
        if(Math.abs(x)>width*4||Math.abs(y)>height*4)return;
        const glow=ctx!.createRadialGradient(x,y,0,x,y,r*6);glow.addColorStop(0,color+'44');glow.addColorStop(1,color+'00');ctx!.fillStyle=glow;ctx!.beginPath();ctx!.arc(x,y,r*6,0,Math.PI*2);ctx!.fill();
        const sphere=ctx!.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r);sphere.addColorStop(0,'#ffffff');sphere.addColorStop(.3,color);sphere.addColorStop(1,'#171f35');ctx!.fillStyle=sphere;ctx!.beginPath();ctx!.arc(x,y,r,0,Math.PI*2);ctx!.fill();
        if(i<3){ctx!.fillStyle=color;ctx!.font='12px monospace';ctx!.fillText(`0${i+1}`,x+15,y-12);}
      });
      if(pointer){const ax=pointer.sx*width,ay=pointer.sy*height,bx=pointer.x*width,by=pointer.y*height;ctx!.strokeStyle=colors[3];ctx!.setLineDash([5,5]);ctx!.beginPath();ctx!.moveTo(ax,ay);ctx!.lineTo(bx,by);ctx!.stroke();ctx!.setLineDash([]);ctx!.beginPath();ctx!.arc(ax,ay,7,0,Math.PI*2);ctx!.stroke();}
    }

  function draw(){if(disposed)return;backdrop();drawGravity();}
  function resize(){const r=el!.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);el!.width=Math.round(width*dpr);el!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw();}
  function animate(now:number){frame=0;if(disposed||!visible||document.hidden||pausedRef.current)return;accumulator+=last?Math.min(.04,(now-last)/1000):0;last=now;let steps=0;while(accumulator>=.004&&steps++<12){step();accumulator-=.004;}draw();if(now-report>220){updateReadout();report=now;}frame=requestAnimationFrame(animate);}
  function start(){if(!frame&&visible&&!document.hidden&&!pausedRef.current){last=0;accumulator=0;frame=requestAnimationFrame(animate);}}
  function suspend(){cancelAnimationFrame(frame);frame=0;last=0;}
  function visibility(){if(document.hidden)suspend();else start();}
  function changeMotion(){pausedRef.current=motion.matches;setPaused(motion.matches);if(motion.matches)suspend();else start();}
  const down=(e:PointerEvent)=>{if(e.button!==0)return;const p=position(e);pointer={...p,sx:p.x,sy:p.y,id:e.pointerId};el!.setPointerCapture(e.pointerId);draw();};
  const move=(e:PointerEvent)=>{if(!pointer||pointer.id!==e.pointerId)return;const p=position(e);pointer.x=p.x;pointer.y=p.y;draw();};
  const up=(e:PointerEvent)=>{if(!pointer||pointer.id!==e.pointerId)return;const a=worldPoint(pointer.sx,pointer.sy),b=worldPoint(pointer.x,pointer.y),tap=Math.hypot(pointer.x-pointer.sx,pointer.y-pointer.sy)<.015;const ok=launchBody(gravity,a.x,a.y,tap?-.45*a.y:(b.x-a.x)*1.1,tap?.45*a.x:(b.y-a.y)*1.1);setNotice(ok?'You changed every orbit with one body. I inspect those consequences in my C++ work.':gravity.bodies.length>=12?'Twelve-body limit reached. Reset to start again.':'Launch closer to the centre of the field.');pointer=null;draw();updateReadout();if(el!.hasPointerCapture(e.pointerId))el!.releasePointerCapture(e.pointerId);};
  const cancel=()=>{pointer=null;draw();};
  api.current=(action,value)=>{if(action==='pause'){if(pausedRef.current)suspend();else start();}if(action==='reset'){gravity=gravityWorld();accumulator=0;setNotice('A fresh orbit. My interest is in the model behind the motion.');}if(action==='step'){for(let i=0;i<12;i++)step();setNotice('You stepped the model. I track motion and energy in my orbital engine.');}if(action==='heading')launchAngle=value!;if(action==='launch'){const a=launchAngle*Math.PI/180,ok=launchBody(gravity,1.45,.1,Math.cos(a),Math.sin(a));setNotice(ok?'You introduced a new mass. The system responds to its gravity.':'Twelve-body limit reached. Reset to start again.');}updateReadout();draw();};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)start();else suspend();});observer.observe(el);const resizer=new ResizeObserver(resize);resizer.observe(el);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',changeMotion);resize();updateReadout();
  return()=>{disposed=true;suspend();api.current=()=>{};observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',changeMotion);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);};
 },[]);
 return <><div className="physics-stage physics-gravity"><div className="experiment-toolbar"><span><i/> LIVE MODEL / 01</span><button onClick={toggle} aria-label={`${paused?'Resume':'Pause'} Three-body gravity experiment`}>{paused?'Resume':'Pause'}</button></div>
 <canvas ref={canvas} tabIndex={0} role="img" aria-label="Three-body gravity experiment" aria-describedby="gravity-hint" onKeyDown={e=>{if(e.key===' '){e.preventDefault();toggle();}if(e.key==='Enter'){e.preventDefault();api.current('launch');}if(e.key.toLowerCase()==='r')api.current('reset');}}>Three mutually attracting bodies follow a figure-eight orbit. Add a small body to disturb their paths.</canvas>
 <div className="experiment-caption"><p id="gravity-hint">Drag empty space. Release a new world into the dance.</p><output aria-label="gravity experiment readout">{readout}</output></div>
 <details className="experiment-controls"><summary>Controls & keyboard <span>+</span></summary><div className="experiment-control-grid"><p>Space: pause. R: reset. Enter: launch. Tap the field or use these controls without dragging. Swipe outside the field to scroll. Reduced motion starts paused.</p><label>Launch heading <span className="control-value">{heading} degrees</span><input type="range" min="0" max="360" value={heading} onChange={e=>{setHeading(+e.target.value);api.current('heading',+e.target.value);}}/></label><button onClick={()=>api.current('launch')}>Launch an intruder</button><div className="experiment-buttons"><button onClick={()=>api.current('step')}>Step forward</button><button onClick={()=>api.current('reset')}>Reset experiment</button></div></div></details></div><WorkConnection topic="gravity" event={notice}/></>;
}
