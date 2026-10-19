# 安装、升级与发布校验

安装包只创建 `ui-motion-fusion` 一个入口。使用现有 Python 3.10+；安装器不下载 Python、浏览器、Node 或模型，不创建独立 runtime，不修改其他 Skill。渲染工具和服务凭证按实际制作任务另行配置。

## 首次安装

解压完整发布包，进入解压后的 `ui-motion-fusion`，运行：

```powershell
python -B -X utf8 install.py
```

默认目标是 `$CODEX_HOME/skills/ui-motion-fusion`；未配置 `CODEX_HOME` 时使用用户主目录下的 `.codex/skills/ui-motion-fusion`。可以显式指定其他工具的 Skill 目录，目标最后一级仍须为 `ui-motion-fusion`：

```powershell
python -B -X utf8 install.py --target "D:/my-agent/skills/ui-motion-fusion"
```

从下载目录运行安装器；不要先把文件覆盖到已有安装目录。目标已存在时，普通安装会退出并保留原文件。

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

更新完成后，在新窗口调用 `$ui-motion-fusion`。旧窗口应重新读取安装后的 `SKILL.md`，不要继续沿用缓存中的旧规则。

## 本机账号覆盖

已有私人账号可在安装目录的 `references/profiles/registry.local.json` 维护本机映射，用 `references/profiles/local/` 保存私人档案。覆盖文件格式为 `{"schema_version":1,"profiles":[...]}`；每项使用公开注册表中已有的 `id`，只允许覆盖 `profile_path`、`project_roots`、`sources` 和 `required_reading`。未填写字段沿用公开版，数组整体替换；路径相对 Skill 根目录或指向本机绝对路径。

此覆盖用于恢复本机已有账号资料，不更改公开默认账号，不把未知或冲突账号静默换成通用风格。格式错误、未知字段或重复 ID 会明确报错。更新保留这些非受管文件；发布清单、ZIP 和新安装载荷始终排除 `references/profiles/registry.local.json` 与 `references/profiles/local/` 的全部内容。公开 Skill 不携带作者本机的私人账号路径、档案或覆盖文件。

## 验证

在已安装目录运行：

```powershell
python -B -X utf8 scripts/verify_package.py --installed
python -B -X utf8 scripts/ui.py modules check
```

第一条验证受管文件哈希、必需模块、Fred 视觉锚点、女孩两张角色图和八张场景图，同时容许本机自加文件。第二条检查模块入口资源。它们不等于完整视频审美或音画验收。

## 维护者生成发布包

所有代码、文档、脱敏配置和媒体定稿后，再生成本次清单：

```powershell
python -B -X utf8 scripts/release_manifest.py --write --version 2026.10.19.1
python -B -X utf8 scripts/verify_package.py
python -B -X utf8 scripts/package.py --out "../ui-motion-fusion-2026.10.19.1.zip"
python -B -X utf8 -m unittest discover -s tests -p "test_install_release.py" -v
```

发布校验以新的 `release-manifest.json` 为准；历史 base/adu 快照清单保留溯源价值，不再要求公共脱敏版与本机旧快照逐字一致。清单记录每个受管文件的 SHA-256，后续改动必须重新生成清单。

包中排除 Git 元数据、依赖目录、缓存、虚拟环境、运行环境、安装状态及上述本机账号覆盖；发现其他路径中的 `.env`、密钥、凭证文件或纳入发布的符号链接/目录联接时拒绝构建。ZIP 固定只有 `ui-motion-fusion/` 顶层，输出已存在时拒绝覆盖。此检查是确定性文件规则，不是对任意文档正文泄密的自动保证；发布者仍须检查公开内容。
