# 原源码运行入口

运行器执行保留的真实场景代码。`ready` 只表示该实现已编译并在真实浏览器中改变状态；不代表新内容已获审美认可，也不代表历史外观自动变成当前 UI。

首次准备一个共享环境：

```powershell
python -B -X utf8 scripts/library_runner.py setup --core
```

如果已有精确匹配的 React 19.2.3 / Remotion 4.0.534 工程，传 `--node-modules <目录>`；补充依赖可传 `--extra-node-modules <目录>`。匹配时不安装，之后自动复用本机登记的位置。新电脑才在一个固定共享目录按锁文件安装。不会下载或复制浏览器，优先复用 Playwright Chromium，其次已安装的 Chrome/Edge；也可用 `UI_MOTION_BROWSER` 明确指定。Python/Playwright 与 FFmpeg 需已可用，基础 Python 依赖沿用 `assets/base-skill/requirements-render.txt`。Python 原生 SŪTRA 场景另有其目录内的固定依赖清单。

```powershell
python -B -X utf8 scripts/library_runner.py inspect --id fredtalk:new30-op03
python -B -X utf8 scripts/library_runner.py scaffold --id fredtalk:new30-op03 --out bindings.json
# 填写 bindings.json 中的本期文案、实际媒资、原组件 props。
python -B -X utf8 scripts/library_runner.py build --bindings bindings.json --out current-scene
python -B -X utf8 scripts/library_runner.py smoke --project current-scene --backend player --scale 0.25
python -B -X utf8 scripts/library_runner.py render --project current-scene --backend player --out current-scene.mp4
```

- `inspect` 给出真实入口、原组件参数、文字位置、当前主题范围，以及实际运行观察到的素材路径。三次状态采样的媒体清单不保证包含任意新参数触发的分支资源。
- `text` 按完整原字符串替换；`props` 传入原组件参数；`media` 将原资源路径绑定为本期本机文件。不存在的文件和漏绑资源会明确失败。
- `palette.accent` 采用当前 A 紫 `#D6C2FF`，替换已知包装强调色；`palette.token_map` 可显式映射其他源颜色。图片像素、品牌颜色不会因此整体重染。`style_scope` 明确原外观与当前外观的边界。
- 原布局、对象状态链、蒙版、镜头和测量轨迹保留。没有用通用卡片替代缺失场景。107/E14/R011 遗失的注册或示例数据有单独来源说明；算法代码保留，新增数据不冒充作者原文件。
- 189 个会员预览的独立实现和 T06 原源码错挂修复，优先走 `rebuilt_library`，有独立来源标记；不需要或尝试读取会员源码。
- `reference:*`、`sample:*`、`capability:F01`–`F08` 共用上述入口。两个 twoclipping starter 的 `props` 修改原 `project.json`，包含 `texts`/`copy`、品牌和原时间设置。launch-film 的生产模式必须绑定 11 张本期图片；只有 `props.mode="demo"` 才使用随包原创 SVG，原片抽帧不复制到新工程。
- Player/HTML 导出是动作视频，不自动复用参考片声音；最终口播、音乐及音效由制作流程混音。Remotion `--backend native` 保留源组件自身的 Remotion 音轨。
- 输出目录已存在时拒绝覆盖。源码、共享字体与许可证随工程保留；不复制 node_modules、浏览器或 Python 环境到工程。
