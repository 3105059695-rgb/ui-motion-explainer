# 公共动效与示例预览

- `../../template-items.json`：9 个原 TPL，在 `../template/index.html` 用原 `scenes.js` 的 0–36 秒时间表运行。
- `../../example-items.json`：35 个展示条目；包括原 `silent-demo` 三段、手绘四阶段、四种字幕视图、21 个历史宏场景与三个竖屏阶段。
- `../../primitive-items.json`：42 个独立公共动效演示。原始 `template/lib.js` 与 `template/main.js` 被直接加载，`demos.js` 仅提供展示参数和布局。

入口均提供 `window.renderAt(t)` 和 `window.READY`。时间采用原全片绝对秒数；原语展示采用 0–6 秒。标准舞台为 1920×1080，竖屏外壳为 1080×1920。

`card-layout-scenes.js` 与 `showcase-scenes.js` 并非完整包文件的逐字副本，保留为独立历史配方版本展示。与包对应的场景映射记录在条目的 `codeMapping`。历史 showcase 预览仅修正反向拖动所需的状态复原：Vendor 高亮状态、人物卡 zIndex，以及人物缩小裁切状态设置顺序。动作参数和源文案保持原版本。

人物、道具、作品墙和媒体帧均明确标为示意。原仓库没有附带作者真人、录屏原片或完整音轨。示例的历史数字/产品文案不作为当前事实。图文示意资产不会冒充作者作品或真实录屏。

2026-09-30 实际检查：用本机已有 Chromium 加载全部 86 个条目，等待 READY，在开始后、区间中、结束前及反向返回开始处调用 renderAt；页面异常与失载图像均为 0。结果见 `check-results.json`。另抽取 12 张不同类别画面并查看 `screenshots/contact.jpg`。这是运行与抽帧检查；未导出整片、未听取音轨，也不构成用户审美验收。

`build_templates_examples.py` 可重建本分组的入口、示意序列与元数据，保持 `source/` 只读。主展示入口的 bridge 由顶层展示器统一注入。
