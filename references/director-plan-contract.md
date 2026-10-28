# 导演计划：本地工具合同

本文件是普通路线与完整场景路线共同的计划字段和检查状态合同。`scripts/director.py` 负责输入整理与静态检查，不代替 Agent 的[导演判断](script-visual-planning.md)或[实际观看](visual-quality.md)，不调用生成服务。

```powershell
python -X utf8 scripts/ui.py direct recipes
python -X utf8 scripts/ui.py direct recipes --id S01
python -X utf8 scripts/ui.py direct prepare --script <原稿.txt> --project <当前工程目录>
python -X utf8 scripts/ui.py direct check --plan <导演计划.json> --production
```

统一入口如果使用 `--` 传递参数，以 `scripts/ui.py direct --help` 的实际帮助为准；也可直接调用 `scripts/director.py` 的同名子命令。

正式预检必须加 `--production`（同义参数 `--require-production`）：仅 `preflight_ready=true` 才退出 0，旧 `production_ready` 保留为相同值的兼容字段。省略参数是历史结构诊断，退出 0 只说明 `plan_valid=true`。`assessment.stage=technical-preflight` 明确这只是技术预检，动作执行、句意匹配、视觉风格、完整视听与用户认可均为 `not-assessed`；静态工具不将它们自动升为通过。现有 `ui.py render` 沿用该预检，不增加创作审批流程。

`prepare` 生成 `director-context.json` 与 `director-brief.md`，保留完整原文、原文件 SHA-256 和本期视频原声来源，同时携带当前 Fred Talk 默认及实际参考。`selection.narration_study` 提供来源原句、上下文与画面证据；候选不等于已完成设计。字段变更时重新准备，同内容跳过；不同内容仅在明确 `--force` 且确由工具生成时更新，源稿和其他文件不覆盖。

`context.aigc` 独立加载[AIGC注册集](aigc-assets.json)。本期 `aigc.direction_override` 或明确的 `aigc.style_set_id` 优先；否则使用用户已明确的统一柔和手绘画风参考。账号和目录不改变该选择。画风不绑定女孩身份；当前工程显式固定IP才提供 `identity_rules/identity_references`。原始认可保留，当前用途是制作这种画风的新图和视频，不代表该旧片UI或新输出已认可。未知/冲突显式声明仍报未解决，不静默回退。

本期明确要求与注册画风不同（例如摄影写实）时，可在本工程 `project.json` 的 `aigc.direction_override` 保存有出处的局部方向，优先于注册选择：

```json
{"aigc":{"direction_override":{
  "scope":"aigc-only",
  "direction":"摄影写实、自然光、真实杯子材质",
  "source":{"kind":"current-user-request","path":"本期要求原文.txt","sha256":"真实文件哈希","quote":"本期素材用摄影写实"},
  "style_references":["assets/本期摄影方向图.png"]
}}}
```

也可保存在本工程 `current-project.json` 或计划顶层；多处声明必须一致。`source.kind` 仅接受 `current-user-request` 或 `current-project-confirmation`；原文文件必须存在、SHA-256 一致、精确引文能在其中找到。来源是用户实际要求或工程已有确认，不能由 Agent 自写“已确认”替代。代码只能验证文件与引文一致，**不能自动认证作者身份、判断引用的语义授权或产生审美认可**。

此覆盖仅在当前工程生效，不从父目录传播到另一期工程；`scope` 只允许 `aigc-only`，不能顺便更改 UI。`style_references` 是本期适用的现有参考或按该方向制作的关键图，至少一张；不要求女孩、不要求固定 IP，不沿用无关的手绘绑定。它们默认只作风格依据，是否可上屏仍看本期用途；图片存在也不是审美批准。`prepare` 返回 `selected_style_set:"project-local-aigc"`、当前来源和图片，以及独立的 `context.aigc.binding`。正式段落绑定该值，同时在 `selection.evidence` 登记实际来源文件和画风参考的哈希；`aigc.style_ref` 必须属于本期所选方向。源文、方向或参考内容改变后重新准备，不能保留过期绑定。

## 当前风格绑定与跨机器调用

新制作计划使用 `style_contract_version:1`，把 `context.style.binding` 原样复制到 `style.binding`。当前默认仍使用 `mode:"unified-production"`；兼容 ID `profile_id:"user-ui"` 不表示按账号换肤。`guidance_sha256` 绑定[审美偏好](aesthetic-preferences.md)，`directions` 绑定 `fred-talk-default-20261020` 方向合同、revision、合同哈希及三张真实校准图的索引与哈希，不能用空数组替代。

`styles resolve` 与 `prepare` 普通输出为 `ui_direction_source:"fred-talk-default"`；`reference_directions` 携带方向合同与 `visual_anchors`，`guidance` 指向当前审美入口。`style_references_ready` 只说明绑定资料可读，不证明已经查看参考、应用构图或通过审美检查。

