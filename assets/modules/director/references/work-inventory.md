# Collect UI 逐作品清点：AI Flow

记录日期：2026-09-27。分类：[AI Flow](httpLOCAL_ASSET_NOT_DISTRIBUTED)。本清单依据主代理实际读取的两页列表 DOM，**本次分类快照 enumerationComplete = true**：仅表示这次可见的两个分页、26 张卡片已登记，不表示全站清点完成，也不表示 26 个独立原作、26 件媒体已观看或 26 件已实现。

## 统计口径

- 卡片条目：26；第 1 页 24 卡、第 2 页 2 卡。保留原顺序，包括重复卡片。
- 完整媒体 URL 去重后 uniqueMedia：25，其中视频 URL 14、图片 URL 11。含重复的卡片类型计数为视频 15、图片 11。
- 第 1 页第 3、5 卡引用同一媒体 URL，均保留；同一媒体分组不等同于已确认原作品身份。
- 全部条目仍为 `catalogued-only`；本次登记未将任何条目升级为已观察、已实现或已验证。
- 只登记首个可见标签；隐藏标签名称 `otherTags` 仍为 null。第 1 页本轮补录可见 `+N` 数量，未显示 `+N` 的卡片记 0；第 2 页未补读的数量保留 null。第 1 页新增 10 条实读标题，其余第 1 页标题仍为 null，第 2 页第 2 卡标题保持原样。
- 原作 X URL 只补已独立打开站内作品弹层核实的卡片。目前25条已有依据：第1页除重复的第5卡外其余23卡，以及第2页两卡。第5卡仍保持null；作者资料页与Post by社交归属链接不是原作发布链接，不从媒体ID推测，也不因媒体重复自动复制原作链接。
- 未下载媒体。文件扩展名只能帮助区分媒体 URL 类型，不能证明媒体已播放。
- 站点会更新；数量、顺序与分页是本次快照的记录。全站原作品总数仍未知。

清单保留卡片登记状态。实际媒体观察、来源范围与代码映射分别见 [本批观察](collectui-batch-04.md)、[后续观察](collectui-batch-06.md)、[第七批静态参考](collectui-batch-07.md)、[第八批动态参考](collectui-batch-08.md)、[第十一批动态参考](collectui-batch-11.md)、[第十二批动态参考](collectui-batch-12.md) 和 [作品记录](../assets/studio/coverage.json)。截至2026-09-30，14个不同视频媒体和11个不同静态媒体均已有实际观察；这些后续状态不反写为2026-09-27清点时已经观看。

## 2026-09-27 元数据补录

主代理本轮重新读取 AI Flow 第 1 页实时 DOM，补录实际图片 alt 文本与可见 `+N` 数量。标题共补录 10 条；第 1 页 24 卡的隐藏数量均有本轮依据，未显示 `+N` 的明确记 0。隐藏分类名称 `otherTags` 仍为 null。此前 5 条核实原作链接、两页快照、重复卡片及媒体分组保持不变，所有条目仍为 `catalogued-only`。机器可读补录依据存于 JSON 的 `enrichments`。

## 列表快照与末页证据

| 快照 | 页码 | 卡片数 | 实读分页证据 |
| --- | --- | --- | --- |
| ai-flow-page-1-2026-09-27 | 1 | 24 | 分页按钮为 1、2 |
| ai-flow-page-2-2026-09-27 | 2 | 2 | 点击 Page 2 后等待新卡片出现；Page 2 为 active，Go to next page 为 disabled |

站内采用内部分页，切换第 2 页后 URL 不变，两个 `listingSnapshots` 都记录同一分类 URL，并以 `pageNumber` 和分页证据区分。主代理确认第 2 页内容已更新，不是第一页残留。

## 第 1 页条目

以下 24 条均有站内作者资料路径。本轮第 1 页补录 10 条实际 alt 标题，以及全部 24 卡的隐藏标签数量；标题缺失处保持 null。表中 0 表示本轮 DOM 未显示 `+N`，不据此补造隐藏分类名称。

