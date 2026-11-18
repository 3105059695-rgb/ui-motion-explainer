---
name: ui-motion-fusion
description: 按全部投稿参考各自的剪辑用途，用已认可的 UI、颜色与连续动效制作口播视频和可编辑工程。支持按原工程续剪。
metadata:
  version: "2026.11.18.5"
---

# 用整库参考剪口播

用户只给仓库链接时按[仓库接入](AI-START.md)取得本 Skill。以下命令由 Agent 在 Skill 根目录运行，工程和素材放在用户的项目目录。只检查 Skill 时按请求检查。剪片先读[当前审美](references/aesthetic-preferences.md)，听原声、理解整稿，用原文与可核对的素材设计镜头。

**新片**运行第一条。有数字人原视频时在命令末尾加 `--presenter "原视频.mp4"`，读取原声和时长。**已准备的工程或换窗口续剪**直接运行第二条，给同一工程目录即可。

```sh
python -B -X utf8 scripts/ui.py direct -- prepare --script "口播.txt" --project "本期工程"
python -B -X utf8 scripts/ui.py direct -- resume --project "本期工程"
```

准备程序在本地匹配全部来源与 UI 能力，为每条正向投稿安排职责，保留历史纠错和出处。上下文 JSON、用片表和研究资料留在磁盘。对话只取当前待剪镜头的原句、用法、材料位置、关键帧和动态依据。卡片里的 `record`、`source_seconds` 和相关 UI ID 可定位更细的依据。看不清动作时用该来源的连续预览、源码或 `videos motion --id <来源ID> --from <秒> --to <秒>`。整稿编排或核对全片分工时用 `direct -- overview --project "本期工程"`，一行对应一条参考。按稿调整顺序、并行和时长，保留原声节奏。

**保存与续剪。** Agent 将本期绑定写入工程中的小补丁，运行 `direct -- save --project "本期工程" --patch "变更.json"`。命令前缀同上。每次返回下一处待剪镜头；指定 `resume --shot 3` 回看第 3 镜，长原句按返回的 `next_quote_offset` 续读。每次改动落盘，重开直接接续。补丁格式及素材绑定例子见[镜头保存](references/video-use-guide.md#保存一个镜头)。

**调用与交付。** 需要其他 UI 时用 `capabilities search --brief --query "本段用途"` 或 `inspect --brief --id <能力ID>` 查全库，并在本期工程实际调用。各镜头素材和时间就位后执行以下命令，核对真实可见帧和原音轨，再实际视听成片、修正遮挡和节奏，交付视频及工程。付费生成按当次授权。

```sh
python -B -X utf8 scripts/ui.py videos compose --plan "本期工程/reference-cut-plan.json" --out "本期工程/成片工程"
python -B -X utf8 scripts/ui.py videos render --project "本期工程/成片工程" --out "本期工程/成片.mp4" --brief
```

显式学习全库时用 `read plan` 与对应的分页；指定整片复刻时在 prepare 加 `--reference <参考ID>` 并查[复刻流程](references/reference-replication.md)。普通剪片通过镜头卡接入参考，按需打开对应的[模块](references/module-map.md)。
