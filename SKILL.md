---
name: ui-motion-fusion
description: "沿用已认可十款 Agent 正文 UI 与当前 A 配色，从整个效果库按口播选择、绑定和组合已有实现，制作真实材料、AIGC、人物和声音组成的视频及可编辑工程。"
metadata:
  version: "2026.11.06.5"
---

# 我的 UI 动效剪辑

唯一入口 `$ui-motion-fusion`。通常输入数字人口播视频和口播稿，参考素材可选；Agent 负责理解、选材、实现、实际视听与返修。仅检查或整理 Skill 时不启动视频制作。

## 新窗口完整读要求、全库与认可参考，再选本期实现

从实际安装目录运行 `python -B -X utf8 scripts/ui.py read plan`，按返回顺序完成三部分：

1. **全部现行要求**：`read requirements --part 1`，顺序读到末页。[全文清单](references/requirements.json)包含本文件、[审美偏好](references/aesthetic-preferences.md)、制作流程、选材、AIGC、人物、后端与交付等现行合同。条件规则都读，实际按本期需要执行。
2. **全库能力目录**：`read catalog --part 1`，顺序读到末页。每个保留条目的名字、表达用途、关系、执行状态和外观范围都进入目录；分类与别名不算额外效果。整库参与选择，prepare 的几条候选不能代替完整目录。
3. **全部认可参考**：`read references --part 1`，读完查看队列，并实际打开每条可用的全片总览和看不清处的细读页，包括正文 UI、Fred、阿闰与秋芝/AIGC。四张旧局部图不能代替。[图集](assets/reference-atlas/index.html)里的认可范围分别生效；采样图不等于看完每一帧或完整动态。缺少的私人来源如实记录，不用不相关图补位。

选定效果后运行 `read selected --id <能力ID>`，检查实际调用入口，逐文件读取其**完整实现、本地依赖和生产 UI 适配器**；`read source --path <Skill内源码相对路径> --part 1` 提供不截断的全文分页。查看所选效果的完整连续预览，继承已有实现；不用每期重新学习全部历史源码与原视频。需要整体运动基准时用 `ui.py style-film inspect` 查看[连续风格片](assets/style-film/index.html)：它用认可正文源码重演设计，示意素材并非新认可成片。

这是用户确认的读取范围。当前窗口已完整读过且文件未变时可复用；新窗口、内容更新或上下文缺失时补齐对应内容。输出目录、哈希或运行读取命令本身不能证明已读懂、已观看或已获认可；上下文不足时保留真实读到的位置继续，不能只读前几项便声称完成。不添加用户签字或逐镜审批。

读取后准备本期：

```powershell
python -B -X utf8 scripts/ui.py capabilities check --require
python -B -X utf8 scripts/ui.py direct -- prepare --script <口播文件> --presenter <原声视频> --project <工程目录>
```

无人物视频时省略 `--presenter`。默认准备结果接入全部现行要求、完整阅读队列、当前审美、全部全片图集、逐段能力候选与本期素材检索。仅给数字人和稿件也要主动找素材；准备不是已经搜索、观看、下载、选材或成片。旧账号、示例配色和历史工程不覆盖当前要求。

新电脑首次需要 Remotion 依赖时运行 `ui.py library setup --core`，优先复用符合版本的现有环境，否则安装到唯一共享位置；之后渲染自动复用。不要为每片复制 Node、浏览器或 node_modules。Python、Node、FFmpeg 和浏览器仍是实际运行条件，资源检查通过不等于它们已安装。

## 整库选择，调用实际代码

