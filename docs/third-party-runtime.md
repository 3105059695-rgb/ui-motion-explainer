# 第三方运行资源

适用于 2026.10.09.3 发布包。此版本升级技能规则与模块路由，安装器、渲染程序及运行依赖版本保持不变。下文资源路径均相对完整 Windows 包的 `UI风格包/工具/`；源码附件不包含随包运行时二进制。

本包保留复制资源中的许可文件，不将第三方组件或参考目录宣称为原创或已获完整复刻认可。

- Python 3.13.16：来自 python.org，嵌入分发包内保留 `LICENSE.txt`。第三方 Python 模块作为应用依赖一起部署，不要求接收方使用系统 pip 或 venv。
- Playwright 1.62.0、Pillow 11.3.0、imageio-ffmpeg 0.6.0、NumPy 2.2.6、OpenCV headless 4.12.0.88 及其依赖：各自的 `.dist-info` 许可信息和 package license 保留于 `runtime/python/Lib/site-packages`。二进制 wheel 来源与 SHA-256 见 `python-wheel-sources.json`。Chromium 由 Playwright 安装，保留浏览器包内版权说明。
- Node.js 22.23.3：来自 nodejs.org 固定版本 ZIP，保留原 LICENSE 与 npm 依赖声明。
- FFmpeg 9.0.2：安装时从 GyanD/codexffmpeg 固定发布下载。原构建 LICENSE 和 README 保留；源码来源见该发布页及对应的 FFmpeg 源码提交。构建由独立进程调用，不改动二进制。
- Remotion 模板：保留项目 package.json/package-lock.json 和依赖自身许可。模板的授权状态与第三方 Remotion 使用条件需分别看其原文，包里没有赠送商业服务许可或账号。
- 字体、图标和参考代码：保留相应目录的 LICENSE/OFL/NOTICE。参考目录中的远程媒体链接是来源线索；没有把目录数量说成可随意转授权的原创成片。

安装器使用的固定资源与校验值见包内 `runtime-sources.json`。下载整个 Windows 发布包时，使用仓库根目录 `runtime-release.json` 的固定 Release 地址与 SHA-256；两份文件用途不同。本包制作时的来源与验证记录由发布者另附。
