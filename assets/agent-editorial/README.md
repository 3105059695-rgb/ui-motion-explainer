# 连续 UI 制作模块

从用户认可的方木「十款 Agent」实际源码提炼，承接颜色关系、实体质感和连续动作。原工程与提炼对应关系见 [provenance.json](provenance.json)，6 份实际源码和原制作手册保留于 `source/`。原正文受到认可，原片开头没有因此成为通用方案。当前审美只在[偏好页](../../references/aesthetic-preferences.md)维护。

## 实际进入新工程

在 Skill 根目录运行：

```powershell
python -B -X utf8 scripts/ui.py new --engine fusion -- --custom-layout --canvas-story --out <工程>
```

命令复制 SDK 到工程 `lib/agent-editorial/`，`index.html` 实际加载它。新工程仍是未制作状态：Agent 根据完整口播，在本期 `scenes.js` 注册场景函数；`timeline.json` 的 `segments`、事件及素材直接参与绘制。段落不是自动关键词模板，没有排行榜、十款产品、旧人物或固定秒点。场景、素材和实现绑定沿用同一导演计划，正式导出沿用已有 `ui.py render --engine fusion`。

已有工程可直接引入 `motion-core.js` → `agent-editorial.js`，沿原后端时间调用。整个效果库的 DOM、Canvas、完整场景及 AIGC 能力继续开放；按真实接口组合或适配，不用这几个绘图函数代替全部效果。

## 绘图与动作

```javascript
const D = AgentEditorial.create(ctx, {width, height, fontFamily});
D.frame(() => {
  // 坐标使用本期1920×1080逻辑舞台，输出尺寸可不同。
  // 以下只是API用法；真实窗口、文字和构图由本期场景提供。
  D.card(rect, {dark: true, depth: 8});
  D.text(title, x, y, size, D.C.white);
  D.progress(trackRect, progress);
});
```

- `D.card/sheet/file/screen`：不同实体、纸张厚度、窗口层次；不是只有矩形换色。
- `D.image(image, rect, {fit:'contain', crop, radius})`：真实材料及明确的局部聚焦。
- `D.place(rect, draw, {rotation, opacity, scale})`：围绕对象中心迁移与转动。
- `AgentEditorial.motion`：原版 MotionCore；`spring`、`springTrack`、`sharedHandoff` 等按绝对时间求值。
- `stagger(t, {start,index,gap,omega,damping})`：按本期时窗错峰；`rectMix` / `layout({base,focus,amount})` 用于本期测量矩形间迁移。
- `cue(chapter,id)` / `phase(t,chapter,id,duration,delay)`：读取真实口播 cue；缺失明确报错，不套用旧片秒点。

当前材质配色：近黑 `#0B0B0F`、白 `#FFFFFF`、用户于 2026-10-26 选定的 A 色强调紫 `#D6C2FF`、灰 `#777780`、边缘灰 `#DBDBE0`、轻灰分区 `#F3F3F5`。浅紫用于暗表面重点，浅紫底的 `pill/check` 默认用近黑文字或勾号，`progress` 默认用近黑轨道；`arrow` 默认使用近黑线条，暗表面可显式传入 `D.C.purple`；白底小字和细线使用深色或增加暗色承载面。局部材质、真实品牌材料与画面明暗由本期内容决定；不是全片强刷黑紫。`source/` 保留历史原码，改编时读取当前 `palette.json` / `D.C`，不复制历史色号。字体由本期工程提供，不复制大型字体或运行环境。

## 有人物的开头保护

```javascript
D.frame(() => D.opening({
  frame: originalPresenterVideo,
  stage: {x:0,y:0,w:1920,h:1080},
  regions: measuredEmptyAreas,
  protectedRects: measuredFaceBodyHandsAndCaptions
}, () => drawThisEpisodesGraphics(D)));
```

先完整保留原画面，再把全部叠加绘制裁剪到实测空白区，扣掉保护范围。未提供保护区时保留人物、停止叠加；不会假装自动识别人脸。测量应覆盖这段移动手势，不只一帧。无人物开头由本期场景自由设计。普通正文可用左侧人物／栏目信息、右侧内容的基础关系，重点可全屏展开。

## 边界

这是 Canvas 实际生产实现，不是原生 AE 工程。原源码的局部拖影不等于全片运动模糊；有需要时用现有双时钟渲染器，并检查实际编码帧。SDK 不代替选材、语义编排、素材生成或视听判断。AIGC 使用当前已确认手绘画风和原有生成接口，角色与场景按新稿设计。
