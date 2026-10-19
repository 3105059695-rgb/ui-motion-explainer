# 本次构建验证（2026-09-30）

## 内容与原技能

- 原 `ui-motion-explainer` 245 个文件的快照 SHA-256 全部一致；原安装目录对应 245 个文件没有修改。
- 原仓库 111 个跟踪源码文件 SHA-256 全部一致，完整 343 展示条目资源随包保留。
- 覆盖文档包含原 18 份 references、O01–O33 / X01–X23 全部 56 个编号及开场、正文、UI、人物、音画、素材、工程、渲染与交付入口。
- 技能 frontmatter、名称与结构经 skill-creator 的 quick_validate.py 通过。新包参考链接按实际文件检查；所需外部账号工作流保持可选。

## 新融合示例

实际运行 8 个场景，每场 7 个时间点正向及反向，共 112 次取样；另检查重复 seek、全序列切场与可见播放器控件。检查无 JavaScript 错误、资源错误或坏图。390px 移动展示入口没有横向溢出。

重复 seek 的场景 DOM 文字、class 与行内样式严格一致。Chromium 字体边缘会出现少量栅格差异，因此没有宣称所有 PNG 的二进制 hash 完全一致：最终检查实际最多 98 个像素有差异，RGB 最大差 2/255，总画面 2,073,600 像素。比较器上限为 8/255 且不超过 500 像素，DOM 同一性仍严格要求。完整数据见 [browser-verification.json](../assets/fusion-studio/previews/browser-verification.json)。

F04 暂停区间的传输位置、进度条与百分比一致；F08 在改变动画采样时间但固定 `mediaTime=5.8` 时保持媒体时钟。已检查场景切换、时间滑块、重播、1/50 秒键盘步进与全部连播。中文 MotionCN 与数字 MotionNumber 字体实际加载检查均为 true。

主代理查看了八场的中间/结果联系图，并实际查看列表详情、文档聚焦、文件交接、任务流、报告展开、数据比较、设置与人物交接的代表性 1080p 帧。修复了可见重叠、裁切和 F05 点击坐标。可查看 [联系图](../assets/fusion-studio/previews/contact-sheet.jpg)。这些是具体帧检查，未冒称连续观看了所有动态帧。

## MP4 与实际范围

72 秒预览实际导出为 1920×1080、50 fps、3600 帧、H.264；完整解码通过，无音轨。本次展示导出关闭运动模糊；原技能及本包接口仍支持按动画层取样的可选运动模糊。原渲染记录见 [render-verification.json](../assets/fusion-studio/previews/render-verification.json)，八个单场示例的实际导出/解码记录见 [clip-verification.json](../assets/fusion-studio/previews/clip-verification.json)。

F01–F08 的内容、数值、操作与几何人物均为示意。F08 接入真实人物视频的单 video/seeked 接口已实现，但本次没有真实人物源片，未验证真人嘴型、裁切或实际音画同步。新预览无声，没有试听或声称已完成用户口播成片。

原包的历史验证记录属于对应旧资源，不自动转为本次新示例的验证。八类融合机制不代表原仓库全部条目已改为黑白紫，也没有获得本次用户的审美认可。
