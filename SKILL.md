---
name: ui-motion-fusion
description: "根据口播稿与素材完成 UI 动效、B-roll、AIGC 解释视频及可编辑工程；复用已选风格和实际实现，按句意设计动作、蒙版、转场与节奏。支持已有项目续作、逐句参考研究和明确指定的复刻。"
metadata:
  version: "2026.10.19.4"
---

# 我的 UI 动效剪辑

唯一调用入口是 `$ui-motion-fusion`。每次开始或继续制作，读取当前安装目录的本文件及适用档案；由 Agent 接续已确认设置，不让用户重新讲一遍画风或逐个点名底层 Skill。

四步制作流程是 **口播稿 → 声音克隆 → 数字人 → 剪辑成品**。本 Skill 主要承担最后一环：收到已完成的配音或人物视频就直接使用，配音作为口型、字幕和画面动作的共同时间基准。只有用户明确要做上游阶段才调用相应工具，不擅自重新生成声音，也不宣称已经自动打通所有服务。

## 四层与优先级

| 层 | 负责什么 | 入口 |
| --- | --- | --- |
| 主流程 | 范围、原稿原声、阶段、时钟与交付 | [workflow.md](references/workflow.md) |
| 风格与认可 | 账号外观、IP、确认范围与实现 | [style-profiles.md](references/style-profiles.md) |
| 效果与实现 | UI、蒙版、转场、镜头、AIGC、字体、渲染 | [library.md](references/library.md) |
| 参考与历史 | 逐句研究、原话、旧版本与证据 | [history.md](references/history.md) |

**本次明确要求 → 有认可依据的当前工程设置 → 当前公共 UI 与账号身份 → 所选模式 → 历史实现。** UI 外观、账号身份和 AIGC 画风分别选择，覆盖只作用于用户指定的部分。目录名、旧色号和 Agent 自己写的“已确认”不是新认可。规则在所属层维护；题材、秒点和镜头顺序留在本期工程。

## 默认调用应读到的要求

- `user-ui`、阿刁、方木的普通正文共用 [Fred 黑紫方向](references/fred-ui-direction.md)与[现行合同](references/evidence/fred-reference-approved-20261015.json)：深黑实体主体、黑底醒目紫色重点、清楚的大字级和前后层次。账号只保留其身份、声音、人物布局与独有习惯；真实开头可保留原场景，明确白板、复刻或有认可依据的旧项目按其范围覆盖。先查看合同的三张校准图；只给白色小窗加紫色细线不算完成。避免低对比淡紫模板、固定等宽四窗贯穿和逐句换卡。
- 讲过程要让同一对象的**初态、触发、动作、结果与下一步交接**可见；按句意选聚焦、放大、蒙版、变形、遮挡、换位等手段，不能用同一种缩放或淡入淡出代替所有动作。章节标题、总结表和必要的静止阅读仍可使用。
- 通用 AIGC 从[注册集](references/aigc-assets.json)的两张人物图和八张场景学习已确认的柔和手绘画风、材质和叙事方法。这些图默认只作风格参考，不是固定素材菜单，不自动作为首帧或反复上屏。每期按口播句意重新设计人物、空间、道具与事件，再生成匹配素材；只有当前工程明确固定 IP 时延续其身份，镜头内部保持人物与物体接触连续。简单动作利落完成，留出看懂结果的时间，不把模型生成时长当作必须使用时长。具体方法只在 [AIGC 导演](references/aigc-directing.md)维护。
- [女孩完整样片](assets/approved-girl-sample/output/preview.mp4)用于画风、动作、节奏和 AIGC/UI 交接；A01保留实现底座。它们的历史淡紫 UI **不覆盖**当前 Fred 正文方向。被否定的 `full-transfer-sample` 不可成为基线。
- 明确阿刁、方木或其他账号时使用对应档案，不用通用女孩覆盖其角色。公开包保留账号规则；私人音色、数字人和账号影片由该工程提供。未知或冲突账号不偷偷换成默认账号。
- “图片要摄影写实”只覆盖本期 AIGC 画风，不撤销 UI 或账号身份。记录原要求并按[风格层](references/style-profiles.md)独立绑定；不要把手绘女孩参考硬填给写实素材，也不要将写实要求解释成白底课件。
- 普通换稿、换目录、换窗口不撤销已有风格认可。已有风格与制作授权足够时直接完成所请求的整片；实质改变方向才做必要澄清或小样。未授权费用等仍按主流程处理。

