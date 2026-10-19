# 生产入口、声音与交付

按当前机器可用的工具实现本技能的视觉标准。此技能是自包含的风格与制作规则，不自带渲染引擎、真人素材或收费账号；在本机可按下面的已核实入口复用能力。不要仅安装依赖或输出 HTML 就宣称完成视频。

## 本机可用入口

相对于本技能的同级目录：

| 目的 | 路径 | 使用范围 |
| --- | --- | --- |
| 基础 UI、字幕、字体与 MP4 生产 | `../ui-motion-explainer/SKILL.md` | 需要它的生产脚本时再读，旧默认不能覆盖本技能最新要求 |
| 对象交接、展开、焦点、任务状态动效 | `../ui-motion-fusion/SKILL.md` | 按语义选机制，不能整套演示顺序照搬 |
| 系列动态工程状态 | `../adiao-series-guide/references/latest-project.json` | 继续旧片或比较最近开头时读取 |
| 生成新声音/新人物 | `../adiao-workflow/SKILL.md` | 只有缺少有效素材且用户需要时调用；核对费用和授权 |
| 平台风险预检 | `../guoshen/SKILL.md` | 用户要求审查时使用；普通剪辑不自动启动 |

不同机器没有这些技能时，可以用可用的 HTML/Canvas、Remotion、剪辑软件或 FFmpeg 等完成本期；不要因私人路径缺失要求用户重讲风格，也不要声称不存在的生产依赖已经可用。

## 新一期的独立工程

2026-10-08 只读核实：同机 `ui-motion-explainer/scripts/` 下的 `bootstrap.py`、`new_project.py`、`collect_assets.py`、`prepare_fonts.py`、`render_portable.py` 均存在；该技能 `.venv/Scripts/python.exe` 当时不存在。这是文件可用性信息，不是环境运行成功记录。

先检查当前可用 Python、浏览器、FFmpeg 和字体；优先已有能工作的环境。需要该底座的隔离环境时，先阅读它的 `references/portable-production.md` 和脚本帮助，再按需运行 bootstrap；本 Skill 安装时不做这一步。

下面是命令形状，变量须来自本期实际文件与时长。`$base` 为所选底座路径，`$py` 为核实可用的 Python，`$project` 为新目录。

```powershell
# 先检查脚本帮助/环境，依当前安装版本处理依赖
& $py "$base/scripts/bootstrap.py" --check

# hero 只是原构图人物旁的工作区起点，可改用其他底座或自行建立
& $py "$base/scripts/new_project.py" --mode hero --out $project --topic $topic --duration $duration --script $script --presenter $presenter --audio $audio

# URL 和仓库要先核实身份；采集后还需打开看内容是否适用
& $py "$base/scripts/collect_assets.py" --page $officialUrl --screenshots --out "$project/materials"
& $py "$base/scripts/collect_assets.py" --repo $repository --screenshots --out "$project/repo-materials"

# 编辑实际内容、动作和声音时间轴后，先检查构图再导出
& $py "$base/scripts/render_portable.py" --project $project --fps 50 --width 1920 --out "$project/checks-layout" --stills-only
& $py "$base/scripts/render_portable.py" --project $project --fps 50 --width 1920 --out "$project/renders-final"
```

这不是一键成片配方。新建脚本拒绝已有输出目录；字幕需按真实口播写入 `project.json.captions`，不会自动对齐。`--audio` 缺省可能取人物原音轨，先明确母带来源，不能再叠一份相同声音。官网采集脚本不是全网搜索器；动态/登录站点需要浏览器补采，遇到登录或访问限制按当前环境要求处理。

### 必须改掉的底座默认

- 通用 `studio.js` 曾把全片归一化为十秒演示时间轴；只增加 `duration` 会把全部动作拖慢。按本期实际时间重写状态推进，不把一套十秒动作拉成两分钟。
- 通用 `demo:true`、约 280px 圆窗和默认裁切只是示例。根据实际人物取景与当前布局调整，默认示意不能冒称真实产品操作。
- `hero/desktop/timeline/body/auto` 是工程起点，不是每期轮换的开头模板；`auto` 不代表理解口播并自动完成导演工作。
- 示意标签根据内容真实性保留；用真实素材替换后核对来源，不能为了“像真软件”一键去掉全部标识。
- 将本期输入、镜头、素材、字幕、混音和输出配置保存到工程里，关键文字不依赖某个聊天上下文。

