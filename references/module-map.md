# 规则归属与兼容映射

唯一入口是 `ui-motion-fusion`。本文件管理每类规则的维护位置和旧资源映射；主入口只负责加载，专属文档各管一件事，历史原文不接管当前制作。

## 全文要求、参考证据与实现资源

[requirements.json](requirements.json)是现行要求的完整正文清单。每个新窗口从 `ui.py requirements --part 1` 读到最后一页；清单内所有正文都要读完，不能因本期暂未使用某个分支就只读摘要或跳过条款。读取规则不等于启用所有功能：AIGC、整片复刻等条件规则仍按任务适用。读取动作接入[主流程](workflow.md)，不形成用户审批或签字回执。

| 内容类别 | 读取与维护方式 | 不能代替什么 |
| --- | --- | --- |
| 现行全局要求及仍有效的条件规则 | 在下表对应文档维护，并登记全文清单；新增、迁移或拆分要求时同步更新清单 | 标题、摘要、候选命中、旧聊天记忆不能代替正文全文 |
| 历史反馈、问卷、案例与原片证据 | 保留原话、版本、时间与适用范围，按本期语境追溯；案例用来理解条件与判断 | 不能从一例推出新全局规则，或让历史条款覆盖当前要求 |
| 源码、配方、资产目录与后端接口 | 保留全部功能、来源和旧链接，选中时检查实际 API、依赖、限制与可用状态 | 不要求新窗口预读全部源码；目录存在与历史验证不等于本期可运行或已认可 |

所有仍生效的全局要求必须进入登记的权威正文。旧源 Skill、技术指南、示例和案例中如有尚未归并的有效要求，应迁入对应正文并登记，原文保留作来源；不能藏在按需实现里，也不能复制成第二套要求。公开清单登记规则，不收录私人素材、凭证或本机资源映射。

## 一条规则只有一个维护位置

| 问题 | 当前权威位置 | 其他文件如何使用 |
| --- | --- | --- |
| 任务模式、规则优先级与加载路线 | [SKILL.md](../SKILL.md)、[全文清单](requirements.json) | 入口规定读取与执行，清单定位正文，不重写一套优先级 |
| 制作阶段、母带、来源、交付与环境复用 | [workflow.md](workflow.md) | 技术模块只补充接口，不另设审批阶段 |
| 当前具体 UI 基准、Fred 补充、AE 感、开头与禁忌 | [aesthetic-preferences.md](aesthetic-preferences.md) | 其他文档引用，不从账号或效果库重选默认；原话与认可范围保留 |
| 怎样理解口播、选材并串起事件 | [script-visual-planning.md](script-visual-planning.md) | 示例用于迁移判断，不在每份文档重写导演方法 |
| 怎样完整学习参考并调用逐句证据 | [source-study-guide.md](source-study-guide.md) | 规则正文全文读取；[来源注册](source-study-sources.json)定位已登记原片的文本证据，[方法目录](source-study-methods.json)存候选，原片证据按本期适用查看 |
| 语义配方到实现的接线 | [semantic-directing.md](semantic-directing.md) | [S 配方](semantic-editing-recipes.json)存适用条件，[组件](../assets/editing-kit/README.md)存实际 API |
| 方法与实现查询、候选限制 | [selection-workflow.md](selection-workflow.md) | 不把排序当创作决定，不重写生产流程 |
| 不同语境的载体与动作条件案例 | [broll-preferences.md](broll-preferences.md) | 原问卷与样片证据保留，整体偏好仍回到审美入口 |
| AIGC 使用时机、动作、资产复用、节奏与画风连续性 | [aigc-directing.md](aigc-directing.md) | 其他入口只链接此规则；[aigc-assets.json](aigc-assets.json)维护风格、认可资产与原址；生成接口仅维护技术协议 |
| 最终动漫表演与连续生成的适用要求 | [anime-video-generation.md](anime-video-generation.md) | 条件规则全文读取，实际生成通道和参数按本期可用接口检查 |
| 本期 AIGC 画风与素材身份 | [style-profiles.md](style-profiles.md)、[aigc-assets.json](aigc-assets.json) | 画风不固定主角；本期原声、人物与固定IP不受UI路由改变 |
| 可用实现、来源及能力状态 | [library.md](library.md)及对应实际展示／源码 | 服务当前审美基准和本期内容，候选不自动获认可 |
| 样片确认事件及各入口展示 | [evidence](history.md) 中的原话、版本与范围；[风格注册表](profiles/registry.json)定位视频与实现 | AIGC 注册集按风格引用，能力目录和首页做索引；新确认同时检查 styles 与 direct 是否可定位，不在总述重复维护“最新状态” |
| 动作、排版、设备、人物、软件与素材生成实现 | [library.md](library.md) 路由到专属模块 | 只维护该能力的方法、参数、源码接口和限制 |
| 工程创建／导出与真实后端合同 | [engine-routing.md](engine-routing.md) | 保留原脚本协议，不虚构统一能力 |
| 整片参考的适用范围与表达链 | [reference-replication.md](reference-replication.md) | 与当前 UI 基准共同使用；原片和源码按所选参考查看 |
| 人物构图、素材剪法与源时钟配合 | [presenter-editing.md](presenter-editing.md) | 保留当前人物与原声要求，不由旧账号样片重定全局外观 |
| 同一导演计划、后端派生字段与技术状态 | [director-plan-contract.md](director-plan-contract.md) | 阶段与方法文档只引用；不同后端不手写第二套语义和时间 |
| 实际观看、试听、失败定位及内部返修 | [visual-quality.md](visual-quality.md) | 实际结果与技术检查、用户认可分别记录 |
| 来源、反馈原话、旧验证、旧规则 | [history.md](history.md) 及原证据文件 | 作为依据，不覆盖当前规则 |

