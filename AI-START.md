# AI 安装入口

安装或更新唯一 Skill `ui-motion-fusion`，版本从 `VERSION` 与 `release-manifest.json` 读取。当前仓库源码已完整包含该 Skill，不再从旧runtime地址拼接七个Skill。

1. 获取当前仓库的 `Code → Download ZIP` 或最新 Release 的 `Source code (zip)`，进入解压后含 `SKILL.md` 和 `install.py` 的目录，读取 `SKILL.md`、`references/aesthetic-preferences.md`、`docs/install.md` 与 manifest。优先复用已有Python 3.10+。仓库由GitHub生成完整源码压缩包，无需另外寻找旧版UI-Style-Windows.zip。
2. 包根运行 `python -B -X utf8 scripts/verify_package.py`；失败先修明确问题，不跳过缺图或校验。
3. 新装运行 `python -B -X utf8 install.py`；已有安装按 `docs/install.md` 使用 `--update`。保护用户改动与账号配置，不删除其他技能目录。
4. 从实际安装路径执行 `scripts/ui.py modules check`；需要检查制作接线时复用已有小型验证工程，按 `SKILL.md` 的当前制作模块核对 `index.html` 实际加载的代码与时间线。`direct -- prepare` 只准备稿件、审美和资源上下文，不证明代码已渲染；不复制媒体或运行环境。
5. 告知真实路径、版本和验证范围。以后只按已安装的 [SKILL.md](SKILL.md) 进入制作，先用 `scripts/ui.py requirements --part 1` 按顺序读完全部现行要求，再按入口接入实际源码；跨窗口保留当前确认方向，不让用户重述。安装验证不触发付费生成或整片制作。

既有原声、素材、字幕、工程及私人账号索引保留。可选库未随包不等于核心安装失败；显式选择缺失库时明确报缺失，不用别的模板假充。
