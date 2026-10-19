# 引擎路由与时间轴合同

`ui-motion-fusion` 第三层「可用效果库」的技术合同；从 [效果总目录](library.md) 选定能力，或创建／恢复／导出工程时读取。各引擎保留自己的工程格式与真实接口；外观取 [账号风格](style-profiles.md)，制作阶段与交付取 [主流程](workflow.md)。

先识别已有工程，不为统一入口重写可用工程或混用时间 API。本模块不触发上游自动升级、重装、收费服务或额外审美批准流程。

## 统一命令入口

从本技能目录运行，也可使用脚本绝对路径。统一入口先处理当前风格、计划与演示标志，再将剩余参数交给原后端；创建脚本拒绝覆盖已有工程。旧菜单入口停用不影响脚本调用；[资源注册表](resource-registry.json)给出真实根目录，`modules check` 可检查。工具指南由 `guides --id <工具名>` 定位，仅按需读取其技术接口和必要约束，不重新采用其独立入口优先级或旧外观默认。

```powershell
python -X utf8 scripts/ui.py status
python -X utf8 scripts/ui.py direct -- prepare --script <原稿.txt> --project <当前工程> --profile <适用档案.md>
python -X utf8 scripts/ui.py direct -- recipes --id S08
python -X utf8 scripts/ui.py direct -- check --plan <当前工程/director-plan.json>
python -X utf8 scripts/ui.py new --engine fusion -- --out <新工程> --scene F03
python -X utf8 scripts/ui.py new --engine base -- --out <新工程> --mode desktop --topic "本期主题"
python -X utf8 scripts/ui.py new --engine director -- --out <新工程> --preset continuous-codex-story
python -X utf8 scripts/ui.py new --engine editorial -- --out <新工程> --screenshot <截图> --title "本期主题"
python -X utf8 scripts/ui.py render --engine fusion -- --project <工程> --out <新导出目录>
python -X utf8 scripts/ui.py reference --tool toolkit -- search "UI"
python -X utf8 scripts/ui.py reference --tool rebuild -- status
python -X utf8 scripts/metaso_video.py status
```

- `status` 只检查本地资源与入口，不联网、不安装、不启动旧任务。
- `new/render --engine base|fusion` 默认使用包内基础，不扫描或自动切换兄弟旧包；明确 `--base <目录>` 才固定外部版本。已有工程使用原创建版本与后端。
- `editorial` 只统一创建入口，渲染在生成的 Remotion 工程内按 [模块命令](editorial-motion.md) 运行。
- 软件预设和编辑式模板已在包内。参考案例默认只有文本、海报和2个起点；配置 `references/resources.local.json` 的 `modules.reference` 后，原统一reference命令自动使用该本机历史库。显式 `--module-root` 优先；失效映射报错，不偷换成起点。该本机映射只覆盖reference，不改变风格档案或生产渲染引擎。
- `direct` 是 Agent 的语义制作辅助入口，职责与 [接入合同](semantic-directing.md) 一致；不是 `new --engine director` 的旧渲染后端，也不通过关键词替 Agent 理解口播。
- `direct prepare` 的 `context.aigc` 自动携带[AIGC 注册集](aigc-assets.json)中适用角色、认可静图、原片研究与[AIGC 导演规范](aigc-directing.md)，独立于 UI 风格。新 AIGC 计划通过 `aigc_contract_version:1` 检查真实引用、动作节拍与上屏时长；这是生产入口接线，不是后台自动生成或渲染。
- **创建／渲染后端没有自动套用账号档案的 `--profile` 参数。** `direct prepare --profile` 仅绑定要读取的档案；主题、人物、字体、内容与时序由制作者按档案落实到工程，读取档案不会自动修改源码。
- `metaso_video.py` 是素材生成入口，不替换渲染器；规划、只读连接检查、计费授权和密钥管理见 [动漫视频生成](anime-video-generation.md)。密钥从本机环境或当前 Windows 用户加密存储读取，不进入 Skill、源码或工程包。

## 选择已有能力

新[剪辑组件](../assets/editing-kit/README.md)提供 `UIEditingKit.apply(effect, options, progress)`，由现有时间轴驱动，主题由项目传入。它不控制音视频播放或 seek，不替换已有引擎；不得把演示的估算秒点移到真实口播。组件可嵌入已有 HTML DOM；Remotion 项目按该机制移植成受 frame 驱动的样式，不能在不支持 DOM 的后端直接声称已经接入。

