import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
export async function checkProject(){
  const json=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
  const manifest=await json('manifest.json');const inventory=await json('data/inventory.json');const mapping=await json('data/episode-map.json');
  assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,['activeTab','scripting','storage']);
  assert.deepEqual(manifest.host_permissions,['https://api.bilibili.com/*']);
  const ids=new Set(inventory.items.map(i=>i.id));assert.equal(ids.size,inventory.items.length);
  for(const e of inventory.events)for(const c of e.changes)assert.ok(ids.has(c.itemId),c.itemId);
  const episodeIds=new Set();for(const e of mapping.episodes){assert.ok(!episodeIds.has(e.episode));episodeIds.add(e.episode);assert.ok(e.chapterStart>=1&&e.chapterEnd>=e.chapterStart&&e.chapterEnd<=2446);}
  const html=await readFile(new URL('popup.html',root),'utf8');assert.ok(!/<script(?![^>]*\bsrc=)/i.test(html),'No inline scripts');
  console.log(`Validated MV3 permissions, ${inventory.items.length} items, ${inventory.events.length} events and ${mapping.episodes.length} episode mappings.`);
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)await checkProject();
