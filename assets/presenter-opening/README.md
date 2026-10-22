# 人物开场与实体材质组件

本组件接入现有 Canvas 工程，不替换后端或整库；实际用于 45.2 秒读书样片的开头与正文。样片主体和秒点不是新片模板，风格要求统一读 [审美偏好](../../references/aesthetic-preferences.md)。

## 使用

加载 `opening-stage.js`；需要书本和组合运动时再加载 `premium-materials.js`、`motion-library.js`。无外部依赖，使用现有 Canvas 2D，字体与素材由本期工程提供。

```js
const state = OpeningStage.layout(t, {
  duration: openingDuration,
  bounds: vacantRegion, // 实际人物视频中的空白区域，避开脸、手与字幕
  hero: heroIndex,
  cards: imageLayout,   // 每项 x/y/width/height/rotate/depthPx；中心坐标
  timing: eventTiming,  // enter/stagger/settle/focusAt/focusDuration/exitAt/exitDuration
  focusScale: 1.07
});
ctx.drawImage(presenterFrame, 0, 0, width, height);
for (const card of state.cards) OpeningStage.drawCard(ctx, images[card.index], card, material);
OpeningStage.revealNext(ctx, state, renderNextScene, {x:0,y:0,width,height}, nextFocus);
```

`renderNextScene` 必须绘制本期真实下一场，无空白占位；图片不冒充真实执行结果。非读书内容只换本期对象，不强塞书本。标题、字幕、背景、焦点内容和母带时间由宿主控制。无法安全同框时调整构图或按内容另选开场方式。

- `OpeningStage.layout`：可寻址的错峰入场、前后关系、单次重点聚焦与展开状态。
- `OpeningStage.drawCard`：保留真实图片，纸板厚度、接触阴影、边缘光；参数 `radius/edge/face/rim/shadow/shadowBlur/shadowY`。
- `OpeningStage.revealNext`：从当前主材料展开下一场，由宿主提供实际绘制内容。
- `LibraryMotion`：`springMorph/bookFan/cameraFocus/resultPullback/excerptTransfer/reveal/textReveal`，按内容组合；没有整片配色和固定构图。
- `PremiumMaterials.book(ctx,x,y,w,h,title,color,rotation,subtitle,small,time)`：书本示意，封面印刷、书脊、纸页厚度和纤维材质。真实书封优先使用真实素材；此函数只适合示意。

运动适配来源：ui-morph 的分边弹簧、Spotify 本机重建的错峰展开、MotionCore 的锚点聚焦、EditingKit 的揭示和交接；源码注释保留准确路径。这是本地适配，不声称取得原作者 AE 工程。

[本机开头与正文衔接实剪](file:///E:/ui/fusion-release-work/interview-candidate/sample-v2/opening-preview.mp4)。本机预览随原工程保留，不进入分发包；预览包含本期人物和书摘，供观察实现，不授权跨稿固定复用其身份与题材。原始45秒工程和技术检查位置在 [实现记录](validation.json)。