`context.style.preferences` 从唯一审美页派生 `path/text/sha256/sections`，携带全文及章节定位；简报明确继承 UI、AE 感、开头与禁忌，不维护第二份规则。正文例外生效时，`default_reference_directions` 继续保存默认方向，`binding.default_directions` 绑定其合同和参考图；当前正文方向仍在 `reference_directions`。默认与正文参考各自验证，正文覆盖不免除全局必读要求。

旧账号注册项和本机 overlay 留作历史兼容，可用 `styles list` 查询；不由目录或旧 profile 改变全局默认。统一路由只读取指定工程根目录的 `project.json`，父目录的模式、原声、身份或旧例外不传播给新工程；指定续作从其根目录进入。有真实来源的 `style.ui_override` 仅覆盖本工程 `body-ui`，保留整体偏好、开头与禁忌的必读资料；不能由 Agent 自写“用户已确认”绕过默认。

`check` 校验当前方向和显式工程覆盖。旧绑定、缺少当前方向／校准图或哈希失效会阻止正式导出，需重新 `prepare` 并核对来源后更新计划；不自动改写历史计划。默认不要求照搬某一部旧整片，实际素材、源音频与实现仍独立校验。

旧计划仍可做来源、素材、时序和实现结构诊断。`current_style_ready` 表示当前 Fred Talk 方向或明确工程覆盖依据有效；`style.applied` 和非空 tokens 也只记录实现状态，不等于视觉应用正确、完整视听或用户认可。

AIGC 另外返回 `character_references_ready`、每个场景的 `reference_ready`、整个目录的 `production_references_ready`；这些是资源盘点，不是每片必须使用所有场景。`optional_provenance_missing` 只列原作者视频／原片帧等可选溯源缺件，不把它们当作角色图缺失。实际计划仅校验本片使用的角色、场景、画风参考。没有 AIGC 的片段不受未用场景缺图影响；选用的角色或场景缺失不得用别的 IP 静默替换。版本 1 的风格计划若含 AIGC 动作，也必须填写下文的动作参考合同，不能利用旧计划兼容性跳过。

## 最小结构示例

下面是基于原稿“先看关系。”的**待填写样例**。SHA-256 和实现路径必须换成当前文件的真实值，不能原样交检查。

```json
{
  "schema_version": 1,
  "style_contract_version": 1,
  "source": {"path": "口播稿.txt", "sha256": "原文件字节的真实SHA-256"},
  "style": {
    "binding": {
      "schema_version": 1, "mode": "unified-production", "profile_id": "user-ui",
      "guidance_sha256": "从context.style.binding原样复制",
      "directions": [{
        "id": "fred-talk-default-20261020", "revision": "从当前上下文复制",
        "sha256": "当前方向合同真实哈希",
        "anchors": [{"index": 0, "sha256": "校准图0真实哈希"}, {"index": 1, "sha256": "校准图1真实哈希"}, {"index": 2, "sha256": "校准图2真实哈希"}]
      }]
    },
    "tokens": {"background": "当前工程确认的背景", "type": "当前字体体系"}
  },
  "timing": {"basis": "script-estimate"},
  "segments": [{
    "id": "relation-01",
    "quote": "先看关系。",
    "context": "前一段建立参与者，本段开始解释关系",
    "meaning": "让观众知道参与者如何相连",
    "viewer_gap": "对象已出现，但相互关系还不可见",
    "carrier": "diagram",
    "why": "保留对象并建立关系比换场更容易理解",
    "recipe_ids": [],
    "objects": ["object-a", "object-b"],
    "events": [{"initial": "两对象已在场", "trigger": "原声说到关系", "change": "连线建立", "result": "关系可见"}],
    "focus": "当前连线及两端对象",
    "reading_exit": "看清关系后进入下一原句",
    "continuity": {"entry": "继承两个对象", "exit": "保留关系供下一段使用"},
    "implementation": {"path": "src/relation.js"},
    "assets": []
  }]
}
```

- 计划中的所有相对文件路径以**计划 JSON 所在目录**解析；绝对路径保持原址。`prepare` 的命令行相对路径以当前终端目录解析。
- 原文以 UTF-8 或 UTF-8 BOM 解码，保留 CRLF/LF。哈希针对原文件字节，包含 BOM；改稿后必须更新上下文与计划。
- `style.tokens` 是本期实现参数，必须非空；统一制作不以旧profile或baseline作为样式门槛。新绑定应来自当前上下文，当前源素材和实现文件仍必须真实可用。字段记录不证明画面已达标。
- `carrier` 取 `presenter / real-media / diagram / aigc / mixed`；所有语义说明必须非空。`objects` 可用字符串 ID，或含非空 `id` 的对象。
- `recipe_ids` 可为 `[]`。新语义配方按 [S01–S10 原目录](semantic-editing-recipes.json)的 ID 核查；纯人物或复用既有 O/X/F 源码时无需强迫选择 S 配方，直接写实际 `implementation.path`。该路径必须已存在；工具不会替 Agent 创建实现。
- `assets` 字段必须显式提供。无需外部素材的图形可用 `[]`；纯人物已在既有工程轨道内时也可用 `[]`，由 Agent 复查原轨道。`real-media/mixed` 的空素材列表会阻断静态就绪；`aigc` 没有完成的视频不可报就绪。

