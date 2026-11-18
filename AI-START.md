# 从 GitHub 仓库地址开始

仓库根目录就是 `ui-motion-fusion`。在具备文件和命令工具的 Codex 中，用户可以只给仓库首页和本期任务。以下步骤由收到链接的 Agent 在当前对话完成。

1. 已打开本仓库时直接使用当前目录。新电脑上，从用户给的仓库地址取得默认分支的完整工作树。可在临时工作目录执行下方命令；若无 Git，下载该仓库默认分支的源码 ZIP 并解压到工作目录。两种方式取得相同的根目录和资源。已有受管安装可以直接复用匹配的版本。

   ```sh
   git clone --depth 1 https://github.com/3105059695-rgb/ui-motion-explainer.git ui-motion-fusion
   cd ui-motion-fusion
   ```

2. 从取得的根目录使用现有 Python 3.10+。用户要在其他对话通过名字调用时，同时运行随包安装器。下面一条命令兼容首次安装和更新，返回 `target` 路径，并校验整份受管内容。临时工作树中的 `scripts/ui.py` 也可以在当前对话直接执行。工程和口播文件放在用户的项目目录。

   ```sh
   python -B -X utf8 install.py --update
   ```

3. 新上下文读取 [SKILL.md](SKILL.md) 与[完整审美偏好](references/aesthetic-preferences.md)，从实际使用的根目录运行下方命令，按返回的分页读完现行要求、整库能力和认可参考。按每条用途选读实现，打开对应总览与连续预览。当用户只要求安装时，到确认入口与资源就绪为止。

   ```sh
   python -B -X utf8 scripts/ui.py read plan
   ```

4. 已给口播或素材时，在本对话沿 [SKILL.md 的制作入口](SKILL.md#用全部提交参考剪本期)继续。正常 `direct -- prepare` 会在项目里生成 `director-context.json` 和 `reference-cut-plan.json`。前者的 `capabilities.library.entries` 列出整库用途、外观及调用状态，`video_sources.catalog.browse` 给出各来源库分工。后者安排全部正向投稿剪法及历史纠错。运行实际选用的代码，把本期素材、原声和画面绑定后导出；成片按真实可见帧核对。

用户的审美、中文字体、实现和可公开的参考已随仓库提供。渲染复用本机工具。安装路径、运行环境与现有项目的更新说明见[安装说明](docs/install.md)。
