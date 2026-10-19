# 本包实际验证记录

日期：2026-10-01。当前v0.23共103个可编辑预设；以下保留各批实际验证范围，不是全站复刻完成报告。

## 首批33项的验证

- Skill frontmatter：skill-creator quick_validate.py 通过。
- 预设目录：由注册代码实际生成，33 个唯一 ID。
- 浏览器诊断：33 个构建无错误；在 0%、18%、49%、78%、100% 比较顺序播放与“末尾→起点→目标”的 DOM 文本和关键计算样式，全部一致。数值容差小于 0.00002，none 与单位变换视为同一状态。80% 位置的可见文字画布越界/溢出启发式检查无标记。
- 已修复并回归：按钮图标被 textContent 删除、初帧未初始化、表格序号前导零、进度环数值舍入、扫光重叠时间，以及 Codex 代码与底栏重叠。
- 直接目视抽查：软件界面与代码阅读、豆包工作成果区、连续镜头入场与结果推近、点阵/球体加载和原位揭示；未声称逐帧人工观看全部预设。
- 实际导出 continuous-codex.mp4：1920×1080、30fps、20秒、600帧、H.264，无音轨；FFmpeg 完整解码通过，FFprobe 核对编码、分辨率、帧率、帧数与时长。
- 实际导出 orb-reveal.mp4：1920×1080、30fps、8秒、240帧、H.264，无音轨；FFmpeg 完整解码通过；编码信息随旁置JSON记录。
- 工程创建：已实际生成独立项目并从其中导出，包含本地字体/代码和渲染脚本。NaN 时长被拒绝且没有新建目录。
- 安装器：临时目录复制、已有目标拒绝且原内容保留、dry-run不写入、复制后安装器可定位源，均已通过。

## 范围

本次无用户口播或配音，样片是无声机制示范，没有声画同步验收。软件场景为有标识的界面示意。默认文案已测试，替换成长文后应按实际内容再次检查。未实现透明通道导出；当前H.264视频也不是AE工程。

网站记录现有40项不同深度的实际观察、41项界面/机制适配；原作品完整复刻数为0，尚未完成全部作品盘点或逐作品复刻。72个代码预设与159个分类都不是原作复刻完成数。

## 第三批新增3项的验证

- 新增 `interaction-transfer-confirm`、`result-tech-text-inspect`、`ambient-agent-island`，各自 `node --check` 通过。
- 浏览器实际构建、在0%、18%、49%、78%、100%比较前进和回拖状态，3项均无错误、无不一致；80%位置文字与SVG几何检查均无标记。本批没有重复运行首批33项。
- 修复文字SVG的布局框高度：Noto字体212px对应318px字符框，尺寸标签与光标定位使用同一实际布局；SVG诊断采用几何边界，不用HTML滚动宽度代替。
- 视觉抽查：转账初态、滑块中段与成功末态；文字完整态、描边中段和恢复；点阵马与景物的不同相位。检查了导出编码中间帧与联系表，未逐帧人工观看全片。
- 三段最终样片均已导出为1920×1080、30fps、H.264，无音轨：transfer-confirm.mp4为9.5秒/285帧，tech-text.mp4为9秒/270帧，agent-island.mp4为10秒/300帧。三段完整FFmpeg解码通过；实际FFprobe数据在各自旁置JSON中。
- 独立工程未传标题时保留预设默认文案；本次三个最终样片均从这样的独立工程导出。
- 作品进度页可分别看原作、观察深度和多个机制适配。预览服务默认从技能包根目录服务，旧入口保留query跳转；验证文档与第三批来源文档已实际返回HTTP200且no-store。

源参考与代码差异见 references/collectui-batch-03.md。Kopp导航作品只有文字与作者信息，未取得视频画面，继续queued。

## 第四批新增3项的验证

- 新增 `interaction-workflow-replace`（11秒）、`interaction-node-config`（12秒）、`software-agent-hub`（16秒）；模块语法通过，实际目录为39个唯一预设。
- 三项实际浏览器构建、0%/18%/49%/78%/100%顺序与回拖状态比较通过。修复Agent Hub点击环fromTo起始坐标在回拖时丢失，现每次点击位置与零时刻均显式设置。
- 两项workflow的80%文字检查无标记。Agent Hub仍有4条启发式outside-canvas提示，均位于末尾两行：浏览器DOM实测其top分别739.38/765.45，而内层feed视窗bottom为690.00、overflow:hidden；截图也确认这两行完全位于视窗外，失败步骤及操作按钮仍完整可见。这是展开活动后的列表裁剪，未关闭诊断或删除行数据。
- 依据源图修正了中性色文字对比度、Node Mode标签居中、认证卡图标与标题的纵向层级，以及右侧局部输出节点的文字宽度。原图为静态图，点击/搜索/替换等节奏属于原创编排。
- 作品清单视图实际载入26条卡片、25个媒体URL；作者kvnkld筛选为3卡。独立工程携带清单并实际载入，未依赖工作副本的references目录。
- 查看了本批导出联系表、编码帧及浏览器稳定状态；没有宣称逐帧人工观看全片。无用户配音，全部为无声示范。

来源与范围见 [第四批观察](references/collectui-batch-04.md)。AI Flow分类两个分页已清点；全站复刻仍未完成。

本批最终MP4均为1920×1080、30fps、H.264、无音轨，FFprobe核对且FFmpeg完整解码通过：

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| workflow-replace.mp4 | 11秒 | 330 |
| node-config.mp4 | 12秒 | 360 |
| agent-hub.mp4 | 16秒 | 480 |

旁置 `*-verification.json` 保存实际编码检查和抽样视觉检查范围。

