import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {parsePlaybackUrl,normalizeEpisode,normalizeCatalog,detectEpisode} from '../src/lib/detect.mjs';
import {fetchCatalog} from '../src/lib/bili-api.mjs';
import {inspectPlaybackPage} from '../src/page-snapshot.mjs';
const fixture=JSON.parse(await readFile(new URL('fixtures/bili-197.json',import.meta.url),'utf8'));
const raw=JSON.parse(await readFile(new URL('../data/bili-catalog.json',import.meta.url),'utf8'));
const catalog=normalizeCatalog(raw);

test('supports different episode ids, season links, query strings and fragments',()=>{
  assert.equal(parsePlaybackUrl(fixture.pageUrl+'?from=search#reply').epId,3854821);
  assert.equal(parsePlaybackUrl('https://www.bilibili.com/bangumi/play/ep123456').epId,123456);
  assert.equal(parsePlaybackUrl('https://www.bilibili.com/bangumi/play/ss28747').seasonId,28747);
});
test('rejects unrelated, spoofed and executable URLs',()=>{
  for(const url of ['javascript:alert(1)','https://www.bilibili.com.evil.test/bangumi/play/ep3854821','https://evil.test/bangumi/play/ep3854821','https://www.bilibili.com/video/BV123','chrome://extensions/','http://www.bilibili.com/bangumi/play/ep1'])assert.equal(parsePlaybackUrl(url),null);
});
test('actual ep3854821 metadata resolves to main episode 197, not season-local 21',()=>{
  const detected=detectEpisode({url:fixture.pageUrl},[catalog]);
  assert.equal(detected.status,'recognized');assert.equal(detected.number,197);assert.equal(detected.title,'慕兰之战21');
});
test('previews with numeric title 198 are explicitly rejected',()=>{
  assert.equal(normalizeEpisode(fixture.trailer).kind,'trailer');
  assert.equal(detectEpisode({url:'https://www.bilibili.com/bangumi/play/ep4292442'},[catalog]).status,'not-main-episode');
});
test('all main episodes 1 through 197 include official remastered replacements',()=>{
  const main=catalog.episodes.filter(e=>e.kind==='episode');
  assert.equal(main.length,197);
  for(let n=1;n<=197;n++)assert.ok(main.some(e=>e.number===n));
  assert.equal(detectEpisode({url:'https://www.bilibili.com/bangumi/play/ep733316'},[catalog]).number,1);
});
test('URL current episode overrides stale page state after SPA navigation',()=>{
  const detected=detectEpisode({url:fixture.pageUrl,currentEpisode:{id:3854820,title:'196'},series:{title:'凡人修仙传',seasonId:28747,mediaId:28223043}},[catalog]);
  assert.equal(detected.number,197);
});
test('a season URL never uses the latest published episode as current progress',()=>{
  assert.equal(detectEpisode({url:'https://www.bilibili.com/bangumi/play/ss28747'},[catalog]).status,'unknown-episode');
  assert.equal(detectEpisode({url:'https://www.bilibili.com/bangumi/play/ss28747',activeEpId:3854821},[catalog]).number,197);
});
test('unverified title strings cannot impersonate a main episode',()=>{
  assert.equal(detectEpisode({url:'https://www.bilibili.com/bangumi/play/ep9999999',title:'凡人修仙传第197集'},[catalog]).status,'unknown-episode');
  assert.throws(()=>normalizeCatalog({season_id:123,media_id:456,title:'凡人修仙传',episodes:[]}),/不是/);
  assert.throws(()=>normalizeCatalog({season_id:28747,media_id:28223043,title:'别的动画',episodes:[]}),/不是/);
});
test('reliable page state supports episode ids not in the bundled list',()=>{
  const detected=detectEpisode({url:'https://www.bilibili.com/bangumi/play/ep9000000',series:{title:'凡人修仙传',seasonId:28747,mediaId:28223043},currentEpisode:{id:9000000,title:'199',long_title:'后续正片',section_type:0}},[catalog]);
  assert.equal(detected.status,'recognized');assert.equal(detected.number,199);
});
test('fetches only the fixed Bilibili API endpoint without cookies',async()=>{
  let called;
  const result=await fetchCatalog(fixture.pageUrl,{fetchImpl:async(url,options)=>{called={url,options};return {ok:true,text:async()=>JSON.stringify({code:0,result:{...fixture.nextSeason,episodes:[fixture.episode]}})};}});
  assert.equal(called.url,'https://api.bilibili.com/pgc/view/web/season?ep_id=3854821');
  assert.equal(called.options.credentials,'omit');assert.equal(called.options.redirect,'error');assert.equal(result.episodes[0].number,197);
  await assert.rejects(fetchCatalog('https://evil.test/'),/不是支持/);
});
test('API errors and timeouts are explicit and do not invent an episode',async()=>{
  await assert.rejects(fetchCatalog(fixture.pageUrl,{fetchImpl:async()=>({ok:false,status:412})}),/412/);
  await assert.rejects(fetchCatalog(fixture.pageUrl,{timeout:5,fetchImpl:(_,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error(),{name:'AbortError'}))))}),/超时/);
});
test('Next.js snapshot handles the metadata structure observed on the live Bilibili page',()=>{
  const next=JSON.stringify({props:{pageProps:{dehydratedState:{queries:[{state:{data:{...fixture.nextSeason}}}]}}}});
  const snapshot=runInNewContext(`(${inspectPlaybackPage.toString()})()`,{location:{href:fixture.pageUrl},window:{},document:{title:fixture.title,querySelector:selector=>selector==='script#__NEXT_DATA__'?{textContent:next}:null}});
  assert.equal(snapshot.url,fixture.pageUrl);assert.equal(snapshot.series.seasonId,28747);assert.equal(snapshot.series.mediaId,28223043);assert.equal(detectEpisode(snapshot,[catalog]).number,197);
});
