# X21–X23：让工作对象连续变化

三段各 9 秒的无声原创流程示意，采用 1920×1080、50 fps、近白画布、近黑正文与局部紫色强调。动作用来说明资料的来源、操作和去向；窗口中保留可读内容，快速到位后停下来阅读。

| 样片 | 适合表达 | 播放与工程 |
| --- | --- | --- |
| X21 资料纵深归并 | 多个来源汇成一个可继续编辑的文件 | [MP4](../assets/motion-lab/X21.mp4) · [GIF](../docs/previews/X21.gif) · [depth.js](../assets/motion-lab/scenes/depth.js) |
| X22 仓库窗口连续推镜 | 从全局找到关键条目，再说明它属于哪里 | [MP4](../assets/motion-lab/X22.mp4) · [GIF](../docs/previews/X22.gif) · [zoom.js](../assets/motion-lab/scenes/zoom.js) |
| X23 数据文件曲线交接 | 同一份数据移交到下一步，并展开成可读报告 | [MP4](../assets/motion-lab/X23.mp4) · [GIF](../docs/previews/X23.gif) · [handoff.js](../assets/motion-lab/scenes/handoff.js) |

[完整预览](../assets/motion-lab/preview.mp4) · [可编辑工程](../assets/motion-lab/index.html)。GIF 便于查找动作，节奏与阅读效果以 MP4 和工程播放为准。

## X21：资料纵深归并

**语义：**“网页里的摘录、随手写的笔记，最后都进入这份选题。”适用于素材整理、调研汇总、引用归档。

网页摘录先停在前景，选题笔记接管同一个阅读焦点，内容提纲随后进入前景。归并时，原来的两张来源窗口收成引用条；原提纲成为“工具工作流选题.md”。窗口外壳、内容、阴影分别变化，来源始终有去处。末段让文件名、核心问题与引用稳定可读。

**避免：**把几张无内容卡片随机飞走，再淡入一张全新的结果卡；让所有窗口同时争夺前景；来源还没读完就开始下一轮移动。

## X22：仓库窗口连续推镜

**语义：**“先看仓库结构，真正要用的是这一项，再看它在整体中的位置。”适用于仓库讲解、配置定位、产品功能说明。

保留同一个仓库窗口，从总览连续推近关键条目；阅读焦点到位后停住，通过局部选区说明条目；随后回到总览，让观众重新获得位置关系。镜头移动与内容层级对应，关键文字保持清楚。

**避免：**用几张不相关截图交叉淡入冒充连续操作；为了节奏加速真实录屏；放大到失去上下文，又不带观众回去。若使用操作视频，保持原片 1×，在外层做取景和推镜。

## X23：数据文件曲线交接

**语义：**“把这份数据交到下一步，展开后就能读懂结果。”适用于数据到报告、文件交付、结果预览。

数据文件从来源窗口抬起，沿一条明确曲线移动并停稳。随后同一张纸通过 `inset` 遮罩展开；原来的字段与数值重新排布为报告条目和图表，文件身份与来源保留。示例中的 12、9、3 在交接前后保持一致，最后停留在可读结论上。

**避免：**文件离开后无故消失，再出现另一份数据的报告；移动、展开、读数全挤在同一瞬间；把示意数据写成真实产品业绩。

## 套入新口播

先从口播里找出“对象 → 操作 → 结果”：多来源归档用 X21，定位细节用 X22，同一文件交付用 X23。替换窗口里的真实标题、字段和出处，并检查各状态指向同一对象。不要只换顶上的一句大字。

按语义重音移动，在关键信息完整出现后留出阅读停顿；这些 9 秒样片是动作参考，正式片长服从口播。近白底与黑白窗口承担内容，紫色只标出当前重点。接入人物和字幕时，先按用户素材划出占位，再排窗口与镜头；公共工程不附人物或音色素材，也不固定套用某个人物、字幕位置。

## 工程说明

工程锁定 HyperFrames **0.8.62**。运动模糊使用 HyperFrames 上游 **`1b8f8a4`** 的 `motion-blur` 组件，许可证为 **Apache-2.0**。分发时随工程保留该组件的[许可证](../assets/motion-lab/assets/HyperFrames-Apache-2.0.txt)与[来源说明](../assets/motion-lab/assets/provenance.json)。

### 接入运动模糊与时间轴

在真正快速移动的 DOM 对象上放置以下属性。四个参数依次表示一帧曝光宽度、居中曝光、每帧 8 个采样间隔、50 fps；静止文字和慢速推镜保持清晰。

```html
<article id="moving-file"
  data-hf-motion-blur='{"shutterAngle":360,"shutterPhase":-180,"samplesPerFrame":8,"fps":50}'>
  <!-- 文件外壳与内容 -->
</article>
```

以下是单段场景的接入顺序，脚本路径以 `assets/motion-lab/` 为当前目录。完整宿主另有字体与播放界面；此段展示组件需要的组成关系。

```html
<div id="main" data-composition-id="main"
  data-width="1920" data-height="1080" data-duration="9" data-fps="50">
  <div id="scene-mount"></div>
</div>
<script src="./assets/gsap.min.js"></script>
<script src="./scenes/depth.js"></script>
<script>
  const mount = document.getElementById('scene-mount');
  const timeline = window.makeDepth(gsap, mount);
  timeline.time(0.0001, true).time(0, true); // 显式建立首帧
  window.__timelines = window.__timelines || {};
  window.__timelines.main = timeline;
</script>
<script src="./assets/motion-blur.js"></script>
```