## 效果库设计引用

`selection.mode:reference` 可以采用现有效果库，不强迫同时挂某条秋芝/Fred方法。每个 `selection.library_refs[]` 保存 `kind/id/adaptation_reason` 以及下面两项；kind可为 `capability/family/software-preset/reference`，id来自现有能力目录，或 `kind:software-preset` 的 `fredtalk:<referenceId>`。

- `source_binding:{path,sha256,origin,selector?}`：该条目登记的实际来源。`origin` 为 `skill` 或 `project`；精确复制的源文件可按内容哈希核对，共享文件按该条目的具体 selector 定位。通过 `inspect` 查看实际条目及路径，不拿 F01 截图、目录本身或通用 EditingKit 文件给所有引用作依据。原条目只有观察 GIF 时可绑定对应 GIF，但不能称为已经移植了现成源码。
- `application:{contribution,path,sha256,marker}`：本期从渲染入口可达的实现位置，marker 必须唯一且不只是注释。`contribution` 为 `design` 或 `motion`；前者借用了构图、材料、窗口组织、字级或层次，后者仅借动作。`adaptation_reason` 说明本段保留与改造了什么，不能用“有缩放”代替整体设计。

`selection.evidence` 继续绑定目录哈希和实际设计来源；不另建重复清单。`source_binding` 将来源归到具体条目，`application` 将它落到本期实现。纯原创和人物段落仍可不用库引用；不得把“原创”当作跳过用户既定视觉意图的理由。修改旧计划时真实核对后再补字段，工具不自动填写合格声明。

