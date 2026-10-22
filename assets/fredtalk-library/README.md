# FredTalk 公开效果补充库

Fred Talk 是本 Skill 跨窗口的默认整体视觉与剪辑方向，见[用户偏好](../../references/aesthetic-preferences.md)及[最新原话](../../references/evidence/fred-default-correction-20261020.json)。这批源码与已有 F、O/X、阿渡实现共同服务该方向。按当前口播改编对象、内容与节奏，不继承作者品牌、人物、原稿或整片固定顺序。上游作者的 keep 仅是作者选择，未代表本用户逐项认可。

[打开可检索预览](index.html)。目录与源码固定于 [FredTalk eec77dc](https://github.com/njrhts2kvv-star/FredTalk/tree/eec77dcfa99318f565c391bf557f5d43042ec061)，不随网站更新悄悄改变。源码以 Git blob 去重，复制到工程时恢复原目录关系。

## 从口播到真正调用

1. **读整段含义，再选场景。** 写清当前对象、发生的变化、观众需要看懂的结果和前后衔接。已有 `direct prepare` / `select` 的候选可同时检索本库和原有效果库；命中只是待判断候选，不是自动分镜或强制换页。
2. **实际看对应预览与源码。** 核对同一对象怎样进场、让位、聚焦、退出；读取 `matching`、`reusability`、原生时长与具体 composition。快照常含固定文案/坐标/媒体，不能当任意 props API。预览可见不等于源码公开。
3. **把选中的代码取进本期工程。** `python -B -X utf8 scripts/fredtalk_library.py materialize --id fredtalk:<referenceId> --project <本期工程>`。命令核验源码后写入 `vendor/fredtalk/<referenceId>/upstream/`，附许可证与复用记录。它不安装运行环境、不下载私人媒体、不渲染；原工程同名文件不同内容时停止覆盖。
4. **在本期入口真实调用并适配。** 按源码实际导出接入，替换为本期内容、素材与口播 cue，沿用所选场景成立的层次、构图及动作关系。记录 `referenceId → source path/hash/symbol → 本期适配文件 → 被渲染入口实际调用位置`；只写参考 ID、import 或注释不算接入。不同框架须移植场景逻辑或渲染为素材，不把 TSX 直接塞入 HTML。
5. **检查连续输出。** 检查阅读停留、对象衔接、蒙版边缘、最长文字、素材时钟、缺失媒体/字体与运行依赖。技术渲染通过与观看、用户认可分别记录；新内容不能继承旧片认可。

`inspect --id …` 返回入口、闭包、缺失 import、外部包和 `staticFile` 媒体线索。静态扫描不覆盖所有动态媒体路径，仍须检查所选源码。归档项只供显式追溯；会员源码不尝试获取。原库继续参与检索，不按来源设置配额。

## 学到并用于适配的五个具体做法

- **按对象和关系选效果。** 用输入对象、动作、结果、阅读容量和自然时长匹配；词相似不代表镜头适合。
- **交接保留对象身份。** 分开控制载体移动与内部内容替换；明确旧对象退到哪里、谁接管注意力、哪些状态仍保留。源码 helper 的时间参数有的为 start/end、有的为 start/duration，按实际定义接入。
- **表面、内容与蒙版分层。** 阴影和表面保留，文字揭示裁切内部内容；全屏转场蒙版放在画布层，不嵌进字幕裁切层。连续强调共用蒙版节点，不在每句话重新闪入。
- **镜头与媒体时钟分离。** 设备壳、屏幕槽、内部内容分别控制。屏幕接管全屏时按真实屏幕边界计算变换，同一视频持续播放；换节点要接续源时间，不能重新从零播放。
- **留下可核查的调用链。** 保存源码哈希、选用区间、保留/修改部分和实际调用位置，再验连续输出。目录收录、代码存在、成功渲染、用户认可分别说明。

上述做法来自上游 `fred-remotion-output/references/content-to-component.md`、`object-transitions.md`、`component-reuse-map.md`，以及 `fred-remake/references/content-motion-components.md`、`device-camera-rhythm.md`。不继承上游独立 Skill 入口、逐镜审批、品牌角标、固定黑紫皮肤或私人素材。

## 保存范围

`catalog.json` 保存可用性与语义字段；`blobs/` 保存公开未归档条目直接源码及静态相对 import 所需文件，不复制整套项目或 node_modules。原始第一方许可、第三方说明和许可边界随库保留。字体、音效、照片、视频等使用各自许可；这次没有把预览媒体或字体作为可复用素材打包。
