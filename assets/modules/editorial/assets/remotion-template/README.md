# Editorial UI Motion

Remotion 4.0.534 + React + TypeScript 可编辑工程。风格包含暖白编辑式排版、连续 UI 动作和粗黑描边漫画转场。所有合成都是 816×1080、30fps；内部以 544×720 逻辑画布排版，不拉伸用户截图。

## 运行

```sh
npm ci
npm run dev
npm run lint
```

## 四个入口

| Composition | 时长 | 用途 | 渲染 |
|---|---:|---|---|
| ScreenshotStage | 12 秒 | 整图进入→焦点放大→强调→圆形接力 | `npm run render:screenshot` |
| MechanismShowcase | 49.167 秒 | 六段可复用动作展示 | `npm run render:showcase` |
| FullReplica | 140.5 秒 | 参考结构复刻样片 | `npm run render` |
| RefinementPreview | 21.9667 秒 | 同源时间校准（随当前组件更新） | `npx remotion render src/index.ts RefinementPreview out/refinement-preview.mp4` |

生成视频位于 `out/`。默认四个入口都能在不携带原始视频的独立项目中运行。

## 换截图和标题

把图片放入 `public/user-input/`，修改 `public/user-content.json`：

```json
{
  "version": 1,
  "title": "从资料到可用结果",
  "screenshot": "user-input/input.png",
  "screenshotFit": "contain",
  "sourceKind": "user-screenshot",
  "focus": {"x": 0.20, "y": 0.25, "width": 0.60, "height": 0.45},
  "note": "用户截图，仅演示外部聚焦动效。"
}
```

`focus` 相对 456×425 展示面板（包括 contain 留白），范围 0–1。焦点由制作人选择；模板不会自动理解图片。截图保持原内容和比例。要让内部按钮响应、表单变化，需要重建对应 UI 状态，并在缺少真实依据时标“界面示意”。

也可通过技能包的 `scripts/new_project.py --out NEW_PROJECT --screenshot LOCAL_IMAGE --title "标题" --focus 0.2 0.25 0.6 0.45` 创建新工程。

## 修改机制

- `src/Opening.tsx` / `OpeningV2.tsx`：三份参考汇聚、曲线代码编辑器、终端、2.5D 示例。
- `src/FirstHalf.tsx`：文档→九宫格搜索→选中卡片→代码执行→内容替换、资源消耗与图表。
- `src/SecondHalf.tsx`：同一 URL 跨页面交接、评价状态累积、漫画隐喻和描边圆形转场。
- `src/WebUIV3.tsx`：原生四列网站、详情放大、解锁状态、GitHub、复制到聊天、上下纸卡对比。
- `src/ComicV3.tsx`：V3精修像素头像、麦克风、金币成本、杯子与展台、共享、结尾组字。
- `src/Film.tsx`：完整时间线、字幕与机制演示切片。
- `src/ScreenshotStage.tsx`：截图入口。
- `src/captions.json`：参考自动转写后修正的字幕时间，非新的产品宣传稿。

动画均使用帧时间计算，无运行时随机数和 CSS 动画。更换主题须同步更换文案、对象、动作、数值和时间，不能仅换标题。

## 参考素材与保真边界

源视频无法提供原字体、模型或工程；本项目为原生组件与可替换素材层结合。V3 的海报、信息流缩略图、网页单卡、手机中心画面、皮具/金属图案和像素头像采用用户视频的独立局部纹理，见 `public/reference-assets/**/provenance.json` 或 `source-manifest.json`。皮具队列的地面、物件移动与翻换由代码控制，纹理本身不是原生三维模型；外壳、排版、相机、描边和状态变化可编辑。位图小字不是可逐字修改的原生文字。未声称所有画面内容均为纯代码原创。参考中的模型、价格和产品宣传是原视频内容，未作为当前事实核实。

FullReplica 默认无声，并把原片 13.533–20 秒的外部实拍/三维素材换为原生 2.5D 段。创作电脑的本地参考版另外保留了原配音和这段 6.467 秒插入；这些私有素材不随便携模板分发。

仅在本地存在 `public/source-media/` 和 `local-reference-props.json` 时，可用：

```sh
npx remotion render src/index.ts FullReplica out/reference-recreation.mp4 --props=local-reference-props.json --concurrency=3
```

技术校验不能替代全片人工音画复核与用户风格认可。
