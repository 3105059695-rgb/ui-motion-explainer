# 原 O/X/F 资源覆盖索引

> 统一后的任务与规则见 [主入口](../SKILL.md) 和 [模块映射](module-map.md)。本文件保留原 O/X/F 能力及来源索引；不再作为独立制作入口。

原始能力与来源子索引，按[效果库](library.md)需要展开。原 `ui-motion-explainer` 的内容、资源和脚本保留；其构图、材料、窗口与动作只在适合本期表达和 Fred Talk 默认时选用或适配。整体审美由[审美偏好](aesthetic-preferences.md)维护；F01–F08 是可选机制，不替代原能力。

“覆盖”指保留原能力与来源的可查索引。观察记录可供阅读；只有具有实际源码的部分才可调用，仍须检查接口和本期适配缺口。不能把每项可查等同于每项已实现，也不要求一条视频遍历全部动作、四种开场或全部账号规则。

## 完整性与版本选择

随包快照位于 [assets/base-skill](../assets/base-skill/GUIDE.md)。[base-manifest.json](base-manifest.json) 记录每个原文件的路径、字节数和 SHA-256；245 个文件均原样保留。原技能正文、18 份 references、图鉴、参考视频、原可编辑工程、字体、许可证、脚本与已有验证记录一起保留。统一入口整合只调整同机技能的入口与元信息；原资源和脚本位置不变，旧入口原文保存在各自的 `SKILL.legacy.md`。

base／fusion 按[引擎路由](engine-routing.md)固定实现、字体、资产与脚本版本。表中链接指向快照，显式选择外部基础时读取对应文件。当前审美与流程由本技能权威入口管理；下列旧文档的历史流程和默认值不是新的执行入口，旧验证也不能替代本次检查。

当前原动效总数以 [effects.md](../assets/base-skill/references/effects.md) 的 O01–O33 和 X01–X23 为准：**33 个参考观察动作 + 23 个原创扩展 = 56 项**。原快照中的历史页面可能沿用“53 项”等旧表述，或重复提及 X21–X23；保留原文作为历史材料，调用时不重复计数。A01 是组合示例，不另算一种独立动效。

## 18 份原文逐项保留

