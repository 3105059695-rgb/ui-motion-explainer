# 渲染与验证

预览无需第三方 Python 包：`python scripts/serve.py`，浏览器打开输出的127.0.0.1地址。字体与GSAP已本地打包。

导出需要 Python 的 Playwright、Pillow、Chromium，以及 PATH 中的 FFmpeg（或 imageio-ffmpeg）。先检查已有依赖；缺少时安装到当前工程虚拟环境，不改全局环境。依赖：`pip install playwright Pillow imageio-ffmpeg`，浏览器：`python -m playwright install chromium`。如果用户已有渲染工具，可用相同确定性接口适配。

`scripts/render.py` 从项目 `index.html?render=1` 读取场景。`await window.ready()` 等待内容和字体；`await window.render(t,masterTime)` 定位场景和字幕。当前 `motionActive` 返回 false，未实现时间采样模糊的场景不声称具备该效果。

```
python scripts/render.py --project NEW_PROJECT --out NEW_OUTPUT --width 1920 --fps 30 --no-motion-blur
python scripts/render.py --project NEW_PROJECT --out NEW_STILLS --width 1280 --stills-only --no-motion-blur
```

输出目录用新目录。已有成片不自动覆盖；`--overwrite` 仅在用户已授权覆盖对应文件时使用。默认输出H.264 MP4，不是透明素材或AE工程。需要透明通道时应另写带alpha的导出路径并实际验证，不把白底视频称为透明特效。

按实际任务检查：中文字体、关键文本可读、光标落点、动作因果、同一对象连续性、回拖恢复、字幕避让和结果阅读时间。视频交付还需FFprobe核对分辨率/时长/fps/音轨，并FFmpeg完整解码；机器报告不替代视觉判断。当前安装包的实际验证另见 `verification.md`，不复用上游旧报告冒充本包验证。
