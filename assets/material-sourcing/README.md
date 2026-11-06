# 从口播找本期素材

这条入口负责本期真实截图和视频。认可原片图集负责审美；效果库负责动效实现，三者分别使用。没有让用户逐镜供图的前提，也不把演示占位图当成本期素材。

`direct prepare` 带入全文和逐句检索计划。首次生成的 `materials-plan.json` 可直接编辑；已有计划和采集记录不会被重新准备覆盖。分句和初始查询只是词法辅助，不是自动理解、自动搜索或固定分镜。

## 一次实际采集

1. 通读口播，确定要看见的对象、操作和结果。把计划中各单元的 `query` 改成准确产品、版本、动作、结果，必要时增加英文别名；通过 `materials plan --brief` 可一次写入语义判断。搜索链接同时覆盖 X、B站和抖音，先选更可能拥有对应原始演示的平台，再按缺口扩展，不为凑数量重复搜。
2. 读取当前安装的 ego-browser Skill，执行 `ego-browser skill`。复用整个任务的同一个 TaskSpace，通过计划链接搜索；打开原作者/官方来源页，核对内容、版本/日期和清晰度。搜索列表的播放数、标题和封面不能代替看具体视频。登录/验证码由正常浏览器流程处理，不抽 cookies、不绕过权限。
3. 用下面的 `ego-script` 采集当前页候选、可见文字、图片地址、视频地址/尺寸/时长，或保存当前视口截图。X 会去重到原帖子而非其 photo/analytics 页面。候选状态始终是未选择；搜索封面也不会自动成为可剪素材。
4. 视频可通过来源页正常下载动作保存；已经读到公开直接媒体地址时可用 `download`。`blob:` 只是播放器地址，不可传 HTTP 下载。若平台只有 blob/分段播放器，继续用当前合法页面的下载入口或本机已有且支持该网址的下载器；找不到可取媒体就保留来源并换合适候选，不安装一套新环境或谎称已下载。静态界面/事实可截图，真实动作和过程不能用一张截图冒充。
5. 查看候选的实际内容，比较句意是否对应、过程是否完整、重点是否清楚、画质是否可用。确定实际入出点及重点区域，把选择理由和看到的事件写进记录。记录、检查后 `export` 输出实际素材绑定；按选中效果的参数将 `media_by_id` 接入媒体位，并把剪辑时间放到口播时间线。

同一句可以有多个候选和多个最终材料。找不到好材料时重组查询、换平台或改用能说明白的 UI/AIGC/人物讲述，不强行配图。全片也不要求每句话都有网络素材。

## 命令

从 Skill 安装目录运行，`<工程>` 是本期工程，不是另建 runtime。

```powershell
python -B -X utf8 scripts/ui.py materials plan --script <原稿.txt> --project <工程> --brief <语义检索.json>
python -B -X utf8 scripts/ui.py materials ego-script --request <本轮采集.json> --out <本轮.mjs>
python -B -X utf8 scripts/ui.py materials download --url <实际媒体URL> --source-page <来源页URL> --out <工程素材.mp4>
python -B -X utf8 scripts/ui.py materials record --plan <materials-plan.json> --record <素材记录.json>
python -B -X utf8 scripts/ui.py materials check --plan <materials-plan.json>
python -B -X utf8 scripts/ui.py materials export --plan <materials-plan.json> --out <素材绑定.json>
```

`--brief` 可省略；`plan` 只在计划不存在时创建。语义检索文件格式：

```json
{"units":[{"unit_id":"U001","query":"准确产品名 操作 结果","purpose":"让观众看见本句所说的变化","wanted":["真实操作视频","结果界面截图"]}]}
```

浏览器请求格式（`space_id`、`page` 使用当前任务真实值；输出必须是新的绝对路径）：

```json
{"space_id":1,"page":"p1","action":"collect","output":"<绝对路径/候选.json>"}
```

`action: "screenshot"` 保存视口 PNG。`action: "download"` 额外传当前 `source_page` 与刚刚观察到的直接 `url`，由已登录页面 `fetch` 保存；CORS/站点权限失败会报错，不绕过。生成脚本后，执行命令返回的 `ego-browser nodejs -e "await import('file:///...')"`；脚本不另开、不接管、不结束你的 TaskSpace。收尾由主任务按 ego Skill 完成。

素材记录（`quote` 必须与计划逐字相同；视频时间以下载媒体为原点）：

```json
{
  "id":"demo-operation-01",
  "unit_id":"U001",
  "quote":"这里填写原稿原句。",
  "kind":"video",
  "purpose":"看到从输入到结果的真实变化",
  "source":{"page_url":"https://原始来源页","author":"页面实际作者","published_at":"页面实际时间或留空","reuse_note":"已知用途/许可说明，不知道就记录未知"},
  "local_path":"media/operation.mp4",
  "source_in":3.2,
  "source_out":8.7,
  "selection":"selected",
  "review":{"semantic_match":true,"viewed_range":[0,12],"notes":"实际看见的操作、结果与本句的对应理由"},
  "focus_region":{"x":0.2,"y":0.15,"width":0.6,"height":0.7}
}
```

未核实条目用 `selection: "candidate"`、`semantic_match: false`，不填写虚构作者/日期。图片 `kind: "image"`，不需要视频入出点。视频必须记录已观察范围覆盖最终剪辑范围。机器会检查文件存在、hash、FFprobe尺寸/时长和入出点；**语义判断是 Agent 实际观察后的记录，不由脚本声称自动验证**。探测成功也不代表完整解码、审美认可或自动获得转载权限。

`export` 拒绝没有本地文件、未选择、未记录具体观察理由、未成功探测或出点超时的条目。它输出真实路径/入出点/原句/来源，不输出假素材；没有匹配素材的单元仍可在导演计划里说明其他表达方式。当前 `source_in/source_out` 到不同效果 API 的映射由制作 Agent 按 `inspect` 确认，不能把未知字段硬塞给所有组件。

## 运行条件

复用本机 Python、FFmpeg/FFprobe、Ego。无需复制 node_modules、浏览器或安装包。其他电脑需有自己的可用浏览器登录状态；不会随公开 Skill 分发当前电脑的 cookies、私密媒体或浏览记录。下载默认为单文件 200 MiB 上限，可显式调整，已有文件不覆盖。
