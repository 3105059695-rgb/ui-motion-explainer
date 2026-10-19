# 导演计划：本地工具合同

`scripts/director.py` 只做配方查阅、输入整理和静态检查。它不理解口播、不自动选素材或配方、不审美审批，不调用生成服务。语义判断仍由 Agent 读取[语义导演方法](semantic-directing.md)后完成。

```powershell
python -X utf8 scripts/ui.py direct recipes
python -X utf8 scripts/ui.py direct recipes --id S01
python -X utf8 scripts/ui.py direct prepare --script <原稿.txt> --project <当前工程目录> --profile <适用档案.md>
python -X utf8 scripts/ui.py direct check --plan <导演计划.json>
```

统一入口如果使用 `--` 传递参数，以 `scripts/ui.py direct --help` 的实际帮助为准；也可直接调用 `scripts/director.py` 的同名子命令。

`prepare` 只生成 `director-context.json` 与 `director-brief.md`，包含完整原文、原文件 SHA-256、风格选择状态和必读文件路径。它调用本机风格注册表，按显式 `--profile`、工程配置、注册的项目根目录解析；无依据或有冲突时保持未确定，不猜账号。`context.style.resolution` 保存档案、认可样片、实现、证据和未认可范围；同时内嵌来源方法候选。Agent 仍须实际阅读和应用这些内容。同内容跳过；不同内容拒绝覆盖，除非明确 `--force`，且原文件确由本工具生成。两份输出先一起检查；源稿、其他文件以及链接目标不覆盖。

`context.aigc` 独立加载 [AIGC 注册集](aigc-assets.json)：当前工程的 `aigc_style_id` 或 `aigc.style_set_id` 优先，其次匹配已解析的账号／项目范围。通用 `user-ui` 默认带入两张女孩原图、8 张已认可场景及既有研究路径；阿刁、方木保留各自档案。找不到选择或设置冲突时明确标记未解决，不猜选画风。它检查资产路径是否存在，但场景是否符合新句意、实际图像是否适用仍由 Agent 按 [AIGC 导演方法](aigc-directing.md)判断。`context.style` 继续约束 UI；AIGC 参考不会替换 UI 外观。

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

顶层或单个 `segments[]` 可增加下面的可选字段；旧计划继续兼容。选了来源方法的 Agent 应留下所选例证及本期改编原因，不能只登记 ID：

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

工具只检查音频路径、哈希与证据文件存在，不判断该证据内容是否正确，不解码声音、不复核真实落点。

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

已有视频素材可写 `{"kind":"generated","status":"ready","path":"assets/existing.mp4","purpose":"本段连续表演","source":"用户已提供的既有生成片段及来源描述"}`，此时不强制再填生成提示词。作为身份参考的图片需显式加 `role:"reference"`，不能当完成视频。声明 `output_kind:"image"` 或 `motion:"static-pan-zoom"/"slideshow"/"still-image"` 不满足 AIGC 连续动作。扩展名检查只能发现明确误标，不能证明 MP4 内部真有动作。

`generation_jobs` 仅返回准备信息，始终 `eligible_for_submission:false`；不提交、不付费，也不由工具推断预算授权。

## AIGC 资产与实际剪辑节奏

新建且包含 AIGC 动作的计划在顶层写 `"aigc_contract_version": 1`。对 `carrier=aigc`，或包含视频生成请求／已生成视频的 `mixed` 段，增加以下 `aigc` 对象。示例路径需替换为实际本地文件；两张角色原图和适用场景可直接取自 `prepare` 的上下文。

```json
"aigc": {
  "character_mode": "reference",
  "character_refs": ["实际角色原图.png"],
  "scene_ref": "实际认可场景图.png",
  "style_ref": "实际画风参考图.png",
  "edit_duration_seconds": 2.5,
  "action_beats": [
    {"start_seconds": 0, "end_seconds": 1, "action": "女孩递出书箱"},
    {"start_seconds": 1, "end_seconds": 2, "action": "机器人接稳，女孩松手"}
  ],
  "result_hold_seconds": 0.5
}
```

- `character_refs`、`scene_ref`、`style_ref` 必须指向存在的本地文件；身份原图与场景图承担不同作用，不能用一个画风标签代替实际参考。确实不含角色的镜头可用 `character_mode:"none"`、`character_refs:[]`，同时填写非空 `character_reason`，不强塞女孩。
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
