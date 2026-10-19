# 可植入现有工程的剪辑组件

这是一组无依赖浏览器 DOM 机制，不是新引擎或自动成片系统。把 `editing-kit.js`、可选 `editing-kit.css` 接入当前工程，在原来的确定性渲染函数中调用；保留现有字体、账号档案、素材、母带与导出器。六项均已有本目录独立演示，不只是参考配方。

## 立即预览

直接用浏览器打开 [demo.html](demo.html)。六项均可播放、暂停、从头、拖动时间，另有两个明确标注为“演示用色盘”的外观。没有网络资源、自动安装或生成服务；使用系统已有 `Microsoft YaHei`，未打包字体和浏览器。

指定机制和时间：`demo.html?render=1&effect=causal-chain&t=4`。`render=1` 停用播放器循环，便于原渲染器精确采样；正常预览默认暂停，不自动播放。示例全部为新写的“资料很多但遗漏目标读者→补条件→完整简报”概念内容，没有声轨，不构成真实产品操作证据或账号风格认可。

## 公共接口

```html
<link rel="stylesheet" href="assets/editing-kit/editing-kit.css">
<script src="assets/editing-kit/editing-kit.js"></script>
```

```javascript
const K = window.UIEditingKit;
K.setTheme(stage, {
  background: projectTheme.background,
  surface: projectTheme.surface,
  ink: projectTheme.ink,
  muted: projectTheme.muted,
  accent: projectTheme.accent,
  border: projectTheme.border,
  fontFamily: projectTheme.fontFamily,
  radius: projectTheme.radius,          // px 数字或 CSS 字符串
  shade: projectTheme.shade,            // 可选：蒙版颜色
  shadow: projectTheme.shadow          // 可选：浮层阴影
});

const state = K.apply('match-handoff', options, progress);
K.reset(object); // 恢复该节点由组件修改过的原有内联样式
```

`apply(name, options, progress)` 同步返回当前状态。`progress` 必须为有限数字，自动限制到 0–1；任何时点可直接重算，结果不依赖上一帧。没有随机、自由播放、定时器、网络请求或 DOM 测量。`K.names` 列出六个机制；`K.phase(p,start,end)` 提供限幅的 smoothstep。

**所有外观由项目传入。** `setTheme` 要求背景、表面、文字、次级文字、强调色、边界、字体、圆角八项，不内置阿刁/方木主题；只有未指定的遮罩与阴影使用中性实现起点。各内容节点的布局和正文样式仍由宿主控制。

## 几何与节点约定

- `viewport` 为 `{width,height}`，矩形为 `{x,y,width,height}`；单位是当前逻辑舞台像素，禁止混用浏览器缩放后的坐标。
- 参与效果的节点放在同一 `position:relative` 容器内，叠层先后由宿主 DOM 顺序或 `z-index` 管理。需要裁切的容器设 `overflow:hidden`。
- 组件不创建、销毁、克隆、查询或重排节点。将图片/视频放进所给 DOM 容器即可；同对象交接必须传同一个节点，不能中途换图片假装连续。
- 各机制只修改实现需要的样式，重新读取同一配置与进度可恢复同一状态。把组件应用在专用包裹层，不与宿主同时争写同一属性，不给这些属性加 CSS transition。
- `reset(node)` 恢复从首次应用开始由本库写过的属性；不恢复整个场景。切换到另一种效果时重建/复位专用包裹层，避免遗留另一个机制的属性。
- `img` 的解码、字体就绪、`video` 的载入/seek/play/pause 全部由宿主负责；本库不接触 `currentTime`、播放速率或音轨。

## 六个机制的参数

### `focus-mask`：保留上下文的聚焦与局部放大

```javascript
K.apply('focus-mask', {
  viewport: {width:1280, height:720},
  focus: {x:200,y:300,width:600,height:80},
  shades: [topShade,rightShade,bottomShade,leftShade], // 必需，四片现有蒙版
  outline,                                          // 可选
  loupe, loupeContent,                               // 可选，但二者须一起提供
  loupeTo: {x:120,y:460,width:900,height:120}
}, p);
```

四片蒙版保留焦点洞口，原上下文不删除。放大窗从原焦点几何过渡到目标位置；`loupeContent` 是宿主提供的整张截图或同坐标视觉副本，宽高等于逻辑舞台。本库不自动克隆实时视频，避免第二份视频自行走时。目标框尽量与焦点同宽高比；不同比例采用 contain 放大，可能留空白。返回 `{progress,focus}`。

### `occlusion-reveal`：前景遮挡揭示

