# v2.0 可移植包验证记录

日期：2026-09-25。此记录区分脚本/编码检查与主观风格认可，不声称能保证任意文案自动得到同样品质。

## 已检查

- 独立 `.venv` 安装锁定依赖：Playwright 1.62.0、Pillow 11.3.0、imageio-ffmpeg 0.6.0；启动 Chromium 151。使用已有浏览器缓存，未宣称在全新操作系统完成首次浏览器下载。bootstrap会先检查可用浏览器，缺失时下载，错误如实抛出。
- 新建中文/空格目录，复制完整字体与媒体、选择不同开场、拒绝覆盖已有工程。
- 安装器拒绝静默覆盖旧技能；显式升级后，旧技能及自定义文件保留在旁边的备份目录，`.venv`不进入分发副本。
- 素材解析检查：相对URL、srcset、OpenGraph、去重与非HTTP链接拒绝。实际从Hypit取得4份素材；从WorkBuddy取得6份素材、2张网站截图，运行记录无采集错误。该结果不是对网站长期可访问性的保证，也不是对素材逐项授权的确认。
- 四模式分别导出10秒、1280×720、50fps、500帧无声MP4，查看稳定与中间帧；完整FFmpeg解码通过。画面是原创示意/人物占位，不是个人成片。
- 另用3秒合成视频+音频输入，导出其中1秒为1920×1080、50fps，验证人物输入路径、音频映射及解码。不是真人嘴型审核或音色测试。
- 没有系统FFmpeg时，imageio-ffmpeg提供的FFmpeg 7.1能启动；常规渲染使用本机FFmpeg 8.1.1。包内不硬编码二者的机器路径。
- 技能元数据校验通过；新增制作入口不依赖作者绝对路径或另一私有技能。公开包不加入作者人物、音色、密钥。

## 复验方式

```text
python -m unittest discover -s tests -v
python scripts/bootstrap.py --check
PYTHON scripts/new_project.py --out TEST_PROJECT --mode hero
PYTHON scripts/render_portable.py --project TEST_PROJECT
```

`PYTHON`指本包虚拟环境Python。Release ZIP带有逐文件SHA-256清单，可运行 `python scripts/verify_package.py 解压后的技能目录` 核对完整性。

## 尚未验证/需要当期制作负责

未在macOS/Linux机器实测；未承诺WorkBuddy等所有客户端自动发现相同安装路径；未调用付费配音/数字人模型；没有任意主题全网搜索引擎，未知主题由调用技能的AI搜索官方URL；网站截图仍需要AI检查加载与选区。

新文案的语义分镜、真实音画对齐、人物裁切、长视频节奏与不同开场设计，必须由使用技能的AI结合输入完成并检查。四段样例验证的是可运行的机制，不是把示例原样套在任何主题都成立。