## 参考现有 GitHub 工程时

`LOCAL_ASSET_NOT_DISTRIBUTED` 提供了实用实现：

- `editor.html`、`preview_server.py`：可编辑预览。
- `opening.js`、`body-a.js`、`body-b.js`：各段镜头；`core.js`、`ui-helpers.js`、`master.js`：绘制与调度。
- `assets/manifest.json`、`references/materials.md`：真实来源与用途；清单中的 28 个素材在本次整理时存在。
- `data/captions.json`、`captions.srt`、`timing.json`、`semantic-cues.json`：实际声音与画面节奏。
- `checks/verification-summary.md`：历史检查范围，不是新片检查结果。

这不是可直接复制运行的新片模板：`render.py`、`master.js`、`editor.html` 固定了本期时长、50fps、人物裁切；`package.py` 校验固定 v2 和 7353 帧；`audio/create_mix.py` 依赖当期旧版正文声音。复用机制时在新目录重配这些参数和依赖，重新生成本期记录。`quality_check.py` 另用 `soundfile`，不要假设历史依赖清单完整。

## 同步与性能

先锁定一条口播时间线。两份人物视频可能是短开头加完整口播，也可能是不同段落，先听/读转写比对，不靠文件编号推断。原口播只出现一次，开头与正文人物交接使用连续源时钟；若素材嘴型不同，按真实源对应关系处理。

修改 UI 时保留声音和嘴型；改稿、删话或更换音频时同步更新字幕和人物。真实录屏 1× 播放，剪除等待应让过程仍诚实可懂。不要冻结尾帧补足缺少的有效素材。

UI 动作帧和源人物帧分别管理。运动模糊采样只改变动画时间，人物/字幕媒体时间固定；不要把 25fps 原人物插成虚假的新动作。近期系列使用 1920×1080、50fps，可作为同类素材的起点；新画幅按用户和源片确定，抖音平台本身不代表强制改成竖屏。

长片按合理段落分段渲染并保留有效缓存；默认不要让重型渲染和识别任务争显存。新增输出和缓存放本期工程，不能为腾空间自动删别人的缓存或源片。

## 最小必要验收

1. **成片可用**：实际 MP4 存在，时长、画幅、帧率、音轨合理，可完整解码。完整解码只证明技术可读。
2. **开场动起来看**：连续播放最终编码开场和正文交接；看是否突停、抢焦点、无因果旋转或遮挡，不能只看 HTML 或静帧。
3. **语义和清晰度**：沿全时间线检查关键内容，重要项目名称/按钮/输入/结果可读；抽查动作中点与手机观看尺度。真实材料、示意和生成图身份清楚。
4. **音画**：确认母带无重复、开头衔接不吞音、尾音完整；听音效密集段，核字幕与嘴型。分别记录听过/看过哪些范围，不把波形、相关系数当全片听审。
5. **可编辑性**：工程含代码、配置、字体、实际素材、来源与运行说明；打开预览并回拖关键时点。若承诺完整可编辑包，不能漏掉被代码引用的文件；没有异机测试就不声称异机可直接跑。

快速验收执行与改动相关的最小检查；强力验收再扩大覆盖并按用户要求安排独立审查。技术通过、全片主观审看、平台预检、用户认可四者分别记录。

## 交付与新聊天使用

生成与本期内容匹配的明确文件名，如 `阿刁-主题-完整版-vN.mp4`、`阿刁-主题-创意开头-vN.mp4`、`阿刁-主题-可编辑工程-vN.zip`。必要时复制至 E 盘根目录，先核对目标不存在或使用新版本，不能覆盖重要成片。交付直接给文件链接，用户要求视频单发就不附长说明。

用户在新聊天可直接输入：

> 使用 $adiao-ui-editing，按照阿刁最新剪辑要求制作这一期。口播稿、人物视频和参考如下。

若技能列表未刷新，直接提供本机 `LOCAL_ASSET_NOT_DISTRIBUTED` 让新聊天读取。实际制作只需要本期素材，不需要复制旧聊天。
