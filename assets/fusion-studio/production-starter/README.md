# 从原稿进入实际制作

此空运行环境仅由 `new --engine fusion -- --custom-layout --out <工程>` 显式创建。普通制作先通过 `ui.py scene` 绑定所选完整场景，或适配效果库中的完整源码；这里本身不提供已选视觉设计。

这是工程起点，不是已做好的视频。不预填题材、口播、分镜、固定卡片或旧 72 秒演示；空工程显示“尚未制作”，导出模式拒绝空时间线。

1. 先读本工程 `director-brief.md` 中的当前方向、适用认可片段及源码。按本稿确定对象、操作、结果和下一句的衔接。
2. 在 `timeline.json` 中登记实际素材和持久对象，再安排动作；一次动作可以跨多句。已有页面内容可直接留在 `index.html`，登记为 `host`。
3. 把原声和字幕登记到 `timeline.media`；`project.json` 的 `duration/width/height/audio/captions` 必须与时间线相同。这里不改写、配音或自动编造字幕。
4. 用现有本地 HTTP 服务打开 `index.html` 预览；按主入口准备实际计划，再正式导出。不要用 `--demo` 把生产起点作为交付。

## 时间线

```json
{
  "schema_version": 1, "duration": 4, "width": 1920, "height": 1080,
  "media": {"audio": "assets/original.wav", "captions": []},
  "objects": [
    {"id":"material", "type":"image", "src":"assets/material.png",
     "style":{"left":"200px","top":"200px","width":"600px","height":"400px","object-fit":"contain"}}
  ],
  "actions": [
    {"id":"material-takes-focus", "name":"match-handoff", "start":1, "end":1.6,
     "options":{"object":{"$ref":"material"},
       "from":{"x":200,"y":200,"width":600,"height":400},
       "to":{"x":360,"y":120,"width":1200,"height":800}}}
  ]
}
```

这是接口用例，素材路径是占位符，不会自动生成或进入新工程。`name` 使用 EditingKit 的实际方法名；参数按 API 文档填写。所有层级内的 `{"$ref":"id"}` 都会解析为同一个 DOM 对象，包括数组。`viewport-focus`、`comparison-reflow`、`chapter-dock` 等组合直接通过同一接口调用，不把来源方法编号 `F-Mxx` 当作效果名。

对象类型：`image`、静音 `video`、`text`、空容器 `group`、已在 HTML 定义的 `host`。`parent` 指定父对象；不指定时生成对象放在同一舞台。`start/end` 可控制可见时间，`video.mediaStart` 指定素材入点。UI、截图和 AIGC 使用同一种对象引用，可交接而不重建节点。需要 SVG、复杂 DOM 或多个语义状态时在 HTML 中创作内容，不受模板卡片结构限制。

动作按开始时间排序，同一开始时间按 JSON 顺序执行。每帧恢复初始样式，再重放**已开始**的动作，已完成动作保持终态；未来动作不抢写当前对象。连续动作的后一段 `from` 应与前一段 `to` 接续；同一属性重叠时后执行者覆盖，作者应有意安排。

`window.ready()` 等待 JSON、素材和字体。`window.render(animationTime, mediaTime)` 可乱序取帧：动作使用 animationTime；原素材视频与字幕使用 mediaTime，运动模糊采样不会改变对应的口播时刻。`window.motionActive(t)` 标识动作时间段。正常预览由原声媒体时钟驱动，导出由既有渲染器混入 `project.audio`。

本期本地视频与原声通过同源、有界 Blob 加载，因此普通本地 HTTP 预览即使不支持 Range 也能准确取帧。单文件 Blob 上限 128 MiB、总量上限 512 MiB；更大文件只有服务器明确支持字节范围时才直接流式读取，否则报错，不自动读取外部或未知超大媒体。既有正式渲染器已使用 `SingleRangeHTTPRequestHandler`，无需安装或另建服务。加载必须完成元数据和首帧解码；每次 seek 同时检查实际时间、解码状态与寻帧状态，不能仅因 `seeked` 事件出现就报告成功。

## 实际调用与限制

`UIFusionRuntime.getTrace()` 仅在 `UIEditingKit.apply` 实际成功返回后记录方法、时间、进度、输入引用与返回值；`resetTrace()` 清空本次观察。预览的“保存实际调用记录”会下载 JSON，也可由浏览器工具读取后写进检查文件。最多保留前 50,000 条及最后一帧，超出量在 `droppedCalls` 中明确报告。记录证明调用发生，不证明语义合适、画面清楚、成片通过。

既有正式渲染器在关闭浏览器前自动保存 `editing-kit-runtime-trace.json`，含实际总调用数、各方法计数和最多 2,000 条明细及最后一帧的有界记录；其余数量明确标注。整片渲染记录不混入前面的联系表取帧，计数包含运动模糊采样。旧工程未提供此 API 时明确记录 `unavailable`，不伪造调用证据，也不影响旧工程渲染。

起点颜色变量仅用于空工程提示，没有预制画面或账号皮肤。正式制作从效果库选本期设计，具体材料、字级、构图与动作写入源码；不能把起点变量视为已选风格。沿用已有字体与运行环境，需要可移植交付时绑定本期实际使用的合法字体。

历史示意仍可显式创建：`ui.py new --engine fusion -- --out <新目录> --scene F01`，或 `--scene all`。它们保留历史来源和演示标记，不再是普通新建默认值。
