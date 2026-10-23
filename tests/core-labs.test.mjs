import test from 'node:test';
import assert from 'node:assert/strict';
import {meshWorld,meshEdges,meshRoute,meshStep,byteOperation} from '../lib/core-labs.mjs';
test('mesh routes around disabled relays and reports disconnection',()=>{
 const n=meshWorld(),first=meshRoute(n,0,4);assert.deepEqual(first,[0,7,4]);n[7].offline=true;
 const alternate=meshRoute(n,0,4);assert(alternate.length>3);assert(!alternate.includes(7));
 for(let i=1;i<alternate.length;i++)assert(meshEdges.some(([a,b])=>a===alternate[i-1]&&b===alternate[i]||b===alternate[i-1]&&a===alternate[i]));
 n.forEach(x=>{if(x.id!==0&&x.id!==4)x.offline=true;});assert.deepEqual(meshRoute(n,0,4),[]);assert.deepEqual(meshRoute(n,-1,4),[]);
});
test('spring network responds to a held mass and settles without escaping',()=>{
 const n=meshWorld();n[7].x=.8;const before=n[0].x;
 for(let i=0;i<100;i++)meshStep(n,.008,7);assert.equal(n[7].x,.8);assert(Math.abs(n[0].x-before)>.02);
 for(let i=0;i<2000;i++)meshStep(n);assert(n.every(p=>Number.isFinite(p.x)&&Math.abs(p.x)<=.94&&Math.abs(p.y)<=.86&&Math.hypot(p.vx,p.vy)<.01));
 assert.throws(()=>meshStep(n,1),RangeError);
});
test('all byte operations agree with unsigned arithmetic, including carry and changed bits',()=>{
 for(let n=0;n<256;n++){
  const add=byteOperation(n,'add');assert.equal(add.value,(n+1)%256);assert.equal(add.carry,n===255?1:0);assert.equal(add.changed,n^add.value);
  assert.equal(byteOperation(n,'left').value,(n*2)%256);assert.equal(byteOperation(n,'left').carry,n>=128?1:0);
  assert.equal(byteOperation(n,'right').value,Math.floor(n/2));assert.equal(byteOperation(n,'right').carry,n%2);
  assert.equal(byteOperation(byteOperation(n,'not').value,'not').value,n);
 }assert.throws(()=>byteOperation(256,'add'),RangeError);assert.throws(()=>byteOperation(1,'noop'),RangeError);
});
