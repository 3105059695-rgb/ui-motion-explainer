# Shape morphing through UI states

独立实现，公开参考：<httpLOCAL_ASSET_NOT_DISTRIBUTED>，作者 `@twoclipping`。默认外观与大体时序经过完整参考视频接触表对照修订；本目录不包含作者原始代码，也不宣称逐像素复原原视频。

## 调用与编辑

从静态 HTTP 服务访问 `index.html`。普通打开自动循环预览，底部可暂停和拖动时间。渲染打开 `index.html?render=1`，预览控制和自动播放均禁用。

```js
await window.ready();
window.project.brand = '你的品牌';
window.project.texts.button = '开始体验';
window.project.accent = '#111111';
window.seek(4.45);                  // 秒；每次都从时间独立计算
console.log(window.getState());     // phase、容器、鼠标、拖动值等
```

`project.json` 是主要编辑入口，包括文本、背景、前景色、字体、品牌、画布、时长和实际视频关键状态。默认使用原参考可见的英文文案：Generate / motion study 02 / made in code / Day, Week, Month / 84,320 total views / frame / Every frame is code；可通过 `texts` 自由改成中文。默认无附加品牌页眉或页脚。配置经 `fetch` 加载；`filLOCAL_ASSET_NOT_DISTRIBUTED` 无法读取配置时使用 `motion.js` 内嵌默认配置，控制台明确提示 fallback。

内部布局为 1440 × 1440，浏览器任意正方形视口会等比缩放居中，矩形视口按短边缩放并居中。改变项目总时长按比例缩放整个 14 秒动作序列。直接修改配置的 width / height 不会重新设计内部布局，非方形成片需额外适配布局。120 BPM / 半秒节拍为参考提示词的名义结构；实际动效段落采用观测时序映射，不能宣称已经分析或同步了缺省音乐。

## 运动机制

- 主容器始终是同一个 `#shape`。尺寸、位置、圆角、背景和镜头值由封闭形式弹簧对历次目标变化求和计算。每次 `seek()` 无须上一帧，也没有 CSS transition、setTimeout 或状态积分。
- 外框左右边缘分别使用 23 / 27 rad/s 弹簧，上下边缘 25 / 27 rad/s，阻尼约 0.87；轻微超调后精准归位。内容单独进出并短暂模糊，过渡窗口避开叠字。
- 浏览器坐标使用绝对 50% 锚点、translate(-50%, -50%) 和短边缩放，避免 1440px Grid 最小列宽导致主体落到小视口右下角。镜头在内部画布中心缩放，按钮、播放器、方图表在 720px 视口宽度约为 43% / 69% / 75%。
- 鼠标沿参考时序路线连续运动。按钮、胶囊、播放、开关、标签与搜索点击带缩放和扩散圈。命令选择由键盘状态变化与 Enter 完成；Toast 结束回到按钮。两次拖动由按下窗口和鼠标真实坐标直接映射值。
- 播放进度在约 3.0–3.7 秒由指针位置直接驱动；音量在约 4.1–5.0 秒先拉低、再拉到最大值，越界后轨道和外框同时伸长，释放后解析弹簧回弹。约 5.25 秒收缩为开关，5.38 秒已到开关状态。
- 开关旋钮、液态标签指示器的两侧使用不同频率，领先边缘先到，后沿随后追上。黑色播放器和音量接续为白色标签，再展开为白色方图表。封面为独立 CSS 暖红紫渐变。
- 图表路径以 dash offset 渐显，先显示 Month / 84,320，再呈现左侧和右侧悬停提示。约 9.2 秒点击 Week，数值换为 19,204，另一条曲线重新描绘。
- 命令框逐字输入配置中的 `commandQuery`，五项列表筛选至 Frame rate · 60fps 和 Every frame is code，选中第二项后原容器收缩为黑色成功 Toast，再回到 Generate。
- 鼠标在固定 1440 × 1440 SVG 视口中以 SVG 几何变换移动和缩放；点击圈亦在同一 SVG 内计算。移除了极轻 CSS drop-shadow，保留黑描边，避免小 SVG 表面被浏览器合成器缓存成不同相机倍率的纹理，导致首次 seek 与回放的鼠标边缘像素不同。加载项目字体后先启动真实布局和字体请求，再等待 `document.fonts.ready`。
- 时间约 12.85–14.0 秒已完全归位；`seek(duration)` 映射首帧。首末主画面、鼠标位置与静止速度一致。预览工具条时间数字属于界面辅助，渲染模式不出现。

## 文件和接口

`index.html` 提供可编辑 DOM / SVG，`style.css` 控制静态视觉，`motion.js` 控制所有时间状态，`project.json` 控制配置。无 CDN、字体下载、npm 或素材网络依赖。

公共接口：`ready(): Promise<boolean>`、`seek(seconds)`、`duration`、`project`、`getState()`、`beats`。`getState()` 返回实际请求时间、参考视频时间、内部机制时间、容器几何、鼠标按住状态、镜头、进度、音量、开关、标签边缘、图表进度和搜索输入，可用于随机时间回放的确定性验证。`beats` 是名义半秒网格，真实段落位置以 `marks` 为准。

## 渲染与验证边界

此模板提供完整可执行动作机制与按参考画面修订的默认设计。未复原参考视频的音乐和 UI 音效；`audio` 默认为 null。音乐必须另行提供已许可文件，然后测量拍点并混音。曲线、字体、鼠标路线、弹簧参数及封面渐变采用独立重建，不是作者素材或原版源码。

渲染程序应在 `ready()` 后逐帧 `seek(frame / fps)` 截图；如需参考提示词的运动模糊，可渲染每帧 4 个子帧再做混合。`node --check motion.js` 与 JSON 解析已通过。

早期 Node VM 检查过纯计算、正数几何和乱序回放；真实浏览器发现的 Grid 原点偏移已修复。当前默认版在 Chromium 真实打开后截图验证：720 × 720 的 0 / 3 / 9 秒及各段主要状态已实际查看；1440 × 1440 和 1000 × 800 视口实际测得主体在视口中心。720px 首帧和 14 秒末帧 PNG SHA256 完全相同，乱序 seek 后状态一致，浏览器 pageerror 为空。证据在 `verification/browser-check.json` 与 `verification/contact-sheet-reference-default.jpg`；这些结论不替代完整导出视频的观看或试听。

配置加入本地 Geist 后，对 1080 × 1080 执行上层 `render.py --stills-only --check-seek` 的最终报告为 `verification/stills-1080-seek-fixed/verification.json`：5.18 秒乱序回放像素相同、状态相同、首尾像素相同，浏览器及请求错误均为空。进一步实际截图检查 5.0 / 5.383 / 10.5 / 10.75 / 11.833 秒，五个时间点重复像素与状态均相同：5.383 秒是已打开的开关，10.75 秒已输入 `fram` 并筛至两项，11.833 秒成功提示文字已进入。证据见同目录 `timing-proof.jpg` / `timing-checks.json`。`seek-1080-debug` 目录保存修复前的差异定位和实验结果，用于记录问题原因，不代表最终源码的验证结论。

建议重点抽查 0 / 1 / 1.5 / 2.5 / 3.5 / 4.5 / 5.15 / 5.5 / 6.5 / 7.5 / 8 / 8.5 / 9.5 / 10 / 10.5 / 11.5 / 12 / 13.5 秒；主要观测段落在 `project.json` 的 `marks` 中。


最终整合：包内加入原提示词指定的 Geist 可变字体，字重100–900，保留 SIL OFL 许可证；其他语言使用系统字体回退。最终渲染验证以主包交付记录为准。
