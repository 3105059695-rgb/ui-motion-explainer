---
name: ui-motion-fusion
description: 按全部投稿参考各自的剪辑用途，用已认可的 UI、颜色与连续动效制作口播视频和可编辑工程。支持按原工程续剪。
metadata:
  version: "2026.11.19.1"
---

# 用整库参考剪口播

用户只给仓库链接时按[仓库接入](AI-START.md)取得本 Skill。以下命令由 Agent 在 Skill 根目录运行，工程和素材放在用户的项目目录。只检查 Skill 时按请求检查。剪片先读[当前审美](references/aesthetic-preferences.md)，听原声、理解整稿，用原文与可核对的素材设计镜头。

**新片**运行第一条。有数字人原视频时在命令末尾加 `--presenter "原视频.mp4"`，读取原声和时长。**已准备的工程或换窗口续剪**直接运行第二条，给同一工程目录即可。

```sh
python -B -X utf8 scripts/ui.py direct -- prepare --script "口播.txt" --project "本期工程"
python -B -X utf8 scripts/ui.py direct -- resume --project "本期工程"
```

准备程序在本地匹配全部来源与 UI 能力，为每条投稿安排职责。整稿分工用 `direct -- overview --project "本期工程"`。制作时只取当前镜头卡。先播放 `moving_reference` 标出的连续区间，看对象怎样开始、交接、停稳；依据类型写在 `label`。新出现的手法首次使用时看完整动作，后续同种用法沿用本期结论。有条件时直接播放该投稿原片，只有工程重演或同类对照时结合该来源自己的 `record`、`changes` 和用法。全库索引留在磁盘。

选 B-roll 时，按 `watch` 用本期材料走通原句的动作。比如“交给助手处理”，要看到谁递出哪份资料、谁接住、接着做了什么。镜头含推近或圆形揭示时，把真实物件、光标或交接点的位置填入素材的 `focus`。只有结果图时可用它讲结果，操作过程用本期录屏或连贯表演；暂缺合适素材的句子可留原口播，另找有证据的位置承接该参考。用已认可正文动态校准中文字号、纸面与深窗的层次、紫色焦点和结果停顿。

**保存与续剪。** Agent 将本期绑定写入工程中的小补丁，运行 `direct -- save --project "本期工程" --patch "变更.json"`。命令前缀同上。每次返回下一处待剪镜头；指定 `resume --shot 3` 回看第 3 镜，长原句按返回的 `next_quote_offset` 续读。每次改动落盘，重开直接接续。补丁格式及素材绑定例子见[镜头保存](references/video-use-guide.md#保存一个镜头)。

每处实际借用随镜头保存 `borrow`，写明参考类型、在该版本中看的起止秒、实际观看方式，以及哪一下动作解决了本句什么问题。先在同一期原声里找一个有后果的矛盾、动作或问题。在片头 8–12 秒保留完整意思，前三秒让观众听明白为什么值得追下去。实际借用、实景保护区和按原声建立层级的用法见[逐镜剪辑与验收](references/shot-acceptance.md)。

已对齐的口播字幕只导入一次。收到“改 00:39.40 的字”，直接 `direct -- resume --project "本期工程" --at 00:39.40`，在该条字幕上修订。原素材与净画母版沿用。

**调用与交付。** 需要其他 UI 时用 `capabilities search --brief --query "本段用途"` 或 `inspect --brief --id <能力ID>` 查全库并实际调用。使用 HyperFrames 时运行 `videos hyperframes --project "本期工程" --shot 3 --out "HF工程/第3镜"`。素材和时码齐全会得到原生镜头工程，已绑定本期素材、用色和该来源的动作曲线。也可按 DESIGN.md 接入已有合成。付费生成按当次授权。

```sh
python -B -X utf8 scripts/ui.py videos compose --plan "本期工程/reference-cut-plan.json" --out "本期工程/成片工程"
python -B -X utf8 scripts/ui.py videos proofs --project "本期工程/成片工程" --opening-end 10 --bridge 24 33
```

把示例秒数换成本期原声剪点，用 `--captions` 传入已对齐的 SRT。先在手机尺寸检查带原声的片头，再看完整的“人物→实景和小窗→回人物”。确认字体、主体和字幕能看清，记录实际看法与问题，Agent 内部完成。通过后用 `videos render` 导出净画母版。有对白字幕时，用 `direct -- captions --project "本期工程" --media "本期工程/净画母版.mp4" --out "本期工程/成片.mp4"` 合入可开关的字幕。保留旁边的修订记录，逐镜对照可直接打开这次实际导出的版本。发布平台的烧录字幕和软件内编辑能力按[交付说明](references/shot-acceptance.md)核对。

导出的 `review` 可直接看编码成片和视频参照。完整对照用 `videos review --project "本期工程/成片工程" --media "本期工程/成片.mp4" --serve`，打开返回的本地地址；换电脑时同一命令重新定位参考。右侧可播放来源、手法分步和已认可正文。逐段原速对照，连前后剪点检查交接，再带原声看整片。色块盖过原材料、界面读不清或 B-roll 对不上原句时，回到对应镜头调整后重看。只抽帧或解码时如实报告实际检查范围。

显式学习全库时用 `read plan` 与对应的分页；指定整片复刻时在 prepare 加 `--reference <参考ID>` 并查[复刻流程](references/reference-replication.md)。普通剪片通过镜头卡接入参考，按需打开对应的[模块](references/module-map.md)。
