import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Execute the real popup module and user events against a small DOM harness.
// This covers extension interaction logic; Chrome permissions and layout still need browser QA.
test('popup recognizes the supplied episode, filters, calibrates per episode and clears stale state on navigation',async()=>{
  class Element {
    constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.handlers={};this.attributes={};this.value='';this.hidden=false;this.disabled=false;this._text='';this.classList={toggle:()=>{}};}
    set textContent(value){this._text=String(value);this.children=[];}
    get textContent(){return this._text+this.children.map(c=>c.textContent??'').join('');}
    append(...children){this.children.push(...children);}
    replaceChildren(...children){this._text='';this.children=[...children];}
    addEventListener(type,handler){(this.handlers[type]??=[]).push(handler);}
    setAttribute(name,value){this.attributes[name]=value;}
    focus(){}
    showModal(){this.open=true;}
    close(){this.open=false;}
    async event(type){for(const handler of this.handlers[type]??[])await handler({target:this,preventDefault(){}});}
  }
  const html=await readFile(new URL('../popup.html',import.meta.url),'utf8');
  const elements=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
  const modes=['before','after'].map(mode=>{const e=new Element('button');e.dataset.mode=mode;return e;});
  const views=['all','bag','changes'].map(view=>{const e=new Element('button');e.dataset.view=view;return e;});
  globalThis.document={getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),querySelectorAll:selector=>selector==='[data-mode]'?modes:selector==='[data-view]'?views:[]};
  globalThis.location={search:''};
  let activeUrl='https://www.bilibili.com/bangumi/play/ep3854821';let poll;const saved={};const requests=[];
  const catalog=JSON.parse(await readFile(new URL('../data/bili-catalog.json',import.meta.url),'utf8'));
  globalThis.chrome={tabs:{query:async()=>[{id:7,url:activeUrl}]},scripting:{executeScript:async options=>{assert.equal(options.world,'MAIN');return [{result:{url:activeUrl,series:{title:'凡人修仙传',seasonId:28747,mediaId:28223043}}}];}},storage:{local:{get:async()=>saved,set:async values=>Object.assign(saved,structuredClone(values))}}};
  const originalInterval=globalThis.setInterval;
  globalThis.setInterval=callback=>{poll=callback;return 0;};
  globalThis.fetch=async(url,options)=>{
    if(String(url).startsWith('https://api.bilibili.com/')){
      requests.push({url,options});const data=structuredClone(catalog);
      data.result.episodes.push({id:9000000,title:'199',long_title:'新的动画正片',section_type:0});
      return {ok:true,text:async()=>JSON.stringify(data)};
    }
    const value=JSON.parse(await readFile(new URL('../'+url,import.meta.url),'utf8'));return {ok:true,json:async()=>value};
  };
  try{
    await import('../src/popup.mjs');
    const get=id=>elements.get(id);
    assert.match(get('episode-title').textContent,/第 197 话/);
    assert.match(get('chapter-label').textContent,/746/);
    assert.equal(get('collection').hidden,false);
    assert.ok(get('items').children.some(c=>c.textContent.includes('风雷翅')));
    await views.find(e=>e.dataset.view==='bag').event('click');
    assert.equal(get('items').children.some(c=>c.textContent.includes('风雷翅')),false);
    await get('calibrate').event('click');get('chapter-input').value='190';await get('calibration').event('submit');
    assert.match(get('chapter-label').textContent,/手动参考.*190/);
    assert.equal(saved.chapterOverrides['3854821'].chapter,190);
    assert.equal(get('items').children.some(c=>c.textContent.includes('风雷翅')),false);
    activeUrl='https://www.bilibili.com/bangumi/play/ep733316';await poll();
    assert.match(get('episode-title').textContent,/第 1 话/);
    assert.match(get('chapter-label').textContent,/第 0 章/);
    activeUrl='https://www.bilibili.com/bangumi/play/ep9000000';await poll();
    assert.match(get('episode-title').textContent,/第 199 话/);
    assert.equal(get('collection').hidden,true);
    assert.match(get('empty-title').textContent,/章节还在考据/);
    assert.equal(requests[0].options.credentials,'omit');
    activeUrl='https://example.com/';await poll();
    assert.equal(get('collection').hidden,true);
    assert.match(get('episode-subtitle').textContent,/B 站/);
  }finally{globalThis.setInterval=originalInterval;}
});
