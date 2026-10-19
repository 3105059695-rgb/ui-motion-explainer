# 引擎路由与时间轴合同

`ui-motion-fusion` 统一导演规则、配色和交付要求；各引擎保留自己的工程格式与渲染入口。
先识别已有工程，再选后端。不要为了统一入口重写可用工程，也不要将不同时间 API 混用。
本模块不触发上游自动升级、重装、收费服务或额外审美批准流程。

## 选择已有能力

| 路由 | 适用对象 | 保留的实现与入口 |
| --- | --- | --- |
| base | 基础人物、字幕、桌面与时间轴 UI 工程 | 包内 [base 渲染器](../assets/base-skill/scripts/render_portable.py) 与 [可移植生产说明](../assets/base-skill/references/portable-production.md) |
| fusion | 对象交接、展开、焦点、任务状态与连续 UI | [Fusion 工作室](../assets/fusion-studio/index.html) 与 [现有渲染入口](../scripts/render.py) |
| director | 已有语义交互预设和软件操作编排 | 原目录 [工程格式](../../../../../../ai-ui-director/references/project-format.md)、[渲染说明](../../../../../../ai-ui-director/references/rendering.md) 与 [渲染器](../../../../../../ai-ui-director/scripts/render.py) |
| replica | 逐案例参考还原与确定性时间定位 | 原目录 [复刻脚本](../../../../../../prompt-motion-replica/scripts/rebuild.py) 与 [HTML 渲染器](../../../../../../prompt-motion-replica/scripts/render.py) |
| editorial | 用户截图、编辑式图解、漫画隐喻及对象接力 | 原目录 [创建器](../../editorial-ui-motion/scripts/new_project.py)、[Remotion 模板](../../editorial-ui-motion/assets/remotion-template/package.json)及[截图模块](editorial-motion.md)；统一创建，项目内渲染 |
| HyperFrames | 已有 HF 工程、复杂合成、多场景与其组件生态 | 外部 [框架核心合同](../../hyperframes-core/SKILL.md) 与 [CLI](../../hyperframes-cli/SKILL.md) |
| Remotion | 已有 React/Remotion 工程，或用户明确指定 | 保留该工程的 composition、帧率、依赖与项目脚本；使用对应 Remotion 后端 |
| metaso-h3 | 需要动漫角色连续动作、情绪表演的 AIGC B-roll | [动漫视频生成](anime-video-generation.md)与[客户端](../scripts/metaso_video.py)；先生成视频素材，再由原工程后端剪辑合成，不替换原渲染器 |

文件路径、入口存在和可运行是不同结论；实际使用前检查当前工程与依赖。
通用新片优先复用与需求匹配且已可用的后端；外部工作流不替代主技能的视觉标准。
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
- Fusion 底层入口默认委托包内 base 渲染器；统一 `scripts/ui.py` 会显式传入所选底座，默认优先完整同机资源。已有工程固定其原创建版本，避免误用同名副本。
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
在生成的工程内按锁文件 `npm ci`，用已有 `npm run render:screenshot`、`render:showcase` 或 `render` 渲染相应 composition；不调用 `upgrade`。
默认模板使用原参考近似主题，选择当前主题后再修改新工程，原模板保持可复用。具体尺寸、焦点坐标及来源边界见 [编辑式模块](editorial-motion.md)。

## HyperFrames 与 Remotion：保留框架所有权

HyperFrames 由框架控制定时媒体；合成遵守 `class="clip"`、尺寸、稳定 ID 与 `data-*` 时间声明。
每个合成注册暂停且可 seek 的 `window.__timelines`，遵守确定性要求；使用其 CLI 检查与导出。
不要给 HF 工程硬塞 base 的 `render`，也不要用随时间漂移的浏览器播放替代框架采样。
需要具体后端时才读 [general-video](../../general-video/SKILL.md) 或 [motion-graphics](../../motion-graphics/SKILL.md)。
[faceless-explainer](../../faceless-explainer/SKILL.md) 面向文本与创造的视觉，仅适合抽象解释部分，不默认承担真实 UI 捕获。
使用 frame preset 时显式传入用户色盘和字体；外部 preset 不能覆盖黑白与局部淡紫的既定关系。
Remotion 按 `frame / fps` 驱动画面，保持 composition 的 `durationInFrames`、尺寸和输入 props 一致。
依照现有 React 组件和渲染脚本等待字体/素材，不假定存在 `window.seek` 或 `window.render`。
只有明确迁移要求才转换框架；风格统一不等于代码运行合同统一。

## 导出前的最小检查

1. 核对工程类型、实际入口、尺寸、fps、时长和音轨来源；先复用已工作的本地环境。
2. 等待字体和素材；抽查起点、动作中间态、关键结果和尾帧，检查重复定位。
3. 有人物/字幕时验证源时钟；有多重采样时验证媒体时间固定。
4. 用户要视频时输出实际 MP4，核对媒体参数并完整解码，按改动范围观看与试听。
5. 使用新输出目录或新版本名；记录真实检查范围，不继承旧工程的验证或审美认可。

后端的安装、升级、登录或确认提示只在确有需求时处理，不复制成主技能的固定开工门槛。
用户已经授权本地制作/导出时继续完成；费用、外部发布及重要数据覆盖按当前明确授权执行。