出现冲突先按本期最新用户要求与主入口确定适用范围，再回到上表唯一位置修正。2026-10-21 问卷及后续原话中的审美条款统一在[审美偏好](aesthetic-preferences.md)维护：以当前已认可正文为直接基准，Fred 原片为补充；旧“统一黑紫”或“取消 Fred 默认”等概括只作历史。全局默认留在权威正文，某期实际时长、人物窗坐标、帧率及经允许的局部覆盖留在项目，不从一例推成通用参数。

## 新参考怎样加入而不堆出第二套 Skill

原片逐句事实进入 `evidence/<source>/` 并在来源表登记；同一语义操作追加到现有方法的 `source_examples`。只有解决的理解问题或状态链确实不同、现有方法不能合理表达时才新增 ID，不以作者、视频或视觉包装分库。条件扩展保留旧字段与原例证的追溯记录。

新认可或否决先保存实际原话、文件／版本和范围，再更新上述唯一位置；默认风格变化必须来自用户明确要求，不能从一次条目选择推断。更新现行要求时核对全文清单仍覆盖其完整正文；新增要求文档先登记再作为执行依据。新可执行效果更新对应实现；某一期秒点、坐标、对象和价格只留本期工程。首页与指南只作导航，安装、查询、渲染、观看和认可分别记录。

## 旧入口变为内部资源

| 已停用的原入口 | 主入口现在按需读取 | 原位置继续保留 |
| --- | --- | --- |
| ui-motion-explainer | [O/X 来源索引](coverage.md)、基础创建／渲染路由 | 样片、字体、四类工程模式、采集与渲染脚本、全部原 references |
| ai-ui-director | [软件操作](software-production.md) | 103 条注册记录、源码、参数、工作室与导出器 |
| adiao-ui-editing | [人物剪辑](presenter-editing.md)，账号档案仅历史查询 | 账号创意细则、本机工程接续和生产参考 |
| apple-kinetic-promo | [动态排版](kinetic-type.md) | 原宣传资料、素材与清晰度经验 |
| prompt-motion-replica | [参考复刻](reference-replication.md) | 230 条来源记录、逐案例源码、状态、引擎和许可证 |
| editorial-ui-motion | [截图与编辑式动效](editorial-motion.md) | 截图入口、Remotion 模板、语义机制与参考证据 |

主技能原 F01–F08、基础快照、adu 来源及脚本继续保留。原入口副本已归档，原 `SKILL.md` 从菜单发现中停用；以前保存的 `SKILL.legacy.md` 也继续保留。运行时直接按[资源注册表](resource-registry.json)定位源码和脚本，不依赖旧 Skill 重新触发，也不回读兼容入口形成循环。

## 独立能力与本机范围

`adiao-series-guide`、`adiao-workflow` 已纳入内部指南，只在账号匹配且需要接续时读取历史资料与实现。HyperFrames、Remotion 及其他视频工具指南也由主入口按后端需求定位，不自动升级。42 类指南见[实际工具索引](backend-guides.json)；其中仍适用的全局要求按上文归入现行正文和全文清单，旧入口的默认外观不覆盖当前基准。网页布局、无障碍等技能继续服务交互网站，不因做视频级联加载；motion prompt 能力也不替代可定位时间的工程。

实际安装目录中的 `SKILL.md` 是执行入口；`local-only/` 路径、归档、插件缓存、`.agents` 副本和其他技能目录不因出现在旧记录里而成为当前入口。先核对实际调用路径，不同步重写无关副本或它们的源码／依赖。跨对话调用见[本机使用](global-use.md)。

运行 `python -X utf8 scripts/ui.py status` 或 `modules check` 检查入口与资源；历史样片用 `styles -- resolve` 定位。实际后端版本与调用以引擎路由为准；统一入口不表示所有库均已打包、可执行或重测。目录状态和计数见[效果库](library.md)，不得相加成已验证效果总数。
