# 从口播到连续演示

先按原话写节奏表：`start / end / 原话 / objectId / 前状态 / 触发 / 后状态 / preset / hold`。有音频时使用已有字幕、转写或人工核对的落点；只有文稿时标明时间估计并在拿到声音后对齐。

| 口播语义 | 画面决策 |
|---|---|
| “只要一句话” | 输入框或命令启动；重点是指令进入系统 |
| “把这些资料整理起来” | 文件选择→同一文件进入任务→整理结果；保持来源身份 |
| “它会自己分步骤完成” | 任务计划逐个推进，已完成步骤留下状态 |
| “找到这条记录” | 输入查询→列表过滤重排→命中行展开 |
| “在这里改一下” | 光标定位→选择字段→替换文字→反馈 |
| “看最后的结果” | 从实际成果区域推近→展开→阅读停留 |
| “换一个工具接着做” | 同一成果跨窗口交接，保留名称和内容 |

以下预设适合有明确操作或过程含义的口播：

| 预设 | 适用语义 | 连续状态变化与参考边界 | 不适用条件 |
|---|---|---|---|
| `software-workflow-automation` | “用一句话描述获客流程”“运行后先检查缺了什么” | 静态 UI 参考，动画原创：同一工作流窗口入场→输入要求→点击 Run→连线检查→停在 `Missing Information`，保留问题位置供阅读 | 口播宣称已抓取线索、已发送或写入 CRM；当前画面只证明演示中的检查状态 |
| `ai-reasoning-glass-panel` | “先确定画面主体，再安排视觉布局”“查看生成过程中的思路” | 静态 UI 参考，动画原创：素材画布→点击 Agentic→同一玻璃面板滑起→注意力由 Content Hierarchy 转到 Visual Layout→保持 `In progress`；背景素材为原创 SVG | 要展示最终成片、生成成功或真实模型内部推理；没有看到的后续步骤不补造 |
| `interaction-flow-deck-insert` | “把演示文档接进对话流程”“在触发与提问之间加一步” | 静态 UI 参考，动画原创：定位 Add Deck→拖动同一对象到连接线→下方节点让位、连线分接→展开 Sales Playbook→停留阅读 | 要证明工作流已执行、真实 HubSpot 操作或 CRM 同步完成；插入配置不代表外部任务成功 |
| `ai-handoff-copy-component` | “超过限额就交给人”“复制这个组件的安装脚本” | 视频片段重建，目录定位与镜头节奏原创：定位 Handoff→同一文档窗和接管卡片连续推近→点击 Copy install script→浮动条变为 Copied 提示→停留阅读 | 要宣称已接管、提高限额或完成退款；复制仅为界面反馈，未调用真实剪贴板 |
| `software-agent-workflow-inspect` | “看看失败卡在哪一步”“打开 Slack 节点检查配置” | 视频片段重建，光标路线与节奏原创：同一失败工作流扩大画布→定位 Slack 节点→原位展开配置抽屉；失败节点持续保留 | 要展示错误已修复、已连上 Drive、已选择新频道或已发送消息 |
| `interaction-invoice-node-focus` | “发票处理分成哪几步”“重点看提取信息这个节点” | 静态 UI 参考，动画原创：同一四节点草稿→选择提取节点→局部推近→回到全局，始终保留 Draft 状态 | 要展示实际提取数据、创建 CRM 记录或发送通知；节点名称只说明计划步骤 |
| `interaction-scenes-composer` | “把这三张素材组合起来”“先把片段和转场要求写清楚” | 静态 UI 参考，动画原创：同一输入窗保留三张素材→选择 Video→逐字输入→悬停发送入口，停在待发送；缩略图为原创 SVG | 要展示已发送、生成进度或完成的视频；参考未包含发送后状态 |
| `opening-workflow-canvas` | “先从触发条件看起”“把流程的入口展开给你看” | 依据 Kevin 的 PayPal 局部窗口：同一工作流画布纵深入场→聚焦 Trigger→停留阅读；入场与聚焦为原创编排 | 要展示完整 PayPal 流程或支付成功；不补写参考中不可见的节点 |
| `software-branch-workflow` | “先检查触发器怎么配置”“满足条件走这边，否则走另一边” | 依据 Marcel 的参考布局：同一工作流中点击 Trigger 打开配置→依次聚焦 true / false 支路；操作节奏原创，始终保留 Draft | 要证明某条支路已执行、流程已发布或业务已完成；聚焦支路不等于实际运行 |
| `software-logistics-route-map` | “沿主枢纽到门店看这条路线”“这里显示的是 85u/hr” | 依据 Tuki 的路线地图：聚焦 Main Hub→沿既有路径转向 Shop A→仅强调一次 85u/hr→稳定阅读；镜头与强调为原创，不改变节点、路径或数值 | 要表现新增路线、运力提升、实时调度或货物已送达；既有数值不能演成优化成果 |
| `ai-command-block-link` | “这条规则只在特定时段生效”“看看条件与后续步骤怎样连接” | 静态 UI 参考，动画原创：同一指令块定位 between→确认时间胶囊→单束光沿既有光纤通过→恢复稳定连接；保留 9 PM / 6 AM 和右侧可见片段 | 要证明灯具或设备已执行、时间值已修改，或补全右侧未见逻辑；光流只演示连接关系 |
| `ai-coding-agent-progress` | “它先读文件、查资料，再编写和检查”“让执行过程逐项可见” | 同一五项清单持续存在，读取→搜索→思考→编写→检查→完成；下方细节、颜色和工具入口随阶段更新 | 需要展示当前真实任务的费用、模型调用或编码成果；模板数据只能作为演示，需按本期真实过程改写 |
| `software-signal-node-patch` | “把这个效果输出接到场景输入”“接通之后，看看预览怎么变” | 参数启用→虚线跟随拖动→端口吸附→实线确认→检查面板和预览更新；保持同一节点画布 | 要证明音频实时分析、MIDI控制或完整音画产品可运行；本预设只有确定性界面动画 |
| `interaction-chat-canvas-branch` | “从这句话接着问”“把两个问题分开比较，再回到原文” | 同一暗色画布输入→回答→选中原文→保留引用的两条连接分支→展开来源→搜索回源；20秒中文、光标与镜头节奏独立编排 | 要证明真实模型调用、网络搜索、注册，或只是无上下文地排列卡片；换题材时要同步改源码中的子问题、回答和选区关键词 |
| `ai-workflow-configuration-gate` | “先把需求拆成步骤”“流程搭好了，还要连接账户和补参数” | 初始已填需求发送→确认→思考收合→五步构建及节点细节→设置说明→同列滚到14项待配置；18秒横屏，账户0/6、配置0/8始终保留 | 口播宣称已启用、已接通账户、已自动处理消息；初始需求打字也不是此参考中已观察的动作 |
| `interaction-nested-step-toggle` | “先收起细节看全局”“展开这一步，里面还有两个任务” | 选中的两步子流程重复收起与展开；端口、侧支、末端任务和连线连续重排，Enter反馈对应开合，尾部取消选中；14秒横屏 | 要证明API调用、审批或写入已执行，或要改为三个以上嵌套步骤；当前固定两步结构，改数量需同步修改源码 |
| `interaction-add-job-hub-hover` | “需要时展开任务入口”“移开光标，画布只保留连接” | 同一六任务面板收成五点枢纽，四端口和线端点持续跟随；光标返回等待后再展开；9秒横屏 | 要展示点击任务、输入、录音或节点执行；参考只含完整悬停开合，prompt是占位文字 |
| `ambient-cloud-topology-health` | “从全局看各区域状态”“这一个实例仍需要关注” | 三地区七副本持续存在；正常到异常悬停、虚线流动、告警横向裁剪和局部指标滑回；8秒，异常始终保留 | 要宣称实时监控、部署完成或故障已修复；部分底部指标为明确示例值，不是实测数据 |
| `ai-product-ad-assets-pipeline` | “同一份产品输入，接出一套素材”“先看生成依赖，再看六图两视频” | 预填输入→Vision→三路创意拼接→合并→六图→两视频→八项Response→连续结果展示；36秒，运行按下反馈原创，素材全为独立SVG | 要证明真实生成、上传、导出或付费调用；改产品需同时改SVG、识别说明和分支，不能只换标题 |
| `ai-image-model-video-nodes` | “同一张图换视角，再接三维”“用同一个起始画面，试三个视频方向” | Image→LLM→Nano原位视角变化→三维几何旋转→拖选并行三视频→节点内运动→尾页；29秒，按下反馈原创 | 要证明调用Krea、生成真实照片/视频或完整产品可运行；三维输出保持未连接，视频是程序动画 |

