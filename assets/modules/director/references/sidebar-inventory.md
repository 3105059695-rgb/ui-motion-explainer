# Sidebar 目录快照

2026-10-01（Asia/Shanghai）实际清点 [Collect UI Sidebar 分类](httpLOCAL_ASSET_NOT_DISTRIBUTED)的全部可见分页。数据见 [Sidebar 目录 JSON](../assets/studio/inventories/sidebar-20261001.json)，整体登记与状态口径见 [作品目录说明](work-inventory.md)。

本次逐次使用网站 Next 控件遍历5页，实际卡数为 **24 / 24 / 24 / 24 / 15**，合计111卡、111个不同的完整媒体URL，重复0。按媒体扩展名分类为50个 `video`、61个 `image`；这只是媒体类型统计，不表示视频已经观看。末页实际选中5，Next为 `disabled`。每页确认卡片集合更新并两次读取稳定后保存，切页中“页码已变、卡片仍旧”的4次过渡未计入目录。

使用 `entries` 按页码和卡序选择参考，读取实际媒体URL、作者/归属链接、图片alt标题或 `null`、可见标签与隐藏标签数量；`mediaGroups` 仅按完整媒体URL精确分组。`listingSnapshots` 保存真实URL、选中页、分页状态、卡片数量与集合签名，便于复核快照边界。网站内部分页保持同一分类URL。

可见标签保留Edge实际翻译后的DOM文字，不倒推未见的英文标签或隐藏标签。此次未打开原卡弹层，所有 `originalWorkUrl` 保持 `null`；作者profile、外部归属链接和媒体ID不能用于推造原作地址。

目录清点不等于原作观察或预设实现。全部快照条目保持 `catalogued-only` / `not-observed`，`presetIds` 为空；后续实际观察与重建应另行登记。这份快照仅覆盖当时Sidebar分类可见的5页，不代表全站清点完成，也不保证网站后续增删或排序仍相同。