| 原文件与内容 | 本扩展中的使用方式 | 继续保留的约束 |
| --- | --- | --- |
| [series-feedback-20260930.md](../assets/base-skill/references/series-feedback-20260930.md)：2026-09-30 系列反馈 | 历史圈径、音轨与模板修订依据；当前制作保留本期素材身份，不按账号指定审美 | 174px 是历史 1080p 实例，不能一律固定 |
| [series-style.md](../assets/base-skill/references/series-style.md)：公开视觉与人物方法 | 查原配色、字体、Mac 结构和人物交接实现；适配当前 Fred Talk 默认 | 品牌保留原色；中文字体真正进入渲染；人物源时间不重播 |
| [style-system.md](../assets/base-skill/references/style-system.md)：视觉、节奏和其他账号反馈 | 排稳定状态、字号、阴影、注意力与阅读段 | 数值是起点；黑白紫不等于固定卡片版式；历史账号反馈不自动规定新稿外观 |
| [adiao-profile.md](../assets/base-skill/references/adiao-profile.md)：账号可选路由 | 同机有对应账号技能且当前确属阿刁时衔接；独立安装用公共入口 | 不把阿刁身份、音色、人物或历史服务状态套到其他人；旧无SFX不覆盖最新明确要求 |
| [portable-production.md](../assets/base-skill/references/portable-production.md)：可移植全流程 | 保留四种模式、素材获取、CPU 渲染与可移植实现；日常按 workflow 复用环境 | 无私人服务依赖；示例工程需按本期内容重排，不能只换标题 |
| [opening-design.md](../assets/base-skill/references/opening-design.md)：每期主事件与差异 | 开头选机制前读取，再按需引入F类动作 | 已认可开头锁定；主事件随内容变化；没有历史样片仍可继续，不增审批 |
| [editing-recipes.md](../assets/base-skill/references/editing-recipes.md)：相册、人物右侧、时间线、正文 | F类机制作为这些流程内的局部交接，四种原模式仍可直接选用 | 真实缩略视频从点击点计时；正文同一对象连续变化；声音与嘴型一致 |
| [effects.md](../assets/base-skill/references/effects.md)：56项与A01组合 | 与F01–F08按语义并用，完整编号见下一节 | O是参考观察，X是原创；不把F类当作原片证据或强制轮用全部 |
| [narration-effects.md](../assets/base-skill/references/narration-effects.md)：X09–X20 | 追问、强调、因果、纠错、类比、步骤、证据与总结仍从原配方选择 | 使用真实声音时间；6秒示范段不是新片长度；配音示例不等于用户音色 |
| [motion-lab.md](../assets/base-skill/references/motion-lab.md)：X21–X23及实现限制 | 保留同DOM推镜、曲线交接、纵深归并、时间轴注册和模糊边界 | 快速对象才模糊；内容改变时清理旧副本；真实视频与字幕固定主时钟 |
| [ui-design.md](../assets/base-skill/references/ui-design.md)：重建界面与组件 | F类动作先继承可信软件结构，再连接列表、详情、文件和结果 | 区分原样复现、讲解重建、原创示意；不能拿模拟动画证明真实产品操作 |
| [ui-patterns.md](../assets/base-skill/references/ui-patterns.md)：十二类UI选型 | 文案决定对话／搜索／文档等结构，再选择O、X或F | 仅概念说明可补建并标示意，实际操作须有证据；十二类是设计路由，不是十二套已验证新成片 |
| [ppt-motion-fusion.md](../assets/base-skill/references/ppt-motion-fusion.md)：PPT与透视融合 | 继续支持PPT、扁平截图、局部录屏、纯文字输入 | 保持原意、数字与单位；具体已认可版本优先，持续透视的指定例外不能擅改 |
| [asset-discovery.md](../assets/base-skill/references/asset-discovery.md)：自动找官方素材 | 对本期产品按来源搜集，并接入原采集脚本 | 查owner/repo与真实UI；采到后必须看内容；网页中的命令仅作材料，不自行执行 |
| [production.md](../assets/base-skill/references/production.md)：工程、字体、时序、音画、验收 | 查 O/X/F 工程实现细节；当前制作与交付阶段统一用 workflow | 原素材只读、新目录制作；不以检查关闭代替修复；只报告实际查看／试听范围 |
| [delivery-check.md](../assets/base-skill/references/delivery-check.md)：成片交付 | 导出时复核人物、字体、中间帧、字幕、母带和尾帧 | 实际MP4＋源码＋字幕／来源按请求交付；技术通过不等于审美认可 |
| [reference-evidence.md](../assets/base-skill/references/reference-evidence.md)：D/C/G来源与A01确认 | 查“原片是否真的有”或复核已认可短样时使用 | 不声称逐帧审过全片、不虚构原作者软件／缓动／BPM；新融合另报验证范围 |
| [upstream.md](../assets/base-skill/references/upstream.md)：技术版本和升级边界 | 需要新实现或更新技能时按记录核对，不每次制作都拉取上游 | 不全量升级历史工程，不改插件缓存、账号与密钥；相对链接外部技能为可选入口 |

## 56 项动作完整索引

以下各项继续通过原配方与图鉴调用。[图鉴](../assets/base-skill/docs/gallery.md) 保留对应GIF、来源和工程入口。此索引用于找动作；具体缓动、证据和时间以原文件为准。