这些演示不构成真实运行证据。没有日志或实际成果支撑时，不把配置、检查或处理中改成抓取成功、CRM 写入完成或已生成交付。

开场强冲击是角色，不是固定秒数。先根据本期内容决定核心事件；例如资料压缩进一个任务、命令输入后空间展开、结果反推回操作起点。正文遵循真实软件流程，不为凑效果插入无关球体、图表或卡片。

每次复用库中的预设，都检查实际口播重音是否落在对应动作上。降低速度不是补充叙事；长解释需增加阅读、局部定位或状态细节，而非无限拖慢入场。

字幕保留口播信息，画面展示操作与结果，两者不必逐字重复。同一时刻控制一个视觉焦点。配音优先于配乐；本库不绑定人物、音色、BGM，也不生成未经授权的声音。

清空旧上下文、重新开始：用 `interaction-context-clear`，输入命令 → 同一窗口内逐层卷走 → 新会话停留。不是每次切场都使用；仅匹配真实语义。

- 工具遇到异常后恢复：选 `ai-runtime-self-correct`，同一节点失败 → 原位展开持久执行 → 线路恢复 → 沙箱进入。保留未执行工具，不自动给全流程打勾。
- 文章讲解分组与指向关系：选 `interaction-dns-scroll-explain`，文章滚动时表格驻留，进入对应段落再让位并接线。新内容可改为AI路由说明，但这属于原创改编。


