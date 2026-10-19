# AIGC 连续视频生成 · 秘塔 MiniMax H3

第三层「可用效果库」的连续素材生成模块；口播需要人物动作、表情、情绪、道具组合或场景中的连续事件时，从 [效果总目录](library.md) 进入。AIGC 不限于动漫人物；具体材质、二维／三维与写实程度沿用本期风格。适用偏好见 [B-roll 条件规则](broll-preferences.md)，实操证据与制作阶段见 [主流程](workflow.md)。抽象机制可混合代码动画，不要求每句调用视频模型。

口播任务通过[语义导演](semantic-directing.md)默认进入所需的 S08–S10 事件配方，并将提示词变量填为当前内容。这里的 H3 是本机已有生产通道，不是对秋芝原片所用模型的断言；学习的事件、动作和前后合成可用于其他经用户选择的生成工具。

## 先做表演设计

AIGC 的使用判断、句意到动作、资产复用、节奏、画风、开头和转场统一读 [AIGC 导演指南](aigc-directing.md)；本文件负责生成通道，不重复维护导演规则。
角色、已认可场景、原帧、提示词和认可范围从 [AIGC 注册集](aigc-assets.json)解析，按当前明确要求 → 项目／账号专属档案 → `user-ui` 默认风格选择。当前通用默认为用户长发女孩手绘风格；阿刁、方木等专属档案仍优先，UI 外观独立沿用。

### 保留的语义案例与证据

2026-10-13 的条件偏好及返工／确认范围见 [B-roll 偏好](broll-preferences.md)，原话、参考图与样片见 [反馈证据](evidence/anime-semantic-feedback-20261013.json)。原人物比 V 样片需返工；修订样片的解释效果已确认，不能合并为所有样片均获认可。

阿刁已确认的解释案例为“脑中完整的蓝鲸夜空城市 → 图像移向屏幕并失去细节 → 输入框只剩几个词”。可复用的是信息损失被看见的方法，不固定鲸鱼、碎裂、三个镜头或五秒时长；该案例的女主仅归 [阿刁档案](profiles/adiao.md)，不替代通用女孩或其他 IP。角色与整体画风继续按 [档案选择](style-profiles.md)执行。

“最怕刚做完，就有人说方向全错了”仍可设计为：同一角色举手庆祝 → 瞥见新消息后眼睛和嘴角变化 → 身体僵住 → 双手落回桌上。这是表演设计例子，不宣称已生成或获认可；按实际句意、情绪和口播时长取舍动作。

### 本客户端输入方式

- 已接入文生视频、单首帧、首尾帧，以及最多 5 张图片引用；首尾帧模式和引用模式互斥。
- 首帧必须是一个可播放的单场景。九宫格角色表仅作身份／画风参考，不作为整张首帧；从注册资产补足适用的关键状态后再提交。
- 暂无音视频参考的自动上传入口；服务商支持的能力不等于本客户端已经接入。需要扩展时按当前接口实现，不编造支持状态。
- 具体角色与场景参考分工、动作提示词、有效片段剪取及生成音轨处理按导演指南执行；参数、密钥与费用继续按下文处理。

## 服务与密钥

本接入使用用户指定的 **秘塔第三方服务**，不是 MiniMax 官方账户通道；两者的 Key 和余额不能混用。

