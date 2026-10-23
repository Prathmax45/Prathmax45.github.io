'use client';
import { useEffect, useState } from 'react';
export default function CursorHud(){
 const [enabled,setEnabled]=useState(false),[position,setPosition]=useState({x:0,y:0,speed:0});
 useEffect(()=>{if(!enabled)return;let last={x:0,y:0,time:performance.now()},frame=0;const move=(e:PointerEvent)=>{const now=performance.now(),speed=Math.round(Math.hypot(e.clientX-last.x,e.clientY-last.y)/Math.max(1,now-last.time)*1000);last={x:e.clientX,y:e.clientY,time:now};cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>setPosition({x:e.clientX,y:e.clientY,speed}));};window.addEventListener('pointermove',move);return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);};},[enabled]);
 return <><button className="hud-toggle" aria-pressed={enabled} onClick={()=>setEnabled(!enabled)}>HUD {enabled?'ON':'OFF'}</button>{enabled&&<div className="cursor-hud" aria-hidden="true" style={{left:Math.min(position.x+20,typeof window==='undefined'?0:innerWidth-220),top:Math.min(position.y+22,typeof window==='undefined'?0:innerHeight-65)}}><span>X {position.x} / Y {position.y}</span><span>{position.speed} px/s</span></div>}</>;
}