本包本批交付检查：Skill元数据验证（UTF-8模式）、本地Markdown引用、Python脚本语法与39个唯一预设目录均通过。

## 第五批新增3项的验证

- 新增 `software-workflow-automation`、`ai-reasoning-glass-panel`、`interaction-flow-deck-insert`；实际目录42个唯一预设，两个浏览器入口均加载新模块。
- 本批三项浏览器构建通过，0%/18%/49%/78%/100%顺序播放与回拖状态一致，80%文字越界与溢出检查无标记。先前39项未重复运行，保留各批验证范围。
- 浏览器目视检查稳定态与局部反馈，查看每段6时点联系表及编码中间帧，未逐帧人工观看。节点和连线连续让位，玻璃面板在同一素材画布上展开，文字无意外遮挡。
- 三幅源参考均为静态图；横屏重排、输入、拖动和焦点移动为原创。玻璃面板的照片替换为原创SVG；流程编辑器背景另绘。黑色工作流停在Missing Information，推理面板停在In progress，未伪造业务完成。
- 每段均从独立可编辑工程导出。FFprobe核对H.264、1920×1080、30fps、单视频流无音轨，FFmpeg完整解码通过，无浏览器渲染错误。

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| workflow-automation.mp4 | 12秒 | 360 |
| reasoning-glass.mp4 | 11秒 | 330 |
| flow-deck-insert.mp4 | 13秒 | 390 |

样片、联系表、编码中间帧和验证JSON在 `assets/previews/`。来源与差异见 [第五批观察](references/collectui-batch-05.md)，实际口播选用规则见 [口播编排](references/narration.md)。本批未提供用户配音，不含声画同步验收。

本批交付前检查：Skill元数据、本地Markdown链接、Python脚本语法与42个唯一预设目录均通过；进度页实际显示42预设、13观察、11机制适配。

## 第六批新增4项的验证

- 新增 `interaction-invoice-node-focus`、`ai-handoff-copy-component`、`software-agent-workflow-inspect`、`interaction-scenes-composer`，实际目录46个唯一预设。两个入口均加载对应模块。
- 四项浏览器构建、0%/18%/49%/78%/100%前进与回拖状态比较、80%文字布局检查通过。工作流抽屉的浅蓝灰文字改为更清楚的中性灰，修改后该项重新检查通过。其他旧预设没有重复运行。
- 目视检查浏览器稳定状态、每段6时点联系表与编码中间帧；同窗推近、原位复制反馈、节点让位及抽屉展开均保留连续对象。未逐帧人工观看整片。
- 四段从独立工程真实导出，FFmpeg完整解码通过，FFprobe核对为1920×1080、30fps、H.264、单视频流无音轨，无浏览器渲染错误。

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| invoice-node-focus.mp4 | 10秒 | 300 |
| handoff-copy.mp4 | 12秒 | 360 |
| agent-workflow-inspect.mp4 | 14秒 | 420 |
| scenes-composer.mp4 | 11秒 | 330 |

每段附联系表、编码中间帧和验证JSON。参考片段与原创变化见 [第六批观察](references/collectui-batch-06.md)。没有用户配音，本批不含声画同步检查。

独立工程的说明链接已补齐：创建器携带来源、口播、工程格式与渲染文档，重写扁平目录里的相对路径；历史MP4不复制，历史验证页明确指向原包范围。实际创建临时工程后，31个Markdown本地链接、18个HTTP资源、4个JSON读取通过；已有目录拒绝覆盖，哨兵文件和原配置保留。

本批交付前检查：Skill元数据、本地Markdown链接、Python语法及46个唯一预设目录通过；进度页实读46预设、15观察、15机制适配。


## 第七批新增4项的验证

- 新增 `opening-workflow-canvas`、`software-branch-workflow`、`software-logistics-route-map`、`ai-command-block-link`；实际目录50个唯一预设，两处浏览器入口均加载。
- 本批四项实际浏览器构建、0%/18%/49%/78%/100%顺序与回拖状态、80%文字布局检查均通过。旧 `result-tech-text-inspect` 作为SVG检查回归样例通过；其他旧项未重跑。
- 修正SVG文字边界诊断：先把元素局部坐标经变换矩阵转到所属SVG坐标，再与viewBox比较。物流图中7条位于画内的平移文字不再被误报。另用一个画内和一个画外的平移文字验证判断，不移除溢出检查或放宽阈值。
- 稳定态浏览器、每段6时点联系表和编码中间帧均实际目视检查。分支条件标题的缺空格修正为“Is high value”，重新导出并再次通过构建、seek与布局检查。没有逐帧人工观看全部成片。
- 四段均从独立可编辑工程真实导出。FFprobe核对1920×1080、30fps、H.264、单视频流无音轨；FFmpeg完整解码通过，没有浏览器渲染错误。

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| workflow-canvas.mp4 | 10秒 | 300 |
| branch-workflow.mp4 | 14秒 | 420 |
| logistics-route-map.mp4 | 14秒 | 420 |
| command-block-link.mp4 | 12秒 | 360 |

样片、联系表、编码帧和旁置JSON位于 `assets/previews/`。本批为静态参考的原创动态编排，来源与裁切范围见 [第七批观察](references/collectui-batch-07.md)。新增等宽字体的来源、OFL及SHA256记录随包提供。没有用户配音，不含声画同步验收。

本批交付检查：Skill元数据、64个主包Markdown本地链接、Python语法、新增JavaScript语法、入口注册与50个唯一预设通过。独立工程实建后36个文档本地链接、19个HTTP资源、4个JSON读取通过；已存在目录拒绝覆盖。进度页实读50预设、18观察、19机制适配。


