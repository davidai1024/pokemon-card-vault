# 宝可梦：抽卡暴富

可离线运行的 H5 拆包与收藏小游戏，支持浏览器试玩和小红书小工具容器。当前代码版本 **v29**。

[下载 v29 小红书代码包](https://github.com/davidai1024/pokemon-card-vault/releases/tag/v0.29.0)

## 玩法

- 151、初代基础包、丛林秘境、化石遗迹四套卡池，每包 11 张。
- 151 按稀有度抽取；经典包按游戏金币估值分档，各系列独立累计 3／8／20 包保底。
- 撕包、取卡、逐张翻卡，以及按价值变化的揭晓动效。
- 收藏、筛选、锁定、出售重复卡、图鉴和里程碑。
- 收藏海报和单包战绩图，容器内可保存相册、携图回帖和好友分享。
- 最高单卡与最高收藏总值排行榜，支持总／月／周／日周期，金额始终完整展示，保留千位分隔符。

| 本包收获 | 收藏分享 |
| --- | --- |
| ![本包收获](docs/screenshots/pack-summary.png) | ![收藏分享](docs/screenshots/collection-share.png) |

## 直接试玩

仓库包含完整运行资源 `dist/`。安装 Python 3 后执行：

```sh
python3 -m http.server 8810 --directory dist
```

打开 <http://localhost:8810/>。浏览器可体验本地拆包与收藏；小红书排行榜、相册和回帖能力需要相应客户端与平台授权。

## 修改与构建

需要 Node.js 20.19 或更高版本、Python 3。

```sh
npm ci
npm run build
npm start
```

源码位于 `src/`，构建脚本将 JavaScript 转译为 Chrome 61 可解析的经典脚本，并处理 CSS 兼容回退。构建结果写入 `dist/`，素材保留在 `dist/assets/`。

```sh
npm test
npm run package
```

测试覆盖概率、保底边界、存档迁移、结算后继续拆包、存档失败回滚、海报数据与容器接口模拟。ZIP 位于 `releases/kanto-vault-v29.zip`，入口 `index.html` 在根目录，包体不超过 10 MiB。

## 小红书容器

资源随包提供，运行页面不直接联网。平台能力通过 `window.xhs.miniTool` 调用，浏览器环境保留降级提示。

排行榜提交历史最高成绩，各周期记录本期提交过的最好成绩；日／周／月榜不代表本期新增卡片价值。成绩以万金币为单位提交，展示时换回金币。

[小红书小工具开发文档](https://miniapp-sandbox.xiaohongshu.com/minitool/doc)

## 数据与素材

估值使用 **2026-11-14 固定快照**，参考 TCGdex 提供的 TCGplayer 对应英文卡号与工艺报价；缺失报价保留估计值标识。游戏金币不对应现金、可提现资产或实时交易报价。中文卡面属于展示重绘。

Pokémon 名称、角色、卡牌插画与商标归各自权利人所有。本项目为非官方作品，与权利人没有合作或背书关系。公开仓库不授予第三方素材的额外使用权。Lucide／Feather 图标许可保留在 `dist/assets/ui/icon-license.json`。

## 验证范围

已完成自动化逻辑测试、静态产物检查和本地手机尺寸界面检查。创服平台模拟器、Android 和 iOS 真机仍需用实际上传产物复验；Chrome 61 实机兼容性与真机性能尚未实测。

代码版本 v29 与创服平台审核版本号分别管理。
