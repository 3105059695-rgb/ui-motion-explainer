# 第二十一批：折叠学习标签、多选链菜单与GitHub导览

2026-10-01；v0.20，1920×1080横屏。三件精确卡动态来源经实际多个解码暂停状态观察，再按完整主要区域和连续机制独立重建。当前92个预设、60项不同深度来源观察、61项机制适配；完整原作复制0。

| 来源 | 原片尺寸 / 时长 | 接受暂停帧 | 代码预设 / 基准时长 | 实际样片 |
|---|---|---:|---|---|
| [@tell_me_mur](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 720×812 / 11.0781秒 | 12 | `interaction-foldable-learning-tabs` / 30秒 | [播放](../assets/previews/foldable-learning-tabs.mp4) |
| [@abjt14](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1322×1058 / 13.3667秒 | 14 | `interaction-dropdown-chain-multiselect` / 30秒 | [播放](../assets/previews/dropdown-chain-multiselect.mp4) |
| [@athasdev](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2170×1592 / 14.1276秒 | 13 | `interaction-github-sidebar-tabs-tour` / 26秒 | [播放](../assets/previews/github-sidebar-tabs-tour.mp4) |

演示时长读取最终proof，生成本期视频时应重新安排操作、阅读和反馈。独立SVG/代码不等于原作像素复制或真实业务执行；下列未知不能因改文案成为已确认行为。

## 折叠设备 · 四标签连续切换

预设`interaction-foldable-learning-tabs`，30秒。来源实际标签：Navigation、Tabs、Mobile App。

实际观察与保留：

- One persistent device simulator window and same four-tab learning application through the entire clip.
- Right vertical four-icon tab rail switches Profile, Insights, Explore and Home while the selected icon receives lavender tint.
- Compact app changes Profile -> Insights -> Explore -> Home; cursor then clicks device shape controls.
- Device unfolds from narrow to a book-like intermediate physical state and a wider landscape state with a moving dark/reflection region and hinge.
- Same Home content flows across width without another app window; wide Insights -> Profile -> Explore -> Home then continues using the right vertical rail.
- Full Profile account/preferences/two toggle states/plan; Insights score/ring/week graph/patterns; Explore search/four moods/popular row; Home goal/progress/statistics/learning row retained.

默认参数：`{"title": "Alex Morgan", "prompt": "Keep your momentum going.", "result": "The art of visual rhythm"}`。长度限制：`{"title": 20, "prompt": 42, "result": 38}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Profile account display name; Home greeting uses its first space-separated name token. Email/plan/preferences remain illustrative fixed UI data. | 20 |
| `prompt` | Home weekly goal headline, visible in compact and unfolded app. | 42 |
| `result` | Continue learning lesson title, visible in compact and unfolded app. | 38 |

关键定位秒：

- 0秒：Compact Profile & settings; preferences and plan readable。
- 2.8秒：Click Insights; stable complete page at 3.5。
- 5.8秒：Click Explore; stable complete page at 6.5。
- 8.8秒：Click Home; stable complete page at 9.5。
- 11.9秒：Click book device control; continuous width and hinge light change。
- 12.6秒：Intermediate book width with left shadow/center hinge。
- 13.05秒：Click wide control; continue unfolding。
- 14.4秒：Fully wide Home; same app and vertical right navigation。
- 15.3秒：Wide Insights click; stable at 16.1。
- 18.6秒：Wide Profile click; stable at 19.3。
- 21.9秒：Wide Explore click; stable at 22.6。
- 25.2秒：Wide Home click; stable at 25.9。
- 27.8秒：Cursor exits app; wide Home held through 30。

实现差异与原创部分：

- Independent CSS/SVG device, icons and graphs; no source video/photo/screenshot pixels distributed.
- 1920x1080 horizontal reconstruction enlarges the app and uses 30 seconds for readable actions and holds instead of the source 11.078105 seconds.
- Width tween and controlled gradient/hinge light reproduce the unfolding mechanism in editable CSS; physical 3D reflections are not a literal geometric recreation.
- Compact device is enlarged to 540x752 and wide device 1180x752; vertical spacing stays readable while content flows across width.
- Source partly clipped pattern microcopy is extended with independently chosen 9:04 am / 22 min example values; graph heights, learning percentage/time-left and minor account/body copy are illustrative recreated data, not verified service facts.
- Source transition selection highlight briefly mismatches the page at the 7-second sample; reconstruction aligns settled page and icon selection.
- Parameters edit existing display name, weekly goal and lesson title only; all user text is escaped, capped by Unicode code points and receives deterministic typography adjustment at long lengths.

未确认行为：

- The source describes React Native but no actual app source code, backend or device implementation is exposed; reconstruction does not claim those technologies run.
- Source title mentions bottom tabs, but all accepted frames show the rail at the right edge. No bottom migration was observed or implemented.
- Search, preferences switches, Start a session, Manage plan, See all, learning/popular rows and first simulator controls are visible but not activated in the source clip; no service effect invented.
- Small metadata and partly clipped pattern labels cannot be confidently read from source; exact values outside readable main labels remain unknown.
- No real session completion, learning result, payment or account persistence was observed.

## 链菜单 · 多选数量与图标联动

预设`interaction-dropdown-chain-multiselect`，30秒。来源实际标签：Dropdown。

实际观察与保留：

- The dark canvas contains one rounded summary trigger and its dropdown, rather than an application sidebar or dashboard. The trigger has a chain-glyph group and paired up/down chevrons.
- The popup contains all five rows: All Chains, Ethereum, Base, Polygon, Optimism, with a divider after All Chains. Initially All Chains has the purple circular check and the four individual circles are empty.
- Two actual summary cycles are observed: All Chains -> Ethereum -> 2 Chains -> 3 Chains -> All Chains. Ethereum uses one large glyph; two chains use diagonal Ethereum/Base overlap; three use Ethereum/Base/Polygon plus a gray empty fourth cell; All uses four glyphs in a 2x2 group.
- The All Chains check clears for individual summaries and returns when all four glyphs are restored. A checked Ethereum row is partly visible in the zoomed source.
- The source zooms toward the summary while the dropdown stays open, cropping the lower rows; it later returns to the overview and the popup closes. The final summary is All Chains.

默认参数：`{"title": "All Chains", "prompt": "Ethereum", "result": "Chains"}`。长度限制：`{"title": 20, "prompt": 20, "result": 12}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | All Chains group row label and all-chain trigger summary; at most 20 Unicode characters. | 20 |
| `prompt` | Ethereum row label and single-chain trigger summary; at most 20 Unicode characters. | 20 |
| `result` | Text unit following fixed counts 2 and 3; at most 12 Unicode characters. Base, Polygon, Optimism labels, glyph identities, counts, and two-cycle order remain fixed. | 12 |

关键定位秒：

- 0秒：Closed All Chains; identity component transform, four glyphs, pointer hidden.。
- 2秒：Authored trigger press; dropdown opens at 2.1 through 2.55.。
- 3.1秒：All Chains open; complete five rows readable.。
- 5.6秒：First-cycle Ethereum single glyph and checked row.。
- 8.1秒：First-cycle 2 Chains with Ethereum/Base diagonal overlap.。
- 10.6秒：First-cycle 3 Chains with gray fourth placeholder.。
- 13.1秒：First-cycle All Chains/four glyphs and group check.。
- 16.1秒：Second-cycle Ethereum.。
- 18.6秒：Second-cycle 2 Chains.。
- 21.1秒：Second-cycle 3 Chains with gray fourth placeholder.。
- 23.6秒：Second-cycle All Chains.。
- 25.8秒：Authored trigger close press; popup fades from 25.9 through 26.3.。
- 26.5秒：Closed All Chains summary; pointer remains at trigger briefly.。
- 30秒：Closed All Chains tail, pointer hidden; seeks to zero restore initial state.。

实现差异与原创部分：

- Independent CSS and SVG geometry reconstruct the component without source screenshots, video pixels, source code, or remote media in the module. Brand glyphs are independently drawn approximations.
- The original 1322x1058, 13.366667-second media is adapted to a 1920x1080, 30-second editable demonstration with reading holds. The source close-up is replaced by stable complete five-row visibility, preserving the full component region.
- Continuous cursor motion, row hover, click rings, exact click locations and durations are authored interaction mappings. The source summary order is observed, but those exact input events were not visible or recorded.
- Lower-row selection checks are inferred from the top summary glyphs and partially observed checked Ethereum; the cropped Base/Polygon/Optimism checked row visuals are not claimed as directly observed. The authored fourth individual-row press maps to the observed All Chains return.
- An unobtrusive illustrative-interface notice is added. Editable title/prompt/result labels, Unicode length limits, escaping, and reversible timeline state are implementation controls absent from source evidence.

未确认行为：

- Exact source pointer and keyboard inputs, the initial opening trigger event, and precise source event timing between the accepted paused frames are unknown.
- The source camera crop hides most lower rows during selection. Their individual checked visuals, hover behavior, and whether the All Chains return came from the fourth row or another input are not directly observable.
- At 9 seconds Ethereum text and a small Base glyph coexist in transition; that still frame does not prove a deselection or removal action. Stable 8/8.5 and 10 second samples bracket it.
- Source audio was muted and not listened to. Full continuous source playback was not watched; only the listed decoded paused samples were accepted.
- No backend filtering, actual blockchain connection, balances, account state, network calls, transaction, financial action or subsequent business result is observed. The implementation performs no such operation.
- No separate zero-chain summary or menu states outside the two observed cycles are established.

## GitHub 侧栏 · 标签滑动与工作流保留

预设`interaction-github-sidebar-tabs-tour`，26秒。来源实际标签：Code Editor、Tabs、Mac App、Sidebar。

实际观察与保留：

- One continuous desktop software window with persistent top toolbar, bottom status bar, sidebar and right document.
- Three icon-and-label sidebar tabs. Only active label is expanded; horizontal pane slide moves Actions to Issues to Pull Requests and back to Issues.
- Actions status filter opens/closes with All Runs checked; four visible options retained without inventing a selection change.
- Actions, Issues and PR row hover responses; PR list alone scrolls down and returns to top.
- Open CI workflow survives sidebar navigation: title, Success and 2 jobs, six metadata fields, Bun task, eight successful visible steps, 2 more steps and partial Rust header.
- Final Bun job hover and reading hold; no new document opening or actual execution is demonstrated.

默认参数：`{"title": "athasdev", "prompt": "Bump openssl from 0.10.79 to 0.10.80", "result": "dependabot/cargo/openssl-0.10.80"}`。长度限制：`{"title": 20, "prompt": 48, "result": 32}`。

| 参数 | 实际可改内容 | 字符上限 |
|---|---|---:|
| `title` | Repository name centered in the application top toolbar. | 20 |
| `prompt` | Already-open workflow run title, shared by the right document tab/headline and first Actions/PR row. | 48 |
| `result` | Run branch shared by workflow metadata, first Actions row and first PR branch strip. | 32 |

关键定位秒：

- 0秒：Actions list and already-open successful CI workflow。
- 1.8秒：Prepare release row hover。
- 3.5秒：Click Actions status filter。
- 4.5秒：All four filter options readable; All Runs checked。
- 6.3秒：Close filter without changing selection。
- 7.9秒：Click Issues; slide starts at 8.05。
- 8.8秒：Complete Issues list; workflow retained。
- 10.9秒：Click Pull Requests; slide starts at 11.05。
- 12.8秒：Pull Requests at top and first-row hover。
- 14.5秒：PR list locally scrolled 72px and third-row hover。
- 16.5秒：PR list returned to top。
- 17.65秒：Click Issues; slide starts at 17.8。
- 19.9秒：Issues third-row hover。
- 21.8秒：Bun job hover; same workflow metadata/steps。
- 23.3秒：Final Issues and workflow reading hold until 26。

实现差异与原创部分：

- Source 2170x1592 desktop adapted to editable 1920x1080 horizontal layout; 14.127621s actions expanded to 26s for readable filter, lists and workflow.
- Independent original SVG icons, cartoon avatars and blurred abstract forest geometry replace all source photos/media pixels.
- Sidebar long titles retain visible truncation instead of guessing missing source words.
- Source release/CI subtitle and branch information retained, with two-line compact later Actions rows; first two runs preserve their three visible lines.
- Repository name, open run title and branch are editable text objects shared consistently across their corresponding regions.
- No backend, GitHub integration or filter/search execution is represented as real.

未确认行为：

- Actual GitHub authentication, network calls, run execution, repository permissions and service implementation are not observable.
- Filter option result, search result, add action and Log/external/copy action outcomes are not demonstrated.
- Some clipped issue/PR titles and hidden Rust job content cannot be fully read; no hidden content is reconstructed.
- No right-panel scroll, new PR/issue detail opening or active task execution is confirmed.

## 新增六类目录快照

Tabs：3个归档分页/列表，实际卡数24+24+7=55，54个不同完整媒体URL；Dropdown：4个归档分页/列表，实际卡数24+24+24+10=82，82个不同完整媒体URL；Navigation：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL；Mobile App：5个归档分页/列表，实际卡数24+24+24+24+10=106，106个不同完整媒体URL；Code Editor：1个归档分页/列表，实际卡数5=5，5个不同完整媒体URL；Mac App：2个归档分页/列表，实际卡数24+22=46，46个不同完整媒体URL。有源分页者实际完整集合双读一致且末页Next禁用。Code Editor为无源分页控件的完整单列表，p1仅归档编号。Tabs不同卡片共享媒体的合法重复保留。Dropdown旧raw第4页实际重复第3页集合，仅保留纠错历史；统计只接受另存corrected集合，保留旧弹层异常及新Next/实际Page按钮导航记录。Navigation/Mobile App的即时旧集合只保留拒绝证据，不计入accepted集合。实际翻译标签与原始href保留，exact-href推导英文分类名单独记录，未展开隐藏标签不补造。这六类快照均保持catalogued-only，不因清点而声明观看或实现。

二十类合计90个归档分页/列表、1902卡、1539个不同完整媒体URL；363次重复、300组跨类媒体、55组关联已有实际观察。唯一URL媒体类型为1321视频/218图片。另139类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [Tabs](../assets/studio/inventories/tabs-20261001.json)、[Dropdown](../assets/studio/inventories/dropdown-20261001.json)、[Navigation](../assets/studio/inventories/navigation-20261001.json)、[Mobile App](../assets/studio/inventories/mobile-app-20261001.json)、[Code Editor](../assets/studio/inventories/code-editor-20261001.json)、[Mac App](../assets/studio/inventories/mac-app-20261001.json)、[分类索引](../assets/studio/inventory-catalog.json)。目录枚举与三件动态观察分别登记，同一完整媒体URL的跨类卡不重复增加来源观察或机制适配。

## 实际验证与范围

新增三项主入口默认与短中文/转义参数、主要稳定状态及末→0检查通过；诊断错误、回拖失败、布局标记均为空，SVG与文字裁剪夹具通过。累计分批92，旧89项本轮未重跑，未启动独立审查。三段共86秒/2580帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或用户审美通过，这三项均未完成。来源截图与远程媒体像素不作为包内素材分发。

分类状态保持157 queued / 2 observed / 0 implemented，另139类目录与全站逐作品重建继续保留。见 [便携观察与最终验证](../assets/studio/observations/batch21.json)、[累计验证说明](../verification.md)。
