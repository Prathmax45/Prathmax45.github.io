import test from 'node:test';
import assert from 'node:assert/strict';
import {magneticWorld,magneticStep,borisStep,rigidWorld,rigidStep,rigidEnergy,rigidMomentum} from '../lib/uncommon-physics.mjs';
test('magnetic force bends opposite charges symmetrically without changing speed',()=>{
 const a={x:-.5,y:0,vx:1.4,vy:0,charge:1,mass:1},b={...a,charge:-1},neutral={...a,charge:0},field={x:0,y:0,strength:4,radius:.7};
 for(let i=0;i<180;i++){borisStep(a,.008,field);borisStep(b,.008,field);borisStep(neutral,.008,field);}
 assert(Math.abs(Math.hypot(a.vx,a.vy)-1.4)<1e-12);assert(Math.abs(a.y+b.y)<1e-10);assert(Math.abs(a.x-b.x)<1e-10);assert(Math.abs(a.y)>.3);assert.equal(neutral.y,0);
 assert.throws(()=>borisStep(a,1,field),RangeError);
 const w=magneticWorld();for(let i=0;i<1800;i++)magneticStep(w);assert(w.particles.every(p=>Number.isFinite(p.x)&&p.trail.length<=110));
});
test('rigid body conserves energy and world angular momentum; only middle-axis release flips',()=>{
 for(const axis of [0,1,2]){
  const w=rigidWorld(axis),energy=rigidEnergy(w.state),momentum=rigidMomentum(w.state);
  for(let i=0;i<5000;i++)rigidStep(w);
  assert(Math.abs(rigidEnergy(w.state)-energy)<1e-6);assert(Math.hypot(...rigidMomentum(w.state).map((v,i)=>v-momentum[i]))<1e-5);
  assert(Math.abs(Math.hypot(...w.state.slice(3))-1)<1e-12);
  assert(axis===1?w.flips>=2:w.flips===0,`axis ${axis}: ${w.flips} flips`);
 }assert.throws(()=>rigidWorld(4),RangeError);
});
