# 口播到实际剪辑的默认接入

这是第一层的执行连接：收到口播制作任务就读取，无需用户点名秋芝、AIGC 或某个特效。语义方法见 [script-visual-planning.md](script-visual-planning.md)，条件偏好见 [broll-preferences.md](broll-preferences.md)，制作阶段及授权继续由 [workflow.md](workflow.md) 管理。本文件负责把判断接入资源和工程，不另建审批流程。

## 判断怎样接到实现

制作顺序、源音轨与实际画面检查统一按[主流程](workflow.md)；本页只维护调用连接。

1. `direct prepare` 读取原稿和当前档案，独立提供公共 UI、账号身份、AIGC 画风与 `context.selection` 的按段候选。先读取 `reference_directions` 与 `required_reading`；普通正文继承 [Fred 方向](fred-ui-direction.md)，不因账号目录或写实图片要求退回旧皮肤。Agent 查看适用样片和候选的原句/画面例证，按[口播选材](script-visual-planning.md)完成判断；检索得分不是创作决定。
2. 用下表和 [O/X/F/R 等能力](library.md)找实现；需要参考时按[研究接入](source-study-guide.md)回查所选方法的口播与画面证据。`study -- read --id Q-C01` 查来源，`direct -- recipes --id Sxx` 查配方；编号不是关键词剪辑规则。
3. 代码调用实际 API，传入本期对象、主题和时间；AIGC 使用适用角色、场景、具体动作与首尾状态。现成方法不合适时改编或定制，已有素材先核对再复用。
4. 正式制作把选用理由、引用或原创决定、覆盖范围、实际素材和输出时间留在同一导演计划。渲染入口读取的实际时间线与实现文件参与检查；文件哈希和映射不一致先修。表达、节奏和质感仍需查看实际输出，完成标准见主流程和[选用流程](selection-workflow.md)。

## 配方选型

| 理解任务 | 可用配方 | 制作入口 |
| --- | --- | --- |
| 开头先认出成果，再了解它来自哪里 | S01 结果预告回拉 | `result-pullback`，继续接原口播 |
| 开头看到问题及有依据的反差 | S02 问题、证据、反差 | `focus-mask` / `compare` 按事件组合，缺证据就补来源 |
| 在复杂画面里看清关键部位 | S03 聚焦并回到上下文 | `focus-mask`，目标区域来自实际素材 |
| 理解输入、条件、动作和结果 | S04 因果可见变化 | `causal-chain`，物体参与过程而非单纯文字入场 |
| 比较两种做法的关键差异 | S05 同条件比较 | `compare`，同对象、同尺度、说明比较条件 |
| 认出前一镜产物正进入下一步 | S06 对象跨媒介交接 | `match-handoff`，保持对象身份与去向 |
| 通过遮挡或揭示交代状态变化 | S07 因果遮挡揭幕 | `occlusion-reveal`，先有遮挡物和动机再揭示 |
| 抽象能力被取用、组合、产生效果 | S08 同空间取用组合 | 角色／物件连续动作的 AIGC 配方 |
| 从丰富信息到简化表达时丢失内容 | S09 信息损失具象化 | AIGC 动作与代码精确图形混合 |
| 需要感受人物的情绪转折 | S10 连续人物表演 | 连续动作视频；上下文决定动作，不能只换表情图 |

表是语义候选，不是关键词映射或每片必选清单。蒙版、缩放、拉远、遮挡、比较、匹配剪辑、层次、动字、快慢与停顿共同服务当前事件。整段不必只有一个效果，也不以效果数量为目标。不要替每个名词找素材，或把参考片里的负面示范当成正向手法。

