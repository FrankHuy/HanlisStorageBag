import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { inventoryAt } from './inventory.ts';
import { events } from '../data/events.ts';
import { itemById, items } from '../data/items.ts';
import type { StoryEvent } from '../data/types.ts';
test('data is ordered, unique and references existing items with chapter sources',()=>{
  assert.equal(new Set(events.map(e=>e.id)).size,events.length);
  assert.deepEqual(events.map(e=>e.chapter),events.map(e=>e.chapter).toSorted((a,b)=>a-b));
  for(const event of events){assert.match(event.source,/^https:\/\/www\.bidutuijian\.com\/books\/FanRenXiuXianChuan\/\d{4}\.html$/); for(const c of event.changes)assert.ok(itemById[c.itemId]);}
  assert.equal(new Set(items.map(i=>i.id)).size,items.length);
});
test('chapter cutoff excludes future gains and does not apply later movement',()=>{
  assert.equal(inventoryAt(events,9).length,0);
  assert.equal(inventoryAt(events,91).find(i=>i.itemId==='sword-talisman')?.storage,'位置未明');
  assert.equal(inventoryAt(events,92).find(i=>i.itemId==='sword-talisman')?.storage,'贴身携带');
  assert.equal(inventoryAt(events,190).some(i=>i.itemId==='ding'),false);
});
test('consumed thunder is removed, unknown losses never create negative inventory',()=>{
  assert.equal(inventoryAt(events,165).find(i=>i.itemId==='thunder')?.amount,1);
  const held=inventoryAt(events,190);
  for(const id of ['thunder','hook','rope','flight'])assert.equal(held.some(i=>i.itemId===id),false);
  assert.equal(held.find(i=>i.itemId==='boots')?.amount,1);
});
test('container movement does not duplicate gains, separate containers stay separate',()=>{
  assert.equal(inventoryAt(events,189).find(i=>i.itemId==='blades')?.amount,1);
  assert.equal(inventoryAt(events,189).find(i=>i.itemId==='blades')?.storage,'储物袋');
  const held=inventoryAt(events,415);
  assert.equal(inventoryAt(events,271).find(i=>i.itemId==='spider-eggs')?.storage,'灵兽袋');
  assert.equal(held.some(i=>i.itemId==='spider-eggs'),false);
  assert.equal(held.find(i=>i.itemId==='spiders')?.amount,2);
  assert.equal(held.find(i=>i.itemId==='bamboo-swords')?.storage,'体内温养');
  assert.equal(held.find(i=>i.itemId==='bamboo-swords')?.amount,72);
  assert.equal(held.find(i=>i.itemId==='beads')?.amount,undefined);
});
test('later story spans the ending and preserves actual source URLs instead of guessing chapter paths',()=>{
  assert.equal(events.at(-1)?.chapter,2446);
  for(const arc of ['重返天南','大晋行纪','灵界初临','魔界之行','飞升仙界'])assert.ok(events.some(e=>e.arc===arc));
  assert.ok(events.find(e=>e.chapter===1535)?.source.endsWith('/1430.html'));
  assert.ok(events.find(e=>e.chapter===2446)?.source.endsWith('/2015.html'));
});
test('gifts, flight and transformations remove obsolete holdings without removing the unrelated virtual heaven cauldron',()=>{
  assert.ok(inventoryAt(events,1264).some(h=>h.itemId==='human-puppet'));
  const crossing=inventoryAt(events,1265);
  assert.equal(crossing.some(h=>h.itemId==='human-puppet'),false);
  assert.ok(crossing.some(h=>h.itemId==='ding'));
  assert.ok(inventoryAt(events,671).some(h=>h.itemId==='frost-centipedes'));
  assert.equal(inventoryAt(events,1294).some(h=>h.itemId==='frost-centipedes'),false);
  assert.equal(inventoryAt(events,1535).find(h=>h.itemId==='bamboo-swords')?.amount,72);
});
test('same-chapter gains and consumption leave neither the dao fruit nor redeemed tokens in inventory',()=>{
  const late=inventoryAt(events,2440);
  assert.equal(late.some(h=>h.itemId==='dao-fruit'),false);
  assert.equal(late.some(h=>h.itemId==='dao-tokens'),false);
  assert.equal(late.find(h=>h.itemId==='jade-inner-page')?.storage,'储物镯');
});
test('unknown partial losses preserve a group, observations may initialize records, and damage retains a damaged relic',()=>{
  assert.ok(inventoryAt(events,551).some(h=>h.itemId==='gold-bugs'));
  assert.equal(inventoryAt(events,551).find(h=>h.itemId==='gold-bugs')?.amount,undefined);
  assert.equal(inventoryAt(events,1327).find(h=>h.itemId==='heaven-fruit')?.amount,1);
  assert.equal(inventoryAt(events,2103).find(h=>h.itemId==='pure-lotus')?.amount,undefined);
  assert.equal(inventoryAt(events,494).find(h=>h.itemId==='spiders')?.amount,undefined);
  const ending=inventoryAt(events,2446);
  assert.equal(ending.find(h=>h.itemId==='heaven-sword')?.damaged,true);
  assert.equal(ending.find(h=>h.itemId==='crab-puppet')?.storage,'灵兽环');
});
test('partial consumption preserves a remainder and removes zero balance',()=>{
  const fixture:StoryEvent[]=[{...events[0],changes:[{itemId:'bottle',type:'gain',amount:3,note:''}]},{...events[1],changes:[{itemId:'bottle',type:'loss',amount:2,note:''}]},{...events[2],changes:[{itemId:'bottle',type:'loss',amount:1,note:''}]}];
  assert.equal(inventoryAt(fixture,91)[0].amount,1);
  assert.equal(inventoryAt(fixture,92).length,0);
});