## 新增三种过程语义

- `loading-sidebar-dot-morph`：匹配“正在处理/加载”的停留，两条任务与选中行持续存在，6点按列、弯折、环形、簇状变化。title/prompt/result分别是文件夹、上任务、选中任务标签；result不代表成功，没有鼠标或完成勾。需要完成反馈时按本期真实证据另接结果场景。
- `interaction-liquid-glass-control-suite`：完整八组36秒，用于展示控件响应与玻璃质感；buttons 0–4、player 4–8.6、lens 8.6–14、controls 14–19、navigation 19–23、chart 23–27.4、search 27.4–31.8、notifications 31.8–36。可在导出时用`--start`/`--end`取一组，仍检查前后衔接；没有`params.section`快捷参数。光标是原创编排，数据和通知为示例；音乐/设置/搜索未实际执行。
- `ai-voice-recipe-preferences`：完整九轮70秒，手机持续转写，右侧偏好记录按关键词填入并勾选，末段家庭面板打开再收回，下一步停在未点击。适合说明“说出习惯，系统逐项记录”；不调用录音或ASR。改题材时同步改`params.rounds[0..8]`的question/hint/answer/facts；facts=[回答内短语,记录值]，缺少真实词语不提取。改家庭回答后人数默认未知，明确设置`params.household`后才显示人数。普通标题/指令/结果替换只改标题、引导和核对提示。


## 命令与输入的连续过程

- `interaction-module-preview-search`：适合“选分类先看结果，再搜索定位”。20秒，0–4目录、4–11财务预览、11–20搜索。title改标题，prompt在六条本地示例中真正过滤，result是发票标题。超出示例集合不补造业务结果，末段搜索未选择。
- `interaction-command-search-assistant`：适合“同一入口，从检索切入助手”。18秒保留c/cust、hel、可改prompt搜索、空结果、加载、回答与继续追问。result是演示回答。源没有鼠标，本模块没有新增鼠标，不能称真实AI调用。
- `interaction-prompt-design-token-autocomplete`：适合解释“输入文字如何成为结构化设计令牌”。16秒保留blue-400与bg-tertiary两轮，prompt是正文前缀，result是末态说明。最后发送未触发；需要生成结果时必须另有本期结果依据。
- `interaction-command-scroll-filter`：适合展示“搜索栏固定，文档列表滚动，选中项联动命令”。22秒包含推近/回退、四次悬停、拖滚动条、c→comm及缩高。title改文档，prompt改查询，result改目标行标签；组合标签超过28码点报错。底部命令仅显示，未复制/执行/跳转。

时间是模板基准，剪本期口播时按真实音频调节输入、反馈与阅读停留，不能把这四段按固定长度直接拼作整条口播。


## 参数与命令的连续讲解

- `interaction-camera-strip-dual-theme`：相机参数条 · 亮暗联动演示，12秒机制基准；参数和可观察范围见 [第十六批说明](collectui-batch-16.md)。
- `interaction-hr-command-multigroup-search`：HR Command · 四组筛选与清空，28秒机制基准；参数和可观察范围见 [第十六批说明](collectui-batch-16.md)。
- `interaction-command-task-config-theme`：任务命令栏 · 搜索、配置与主题，40秒机制基准；参数和可观察范围见 [第十六批说明](collectui-batch-16.md)。