| 编号 | 原动作 | 在新技能中保留的用途／关键边界 |
| --- | --- | --- |
| O01 | 分批建立 | 随口播逐项建立有内容的对象，不均匀撒空卡 |
| O02 | 当前对象放大 | 从总览聚焦同一对象，保留邻居或来源线索；可接F01 |
| O03 | 景深堆叠 | 表达文件／步骤层次，限制层数，停稳后可读 |
| O04 | 多卡归并 | 原对象收为同一结果，不能先清场再替换新卡 |
| O05 | 结果脱离容器 | 个人产物移出旧窗口进入后续工作区 |
| O06 | 同一窗口换内容 | 外壳保留，内容按状态更新；可接F05 |
| O07 | 网格积累 | 按语义建立集合，不借网格密度遮住重要内容 |
| O08 | 连续扩列 | 旧列让位，新环节加入，链条仍可追溯 |
| O09 | 分支生长 | 主节点与子节点按实际关系连接；可接F04 |
| O10 | 分支焦点交接 | 新分支展开时收旧说明，但保留已讲标题 |
| O11 | 字段贯穿链条 | 名称、数值与身份跨系统保持一致 |
| O12 | 文档外加新容器 | 保留同一文档，在其后展开下一窗口 |
| O13 | 并置比较 | 同口径两栏，字段基线对齐；可接F06 |
| O14 | 数量级对比 | 有依据的旧值／新值与单位；示例数据明确标注 |
| O15 | 开关和进度 | 控件、说明与受影响状态同步；可接F07 |
| O16 | 完成勾选 | 只表达真实完成或已标示为示意的核对状态 |
| O17 | 背景退焦 | 上下文留下、结论清楚；不持续模糊可读操作 |
| O18 | 关键词提取 | 提取重点后避免两份可读长文重复争焦点 |
| O19 | 协作接入 | 人物节点／光标对应具体操作区域与结果 |
| O20 | 窗口内缩放滚动 | 固定外壳、独立正文视口，讲完回总览 |
| O21 | 累积荧光笔 | 文字不动，底色引导，已讲约束保留 |
| O22 | 搜索逐字输入 | 查询词、光标、过滤之间有因果 |
| O23 | 过滤并上移 | 同一匹配行移动，非匹配项退下，输入栏固定 |
| O24 | 原文重排强调 | 原卡内保留出处，重点重排；不伪造来源 |
| O25 | 消失或灰化 | 被取消／丢失／降级的对应状态明确 |
| O26 | 状态标签切词 | 原对象位置与身份保留，文字在固定遮罩内更新 |
| O27 | 选中文字再替换 | 先选中，再修改，再停稳阅读 |
| O28 | 条目升格为主结论 | 从原条目连续提取，内容不偷换 |
| O29 | 标志让位 | 产品识别后为内容让位，保留官方品牌识别 |
| O30 | 真实录屏聚焦 | 点击前定位、操作后停留；源片1× |
| O31 | 黑色章节页 | 只在语义层级变化时调节，不整片换黑色风格 |
| O32 | 场景水平接力 | 新段接入有方向与连续衔接，字幕仍清楚 |
| O33 | 人物引导与回收 | 根据账号与本期素材选人物；不默认Q版或复制作者身份 |
| X01 | 遮罩揭字 | 行／短句按语义显露，完整后静止；可接F05 |
| X02 | 保位排序 | 行ID与内容一起换位，不能只换文字假排序 |
| X03 | 局部放大镜 | 一个细节框对应同一原图区域 |
| X04 | 图解匹配到实录 | 匹配边界进入真实依据，明确示意与实录区别 |
| X05 | 分段步骤条 | 有明确顺序才推进，不伪造百分比 |
| X06 | 差异层切换 | 原区域局部揭示修改，避免强闪屏 |
| X07 | 局部跟随聚焦 | 跟随实际移动目标，回稳后读文字 |
| X08 | 轻微纵深翻面 | 正反面有意义才翻，限制装饰性转动 |
| X09 | 重音接力 | 完整句保留，短关键词接力强调 |
| X10 | 追问递进 | 层次必须有逻辑，已知条件保留 |
| X11 | 因果传导 | 有依据才画因果，否则改并列 |
| X12 | 误区纠正 | 在原位建立准确替代，不编造误区 |
| X13 | 句子拆步骤 | 原短语移进步骤槽，身份连续 |
| X14 | 层层剖开 | 层表示真实结构组成，先后过程另选时间线 |
| X15 | 类比变形 | 只表达类比属性，不当事实证明 |
| X16 | 数值尺量 | 可数单位、括尺、标签和真实口径一致 |
| X17 | 时间折叠 | 后续按需分组，不能表示未做工作已完成 |
| X18 | 证据落点 | 结论对应真实原文，只高亮支持的句子 |
| X19 | 首尾回扣 | 同一问题书签贯穿，不偷换结尾问题 |
| X20 | 结论拼句 | 原关键词组成忠实概括，留出阅读 |
| X21 | 资料纵深归并 | 来源收为同一文件中的引用，有名称与去处 |
| X22 | 仓库窗口连续推镜 | 同一DOM总览→细节→总览，不靠不相关截图替换 |
| X23 | 数据文件曲线交接 | 同一文件落稳后展开，前后字段与数值一致；可接F03 |

