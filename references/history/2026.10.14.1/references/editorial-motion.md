# 编辑式截图与漫画动效

用于截图聚焦、编辑式图解、资源消耗可视化、粗描边漫画隐喻，以及同一对象跨舞台交接。只为当前 UI 视频选取所需机制，不把参考中的产品论点、价格和固定时长移入新主题。

## 风格与模板边界

遵循「本期要求 → 已确认工程 → 适用账号新规 → 选中模式 → 旧模板默认值」。新创作和动作融合按[风格档案](style-profiles.md)确定外观；截图和真实品牌保留原色。用户明确要求 editorial 原参考或暖白漫画风格时，保留暖白、铁锈橙、衬线标题及糖果色粗描边语言；严格复刻仍以原片为准。

**现有 Remotion 模板尚未改成黑白紫。** 创建命令复制的是原暖白／橙／糖果色模板，截图舞台还包含淡绿包装。需要黑白紫时，应在新工程修改外部舞台、标题、强调色与描边，并检查实际画面；没有 `--theme` 参数，不能宣称选择统一入口就已完成换色。不得为统一风格改动已确认工程。

[风格依据](../../editorial-ui-motion/references/style-guide.md)中的色值和字体是制作近似，非已识别的作者原参数。曲面屏、鱼眼、摩尔纹与暗角只属于特定镜头，不是整个模式的默认滤镜。

## 独有的语义机制

| 本句要表达什么 | 连续动作与必要因果 |
| --- | --- |
| 从参考提炼方法 | 多张参考卡经曲线汇入成果，最后一条线抵达后成果清晰 |
| 搜索并交给工具 | 放大镜扫中九宫格的一张卡 → 选中抬起 → 同一卡片连到代码输入 |
| 改内容、保形式 | 指令完成 → 同一 2×2 承载平面依次翻面替换，保持格子位置 |
| 原版与改版对比 | 上下同构舞台同时演出，对齐基线、动作阶段与差异 |
| 资源消耗与未完成 | 票券到达黑盒入口才改变计数；额度环减少与任务进度分开表达 |
| 来源进入新工具 | 原网页 URL／摘录脱离，背景退去后同一内容仍留在前景，新聊天窗从其下展开 |
| 反馈决定去留 | 评价落在原卡片 → 灰化或标记 → 卡片退出 → 原网格连续让位 |
| 能力或状态积累 | 机器人先落稳，再增长刻度、帽子和灯泡；手机、上传等状态按因果累积 |
| 共享与代价隐喻 | 同一资源沿多人关系轨道流转，物件变化解释含义，不随机撒图标 |

机制选择及细分场景见[场景路由](../../editorial-ui-motion/references/scene-routing.md)。这些是语义机制，不是每项都有独立 Composition；新题材应修改对应组件、数值与时序。

## 圆形 iris 必须露出真实下一场

- 从当前语义对象的位置长出圆形遮罩，圆心由该句对象决定；黑描边跟随圆边扩展。
- 圆外继续渲染上一场，圆内真实渲染下一场的图形与动画，两场使用同一全局时间。
- 半径覆盖整个画面对角线尺度后，再去掉遮罩和圆边；不能用纯色圆盖满后硬切替代。
- 参考常见约 0.25–0.4 秒扩展只是起点，新稿根据口播、重音与内容调整。
- 现有实现见 [SecondHalf.tsx](../../editorial-ui-motion/assets/remotion-template/src/SecondHalf.tsx)：先渲染 `previous`，再以 `clipPath` 渲染 `current`，并叠加圆边；非 iris 场景另走透明度交接。

## 截图输入与焦点

`ScreenshotStage` 保留截图像素内容与比例，顺序为整体建立、局部聚焦、外部强调和返回上下文。具体操作保留真实界面及可核对状态；解释概念时可据此重建独立图形并标「界面示意」，不补造未观察到的产品操作或结果。