## 从口播到实际工程

1. 核对完整口播、原声、素材和当前工程。先理解段落意思、上下文、人物情绪、观众哪里不懂，再决定人物、真实素材、UI 或 AIGC 的作用。不是按关键词配通用图片，也不按句号换页。
2. 从实际安装目录运行 `python -B -X utf8 scripts/ui.py direct -- prepare --script <口播文件> --project <工程目录>`。显式账号可加 `--profile`。读取完整原文、当前合同、实际视觉参考和 `context.selection` 按段候选；实际查看被选方法的原句、画面与适用条件。候选是检索辅助，不是自动选中的分镜；不用的候选无需硬套。
3. 在同一导演计划逐句或按连续事件映射 B-roll、动作和衔接；几句可共享一个场景。记录表达目的、采用参考或原创/保留人物的理由、AIGC 用不用及原因。用真实操作说明功能，用已标注示意说明机制。按[选用流程](references/selection-workflow.md)、[语义导演](references/semantic-directing.md)、[口播选材](references/script-visual-planning.md)将决定落实到实际素材和工程，不交给用户逐条点名。
4. 正式制作使用 `selection_contract_version: 1`、`style_contract_version: 1` 和当前 `style.binding`；需要 AIGC 时独立绑定当前画风。声明整片或明确节选范围，记录输出时间、实现文件及渲染入口实际读取的时间线映射。按[计划合同](references/director-plan-contract.md)运行 `direct -- check --plan <计划> --production`；漏覆盖、缺映射或过期绑定先修正。旧计划可诊断，但结构检查成功不等于生产就绪。
5. 交付实际画面与可编辑工程。按最终观看尺寸和连续播放检查重点、阅读停留、动作结果、画风与同步；有偏差先修。文件存在、结构通过、解码、实际视听和用户认可分别记录。`current_style_ready`只是当前依据齐备，不是自动审美评分。

## 内部资源与其他任务

- `styles -- resolve --project <工程>`：定位当前合同指纹、校准图、认可范围与实现；不能只看旧 `confirmed_baselines`。
- `modules check`、`guides --id <工具名>`：检查包内核心实现与可选插件。已配置的本机资源映射接续原片和历史参考源码；无本机映射时使用公开包并明确缺件，不要求用户重新调用旧 Skill。渲染引擎仍包内优先。
- `new --engine fusion|base|director|editorial`：生成可编辑起点，历史演示统一标为未应用当前风格。正式 `render` 必须有本工程当前绑定、生产就绪的导演计划；只看机制演示时显式 `--demo`，不作为正式成片。底层源码保留不等于所有旧皮肤获认可。
- `study -- list/read/find/example`：查逐句出处；`select` / `inspect` 查询本期候选和具体能力，按[选用流程](references/selection-workflow.md)操作。按[逐句程序](references/source-study-guide.md)对齐口播与连续画面，几张截图不能代表学懂全片。
- 忠实复刻读[复刻约束](references/reference-replication.md)；继续工程保留有效引擎和确认范围；局部改规则不触发整片制作。

[能力与源码导航](index.html) · [跨窗口使用](references/global-use.md) · [公开包范围](references/distribution-scope.md)。原作者整片、未附历史重建和私人账号素材明确标注未随包，不用虚假替代物补齐。原素材、既有项目和本地库不因升级而删除。
