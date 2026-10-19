# 第十八批：产品巡游、AI工作区与双栏吸附

2026-10-01；1920×1080横屏。三件Sidebar动态来源实际多点暂停观察，再独立重建主要界面区域与连续机制。当前库83个预设，51项不同深度来源观察与52机制适配。

| 来源 | 原片尺寸 / 时长 | 接受暂停帧 | 代码预设 / 基准时长 |
|---|---|---:|---|
| [Pankaj / @pankajstwt](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1920×1080 / 19.7667秒 | 17 | `interaction-folio-library-product-tour` / 60秒 |
| [BB App / @get_bb_app](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1000×564 / 15.6秒 | 7 | `interaction-sidebar-chat-grouping` / 26秒 |
| [Gabriell / @gabriell_lab](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1920×1440 / 14.3036秒 | 8 | `interaction-draggable-split-snap` / 26秒 |

每个预设保持原作可见结构。标题、输入与结果参数是可编辑入口，时长只是机制基准；按本期口播重新安排镜头、阅读时间和重点。演示中的局部原创延伸不当成原片观察或真实业务执行。

## Folio · 收藏与笔记工作台完整巡游

实际观察与保留：

- Persistent sidebar and tabbed app window
- Saved mixed masonry to table
- Expanded empty saved search
- Full Save to Folio form, cancellation
- Tasks grouped by date with inner scroll
- Notes area chips, pinned and unpinned partitions
- Same Sync Draft opened and revisited
- Inbox capture and filing affordances
- Daily Note weekday, editor and task/saved companion panels
- Folio area overview to tasks
- Off Menu area overview to saved-detail modal

默认参数：`{'title': 'Folio', 'prompt': 'Hello', 'result': '斑驳墙面与修补窗框，可作为空间的纹理参考。'}`。长度限制：`{'title': 20, 'prompt': 32, 'result': 64}`。

实现差异：

- 60-second editable adaptation allows reading of long source tour.
- All visible media redrawn as independent deterministic SVG; no source photos/video shipped.
- Daily Note parameter typing and caret timing are original; source confirms Hello state only.
- Saved detail note parameter replaces source English note with local example.
- Folio tasks highlight made stable for reading, while source paused frame is transitional.
- Exact source hidden menus and service persistence not implemented or claimed.

## Cursor 侧栏 · 四种聊天分组

实际观察与保留：

- {'name': 'Stable pinned section', 'observation': 'Three pinned chats retain their identity and order across all four modes.'}
- {'name': 'Grouping menu', 'observation': 'Sidebar filter control opens main menu; Grouping submenu contains Projects, Updated, Status and Environment, with current selection check.'}
- {'name': 'Shared data regrouping', 'observation': 'Eleven ordinary chats are reorganized while Rate limit headers remains highlighted.', 'groups': {'Projects': {'Website Redesign': [0, 1], 'Mobile App': [2, 3], 'Platform API': [4, 5, 6], 'Threads': [7, 8, 9, 10]}, 'Updated': {'Today': [0, 1, 2, 4, 7, 8, 9, 10], 'Yesterday': [3], 'Last 7 days': [5], 'Last 30 days': [6]}, 'Status': {'Needs your input': [0, 8], 'Failed': [5], 'Working': [1, 6], 'Unread': [2, 4, 7], 'Idle': [3, 9, 10]}, 'Environment': {'acme-web': [0, 1, 8], 'acme-mobile': [2, 3, 10], 'acme-api': [4, 5, 6, 7], 'studio': [9]}}}
- {'name': 'Mode feedback', 'observation': 'Left current mode word and four pills track the sidebar grouping.'}

默认参数：`{'title': 'CURSOR SIDEBAR', 'prompt': 'Rate limit headers', 'result': 'acme-web · feature-spacing'}`。长度限制：`{'title': 28, 'prompt': 30, 'result': 36}`。

实现差异：

- Independent 1920x1080 DOM/CSS/SVG reconstruction; source media is only referenced in external research viewer and is not bundled or copied into the preset.
- 26-second adaptation expands the 15.6-second source for three readable menu choices and list reflows; cursor, click rings, exact timing and explanatory subtitle wording are original.
- Publisher get_bb_app is credited as publisher. Software identity follows the visible CURSOR SIDEBAR title. No full IDE/editor was observed or added.
- Pinned three chats and the same eleven ordinary chats are preserved; row positions animate on the same DOM nodes. Full environment and branch text stays available per row rather than suppressing duplicate environment labels.
- All working, failed, unread and needs-input indicators are local demonstration data; no AI execution, remote chat update or live IDE connection occurs.
- Ordering, Show, Status filter, Environment filter, Expand All and Mark All as Read remain observed visible menu roots; unobserved outcomes are not implemented.

## 分栏拖动 · 三个吸附点与自由比例

实际观察与保留：

- One persistent two-panel reading view; the Sidebar category is a tag, not evidence of a navigation sidebar.
- Horizontal divider drag changes left/right widths inversely while both article cards remain visible.
- Observed stable sequence: 50% -> 25% -> 50% -> 75% -> 50% -> free 54% -> free 65% -> 50%.
- Middle cyan three-dot grip tracks the divider; hand indicates drag.
- Bottom floating pill reports two W widths and percentage. Snapped 25/50/75 positions use blue; free 54/65 use black.
- Fixed-height images cover-crop as width changes. Body text naturally reflows; narrow content fades toward its lower boundary. Fieldnotes label, title and fixed 01/02 footers remain.

默认参数：`{'title': 'A little more room.', 'prompt': 'Small changes in space can change how a page feels. A wider column lets the eye move along a calm line of text, while a narrow column brings each sentence closer. Drag the divider to compare both views. The content stays in place as each side finds its own rhythm.', 'result': '50% · 回到中心吸附点'}`。长度限制：`{'title': 28, 'prompt': 360, 'result': 30}`。

实现差异：

- 1920x1440 source is adapted to a 1920x1080, 26-second editable composition with longer reading holds; individual drag speeds are authored.
- Both source photographs are replaced with independently coded SVG landscape illustrations; no source pixels are included in the preset.
- The source's entire parabola article body is replaced with an independently written example of similar length. Short functional labels, title and page numbers remain; text wrapping behavior is preserved.
- Width readouts show the actual widescreen card widths (1476px total), rather than copying the source's 748-unit readouts. Percentage, card edges and grip all derive from the same ratio.
- Entry animation, click ring, pointer pressure animation, lower proof label and final result caption are original explanatory additions.
- No live user drag handler is claimed. The preset is a deterministic GSAP demonstration of observed actions with direct and reverse seeking.

## 新增目录快照

实际浏览Product Tour与AI Agents的已载入单列表，两次完整DOM集合一致，均未显示分页控件；p1只为本地档案页码。Product Tour 14卡/13媒体，AI Agents 21卡/20媒体，保留重复卡、图片实际alt、可见标签、隐藏标签数与归属链接。未见隐藏标签不补造，外部Post by不当成已确认原作href。目录自身新增观看0，实际动态观察在上表另行计数。

八类合计57个归档分页/列表、1282卡、1210个完整媒体URL，72次重复/63组跨类媒体；46个媒体组关联实际观察。另151类目录及全站重建仍待继续。见 [Product Tour](../assets/studio/inventories/product-tour-20261001.json)、[AI Agents](../assets/studio/inventories/ai-agents-20261001.json)、[分类索引](../assets/studio/inventory-catalog.json)。

## 实际验证

三项主入口五点前进/回拖、80%文字布局与SVG/裁剪夹具通过；主要稳定态、短中文/转义参数、末→0另查。旧80项本轮未重跑。三段导出112秒/3360帧，1920×1080/30fps/H.264无音轨，完整解码和FFprobe通过，联系表与编码中间帧实际抽看；未完整连续观片、未配本期口播、未获审美认可。

Sidebar、Product Tour、AI Agents仍queued；当前157queued/2observed/0implemented，完整原作复制0，全站目标未完成。见 [便携观察](../assets/studio/observations/batch18.json) 与 [验证说明](../verification.md)。
