<div align="center">

<img src="docs/images/hero.svg" width="100%" alt="UI Motion Explainer — 黑白紫动态讲解" />

# 黑白紫 UI 动态讲解

**把口播里的对象、关系和变化，剪成看得懂的动画。**

三条完整参考 · 33 类实测动作 · 8 类扩展演示 · 可编辑工程

[查看全部动效](docs/gallery.md) · [观看风格短样](assets/approved-demo/preview.mp4) · [安装与使用](#安装与使用) · [下载 ZIP](https://github.com/3105059695-rgb/ui-motion-explainer/archive/refs/heads/main.zip)

</div>

---

## 先看效果

卡片依次建立，合并成一个结果；结果进入协作界面，背景退焦，结论留在前景。

<a href="assets/approved-demo/preview.mp4"><img src="docs/images/demo.gif" width="100%" alt="18 秒风格短样：建立、归并、协作、聚焦" /></a>

**[播放 1080p 短样](assets/approved-demo/preview.mp4)** · [查看可编辑 HTML](assets/approved-demo/index.html) · [视觉与节奏规范](references/style-system.md)

## 这套 Skill 做什么

适合 **AI 工具介绍、科技知识讲解、产品操作教程、工作流演示**。它把口播里的“几个任务”“一个结果”“不同方案”“某条约束”变成可见对象，再通过位置、大小、连接与状态变化讲清楚逻辑。

| 视觉语言 | 镜头逻辑 | 制作方式 |
|---|---|---|
| 白底、近黑卡片、淡紫焦点、粗中文无衬线 | 建立对象 → 改变关系 → 留出阅读时间 | HTML + GSAP / HyperFrames 优先，可映射到其他剪辑工具 |
| 圆角窗口、柔和阴影、克制的层次 | 图解讲原理，真实录屏展示操作 | 随包脚本处理字体与抽帧，保留可编辑工程 |

## 三条参考，一个不漏

每条都提供 **完整原片、独立拆解、带时间码的动作索引**。下方 GIF 保留原画幅和画面署名，点击标题查看对应参考页。

| 01 · 工作流与协作 | 02 · 信息与上下文 | 03 · 技巧与操作 |
|:---:|:---:|:---:|
| [**豆包工作：面试流程一键搞定**](docs/sources/doubao.md) | [**Codex：上下文压缩失忆问题**](docs/sources/codex.md) | [**GPT6：节约 Token 的技巧**](docs/sources/token.md) |
| <img src="docs/previews/O04.gif" width="280" alt="豆包参考：多卡归并" /> | <img src="docs/previews/O21.gif" width="280" alt="Codex参考：逐行荧光笔" /> | <img src="docs/previews/O28.gif" width="280" alt="Token参考：条目升格" /> |
| 多卡归并 · 结果拆出 · 协作接入 · 分支交接 | 文档滚动 · 搜索筛选 · 原文聚焦 · 窗口交接 | 条目升格 · 文件堆叠 · 状态灰化 · 人物引导 |
| [原片 · 3:07.7](docs/source-videos/doubao.mp4) | [原片 · 3:04.9](docs/source-videos/codex.mp4) | [原片 · 3:33.8](docs/source-videos/token.mp4) |

参考题目是原视频标题，片中产品宣传与技术结论不属于本仓库验证范围。来源署名与素材说明见 [CREDITS](CREDITS.md)。

## 41 种动作，都有可看的示例

**O01–O33** 来自三条参考的实际画面；**X01–X08** 是沿用同一视觉语言的新设计。编号与 Skill 动效库一一对应。

| 对象与布局 | 注意力与交接 |
|:---:|:---:|
| <img src="docs/previews/O05.gif" width="420" alt="O05 结果脱离容器" /><br />**O05 · 结果脱离容器**<br />一个人的对话结果，变成可独立使用的成果。 | <img src="docs/previews/O12.gif" width="420" alt="O12 文档外加新容器" /><br />**O12 · 文档外加新容器**<br />文档保留位置，外部展开新的工作空间。 |
| <img src="docs/previews/O10.gif" width="420" alt="O10 分支焦点交接" /><br />**O10 · 分支焦点交接**<br />讲新分支时，旧卡收起说明并保留标题。 | <img src="docs/previews/X02.gif" width="420" alt="X02 保位排序扩展演示" /><br />**X02 · 保位排序**<br />内容身份不变，位置变化解释新的优先级。 |

### 按内容选动作

| 你想讲什么 | 推荐组合 | 去哪里看 |
|---|---|---|
| 多项工作合成一次任务 | 分批建立 → 归并 → 完成确认 | [卡片与布局](docs/gallery.md#cards) |
| 一件事经过几个环节 | 连续扩列 → 同一字段贯穿 → 结果停留 | [关系与交接](docs/gallery.md#relations) |
| 找到历史记录中的关键原话 | 逐字搜索 → 过滤 → 原文重排 → 高亮 | [界面与聚焦](docs/gallery.md#focus) |
| 原理说明之后展示真实操作 | 图解 → 匹配衔接 → 录屏推近 | [镜头与节奏](docs/gallery.md#editing) |
| 需要更多变化 | 遮罩揭字、排序、局部放大、差异切换等 | [8 类扩展](docs/gallery.md#extensions) |

**[打开完整 41 项 GIF 图鉴 →](docs/gallery.md)**

## 安装与使用

### Codex

将本仓库克隆到个人技能目录。目标目录已经存在时，先在原目录中查看变更并更新，避免把旧版本直接覆盖。

**Windows PowerShell**

```powershell
git clone https://github.com/3105059695-rgb/ui-motion-explainer.git "$HOME/.codex/skills/ui-motion-explainer"
```

**macOS / Linux**

```bash
git clone https://github.com/3105059695-rgb/ui-motion-explainer.git ~/.codex/skills/ui-motion-explainer
```

也可以下载 ZIP，将包含 `SKILL.md` 的 `ui-motion-explainer` 文件夹放入技能目录。

### 一句话调用

```text
使用 $ui-motion-explainer，把这段口播做成黑白紫 UI 动态讲解。
按内容选择动作，保留稳定阅读时间，交付 MP4 和可编辑工程。
```

更具体的请求：

```text
先做 20 秒短样：三个文档依次出现，合并成一次任务，
再展开团队界面，最后退焦突出结论。
```

```text
这段是搜索教程。请使用搜索输入、过滤上移、原文重排和逐行高亮，
让操作过程与口播对应，保留查询词和原文出处。
```

```text
做一个三分钟完整教程。参考这套视觉语言，
在关系图解和真实录屏之间切换，按语义设计新的动效组合。
```

## 规范和工程在哪里

| 文件 | 用途 |
|---|---|
| [SKILL.md](SKILL.md) | 技能入口、动作选择、制作顺序与完成标准 |
| [style-system.md](references/style-system.md) | 色彩、字体、布局、节奏与口播处理 |
| [effects.md](references/effects.md) | 33 类参考动作 + 8 类扩展的触发条件与实现建议 |
| [production.md](references/production.md) | 字体子集、时间轴、音画同步与导出检查 |
| [reference-evidence.md](references/reference-evidence.md) | 来源、观察边界与样例验证记录 |
| [动效图鉴](docs/gallery.md) | 41 项逐项预览，链接到来源与工程 |
| [风格短样工程](assets/approved-demo) | 18 秒完整组合，可编辑 HTML 和素材 |
| [扩展演示工程](assets/extension-demos) | 8 个新设计动作的分段演示与源码 |
| [辅助脚本](scripts) | 字体准备、参考抽帧及媒体索引 |

### 本地预览与导出

复制样例目录作为新项目，再改写内容。已输出的 MP4 和 GIF 可以直接查看；编辑并渲染 HTML 需要 Node.js、HyperFrames 及其浏览器运行环境。

```bash
cd assets/approved-demo
npm install
npm run check
npm run dev
npm run render
```

参考运行版本为 HyperFrames `0.8.38`，字体使用 Noto Sans SC 子集。修改文案后要重新生成字形子集，并检查实际导出帧。

## 使用边界

本项目提供动效设计方法和工程示例。具体软件功能、数字或宣传结论仍需按新任务核实；生成的演示 UI 应明确标注。新作品按内容与素材选择音频，不自动沿用参考作者的旁白或形象。

原创代码与文档采用 [MIT License](LICENSE)。参考视频、从参考抽取的 GIF/截图、原混音、GSAP 和字体分别按 [素材与第三方说明](CREDITS.md) 处理，**不包含在原创代码的 MIT 授权中**。

---

<div align="center">

**先让观众理解变化，再让画面好看。**

[开始使用](SKILL.md) · [看全部效果](docs/gallery.md) · [反馈与建议](https://github.com/3105059695-rgb/ui-motion-explainer/issues)

</div>
