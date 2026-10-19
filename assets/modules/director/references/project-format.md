# 参数与工程格式

每个预设的真实 ID、标题、基准时长、用途和来源状态见 `presets.json`，源码是 `assets/studio/presets/*.js`。不要假定所有模板有相同长度。

## 单场景参数

通用 `params.title`、`params.prompt`、`params.result` 对应标题、输入、结果。采用场景相关的短文本，长段口播不应全塞进输入框。软件场景可用 `params.cues` 覆盖事件秒数；实际支持键与顺序以 `software.js` 的 `events()` 与预设注释为准。

## 项目 JSON

```json
{
  "title":"本期演示",
  "mode":"sequence",
  "width":1920,"height":1080,"fps":30,"duration":14,
  "audio":"voice.wav",
  "clips":[
    {"id":"operation","preset":"software-codex-task","start":0,"duration":14,
     "params":{"title":"创建项目工作台","prompt":"创建一个简洁的项目工作台","result":"工作台已生成"}}
  ],
  "captions":[{"start":0,"end":3,"text":"先把需求输入工作区。"}],
  "demo":true
}
```

时间单位为秒。clips 按顺序排列、连续、无重叠；最后一段结束必须等于 duration。片段间的连续交接优先在一个预设内部完成，避免不相关页面直接硬切。复杂口播需要复制并修改场景源码或提供真正匹配语义的 cues，不能只靠把 duration 拉长。

播放器将片段时长映射到其内部时间轴；这是伸缩能力，不代表语义已对齐。字幕按项目绝对时间显示，不随局部时间映射漂移。audio 是相对项目的本地配音路径；未设置为空串。示范项目无配音，不能声称音画已同步。

预览通过 `index.html?sequence=1`，导出通过 `index.html?render=1`。本地项目路径可用 `?project=custom.json`；不支持任意远程 URL。

## 默认项目

随包 `project.json` 是20秒同窗口连续操作的无声机制示范；也支持多个片段按顺序编排。制作新片应替换对象、内容、时间、音轨和字幕。三款软件预设必须结合最新产品依据继续校正，不能当作当前版本的事实证据。

`ai-orb-image-reveal` 可另传 `params.image` 为工程内本地相对图片路径；默认使用原创SVG山景。图片路径不可指向URL或工程外。

## 第三批参考机制参数

- `result-tech-text-inspect`：`title` 建议4–8个汉字，作为同一行的短关键词；`prompt` 是初始状态，`result` 是检查结束后的小提示。尺寸标签表示字符布局框，不是原片字形尺寸。
- `ambient-agent-island`：`title` 为任务名称，`prompt` 为运行说明；片尾仍处于处理中。背景为原创软件示意。
- `interaction-transfer-confirm`：除通用文案外，支持 `initialAmount`、`amount`、`rate`、`fromSymbol`、`toSymbol`、`fromCurrency`、`toCurrency`。默认2500→4000、示例汇率0.92；不是实时数据。输入值需有限且为可读范围，超限直接报错。

`new_project.py --preset ...` 未传 `--title` 时保留该预设的默认标题；显式提供时才替换。

## 编码进度与音画节点参数

- `ai-coding-agent-progress`：`title` 是任务名称，`prompt` 是编写阶段说明，`result` 是成果摘要。独立工程可传 `steps` 数组替换五条清单，长度必须为 5；阶段顺序仍为读取、搜索、决策、编写、检查。若口播流程不同，应修改时间轴和阶段内容，不能只换标题。
- `software-signal-node-patch`：`title` 替换顶部项目名，`result` 替换原创预览中的短文字，最多显示 24 个字符。实际节点、端口及参数变化需改对应源码；不把动画中的连线当作真实音频处理网络。

`interaction-context-clear`：`title` 为旧会话标题，`prompt` 为清空指令（最多36字符），`result` 为新会话中心短句。默认12秒，建议结果不超过20个汉字；长文案需再检。没有接入真实清除接口。

## 运行时与驻留图解参数