```javascript
K.apply('occlusion-reveal', {
  viewport:{width:1280,height:720}, previous, next, cover,
  axis:'x', bandSize:112  // axis 可为 y；cover 是宿主设计的前景物件
}, p);
```

`next` 已真实渲染在 `previous` 上方，通过 clipPath 逐步显现，`cover` 前景条始终覆盖揭示边缘；两个端点隐藏前景条。`cover` 要由宿主提供不透明视觉，否则不形成遮挡。返回 `{progress,reveal}`。

### `match-handoff`：同对象跨场交接

```javascript
K.apply('match-handoff', {
  object,
  from:{x:100,y:300,width:360,height:146},
  to:{x:650,y:278,width:492,height:168},
  arcHeight:52,
  sourceContext, targetContext, sourceMarker, targetMarker // 全可选
}, p);
```

同一节点的位置和容器宽高连续变化，内容没有跨节点替换。尺寸采用容器重排，不非等比拉伸图片或文字；图片/视频需要在内部设置合适的 `object-fit`。外壳尺寸变化可能触发文字换行，宿主应按两个稳定状态设计可读版式。返回 `{progress,rect}`。

### `compare`：同对象受控揭示差异

```javascript
K.apply('compare', {
  viewport:{width:1080,height:390}, before, after, divider,
  axis:'x',
  regions:[{element:differenceOutline,rect:{x:35,y:190,width:980,height:128}}]
}, p);
```

前后内容必须由宿主对齐相同对象/坐标。进度直接控制揭示比例，不额外 easing，适合滑杆。差异框随可见范围裁切，不提前泄露未展示的一侧。`divider`、`regions` 可省略。返回 `{progress,reveal}`。

### `causal-chain`：持续对象的输入→核对→结果

```javascript
K.apply('causal-chain', {
  gate:.54,
  items:[{
    element:sourceDocument,
    from:{x:83,y:280,width:293,height:56},
    via:{x:478,y:280,width:299,height:56},
    to:{x:879,y:280,width:315,height:56},
    start:0, end:.82
  }],
  inputLabel, actionLabel, resultLabel, condition, result,
  connector // 可选 SVG path，须 pathLength="1"
}, p);
```

`items` 可以多项，每项始终是原节点；`start < gate < end`，gate 前从输入到核对，gate 后才到结果。条件、结果和连线为可选现有节点。`gate` 是**示意动作时点**，不验证真实任务条件，不等于联网执行成功；真实状态必须由宿主先映射成正确时序。返回 `{progress,gateOpen,phase}`。

### `result-pullback`：成果近景退回所属整体

```javascript
K.apply('result-pullback', {
  viewport:{width:1280,height:720}, world,
  focus:{x:568,y:247,width:544,height:296},
  margin:60, contextLabel, focusOutline // 后两项可选，须位于 world 内
}, p);
```

缩放与平移整个 `world`，从 focus 所在成果退回原场景坐标，不复制结果卡。返回 `{progress,scale,x,y}`。整个 world 外层需要裁切；不要同时由外层相机再次缩放相同内容。

## 接入 base / fusion，不换引擎

```javascript
window.render = async function(animationTime, mediaTime) {
  // 沿用现有媒体管理：同输出帧的媒体时钟固定，只有动画会多次采样。
  await existingSeekMedia(mediaTime);
  existingRenderOtherLayers(animationTime, mediaTime);
  const p = K.clamp((animationTime - cue.start) / (cue.end - cue.start));
  K.apply('match-handoff', handoffOptions, p);
};
```

这里的 `existingSeekMedia` 是宿主已有逻辑的说明性名称，不是本库 API，不要直接复制成不存在的调用。已有 render 函数中加入最后两行即可；不覆盖工程已有的其他逻辑。运动模糊依然由导出器传 `render(subsampleTime,fixedMediaTime)`。

Remotion/其他后端可参考同一几何原理，但本模块只提供浏览器 DOM 接口，不宣称已有 React Composition 或原生 AE 插件。

## 演示渲染接口与最小验证

演示提供 `await window.ready()`（等待字体）、`window.renderAt(seconds)`、`window.duration=8`、`window.selectEffect(name)`、`await window.render(animationTime,mediaTime)`、`window.motionActive(time)`。演示没有视频或音频，第二个时间参数不参与动画。

```powershell
node --check editing-kit.js
node --check demo.js
node smoke-test.cjs
```

smoke test 检查六项端点、乱序重算、无媒体时钟改写、参数错误、主题注入与样式复位。它不代替浏览器画面检查、真实素材音画同步或账号审美认可。最终检查记录见 [validation.json](validation.json)。
