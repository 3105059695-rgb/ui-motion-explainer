# 导演计划：本地工具合同

`scripts/director.py` 只做配方查阅、输入整理和静态检查。它不理解口播、不自动选素材或配方、不审美审批，不调用生成服务。语义判断仍由 Agent 读取[语义导演方法](semantic-directing.md)后完成。

```powershell
python -X utf8 scripts/ui.py direct recipes
python -X utf8 scripts/ui.py direct recipes --id S01
python -X utf8 scripts/ui.py direct prepare --script <原稿.txt> --project <当前工程目录> --profile <适用档案.md>
python -X utf8 scripts/ui.py direct check --plan <导演计划.json> --production
```

统一入口如果使用 `--` 传递参数，以 `scripts/ui.py direct --help` 的实际帮助为准；也可直接调用 `scripts/director.py` 的同名子命令。

正式预检必须加 `--production`（同义参数 `--require-production`）：仅 `production_ready=true` 才退出 0。省略参数是历史结构诊断，退出 0 只说明 `plan_valid=true`，不代表可以正式制作；返回值同时标明 `check_mode` 与 `check_passed`。现有 `ui.py render` 原本就会检查生产就绪，这次不重复增加另一道导出流程。

`prepare` 生成 `director-context.json` 与 `director-brief.md`，包含完整原文、原文件 SHA-256、风格选择状态和必读文件路径。它调用本机风格注册表，按显式 `--profile`、工程配置、注册的项目根目录解析；无依据或有冲突时保持未确定，不猜账号。`context.style.resolution` 保存档案、认可样片、实现、证据和未认可范围。`context.selection` 根据原文位置与上下文检索方法、配方和源码候选，保留出处、适用条件与负例；它不是已完成的选材决定，允许跨句连续场景、原创或保留人物。Agent 仍须实际阅读并落实本期工程。同内容跳过；不同内容拒绝覆盖，除非明确 `--force`，且原文件确由本工具生成。两份输出先一起检查；源稿、其他文件以及链接目标不覆盖。

`context.aigc` 独立加载 [AIGC 注册集](aigc-assets.json)：当前工程的 `aigc_style_id` 或 `aigc.style_set_id` 优先，其次匹配已解析的账号／项目范围。通用 `user-ui` 默认带入两张女孩原图、8 张已认可场景及既有研究路径；阿刁、方木保留各自档案。找不到选择或设置冲突时明确标记未解决，不猜选画风。它检查资产路径是否存在，但场景是否符合新句意、实际图像是否适用仍由 Agent 按 [AIGC 导演方法](aigc-directing.md)判断。`context.style` 继续约束 UI；AIGC 参考不会替换 UI 外观。

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

新制作计划写 `"style_contract_version": 1`，将 `prepare` 的 `context.style.binding` 原样复制到计划的 `style.binding`。绑定包含注册档案 ID、档案文件哈希，以及各当前方向的 ID、修订号、规范化合同 SHA-256 和视觉锚点文件哈希；不包含安装机的绝对路径，因此相同包可以迁移。不要手填哈希来掩盖过期：发生更新时重新 `prepare`，查看新反馈并落实本期工程后再更新计划。

`styles resolve` 和 `prepare` 返回各方向的 `visual_anchors`（实际路径、存在性、哈希、用途）及 `style_references_ready` / `context.style.references_ready`。合同正文加载成功与图片齐备是两个事实；必读图片缺失时继续定位包内基线或已授权本地资产，不退回旧模板，不要求用户重新描述已经确认的偏好。

分发包可在风格注册表显式设置 `default_profile`，在没有当前账号、工程声明或目录匹配时使用该包的默认风格。它不覆盖明确账号；冲突或未知工程声明仍需解决，不能静默回落到默认女孩或另一账号。没有该字段的旧包保持未确定状态。