## 第八批新增2项的验证

- 新增 `ai-coding-agent-progress` 与 `software-signal-node-patch`，共52个唯一预设，两个入口均加载新模块。
- 两项实际浏览器构建、0%/18%/49%/78%/100%前进和回拖一致性、80%文字布局检查通过。此前50项未重跑。
- 另外实际查看Coding Agent的0.72秒与编写阶段，以及Signal的参数启用和拖线吸附阶段。根据DOM测量修正了按钮点击位置、音频输出端点和侧栏底部间距。
- 视觉检查发现Coding Agent初态有重复的零时刻设置，导致文件卡、第一项等待图标及Files选中态被覆盖；改成每个初始属性只设置一次后，实际DOM与截图确认三者恢复，重新通过时间轴检查。
- 编码帧检查发现Signal的波形缩略图对比度不足、出口文字贴近图像；修正配色、卡片高度及对应线路端点后，重新检查并重新导出。初版保留在研究目录，发布包只使用最终版。
- 主代理实际查看两段最终联系表（每段6个时点）和编码中间帧。没有逐帧人工观看全部成片，也没有用户配音或声画同步检查。
- 两段最终MP4均由独立工程导出，1920×1080、30fps、H.264、18秒/540帧、单视频流无音轨；FFprobe数据核对与完整FFmpeg解码通过，浏览器渲染错误为空。

样片为 `coding-agent-progress.mp4`、`signal-node-patch.mp4`，附联系表、编码帧与旁置JSON。六阶段的参数文案、节点关系及来源差异见 [第八批观察](references/collectui-batch-08.md) 和 [工程参数](references/project-format.md)。

本批交付检查：Skill元数据、71个主包Markdown本地链接、Python语法、新增JavaScript语法和52个唯一预设通过。独立工程实建后41个文档链接、20个HTTP资源、4个JSON读取通过，已有目录拒绝覆盖。进度页实读52预设、20观察、21机制适配。


## v0.8 清空上下文与暂停交付

- 新增 `interaction-context-clear`，合计53个唯一预设。仅本项重跑构建、五点前进回拖、80%文字布局检查，均无标记。
- 初版底部回复裁切已通过缩短代码区和调整行距修正；发送光标按DOM坐标校正。另检查首帧、清除中段及尾帧。
- `assets/previews/context-clear.mp4`：1920×1080、30fps、12秒、360帧、H.264，仅视频流。FFprobe和完整解码通过，浏览器无错误。
- 实际查看六点联系表与编码中间帧，不宣称人工逐帧看完，无用户配音，未做声画同步验收。
- 按用户要求完成本项后暂停；没有继续观察或实现Bruce。21项观察、22项机制适配、0项完整原作复刻，全站目标尚未完成。


## v0.9 自纠错与驻留图解

- 新增 `ai-runtime-self-correct` 和 `interaction-dns-scroll-explain`，合计55唯一预设；两项构建、5点前进回拖、80%文字布局均通过。
- 诊断快照增加SVG路径d属性，覆盖工具让位时的路径形状。源边界没有全部工具成功，本预设只保留Browser Tool恢复。
- 修正运行时连接端点、让位后的分支路径与沙箱高度；渲染发现系统等宽字体回退为衬线字，两个新模块改用随包ProjectSans后重新导出。
- `assets/previews/runtime-self-correct.mp4`：18秒540帧；`assets/previews/dns-scroll-explain.mp4`：12秒360帧。两段均H.264、1920×1080、30fps、单视频流无音轨；FFprobe和完整解码通过，browserErrors空。
- 浏览器检查首态、展开/连线中间态、结果及回拖；另看最终六点联系表与编码中间帧。短中文替换文案已验证一次；没有人工逐帧审查或口播同步检查。
- 实际source观察为23项，机制适配24项，完整原作复刻仍为0；全站目标active，未覆盖部分完整保留。

## 第十一批新增3项的验证

- 新增 `interaction-chat-canvas-branch`（20秒）、`ai-workflow-configuration-gate`（18秒）与 `interaction-nested-step-toggle`（14秒）；实际注册58个唯一预设，均为1920×1080横屏。
- 先运行58项诊断，构建与五点前进/回拖比较无错误；布局启发式提示来自Agent Hub和新白色聊天栏中完全滚出内层视窗的旧文本。诊断现在先计算内层裁剪交集，仍保留外层画布越界检测。新增夹具确认：隐藏滚动行忽略、视窗内文字保留、真正越出画布的测试文字仍被标记。
- 修正聊天画布输入占位宽度、第二处选区与加号点击位置、网格可见度及右下缩略图尺寸。最终对三个新模块加Agent Hub共4项重新运行：构建、五点前进/回拖、80%文字布局、SVG坐标和裁剪夹具均通过；其他54项未在这些最终修改后重跑。原始最终结果在工作目录research/diagnostics-release10.json。
- 浏览器实际查看默认和一组短中文参数：聊天画布输入、选区、分支、引用展开与搜索；白色窗口构建列表、结果、0/6账户和0/8参数门槛；嵌套节点的收起、展开与尾态取消选中。中文字体使用随包ProjectSans/ProjectDisplay。
- 三段从独立可编辑工程导出，渲染无浏览器错误、FFmpeg完整解码通过；FFprobe核对H.264、1920×1080、30fps、单视频流无音轨。实际查看各六点联系表及编码中间帧，未人工逐帧看全片，没有用户口播或音轨同步验收。

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| chat-canvas-branch.mp4 | 20秒 | 600 |
| workflow-configuration-gate.mp4 | 18秒 | 540 |
| nested-step-toggle.mp4 | 14秒 | 420 |

