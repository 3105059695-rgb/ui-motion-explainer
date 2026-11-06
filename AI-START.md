# AI 安装入口

安装或更新唯一 Skill `ui-motion-fusion`，版本从 `VERSION` 与 `release-manifest.json` 读取。当前仓库完整包含公开生产代码，不再拼接旧 Skill。

1. 进入含 `SKILL.md` 和 `install.py` 的目录，读取 `SKILL.md`、完整 `references/aesthetic-preferences.md`、安装说明与 manifest。复用已有 Python 3.10+。公开包具有当前 UI 与可调用能力；私人历史原片是可选研究补充，不是日常制作前置条件。
2. 包根运行 `python -B -X utf8 scripts/verify_package.py`，失败先修明确问题。
3. 新装运行 `python -B -X utf8 install.py`；更新按 `docs/install.md` 使用 `--update`。已有私人素材、本机资源映射、账号覆盖与用户工程保留。用户提供完整私用参考包时仍可导入相对路径资源。
4. 从实际安装目录执行 `python -B -X utf8 scripts/ui.py capabilities check --require` 和 `scripts/ui.py modules check`，确认生产代码与必需资源。`references check` 单独报告历史原片完整性，不阻塞已有能力生产。
5. 告知路径、版本与实际验证范围。新窗口完整读当前入口与审美后，直接 `direct -- prepare`，按口播使用 `capabilities list/search/inspect` 和 `events` 接入现有代码。完整条款、全片图集和原片研究仅按需要展开；不要让用户重述审美。

安装检查不代表本期成片已被认可，也不触发付费生成或视频制作。原稿、原声、字幕、工程、私人账号与所有历史能力继续保留。
