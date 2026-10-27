import type { Item } from './types.ts';
import { laterItems } from './laterItems.ts';
export const items: Item[] = [
  { id:'gold-brick',name:'金光砖符宝',category:'符箓典籍',icon:'token',description:'万宝楼购得的崭新符宝，符面绘有一块金色长砖。' },
  { id:'bottle',name:'神秘小瓶',category:'令牌杂物',icon:'bottle',description:'少年时意外拾得的绿瓶。此时尚未知晓它的真正来历，贴身收藏。' },
  { id:'sword-talisman',name:'小剑符宝',category:'符箓典籍',icon:'sword',description:'从金光上人手中夺得，符面绘有小剑。' },
  { id:'diamond-talisman',name:'金刚符',category:'符箓典籍',icon:'shield',description:'金光上人遗物；防御用灵符，后来在太南谷辨明名称。' },
  { id:'ascension',name:'升仙令',category:'令牌杂物',icon:'token',description:'漆黑三角令牌，后来成为进入黄枫谷的凭证。' },
  { id:'genealogy',name:'秦氏族谱',category:'符箓典籍',icon:'scroll',description:'金光上人灰烬中留下的族谱，后续去向需要继续考据。' },
  { id:'pen',name:'金竺笔',category:'令牌杂物',icon:'pen',description:'以金睛猿颈毛、金精与乌铁制成的符笔，以丹药换得。' },
  { id:'seeds',name:'七星草种子',category:'灵药材料',icon:'herb',description:'七星草可用于制作符纸，购得时装在一个小布袋中。' },
  { id:'flight',name:'飞行符',category:'符箓典籍',icon:'scroll',description:'用于交换法宝残片的高阶灵符；首版仅登记该次付出。' },
  { id:'fragment',name:'法宝残片',category:'法器法宝',icon:'scroll',description:'能遮蔽物体、又不妨碍吸入灵气的布状残片。' },
  { id:'blades',name:'金蚨子母刃',category:'法器法宝',icon:'sword',description:'一把母刃与八把子刃，可配合操控攻击。' },
  { id:'shield',name:'玄铁飞天盾',category:'法器法宝',icon:'shield',description:'可自动环绕护身的防御法器。' },
  { id:'thunder',name:'天雷子',category:'法器法宝',icon:'orb',description:'一次性雷珠，血禁试炼中用于击杀封岳。' },
  { id:'hook',name:'银钩',category:'法器法宝',icon:'sword',description:'第190章回顾与封岳一战时确认损失，具体获得节点待补。' },
  { id:'rope',name:'青索',category:'法器法宝',icon:'array',description:'第190章明确提及已损失的上品法器，具体获得节点待补。' },
  { id:'mirror',name:'小镜法器',category:'法器法宝',icon:'orb',description:'战后捡起的多宝女遗物，具体名称待考。' },
  { id:'crystal',name:'水晶球',category:'法器法宝',icon:'orb',description:'血禁试炼中战后捡起的物品。' },
  { id:'knife-talisman',name:'小刀符宝',category:'符箓典籍',icon:'sword',description:'原主人死后恢复符箓形态，被韩立捡起。' },
  { id:'boots',name:'乌靴',category:'法器法宝',icon:'boots',description:'封岳留下的乌黑靴子，火弹术烧灼后仍完好，具加速作用。' },
  { id:'formation',name:'颠倒五行阵器具',category:'法器法宝',icon:'array',description:'齐云霄所制的残缺布阵器具，初时只能发挥部分阵法威力。' },
  { id:'craft-notes',name:'炼器心得',category:'符箓典籍',icon:'scroll',description:'与齐云霄交易时一并得到的炼器心得。' },
  { id:'teleport',name:'大挪移令',category:'令牌杂物',icon:'token',description:'古传送阵旁获得的蓝色古令，明确收入储物袋。' },
  { id:'spider-eggs',name:'血玉蜘蛛卵',category:'灵兽灵虫',icon:'beast',description:'洞穴石柱后发现的两枚蜘蛛卵，被收入专用灵兽皮袋。' },
  { id:'beads',name:'五彩小珠',category:'灵药材料',icon:'orb',description:'五色骸骨被焚烧后凝出的七八颗珠子，确切数量不明。' },
  { id:'bamboo-swords',name:'青竹蜂云剑',category:'法器法宝',icon:'sword',description:'以天雷竹炼成的一套七十二口本命飞剑，炼成后吸入体内温养。' },
  { id:'ding',name:'虚天鼎',category:'法器法宝',icon:'ding',description:'乱星海秘宝；第491章成功缩小到掌中，此刻尚未记录入袋。' },
  ...laterItems
];
export const itemById = Object.fromEntries(items.map(item => [item.id, item])) as Record<string, Item>;