三个MP4附联系表、编码帧和实际FFprobe验证JSON，位于 `assets/previews/`。来源观察与原创重排见 [第十一批记录](references/collectui-batch-11.md)。本批适配三件具体作品；全站覆盖目标仍未完成，分类未被升级为已复刻。

## 第十二批新增4项的验证

- 新增 `interaction-add-job-hub-hover`（9秒）、`ambient-cloud-topology-health`（8秒）、`ai-product-ad-assets-pipeline`（36秒）、`ai-image-model-video-nodes`（29秒）；实际注册62个唯一预设，统一1920×1080横屏。
- 四件原作在浏览器中实际查看：Avdeev 14个暂停状态、James 8个、ilker 23个、Krea 14个；每次记录实际timecode与载入状态。Krea早期未完成载入的旧帧未作为观察证据，原片未下载或嵌入。
- 输入与端口重叠、镜头推近后的标题裁剪、短告警移动距离、初态悬停框回拖、广告结果行迭代和创意面板排版已修正。产品请求说明另检查短中文与48字边界。三维小车为原创XYZ面网格，动画用数值变化更新SVG路径，正向和反向一致。
- 最终四项专项诊断通过：实际构建、五点前进/回拖DOM及关键样式/SVG路径比较、80%可见文字布局、SVG坐标和内部裁剪夹具均无错误。累计分批验证62项；原有58项未在此次仅新增模块及局部修正后重跑。原始结果在工作目录 `research/diagnostics-release11.json`。
- 浏览器分别查看默认及短中文参数的中间态、结果态和回拖起点。保持观察机制：Avdeev没有任务点击或录音；James异常没有被修复；两条生成链为原创程序素材演示，未调用模型或外部服务。添加的明确点击反馈为原创编排，已在来源记录中区分。
- 四段均从独立可编辑工程导出，渲染无浏览器错误；FFmpeg完整解码及FFprobe核对通过，编码为H.264、1920×1080、30fps、单视频流无音轨。实际查看六点联系表及各编码中间帧；未人工逐帧看全片，没有口播或音轨同步验收。

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| add-job-hub-hover.mp4 | 9秒 | 270 |
| cloud-topology-health.mp4 | 8秒 | 240 |
| product-ad-assets-pipeline.mp4 | 36秒 | 1080 |
| image-model-video-nodes.mp4 | 29秒 | 870 |

来源、完整主要链条及素材替换见 [第十二批记录](references/collectui-batch-12.md)。AI Flow分类快照覆盖范围以 [快照审计](assets/studio/ai-flow-audit.json) 为准：只统计已登记的两页媒体，观察不等于完整原作复刻，全站仍未完成。

## v0.12 三类参考目录与可分页查询

- 新清点UI Interaction 30页706卡/703媒体、Motion 13页296卡/296媒体、Loading Animation 4页93卡/93媒体。实际末页及Next禁用记录保存在各包内目录的listingSnapshots和scope；47个新分页仅登记元数据，未宣称媒体观看或复刻。
- 与既有AI Flow两页快照合并，四类共49页1121卡；按完整媒体URL精确分组为1089项（1068视频扩展、21图片扩展），保留32次重复出现及28个跨分类组。原有25媒体观察映射继续沿用，本次新增观察为0。包内索引与统计见 [目录研究](references/collectui-batch-13.md)。
- 浏览器实测四分类切换、Loading深链接、Motion前后翻页、AI Flow末页2卡、Loading末页21卡；UI Interaction逐页遍历30页，实际渲染共706卡、末页10卡且Next禁用。作者搜索返回1卡，空结果隐藏分页，清空搜索回到第1页；返回作品记录显示30条、分类目录显示159行。43次DOM状态记录及错误日志为空，实际结果保存在工作目录research/coverage-release12.json。
- 两条Loading来源取得实际弹层原作链接，但真实播放器readyState0、解码尺寸0、无源帧，仍待观察。包内 [来源尝试](assets/studio/loading-source-attempts.json) 只记录已验证元数据与失败状态；未创建加载动效模块。
- 最小便携检查实际创建独立工程，89个本地Markdown引用、33个HTTP目标和11个JSON读取通过；已有工程拒绝覆盖、哨兵及配置保持，未复制历史MP4。new_project.py复制目录并改写平铺路径，视觉规范也随工程携带。
- 本批仅改变目录查看器、工程复制和文档，34个既有预设模块及62唯一预设目录保持前版哈希。本批没有重跑旧动效或新增视频导出；前批视频解码、回拖和布局验收保留其原验证范围，不据目录页检查升级动效完成状态。

本批没有用户口播同步或新增审美批准；全站作品清点与代码重建继续推进。

## 第十四批新增3项的验证

- 新增侧栏点阵加载（8秒）、液态玻璃八组控件（36秒）、九轮语音食谱偏好（70秒），目录共65个唯一代码预设。三个来源分别实际读取8/32/30个有效暂停状态；没有下载原视频。
- 主工作室实际检查玻璃八组、语音九轮字段、家庭面板开合、末态和回拖起点，以及两段短中文参数。加载模块另检查18个默认/中文/边界状态。语音自定义9个短答案的回拖检查通过，逐项末态目视与特殊参数仍未验收。
- 修复玻璃键盘提示回拖残留、提示框宽度变动及滑块单位换算的0.0156px高度偏差；最终三项主入口构建、五点正反状态、80%文字布局、SVG坐标和裁剪夹具检查均通过，errors/seekFailures/layoutFlags为空。累计分批验证65项；旧62项本批未重跑。
- 三段独立工程实际导出；FFmpeg完整解码和FFprobe核对均通过：H.264、1920×1080、30fps、单视频流、无音轨。已实际查看各段六点联系表和编码中间帧，玻璃另看折射/控制/搜索/通知截图，语音另看家庭弹层与汇总。没有人工连续看完全部样片，没有本期口播或同步验收，也没有新增用户审美批准。

