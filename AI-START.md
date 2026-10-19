# AI 安装入口

安装或更新唯一 Skill `ui-motion-fusion`，版本从 `VERSION` 与 `release-manifest.json` 读取。当前仓库源码已完整包含该 Skill，不再从旧runtime地址拼接七个Skill。

1. 获取当前仓库的 `Code → Download ZIP` 或Release的 `Source code (zip)`，进入解压后含 `SKILL.md` 和 `install.py` 的目录，读取 `SKILL.md`、`docs/install.md` 与manifest。优先复用已有Python 3.10+。仓库由GitHub生成完整源码压缩包，无需另外寻找旧版UI-Style-Windows.zip。
2. 包根运行 `python -B -X utf8 scripts/verify_package.py`；失败先修明确问题，不跳过缺图或校验。
3. 新装运行 `python -B -X utf8 install.py`；已有安装按 `docs/install.md` 使用 `--update`。保护用户改动与账号配置，不删除其他技能目录。
4. 从实际安装路径执行 `scripts/ui.py modules check`，在新空工程执行 `styles -- resolve`、`direct -- prepare --script <本次稿件> --project <工程>`，核对当前合同、校准图、角色与场景确实存在。
5. 告知真实路径、版本和验证范围。以后从该入口读取已确认风格，不要求用户重述。安装验证不自动触发付费生成或整片制作。

既有原声、素材、字幕、工程及私人账号索引保留。可选库未随包不等于核心安装失败；显式选择缺失库时明确报缺失，不用别的模板假充。