`user-ui` 正文的细化候选见 [F-M01–F-M14](fred-ui-direction.md#按理解任务读取方法)：同源结果展开、比较让位、因果蒙版、状态更新、证据接机制图、基准替换、按动词操作及逐项总结。它们回接现有 S 配方和底层源码，不另造14个渲染预设；定制缺口与实现状态在每条方法里读取。来源查询使用 `study -- read --id F-M04` 或 `study -- example --video fred-argon --row F-L150`。

## AIGC 怎样自然接入

具体规则集中维护在[AIGC 导演](aigc-directing.md)：选用条件、参考场景的动作链、有效剪辑节奏、开头和转场，以及视频画风。先查看 `context.aigc` 中适用图像，按本期原句重新设计空间、道具和事件，再制作关键图和动作；例图只校准画风与叙事方法，不能自动成为首帧。仅在当前工程明确固定 IP 时延续原图身份。计划绑定当前 AIGC 画风和实际使用的参考，不因表格已填就声称生成结果已达标。

[资产注册集](aigc-assets.json)维护角色、场景、研究及后续视频认可，当前适用样片只从[账号档案](style-profiles.md)接续。新句意需要别的事件时，沿用已定画风补资产，不固定套用已有场景顺序。

既有接口、预算及请求准备见 [anime-video-generation.md](anime-video-generation.md)。已获当前项目预算时直接复用授权；没有时先交具体请求和估价再处理费用。未生成的工作项标为 `planned`，不宣称一键完整生成或已掌握原作者的模型、提示词、曲线和音乐节拍。

## 本地工具怎样辅助 Agent

从技能目录执行，工具不调用模型、不联网、不收费用、不决定语义：

```powershell
python -X utf8 scripts/ui.py direct -- prepare --script <原稿.txt> --project <当前工程目录> --profile user-ui
python -X utf8 scripts/ui.py direct -- recipes
python -X utf8 scripts/ui.py direct -- recipes --id S08
python -X utf8 scripts/ui.py direct -- check --plan <当前工程/director-plan.json> --production
```

`prepare` 将原稿路径、SHA-256、必须读取的约束与资源路径写入 `director-context.json` 和 `director-brief.md`。`context.selection` 提供按段候选，完整研究目录仍用于查找；独立的 `context.aigc` 包含画风、参考图、动作链、认可范围和当前绑定。通用 `user-ui` 默认选择 `qiuzhi-girl-painterly` 画风，账号／项目设置优先。工具辅助检索，选型仍由 Agent 完成；`--profile` 不是渲染器自动换肤。已有资料足够时接续工程，不重复拷贝媒体。

新建且含 AIGC 动作的计划采用 `aigc_contract_version:1`，在段落 `aigc` 中引用角色、场景、画风及实际动作节拍。`check` 核验文件存在、节拍有序及动作与结果停留不超上屏时长；旧计划兼容，非 AIGC 不强制填写。字段详见[计划合同](director-plan-contract.md#aigc-资产与实际剪辑节奏)。

Agent 将本次判断落到现有分镜，并以 `director-plan.json` 保存同一份记录或从原记录导出。正式制作采用 `selection_contract_version:1`；字段见[计划合同](director-plan-contract.md)。检查稿件覆盖、引用、素材、画风和真实时间线依赖，缺少选用证据的旧计划仍可读取但不能报生产就绪。原创或纯人物段落可以不用已有方法，需明确原因；不要求每句堆效果。输出后还要核对媒体与实际画面，结构通过不代表理解、生成质量或审美通过。

六种组件的接口、集成与可播放演示见 [editing-kit/README.md](../assets/editing-kit/README.md)。使用原工程的字体和主题变量，以原有时间轴驱动进度；组件不触碰音视频播放。新生成的素材仍由原工程后端合成。一个 Skill 的内部模块调用由 Agent 完成，不要求用户分别唤起几个 Skill。

## 当前样片与历史接入案例

当前认可样片及实现以[账号档案](style-profiles.md)和[样片索引](library.md#已认可的内容从这里接续)为准。通用 user-ui 已包含女孩完整动作样片；`styles resolve` 与 `direct prepare` 会定位其视频、认可证据和源码。以下旧例只用于追溯接入过程。

[四片逐句研究](source-study-guide.md)记录 103 分 41 秒来源的完整对应范围、36 条方法与未听审边界；[早期抽样证据](qiuzhi-editing-methods.md)保留此前过程，[机器配方](semantic-editing-recipes.json)保留源码、待生成与待认可状态。学习范围是完整剪辑手法、语义选材、AIGC 连续解释及开头，不只放大和素材展示。旧配方、原素材和已确认风格继续保留。

[新口播调用样例](evidence/semantic-transfer-sample-20261014.json)记录了一次实际制作：S03/S04/S05/S06 调用源码形成 32 秒无声结构预览，S08 填成具体生成请求。可从该记录找到可编辑工程和预览；21–32 秒仍为明确标注的待生成分镜，不是 AIGC 成品，也未获新审美认可。示例可用于查接入方式，换题材仍重新设计事件。
