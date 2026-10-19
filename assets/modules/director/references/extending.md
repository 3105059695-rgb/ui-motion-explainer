# 新增预设与来源复刻

所有可运行条目通过 `UIFX.register(meta, builder)` 注册。`meta` 至少包含 `id/title/category/duration/description/tags/sourceStatus`。category 使用 opening、software、interaction、ai、result、transition、ambient。

`builder(ctx, params)` 将场景挂载到 ctx.root，返回 `{timeline, duration}`。timeline 为暂停的 GSAP 时间轴。ctx 包含 gsap、root、q、qa、esc、text、cursor、click。CSS 用唯一的预设作用域类；选择器通过 root 查询，不修改其他场景。用户参数插入 HTML 前使用 esc。

`ctx.text(tl, element, text, start, duration)` 把初始空串与逐字内容全部写入时间轴；可前后定位。其他状态文本同样用 `tl.set`，禁用定时器、随机数、或仅在 onComplete 中改变正文。首次 seek 到后半段与从头播放的同一时刻应该一致。

用完整可用的字体；SVG 图标避免缺字。默认1920×1080，在阅读稳定态排好布局后再加动画。保持点击落点与控件一致，选中行和展开文档属于同一个对象。

新增源码后运行 `node scripts/catalog.mjs` 更新真实注册目录，再做语法检查和浏览器观察。每个模板至少查看开始、中间状态、结果、末尾以及从末尾回拖；只检查首帧不足以验证动画。

## 复刻记录

作品记录必须有来源链接、作者、观察内容与范围、原始状态、代码ID、实际验证记录。`queued` 是待拆解；`observed` 是看到了具体画面；`implemented` 需要代码存在并与观察机制逐项验证。未观察作品的原创代码用 original-extension，不暗示从该站准确复刻。

分类目录只用于导航，不因一个预设映射就称整类完成。全站任务持续保留逐作品待办；可以按用户视频用途排优先级，但不得删掉其他分类制造100%覆盖。
