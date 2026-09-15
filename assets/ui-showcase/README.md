# 资料工作台 · 原创界面示意

一个重新设计的桌面资料窗口：侧栏、工具栏、资料表、详情和团队协作都属于同一工作空间。全部使用示例数据，不代表真实品牌、真实产品功能或真实用户记录。

12 秒、1920×1080、30 fps、静音。0–4 秒建立完整界面；4–8 秒选中“用户访谈记录”，隐藏次要列并移动其余列，为详情面板让位；8–12 秒确认同一份文档并展示协作状态。表格没有缩小字号或横向拉伸文字。

## 预览与修改

- `preview.mp4`：完整演示。
- `preview.gif`：960 像素宽的轻量预览。
- `overview.png`、`detail.png`、`team.png`：直接从浏览器画面截取的无损代表帧；同名 JPG 用于文档预览。
- `index.html`：所有界面与 GSAP 时间轴，可直接编辑；字体和 GSAP 已放在相对路径 `assets/`。

```sh
npm install
npm run dev
npm run check
npm run render
```

渲染版本固定为 HyperFrames 0.8.38。修改文案后，若新增字符不在字体子集中，请用完整 Noto Sans SC 字体运行 `python scripts/subset-font.py /path/to/NotoSansSC.ttf` 更新子集。

字体来自 Noto Sans SC，可变字重已保留，许可见 `assets/NotoSansSC-OFL.txt`。GSAP 文件保留其原始版权与许可声明。本目录不包含其他软件的截图或字体文件。
