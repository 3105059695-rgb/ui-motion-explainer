# 乔木字库与花字

第三层「可用效果库」的字体与花字资源模块；需要标题、重点词、步骤标签、短句或数字时，从 [效果总目录](library.md) 进入。字体选择服从 [账号风格](style-profiles.md) 与具体内容，已有已确认工程的整套字体不自动替换。

## 来源与本地资源

来自 [joeseesun/qiaomu-cover-fonts](https://github.com/joeseesun/qiaomu-cover-fonts)，本地固定来源版本见 [source.json](../assets/qiaomu-fonts/source.json)。仓库提供字体与搭配；本技能另加了可选 CSS 花字和确定时间的动效示例，不把新增效果称为上游原有能力。

- [字体索引](../assets/qiaomu-fonts/index.json)：34 个文件，19 个中文项、15 个英文项，部分是同一字体的不同字重。
- [字体搭配](../assets/qiaomu-fonts/pairings.json)：12 套标题／正文／英文数字组合。
- [字体加载](../assets/qiaomu-fonts/fonts.css)、[搭配样式](../assets/qiaomu-fonts/pairings.css)、[可选花字](../assets/qiaomu-fonts/effects.css)：均使用相对路径，不依赖系统安装或远程 CDN。
- [实际效果预览](../assets/qiaomu-fonts/gallery.html)：双击[预览字体.cmd](../assets/qiaomu-fonts/预览字体.cmd)启动本地预览，可换文字、搭配和效果，并拖动预览时间；也可运行同目录 `preview.py`。需要本机 Python，无需安装额外包。
- [完整授权文件](../assets/qiaomu-fonts/licenses/)：与字体一同保留，字体二进制保持上游原样。少量字体的汉字覆盖不完整，须用当前稿件检查缺字及回退。

## 按内容选择

| 需要的语气 | 可选搭配 ID | 标题方向 |
| --- | --- | --- |
| AI、工具、清晰的方法演示 | `tech` | 未来荧黑与清楚的正文，数字/代码使用相应英文字体 |
| 年轻、利落、有强调的短视频 | `youth` / `trend` | 抖音美好体或得意黑，强调词短而明确 |
| 核心结论、对比、数字重点 | `punch` | 有分量的黑体与英文字重，保留数据依据 |
| 深度观点、杂志、人文内容 | `editorial` / `literary` | 宋体、仿宋与适合阅读的正文形成层级 |
| 亲切、轻松、人物反应 | `soft` / `playful` / `warm` | 圆润或手写气质，依当前内容选用 |
| 活动、传统文化、强烈情绪 | `promo` / `guofeng` / `guochao` | 按题材选择，不能仅因字体好看而改写视频语气 |

这些是选型示例。先确认本期风格和词的作用，再看实际字形；不按固定时间轮换字体，也不为了用完字库而堆字体。

用本期真实文字预览，按 [主流程](workflow.md) 进入当前样片或交付阶段，不另设逐字体审批。工程中记录搭配 ID、标题／正文／英文数字字体、字重、花字效果与回退方案，方便后续复用和修改。

## 花字与动作怎么配合

- `.qm-fx-highlight`：重点词标记，适合正文中的一次强调；CSS 示例默认淡紫，可按项目覆盖。
- `.qm-fx-sticker`：有描边的短词，适合反应、纠错或清楚的口播重音。
- `.qm-fx-depth`：短标题或数字的浅层叠影，按观看尺寸控制厚度。
- `.qm-fx-outline`：短暂的字形变化或大标题；关键结论必须有完整可读状态。
- `.qm-fx-plain`：主要靠字形与层级，适合安静的解释段落。

先从片中提取值得强调的词，再把花字与[现有文字动效](kinetic-type.md)连接：进入要有归属，到位后留给阅读，必要时让同一词缩成步骤标签或进入结果。一个阅读时刻只突出一个主词；正文与字幕不同时套重描边、持续抖动或多层重影。

外层颜色按当前账号档案与本期主题，品牌与真实界面保留自身视觉。`effects.css` 的色值是示例默认，可在项目中覆盖 `--qm-ink`、`--qm-purple`、`--qm-lilac`；变量名不限制新项目必须用紫色，导出文件不会自动读取风格档案。花字叠影不是运动模糊，也不自动意味着已接入 AE 或任何渲染引擎。

## 带入当前工程

先查看搭配：

```powershell
python -X utf8 scripts/export_qiaomu_fonts.py --list
python -X utf8 scripts/export_qiaomu_fonts.py --pairing tech --out <新工程内的新字体目录>
```

命令只导出本地资源，拒绝覆盖已存在的输出目录；字体、对应授权、搭配 CSS 和 [effects.css](../assets/qiaomu-fonts/effects.css)一同导出。实际 HTML、React 或其他后端要按项目接入导出的样式和字体，不能仅复制文件就宣称成片已换字体。

HTML 示例（路径按项目调整）：

```html
<link rel="stylesheet" href="assets/type/fonts.css">
<link rel="stylesheet" href="assets/type/pairings.css">
<link rel="stylesheet" href="assets/type/effects.css">
<section class="qm-pairing" data-pairing="tech">
  <h1 class="qm-title"><span class="qm-fx qm-fx-highlight">把重点讲清楚</span></h1>
  <p class="qm-body">用真实操作解释这一步。</p>
  <span class="qm-latin">STEP 01</span>
</section>
```

字体别名仅是 CSS 引用名，不更改文件内的正式名称。浏览器项目在截图或编码前完成 `document.fonts.load(...)` 和 `document.fonts.ready`；Remotion 等后端按自己的渲染生命周期等待。CSS 不能直接当作 FFmpeg 字幕字体配置，跨引擎需采用该后端可用的加载方式或先渲染文字层。

以实际文字检查全角标点、汉字、数字和英文的基线、回退及裁切；回退仅防止空白，不表示选中的花字体已经包含该字。查看最终尺寸的稳定帧及动效中间帧，再报告字体确实加载和视觉检查范围。
