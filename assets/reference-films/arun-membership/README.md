# 阿闰连续解释机制

从整片观察重建的可编辑机制，外观沿用当前 `AgentEditorial` 配色和实体绘制；不是原作者源码，也不是已完成的 191.7 秒成片。完整口播、动作链与适用边界由 `direct prepare --reference arun-membership` 送入本期上下文。

[打开可拖动的 28 秒机制演示](demo.html)。演示使用自绘说明材料，无原片音轨，不代表真实产品测试或新成片认可。

## 接到实际工程

在 Canvas Story 工程中复制本目录的 `reference-scene.js` 到 `lib/reference-films/arun-membership/`，在已有 AgentEditorial 脚本之后加载；保持目录中 `agent-editorial` 的相对位置供 Node 使用。已有工程不替换原运行时。然后在本期 `scenes.js` 注册：

```js
StoryScenes.thisEvidence = ArunReference.createScene({
  kind: 'evidence',
  objects: [{id:'document', label:'本期资料', detail:'同一份资料'}],
  evidence: {asset:'actual-result', title:'实际结果'},
  events: [
    {id:'focus', at:0, duration:0.6},
    {id:'reveal', at:0.2, duration:0.65},
    {id:'annotate', at:1.2, duration:0.5},
    {id:'return', at:3.2, duration:0.65}
  ]
});
```

时间相对本期 `segment.start`；`segment.params` 可覆盖本期配置，`segment.events` 存在时取代配置中的事件。对象 `id` 在相邻场景保留，`from/to` 必须衔接本期实际几何。单一机制用于段落事件，不按每句话重复轮播全部机制。源片段取景与切点继续使用 `material_shots`，本模块不调速媒体或更改原声。

`evidence.asset`、`objects[].asset` 通过现有 `asset(id)` 获取实际图片或视频元素；声明素材却缺失时明确报错。未声明素材时只显示“示意”，不能当成真实证据。也可传 `draw(D,rect)` 绘制明确的机制图。真实产品素材保持本色；所有包装使用 `D.C`，不带入原片蓝、绿、棕舞台。

## 可用机制与事件

| kind | 可见变化 | 主要配置 / 事件 |
|---|---|---|
| `objects` / `evidence` | 同一组对象缩小腾位，所属证据展开、圈注、回收 | `objects(id,label,detail,asset,from,to)`，`evidence`，`annotation`归一化矩形；`focus/reveal/annotate/return` |
| `dock` | 原总览从主位缩到导航，下一主体接入 | `objects(status)`，`from/to`，`next`；`dock` |
| `ecosystem` | 中心来源依次放出节点，节点再归拢 | `center`，`objects`，`region`；`node-ID/gather` |
| `quota` | 额度下降与已耗时一起改变 | `fromAmount/toAmount/fromSeconds/toSeconds/track`；`change` |
| `blocked` | 进度到指定位置停住，再表现接手受阻 | `fromAmount/toAmount/track/blockLabel/takeoverLabel`；`change/block/takeover` |
| `blackbox` | 盖住过程、等待、抬盖，结果随后出现 | `box/label/waitSeconds/resultLabel/resultSymbol`；`close/wait/open/result` |
| `independent` | 多份额度进入，只有指定项消耗 | `objects(fromAmount,toAmount,emptyLabel)`，`focus`；`enter-ID/change` |
| `versions` | 旧稿保留，划改后新版本叠入 | `objects(label,lines)`；`version-ID/strike-ID` |
| `comparison` | 表头和比较行逐项出现，只突出所选列 | `columns/selected/objects(label,values)`；`row-ID` |
| `decision` | 需求行先出现，箭头和答案随后接入 | `objects(label,result)`；`row-ID/answer-ID` |

所有默认时窗只是 API 示例。按本期原声和阅读量传入事件；不要复制原片 191.7 秒时长、旧产品排名或品牌用色。开头有人物时，仍由原运行时保护实测人物区域；不能因参考无真人而覆盖人。

`stateAt(spec,localTime)` 可返回确定性状态用于检查，但状态计算与解码成功不代表审美已通过。运动模糊由现有双时钟导出器按当前输出检查；本模块不会凭空声称复刻原音效或作者精确曲线。