| 卡片顺序 | 作者资料 / 归属链接 | 原样标题 | 首个可见标签 | 隐藏标签数 +N | 媒体 URL | 媒体组 | 条目状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [chalaska](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 0 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-001 | catalogued-only |
| 2 | [mrblackstudio](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 0 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-002 | catalogued-only |
| 3 | [aydaoz](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Agents | 3 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-003 | catalogued-only |
| 4 | [mikun_ux](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `ouuuu` | AI Flow | 0 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-004 | catalogued-only |
| 5 | [aydaoz](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Agents | 3 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-003 | catalogued-only |
| 6 | [gabriell_lab](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `Agentic reasoning for image and video generation.` | AI Flow | 2 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-005 | catalogued-only |
| 7 | [jeetnirnejak](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 3 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-006 | catalogued-only |
| 8 | [sayansenguptaa](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 2 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-007 | catalogued-only |
| 9 | [bruce_CQT](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 0 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-008 | catalogued-only |
| 10 | [nandafyi](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | Chat Layout | 1 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-009 | catalogued-only |
| 11 | [kvnkld](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `Replace Workflow Nodes` | AI Flow | 0 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-010 | catalogued-only |
| 12 | [elayadesigns](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `Workflow automation` | AI Flow | 0 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-011 | catalogued-only |
| 13 | [srotimi_ui](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `Bring this back cus its sooo cleannnn` | Chat Layout | 2 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-012 | catalogued-only |
| 14 | [timothymaarv](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 1 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-013 | catalogued-only |
| 15 | [nandafyi](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 1 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-014 | catalogued-only |
| 16 | [kvnkld](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `Workflow Node Configuration` | AI Flow | 1 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-015 | catalogued-only |
| 17 | [siddharthvij_](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `cleanest workflow builder design you'll see here ;)` | Dashboard | 1 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-016 | catalogued-only |
| 18 | [privetavdey](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 0 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-017 | catalogued-only |
| 19 | [ailker](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI | 1 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-018 | catalogued-only |
| 20 | [kvnkld](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `Workflow Builder` | AI Flow | 1 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-019 | catalogued-only |
| 21 | [jamesperkins](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | AI Flow | 0 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-020 | catalogued-only |
| 22 | [marcelkargul](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `This is the design quality founders happily invest $50,000+ into.` | AI Flow | 0 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-021 | catalogued-only |
| 23 | [TukiFromKL](httpLOCAL_ASSET_NOT_DISTRIBUTED) | `This is the part where designers get mad because it doesn’t look like a pastel SaaS template.` | AI Flow | 0 | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-022 | catalogued-only |
| 24 | [maxleedev](httpLOCAL_ASSET_NOT_DISTRIBUTED) | null | Chat Layout | 2 | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-023 | catalogued-only |

## 第 2 页条目

仅获取到 `Post by` 归属链接，`authorProfile` 保持 null。第二卡标题原样登记为 `web { @intrfacer }`，不据此补造其他作者字段。

| 卡片顺序 | 作者资料 / 归属链接 | 原样标题 | 首个可见标签 | 隐藏标签数 +N | 媒体 URL | 媒体组 | 条目状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Post by [krea_ai](httpLOCAL_ASSET_NOT_DISTRIBUTED)（authorProfile 未提供） | null | Motion | null | [MP4](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-024 | catalogued-only |
| 2 | Post by [aydaoz](httpLOCAL_ASSET_NOT_DISTRIBUTED)（authorProfile 未提供） | `web { @intrfacer }` | AI Flow | null | [AVIF](httpLOCAL_ASSET_NOT_DISTRIBUTED) | media-025 | catalogued-only |

## 媒体分组

按完整媒体 URL 精确分组；分组不会删除列表卡片，也不把 URL 自动等同为一个已确认原作。媒体观察字段保留清点时的 `not-observed`，`presetIds` 为空；后续实际观看和机制适配单独记录在coverage.json，不能把这些快照字段误解为当前全部媒体都未观看。

| 媒体组 | 页内卡片位置 | 卡片出现次数 |
| --- | --- | --- |
| media-001 | 1 页 1 卡 | 1 |
| media-002 | 1 页 2 卡 | 1 |
| media-003 | 1 页 3 卡、1 页 5 卡 | 2 |
| media-004 | 1 页 4 卡 | 1 |
| media-005 | 1 页 6 卡 | 1 |
| media-006 | 1 页 7 卡 | 1 |
| media-007 | 1 页 8 卡 | 1 |
| media-008 | 1 页 9 卡 | 1 |
| media-009 | 1 页 10 卡 | 1 |
| media-010 | 1 页 11 卡 | 1 |
| media-011 | 1 页 12 卡 | 1 |
| media-012 | 1 页 13 卡 | 1 |
| media-013 | 1 页 14 卡 | 1 |
| media-014 | 1 页 15 卡 | 1 |
| media-015 | 1 页 16 卡 | 1 |
| media-016 | 1 页 17 卡 | 1 |
| media-017 | 1 页 18 卡 | 1 |
| media-018 | 1 页 19 卡 | 1 |
| media-019 | 1 页 20 卡 | 1 |
| media-020 | 1 页 21 卡 | 1 |
| media-021 | 1 页 22 卡 | 1 |
| media-022 | 1 页 23 卡 | 1 |
| media-023 | 1 页 24 卡 | 1 |
| media-024 | 2 页 1 卡 | 1 |
| media-025 | 2 页 2 卡 | 1 |

完整字段见 [work-inventory.json](work-inventory.json)。下一步可逐条核对原作链接、实际媒体状态和可见交互；本次枚举完成不能代替动态观察、代码实现或播放验证，也不更改其他批次的观察结论与覆盖统计。

新增 [第九批清空上下文观察](collectui-batch-09.md)。

2026-09-30补充 [第十批动态参考](collectui-batch-10.md)，原分类数量仍指2026-09-27快照。

## 2026-09-30 第十一批来源补录

本批独立核实第1页第24卡maxleedev、第14卡Timothy M.、第15卡nanda的原作地址，并通过浏览器实际查看三条视频的多个暂停状态，见 [第十一批记录](collectui-batch-11.md)。只在本清单补 `originalWorkUrl` 与独立 `enrichments` 记录，保留旧分页、26卡、25个媒体组、卡片标题和登记状态。

当时仍待观察的四个不同视频媒体为第1页第18卡privetavdey、第19卡ailker、第21卡jamesperkins和第2页第1卡krea_ai，现已在第十二批补充观察；不把后续结果回写成第十一批已经完成。

## 2026-09-30 第十二批来源补录

本批核实上述四卡的原作URL并实际查看动态画面，见 [第十二批记录](collectui-batch-12.md)。前三卡在独立作者页对应媒体卡片弹层核对；`ai-flow-p2-001` 则在AI Flow分类第二页实际弹层核对Motion、AI Flow标签和KREA AI原作地址。旧快照的authorProfile、Post by、原样标题、首标签和隐藏数量仍保持原值。

JSON只补这四卡的 `originalWorkUrl` 和独立 `enrichments` 记录。两页26卡、25媒体组、卡片 `catalogued-only`、媒体 `not-observed` 是旧清点快照口径；当前实际观察与验证独立登记在coverage.json和verification.md。14个不同视频媒体现均有观察，分类升级及逐媒体代码覆盖待统一审计。

## 2026-09-30 当前快照媒体审计

[逐媒体审计JSON](../assets/studio/ai-flow-audit.json) 将本清单的25个媒体组，与coverage.json中已观察作品按独立原作URL或完整参考媒体URL精确关联。结果为26张卡、25个不同媒体：14个视频对应多时点观察，11个图片对应静态观察；25组均有具体观察证据，共关联25件已观察作品及26个已登记适配预设。

`ai-flow-p1-005` 的独立原作URL仍为null；它仅通过与第3卡完全相同的media-003关联该媒体的观察，不能把这种关联写成独立原作链接已核实。每组保留观察深度、代码ID、差异与未解决项，适配验证范围另见verification.md。

这是旧分类快照的观察映射审计，没有重新观看全部原片或刷新全站列表。主代理随后重新核对输入记录和逐媒体关联，并仅将AI Flow分类升级为observed；范围限本次两页快照，另158分类保持queued。视频取样和静态图观察不等于逐帧完整复制，26个预设映射不代表26个完整原作品；原作完整复刻数仍为0，分类最终状态以coverage.json为准。


## 2026-09-30 多分类参考目录

以下为各次实际列表快照；上文AI Flow历史清单与后续媒体审计继续保留。可在 [目录查看器](../assets/studio/coverage.html?inventory=ui-interaction) 切换分类、搜索作者/标签/链接并按24卡分页。独立工程会复制相同目录，默认横屏1920×1080。

| 分类 | 快照日期 | 实际页数 | 卡片出现次数 | 不同完整媒体URL | 当前范围 |
| --- | --- | ---: | ---: | ---: | --- |
| [AI Flow](work-inventory.json) | 2026-09-27，来源后续补录 | 2 | 26 | 25 | 旧清点；25媒体组已有独立观察证据 |
| [UI Interaction](../assets/studio/inventories/ui-interaction-20260930.json) | 2026-09-30 | 30 | 706 | 703 | 目录清点，媒体未观察 |
| [Motion](../assets/studio/inventories/motion-20260930.json) | 2026-09-30 | 13 | 296 | 296 | 目录清点，媒体未观察 |
| [Loading Animation](../assets/studio/inventories/loading-animation-20260930.json) | 2026-09-30 | 4 | 93 | 93 | 目录清点，媒体未观察 |

四类共49个实际分页、1121卡，按完整媒体URL跨分类分组为1089项（1068视频扩展、21图片扩展）；32次重复出现、28个跨分类媒体组。扩展名统计不是播放验证或独立原作总数。仅通过已存在AI Flow审计关联25个已观察媒体组，本次枚举新增观察为0。精确分组记录在 [inventory-summary.json](../assets/studio/inventory-summary.json)。

新列表保留实际可见标签与href，包括浏览器翻译后的标签文字；未展开的隐藏标签不补造。作者资料页、Post by归属链接、原作发布链接分别记录，不从媒体ID猜原作地址。Loading Animation第1页第1、3卡后续通过实际弹层取得原作链接，详见 [加载来源尝试](../assets/studio/loading-source-attempts.json)；两段视频均未解码，仍为not-observed，没有产生新的加载动效模块。

本次范围、末页证据和后续使用原则见 [第十三批记录](collectui-batch-13.md)。62个既有预设、30项来源观察、31项机制适配及0完整原作复制均保持；目录数量不能当作动效库数量或全站完成率。


## 2026-09-30 Command Bar 单页清点

新增 [命令栏目录](../assets/studio/inventories/command-bar-20260930.json)：实际可见15卡、15个不同媒体URL（6视频扩展、9图片扩展），15卡都有实读站内作者资料链接。页面未显示分页控件，`activePage`保留null；页码1仅为归档顺序，没有伪造第1页选中或Next禁用。清点记录保存实际标题、标签、隐藏数量与完整媒体URL，未下载或观看这些媒体。

五类合计50个归档分页/列表、1136次卡片出现；完整媒体URL跨类去重1101组，35次重复出现、31跨类媒体组，1071视频扩展与30图片扩展。分类清点与后续动态观察仍分开计数；全站范围尚未枚举完成。


## 第十四批动态观察补录

Loading第1页第2卡、Motion第1页第2卡、UI Interaction第1页第6卡实际取得原作链接并观察8/32/30个有效状态，对应三段新代码；详见 [第十四批记录](collectui-batch-14.md) 和 [便携观察记录](../assets/studio/observations/batch14.json)。清点快照保留原catalogued-only/not-observed，当前观察由coverage.json独立记录。五类卡片总数与去重数量保持，不能因抽取三例升级整个分类。

第十五批四个Command Bar源及两条相同完整URL的UI Interaction目录卡补录真实原作地址。当前动态观察独立登记，历史卡片状态保持；见 [第十五批机制](collectui-batch-15.md)。

2026-10-01新增 [Sidebar目录说明](sidebar-inventory.md) 与第十六批三件来源的实际原作链接补录。当前六类目录55个归档分页/列表、1247卡、1191个不同媒体URL；目录卡片历史状态保留，新增媒体观察独立登记，见 [第十六批机制](collectui-batch-16.md)。

2026-10-01：第十七批八件静态媒体实际原作href补录；旧目录卡catalogued-only状态保留。Command Bar15媒体与各批观察/机制映射见 [审计](../assets/studio/command-bar-audit.json)；全站其余清单继续待办。

2026-10-01：补录Product Tour 14卡/13媒体、AI Agents 21卡/20媒体的实际单列表，未显示分页控件。本地p1不是源分页；原目录状态保持catalogued-only。具体范围见 [第十八批](collectui-batch-18.md)。

2026-10-01：新增UI Tips两页33卡/33媒体与Dashboard四页96卡/96媒体；实际Next逐页浏览并确认末页禁用，每页双DOM集合一致，目录状态保持catalogued-only。见 [第十九批](collectui-batch-19.md)。


## 2026-10-01 第二十批目录快照

实际双DOM读取Menu四页24+24+24+7卡、Hover State三页24+24+3卡、Orb两页24+2卡，末页Next禁用；File Tree实际单列表15卡，没有源分页控件，归档p1不是网站第1页。保留作者资料链接、完整媒体URL、可见标签、实际图片alt和卡片顺序；未展开的隐藏标签不补造。四类目录状态保持catalogued-only。

十四类合计73个归档分页/列表、1582卡、1375个不同完整媒体URL，207次重复、176组跨类媒体，52组关联既有实际观察。另145类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [第二十批](collectui-batch-20.md)。媒体观察独立登记，已有目录历史状态不被改写为已观看或已实现。


## 2026-10-01 第二十一批六类目录快照

Tabs：3个归档分页/列表，实际卡数24+24+7=55，54个不同完整媒体URL；Dropdown：4个归档分页/列表，实际卡数24+24+24+10=82，82个不同完整媒体URL；Navigation：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL；Mobile App：5个归档分页/列表，实际卡数24+24+24+24+10=106，106个不同完整媒体URL；Code Editor：1个归档分页/列表，实际卡数5=5，5个不同完整媒体URL；Mac App：2个归档分页/列表，实际卡数24+22=46，46个不同完整媒体URL。有源分页者实际完整集合双读一致且末页Next禁用。Code Editor为无源分页控件的完整单列表，p1仅归档编号。Tabs不同卡片共享媒体的合法重复保留。Dropdown旧raw第4页实际重复第3页集合，仅保留纠错历史；统计只接受另存corrected集合，保留旧弹层异常及新Next/实际Page按钮导航记录。Navigation/Mobile App的即时旧集合只保留拒绝证据，不计入accepted集合。实际翻译标签与原始href保留，exact-href推导英文分类名单独记录，未展开隐藏标签不补造。这六类快照均保持catalogued-only，不因清点而声明观看或实现。

二十类合计90个归档分页/列表、1902卡、1539个不同完整媒体URL；363次重复、300组跨类媒体、55组关联已有实际观察。唯一URL媒体类型为1321视频/218图片。另139类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [第二十一批](collectui-batch-21.md)。卡片历史catalogued-only/not-observed状态保留，当前真实来源观察由coverage另行关联，清点不会升级媒体或分类完成状态。


## 2026-10-01 第二十二批两类目录快照

Search：1个归档分页/列表，实际卡数21=21，21个不同完整媒体URL；Notification：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL。Search为无源分页控件的完整单列表，p1仅归档编号；21卡/21个不同完整媒体URL。Notification实际两页24+2=26卡/26个不同完整媒体URL，活动页与完整集合双读一致，末页Next禁用。实际翻译标签与原始href保留，exact-href推导英文分类名单独记录，未展开隐藏标签不补造。两份新快照保持catalogued-only；之前20类快照保留。目录枚举新增媒体观看0。

二十二类合计93个归档分页/列表、1949卡、1566个不同完整媒体URL；383次重复、311组跨类媒体、58组关联已有实际观察。唯一URL媒体类型为1338视频/228图片。另137类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [第二十二批](collectui-batch-22.md)。卡片历史catalogued-only/not-observed状态保留，当前真实来源观察由coverage另行关联，清点不会升级媒体或分类完成状态。


## 2026-10-01 第二十三批六类目录快照

Accordion：1个归档分页/列表，实际卡数7=7，7个不同完整媒体URL；Tooltip / Popover：2个归档分页/列表，实际卡数24+6=30，30个不同完整媒体URL；Empty States：1个归档分页/列表，实际卡数8=8，7个不同完整媒体URL；Notepad：1个归档分页/列表，实际卡数4=4，4个不同完整媒体URL；Badge：1个归档分页/列表，实际卡数6=6，6个不同完整媒体URL；Folder：2个归档分页/列表，实际卡数24+2=26，26个不同完整媒体URL。Accordion、Empty States、Notepad、Badge分别为7、8、4、6卡的完整加载列表，没有源分页；p1仅归档编号。Tooltip / Popover与Folder实际两页24+6、24+2，旧首卡脱离与活动页确认后完整双读，末Next禁用。Empty States含1个目录内重复完整URL，8卡对应7个不同完整URL。六份快照共81卡/80个不同完整URL。实际可见翻译标签、原始href、隐藏+N及实际图片alt保留，英文原名仅以完整href另字段推导。六份新快照保持catalogued-only；之前22类快照保留。目录枚举新增媒体观看0。

二十八类合计101个归档分页/列表、2030卡、1599个不同完整媒体URL；431次重复、346组跨类媒体、62组关联已有实际观察。唯一URL媒体类型为1354视频/245图片。另131类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [第二十三批](collectui-batch-23.md)。卡片历史catalogued-only/not-observed状态保留，当前真实来源观察由coverage另行关联，清点不会升级媒体或分类完成状态。


## 2026-10-01 第二十四批五类完整目录快照

Progress：1个归档分页/列表，实际卡数24=24，24个不同完整媒体URL；Switch Button：1个归档分页/列表，实际卡数16=16，16个不同完整媒体URL；Text Effect：2个归档分页/列表，实际卡数24+3=27，27个不同完整媒体URL；Terminal Aesthetic：2个归档分页/列表，实际卡数24+20=44，44个不同完整媒体URL；Progress Bar：1个归档分页/列表，实际卡数17=17，17个不同完整媒体URL。Progress、Switch Button、Progress Bar分别为24、16、17卡的完整加载列表，没有源分页；p1仅归档编号。Text Effect与Terminal Aesthetic实际两页24+3、24+20，旧首卡脱离与活动页确认后完整双读，末Next禁用。五份完整快照共128卡；原始批24的两份和批25的三份证据分别保留。Button登录受限部分清点未纳入完整目录。实际可见标签、原始href、隐藏+N及实际图片alt保留，英文原名仅以完整href另字段推导。五份新快照保持catalogued-only；之前28类快照保留。目录枚举新增媒体观看0。Text Effect首卡原作href属于既有Tech Text观察，即使早期记录缺少referenceMedia也不新增重复观察；本批使用另一实际来源。

三十三类合计108个归档分页/列表、2158卡、1676个不同完整媒体URL；482次重复、390组跨类媒体、66组关联已有实际观察。唯一URL媒体类型为1401视频/275图片。另126类目录尚未清点。目录枚举自身新增媒体观看0，不能用卡片数计算全站完成率。

见 [第二十四批](collectui-batch-24.md)。卡片历史catalogued-only/not-observed状态保留，当前真实来源观察由coverage另行关联，清点不会升级媒体或分类完成状态。