| 样片 | 时长 | 帧数 |
|---|---:|---:|
| sidebar-dot-morph.mp4 | 8秒 | 240 |
| liquid-glass-control-suite.mp4 | 36秒 | 1080 |
| voice-recipe-preferences.mp4 | 70秒 | 2100 |

原作机制和程序近似见 [第十四批来源](references/collectui-batch-14.md)。来源清单、观察与代码适配独立登记；新Command Bar15卡仍只清点元数据，不算动态观察。全站任务尚未完成。

第十四批最终便携检查：102个本地Markdown引用、39个HTTP目标、13个JSON均通过；已有目录拒绝覆盖，哨兵与配置保持，历史MP4不随新工程复制。


## 第十五批新增4项的验证

四件来源共62个接受的解码暂停点（Noe13、Salt14、Nils15、Paco20），实际卡弹层原作链接已读取。新模块69库中的4项，主入口构建、五点正反定位、80%文字布局、SVG与文字裁剪夹具通过；errors/seekFailures/layoutFlags为空。旧65项本轮没有重跑。

根工作室核对Noe财务预览、六→两→单行搜索和短中文/转义，Salt导航/跨类型/帮助/Searching/无结果/粒子/回答，Nils两轮候选与内联令牌，Paco四个悬停联动/拖条保留/查询缩高及短中文；四项末态回拖至0均检查。实施者自查范围另记录在便携JSON；不能将它等同独立审查。

四段正式独立工程实际导出，共76秒2280帧，FFmpeg完整解码、FFprobe核对通过：H.264、1920×1080、30fps、单视频流、无音轨。已查看每段六点联系表和编码中间帧；没有人工连续看完全部样片、没有口播音频或同步验收、没有用户审美批准。

| 样片文件 | 时长 | 帧数 |
|---|---:|---:|
| module-preview-search.mp4 | 20秒 | 600 |
| command-search-assistant.mp4 | 18秒 | 540 |
| prompt-design-tokens.mp4 | 16秒 | 480 |
| command-scroll-filter.mp4 | 22秒 | 660 |

当前37件来源观察、38项机制适配，0件完整原作复制；四条Command Bar及两条跨类卡补原作URL，清点快照的catalogued-only/not-observed历史状态保留。五类目录与全站范围仍未完成。来源和参数见 [第十五批文档](references/collectui-batch-15.md) 与 [实际便携观察](assets/studio/observations/batch15.json)。

第十五批最终便携检查：115个本地Markdown引用、46个HTTP目标、14个JSON均通过；已有目录拒绝覆盖并保持哨兵与配置；历史MP4未随新工程复制。


## 第十六批新增3项的验证

两个视频源共52个实际稳定readyState4暂停点，另有一张1162×880静态图。相机图只证明两种界面主题；新增参数选择与联动是原创动画。原作链接从精确媒体卡弹层读取，不从媒体ID推算；原片未下载或分发。

三项主入口构建、五点前进/回拖、80%文字布局、SVG及文字裁剪夹具通过，errors/seekFailures/layoutFlags为空；累计分批72项，旧69项本轮未重跑。初次发现HR文字光标因字体回退而溢出；改为独立SVG光标并重新检查、重新导出后通过，没有放宽检查规则。实际主要状态与短参数/转义的检查范围分别存入便携观察记录，没有启动独立审查。

三段独立工程实际导出，共80秒2400帧；H.264、1920×1080、30fps、单视频流、无音轨，FFmpeg全解码与FFprobe通过。查看了每段六点联系表、编码中间帧及主要浏览器状态；未连续人工看完，没有本期口播同步或用户审美批准。

| 样片文件 | 时长 | 帧数 |
|---|---:|---:|
| camera-strip-dual-theme.mp4 | 12秒 | 360 |
| command-quadrant-filter.mp4 | 28秒 | 840 |
| task-command-workspace.mp4 | 40秒 | 1200 |

当前40项观察、41项适配、72预设；完整原作复制0，分类状态仍158queued/1observed/0implemented。Sidebar清点新增111目录卡，六类合计55页/列表、1247卡、1191媒体，目录自身新增观看计数0。来源与实现差异见 [第十六批机制](references/collectui-batch-16.md)、[便携观察](assets/studio/observations/batch16.json)、[Sidebar说明](references/sidebar-inventory.md)。

第十六批最终便携检查：130个本地Markdown引用、50个HTTP目标、16个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第十七批新增8项的验证

八张静态参考实际卡弹层/图像观察，原作href读取；没有源视频动作。所有操作为原创。主要区域、差异与参数在 [第十七批](references/collectui-batch-17.md) 和 [观察JSON](assets/studio/observations/batch17.json)。

八项五点前进/回拖、80%布局及SVG/文字裁剪夹具通过；默认主要状态、短中文/转义与末→0另查。累计分批80项，旧72项本轮未重跑，未启动独立审查。

八段可编辑工程实际导出178秒/5340帧；1920×1080/30fps/H.264无音轨，单视频流，FFmpeg完整解码和FFprobe通过。实际查看联系表和编码中间帧，未连续看完、未配本期口播、未获审美认可。

