import {test} from 'node:test';
import assert from 'node:assert/strict';
import {basketTotal} from './model.js';
import {escapeHTML} from './common.js';
test('core workflow and failure cases',()=>{assert.equal(basketTotal({rice:2,lentil:1},0),240);assert.equal(basketTotal({},1),0);assert.throws(()=>basketTotal({rice:-1},0));assert.throws(()=>basketTotal({rice:Infinity},0));assert.throws(()=>basketTotal({},2));assert.equal(basketTotal({rice:0.1},1),6.2);});
test('escape untrusted text',()=>{assert.equal(escapeHTML('<script>'), '&lt;script&gt;');});
