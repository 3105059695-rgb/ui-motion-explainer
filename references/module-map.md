# 规则归属与兼容映射

唯一入口是 `ui-motion-fusion`。本文件管理每类规则的维护位置和旧资源映射；主入口只负责加载，专属文档各管一件事，历史原文不接管当前制作。

## 一条规则只有一个维护位置

| 问题 | 当前权威位置 | 其他文件如何使用 |
| --- | --- | --- |
| 任务模式、规则优先级与加载路线 | [SKILL.md](../SKILL.md) | 链接主入口，不重写一套优先级 |
| 制作阶段、母带、来源、交付与环境复用 | [workflow.md](workflow.md) | 技术模块只补充接口，不另设审批阶段 |
| Fred Talk 默认、UI、AE 感、开头与禁忌 | [aesthetic-preferences.md](aesthetic-preferences.md) | 其他文档引用，不从账号或效果库重选默认；原话与认可范围保留 |
| 怎样理解口播、选材并串起事件 | [script-visual-planning.md](script-visual-planning.md) | 示例用于迁移判断，不在每份文档重写导演方法 |
| 怎样完整学习参考并调用逐句证据 | [source-study-guide.md](source-study-guide.md) | [来源注册](source-study-sources.json)定位已登记原片的文本证据，[方法目录](source-study-methods.json)存候选；主入口默认路由，不复制整套规则 |
| 语义配方到实现的接线 | [semantic-directing.md](semantic-directing.md) | [S 配方](semantic-editing-recipes.json)存适用条件，[组件](../assets/editing-kit/README.md)存实际 API |
| 方法与实现查询、候选限制 | [selection-workflow.md](selection-workflow.md) | 不把排序当创作决定，不重写生产流程 |
| 不同语境的载体与动作条件案例 | [broll-preferences.md](broll-preferences.md) | 原问卷与样片证据保留，整体偏好仍回到审美入口 |
| AIGC 使用时机、动作、资产复用、节奏与画风连续性 | [aigc-directing.md](aigc-directing.md) | 其他入口只链接此规则；[aigc-assets.json](aigc-assets.json)维护风格、认可资产与原址；生成接口仅维护技术协议 |
| 本期 AIGC 画风与素材身份 | [style-profiles.md](style-profiles.md)、[aigc-assets.json](aigc-assets.json) | 画风不固定主角；本期原声、人物与固定IP不受UI路由改变 |
| 可用实现、来源及能力状态 | [library.md](library.md)及对应实际展示／源码 | 服务 Fred Talk 默认和本期内容，候选不自动获认可 |
| 样片确认事件及各入口展示 | [evidence](history.md) 中的原话、版本与范围；[风格注册表](profiles/registry.json)定位视频与实现 | AIGC 注册集按风格引用，能力目录和首页做索引；新确认同时检查 styles 与 direct 是否可定位，不在总述重复维护“最新状态” |
| 动作、排版、设备、人物、软件与素材生成实现 | [library.md](library.md) 路由到专属模块 | 只维护该能力的方法、参数、源码接口和限制 |
| 工程创建／导出与真实后端合同 | [engine-routing.md](engine-routing.md) | 保留原脚本协议，不虚构统一能力 |
| 同一导演计划、后端派生字段与技术状态 | [director-plan-contract.md](director-plan-contract.md) | 阶段与方法文档只引用；不同后端不手写第二套语义和时间 |
| 实际观看、试听、失败定位及内部返修 | [visual-quality.md](visual-quality.md) | 实际结果与技术检查、用户认可分别记录 |
| 来源、反馈原话、旧验证、旧规则 | [history.md](history.md) 及原证据文件 | 作为依据，不覆盖当前规则 |

出现冲突先按本期最新用户要求与主入口确定适用范围，再回到上表唯一位置修正。2026-10-21 图片/视频问卷和后续原话补充：整库动作保持开放，设计/配色/动作分别判断，制作方式灵活。颜色与 UI 质感以[审美偏好](aesthetic-preferences.md)中最新确认的三条 Fred 原片关系为准，旧“统一黑紫”概括不能覆盖实际明暗、表面与强调色关系。此前 Fred Talk 整体默认继续保留；旧“取消 Fred 默认”仅作历史。具体色值、时长、人物窗坐标和帧率落在项目，不从一例推成所有视频的固定参数。

## 新参考怎样加入而不堆出第二套 Skill

原片逐句事实进入 `evidence/<source>/` 并在来源表登记；同一语义操作追加到现有方法的 `source_examples`。只有解决的理解问题或状态链确实不同、现有方法不能合理表达时才新增 ID，不以作者、视频或视觉包装分库。条件扩展保留旧字段与原例证的追溯记录。

新认可或否决先保存实际原话、文件／版本和范围，再更新上述唯一位置；默认风格变化必须来自用户明确要求，不能从一次条目选择推断。新可执行效果更新对应实现；某一期秒点、坐标、对象和价格只留本期工程。首页与指南只作导航，安装、查询、渲染、观看和认可分别记录。

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

`adiao-series-guide`、`adiao-workflow` 已纳入内部指南，只在账号匹配且需要接续时读取。HyperFrames、Remotion 及其他视频工具指南也由主入口按后端需求定位，不自动升级。42 类指南见[实际工具索引](backend-guides.json)；其中原独立入口要求与默认外观服从当前主流程和风格。网页布局、无障碍等技能继续服务交互网站，不因做视频级联加载；motion prompt 能力也不替代可定位时间的工程。

实际安装目录中的 `SKILL.md` 是执行入口；`local-only/` 路径、归档、插件缓存、`.agents` 副本和其他技能目录不因出现在旧记录里而成为当前入口。先核对实际调用路径，不同步重写无关副本或它们的源码／依赖。跨对话调用见[本机使用](global-use.md)。

运行 `python -X utf8 scripts/ui.py status` 或 `modules check` 检查入口与资源；历史样片用 `styles -- resolve` 定位。实际后端版本与调用以引擎路由为准；统一入口不表示所有库均已打包、可执行或重测。目录状态和计数见[效果库](library.md)，不得相加成已验证效果总数。
