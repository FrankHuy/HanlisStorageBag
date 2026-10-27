import type { StoryEvent, EventDraft } from './types.ts';
import { laterEvents } from './laterEvents.ts';
const chapterSource = (chapter: number) => `https://www.bidutuijian.com/books/FanRenXiuXianChuan/${String(chapter).padStart(4,'0')}.html`;
type Draft = EventDraft;
const drafts: Draft[] = [
  {chapter:10,chapterTitle:'神秘瓶子',title:'青山拾瓶，仙途初启',arc:'七玄门',location:'彩霞山',summary:'山路落叶间，韩立意外拾得一个绿莹莹的小瓶。故事从这一件不起眼的随身物品开始。',changes:[{itemId:'bottle',type:'gain',amount:1,unit:'只',storage:'贴身携带',note:'从落叶中拾得，揣入怀中；此时并非储物袋物品。'}]},
  {chapter:91,chapterTitle:'抢宝',title:'驱物夺剑，初得仙宝',arc:'七玄门',location:'落日峰',summary:'韩立以驱物术夺走金光上人操控的灰光。下一章才确认它是一张小剑符箓。',changes:[{itemId:'sword-talisman',type:'gain',amount:1,unit:'张',storage:'位置未明',note:'本章夺得控制权；第92章确认符箓形态并收入怀中。'}]},
  {chapter:92,chapterTitle:'剑符',title:'飞剑现真容，原是一道符',arc:'七玄门',location:'落日峰',summary:'灰光消散，露出画有小剑的符纸，韩立将它揣进怀里。物品移动不会重复计为获得。',changes:[{itemId:'sword-talisman',type:'move',storage:'贴身携带',note:'本章确认收在怀内；符宝之名是后文才了解的知识。'}]},
  {chapter:93,chapterTitle:'烈火焚敌',title:'金光伏诛，遗物入手',arc:'七玄门',location:'落日峰',summary:'火弹术灭敌后，韩立从灰烬中翻出三件未被烧毁的东西：护身符、令牌与族谱。',changes:[{itemId:'diamond-talisman',type:'gain',amount:1,unit:'张',storage:'位置未明',note:'获得金罩防御符；第131章辨认为金刚符。'},{itemId:'ascension',type:'gain',amount:1,unit:'枚',storage:'位置未明',note:'黑色三角令牌，刻有升仙令字样。'},{itemId:'genealogy',type:'gain',amount:1,unit:'本',storage:'位置未明',note:'秦氏族谱；取得后未查明最终去向。'}]},
  {chapter:138,chapterTitle:'制符之道',title:'丹药易符笔，初试制符',arc:'太南小会',location:'太南谷',summary:'以三瓶黄龙丹、四瓶金髓丸换下金竺笔与七星草种子。随后尝试制符，一打符纸尽数失败。',changes:[{itemId:'pen',type:'gain',amount:1,unit:'支',storage:'贴身携带',note:'木盒揣在身上，成交在本章开头得到明确确认。'},{itemId:'seeds',type:'gain',amount:1,unit:'袋',storage:'位置未明',note:'与金竺笔一同换得；丹药总存量未明，不伪造结余。'}]},
  {chapter:141,chapterTitle:'升仙令',title:'一符换残片，另有所图',arc:'太南小会',location:'太南谷',summary:'确认布状法宝残片可以透过灵气后，韩立用高阶飞行符与黑汉交换，收起残片。',changes:[{itemId:'flight',type:'loss',amount:1,unit:'张',note:'交换付出；此前获得节点尚未补入，不能据此推算此前总库存。'},{itemId:'fragment',type:'gain',amount:1,unit:'片',storage:'贴身携带',note:'交割后将残片收入袖口。'}]},
  {chapter:165,chapterTitle:'夜遇',title:'千年灵草，换得护道之物',arc:'黄枫谷',location:'万宝楼',summary:'两株千年灵草换下锦盒中的宝物。交易完成在第165章，不能把第163章店家展示误记为已经获得。',changes:[{itemId:'blades',type:'gain',amount:1,unit:'套',storage:'位置未明',note:'一母八子，共一套；并非九套。'},{itemId:'shield',type:'gain',amount:1,unit:'件',storage:'位置未明',note:'玄铁飞天盾，交易后收好。'},{itemId:'thunder',type:'gain',amount:1,unit:'颗',storage:'位置未明',note:'一次性雷珠。'},{itemId:'gold-brick',type:'gain',amount:1,unit:'张',storage:'位置未明',note:'与其他锦盒宝物一同成交的金光砖符宝。'}]},
  {chapter:189,chapterTitle:'雷灭',title:'天雷一击，险中取胜',arc:'血禁试炼',location:'血色禁地',summary:'韩立在与封岳的恶斗中动用天雷子。一次性雷珠耗去，金蚨子母刃则在战中被收回储物袋。',changes:[{itemId:'thunder',type:'loss',amount:1,unit:'颗',note:'用于击杀封岳，爆炸后不再持有。'},{itemId:'blades',type:'move',storage:'储物袋',note:'本章明确将金刃收进储物袋，确认容器位置。'}]},
  {chapter:190,chapterTitle:'乌靴',title:'得失之间，又获乌靴',arc:'血禁试炼',location:'血色禁地',summary:'封岳的储物袋已毁，无法获得。韩立捡回镜子、水晶球、小刀符宝，又发现火焰烧不坏的乌靴。',changes:[{itemId:'hook',type:'loss',note:'本章回顾确认银钩损失；获得节点尚待核查。'},{itemId:'rope',type:'loss',note:'本章回顾确认青索损失；获得节点尚待核查。'},{itemId:'mirror',type:'gain',amount:1,unit:'面',storage:'位置未明',note:'从战场捡起。'},{itemId:'crystal',type:'gain',amount:1,unit:'颗',storage:'位置未明',note:'从战场捡起。'},{itemId:'knife-talisman',type:'gain',amount:1,unit:'张',storage:'位置未明',note:'恢复为符箓后捡起。'},{itemId:'boots',type:'gain',amount:1,unit:'双',storage:'位置未明',note:'从封岳残骸处拾起，并测试其效用。'}]},
  {chapter:227,chapterTitle:'结交之心',title:'灵药换奇阵，结识齐云霄',arc:'筑基行纪',location:'元武国秘店',summary:'韩立交出千年紫桂花，换得颠倒五行阵器具和炼器心得，并封印心得以作日后交还之约。',changes:[{itemId:'formation',type:'gain',amount:1,unit:'套',storage:'位置未明',note:'十八阵盘、三十六阵旗，计一套；后续布设位置待补。'},{itemId:'craft-notes',type:'gain',amount:1,unit:'本',storage:'位置未明',note:'接过并封印收藏；属于有约定的暂持物。'}]},
  {chapter:271,chapterTitle:'大挪移令和古传送阵',title:'古阵藏玄机，灵卵得新生',arc:'筑基行纪',location:'地下洞穴',summary:'探查古传送阵时，韩立收起大挪移令，另找到两枚蜘蛛卵，并收存五色骸骨烧出的珠子。',changes:[{itemId:'teleport',type:'gain',amount:1,unit:'枚',storage:'储物袋',note:'原文明示小心收入储物袋。'},{itemId:'spider-eggs',type:'gain',amount:2,unit:'枚',storage:'灵兽袋',note:'收入专门盛装灵兽的皮袋，不能计作普通储物袋内的灵兽。'},{itemId:'beads',type:'gain',storage:'位置未明',note:'原文仅说七八颗，数量保持未知。'}]},
  {chapter:415,chapterTitle:'珠中',title:'七十二剑成，本命法宝初现',arc:'乱星海',location:'天星城洞府',summary:'历经炼制，七十二口青竹蜂云剑终于完成，并被吸入体内。炼制剑胚的第414章不等于炼成。',changes:[{itemId:'bamboo-swords',type:'gain',amount:72,unit:'口',storage:'体内温养',note:'本命法宝收入体内，不计入储物袋。'}]},
  {chapter:491,chapterTitle:'收鼎',title:'虚天鼎入手，至宝归谁',arc:'虚天殿',location:'虚天殿内殿',summary:'借助血玉蜘蛛牵引，韩立控制住虚天鼎，将它缩小到掌中。获得宝物与装进储物袋是两个不同事实。',changes:[{itemId:'ding',type:'gain',amount:1,unit:'尊',storage:'贴身携带',note:'缩小后落在掌中；本章未以入袋作为记录依据。'}]}
];
export const events: StoryEvent[] = [...drafts,...laterEvents].sort((a,b)=>a.chapter-b.chapter).map(({sourcePage,...event}) => ({...event,id:`ch-${event.chapter}`,source:chapterSource(sourcePage ?? event.chapter),evidence:'chapter-checked'}));
export const researchQueue = [
  { title:'七玄门至黄枫谷：补齐资源往来',range:'第 1—173 章',detail:'补录丹药、银两、灵石、符纸，以及升仙令交付；核对第一只储物袋的获得与实际装袋。' },
  { title:'血禁试炼：逐战核对消耗与战利品',range:'第 174—212 章',detail:'补齐各场战斗的法器毁损、灵符耗尽、采药与上交，优先补齐银钩和青索的获得。' },
  { title:'筑基至乱星海：建立材料转换关系',range:'第 213—430 章',detail:'追踪布阵、炼丹、材料炼器、蜘蛛卵孵化、噬金虫收服与天雷竹的消耗。' },
  { title:'虚天殿至大晋：补齐交易与炼制',range:'第 431—1265 章',detail:'已补风雷翅、霜蚣、仙藤、人形傀儡与赠婉节点；继续核对补天丹、三焰扇、八灵尺及飞升损耗。' },
  { title:'灵界与魔界：补齐中间大段空档',range:'第 1266—2434 章',detail:'已录重得宝物、飞剑重炼、金阙玉书与洗灵池等关键节点；广寒界、炼虚合体、大乘炼宝仍有大量待补章节。' },
  { title:'终章之前：反查每件宝物的来去',range:'第 2435—2446 章',detail:'已录瓶灵回归、道果得失、北极元晶与终章受损随行；继续追溯玄天剑、虫王与傀儡的完整变化链。' }
];
