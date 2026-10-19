# 第二十批：悬停侧栏、嵌套导航与动态光球

2026-10-01；v0.19，1920×1080横屏。三件精确卡的远程动态来源经实际多个暂停解码状态观察，再按完整主要区域与连续机制独立重建。当前89个预设、57项不同深度来源观察、58项机制适配；完整原作复制0。

| 来源 | 原片尺寸 / 时长 | 接受暂停帧 | 代码预设 / 基准时长 | 实际样片 |
|---|---|---:|---|---|
| [@chmielwork](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1322×1322 / 25.3833秒 | 12 | `interaction-sidebar-hover-expand-select` / 32秒 | [播放](../assets/previews/icon-sidebar-hover.mp4) |
| [@guerriero_se](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1080×1080 / 12.051秒 | 11 | `interaction-nested-activity-sidebar` / 28秒 | [播放](../assets/previews/nested-activity-sidebar.mp4) |
| [@ahmetloca](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2284×1362 / 6.20833秒 | 7 | `interaction-dual-image-loader-orb-reveal` / 9秒 | [播放](../assets/previews/dual-image-loader-orb.mp4) |

三段时长是最终机制演示基准。生成本期视频时重新安排操作、阅读与反馈，不把固定模板时长直接套到口播。来源视频及研究截图未作为包内素材分发，独立SVG/代码不等于原作像素复刻或真实业务执行。

## 图标侧栏 · 悬停展开与选中保留

预设 `interaction-sidebar-hover-expand-select`，32秒。实际观察与保留：

- Single persistent white workspace with five vertically spaced icon entries: Search, Home, Strategies, Campaigns and Chats
- Inactive items show only gray outline icons
- Hover expands a light-gray rounded capsule and reveals a black item label; multiple transient labels can fade during pointer movement
- Current selection retains a black label after pointer leaves while its icon changes from outline to solid/bold form
- Selected entry and a different hovered entry can display their labels simultaneously
- Selecting a new entry fades the previous selected label and returns its icon to gray outline
- Pointer exits into white workspace, removing hover capsule but retaining selection
- Continuous up/down navigation and return to Home, with no page/card cuts

默认参数：`{"title": "Home", "prompt": "Campaigns", "result": "Chats"}`。长度限制：`{"title": 20, "prompt": 24, "result": 20}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Home navigation label, initially and finally selected | 20 |
| `prompt` | Campaigns navigation label, hovered and selected twice | 24 |
| `result` | Chats navigation label, hovered and selected once | 20 |

关键定位秒：

- 0秒：Home initially selected; five-entry rail and white workspace。
- 1.9秒：Home hover capsule。
- 3.9秒：Strategies hover; Home remains selected。
- 5.9秒：Campaigns hover。
- 7.8秒：Chats hover。
- 9.4秒：Pointer leaves; only Home name persists。
- 13.4秒：Strategies selected。
- 14.5秒：Strategies selected after hover release。
- 16.8秒：Campaigns selected。
- 19.2秒：Chats selected。
- 20.6秒：Chats selected after hover release。
- 23秒：Search selected。
- 24秒：Search selected after hover release。
- 26.3秒：Campaigns selected again。
- 27.95秒：Strategies selected again; previous label fading。
- 29.9秒：Home selected again。
- 32秒：Home persists after cursor leaves。

实现差异与原创部分：

- Square 1322x1322 source adapted to 1920x1080 white workspace, preserving all five entries and the blank region; navigation spacing and size adjusted for landscape reading
- Independent editable SVG paths and CSS replace source icon pixels; no reference video or screenshot embedded or distributed
- Source 25.383333s expanded to 32s for hover, click and selected-name reading
- Observed selected states and repeated returns reconstructed; precise cursor timings and intermediate easing are original
- Home, Campaigns and Chats names are editable parameters; no business/service behavior added

未确认行为：

- No business page content, navigation destinations, account context, backend calls, search input or service results appear in source
- Exact implementation framework, icon library, source easing and event logic are unknown
- Exact click instants between sampled source frames are not claimed; source samples establish visible hover/selected states

## 嵌套侧栏 · 子项切换与折叠

预设 `interaction-nested-activity-sidebar`，28秒。实际观察与保留：

- One persistent dark application with left navigation and a large right content region; source main content contains search and grey placeholder sections throughout.
- Activities is a one-level accordion containing Tasks, Meetings and Calls. Expand/collapse changes child clipping height, chevron direction and lower Agents/Team/Settings positions.
- Root Home remains blue during initial child hovering. Initial Tasks hover is not treated as a verified Tasks selection.
- Observed selected-state order is Home -> Meetings -> Calls -> Tasks -> Calls -> Home; hover hand and grey row backgrounds can differ from the currently blue selected row.
- Blue rounded selection background, selected label color and blue child bead change together. Grey rounded connector between child dots is visible during hover/selection movement and fades in some frames.
- Home can be selected while Activities remains expanded. Closing Activities then returns lower entries upward; tail includes another hover of the closed group.
- Logo, plus action and right search area are retained visually. No plus action, search execution, actual file content or business page completion was shown.

默认参数：`{"title": "Activities", "prompt": "Tasks", "result": "Calls"}`。长度限制：`{"title": 24, "prompt": 24, "result": 24}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Accordion group label | 24 |
| `prompt` | First child label | 24 |
| `result` | Third child label | 24 |

关键定位秒：

- 0.8秒：closed group, Home selected。
- 4.2秒：expanded group, Tasks hover only。
- 5.8秒：Meetings hover only, short connector visible。
- 8.3秒：Meetings selected。
- 10.7秒：Calls selected。
- 13.8秒：Tasks selected with full connector。
- 16.1秒：Calls selected again。
- 20.3秒：Home selected while expanded; Activities hover。
- 21.15秒：original press ring at Activities and fold beginning。
- 23.4秒：closed group and ordinary cursor below menu。
- 28秒：final closed group with Activities hover。

实现差异与原创部分：

- 1080x1080/12.050998-second source is adapted to a 1920x1080, 28-second widescreen application with longer readable holds and authored interpolation.
- Source knot-like brand mark is replaced with an independently coded geometric symbol. All navigation icons, cursor artwork and main placeholders are independently coded SVG/CSS; no source pixels are used.
- Adapted menu row height is 76px, branch expansion 228px, sidebar/main split 596px within the 1736px window. These are authored widescreen geometry, not claimed source pixel measurements.
- Entry animation, explicit click rings, pointer press feedback, exact connector fade timing and bottom explanatory label are original additions. Source pointer events were not instrumented.
- Grey right-side placeholder sections remain visually present; they are not interpreted as a working loading pipeline, fetched records or generated results.
- No source audio is used or imitated. The source mentions sound but its audio was not reviewed.
- Preset is a deterministic paused GSAP demonstration; live user navigation and source application behavior beyond the visible sequence are not claimed.

未确认行为：

- Actual application, source implementation, event logs, exact easing and connector fade algorithm are not verified.
- Grey placeholder areas' real loading or content purpose is unknown; no activity data or file results were shown.
- Plus action, Agents, Team, Settings and search behavior were not exercised in the source observations.
- Source audio content and sound timing are unverified.
- Only one child depth was observed. File Tree is a category label and does not establish deeper folders or file-opening behavior.

## 双图像加载 · 点阵与粒子球揭示

预设 `interaction-dual-image-loader-orb-reveal`，9秒。实际观察与保留：

- Single continuous dark work area containing two persistent parallel portrait image panels
- Left loader: a regular dot matrix with moving wave of dot radius and brightness
- Right loader: rotating/projected particle sphere with moving highlight and several softly luminous purple, blue and cyan rings
- Faint colored highlight travels around panel edges
- Initial captions Making the first draft... / Forming the shapes... crossfade to Sketching it out... / Gathering the light...
- Blurred central revelation grows to fill both image panels while loaders and status captions disappear
- Two circular retry glyphs appear and persist over the final matching images
- Both loaders reveal the same monochrome composition; no scene/card replacement or observed pointer interaction

默认参数：`{"title": "Making the first draft...", "prompt": "Forming the shapes...", "result": "Gathering the light..."}`。长度限制：`{"title": 32, "prompt": 32, "result": 32}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Initial left dot-loader status caption | 32 |
| `prompt` | Initial right particle-sphere status caption | 32 |
| `result` | Second right loading status caption, shown after the source-observed status transition | 32 |

关键定位秒：

- 0秒：Dual loaders visible; first status captions。
- 1.5秒：Moving grid wave and sphere highlight lower-right。
- 3秒：Particle highlight lower-left; multi-ring and edge light moving。
- 4.4秒：First captions fade upward。
- 5.4秒：Sketching it out... / editable Gathering the light... fully visible。
- 6.3秒：Blurred circular image revelation starts in both panels。
- 6.9秒：Retry glyphs visible; central image beginning to emerge。
- 7.4秒：Both image bodies fill panels through blur while loaders fade。
- 8.15秒：Full original monochrome image bodies; captions and loaders hidden。
- 9秒：Stable matching image panels and retry glyphs, ready to join UI body。

实现差异与原创部分：

- 2284x1362 source adapted to editable 1920x1080; both full panels and all visual stages retained
- Source 6.208333s adapted to 9s for readable captions, continuous loading and image-reveal hold
- Original deterministic SVG dot field, 1260-point projected sphere and analytic multi-ring paths reproduce mechanisms, rather than copying source shader/pixels
- Independent original monochrome SVG sportswear portrait with two blurred walking figures substitutes source photo, person identity and garment branding; same illustration appears in both panels
- Blurred circular reveal and crossfade timings/easing are original approximations based on observed stages
- No original media, screenshots, network requests, real AI execution or invented retry click embedded in runtime

未确认行为：

- No visible AI request, model execution, backend response, progress metric or user prompt appears in source
- Retry controls are visible but source shows no click; their real behavior is unknown
- Source shader, easing, lighting, exact particle count and image reveal mask implementation are unknown
- Identity and rights of original photograph subjects are not inferred or reproduced

## 新增目录快照

实际双DOM读取Menu四页24+24+24+7卡、Hover State三页24+24+3卡、Orb两页24+2卡，末页Next禁用；File Tree实际单列表15卡，没有源分页控件，归档p1不是网站第1页。保留作者资料链接、完整媒体URL、可见标签、实际图片alt和卡片顺序；未展开的隐藏标签不补造。四类目录状态保持catalogued-only。

十四类合计73个归档分页/列表、1582卡、1375个不同完整媒体URL，207次重复、176组跨类媒体，52组关联既有实际观察。另145类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [Menu](../assets/studio/inventories/menu-20261001.json)、[File Tree](../assets/studio/inventories/file-tree-20261001.json)、[Hover State](../assets/studio/inventories/hover-state-20261001.json)、[Orb](../assets/studio/inventories/orb-20261001.json)、[分类索引](../assets/studio/inventory-catalog.json)。目录枚举和上述三件动态媒体观察分别登记，不因有同一媒体的跨类卡片重复增加观察或适配数。

## 实际验证与范围

新增三项主入口构建、五点前进/回拖、80%文字布局与SVG/文字裁剪夹具通过；主要稳定状态、短中文/转义参数和末→0另查。累计分批89，旧86项本轮未重跑，未启动独立审查。三段共69秒/2070帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或审美通过，这三项均未完成。

分类状态保持157 queued / 2 observed / 0 implemented，另145类目录与全站逐作品重建继续保留。见 [便携观察与最终验证](../assets/studio/observations/batch20.json)、[累计验证说明](../verification.md)。
