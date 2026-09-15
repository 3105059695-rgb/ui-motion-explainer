# 制作与验收

## 1. 输入与工程组织

原片只读，新片放在独立目录。先确认源视频分辨率、fps、时长、音轨和可用字体。已有脚本/口播优先使用，不自动重写已确认的开头或事实。

节奏表建议列：`start / end / voice / objectId / stateBefore / actionId / stateAfter / hold`。时间用秒或帧统一计算。对象 ID 对应同一个逻辑对象，不因换布局而换掉身份。

工程通常包含 `index.html`、`assets/`、口播字幕与简短设计说明；按所选工具增加配置。在新工作目录复制样例，技能内基准样例保留不动。

## 2. 抽帧复核

优先看全片概览再看动作边界；四卡归并、划线与容器交接等动作使用 0.1–0.25 秒的邻近帧，不能从两张静态图虚构中间过程。

随包 `scripts/extract_reference_frames.py` 用 FFmpeg 精确输出指定时间帧，再用 Pillow 生成带时间标签的联系表：

```powershell
python -X utf8 '<skill-dir>/scripts/extract_reference_frames.py' '<source.mp4>' '<new-output-dir>' --times '20.8,20.9,21,21.1,21.2,21.3' --prefix merge
```

`<skill-dir>` 等表示需要替换的路径，不要原样运行占位符。时间是请求的解码时间位置，边界精度受源 fps 影响。输出不会覆盖已有文件；确需覆盖脚本生成的测试图时可显式加 `--overwrite`。脚本支持 `--ffmpeg`、`--font` 与 `--deps-path`，不绑定本机路径。

## 3. 字体必须真实进入渲染

样例曾遇到“大 TTF 未被渲染器内联，预览回退到宋体”的问题；只看 CSS 的 font-family 无法发现。解决办法是按实际文本生成 WOFF2 子集，并查看导出帧的真实字形。

使用已获许可的本地字体。随包脚本依赖 `fonttools` 和 `brotli`，在任务自己的虚拟环境安装；依赖已存在时直接复用，不修改全局 Python。脚本也可通过 `--deps-path` 使用任务目录下的依赖。

```powershell
python -X utf8 '<skill-dir>/scripts/prepare_fonts.py' --text '<project>/index.html' --text '<project>/assets/captions.json' --regular-font '<regular.ttf-or-ttc>' --bold-font '<bold.ttf-or-ttc>' --out '<project>/assets'
```

对于字体集合，`--font-index 0` 是默认值；按字体实际情况调整。输出 `Chinese-regular.woff2` 与 `Chinese-bold.woff2`。脚本会报告当前文本缺少的可见字形并停止；修正字体或文本后重跑。更改脚本、字幕或外部数据后重新收集所有可能显示的文字，不能只沿用样例的有限字集。

勾号等符号可能不在中文字体内。优先用 SVG 图标；保留文本符号时，可加 `--fallback-font '<symbol-font.ttf>'` 生成 `Chinese-fallback.woff2`，并在 CSS 中为该文件声明第二字体族（如 `ProjectSymbols`），将其放在 `ProjectSans` 之后。主字体加补充字体应覆盖所有可见字形，不依赖未知系统回退。已有输出需重新生成时，在确认目标是本任务生成的字体后加 `--overwrite`。

```css
@font-face {
  font-family: ProjectSans;
  src: url('assets/Chinese-regular.woff2') format('woff2');
  font-weight: 400;
  font-display: block;
}
@font-face {
  font-family: ProjectSans;
  src: url('assets/Chinese-bold.woff2') format('woff2');
  font-weight: 700;
  font-display: block;
}
body { font-family: ProjectSans, sans-serif; }
```

正文文字保持矢量或 HTML。放大截图不能补出不存在的清晰度。窗口展开优先改变遮罩范围，避免横向拉伸字体。

## 4. HyperFrames / GSAP 实现

先检查当前环境的 CLI 与已安装技能，使用当前版本支持的参数；不要硬编码某台电脑的 npm 缓存或 Chrome 路径。样例用 HyperFrames 0.8.38 验证，其他版本按实际帮助调整。

- 固定画布，先布局稳定状态，再做 transform / opacity 动画。
- 单一、同步注册的暂停时间轴：`window.__timelines.main = gsap.timeline({paused:true})`。媒体/字体准备交给宿主，不在异步回调里延迟注册时间轴。
- 所有状态变化进入可定位的时间轴。不能用 `setTimeout`、随机数、现实时间或外部交互决定导出的某一帧。
- 外层负责窗口/遮罩，内层负责文档滚动，前景结论独立一层。尽量不要让多个动画同时改同一个节点的 transform。
- 不通过在 `onUpdate` 里修改数据来模拟搜索；逐字状态可以用时间轴 `.set()`，这样前后拖动播放头时状态能重建。
- SVG 线条使用实际 `getTotalLength()`，避免随意填长度导致箭头提前出现。

### 累积荧光笔

文字与底色分层，底色在文字后方，左端锚定。以下是适配到新工程的示意代码，选择器和时间须由新节奏表提供。

