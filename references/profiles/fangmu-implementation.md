# 方木实现接续

本文件记录可复用实现与本期参数。风格权威为 [fangmu.md](fangmu.md)；文件位置、认可范围和用户原话见 [asset-map.json](asset-map.json)。初次建立档案时只关联既有工程，没有重新渲染视频；后续新增认可及制作状态按下面记录接续。

## 从哪里开始

**未指定其他模式的方木口播剪辑，默认连续 UI。** 上传视频即可，文案可选；读取[当前默认](continuous-ui-direction.md)及 `asset-map.json` 的 `continuousUiDefault`。整片质量基线是 Skill V1，开头同时对照 V7 与 API 最新 0–26.50 秒；API 新源码见 `api-opening-reference-v2` 实现条目，正文／AIGC 并未因此获认可。历史 Token 色值、卡片和时间轴不是新片默认。

**后续口播白板讲解先用 已认可手写讲义 v3（原始资料未随公开包）**。2026-10-14 用户明确要求记住并沿用此版：小赖 `Handout` 原字重、黑正文红标题、稳定整页白板与红点圈画。直接入口为 index-v3.html（原始资料未随公开包）、board-v3.js（原始资料未随公开包），字体为 本地 CSS（原始资料未随公开包）。具体认可、样片哈希与复用规则见该风格说明和 `asset-map.json` 的 `whiteboardDefault`。此类任务优先这套外观；下面的连续 UI 模式不覆盖明确选择的白板任务。

以下入口用于连续 UI／人物剪辑模式。**最新主样片是已获开头与正文明确认可的 Skill 完整剪辑 V1 转场校正（原始资料未随公开包）**；先读取 [保持质感、每期重新编排](continuous-ui-direction.md)，认可证据见 [approval-v1.json](../skill-body/approval-v1.json)。本模式不因“AI 知识讲解”自动切换成白板。

开头优先看 **2026-10-14 新获明确认可的 Skill V7 校正版（原始资料未随公开包）**，再看 [历史 v5 开头](../token-opening/方木_Token开头_原背景贴纸版_v5.mp4) 的原背景要求；正文对照 [认可的 17 秒正文](../token-full/方木_Token正文_重做样段_v2.mp4) 与 [v3 实物与字幕样片](../token-full/方木_Token_实物质感与UI字幕样片_v3.mp4)。Token 完整现有实现是 [full-v3.html](../token-full/project/full-v3.html)，预览使用 [完整剪辑启动器](../token-full/project/预览完整剪辑_v3.cmd)。

`full-v3.html` 仅是历史组件参考，当前制作入口从上方连续 UI 索引选择；它仍然包含 Token 题材和时序，不是填标题就能出任何视频的通用模板。新一期继承其有效方法与组件，在新工程换素材和语义时间；原样片与基线源码不被覆盖。

## Skill V7 开头的明确认可与源码接续

用户 2026-10-14 原话：“对的，就是这种感觉，这种感觉的开头才是我想要的，并且我的UI升级了，所以你来进行一个更新，做后半段”。认可范围是校正版 **0–28.98 秒的开头方向**，SHA-256：`63e81f784b79f962e3c539fab5fe1dabe2b7ba1543788b39797db076c04bce48`。制作当时的“待反馈”记录属于历史状态；本次明确认可不等于新正文或 Token v3 整片获认可，也不代表完整正常速度人工视听检查已经补完。

| 作用 | 实际源码入口 | 后续复用范围 |
| --- | --- | --- |
| 已认可开头总入口 | index-v7.html（原始资料未随公开包）、opening-v7.js（原始资料未随公开包） | 原房间、人物遮挡、相机与内容交接、统一源媒体时钟；保持已认可校正版，另建正文 |
| 前段连续成果操作 | intro-v7.js（原始资料未随公开包） | 网页滚动、照片取景、演示翻页后合拢成课程页，再由同一对象交接到主题；按新语义更换成果与触发点 |
| 后段连续解释 | chapters-v7.js（原始资料未随公开包） | 长窗、代码层开合、机械翻页计时器、路径与结构展开；不退回静态旁字轮换 |
| 鱼眼与局部转场 | lens-v6.js（原始资料未随公开包） | 快速匹配切换、外围弯曲虚化、独立清晰标题与局部转场拖影；校正版已去除会造成三重字影的全画面多帧叠加 |
| 21 次机械卡点 | sfx-v7.py（原始资料未随公开包）、sfx-v7.json（原始资料未随公开包） | 本片每次真实切图对应独立机械棘轮声，保留原声；21 次及其原时序只属于本片 |

