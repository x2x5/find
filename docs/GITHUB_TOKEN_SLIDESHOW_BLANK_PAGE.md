# GitHub Token 说明页第二页空白问题

## 错误表现

页面：`/find/github-token.html`

在桌面端访问页面后：

- 第 1 页显示正常。
- 从第 2 页开始，卡片主体区域显示为空白。
- 底部指示器、右上角页码、左右按钮、返回设置等外围控件仍然正常显示。
- 点击右侧翻页按钮后，页码会变化，但主体卡片仍然空白。
- 键盘右箭头看起来没有效果，实际是状态可能已经更新，但内容没有出现在可视区域。

## 错误原因

这个页面是静态 HTML 文件：`public/github-token.html`。

旧实现把所有 `.slide` 放在一条横向 `.track` 里，然后通过下面的逻辑移动整条轨道：

```js
track.style.transform = `translateX(-${current * width}px)`;
```

它隐含依赖两个前提：

- 每一页 slide 的实际宽度都严格等于可视容器宽度。
- `current * width` 刚好等于当前页在 track 内的真实位置。

这两个前提在实际布局中不稳定。页面中有 `border`、`padding`、`gap`、`overflow`、`flex`、`border-radius` 等组合样式，一旦 slide 的真实 offset 和 JS 计算值不一致，轨道就会被移动到两页之间或内容之外的位置。

所以本质问题不是：

- 幻灯片内容缺失。
- 翻页按钮没有绑定。
- 键盘事件没有触发。
- 指示器状态错误。

本质问题是：翻页状态已经更新，但用于呈现内容的横向位移算法把主体内容移出了可视区域。

## 解决方案

把桌面端轮播从“移动整条横向 track”改为“同一舞台内叠放 slides，只显示 active slide”。

核心变化：

- `.track` 改成 `position: relative` 的固定舞台。
- `.slide` 改成 `position: absolute; inset: 0`，所有页面叠放在同一个可视区域。
- 当前页通过 `.slide.active` 显示。
- 非当前页透明、不可点击，并设置 `aria-hidden="true"`。
- `updateTrackPosition()` 不再计算横向位移，只清空 transform。

这种做法消除了对 slide 宽度和 offset 计算的依赖。翻页只切换 active 状态，不再把整条内容轨道移动到错误位置。

## 验证方式

修复后需要检查：

- 刷新 `/find/github-token.html`，第 1 页正常显示。
- 点击右侧 `›` 后，第 2 页正常显示主体内容。
- 按键盘 `→` 后，可以继续切到第 3 页。
- 底部指示器、页码、首尾按钮状态同步变化。
- 运行构建检查：

```bash
npm run build
```

## 修改文件

- `public/github-token.html`

