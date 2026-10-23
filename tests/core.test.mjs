import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, advance, frameAt, cleanRepos } from '../lib/demo.mjs';
test('instruction sequence loads, computes, transfers, and halts', () => {
 let state = initialState();
 state = advance(state); assert.equal(state.a,12); assert.equal(state.b,0);
 state = advance(state); assert.equal(state.b,30);
 state = advance(state); assert.equal(state.result,42); assert.equal(state.received,0);
 state = advance(state); assert.equal(state.received,0);
 state = advance(state); assert.equal(state.received,42); assert.equal(advance(state),state);
 assert.deepEqual(initialState(),{step:0,inputA:12,inputB:30,a:0,b:0,result:0,received:0,carry:false,message:'Ready. Load two values into the processor.'});
});
test('8-bit overflow and invalid inputs are explicit', () => {
 let state=initialState(250,20); for(let i=0;i<5;i++) state=advance(state);
 assert.equal(state.result,14); assert.equal(state.received,14); assert.equal(state.carry,true);
 for(const input of [-1,256,3.5,NaN]) assert.throws(()=>initialState(input,0),RangeError);
});
test('scrubbing clamps and reverses predictably', () => {
 assert.equal(frameAt(-1,144),0); assert.equal(frameAt(1.5,144),143);
 assert.equal(frameAt(.5,144),72); assert.equal(frameAt(0,144),0); assert.equal(frameAt(NaN,144),0);
});
test('public feed validates destinations, dates, and fork status', () => {
 const good={name:'Project',html_url:'https://github.com/Prathmax45/Project',updated_at:'2026-07-09T17:15:25Z',language:'C',fork:false};
 assert.equal(cleanRepos([good,{...good,html_url:'javascript:alert(1)'},{...good,html_url:'https://github.com/another/Project'},{...good,updated_at:'invalid'},{...good,fork:true}]).length,1);
 assert.throws(()=>cleanRepos({}),TypeError);
});
