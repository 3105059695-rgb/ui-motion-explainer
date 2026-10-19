# 四层归属与兼容映射

唯一推荐入口是 `ui-motion-fusion`，显示为“我的 UI 动效剪辑”。本文件管理规则的归属与资源位置；制作读[第一层](workflow.md)，外观读[第二层](style-profiles.md)，实现读[第三层](library.md)，溯源读[第四层](history.md)。

## 一条规则只有一个维护位置

| 问题 | 当前权威位置 | 其他文件如何使用 |
| --- | --- | --- |
| 任务模式、规则优先级与加载路线 | [SKILL.md](../GUIDE.md) | 链接主入口，不重写一套优先级 |
| 样片／整片阶段、母带、来源、时钟、交付与环境复用 | [workflow.md](workflow.md) | 技术模块只补充自身接口与检查，不另设审批阶段 |
| 怎样理解口播并选择画面 | [script-visual-planning.md](script-visual-planning.md) | 方法示例保留；分镜记录字段沿用 workflow |
| 本用户在不同语境的载体与动作偏好 | [broll-preferences.md](broll-preferences.md) | 新反馈更新对应条件；原问卷／样片证据留在第四层 |
| 账号选择及已确认风格 | [style-profiles.md](style-profiles.md) 与对应 profiles 文件 | 色值、人物、角色及授权范围不写成通用模块默认 |
| 动作、排版、设备、人物、软件与素材生成实现 | [library.md](library.md) 路由到专属模块 | 只维护该能力的方法、参数、源码接口和限制 |
| 工程创建／导出与真实后端合同 | [engine-routing.md](engine-routing.md) | 保留原脚本协议，不虚构统一能力 |
| 来源、反馈原话、旧验证、旧规则 | [history.md](history.md) 及原证据文件 | 作为依据，不覆盖当前规则 |

出现冲突先按主入口优先级选定当前约束，再回到上表唯一位置修正。入口只保留必要指引，不把同一段规则复制到五份文档。色盘、固定时长、左下圆窗大小与模板帧率保留为历史起点；本期值落在项目。接口合同可以重复提示关键边界，但不能另创相反要求。

## 六个兼容名称仍可用

| 原入口 | 现在按需读取 | 原位置继续保留 |
| --- | --- | --- |
| ui-motion-explainer | [O/X 来源索引](coverage.md)、基础创建／渲染路由 | 样片、字体、四类工程模式、采集与渲染脚本、全部原 references |
| ai-ui-director | [软件操作](software-production.md) | 103 条注册记录、源码、参数、工作室与导出器 |
| adiao-ui-editing | [人物剪辑](presenter-editing.md) 与阿刁档案 | 账号创意细则、本机工程接续和生产参考 |
| apple-kinetic-promo | [动态排版](kinetic-type.md) | 原宣传资料、素材与清晰度经验 |
| prompt-motion-replica | [参考复刻](reference-replication.md) | 230 条来源记录、逐案例源码、状态、引擎和许可证 |
| editorial-ui-motion | [截图与编辑式动效](editorial-motion.md) | 截图入口、Remotion 模板、语义机制与参考证据 |

主技能原 F01–F08、基础快照、adu 来源及脚本继续保留。六个旧 `SKILL.md` 是兼容路由，原文在各自的 `SKILL.legacy.md`；不并行加载七套完整规则，也不回读兼容入口形成循环。

## 独立能力与本机范围

`adiao-series-guide`、`adiao-workflow` 只在账号匹配且需要接续时读取。HyperFrames、Remotion 及其他视频工具按后端需求使用，不自动升级。网页布局、无障碍等技能继续服务交互网站，不因做视频级联加载；motion prompt 能力也不替代可定位时间的工程。

本次维护的是 `local-only/ui-motion-fusion`。历史 `local-only/ui-motion-fusion`、插件缓存、`.agents` 副本和其他技能的源码／依赖没有同步重写。跨对话调用见[本机使用](global-use.md)。

运行 `python -X utf8 scripts/ui.py status` 只检查入口与资源存在。base／fusion 的同机底座优先和包内快照回退见引擎路由；director／replica／editorial 仍依赖各自原目录。文档统一不表示所有库物理打包或全部已重测。目录状态和计数见[效果库](library.md)，不得相加成已验证效果总数。