- 地址：`https://metaso.cn/api/minimax`
- 模型：`MiniMax-H3`
- 创建：`POST /v2/video_generation`
- 查询：`GET /v2/query/video_generation/{task_id}`；成功后取结果 URL 下载，不用旧版 file_id 流程。
- 取 Key：打开 [视频页](https://metaso.cn/minimax-h3) → **控制台 → 请求管理**。已有可用 Key 可复用；复制按钮不会重新创建 Key。新建或撤销凭据按本次明确授权处理，不擅自改 IP 白名单、账户权限、水印或充值设置。

客户端 [metaso_video.py](../scripts/metaso_video.py) 优先读取进程环境 `METASO_API_KEY`；Windows 也可读取 `%LOCALAPPDATA%/ui-motion-fusion/metaso-api-key.dpapi`。后者使用 Windows CurrentUser DPAPI 加密，只能由对应用户解密。密钥不写入 Skill、GitHub、工程、请求文件、日志或聊天；不能直接复制加密文件到另一台电脑当作安装包。

首次设置可用[本机密钥配置脚本](../scripts/configure_metaso_key.ps1)：

```powershell
powershell.exe -NoProfile -STA -File scripts/configure_metaso_key.ps1
# 已由用户或代理在该账户的“请求管理”页点击复制时：
powershell.exe -NoProfile -STA -File scripts/configure_metaso_key.ps1 -FromClipboard
python -X utf8 scripts/metaso_video.py status
```

配置脚本默认隐藏输入；剪贴板方式保存成功后仅在剪贴板仍是同一 Key 时清空。已有不同 Key 会保留并停止，避免覆盖其他配置。跨窗口共用该 Windows 用户的加密存储，重新读取本 Skill 即可；不要打印 Key 验证是否可用。

## 调用与费用边界

先用 `metaso_video.py --help` 查看当前已实现参数。`status` 只检查本地配置；`check --task-id <本账户已有的最近任务>` 只读查询以验证连接，不创建视频，不把 404 当成功，也不使用他人的任务 ID。

规划与计费提交是两个独立步骤：`plan` 离线形成请求/估价供用户审阅；`create` 必须带显式费用批准和预算上限，且必须对应用户在本次会话或当前项目已给出的实际预算授权。CLI 开关本身不产生授权。已有适用预算时直接在范围内工作，不逐镜重复提问；没有时先准备具体时长、规格、动作、参考和估价，再确认一次。

```powershell
# 离线规划，不发送任何内容：参考图可重复传 --reference-image
python -X utf8 scripts/metaso_video.py plan --prompt-file <UTF8提示词.txt> --out <新计划.json> --duration 5 --resolution 768P --ratio 16:9
# 本账户已有任务的只读连接检查：
python -X utf8 scripts/metaso_video.py check --task-id <最近任务ID>
# 仅在已获相应费用授权后，使用用户批准的上限：
python -X utf8 scripts/metaso_video.py create --request <计划.json> --out-dir <新任务目录> --approve-cost --max-cost-cny <已批准上限>
python -X utf8 scripts/metaso_video.py query <任务ID> --out <新状态.json>
python -X utf8 scripts/metaso_video.py download --query-result <成功状态.json> --out <新素材.mp4>
```

首帧使用 `--first-frame`，尾帧可加 `--last-frame`，不要同时传 `--reference-image`。客户端检查文件类型和大小；当前不自动验证图片宽高，提交前按服务商要求检查参考图尺寸和比例。

客户端默认普通通道、`fast_mode=false`、`context_ir_enabled=false`；这是本请求的设置，不修改账户全局开关。接入首版限制 4–15 秒、至多 5 张图片、无音视频参考，以便清楚估价。站点在 2026-10-13 显示标准输出价格：480p 0.06 元/秒，768P 0.09 元/秒，1080p 0.14 元/秒，2K 0.15 元/秒。实际按积分扣除，人民币为站点基准换算；估算并非服务端硬扣费上限，每次付费前核对当前报价，不沿用过时价格。

创建接口可能扣费，网络超时或返回不确定时不自动重试、不循环创建。记录本次请求和已知任务号，从“请求管理/用量”或已有任务查询核对，再决定后续；已有成功 task_id 则只继续查询/下载。服务端明确失败也不能默认免费重生成，先核对扣费和剩余授权。

参考图片只随已获授权的生成请求发送到秘塔。使用 URL 时确认是获准公开给服务的资源；使用本地参考图时明确该图会发送给秘塔，不自动上传到第三方公共图床。素材私密性、用途与来源按当前任务授权处理。

## 结果验收和接回剪辑

下载只访问任务返回的 HTTPS 结果地址，不向结果 CDN 发送 API Key。使用新文件/新任务目录保存，保留 task_id、请求、规格和验证状态，不能覆盖已有成片。轮询按任务状态适度等待，不密集查询。

1. 核对模型任务状态、文件大小、分辨率和时长；完整解码属于技术检查。
2. 实际查看角色是否一致、手脸是否异常、动作起承转合是否成立、镜头是否遮住情绪、画格/文字是否误生成。
3. 接入原口播后检查触发词、动作峰值、停顿和前后衔接；原人物与字幕源时钟不动。逐镜说明观众新增理解的内容，检查关键变化、转场因果和结果停留；没有语义贡献的表演不能仅凭好看或动作连续验收。
4. 只有实际视频通过相应检查才标为可用 B-roll。密钥已配置、只读鉴权成功、创建成功、下载成功、技术检查、实际观看和用户审美确认分别记录。

未授权预算、无余额、无可用密钥或生成未达标时，继续完成分镜、代码机制动画或用户允许的漫画预览；清楚标记临时状态，不把占位图交作最终动漫。不要重做已完成的其他视频。

## 接口依据

- [秘塔维护方接入与端点说明](https://github.com/meta-sota/ComfyUI-MiniMaxH3-API#api-配置)
- [MiniMax v2 创建文档](https://platform.minimax.cn/docs/api-reference/video-generation-v2-create)
- [MiniMax v2 查询文档](https://platform.minimax.cn/docs/api-reference/video-generation-v2-query)
- [官方角色、分镜与动漫示例](https://platform.minimax.cn/docs/guides/video-prompt)

参数以秘塔当前实现为准，MiniMax 官方支持的能力不自动代表本客户端已接入。本模块不安装 ComfyUI，也不改变已有工程的渲染后端。