保留同一个界面外壳和对象，按口播安排检索、选择、反馈和结果阅读。源停在清空列表、既有失败检查或静态参数时，不能为了收尾改成缺乏依据的业务成功。正式生成视频前重新映射本期文稿与实际素材，不直接串联固定模板时长。


## 同一软件中的搜索、空态和预览

按本期口播安排输入、筛选、选中、阅读、关闭或清空恢复。保持完整应用上下文；开场和结果可各集中强调一次，正文按可看清操作的速度。不要把静态参考已有的按钮当作真实AI执行证明。

- `interaction-supercmd-memory-preview`：SuperCmd · 选中文本与本地命令预览；18秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-file-library-search-open`：资料库 · 全局搜索转入文档阅读；22秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-snippet-search-refine`：局部搜索 · 摘录展开与查询细化；20秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-crm-command-preview`：CRM 命令栏 · 轻浮层与草稿预览；18秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-solid-command-draft`：Solid 命令栏 · 搜索与 AI 草稿；20秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-designer-directory-recovery`：设计师目录 · 空结果与清空恢复；20秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-workflow-context-agent`：工作流菜单 · 添加并配置代理；26秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。
- `interaction-command-contact-folder-states`：Command + K · 四种内容状态；34秒只是机制基准，参数与差异见 [第十七批](collectui-batch-17.md)。


## 产品结构与分栏操作

按口播呈现真实界面机制：收藏布局切换与工具窗口、同一AI工作区中的选择和反馈、拖动分栏后的宽度与内容联动。保持原作主要区域，停稳后再阅读；不要把它们简化为卡片轮换。

- `interaction-folio-library-product-tour`：Folio · 收藏与笔记工作台完整巡游；参数与差异见 [第十八批](collectui-batch-18.md)。
- `interaction-sidebar-chat-grouping`：Cursor 侧栏 · 四种聊天分组；参数与差异见 [第十八批](collectui-batch-18.md)。
- `interaction-draggable-split-snap`：分栏拖动 · 三个吸附点与自由比例；参数与差异见 [第十八批](collectui-batch-18.md)。


## 导航滚动、原型操作与侧栏拖动

根据口播串起指针移动、滚动、悬停、拖动及界面响应；完整原型巡览保留每段主要区域。编辑参数后重排阅读时间，不以简单卡片替换连续操作。

- `interaction-sidebar-colored-anchor-trail`：长侧边栏 · 彩色锚点与滚动渐隐；参数语义、差异和未知见 [第十九批](collectui-batch-19.md)。
- `interaction-lab01-prototype-tour`：Lab01 · 十二段交互原型连续巡览；参数语义、差异和未知见 [第十九批](collectui-batch-19.md)。
- `interaction-finance-sidebar-resize`：财务侧栏 · 拖动收起与展开；参数语义、差异和未知见 [第十九批](collectui-batch-19.md)。


## 悬停标签、嵌套切换与动态光球

按本期口播串起指针进入、标签展开、选中保留、子项切换与收起；光球用于对应的加载或氛围语义。保留来源主要界面区域。以下参数仅替换所列文字，未知业务行为不会因换名成为真实执行。

### 图标侧栏 · 悬停展开与选中保留

`interaction-sidebar-hover-expand-select`：32秒基准；[实际样片](../assets/previews/icon-sidebar-hover.mp4)。

- `title`：Home navigation label, initially and finally selected；最多20字符。
- `prompt`：Campaigns navigation label, hovered and selected twice；最多24字符。
- `result`：Chats navigation label, hovered and selected once；最多20字符。

来源未确认：

- No business page content, navigation destinations, account context, backend calls, search input or service results appear in source
- Exact implementation framework, icon library, source easing and event logic are unknown
- Exact click instants between sampled source frames are not claimed; source samples establish visible hover/selected states

### 嵌套侧栏 · 子项切换与折叠

`interaction-nested-activity-sidebar`：28秒基准；[实际样片](../assets/previews/nested-activity-sidebar.mp4)。

- `title`：Accordion group label；最多24字符。
- `prompt`：First child label；最多24字符。
- `result`：Third child label；最多24字符。

来源未确认：

