# 黑白紫 UI · Motion Lab

三段原创无声参考，各 9 秒；合辑 27 秒，1920×1080、50 fps。采用 HyperFrames 2026-09-22 上游运动模糊组件与本技能的视觉语言。

| 编号 | 动作 | 媒体 | 编辑 |
|---|---|---|---|
| X21 | 资料纵深归并 | [MP4](X21.mp4) | [depth.js](scenes/depth.js) |
| X22 | 同一仓库窗口连续推镜 | [MP4](X22.mp4) | [zoom.js](scenes/zoom.js) |
| X23 | 同一文件曲线交接与遮罩展开 | [MP4](X23.mp4) | [handoff.js](scenes/handoff.js) |

[完整合辑](preview.mp4) · [播放器](watch.html) · [动作配方](../../references/motion-lab.md) · [验证记录](verification.md)

这些是新制作的参考方案，尚未标为用户确认风格。窗口内容为原创流程示意；X22 根据本仓库公开规则重排。没有真实产品操作或性能结论，没有音频。

## 编辑和渲染

需要 Node.js 22.12+。在本目录运行（依赖锁定 HyperFrames 0.8.62）：

```sh
npm ci
npm run build
npm run check
npm run render
```

`scenes/*.js` 是主要编辑入口。`build.mjs` 将它们生成为合集 `index.html` 和 `compositions/X21.html` 等三个独立入口。HTML 为生成文件；修改源码后重新 build。普通浏览器的 HTML 停在首帧，时间轴由 HyperFrames 播放或渲染器驱动；不需要安装工具时直接播放随包 MP4。

独立渲染示例：

```sh
npx hyperframes render . -c compositions/X21.html --fps 50 --workers 1 --quality delivery -o X21.mp4
```

组合文件通过工程根目录解析 `assets/`，不要将子入口改成 `../assets/`。各场景同步建立 GSAP 时间轴；标记模糊的对象不换父节点。X21 只在内容不变的位移段启用模糊副本，具体限制见动作配方。

## 字体与依赖

中文使用 Noto Sans SC Regular/Bold 的本片字符子集，数字使用 Outfit Bold；均随附 SIL OFL 许可。修改中文内容后，需要按新文本重新生成子集，不能假定现有字体涵盖所有汉字。仓库的 `scripts/prepare_fonts.py` 可从你准备的完整 OFL 字体生成新子集。

`assets/motion-blur.upstream.html` 是固定版本的原组件；`motion-blur.js` 仅提取其中脚本，保留 Apache-2.0 许可。GSAP 3.14.2 保留原分发文件和版权头，依其标准许可使用。来源、固定提交和文件校验值见 [provenance.json](assets/provenance.json)。本仓库的 MIT 许可不替代这些第三方许可。
