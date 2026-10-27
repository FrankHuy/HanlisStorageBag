# 韩立的储物袋

一袋乾坤，半卷仙途。以小说章节为轴，记录《凡人修仙传》中韩立物品的获得、消耗、损毁与容器移动。

在线访问：[韩立的储物袋](https://hanli.hym.cc.cd)。已部署至 Cloudflare Workers Static Assets，并绑定自定义域名。备用地址：[workers.dev](https://hanlis-storage-bag.879647324.workers.dev)（部分网络可能无法直连）。

## 衍生项目：Chrome 追番助手

独立插件项目位于 [`chrome-extension/`](chrome-extension/README.md)，支持在 B 站播放《凡人修仙传》时点击插件识别当前正片集数，查看对应小说进度的物品记录。复用本项目数据快照，单独构建无需第三方依赖。随包含第1—197集的第三方参考映射；新集可动态识别，但未收录的章节范围需手动校准。

[下载安装包](https://hanli.hym.cc.cd/downloads/hanli-storage-bag-chrome-v0.1.0.zip) · [下载独立源码](https://hanli.hym.cc.cd/downloads/hanli-storage-bag-chrome-source-v0.1.0.zip)。解压安装包后，在 `chrome://extensions` 开启开发者模式，选择「加载已解压的扩展程序」。

## 当前进度

- React + TypeScript + Vite 项目，墨青 / 竹绿 / 旧金配色，山峦与器物 SVG 原创线描。
- 45 个章节节点、70 种物品，关键节点延伸至第 2446 章《飞升仙界》；虚天殿之后新增 29 处，尚未覆盖全书所有变化。
- 全书章节直达、天南 / 大晋 / 灵界 / 飞升快捷入口、篇章筛选、物品搜索、持有记录 / 本章得失切换、存放位置筛选。
- 物品图鉴、截至所选章节的物品流转、来源链接、章节分享链接、手机导航。
- Cloudflare Workers Static Assets 配置与 GitHub Actions 自动部署工作流。

**这是跨全书的关键节点考据，不是全书完整库存。** 持有记录是已录入事件推导的最近记录。未考据章节中的转赠、炼制、孵化、耗尽不会凭空推断。`位置未明` 不能当作 `储物袋`。储物镯、灵兽环、洞府栽种与受损残件分别标记。图鉴默认到所选章节；时间线标题本身包含后续剧情。

## 本地开发

使用 Node.js 22.12+（推荐 Node 22 LTS）。

```bash
npm ci
npm run dev
```

```bash
npm test          # 流水重建、章节边界、容器区分、消耗与数据完整性
npm run build    # TypeScript 检查与生产构建
npm run preview  # 生产预览
npm run cf:check # 构建并检查 Cloudflare 部署包，不发布
```

## 部署到 Cloudflare 免费托管

采用 **Workers Static Assets**，只部署 `dist/` 静态资源，不设置 Worker 业务代码、数据库或付费存储。使用已有域名的子域名 `hanli.hym.cc.cd`，保留免费的 `workers.dev` 备用地址。静态资源请求按 Cloudflare 官方当前说明免费且不限量；实际限制以账户与[官方价格文档](https://developers.cloudflare.com/workers/platform/pricing/)为准。[静态资源部署文档](https://developers.cloudflare.com/workers/static-assets/)。

首次部署（适用于这台云主机）：

```bash
npm run cf:login
npx wrangler whoami
npm run deploy
```

`cf:login` 使用设备码登录（`wrangler login --device --browser=false`）。保持云主机终端运行，在自己的电脑或手机上打开命令输出的 Cloudflare 授权链接，确认设备码并批准。终端显示登录成功后即可部署，无需 localhost 回调、SSH 端口转发或开放防火墙端口。设备码通常 5 分钟过期，过期后重新执行即可。[Cloudflare 官方设备码登录说明](https://developers.cloudflare.com/workers/wrangler/commands/general/#use-wrangler-login-without-a-local-callback-server)。

自动化部署继续使用下方 GitHub Secrets 中的 API Token，无需浏览器登录。

`wrangler.jsonc` 已配置项目名 `hanlis-storage-bag`、静态目录及 SPA 路由。部署成功后 Wrangler 会输出实际站点 URL；不要将项目名拼接成未经确认的部署 URL。首次使用 workers.dev 时可能需要在 Cloudflare 控制台启用子域名。若账户中已存在同名应用，请先修改配置中的 `name`，避免覆盖无关应用。

自定义域名通过 `routes: [{ "pattern": "hanli.hym.cc.cd", "custom_domain": true }]` 管理。Cloudflare 在部署时配置域名绑定、DNS 和 HTTPS 证书，无需手动添加指向 workers.dev 的 CNAME。以后运行 `npm run deploy` 会保留该绑定。换账户部署时，需要目标账户拥有相应的活动域名区域与 Workers 域名绑定权限。

Cloudflare 控制台连接此 Git 仓库时，构建命令为 `npm run build`，部署命令为 `npx wrangler deploy`，根目录为项目根目录，Node 版本为 22。无需再创建 Pages 项目。

### GitHub Actions 自动部署

工作流位于 `.github/workflows/deploy.yml`，推送 `main` 或手动触发时测试、构建并部署。在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 内容 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 使用 Cloudflare 的 Edit Cloudflare Workers 模板创建，限定目标账户；需要 Workers Scripts Edit、账户信息读取与账户子域名读取所需权限 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 控制台的账户 ID |

凭证仅存放在 GitHub Secrets / Wrangler 本机登录中，不提交到仓库。仓库不包含账户绑定信息。静态资源安全响应头在 `public/_headers` 中配置。

## 内容维护

Chrome 插件的商店发布步骤、权限理由和商品文案见 [上架说明](chrome-extension/STORE_PUBLISHING.md)，[隐私政策](https://hanli.hym.cc.cd/extension/privacy.html) 随网站静态托管。

```text
src/data/types.ts        数据模型
src/data/items.ts        物品名称、分类、简介与图形
src/data/events.ts       章节合并排序、来源与研究队列
src/data/laterEvents.ts  后续篇章及前文物品转化补录
src/data/laterItems.ts   后续物品档案
src/lib/inventory.ts     按章节回放流水
src/lib/inventory.test.ts 流水语义与数据一致性测试
src/components/Relic.tsx 原创器物线描
src/App.tsx              时间线、图鉴、考据手札
src/styles.css           国风视觉及响应式布局
docs/RESEARCH.md         考据范围、证据标准、后续路线
```

新增物品到 `items.ts`，新增变动到 `events.ts` 并保持章节顺序。`gain` 表示获得，`loss` 表示离开持有记录，`move` 表示位置变化，`observe` 表示持有确认（可为最早确认但非最早获得），`damage` 表示受损但仍有残件。部分损耗使用 `partial: true`；不明余量使用 `quantityUnknown: true`。数量未知时省略 `amount`，不要填 0 或猜测数量。新节点必须附具体章节来源及简短转述，不复制整章文本。来源网站后半部网页编号与章号不同，必须使用 `sourcePage` 记录实际网页编号，不能按章号拼接猜测链接。

该项目为非官方同人考据站，小说权利归原作者与相关权利人。界面采用国风色彩与原创器物线描，未使用动漫官方角色立绘或剧照。