- 创建器接收 `--out`、`--screenshot`、`--title`、`--focus X Y WIDTH HEIGHT`；目标必须不存在或为空目录。
- 截图复制到 `public/user-input/input.<ext>`，输入写入 `public/user-content.json`，图片路径相对 `public/`。
- `focus` 相对于 **456×425 展示面板，包含 contain 留白**；不是原图像素或全视频坐标。先看适配后的图，再选矩形。
- 四值均有限且归一化：`x/y` 在 0–1，宽高大于 0，右边与下边不得越过 1。
- 默认焦点是制作起点，没有自动识别重点；`--title` 只修改截图舞台，不会改写 FullReplica 文案。
- 接收 PNG、JPEG、WebP、GIF、AVIF；后两者实际可解码性另查，必要时生成静态 PNG 并保留原件。

字段和时间处理见[内容与时间](../../editorial-ui-motion/references/content-and-timing.md)。状态由 `frame / fps` 决定，局部进度 clamp；长解释延长稳态，不单纯拖慢入场。字幕与本期音轨重新对齐。

## 创建与 Remotion 原生命令

从统一技能根目录创建；`--` 后参数交给原创建器：

```text
python -X utf8 scripts/ui.py new --engine editorial -- --out NEW_PROJECT --screenshot LOCAL_IMAGE --title "关键变化" --focus 0.20 0.25 0.60 0.45
```

省略 `--screenshot` 使用演示内容。创建仅复制模板和输入，不安装依赖、启动服务、渲染或上传。模板排除依赖缓存、私有原片、Git 历史、`.env*` 和已有导出。

**editorial 的导出在生成工程内走 Remotion 原生命令**，不调用统一脚本的 HTML `render` 后端：

```text
npm ci
npm run dev
npx remotion render src/index.ts ScreenshotStage out/screenshot-stage.mp4
npx remotion render src/index.ts MechanismShowcase out/mechanism-showcase.mp4
npx remotion render src/index.ts FullReplica out/full-replica.mp4
```

只运行当前需要的 Composition。实际 [Root.tsx](../../editorial-ui-motion/assets/remotion-template/src/Root.tsx) 注册值如下，都是模板默认值：

| Composition | 用途 | 尺寸／帧率／帧数 |
| --- | --- | --- |
| `ScreenshotStage` | 截图输入 | 816×1080／30 fps／360 帧（12 秒） |
| `MechanismShowcase` | 机制片段编排 | 816×1080／30 fps／1475 帧（约 49.17 秒） |
| `FullReplica` | 参考结构复现 | 816×1080／30 fps／4215 帧（140.5 秒） |

逻辑舞台为 544×720 并放大 1.5 倍；横屏等新画幅需重排组件，不只修改输出尺寸。FullReplica 默认 `useReferenceAudio=false`、`useReferenceInsert=false`；原音轨和原片插入不随包提供，不能打开开关后假定素材存在。

本地模板及锁文件固定 Remotion／CLI **4.0.534**、React／React DOM **19.2.3**、TypeScript **5.9.3**、三个 fontsource 字体包 **5.3.0**。这是当前本地版本，不代表上游最新版本；延续工程不自动执行 `npm run upgrade`。依赖详见 [package.json](../../editorial-ui-motion/assets/remotion-template/package.json)。

## 来源与针对性检查

[来源与近似](../../editorial-ui-motion/references/source-evidence.md)记录原片观察：字体、模型、缓动和原声音仍有不可确证部分。分别说明实际观察、代码重建、替代近似与保留素材；参考中的价格、倍数和业务结论不是已核实的新稿事实。

[模板合同](../../editorial-ui-motion/references/template-contract.md)提供检查范围。新工程可运行已有 `npm run lint` 和 `npx remotion compositions src/index.ts`；再看焦点是否落在截图内容、转场圆内是否真实出现下一场、中文字是否清晰、回拖是否一致。导出、抽帧、完整观看和用户认可分别记载；没有音轨时不声称声画同步已通过。
