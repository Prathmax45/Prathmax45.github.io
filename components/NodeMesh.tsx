'use client';
import WorkConnection from './WorkConnection';
import {useEffect,useRef,useState} from 'react';
import {meshWorld,meshEdges,meshRoute,meshStep} from '@/lib/core-labs.mjs';

const initial=()=>({nodes:meshWorld(),from:0,to:4,selected:7,waiting:false,path:[0,7,4],segment:0,progress:0,received:0,rest:0});
export default function NodeMesh({paused,onStatus}:{paused:boolean;onStatus:(text:string)=>void}) {
 const canvas=useRef<HTMLCanvasElement>(null),model=useRef(initial()),command=useRef<(action:string,value?:number)=>void>(()=>{});
 const [view,setView]=useState({from:0,to:4,selected:7,waiting:false,offline:false,x:0,y:0,path:'00 → CORE → 04',received:0});
 const [hint,setHint]=useState('Pick two nodes to send a signal. Drag a relay to bend its links.');
 useEffect(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');let width=1,height=1,size=1,raf=0,last=0,visible=false,acc=0,reported=0,hover=-1;
  let drag:{id:number;x:number;y:number;moved:boolean;pointerId:number}|null=null;
  let beforePick={from:0,to:4,waiting:false},lastPick=-1,lastPickTime=0;
  const name=(id:number)=>id===7?'CORE':String(id).padStart(2,'0');
  function sync(){const m=model.current,n=m.nodes[m.selected];setView({from:m.from,to:m.to,selected:m.selected,waiting:m.waiting,offline:n.offline,x:Math.round(n.x*100),y:Math.round(n.y*100),path:m.waiting?`${name(m.from)} → ?`:m.path.length?m.path.map(name).join(' → '):'NO ROUTE',received:m.received});onStatus(m.waiting?'PICK RECEIVER':m.path.length?`${m.path.length-1} HOPS / ${m.received} RX`:'NO ROUTE');el!.dataset.received=String(m.received);el!.dataset.route=m.path.join('-');el!.dataset.selected=String(m.selected);el!.dataset.offline=m.nodes.filter(n=>n.offline).map(n=>n.id).join(',');}
  function route(){const m=model.current;m.path=m.waiting?[]:meshRoute(m.nodes,m.from,m.to);m.segment=0;m.progress=0;m.rest=0;sync();}
  function select(id:number){const m=model.current;if(m.nodes[id].offline){m.selected=id;setHint('That relay is offline. Double-click it, or reconnect it in Controls.');sync();return;}
   m.selected=id;if(!m.waiting){m.from=id;m.waiting=true;setHint(`Sender ${name(id)} selected. Pick a different node to receive.`);}
   else if(id!==m.from){m.to=id;m.waiting=false;setHint(`Sending ${name(m.from)} → ${name(id)}. Double-click a relay to break or restore a link.`);}route();
  }
  function toggle(id:number){const m=model.current;m.nodes[id].offline=!m.nodes[id].offline;m.selected=id;route();setHint(m.nodes[id].offline?`Relay ${name(id)} offline. Packets use the shortest available path.`:`Relay ${name(id)} reconnected.`);}
  function step(dt:number){const m=model.current;meshStep(m.nodes,dt,drag?.id??-1);if(m.waiting||m.path.length<2)return;
   if(m.rest>0){m.rest-=dt;return;}const a=m.nodes[m.path[m.segment]],b=m.nodes[m.path[m.segment+1]];m.progress+=dt*.95/Math.max(.1,Math.hypot(b.x-a.x,b.y-a.y));
   if(m.progress>=1){m.progress=0;m.segment++;if(m.segment>=m.path.length-1){m.received++;m.segment=0;m.rest=.5;}}
  }
  const point=(event:PointerEvent)=>{const r=el.getBoundingClientRect();return {x:(event.clientX-r.left-width/2)/size,y:(event.clientY-r.top-height/2)/size};};
  const hit=(p:{x:number;y:number})=>{let best=-1,d=.19;model.current.nodes.forEach(n=>{const distance=Math.hypot(n.x-p.x,n.y-p.y);if(distance<d){best=n.id;d=distance;}});return best;};
  function draw(){const m=model.current,cx=width/2,cy=height/2;ctx!.clearRect(0,0,width,height);
   const fog=ctx!.createRadialGradient(cx,cy,5,cx,cy,size*1.5);fog.addColorStop(0,'#54256755');fog.addColorStop(1,'#08091400');ctx!.fillStyle=fog;ctx!.fillRect(0,0,width,height);
   for(let i=0;i<50;i++){ctx!.fillStyle=i%4===0?'#8b73b370':'#80a8d940';ctx!.beginPath();ctx!.arc((i*137.51+21)%width,(i*91.73+17)%height,.7,0,Math.PI*2);ctx!.fill();}
   const active=new Set(m.path.slice(1).map((id,i)=>[m.path[i],id].sort().join('-')));
   meshEdges.forEach(([a,b])=>{const n=m.nodes[a],p=m.nodes[b],off=n.offline||p.offline,lit=active.has([a,b].sort().join('-'));ctx!.setLineDash(off?[3,7]:[]);ctx!.strokeStyle=off?'#ff86db35':lit?'#77f0efb0':'#8974b84d';ctx!.lineWidth=lit?2:1;ctx!.beginPath();ctx!.moveTo(cx+n.x*size,cy+n.y*size);ctx!.lineTo(cx+p.x*size,cy+p.y*size);ctx!.stroke();});ctx!.setLineDash([]);
   if(m.path.length>1&&!m.waiting&&m.rest<=0){const a=m.nodes[m.path[m.segment]],b=m.nodes[m.path[m.segment+1]],x=cx+(a.x+(b.x-a.x)*m.progress)*size,y=cy+(a.y+(b.y-a.y)*m.progress)*size;ctx!.shadowBlur=17;ctx!.shadowColor='#d5ff43';ctx!.fillStyle='#e7ff9f';ctx!.beginPath();ctx!.arc(x,y,4,0,Math.PI*2);ctx!.fill();ctx!.shadowBlur=0;}
   m.nodes.forEach(n=>{const x=cx+n.x*size,y=cy+n.y*size,core=n.id===7,r=core?28:19,color=n.offline?'#aa7497':n.id===m.from?'#d5ff43':n.id===m.to&&!m.waiting?'#ff86db':'#77f0ef';
    if(n.id===hover||n.id===m.selected){ctx!.strokeStyle=color+'66';ctx!.beginPath();ctx!.arc(x,y,r+8,0,Math.PI*2);ctx!.stroke();}
    ctx!.fillStyle=n.offline?'#221421':core?'#2b1b3d':'#101625';ctx!.strokeStyle=color;ctx!.lineWidth=core?1.5:1;ctx!.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(k===0)ctx!.moveTo(px,py);else ctx!.lineTo(px,py);}ctx!.closePath();ctx!.fill();ctx!.stroke();
    ctx!.fillStyle=color;ctx!.textAlign='center';ctx!.font=core?'11px monospace':'13px monospace';ctx!.fillText(n.offline?'×':name(n.id),x,y+4);
    if(n.id===m.from||n.id===m.to&&!m.waiting){ctx!.font='10px monospace';ctx!.fillText(n.id===m.from?'TX':'RX',x,y-r-13);}
   });ctx!.textAlign='left';
  }
  function animate(now:number){raf=0;if(!visible||document.hidden||paused||media.matches)return;acc+=last?Math.min(.04,(now-last)/1000):0;last=now;while(acc>=.008){step(.008);acc-=.008;}draw();if(now-reported>220){sync();reported=now;}raf=requestAnimationFrame(animate);}
  function start(){if(!raf&&visible&&!paused&&!media.matches&&!document.hidden){last=0;acc=0;raf=requestAnimationFrame(animate);}}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  function changed(){stop();draw();start();}
  function resize(){const r=el!.getBoundingClientRect();width=r.width;height=r.height;size=Math.min(width*.46,height*.46);const dpr=Math.min(devicePixelRatio||1,1.5);el!.width=Math.round(width*dpr);el!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw();}
  const down=(event:PointerEvent)=>{if(event.button!==0)return;const p=point(event),id=hit(p);if(id<0)return;if(event.shiftKey){toggle(id);draw();return;}drag={id,x:event.clientX,y:event.clientY,moved:false,pointerId:event.pointerId};el!.setPointerCapture(event.pointerId);};
  const move=(event:PointerEvent)=>{const p=point(event);hover=hit(p);if(drag&&event.pointerId===drag.pointerId){if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>5)drag.moved=true;if(drag.moved){const n=model.current.nodes[drag.id];n.x=Math.max(-.94,Math.min(.94,p.x));n.y=Math.max(-.86,Math.min(.86,p.y));model.current.selected=drag.id;if(paused||media.matches)for(let i=0;i<4;i++)meshStep(model.current.nodes,.008,drag.id);route();}}draw();};
  const up=(event:PointerEvent)=>{if(!drag||drag.pointerId!==event.pointerId)return;const d=drag;drag=null;if(!d.moved){const m=model.current;if(lastPick!==d.id||performance.now()-lastPickTime>500)beforePick={from:m.from,to:m.to,waiting:m.waiting};lastPick=d.id;lastPickTime=performance.now();select(d.id);}else setHint('Links respond like springs. Routing now uses the new distances.');draw();sync();if(el!.hasPointerCapture(event.pointerId))el!.releasePointerCapture(event.pointerId);};
  const cancel=()=>{drag=null;hover=-1;draw();};const leave=()=>{hover=-1;draw();};const dbl=(event:MouseEvent)=>{const r=el!.getBoundingClientRect(),id=hit({x:(event.clientX-r.left-width/2)/size,y:(event.clientY-r.top-height/2)/size});if(id>=0){Object.assign(model.current,beforePick);toggle(id);draw();}};
  command.current=(action,value)=>{const m=model.current;
   if(action==='sender'){m.from=value!;m.waiting=false;route();}
   if(action==='receiver'){m.to=value!;m.waiting=false;route();}
   if(action==='focus'){m.selected=((value!%8)+8)%8;sync();}
   if(action==='pick')select(m.selected);
   if(action==='offline')toggle(m.selected);
   if(action==='x'||action==='y'){m.nodes[m.selected][action]=value!/100;for(let i=0;i<4;i++)meshStep(m.nodes,.008,m.selected);route();}
   if(action==='step'){for(let i=0;i<50;i++)step(.008);sync();}
   if(action==='reset'){model.current=initial();setHint('Network restored. Pick two nodes or drag a relay.');sync();}
   draw();
  };
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('pointerleave',leave);el.addEventListener('lostpointercapture',cancel);el.addEventListener('dblclick',dbl);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});observer.observe(el);const resizer=new ResizeObserver(resize);resizer.observe(el);document.addEventListener('visibilitychange',changed);media.addEventListener('change',changed);resize();sync();start();
  return()=>{stop();observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',changed);media.removeEventListener('change',changed);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('pointerleave',leave);el.removeEventListener('lostpointercapture',cancel);el.removeEventListener('dblclick',dbl);command.current=()=>{};};
 },[paused,onStatus]);
 return <div className="mesh-lab"><canvas ref={canvas} tabIndex={0} role="img" aria-label="Spring-linked packet network" aria-describedby="mesh-hint" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Enter',' ','o','O','r','R'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='ArrowRight')command.current('focus',view.selected+(e.key==='ArrowRight'?1:-1));if(e.key==='Enter')command.current('pick');if(e.key===' '||e.key.toLowerCase()==='o')command.current('offline');if(e.key.toLowerCase()==='r')command.current('reset');}}/>
  <div className="mesh-route"><span>LIVE ROUTE</span><output aria-label="Packet route">{view.path}</output><span className="mesh-rx">{String(view.received).padStart(2,'0')} RX</span></div><p className="core-hint" id="mesh-hint" aria-live="polite">{hint}</p>
  <details className="core-settings"><summary>Controls & keyboard alternatives</summary><div className="mesh-form"><label>Sender<select aria-label="Packet sender" value={view.from} onChange={e=>command.current('sender',+e.target.value)}>{Array.from({length:8},(_,i)=><option key={i} value={i}>{i===7?'Core':`Node ${i}`}</option>)}</select></label><label>Receiver<select aria-label="Packet receiver" value={view.to} onChange={e=>command.current('receiver',+e.target.value)}>{Array.from({length:8},(_,i)=><option key={i} value={i}>{i===7?'Core':`Node ${i}`}</option>)}</select></label><label>Selected relay<select aria-label="Selected relay" value={view.selected} onChange={e=>command.current('focus',+e.target.value)}>{Array.from({length:8},(_,i)=><option key={i} value={i}>{i===7?'Core':`Node ${i}`}</option>)}</select></label><label className="relay-offline"><input type="checkbox" checked={view.offline} onChange={()=>command.current('offline')}/> Relay offline</label><label>Relay X<input aria-label="Relay X" type="range" min="-94" max="94" value={view.x} onChange={e=>command.current('x',+e.target.value)}/></label><label>Relay Y<input aria-label="Relay Y" type="range" min="-86" max="86" value={view.y} onChange={e=>command.current('y',+e.target.value)}/></label></div><div className="core-controls"><button onClick={()=>command.current('step')}>Step packet</button><button onClick={()=>command.current('reset')}>Reset network</button></div><p className="core-note">Arrow keys select a relay · Enter picks sender/receiver · O takes a relay offline · R resets. Shift-click or double-click also disconnects a relay. Spring forces + distance-weighted routing; an educational browser model, separate from the C project.</p></details>
 <WorkConnection topic="mesh" event={hint.startsWith('Pick two')?undefined:hint} compact/></div>;
}