- Actual application, source implementation, event logs, exact easing and connector fade algorithm are not verified.
- Grey placeholder areas' real loading or content purpose is unknown; no activity data or file results were shown.
- Plus action, Agents, Team, Settings and search behavior were not exercised in the source observations.
- Source audio content and sound timing are unverified.
- Only one child depth was observed. File Tree is a category label and does not establish deeper folders or file-opening behavior.

### 双图像加载 · 点阵与粒子球揭示

`interaction-dual-image-loader-orb-reveal`：9秒基准；[实际样片](../assets/previews/dual-image-loader-orb.mp4)。

- `title`：Initial left dot-loader status caption；最多32字符。
- `prompt`：Initial right particle-sphere status caption；最多32字符。
- `result`：Second right loading status caption, shown after the source-observed status transition；最多32字符。

来源未确认：

- No visible AI request, model execution, backend response, progress metric or user prompt appears in source
- Retry controls are visible but source shows no click; their real behavior is unknown
- Source shader, easing, lighting, exact particle count and image reveal mask implementation are unknown
- Identity and rights of original photograph subjects are not inferred or reproduced

全部来源机制与原创差异见 [第二十批](collectui-batch-20.md)。按实际音频重排停留与反馈；这些无声样片未完成本期口播同步或审美确认。


## 第二十一批：折叠标签、多选汇总与导览

按本期实际口播安排触发、阅读、状态切换和收尾，保持来源主要界面区域。以下参数仅修改明确列出的内容，固定结构与未知业务不会因换名成为实际执行。

### 折叠设备 · 四标签连续切换

`interaction-foldable-learning-tabs`：30秒基准；[实际样片](../assets/previews/foldable-learning-tabs.mp4)。

- `title`：Profile account display name; Home greeting uses its first space-separated name token. Email/plan/preferences remain illustrative fixed UI data.；最多20字符。
- `prompt`：Home weekly goal headline, visible in compact and unfolded app.；最多42字符。
- `result`：Continue learning lesson title, visible in compact and unfolded app.；最多38字符。

来源未确认：

- The source describes React Native but no actual app source code, backend or device implementation is exposed; reconstruction does not claim those technologies run.
- Source title mentions bottom tabs, but all accepted frames show the rail at the right edge. No bottom migration was observed or implemented.
- Search, preferences switches, Start a session, Manage plan, See all, learning/popular rows and first simulator controls are visible but not activated in the source clip; no service effect invented.
- Small metadata and partly clipped pattern labels cannot be confidently read from source; exact values outside readable main labels remain unknown.
- No real session completion, learning result, payment or account persistence was observed.

### 链菜单 · 多选数量与图标联动

`interaction-dropdown-chain-multiselect`：30秒基准；[实际样片](../assets/previews/dropdown-chain-multiselect.mp4)。

- `title`：All Chains group row label and all-chain trigger summary; at most 20 Unicode characters.；最多20字符。
- `prompt`：Ethereum row label and single-chain trigger summary; at most 20 Unicode characters.；最多20字符。
- `result`：Text unit following fixed counts 2 and 3; at most 12 Unicode characters. Base, Polygon, Optimism labels, glyph identities, counts, and two-cycle order remain fixed.；最多12字符。

来源未确认：

- Exact source pointer and keyboard inputs, the initial opening trigger event, and precise source event timing between the accepted paused frames are unknown.
- The source camera crop hides most lower rows during selection. Their individual checked visuals, hover behavior, and whether the All Chains return came from the fourth row or another input are not directly observable.
- At 9 seconds Ethereum text and a small Base glyph coexist in transition; that still frame does not prove a deselection or removal action. Stable 8/8.5 and 10 second samples bracket it.
- Source audio was muted and not listened to. Full continuous source playback was not watched; only the listed decoded paused samples were accepted.
- No backend filtering, actual blockchain connection, balances, account state, network calls, transaction, financial action or subsequent business result is observed. The implementation performs no such operation.
- No separate zero-chain summary or menu states outside the two observed cycles are established.

### GitHub 侧栏 · 标签滑动与工作流保留

`interaction-github-sidebar-tabs-tour`：26秒基准；[实际样片](../assets/previews/github-sidebar-tabs-tour.mp4)。

- `title`：Repository name centered in the application top toolbar.；最多20字符。
- `prompt`：Already-open workflow run title, shared by the right document tab/headline and first Actions/PR row.；最多48字符。
- `result`：Run branch shared by workflow metadata, first Actions row and first PR branch strip.；最多32字符。

