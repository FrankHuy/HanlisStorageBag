import {inspectPlaybackPage} from './page-snapshot.mjs';
import {detectEpisode,normalizeCatalog,parsePlaybackUrl} from './lib/detect.mjs';
import {fetchCatalog} from './lib/bili-api.mjs';
import {resolveProgress,nearestRecordedChapter,changesForEpisode} from './lib/progress.mjs';
import {inventoryAt} from './lib/inventory.mjs';

const $=id=>document.getElementById(id);
const state={inventory:null,mapping:null,bundled:null,cache:null,overrides:{},mode:'before',view:'all',snapshot:null,detection:{status:'loading'},progress:{status:'unavailable'},network:'',method:'',manual:null,revision:0};
const hasChrome=!!globalThis.chrome?.scripting?.executeScript;
const demo=new URLSearchParams(location.search).get('demo');
const glyphs={bottle:'瓶',sword:'剑',scroll:'卷',shield:'盾',token:'令',herb:'灵',orb:'珠',boots:'履',array:'阵',beast:'兽',ding:'鼎',pen:'笔'};
const labels={gain:'获得',loss:'失去 / 消耗',move:'位置变化',observe:'持有确认',damage:'受损'};
const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
function link(label,url,className='') {
  const anchor=make('a',className,label);
  try {const parsed=new URL(url);if(parsed.protocol!=='https:' || !['hanli.hym.cc.cd','www.bidutuijian.com','rmji.wiki','developer.chrome.com'].includes(parsed.hostname))return make('span',className,label);anchor.href=parsed.href;}catch{return make('span',className,label);}
  anchor.target='_blank';anchor.rel='noreferrer';return anchor;
}
async function localGet(keys){try{return hasChrome?await chrome.storage.local.get(keys):{};}catch{return {};}}
async function localSet(values){if(hasChrome)await chrome.storage.local.set(values);}
const overrideKey=()=>state.detection.epId?String(state.detection.epId):null;

function updateProgress(){
  const key=overrideKey();
  const saved=key?state.overrides[key]:undefined;
  const override=state.manual ?? (saved && saved.episode===(state.detection.number??null)?saved.chapter:null);
  state.progress=resolveProgress(state.detection,state.mapping,{mode:state.mode,override});
}

function render(){
  const detected=state.detection;
  const recognized=detected.status==='recognized';
  const manual=state.progress.status==='manual';
  $('episode-id').textContent=detected.epId?`ep${detected.epId}`:'';
  $('status-dot').classList.toggle('warning',!recognized || manual);
  $('status-label').textContent=manual?'手动校准进度':recognized?'已识别当前正片':detected.status==='loading'?'正在识别播放页':'等待可靠进度';
  $('episode-title').textContent=recognized?`第 ${detected.number} 话 · ${detected.title}`:manual?'手动章节模式':'循着仙途，展开珍藏。';
  $('episode-subtitle').textContent=recognized?`凡人修仙传 · ${state.method}`:manual?'剧集信息尚不完整，当前按你选择的小说进度查询。':detected.message ?? '正在读取当前播放页…';
  $('network-note').textContent=state.network;
  $('network-note').hidden=!state.network;
  const progress=state.progress;
  const available=['mapped','manual'].includes(progress.status);
  $('progress-panel').hidden=!recognized && !manual;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode&&!manual)));
  $('chapter-label').textContent=available?`${manual?'手动参考':'参考进度'} · 本项目第 ${progress.chapter} 章`:'本集章节对应尚待收录';
  $('mapping-label').textContent=progress.status==='mapped'?`${state.mode==='before'?'按本集涉及的最早章节之前查询，可能少计已在动画中提前出现的物品。':'包含本集小说范围内的变动，可能涉及本集后段剧情。'} 对应范围 ${progress.row.chapterStart}—${progress.row.chapterEnd} 章。`:manual?'已使用手动值；恢复自动后按分集指南范围匹配。':'不对尚无对应的新集数线性外推。';
  $('mapping-source').hidden=progress.status!=='mapped';
  if(progress.status==='mapped')$('mapping-source').href=progress.source;
  $('collection').hidden=!available;
  $('empty-state').hidden=available || detected.status==='loading';
  $('empty-calibrate').hidden=!['recognized','unknown-episode'].includes(detected.status);
  if(!available && detected.status!=='loading'){
    $('empty-title').textContent=progress.status==='unmapped'?'集数已找到，章节还在考据':detected.status==='not-main-episode'?'这段不是动画正片':'先找准这一段仙途';
    $('empty-message').textContent=progress.message ?? detected.message ?? '请在 B 站番剧页中点击插件按钮。';
  }
  if(available){
    const held=inventoryAt(state.inventory.events,progress.chapter);
    $('held-count').textContent=String(held.length);
    const nearest=nearestRecordedChapter(state.inventory.events,progress.chapter);
    $('recorded-through').textContent=nearest?`此进度最近已录节点：第 ${nearest} 章 · 共 ${state.inventory.events.length} 处考据`:'此进度之前尚无已收录物品';
    $('web-link').href=`https://hanli.hym.cc.cd/?chapter=${nearest || state.inventory.events[0].chapter}`;
    renderItems(held);
  }
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
}

