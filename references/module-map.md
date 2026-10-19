# 四层归属与兼容映射

唯一推荐入口是 `ui-motion-fusion`，显示为“我的 UI 动效剪辑”。本文件管理规则的归属与资源位置；制作读[第一层](workflow.md)，外观读[第二层](style-profiles.md)，实现读[第三层](library.md)，溯源读[第四层](history.md)。

## 一条规则只有一个维护位置

| 问题 | 当前权威位置 | 其他文件如何使用 |
| --- | --- | --- |
| 任务模式、规则优先级与加载路线 | [SKILL.md](../SKILL.md) | 链接主入口，不重写一套优先级 |
| 样片／整片阶段、母带、来源、时钟、交付与环境复用 | [workflow.md](workflow.md) | 技术模块只补充自身接口与检查，不另设审批阶段 |
| 怎样理解口播并选择画面 | [script-visual-planning.md](script-visual-planning.md) | 方法示例保留；分镜记录字段沿用 workflow |
| 怎样完整学习参考并调用逐句证据 | [source-study-guide.md](source-study-guide.md) | [来源注册](source-study-sources.json)定位已登记原片的文本证据，[方法目录](source-study-methods.json)存候选；主入口默认路由，不复制整套规则 |
| 把口播判断接入素材、生成与剪辑源码 | [semantic-directing.md](semantic-directing.md) | 口播任务默认进入；[S 配方](semantic-editing-recipes.json)存适用条件，[组件](../assets/editing-kit/README.md)存实际 API，不另起一套流程 |
| 本用户在不同语境的载体与动作偏好 | [broll-preferences.md](broll-preferences.md) | 新反馈更新对应条件；原问卷／样片证据留在第四层 |
| AIGC 使用时机、动作、资产复用、节奏与画风连续性 | [aigc-directing.md](aigc-directing.md) | 其他入口只链接此规则；[aigc-assets.json](aigc-assets.json)维护风格、认可资产与原址；生成接口仅维护技术协议 |
| 账号选择及已确认风格 | [style-profiles.md](style-profiles.md) 与对应 profiles 文件 | 色值、人物、角色及授权范围不写成通用模块默认 |
| user-ui 当前正文展示与连续剪辑方向 | [Fred direction_contract](evidence/fred-reference-approved-20261015.json) 与[使用说明](fred-ui-direction.md) | 档案注册返回内嵌约束，默认导演上下文读取；其他文档只链接，逐句事实保留在研究数据，不替换 A01／女孩／独立账号的原认可 |
| 样片确认事件及各入口展示 | [evidence](history.md) 中的原话、版本与范围；[风格注册表](profiles/registry.json)定位视频与实现 | AIGC 注册集按风格引用，能力目录和首页做索引；新确认同时检查 styles 与 direct 是否可定位，不在总述重复维护“最新状态” |
| 动作、排版、设备、人物、软件与素材生成实现 | [library.md](library.md) 路由到专属模块 | 只维护该能力的方法、参数、源码接口和限制 |
| 工程创建／导出与真实后端合同 | [engine-routing.md](engine-routing.md) | 保留原脚本协议，不虚构统一能力 |
| 来源、反馈原话、旧验证、旧规则 | [history.md](history.md) 及原证据文件 | 作为依据，不覆盖当前规则 |

出现冲突先按主入口优先级选定当前约束，再回到上表唯一位置修正。入口只保留必要指引，不把同一段规则复制到五份文档。色盘、固定时长、左下圆窗大小与模板帧率保留为历史起点；本期值落在项目。接口合同可以重复提示关键边界，但不能另创相反要求。

## 新参考怎样加入而不堆出第二套 Skill

原片逐句事实进入 `evidence/<source>/` 并在来源表登记；同一语义操作追加到现有方法的 `source_examples`。只有解决的理解问题或状态链确实不同、现有方法不能合理表达时才新增 ID，不以作者、视频或视觉包装分库。条件扩展保留旧字段与原例证的追溯记录。

用户新选的外观/剪辑方向更新当前档案的同一 `direction_contract`；新可执行效果更新对应实现；某一期秒点、坐标、对象和价格只留本期工程。数量与条目以注册表为准，首页和指南只作导航。安装证据、方法查询、默认导演上下文和真实渲染是不同状态，升级检查需说明实际到哪一步。

## 旧入口变为内部资源

| 已停用的原入口 | 主入口现在按需读取 | 原位置继续保留 |
| --- | --- | --- |
| ui-motion-explainer | [O/X 来源索引](coverage.md)、基础创建／渲染路由 | 样片、字体、四类工程模式、采集与渲染脚本、全部原 references |
| ai-ui-director | [软件操作](software-production.md) | 103 条注册记录、源码、参数、工作室与导出器 |
| adiao-ui-editing | [人物剪辑](presenter-editing.md) 与阿刁档案 | 账号创意细则、本机工程接续和生产参考 |
| apple-kinetic-promo | [动态排版](kinetic-type.md) | 原宣传资料、素材与清晰度经验 |
| prompt-motion-replica | [参考复刻](reference-replication.md) | 230 条来源记录、逐案例源码、状态、引擎和许可证 |
| editorial-ui-motion | [截图与编辑式动效](editorial-motion.md) | 截图入口、Remotion 模板、语义机制与参考证据 |

主技能原 F01–F08、基础快照、adu 来源及脚本继续保留。原入口副本已归档，原 `SKILL.md` 从菜单发现中停用；以前保存的 `SKILL.legacy.md` 也继续保留。运行时直接按[资源注册表](resource-registry.json)定位源码和脚本，不依赖旧 Skill 重新触发，也不回读兼容入口形成循环。

## 独立能力与本机范围

`adiao-series-guide`、`adiao-workflow` 已纳入内部指南，只在账号匹配且需要接续时读取。HyperFrames、Remotion 及其他视频工具指南也由主入口按后端需求定位，不自动升级。42 类指南见[实际工具索引](backend-guides.json)；其中原独立入口要求与默认外观服从当前主流程和风格。网页布局、无障碍等技能继续服务交互网站，不因做视频级联加载；motion prompt 能力也不替代可定位时间的工程。

本次权威入口是 `local-only/ui-motion-fusion`。历史 `local-only/ui-motion-fusion`、插件缓存、`.agents` 副本和其他技能的源码／依赖没有同步重写；被实际发现的旧剪辑入口和重复入口通过用户级配置停用。跨对话调用与可恢复归档见[本机使用](global-use.md)。

运行 `python -X utf8 scripts/ui.py status` 或 `modules check` 检查入口与资源；`styles -- resolve` 查样片与实现。base／fusion 的同机底座优先和包内快照回退见引擎路由；director／replica／editorial 按注册表使用原目录。统一调用不表示所有库物理打包或全部已重测。目录状态和计数见[效果库](library.md)，不得相加成已验证效果总数。