完整动作表及技术检查边界见 README-v7.md（原始资料未随公开包）。正文入口为 skill-body/project/index.html（原始资料未随公开包），完整剪辑 V1 转场校正（原始资料未随公开包） 在后续收到明确整片反馈，当前状态 `approved_full_film_and_motion_direction`。首次交付的待反馈记录保留，技术检查不被倒改。正文各模块及可复用范围见 [连续 UI 接续说明](continuous-ui-direction.md)。新期重构事件与镜头，保留本期源码和成片。

## 组件与接口

| 作用 | 源码／接口 | 复用与适配 |
| --- | --- | --- |
| 原背景、文字与人物前后遮挡 | [opening-v5.js](../token-opening/project/opening-v5.js)，`ready / render(t,mt) / motionActive` | 合成顺序：原视频→后层文字／贴纸→原人物遮罩→前层文字→字幕。人物遮罩只用于局部遮挡，不替换房间背景。新素材必须重新取得人物遮罩并检查脸手 |
| 语义贴纸／logo | [stickers-v5.js](../token-opening/project/stickers-v5.js)，`openingStickers.draw/ready`；来源在 [贴纸清单](../token-opening/project/assets/stickers-v5/manifest.json) | 继承动作和避让方法；根据新句意选择贴纸，不把鲸鱼、教程书和螺旋眼机械复制到下一期 |
| 认可的连续汽车动作 | [direction-v2.js](../token-full/project/reset/direction-v2.js)、[toy-car.js](../token-full/project/reset/toy-car.js) | `ToyCar.draw(ctx,{cx,cy,scale,yaw,pitch,explode,focus,opacity,time})` 返回选中车盖投影区域。汽车几何是题材资产，不是任意模型拆解器 |
| 全片接入认可动作 | [approved-sample.js](../token-full/project/v2/approved-sample.js)，`ApprovedSample.draw/motionActive` | 保留同对象拆解和交接；v3 使用新 UI 字幕，不能声称整个 17 秒都与旧样片逐像素相同 |
| UI 字幕 | [ui-captions.js](../token-full/project/v3/ui-captions.js)，`UICaptions.prepare(config)`、`draw(ctx,mediaTime,opts)` | 输入原字幕、起止时间、cues；使用 `uiCaptionHints` 绑定新词级／短语测量时间。禁止按字数伪造声学落点。详见 [字幕方案](../token-full/analysis/v3-captions-plan.md) |
| 实体物件 | [desk-props.js](../token-full/project/v3/desk-props.js)，`createDeskProps()` → `{group,stacks,outputPad,props,dispose}` | 复用木纹、纸厚、文件夹、金属夹、笔、接触阴影的做法；物件与印刷内容按新句意设计。程序三维示意不称为实拍 |
| 实体动作与镜头 | [desk-scene.js](../token-full/project/v3/desk-scene.js)、[context-3d.js](../token-full/project/v3/context-3d.js)，`PhysicalContextV3.ready/draw/motionActive` | 物体占空间→让位→书写→触边，或摘要与柜门动作；重新编排原句对应的因果过程，不只摇动模型 |
| 数字内容与状态变化 | [concept.js](../token-full/project/v3/concept.js)、[billing.js](../token-full/project/v3/billing.js)、[context-ui.js](../token-full/project/v3/context-ui.js) | `ConceptV3 / BillingV3 / ContextUIV3` 的 `draw/motionActive`；复用内容流转与可读布局，不继承旧例句、价格、PDF内容与编号 |
| 人物与时钟 | [v3/film.js](../token-full/project/v3/film.js)，`state / geometry / presenterState / render(t,mt) / setExportMode` | 视觉采样 `t` 与源媒体时间 `mt` 分开；运动模糊不能推动口型和字幕。以本期原视频、原声和字幕时钟重新对齐 |
| 基础绘图 | [helpers.js](../token-full/project/helpers.js)，`p/o/lerp/txt/box/line/group/cue/arrow/pill` | 沿用绘制和插值工具；有动作关系再选择助手，不能用卡片助手决定全片镜头 |

## Token 历史字体与色彩参数（不是当前默认）

以下色号用于解释旧源码，当前连续 UI 配色以[当前默认](continuous-ui-direction.md)为准；复用时替换旧淡紫，保留字幕层级与动作方法。