来源未确认：

- Actual GitHub authentication, network calls, run execution, repository permissions and service implementation are not observable.
- Filter option result, search result, add action and Log/external/copy action outcomes are not demonstrated.
- Some clipped issue/PR titles and hidden Rust job content cannot be fully read; no hidden content is reconstructed.
- No right-panel scroll, new PR/issue detail opening or active task execution is confirmed.

全部机制、关键秒与原创差异见 [第二十一批](collectui-batch-21.md)。根据实际音频重排停留和反馈；这些无声样片未完成本期口播同步或用户审美确认。


## 第二十二批：本地文本编辑、搜索与通知

按本期实际口播安排触发、阅读、状态切换和收尾，保持来源主要界面区域。以下参数仅修改明确列出的内容，固定结构与未知业务不会因换名成为实际执行。

### 玻璃代码编辑器 · 本地查找与文本替换

`software-glass-code-editor-local-edit`：28秒基准；[实际样片](../assets/previews/glass-code-editor-local-edit.mp4)。

- `title`：Active file label, shared by the tab and current-file find result.；最多24字符。
- `prompt`：Original local current-file find query; literal case-insensitive matching against displayed source-code text controls count/highlights or No matches.；最多20字符。
- `result`：Original replacement for the enterpriseNote text in the already-open code line; typed locally, never executed.；最多64字符。

来源未确认：

- Source does not show interaction behavior for tree collapse, global Search, tab switching, preview controls, domain connection or save/run.
- Original background construction/renderer and true code/service implementation cannot be determined from rendered video.
- Source clips right/lower window; remaining code characters, further tree rows and hidden panels are not fully visible.
- No actual backend, data, category decision, booking workflow or executable result is verified.

### 变形导航 · 搜索输入与通知巡览

`interaction-morphing-search-notification-nav`：32秒基准；[实际样片](../assets/previews/morphing-search-notification-nav.mp4)。

- `title`：Home active label at the start and return; does not name a workspace or result page.；最多12字符。
- `prompt`：Text typed character by character in the expanded Search field; input only, no search results or backend call.；最多24字符。
- `result`：Notifications active pill heading above the four fixed rows; does not change any notification content or trigger a result.；最多18字符。

来源未确认：

- Exact original DOM/CSS, easing curves, event modality and click/key coordinates are unavailable; active changes and typing do not prove a specific original mouse click.
- No source Search result, Inbox detail, Settings form, notification detail or actual deploy/review/billing transaction was observed or implemented.
- No source audio inspection, full continuous playback review, narration synchronization, independent review or user aesthetic approval. Paused verified samples are not a complete frame-by-frame source review.
- Main gallery integration, final render/export/decoder verification and package install are pending parent/root validation.

### 通知堆栈 · 悬停轮换与关闭

`interaction-notification-stack-cycle`：26秒基准；[实际样片](../assets/previews/notification-stack-cycle.mp4)。

- `title`：First notification headline, shown in front and again as the exposed rear title after cycling.；最多20字符。
- `prompt`：First notification body; stays attached to the same card while it cycles through the stack.；最多48字符。
- `result`：First notification CTA label; editable visible text only, with no unobserved click or real service result.；最多18字符。

来源未确认：

- Source backend/product implementation and storage of dismissed notifications
- Destination or result of source CTA buttons, bell and more menu
- Hidden notifications or behavior after the source ends
- Exact internal card layout/z-order algorithm; geometry reconstructed from observed rendered states

全部机制、关键秒与原创差异见 [第二十二批](collectui-batch-22.md)。根据实际音频重排停留和反馈；这些无声样片未完成本期口播同步或用户审美确认。


## 第二十三批：折叠表单、分享纸夹、自动空状态与文件贴纸

按本期实际口播安排触发、阅读、状态切换和收尾，保持来源主要界面区域。以下参数仅修改明确列出的内容，固定结构与未知业务不会因换名成为实际执行。

### 账号设置 · 三段折叠与本地确认

`interaction-account-setup-accordion`：30秒基准；[实际样片](../assets/previews/account-setup-accordion.mp4)。

- `title`：Prefilled Full Name value in Required Information; remains attached to that row through folding and reopening.；最多20字符。
- `prompt`：Prefilled Email row text; demonstrates editable visible copy only, without email validation or transmission.；最多30字符。
- `result`：Already-populated Address value shown inside the inline field and retained as plain row text after local confirmation.；最多18字符。

