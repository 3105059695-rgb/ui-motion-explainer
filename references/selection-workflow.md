# 方法与实现的选用接口

本页维护查询、候选状态及引用落点。导演判断读[口播选材](script-visual-planning.md)，Fred Talk 默认与参考范围读[审美偏好](aesthetic-preferences.md)，制作阶段读[主流程](workflow.md)。`direct -- prepare` 将整篇研究和按段候选写入 `director-context.json.selection`。

## 从候选到实际选用

1. `selection.segments` 的原句与字符位置仅用于定位。先确定本段需要的具体材料、事件或证据和承载方式，再选素材剪法与动效实现。查看 `narration_study` 的来源原句、上下文与画面证据，以及候选的实际展示、接口和定制部分；连续几句可以共用事件，候选排名不决定分镜。
2. FredTalk 的 `software-preset/fredtalk:<ID>` 用 `inspect` 核对真实源码、依赖和缺件；`ui.py fredtalk materialize --id <ID> --project <工程>` 取得本期 `vendor/fredtalk/` 后还需实际接入。复制完成不等于运行完成。整库动作都可检索和改编；外观设计与配色分别处理，不因某个演示的配色反馈排除其动作。
3. 在同一计划记录本段采用、改编、原创或保留人物的理由和实现位置。所选聚焦、对比、接力等能力要绑定本期实际材料、关键区域与有效时间；“选中效果”不等于已剪进片子。`library_refs.source_binding` 指向该项真实来源，`application` 指向本期实现；`design` 与 `motion` 的区别及字段见[引用格式](director-plan-contract.md#效果库设计引用)。`source_study_refs` 记录来源方法，`recipe_ids` 记录配方，不凑引用数量。
4. 预检和实际输出按主流程完成；计划变化后同步实现，禁止事后给所有段批量填同一句原创理由。检查账本记录的是声明与落点，不能代替观看画面。

参考人物、示例数字和旧稿件不自动成为本期内容；素材用途与身份边界见[参考使用](style-profiles.md)。

句子检索前几名不是全部能力。`selection.library_directory` 保留完整效果目录及对应 inspect 入口，不受每句 top-N 限制；`context.source_study.method_directory` 保留完整方法简表。先理解整段，再用适合的视觉对象/动作描述查询；未命中时可以浏览整库或直接 inspect 已定位项，不强塞低相关候选。中文标签帮助发现英文案例，不等于自动完成语义导演。

## 可直接运行的查询

在实际安装目录运行；下例不生成媒体、不改原稿、不联网或产生费用。

```powershell
python -B -X utf8 scripts/ui.py select --list-library
python -B -X utf8 scripts/ui.py select --script 'E:/项目/口播.txt' --format markdown
python -B -X utf8 scripts/ui.py select --script 'E:/项目/口播.txt'
python -B -X utf8 scripts/ui.py inspect --kind method --id F-M01
python -B -X utf8 scripts/ui.py inspect --kind recipe --id S06
python -B -X utf8 scripts/ui.py inspect --kind capability --id F03
python -B -X utf8 scripts/ui.py inspect --kind family --id software-presets
python -B -X utf8 scripts/ui.py inspect --kind sample --id A01
python -B -X utf8 scripts/ui.py inspect --kind software-preset --id interaction-account-setup-accordion
```

`select` 默认输出 JSON，`--format markdown` 输出可读摘要；`--limit` 控制每段方法候选数，允许 1–10。也可用 `--text '本段原句'` 查询短句。JSON 保留前后句、检索线索及排序依据，所有决定都是 `pending-agent`；不会偷偷自动确认镜头。

查某一历史参考案例的现有工程与入口：

```powershell
python -B -X utf8 scripts/ui.py inspect --kind reference --id '<目录中的案例ID>'
```

此查询使用资源注册的包内目录或明确的本机补充映射；没有随公开包分发的旧工程会明确显示不可用，不伪造源码。`inspect --kind method` 的 `read_command` 可继续读取具体原句和镜头研究。源文件存在不表示脚本已运行，原片路径存在也不表示本次已经看过。

## 检索范围与实际限制

- 来源方法的正向说明进入检索，负例单列为 `counterexamples`。例如 Q-W08 只供避免遮挡/过度炫光的检查，不能推荐为改编方向。
- 10 条语义配方和能力目录主要路由参与排序，候选可定位到对应的现有组件；只分析过的方法会保留其未重建状态，不能标成现成效果。
- 检索使用关系线索、同义表达、前后句和加权中文文本相似度。完整“同一输入→两个结果”比孤立的“报告”更有区分度；否定的“不是信息丢失”不应触发损失隐喻。但它仍是离线辅助检索，不是对任意中文口播的完整理解。
- 排序分数不是概率、审美评分或本片适用性证明。尤其是隐喻、反讽、复杂否定和跨段关系，Agent 必须读整稿判断。低相关候选应被拒绝；无候选允许继续创作，不能要求用户重新解释已经确认的风格。
- 原片、逐句研究、方法、配方、组件和展示项存在重叠，不把它们的数量相加成“已实现效果总数”。历史样片认可也不自动转移到新片。

下一步是否真正完成，看本期计划与工程中能否追到：**口播原句 → 选用/不选用理由 → 当前素材和动作 → 实现文件 → 成片时间段**。检查结果的 `selection_evidence.ledger` 会把句意、动作、交接和落点带回，便于对照实际视频；这些仍是计划描述，必须核查画面是否真的发生。讲产品要有真实身份与界面，讲修改要让同一对象发生修改，不能把补齐几张图标和说明文字当作已学会剪辑。这是 Agent 的工作，不是用户需要填写的新表单。
