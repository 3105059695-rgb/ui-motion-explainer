# 第十六批：横屏命令操作与参数联动

2026-10-01；1920×1080、16:9。新增3个可编辑预设，当前库72项。本批保留两段源视频完整主要链，按横屏重排、留出阅读时间；另一件静态设计只参考布局，全部新增交互明确为原创。

| 来源 | 观察依据 | 代码预设 | 模板时长 |
|---|---|---|---:|
| [Ilya Miskov / @ilyamiskov](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 一张静态图，未观察到源动作 | `interaction-camera-strip-dual-theme` | 12秒 |
| [Erşad / @ersadwork](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 28个稳定解码暂停点 | `interaction-hr-command-multigroup-search` | 28秒 |
| [benja / @benjaminakar](httpLOCAL_ASSET_NOT_DISTRIBUTED) | 24个稳定解码暂停点 | `interaction-command-task-config-theme` | 40秒 |

## 动作与口播使用

- 相机条：浅色与深色两个条形界面持续存在，镜头菜单选择后两条同时更新，再在深色条选择ISO。来源只是一张静态图，光标、菜单、目标参数和双主题联动均为原创演示。适合摄影或AI影像参数讲解，不能证明真实相机设置。
- 四组命令：保留工具、员工、团队、地区四组列表；最近标签仅悬停且当前查询保留，替换输入、多轮筛选及尾段清空恢复形成一条连续过程。适合讲“一个入口检索不同对象”，末态回到列表，不新增业务成功。
- 任务工作台：同一软件外壳内打开命令、筛选已有任务、进入会话和PR差异、切换代理和多仓库、查看历史日志、返回PR并切浅色主题。既有PR保留1 failing check；新动画没有生成新代码、提交新PR或证明检查成功。

界面都是独立代码重建，保留简洁“界面示意”标识。来源缺少的真实指针或具体按键不当作已观察；本期需要添加操作引导时，按具体源码和差异记录交代性质。模板时长只提供机制基准，正式口播按真实声音调节动作与停留。

## 参数与实现差异

### 相机参数条 · 亮暗联动演示

默认参数：`{"title": "DJI MAVIC 4 PRO", "prompt": "28MM", "result": "800"}`。长度限制：`{"title": 18, "prompt": 8, "result": 8}`。

- Two visual themes are preserved but reflowed to 1920x1080 with legible labels. Icons are original SVG approximations, not reference pixels.
- Entrance, simulated cursor, focal menu 28MM to 35MM, ISO menu 800 to 640, and synchronised field changes in both strips are explicitly original choreography, not source-observed motion.
- Title is device name, prompt is initial focal string, result is initial ISO string. Custom initial values do not acquire invented targets unless focalTarget/isoTarget are explicitly supplied.
- No real camera, photograph EXIF, code generation, network or paid service is accessed.

### HR Command · 四组筛选与清空

默认参数：`{"title": "搜索 HR 工具或输入关键词", "prompt": "Monday", "result": "Synergy"}`。长度限制：`{"title": 26, "prompt": 18, "result": 18}`。

- 1920x1080 horizontal layout with wider menu; duration extended from22.270833 to28 seconds.
- Groups, Recent chips and footer translated to Chinese; proper names preserved by default.
- Icons, avatars and flags independently drawn vectors; not source pixels or original code.
- Pointer route, typing interval and selection width approximate visible mechanism; exact physical keys not proven and not labelled.
- Editable prompt and result replace first tool/final team names; retained English aliases preserve fixed original M/A/S style searches. result means team query, not business result.
- Added small interface-demo/no-business-calls caption.

### 任务命令栏 · 搜索、配置与主题

`prompt`替换示意查询词，`title`替换同一条目标任务，`result`替换既有答复；三者应属于同一语义。目标行按时间线固定，不是对任意内容进行实际通用检索。

默认参数：`{"title": "简单问候任务", "prompt": "hel", "result": "已创建 hello-world.md，内容为 hello world，与 CLAUDE.md 说明一致。"}`。长度限制：`{"title": 18, "prompt": 18, "result": 100}`。

- 原片2898×1750、19.481481秒；重排为1920×1080横屏并放慢至40秒。保留持续软件窗、全局/任务上下文分层、筛选缩高、双栏既有任务/PR、代理选择、仓库多选确认、PR/日志加载往返、命令内滚动和浅色主题的完整主要链。位置、尺寸、插值和缓动为代码重建，并非提取原片工程。
- 多数界面标签译为中文，title、prompt、result为可编辑示意文本。原查询为hel；修改prompt后仍按固定演示链收拢至title对应的一条任务，不构成通用搜索引擎。result显示既有历史答复，不表现一次新生成或新业务执行。
- 原片无可核实的鼠标或逐次按键事件。重建不添加指针；窗口外的⌘K、Enter、方向键、Space提示是原创因果引导。⌘+K原片标题及仓库Space/Enter、代理/主题Enter帮助文字已观察，其余具体按键时序未在源中确认。
- 背景椭圆线、入场淡入、通用SVG图标和B头像为原创。保留软件层级，不使用原片像素、品牌标志或第三方截图作为模块资产。
- 列表仅重建在已接受暂停状态看清的条目；未看清的完整菜单与日志不编造。历史日志保留读到的部分命令/状态并增加“历史日志内容已省略”提示。未观察到的中段列表项目不复刻。
- 源通知有叠置旧通知的状态；重建用同一通知位置依次显示代理和仓库反馈。所选代理与两仓库更新顺序保持。
- 原片PR始终含1 failing check，重建保留1项检查失败；不会补成成功，也不会执行外链、命令、代理、仓库或任务服务。创建新任务行只被选中后返回主题，未显示新任务创建结果。

## 实际验证范围

主入口3项专项诊断通过；五点前进/回拖、80%文字布局、SVG和裁剪夹具无错误。三段导出共80秒/2400帧，1080p/30fps/H.264无音轨，完整解码与FFprobe通过；实际查看六点联系表、编码中间帧及主要状态，没有连续完整观片、口播同步或审美批准。旧69项本轮未重跑。

记录见 [便携观察与检查](../assets/studio/observations/batch16.json) 和 [验证说明](../verification.md)。目录新清点见 [Sidebar说明](sidebar-inventory.md)，卡片登记不等于代码实现；全站目标仍未完成。