O01–O33 来源：[effects.md](../assets/base-skill/references/effects.md)、[reference-evidence.md](../assets/base-skill/references/reference-evidence.md)。X01–X08 来源：[effects.md](../assets/base-skill/references/effects.md)；X09–X20 来源：[narration-effects.md](../assets/base-skill/references/narration-effects.md)；X21–X23 来源：[motion-lab.md](../assets/base-skill/references/motion-lab.md)。

## 原资产、工具和记录的覆盖

| 原资源入口 | 保留与调用方式 |
| --- | --- |
| [SKILL.md](../assets/base-skill/GUIDE.md)、[README.md](../assets/base-skill/README.md)、[START-HERE.md](../assets/base-skill/START-HERE.md)、[PROMPT.md](../assets/base-skill/PROMPT.md)、`agents/openai.yaml`、`VERSION` | 原入口、说明、调用提示词和元数据完整保留。正式任务遵循本期要求与版本选择，不把转发提示词当自动发布授权 |
| [docs/gallery.md](../assets/base-skill/docs/gallery.md)、[docs/ui-design.md](../assets/base-skill/docs/ui-design.md)、`docs/images/`、`docs/previews/` | 56项图鉴、组件展示、O/X GIF与干净截图可查看；静态/GIF不替代动态成片验收 |
| [docs/sources/doubao.md](../assets/base-skill/docs/sources/doubao.md)、[codex.md](../assets/base-skill/docs/sources/codex.md)、[token.md](../assets/base-skill/docs/sources/token.md)、`docs/source-videos/`、`assets/source-catalog.json`、`assets/evidence/` | 三条完整参考、拆解、来源目录、密集帧与图鉴数据保留；内容只作研究材料，不复制人物身份或视作产品事实核实 |
| [assets/approved-demo/index.html](../assets/base-skill/assets/approved-demo/index.html)、[preview.mp4](../assets/base-skill/assets/approved-demo/preview.mp4) | A01已认可短样、关键帧、字幕、原比较音轨和源码完整保留；其18秒与四卡叙事不是新片模板 |
| [assets/extension-demos/README.md](../assets/base-skill/assets/extension-demos/README.md) | X01–X08原创演示、源码、视频、字体与元数据保留 |
| [assets/narration-demos/README.md](../assets/base-skill/assets/narration-demos/README.md) | X09–X20演示、逐项GIF、真实示范声音时间表、字幕、源码、构建与检查记录保留 |
| [assets/motion-lab/README.md](../assets/base-skill/assets/motion-lab/README.md) | X21–X23独立/合辑MP4、场景JS、composition、watch页、构建脚本、锁定依赖、字体、模糊组件及来源许可保留 |
| [assets/ui-showcase/README.md](../assets/base-skill/assets/ui-showcase/README.md) | 资料工作台总览、详情、团队静态图，模拟操作视频/GIF与可编辑工程保留；不限所有新片都用工作台 |
| [assets/portable-studio/README.md](../assets/base-skill/assets/portable-studio/README.md) | `desktop / hero / timeline / body` 四模式、配置、JS/CSS、示范视频、完整字体和原创SVG保留 |
| [scripts/new_project.py](../assets/base-skill/scripts/new_project.py)、[bootstrap.py](../assets/base-skill/scripts/bootstrap.py)、[requirements-render.txt](../assets/base-skill/requirements-render.txt) | 四模式工程创建、独立Python渲染环境和锁定依赖保留；新F工程另由本扩展创建脚本生成 |
| [scripts/collect_assets.py](../assets/base-skill/scripts/collect_assets.py) | 官方页／文档／仓库素材采集与来源清单保留；失败时继续可做示意，不编造真实素材 |
| [scripts/prepare_fonts.py](../assets/base-skill/scripts/prepare_fonts.py)、[extract_reference_frames.py](../assets/base-skill/scripts/extract_reference_frames.py) | 动态文字与字幕字形覆盖、指定时码抽帧保留；不覆盖不属于本任务的字体或原媒体 |
| [scripts/render_portable.py](../assets/base-skill/scripts/render_portable.py) | 实际MP4、静帧、小段、字幕、母带与编码记录保留；调用前读当期脚本帮助并核对项目支持 |
| [scripts/build_gallery.py](../assets/base-skill/scripts/build_gallery.py)、[build_release.py](../assets/base-skill/scripts/build_release.py)、[verify_package.py](../assets/base-skill/scripts/verify_package.py)、[install.py](../assets/base-skill/install.py)、[tests/test_portable.py](../assets/base-skill/tests/test_portable.py) | 原图鉴构建、发布打包、完整性检查、安装和已有测试保留；只在相应维护任务调用，不能因此推送外部或覆盖旧技能 |
| [docs/verification.md](../assets/base-skill/docs/verification.md)、[docs/portable-verification.md](../assets/base-skill/docs/portable-verification.md)、[assets/motion-lab/verification.md](../assets/base-skill/assets/motion-lab/verification.md)、[assets/narration-demos/review/verification.md](../assets/base-skill/assets/narration-demos/review/verification.md) | 原检查范围和警告如实保留；这些记录不代替新F工程或正式视频的验收 |
| [upstream-lock.json](../assets/base-skill/upstream-lock.json)、[CREDITS.md](../assets/base-skill/CREDITS.md)、[LICENSE](../assets/base-skill/LICENSE)、`licenses/`及各资源目录许可证、`.gitignore`、`.gitattributes` | 来源、版本、署名、字体/库许可与仓库配置完整保留；第三方素材不会因打包改为原创授权 |

