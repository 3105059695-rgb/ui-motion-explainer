# AIGC 画风参考 · 柔和手绘

`output/preview.mp4` 是11.3秒历史样片。2026-10-20用户明确它用于AIGC创作的画风参考：生成这种画风的新图，再制作本期视频。不是当前UI模板，也不固定原图、女孩身份或场景。UI从主Skill效果库选择；本期固定IP与明确画风要求优先。历史认可记录不删除，本轮用途见 ../../references/evidence/library-entry-correction-20261020.json。

可编辑播放工程包含 `index.html`、`project.json`、`src/player.js`、`src/style.css`、实际用到的3条动作视频/首帧和 `audio/mix.wav`。配音是公开示意音色，不是作者私人声音克隆。

在本目录运行 `python -m http.server 8765` 后打开 `http://127.0.0.1:8765` 可查看交互工程。字体位于父级Skill的base-skill资源；如果只复制此子文件夹，另行带上字体或配置同等完整中文字体。

生成收据、账号ID、旧试稿、完整构建工作区不随包；本目录不宣称可重跑原模型生成任务。历史检测范围见已附的validation和output记录，技术记录不替代新成片视听与审美检查。
