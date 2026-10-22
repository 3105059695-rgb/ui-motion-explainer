# 效果库：按表达目的找实现

这里提供落实 **Fred Talk 整体视觉与剪辑默认** 的源码和方法，不能因方便调用某库而更换风格。先看[Fred 实际参考](fred-ui-direction.md)，结合整篇口播和逐句证据，再从 FredTalk、EditingKit、F、O/X、阿渡等条目选择适用部分，改编为本期对象和节奏。完整审美只在[审美偏好](aesthetic-preferences.md)维护，人物与 AIGC 的用途边界见[参考使用](style-profiles.md)。

详细条目、原路径、实现状态、历史检查和认可范围统一查 [capability-catalog.json](capability-catalog.json)。它是可检索目录，不是运行时预设表；`Rxx`、`Oxx` 不能直接当作创建命令的 `--scene`。

采用整体设计与采用运动函数分开记录：整体设计要落到本期的构图、材料、窗口关系、字级或层次；运动函数只证明对应动作被实现。先看所选场景的连续展示与源码，再改编布局，不先完成一套自创版式后补库名。每个选中条目按[引用格式](director-plan-contract.md#效果库设计引用)绑定自己的来源、共享文件中的定位及本期具体实现；另一项的截图或通用 EditingKit 文件不能代替这个来源。

实际脚本和资源通过 [resource-registry.json](resource-registry.json)接入 `scripts/ui.py`，用 `modules check` 核对。需要底层工具时用 `guides --id <工具名>` 定位[内部指南](backend-guides.json)，无需用户另行调用旧 Skill。`direct -- prepare` 提供本段设计候选与实际实现，普通制作不再优先推送几部旧整片。

[逐句来源方法目录](source-study-methods.json)统一保留秋芝及 Fred 各片例证，提供蒙版、对象交接、连续 B-roll/AIGC、开头与正文讲解的实际出处，默认按[研究接入](source-study-guide.md)选用。`Q-*` / `F-M*` 用于来源追溯，保留1条明确反例；方法记录不等于完整事件已实现。由同一 S 配方或 O/X/F/R 原语能够承担的部分继续复用，不重复造库。

Fred Talk 默认跨窗口继承；账号名称与目录不自动指定另一套外观。继承整体设计关系，不等于固定每条原片的色值、人物、对象、镜头顺序或时长；其他库的视觉包装需适配当前默认。

口播制作的配方接线见[语义导演](semantic-directing.md)。完整场景当前接通阿渡 21 场的内容绑定和源码实例化，但该技术覆盖不意味着可用阿渡外观替换 Fred Talk 默认；若不适合，改用 Fred 源码或做明确适配。完整场景与自定义实现的真实生产接口见[引擎路由](engine-routing.md)。S 编号不是 `--scene` 参数；源码、请求准备、实际素材和审美认可分别判断。

[打开可播放的组件演示](../assets/editing-kit/demo.html)。演示可用于观察整体构图、材料层次、窗口组织和动作；真实制作改编为本期内容。原 O/X/F/R、软件、参考继续按下表使用，不被新配方替代。

需要相关机制时查看[EditingKit 演示](../assets/editing-kit/demo.html)、[F 融合展示](../assets/fusion-studio/index.html)、[O/X 原库](../assets/base-gallery.html)、[阿渡展示与源码](../assets/adu-reference/index.html)及[72 秒融合预览](../assets/fusion-studio/previews/preview.mp4)。这些是实现候选，适用性、可执行性和认可范围逐项判断，不形成平行风格入口。

## FredTalk 公开源码接入

[打开 FredTalk 库](../assets/fredtalk-library/index.html)。固定上游版本 `eec77dcfa99318f565c391bf557f5d43042ec061`：目录共 432 条，普通检索纳入 101 条未归档公开源码；142 条归档公开条目和 189 条会员条目保留元数据供显式查询，本轮未下载其源码。它提供当前 Fred Talk 方向的重要实现来源，但目录标签与检索分数不能代替实际设计适用性判断。

`direct -- prepare` / `select` 中命中的条目使用 `kind:software-preset`、`id:fredtalk:<referenceId>`。先检查完整源码及其依赖：

```text
python -B -X utf8 scripts/ui.py inspect --kind software-preset --id fredtalk:<referenceId>
python -B -X utf8 scripts/ui.py fredtalk materialize --id fredtalk:<referenceId> --project <本期工程>
```

第二条命令会把核验过的源码及本地依赖复制到 `vendor/fredtalk/<referenceId>/`，附上原路径、版本、文件哈希和许可说明。它不安装依赖、不执行源码，也不覆盖不同内容。多数源码是完整场景快照，需要按本期口播改编；把实际调用位置写进本期实现证据后，再验证画面。缺少的媒体、外部依赖与未解析导入由检查结果明确列出，不能直接声称可运行。

归档、会员预览和上游 keep 标签不构成用户认可。会员源码没有被获取；预览可见、源码存在、本期运行和用户认可分别记录。`ui.py fredtalk search <关键词> --include-archived --include-unavailable` 仅在需要历史或缺件条目时显式使用。

## 按句意找入口

| 这一段要表达什么 | 优先查什么 | 具体入口 |
| --- | --- | --- |
| 人物全屏开场、材料错峰展开与实体质感 | `family/presenter-opening`，按本期构图与原声时窗适配 | [实际模块与预览](../assets/presenter-opening/README.md) |
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
| 软件操作 | [103 条注册记录](../assets/modules/director/references/presets.json)、[用途目录](../assets/modules/director/references/preset-catalog.md)及包内源码 | 103 条 ID 均定位到候选源码模块；不是本轮 103 项运行通过 |
| 参考案例 | [230 条来源目录](../assets/modules/reference/references/catalog.json)、[包内重建状态](../assets/modules/reference/references/rebuild-status.json)与[资源边界](distribution-scope.md) | 包内有230条文本/海报与2个通用起点，不含逐案例历史工程。本机可通过资源映射自动接续保留的旧源码；当前存在、历史记录和运行验证分开报告 |
| 字体与花字 | [34 个字体文件](../assets/qiaomu-fonts/index.json)、[12 套搭配](../assets/qiaomu-fonts/pairings.json)、CSS、预览与导出入口 | 字体资源存在不等于当前稿件无缺字，需在实际后端接入 |
| 截图、人物、动漫、设备、动态字、adu | 各能力族保留原模块、来源与实现入口；新增人物开场模块见上表 | 查看机器目录 `families`；方法、模板、账号成片和外部生成服务不混为同一种预设 |

上述数量有重叠，**不相加成“已实现／已验证／已认可的动效数”**。此前四层整理只核对原库路径与目录，没有重新渲染或播放整库。此次新组件的运行检查单列于 [editing-kit/validation.json](../assets/editing-kit/validation.json)，不扩大成原库或在线生成服务全部通过。

## AIGC 参考与历史资料

[柔和手绘画风参考](../assets/approved-girl-sample/README.md)及[场景例图索引](aigc-assets.json)用于本期新图和视频。当前用途是 AIGC 画风，不能扩大为这支旧片的 UI 模板或固定主角。

旧整片推荐列表已撤下。原片、源码和原始认可仍可从[历史索引](history.md)及显式 `inspect --kind sample --id <ID>` 查询，不再构成普通制作的必选基线。

## 机器检索与维护

历史接入示例：[32 秒无声结构预览](evidence/semantic-transfer-sample-20261014.json)保留早期代码调用及离线请求；21–32 秒是待生成占位，未获审美认可。原工程保留供查代码，不作为普通制作的整片基线。

`capability-catalog.json` 的当前路径相对 **ui-motion-fusion 根目录**解析；`historical_*`保留旧快照，不作为当前可用性判断。按 `semantic_routes` 找用途，按 `capabilities[].id` 查全部 80 个 O/X/F/R 编号，按 `software_presets`、`reference_cases` 查询子目录，按 `sample_records` 查询样片。

当前实际资源用 `python -B -X utf8 scripts/resource_inventory.py report` 检查；具体历史案例用 `inspect-reference --slug <案例ID>`。已配置的 `references/resources.local.json` 自动补充本机原片、研究记录和旧reference源码，不用另开一个Skill。包内文件优先，显式本机映射缺件仍报缺失；源码目录、入口、实际运行和审美认可分别记录。需要核对原文件内容时加 `--verify-hashes`；未核验的哈希明确为 `not-verified`。

每项分别读取 `source`、`implementation`、`validation`、`user_approval`。`source-present` 仅代表源码或资源路径存在；历史报告存在不代表本轮测试通过，`unknown` 不得当作认可。缺失媒体会保留原路径并记为 `present: false`，不因此删除对应能力。

新增方法先更新它的原配方或实现，再补本目录路由与机器索引；认可只补具体版本、范围和证据。原库仍是详细内容的来源，不把整套源码、素材、旧规则复制到此层。[全部资源与原编号追踪](coverage.md)用于追溯，[模块映射](module-map.md)用于查引擎归属。
