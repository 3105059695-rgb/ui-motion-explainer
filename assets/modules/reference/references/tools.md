# 本地工具

全部命令从 Skill 根目录运行，也可用脚本的绝对路径。脚本相对于自己的文件定位资料，移动 Skill 不依赖 E 盘旧路径；只有已有完整原视频缓存是可选绝对路径，缓存不存在时自动从站点补齐。

## 环境

Python 3.10+、FFmpeg/ffprobe；分析用 numpy、opencv-python、Pillow；HTML 导出用 playwright 和 Chromium。先运行 `python scripts/toolkit.py doctor`。只缺依赖时在独立虚拟环境按 `requirements.txt` 安装，已有可用环境不用重复安装。

```powershell
python -m venv <新的虚拟环境目录>
<环境中的python> -m pip install -r requirements.txt
<环境中的python> -m playwright install chromium
```

包内模板没有 CDN、npm 或账号依赖。四套上游引擎的依赖各自独立，使用前看对应实际工程说明。未使用的引擎不用全部安装。

## 检索与查看

```powershell
python scripts/toolkit.py search "morph"
python scripts/toolkit.py search "" --category product-film --limit 100
python scripts/toolkit.py show twoclipping-5cba86
python scripts/toolkit.py serve --port 8896
```

本地目录页可检索资料、读取完整 prompt、打开已有源码与在线原视频。当前为 `references/storage-mode.json` 标明的源码模式：海报保留，四秒预览、旧 MP4、音频和对照图已清理。通过工具服务器打开时，缺原片缓存便转到原视频链接。`toolkit.py video <slug> --out <新工程目录>/reference.mp4` 只下载当前案例所需原片，避免在 Skill 内积累缓存。

## 分析与创建

```powershell
python scripts/toolkit.py video twoclipping-5cba86
python scripts/toolkit.py analyze --slug twoclipping-5cba86 --out <新分析目录> --bpm 120
python scripts/toolkit.py analyze --video <视频文件> --out <新分析目录> --interval 0.25 --limit 160
python scripts/toolkit.py new twoclipping-5cba86 --template ui-morph --out <新工程目录> --with-video
```

`new` 不带模板时仅准备来源、prompt 和计划，工程必须按该案例继续实现。带模板时复制独立 HTML、素材和 project.json；不要直接修改 Skill 内原模板，用户稿放到新的工程目录。

## 渲染与对照

```powershell
python scripts/render.py --project <工程> --out <新目录> --width 720 --fps 30 --stills-only --check-seek
python scripts/render.py --project <工程> --out <新目录> --width 1440 --fps 60 --samples 4 --audio <音频文件>
python scripts/toolkit.py compare --reference <原片> --rendered <成片> --out <新对照目录> --count 12
python scripts/toolkit.py compare --reference <原片> --rendered <成片> --out <新对照目录> --timing seconds --times 3.5 6.25 11.733
```

输出已有内容时脚本拒绝覆盖，选择新的目录。`--start/--end` 可以导出指定区间；`--width/--height` 都要偶数。若只提供宽度，保持 project.json 画幅比例。`--samples 4` 对每帧做四个子帧平均用于运动模糊；预览默认一帧一次采样。

对照默认按两个视频各自的帧数归一化采样，快速切换画面可能存在数帧偏移。`--timing seconds` 按相同秒数取帧；`--times` 可以精查指定切点，两侧取最近的视频帧，实际时间和帧号写入 comparison.json。容器时长可能比视频流长，指定时间必须落在两个视频流的有效范围内。

`--check-repeat` 在乱序跳转之后回到同一时刻检查像素与状态一致，适合所有确定性影片。原模板需要循环首尾相同，所以 `--check-seek` 还检测首尾。其他不循环影片的 `seek(t)` 应当限制在片长内，不使用该循环检查选项。声音默认没有，显式传音轨后会混音，验证记录标明是否有声音。

水彩等 GPU 栅格化可能在重复绘制中有极少量色值微差。先记录和检查真实差异，必要时同时显式给出 `--repeat-max-different-fraction` 和 `--repeat-max-channel-delta`，不要为了零像素差异改变原有材质。默认仍要求完全一致；容差不会放宽状态一致、来源冻结、加载错误或解码检查。`verification.json` 的 `repeat_comparison` 始终保存严格比较结果、实际不同像素数量/比例、最大通道差、均值和给定阈值，使用容差的影片不能被报告为像素完全一致。

## 实际重建进度与复用

```powershell
python scripts/rebuild.py status
python scripts/rebuild.py clone <编号或slug> --out <新的工程>
python scripts/rebuild.py render --project <工程> --out <新的导出目录> --width 1280 --fps 30 --audio <音轨>
```

进度在 `references/rebuild-status.json`。`clone` 只复制已实际存在的对应案例源码并保留版本目录。清理后先恢复工程需要的媒体；外置音轨缺失时 `render` 会在启动导出前报错。`status` 的源码入口数量不代替实际执行测试，历史验证不代表原成片仍存在。`register` 仅在当前案例实际完成相关检查后登记。

## 资料刷新和验证

用户已停止全站批量制作。普通调用仅复用已有资料并下载当前指定案例；`collect.py` 的全站采集和 `--all-videos` 仅在用户明确另行要求全量刷新或下载时使用。保存原片不代表获得其商用再分发权。

`python scripts/toolkit.py verify` 核对目录、逐案例 JSON、提示词、来源和本地海报，在源码模式下不要求已清理的短预览存在，写 `references/catalog-verification.json`；不证明动效或外部媒体可用。`fetch_upstream.py` 只下载固定版本源码参考，不执行上游脚本。
