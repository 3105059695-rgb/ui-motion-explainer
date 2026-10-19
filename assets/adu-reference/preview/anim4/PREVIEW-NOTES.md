# 完整宏场景预览适配说明

本目录拷贝原 packs 源码，scenes.js / lib.js / style.css / 主调度脚本内容不变。新增三个 demo 脚本负责明确的示意输入、缺少媒体的替代和预览接口。人物为静态矢量插画，不伪造原作者口播；序列媒体由帧号生成不同状态的 SVG，保持原作品推进、镜头缩放、九格独立更新及软件窗口动画。作品墙 389 格循环使用 27 个标为示意的图样，不能称 389 个独立作品。

接口：await window.READY；window.renderAt(绝对源秒)；await window.imgWait()。1920×1080 舞台由外部 iframe 等比缩放。时间轴未拉伸，完整 Scene 多阶段更新与跨场转场由原主调度运行。预览静音，原音效调用、配方及事件清单在文件中。

anim3 原入口引用未随包分发的 macro_main.js、subtitles.js；预览使用同包 main-source.js。anim4 原入口缺 talkmap.js、face.js、wall.js 和 subs.js；这里通过显式 demo 输入补齐。
