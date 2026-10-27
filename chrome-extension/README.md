# 韩立的储物袋 · Chrome 追番助手

独立的 Manifest V3 Chrome 插件项目，从「韩立的储物袋」网站衍生。运行和打包不需要安装第三方依赖，可将本目录单独拷贝到其他位置使用。

在 B 站播放《凡人修仙传》时点击插件按钮，自动识别当前集数，按参考小说进度显示物品持有记录、袋内确认记录与本集变动。

## 安装

1. 下载插件 ZIP，解压到一个长期保留的文件夹。
2. 在 Chrome 地址栏输入 `chrome://extensions`。
3. 打开右上角「开发者模式」，点击「加载已解压的扩展程序」。
4. 选择包含 `manifest.json` 的文件夹。
5. 点击工具栏拼图图标，将「韩立的储物袋 · 追番助手」固定到工具栏。

打开 [第197话示例](https://www.bilibili.com/bangumi/play/ep3854821)，点击插件图标，应识别为「第197话 · 慕兰之战21」。换一集后再次点击，或点弹窗右上角刷新；不需要逐条录入播放链接。

若从源码运行，先执行 `npm run build`，第4步选择本项目的 `dist/` 目录。Chrome 111+。

## 独立开发与打包

使用 Node.js 22.12+：

```bash
npm test
npm run check
npm run build
```

构建产物：

- `dist/`：可直接加载的插件目录。
- `releases/hanli-storage-bag-chrome-v0.1.0.zip`：解压即可加载的分发包，根目录包含 manifest。

无需 `npm install`、远程字体、外部脚本或在线后端。生产插件使用本地模块和 JSON 数据。构建脚本用 Node 标准库生成图标与 ZIP。

在普通网页中预览弹窗时，可静态托管 `dist/` 后打开 `popup.html?demo=197`；页面会明确标为演示，不能将演示界面当成真实标签页识别。

## 自动识别方式

1. 以当前 `epXXXX` URL 为优先依据，避免 B 站站内切集后旧页面状态指向上一集。
2. 点击插件时，通过 `activeTab` 与 `scripting` 只读当前页状态，支持旧版 `__INITIAL_STATE__` 和现行 Next.js `__NEXT_DATA__` 的元数据结构。
3. 从官方元数据与整季目录按 **ep ID** 找到本集，不能用播放列表中的第几个条目代替集数。
4. 未在目录快照中的 ep ID，通过固定公开接口 `https://api.bilibili.com/pgc/view/web/season?ep_id=...` 继续识别；接口失败时保留已知快照或提示手动校准。
5. 预告、花絮与特别素材不会按正片集数推算。官方编号的前21集重制版仍是正片；第198集预告虽然 `title` 为198，也会被过滤。
6. `ssXXXX` 季页面必须取得当前选中单集的可靠证据；不能拿「最新一集」替代正在看的集数。读取不到时，请点具体单集，或手动选择小说进度。

B站接口不是本插件可控制的稳定开放API，可能改版或返回风控错误；因此保留页面识别、离线目录与手动校准。当前没有自动修改播放页、播放器、账号状态或视频内容。

## 集数与库存的边界

- 首版随包包含 **第1—197集**的第三方章节范围、B站197集正片及预告等311条元数据快照。
- 示例 `ep3854821` 为197话；参考指南显示744—746章，其链接内部编号与网站来源对齐为747—749章。默认「本集开始前」查询本项目746章，「看完本集后」查询749章。保留参考原始编号，不能把所有版本的数字直接混用。
- 集数元数据可动态识别未来新集；**未收录的新集章节范围不会自动外推**。可用校准功能先指定小说进度。
- 默认使用本集参考范围起点之前的库存，可能少计动画提前安排的物品；选择「看完本集后」可能涉及本集后段剧情。两者都属于整集参考，不读取或推算当前播放秒数。
- 复用网站 **45个关键节点、70种物品**。原著章节间仍有考据空档，旧持有记录可能已经改变，不能宣称完整的当前库存。
- 普通储物袋、储物镯、灵兽袋、灵兽环、体内温养与位置未明分别展示。「袋内确认」只包含明确位置为储物袋的记录。
- 物品详情只显示所选进度之前的流水，避免直接使用带后期剧情的全局物品简介。
- 手动校准按单集 ep ID 本地保存，不会把某一集的进度套给其他集。恢复自动会移除该集的校准。

## 数据同步与来源

```text
manifest.json            Chrome MV3 权限与弹窗入口
popup.html / popup.css   国风弹窗，深色可读文字
src/popup.mjs            标签页识别、刷新、筛选、校准和详情
src/page-snapshot.mjs    当前播放页的只读快照
src/lib/detect.mjs       ep ID / 整季目录 / 预告排除逻辑
src/lib/progress.mjs     动漫集数与小说进度匹配
src/lib/inventory.mjs    从母项目同步的库存流水引擎
data/inventory.json     物品及变动数据的独立快照
data/episode-map.json   动漫与小说范围、原编号、来源
data/bili-catalog.json  无用户信息的B站公开元数据快照
tests/                  识别、误识别、进度及库存回归测试
```

本目录仍位于母项目中时，可执行 `npm run sync:web`，从相邻母项目更新物品数据与库存引擎。该可选同步命令需要母项目现有的 TypeScript；分离后的独立构建不使用它。分集表与B站目录分别维护，不随小说数据同步而改写。

来源：

- [B站原播放页](https://www.bilibili.com/bangumi/play/ep3854821)及其公开剧集元数据；本项目仅保存集数、短标题、ep ID、正片/预告标记，不包含视频或账号信息。
- [凡人修仙传百科分集指南](https://rmji.wiki/zh/episodes/)，采集日期2026-10-27。只使用集数、章节范围与章节链接中的编号等事实，未复制剧情解析。第三方映射未逐集独立复核；来源站原创文字声明 [CC BY-SA 4.0](https://rmji.wiki/zh/license/)。
- [母项目在线档案](https://hanli.hym.cc.cd/)；每条小说物品事件保存原章节出处。数据的既有缺口随快照保留。
- [Chrome scripting 文档](https://developer.chrome.com/docs/extensions/reference/api/scripting)、[activeTab 文档](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)。

## 权限与本地存储

准备发布到 Chrome 应用商店时，请使用 [上架指南与可复制文案](STORE_PUBLISHING.md)。公开隐私政策：[hanli.hym.cc.cd/extension/privacy.html](https://hanli.hym.cc.cd/extension/privacy.html)。

只申请 `activeTab`、`scripting`、`storage`，以及访问 `https://api.bilibili.com/*` 的权限。页面脚本仅在点击插件时运行，没有常驻内容脚本、后台监控或全站读取权限。弹窗打开期间会检查当前页面URL变化。

物品查询离线运行；模式、每集校准和目录缓存保存在 Chrome 本地。公开接口请求不携带 Cookie，也不上传页面文本、观看时间或物品查询记录。没有分析统计或第三方追踪。需要的浏览器授权以 manifest 为准。