| 路由 | 适用对象 | 保留的实现与入口 |
| --- | --- | --- |
| base | 基础人物、字幕、桌面与时间轴 UI 工程 | 包内 [base 渲染器](../assets/base-skill/scripts/render_portable.py) 与 [可移植生产说明](../assets/base-skill/references/portable-production.md) |
| fusion | 对象交接、展开、焦点、任务状态与连续 UI | [Fusion 工作室](../assets/fusion-studio/index.html) 与 [现有渲染入口](../scripts/render.py) |
| director | 已有语义交互预设和软件操作编排 | 包内 [工程格式](../assets/modules/director/references/project-format.md)、[渲染说明](../assets/modules/director/references/rendering.md) 与 [渲染器](../assets/modules/director/scripts/render.py) |
| replica | 逐案例参考还原与确定性时间定位 | 包内 [复刻脚本](../assets/modules/reference/scripts/rebuild.py) 与 [HTML 渲染器](../assets/modules/reference/scripts/render.py)；已配置本机历史库时统一入口解析其实际路径 |
| editorial | 用户截图、编辑式图解、漫画隐喻及对象接力 | 包内 [创建器](../assets/modules/editorial/scripts/new_project.py)、[Remotion 模板](../assets/modules/editorial/assets/remotion-template/package.json)及[截图模块](editorial-motion.md)；统一创建，项目内渲染 |
| HyperFrames | 已有 HF 工程、复杂合成、多场景与其组件生态 | 从[可选指南目录](backend-guides.json)查询 `guides --id hyperframes-core` 与 `guides --id hyperframes-cli`；未安装时明确缺失 |
| Remotion | 已有 React/Remotion 工程，或用户明确指定 | 保留该工程的 composition、帧率、依赖与项目脚本；使用对应 Remotion 后端 |
| metaso-h3 | 需要动漫角色连续动作、情绪表演的 AIGC B-roll | [动漫视频生成](anime-video-generation.md)与[客户端](../scripts/metaso_video.py)；先生成视频素材，再由原工程后端剪辑合成，不替换原渲染器 |

文件路径、入口存在和可运行是不同结论；实际使用前检查当前工程与依赖。
通用新片优先复用与需求匹配且已可用的后端；外部工作流不替代当前账号档案与主流程。
已有引擎不能满足关键能力时再做适配，先保留源工程和当前可用输出。

## base 与 fusion：双时钟 render 合同

```javascript
await window.ready();
await window.render(animationTime, mediaTime);
const needsTemporalSampling = window.motionActive(animationTime);
```

- 从工程的 `index.html?render=1` 进入，先等待配置、字体与素材准备完成。
- `animationTime` 是当前动画采样秒数；`mediaTime` 是本输出帧固定的源媒体/字幕时钟。
- 普通采样用 `render(t, t)`；运动模糊用 `render(subsampleTime, t)`，同一输出帧的第二参数不变。
- 人物源片、口播与字幕不能跟着模糊子采样抖动，媒体 seek 完成后才截帧。
- `motionActive(t)` 指定需要时间采样的区间；有接口不代表所有场景已经实现正确模糊。
- Fusion 底层入口默认委托包内 base 渲染器；统一 `scripts/ui.py` 会显式传入所选底座，默认包内优先。已有工程固定其原创建版本，避免误用同名副本。
- 保留 `project.json` 的现有字段、工程模式和资源相对路径，不假设所有模式具有相同字段。
- base 示范可能把内容归一到十秒动作；新片必须按真实音频重编时点，不能只拉长总时长。

相关实现：[base 工作室](../assets/base-skill/assets/portable-studio/studio.js)、[Fusion 时间轴](../assets/fusion-studio/studio.js)。

## director：相似接口，能力单独判断

Director 渲染器同样调用 `ready()`、`render(t, masterTime)` 和 `motionActive(t)`。
现有 Director 工作室的 `motionActive` 返回 `false`；不能因导出器支持多次采样就宣称该工作室已有运动模糊。
它的 preset 注册、编排字段和参数由原目录维护，不与 base/fusion 的配置直接互换。
保留预设的触发、输入、执行和结果顺序；换文案后重新验证阅读时间和实际按钮落点。
复用已有预设不等于恢复被暂停的扩库，也不把预设数量当已完成参考还原数量。

## replica：seek 合同与原生 Python 分支