检查仅验证文件、来源归属和静态实现位置，不能证明这个代码位置运行时产生了相似画面。设计声明与动作声明分别统计；实际调用及[正文画面对照](visual-quality.md#用实际样片校准)仍须检查，不能根据数量宣布效果库整体风格已复用。旧整片可显式查阅，但不再是普通设计的默认候选。

## 来源方法引用

旧计划兼容顶层或单个 `segments[]` 的可选引用。新选用合同中，采用既有来源方法的段落必须在该段登记具体例证、改编原因及源文件哈希；原创或保留人物可以没有来源引用。不能只登记 ID：

```json
"source_study_refs": [{
  "method_id": "Q-N01",
  "usage": "adapt",
  "examples": [{"video": "network", "row_ids": ["N-L089"]}],
  "adaptation_reason": "本句也需要区分到达的信息与尚未形成的能力；本期改用已有工程的对象和箭头体系"
}]
```

`usage` 为 `adapt` 或 `avoid`，省略时为 `adapt`。检查方法 ID、来源行是否存在及是否属于该方法登记例证；明确标为负面的条目禁止正向适配。没有选具体行会有警告。该检查不能判断改编是否合理或画面是否清晰，`adaptation_reason` 仍由 Agent 阅读核对。全部本机数据见 [研究接入](source-study-guide.md)。

## 原句位置与原序

无 `span` 时，`quote` 必须在原文中完整、精确且只出现一次。重复句或同句拆为多个段落，填写：

```json
"span": {"start": 0, "end": 5}
```

位置是 **BOM 解码后原文的 Unicode 字符下标，左闭右开**，不是字节、毫秒或字幕行号；CRLF 算两个字符。该范围必须与 `quote` 完全相同。各段按原文顺序排列、不能部分重叠；相邻段只有都显式填写**完全相同的 span**时才允许共用同句。

## 时间状态

`script-estimate` 表示只有文字估时：计划结构可以有效，但不能声称已音画对齐，`render_ready` 保持 false。不要在段落中填写 `media_source/source_time/source_start/source_end/audio_start/audio_end` 或 `audio_aligned:true` 来冒充源时钟；估计值可另存 `estimated_timing`。

已有对齐依据时使用：

```json
"timing": {
  "basis": "audio-aligned",
  "audio_source": {"path": "assets/voice.wav", "sha256": "音频文件字节的真实SHA-256"},
  "alignment_evidence": "analysis/alignment.json"
}
```

旧合同只检查音频路径、哈希与证据文件存在。下述新版选用合同另外核对结构化对齐文件的哈希、原文位置和源音轨范围，但仍不能代替实际试听判断音画是否准确。

## 素材和 AIGC 请求

每项素材形如：

```json
{"kind": "real", "path": "assets/operation.mp4", "status": "ready", "purpose": "证明按钮后的实际状态"}
```

`kind` 取 `real / generated / concept`；`status` 取 `ready / pending / planned`。`ready` 必须有存在的本地文件；`pending/planned` 可以没有路径，但会阻断 `render_ready`。图片存在不证明人物正在连续动作。

素材的 `purpose/source` 记录实际查看到的内容、可用部分与缺失动作；段落 `events.initial/trigger/change/result` 写需要发生的对象变化，并对照实际粗剪。AIGC 继续用 `aigc.action_beats` 记录选段内可见动作。若预期是交接、实际只有持物站立，保留缺口并修正素材或明确改选表达，不能只把状态改成 `ready`。这些是同一计划的内容说明，不另建完成清单，也不由静态检查认证表演成立。

`carrier=aigc` 需要以下 `generation`，或者已有 **ready 的 generated 视频文件及 `source` 来源说明**：

```json
"generation": {
  "positive_prompt": "同一人物先拿起物件，再递给另一人，接收者接稳后停留",
  "negative_constraints": ["不要多格漫画", "不要只对静图推拉"],
  "entry_state": "人物握住物件，位置承接上一段",
  "exit_state": "接收者接稳，留下下一段要用的物件",
  "subject_reference": "本期账号已确认的角色参考或明确的新角色设计说明",
  "output_kind": "video"
}
```

已有视频素材可写 `{"kind":"generated","status":"ready","path":"assets/existing.mp4","purpose":"本段连续表演","source":"用户已提供的既有生成片段及来源描述"}`，此时不强制再填生成提示词。作为画风或明确身份参考的图片需显式加 `role:"reference"`，不能当完成视频。声明 `output_kind:"image"` 或 `motion:"static-pan-zoom"/"slideshow"/"still-image"` 不满足 AIGC 连续动作。扩展名检查只能发现明确误标，不能证明 MP4 内部真有动作。

`generation_jobs` 仅返回准备信息，始终 `eligible_for_submission:false`；不提交、不付费，也不由工具推断预算授权。

## AIGC 资产与实际剪辑节奏

新建且包含 AIGC 动作的计划在顶层写 `"aigc_contract_version": 1`。对 `carrier=aigc`，或包含视频生成请求／已生成视频的 `mixed` 段，增加以下 `aigc` 对象。示例路径需替换为实际本地文件；`prepare` 的人物图和场景例图默认仅作风格参考；本期角色/场景关键图按新口播制作，明确固定 IP 的工程可保留其身份参考。

```json
"aigc": {
  "character_mode": "reference",
  "character_refs": ["实际角色原图.png"],
  "scene_ref": "本期设计的场景关键图.png",
  "style_ref": "实际画风参考图.png",
  "edit_duration_seconds": 2.5,
  "action_beats": [
    {"start_seconds": 0, "end_seconds": 1, "action": "女孩递出书箱"},
    {"start_seconds": 1, "end_seconds": 2, "action": "机器人接稳，女孩松手"}
  ],
  "result_hold_seconds": 0.5
}
```

- `character_refs`、`scene_ref`、`style_ref` 必须指向存在的本地文件；参考分工必须明确：画风例图不自动决定本期人物身份、场景内容或首帧；角色/场景图对应本期实际设计，不能用一个画风标签代替实际参考。确实不含角色的镜头可用 `character_mode:"none"`、`character_refs:[]`，同时填写非空 `character_reason`，不强塞女孩。
- 所有时间是**本段最终上屏片段内部的相对秒数**，不是原片取帧时间或生成服务时长。`edit_duration_seconds` 为有限正数；`result_hold_seconds` 为有限非负数。
- `action_beats` 按顺序写实际可见变化，起止有效且不得互相重叠；动作不能超过上屏时长，最后动作结束加结果停留也不能越界。主体接触、转移与结果均须写清，画面仍需实际检查。
- 只有稿件时这些数字仍是估时，保留 `timing.basis:"script-estimate"`，不可声称已音画对齐。正式剪辑后回填实际有效区间，较长生成素材只截所需动作。
- 旧计划没有版本字段时兼容并提示缺口；没有 AIGC 的计划无需填写本对象。版本 1 会检查上述引用和时间结构，不能仅靠旧计划能通过来省略新制作要求。
- 静图已认可只证明选型依据；这个合同不判断成片画风、连续性、节奏好坏，也不把图片自动标成已完成视频。

## 怎样理解检查结果

- `errors`：结构、原稿哈希/锚点/原序、配方或本地路径不成立，`plan_valid=false`。
- `warnings`：需要 Agent 判断的缺口，例如尚未核对音轨证据内容。
- `readiness_blockers`：只有估时、素材未齐或生成尚未完成。计划可结构有效，但 `render_ready=false`。
- `render_ready=true`：仅表示本检查涉及的结构和路径就绪；版本 1 的风格计划还要求当前绑定与必读视觉依据齐备。旧计划的兼容性通过不等于当前风格齐备，应同时查看 `current_style_ready`。语义恰当、事实准确、工程能运行、媒体真实内容、画面效果、完整试听及用户认可均须另查；本工具不作这些认证。


## 参考图片与实际素材分开

注册图库中的人物图、场景图默认 `usage_role:"style-reference-only"`。在 `assets` 中引用它们时写 `role:"reference"`，只用于校准画风；`aigc.scene_ref/style_ref` 也不会自动升级为首帧。生成采用本期准备的关键图，图片存在不表示已完成动作。

如果本期明确直接沿用某张旧图作上屏素材，在该素材项记录 `reference_reuse`；若作 `generation.first_frame` / `first_frame_path` 或 `aigc.first_frame` / `first_frame_path`，在对应对象记录同样字段：

```json
"reference_reuse": {
  "basis": "current-request",
  "reason": "记录本期明确使用该图的要求；或 basis=current-project 并写明该图在当前工程的既有用途"
}
```

历史画风认可不能填作本期用图依据。正常按口播制作的新图不需要这个例外，也不要求用户逐图确认。此检查按已注册路径匹配，不能识别复制改名文件、判断理由真实性或代替最终画面审查。

`preflight_ready = render_ready && current_style_ready && selection_ready`，旧兼容名为 `production_ready`。缺本期所用资料或选用／实现映射不能进入统一生产导出；旧账号整片绑定不再构成普通制作要求。`selection_evidence.reuse_declarations` 单独统计计划声明过来源方法或配方的段落；声明不是 API 执行证据，零声明也不证明没有调用基础函数。验证 Skill 复用时须继续查看实际调用与连续输出，不能把全部原创的结构通过当成复用成功。明确 `--demo` 仅用于历史机制演示。

检查报告的 `selection_evidence.ledger` 将每段句意、观众疑问、事件与前后交接随实际素材、实现标记及输出范围一起列出，便于实片逐段对照。它复用同一计划，不增加另填的审批表，也不判断这些文字是否已经变成清晰画面。原创、静止阅读、保留人物等合法选择不需要凑配方或参考数量。

由统一入口新建的工程还有 `current_style_applied:false` 标记。落实本期画面样式后才可将 `project.json.current_style_applied` 设为 `true`；未落实时即使计划有效也阻止生产导出。该声明是制作状态，不是自动视觉验收。

## 本期选用与实际实现合同（新正式制作必需）

在同一个计划增加 `selection_contract_version:1`，不要另造一套与工程无关的完成清单。选材阶段可以先写决定，制作后回填实际文件、哈希和时间；未制作完时保持非生产就绪。

```json
{
  "selection_contract_version": 1,
  "delivery": {"scope": "full", "duration_seconds": 2},
  "implementation_manifest": {"path": "implementation-manifest.json", "sha256": "真实文件哈希"}
}
```

- `full` 覆盖原稿全部非空白字符；可以几句共享一个事件，不按句号强制切镜。
- 合法样段使用 `scope:"excerpt"`，另写 `reason` 与 `source_ranges:[{"start":0,"end":5}]`，范围沿用原稿字符坐标。范围外不能偷偷补入或漏掉范围内的句子。
- 每段补 `output:{start_seconds,end_seconds}`，以本次导出开头为零。输出范围覆盖 `delivery.duration_seconds`；转场或图层交叠可写 `output.overlap_reason`。人物停留、开头与结尾也应有落点，不能留未解释的空段。

每个 `segments[]` 增加：

```json
{
  "selection": {
    "mode": "original",
    "reason": "这两句描述同一对象的关系，现有例图对象不适用；沿用已确认的UI质感，重新设计连续关系事件",
    "aigc": {"use": false, "reason": "对象关系用当前图形即可看懂，生成镜头会打断这一事件"},
    "evidence": []
  },
  "output": {"start_seconds": 0, "end_seconds": 2},
  "source_audio": {"start_seconds": 0, "end_seconds": 2},
  "implementation": {"path": "main.js", "sha256": "真实源码哈希", "marker": "\"relation-01\""}
}
```

`mode` 为 `reference / original / presenter`。`presenter` 对应保留人物载体；无需强加效果或 AIGC。三种情况都写本句实际理由；机器只验证说明存在，Agent 要复核说明是否成立。`aigc.use` 必须与该段实际生成资产／生成请求一致；没有 AIGC 时明确为何不用，而不是缺字段让其他窗口猜。

`reference` 模式至少包含一个正向 `source_study_refs`，或一项具体 `selection.library_refs`；可以只采用效果库引用，不强迫额外挂来源方法。库引用遵循[效果库设计引用](#效果库设计引用)并按实际贡献标记 `design/motion`。采用来源方法时，才在 `source_study_refs` 填入方法、具体 `video/row_ids` 和 `adaptation_reason`，并把相应方法目录与逐句对照文件放入 `selection.evidence`：

```json
{"path":"references/source-study-methods.json","origin":"skill","sha256":"真实文件哈希","role":"source-method"}
```

证据默认相对工程；包内文件用 `origin:"skill"`，避免复制一份参考库。所有证据文件必须真实存在且 SHA-256 相符。来源行还必须属于所选方法；不能把负例正向照搬。原创、真实直出和保留人物可无方法引用，不要求每句堆效果；其 `reason` 说明本期取舍即可。

所有 `ready` 素材增加 `sha256`，包括风格参考。改了文件内容却保留旧计划会失败；更新哈希前先复核变更，不批量填新哈希来掩盖未落实的修改。

### AIGC 绑定画风，不固定每期人物与场景

`prepare` 的 `context.aigc.binding` 含当前 `style_set_id` 与规则哈希。使用 AIGC 的段落复制到 `aigc.style_binding`，并在 `selection.evidence` 绑定至少一张适用的当前画风参考，`role:"art-style-reference"`。不要求所有八张场景，也不强制女孩 IP。

实际使用的 `aigc.scene_ref/style_ref/character_refs` 都应在 `selection.evidence` 留文件哈希；新的本期场景可以作为 `new-scene-reference`，人物身份参考仅在本期需要时绑定。当前工程已经固定的 IP 要延续；这项校验不代替 Agent 看脸、服装和场景是否一致。库图继续默认只校准画风；重复上屏或首帧仍遵守前文的 `reference_reuse`。

### 绑定渲染入口真正读取的时间线

`implementation_manifest` 不是一个随手填 `done:true` 的旁路清单。其内容如下，路径均相对计划所在工程：

```json
{
  "schema_version": 1,
  "entrypoint": {"path": "index.html", "sha256": "真实入口哈希"},
  "timeline": {"path": "timeline.json", "sha256": "真实时间线哈希", "consumer": "main.js", "binding": "timeline"},
  "files": [{"path": "main.js", "sha256": "真实源码哈希"}]
}
```

统一 base/fusion/director 渲染器实际打开工程的 `index.html`，因此公开生产导出要求绑定该入口，并核对 `project.json.duration` 与本计划时长。入口的本地 `script/import/fetch` 依赖必须可以追踪，全部可达文本实现列入 `files`；不能拿未被入口引用的演示源码冒充本期实现。动态拼接文件名无法静态核实时，改为明确本地导入或取址，不伪造路径通过。

时间线必须由可达的 `consumer` 实际导入或读取，并赋给 `binding` 指定的变量；该变量的 `.segments` 必须用于代码。支持直接 JSON import/require，或下面的明确 fetch 方式：

```javascript
const timeline = await fetch("./timeline.json").then(response => response.json());
window.renderFrame = t => {
  const shot = timeline.segments.find(row => row.output.start_seconds <= t && t < row.output.end_seconds);
  if (shot && shot.id === "relation-01") renderRelation(shot, t - shot.output.start_seconds);
};
```

这里只展示如何接入现有 `renderRelation` 实现，不是成片模板。实际实现也要通过本地导入连接到入口并绑定哈希。工具检查读取依赖、变量和映射，不把“代码出现”冒充浏览器实际执行或视觉正确；仍须正常速度播放验证。

注意浏览器取址规则：`src/main.js` 内普通 `fetch("./timeline.json")` 相对 HTML 文档的 `document.baseURI`，通常读取工程根目录的 `timeline.json`；静态 import/require 才相对模块文件目录。校验遵循这个区别，也支持 `fetch(new URL("../timeline.json", import.meta.url))` 显式按模块取址。字面本地 `<base href>` 会改变文档基址；动态 URL、外部文档基址或无法静态确定的加载方式明确报不支持，不能把未实际读取的另一个 JSON 当作时间线。此处只验证这些明确读取形式，不证明运行时分支已经执行。

`timeline.json` 是工程渲染使用的时间线，不是另一份无调用的审核 JSON：

```json
{
  "schema_version": 1,
  "source_sha256": "原稿真实哈希",
  "duration_seconds": 2,
  "segments": [{
    "id": "relation-01", "span": {"start": 0, "end": 5},
    "output": {"start_seconds": 0, "end_seconds": 2},
    "implementation": {"path": "main.js", "sha256": "真实源码哈希", "marker": "\"relation-01\""},
    "assets": []
  }]
}
```

时间线每行的原文位置、输出落点、实现文件／唯一 marker、实际输出素材的 `path/sha256` 必须与计划相符。可附加当前渲染所需的事件、对象等字段。实现 marker 必须在入口可达的真实代码或 DOM 中出现一次，注释不算。`role:reference/first-frame` 不冒充最终上屏素材；实际输出素材写入该行 assets，静态校验不判断 MP4 内部动作质量。

### 实际素材剪辑与声音事件

Canvas Story 可在同一计划的段落添加 `material_shots`、`background`、`palette`，并原样写入渲染实际读取的 `timeline.segments`；预检校验两处一致。它们让材料先进入可观看的粗剪，之后再由 `scene` 补 UI 对象与状态变化。下面仅示意新增字段，不是完整生产计划：

```json
{
  "id": "detail-01",
  "output": {"start_seconds": 10, "end_seconds": 13},
  "layout": {"mode": "focus"},
  "background": "#F3F3F5",
  "palette": {"paper": "#FFFFFF"},
  "material_shots": [{
    "id": "inspect-source", "asset": "screen-recording",
    "start": 0, "end": 3, "source_in": 12, "source_out": 15,
    "target": {"x": 0, "y": 0, "w": 1920, "h": 1080}, "fit": "contain",
    "crop_keyframes": [
      {"at": 0, "x": 0, "y": 0, "w": 1, "h": 1},
      {"at": 0.6, "x": 0.25, "y": 0.25, "w": 0.5, "h": 0.5},
      {"at": 2, "x": 0.25, "y": 0.25, "w": 0.5, "h": 0.5},
      {"at": 2.7, "x": 0, "y": 0, "w": 1, "h": 1}
    ]
  }]
}
```

- `asset` 引用 `timeline.media.assets` 中的 `image/video`，例如 `{"id":"screen-recording","type":"video","src":"media/operation.mp4"}`。该 `src` 必须同时对应本段 `assets` 内已绑定真实哈希的 `ready` 输出素材；仅有参考图或空文件名不能填充画面。
- `start/end`、裁切关键帧 `at` 都是**段内秒数**，镜头区间左闭右开。视频 `source_in/source_out` 是源文件内秒数，必须原速且两段时长相等；解码后另查源长，越界报错，不拉伸时间或冻结尾帧。图片省略源时间。
- `crop_keyframes` 的 `x/y/w/h` 是原材料内部的归一化矩形，范围在 0–1；关键帧间平滑插值，首尾外保持最近取景。`target` 是本期逻辑舞台像素，省略则用 `layout.contentRect`；`fit` 为 `contain`（默认）或 `cover`。可同时摆放不同镜头作同尺度比较。
- 片段／镜头选择和解码帧使用主 `mediaTime`，取景与 UI 动画使用 `animationTime`；运动模糊子采样不能越过切点混入另一源镜头。同源多次出现使用独立解码位置，不必复制媒体文件。
- 有实际 `material_shots` 时可省略 `scene`；显式写入不存在的场景仍报错。材料先绘制，定制场景后绘制。纯素材段的生产 `implementation` 可绑定工程内 `runtime.js` 真实哈希及唯一代码 marker `function createRuntime(binding,host)`；这指向实际共用实现，不是伪造空场景。
- `background/palette` 只改本段绘制表面和 SDK 颜色，其他项继承工程默认，源材料不统一染色。人物开头的材料、背景与 UI 全部受既有实测安全区裁剪，人物完整源画面保持；原声和字幕仍按母带。
- `getTrace()` 的 `successful-CanvasStory-draws` 记录实际绘制的素材 ID、源时刻、裁切与目标矩形。它证明调用发生，不能证明句意正确或审美通过。旧工程保留其已复制运行时，需明确升级代码才能取得新接口。

补充音效沿用同一计划顶层的 `sound_events`，原样写入实际时间线。例子仍是局部字段，哈希换成真实文件值：

```json
{"sound_events":[{
  "id":"paper-transfer", "path":"media/paper.wav", "sha256":"实际音频SHA-256",
  "at":10.6, "source_in":0.15, "source_out":0.62, "gain":0.3,
  "segment_id":"detail-01"
}]}
```

- `id` 唯一；`path` 为工程内现有文件的相对路径，不能是 URL、绝对路径或越界路径。`at` 是输出母带上的绝对秒数；`source_in/source_out` 为音效源内有效区间，导出前用已有 ffprobe 核对实际音轨和源长。可选 `gain` 默认 0.3，有限且在 0–1；同一文件可多次或重叠使用。
- 可选 `segment_id` 指向实际时间线段落；`event_id` 需同时提供 `segment_id` 并指向其 `events` 中的真实 ID。声音可略早于画面进入或尾音跨到下一镜，不改原口播句子、速度或时钟。
- Canvas 的声音输入仅为 `timeline.json.sound_events`，不能再给 `project.json` 非空竞争数组。其他使用 portable 渲染器的后端需将同一数组同步到 `project.json.sound_events`；计划、时间线和实际消费配置必须一致。`complete-scenes` 不支持此数组，需用其原生音频能力，不声称所有后端已接通。
- 导出按请求范围截取并偏移音效，以 FFmpeg 混入 `preview.mp4`；原声保持增益 1，不自动压低、归一化或加限制器。实际音效增益与重叠需试听决定，工具不会自动生成或加入音乐。
- **浏览器编辑预览仍只有原口播；音效在导出的 `preview.mp4` 中试听。** `verification.json.soundEvents` 记录选段、落点、增益与实际混入范围，`listeningReview:false` 表示程序未完成听审。技术混音通过不等于声音合适或用户认可。

### 对齐与导出后的检查

新版对齐证据使用 JSON，`timing.alignment_sha256` 绑定该文件的内容：

```json
{
  "schema_version": 1,
  "source_sha256": "原稿真实哈希",
  "audio_sha256": "保留原声真实哈希",
  "segments": [{"id":"relation-01","span":{"start":0,"end":5},"source_audio":{"start_seconds":0,"end_seconds":2}}]
}
```

实际对齐应来自本期音轨／字幕；空 `{}` 不再被当成证据。每行 source span、源音轨区间与计划一致，源音轨与输出段时长不能无说明地改变。这里核对结构与哈希，不通过文件名声称已经听审。

`selection_ready` 表示上述本期来源、覆盖和实现映射成立。`production_entry.verify_output(project, media, ..., expected_plan_sha256=导出前计划哈希)` 在实际渲染后重新核对输入绑定，并通过本机已有 ffprobe 检查导出文件的视频／音频流、时长和文件 SHA-256。成片时长与映射时长的误差容限为 0.12 秒；缺 ffprobe 或媒体解码元信息失败时明确未通过，不自动下载工具。输出报告保留 `traceability` 逐段落点，并明确 `aesthetic_approval:false`、`full_realtime_av_review:false`。技术通过仍不等于句意适合、动画真实、观感满意或听审完成。

生产预检与输出复核支持 base/fusion/director，以及下文的 `complete-scenes` 适配器。自定义 Editorial/Remotion 工程的入口和时钟不同，仍需其真实入口的专用适配与媒体检查，不能宣称全部后端已经统一。

## 完整场景路线共用同一计划

`production.backend:"complete-scenes"` 选择完整场景适配器。保留前述原稿、风格、语义、选用、素材、交付和对齐字段；只增加后端需要的 `production` 与每段 `scene`，不另手写一份场景 spec 的文案和时间。

```json
{
  "production": {
    "backend": "complete-scenes",
    "pack": "anim3",
    "settings": {"brand": "本期项目名", "music": {"mode": "none"}}
  },
  "segments": [{
    "id": "本期语义段ID",
    "output": {"start_seconds": 0, "end_seconds": 3},
    "source_audio": {"start_seconds": 0, "end_seconds": 3},
    "scene": {
      "id": "从scene inspect选择的场景ID",
      "slots": {"实际槽名": "本期内容或素材"},
      "cues": {"实际cue名": {"at": 1.2}}
    }
  }]
}
```

这是追加字段示意，不是可直接构建的完整计划。场景 ID、槽名、cue 和保护动作窗由 `scene inspect --pack <包> --scene <ID>` 返回的实际 manifest 决定。

- `production.pack` 当前为 `anim3` 或 `anim4`，单工程只支持一个 pack；尚未支持跨包自动混编。
- `production.settings.brand` 必填；可选 `presenterLabel/subtitlePreset/faceTracking/presenterCrop/textFontFile/monoFontFile/music/fadeEndSeconds`。不把段落文案、场景列表或时间放进 settings。字体和素材路径仍相对计划目录。
- `timing.basis` 必须为 `audio-aligned`；`audio_source.path/sha256` 绑定 `scene build --presenter` 的实际原声视频。`alignment_evidence/alignment_sha256` 使用前述对齐 JSON，绑定同一原稿、原声和逐段 span。
- 当前适配器保留所给原声视频的完整时钟：各段 `output` 与 `source_audio` 相同，连续覆盖 0 到 `delivery.duration_seconds`，并对齐 pack 帧率。节选先从母带按真实区间准备片段与字幕，保持来源记录；不由编译器重排、调速或补空白。
- `scene.cues` 只接受绝对原声秒数 `{"at":...}`；槽值、媒体、动作保护窗仍由原 pack 编译器检查。原声时间不足时改编场景或换实现，不拉慢口型。

`scene compile --plan <工程/director-plan.json> --out <派生配置.json>` 仅校验并派生参数，报告 `production_ready:false`、`media_generated:false`。`scene build --plan ...` 在准备目录内构建并保留 `scene-spec.json`、`macro_plan.json` 和 `scene-build-receipt.json`，绑定原计划、来源编译器／包、人物及实际输出文件哈希。配置和宏时间线由同一计划派生，改计划后重新构建到新目录，不手改派生文件以绕过绑定。

`direct check --production` 与 `scene render` 都使用共同预检：计划、源文件、对齐、样式、素材及构建产物发生漂移均不能继续正式导出。导出后通过 `production_entry.verify_output` 复查当前绑定和媒体结果。`scene render` 的 `.scene.json` 记录技术结果，持续保留实际视听和审美未验证的边界。

旧 `scene scaffold` 与手写 spec 仍保留兼容；构建或导出这类工程必须显式 `--legacy-spec`，报告不作为正式生产就绪。已绑定导演计划的工程不能用该标志绕过共同预检。实际命令与后端限制见[引擎路由](engine-routing.md#完整场景制作)。