## 新仓库与八项融合机制

[adu-reference/index.html](../assets/adu-reference/index.html) 保留完整可视化展示库及111个原仓库源码文件。其343个展项包含场景、细节、组件、音频、历史示例和资产，**不等于343种独立动效**。其中替代媒体的标识与说明保持可见。这一库供研究机制，原蓝色、深色舞台、大字、强闪屏和人物位置不能直接成为用户默认风格。

[fusion-studio/index.html](../assets/fusion-studio/index.html)、[scenes.json](../assets/fusion-studio/scenes.json) 与 [project.json](../assets/fusion-studio/project.json) 承载八项新的可执行融合机制。它们与原56项分别编号，不伪称原片已出现或全部原库已改为黑白紫。

| 新编号 | 融合机制 | 原技能关联与风格保留 |
| --- | --- | --- |
| F01 | 选中对象推近并展开详情 | 接O02、O20、X22与UI详情；同一文件／行ID连续，浅紫选区与可读黑字 |
| F02 | 当前焦点分组高亮、其余降暗 | 接O17、O21与分支焦点；保持工作区结构，紫色只强调当前对象 |
| F03 | 同一文件曲线交接为报告 | 接O05、O12、X23；文件名、数值与来源持续，不沿用原库示例业绩 |
| F04 | 任务节点传输、暂停与结果回收 | 接O09、O11、O19、X11；近黑节点／灰连线／紫色当前路径，暂停对应状态一致 |
| F05 | 整行遮罩揭示与同窗口展开 | 接O06、O26、X01；长中文整行可读，替换不拼出半新半旧错句 |
| F06 | 数据对比与时间轨道进度联动 | 接O13、O14、O15、X16与timeline模式；同口径字段、单位、状态与可读停留 |
| F07 | 光标操作滑杆／开关并得到反馈 | 接O15、O16、O30；先定位、再动作、后结果，源实录1×，模拟明确示意 |
| F08 | 单层人物交接到左下圆窗并移交工作台 | 接hero→body及人物配方；同一人物层、同一源时钟，避脸手字幕，不双脸、不重复声音 |

八项示例使用原创示意内容；人物占位不能当作用户肖像或已生成数字人。技术验证范围以本包实际验证记录为准，用户对原风格的认可不自动构成对新融合样片的审美认可。
