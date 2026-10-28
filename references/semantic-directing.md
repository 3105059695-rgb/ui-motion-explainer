# 导演判断到实现的接线

本页只维护语义配方到实际实现的连接。制作阶段读[主流程](workflow.md)，怎样理解原句读[口播选材](script-visual-planning.md)，审美读[审美偏好](aesthetic-preferences.md)，命令与字段读[引擎路由](engine-routing.md)和[计划合同](director-plan-contract.md)。

## 判断怎样接到实现

从 `direct prepare` 的上下文定位研究与源码，沿当前已认可正文 UI 与 Fred 剪辑语言落实本期事件。用下表和[效果库](library.md)找实现；`study -- read --id Q-C01` 回看来源，`direct -- recipes --id Sxx` 查询配方。完整场景接入按引擎路由，底层组件由宿主提供内容、布局与时间；实际调用位置写入同一导演计划。编号与文件存在不是设计或执行证据。

## 配方选型

| 理解任务 | 可用配方 | 制作入口 |
| --- | --- | --- |
| 开头先认出成果，再了解它来自哪里 | S01 结果预告回拉 | `result-pullback`，继续接原口播 |
| 开头看到问题及有依据的反差 | S02 问题、证据、反差 | `focus-mask` / `compare` 按事件组合，缺证据就补来源 |
| 在复杂画面里看清关键部位 | S03 聚焦并回到上下文 | `focus-mask`；需要固定外框内移动素材时用 `viewport-focus`，目标区域来自实际素材 |
| 理解输入、条件、动作和结果 | S04 因果可见变化 | `causal-chain`，物体参与过程而非单纯文字入场 |
| 比较两种做法的关键差异 | S05 同条件比较 | `compare` 或连续让位的 `comparison-reflow`，同对象、同尺度、说明比较条件 |
| 认出前一镜产物正进入下一步 | S06 对象跨媒介交接 | `match-handoff`，保持对象身份与去向 |
| 通过遮挡或揭示交代状态变化 | S07 因果遮挡揭幕 | `occlusion-reveal`，先有遮挡物和动机再揭示 |
| 抽象能力被取用、组合、产生效果 | S08 同空间取用组合 | 角色／物件连续动作的 AIGC 配方 |
| 从丰富信息到简化表达时丢失内容 | S09 信息损失具象化 | AIGC 动作与代码精确图形混合 |
| 需要感受人物的情绪转折 | S10 连续人物表演 | 连续动作视频；上下文决定动作，不能只换表情图 |

表是语义候选，不是关键词映射或每片必选清单。蒙版、缩放、拉远、遮挡、比较、匹配剪辑、层次、动字、快慢与停顿共同服务当前事件。整段不必只有一个效果，也不以效果数量为目标。不要替每个名词找素材，或把参考片里的负面示范当成正向手法。

Fred Talk 默认的来源研究见[F-M01–F-M14](fred-ui-direction.md#按理解任务读取方法)。来源方法、可调用组件和完整场景是不同状态；方法未完整实现的部分仍需按本期内容适配，不能把组件演示当完整 Fred 场景。

## AIGC 怎样自然接入

选择条件与动作设计读[AIGC 导演](aigc-directing.md)，`context.aigc` 和[资产注册集](aigc-assets.json)定位参考；画风与身份的分工读[参考使用](style-profiles.md)。技术请求交给[生成接口](anime-video-generation.md)，按主流程处理实际费用授权。未生成项保留 `planned`，完成的素材与动作节拍回写同一计划。

## 本地工具怎样辅助 Agent

从技能目录执行，工具不调用模型、不联网、不收费用、不决定语义：

```powershell
python -X utf8 scripts/ui.py direct -- recipes
python -X utf8 scripts/ui.py direct -- recipes --id S08
```

选用查询集中在[选用接口](selection-workflow.md)，所有生产字段和检查状态集中在[计划合同](director-plan-contract.md)。九项组件的真实参数见[EditingKit API](../assets/editing-kit/README.md)，组件不控制音视频播放。调用、生成和实际画面检查由 Agent 接续完成，不让用户分别唤起多个入口。

## 当前样片与历史接入案例

完整参考与历史认可在[历史](history.md)按范围查证；Fred Talk 的默认不把任何旧整片直接套成本期结构。

[四片逐句研究](source-study-guide.md)记录 103 分 41 秒来源的完整对应范围、36 条方法与未听审边界；[早期抽样证据](qiuzhi-editing-methods.md)保留此前过程，[机器配方](semantic-editing-recipes.json)保留源码、待生成与待认可状态。学习范围是完整剪辑手法、语义选材、AIGC 连续解释及开头，不只放大和素材展示。旧配方、原素材和已确认风格继续保留。

[新口播调用样例](evidence/semantic-transfer-sample-20261014.json)记录了一次实际制作：S03/S04/S05/S06 调用源码形成 32 秒无声结构预览，S08 填成具体生成请求。可从该记录找到可编辑工程和预览；21–32 秒仍为明确标注的待生成分镜，不是 AIGC 成品，也未获新审美认可。示例可用于查接入方式，换题材仍重新设计事件。
