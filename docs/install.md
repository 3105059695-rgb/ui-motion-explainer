# 安装、升级与发布校验

安装包只创建 `ui-motion-fusion` 一个入口。使用现有 Python 3.10+；安装器不下载 Python、浏览器、Node 或模型，不创建独立 runtime，不修改其他 Skill。渲染工具和服务凭证按实际制作任务另行配置。

**另一台电脑需要同样的视觉参考，请用含参考的私用完整包。** 公开 GitHub 包只带 4 条公开 AIGC 图集，不能独自提供作者本机 20 条参考和 10 类完整原设计演示。完整包还带全片图集、连续原视频及 16 项原设计演示素材，全部以包内相对路径定位，不携带作者电脑的 `resources.local.json`。

## 首次安装

获取仓库主分支或最新 Release 的完整源码包，解压后进入含 `SKILL.md`、`VERSION` 和 `install.py` 的包根目录，运行：

```powershell
python -B -X utf8 install.py
```

默认目标是 `$CODEX_HOME/skills/ui-motion-fusion`；未配置 `CODEX_HOME` 时使用用户主目录下的 `.codex/skills/ui-motion-fusion`。可以显式指定其他工具的 Skill 目录，目标最后一级仍须为 `ui-motion-fusion`：

```powershell
python -B -X utf8 install.py --target "D:/my-agent/skills/ui-motion-fusion"
```

从下载目录运行安装器；不要先把文件覆盖到已有安装目录。目标已存在时，普通安装会退出并保留原文件。

完整包中的 `references/resources.pack.json` 会被安装器自动识别，逐项核对哈希，再安装 `references/private-media/` 内的内容。安装结果单独报告 `reference_readiness`；若仅代码安装成功而参考缺失，命令退出码为 2，并列出补齐方向。以后从 GitHub 更新代码会保留这套私人参考。

## 更新已有安装

在新版本的解压目录运行：

```powershell
python -B -X utf8 install.py --update
```

安装器先核对发布清单中的每个文件哈希，再对照旧版受管清单。原有自加文件、本机凭证和未同名的本机覆盖文件保留；旧版已移除但被用户修改过的文件也保留并列在结果中。只有未修改的旧受管文件会随升级退役。

遇到被修改的受管文件，或新版文件与自加文件同名，整个更新在写入前停止，列出冲突路径。将个性设置迁移到独立的本机覆盖文件后重试；如果确实决定采用新版文件，可以显式运行：

```powershell
python -B -X utf8 install.py --update --replace-modified
```

这个参数明确授权替换列出的冲突。原内容会先完整复制到备份，结果会列出 `replaced_local_modifications`，不会无声覆盖。没有旧版发布清单的历史安装也按这一规则处理，不能自动推断哪些内容是你修改的。

备份默认存于安装目录上两级的 `skill-update-backups/ui-motion-fusion-<UTC时间>-<唯一编号>`，位于 `skills` 菜单目录之外。可用 `--backup-root` 指定其他目录，但不能放在发布源、已安装 Skill 或 `skills` 菜单内部。

每个备份包含 `backup-plan.json` 和 `files/` 中的原文件。更新过程中发生异常会自动恢复本次已触及的原文件，并移除本次新增的文件；结果标明 `rolled_back` 或 `rollback_incomplete` 及准确备份位置。若异常同时阻止恢复，保留备份，依据 `originals` 将 `files/<相对路径>` 恢复到报告中的 `target`，依据 `created_paths` 检查本次新增项；不要删除整个 Skill 或 `skills` 目录。停电/强制结束进程时也用这份备份计划恢复，不能假称这类中断已自动回滚。

更新完成后，在新窗口调用 `$ui-motion-fusion`。旧窗口应重新读取安装后的 `SKILL.md` 和 `references/aesthetic-preferences.md`，按主入口接入当前制作模块，不继续沿用缓存中的旧规则。已有工程可能内含旧版代码副本；续作时核对其真实引用，按工程需要迁移，安装更新不会直接改写用户工程。

## 本机账号覆盖

已有私人账号可在安装目录的 `references/profiles/registry.local.json` 维护本机映射，用 `references/profiles/local/` 保存私人档案。覆盖文件格式为 `{"schema_version":1,"profiles":[...]}`；每项使用公开注册表中已有的 `id`，只允许覆盖 `profile_path`、`project_roots`、`sources` 和 `required_reading`。未填写字段沿用公开版，数组整体替换；路径相对 Skill 根目录或指向本机绝对路径。

此覆盖用于恢复本机已有账号资料，不更改公开默认账号，不把未知或冲突账号静默换成通用风格。格式错误、未知字段或重复 ID 会明确报错。更新保留这些非受管文件；发布清单、ZIP 和新安装载荷始终排除 `references/profiles/registry.local.json` 与 `references/profiles/local/` 的全部内容。公开 Skill 不携带作者本机的私人账号路径、档案或覆盖文件。

## 验证

本机原片与历史参考库使用 `references/resources.local.json` 的显式映射。该文件不进入发布清单或安装载荷，更新保留；安装器不会替别人猜作者盘符。格式和资源状态查询见[公开与本机资源范围](../references/distribution-scope.md)。Agent 在同一入口读取映射，用户无需再单独调用旧参考 Skill。

在已安装目录运行：

```powershell
python -B -X utf8 scripts/verify_package.py --installed
python -B -X utf8 scripts/ui.py modules check
python -B -X utf8 scripts/ui.py references check --require
```

第一条验证受管文件哈希与公开必需资源；第二条检查模块入口；第三条要求实际参考齐全，当前应为 20 张总览、84 张细读图、20 条原片、16 项演示素材及 10 类完整设计资源。三条原本就缺失的外部历史视频另列。文件检查不等于已观看、会运用或审美满意。

已有安装只补参考时，也可运行 `python -B -X utf8 scripts/reference_bundle.py import --source <完整包解压根> --target <已安装Skill根>`。它仅合并允许的参考资源，不改变本机账号覆盖或把示例产品固定为新稿内容。

## 维护者生成发布包

所有代码、文档、脱敏配置和媒体定稿后，再生成本次清单：

```powershell
$skillVersion = (Get-Content -LiteralPath VERSION -Raw).Trim()
python -B -X utf8 scripts/release_manifest.py --write --version $skillVersion
python -B -X utf8 scripts/verify_package.py
python -B -X utf8 scripts/package.py --out "../ui-motion-fusion-$skillVersion.zip"
python -B -X utf8 -m unittest discover -s tests -p "test_install_release.py" -v
```

发布校验以新的 `release-manifest.json` 为准；历史 base/adu 快照清单保留溯源价值，不再要求公共脱敏版与本机旧快照逐字一致。清单记录每个受管文件的 SHA-256，后续改动必须重新生成清单。

包中排除 Git 元数据、依赖目录、缓存、虚拟环境、运行环境、安装状态及上述本机账号覆盖；发现其他路径中的 `.env`、密钥、凭证文件或纳入发布的符号链接/目录联接时拒绝构建。ZIP 固定只有 `ui-motion-fusion/` 顶层，输出已存在时拒绝覆盖。此检查是确定性文件规则，不是对任意文档正文泄密的自动保证；发布者仍须检查公开内容。

经授权在自己的电脑间转移完整参考时，使用 `python -B -X utf8 scripts/reference_bundle.py export --root <参考齐全的Skill根> --out <Skill目录外的私用ZIP路径>`。它直接从现有文件生成一份包含代码的完整安装 ZIP，按内容去重，不临时复制原片或依赖。私人包和参考清单均被公开发布流程排除，不上传到公开 Release。
