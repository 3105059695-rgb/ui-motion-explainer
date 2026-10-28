---
name: ui-motion-fusion
description: "沿用已认可十款 Agent 正文的 UI 外观与 Fred 剪辑语言，将口播、真实材料、AIGC 事件、素材剪辑、UI 动效和声音组织成解释视频及可编辑工程；先把材料与过程剪进原声时间线，再精修包装。"
metadata:
  version: "2026.10.28.3"
---

# 我的 UI 动效剪辑

唯一入口 `$ui-motion-fusion`。开始或续作先读当前磁盘入口，通常输入数字人口播视频和口播稿，参考素材可选。Agent 完成理解、选材、制作、内部校准与返修，保留原稿、原声、字幕及本期人物身份。

## 当前依据与读取顺序

**当前 UI 就按用户认可的「十款 Agent」正文来：先看[实际 UI 图与动作](index.html#current-ui)，继承其外观、实体质感与当前配色，再从全效果库选动作与构图。** 这是 Fred 整体方向的具体基准，跨窗口默认；UI、AE 感、开头和禁忌一起继承。 本期明确换风格或指定续作工程已确认的局部要求才覆盖对应范围；不要每次重新选风格或让用户重述。旧档案里的“仅中段”、旧账号配色、父目录工程设置及历史笔记不能覆盖当前要求。不按目录或旧 `user-ui/adiao/fangmu` 自动换肤。仅整理 Skill 时不启动视频制作。

1. 读[审美偏好](references/aesthetic-preferences.md)：UI、AE 感、开头和禁忌的唯一维护位置。采用已认可正文的具体外观，以 Fred 原片补充颜色关系与质感，不另猜风格或简化成固定黑底紫字；整库动作保持开放，构图与设计可以丰富变化。按内容选择完整设计或动作组合，不把问卷片段、检索排名或少数原片变成调用边界。真实材料原色与准确重绘均可，按观感选择。设计、配色、动作偏好与源码可用性分别判断。AIGC 的柔和手绘只指定新图／视频画风，身份和覆盖边界见[参考使用](references/style-profiles.md)。
2. 按[主流程](references/workflow.md)接续工程、锁定母带；按[口播选材](references/script-visual-planning.md)理解全文，取得并查看本期材料，把有效入出点、关键变化和结果剪进原声时间线，再展开精细包装。素材缺失时继续补足或明确改选表达，不用通用标题卡悄悄填满。实际查看[秋芝逐句研究](references/source-study-guide.md)中适用的原句、上下文与画面证据，不以关键词候选代替判断。
3. 新建连续 UI 解释工程时，以[这期实际源码提炼的制作模块](assets/agent-editorial/README.md)承接已确认的颜色、实体质感与连续动作：通过 `new --engine fusion -- --custom-layout --canvas-story --out <工程>` 实际装入代码，在本期 `scenes.js` 设计事件，由 `timeline.json` 驱动。它没有排行榜、固定卡片顺序或旧口播。整个效果库继续按本期需要选用完整设计与动作，已有工程沿用其后端；接口查[引擎路由](references/engine-routing.md)。保持同一份 `director-plan.json` 的语义、原声时间、素材与实现映射；字段只在[计划合同](references/director-plan-contract.md)维护。后端配置与时间线是实现或派生产物，不另写一套导演决定。
4. 分别设计材料怎么剪、UI 怎样表现对象和状态变化、声音怎样跟随动作与切点；不能只让文字容器进出。用本期原声内部校准完整开头事件及代表性正文，再展开；按[视觉检查与修正](references/visual-quality.md)检查实际连续输出并返修。已定方向不要求用户再次点名素材或批准每镜。技术检查、实际视听和用户认可分别报告。

## 整片参考复刻

用户说“按阿闰会员测评这条来”“完整复刻这条感觉”时，直接选 `arun-membership`：保留整片的构图、材料展示、连续动作、蒙版、转场与回扣，UI 外观和颜色仍按上方已认可基准。准备时使用 `direct -- prepare --reference arun-membership`，完整 105 句、31 段观察和连续章节进入上下文，不只取关键词命中的几招；新建时用 `new --engine fusion -- --custom-layout --canvas-story --reference arun-membership` 实际装入场景模块。读取[复刻入口](references/reference-replication.md)和随上下文给出的源码，按本期口播编排事件。

同稿复刻按原片全序列逐段对照，仅替换明确指定的包装；换稿保留这套整体表达方式，重新安排对象、素材与时间，不能固定套三家会员或榜单。仅调用 Skill 而未指定此片时，它是完整参考选项，整库其他能力继续可选。有开头人物时仍保留全景与保护区。

## 开始与按需查询

在实际安装目录运行：

```powershell
python -B -X utf8 scripts/ui.py direct -- prepare --script <口播文件> --presenter <原声视频> --project <工程目录>
```

无人物视频的任务省略 `--presenter`。读取生成的全文、上下文和 `director-brief.md` 后继续当前授权范围；`prepare` 本身不完成导演或成片。完整场景用 `scene list/inspect` 查当前能力，具体生产命令见引擎路由；其他已有工程沿用真实后端。底层运动 API、素材下载成功和源码存在都不等于完整设计已完成。

`select/inspect/study` 查询方法与源码；`modules check/guides` 查询资源。历史演示、原素材、源码及有效经验继续保留，来源见[历史](references/history.md)。新规则按[唯一归属表](references/module-map.md)修改一处，不追加平行流程。费用、外部发布和重要数据操作按本期授权执行。

[打开效果库](index.html#library) · [跨窗口调用](references/global-use.md)。
