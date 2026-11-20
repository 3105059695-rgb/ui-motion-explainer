# 从一句原声到可以返修的镜头

以下命令用 `D` 简写 `python -B -X utf8 scripts/ui.py direct --`，在 Skill 根目录运行。P 是本期工程。JSON 文件用 UTF-8，JSON 内素材路径相对 P，命令行上的 JSON 文件名相对当前目录。

## 先学一次，再用本期稿走一遍

`D example --project "练习工程"` 会用包内的站名录音和两张示意票，实际调用资料聚焦剪法，生成初剪、一次修订和可连续播放的对照。练习的口播、观察和试剪归在练习工程里。本期从自己的原句开始。

1. `D prepare --script "稿.txt" --project P` 返回本期原文。长稿按 `D resume --project P --offset 12` 的 next_offset 继续。单句过长时同时传 --quote-offset 和返回的 next_quote_offset，不重复读取前半句。通读后用一句话写整段的问题和答案，为每句写观众需要知道什么。用途有 keep（保留原画面）、compare（比较）、handoff（交接）、cause（因果）、operate（操作）、focus（辨认细节）、hierarchy（层级）。
2. `D decide --project P --file 判断.json`。例如 `{"synopsis":"要去哪个车站取决于票上写的站名。","units":[{"id":"U001","job":"focus","why":"需要看清一个容易错认的站名。"}]}`。用本期实际原句编号。可以分批保存。已有原声时码就给该句加 seconds 和入出点，最难的一句可加 proof 为 true。若一句内有两处独立借用，可在 decide 的 split 字段用原句 ID 对应逐字连续的片段列表，随后给 U002.1、U002.2 各填一次判断。
3. `D options --project P --unit U001` 会从全部投稿中按本句用途查询。卡片有具体动作、所需输入、参考类型和实现入口。用 `--offset 3` 翻页或 `--id fred-argon` 查看指定项。把“取原票上同一个位置推进看字”和“把多张票放在同一位置轮换”放在一起比较。前者能解释一个小字，后者适合多张票同条件比较。输入不支持某种操作时保留原画面。全库其他能力仍可用 `capabilities search/inspect` 检索；用于自定义镜头时登记其真实实现。
4. 先用 `D watch --project P --unit U001 --id fred-argon` 得到带入出点的可播放页面。需要另一个完整动作时加 `--seconds 12 17`，填写**该参考版本**的时钟。首次借用时实际观察动作从哪里开始、谁变化、什么位置停稳、下一镜接走什么。原片、保留样段和源码重演各有自己的标签与时钟。
5. `D choose --project P --unit U001 --id fred-argon --against original --why "这里只需认出站名，原尺寸下字太小；推到票面仍保留站名的位置关系。"`。有真正不同的库内候选时先比较它们；候选都不适用就选 original。单纯留真人的句子可直接 choose original。只借配色或构图时用 --aspect color 或 layout，并在 custom 里绑定本期实际实现。取舍必须用本期材料和叙述作依据。choose 返回 file_to_fill，该文件已填镜号、当前 revision、已知时码与所选实现的素材位，补齐原声和本期对象即可直接用于 trial。
6. `D observe --project P --unit U001 --id fred-argon --file 观察.json`。连续看过的记录需要对照页连续播放后保存的记录，以及四个不同的实际观察，例如 `{"mode":"continuous-observed","receipt":"播放记录.json","before":"…","change":"…","settle":"…","handoff":"…","note":"这一动作在本句解决…"}`。用户无需代看。Agent 具备连续视觉能力时自行观看与保存；模拟点击、解码或播放统计只证明技术呈现。只能看抽帧就填 `{"mode":"frames","note":"看到票面的字级与留白。"}`；设备不能观察连续画面就填 `{"mode":"limited","note":"此环境只能读取静态图像。"}`。若来源换为图，运行 `watch … --stills 图1.png 图2.png`，恢复实际动态源用 `--restore`。两图只提供构图、材质和配色。
7. 以本期原声入出点做最难的一段。下面是 `D trial --project P --unit U001 --spec 试剪.json` 的输入例子。它执行选定条目的关键帧，实现、输入及可播放 MP4 都登记在本镜。beats 可选，每对数是「原动作进度、该句内原声秒数」。两个对象同条件比较时，arun-membership 可取 `"variant":"pair"`，只需 condition、a、b 三个输入，原动作进度 .5 切到第二个对象。原画面用 `{"seconds":[0,4],"audio":"原声.wav","picture":"真人.mp4","in":0}`。