`check` 对版本 1 重新读取当前注册表，核对档案、合同修订、合同内容和图像哈希；拒绝被否定／试稿方向、被否定的 UI 基线，以及与当前工程明确账号冲突的绑定。没有现行绑定、缺少必读视觉锚点或绑定过期时，`render_ready=false`。没有方向合同的账号至少需要现存的已认可视觉基线，不能仅凭档案文字报依据齐备。`style.profile` 如填写仍使用实际文件路径，且须属于绑定档案；绑定已经选择账号时可省略该冗余字段。

旧计划继续按原结构检查，但未写版本 1 时 `current_style_ready=false`，并给出兼容性警告；旧计划即使 `render_ready=true`，也只表示旧静态检查就绪。`current_style_ready=true` 只证明当前约束与所需风格依据已绑定且可读，**不证明已看过图片、已实际应用主题或画面达到审美要求**。实看片段、听审和用户认可仍分别记录，非空 `tokens` 不是风格验收。

AIGC 另外返回 `character_references_ready`、每个场景的 `reference_ready`、整个目录的 `production_references_ready`；这些是资源盘点，不是每片必须使用所有场景。`optional_provenance_missing` 只列原作者视频／原片帧等可选溯源缺件，不把它们当作角色图缺失。实际计划仅校验本片使用的角色、场景、画风参考。没有 AIGC 的片段不受未用场景缺图影响；选用的角色或场景缺失不得用别的 IP 静默替换。版本 1 的风格计划若含 AIGC 动作，也必须填写下文的动作参考合同，不能利用旧计划兼容性跳过。

## 最小结构示例

下面是基于原稿“先看关系。”的**待填写样例**。SHA-256 和实现路径必须换成当前文件的真实值，不能原样交检查。

```json
{
  "schema_version": 1,
  "style_contract_version": 1,
  "source": {"path": "口播稿.txt", "sha256": "原文件字节的真实SHA-256"},
  "style": {
    "profile": "适用风格档案.md",
    "binding": {"schema_version": 1, "profile_id": "当前注册档案ID", "profile_sha256": "从context.style.binding复制", "directions": []},
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
- `style.tokens` 必须是非空对象；`profile`、`baseline` 可选，有值时必须是存在的本地路径。`binding` 必须完整复制当前上下文（包括真实的 `directions`，上面的空数组只是结构占位）。这些字段记录选用依据，不代表渲染已生效或用户已认可。
- `carrier` 取 `presenter / real-media / diagram / aigc / mixed`；所有语义说明必须非空。`objects` 可用字符串 ID，或含非空 `id` 的对象。
- `recipe_ids` 可为 `[]`。新语义配方按 [S01–S10 原目录](semantic-editing-recipes.json)的 ID 核查；纯人物或复用既有 O/X/F 源码时无需强迫选择 S 配方，直接写实际 `implementation.path`。该路径必须已存在；工具不会替 Agent 创建实现。
- `assets` 字段必须显式提供。无需外部素材的图形可用 `[]`；纯人物已在既有工程轨道内时也可用 `[]`，由 Agent 复查原轨道。`real-media/mixed` 的空素材列表会阻断静态就绪；`aigc` 没有完成的视频不可报就绪。

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
- `warnings`：需要 Agent 判断的缺口，例如未绑定账号、尚未核对音轨证据内容。
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

`production_ready = render_ready && current_style_ready && selection_ready`。旧计划保留结构兼容，但缺当前风格或本期选用／实现证据不能进入统一生产导出；任何版本声明被否定的基线都会拒绝。统一 `ui.py render` 检查生产就绪后才调用底层渲染器；明确 `--demo` 仅用于历史机制演示，不算正式制作通过。

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

`reference` 模式至少选择一个正向来源方法，使用已有 `source_study_refs` 填方法、具体 `video/row_ids`、`adaptation_reason`。相应方法目录与逐句对照文件同时放入 `selection.evidence`：

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

目前这个生产导出／导出后检查入口面向读取 `index.html` 与 `project.json.duration` 的 base/fusion/director 后端。自定义 Editorial/Remotion 工程的入口和时钟不同，尚不受这套导出适配器支持，不能宣称已经统一验收；需使用其真实入口的专用适配与媒体检查。
