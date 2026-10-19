# 第二十二批：玻璃编辑器、搜索导航与通知状态

2026-10-01；v0.21，1920×1080横屏。三件精确卡视频来源经实际多个解码暂停状态观察，按完整主要区域独立重建。Piyush界面静态，仅背景动态；折叠、查找和文本替换为原创扩展。其余来源按各自实际交互证据登记。当前95个预设、63项不同深度来源观察、64项机制适配；完整原作复制0。

| 来源 | 原片尺寸 / 时长 | 接受暂停帧 | 代码预设 / 基准时长 | 实际样片 |
|---|---|---:|---|---|
| [@piyushsphere](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2002×1816 / 10.0083秒 | 6 | `software-glass-code-editor-local-edit` / 28秒 | [播放](../assets/previews/glass-code-editor-local-edit.mp4) |
| [@renzobianchi_](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1840×1320 / 16.3秒 | 16 | `interaction-morphing-search-notification-nav` / 32秒 | [播放](../assets/previews/morphing-search-notification-nav.mp4) |
| [@raunofreiberg](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2520×1860 / 11.4333秒 | 16 | `interaction-notification-stack-cycle` / 26秒 | [播放](../assets/previews/notification-stack-cycle.mp4) |

演示时长读取最终proof，生成本期视频时应重新安排操作、阅读和反馈。独立SVG/代码不等于原作像素复制或真实业务执行；下列未知不能因改文案成为已确认行为。

## 玻璃代码编辑器 · 本地查找与文本替换

预设`software-glass-code-editor-local-edit`，28秒。来源实际标签：Code Editor。源交互是否实际观察：False；源运动范围：background only。

实际观察与保留：

- Observed: a continuous soft blurred luminous rectangular background tilts/drifts behind a static translucent dark IDE.
- Observed: persistent full visible tool rail, search, Page Code header/tree, device/domain tools, three tabs and numbered syntax-highlighted code.
- Original extension: Booking Pages children collapse and expand inside the same tree; Cart & Thank You group shifts in normal layout.
- Original extension: current-file query typed into Search; literal substring count and highlights generated deterministically from displayed code; no-match query shows No matches.
- Original extension: close local find, select existing enterpriseNote text, replace it character by character with caret and unsaved dot.
- Original extension: continuous reading hold within same editor; no backend execution, live preview, CI result or successful save is added.

默认参数：`{"title": "Services (Item)", "prompt": "service", "result": "Tailored support for your team."}`。长度限制：`{"title": 24, "prompt": 20, "result": 64}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Active file label, shared by the tab and current-file find result. | 24 |
| `prompt` | Original local current-file find query; literal case-insensitive matching against displayed source-code text controls count/highlights or No matches. | 20 |
| `result` | Original replacement for the enterpriseNote text in the already-open code line; typed locally, never executed. | 64 |

关键定位秒：

- 0秒：Observed IDE composition, all tree groups expanded; background-only motion。
- 3.4秒：Click Booking Pages group。
- 4.5秒：Booking children folded; Cart group moves within same tree。
- 5.5秒：Click Booking Pages again。
- 6.3秒：Original tree restored。
- 7.3秒：Click Search for current-file find。
- 8.3秒：Query partially typed。
- 9.6秒：Default service query has five actual code text matches。
- 11.6秒：Close find and clear visual highlights。
- 13.6秒：Click current enterpriseNote text。
- 14.2秒：Same code string selected。
- 15.15秒：Start local replacement typing。
- 16.4秒：Partial replacement and caret visible in same line。
- 18.8秒：Edited text complete, unsaved dot visible; no execution or save。
- 23.2秒：Cursor leaves, final edited-code reading hold through 28。

实现差异与原创部分：

- Source 2002x1816 and 10.008333 seconds adapted to an editable 1920x1080 horizontal window and 28 seconds of reference reading plus explicitly original local operations.
- All source UI interactions are absent: folding, find popover, typing, highlights, selection, replacement, caret and unsaved dot are original extension, not observed source actions.
- Independent original SVG icon shapes/logo and blurred vector rectangular ribbons replace all original background/media pixels.
- All visible source groups/rows preserved: Main pages with Home/About/Search Results/Plans & Pricing/masterPage.js; Booking Pages with four rows; Cart & Thank You with Cart Page.
- Right/bottom source crop opened into a readable horizontal code panel; no unseen tree items added. The displayed getCurrentItem() call/closing punctuation are independent non-executable text completion of clipped source code; complete source implementation is not claimed.
- Initial enterpriseNote string retains visible source fragment with an explicit ellipsis; editable result is original local replacement text, not a guessed full source sentence.
- Repository/service/domain/data behavior is not real; code is display text only.

未确认行为：

- Source does not show interaction behavior for tree collapse, global Search, tab switching, preview controls, domain connection or save/run.
- Original background construction/renderer and true code/service implementation cannot be determined from rendered video.
- Source clips right/lower window; remaining code characters, further tree rows and hidden panels are not fully visible.
- No actual backend, data, category decision, booking workflow or executable result is verified.

## 变形导航 · 搜索输入与通知巡览

预设`interaction-morphing-search-notification-nav`，32秒。来源实际标签：Navigation、Header Navigation、Menu、Search。源交互是否实际观察：True；源运动范围：Observed UI state changes: Home→expanded Search input with Search... then liquid glass typing→Inbox label→Notifications four-row expansion and row1→2→3→4 hover highlights→Settings label→Home. Source framing also eases in/out. No source pointer or click/key event was visible, so trigger modality and exact event coordinates remain unknown. Source states are not background-only.。

实际观察与保留：

- A single rounded glass navigation shell keeps all five Home/Search/Inbox/Notifications/Settings glyphs and morphs width and active capsule position instead of replacing whole screens.
- Search expands an in-place input, shows Search... and caret, then visibly accumulates liquid glass text; no search results are shown.
- Inbox uses a labeled active pill only, without a message panel.
- Notifications expands the same shell downward into four complete rows with two unread dots, two person portraits, rocket/receipt glyphs and 2m/14m/1h/3h ages.
- A rounded highlight moves in order over notification rows 1, 2, 3 and 4.
- Settings collapses the shell to a labeled active pill without settings fields; Home returns afterward.

默认参数：`{"title": "Home", "prompt": "liquid glass", "result": "Notifications"}`。长度限制：`{"title": 12, "prompt": 24, "result": 18}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Home active label at the start and return; does not name a workspace or result page. | 12 |
| `prompt` | Text typed character by character in the expanded Search field; input only, no search results or backend call. | 24 |
| `result` | Notifications active pill heading above the four fixed rows; does not change any notification content or trigger a result. | 18 |

关键定位秒：

- 0秒：Home stable; five nav items and unread dot。
- 2.2秒：Original Search pointer click on the compact nav。
- 3.2秒：Observed expanded Search... placeholder/caret state。
- 4.3秒：Begin parameterized query typing in the same input。
- 5.6秒：Partial query typed。
- 6.8秒：Complete query reading hold through 9.2。
- 10.15秒：Original Inbox pointer click。
- 11.2秒：Observed Inbox active label, no body。
- 13.2秒：Original Notifications pointer click。
- 14.5秒：Complete observed four-row Notifications panel。
- 15.9秒：Observed first-row hover reproduced with original pointer。
- 17.9秒：Observed second-row hover reproduced with original pointer。
- 19.9秒：Observed third-row hover reproduced with original pointer。
- 21.9秒：Observed fourth-row hover reproduced with original pointer。
- 24.45秒：Original Settings pointer click。
- 25.6秒：Observed compact Settings active label。
- 28.4秒：Original Home pointer click。
- 29.4秒：Observed Home return and reading hold。
- 32秒：Home tail; timeline can seek back to zero。

实现差异与原创部分：

- Independent 1920×1080 CSS/SVG redraw and 32-second editable timeline replace the 1840×1320,16.3-second source playback, giving input and each notification row reading time.
- Gray/blue right-angle geometry, gradients and shadows are independently authored SVG; source wallpaper pixels are not used. The original camera crop/zoom is represented only by a modest independent background scale.
- Source portraits are replaced with independently drawn flat SVG avatars; names Ana/Tomás become Maya/Leo and Nav morph v2 becomes Nav study. Four notification roles and age labels are preserved.
- Continuous cursor, navigation click rings and cursor following the morphing selected control are original operation mappings. Source has no visible pointer/click event proof. Notification rows only hover; no click-through or business result is invented.
- title/prompt/result can change the Home label, typed query and Notifications heading; source order, other labels, all four notification rows and age/unread structure remain fixed.
- An unobtrusive adaptation note identifies the independent interface example. No external media, source screenshots, remote pixels or original source code are referenced by rendered CSS/SVG.

未确认行为：

- Exact original DOM/CSS, easing curves, event modality and click/key coordinates are unavailable; active changes and typing do not prove a specific original mouse click.
- No source Search result, Inbox detail, Settings form, notification detail or actual deploy/review/billing transaction was observed or implemented.
- No source audio inspection, full continuous playback review, narration synchronization, independent review or user aesthetic approval. Paused verified samples are not a complete frame-by-frame source review.
- Main gallery integration, final render/export/decoder verification and package install are pending parent/root validation.

## 通知堆栈 · 悬停轮换与关闭

预设`interaction-notification-stack-cycle`，26秒。来源实际标签：Notification。源交互是否实际观察：True；源运动范围：Cursor hover reveals the next notification header, repeated selection cycles four notifications in the same deck, leaving retracts rear layers, close hover hides rear layers and close dismisses the visible notification area. The container and account footer remain fixed.。

实际观察与保留：

- Persistent two-column shell and account/footer controls
- Compact four-card notification deck with scaled rear silhouettes
- Hover-driven exposure of next header
- Selection of the exposed next header rotates the same deck through four full messages and back to the first
- Leaving the exposed header retracts rear layers
- Close-hover feedback hides rear layers; clicking close removes the visible notification surface while preserving the workspace

默认参数：`{"title": "Workspace update", "prompt": "Explore what is new in your workspace.", "result": "Read update"}`。长度限制：`{"title": 20, "prompt": 48, "result": 18}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | First notification headline, shown in front and again as the exposed rear title after cycling. | 20 |
| `prompt` | First notification body; stays attached to the same card while it cycles through the stack. | 48 |
| `result` | First notification CTA label; editable visible text only, with no unobserved click or real service result. | 18 |

关键定位秒：

- 0秒：Compact four-item deck; two-column container and account footer remain persistent。
- 3.45秒：Hover exposes the next notification header。
- 3.9秒：Stable next-header hover。
- 6.35秒：Click next header; current card moves behind and next becomes front。
- 7.2秒：Explore your project front, Observability Plus rear header。
- 9.65秒：Click next header again。
- 10.5秒：Observability Plus front, Ship 26 rear header。
- 12.95秒：Click next header again。
- 13.8秒：Ship 26 front, Workspace update rear header。
- 16.25秒：Click next header to complete the cycle。
- 17.2秒：Original first notification restored as front。
- 19.1秒：Pointer leaves exposed header; rear deck retracts。
- 21.4秒：Close hover fill appears; rear layers visually hide。
- 22.5秒：Click the front close control。
- 23.02秒：Visible notification area dismissed; account footer and blank main region remain。
- 26秒：Empty notification-region reading hold。

实现差异与原创部分：

- Independent CSS/SVG geometry, original avatar and account identity replace source pixels; no source footage or screenshot is used by the module.
- 1920×1080 landscape container and 26-second timeline increase text size/read holds; interpolation, cursor movement and click ring are original animation details.
- First card uses editable illustrative Workspace update copy in place of a dated commercial discount. Other bodies/CTAs are independently rewritten illustrative copy; source four-item order is retained.
- CTA, bell and more controls remain visible as in source, without unobserved execution, navigation, purchasing or backend outcomes.
- The visible notification area is dismissed as a surface. This does not claim that all underlying source messages were deleted, marked read or persisted.

未确认行为：

- Source backend/product implementation and storage of dismissed notifications
- Destination or result of source CTA buttons, bell and more menu
- Hidden notifications or behavior after the source ends
- Exact internal card layout/z-order algorithm; geometry reconstructed from observed rendered states

## 新增两类目录快照

Search：1个归档分页/列表，实际卡数21=21，21个不同完整媒体URL；Notification：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL。Search为无源分页控件的完整单列表，p1仅归档编号；21卡/21个不同完整媒体URL。Notification实际两页24+2=26卡/26个不同完整媒体URL，活动页与完整集合双读一致，末页Next禁用。实际翻译标签与原始href保留，exact-href推导英文分类名单独记录，未展开隐藏标签不补造。两份新快照保持catalogued-only；之前20类快照保留。目录枚举新增媒体观看0。

二十二类合计93个归档分页/列表、1949卡、1566个不同完整媒体URL；383次重复、311组跨类媒体、58组关联已有实际观察。唯一URL媒体类型为1338视频/228图片。另137类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [Search](../assets/studio/inventories/search-20261001.json)、[Notification](../assets/studio/inventories/notification-20261001.json)、[分类索引](../assets/studio/inventory-catalog.json)。目录枚举与三件视频来源观察分别登记，同一完整媒体URL的跨类卡不重复增加来源观察或机制适配。

## 实际验证与范围

新增三项主入口默认与短中文/转义参数、主要稳定状态及末→0检查通过；诊断错误、回拖失败、布局标记均为空，SVG与文字裁剪夹具通过。累计分批95，旧92项本轮未重跑，未启动独立审查。三段共86秒/2580帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或用户审美通过，这三项均未完成。来源截图与远程媒体像素不作为包内素材分发。

分类状态保持157 queued / 2 observed / 0 implemented，另137类目录与全站逐作品重建继续保留。见 [便携观察与最终验证](../assets/studio/observations/batch22.json)、[累计验证说明](../verification.md)。
