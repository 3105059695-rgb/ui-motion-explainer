# 来源与使用记录

## 原站参考

来源：httpLOCAL_ASSET_NOT_DISTRIBUTED 。本次采集日期按报告记录，初始核对 230 条目，Prompt 227、Skill 4，有一条交叉。首页和详情公开说明视频与提示词属于各自原创作者；每条 JSON 保存作者和原帖链接。`robots.txt` 的公开 Content-Signal 为 search=yes, ai-train=no, use=reference。本包用途是用户个人复刻参考与工作流，不是模型训练数据集。

全站作品/提示词没有在已读页面看到统一开放许可证。视频缓存、离线预览和 prompt 原文保留来源，不宣称本包作者拥有作品版权。用户的独立工程改写与用户授权素材按具体用途处理；发布原片、转售原素材或外部分发需要适当授权，不能由四个开放仓库的代码许可证推出全站授权。

## 开放源码参考

四个仓库的固定 commit、选入文件与 SHA-256 见 `upstream/manifest.json`。保留原 License/Notice 与原作者文件，未修改、未自动执行上游工作流。

- Leonxlnx/cinetic：MIT，httpLOCAL_ASSET_NOT_DISTRIBUTED
- Rieranthony/product-film-skill：MIT，httpLOCAL_ASSET_NOT_DISTRIBUTED
- heygen-com/hyperframes-community-skills 的 session-story：Apache-2.0，httpLOCAL_ASSET_NOT_DISTRIBUTED
- buildfastwithai/buildfast-skills 的 generative-film-skill：MIT，httpLOCAL_ASSET_NOT_DISTRIBUTED

Skill 代码许可证与 Remotion 等引擎许可证独立；当前包内两个 HTML 模板不依赖这些引擎。

## 本包新增内容

检索/分析/渲染脚本、目录界面、复刻规范、动效原语与两个 HTML 模板为针对本次需求新写的实现。模板 project.json 中 `provenance=independent-reimplementation` 表示独立重实现，不能描述成作者原工程。

产品片默认使用原片提帧辅助对照，来源记录见模板 `assets/PROVENANCE.json`；`?assets=svg` 可切换到自制 SVG 示例。模板自身不播放声音；交付样例的音轨取自对应原片，仅用于用户本地参考对照，并在 `assets/demos/PROVENANCE.json` 中记录。每个模板的具体近似与未还原项以模板说明和交付验证记录为准。

本地字体 Geist 与 Archivo 来自 Google Fonts 官方仓库，使用 SIL Open Font License 1.1；字体、许可证、下载地址和哈希见 `assets/fonts/manifest.json`。字体没有安装到系统。