```javascript
await window.ready();
await window.seek(timeInSeconds);
// window.duration；可选 window.getState() 用于重复定位检查。
```

HTML 复刻工程使用 `seek(t)`，不能直接交给只会调用 `render(t, mediaTime)` 的 base 导出器。
`?render=1` 下停用自由播放循环；画面从时间直接计算，随机量固定，字体和视频就绪后采样。
重复定位同一时刻应还原相同状态；只有参考本身要求循环，才额外检查首尾一致。
该接口没有通用的第二媒体时钟参数；默认不增加多重时间采样，含人物/字幕时先做明确适配。
`project.json.render_engine: python-native` 时，由 `exporter` 指向独立 Python 导出器。
此类工程由 `rebuild.py render` 分派；HTML 可能仅播放重新生成的成片，不是可截图替代的原生绘制源。
保留各案例代码、依赖、来源和差异记录，不能把所有案例强改成同一模板或颜色。

## editorial：截图模板与 Remotion 工程

`ui.py new --engine editorial -- --out <新目录>` 转交原创建器，支持 `--screenshot`、`--title`、`--focus X Y WIDTH HEIGHT`；没有 `--base` 或统一 `render --engine editorial` 接口。
先检查并复用锁文件兼容的现有工程依赖和本机运行环境；只有依赖缺失且无法复用兼容环境时，才在工程内按锁文件执行 `npm ci`。不复制 `node_modules`，不移动或删除共享依赖目标。用已有 `npm run render:screenshot`、`render:showcase` 或 `render` 渲染相应 composition；不调用 `upgrade`。
默认模板使用原参考近似主题，选择当前主题后再修改新工程，原模板保持可复用。具体尺寸、焦点坐标及来源边界见 [编辑式模块](editorial-motion.md)。

## HyperFrames 与 Remotion：保留框架所有权

HyperFrames 由框架控制定时媒体；合成遵守 `class="clip"`、尺寸、稳定 ID 与 `data-*` 时间声明。
每个合成注册暂停且可 seek 的 `window.__timelines`，遵守确定性要求；使用其 CLI 检查与导出。
不要给 HF 工程硬塞 base 的 `render`，也不要用随时间漂移的浏览器播放替代框架采样。
需要具体后端时，通过[可选指南目录](backend-guides.json)运行 `guides --id general-video` 或 `guides --id motion-graphics`，只读取实际存在的入口。
`guides --id faceless-explainer` 面向文本与创造的视觉，仅适合抽象解释部分，不默认承担真实 UI 捕获；可选插件缺失不冒充已安装。
使用 frame preset 时显式传入当前账号色盘和字体；外部 preset 不能覆盖已选档案或已确认工程。黑白淡紫只在对应账号／项目确有该配置时适用。
Remotion 按 `frame / fps` 驱动画面，保持 composition 的 `durationInFrames`、尺寸和输入 props 一致。
依照现有 React 组件和渲染脚本等待字体/素材，不假定存在 `window.seek` 或 `window.render`。
只有明确迁移要求才转换框架；风格统一不等于代码运行合同统一。

## 技术接入检查

核对工程类型、实际入口、尺寸、fps、时长、音轨来源及依赖兼容性；等待字体和素材，检查重复定位。有多重采样时验证固定媒体时钟，不能把后端能力推断为所有预设已实现。稳定帧、中间态、导出解码、观看／试听及版本记录统一执行 [制作流程](workflow.md)。

后端的安装、升级、登录或确认提示只在确有需求时处理，不复制成主技能的固定开工门槛。
用户已授权的本地制作／导出继续完成；费用、外部发布及重要数据覆盖按当前明确授权执行。


## 统一生产导出与历史演示

`new` 生成的是实现起点，记录当前档案来源并标记风格尚未应用。不能将能播放的历史皮肤直接交作本期成片。

统一 `ui.py render --engine <engine>` 默认生产导出：使用工程根目录的 `director-plan.json`，或通过 `--plan <同工程计划>` 指定；检查 `render_ready` 与 `current_style_ready` 后才启动下游渲染器。只展示历史动作机制时显式加 `--demo`，输出会注明非生产。当前绑定只证明依据和结构齐备，实际样式仍需对照成片。

由统一入口新建的工程还有 `current_style_applied:false` 标记。落实本期画面样式后才可将 `project.json.current_style_applied` 设为 `true`；未落实时即使计划有效也阻止生产导出。该声明是制作状态，不是自动视觉验收。
