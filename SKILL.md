---
name: ui-motion-fusion
description: 为口播选择或生成配图，按原声、定稿 UI 和编号动作库剪出可编辑视频，也可在已有工程续剪或只改一镜。
metadata:
  version: "2026.11.24.3"
---

# 按口播选材与剪辑

**只要图片时**，读懂相关原句和上下文，按用途找实图或生成配图。写实图由 AI 自己写拍摄指令，打开原图看主体、动作和现场是否自然可信。图看起来真实、拍对了这句话，就交付图片。需要事实依据的画面取自可核对的来源。[取材与写实生图](references/material-choice-and-photo-direction.md)

**剪视频时**，沿用用户确认的口播理解标准和 Fred Talk 整体 UI。哪段留人物、哪段上实拍或 UI，素材怎么取景，哪个词上开始动、哪里停、下一镜接什么，都由执行剪辑的模型结合本期原声和实际素材决定。用户指定的镜头、编号或本期风格优先。[当前审美](references/aesthetic-preferences.md)

## 从本期原声开始

在 Skill 根目录运行。新片用 `prepare`，已有工程用 `resume`。有原视频时传 `--presenter`，只有视频时先从原声取得并校正口播稿。只有稿件时，以原句定位，取得原声后再定时间码。

```sh
python -B -X utf8 scripts/ui.py direct -- prepare --script "口播.txt" --presenter "原视频.mp4" --project "本期工程"
python -B -X utf8 scripts/ui.py direct -- resume --project "本期工程"
```

先看完整原片、通读全稿。能听原声时核对语气和停顿，听审受限时沿用母带和已对齐字幕，记录实际检查范围。长稿按返回的 `next_offset` 和 `next_quote_offset` 读完。用 `decide` 记下整稿的问题和答案，以及每个语义段要让小白认出什么、看见什么变化、理解什么关系。保留原话、顺序、否定、条件和范围。[口播理解标准](references/script-visual-planning.md)

## 按同一句话，并行查动作和找素材

| 要用什么 | 去哪里找 | 怎样选 |
| --- | --- | --- |
| 定稿 UI | [组件目录](assets/approved-ui/catalog.json) · [可用图层](assets/approved-ui/index.html) · [字体、配色、边框与字幕规格](assets/approved-ui/style.json) | 根据本句要呈现的内容选择组件和状态。字体、颜色、数字和字幕沿用定稿，实拍、照片和产品界面保留原色。 |
| 编号动作 | `prepare` 或 `resume` 返回的 `confirmed_workflow.motion_library` · [随包动作目录](assets/motion-prompt/动作目录.md) | 按要看见的变化找动作，用 `options` 查候选，打开连续预览，核对起态、触发和结果。借 Fred 镜头时按参考片与原片时码定位，保留完整编号。 |
| 本期内容素材 | 原片与工程 · `confirmed_workflow.material_library.indexes` · [查找、实录、生成与入库](references/material-choice-and-photo-direction.md) | 打开文件看它能说明哪句话。产品、人物或事件用 Ego 查原始出处。操作取同任务的真实演示，缺关键步骤就实录。生活情境可以生成。 |

模型从候选中取舍时，把**整句话的意思、素材里看得见的细节、动作前后会发生的变化**放在一起核对。例如口播说“压缩后文件变小，像素尺寸没变”，就沿用同一张图，对照前后文件大小，让相同的像素尺寸留在原处。手上只有缩略图时，先补查文件属性。相邻几句可以共用一个镜头，人物或素材已经讲清楚时也可以留稳。

## 剪进镜头，再连起来看

选中的动作通过 `choose` 保留原编号，`trial` 调用库内实现，把本期素材 ID 绑到实际槽位。素材视频记源内入出点，镜头变化对到原声触发词，给结果留出看清的时间。动作只覆盖一部分时，换检索说法、查相邻分类，或组合已有动作。确有缺口再补相应变化，可复用的新动作随剪辑入库。[逐镜操作与续修](references/edit-an-episode.md)

在同一工程先连看开头和最难的交接，再按授权范围完成。用手机尺寸核对重点、字幕、剪点和原声。整片用 `deliver` 导出，外部路线用 `register` 登记实际成片。返修用 `resume --at` 找回原句和镜头。验收记录写清实际看过、听过的范围。[制作主流程](references/workflow.md) · [成片理解验收](references/script-visual-planning.md#理解验收在成片里检查不停在计划里)

收到仓库地址用[接入说明](AI-START.md)。旧工程按[原有工程验收](references/shot-acceptance.md)接续。指定原片复刻或研究时用[原片复刻流程](references/reference-replication.md)。各参考片与源码入口见[素材用法](references/video-use-guide.md)和[模块目录](references/module-map.md)。
