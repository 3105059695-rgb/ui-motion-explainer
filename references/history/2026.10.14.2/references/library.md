# 第三层：按表达目的选能力

先由[主流程](workflow.md)确定这一段要让观众理解什么，再在这里选动作；外观与人物身份读取[账号风格](style-profiles.md)。一次只展开相关配方和源码，不并行加载整套旧 Skill。

详细条目、原路径、实现状态、历史检查和认可范围统一查 [capability-catalog.json](capability-catalog.json)。它是可检索目录，不是运行时预设表；`Rxx`、`Oxx` 不能直接当作创建命令的 `--scene`。

## 按句意找入口

| 这一段要表达什么 | 优先查什么 | 具体入口 |
| --- | --- | --- |
| 建立主题、问题、章节 | O01/O29/O31，X01/X09/X10，R01/R02 | [动态文字](kinetic-type.md)、[R 配方](local-video-design-distillation.md) |
| 从全貌聚焦重点，再返回上下文 | O02/O17/O20/O21，X03/X07/X22，F01/F02，R12 | [原动作图鉴](../assets/base-skill/docs/gallery.md)、[F 机制](mechanisms.md)、[截图舞台](editorial-motion.md) |
| 同一对象跨场、来源进入成果 | O04/O05/O08/O11/O12/O28/O32，X04/X21/X23，F03/F05，R05/R08/R16 | [对象与运镜](motion-direction.md)、[F 机制](mechanisms.md)、[R 配方](local-video-design-distillation.md) |
| 看懂步骤、因果、执行与异常恢复 | O09/O10/O15/O16/O19/O30，X05/X11/X12/X13/X14/X17，F04/F07，R03/R04/R07/R09/R13 | [软件操作](software-production.md)、[口播动作](../assets/base-skill/references/narration-effects.md) |
| 比较、排序、分类、数字与返工成本 | O03/O07/O13/O14/O23/O25，X02/X06/X16，F06，R10/R11/R14/R15 | [原动作配方](../assets/base-skill/references/effects.md)、[F 机制](mechanisms.md)、[R 配方](local-video-design-distillation.md) |
| 抽象概念、情绪和人物反应 | O33，X08/X15，F08，R06 | [人物与实拍](presenter-editing.md)、[动漫连续动作](anime-video-generation.md) |
| 读字、证据、修改原文与结论回扣 | O06/O18/O22/O24/O26/O27，X18/X19/X20，F05，R16 | [文字与节拍](kinetic-type.md)、[字体和花字](qiaomu-typography.md) |
| 桌面手机协作、指定原片复刻 | 按设备关系或具体案例选源工程 | [设备联动](high-fidelity-device-motion.md)、[参考复刻](reference-replication.md) |

相近编号可以承担同一种解释任务，不表示必须叠加。R14 的版本栈只适用于版本史或修改成本；讲同一答案的局部修改，仍按用户已有偏好保留主体并突出变化句。

## 库的状态要分开看

| 家族 | 保留内容 | 当前应怎样理解 |
| --- | --- | --- |
| O01–O33 | 33 个原片观察、时间码、GIF 与重建建议 | 观察记录；不是 33 个独立运行预设 |
| X01–X23 | 23 个原创扩展、配方、演示源码及历史验证 | 源码存在；旧验证只对对应演示有效，不能推断已获用户认可 |
| F01–F08 | [8 个共用工作室场景](../assets/fusion-studio/scenes.json)、源码和[历史检查](verification.md) | 有运行与导出记录；F08 真人嘴型、裁切和音画同步未被该演示验证 |
| R01–R16 | [本地参考的 16 条分析配方](local-video-design-distillation.md)与[证据](evidence/local-video-5c2f8b41.json) | 用户喜欢原参考；没有本案例专属预设实现，也未完整正常速度视听 |
| 软件操作 | [103 条注册记录](../../../../../../ai-ui-director/references/presets.json)、[用途目录](../../../../../../ai-ui-director/references/preset-catalog.md)及原源码 | 103 条 ID 均定位到候选源码模块；不是本轮 103 项运行通过 |
| 参考案例 | [230 条来源目录](../../../../../../prompt-motion-replica/references/catalog.json)、[重建状态](../../../../../../prompt-motion-replica/references/rebuild-status.json)与工程 | 当前[仅保留源码的存储模式](../../../../../../prompt-motion-replica/references/storage-mode.md)；许多旧音视频和比较图已清理，按当前指定案例恢复，批量生成仍停止 |
| 字体与花字 | [34 个字体文件](../assets/qiaomu-fonts/index.json)、[12 套搭配](../assets/qiaomu-fonts/pairings.json)、CSS、预览与导出入口 | 字体资源存在不等于当前稿件无缺字，需在实际后端接入 |
| 截图、人物、动漫、设备、动态字、adu | 9 个能力族各有原模块、来源与实现入口 | 查看机器目录 `families`；方法、模板、账号成片和外部生成服务不混为同一种预设 |

上述数量有重叠，**不相加成“已实现／已验证／已认可的动效数”**。本轮整理只核对路径与目录；没有重新渲染、播放整库或测试在线服务。

## 已认可的内容从这里接续

- [A01 基础短样](../assets/base-skill/assets/approved-demo/preview.mp4)：认可的是该短样组合与风格方向。[原证据](../assets/base-skill/references/reference-evidence.md)保留过渡警告及未可靠试听的边界。
- [方木档案](profiles/fangmu.md) → 本机样片与实现索引（原始资料未随公开包）：开头 v5 与 17 秒汽车样段已有明确认可；v3 实物／字幕实现继续保留，不能升格为整片审美认可。
- [阿刁档案](profiles/adiao.md) → [本机项目指针](../../adiao-series-guide/references/latest-project.json)：保留《失业手册》v3 开头修订接受范围；指针是历史项目入口，先核对本期。
- [阿刁动漫修订样片证据](evidence/anime-semantic-feedback-20261013.json)：认可抽象意思的具象事件与连续动作解释效果；女主仅属阿刁，方法可以共用。

## 机器检索与维护

`capability-catalog.json` 的路径相对 **ui-motion-fusion 根目录**解析；绝对路径是本机绑定。按 `semantic_routes` 找用途，按 `capabilities[].id` 查全部 80 个 O/X/F/R 编号，按 `software_presets`、`reference_cases` 查询外部子目录，按 `sample_records` 查询样片。

每项分别读取 `source`、`implementation`、`validation`、`user_approval`。`source-present` 仅代表源码或资源路径存在；历史报告存在不代表本轮测试通过，`unknown` 不得当作认可。缺失媒体会保留原路径并记为 `present: false`，不因此删除对应能力。

新增方法先更新它的原配方或实现，再补本目录路由与机器索引；认可只补具体版本、范围和证据。原库仍是详细内容的来源，不把整套源码、素材、旧规则复制到此层。[全部资源与原编号追踪](coverage.md)用于追溯，[模块映射](module-map.md)用于查引擎归属。