function renderItems(held){
  const container=$('items');container.replaceChildren();
  const query=$('search').value.trim();
  const byId=new Map(state.inventory.items.map(item=>[item.id,item]));
  if(state.view==='changes'){
    if(state.progress.mode!=='after' || state.progress.status!=='mapped'){
      container.append(make('p','list-empty','选择“看完本集后”可查看对应小说范围内已收录的变动。'));return;
    }
    const rows=changesForEpisode(state.inventory.events,state.progress).flatMap(event=>event.changes.map(change=>({event,change})));
    for(const {event,change} of rows){
      const item=byId.get(change.itemId);if(!item || !item.name.includes(query))continue;
      const button=make('button',`item change-${change.type}`);button.type='button';
      button.append(make('span','item-icon',glyphs[item.icon] ?? '物'));
      const info=make('span','item-info');info.append(make('span','item-name',item.name),make('span','item-meta',`第 ${event.chapter} 章 · ${change.partial?'部分损耗':labels[change.type]}`));
      button.append(info,make('span','item-quantity',change.amount?`${change.amount.toLocaleString('zh-CN')} ${change.unit??''}`:labels[change.type]));
      button.addEventListener('click',()=>showItem(item));container.append(button);
    }
    if(!container.children.length)container.append(make('p','list-empty','本集参考范围暂无已收录的对应变动；不代表本集没有物品变化。'));
    return;
  }
  for(const holding of held){
    const item=byId.get(holding.itemId);if(!item || !item.name.includes(query) || (state.view==='bag' && holding.storage!=='储物袋'))continue;
    const button=make('button','item');button.type='button';
    button.append(make('span','item-icon',glyphs[item.icon] ?? '物'));
    const info=make('span','item-info');const name=make('span','item-name',item.name);if(holding.damaged)name.append(make('span','tag','受损'));
    info.append(name,make('span','item-meta',`${holding.storage} · 最近确认第 ${holding.lastChapter} 章`));
    button.append(info,make('span','item-quantity',holding.amount===undefined?'数量未明':`${holding.amount.toLocaleString('zh-CN')} ${holding.unit??'件'}`));
    button.addEventListener('click',()=>showItem(item));container.append(button);
  }
  if(!container.children.length)container.append(make('p','list-empty',state.view==='bag'?'该进度暂无符合筛选的袋内确认记录，其他物品可能贴身携带或在别处存放。':'此进度暂无符合筛选的物品记录。'));
}

function showItem(item){
  const content=$('detail-content');content.replaceChildren(make('h2','detail-heading',item.name));
  // Show only evidence already reached, rather than a global description containing later facts.
  const history=state.inventory.events.filter(e=>e.chapter<=state.progress.chapter && e.changes.some(c=>c.itemId===item.id));
  content.append(make('p','detail-copy',`${item.category} · 以下仅显示所选进度之前的已收录流水。`));
  for(const event of history){
    const entry=make('section','detail-history');entry.append(make('h4','',`第 ${event.chapter} 章 · ${event.chapterTitle}`));
    for(const change of event.changes.filter(c=>c.itemId===item.id))entry.append(make('p','',`${change.partial?'部分损耗':labels[change.type]} · ${change.note}`));
    entry.append(link('查看该章出处 ↗',event.source));content.append(entry);
  }
  $('detail').showModal();
}

function openCalibration(){
  $('calibration').hidden=false;$('chapter-input').value=String(state.progress.chapter ?? '');$('chapter-input').focus();
}

async function refresh(force=false){
  const revision=++state.revision;
  $('refresh').disabled=true;state.manual=null;state.network='';
  try{
    let snapshot;
    if(!hasChrome){
      if(!demo)throw new Error('请从 Chrome 扩展按钮打开。界面预览可使用 ?demo=197。');
      const number=Number(demo);const chosen=state.bundled.episodes.find(e=>e.number===number&&e.kind==='episode');
      if(!chosen)throw new Error('预览集数没有元数据。');
      snapshot={url:chosen.url,title:`凡人修仙传第${number}集`,series:{title:'凡人修仙传',seasonId:28747,mediaId:28223043}};
      state.network='界面预览模式：这不是对当前浏览器标签页的真实识别。';
    } else {
      const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
      if(!tab?.id || !parsePlaybackUrl(tab.url)){
        state.snapshot={url:tab?.url??''};state.detection=detectEpisode(state.snapshot);state.progress={status:'unavailable'};state.manual=null;$('calibration').hidden=true;render();return;
      }
      try {const results=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:inspectPlaybackPage});snapshot=results[0]?.result;}catch{snapshot={url:tab.url,title:tab.title??''};state.network='未能读取页面状态，尝试通过当前单集 ID 查询。';}
      if(!snapshot)snapshot={url:tab.url,title:tab.title??''};
    }
    if(revision!==state.revision)return;
    const changed=state.snapshot?.url!==snapshot.url;
    state.snapshot=snapshot;
    if(changed){state.view='all';$('search').value='';$('calibration').hidden=true;}
    const pageCatalogs=(snapshot.pageCatalogs??[]).flatMap(raw=>{try{return [normalizeCatalog(raw)];}catch{return [];}});
    state.detection=detectEpisode(snapshot,[...pageCatalogs,state.cache,state.bundled]);
    state.method=state.detection.method==='page-state'?'页面当前剧集信息':pageCatalogs.some(c=>c.episodes.some(e=>e.epId===state.detection.epId))?'页面剧集目录':'官方剧集目录快照';
    updateProgress();render();
    if(hasChrome && (force || state.detection.status==='unknown-episode')){
      try{
        const catalog=await fetchCatalog(snapshot.url);
        if(revision!==state.revision)return;
        state.cache=catalog;state.detection=detectEpisode(snapshot,[catalog,...pageCatalogs,state.bundled]);state.method='B 站公开剧集元数据';state.network='';
        await localSet({catalogCache:catalog});
      }catch(error){if(revision!==state.revision)return;state.network=`${error.message}。${state.detection.status==='recognized'?'已使用随包目录识别。':'可重试或手动校准。'}`;}
      updateProgress();render();
    }
  }catch(error){state.detection={status:'unknown-episode',message:error.message};state.progress={status:'unavailable'};render();}
  finally{if(revision===state.revision)$('refresh').disabled=false;}
}

