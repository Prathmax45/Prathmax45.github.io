import test from 'node:test';
import assert from 'node:assert/strict';
import { respond } from '../lib/terminal.mjs';
test('shell commands expose verified content and navigate to real sections',()=>{
 assert.match(respond('CONTACT').text,/prathmeshkanure@gmail.com/);
 assert.match(respond('projects').text,/velocity Verlet/);
 assert.equal(respond(' run   cpu ').target,'cpu-notebook');
 assert.equal(respond('run orbit').target,'hero-core');
 assert.equal(respond('clear').clear,true);
 assert.match(respond('<img src=x onerror=alert(1)>').text,/Unknown command/);
});
