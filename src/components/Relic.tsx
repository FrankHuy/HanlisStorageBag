import type { Item } from '../data/types';
export default function Relic({kind, className = ''}: {kind: Item['icon']; className?:string}) {
  const paths: Record<Item['icon'],React.ReactNode> = {
    bottle:<><path d="M40 15h20v11l-5 7c1 10 19 17 19 36 0 17-11 22-24 22S26 86 26 69c0-19 18-26 19-36l-5-7Z"/><path d="M38 15h24M43 26h14M39 72c15-1 23-13 14-25-15 3-19 15-14 25Zm0 0 16-20M47 64l-7-7m9 4 8 3"/><path d="M34 78c5 7 18 9 27 3" opacity=".45"/></>,
    sword:<><path d="m48 10 7 18-4 39-7 4-5-8 6-36Z"/><path d="m30 68 31 6M41 73l-2 16m-5-1 11 2M48 22l-3 42"/><path d="m66 20 4 13-1 25m9-27 3 15-3 23M27 18l-5 21 3 20" opacity=".45"/></>,
    scroll:<><path d="M27 24h47v50H30M27 24c-10 0-10 13 0 13h6V24M30 63c-12 0-12 14 0 14h44c11 0 11-14 0-14"/><path d="M43 38h18M43 46h18M43 54h12M65 25v37"/></>,
    shield:<><path d="M50 13 76 26v27c-2 18-14 28-26 36-12-8-24-18-26-36V26Z"/><path d="m50 23 17 10v20c-2 12-8 20-17 26-9-6-15-14-17-26V33Z"/><path d="m50 34 9 15-9 16-9-16Z"/></>,
    token:<><path d="m50 15 27 56-27 15-27-15Z"/><circle cx="50" cy="28" r="3"/><path d="M40 49h20m-10-9v24m-10 5 10-5 10 5"/></>,
    herb:<><path d="M48 87c7-29-4-44 5-70M49 64c-19 0-27-12-27-23 20 0 30 9 27 23Zm2-17c19 0 27-13 25-24-20 2-29 10-25 24ZM46 78c-12-1-20-9-20-17 14 0 20 7 20 17Z"/></>,
    orb:<><circle cx="50" cy="51" r="27"/><ellipse cx="50" cy="51" rx="13" ry="27"/><ellipse cx="50" cy="51" rx="27" ry="11"/><path d="m53 30-13 23h14l-6 18M19 22l5 5m50 49 5 5m-60-3 5-5"/></>,
    boots:<><path d="m28 18 25 4-4 38 21 7c8 3 8 14-1 15H28c-10-2-8-13-5-22ZM28 30l23 4M26 42l23 3m-4 18 9 7m-31 5h47"/></>,
    array:<><circle cx="50" cy="50" r="33"/><circle cx="50" cy="50" r="23"/><path d="m50 17 29 50H21Zm0 66L21 33h58ZM50 37v26m-13-13h26"/><circle cx="50" cy="50" r="7"/></>,
    beast:<><ellipse cx="39" cy="55" rx="13" ry="17"/><ellipse cx="64" cy="51" rx="11" ry="15"/><path d="m28 47-12-8m11 17-13 5m16 6-10 13m44-44 8-11m2 21 13-5m-13 17 12 10M35 45l4 8 6-4m17-6 3 8 5-5"/></>,
    ding:<><path d="M24 36h52v23c0 17-52 17-52 0ZM20 34h60M29 31c2-16 40-16 42 0M46 17h8M35 70l-6 17m36-17 6 17M24 43H13V26h12m51 17h11V26H76M36 47v12m14-12v12m14-12v12"/></>,
    pen:<><path d="m66 12 7 4-27 49-9-5Zm-29 48c-15 6-7 16-18 27 20-3 30-10 27-22M63 18l7 4M38 60l8 5M28 78l10-15"/></>
  };
  return <svg className={`relic ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{paths[kind]}</svg>;
}