来源未确认：

- Actual backend validation/persistence and whether Complete is driven solely by source Address confirmation
- What happens after Skip/Proceed or modal close
- Actual entry/upload behavior for Profile/Optional placeholders
- Exact internal accordion centering/easing/layout algorithm

### 纸夹分享弹层 · 预览与背页收放

`interaction-paperclip-share-popover`：24秒基准；[实际样片](../assets/previews/paperclip-share-popover.mp4)。

- `title`：Share popover heading; trimmed whitespace, escaped, capped at 28 Unicode characters, fitted to a single line.；最多28字符。
- `prompt`：Independent title on the transcript preview paper; not an AI prompt. Capped at 80 Unicode characters, escaped, fitted for natural wrapping in the fixed preview.；最多80字符。
- `result`：Independent preview body excerpt; not a generated reply or actual transcript. Capped at 420 Unicode characters and escaped, displayed in the fixed paper with source-like lower fading/cropping.；最多420字符。

来源未确认：

- Exact event handlers, mouse-button events, original spring values and frame-accurate timing between the accepted samples.
- Whether paper stacking is triggered by a clip hover event, a drag proximity test, or another implementation; pointer/state correlation is visible, code is not.
- Unshown workbench content, transcript origin, destination connection flow, permissions, copy success and Ask Meetball output.
- Original media audio and subjective aesthetic acceptance; source and reconstruction were sampled, not watched as a continuous full-duration playback.

### 空状态 · 工作区到文件夹与条目

`interaction-empty-state-workspace-folder-artifact`：24秒基准；[实际样片](../assets/previews/empty-state-workspace-folder-artifact.mp4)。

- `title`：Workspace-stage entity noun, displayed in that stage heading and + Create CTA; it does not name or create a real workspace.；最多14字符。
- `prompt`：Folder-stage entity noun, displayed in that stage heading and + Create CTA; it is visible editable copy, not a prompt submission.；最多14字符。
- `result`：Artifact-stage entity noun, displayed in that stage heading and + Create CTA; it is not a generated result or created artifact.；最多14字符。

来源未确认：

- The source desktop app illustration title is too small/soft to identify confidently.
- The real product behind the C emblem, actual creation workflows, data model and validation are unobserved.
- Whether the captured source transition is a component demo, editor preview or loop is unknown; only its visible sequence is claimed.
- Source audio and any hidden interaction outside this6.122-second media are unverified.

### 文件贴纸 · 揭角与自由摆放

`interaction-finder-sticker-peel-drag`：26秒基准；[实际样片](../assets/previews/finder-sticker-peel-drag.mp4)。

- `title`：Folder name shared by the visible toolbar heading and selected sidebar row; 22 Unicode code points; whitespace collapsed, escaped. Long labels use ellipsis.；最多22字符。
- `prompt`：Architecture photo filename, attached to the same SVG photo through both peel/drag operations; 26 Unicode code points, escaped, wrapped. It is not an AI prompt.；最多26字符。
- `result`：PDF filename, attached to the same paper object through peel/drag/settle; 36 Unicode code points, escaped, wrapped. It is not a success result.；最多36字符。

来源未确认：

- Actual operating-system filesystem operations, persistence, file contents and application implementation are unknown. No real service action is represented.
- Native click/press/release event logs are unavailable. The source pointer and visible file movement are observed; event boundaries are authored.
- No toolbar navigation, file-opening preview, typing, new document or save completion is observed.

全部机制、关键秒与原创差异见 [第二十三批](collectui-batch-23.md)。根据实际音频重排停留和反馈；这些无声样片未完成本期口播同步或用户审美确认。


## 第二十四批：挤压进度、角色开关、数字文档与终端生态

按本期实际口播安排触发、阅读、状态切换和收尾，保持来源主要界面区域。以下参数仅修改明确列出的内容，固定结构与未知业务不会因换名成为实际执行。

### 挤压进度 · 暂停与连续恢复

`interaction-squeezed-progress-pause-resume`：24秒基准；[实际样片](../assets/previews/squeezed-progress-pause-resume.mp4)。

