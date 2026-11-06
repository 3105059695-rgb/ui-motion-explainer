# 直接执行已有对象的动作

`index.html` 可浏览全部 72 项；完整连续风格示范在 `../style-film/index.html`。这里的演示用于说明接口，不是当前视频的固定模板，也不是新获用户认可的成片。

O01–O33 是 33 个独立 DOM/SVG 行为。R01–R16 是带先后阶段的事件组合。X01–X23 保留原 HTML/GSAP 源码与完整区间，不替换成同一种卡片。查参数和实际可绑定文字：

```sh
python scripts/semantic_effects.py inspect O23
python scripts/semantic_effects.py inspect X21
```

已有项目直接载入 `semantic-motion.js`，把当前对象、几何与本期内容交给接口：

```js
const action = SemanticMotion.create({
  effect: 'O27', duration: 3,
  options: {node: {selector:'#deadline'}, before:'周三交付', after:'周五交付'}
});
action.seek(1.8); // 确定性本地秒数；可回退，不启动隐藏时钟
```

或生成不依赖本机原路径的可编辑项目：

```sh
python scripts/semantic_effects.py materialize --id O27 --out ./work/deadline --stage ./current-stage.html --bindings ./current-bindings.json --duration 3
python scripts/semantic_effects.py materialize --id X04 --out ./work/recording --bindings ./recording-bindings.json
```

O/R 的 `--stage` 是现有对象的 HTML 片段；`--bindings` 含 `options`，节点写为 `{"selector":"#deadline"}`。本期布局可任意变化，不需重写底层动作。`media` 将指定 IMG/VIDEO 绑定本地文件并复制进独立项目；`mediaTracks` 指定 `selector/start/offset/end`。

X 的 `text` 是「实际叶节点选择器 → 本期文字」；`states` 可按原阶段文字映射新阶段文字；`media` 是「选择器 → `{src,kind,fit,sourceIn}`」。X04 支持在原 `.recording-slot` 内接真实视频。完整原动画长度保留，原示范音轨不带入新片。X03 的来源文字与放大副本需同时绑定，避免两处内容不一致。

产物统一提供 `await window.ready()` 与 `await window.render(localSeconds)`，以及 `motion-binding.json`。示例内容只在明确传入 `--demo` 时使用。没有现成视频时，R06 不会把静图位移冒充角色动作；它要求真实同角色/任务视频，按返回的源时间以 1 倍播放。O33 要求真实测量的人物保护区与留白安全区，示范中的人物占位不是数字人成品。

`verification.json` 记录 72 项真实浏览器多时刻 seek 和回退检查。它证明接口与状态执行，不代表整段实时视听审美通过。独立目录绑定、当前文字、真实视频解码和不覆盖已有工程另由 `tests/test_semantic_effects.py` 检查。