| 样片文件 | 秒数 | 帧数 |
|---|---:|---:|
| supercmd-selected-text.mp4 | 18 | 540 |
| file-search-workspace.mp4 | 22 | 660 |
| file-search-excerpt.mp4 | 20 | 600 |
| crm-command-overlay.mp4 | 18 | 540 |
| solid-search-command.mp4 | 20 | 600 |
| directory-search-empty.mp4 | 20 | 600 |
| workflow-app-context.mp4 | 26 | 780 |
| contact-folder-command.mp4 | 34 | 1020 |

当前48项观察/49适配/80预设；完整原作复制0。Command Bar15媒体审计通过仅升级observed；分类157queued/2observed/0implemented。六类目录仍55页/列表、1247卡、1191媒体，其中43媒体组关联实际观察；目录枚举本身新增观看0。全站目标未完成。

第十七批最终便携检查：146个本地Markdown引用、53个HTTP目标、18个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第十八批新增3项的验证

三件具体动态源在实际卡弹层/远程视频多点观察，并读取原作href与全部可见标签。具体接受秒数、界面结构、差异、参数及根检查见 [第十八批](references/collectui-batch-18.md) 和 [观察JSON](assets/studio/observations/batch18.json)。

三项主入口五点前进/回拖、80%文字布局及SVG/文字裁剪夹具通过；主要稳定态、短中文/转义与末→0另查。累计分批83，旧80本轮未重跑，未启动独立审查。

三段工程实际导出112秒/3360帧，1920×1080/30fps/H.264无音轨，完整解码和FFprobe通过。联系表与编码中间帧实际抽看；未完整连续观看、未配本期口播、未获审美认可。

| 样片文件 | 秒数 | 帧数 |
|---|---:|---:|
| dashboard-product-tour.mp4 | 60 | 1800 |
| bbapp-agent-workspace.mp4 | 26 | 780 |
| split-view-snap-points.mp4 | 26 | 780 |

八类目录清点57页/列表、1282卡、1210媒体；目录自身新增观察0。全站剩余151类目录、全部未完成原作仍保留。当前51观察/52机制适配/83预设，完整原作复制0；分类157queued/2observed/0implemented。

第十八批最终便携检查：158个本地Markdown引用、57个HTTP目标、21个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第十九批新增3项的验证

精确卡弹层、原作href、全部可见标签与远程视频多个真正暂停解码状态已实际观察，未知与原创差异见 [第十九批](references/collectui-batch-19.md)、[观察JSON](assets/studio/observations/batch19.json)。

三项主入口五点前进/回拖、80%文字布局、SVG/文字裁剪夹具通过；主要稳定状态、短中文/转义与末→0另查。累计分批86，旧83本轮未重跑，未启动独立审查。

三个工程实际导出110秒/3300帧，1920×1080/30fps/H.264无音轨，完整解码与FFprobe通过。实际抽看联系表、编码中间帧和主要浏览器状态；未完整连续观片/配本期口播/获审美认可。

| 样片文件 | 秒数 | 帧数 |
|---|---:|---:|
| gustavo-craft-sidebar.mp4 | 24 | 720 |
| lab01-prototype-tour.mp4 | 66 | 1980 |
| finance-sidebar-resize.mp4 | 20 | 600 |

十类目录63页/列表、1411卡、1300完整URL；UI Tips两页与Dashboard四页实际双DOM读取，末页Next禁用。目录自身新增媒体观看0。全站剩余149类目录与逐作品重建仍保留，54观察/55机制适配/86预设，完整原作复制0；分类157queued/2observed/0implemented。

第十九批最终便携检查：170个本地Markdown引用、61个HTTP目标、24个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第二十批新增3项的验证

精确卡弹层、原作href、全部可见标签、原片尺寸/时长及多个实际解码暂停状态已观察。各项接受帧数、源机制、差异、未知与参数语义见 [第二十批](references/collectui-batch-20.md)、[最终观察JSON](assets/studio/observations/batch20.json)。

新增三项主入口构建、五点前进/回拖、80%文字布局与SVG/文字裁剪夹具通过；主要稳定状态、短中文/转义参数和末→0另查。累计分批89，旧86项本轮未重跑，未启动独立审查。三段共69秒/2070帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或审美通过，这三项均未完成。

| 样片文件 | 秒数 | 帧数 | 接受源暂停帧 |
|---|---:|---:|---:|
| [icon-sidebar-hover.mp4](assets/previews/icon-sidebar-hover.mp4) | 32 | 960 | 12 |
| [nested-activity-sidebar.mp4](assets/previews/nested-activity-sidebar.mp4) | 28 | 840 | 11 |
| [dual-image-loader-orb.mp4](assets/previews/dual-image-loader-orb.mp4) | 9 | 270 | 7 |

实际双DOM读取Menu四页24+24+24+7卡、Hover State三页24+24+3卡、Orb两页24+2卡，末页Next禁用；File Tree实际单列表15卡，没有源分页控件，归档p1不是网站第1页。保留作者资料链接、完整媒体URL、可见标签、实际图片alt和卡片顺序；未展开的隐藏标签不补造。四类目录状态保持catalogued-only。

十四类合计73个归档分页/列表、1582卡、1375个不同完整媒体URL，207次重复、176组跨类媒体，52组关联既有实际观察。另145类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

57观察/58机制适配/89预设，完整原作复制0；分类157 queued/2 observed/0 implemented。逐作品重建与全站清点目标仍未完成。

独立工程的文档复制已修复：原技能包历史预览链接转为标明来源的路径文字，避免指向工程中未复制的MP4。现有便携检查实际通过182个本地Markdown引用、67个HTTP目标及29个JSON，已有目录拒绝覆盖，哨兵与配置保持，历史MP4复制为0。

