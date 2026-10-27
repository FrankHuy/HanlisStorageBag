export function resolveProgress(detection,mapping,{mode='before',override=null}={}) {
  if(['recognized','unknown-episode'].includes(detection.status) && Number.isInteger(override) && override>=0 && override<=2446)return {status:'manual',chapter:override,episode:detection.number ?? null,mode:'manual'};
  if(detection.status!=='recognized')return {status:'unavailable'};
  const row=mapping.episodes.find(e=>e.episode===detection.number);
  if(!row)return {status:'unmapped',episode:detection.number,message:'已识别集数，但该集的小说进度尚未收录。请手动选择，插件不会外推猜测。'};
  return {status:'mapped',episode:detection.number,chapter:mode==='after'?row.chapterEnd:Math.max(0,row.chapterStart-1),mode,row,source:`https://rmji.wiki/zh/episodes/${row.episode}/`};
}

export function nearestRecordedChapter(events,chapter) {
  return [...events].filter(e=>e.chapter<=chapter).sort((a,b)=>b.chapter-a.chapter)[0]?.chapter ?? 0;
}

export function changesForEpisode(events,progress) {
  if(progress.status!=='mapped' || progress.mode!=='after')return [];
  return events.filter(e=>e.chapter>=progress.row.chapterStart && e.chapter<=progress.chapter);
}
