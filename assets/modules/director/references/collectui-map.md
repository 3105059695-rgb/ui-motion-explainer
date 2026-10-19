# Collect UI 全站覆盖清单

更新日期：2026-10-01。机器可读登记表：[coverage.json](../assets/studio/coverage.json)。

## 目标与当前进度

用户目标是尽可能系统性覆盖 [Collect UI 全站](httpLOCAL_ASSET_NOT_DISTRIBUTED)，把参考作品中的软件结构、对象、交互阶段、状态反馈和动效逐项重建为可编辑代码，形成持续扩充的横屏 AI 视频特效库。可以分批交付，但不能以 18 个、几十个预设或几条样片代替全站目标。

本次依据浏览器实时 DOM 建档 **159个分类**，名称与链接各159个。当前71项不同深度作品观察、72项界面/机制适配、103个可运行代码预设。三十三类快照AI Flow、Loading Animation、Motion、UI Interaction、Command Bar、Sidebar、Product Tour、AI Agents、UI Tips、Dashboard、Menu、File Tree、Hover State、Orb、Tabs、Dropdown、Navigation、Mobile App、Code Editor、Mac App、Search、Notification、Accordion、Tooltip / Popover、Empty States、Notepad、Badge、Folder、Progress、Switch Button、Text Effect、Terminal Aesthetic、Progress Bar，共108个归档分页/列表、2158张卡、1676个不同完整媒体URL；482次重复、390组跨类媒体。另126类目录尚未清点。目录清点不等于观看或实现。**完整原作复制为0，全站完成比例未知。**

主代理观察到首页作品列表有 **141 页、每页约 24 项**。这是分页与列表密度的观察值，不是精确作品总数，不得将两者相乘后宣称“已清点全部作品”。

2026-09-30按 [逐媒体审计](../assets/studio/ai-flow-audit.json) 核对25个媒体组后，仅将AI Flow分类标为observed，范围限于上述两页快照；另158个分类保持queued，implemented分类仍为0。此状态表示已有具体观察依据，不表示完整原作重建完成。

目录依据：[实时分类页](httpLOCAL_ASSET_NOT_DISTRIBUTED)。独立 web 文本检查该页时只返回“Loading categories...”，因此本清单采用主代理提供的实时浏览器 DOM，不用搜索缓存中的旧目录补充。各分类作品计数尚未核实，统一保留为空；分类间是否包含重复作品也尚未清点。

## 状态与升级条件

| 状态 | 含义 | 升级依据 |
|---|---|---|
| queued | 已登记，待拆解 | 目录名称或卡片链接不等于观察过作品 |
| observed | 实际看过具体界面或交互 | 记录来源、观察深度、对象、已见状态和未确认部分 |
| implemented | 已完成对应的可编辑代码预设 | 提供预设 ID、实现文件、可播放预览以及实际执行的验证记录 |

分类状态采用保守口径：只有完成该分类当次已核实作品清单，才可标为 implemented；不能因同类中完成一个按钮，就把整个 Button 分类标为已完成。观察到一个独立作品时，先更新作品记录；未核实它在站内属于哪些分类时，不凭题材填入分类关系。

“下载原视频”“贴截图后缩放”“只换色或换字”不能算完成复刻。实现应可编辑、可定位时间，至少明确记录初始状态、触发动作、过渡过程和结果状态。参考原片只保留来源链接，不下载或嵌入原片充当本库预览。

## 已观察作品

逐项来源、观察范围、待补细节和代码映射以 [作品记录页](../assets/studio/coverage.html) 及 [coverage.json](../assets/studio/coverage.json) 为准。