第二十批最终便携检查：182个本地Markdown引用、67个HTTP目标、29个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第二十一批新增3项的验证

精确卡弹层、原作href、全部可见标签、原片尺寸/时长与多个实际解码暂停状态已观察。各项接受帧数、机制、差异、未知与真实参数见 [第二十一批](references/collectui-batch-21.md)、[最终观察JSON](assets/studio/observations/batch21.json)。

新增三项主入口默认与短中文/转义参数、主要稳定状态及末→0检查通过；诊断错误、回拖失败、布局标记均为空，SVG与文字裁剪夹具通过。累计分批92，旧89项本轮未重跑，未启动独立审查。三段共86秒/2580帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或用户审美通过，这三项均未完成。来源截图与远程媒体像素不作为包内素材分发。

| 样片文件 | 秒数 | 帧数 | 接受源暂停帧 |
|---|---:|---:|---:|
| [foldable-learning-tabs.mp4](assets/previews/foldable-learning-tabs.mp4) | 30 | 900 | 12 |
| [dropdown-chain-multiselect.mp4](assets/previews/dropdown-chain-multiselect.mp4) | 30 | 900 | 14 |
| [github-sidebar-tabs-tour.mp4](assets/previews/github-sidebar-tabs-tour.mp4) | 26 | 780 | 13 |

Tabs：3个归档分页/列表，实际卡数24+24+7=55，54个不同完整媒体URL；Dropdown：4个归档分页/列表，实际卡数24+24+24+10=82，82个不同完整媒体URL；Navigation：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL；Mobile App：5个归档分页/列表，实际卡数24+24+24+24+10=106，106个不同完整媒体URL；Code Editor：1个归档分页/列表，实际卡数5=5，5个不同完整媒体URL；Mac App：2个归档分页/列表，实际卡数24+22=46，46个不同完整媒体URL。有源分页者实际完整集合双读一致且末页Next禁用。Code Editor为无源分页控件的完整单列表，p1仅归档编号。Tabs不同卡片共享媒体的合法重复保留。Dropdown旧raw第4页实际重复第3页集合，仅保留纠错历史；统计只接受另存corrected集合，保留旧弹层异常及新Next/实际Page按钮导航记录。Navigation/Mobile App的即时旧集合只保留拒绝证据，不计入accepted集合。实际翻译标签与原始href保留，exact-href推导英文分类名单独记录，未展开隐藏标签不补造。这六类快照均保持catalogued-only，不因清点而声明观看或实现。

二十类合计90个归档分页/列表、1902卡、1539个不同完整媒体URL；363次重复、300组跨类媒体、55组关联已有实际观察。唯一URL媒体类型为1321视频/218图片。另139类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

60观察/61机制适配/92预设，完整原作复制0；分类157 queued/2 observed/0 implemented。全站目录清点与逐作品重建尚未完成。

第二十一批最终便携检查：196个本地Markdown引用、75个HTTP目标、36个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第二十二批新增3项的验证

精确卡弹层、原作href、全部可见标签、原片尺寸/时长与多个实际解码暂停状态已观察。各项接受帧数、机制、差异、未知与真实参数见 [第二十二批](references/collectui-batch-22.md)、[最终观察JSON](assets/studio/observations/batch22.json)。

新增三项主入口默认与短中文/转义参数、主要稳定状态及末→0检查通过；诊断错误、回拖失败、布局标记均为空，SVG与文字裁剪夹具通过。累计分批95，旧92项本轮未重跑，未启动独立审查。三段共86秒/2580帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或用户审美通过，这三项均未完成。来源截图与远程媒体像素不作为包内素材分发。

| 样片文件 | 秒数 | 帧数 | 接受源暂停帧 |
|---|---:|---:|---:|
| [glass-code-editor-local-edit.mp4](assets/previews/glass-code-editor-local-edit.mp4) | 28 | 840 | 6 |
| [morphing-search-notification-nav.mp4](assets/previews/morphing-search-notification-nav.mp4) | 32 | 960 | 16 |
| [notification-stack-cycle.mp4](assets/previews/notification-stack-cycle.mp4) | 26 | 780 | 16 |

Search：1个归档分页/列表，实际卡数21=21，21个不同完整媒体URL；Notification：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL。Search为无源分页控件的完整单列表，p1仅归档编号；21卡/21个不同完整媒体URL。Notification实际两页24+2=26卡/26个不同完整媒体URL，活动页与完整集合双读一致，末页Next禁用。实际翻译标签与原始href保留，exact-href推导英文分类名单独记录，未展开隐藏标签不补造。两份新快照保持catalogued-only；之前20类快照保留。目录枚举新增媒体观看0。

二十二类合计93个归档分页/列表、1949卡、1566个不同完整媒体URL；383次重复、311组跨类媒体、58组关联已有实际观察。唯一URL媒体类型为1338视频/228图片。另137类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

63观察/64机制适配/95预设，完整原作复制0；分类157 queued/2 observed/0 implemented。全站目录清点与逐作品重建尚未完成。

第二十二批最终便携检查：206个本地Markdown引用、79个HTTP目标、39个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第二十三批新增4项的验证

精确卡弹层、原作href、全部可见标签、原片尺寸/时长与多个实际解码暂停状态已观察。各项接受帧数、机制、差异、未知与真实参数见 [第二十三批](references/collectui-batch-23.md)、[最终观察JSON](assets/studio/observations/batch23.json)。

新增四项主入口默认与短中文/转义参数、主要稳定状态及末→0检查通过；诊断错误、回拖失败、布局标记均为空，SVG与文字裁剪夹具通过。累计分批99，旧95项本轮未重跑，未启动独立审查。四段共104秒/3120帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或用户审美通过，这三项均未完成。来源截图与远程媒体像素不作为包内素材分发。

