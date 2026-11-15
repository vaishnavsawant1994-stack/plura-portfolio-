import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile('index.html','utf8');
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
const labels=[...html.matchAll(/<label\s+for="([^"]+)"/g)].map(x=>x[1]);
const controls=[...html.matchAll(/<(?:input|select|textarea)\b[^>]*\sid="([^"]+)"/g)].map(x=>x[1]);

test('all document ids are unique',()=>{assert.equal(new Set(ids).size,ids.length);});
test('required form controls are labeled',()=>{for(const id of controls)assert.ok(labels.includes(id),`Unlabeled form control: ${id}`);});
test('main navigation anchors exist',()=>{for(const key of ['services','works','pricing','contact','faq'])assert.ok(ids.includes(key));});
test('one primary page heading and a main landmark',()=>{assert.equal([...html.matchAll(/<h1\b/g)].length,1);assert.match(html,/<main\s+id="main"/);});
test('no empty href or decorative link placeholders',()=>{assert.doesNotMatch(html,/href="#"|href=""/);});
test('new-window links protect opener',()=>{for(const match of html.matchAll(/<a\s+[^>]*target="_blank"[^>]*>/g))assert.match(match[0],/rel="noopener noreferrer"/);});
test('theme and mobile menu have accessible labels',()=>{assert.match(html,/id="theme-toggle"[^>]*aria-label=/);assert.match(html,/id="menu-toggle"[^>]*aria-expanded=/);});
test('portfolio images are explicitly identified as original conceptual art',()=>{assert.match(html,/role="img" aria-label="Original abstract/);});
