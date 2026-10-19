# Collect UI 第四批：节点配置、Agent Hub 与接管流程

记录日期：2026-09-27。本批实际画面观察由主代理完成，本文件根据其转交的时间点、可见元素和原作链接整理；不宣称整理者亲自播放过。本文件只记录来源、观察范围与制作差异，不更新 coverage、inventory 或实现状态，也不宣称代码、回拖或 MP4 已验证通过。验证完成后由主代理补充对应链接。

## 列表清点与画面观察分开

[AI Flow 分类](httpLOCAL_ASSET_NOT_DISTRIBUTED)本次可见分页已清点：第 1 页 24 张卡、第 2 页 2 张卡，共 **26 张卡、25 个不同媒体 URL**。第 2 页已见 active 状态与下一页 disabled；URL 不随内部分页变化。第 1 页第 3、5 卡使用完全相同的 Ayda 媒体 URL，均保留原卡片顺序。

这是本次分类列表快照的枚举完成，不能称为 26 个独立原作、26 件媒体已看或全站完成。媒体 URL 去重不等于原作身份核实。清点字段及末页证据见 [work-inventory.json](work-inventory.json) 和 [清点说明](work-inventory.md)。本批对下列具体画面的观察，应独立记录，不能自动升级整个分类或其他条目。站点内容仍可能更新。

## Kevin · 三件静态作品

三件均以实际静态图为依据，不把图片构图称为已观察到的点击过程或播放动画。

| 作品与来源 | 对应分类卡片媒体 | 实际可见内容 | 不能据此声称 |
| --- | --- | --- | --- |
| [Workflow Builder](httpLOCAL_ASSET_NOT_DISTRIBUTED) | [G7vC7DcawAEI4Up.avif](httpLOCAL_ASSET_NOT_DISTRIBUTED)，第 1 页第 20 卡 | 左侧可见 PayPal Payment Trigger 节点。 | 未看清完整流程，不能补造后续节点、连接关系或执行结果。 |
| [Node Configuration](httpLOCAL_ASSET_NOT_DISTRIBUTED) | [G8i5F_CbgAAjJ3f.avif](httpLOCAL_ASSET_NOT_DISTRIBUTED)，第 1 页第 16 卡 | Slack Node Mode 蓝色边框、用户消息气泡、`Authentication required`、`Add Credentials` 和底部 composer。 | 未见凭据授权成功，不能呈现为已接通 Slack 或已有真实执行权限。 |
| [Replace Nodes](httpLOCAL_ASSET_NOT_DISTRIBUTED) | [G9WMfewXUAACIor.avif](httpLOCAL_ASSET_NOT_DISTRIBUTED)，第 1 页第 11 卡 | ChatGPT Summary 节点右侧有 Replace 浮层；Favorites 中可见 Slack、ChatGPT，并有 All Apps 区域。 | 静态图不证明搜索、选择、替换的具体时序与运动曲线。 |

对应制作文件为 `assets/studio/presets/workflow.js`：

- `interaction-workflow-replace`，声明时长 11 秒：重建 Replace 浮层与节点关系；点击、搜索、筛选和替换的节奏是本地原创编排。
- `interaction-node-config`，声明时长 12 秒：重建 Slack Node Mode 的构图与认证提示；保留尚需凭据的状态，不能把演示操作变成“凭据已授权”的叙述。

两项都属于依据静态构图的重建，不是原视频动画复刻。Workflow Builder 的局部画面只提供有限背景参考，不形成第三项完整流程实现的声明。字体、尺寸、鼠标路径、进入与退出效果均需与原作可见内容区分。此处只登记对应关系与声明时长，不登记验证结论。

## Ayda · Agent Hub 多时间点观察

原作：[Ayda 的 AI agents 界面](httpLOCAL_ASSET_NOT_DISTRIBUTED)。原片时长 78.75 秒。主代理本轮查看了以下时间点的画面；这不等于完整连续播放并检查了全部 78.75 秒。

| 原片时间 | 实际可见内容 |
| --- | --- |
| 4.651 秒、11.851 秒 | MyAgents 区域以 2×3 卡片展示 Agent，另有 BrowseAgents 入口。 |
| 13.826 秒 | Agent Hub 页签、数值为 5 / 32 / 9 / 6 / 5 的统计区域，以及活动列表。未提供的统计项语义不补造。 |
| 16.311 秒 | OfferLetterGenerator 行展开，显示内部步骤。 |
| 19.815 秒 | 前述行折回；ResumeReview 的 Failed 行展开，包含浅红色失败框、Re-run 与 Manage workflow。 |
| 78.75 秒末帧 | 右侧详情的 Activity 中仍可见同一失败步骤。 |

原片约 13.8 秒时的行标签出现过 EmployeeOnboardingDocs，随后变为 ResumeReview。本地演示为保持对象连续性，将对应行统一使用 ResumeReview；这是明确的连贯性调整，不能写成原片始终使用相同行名。

对应制作目标为 `software-agent-hub`，声明时长 16 秒，由另一制作代理编写。它只覆盖页签切换与活动列表展开，并不承诺复现全片全部流程。交互节奏、点阵头像和渐变背景属于本地原创适配；错误状态以所见浅红框与失败步骤为依据，不能自行宣称 Re-run 后已经修复成功。MyAgents 卡片和末帧详情的观察也不自动等于该预设已全部实现。

## Chris Halaska · 观察保留，暂不实现

原作：[Chris Halaska 的 AI Flow 演示](httpLOCAL_ASSET_NOT_DISTRIBUTED)。原片时长 28.183333 秒。

| 原片时间 | 实际可见内容 |
| --- | --- |
| 4.890 秒 | 浅色界面中需要用户决策的多选问题。 |
| 11.996 秒 | 深色节点画布与右侧设置区域。 |
| 20.196 秒 | 浅色界面的流式回答组件。 |
| 约 28.183 秒末尾 | 人接管卡片。 |

部分画面存在运动模糊，本批只保留可辨认的结构与状态。未看清的文字、选项、节点关系、切换动作、触发条件与接管后的过程均不补造。当前为观察参考，暂不关联已实现预设，也不将这几个时间点视为整条流程已经完整验证。

## 编排边界

固定使用 **1920×1080、16:9 横屏**。可借鉴 `ui-motion-explainer` 的连续对象方法：同一节点、同一活动行和同一失败步骤在展开、收起、聚焦时持续存在，镜头运动服务于当前重点。这个方法是本地制作选择，不是上述原作已被证明使用的实现技术。

静态来源负责构图依据，多时间点来源负责已看到的状态差异；本地代码负责原创的衔接和操作节奏。口播应说明实际可见的过程：替换节点、填写配置、检查失败步骤或等待用户决策。未取得授权的凭据保持待授权，未看到的完成结果保持未知。验证范围见文末链接。

本批后续实际浏览器与MP4验证已完成，详细范围和Agent Hub视窗裁剪提示见 [验证记录](../verification.md)。
