export type Category = '法器法宝' | '符箓典籍' | '灵药材料' | '灵兽灵虫' | '令牌杂物';
export type Storage = '储物袋' | '储物镯' | '贴身携带' | '灵兽袋' | '灵兽环' | '体内温养' | '洞府存放' | '位置未明';
export interface Item { id: string; name: string; category: Category; icon: 'bottle' | 'sword' | 'scroll' | 'shield' | 'token' | 'herb' | 'orb' | 'boots' | 'array' | 'beast' | 'ding' | 'pen'; description: string; }
export interface Change { itemId: string; type: 'gain' | 'loss' | 'observe' | 'move' | 'damage'; amount?: number; unit?: string; storage?: Storage; partial?: boolean; quantityUnknown?: boolean; note: string; }
export interface StoryEvent { id: string; chapter: number; chapterTitle: string; title: string; arc: string; location: string; summary: string; source: string; evidence: 'chapter-checked' | 'secondary'; changes: Change[]; }
export type EventDraft = Omit<StoryEvent,'source' | 'evidence' | 'id'> & { sourcePage?: number };
