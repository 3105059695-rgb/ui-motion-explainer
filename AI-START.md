# AI 安装入口

安装或更新唯一 Skill `ui-motion-fusion`，版本从 `VERSION` 与 `release-manifest.json` 读取。当前仓库源码已完整包含该 Skill，不再从旧runtime地址拼接七个Skill。

1. 用户提供了含参考的私用完整安装包时优先使用该包；公开仓库 ZIP/Release 只含公开代码和公开示例，不包含作者全部私人参考。进入解压后含 `SKILL.md` 和 `install.py` 的目录，读取 `SKILL.md`、`references/aesthetic-preferences.md`、`docs/install.md` 与 manifest，复用已有 Python 3.10+。不要把公开源码包称为全部参考齐全。
2. 包根运行 `python -B -X utf8 scripts/verify_package.py`；失败先修明确问题，不跳过缺图或校验。
3. 新装运行 `python -B -X utf8 install.py`；已有安装按 `docs/install.md` 使用 `--update`。完整包内的私人参考会自动安装为相对路径，无需复制作者盘符；公开更新保留已导入参考。保护用户改动与账号配置，不删除其他技能目录。
4. 从实际安装路径执行 `python -B -X utf8 scripts/ui.py references check --require` 和 `scripts/ui.py modules check`。程序已安装而参考不齐时，报告缺少的图集、原片与设计素材，先补完整包；不能只凭模块检查通过就开始猜画面。`direct -- prepare` 会在参考缺失时停止，也不证明代码已渲染。
5. 告知真实路径、版本和验证范围。以后只按已安装的 [SKILL.md](SKILL.md) 进入制作，先用 `scripts/ui.py requirements --part 1` 按顺序读完全部现行要求，再按入口接入实际源码；跨窗口保留当前确认方向，不让用户重述。安装验证不触发付费生成或整片制作。

既有原声、素材、字幕、工程及私人账号索引保留。代码安装状态与当前参考完整性分别报告；M/N/O 三条已知缺失历史原片仍保留记录，不阻塞已有 20 条参考的完整检查。
