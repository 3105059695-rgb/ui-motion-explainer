# X01–X08 原创扩展演示

这组小样是依据黑白淡紫的界面讲解视觉语言新创作的兼容扩展，**不是参考原片，也不表示原片使用了这些动作**。

`index.html` 是可编辑源文件；`preview.mp4` 是 1280×720、30 fps、32 秒的无声演示。八段各 4 秒，完整展示动作前后的状态。

| 时间 | 编号 | 演示 |
|---|---|---|
| 0–4 秒 | X01 | 遮罩揭字 |
| 4–8 秒 | X02 | 保位排序，ID 与内容绑定 |
| 8–12 秒 | X03 | 局部放大镜，放大内容从原字段克隆 |
| 12–16 秒 | X04 | 图解到实录位置匹配；仅为占位示意，未使用录屏 |
| 16–20 秒 | X05 | 分段步骤条 |
| 20–24 秒 | X06 | 同一区域的差异层切换 |
| 24–28 秒 | X07 | 受限视角跟随目标，再回到总览 |
| 28–32 秒 | X08 | 问题与答案的单卡语义翻面 |

## 编辑与渲染

安装 HyperFrames 后在本目录运行：

```sh
hyperframes preview . --no-open
hyperframes render . -o preview.mp4 --fps 30 --workers 1 --quality high
```

本小样使用 HyperFrames 0.8.38 渲染。时间轴为 `window.__timelines.main`，修改文本、布局与末尾 GSAP 时间轴即可复用。X04 接入实际录屏前，保留片内“实录占位”说明。

本地 `assets/NotoSansSC-subset.woff2` 是 Noto Sans SC 的可变字体子集，保留 `wght` 轴，覆盖当前源码中的字符。增加新文字后请重新制作子集或替换为完整开源字体。上游为 `google/fonts` 的 Noto Sans SC；许可证见仓库根目录 `licenses/NotoSansSC-OFL.txt`。工程没有依赖或分发系统微软雅黑字体。

GIF 预览位于 `../../docs/previews/` 的仓库对应目录（从仓库根目录打开 `docs/previews/X01.gif` 至 `X08.gif`）。