```javascript
const tl = window.__timelines.main;
const fields = ['#goal-mark', '#progress-mark', '#constraint-mark'];
tl.set(fields, {scaleX: 0, transformOrigin: '0% 50%'}, 0);
fields.forEach((selector, i) => {
  tl.to(selector, {scaleX: 1, duration: 0.38, ease: 'power2.out'}, 3 + i * 1.7);
});
// 已高亮的行不归零；文档内层另设滚动时间，最后缩回总览。
```

### 搜索输入与过滤

```javascript
const query = '查询词';
tl.set('#query-text', {textContent: ''}, 0);
Array.from(query).forEach((_, i, chars) => {
  tl.set('#query-text', {textContent: chars.slice(0, i + 1).join('')}, 2 + i * 0.1);
});
tl.to('#nonmatch', {opacity: 0, duration: 0.25}, 3);
tl.to('#match', {y: -86, duration: 0.4, ease: 'power3.inOut'}, 3.1);
// 搜索栏保持固定；过滤后才在原卡内重排长文。
```

### 分支交接

先为三张子卡定义待出现、展开、仅标题三种稳定状态。新分支出现时：旧说明淡出 → 旧卡变矮 → 新连线生长 → 新标题 → 新说明。用预先计算的坐标插值；卡片高度改变时连线终点必须仍然贴住卡片。不要直接把 CSS display 切掉造成布局跳跃。

### 文档外部展开窗口

保持文档层的坐标和比例；将背后的窗口外壳设为独立图层，使用 `clip-path: inset(0 100% 0 0)` 到 `inset(0 0 0 0)` 揭示。外框完成后再高亮文档具体字段。不要把文档和外框一起从 scale 0 放大，否则继承关系不清楚。

### 退焦层与布局检查

真实重叠先修正布局，不能全局忽略。若已明确是有意的前景覆盖，可只给必要元素添加当前工具支持的重叠说明。

复杂背景在退焦后不再变化时，可以把**自己已搭建的背景**在对应时刻生成快照，短交叉淡化到该静态背景，再施加模糊。前景文字继续用真实排版。若背景之后还需要互动或变化，则保留分层动画。不要以此掩盖错位或把整个成片变成幻灯片。

## 5. 画幅与录屏

1920×1080 是参考基准。竖屏需要调整结构：四列可变 2×2；左右对比改为上下；字幕与平台 UI 保持距离。先重新布局，再按照同样的对象逻辑动画。

录屏素材优先使用用户提供或授权获取的真实操作。对准当前按钮/字段做裁切推近，在点击前留定位时间，点击后留结果。加速重复等待可以，但不能用剪辑伪造产品完成了没有完成的动作。

## 6. 音画对齐

HyperFrames 的视频层若只提供画面，应静音；口播/混音用明确时间范围的原生 `<audio>`，避免重复出声。检查实际工具是否要求 `data-start`、`data-duration` 与轨道元数据。

字幕以已确认口播的时间为准；ASR 先纠错再切句。标点与短句按自然停顿，不把长句挤成极小字号。确定最终音频后锁定时长与帧数，核对最后一句、字幕尾点和画面尾点。

给音频加短淡入淡出以减少截断爆音。检查无削波、无意外静音与双音轨；能试听就试听，不能试听则明确只做了技术检查。

## 7. 最小有效验收

检查强度服从用户要求和变更范围，不为小改动启动独立审查或重建完整测试体系。

1. 执行工程已有且相关的检查。HyperFrames 项目有 `npm run check` 时先运行；没有时调用本机已安装 CLI 的 `check`。定位实际错误后修复，不靠关闭检查获得通过。
2. 导出实际 MP4。Windows/低内存环境可以从单 worker、低内存模式开始；GPU 相关失败时按当前 CLI 支持尝试关闭浏览器 GPU。不要把这些机器兼容参数当成风格要求。
3. FFprobe 核对时长、分辨率、fps 与音轨；FFmpeg 完整解码检查损坏。对低影响改字可使用相关帧验证，不必无限重复全片扫描。
4. 查看每种镜头的稳定帧，以及归并、重排、遮罩、退焦等关键转换的中间帧；至少检查结尾。实际中文字体、字幕遮挡、裁切、行溢出是重点。
5. 能播放就播放代表段；只有波形与帧检查时，报告相应限制，不能说“全部试听无误”。

导出命令用当前可用 CLI 路径或安装后的 `hyperframes` 命令，不引用本机缓存路径。样例的 `package.json` 固定已验证依赖版本，复制后安装到新工程再运行；只想查看风格可直接播放随包 MP4，无需安装依赖。

## 8. 交付

用户请求视频时：给可播放 MP4 + 可编辑工程目录/压缩包，简短说明与参考一致的关键动作和实际验收结果。用户请求新增动效时：实现到对应镜头并展示效果，不只增加名词。

用户请求技能时：验证 SKILL 元数据、引用文件、样例资源及新增工具脚本，给技能位置和简短调用方式即可。不要为了验收技能自动生成收费音视频或发布素材。