$('refresh').addEventListener('click',()=>refresh(true));
$('calibrate').addEventListener('click',openCalibration);
$('empty-calibrate').addEventListener('click',openCalibration);
$('search').addEventListener('input',()=>render());
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;render();}));
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',async()=>{
  state.mode=button.dataset.mode;state.manual=null;const key=overrideKey();if(key)delete state.overrides[key];
  await localSet({mode:state.mode,chapterOverrides:state.overrides});updateProgress();render();
}));
$('calibration').addEventListener('submit',async event=>{
  event.preventDefault();const value=$('chapter-input').value.trim();const chapter=Number(value);
  if(!value || !Number.isInteger(chapter) || chapter<0 || chapter>2446){$('calibration-error').hidden=false;$('calibration-error').textContent='请输入 0—2446 之间的整数章号。';return;}
  $('calibration-error').hidden=true;state.manual=chapter;const key=overrideKey();
  if(key){state.overrides[key]={chapter,episode:state.detection.number??null};await localSet({chapterOverrides:state.overrides});}
  updateProgress();$('calibration').hidden=true;render();
});
$('clear-calibration').addEventListener('click',async()=>{state.manual=null;const key=overrideKey();if(key)delete state.overrides[key];await localSet({chapterOverrides:state.overrides});updateProgress();$('calibration').hidden=true;render();});
$('close-detail').addEventListener('click',()=>$('detail').close());
$('detail').addEventListener('click',event=>{if(event.target===$('detail'))$('detail').close();});
$('help').addEventListener('click',()=>{
  const content=$('detail-content');content.replaceChildren(make('h2','detail-heading','随集而行，考据有界'));
  for(const text of ['在 B 站打开凡人修仙传的正片，点击工具栏插件图标即可识别；切换剧集后再次打开或点刷新。','默认按“本集开始前”查询。选“看完本集后”会包含当集参考章节的变化。章节范围来自第三方指南，动漫可能重排情节；不是按视频播放秒数推算。','复用网站的45个关键节点、70种物品，尚非完整库存；旧记录可能在未考据章节中发生变化。只有明确位置为储物袋的记录才进入“袋内确认”。','读取权限仅在点击插件时用于当前页。只向 api.bilibili.com 请求公开剧集信息，不发送页面文本、Cookie 或观看记录；物品记录、校准与缓存保存在本机。'])content.append(make('p','detail-copy',text));
  content.append(link('动画与小说进度依据 · 凡人百科 ↗','https://rmji.wiki/zh/episodes/','detail-copy'),make('p','detail-copy',`数据快照：${state.inventory.updatedAt}；分集表：${state.mapping.updatedAt}，已收录至第 ${Math.max(...state.mapping.episodes.map(e=>e.episode))} 集。新集元数据可动态识别，章节表需随版本更新。`));
  $('detail').showModal();
});

try{
  const [inventory,mapping,bundled,saved]=await Promise.all([fetch('data/inventory.json').then(r=>r.json()),fetch('data/episode-map.json').then(r=>r.json()),fetch('data/bili-catalog.json').then(r=>r.json()),localGet(['mode','chapterOverrides','catalogCache'])]);
  state.inventory=inventory;state.mapping=mapping;state.bundled=normalizeCatalog(bundled);state.cache=saved.catalogCache??null;state.overrides=saved.chapterOverrides??{};state.mode=saved.mode==='after'?'after':'before';
  await refresh();
  if(hasChrome)setInterval(async()=>{if($('refresh').disabled)return;try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(tab?.url!==state.snapshot?.url)await refresh();}catch{/* Popup closed or tab unavailable. */}},2500);
}catch(error){$('status-label').textContent='插件数据加载失败';$('episode-title').textContent='请重新加载插件';$('episode-subtitle').textContent=error.message;$('refresh').disabled=true;}
