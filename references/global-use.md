# 跨窗口使用

统一使用 `$ui-motion-fusion`。[主入口](../SKILL.md)负责新片准备和续剪，[审美偏好](aesthetic-preferences.md)给出绘制与剪辑基准。程序读取全库，窗口随当前镜头取用。

读完后查看[当前认可 UI 的真实图像和连续动作](../index.html#current-ui)，再从[整个效果库](library.md)选择本期设计与实际入口。保留源码用 `ui.py library`，方法组合用 `ui.py programs`，语义动作用 `ui.py semantic`；[独立场景播放器](../assets/rebuilt-library/index.html)可直接查看完整时长、拖动和按事件跳转。参考、当前要求和实际实现的职责见[规则归属](module-map.md)，身份与历史范围见[参考使用](style-profiles.md)。

`direct prepare` 带入完整入口与审美、全片图集和本期素材检索入口，并首次创建 `materials-plan.json`。用户只给数字人与稿件时，Agent 通过 ego 主动找真实素材，打开源页、查看视频或截图、保存本地文件并记录与原句的对应关系，然后绑定效果库；搜索计划本身不代表已搜索或生成成片。实际制作仍按主入口与[主流程](workflow.md)持续完成。

其他电脑要安装完整发布包和可用依赖；只转发 SKILL.md 不会带上源码。包内实现绑定本期素材、文字和时间后执行，日常制作不必重新研究原片。私人原片、音色及账号影片只在追溯历史或本期明确使用时通过本机映射接续，不随公开包上传。旧工程不会因更新 Skill 自动换掉它的运行时；明确续作按工程范围接续。
