import {parsePlaybackUrl,normalizeCatalog} from './detect.mjs';

export async function fetchCatalog(playbackUrl,{fetchImpl=fetch,timeout=8000}={}) {
  const page=parsePlaybackUrl(playbackUrl);
  if(!page)throw new Error('不是支持的 B 站番剧播放链接');
  const query=page.epId?`ep_id=${page.epId}`:`season_id=${page.seasonId}`;
  const url=`https://api.bilibili.com/pgc/view/web/season?${query}`;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try {
    const response=await fetchImpl(url,{signal:controller.signal,credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error(`B 站元数据暂不可用（HTTP ${response.status}）`);
    const body=await response.text();
    if(body.length>3000000)throw new Error('剧集元数据超过预期大小');
    return normalizeCatalog(JSON.parse(body));
  } catch(error) {
    if(error.name==='AbortError')throw new Error('B 站元数据请求超时');
    throw error;
  } finally {clearTimeout(timer);}
}
