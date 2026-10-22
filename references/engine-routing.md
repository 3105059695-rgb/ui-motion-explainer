# 引擎路由与时间轴合同

本页只维护后端的真实接口、时钟和限制。审美按[Fred Talk 默认](aesthetic-preferences.md)，阶段与交付按[主流程](workflow.md)，共同数据按[导演计划合同](director-plan-contract.md)。先识别已有工程，不为统一入口重写可用工程或混用时间 API。

## 完整场景制作

`ui.py scene list/inspect` 从实际 manifest 读出阿渡 anim3 的 12 场与 anim4 的 9 场，包括完整布局、预览、文字／图片槽、动作窗和口播 cue。技术接通这些场景不代表自动符合 Fred Talk；选到适用场景才实例化，其余使用 Fred 源码或原后端做明确适配。

正式制作只编辑同一份 `director-plan.json`：`production.backend:"complete-scenes"`、所选 pack、全局 settings，以及每段 `scene.id/slots/cues`。字段、原声覆盖及对齐要求见[共同计划](director-plan-contract.md#完整场景路线共用同一计划)。`scene compile` 仅生成派生参数供检查；`scene build --plan` 实际提取所选源码块，生成可编辑工程和来源绑定；`scene render` 运行与普通路线共用的生产预检、导出和输出复核。

接口由 Agent 调用。当前单工程只支持一个 pack；原声视频必须与本期时长一致，局部样段先按真实时间截取并同步平移字幕、保留母带来源。动作窗保持源速度，停留区允许调整；不拉慢口型来适配场景。Windows 可传入已有浏览器和 Playwright 路径。横版人物确需裁切时填写 `presenterCrop:[x,y,width,height]`，依据实际取景，不猜脸。`music.mode=none` 保留原声、不生成 BGM；字体使用 `textFontFile`，等宽字体使用 `monoFontFile`。

声效按实际动作使用：用源模块 `dump_sfx.mjs <工程/index.html> <工程/sfx.json>` 采集已映射 cue（可传同一 browser/playwright-module），再运行工程的 `audio.py`，得到 `sfx.wav`。由 Agent 按原声响度低电平混入、检查后生成 `mix.wav`，不覆盖 `voice.wav`；`scene render` 优先该混音，未提供混音则使用并明确标记仅原声。动作声不应遮住口播，采集成功不代表听感通过。

计划必须放在 `--out` 指向的准备目录内；`direct prepare` 的原稿、上下文、计划及绑定输入保留，已有真实工程拒绝覆盖。生成的 `scene-spec.json/macro_plan.json` 是派生产物；改计划或绑定源后应重建并重新检查，不能手改派生文件继续沿用旧回执。

旧 `scene scaffold` 和手写 spec 作为兼容接口保留，必须显式 `scene build --spec ... --legacy-spec`；这类旧工程用 `scene render --legacy-spec` 导出并标记非正式生产绑定。已采用 `--plan` 的工程不能降级到 legacy 绕过检查。构建、技术验证、实际视听及审美分别报告。

## 先确认实现，再选择新工程接口

先从本期理解任务定位已有源码，阅读其真实 API，再决定新工程后端及协作接口；不能先限定 `drawScene(ctx,t,assets)`，随后因为 DOM 组件接不进来就把所有动作重写。已有 Canvas 工程不必迁移，可复用下面的几何函数或作明确适配。人物与真实素材的停留、原创编排也不要求硬套组件。

| 已有实现 | 可调用部分与接口边界 |
| --- | --- |
| [EditingKit](../assets/editing-kit/README.md) | `UIEditingKit.apply(name, options, progress)` 驱动已有 DOM 节点；包含聚焦蒙版、遮挡揭幕、同对象交接、比较、因果链和结果回拉。宿主仍负责真实内容、布局和时间。不是 Canvas 绘制函数。 |
| [完整场景制作](#完整场景制作) | `ui.py scene` 直接复用阿渡 anim3/anim4 的完整布局、编舞、蒙版和转场，按本期选场景、绑定内容与原声。其他整体源码继续按需适配。 |
| [当前连续 UI 制作模块](../assets/agent-editorial/README.md) | `--custom-layout --canvas-story` 实际复制并加载已认可方木正文提炼的配色、材质与 MotionCore；本期 `scenes.js` 定义对象和事件，同一 `timeline.segments` 决定运行段落。有原片人物的开头执行完整画面与空白区域裁剪；正文按需基础／全屏切换。保留整个效果库，不内置排行榜。 |
| [Fusion 自定义起点](../assets/fusion-studio/production-starter/README.md) | 显式 `--custom-layout` 创建空运行环境，由 `timeline.json` 驱动 EditingKit。用于明确的源码适配或定制，本身没有完整视觉设计。 |
| [MotionCore](../assets/modules/reference/assets/motion-core.js) | `sharedHandoff`、`cameraAnchorZoom`、`frameFlood`、`iris` 等返回几何或状态；可由 Canvas 或 DOM 宿主消费，不会自动绘制材料或生成完整镜头。 |
| [UI morph](../assets/modules/reference/assets/templates/ui-morph/motion.js) / [launch film](../assets/modules/reference/assets/templates/launch-film/motion.js) | 有可运行的形变、裁切与相机示例，但依赖各自 DOM 和时间轴；按其结构接入或抽取适用逻辑，不只复制函数名。 |
| [Fusion 场景](../assets/fusion-studio/studio.js) | 完整历史演示，可借用对象与时间轴实现；原皮肤、示例对象、固定时长不自动用于本期。 |

Fred 来源方法的 `implementation.customization_required` 说明上述组件没有承担的工作。逐项按本期事件补齐，或选择更合适的实现；方法名字与文件存在不意味着整段已经重建。当前方法库中的 14 条 Fred 方法仍没有完整重建，不得把历史演示称为现成的 Fred 正文引擎。

## 统一命令入口

从本技能目录运行，也可使用脚本绝对路径。统一入口先处理当前风格、计划与演示标志，再将剩余参数交给原后端；创建脚本拒绝覆盖已有工程。旧菜单入口停用不影响脚本调用；[资源注册表](resource-registry.json)给出真实根目录，`modules check` 可检查。工具指南由 `guides --id <工具名>` 定位，仅按需读取其技术接口和必要约束，不重新采用其独立入口优先级或旧外观默认。

```powershell
python -X utf8 scripts/ui.py status
python -X utf8 scripts/ui.py direct -- prepare --script <原稿.txt> --presenter <原声视频.mp4> --project <当前工程>
python -X utf8 scripts/ui.py direct -- recipes --id S08
python -X utf8 scripts/ui.py direct -- check --plan <当前工程/director-plan.json> --production
python -X utf8 scripts/ui.py scene list
python -X utf8 scripts/ui.py scene inspect --pack anim3 --scene s01
python -X utf8 scripts/ui.py scene compile --plan <当前工程/director-plan.json> --out <工程外派生配置.json>
python -X utf8 scripts/ui.py scene build --plan <当前工程/director-plan.json> --presenter <原声视频.mp4> --out <当前工程> --subs-js <原声对齐字幕.js>
python -X utf8 scripts/ui.py scene render --project <当前工程> --out <成片.mp4>
python -X utf8 scripts/ui.py new --engine fusion -- --custom-layout --canvas-story --out <新连续UI工程>
python -X utf8 scripts/ui.py new --engine fusion -- --custom-layout --out <明确DOM组件工程>
python -X utf8 scripts/ui.py new --engine base -- --out <新工程> --mode desktop --topic "本期主题"
python -X utf8 scripts/ui.py new --engine director -- --out <新工程> --preset continuous-codex-story
python -X utf8 scripts/ui.py new --engine editorial -- --out <新工程> --screenshot <截图> --title "本期主题"
python -X utf8 scripts/ui.py render --engine fusion -- --project <工程> --out <新导出目录>
python -X utf8 scripts/ui.py reference --tool toolkit -- search "UI"
python -X utf8 scripts/ui.py reference --tool rebuild -- status
python -X utf8 scripts/metaso_video.py status
```

- `status` 只检查本地资源与入口，不联网、不安装、不启动旧任务。
- 当前新连续 UI 解释制作通常选 `--custom-layout --canvas-story`，实际装入本次源码模块；Agent 为每稿重写场景对象、因果过程、布局与时间，不需要用户另外指定模块。`timeline.json` 的 `segments` 真正控制渲染，每段 `scene` 对应本期 `StoryScenes` 函数，保留计划绑定字段。空起点没有成片内容，不能把起点导出当完成。DOM EditingKit、完整场景及既有后端继续可用，不为统一皮肤强改框架。
- 普通制作先选择适用的完整源码。`new --engine fusion` 不再默默返回空画布；明确 `--custom-layout` 才创建自定义环境。明确 `--scene F01` 至 `F08` 或 `all` 仍创建历史演示，不能当作本期成片。
- `new/render --engine base|fusion` 默认使用包内基础，不扫描或自动切换兄弟旧包；明确 `--base <目录>` 才固定外部版本。已有工程使用原创建版本与后端。
- `editorial` 只统一创建入口，渲染在生成的 Remotion 工程内按 [模块命令](editorial-motion.md) 运行。
- 软件预设和编辑式模板已在包内。参考案例默认只有文本、海报和2个起点；配置 `references/resources.local.json` 的 `modules.reference` 后，原统一reference命令自动使用该本机历史库。显式 `--module-root` 优先；失效映射报错，不偷换成起点。该本机映射只覆盖reference，不改变风格档案或生产渲染引擎。
- `direct` 是准备与检查入口，不是 `new --engine director` 的旧渲染后端；字段由[计划合同](director-plan-contract.md)维护。
- `direct prepare` 携带 Fred Talk 默认与独立的 `context.aigc`；`--profile` 不让新稿切换账号皮肤。生成素材仍按[AIGC 接口](anime-video-generation.md)实际处理，不由准备命令自动产生。
- `metaso_video.py` 是素材生成入口，不替换渲染器；规划、只读连接检查、计费授权和密钥管理见 [动漫视频生成](anime-video-generation.md)。密钥从本机环境或当前 Windows 用户加密存储读取，不进入 Skill、源码或工程包。

## 选择已有能力

新[剪辑组件](../assets/editing-kit/README.md)提供 `UIEditingKit.apply(effect, options, progress)`，由现有时间轴驱动，主题由项目传入。它不控制音视频播放或 seek，不替换已有引擎；不得把演示的估算秒点移到真实口播。组件可嵌入已有 HTML DOM；Remotion 项目按该机制移植成受 frame 驱动的样式，不能在不支持 DOM 的后端直接声称已经接入。

| 路由 | 适用对象 | 保留的实现与入口 |
| --- | --- | --- |
| base | 基础人物、字幕、桌面与时间轴 UI 工程 | 包内 [base 渲染器](../assets/base-skill/scripts/render_portable.py) 与 [可移植生产说明](../assets/base-skill/references/portable-production.md) |
| fusion | 对象交接、展开、焦点、任务状态与连续 UI | [生产起点与时间线](../assets/fusion-studio/production-starter/README.md)、[现有渲染入口](../scripts/render.py)；[历史工作室](../assets/fusion-studio/index.html)供按需查实现 |
| director | 已有语义交互预设和软件操作编排 | 包内 [工程格式](../assets/modules/director/references/project-format.md)、[渲染说明](../assets/modules/director/references/rendering.md) 与 [渲染器](../assets/modules/director/scripts/render.py) |
| replica | 逐案例参考还原与确定性时间定位 | 包内 [复刻脚本](../assets/modules/reference/scripts/rebuild.py) 与 [HTML 渲染器](../assets/modules/reference/scripts/render.py)；已配置本机历史库时统一入口解析其实际路径 |
| editorial | 用户截图、编辑式图解、漫画隐喻及对象接力 | 包内 [创建器](../assets/modules/editorial/scripts/new_project.py)、[Remotion 模板](../assets/modules/editorial/assets/remotion-template/package.json)及[截图模块](editorial-motion.md)；统一创建，项目内渲染 |
| HyperFrames | 已有 HF 工程、复杂合成、多场景与其组件生态 | 从[可选指南目录](backend-guides.json)查询 `guides --id hyperframes-core` 与 `guides --id hyperframes-cli`；未安装时明确缺失 |
| Remotion | 已有 React/Remotion 工程，或用户明确指定 | 保留该工程的 composition、帧率、依赖与项目脚本；使用对应 Remotion 后端 |
| metaso-h3 | 需要动漫角色连续动作、情绪表演的 AIGC B-roll | [动漫视频生成](anime-video-generation.md)与[客户端](../scripts/metaso_video.py)；先生成视频素材，再由原工程后端剪辑合成，不替换原渲染器 |

文件路径、入口存在和可运行是不同结论；实际使用前检查当前工程与依赖。
通用新片优先复用与需求匹配且已可用的后端；外部工作流不替代本期设计选择与主流程。
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
使用 frame preset 时传入本期沿 Fred Talk 默认确定的外观参数；外部 preset 不能覆盖该默认或用户明确的工程要求。
Remotion 按 `frame / fps` 驱动画面，保持 composition 的 `durationInFrames`、尺寸和输入 props 一致。
依照现有 React 组件和渲染脚本等待字体/素材，不假定存在 `window.seek` 或 `window.render`。
只有明确迁移要求才转换框架；风格统一不等于代码运行合同统一。

## 技术接入检查

核对工程类型、实际入口、尺寸、fps、时长、音轨来源及依赖兼容性；等待字体和素材，检查重复定位。有多重采样时验证固定媒体时钟，不能把后端能力推断为所有预设已实现。稳定帧、中间态、导出解码、观看／试听及版本记录统一执行 [制作流程](workflow.md)。

后端的安装、升级、登录或确认提示只在确有需求时处理，不复制成主技能的固定开工门槛。
用户已授权的本地制作／导出继续完成；费用、外部发布及重要数据覆盖按当前明确授权执行。


## 统一生产导出与历史演示

`new` 生成的是实现起点，记录当前方向来源并标记风格尚未应用。不能将能播放的历史皮肤直接交作本期成片。

普通 `ui.py render --engine <engine>` 与完整场景的 `scene render` 都通过 `production_entry` 读取工程内 `director-plan.json` 或显式同工程计划，先共同预检，再用各自渲染器导出并复核媒体。`preflight_ready` 与旧兼容字段 `production_ready` 相同，只是技术就绪；实际样式仍需对照输出。普通路线的历史演示显式使用 `--demo`；完整场景旧 spec 兼容使用前述 `--legacy-spec`，二者都不能报正式生产就绪。

由统一入口新建的工程还有 `current_style_applied:false` 标记。落实本期画面样式后才可将 `project.json.current_style_applied` 设为 `true`；未落实时即使计划有效也阻止生产导出。该声明是制作状态，不是自动视觉验收。
