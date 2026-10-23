import test from 'node:test';
import assert from 'node:assert/strict';
import {gravityWorld,gravityStep,gravityEnergy,launchBody,waveWorld,waveStep,waveImpulse,waveWall,pendulumWorld,pendulumStep,pendulumEnergy} from '../lib/physics.mjs';
test('mutual gravity conserves momentum and total energy along an unperturbed orbit',()=>{
 const w=gravityWorld(),e=gravityEnergy(w);for(let i=0;i<2500;i++)gravityStep(w);
 for(const axis of ['vx','vy'])assert.ok(Math.abs(w.bodies.reduce((sum,b)=>sum+b.mass*b[axis],0))<1e-10);
 assert.ok(Math.abs((gravityEnergy(w)-e)/e)<.003);
 assert.equal(launchBody(w,NaN,0,0,0),false);assert.equal(launchBody(w,4,0,0,0),false);
 assert.ok(launchBody(w,1,0,20,0));assert.equal(w.bodies[3].vx,3);
 while(w.bodies.length<12)launchBody(w,1,0,0,1);assert.equal(launchBody(w,1,0,0,1),false);
});
test('wave equilibrium stays still; impulses propagate, walls stay fixed and fields remain finite',()=>{
 const w=waveWorld(80,60);w.source=false;for(let i=0;i<20;i++)waveStep(w);assert.ok(w.u.every(v=>v===0));
 waveImpulse(w,.2,.5);for(let i=0;i<90;i++)waveStep(w);
 assert.ok(w.u.some(v=>Math.abs(v)>.001));assert.ok(Math.abs(w.u[30*80+30])>.00001);
 for(let y=0;y<w.height;y++)for(let x=0;x<w.width;x++)if(waveWall(w,x,y))assert.equal(w.u[y*w.width+x],0);
 for(let i=0;i<1000;i++)waveStep(w);assert.ok(w.u.every(v=>Number.isFinite(v)&&Math.abs(v)<10));
 assert.throws(()=>waveWorld(0,0),RangeError);
});
test('nonlinear pendulums conserve energy and amplify a small initial change',()=>{
 const w=pendulumWorld(),e=pendulumEnergy(w.states[0]);for(let i=0;i<4000;i++)pendulumStep(w);
 assert.ok(Math.abs(pendulumEnergy(w.states[0])-e)<.003);
 assert.ok(w.states.flat().every(Number.isFinite));assert.ok(Math.abs(w.states[0][0]-w.states[1][0])>.01);
 const same=pendulumWorld(2.15,0);for(let i=0;i<100;i++)pendulumStep(same);assert.deepEqual(same.states[0],same.states[1]);
 const still=pendulumWorld(0,0);still.states=[[0,0,0,0],[0,0,0,0]];pendulumStep(still);assert.deepEqual(still.states[0],[0,0,0,0]);
});