| 样片文件 | 秒数 | 帧数 | 接受源暂停帧 |
|---|---:|---:|---:|
| [account-setup-accordion.mp4](assets/previews/account-setup-accordion.mp4) | 30 | 900 | 13 |
| [paperclip-share-popover.mp4](assets/previews/paperclip-share-popover.mp4) | 24 | 720 | 11 |
| [empty-state-workspace-folder-artifact.mp4](assets/previews/empty-state-workspace-folder-artifact.mp4) | 24 | 720 | 9 |
| [finder-sticker-peel-drag.mp4](assets/previews/finder-sticker-peel-drag.mp4) | 26 | 780 | 13 |

Accordion：1个归档分页/列表，实际卡数7=7，7个不同完整媒体URL；Tooltip / Popover：2个归档分页/列表，实际卡数24+6=30，30个不同完整媒体URL；Empty States：1个归档分页/列表，实际卡数8=8，7个不同完整媒体URL；Notepad：1个归档分页/列表，实际卡数4=4，4个不同完整媒体URL；Badge：1个归档分页/列表，实际卡数6=6，6个不同完整媒体URL；Folder：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL。Accordion、Empty States、Notepad、Badge分别为7、8、4、6卡的完整加载列表，没有源分页；p1仅归档编号。Tooltip / Popover与Folder实际两页24+6、24+2，旧首卡脱离与活动页确认后完整双读，末Next禁用。Empty States含1个目录内重复完整URL，8卡对应7个不同完整URL。六份快照共81卡/80个不同完整URL。实际可见翻译标签、原始href、隐藏+N及实际图片alt保留，英文原名仅以完整href另字段推导。六份新快照保持catalogued-only；之前22类快照保留。目录枚举新增媒体观看0。

二十八类合计101个归档分页/列表、2030卡、1599个不同完整媒体URL；431次重复、346组跨类媒体、62组关联已有实际观察。唯一URL媒体类型为1354视频/245图片。另131类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

67观察/68机制适配/99预设，完整原作复制0；分类157 queued/2 observed/0 implemented。全站目录清点与逐作品重建尚未完成。

第二十三批最终便携检查：220个本地Markdown引用、87个HTTP目标、46个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。


## 第二十四批新增4项的验证

精确卡弹层、原作href、全部可见标签、原片尺寸/时长与多个实际解码暂停状态已观察。各项接受帧数、机制、差异、未知与真实参数见 [第二十四批](references/collectui-batch-24.md)、[最终观察JSON](assets/studio/observations/batch24.json)。

新增四项主入口默认与短中文/转义参数、主要稳定状态及末→0检查通过；诊断错误、回拖失败、布局标记均为空，SVG与文字裁剪夹具通过。累计分批103，旧99项本轮未重跑，未启动独立审查。四段共110秒/3300帧，1920×1080/30fps/H.264无音轨；完整解码与FFprobe通过，主要浏览器状态、联系表及编码中间帧实际抽看。抽样图和完整解码不等于完整连续观片、本期口播同步或用户审美通过，这三项均未完成。来源截图与远程媒体像素不作为包内素材分发。

| 样片文件 | 秒数 | 帧数 | 接受源暂停帧 |
|---|---:|---:|---:|
| [squeezed-progress-pause-resume.mp4](assets/previews/squeezed-progress-pause-resume.mp4) | 24 | 720 | 13 |
| [bear-switch-on-off.mp4](assets/previews/bear-switch-on-off.mp4) | 26 | 780 | 10 |
| [rolling-number-documentation-tour.mp4](assets/previews/rolling-number-documentation-tour.mp4) | 30 | 900 | 23 |
| [terminal-ecosystem-village-tour.mp4](assets/previews/terminal-ecosystem-village-tour.mp4) | 30 | 900 | 12 |

Progress：1个归档分页/列表，实际卡数24=24，24个不同完整媒体URL；Switch Button：1个归档分页/列表，实际卡数16=16，16个不同完整媒体URL；Text Effect：2个归档分页/列表，实际卡数24+3=27，27个不同完整媒体URL；Terminal Aesthetic：2个归档分页/列表，实际卡数24+20=44，44个不同完整媒体URL；Progress Bar：1个归档分页/列表，实际卡数17=17，17个不同完整媒体URL。Progress、Switch Button、Progress Bar分别为24、16、17卡的完整加载列表，没有源分页；p1仅归档编号。Text Effect与Terminal Aesthetic实际两页24+3、24+20，旧首卡脱离与活动页确认后完整双读，末Next禁用。五份完整快照共128卡；原始批24的两份和批25的三份证据分别保留。Button登录受限部分清点未纳入完整目录。实际可见标签、原始href、隐藏+N及实际图片alt保留，英文原名仅以完整href另字段推导。五份新快照保持catalogued-only；之前28类快照保留。目录枚举新增媒体观看0。Text Effect首卡原作href属于既有Tech Text观察，即使早期记录缺少referenceMedia也不新增重复观察；本批使用另一实际来源。

三十三类合计108个归档分页/列表、2158卡、1676个不同完整媒体URL；482次重复、390组跨类媒体、66组关联已有实际观察。唯一URL媒体类型为1401视频/275图片。另126类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

71观察/72机制适配/103预设，完整原作复制0；分类157 queued/2 observed/0 implemented。全站目录清点与逐作品重建尚未完成。

第二十四批最终便携检查：233个本地Markdown引用、94个HTTP目标、52个JSON通过；已有目录拒绝覆盖且哨兵/配置保持，历史MP4未复制。
