import { ArrowUpRight, BookOpen } from 'lucide-react';
import { events } from '../data/events';

export default function CoverageNav({chapter,onSelect}:{chapter:number;onSelect:(chapter:number)=>void}) {
  const latest=events.at(-1)!;
  const shortcuts=[{chapter:671,label:'重返天南'},{chapter:933,label:'大晋行纪'},{chapter:1327,label:'灵界初临'},{chapter:2446,label:'飞升仙界'}];
  return <section className="coverage-nav" aria-label="全书章节导航">
    <div className="coverage-summary"><BookOpen size={18}/><div><strong>已延伸至第 {latest.chapter} 章 · 飞升仙界</strong><p>人界 → 灵界 → 魔界 → 飞升 · 关键节点已录，章节空档仍在补齐。</p></div><label>直达章节<select aria-label="直达已收录章节" value={chapter} onChange={e=>onSelect(Number(e.target.value))}>{events.map(e=><option key={e.id} value={e.chapter}>第 {e.chapter} 章 · {e.chapterTitle}</option>)}</select></label></div>
    <div className="coverage-shortcuts"><span>后续仙途</span>{shortcuts.map(s=><button key={s.chapter} onClick={()=>onSelect(s.chapter)}>{s.label}<small>第 {s.chapter} 章</small><ArrowUpRight size={13}/></button>)}</div>
  </section>;
}
