import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveProgress,changesForEpisode} from '../src/lib/progress.mjs';
import {detectEpisode,normalizeCatalog} from '../src/lib/detect.mjs';
import {inventoryAt} from '../src/lib/inventory.mjs';
const load=async name=>JSON.parse(await readFile(new URL('../data/'+name,import.meta.url),'utf8'));
const [mapping,inventory,catalogRaw]=await Promise.all([load('episode-map.json'),load('inventory.json'),load('bili-catalog.json')]);
const detection=detectEpisode({url:'https://www.bilibili.com/bangumi/play/ep3854821'},[normalizeCatalog(catalogRaw)]);
test('all 197 reference episode ranges are present and valid',()=>{
  assert.equal(mapping.episodes.length,197);
  for(let n=1;n<=197;n++){const row=mapping.episodes.find(e=>e.episode===n);assert.ok(row);assert.ok(row.chapterStart<=row.chapterEnd);}
});
test('episode 197 reconciles displayed reference numbers with the inventory chapter scheme',()=>{
  const before=resolveProgress(detection,mapping);const after=resolveProgress(detection,mapping,{mode:'after'});
  assert.equal(before.chapter,746);assert.equal(after.chapter,749);assert.equal(before.row.referenceStart,744);
});
test('episode detection beyond known mappings stays unmapped rather than extrapolating',()=>{
  assert.equal(resolveProgress({...detection,number:198},mapping).status,'unmapped');
  assert.equal(resolveProgress({...detection,number:198},mapping,{override:752}).chapter,752);
});
test('manual overrides never turn unrelated pages or trailers into a main episode',()=>{
  assert.equal(resolveProgress({status:'unsupported-page'},mapping,{override:2446}).status,'unavailable');
  assert.equal(resolveProgress({status:'not-main-episode'},mapping,{override:2446}).status,'unavailable');
  assert.equal(resolveProgress(detection,mapping,{override:9999}).status,'mapped');
});
test('current episode inventory includes established gear and excludes later acquisition spoilers',()=>{
  const progress=resolveProgress(detection,mapping);const held=inventoryAt(inventory.events,progress.chapter);
  assert.ok(held.some(e=>e.itemId==='bamboo-swords'));assert.ok(held.some(e=>e.itemId==='wind-wings'));assert.ok(held.some(e=>e.itemId==='frost-centipedes'));
  for(const id of ['heaven-vine','heaven-sword','polar-crystal','jade-inner-page'])assert.equal(held.some(e=>e.itemId===id),false);
});
test('before mode never exposes this episode changes and after mode stays within the mapped range',()=>{
  const before=resolveProgress(detection,mapping);assert.equal(changesForEpisode(inventory.events,before).length,0);
  const after=resolveProgress({status:'recognized',number:166},mapping,{mode:'after'});
  for(const e of changesForEpisode(inventory.events,after))assert.ok(e.chapter>=after.row.chapterStart&&e.chapter<=after.row.chapterEnd);
});
test('inventory snapshot retains consumption, gifting and damage semantics from the web project',()=>{
  assert.equal(inventoryAt(inventory.events,190).some(e=>e.itemId==='thunder'),false);
  assert.equal(inventoryAt(inventory.events,1265).some(e=>e.itemId==='human-puppet'),false);
  assert.equal(inventoryAt(inventory.events,2440).some(e=>e.itemId==='dao-fruit'),false);
  assert.equal(inventoryAt(inventory.events,2446).find(e=>e.itemId==='heaven-sword').damaged,true);
});
