# 新窗口执行入口与能力边界

## 选择当前输入分支

- 有最终稿、配音、人物：直接核对版本和实际声音，做后期，不重复生成。
- 只有题／参考／稿：整理自然口播，生成阿刁配音试听；确认后才进入新收费人物，开头短片确认后完成正文。已确认或明确采用的现成素材跳过已完成节点。
- 先展示剪辑能力或只做视觉短样：先出该范围视觉，不擅自生成全文声音。双视频比较按本期指定素材与顺序制作。
- 只找材料：找材料和对应片段，不自动剪全文。只升级技能／整理经验：不顺手生成新视频。

白黑紫为当前阿刁系列。早期苹果白蓝可作特定分支；不能因同时读 apple-kinetic-promo 就把本系列配成蓝色、固定33秒或新增音乐。

## 当前同机技能路由

| 目的 | 入口 |
|---|---|
| 全系列经验、跨窗口接续 | `LOCAL_ASSET_NOT_DISTRIBUTED` |
| 主要 UI／后期制作 | `LOCAL_ASSET_NOT_DISTRIBUTED`；它现在先读 `references/series-feedback-20260930.md` |
| 选题、声音、人物与确认 | `LOCAL_ASSET_NOT_DISTRIBUTED`；已接入同一最新反馈 |
| 连续软件交互动作库 | `LOCAL_ASSET_NOT_DISTRIBUTED` |
| 配音 | `LOCAL_ASSET_NOT_DISTRIBUTED` |
| 长片分段与失败恢复 | `LOCAL_ASSET_NOT_DISTRIBUTED` |
| 苹果质感的可选镜头语法 | `LOCAL_ASSET_NOT_DISTRIBUTED` |

新窗口刷新技能发现后可直接说“用 $adiao-series-guide，按阿刁做这期”，或沿用“$ui-motion-explainer，按阿刁之前要求做”。已有窗口未刷新时给出 SKILL.md 路径即可读取，不宣称所有窗口会无条件自动加载全部记忆。

## 主清单和时间轴

每集独立工程，登记稿件、最终声音、开头与正文人物、来源和真实确认。只有主制作代理改主时间轴；素材、字幕和说明图可并行准备，各自归属目录。

剪辑计划至少标明：`quote` 实际口播、`focus` 观众要看到什么、`motion` 触发和变化、`hold` 可读停留、`assets` 文件、`provenance` 真实／官方／模拟／生成及来源、`clips` 源内与片内时间。按现有 `references/edit-plan.md` 和脚本支持的结构写，不把字段清单当成已验证的完整 JSON 样例。

每份素材另记：开头限定／正文限定／指定后续出现／对应技能／候选不用；多段视频取有意义的精华段，记录理由，不按附件顺序完整搬运。

只改 UI 或镜头：配音和数字人不自动失效。改稿：配音、嘴型、字幕、画面时序重新校验。换音频：旧嘴型与音频确认失效。确认保留用户原话与所见文件版本；用户“继续”不是批准未展示的替代版本。

## 可用脚本索引

命令中的 UI_DIR／FLOW_DIR 用上表技能目录替换。调用时先看脚本 `--help` 和当期环境；不因交接直接安装依赖或执行生成。

| 用途 | 脚本／已查到的入口 |
|---|---|
| 环境只读检查 | UI_DIR/scripts/bootstrap.py `--check` |
| 新可移植工程 | UI_DIR/scripts/new_project.py `--out --mode --topic --script --presenter --audio --media --duration --history` |
| 官方素材采集 | UI_DIR/scripts/collect_assets.py `--product --repo --page --out --limit --max-mb --screenshots` |
| 口播字体覆盖 | UI_DIR/scripts/prepare_fonts.py：读取正式稿与动态文本，正规／粗体／fallback 字库 |
| 参考联系图 | UI_DIR/scripts/extract_reference_frames.py `--times --prefix --cols --width --font` |
| 导出短段／全片 | UI_DIR/scripts/render_portable.py `--project --out --width --fps --start --end --stills-only --no-motion-blur` |
| 验证剪辑表 | FLOW_DIR/scripts/check_edit_plan.py `--report`；`--no-probe` 仅结构调试 |
| 资产／确认状态 | FLOW_DIR/scripts/adiao_state.py：`init/register/confirm/status/export`；不调用生成 API |
| 圆形构图预览 | FLOW_DIR/scripts/circle_presenter.py：crop 必填，diameter／margin；新片重定取景，预览白底不直接盖入成片 |
| UI 安装升级 | UI_DIR/install.py `--target --upgrade --runtime`；保留备份，不自动合并定制 |
| 公共包校验 | UI_DIR/scripts/verify_package.py：校验文件，不能证明影片审美 |