```json
{"seconds":[0,4.8],"audio":"本期原声.wav","inputs":{"original":{"path":"整张票.png"},"result":{"path":"站名细节.png","focus":[0.40,0.52]}},"beats":[[0.42,1.7]]}
```

8. 打开 trial 返回的 compare 页面，并排看参考和带声试剪。手机正常大小看一次，连前后剪点看一次。用 `D review --project P --unit U001 --file 试剪检查.json` 保存 `trial_sha256`（resume 返回）、`result`、`readability`、`relation`、`cut`。pass 需要本次并排播放记录 receipt；看不全填 limited。发现字没读完用 revise 并写 fix。修改 beats、焦点或素材后把 resume 返回的 revision 放入 spec，再 trial 同一镜。旧检查不会授予新版通过。resume 的 proof_first 给出先试的镜头；若条件有限，先把这些镜头的缺口登记为 limited，其他镜头可在 spec 中明确 draft 为 true 生成内部稿。先内部试片头和最难的交接；纯原声镜头也可原样保留。

给片头和难点做完单镜试剪后，运行 `D proofs --project P`。它只用这几个已剪区间，生成带原声的片头和包含前后剪点的难点视频；可用 --opening-end 10 --bridge 8 15 指定本期时码。打开返回的页面在手机尺寸内部检查；用 `D proofs --project P --file 样段检查.json` 保存 `{"scope":"normal-sound","note":"实际听看到的观察","receipts":{"opening":"片头播放.json","transition":"交接播放.json"}}`。短片两个区间相同时只需 opening。环境受限记 limited，不给买家增加审批。

## 自定义合成、成片与改一镜

- HyperFrames、Remotion、剪辑软件或手写合成均沿用同一 P。把对应镜头的真实片段接入 trial：`{"seconds":[4,9],"audio":"原声.wav","custom":{"clip":"HF/镜头.mp4","in":0,"implementation":"HF/scene.html","adaptation":"原版在同一位置轮换结果，本镜保留固定视点，按第二个数字的原声换到第二张标签。","assets":["本期原图.png"]}}`。秒数是成片时钟。库内借用照常 choose、watch、observe；原创编排选 original 并记实际作者选择。源文件、素材和试剪都按文件内容核对。
- `D deliver --project P --out 成片-v1.mp4` 复用已渲染的各镜、拼接画面并封装原声。已有成片用 `D register --project P --media 外部成片.mp4 --route HyperFrames`；只交了 MP4 也能登记已导出，以及具体缺失的镜头、素材和检查。正式验收 `scripts/ui.py verify-output --project P --media 成片.mp4` 走同一账本，逐镜比较采样画面及原声音频，视频转场、调色或混音不相符时保留差异待核。换路线后要用实际合成版本更新对应试剪。仅需供内部回看的可播放稿且检查有缺口时用 deliver 的 --draft。
- `D compare --project P --unit U001 --final` 直接并排播放该来源和成片时段。全片原速带声检查通过对应 whole.html 的播放记录加 `D finish-review --project P --file 整片检查.json` 登记，格式为 `{"mode":"normal-sound","receipt":"整片播放.json","note":"实际听看到的情况"}`。无法完成则记 limited 或 frames。交付时写实际证据、缺口、工程内能编辑的层与真实测过的 NLE 能力。
- 换窗口用 `D resume --project P --at 00:39.40` 或 `--shot 2`。当前镜保存原句、选择理由、素材、实现、已看动作、试剪版本和剩余问题。画面变更只提交该镜 revision，再合成新版本。已有对白轨用 `D captions` 改一个字幕。迁移电脑时一起带走工程及其引用的本期素材，在新安装运行 compare 即可重建页面。

项目根目录自带 `continue_edit.py` 与续剪指引。在该工程运行 `python -B -X utf8 continue_edit.py resume --at 00:09.00`。外部修改只重绘目标镜，保留旧母版，把改过的源码存回原工程，然后 `python -B -X utf8 continue_edit.py revise --unit U002 --media 修订母版.mp4 --implementation 剪辑源/第二镜.js`。命令检查其余真实画面及所有原声，重新绑定该镜，保留未复查状态。