- `ai-runtime-self-correct`：`title` 是运行时品牌短标题，建议不超过12个汉字；`result` 是恢复时的短标签，建议不超过12个汉字。原片没有光标点击，新片时间轴按状态推进，不调用服务。
- `interaction-dns-scroll-explain`：`title` 是文档标题，`result` 为尾部段落标题。正文、表格内容及滚动落点位于源码；默认12秒，替换内容后需同步调整排版与语义时间。

## 对话分支、配置关口与嵌套步骤参数

- `interaction-chat-canvas-branch`：默认20秒。`title` 是工具栏工作区标题，代码上限24个Unicode字符；`prompt` 是第一个问题，代码上限32个Unicode字符，推荐不超过18个汉字，以便在单行内完整阅读；超长会显示省略号。`result` 是片尾画布外的短句，建议用一句短中文。两条子问题、回答、来源与选区关键词在 `chatcanvas.js` 中；口播改变问题逻辑时需同步改这些内容，通用参数不会自动生成新分支。
- `ai-workflow-configuration-gate`：默认18秒。`title` 是页头品牌，最多24个Unicode字符；`prompt` 是初始已填需求，最多64个Unicode字符；`result` 是构建完成后的短标签，最多32个Unicode字符。超出代码上限会报错。思考文字、五步构建、四个节点及账户/配置列表在 `timothyflow.js` 中；只换需求不能改变流程语义。片尾保持14项待配置、账户0/6、配置0/8，没有接入启用接口。
- `interaction-nested-step-toggle`：默认14秒。`title` 替换顶部任务，`prompt` 替换第一个嵌套任务，`result` 替换底部写入任务。独立工程JSON还支持 `approval`、`wait`、`groupLabel`、`parseResult`，分别对应左支路、右支路、组名、第二个嵌套任务。短节点标签建议不超过10个汉字；代码没有字符上限，长标签显示省略号。两步数量固定为2；修改数量或分支关系需同时调整节点、端口、SVG路径及时间轴。

上述Unicode字符上限按 `Array.from(text).length` 计数。它与汉字建议长度不同：字符上限用于防止超量输入，建议长度用于保持当前布局可读。完整口播应放入配音和字幕，而非节点标签。

## 任务枢纽、云拓扑与生成链参数

- `interaction-add-job-hub-hover`：默认9秒。`title` 是添加任务面板标题，`prompt` 是描述框占位文字，`result` 是画布外说明句。三者转义后显示，没有代码字符上限，长文本以省略号裁剪；建议短标题、单行描述和短说明。输入在参考中没有操作，本预设不把prompt演成打字或提交。六任务类型在 `avdeyflow.js` 中。
- `ambient-cloud-topology-health`：默认8秒。`title` 是顶部互联网入口，最多12个Unicode字符；`prompt` 是告警横向文字，最多48个；`result` 是持续异常标签，最多8个。按 `Array.from(text).length` 检查，超出会报错。三个区域、七个实例和示例指标在 `jamesflow.js` 中；不支持用参数自动增加节点或修复异常。
- `ai-product-ad-assets-pipeline`：默认36秒。`title` 是项目名，最多24个Unicode字符；`prompt` 是产品描述和创意分支里的文案，最多48个；`result` 是展示标题和尾页，最多28个。按 `Array.from(text).length` 检查，超出会报错。Vision说明、六种图片构图、SVG跑鞋和两路运动在 `ailkerflow.js` 中；通用参数不会替换素材或重编完整工作流。
- `ai-image-model-video-nodes`：默认29秒。`title` 是开场短句、`prompt` 是LLM描述、`result` 是尾页短句，源码分别 `String.slice(0,24)`、`slice(0,28)`、`slice(0,32)` 截断。计量单位是UTF-16代码单元，emoji可能占两个单位；长文本不会报错。低角度/近景/只保留小车的变化、三路视频提示词、三维车几何与程序素材在 `kreanodes.js` 中，通用参数不覆盖这些内容。替换题材时同步修改它们并重新检查布局、时序和回拖。
