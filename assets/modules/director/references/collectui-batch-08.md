# 第八批：编码进度与音画节点连接

2026-09-27。本批来自 AI Flow 分类的两个视频。原片仅通过浏览器观察，未下载或作为本库样片分发。

## Jeet：持续推进的 Coding Agent

[原作链接](httpLOCAL_ASSET_NOT_DISTRIBUTED)，作者 Jeet / @jeetnirnejak。[参考视频](httpLOCAL_ASSET_NOT_DISTRIBUTED) 为 1878×1458、16.616667 秒。弹层实际标签为 AI Flow、Progress Bar、UI Interaction、Collect UI Curation。

实际查看六个阶段，均是同一个浅灰组件：上方状态与细进度条，中间五项任务清单，下方细节区域，底部工具入口及用量。

| 原片时间 | 已观察内容 |
|---|---|
| 0.238942s | 紫色 Reading file，0/5；第一项旋转等待，tokens.css 下是骨架加载条，Files 选中。 |
| 5.215704s | 蓝色 Searching web，1/5；首项已打勾并划线，第二项等待，下方查询和三条搜索结果，GitHub 选中。 |
| 8.345953s | 橙色 Thinking，2/5；第三项等待，下方出现四条思考短句。 |
| 10.960510s | 绿色 Writing，3/5；第四项等待，下方 theme-toggle.tsx 及逐渐出现的说明，Files 选中。 |
| 14.307187s | 粉色 Reviewing，4/5；最后一项等待，下方同文件的删除线与替换文字。 |
| 16.616667s | 绿色 Complete，5/5；五项全打勾划线，下方成果摘要，底部出现 Run again。 |

`ai-coding-agent-progress` 重建这一完整的组件状态序列，调整为 18 秒横屏。清单和容器持续存在，细节在原位更新；没有补加原片未见的光标点击。部分说明改写、版面放大、过渡时间重排，不称逐帧或像素一致。费用、tokens、模型名、结果均保留为演示数据，不是本机真实调用记录。

## Lee Black：Signal 音画工作台

[原作链接](httpLOCAL_ASSET_NOT_DISTRIBUTED)，发布者 Lee Black / @mrblackstudio。[参考视频](httpLOCAL_ASSET_NOT_DISTRIBUTED) 为 2880×2160、56.330998 秒，弹层实际标签 AI Flow。原帖介绍浏览器音画工作台，项目代号 Signaaal；本包不宣称实现其音频分析功能。

实际观察了 9.716482、15.503457、20.170925、30.133394、32.716256、41.424399 秒的画面：黄色人物背景中有黑色工作区、黄色贝塞尔连接线、媒体缩略图与处理节点、右侧 Inspect 面板及浮动 Scene preview。

- 9.716482 秒的效果面板含 Use Glitch Cut，Mode amount 0.65；四个参数为 0.23、0.28、0.42、0.38。
- 20.170925 秒是较完整的节点图，可见 Mic words glitch、Glitch、Map range、3D dither、Data storm、Scene output 等节点，以及右侧效果选项与滑块。
- 30.133394 秒，Mic words glitch 的 FX out 向 Scene output 的 FX in 拖出虚线，目标处出现绿色加号。面板已是 Glitch Cut active，四个值为 0.72、1.00、0.22、0.78。
- 32.716256 秒，该线成为黄色实线，右面板选中 Scene output，显示 Scene / Enabled / Duplicate / Delete；预览当时为黑色。
- 41.424399 秒，预览里出现明显的黑白故障叠加画面。

`software-signal-node-patch` 重建参数启用、虚线拖动、端口吸附、实线确认、检查面板切换与预览更新，重新编排为 18 秒。密集旧线路依可见结构概括重排；不能据此推断原作所有连线的业务关系。人物背景改为纯黄色，媒体缩略图与点阵/扫描线/故障块均为原创 SVG。该预设没有音轨、实时分析或 MIDI 输入，播放的是确定性的代码动画。

## 验证范围

两项已在实际浏览器构建，并检查五个时间点的前进与回拖一致性、80% 位置的文字布局。另目视检查编码阶段、拖线吸附阶段和启用效果的侧栏；按实际 DOM 边界修正了按钮点击位置、音频端点和侧栏底部间距。成片导出与抽样检查结果单列于 [验证记录](../verification.md)。

以上两个动态作品属于本批具体覆盖。全站清点与未覆盖作品仍在目标范围，不能将预设总数当作完整原作复刻数量。
