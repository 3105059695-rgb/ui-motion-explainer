# 第十五批：命令搜索、设计令牌、组件筛选与模块预览

2026-09-30。本批将四个实际观察的来源分别重建为可编辑的1920×1080预设，均标记为 `observed-reconstruction`。每项保留同一窗口中的主要连续链，同时区分原片画面、中文示例、横屏重排和原创补充。主入口专项诊断、四段视频导出与关键帧查看已通过；连续完整观片及用户审美仍未验收；本页不是独立审查或用户审美认可。

## 来源与工程

原作地址来自精确媒体对应卡片弹层的 View on X，未由媒体ID推算。参考视频未下载，也不随包分发。

| 作者与原作 | 原片尺寸 / 时长 | 横屏模块 / 时长 |
| --- | --- | --- |
| salt / @saltjsx · [原作](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1260×1298 / 11.169002秒 | [saltcommand.js](../assets/studio/presets/saltcommand.js) · 18秒 |
| Nils / @nilseller · [原作](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 2240×1604 / 6.767442秒 | [nilscommand.js](../assets/studio/presets/nilscommand.js) · 16秒 |
| Pasquale Vitiello / @pacovitiello · [原作](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1440×1080 / 9.466667秒 | [pacocommand.js](../assets/studio/presets/pacocommand.js) · 22秒 |
| Noe / @noechague · [原作](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 1872×1080 / 6.933333秒 | [sidebarcommand.js](../assets/studio/presets/sidebarcommand.js) · 20秒 |

| 预设ID | 实际来源标签 | 预览 |
| --- | --- | --- |
| `interaction-command-search-assistant` | Command Bar | [搜索转入助手](../assets/studio/index.html?preset=interaction-command-search-assistant) |
| `interaction-prompt-design-token-autocomplete` | Dropdown、Command Bar、UI Interaction、AI | [两轮令牌补全](../assets/studio/index.html?preset=interaction-prompt-design-token-autocomplete) |
| `interaction-command-scroll-filter` | Command Bar、Search、Dark Mode、UI Interaction | [滚动与实时筛选](../assets/studio/index.html?preset=interaction-command-scroll-filter) |
| `interaction-module-preview-search` | Sidebar、Command Bar、Search、Dark Mode | [模块目录与预览](../assets/studio/index.html?preset=interaction-module-preview-search) |

Salt记录14个实际暂停点，Nils接受15个稳定点并拒收4个快速定位读数，Paco记录20个稳定暂停点，Noe接受13个稳定点并拒收10个快速定位读数。接受的媒体状态为 `readyState=4`；快速定位中的 `readyState=1` 不能作为对应画面已经解码的证据。这些数值是观察采样点，不是视频总帧数，也不表示逐帧或完整连续观片。

## Salt：搜索转入助手

同一黑色命令面板从导航列表开始，Dashboard选中。输入 `c` 后变为Commands列表；继续到 `cust`，命令只剩Customers，同时出现Knowledge文档和Signals条目，助手入口保留。查询删回 `c` 恢复较多命令，再换为 `hel`，显示Documentation，面板随内容缩高。完整 `hello` 经过Searching短等待进入No results，Ask the assistant处于选中态。随后放大镜变为sparkle，查询灰化，中央白色粒子簇持续重排，弱彩色边光沿外框变化。加载结束后，同一面板保留 `hello` / `Hello.` 回答块，顶部成为Ask a follow-up；没有发起新追问。

横屏版将面板固定顶部、连续调整高度，延长到18秒。导航和分组使用中文并附英文检索名。原片从 `hel` 继续输入 `hello`；工程为支持中文参数，新增清空 `hel` 后输入可编辑查询的步骤。模糊软件背景无法读清，背景外壳、SVG图标、36个白点和色光均独立绘制；粒子数量、路径、算法、精确材质与缓动不声称来自原作源码。

| 参数 | 用途 | 默认值 | Unicode字符上限 |
| --- | --- | --- | ---: |
| `title` | 原创背景软件名 | 工作台 | 20 |
| `prompt` | 清空固定查询后输入的助手示例查询 | 你好 | 24 |
| `result` | 加载结束后显示的示例回答 | 你好。 | 48 |

参数规范空白、转义HTML并按码点截断；固定 `c` / `cust` / `hel` 筛选阶段不由这三个参数替换。源中的背景文字、知识/信号截断行的隐藏正文和实际输入设备未知。原片没有可辨认鼠标或按键动作，工程也没有补做点击。回答只是界面示例，没有真实检索或模型请求。

## Nils：两轮内联设计令牌

近白背景中始终保留一枚白色提示框，左下为加号和设置滑杆，右下为蓝色箭头。输入 `Update to blue` 后，色阶菜单依次高亮 `blue-50 → blue-100 → blue-200 → blue-300 → blue-400`；确认后，正文中的 `blue` 变成带蓝色色块的 `blue-400` 令牌。继续输入 `and bg-`，背景令牌菜单展开，选区依次移动到 `bg-primary → bg-secondary → bg-tertiary`；确认后变成第二枚浅灰色块令牌。尾态保持组合好的提示，没有点击发送。

横屏版放大提示框与菜单、延长到16秒，保留输入、菜单、插入符和两枚令牌的连续关系。默认正文前缀改为「更新为」，连接词改为「和」，令牌名称保持源值。顶部标题、框外末段说明、输入框聚焦鼠标及方向键/Enter反馈为原创解释；原片未显示物理按键，不能由高亮移动证明具体按键。

| 参数 | 用途 | 默认值 | Unicode字符上限 |
| --- | --- | --- | ---: |
| `title` | 框外标题 | 把设计令牌写进提示词 | 24 |
| `prompt` | 输入框中的命令前缀 | 更新为 | 12 |
| `result` | 框外末段说明，不是生成结果 | 两个设计令牌已插入 | 32 |

这三个参数转义HTML并按码点截断，不改 `blue` / `bg-` 查询、候选和选中令牌。颜色菜单只重建读清的 `blue-50` 至 `blue-800`；更下方内容被播放器控制条遮住，名称与总数未知，不能称九项为原菜单全部候选。六项背景候选已读清：primary、secondary、tertiary、surface、elevated、inverted。色值按可见色阶近似绘制，没有测得原始CSS色值。附件、设置与发送按钮均未触发，没有真实样式应用或代码执行。

## Paco：滚动渐隐、悬停联动与实时筛选

同一深色命令窗口保留顶部搜索和底部命令栏，Pages、Overview、Components列表在内部连续滚动，条目经过上下边缘时渐隐。原片镜头推近左上搜索与列表后回到整个窗口。指针悬停Button、Autocomplete等组件时，选中行和底部组件安装命令同步变化。随后指针与滚动条滑块一起下移，列表继续滚动；Autocomplete离开视窗后，底栏仍保留其命令。再悬停Field、Dialog，最后开始输入 `c`，继续到 `comm`，筛为Command一行。同一窗口保持顶部锚点，结果区缩高，底栏随之上移。

横屏版延长为22秒，以中文主标签搭配英文标识。列表仍是持续存在的行对象；渐隐遮罩、滚动位置、滑块几何、镜头幅度、图标和过滤节奏为独立重建。背景文档为原创模糊示意；已读条目组成局部示例目录，不能当作原站全部文档或组件目录。源中没有复制、执行安装命令、提交Go to Page或页面跳转，工程也没有补做这些动作。

| 参数 | 用途 | 默认值 | Unicode字符上限 |
| --- | --- | --- | ---: |
| `title` | 背景文档名、搜索占位与Docs行中文标签 | 组件文档 | 18 |
| `prompt` | 末段实时筛选查询 | comm | 18 |
| `result` | Command目标行中文标签，不是执行结果 | 命令面板 | 24 |

参数规范空白、转义HTML并截断。自定义查询加入本地Command目标行的检索词，使最终查询能命中该行；这属于参数适配，不代表源里验证过任意中文查询。非纯英文字母查询若未出现在 `result` 中，目标行显示「查询 · 结果标签」。**组合后的目标标签最多28码点，超限会报错**，不能只检查18/24两个单独上限。底栏显示的 `bunx --bun shadcn@latest add @coss/...` 仅供阅读。原始遮罩CSS、精确缓动及未读列表内容仍未知。

## Noe：分类、发票预览与搜索收拢

源从全部分类60项的双列模块目录开始，光标转向Finance。选中Finance后，计数变为6/60，同一目录原位展开发票模块介绍与发票预览。光标再打开Search，目录仍在背景中，经过模糊与暗色遮罩保留上下文。空查询显示AI、Analytics & Reports、Data Model、Integrations、Invoicing以及部分可见的Knowledge。6.517346秒的 `in` 仅保留Integrations与Invoicing两行；6.863996秒与尾态的 `Inte` 仅保留Integrations。没有点击结果或跳转。

20秒工程完整分为以下阅读段，仍是同一预设中的连续过程：

| 工程时间 | 内容 |
| --- | --- |
| 0–4秒 | 全部模块目录，准备选择财务 |
| 4–11秒 | 财务6项与同一目录中的发票预览 |
| 11–20秒 | 搜索浮层，查询逐字过滤并收拢，停在未提交末态 |

`sectionRanges` 是时间段元数据，不是可传入的单段选择参数。山水原图改为独立CSS渐变，图标为独立SVG；轻微窗口入场和点击环为原创补充，光标路径、缓动与阅读节奏为近似重建。模块名称配中文，默认查询用小写 `inte`，与源中 `Inte` 的大小写不同。

| 参数 | 用途 | 默认值 | Unicode字符上限 |
| --- | --- | --- | ---: |
| `title` | 目录标题 | 模块目录 | 20 |
| `prompt` | 对六条本地示例实时过滤的查询 | inte | 24 |
| `result` | 示例发票标题，不是搜索结果或开票成功 | 年度活动 · 发票预览 | 28 |

参数规范空白、转义HTML并截断。实际代码对六条本地示例名称及中文名做不区分大小写的包含匹配：AI、Analytics & Reports、Data Model、Integrations、Invoicing、Knowledge。未匹配的自定义查询显示「没有匹配的本地示例」，这是原创本地行为，源片未展示无结果状态。目录60与财务6沿用源的显示计数，但工程只绘制示例条目，数量不是已实现业务规模；发票字段是明确的示例数据。全部60项、Knowledge以下的原始搜索列表、原作CSS和精确几何未观察完整。没有点击Explore、结果、登录，也没有开票或网络调用。

## 验收边界

四份源码均提供暂停的GSAP时间轴与可定位状态，参数不作为真实产品执行证据。四项实施者自查与根工作室检查分别记录；主入口五点回拖、80%文字布局、SVG与裁剪夹具均通过。实际原始记录与范围已归档到 [便携观察](../assets/studio/observations/batch15.json)。

本批四段独立工程已导出，共76秒2280帧；FFmpeg完整解码和FFprobe核对通过：H.264、1920×1080、30fps、无音轨。实际查看各段六点联系表、编码中间帧与主要操作截图，没有连续人工看完、配音同步或用户审美批准。可见代码、来源采样和实施者自查，与导出通过、独立审查、用户审美认可分别判断。四个来源的主要链重建不代表像素完整复刻，也不代表Command Bar、Sidebar或其他分类整体完成。
