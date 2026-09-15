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
- `assets/extension-demos/`、`assets/narration-demos/` 与 `docs/previews/X*.gif`：新制作的扩展动作示例，画面明确标注“扩展演示”。它们不是原参考片出现过的动作证据。
- X04 若显示“图解 → 实录位置”，该段是衔接方法的示意；不声称已执行真实产品操作。

## 新增口播与产品 UI

- `assets/narration-demos/`：12 种原创口播动效，完整 72 秒。配音由 Windows 标准中文语音 Microsoft Kangkang 本地合成，用于示范时间安排，未克隆参考作者声音。实际语句起止保存在 `assets/narration-timing.json`。
- `assets/ui-showcase/`：新制作的“资料工作台”演示 UI 与时间轴；名称、资料、人员与状态均为示例内容。完整窗口、详情面板和协作状态不代表某个真实产品的已执行操作。
- `docs/images/ui-cards.jpg`、`ui-handoff.jpg`：从仓库已有重建短样导出的干净画面，对应用户再次指定的 UI 参考。未把播放器控制栏作为设计内容。

## 字体

使用 [Google Fonts 的 Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)，并为各示例生成所需字形子集。字体按 [SIL Open Font License 1.1](licenses/NotoSansSC-OFL.txt) 分发，保留该字体的版权与许可证文本。

## 动画运行库

示例包含 GSAP 3.14.2，保留库文件头的版权信息，按 [GSAP Standard License](https://gsap.com/community/standard-license/) 使用。GSAP 不属于本仓库原创代码的 MIT 授权部分。

HyperFrames 在样例 `package.json` 中作为外部依赖声明，版本为 0.8.38；仓库不包含其 `node_modules` 或浏览器二进制。相应许可由上游包提供。

## 原创部分

除上述第三方素材外，本仓库原创技能文本、拆解说明、辅助脚本、HTML/CSS/时间轴与封面图按根目录 [LICENSE](LICENSE) 授权。素材的研究展示与技能方法不代表参考作者认可或参与本项目。
