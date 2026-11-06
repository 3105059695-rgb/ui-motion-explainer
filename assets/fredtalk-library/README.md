# FredTalk 公开效果补充库

Fred Talk 是本 Skill 跨窗口的默认整体视觉与剪辑方向，见[用户偏好](../../references/aesthetic-preferences.md)及[最新原话](../../references/evidence/fred-default-correction-20261020.json)。这批源码与已有 F、O/X、阿渡实现共同服务该方向。按当前口播改编对象、内容与节奏，不继承作者品牌、人物、原稿或整片固定顺序。上游作者的 keep 仅是作者选择，未代表本用户逐项认可。

[打开可检索预览](index.html)。目录与源码固定于 [FredTalk eec77dc](https://github.com/njrhts2kvv-star/FredTalk/tree/eec77dcfa99318f565c391bf557f5d43042ec061)，不随网站更新悄悄改变。源码以 Git blob 去重，复制到工程时恢复原目录关系。

## 从口播到真正调用

1. **读整段含义，再选场景。** 写清当前对象、发生的变化、观众需要看懂的结果和前后衔接。已有 `direct prepare` / `select` 的候选可同时检索本库和原有效果库；命中只是待判断候选，不是自动分镜或强制换页。
2. **实际看对应预览与源码。** 核对同一对象怎样进场、让位、聚焦、退出；读取 `matching`、`reusability`、原生时长与具体 composition。快照常含固定文案/坐标/媒体，不能当任意 props API。预览可见不等于源码公开。
3. **绑定并调用实际场景。** `ui.py library inspect --id fredtalk:<referenceId>` 返回真实接口、注册组合与媒体槽，接着 `scaffold --id ... --out <bindings.json>`、`build --spec <bindings.json> --out <工程>`、`render --project <工程> --out <片段.mp4>`。统一入口运行原源码或明确标注的独立实现，不要求新窗口重新适配导出注册。旧 `fredtalk materialize` 仍可仅提取原代码。
4. **换本期内容与时间。** 实际文字、图片/视频、数据和 cue 由绑定提供；原源码结构不适合时选其他条目或基于源码作明确布局修改。生产缺素材会报错，示意媒体不自动顶替当前素材。记录实际被渲染的场景与时间，适配不同后端时可导出片段合成。
5. **检查连续输出。** 检查阅读停留、对象衔接、蒙版边缘、最长文字、素材时钟、缺失媒体/字体与运行依赖。技术渲染通过与观看、用户认可分别记录；新内容不能继承旧片认可。

当前 432 条均纳入候选：242 条公开原源码，189 条会员预览的独立实现及 1 条上游错挂后的独立实现。会员源码未取得。实际运行证据见 [implementations](../library-runtime/implementations.json) 与 [独立程序证据](../rebuilt-library/execution.json)；新电脑 `ui.py library setup --core` 只安装一份共享依赖，之后复用。原库继续参与检索，不按来源设置配额。

## 学到并用于适配的五个具体做法

- **按对象和关系选效果。** 用输入对象、动作、结果、阅读容量和自然时长匹配；词相似不代表镜头适合。
- **交接保留对象身份。** 分开控制载体移动与内部内容替换；明确旧对象退到哪里、谁接管注意力、哪些状态仍保留。源码 helper 的时间参数有的为 start/end、有的为 start/duration，按实际定义接入。
- **表面、内容与蒙版分层。** 阴影和表面保留，文字揭示裁切内部内容；全屏转场蒙版放在画布层，不嵌进字幕裁切层。连续强调共用蒙版节点，不在每句话重新闪入。
- **镜头与媒体时钟分离。** 设备壳、屏幕槽、内部内容分别控制。屏幕接管全屏时按真实屏幕边界计算变换，同一视频持续播放；换节点要接续源时间，不能重新从零播放。
- **留下可核查的调用链。** 保存源码哈希、选用区间、保留/修改部分和实际调用位置，再验连续输出。目录收录、代码存在、成功渲染、用户认可分别说明。

上述做法来自上游 `fred-remotion-output/references/content-to-component.md`、`object-transitions.md`、`component-reuse-map.md`，以及 `fred-remake/references/content-motion-components.md`、`device-camera-rhythm.md`。不继承上游独立 Skill 入口、逐镜审批、品牌角标、固定黑紫皮肤或私人素材。

## 保存范围

`catalog.json` 保留原目录与源码溯源，`blobs/` 保存公开源码及必要依赖，独立实现位于 `assets/rebuilt-library/`。原始第一方许可、第三方说明和许可边界保留；不打包 node_modules、私人原声、人物或原片。当前生产素材由调用者提供，预览不是素材授权或已获审美认可的证明。
