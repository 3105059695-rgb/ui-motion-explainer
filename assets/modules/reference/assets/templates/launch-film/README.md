# 连续产品发布片

这是依据 [@twoclipping 的完整 Prompt](httpLOCAL_ASSET_NOT_DISTRIBUTED) 及原片采样独立编写的模板，不是原片工程。默认 `reference-estimated` 模式为 29.077 秒，按每秒采样估计的主要锚点重映射内部 27 秒动作时钟。它使用单调三次 Hermite 插值，使锚点之间速度连续，仍不是原片逐帧的精确时间线。

从父目录启动静态 HTTP 服务，然后打开 `index.html`。`?render=1` 关闭预览自动播放和控制条。导出端调用 `await window.ready()`，再逐帧 `await window.seek(t)`。`window.duration`、`window.project`、`window.getState()` 可用于查看配置和时间阶段。所有外部 `seek(t)`、控制条、预览循环、`state.time` 与 `project.marks[].time` 使用项目秒数；`state.internalTime` 与 `internal_marks` 保留 27 秒内部时钟。`seek(0)` 与 `seek(window.duration)` 绘制完全相同的首尾画面。

`?timing=prompt` 切为 27 秒、120 BPM、54 拍的 Prompt 动作版本；`?timing=reference` 切回 29.077 秒估计参考版本。`?render=1&timing=prompt` 可用于导出 Prompt 版本。编辑 `project.duration` 可统一拉长或缩短总时长；两种模式的时间轴都映射到该时长。参考模式的 `beat` 是内部动作拍号，不代表已经与原视频音轨逐拍对齐。

编辑 `project.json` 的 `brand`、`copy`、`photos`、`wall`、`desktop`、`accent` 即可换品牌、中文文案与素材。默认 `reference-*.jpg` 是从原作者视频提取的参考帧，权利仍归原作者和原素材权利人，不能称为原创摄影；仅用作本机复刻参考，公开发布时换成自己的授权素材。`assets/PROVENANCE.json` 逐条记载了提取时间、裁切和填充方法。默认首两张是 6 秒拱门日景和 10 秒黄金时段近似配对，黄金时段底部通过无 UI 花海条带拉伸填充，尚不能保证完全对齐。宇航员图片由墙面成品内的照片裁切，只有 380 × 562 像素，九宫格图片只有 280 × 280 像素。

`?assets=svg` 切换为本模板原创的全 SVG 示例素材，`sample_photos` 保存了相应路径。暖灰开场与淡蓝桌面按原片观感校准，桌面、墙面及 SVG 风景均为独立绘制。

动作链包含字标压缩、圆点到按钮、六叶 iris、九宫格与 bento、玻璃字到液滴到工具条、滑杆拖动、镜片到圆球到锁屏、手机边框生长、Dynamic Island 拉伸与 Mac 窗口、拖放进入网页、相框边缘生长、订单状态、墙面与首尾闭合。每次 seek 由时间重新计算，无增量状态、CSS transition 或导出计时器。

本地已包含 Google Fonts 官方来源的 Geist 与 Archivo 可变字体及 OFL 许可证，`ready()` 会等待字体加载。UI 使用 Geist，字标使用 Archivo 800，Canvas `fontStretch: expanded` 对应宽度约 125%，压缩动画用逐字几何缩放保持连续；中文由系统字体补齐。完整来源与 SHA-256 在 `assets/fonts/manifest.json`。

玻璃使用场景克隆和局部透镜缩放／边缘高光近似，未实现参考 prompt 的逐字 SDF 色散位移折射。墙面不是实拍视频；没有配音乐和音效。素材、具体字距、排版及速度仍有差异，模板可执行不等于已经通过与原片逐帧的接近度验收。完整边界保存在 `project.json.approximation_notes`。
