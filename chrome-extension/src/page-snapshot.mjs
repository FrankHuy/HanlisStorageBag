// Serialized by chrome.scripting; keep this function self-contained and read-only.
export function inspectPlaybackPage() {
  const text=value=>typeof value==='string'?value.slice(0,300):'';
  const episode=value=>value && typeof value==='object'?{id:value.id,ep_id:value.ep_id,title:text(value.title),long_title:text(value.long_title ?? value.longTitle),show_title:text(value.show_title),share_copy:text(value.share_copy),badge:text(value.badge),section_type:value.section_type}:null;
  const snapshot={url:location.href,title:document.title,series:null,currentEpisode:null,activeEpId:null,pageCatalogs:[]};
  const state=window.__INITIAL_STATE__;
  if(state && typeof state==='object') {
    const media=state.mediaInfo ?? state.seasonInfo ?? {};
    snapshot.series={title:text(media.title ?? state.h1Title),seasonId:media.season_id ?? media.ssId ?? state.seasonId,mediaId:media.media_id ?? media.id};
    snapshot.currentEpisode=episode(state.epInfo ?? state.ep_info);
    if(Array.isArray(state.epList))snapshot.pageCatalogs.push({title:snapshot.series.title,season_id:snapshot.series.seasonId,media_id:snapshot.series.mediaId,episodes:state.epList.slice(0,800).map(episode)});
  }
  const next=document.querySelector('script#__NEXT_DATA__');
  if(next?.textContent && next.textContent.length<3000000) {
    try {
      const parsed=JSON.parse(next.textContent);
      for(const query of parsed.props?.pageProps?.dehydratedState?.queries ?? []) {
        const data=query.state?.data?.result ?? query.state?.data;
        if(!data || typeof data!=='object' || !data.season_id)continue;
        snapshot.series={title:text(data.title ?? data.season_title),seasonId:data.season_id,mediaId:data.media_id};
        snapshot.pageCatalogs.push({title:snapshot.series.title,season_id:data.season_id,media_id:data.media_id,episodes:Array.isArray(data.episodes)?data.episodes.slice(0,800).map(episode):[]});
      }
    } catch { /* A partial Next payload is not evidence of a current episode. */ }
  }
  const selectors=['a[aria-current="true"][href*="/bangumi/play/ep"]','a[aria-selected="true"][href*="/bangumi/play/ep"]','.ep-item.on a[href*="/bangumi/play/ep"]','.ep-item.active a[href*="/bangumi/play/ep"]','[class*="epItem"][class*="active"] a[href*="/bangumi/play/ep"]'];
  for(const selector of selectors) {
    const active=document.querySelector(selector);
    const match=active?.getAttribute('href')?.match(/\/bangumi\/play\/ep(\d+)/);
    if(match){snapshot.activeEpId=Number(match[1]);break;}
  }
  return snapshot;
}
