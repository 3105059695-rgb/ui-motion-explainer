# 下载之后直接开始

把 [PROMPT.md](PROMPT.md) 的整段文字和本仓库链接发给能执行命令的 AI 助手即可。它负责安装、检查环境、寻找素材、选择开场和制作视频；你提供本期文案，以及需要使用的人物/配音素材。

## 推荐安装包

到 [Releases](https://github.com/3105059695-rgb/ui-motion-explainer/releases/latest) 下载 `ui-motion-explainer-2.0.0.zip`，解压后进入包含 `SKILL.md` 的目录。安装包包含全部参考、原创建模素材、可运行工程和完整中文字体，不需要再去找剪辑风格。

需要 Python 3.10+、首次安装时可联网、AI客户端具备文件与终端能力。仅能聊天的模型无法在本机直接渲染。第一次下载渲染依赖和浏览器可能需要几分钟；后续不必重复下载。

### Codex

```text
python install.py --runtime
```

将技能装进个人技能目录，渲染依赖在该技能自己的 `.venv`，不污染全局 Python。已有版本时，先看本地定制，再用 `--upgrade`；安装器会保留完整备份，**不会自动合并私有定制**。

### WorkBuddy、Claude Code 或其他客户端

让助手先查它的真实技能目录，随后运行：

```text
python install.py --target "客户端技能目录/ui-motion-explainer" --runtime
```

不同客户端的技能目录/技能市场入口不相同，不猜固定目录。也可以不安装，让助手直接读解压目录中的 `SKILL.md` 并运行脚本。技能目录装好后刷新技能或开新任务读取。

## 第一次验证：不需要账号或付费模型

在技能目录执行。下列 `PYTHON` 替换为本包虚拟环境解释器：Windows `.venv/Scripts/python.exe`；macOS/Linux `.venv/bin/python`。

```text
PYTHON scripts/new_project.py --mode hero --out "我的样片" --duration 10
PYTHON scripts/render_portable.py --project "我的样片"
```

生成 `我的样片/renders/preview.mp4` 和中间帧。示例是原创占位素材，用于确认环境与运动机制，**不是替用户做完的一期视频**。另有 `desktop`、`timeline`、`body`，可看 [四种实录示例](assets/portable-studio/README.md)。

## 正式制作

只需把本期口播稿、人物视频或配音发给AI，再说：

> 使用 ui-motion-explainer，按包里的阿刁视觉方法制作这期视频。自动找对应官方素材，开头按内容选新机制，人物右侧充分利用，正文保持连续操作感。先对齐真实口播时间，再导出 MP4、字幕和可编辑工程。人物、文字、关键操作不要互相遮挡。

Logo、官网页面、GitHub仓库与真实演示由助手去找。没有真实成果时做清楚标识的示意，不虚构跑通、价格、速度或Star数。正式视频的素材与画面需由助手逐段检查，不能把演示工程替换几行字就当成片。

## 本包包含和不包含的东西

包含风格规则、4个可运行模式、56项原动作参考、字体、自动采集脚本、安装器与 CPU 渲染。无需NVIDIA显卡，不要求AE软件；“AE感”指动作质感。

不内置任何人的肖像、克隆音色、私有API密钥或付费服务额度。需要新配音/数字人时使用你自己的授权服务；已有素材直接剪辑。本次公开包采用OFL中文字体，许可随包，不要求安装作者的MiSans。真实产品素材来源受其原有许可约束。

Windows路径含空格时正确加引号。macOS/Linux是同一套跨平台Python代码，但发布验收环境以 [验证记录](docs/portable-verification.md) 为准，未测试的平台不宣称已验证。
