# 按原片选择实现方式

四套开放源码按固定 commit 放在 `upstream/`，原 README/SKILL 和许可证保留。下面是任务路由，不是把四个 Skill 的所有要求同时执行。仅加载当前方式需要的文件。上游涉及账号、会话、发布或付费步骤时，不能从参考文档推定用户授权。

| 参考特征 | 推荐实现 | 本包入口 |
|---|---|---|
| 单对象 UI 连续变形、滑块/光标/标签/图表 | 独立 HTML 纯函数 seek，或可寻址 GSAP | `assets/templates/ui-morph/`；对应原片 `twoclipping-5cba86` |
| 照片、液态玻璃、字标变形、手机/网页/产品交接 | 独立 HTML；复杂光学另写 WebGL/SDF | `assets/templates/launch-film/`；对应 `twoclipping-221cab` |
| 动态字体、品牌展示、SaaS/商业发布 | Remotion/React 或 HyperFrames | `upstream/cinetic/skills/cinetic/SKILL.md`，需要时读取其导演/字体/运动/配乐参考 |
| 应用真实组件、design tokens、产品操作发布片 | Remotion，读取用户给定应用源码 | `upstream/product-film/plugins/product-film/skills/product-film/SKILL.md`；没有真实应用源码时根据原片独立实现，并明确界面示意 |
| 水彩故事/插画叙事 | HyperFrames + p5/p5.brush | `upstream/session-story/SKILL.md`；使用用户提供故事稿，默认不读取本机其他会话 |
| 历史、像素、连续代码插画、无需外部生成的动画电影 | Python pycairo/Pillow，numpy/scipy 音轨，FFmpeg | `upstream/generative-film/SKILL.md` 与其 references |
| 三维球体、粒子、模型、灯光、相机运动 | Three.js/WebGL；材质灯光与相机按原片写 | 当前案例的 `stack/prompt`；新工程锁定 npm 依赖，不用二维假图代替明确的三维运动 |
| 数学公式、坐标、推导、知识可视化 | Manim/Python；口播按原片或用户文稿 | 当前案例的 `stack/prompt`，例如 `linearuncle-5d2bae` |
| 真人剪辑、真实素材拼接或较长叙事 | 时间线剪辑与具体素材组合 | 按原片时序与用户素材制作；不要为了 HTML 统一入口改成卡片 |

## 对这次 230 案例的适用范围

目录 `category` 是基于标题和提示词推断的检索标签，不是原作者分类，更不表示已实现。某个项目可能同时跨越多类。以视频里实际出现的机制为准；与原 prompt 冲突时，复刻任务首先对准成片，差异注明来源。

默认短片最终交付 MP4 和可编辑源码；浏览器动态预览、contact sheet 或一段原视频下载不能替代成片。用户只要 Skill 时提供可调用入口、资料与渲染能力，清楚列出已经制作的模板和仍需按案例生成的工程。
