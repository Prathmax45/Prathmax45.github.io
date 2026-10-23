import test from 'node:test';
import assert from 'node:assert/strict';
import {gravityWorld,gravityStep,gravityEnergy,launchBody} from '../lib/physics.mjs';
test('mutual gravity conserves momentum and total energy along an unperturbed orbit',()=>{
 const w=gravityWorld(),e=gravityEnergy(w);for(let i=0;i<2500;i++)gravityStep(w);
 for(const axis of ['vx','vy'])assert.ok(Math.abs(w.bodies.reduce((sum,b)=>sum+b.mass*b[axis],0))<1e-10);
 assert.ok(Math.abs((gravityEnergy(w)-e)/e)<.003);
 assert.equal(launchBody(w,NaN,0,0,0),false);assert.equal(launchBody(w,4,0,0,0),false);
 assert.ok(launchBody(w,1,0,20,0));assert.equal(w.bodies[3].vx,3);
 while(w.bodies.length<12)launchBody(w,1,0,0,1);assert.equal(launchBody(w,1,0,0,1),false);
});
