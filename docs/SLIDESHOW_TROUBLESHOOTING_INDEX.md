# 幻灯片页面错误表现索引

这个文档按“看到的错误表现”反查原因和处理方案。

## `/find/github-token.html`

| 错误表现 | 可能原因 | 处理文档 |
|---|---|---|
| 第 1 页正常，从第 2 页开始主体卡片一片空白 | 横向 track 位移计算和 slide 实际位置不一致，内容被移出可视区域 | [GitHub Token 说明页第二页空白问题](./GITHUB_TOKEN_SLIDESHOW_BLANK_PAGE.md) |
| 点击右侧 `›` 后页码或指示点变化，但卡片主体仍然空白 | 翻页状态已更新，但视觉层仍停在错误的 track transform 位置 | [GitHub Token 说明页第二页空白问题](./GITHUB_TOKEN_SLIDESHOW_BLANK_PAGE.md) |
| 键盘 `→` 看起来没反应，但指示器或页码可能已经变化 | 键盘事件触发了 `go()`，但主体内容被横向位移算法移出可视区 | [GitHub Token 说明页第二页空白问题](./GITHUB_TOKEN_SLIDESHOW_BLANK_PAGE.md) |
| 返回设置、底部圆点、页码、左右按钮正常，只有卡片主体不显示 | 外围 UI 不依赖 track 位移，主体 slide 依赖错误的横向布局计算 | [GitHub Token 说明页第二页空白问题](./GITHUB_TOKEN_SLIDESHOW_BLANK_PAGE.md) |
| DOM 或辅助功能树里能读到第 2 页内容，但屏幕上看不到 | 内容存在，渲染状态存在，问题发生在视觉定位/层叠/位移 | [GitHub Token 说明页第二页空白问题](./GITHUB_TOKEN_SLIDESHOW_BLANK_PAGE.md) |

## 通用排查顺序

遇到幻灯片页面空白或翻页异常时，先按这个顺序判断：

1. 指示器、页码、按钮状态是否变化。
2. 当前页内容是否存在于 DOM 中。
3. `.slide.active` 是否切换到了正确页。
4. `.track` 或 `.slide` 是否有 `transform`、`position`、`opacity`、`z-index` 导致内容不可见。
5. 是否只有桌面端异常，而移动端纵向列表正常。

如果状态正常但视觉为空白，优先怀疑布局定位问题，而不是数据或事件绑定问题。

