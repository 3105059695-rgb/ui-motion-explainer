# 分集剪辑表

由代理维护 `edit-plan.json`，不让用户填表。它绑定实际配音和素材版本，让下一个窗口知道每段显示什么。与 project.json 并存：后者记录用户声音/开头确认，本表不自动批准任何版本。小修改沿用已有表，不重建整集。

## 字段

| 字段 | 内容 |
|---|---|
| schema_version | `1` |
| scope | `opening`（完整钩子短样）或 `full` |
| duration_seconds | 本次输出长度，秒；full应与口播一致 |
| narration | `{path, sha256}`，实际已锁定口播母带 |
| hook_end_seconds | 实际开头句结束点；opening模式等于输出长度 |
| assets | 每项 `{id,path,sha256,kind,provenance,source_url?}` |
| scenes | 每段 `{id,start,end,quote,mode,visual_role,asset_ids,focus,motion,readable_hold_seconds,label?,clips?}` |

`kind` 取 `video / image / ui`。`provenance` 取 `user / official / third_party / illustrative`。相对路径以表文件目录解析；跨窗口清单可用绝对路径。记录真实URL/文件来源和获取日期供代理核对，第三方/官方身份不是真实性自动认证。

`mode` 为 `opening / body`；`visual_role` 为 `material / explanation / emphasis`。`quote` 是对应原口播；`focus` 写观众要看清的具体对象，如“仓库名与SKILL.md中的用途”。`motion` 为 `{family,anchor}`，family参考 [动效配方](motion-recipes.md)，anchor记录衔接物件/空间位置。稳定阅读镜头可用 `hold`，不必为每一镜头编特效。

`asset_ids` 必须能在assets找到。素材展示段不能没有材料；引用 `illustrative` 的场景写出画面上将显示的 `label`，如“界面示意”。数据填了不代表画面已经显示，仍需成片检查。

`clips` 每项为 `{asset_id,in,out,playback_rate}`，入/出点以源视频秒为单位。默认真实演示1倍速；素材主焦点出现后保留可读时长。镜头有多个视频层时，各层可以同时播放；真实渲染还需要在工程里保存每层全局起点、容器和遮罩。本表不冒充剪辑软件完整时间线。

逻辑语义场景按时间覆盖全片，不留空洞或彼此重叠；视觉过渡允许邻场图层在边界前后重叠，用渲染工程的过渡余量处理，不把动画重叠错误地写成两句口播重叠。钩子边界处拆成opening/body两段，使用同一个对象继续转场。

## 检查与版本

```powershell
python -X utf8 'LOCAL_ASSET_NOT_DISTRIBUTED '<分集>/edit-plan.json' --report '<分集>/qa/edit-plan-check-v1.json'
```

命令中的分集路径须替换为真实目录。报告目录先创建，已有报告不覆盖。默认需要ffprobe；`--no-probe`只适合结构调试，报告会说明源时长未检查。

检查器验证：文件和SHA、时段连续覆盖（0.08秒容差）、钩子边界、材料关联、示意标识、真实素材1倍速、剪取区间不超源长度、阅读时长不超过场景；full音频与输出长度差不超过0.2秒，opening允许使用母带前段。引用视频没给clips会警告未验证源区间。

它**不能验证**画面好看、字号可读、真实播放速度、字幕实际内容、口型同步、来源事实或用户审批。`technical_passed`不能替代 [人工/视觉检查](editing-checklist.md)。本表改动后重新运行技术检查；音频版本变化还要更新project依赖与用户确认。