- CN：工程 `fonts/NotoSansSC.ttf`；EN：`fonts/Outfit-Bold.ttf`。网页加载完字体再布局和渲染；中文与英文数字的基线一致。
- 开头实值：纸白 `#F6F6F3`、墨黑 `#111214`、淡紫 `#C9AFE9`。
- 认可汽车样段：`#FAFAF8 / #101112 / #CDB7F5 / #EFEEF2`。
- v3 字幕：正文 `#211E25`、选区 `#D8C4F5`、下划线 `#AB80D5`。这是现有实现值，用户确认的是相应风格与要求，并未逐个确认色号。
- 现有字幕默认中文 800 字重、英文 700，58 px，支持 52–60 px；最多两行，0.16 秒轻遮罩上移后保持阅读。这些像素值基于本片 1920×1080，需要按下期尺寸、安全区和实际文字适配。
- 当前整片选择浅色字幕主题；组件支持 `opts.dark/background/fontSize/tracking`。适配明暗场景时以清晰和稳定为先，不在一个句子里反复跳变主题。

## 不可直接移植的本期值

| 项目 | Token 工程值 | 下一期处理 |
| --- | --- | --- |
| 画布／帧率／片长 | 1920×1080 / 25 fps / 336.52 秒 | 从本次交付要求与源素材确定，不采用封面的 3:4 比例 |
| 开头／认可汽车段 | 0–12.52 / 25.64–42.64 秒 | 按新口播重新安排触发与阅读停留 |
| 实物样片 | 196.56–214.20 秒 | 只复用效果方法，不把旧成片直接塞入无关新口播 |
| 正文人物圆窗 | x64 / y636 / 320×320 | 按新人像动作与画幅调整 |
| 原素材人物裁切 | x620 / y0 / 740×740 | 核对新素材，避免脸手截断与口型错帧 |
| 字幕安全区 | x430–1830 / y880–1045 | 重新检查人物、内容和字幕的共同安全区 |
| 大画面人物区间 | 42.72–47.44、232.96–237.44、330.72–尾；开头另有交接 | 按新语义决定，禁止照抄时间表 |
| 实物空间 | 桌面 1.8×0.9×0.78m、32°相机；纸数量及十万 Token 假设 | 依据新故事搭景，没有桌面积／纸页到 Token 的真实换算 |

`project-v2.json` 仍是 v3 读取的字幕／场景／cues 配置，不能因文件名带 v2 就误删。`UICaptions` 中内置的旧样段提示按原文和起点同时匹配；新一期仍应传入本期提示，不能依赖旧时间恰好相同。

## 预览与导出接续

- 开头：[预览-v5.cmd](../token-opening/project/预览-v5.cmd)、[渲染-v5.cmd](../token-opening/project/渲染-v5.cmd) → `preview.py / render.py`。
- 认可汽车：[预览重做样段.cmd](../token-full/project/预览重做样段.cmd) → `server.py --entry reset.html`。
- 实物样片：[预览实物与UI字幕样片_v3.cmd](../token-full/project/预览实物与UI字幕样片_v3.cmd) → `real-desk-v3.html`；导出入口 [render_desk_v3.py](../token-full/project/render_desk_v3.py)。
- 全片：[render_full_v3.py](../token-full/project/render_full_v3.py) 调用 [render_film.py](../token-full/project/render_film.py)；[finish_v3.py](../token-full/project/finish_v3.py) 拼接画面、从原片映射一条原声。按新工程替换源路径、分段与输出，旧脚本不能直接对下一期裸跑。
- 现有 Python：`local-only/python.exe`；复用已有 Playwright、Chromium、Pillow 与 FFmpeg。Windows v3 导出曾验证 D3D11 路径，脚本内已有 `--use-angle=d3d11 --ignore-gpu-blocklist --enable-gpu`；其他硬件需要核对，不能把原机器情况写成通用保证。
- `v3/vendor` 三个 Three.js 文件复用现有本机硬链接，保留同目录 LICENSE；`presenter-full.mp4`、`approved-opening-v5.mp4`、`material-sample-v3.mp4` 为现有媒体引用。尤其材质样片文件仍被全片网页引用，不是可随意清理的暂存。

## 认可记录的时间顺序

开头 `V5-NOTES.md` 保留制作当时“待认可”正文并加后续状态说明；`project.json` 的旧状态保存在 `approvalAtCreation`，`userApproval` 已指向后续认可。后续对话“可以可以的，后面的严格参考uiskill的来……”及 `token-full/analysis/approval-v2.json` 接续开头认可；资源索引综合记录这一状态，不倒改旧技术日志。

v3 `current-project.json` 的 `fullFilmUserApproval:false` 和 `fullHumanPlaybackAndListening:false` 继续有效。本次授权确认的是下次直接沿用的制作基线，不假定用户已经逐项审核 v3 全片。

每次交付前把实际片段与已认可运动、后续物体质感要求和 UI 字幕对照。新反馈记入原项目与方木档案的对应条目，保留适用条件，避免又退回仅靠通用文字重新发挥。
