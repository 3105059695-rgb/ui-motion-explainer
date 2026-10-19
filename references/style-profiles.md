# 第二层 · UI、账号与 AIGC

这一层分别确定 **正文 UI、账号身份与习惯、AIGC 画风**，不把它们打包成一个不可分开的皮肤。主流程见 [workflow](workflow.md)，动作实现见[效果库](library.md)，原认可与历史材料保持原范围。

## 三项分别继承

| 维度 | 默认与覆盖 |
| --- | --- |
| 正文 UI | `user-ui`、阿刁、方木的普通正文共用[当前 Fred 合同](evidence/fred-reference-approved-20261015.json)：深黑主体、醒目紫色重点、大字级与前后层次。账号目录名与旧色号不撤销它。真实开头可保留原场景；明确白板、忠实复刻或有认可依据的旧工程按适用范围保留 |
| 账号 | [阿刁](profiles/adiao.md)、[方木](profiles/fangmu.md)保留各自人物、声音、布局条件和系列习惯。没有账号时使用 [user-ui](profiles/user-ui.md)；未知账号或冲突设置不猜测，不跨账号借私人身份 |
| AIGC | [注册集](aigc-assets.json)及本期明确要求单独选择画风。通用例图默认只校准画法、材质与方法；固定 IP 需要当前工程依据。用户说“图片要摄影写实”只改变这项，不让 UI 退回白底课件，也不改变原配音 |

账号的历史配色、旧片认可和源码继续保留为具体案例。历史“去掉真人开头的大黑底”不等于今后整片禁黑；旧样片中淡紫 UI 不覆盖当前公共正文。普通换稿不撤销认可，也不再请用户解释基础审美。

## 解析与工程覆盖

从实际 Skill 目录运行：

```powershell
python -B -X utf8 scripts/ui.py styles -- resolve --project <工程>
python -B -X utf8 scripts/ui.py direct -- prepare --script <口播.txt> --project <工程>
```

账号按明确 `--profile`、最近工程声明、最具体目录路由定位；公共 UI 方向独立继承。本机 `registry.local.json` 可接续私人档案、样片、源码和原址，不得用空方向列表悄悄移除当前公共 UI。公共档案与私有补充一起读取，私有历史文字不能覆盖当前合同。

真正改变正文外观时，保存本次用户要求或原工程认可的**实际原话、来源与范围**，按[计划合同](director-plan-contract.md)绑定；不能把 Agent 自己生成的 `current_request_override`、`current_style_applied:true` 或“已确认”当作认可证据。只要求写实素材、增加图片或时间线导航，不构成 UI 外观覆盖。记录是 Agent 的工作，不要求用户填配置表。

本期摄影等未注册 AIGC 方向使用 `project.json` 的 `aigc.direction_override`，其 `scope` 为 `aigc-only`，`direction` 描述画风，`source` 保存原要求文件的路径、SHA-256 和准确原句，`style_references` 指向本期实际校准图。它只作用当前工程，不能自动继承到其他稿件。来源匹配证明记录一致，不证明文件作者或审美已获接受；不得伪造用户原话。完整字段见[计划合同](director-plan-contract.md)。

已有注册 AIGC 方向仍可用 `aigc_style_id` 或 `aigc.style_set_id` 选择；未知或冲突选择保持未确定。角色与画风通过 `context.aigc` 进入导演流程，UI 通过 `style.binding` 独立进入；两种绑定不得互相代替。

## 样片与实现怎样使用

`reference_directions` 是当前参考方向，`confirmed_baselines` 是具体历史片段及认可范围；两者不互相替代。先查看当前校准图和适用片段，理解主体分量、材料尺度、阅读重点、动作与交接，再使用实际源码。路径存在、色号非空、哈希一致与生产检查通过均不证明当前画面合适。

Fusion 创建器只创建实现起点，`--profile` 不会自动改好所有画面。素材与事件仍按本期口播制作，不能把历史 CSS 或组件演示当成默认成片。记录归入现有项目说明或导演计划：账号、UI/AIGC 当前依据、素材来源、原话与覆盖范围，不维护重复表格。

2026-10-14 的[完整样片反馈](evidence/full-transfer-feedback-20261014.json)确认 AIGC 衔接，同时否定 UI 外观；该片不能成为后续 UI 基线。其他片段也只保留实际获认可的范围，局部肯定不升级为新片自动认可。

## 保留与跨机器

四层结构不变，历史动效、源码、蒸馏参考和认可证据不删除。私人素材、音色与数字人留在本机原工程，通过[资源映射](module-map.md)接续；公开包不携带私人文件。跨窗口由 Agent 重读当前入口与解析结果，普通调用不要求用户唤起多个账号或 AIGC Skill。追溯旧案例时读[第四层](history.md)，不同时加载多个旧入口争夺当前规则。