## 动效查找：按语义挑，不照号连招

| 需求 | 参考与代码位置（UI_DIR 下） |
|---|---|
| 真实仓库／原文定位 | X22，`assets/motion-lab/scenes/zoom.js`；同外框推镜、选区停读、回总览 |
| 多资料归并 | X21，`assets/motion-lab/scenes/depth.js`；来源逐一接前景再收为同一引用 |
| 文件到报告交接 | X23，`assets/motion-lab/scenes/handoff.js`；曲线落稳再遮罩展开，字段不换身份 |
| 搜索教学 | O22→O23→O24→O21：输入、筛选、原文、标注 |
| 纠正错误 | O13→O25→O18：对比、旧状态灰化、结论 |
| 原理解释 | X10→X11→X14→X20：追问、因果、剖开、归纳 |
| 操作教学 | X13→O30→X17→X19：步骤、操作、按需展开、回扣问题 |

完整编号见 `references/effects.md`，56 项是 33 个参考观察动作加 23 个原创扩展，不是 56 项全部获用户批准。

## AI UI Director：新增但不能混淆的辅助库

工程 `LOCAL_ASSET_NOT_DISTRIBUTED`，已安装 `LOCAL_ASSET_NOT_DISTRIBUTED`，本机 v0.8 记录有 53 个唯一预设。目录 `references/preset-catalog.md` 与 `assets/studio/presets/`；样片 `assets/previews/`。

实用机制：同一个 Codex 窗口连续故事、滑动确认、编码清单逐项反馈、节点拖线吸附、任务页按需展开、工作流替换、磨砂推理抽屉、上下文卷走。具体参数见 `references/project-format.md`，按本期文案重排，现有样例多无声，不能称已完成口播同步。

库的 Collect UI 全站扩充已被用户暂停；53 预设不代表159分类全部复刻，更不是完整原作逐帧复制。本次只归档和复用入口，不恢复该目标。

## 配音、人物与授权

保存阿刁声音配置在 `LOCAL_ASSET_NOT_DISTRIBUTED`；脚本 `voice-clone/scripts/voice_clone.py`。

先 `auth-status` 只读查本地配置，`list` 查音色；需要生成则先 `generate --voice 阿刁 --segments <文件> --out <新目录> --dry-run`。真生成的模型、语速、配额和费用按当期核对，不能把旧免费权益和账户扣费观察写成固定价格。DPAPI 授权不复制到包里；没有环境变量不代表没有已保存授权。

HeyGen 当前工具 schema 和人物 ID 按现有 identity 及授权查询。用最终克隆音频，不在网站重新 TTS。开头 Avatar V，正文 Avatar III；圆形在本地做，接口没有半径参数。本人已接收的构图不等于任何裁切都好，新片看动作极值。封面目前仍用户网页流程，自动发布关闭。

## 长片与交付

保持源原声顺序和时长，共用母带时钟。本机长片可从约10秒段、单 worker 起步，落盘释放资源；不要和重型识别抢显存，也不终止别人的服务。保留有效缓存，连续同类失败换策略，不用单纯延长超时掩盖退出。

检查实际编码关键帧与中间帧、字体、遮挡、接缝、尾音、音量、字幕和时间；解码、音频相关性、真正试听、审美认可分别记录。

发布文案与标签默认简洁口语；用户原要求为 **5 个最关键标签**，当前明确数量优先。标题／配文／标签分别好复制。口播稿按明确请求另发。

## 公共安装包的能力边界

公共 UI 包包含四类可运行底座、动作、字体、安装／bootstrap／采集／渲染；第一次运行短样只是环境验证。`--mode auto` 主要按题词和近期开头模式选型，不是能理解任意口播并全自动编排的模型。字幕仍按真实声音对齐；动态／登录站点需实际浏览器补采；有 logo 不代表演示素材齐全。

其他电脑需要自己的 Python、浏览器依赖、人物与声音授权或现成素材。公开包不自带阿刁肖像、私有授权或作者目录。当前新技能与交接已在本机接入，**本次没有上传 GitHub，也没有在另一电脑端到端验证**。
