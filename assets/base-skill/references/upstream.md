# 上游版本与实现入口

更新来源、提交与保留项见 [upstream-lock.json](../upstream-lock.json)。本文件用于选用新版技术或更新技能，不要求每次剪辑都拉取上游。

## 技术与账号规则分开维护

- 通用 UI 基础来自 [ui-motion-explainer](https://github.com/3105059695-rgb/ui-motion-explainer)。2026-09-25 已发布并同步 v2.0.0（7e0b3a7d），新增可移植安装/渲染、官方素材采集、相册/右侧/时间线/正文四模式、完整中文字体和转发提示词。四段720p50无声示例已导出检查，另有1080p50音频映射小段检查；范围见 [验证记录](../docs/portable-verification.md)。原HyperFrames技术基线与私人账号接入保留。
- 渲染与动效技术来自 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)。本次按 `1b8f8a43`（9月22日）同步10个直接相关技能，保留上游技术内容。唯一格式兼容修订是 audio 的 description 将尖括号标签改写为元素名，以通过技能元数据校验；版本记录列明该差异。账号风格在 [阿刁入口](adiao-profile.md) 及其唯一规范中维护。
- 技术技能推荐的配乐、采访式需求收集或通用样式不能替代当前用户已给出的口播、白底黑紫、人物构图和无BGM要求。已经确定的事项不重新询问。

## 先选画面变化，再读相应实现

| 当前需要 | 已安装实现入口 | 阿刁中的用法 |
|---|---|---|
| 推近、移位、遮罩揭示、匹配交接 | [keyframes](../../hyperframes-keyframes/SKILL.md) | 同一对象由起始姿态连续进入目标姿态，落定后可读；不把淡入两整页当作对象运动 |
| 多层窗口、焦点接管、同物交接 | [animation](../../hyperframes-animation/SKILL.md) | 只选与口播动作对应的规则，保留原账号色彩、字体和人物安全区 |
| 快速移动的运动模糊 | [motion-blur](../../hyperframes-animation/references/motion-blur.md) | 只处理快速运动的对象；低速漂移、阅读文字与整屏不默认加糊；停止后保持锐利 |
| 现成效果组件 | [registry](../../hyperframes-registry/SKILL.md) | 按所需机制查找单个组件，吸收运动机制而不是照搬组件配色；不安装全部组件 |
| 原片截取、片段衔接、母带同步 | [core](../../hyperframes-core/SKILL.md) 与 [剪辑配方](../../hyperframes-core/references/creator-editing-recipes.md) | 源片时间与可见姿态分开，真实演示默认1倍速，原口播完整且只混入一次 |
| 动画诊断、抽帧与渲染 | [cli](../../hyperframes-cli/SKILL.md) | 按当前工程实际版本执行；诊断通过不等于画面已获用户认可 |

声明式 `data-hf-motion-blur` 需要实际安装并接入对应组件，单写属性不会产生效果。组件的预览拖影与渲染器的全帧时间采样不是同一功能；先看当前版本文档和实际中间帧，再决定使用。没有制作和检查新样片时，只能称“技能已更新”，不能称“效果已验证”。

## 当前兼容边界

本次已在独立的 [Motion Lab](../assets/motion-lab/README.md) 用 0.8.62 导出并检查三段样例，具体范围见 [验证记录](../assets/motion-lab/verification.md)。历史项目 `package.json`、CLI、字体、视频或音轨保持不变。新版提到的 `timeline` 命令、rate lane、自动媒体时长或渲染器运动模糊，使用前读取当期版本与对应 `--help`，做与所需能力相称的小段检查。缺少支持时沿用显式时长、已有关键帧或预处理素材；不要给旧工程写无法识别的新参数，也不为了技能更新重渲染成片。

`media-use` 暂留原基线：此次上游把部分脚本移到仓库的 `packages/cli`，直接复制到独立技能目录会缺依赖。继续使用已安装素材流程；不要运行无参数全量 `skills update` 把这处兼容保留冲掉。需要迁移该模块时，应在隔离环境验证 CLI 与素材入口，再更新并记录基线。新版提及的 `hyperframes-studio` 不在本次安装范围，常规剪辑可用 core 配方；明确要操作 Studio 再检查可用工具。

## 下一次更新

先核对记录中的 GitHub HEAD，再在独立目录比较实际文件；锁文件时间旧不代表每个文件都旧。保留修改前备份，区分上游新增、本地定制、上游删除与改名。仅合并本次有关的技能，不改插件缓存、账号身份和密钥。检查新增入口及相对路径可用，记录已同步和暂缓项。公开发布或推送另按用户授权处理。
