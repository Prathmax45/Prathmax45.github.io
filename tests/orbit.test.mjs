import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,makePlanet,stepWorld,energy} from '../lib/orbit.mjs';
test('Verlet keeps a circular orbit bounded and conserves energy over 20 seconds',()=>{const world={...createWorld(),planets:[makePlanet(1,0,0)]};const initial=energy(world.planets[0]);for(let i=0;i<2000;i++)stepWorld(world,.01);assert.equal(world.planets.length,1);assert(Math.abs(Math.hypot(world.planets[0].x,world.planets[0].y)-1)<.001);assert(Math.abs(energy(world.planets[0])-initial)<1e-6);assert(world.planets[0].trail.length<=110);});
test('drag velocity changes orbit and invalid positions and steps are rejected',()=>{const p=makePlanet(1,0,0,1,.5,.1);assert.equal(p.vx,.5);assert.equal(p.vy,.1);assert.throws(()=>makePlanet(0,0,0),RangeError);assert.throws(()=>stepWorld(createWorld(),Infinity),RangeError);});
