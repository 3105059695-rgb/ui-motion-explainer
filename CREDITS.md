# 素材、署名与许可

## 三条参考视频

三条视频由本项目发起者提供。仓库保留原画幅、原音轨与画面署名，并将其作为剪辑研究参考展示。

| 编号 | 原视频标题 | 画面署名 | 仓库来源页 |
|---|---|---|---|
| D | 豆包工作太香了！面试流程一键搞定 | FredTalk AI | [豆包工作](docs/sources/doubao.md) |
| C | Codex新功能！彻底解决上下文压缩失忆问题 | FredTalk AI | [Codex 上下文](docs/sources/codex.md) |
| G | 小白必备技巧，让你的GPT6节约70%Token | FredTalk AI | [Token 技巧](docs/sources/token.md) |

未确认原发布页的稳定链接，因此不虚构源链接。`docs/source-videos/` 为用户提供的原片副本；`docs/previews/O*.gif` 与 `assets/evidence/` 为对应原片的分析摘帧，时间码见来源页与 GIF 图鉴。完整文件名与媒体参数见 [参考证据](references/reference-evidence.md)。

参考视频、其音频、画面标识和人物形象属于相应权利人，**未被本仓库重新许可为 MIT 素材**。公开可见不等于取得再次发行或用于新商业作品的授权；复用者应按自己的用途处理相应权限。权利人可通过本仓库 Issues 联系维护者处理署名或素材展示问题。

## 风格短样与扩展演示

- `assets/approved-demo/index.html`：依据上述视觉语言重新构建的 18 秒图解；界面标记为演示。原混音来自 D 的约 11.84–29.9067 秒，只作为参考比较音频。
- 公开工程使用 Noto Sans SC 子集；原本地确认版使用过系统中文字体。公开版的字体与局部排版可能因此略有差异。
- `assets/extension-demos/`、`assets/narration-demos/`、`assets/motion-lab/` 与 `docs/previews/X*.gif`：新制作的扩展动作示例，画面以“扩展演示”“原创示意”等标识交代性质。它们不是原参考片出现过的动作证据。
- X04 若显示“图解 → 实录位置”，该段是衔接方法的示意；不声称已执行真实产品操作。

## 新增口播与产品 UI

- `assets/narration-demos/`：12 种原创口播动效，完整 72 秒。配音由 Windows 标准中文语音 Microsoft Kangkang 本地合成，用于示范时间安排，未克隆参考作者声音。实际语句起止保存在 `assets/narration-timing.json`。
- `assets/ui-showcase/`：新制作的“资料工作台”演示 UI 与时间轴；名称、资料、人员与状态均为示例内容。完整窗口、详情面板和协作状态不代表某个真实产品的已执行操作。
- `docs/images/ui-cards.jpg`、`ui-handoff.jpg`：从仓库已有重建短样导出的干净画面，对应用户再次指定的 UI 参考。未把播放器控制栏作为设计内容。
- `assets/motion-lab/`：X21–X23 三段各 9 秒、1920×1080、50 fps 无声原创示意，分别演示资料纵深归并、同一仓库窗口推镜、数据文件曲线交接与遮罩展开；`docs/previews/X21.gif`–`X23.gif` 为对应预览。界面和示例数据不代表真实产品操作；公共包不含个人音色、人物素材或本地私有路径。成片已完成导出检查，记录见 [验证说明](assets/motion-lab/verification.md)。

## 字体

使用 [Google Fonts 的 Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)，并为各示例生成所需字形子集。字体按 [SIL Open Font License 1.1](licenses/NotoSansSC-OFL.txt) 分发，保留该字体的版权与许可证文本。

`assets/motion-lab/` 的拉丁字符与数字使用 Outfit Bold，按该目录内的 [Outfit OFL](assets/motion-lab/assets/Outfit-OFL.txt) 分发；中文 Noto Sans SC 子集的许可证同时保存在[示例资产目录](assets/motion-lab/assets/NotoSansSC-OFL.txt)。

## 动画运行库

示例包含 GSAP 3.14.2，保留库文件头的版权信息，按 [GSAP Standard License](https://gsap.com/community/standard-license/) 使用。GSAP 不属于本仓库原创代码的 MIT 授权部分。

HyperFrames 在旧样例 `package.json` 中作为外部依赖声明，版本为 0.8.38；新增 `assets/motion-lab/` 锁定 0.8.62。仓库不包含其 `node_modules` 或浏览器二进制。

`assets/motion-lab/assets/motion-blur.js` 使用 HyperFrames 上游提交 **`1b8f8a4`** 的 `motion-blur` 组件；上游原文件保留为 `motion-blur.upstream.html`。该组件采用 **Apache-2.0**，见随包[许可证](assets/motion-lab/assets/HyperFrames-Apache-2.0.txt)与[来源记录](assets/motion-lab/assets/provenance.json)，不属于本仓库原创部分的 MIT 授权。X21 在场景代码里针对子节点样式缓存设置副本可见性的边界，方法见 [motion-lab](references/motion-lab.md)。

## v2 可移植工程

`assets/portable-studio/` 的界面、几何人物占位、地形壁纸与两幅插画为本仓库原创示意。不是苹果官方壁纸或真实产品实操；没有加入作者肖像、克隆音色或私人素材。公开示范均无声。

该目录包含 Noto Sans SC 完整可变字体（不是只覆盖演示文案的子集）及 Outfit Bold，分别保留 OFL 许可证，供其他电脑直接渲染中文。新项目使用自己的授权人物、音频和产品材料。

`collect_assets.py` 在新项目按官网/文档URL采集素材，保留来源清单，不把采集到的第三方媒体默认纳入本技能安装包或改为MIT授权。`requirements-render.txt`锁定Playwright、Pillow与imageio-ffmpeg，运行时按各自许可安装，不随包包含浏览器和FFmpeg二进制。

## 原创部分

除上述第三方素材外，本仓库原创技能文本、拆解说明、辅助脚本、HTML/CSS/时间轴与封面图按根目录 [LICENSE](LICENSE) 授权。素材的研究展示与技能方法不代表参考作者认可或参与本项目。
