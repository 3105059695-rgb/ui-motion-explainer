# 第十七批：完整界面上下文与连续搜索

2026-10-01；1920×1080横屏。新增8个可编辑预设，当前库80项。这八件来源均为静态图；保留图中主要界面区域，所有光标、输入、选中和状态间衔接都是原创编排。

| 来源 | 已观察静态区域 | 预设 | 基准时长 |
|---|---|---|---:|
| [Shobhit / @nullbytes00](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1904×1222单张设计 | `interaction-supercmd-memory-preview` | 18秒 |
| [Emir Ayaz / @emirayaaz](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 4096×3057单张设计 | `interaction-file-library-search-open` | 22秒 |
| [Emir Ayaz / @emirayaaz](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2960×2672单张设计 | `interaction-snippet-search-refine` | 20秒 |
| [Alvish Baldha / @alvishbaldha](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 4096×2913单张设计 | `interaction-crm-command-preview` | 18秒 |
| [Hugeicons / @huge_icons](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2289×2397单张设计 | `interaction-solid-command-draft` | 20秒 |
| [Jordan Hughes / @jordanphughes](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 3840×2880单张设计 | `interaction-designer-directory-recovery` | 20秒 |
| [Kevin / @kvnkld](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2400×1800单张设计 | `interaction-workflow-context-agent` | 26秒 |
| [Oguz Yagiz Kara / @oguzyagizkara](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 4096×2486单张设计 | `interaction-command-contact-folder-states` | 34秒 |

## 用于口播的动作选择

- 系统命令入口：Selected Text与Recent命令持续存在，聚焦选中文字后查看本地预览，再回到列表；不能凭示意画面证明系统记忆保存。
- 文件搜索：全应用版本保留侧栏、文件网格和筛选工具，局部版本聚焦四项文档片段。检索、候选移动与阅读发生在同一个窗口。
- CRM命令：左导航、中央项目文档、右公司详情持续存在，命令面板悬浮其上，按内容聚焦，不用大遮罩覆盖所有上下文。
- 深色搜索：保留AI入口、最近搜索与快捷操作，输入和选中之后再展开原创预览；原图裁切部分不补造原作细节。
- 目录空态：最近人员与分类筛选先建立，再输入未收录姓名、出现空态、Clear恢复；适合讲搜索和纠错，不把无结果改成成功。
- 工具菜单：保留白色图标栏与双列应用/工具列表；连接节点和代理配置属于原创扩展，不是静态来源里已发生的工作流。
- 联系人与文件夹：把已存搜索、联系人详情、@建议、文件夹详情四个源静态状态连接成同窗连续过程；Ask AI仅保留入口，不声称真实回答。

## SuperCmd · 选中文本与本地命令预览

实际保留的界面区域：

- Dark gray single command window with Search apps and settings placeholder.
- SELECTED TEXT heading and highlighted Add This to Memory / System row.
- RECENT eight rows: Search Issues/Jira, SuperCmd Extensions/System, Format Clipboard JSON/Json Format, Clipboard History/System, Search for GIFs/Gif Search, Search SVG Logos/Svgl, Search Emoji/Emoji, Create Snippet/System.
- Right slim scroll thumb; bottom selected command label, Open Command Enter and Actions Cmd K hints.

默认参数：`{'title': 'SuperCmd', 'prompt': '把软件操作做成连续画面', 'result': '同一对象，输入后再显示反馈。'}`。长度限制：`{'title': 20, 'prompt': 40, 'result': 64}`。

实现差异与可编辑范围：

- Independent vectors and Chinese controls; wide1920x1080 arrangement retaining all command regions.
- All cursor, typing, row selection, command preview, return and filtered search operations are original; reference contains only one still state.
- Added selected-text preview/content editor and local-preview controls; no actual system memory save or command execution.

## 资料库 · 全局搜索转入文档阅读

实际保留的界面区域：

- Whole dark application with compact left rail; Home, Knowledge, Analysis plus bottom Discord, Docs, Settings.
- Top search in gold-data, avatar; gold-data folder heading with Sort, Filter, Add files toolbar.
- Six-column multirow file grid with repeated truncated gold-etfs-holdings-and-flows filenames.
- Dimmed library behind centered search popup querying nvidia. Files group has four rows with document icons, filename and two-line snippet. First nvidia-gcp.md selected; other nvidia names including a long Americas_Technology/Semiconductors title, nvidia-vera.md and nvidia-tsmc-usa-produced-blackwell.md.
- Footer arrow-key navigation, Return select, Esc exit hints.

默认参数：`{'title': 'gold-data', 'prompt': 'nvidia', 'result': '资料阅读笔记'}`。长度限制：`{'title': 20, 'prompt': 12, 'result': 56}`。

实现差异与可编辑范围：

- Horizontal1920x1080 full application recreation with same rail/topbar/toolbars/grid and modal regions.
- Reference is a still screenshot: opening overlay, query entry, selection, document reading and return are entirely original choreography.
- Content/snippets replaced with Chinese demo data; no financial recommendations or factual research results inferred from source.
- Grid filenames, icon shapes and profile silhouettes independently drawn.

## 局部搜索 · 摘录展开与查询细化

实际保留的界面区域：

- Standalone charcoal search palette on near-black canvas; query nvidia with magnifier.
- Files label, four tall result rows with muted olive document icons, filename plus two lines of excerpt.
- First nvidia-gcp.md highlighted; long Americas_Technology__Semiconductors__Initiate_on_Digital_S... second, nvidia-vera.md third, nvidia-tsmc-usa-produced-blackwell.md fourth.
- Footer ↑↓ to navigate, Return to select, Esc to exit. No application grid/side rail visible in this reference.

默认参数：`{'title': '搜索工作资料', 'prompt': 'nvidia', 'result': '阅读这份方案摘要'}`。长度限制：`{'title': 24, 'prompt': 12, 'result': 56}`。

实现差异与可编辑范围：

- Horizontal1920x1080 standalone search palette; no full application grid copied from the other source.
- All query entry/refinement, pointer/keyboard-style navigation, snippet expansion and return are original; source is one static result state.
- Chinese sample snippets and expanded reading body are independently written, no real product response or financial result.
- No source pixels; vector icons and typography recreated.

## CRM 命令栏 · 轻浮层与草稿预览

实际保留的界面区域：

- Light CRM with left favorites/sales/records sidebar, central project document/tasks/sketch/implementation notes, right company properties/deals/people/feedback.
- No heavy page overlay: the command surface is separated by shadow and depth, while the full three-column context remains visible.
- Create group: Create deal/person/company/feedback. General: View settings, dark theme and system theme; first Create deal row selected.
- Input at top, navigation/select/ESC footer; one static state, no observed animation.

默认参数：`{'title': 'Project brief', 'prompt': 'Northstar Studio', 'result': 'Design partner for the next release'}`。长度限制：`{'title': 24, 'prompt': 28, 'result': 62}`。

实现差异与可编辑范围：

- Independent SVG and monograms; original editable text with a 1920x1080 three-column arrangement.
- All command opening, arrow navigation, input filtering, local company draft preview, ESC return and clearing restoration are original animations.
- Preview remains a local draft; underlying company properties are never edited or submitted.

## Solid 命令栏 · 搜索与 AI 草稿

实际保留的界面区域：

- Dark search command surface: Search anything input and orange Ask AI to create content action.
- Recent Search has Marketing channel and Total engagement; Marketing channel is highlighted.
- Quick Actions has Search for posts, reels, stories / Add new post / Manage access.
- Footer has up/down navigate, return select and close hints; actual media cuts the right side of the command panel.

默认参数：`{'title': 'Solid Icons', 'prompt': 'Write a short launch post', 'result': 'Review the draft before sending'}`。长度限制：`{'title': 22, 'prompt': 42, 'result': 60}`。

实现差异与可编辑范围：

- Independent solid SVG icons in wide1920x1080 composition; source right crop is retained and hidden controls are not invented.
- All selecting, engagement/post filtering, local preview, AI prompt draft typing, ESC and clearing are original.
- AI draft is not sent; no content generation, publishing, permissions change or analytics data fetch is claimed.

## 设计师目录 · 空结果与清空恢复

实际保留的界面区域：

- One image shows two static instances of the same pale All designers directory.
- Upper instance has Elizabeth Mazen query, No designers found empty state, three circular avatars, create a profile link and Clear search button.
- Lower instance has empty query and seven chips: All, Product Design, Web Design, Illustration, Branding, Print, Other.
- Recently viewed has Sienna Hewitt, Ammar Foley and Olly Schroeder with rate/location/response metadata; second row selected and last row fades toward bottom.

默认参数：`{'title': 'All designers', 'prompt': 'Elizabeth Mazen', 'result': 'Sienna Hewitt'}`。长度限制：`{'title': 24, 'prompt': 28, 'result': 24}`。

实现差异与可编辑范围：

- Two source states become one continuous editable1920x1080 directory, with original monogram avatars instead of original people photos.
- All typing, local matching, clearing restoration, keyboard row selection, local profile preview, ESC return and location search are original.
- Queries match only the local three-person demo dataset; no external search, profile creation, contact, booking or payment occurs.

## 工作流菜单 · 添加并配置代理

实际保留的界面区域：

- 窄导航栏、搜索与快捷键、常用应用和热门工具两列，Slack静态选中。

默认参数：`{'title': '内容整理工作流', 'prompt': '归纳输入中的关键内容，按主题整理，保留来源。', 'result': '配置已应用 · 等待运行'}`。长度限制：`{'title': 20, 'prompt': 64, 'result': 24}`。

实现差异与可编辑范围：

- 2400×1800静态菜单适配为1920×1080独立代码场景，保留Search…、Most Used Apps、Popular及两列全部已读清的条目。
- 菜单中的应用图标用原创SVG重绘；原图手形指针改为通用箭头。
- 26秒时序、加号打开、Slack悬停、选择AI Agent与节点出现全部为原创演示。
- 工作流画布、输入节点、连线、代理配置抽屉、逐字指令和应用配置反馈均未见于来源；不是实际服务运行。

## Command + K · 四种内容状态

实际保留的界面区域：

- Intro搜索、混合结果左列、选中联系人右侧详情。
- @Oğ查询下Contacts和Folders分类建议。
- Work Inquiries选中与右侧Folders / Favorites详情。
- Saved searches/Recent与操作底栏。

默认参数：`{'title': 'Command + K · 联系人、文件夹与搜索', 'prompt': 'Intro', 'result': '当前搜索已加入演示列表'}`。长度限制：`{'title': 28, 'prompt': 12, 'result': 30}`。

实现差异与可编辑范围：

- 4096×2486单图的2×2四窗适配为1920×1080同一个持续窗口，四态按原创顺序连接。
- 34秒入场、逐字输入、点击选中、建议开合、文件夹选择与保存搜索动作均为原创演示；静态源没有可观察动效时序。
- 照片、联系人头像及应用图标用原创SVG代替；未下载或打包原图，也不在预设中嵌入原媒体。
- 部分截断的结果名称只保留已见前缀及省略号；联系人X账号未完整转录，代码显示通用Profile文字。
- title和result是窗口外的原创说明；prompt可替换第一、第三、第四态查询展示，来源结果标签仍保持观察值，不模拟真实检索。
- 为了阅读，联系人和文件夹详情扩为横屏右侧大面板，底栏保持Save search / Open / Filter，Saved searches态改为Add to folder。
- Ask AI仅保留按钮，没有触发、AI回答或实际服务执行。

## 实际验证

八项主入口五点前进/回拖、80%文字布局与SVG/文字裁剪夹具通过；主要稳定态、短中文/转义参数与末→0恢复另查。旧72项本轮未重跑。八段导出共178秒/5340帧，1920×1080、30fps、H.264、无音轨；完整解码和FFprobe通过。实际查看联系表及编码中间帧，未连续看完、未配本期口播、未获用户审美确认。

Command Bar当次已清点15媒体（6视频/9静态图）均有来源观察和机制代码映射，因此仅升级为observed；完整原作复制和implemented分类仍为0。全站其余范围继续保留。见 [逐媒体审计](../assets/studio/command-bar-audit.json)、[便携观察](../assets/studio/observations/batch17.json)、[验证记录](../verification.md)。
