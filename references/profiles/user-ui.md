# user-ui 兼容入口

当前统一制作入口是 [ui-motion-fusion](../../SKILL.md)，整体视觉与剪辑默认沿用 [Fred Talk](../aesthetic-preferences.md)。`user-ui` 保留为工程/API 兼容标识；效果库提供实现，每期对象、素材与编排随口播变化。当前具体外观采用[十款 Agent 正文基准](../../index.html#current-ui)，最新确认见[跨窗口基准](../evidence/approved-body-default-20261028.json)。

普通制作不通过账号名、目录或历史样片切换视觉风格。AIGC 使用[画风参考说明](../style-profiles.md)，本期人物与原声独立保留。早先的[逐图记录](../evidence/library-entry-correction-20261020.json)保留为历史，风格默认以本轮最新纠正为准。

原 A01、女孩样片和账号作品的源码及原始认可均未删除，历史索引见[参考与历史](../history.md)。认可只适用于当时作品和范围，不能自动升级为新片认可。

## 有依据的工程外观例外

只有本期明确的新方向或指定旧工程续作，才采用该工程真实来源支持的例外。统一路由只读取指定工程根目录的 `project.json`，不把父目录的模式、身份、配色或 `style.ui_override` 带入另一新工程。继续已有工程时从其根目录调用。

`style.ui_override` 的 `scope: body-ui` 仅覆盖正文外观；独立方向与参考图、原话来源文件、SHA-256 和精确引文仍需有效。当前审美页、开头与禁忌继续继承。字段及验证边界见[计划合同](../director-plan-contract.md#当前风格绑定与跨机器调用)；文件存在和引文匹配不能代替对实际用户要求及范围的判断。
