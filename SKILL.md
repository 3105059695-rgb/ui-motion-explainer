---
name: ui-motion-fusion
description: 用整库的剪辑经验为本期口播选材、试剪并交付可编辑工程。适用于口播、实拍 B-roll、UI 动效、HyperFrames 与已有工程的单镜续修。
metadata:
  version: "2026.11.20.3"
---

# 用整库参考剪口播

收到仓库链接时按[仓库接入](AI-START.md)取得 Skill。在根目录运行命令。新片先读[当前审美](references/aesthetic-preferences.md)，保留已认可的黑白灰材质、淡紫焦点、中文层级和实拍原色。检查或升级 Skill 的请求按其范围处理。

```sh
python -B -X utf8 scripts/ui.py direct -- prepare --script "口播.txt" --project "本期工程"
python -B -X utf8 scripts/ui.py direct -- resume --project "本期工程"
```

**第一次剪。** 有原视频时给 prepare 加 `--presenter "原视频.mp4"`。第一次使用先读[可运行的选材、试剪与返修示范](references/edit-an-episode.md)。新稿跑 prepare，已有本期工程跑 resume。长稿按 next_offset 和 next_quote_offset 续读到末页。先确认本窗口实际支持的音频输入。能听时听原声；文字或图像窗口用已有原声、SRT 和播放页继续剪，登记听审受限，不向仅支持图文的模型发送音轨。保留原文意思，总结这段到底要回答什么。逐句决定留真人，还是需要画面讲清比较、交接、因果、操作、细节或层级。把判断写进本期工程的 `decide`。第一次先做这个判断，再打开镜头卡。

**按问题选材。** `options` 按本句的剪辑用途查询全部投稿，能翻页或点名任意可用条目。看候选的动作、所需真实材料和连续区间。关键处比较两种真正不同的安排，用 `choose` 留一句决定性理由。命令同时给出本期试剪 JSON 的路径，填入原声与材料即可调用选中的实现。真人已经讲清就留真人；实拍必须让观众多看懂一件具体的事。遇到没有身份或出处证据的通用画面，回到原素材。其他实现可从 `capabilities search/inspect` 检索。

**观察、调用和返修。** 首次借动作，用 `watch` 打开带入出点的连续参考，认出动作前、变化、停稳和交接，用 `observe` 记录依据。写清看到的是原片、样段还是工程重演。只能看静帧就登记构图和配色；当前环境无法观察连续画面就保留限制。把本期对象、原句和真实时码填进 `trial`，在选定实现里对齐原声。片头先剪有后果的矛盾或问题。实景做主角时拿掉多余边框和编号，把小窗放进实测空白处；层级跟着原声建立，焦点落在当句对象。用 `direct -- proofs` 生成两段连续小样，先在手机尺寸内部检查带原声的 8–12 秒片头，以及本期最难的交接或解释段。长片有真人和实景时，连着看“真人→实景和小窗→回真人”。逐一核对字能读完、动作说得通、剪点接得住，`review` 记录问题并修相应镜头。具体命令、JSON 和示例见[逐句工程用法](references/edit-an-episode.md)。

**导出和续修。** 内置路线用 `deliver` 拼接已确认的镜头；HyperFrames、自定义合成和其他导出的真实片段用同一工程的 `trial` 接入，整片用 `register` 校对。每处实际借用可 `compare --final` 并排播放参考与成片，也可标明原创。保留 `episode-edit.json`、本期材料、可编辑源码和试剪。新窗口 `resume --at 00:39.40` 找回相应镜头或字幕，只更新该镜，再合成新版本。只有工程目录时直接运行随工程携带的 continue_edit.py。外部修订单镜用 revise 把实际源码和新母版写回原工程，它会先核对其他镜头与原声。实际导出、动态观看、带原声整片回看和剪辑软件内文字可编辑性各报实测结果。缺检查时交付状态保留缺口。

旧工程沿用其已存镜头卡、`save`、`captions` 和[原有工程验收](references/shot-acceptance.md)。专门要求原片复刻或研究时用[复刻流程](references/reference-replication.md)及全库 `read plan`。资料、源码与原片可用范围见[素材用法](references/video-use-guide.md)与[模块](references/module-map.md)。
