export const FANREN_SEASON_ID = 28747;
export const FANREN_MEDIA_ID = 28223043;

const clean = value => typeof value === 'string' ? value.trim().slice(0,300) : '';
const positiveId = value => /^\d+$/.test(String(value ?? '')) && Number.isSafeInteger(Number(value)) && Number(value)>0 ? Number(value) : null;

export function parsePlaybackUrl(value) {
  try {
    const url=new URL(value);
    if(url.protocol!=='https:' || !['www.bilibili.com','m.bilibili.com'].includes(url.hostname))return null;
    const path=url.pathname.match(/^\/bangumi\/play\/(ep|ss)(\d+)\/?$/);
    if(!path)return null;
    const id=positiveId(path[2]);
    if(!id)return null;
    return {url:url.href,epId:path[1]==='ep'?id:null,seasonId:path[1]==='ss'?id:null};
  } catch { return null; }
}

export function episodeNumber(value) {
  const label=clean(value);
  const matched=label.match(/^第?\s*(\d{1,4})\s*(?:[集话話]|$)/);
  const n=matched?Number(matched[1]):null;
  return n && n<=3000?n:null;
}

export function normalizeEpisode(raw) {
  const epId=positiveId(raw?.ep_id ?? raw?.id);
  if(!epId)return null;
  const title=clean(raw.title);
  const longTitle=clean(raw.long_title ?? raw.longTitle);
  const showTitle=clean(raw.show_title ?? raw.showTitle);
  const share=clean(raw.share_copy);
  const text=[longTitle,showTitle,share,clean(raw.badge)].join(' ');
  const preview=/预告|預告|花絮|特别花絮|特别访谈|PV\b|预览|預覽/i.test(text) || Number(raw.section_type)===1;
  const number=episodeNumber(title) ?? episodeNumber(showTitle);
  // Bilibili's official first 21 main episodes are the numbered remastered replacements.
  const extra=!number;
  return {epId,number,title:longTitle || showTitle || title,remastered:/重制版|重製版/.test(text),kind:preview?'trailer':extra?'extra':'episode',url:`https://www.bilibili.com/bangumi/play/ep${epId}`};
}

export function normalizeCatalog(payload) {
  if(payload?.code!==undefined && payload.code!==0)throw new Error('B 站未返回可用的剧集列表');
  const raw=payload?.result ?? payload;
  if(!raw || typeof raw!=='object')throw new Error('剧集数据格式无效');
  const seriesTitle=clean(raw.title ?? raw.season_title);
  const seasonId=positiveId(raw.season_id);
  const mediaId=positiveId(raw.media_id ?? raw.mediaInfo?.id);
  const expected=seasonId===FANREN_SEASON_ID || mediaId===FANREN_MEDIA_ID;
  if(!expected || !/^凡人修仙传(?:\s|$)/.test(seriesTitle))throw new Error('当前剧集不是已支持的《凡人修仙传》动画正片');
  const rawEpisodes=[...(Array.isArray(raw.episodes)?raw.episodes:[]),...(Array.isArray(raw.section)?raw.section.flatMap(s=>Array.isArray(s.episodes)?s.episodes:[]):[])];
  const episodes=[...new Map(rawEpisodes.map(normalizeEpisode).filter(Boolean).map(e=>[e.epId,e])).values()];
  return {seasonId,mediaId,seriesTitle,episodes};
}

export function detectEpisode(snapshot,catalogs=[]) {
  const playback=parsePlaybackUrl(snapshot?.url);
  if(!playback)return {status:'unsupported-page',message:'请在 B 站《凡人修仙传》的番剧播放页使用。'};
  // URL wins over stale React/Next state after a same-page episode switch.
  const epId=playback.epId ?? positiveId(snapshot.activeEpId) ?? positiveId(snapshot.currentEpisode?.ep_id ?? snapshot.currentEpisode?.id);
  if(!epId)return {status:'unknown-episode',message:'已打开番剧页，但尚未确认正在播放哪一集。请点选具体剧集后刷新识别。'};
  for(const catalog of catalogs) {
    if(!catalog || catalog.seasonId!==FANREN_SEASON_ID || catalog.mediaId!==FANREN_MEDIA_ID)continue;
    const episode=Array.isArray(catalog.episodes)?catalog.episodes.find(e=>e.epId===epId):null;
    if(episode) return episode.kind==='episode' ? {status:'recognized',...episode,seriesTitle:catalog.seriesTitle,method:'catalog'} : {status:'not-main-episode',epId,message:'当前是预告、花絮或特别内容，不能按正片集数推算物品。'};
  }
  const series=snapshot.series ?? {};
  const trustedSeries=Number(series.seasonId)===FANREN_SEASON_ID && Number(series.mediaId)===FANREN_MEDIA_ID && /^凡人修仙传(?:\s|$)/.test(clean(series.title));
  const current=normalizeEpisode(snapshot.currentEpisode);
  if(trustedSeries && current?.epId===epId) {
    if(current.kind!=='episode')return {status:'not-main-episode',epId,message:'当前内容不是动画正片。'};
    return {status:'recognized',...current,seriesTitle:series.title,method:'page-state'};
  }
  // A page title alone cannot distinguish a preview using the same episode number.
  return {status:'unknown-episode',epId,message:'尚未取得该集的可靠元数据。可重试识别，或手动校准小说进度。'};
}
