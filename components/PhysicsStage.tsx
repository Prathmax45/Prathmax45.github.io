'use client';
import { useEffect, useRef, useState } from 'react';
import { gravityWorld, gravityStep, launchBody, waveWorld, waveStep, waveImpulse, waveWall, pendulumWorld, pendulumStep, pendulumPoints } from '@/lib/physics.mjs';

type Kind = 'gravity' | 'wave' | 'chaos';
type Action = (action: string, value?: number) => void;
const colors = ['#d5ff43', '#77f0ef', '#ff86db', '#b8a4ff'];
const labels = {
  gravity: { name: 'Three-body gravity experiment', hint: 'Drag empty space. Release a new world into the dance.', fallback: 'Three mutually attracting bodies follow a figure-eight orbit. Add a small body to disturb their paths.' },
  wave: { name: 'Double-slit wave experiment', hint: 'Touch the field. Your ripples meet the source.', fallback: 'A continuous classical wave passes through two slits. Add a pulse to create interference.' },
  chaos: { name: 'Twin double-pendulum experiment', hint: 'Pull either mass. Let go. Watch almost-identical worlds disagree.', fallback: 'Two double pendulums start 0.001 radians apart. Their motion separates as time passes.' },
};

export default function PhysicsStage({ kind }: { kind: Kind }) {
  const canvas = useRef<HTMLCanvasElement>(null), api = useRef<Action | null>(null), pausedRef = useRef(false);
  const [paused, setPaused] = useState(false), [readout, setReadout] = useState('INITIALIZING'), [notice,setNotice] = useState('');
  const [heading, setHeading] = useState(155), [angle, setAngle] = useState(123), [epsilon,setEpsilon] = useState(-3);
  const [wall,setWall] = useState(true), [source,setSource] = useState(true);
  const toggle = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); };
  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext('2d');
    if (!el || !ctx) { setNotice('Canvas is unavailable. Read the model notes and explore the linked source.'); return; }
    let gravity = gravityWorld(), wave = waveWorld(), chaos = pendulumWorld();
    let width = 1, height = 1, visible = false, frame = 0, last = 0, accumulator = 0, sample = 0, report = 0, disposed = false;
    let launchAngle = 155, startAngle = 123 * Math.PI/180, perturbation = .001, strokes = 0;
    let pointer: {x:number;y:number;sx:number;sy:number;id:number;bob:number} | null = null;
    const pixelCanvas = document.createElement('canvas'); pixelCanvas.width = wave.width; pixelCanvas.height = wave.height;
    const pixelContext = pixelCanvas.getContext('2d')!, pixels = pixelContext.createImageData(wave.width,wave.height);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    pausedRef.current = motion.matches; setPaused(motion.matches);
    // Warm the wave field into a legible diffraction pattern before its first paint.
    if(kind==='wave')for(let i=0;i<520;i++)waveStep(wave);
    // Precomputed physical traces keep the paused initial state informative too.
    if(kind==='gravity')for(let n=0;n<1500;n++){gravityStep(gravity);if(n%4===0)gravity.bodies.forEach(b=>{b.trail.push([b.x,b.y]);if(b.trail.length>220)b.trail.shift();});}
    if(kind==='chaos')for(let n=0;n<3200;n++){pendulumStep(chaos);if(n%3===0)chaos.states.forEach((s,i)=>{const p=pendulumPoints(s);chaos.trails[i].push([p[2],p[3]]);});}
    const position = (event: PointerEvent) => { const r=el.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height}; };
    const scale = () => Math.min(width*.28,height*.36);
    const pendulumScale = () => Math.min(width*.205,height*.205);
    const worldPoint = (x:number,y:number) => ({x:(x*width-width/2)/scale(),y:(y*height-height/2)/scale()});
    function reset() {
      gravity = gravityWorld();chaos=pendulumWorld(startAngle,perturbation);strokes=0;
      const wasWall=wave.wall, wasSource=wave.source;wave=waveWorld();wave.wall=wasWall;wave.source=wasSource;
      if(kind==='wave')for(let i=0;i<520;i++)waveStep(wave);
      accumulator=0;updateReadout();draw();setNotice('Experiment reset.');
    }
    function step() {
      if(kind==='gravity')gravityStep(gravity);
      else if(kind==='wave')waveStep(wave);
      else pendulumStep(chaos);
      if(++sample%3===0){
        if(kind==='gravity')gravity.bodies.forEach(b=>{b.trail.push([b.x,b.y]);if(b.trail.length>220)b.trail.shift();});
        if(kind==='chaos')chaos.states.forEach((s,i)=>{const p=pendulumPoints(s);chaos.trails[i].push([p[2],p[3]]);if(chaos.trails[i].length>1100)chaos.trails[i].shift();});
      }
    }
    function updateReadout() {
      const time=kind==='gravity'?gravity.time:kind==='chaos'?chaos.time:wave.time/60;
      el!.dataset.time=time.toFixed(3);
      if(kind==='gravity'){el!.dataset.bodies=String(gravity.bodies.length);setReadout(`${gravity.bodies.length} BODIES  /  t ${time.toFixed(1)}`);}
      else if(kind==='wave'){el!.dataset.pulses=String(strokes);setReadout(`${wave.wall?'TWO SLITS':'OPEN FIELD'}  /  ${strokes} PULSES`);}
      else {const a=pendulumPoints(chaos.states[0]),b=pendulumPoints(chaos.states[1]),d=Math.hypot(a[2]-b[2],a[3]-b[3]);el!.dataset.separation=d.toFixed(6);setReadout(`Δ POSITION ${d.toFixed(4)}  /  t ${time.toFixed(1)}`);}
    }
    function backdrop() {
      ctx!.fillStyle = '#070911';ctx!.fillRect(0,0,width,height);
      for(let i=0;i<76;i++){ctx!.fillStyle=`rgba(170,182,220,${.1+(i%5)*.055})`;ctx!.beginPath();ctx!.arc(((i*137.508)%997)/997*width,((i*271.113)%613)/613*height,i%7===0?1.2:.6,0,Math.PI*2);ctx!.fill();}
    }
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
    function drawWave() {
      const w=wave.width,h=wave.height,data=pixels.data;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const k=y*w+x,p=k*4,v=wave.u[k],amp=Math.min(1,Math.abs(v)*2.3),shine=Math.min(1,Math.abs((wave.u[k+1]||0)-(wave.u[k-1]||0))*6);
        if(waveWall(wave,x,y)){data[p]=102;data[p+1]=120;data[p+2]=151;}
        else{const positive=v>=0;data[p]=7+amp*(positive?55:215)+shine*22;data[p+1]=12+amp*(positive?205:50)+shine*35;data[p+2]=25+amp*(positive?210:170)+shine*40;}
        data[p+3]=255;
      }
      pixelContext.putImageData(pixels,0,0);ctx!.imageSmoothingEnabled=true;ctx!.drawImage(pixelCanvas,0,0,width,height);
      const sx=width*.18,sy=height*.5;ctx!.strokeStyle='#d5ff43';ctx!.lineWidth=1.5;ctx!.beginPath();ctx!.arc(sx,sy,10,0,Math.PI*2);ctx!.stroke();ctx!.fillStyle='#d5ff43';ctx!.beginPath();ctx!.arc(sx,sy,3,0,Math.PI*2);ctx!.fill();
      ctx!.fillStyle='#b9b5cf';ctx!.font='12px monospace';ctx!.fillText('SOURCE',sx-23,sy+32);
    }
    function drawChaos() {
      const s=pendulumScale(),cx=width/2,cy=height*.46;
      ctx!.strokeStyle='#84739825';ctx!.lineWidth=1;
      for(let r=1;r<=2;r++){ctx!.beginPath();ctx!.arc(cx,cy,r*s,0,Math.PI*2);ctx!.stroke();}
      ctx!.setLineDash([2,7]);ctx!.beginPath();ctx!.moveTo(cx,cy-2*s);ctx!.lineTo(cx,cy+2*s);ctx!.stroke();ctx!.setLineDash([]);
      chaos.states.forEach((state,i)=>{
        const color=i===0?colors[2]:colors[1],p=pendulumPoints(state),trail=chaos.trails[i];
        ctx!.strokeStyle=color;ctx!.lineWidth=1.1;ctx!.globalAlpha=.5;
        ctx!.beginPath();trail.forEach((t,j)=>{if(j===0)ctx!.moveTo(cx+t[0]*s,cy+t[1]*s);else ctx!.lineTo(cx+t[0]*s,cy+t[1]*s);});ctx!.stroke();ctx!.globalAlpha=1;
        ctx!.strokeStyle=color;ctx!.lineWidth=2;ctx!.beginPath();ctx!.moveTo(cx,cy);ctx!.lineTo(cx+p[0]*s,cy+p[1]*s);ctx!.lineTo(cx+p[2]*s,cy+p[3]*s);ctx!.stroke();
        for(let j=0;j<4;j+=2){ctx!.fillStyle=color;ctx!.shadowColor=color;ctx!.shadowBlur=14;ctx!.beginPath();ctx!.arc(cx+p[j]*s,cy+p[j+1]*s,7,0,Math.PI*2);ctx!.fill();ctx!.shadowBlur=0;}
      });ctx!.fillStyle='#f4f1ff';ctx!.beginPath();ctx!.arc(cx,cy,4,0,Math.PI*2);ctx!.fill();
    }
    function draw() { if(disposed)return;backdrop();if(kind==='gravity')drawGravity();else if(kind==='wave')drawWave();else drawChaos(); }
    function resize() { const r=el!.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);el!.width=Math.round(width*dpr);el!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw(); }
    function animate(now:number) {
      frame=0;if(disposed||!visible||document.hidden||pausedRef.current)return;
      const elapsed=last?Math.min(.04,(now-last)/1000):0;last=now;accumulator+=elapsed;
      const dt=kind==='gravity'?.004:kind==='chaos'?.006:1/120;
      let steps=0;if(kind==='chaos'&&pointer)accumulator=0;
      else while(accumulator>=dt&&steps++<12){step();accumulator-=dt;}
      draw();if(now-report>220){updateReadout();report=now;}frame=requestAnimationFrame(animate);
    }
    function start() { if(!frame&&visible&&!document.hidden&&!pausedRef.current){last=0;accumulator=0;frame=requestAnimationFrame(animate);} }
    function suspend() { if(frame)cancelAnimationFrame(frame);frame=0;last=0; }
    function visibility(){if(document.hidden)suspend();else start();}
    function changeMotion(){pausedRef.current=motion.matches;setPaused(motion.matches);if(motion.matches)suspend();else start();}
    function setPendulum(p:{x:number;y:number},bob:number) {
      const s=pendulumScale(),cx=width/2,cy=height*.46;
      const x=(p.x*width-cx)/s,y=(p.y*height-cy)/s;
      const current=chaos.states[0],first=bob===0?Math.atan2(x,y):current[0],second=bob===1?Math.atan2(x-Math.sin(first),y-Math.cos(first)):current[1];
      chaos=pendulumWorld(first,perturbation);chaos.states[0][1]=second;chaos.states[1][1]=second;startAngle=first;
      setAngle(Math.round(first*180/Math.PI));
    }
    const down=(event:PointerEvent)=>{
      if(event.button!==0)return;const p=position(event);let bob=0;
      if(kind==='chaos'){const q=pendulumPoints(chaos.states[0]),s=pendulumScale(),cx=width/2,cy=height*.46;bob=Math.hypot(p.x*width-cx-q[2]*s,p.y*height-cy-q[3]*s)<Math.hypot(p.x*width-cx-q[0]*s,p.y*height-cy-q[1]*s)?1:0;setPendulum(p,bob);}
      pointer={...p,sx:p.x,sy:p.y,id:event.pointerId,bob};el!.setPointerCapture(event.pointerId);
      if(kind==='wave'){waveImpulse(wave,p.x,p.y);strokes++;}draw();updateReadout();
    };
    const move=(event:PointerEvent)=>{if(!pointer||pointer.id!==event.pointerId)return;const p=position(event);pointer.x=p.x;pointer.y=p.y;
      if(kind==='wave'){waveImpulse(wave,p.x,p.y,.6);if(pausedRef.current)for(let i=0;i<3;i++)step();}
      if(kind==='chaos')setPendulum(p,pointer.bob);draw();
    };
    const up=(event:PointerEvent)=>{if(!pointer||pointer.id!==event.pointerId)return;
      if(kind==='gravity'){const a=worldPoint(pointer.sx,pointer.sy),b=worldPoint(pointer.x,pointer.y),tap=Math.hypot(pointer.x-pointer.sx,pointer.y-pointer.sy)<.015;const success=launchBody(gravity,a.x,a.y,tap?-.45*a.y:(b.x-a.x)*1.1,tap?.45*a.x:(b.y-a.y)*1.1);setNotice(success?'Intruder launched. Every body now feels its gravity.':gravity.bodies.length>=12?'Twelve-body limit reached. Reset to start again.':'Launch closer to the centre of the field.');}
      if(kind==='chaos')setNotice('Both pendulums released with a tiny angular difference.');
      pointer=null;draw();updateReadout();if(el!.hasPointerCapture(event.pointerId))el!.releasePointerCapture(event.pointerId);
    };
    const cancel=()=>{pointer=null;draw();};
    api.current=(action,value)=>{
      if(action==='pause'){if(pausedRef.current)suspend();else start();}
      if(action==='reset')reset();
      if(action==='step'){for(let i=0;i<12;i++)step();draw();updateReadout();}
      if(action==='heading')launchAngle=value!;
      if(action==='launch'){const a=launchAngle*Math.PI/180;const ok=launchBody(gravity,1.45,.1,Math.cos(a),Math.sin(a));setNotice(ok?'Intruder launched.':'Twelve-body limit reached. Reset to start again.');}
      if(action==='pulse'){waveImpulse(wave,.7,.5);strokes++;if(pausedRef.current)for(let i=0;i<12;i++)step();setNotice('A new pulse is crossing the field.');}
      if(action==='wall'){wave.wall=!!value;reset();}
      if(action==='source'){wave.source=!!value;setNotice(value?'Continuous source on.':'Continuous source off.');}
      if(action==='angle'){startAngle=value!*Math.PI/180;chaos=pendulumWorld(startAngle,perturbation);}
      if(action==='epsilon'){perturbation=10**value!;chaos=pendulumWorld(startAngle,perturbation);}
      updateReadout();draw();
    };
    el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else suspend();},{threshold:0});observer.observe(el);
    const resizer=new ResizeObserver(resize);resizer.observe(el);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',changeMotion);resize();updateReadout();
    return()=>{disposed=true;suspend();api.current=null;observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',changeMotion);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);};
  },[kind]);
  useEffect(()=>{api.current?.('pause');},[paused]);
  return <div className={`physics-stage physics-${kind}`}>
    <div className="experiment-toolbar"><span><i/> LIVE MODEL / {kind==='gravity'?'01':kind==='wave'?'02':'03'}</span><button type="button" onClick={toggle} aria-label={`${paused?'Resume':'Pause'} ${labels[kind].name}`}>{paused?'Resume ↗':'Pause Ⅱ'}</button></div>
    <canvas ref={canvas} tabIndex={0} role="img" aria-label={labels[kind].name} aria-describedby={`${kind}-hint`} onKeyDown={e=>{
      if(e.key===' '){e.preventDefault();toggle();}if(e.key.toLowerCase()==='r')api.current?.('reset');
      if(e.key==='Enter'){e.preventDefault();api.current?.(kind==='gravity'?'launch':kind==='wave'?'pulse':'step');}
      if(kind==='chaos'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();const next=Math.max(-180,Math.min(180,angle+(e.key==='ArrowLeft'?-5:5)));setAngle(next);api.current?.('angle',next);}
    }}>{labels[kind].fallback}</canvas>
    <div className="experiment-caption"><p id={`${kind}-hint`}>{labels[kind].hint}</p><output aria-label={`${kind} experiment readout`}>{readout}</output></div>
    <details className="experiment-controls"><summary>Controls & keyboard <span>+</span></summary><div className="experiment-control-grid">
      <p>Space: pause · R: reset · Enter: {kind==='gravity'?'launch':kind==='wave'?'pulse':'step'}.{kind==='chaos'?' Arrow keys: change release angle.':''} Touch: tap the field; swipe outside it to scroll. Motion starts paused when reduced motion is enabled.</p>
      {kind==='gravity'&&<><label>Launch heading <span className="control-value">{heading}°</span><input type="range" min="0" max="360" value={heading} onChange={e=>{setHeading(+e.target.value);api.current?.('heading',+e.target.value);}}/></label><button onClick={()=>api.current?.('launch')}>Launch an intruder</button></>}
      {kind==='wave'&&<><label className="experiment-check"><input type="checkbox" checked={wall} onChange={e=>{setWall(e.target.checked);api.current?.('wall',+e.target.checked);}}/> Double-slit barrier</label><label className="experiment-check"><input type="checkbox" checked={source} onChange={e=>{setSource(e.target.checked);api.current?.('source',+e.target.checked);}}/> Continuous source</label><button onClick={()=>api.current?.('pulse')}>Send a pulse</button></>}
      {kind==='chaos'&&<><label>Release angle <span className="control-value">{angle}°</span><input type="range" min="-180" max="180" value={angle} onChange={e=>{setAngle(+e.target.value);api.current?.('angle',+e.target.value);}}/></label><label>Initial difference <span className="control-value">{10**epsilon} rad</span><input type="range" min="-5" max="-1" value={epsilon} onChange={e=>{setEpsilon(+e.target.value);api.current?.('epsilon',+e.target.value);}}/></label></>}
      <div className="experiment-buttons"><button onClick={()=>api.current?.('step')}>Step forward</button><button onClick={()=>api.current?.('reset')}>Reset experiment</button></div>
    </div></details><p className="sr-only" role="status">{notice}</p>
  </div>;
}