先创建 DOM 并同步写完全部补间，再以 `data-composition-id` 对应的键注册时间轴。注册后的暂停时间轴由 HyperFrames 逐帧 seek；不另开实时时钟自动播放。上游组件根据目标最近的 composition 根节点查找时间轴，不能给同一个 composition 重复注册不同时间轴。

移动被标记对象本身的 `x`、`y`、`scale`；组件不从 `left`、`top` 或一个正在移动的祖先推导其轨迹。不要同时标记父子对象，不在接入后重新挂载目标的父节点。场景提前保存原 DOM 引用或用唯一 ID 定位，避免按类名选到模糊副本。确需动态创建目标时，等该时间轴全部补间完成后再使用 `attachMotionBlur`；本组场景使用预先建立的 DOM 和声明属性。

**本次接入发现的边界：上游组件会缓存子节点样式。** 目标整体移动时可以使用这些副本；若内部内容、透明度或外壳高度继续变化，副本可能仍显示先前状态。不要把这个组件直接套到内容持续改变的节点，也不要把变旧的副本误判为正常运动拖影。

X21 在 `depth.js` 内限定场景范围，通过 CSS 变量强制控制模糊副本组的合成透明度：0–5.12 秒的静态内容移动可以使用模糊；5.12 秒后把副本组透明度设为 0，随后的折叠归并只显示原对象。`visibility` 的继承值会被副本上的内联 `visible` 覆盖，不能可靠隐藏整组；这里用组级 `opacity` 与 `!important` 关闭副本的合成显示。用 `timeline.set` 写出两个状态，使回跳时间轴时也能恢复；不修改上游组件，不移除目标，不重新挂载父节点。

```css
#d-scene [data-hf-motion-blur-group] {
  opacity: var(--shutter-opacity, 1) !important;
}
```

```js
const scene = mount.querySelector('#d-scene');
tl.set(scene, { '--shutter-opacity': 1 }, 0);
tl.set(scene, { '--shutter-opacity': 0 }, 5.12);
```

5.12 秒是本场景的内容变化边界，不是可普遍套用的固定时间。套入新口播时重新找到内容开始变化的落点；如果内容始终在变，直接保持对象清晰，或选择适合该内容的其他采样方案。

### 同一 DOM 的 camera 配方

X22 的窗口外壳固定，内部 `view` 负责裁切，`camera` 包含原来的导航与文档。`camera` 的 `transform-origin` 为 `0 0`，不复制页面、不替换截图。以下节选插入已经创建的场景时间轴；`camera`、`mark` 均为原 DOM 引用。

```js
tl.to(camera, {
  scale: 1.42, x: -468, y: -106,
  duration: 0.72, ease: 'power3.inOut'
}, 2.44);
tl.to(mark, { scaleX: 1, duration: 0.48, ease: 'power2.inOut' }, 3.22);
// 中间保留阅读段，再将同一视图还原。
tl.to(camera, {
  scale: 1, x: 0, y: 0,
  duration: 0.8, ease: 'power3.inOut'
}, 6.14);
```

替换素材后，以关键条目中心重新计算平移量，核对取景框中的文字与上下文。需要解释时先停住；推近幅度和停留时间不按字数机械套值。

### 曲线交接与 inset 配方

X23 的移动对象 `object` 始终包含同一张 `paper`；字段、数值和报告图形在构建时间轴时已经存在。位置先沿曲线交接，落地后才解除纸张裁切。以下为场景中的核心关系：

```js
const travelEase = gsap.parseEase('power2.inOut');
const arcEase = (p) => {
  const t = travelEase(p);
  return t - 10 * t * (1 - t);
};
tl.set(object, { x: -870, y: 24 }, 0);
tl.set(paper, {
  clipPath: 'inset(112px 146px 208px 104px round 18px)'
}, 0);
tl.to(object, { y: -32, duration: 0.35, ease: 'power2.inOut' }, 2.05);
tl.to(object, { x: 0, duration: 1, ease: travelEase }, 2.4);
tl.to(object, { y: 0, duration: 1, ease: arcEase }, 2.4);
tl.to(paper, {
  clipPath: 'inset(0px 0px 0px 0px round 24px)',
  duration: 0.75, ease: 'power3.inOut'
}, 3.75);
```

两个位置通道使用同一个时钟：`x` 决定前进，`y` 的确定性曲线给出抬起与落点。改变交接距离时一并调整曲线高度；落点前后保持文件名和数值一致。遮罩展开后让原字段归位、图表显现，再给结论阅读时间。不要用 `onUpdate`、`Date.now()`、随机数或延迟回调拼接状态，保证向前或向后 seek 都得到同一画面。

公共工程仅使用仓库内相对路径，不包含本地私有路径。

**实际验证：**已导出合辑与三个独立 MP4，检查字体、关键与中间帧、时间轴回跳、运动模糊接入，并完成全片解码。运行检查通过；具体警告与像素比较边界见[验证记录](../assets/motion-lab/verification.md)。新方案尚未标为用户已确认风格。
