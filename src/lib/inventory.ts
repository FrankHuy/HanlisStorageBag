import type { StoryEvent, Storage } from '../data/types.ts';
export interface Holding { itemId: string; amount?: number; unit?: string; storage: Storage; firstChapter: number; lastChapter: number; note: string; damaged?: boolean; }
// This is a last-observed ledger, not a claim of complete possession between unresearched chapters.
export function inventoryAt(events: StoryEvent[], chapter: number): Holding[] {
  const held = new Map<string,Holding>();
  for (const event of [...events].filter(e => e.chapter <= chapter).sort((a,b) => a.chapter-b.chapter)) {
    for (const change of event.changes) {
      const previous = held.get(change.itemId);
      if (change.type === 'loss') {
        if (previous && change.partial && change.amount === undefined) held.set(change.itemId,{...previous,amount:undefined,lastChapter:event.chapter,note:change.note});
        else if (previous && previous.amount !== undefined && change.amount !== undefined && previous.amount > change.amount) held.set(change.itemId,{...previous,amount:previous.amount-change.amount,lastChapter:event.chapter,note:change.note});
        else held.delete(change.itemId);
      } else if (change.type === 'move' || change.type === 'observe' || change.type === 'damage') {
        if (previous || change.type === 'observe' || change.type === 'damage') held.set(change.itemId,{itemId:change.itemId,firstChapter:event.chapter,...previous,amount:change.quantityUnknown ? undefined : change.amount ?? previous?.amount,unit:change.unit ?? previous?.unit,storage:change.storage ?? previous?.storage ?? '位置未明',lastChapter:event.chapter,note:change.note,damaged:change.type === 'damage' || previous?.damaged});
      } else {
        held.set(change.itemId,{itemId:change.itemId,amount:previous?.amount !== undefined && change.amount !== undefined ? previous.amount+change.amount : change.amount,unit:change.unit ?? previous?.unit,storage:change.storage ?? '位置未明',firstChapter:previous?.firstChapter ?? event.chapter,lastChapter:event.chapter,note:change.note});
      }
    }
  }
  return [...held.values()];
}
