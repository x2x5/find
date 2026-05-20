# 幻灯片模板使用说明

模板位置：`public/slide-template.html`  
用法：复制该文件，替换幻灯片内容即可。

---

## 快速开始

```bash
cp public/slide-template.html public/my-page.html
# 编辑 my-page.html，替换幻灯片内容
```

---

## 文件结构

```
<div class="main-area">          ← 全屏容器，flex 撑满
  <div id="stage">               ← 导航按钮 + 幻灯片容器
    « ‹  › »                    ← 首/上一页 / 下一页/末按钮
    <div class="track-wrap">     ← 幻灯片轨道容器
      <div class="page-num">     ← 右上角页码指示器（仅滑动时显示）
      <div class="track">        ← 幻灯片列表（flex 横向排列）
        <div class="slide">      ← 单张幻灯片
          .slide-left            ← 左侧文字区
          .slide-right           ← 右侧可视化区
        </div>
        ...
      </div>
    </div>
  </div>
  <div class="bottom-bar">       ← 底部栏
    ← 返回主页                    ← 左对齐
    ● ● ● 指示器                 ← 居中
  </div>
</div>
```

---

## 添加幻灯片

每个 `.slide` 代表一页：

```html
<div class="slide" style="--t:#6366f1">
  <div class="slide-left">
    <div class="s-q what">🏷️ 标签</div>
    <div class="slide-title">标题<span class="hl">高亮</span></div>
    <div class="slide-body">
      <p>正文内容...</p>
    </div>
  </div>
  <div class="slide-right">
    <!-- 可视化内容 -->
  </div>
</div>
```

### 关键属性

| 属性 | 说明 |
|---|---|
| `--t:#色值` | 主题色，幻灯片背景和部分组件自动适配 |
| `class="slide active"` | 第一页必须加 `active` |
| `class="s-q what/why/how"` | 标签类型（what=蓝, why=粉, how=黄） |

---

## 主题色推荐

| 色值 | 感觉 | 适用场景 |
|---|---|---|
| `#6366f1` | Indigo 靛蓝 | 品牌/介绍 |
| `#8b5cf6` | Violet 紫色 | 创意/功能 |
| `#3b82f6` | Blue 蓝色 | 技术/数据 |
| `#06b6d4` | Cyan 青色 | 流程/步骤 |
| `#f43f5e` | Rose 玫红 | 提醒/倒计时 |
| `#f59e0b` | Amber 琥珀 | 警告/随机 |
| `#10b981` | Emerald 翠绿 | 安全/部署 |
| `#db2777` | Pink 粉色 | 设计/展示 |
| `#14b8a6` | Teal 青绿 | 反馈/社区 |

---

## 导航交互

| 方式 | 操作 |
|---|---|
| 鼠标点击 | ‹ › 翻页，« » 首尾 |
| 键盘 | `←` / `→` 或 `↑` / `↓` |
| 滚轮 | 上下滚动 |
| 触摸 | 左右滑动 |
| 底部指示点 | 点击跳转指定页 |

- 页码指示器（右上角）仅在滑动时显示 1.6 秒后自动隐藏
- « 按钮仅在非首页显示，» 仅在非末页显示
- ‹ › 在边界处变淡不可点

---

## 自定义 / 扩展

### 改回到主页链接

搜索 `class="back-home"` 的 `<a>` 标签，修改 `href` 属性。

### 改主题色（全局）

修改 `:root` 中的 `--accent: #6366f1` 等变量。

### 改幻灯片尺寸

调整 `#stage` 的 `padding` 和 `.slide` 的 `padding` / `gap` / `min-height`。

### 移动端适配

`@media (max-width:720px)` 中的样式专门控制手机布局。