- `title`：Original small upper-left canvas heading. Source has no heading; 32 Unicode characters maximum, whitespace cleanup/fallback, HTML escape and fit-to-width font sizing. It does not change any source percentage or control state.；最多32字符。
- `prompt`：Original instruction beneath the control in the blue running state. Source has no instruction; 24 Unicode characters maximum, whitespace cleanup/fallback, HTML escape and fit-to-width sizing. It describes the pause affordance, not a task or business result.；最多24字符。
- `result`：Original instruction beneath the control in the orange paused state. Source has no instruction; 24 Unicode characters maximum, whitespace cleanup/fallback, HTML escape and fit-to-width sizing. It describes the resume affordance; 31/81/100 remain fixed.；最多24字符。

来源未确认：

- Underlying progress task, its execution, backend/network state, and any actual completion outcome beyond the visible 100% number.
- Exact mouse-button events, trigger handlers, spring/physics constants and source easing between the accepted decoded frames.
- Whether the two curved arrows are implemented as a resume control, restart affordance, or another event internally; the observed transition resumes from the current percentage.
- Original media audio, uninterrupted full-source playback and subjective aesthetic acceptance were not verified. Source and reconstruction were sampled as stated; no narration synchronization was checked.

### 角色开关 · 开启后由熊推回关闭

`interaction-bear-switch-on-off`：26秒基准；[实际样片](../assets/previews/bear-switch-on-off.mp4)。

- `title`：Original editorial caption at lower left; not source UI text, product identity, business input or system setting.；最多24字符。
- `prompt`：Original display label for the off state, shown when the handle is left and the groove grey; default OFF.；最多10字符。
- `result`：Original display label for the on state, shown when the handle is right and the groove green; default ON.；最多10字符。

来源未确认：

- Initial-on trigger and implementation/control technology.
- Any real system setting, application, persistence or business meaning behind the visual switch.
- Actions or animation outside the 14.28-second clip; audio not studied.

### 滚动数字 · 格式与过渡连续巡览

`interaction-rolling-number-documentation-tour`：30秒基准；[实际样片](../assets/previews/rolling-number-documentation-tour.mp4)。

- `title`：Central Overview heading only, default Numbers; left navigation retains Numbers identity and numeric fixtures are unchanged.；最多14字符。
- `prompt`：Literal quote at beginning of Overview description only, not an executable prompt or backend request.；最多64字符。
- `result`：Literal caption beneath Overview currency demo only, not computed financial output or success claim.；最多32字符。

来源未确认：

- Exact original code/easing/blur/data source/repeat count are unknown.
- Earliest Counting state and some intermediate clicks/values are not individually accepted; controls/major resulting states are confirmed.
- 99/decrement/transition+1/−1,379/other Code/tabs/Search/Theming/Copy/navigation results were not observed.
- Overview return trigger and fields below duration are not accepted or added.
- No real financial/clipboard/install/network/AI execution is confirmed.

### 终端生态 · 村落与预览往返

`interaction-terminal-ecosystem-village-tour`：30秒基准；[实际样片](../assets/previews/terminal-ecosystem-village-tour.mp4)。

- `title`：Independent manifesto in the left ecosystem column, including its deterministic letter-by-letter return. Maximum 140 Unicode characters; whitespace cleanup/fallback, HTML escaping, natural wrapping and area-based font fitting. Does not rename the nine directory items or change village states.；最多140字符。
- `prompt`：Independent short explanation centered in the Juko preview above its password form. Maximum 140 Unicode characters; whitespace cleanup/fallback, HTML escaping, natural wrapping and area-based font fitting. Does not submit, authenticate or replace the village UI.；最多140字符。
- `result`：Password-field placeholder text in the Juko preview. Maximum 28 Unicode characters; whitespace cleanup/fallback, HTML escaping and fit-to-width sizing. It is a placeholder only, not a password or business-success result.；最多28字符。

来源未确认：

- Exact keyboard/mouse events for entering the village, changing seed and returning to ecosystem; original handlers, routing and fade/typewriter implementations.
- Original map generator, seed value, character sprites, NPC movement logic, collision/selection rules and specific character trajectories between accepted samples.
- Password value, submit outcome, chat interactions, Team List contents, about view, external app launch, GitHub/social destinations and any underlying business execution.
- Native media audio, uninterrupted full-source playback, narration synchronization and subjective user aesthetic acceptance were not verified. Evidence is the stated accepted paused frames and author production checks.

全部机制、关键秒与原创差异见 [第二十四批](collectui-batch-24.md)。根据实际音频重排停留和反馈；这些无声样片未完成本期口播同步或用户审美确认。
