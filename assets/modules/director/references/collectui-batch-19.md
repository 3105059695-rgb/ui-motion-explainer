# 第十九批：长导航、原型巡览与侧栏拖动

2026-10-01；1920×1080横屏。三件Sidebar精确卡的远程动态来源经过实际多点暂停观察，再按主要区域与连续操作独立重建。当前库86个预设，54项不同深度来源观察和55机制适配。

| 来源 | 原片尺寸 / 时长 | 接受暂停帧 | 代码预设 / 基准时长 |
|---|---|---:|---|
| [@heyimgustavo](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 936×1190 / 10.9917秒 | 8 | `interaction-sidebar-colored-anchor-trail` / 24秒 |
| [@guerriero_se](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1080×1080 / 33.135秒 | 16 | `interaction-lab01-prototype-tour` / 66秒 |
| [@Jamie_Merrill](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1440×1440 / 6.56667秒 | 8 | `interaction-finance-sidebar-resize` / 20秒 |

这些时长是机制演示的基准；生成本期视频时按口播重新安排点击、阅读和结果强调。保持来源的主要区域，局部原创操作、示例内容及未知行为单独记录，不将本地演示当成真实服务执行。

## 长侧边栏 · 彩色锚点与滚动渐隐

实际观察与保留：

- Single persistent long sidebar over a landscape background
- Top-level Index, GOATs and Resources links
- Craft, Typography, Color, Layout and Motion groups with colored SVG icons
- Mint New badges on selected documented items
- Hover text darkens while current selection remains distinct
- Single colored anchor dot changes position and category color across selections
- Inner scrolling reveals earlier groups while top and bottom fades obscure boundary rows
- Selection sequence Image Outlines to Nested Border Radius to Optical Alignment to Tabular Numbers to Noise to Novelty Budget to Text Wrapping

默认参数：`{'title': 'Resources', 'prompt': 'Nested Border Radius', 'result': 'Text Wrapping'}`。长度限制：`{'title': 20, 'prompt': 32, 'result': 28}`。

实现差异：

- Portrait936x1190 adapted to1920x1080 landscape with same persistent sidebar and source blank area.
- 24-second readable timing preserves continuous selection and scrolling sequence; exact key/click events between accepted samples are not observed.
- Landscape redrawn as independent local SVG; no source media or screenshots included in module.
- Resources, Nested Border Radius and Text Wrapping labels are editable parameters.
- No invented document content, search input, service result or persistence added.

未知行为：

- Exact click bindings, hover timing and anchor easing between samples
- Full source website identity and body content outside the captured sidebar
- Whether navigation changes URL, scrolls a document or loads content
- Backend services and real persistence
- Content below Motion Interruptibility or inside hidden menus

## Lab01 · 十二段交互原型连续巡览

实际观察与保留：

- One Lab01 page vertically scrolls through twelve distinct coded prototypes, retaining captions and container relationships.
- Dark selected among three previews; transparency off and Cancel/Save visible; no theme switch accepted.
- Inbox active, Sent hover, selected Sofia checkbox, all eight nav labels and eleven sender rows; no send action.
- Day active, grouped Today/Yesterday/Feb 8 history with a narrow icon rail.
- Five actions with keyboard hints and Replace Layer hover; no selected action output.
- Define Requirements is dragged from To Do into Doing, and remaining cards shift to make space.
- Studio active, full Spaces/Builds sidebar beside Product schema and Validating schema… state.
- Secondary sidebar narrows while black icon rail persists; divider moves and visible main skeleton grows.
- Search/menu/shortcuts/footer remain; Ask AI hover only.
- Collapsed Home selection becomes expanded Tasks/Meetings/Calls group, then Calls selection; lower nav moves.
- Document title control opens five-option dropdown; Undo/Redo and AI-off control stay visible.
- Empty rounded Search field gains insertion focus against a light placeholder document.
- AM selected; hands and two-digit values move from 09:22 to 03:40.

默认参数：`{'title': 'Lab01', 'prompt': 'Define Requirements', 'result': 'Opportunities'}`。长度限制：`{'title': 24, 'prompt': 30, 'result': 28}`。

实现差异：

- Independent editable 1920x1080 DOM/CSS/SVG adaptation; original 1080x1080 source pixels, photographs, avatars and video are not copied or packaged.
- All twelve prototypes remain in one scrolling portfolio composition. Sticky readable header, horizontal region sizing, 66-second timing, pointer routes, easing and click feedback are original.
- Source states are preserved without claiming real account, mail, schema, AI or service operations. Theme remains Dark; mail is not sent; schema remains visibly Validating schema…; Ask AI is only hovered; draft options are not executed; search remains empty.
- Original wave SVG replaces photo background; generic original line icons, cube/orbit marks and SG monograms replace source images.
- Wide-screen placeholder bars, exact progress ratios and extra spacing are original geometry; cropped or shortened source subject/task text stays visibly abbreviated rather than inventing business content.
- Time picker is an illustrated local interaction, with original pacing and drag path; it is not live system time.

未知行为：

- No confirmed theme-change, transparent-sidebar or Save outcome.
- No confirmed mail send/route changes or full truncated subject content.
- No Layer menu selection outcome, Ask AI execution, or generated result.
- No schema-valid completion or backend semantics.
- No real Opportunities dataset behind the visible skeleton.
- No Draft command execution, download file or version history contents.
- No typed search query or returned search results.
- Not all intermediate source drag coordinates and off-screen regions can be read from the square cropped recording.

## 财务侧栏 · 拖动收起与展开

实际观察与保留：

- Persistent three-region application: fixed narrow icon rail, variable-width text sidebar, white main content page.
- Finance navigation includes Overview, Pay, Balances, Payment history, Billing, Expenses, Contractor adjustments, Expense card, Liability payments and Liability payment dates. Overview stays selected throughout.
- Hovering the navigation/page boundary reveals a grey resize handle, horizontal double-arrow cursor and dark Drag to resize tooltip.
- Dragging toward the rail first clips navigation text and selection width, then fully collapses only the text sidebar. The rail remains visible and white page expands continuously.
- Dragging right restores navigation to an intermediate width and then a wider-than-initial width, with main page and grip positions synchronized.
- Tail returns near the original sidebar width with ordinary cursor and hidden handle; causal rule is unknown.
- Main header always shows sidebar icon, Finance breadcrumb and Overview page name; its content body stays blank. No navigation or finance-data operation was observed.

默认参数：`{'title': 'Finance', 'prompt': 'Drag to resize', 'result': 'Overview'}`。长度限制：`{'title': 24, 'prompt': 28, 'result': 24}`。

实现差异：

- Source 1440x1440/6.566667 seconds is adapted to 1920x1080/20 seconds with a wider application window and extended reading holds.
- All glyphs, rail icons and cursors are independently coded SVG. Background is independent CSS gradient; no source video, image or screenshot pixels are used in the preset.
- Adapted text-sidebar widths are 500 -> 76 -> 0 -> 414 -> 574 -> 500 pixels; these are authored widescreen widths that preserve expanded, clipped, collapsed, intermediate and tail-return states rather than claimed source pixel measurements.
- Entry animation, drag-press ring and chosen interpolation speeds are original explanatory additions. The ring is attached to the moving divider, not evidence of a source click.
- Parameter title changes module labels, prompt changes hover tooltip and result changes selected page labels. These substitutions are demonstration edits.
- The tail return is rendered as a short transition for continuity. It is not presented as a verified snap-back or threshold behavior.
- Preset is a deterministic paused GSAP demonstration. It does not implement or claim live finance operations or live pointer event handling.

未知行为：

- Exact source application, source code, pointer-event implementation, resize bounds and snap behavior are not verified.
- The reason for the last-frame return to initial width may be application behavior or an edit/loop in the recording.
- Financial data and actual functions behind menu entries were not shown. The empty page is preserved; no balances, transfers or business results are generated.
- Stable sampled frames establish visible states, not every intermediate frame or the exact duration/easing of original drags.

## 新增目录快照

实际通过Next逐页读取UI Tips两页24+9卡、Dashboard四页各24卡。每页完整DOM集合两次读取一致，末页Next禁用；Dashboard末页虽有24卡，仍按实际禁用状态停止。两类分别33/33、96/96卡/媒体，保留顺序、实际图片alt、可见标签与归属链接，未展开标签不补造。目录自身新增媒体观察0。

十类合计63个归档分页/列表、1411卡、1300完整媒体URL，111次重复、98组跨类媒体，49组关联实际观察。另149类目录及全站逐作品重建仍待继续。见 [UI Tips](../assets/studio/inventories/ui-tips-20261001.json)、[Dashboard](../assets/studio/inventories/dashboard-20261001.json)、[分类索引](../assets/studio/inventory-catalog.json)。

## 实际验证

新增三项主入口五点前进/回拖、80%文字布局与SVG/裁剪夹具通过；主要稳定态、短中文/转义参数与末→0另查。累计分批86，旧83项本轮未重跑。三段共110秒/3300帧，1920×1080/30fps/H.264无音轨，完整解码和FFprobe通过；联系表与编码中间帧实际抽看，未完整连续观片/配本期口播/获审美认可。

分类157queued/2observed/0implemented，完整原作复制0，全站目标未完成。见 [便携观察](../assets/studio/observations/batch19.json)、[验证说明](../verification.md)。