| 作品 | 观察深度 | 已验证机制适配 |
|---|---|---|
| [滑动转账确认](httpLOCAL_ASSET_NOT_DISTRIBUTED) | interaction-observed | `interaction-slider-confirm`、`interaction-transfer-confirm` |
| [AI agents 软件界面](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `software-agent-hub`、`software-agent-workflow-inspect`（局部片段） |
| [四个彩色文件夹与浮动文件](httpLOCAL_ASSET_NOT_DISTRIBUTED) | homepage-preview-only | 暂无 |
| [AI Image Loader](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-orb-image-reveal` |
| [Tech Text](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `result-tech-text-inspect` |
| [Agent Dynamic Island](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ambient-agent-island` |
| [Replace Workflow Nodes](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `interaction-workflow-replace`（原创交互） |
| [Workflow Node Configuration](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `interaction-node-config`（原创交互） |
| [Workflow Builder](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `opening-workflow-canvas`（原创纵深入场） |
| [AI 产品 UI kit](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-handoff-copy-component`（局部片段） |
| [Workflow automation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `software-workflow-automation`（原创操作） |
| [Agentic reasoning](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `ai-reasoning-glass-panel`（原创素材与动画） |
| [Workflow builder concept](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `interaction-flow-deck-insert`（原创插入演示） |
| [Invoice processing](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `interaction-invoice-node-focus`（原创选择和推近） |
| [Scenes composer](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `interaction-scenes-composer`（原创素材与输入） |
| [Condition branches](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `software-branch-workflow`（原创配置与路径聚焦） |
| [Logistics route map](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `software-logistics-route-map`（原创运行点与数值强调） |
| [Command Block](httpLOCAL_ASSET_NOT_DISTRIBUTED) | static-image-observed | `ai-command-block-link`（原创确认与柔性光流） |
| [Signal audiovisual studio](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `software-signal-node-patch`（节点连接片段） |
| [Coding Agent progress](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-coding-agent-progress`（六阶段组件） |
| [Context clear](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `interaction-context-clear` |
| [Self-correcting agent](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-runtime-self-correct` |
| [DNS tables](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `interaction-dns-scroll-explain` |
| [Context branching chat canvas](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `interaction-chat-canvas-branch`（20秒中文分支与搜索） |
| [Workflow thinking and configuration gate](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-workflow-configuration-gate`（18秒构建与待配置） |
| [Nested steps](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `interaction-nested-step-toggle`（14秒横屏折叠重排） |
| [Add job hub](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `interaction-add-job-hub-hover`（9秒面板与端口收拢） |
| [Cloud topology health](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ambient-cloud-topology-health`（8秒持续异常与局部反馈） |
| [Product ad assets workflow](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-product-ad-assets-pipeline`（36秒六图两视频；最终验证见记录） |
| [Krea Nodes](httpLOCAL_ASSET_NOT_DISTRIBUTED) | multiple-video-times-observed | `ai-image-model-video-nodes`（29秒图像、三维与三路视频；最终验证见记录） |

最新四项见 [第十二批记录](collectui-batch-12.md)；其统一诊断与导出检查以 [验证记录](../verification.md) 为准。此前三项见 [第十一批记录](collectui-batch-11.md)，此前见 [第十批记录](collectui-batch-10.md) 和 [第九批记录](collectui-batch-09.md)。

此前两项见 [第八批记录](collectui-batch-08.md)；此前四项见 [第七批记录](collectui-batch-07.md)；此前四项见 [第六批记录](collectui-batch-06.md)；三种工作界面见 [第五批记录](collectui-batch-05.md)；此前AI Flow观察及差异见 [第四批记录](collectui-batch-04.md)，逐卡清单见 [作品清点](work-inventory.md)。

本批文字与状态岛依据见 [第三批观察](collectui-batch-03.md)。Kopp 导航原片本次未取得可见帧，继续排队，不能据标题推断交互。各项机制适配不等于完整原作品复刻。

## 全量分类登记

以下 159 个名称与链接来自本次实际读取的浏览器 DOM，保留原名称。全部处于 queued；这表示后续扩充队列已建立，不表示这些分类没有作品。计数“未核实”不能解读为零。

| 序号 | 分类与来源 | 站内显示作品数 | 状态 | 已验证预设 |
|---|---|---|---|---|
| 1 | [UI Interaction](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 2 | [Landing Page](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 3 | [Framer](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 4 | [Button](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 5 | [Navigation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 6 | [Hero Section](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 7 | [CTA](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 8 | [Footer](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 9 | [Claude](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 10 | [Sign Up](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 11 | [Dashboard](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 12 | [Todo List](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 13 | [Checkout](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 14 | [404 Page](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 15 | [Onboarding](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 16 | [Pop Up](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 17 | [Settings Page](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 18 | [User Profile](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 19 | [Features](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 20 | [Pricing](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 21 | [Hover State](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 22 | [Newsfeed](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 23 | [Inbox](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 24 | [Contact List](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 25 | [Mockup](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 26 | [Redesign](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 27 | [UI Kit](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 28 | [Email Application](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 29 | [Illustration](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 30 | [Style Guide](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 31 | [Brutal Design](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 32 | [Admin Panel](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 33 | [E-Wallet](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 34 | [Collect UI Curation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 35 | [Funny Animation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 36 | [Project Management](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 37 | [Character Animation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 38 | [Stamp](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 39 | [Code Editor](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 40 | [About Us](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 41 | [Reminder / Alarm](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 42 | [E-Commerce](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 43 | [Gallery](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 44 | [App Screens](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 45 | [Portfolio](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 46 | [Email Design](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 47 | [Error State](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 48 | [Scroll Transition](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 49 | [Comments](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 50 | [Book Cover](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 51 | [Business Card](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 52 | [Documentation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 53 | [Infographic](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 54 | [Statistics](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 55 | [Menu](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 56 | [Captcha](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 57 | [Orb](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 58 | [Icons](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 59 | [Tabs](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 60 | [Invoice](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 61 | [Grid](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 62 | [Testimonials](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 63 | [App Icon](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 64 | [Loading](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 65 | [Sidebar](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 66 | [Liquid Glass](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 67 | [Motion](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 68 | [CSS](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 69 | [AI Flow](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 70 | [Card](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 71 | [Dark Mode](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 72 | [Modal](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 73 | [Scroll Animation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 74 | [Webflow](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 75 | [3D](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 76 | [Notification](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 77 | [Bento](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 78 | [Landing Section](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 79 | [Mobile App](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 80 | [Chat Layout](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 81 | [Calendar](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 82 | [Text Effect](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 83 | [Responsive](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 84 | [Color Palette](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 85 | [Dropdown](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 86 | [Tags](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 87 | [Loading Animation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 88 | [Switch Button](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 89 | [Image Slider](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 90 | [Subscribe](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 91 | [Widget](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 92 | [Mac App](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 93 | [FAQ](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 94 | [Search](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 95 | [Social Media](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 96 | [Shader](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 97 | [File Tree](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 98 | [Terminal Aesthetic](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 99 | [File Upload](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 100 | [Invite](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 101 | [Tooltip / Popover](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 102 | [WebGL](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 103 | [AI](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 104 | [Notepad](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 105 | [Accordion](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 106 | [Folder](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 107 | [Badge](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 108 | [Command Bar](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 109 | [Progress](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 110 | [Pattern](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 111 | [Blog](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 112 | [Table](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 113 | [Dynamic Island](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 114 | [Music Player](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 115 | [Single Product](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 116 | [Direct Messaging](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 117 | [Countdown Timer](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 118 | [Analytics Chart](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 119 | [Map](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 120 | [Workout Tracker](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 121 | [Info Card](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 122 | [Coming Soon](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 123 | [Job Listing](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 124 | [Header Navigation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 125 | [Background Pattern](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 126 | [Flight Search](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 127 | [Event Listing](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 128 | [Schedule](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 129 | [Notes Widget](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 130 | [Date Picker](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 131 | [Form](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 132 | [Progress Bar](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 133 | [Pagination](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 134 | [Product Tour](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 135 | [Mobile Menu](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 136 | [Avatar](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 137 | [Itinerary](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 138 | [Status Update](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 139 | [Splash Screen](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 140 | [Text Editor](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 141 | [List Items](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 142 | [Web Animation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 143 | [AI Agents](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 144 | [Creative Tools](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 145 | [Color Picker](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 146 | [Poster](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 147 | [Crypto](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 148 | [Typography](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 149 | [Logo](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 150 | [Range Slider](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 151 | [OTP Code](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 152 | [Liquid Metal](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 153 | [Activity Feed](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 154 | [UI Tips](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 155 | [Animation](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 156 | [Empty States](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 157 | [Wireframe](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 158 | [Branding](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |
| 159 | [Filter Products](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 未核实 | queued | — |

## 持续扩充流程

1. 按分类打开实际作品与分页，登记作品来源、作者、站内分类和观察日期。使用作品来源 URL 去重，同一作品归入多类时保留关联，不重复计算实现数量。
2. 观察完整片段，记录界面结构、连续对象、动作前后状态、主视觉重点、镜头路线、阅读停留和未确认部分。无法播放的条目继续 queued；只看到缩略图的条目注明观察深度。
3. 针对原作品编写可编辑预设，并为输入文本、强调色、节奏和布局留参数。持续对象和状态反馈必须保留；不能以切换独立卡片替代原有交互。
4. 将预设用于 1920×1080 横屏样例。根据实际交互验证正向播放、任意时间定位、中间帧、首尾帧、中文显示、裁切和可读性；报告只写实际执行结果。
5. 补齐 presetIds、实现文件、预览路径与验证记录后，才把作品升级 implemented。分类按已核实作品清单统计；全站作品清点未完成前不发布全站百分比。
6. 每次扩充都同步本文件与 coverage.json；保留已有记录，新增来源失效或网站更新说明。优先处理 AI 软件操作相关类别，再继续其余类别；优先顺序不改变全站覆盖目标。

建议先进入 UI Interaction、AI Agents、AI Flow、Chat Layout、Command Bar、Code Editor、Terminal Aesthetic、File Tree、Folder、Progress、Loading Animation、Text Effect、Motion 与 Scroll Transition 等类别，以服务 Codex、豆包、WorkBuddy 的操作片段。这里只指定调度顺序，所有其他分类仍在完整队列中。

## 记录约定

- 每项作品必须保留独立 ID、实际来源 URL、观察深度、已见内容与未确认部分；有作者信息才填写作者。
- 单类 displayedCount 未经当前页面核实就保留 null；即使取得单类计数，也不能未经去重直接相加作为唯一作品总数。
- 原创预设与参考作品映射分开记录；预设数量不等于已复刻作品数量。
- 网站页面变化时更新日期和依据，保留旧来源及已有实现记录，避免覆盖历史证据。
- 分类与作品状态须由证据升级；尚未观察、实现或验证的内容保持 queued 或 observed。


新增 [第九批记录](collectui-batch-09.md)：Sayan清空上下文，`interaction-context-clear`。v0.8交付时按用户要求暂停；2026-09-30用户已恢复扩充，全站仍未完成。

2026-09-30继续扩充：[第十批记录](collectui-batch-10.md)，加入运行时自纠错与DNS滚动图解。


## 2026-09-30 第十三批分类目录

[第十三批记录](collectui-batch-13.md) 整理三个新分类与多分类分页查看器。分类索引见 [inventory-catalog.json](../assets/studio/inventory-catalog.json)，跨分类完整URL分组见 [inventory-summary.json](../assets/studio/inventory-summary.json)。UI Interaction 30页706卡/703媒体、Motion 13页296卡/296媒体、Loading Animation 4页93卡/93媒体均为目录快照；分类状态仍queued，未增加观察或代码实现数。


2026-09-30补充Command Bar当前可见单页15卡，6视频扩展/9图片扩展，全部仅登记卡片元数据；页面没有分页控件，activePage保持null。包内 [单页目录](../assets/studio/inventories/command-bar-20260930.json) 与 [分类索引](../assets/studio/inventory-catalog.json) 已更新，不升级作品观察或分类状态。


第十四批补充三件动态观察和三项代码适配，见 [机制记录](collectui-batch-14.md)。新加载/玻璃/语音各保留主要完整链，仍为独立横屏近似重建，0项完整原作复制。分类状态158queued/1observed保持。

第十五批新增四件动态观察、四项主要链重建，现37/38/69，完整原作复制0；见 [第十五批机制](collectui-batch-15.md)。

第十六批两个动态源与一张静态源分别记录；静态图的参数菜单和联动是原创。当前40/41/72，完整原作复制0；见 [第十六批机制](collectui-batch-16.md) 和 [Sidebar目录](sidebar-inventory.md)。

2026-10-01按 [Command Bar逐媒体审计](../assets/studio/command-bar-audit.json)，当次15媒体快照均有具体观察（6视频/9静态图）和15项机制适配。分类仅升级observed，当前157queued/2observed/0implemented；八件新增静态源的操作为原创，不能算源动作观察。见 [第十七批](collectui-batch-17.md)。

第十八批Sidebar三件动态源与两类新目录见 [第十八批](collectui-batch-18.md)。双栏拖拽参考按实际机制重建，不把分类名当成软件结构。Sidebar/Product Tour/AI Agents未整类完成。

第十九批三件Sidebar动态源及UI Tips/Dashboard目录见 [第十九批](collectui-batch-19.md)。按实际来源保留主要区域与完整可见机制；分类未整类完成。

第二十批三件实际动态源及Menu/File Tree/Hover State/Orb目录见 [第二十批](collectui-batch-20.md)。保留来源完整主要区域，源机制、原创适配与未知分别记录；没有整类实现或全站完成声明。

第二十一批三件动态源与六类目录见 [第二十一批](collectui-batch-21.md)。实际主要区域、源机制、原创差异和未知分别记录，无整类实现或全站完成声明。

第二十二批三件视频源与两类目录见 [第二十二批](collectui-batch-22.md)。实际主要区域、源机制、原创差异和未知分别记录，无整类实现或全站完成声明。

第二十三批四件视频源与六类目录见 [第二十三批](collectui-batch-23.md)。实际主要区域、源机制、原创差异和未知分别记录，无整类实现或全站完成声明。

第二十四批四件视频源与五类目录见 [第二十四批](collectui-batch-24.md)。实际主要区域、源机制、原创差异和未知分别记录，无整类实现或全站完成声明。
