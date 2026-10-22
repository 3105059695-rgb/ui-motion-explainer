# 本期口播事件工程

已加载方木十款 Agent 实际源码提取的 `AgentEditorial` 视觉与动作模块。工程是空白且未制作的：`scenes.js` 没有预设排行榜、卡片场景或主题。完整效果库仍可选用，将合适的实现接入本期场景。

1. 读完整原稿，按真实音频确认各句与事件时间，选择能解释它们的对象和素材。
2. 在 `scenes.js` 写本期的 `StoryScenes.<场景名>` 函数；每个函数按实际动作改变对象状态、位置或画面，而非只替换文字。SDK 接口在正式 Skill 的 `assets/agent-editorial/README.md`。
3. 用 `timeline.json` 的 `segments` 将原稿范围、实际输出时间、场景函数及事件绑定起来。`project.json` 与 timeline 的时长、尺寸、原音频和字幕需完全一致。
4. 原有 `ui.py render --engine fusion` 继续渲染此工程。生产交付仍需真实 director plan 和 implementation manifest；空工程不能导出，不把技术调用成功视为审美认可。

## 场景与时间

```js
StoryScenes.myEpisodeEvent = ({ctx,D,t,mediaTime,localTime,segment,layout,asset,event,phase}) => {
  // D 使用本期画布坐标；D.C 是实际配色，D.motion 不存在，动作取 AgentEditorial.motion。
  // phase('unfold') 返回段内事件 0–1 进度；可配合 AgentEditorial.ease / motion.spring。
  // asset('product-shot') 返回已加载的真实图片或静音视频帧。
  // 当前话题的对象、构图、事件全过程在这里设计；不必使用固定数量的窗口。
};
```

`t` 是动画采样秒，`mediaTime` 是原素材/口播主时钟。运动模糊采样只改变 `t`，人物帧和字幕锁定 `mediaTime`；不要将素材时间绑定到动画子采样。`localTime` 为当前段落内部时间。所有绘制函数是同步函数，媒体由 `ready()` 完成预加载。

时间线形状如下（示意字段需换成本期真实值和哈希，不能直接交付）：

```json
{
  "schema_version": 1,
  "source_sha256": "本期原稿SHA256",
  "duration_seconds": 10,
  "duration": 10,
  "width": 1920,
  "height": 1080,
  "media": {
    "audio": "media/original.wav",
    "captions": [{"start": 0, "end": 3, "text": "保留的原字幕"}],
    "assets": [{"id": "presenter", "type": "video", "src": "media/presenter.mp4", "start": 0, "mediaStart": 0}]
  },
  "segments": [{
    "id": "sentence-1",
    "span": {"start": 0, "end": 10},
    "output": {"start_seconds": 0, "end_seconds": 10},
    "scene": "myEpisodeEvent",
    "layout": {"mode": "body", "presenterRatio": 0.22},
    "events": [{"id": "unfold", "start": 0.2, "end": 0.9}],
    "implementation": {"path": "scenes.js", "sha256": "真实文件哈希", "marker": "myEpisodeEvent"},
    "assets": []
  }]
}
```

`output` 为成片秒；`events[].start/end` 为段内秒。事件的 `motion:false` 可标记只需静置读清的区间。`media.assets` 描述浏览器加载的素材，段落 `assets` 是与 director plan 一致的素材文件/哈希记录，两者职责不同，都必须写实际来源。视频素材时钟为 `mediaTime - start + mediaStart`，不自动变速。素材 src 支持当前服务器同源的相对 URL 或绝对 URL；磁盘绝对路径要先通过项目素材映射/本地服务器开放，不使用跨域或 `file:` 绕过。

## 有人物的开头

`layout.mode` 用 `presenter-opening`，并指定 `presenter` 素材 ID。运行时先以 contain 方式画完整原始人物画面，再通过 SDK 的真实 Canvas 裁剪绘制特效。

```json
{
  "mode": "presenter-opening",
  "presenter": "presenter",
  "regions": [{"x": 1150, "y": 140, "w": 650, "h": 680}],
  "protectedRects": [{"x": 0, "y": 0, "w": 1120, "h": 1080}]
}
```

坐标只是字段示意，**不能当固定右侧空白**。先看实际片段，记录覆盖人物、运动手部和字幕的保护区域；有动作变化时分段或使用覆盖全段动作范围的区域。没有明确空白与人物保护区域，运行时只显示人物、不画覆盖特效。运行时额外保护当前字幕所在的底部区域；不是自动识别人像。

## 正文与全屏

`layout.mode:"body"` 提供可调的 `presenterRect/contentRect`，场景代码自行选择人物尺寸和素材设计。`mode:"focus"` 提供完整画布，适合真实操作、重要结果或大场景；需要回到人物时由下一段或本段动作设计衔接。区域不是强制版式，也不会自动套排行榜。实际函数决定场景内容，时间线只调用已写的函数，不根据关键词擅自造画面。

## 实际调用证据

`window.UIFusionRuntime.getTrace()` 仅记录成功执行的本期场景函数。开头因缺少安全区域而跳过的覆盖函数不会记录为已执行。此记录与渲染器共同保存，不能代替观看、内容正确性判断和用户审美认可。