1. 通读整稿，确定每段要展示的具体对象、变化与结果。通过 `ui.py materials` 建本期检索与素材记录，按[选材流程](references/script-visual-planning.md#从口播到真实素材的实际获取)使用 ego 在 X、B站、抖音及产品原站搜索、打开来源、查看内容，取得可剪视频或清晰截图，再导出本地素材绑定。平台和查询词按语义选择，不是每句必须跑三站；不能停在搜索链接或封面。抽象情绪和比喻可选已认可手绘 AIGC。素材质量不足时继续找或改选清楚的表达，不用标题卡填满。
2. 在完整读过目录后，用 `ui.py capabilities list` 复查完整保留目录，或 `search --query "本段对象、关系和变化"` 查找，再 `inspect --id <能力ID>` 查看参数、源码、预览、来源和执行状态。prepare 的短候选不是白名单；未命中可换表达或查全库。
3. 按 inspect 返回的真实入口执行。原工程和独立实现统一使用 `ui.py library inspect/scaffold/build/render`；O/R/X 使用 `ui.py semantic inspect/materialize` 绑定现有对象；已编排的研究方法与剪辑配方用 `ui.py programs inspect/scaffold/build` 绑定本期对象和各阶段时间。`direct` 表示有调用接口，仍需本期材料；技术运行状态单独记录。`source-adaptation`、`reference-only`、`missing` 不伪装成功；遇到失败明确修复具体依赖或绑定，不偷偷换成通用卡片。分类目录不算额外效果数量。
4. 可组合事件通过 `ui.py events list` → `inspect --id <类型>` → `scaffold --capability <类型,类型> --out <绑定.json>` → 填入本期对象、数量、布局、素材、口播时窗 → `validate --spec <绑定.json>` → `build --spec <绑定.json> --out <工程>` 执行。已有材质和动作代码负责绘制，新稿重新设计内容与组合，不固定榜单、卡片数和镜头顺序。
5. 原设计适用时仍可用 `ui.py designs list/inspect/scaffold/build`，保留真实 `BodyA/BodyB` 的完整连续设计。原适配器的固定结构不能靠改标签伪装成任意数量；新结构使用可组合事件或基于实际源码改编。全库其他能力按 inspect 返回的实际入口接入。
6. 既有代码按参数运行，选中能力的完整动态预览用于理解动作起止与阅读停顿；它不是让新窗口再次研究或从头实现。会员预览的独立实现会明确区别于会员原源码。绑定本期材料后尽快渲染实际片段；选中后完整读对应源码；改编、排错或新增能力才深入原片研究。

实际 UI 适配状态用 `ui.py ui-status` 查询，逐条细节随 `capabilities inspect` 返回；接线记录、浏览器检查、实际视听和用户认可分别报告。生产创建默认使用当前材质角色，历史外观只在明确对照模式保留。图库原动作、构图和内容槽继续参与选用，不套成同一种卡片。

当前 UI 是用户认可的「十款 Agent」**正文**与当前 A 色，Fred 补充其质感与剪辑语言；不是黑底紫字标签，也不以四张旧图或某片榜单决定全部画面。使用既有实现保持外观，把时间花在本期具体内容、材料与事件上。

## 本期制作与检查

保留原稿、原声、字幕与本期人物身份。有开头人物素材时保持完整原构图，特效放在动作期间的实测空白区，避开脸、身体、手势与字幕；无人物时按内容设计全屏开头。AIGC 参考图提供画风，本期重新生成适合口播的内容，不固定女孩或旧场景。

同一份导演计划记录原句 → 实际素材 → 所选能力及参数 → 实现文件 → 成片时段。先让材料、过程与结果进入原声时间线，再精修细节。按授权范围完成整片，内部校准后继续，不另加逐镜审批。实际连续动作、可读性、材质、声音与人物遮挡要在本期渲染中检查；技术通过、实际听看和用户认可分别报告。

现行全文中相应阶段的唯一来源：[主流程与原声](references/workflow.md)、[选材](references/script-visual-planning.md)、[AIGC](references/aigc-directing.md)、[人物合成](references/presenter-editing.md)、[后端接口](references/engine-routing.md)、[导演计划](references/director-plan-contract.md)、[实际视听](references/visual-quality.md)。费用与外部发布按本期已有授权执行。

## 学习、整片复刻和维护

显式研究新能力或用户指定整片复刻时用 `direct -- prepare --mode research`，按需要 `overviews --brief`、`study` 和[全片图集](assets/reference-atlas/index.html)查看相关完整事件与前后语境。原视频、逐句证据和源码用于补充能力或定位差异，不能声称抽帧等同完整观看。

指定阿闰会员测评时可加 `--reference arun-membership`，接入其完整表达路线，颜色沿当前 UI；同稿对照完整序列，换稿重新设计本期对象与时间。完整方法见[参考复刻](references/reference-replication.md)。普通制作不被固定到此片或其他单片。

`ui.py requirements --part 1` 与 `read requirements` 提供同一份完整现行正文，默认新窗口全部读取；[清单](references/requirements.json)按来源维护，不复制一套新规则。`references check --require` 检查历史参考档案是否齐全，与 `capabilities check --require` 的生产依赖检查分开。公开包可直接运行随包能力；私人原片缺失只影响对应历史研究。已有素材、源码、动效、认可记录及全库入口均保留。
