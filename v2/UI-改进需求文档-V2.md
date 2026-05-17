# UI 改进需求文档 V2

记录第二批待修改问题的根因分析与修改方案。

---

## 问题一：Sidebar 宽度太窄

### 现象
- 左侧过滤器板块宽度不足，英文版 "Artificial Intelligence" 文字太长导致换行。
- 用户希望 sidebar 加宽，同时论文表格不变或适当变窄。

### 根因
- 当前 CSS Grid 定义为 `lg:grid-cols-[240px_1fr]`，sidebar 固定 240px。
- `240px` 不够宽，板块内部有 `p-4`（左右各16px），实际内容区只有 208px。
- "Artificial Intelligence" 约 20 个字符，12px 字体每字符约 6px，需要约 120px + 16px padding = 至少 250px 总宽才能不换行。

### 修改方案
- 把 grid 调整为 `lg:grid-cols-[280px_1fr]` 或 `lg:grid-cols-[300px_1fr]`，sidebar 加宽 40-60px。
- 或者 sidebar 用 `min-w-[280px]` 确保不会收窄。

### 涉及文件
- `src/App.tsx`（main 的 grid 列定义）

### 注意事项
- sidebar 加宽后，右侧表格区域（section）可用宽度自然减少，表格右边会自动收进来。
- 需要在浏览器里实测 280px 是否足够放 "Artificial Intelligence"（含 padding 和 checkbox 的空间）。

---

## 问题二：默认年份应为今年和去年

### 现象
- 默认年份范围是 `[2024, 2025]`，但今年是 2026，用户希望默认显示 `[2025, 2026]`。

### 根因
- `App.tsx` 中 `yearRange` 初始状态硬编码为 `[2024, 2025]`，没有使用动态年份。

### 修改方案
- 改为动态计算：`const currentYear = new Date().getFullYear();`，初始值设为 `[currentYear - 1, currentYear]`。
- 这样每年自动更新，不需要手动修改代码。

### 涉及文件
- `src/App.tsx`（useState 的初始值）

### 注意事项
- 同时影响总论文数（当前只显示 2 年的数据，用户看到的是 ~33k 而不是 ~106k）。
- 改年份后还需要配合修改默认选中的会议（见下文问题四）。

---

## 问题三：年份选择器移到过滤器上方 + 标题改为"领域"

### 现象
- 当前年份选择器在 FieldFilter 下方。
- 标题目前叫 "Filters"，用户希望改为 "领域"/"Field"。
- 年份选择器应放在领域选择器上方。

### 根因
- `Sidebar.tsx` 中 FieldFilter 写在 YearStepper 前面。
- `i18n` 中 key 为 `sidebar.filters`，对应的值为 "筛选" / "Filters"。

### 修改方案
1. 在 `Sidebar.tsx` 中把 YearStepper 放在 FieldFilter 前面。
2. 修改 `i18n/en.ts` 和 `i18n/zh.ts`：把 `sidebar.filters` 改为 `sidebar.field` 或新增一个 key，英文值改为 "Field"，中文值改为 "领域"。
3. 需要新增一个翻译 key（或者直接复用 `sidebar.filters` 但改内容，因为其他地方没有再用这个 key 做别的用途）。

### 涉及文件
- `src/components/layout/Sidebar.tsx`
- `src/i18n/en.ts`
- `src/i18n/zh.ts`

### 注意事项
- 改后要同时更新英文和中文翻译。

---

## 问题四：默认选中的会议应包含全部

### 现象
- 用户看到 33,096 篇论文，但预期是 ~106k。
- 差异原因是默认只选了 6 个会议、2 年数据。

### 根因
- `App.tsx` 中 `selectedConfs` 默认只选中了 6 个会议（缺少 `aaai`、`ijcai`、`mm`）。
- `yearRange` 默认 `[2024, 2025]`（不是今年/去年）。
- 从 9 个会议 × 多年数据（约 106k）→ 6 个会议 × 2 年（约 33k），差异合理。

### 修改方案
- **方案 A**：把 `selectedConfs` 默认改为全部 9 个会议（加上 `aaai`、`ijcai`、`mm`）。
- **方案 B**：不硬编码，从 manifest 动态获取所有可用会议，默认全选。
- 推荐方案 B，因为 manifest 会动态变更，但方案 A 更简单。

### 涉及文件
- `src/App.tsx`

### 注意事项
- 全选后首屏加载的数据量会增大，因为需要 fetch 更多 JSON 文件。
- 但数据是按需加载的，用户会看到 loading 状态，体验尚可。

---

## 问题五：搜索结果数字应居中显示

### 现象
- "759 results (showing 1-50)" 当前在表格标题行的右侧。
- 用户希望"中文"：居中对齐于表格标题行。

### 根因
- 表头使用 `flex items-center gap-4`，标题最左，结果数字在右侧按钮组中。
- 没有居中元素。

### 修改方案
- 表头改为三列布局：左侧标题 / 居中结果数字 / 右侧按钮组。
- 使用 flex 的 `flex: 1` 均分或使用 grid 布局。
- 或者把结果数字放在标题下方或独立一行。

### 涉及文件
- `src/components/features/PapersTable.tsx`

### 注意事项
- 需要确保在窄屏下不出现重叠。

---

## 问题六：Copy 按钮右侧放置

### 现象
- 当前 Copy Page 和 Copy All 按纽在标题行的最右侧。
- 用户最终决定：Copy Page 放左边，Copy All 放最右边。

### 修改方案
- 表头改为：左侧「标题 + Copy Page + 居中结果数」/ 右侧「Copy All」。

### 涉及文件
- `src/components/features/PapersTable.tsx`

---

## 问题七：领域显示顺序调整

### 现象
- 当前 `FieldFilter.tsx` 中 `FIELDS` 定义为 `['CV', 'AI', 'ML']`。
- 用户希望顺序为：机器学习(ML) → 计算机视觉(CV) → 人工智能(AI)。

### 根因
- `FieldFilter.tsx` 第13行：`const FIELDS = ['CV', 'AI', 'ML'] as const;`。
- 渲染时按这个数组顺序展示。

### 修改方案
- 改为 `const FIELDS = ['ML', 'CV', 'AI'] as const;`。
- 同时需要调整 `confsByField` 的构建顺序，或者直接渲染时按 FIELDS 顺序遍历（已经是这么做的）。

### 涉及文件
- `src/components/features/FieldFilter.tsx`

### 注意事项
- 文件夹展开状态 `expanded` 的默认值也要对应改为 `new Set(['ML', 'CV', 'AI'])`。

---

## 问题八：表格右边边缘仍不固定

### 现象
- 搜索不同关键词时，论文标题长度不同，表格右边边缘位置不固定，长标题时右边缘"飘出去"。

### 根因（可能性分析）

当前布局：
```
<main max-w-7xl mx-auto px-4>
  <section max-w-5xl>  ← 限制最大 1024px
    <PapersTable w-full>  ← 填满 section
```

**可能原因 1**：section 的 `max-w-5xl` 在 Grid 布局中受 `1fr` 影响。当 sidebar 240px + gap 24px + section 不超过 1024px 时，section 宽度由剩余空间决定，不是固定值。

**可能原因 2**：`truncate` 在 flex-1 的 span 上可能不生效，如果 flex 容器宽度受内容影响而扩展。

**可能原因 3**：浏览器窗口宽度变化时，section 宽度跟随变化。

### 修改方案
- **方案 A**：给 `<main>` 加一个固定宽度的 `min-width`，或者把 grid 改成更严格的控制。
- **方案 B**：在 `<section>` 上使用 `min-width: 0` 防止 Grid 子元素溢出，同时改用 `width: 1024px` 固定宽度。
- **方案 C**：给 PapersTable 加 `min-w-[960px] max-w-[960px]`，强制固定宽度。但窄屏可能溢出。

### 涉及文件
- `src/App.tsx`
- `src/components/features/PapersTable.tsx`

### 注意事项
- 需要浏览器实测确定 Root Cause 是哪一个。
- 固定宽度后要测试手机/窄屏下的表现。

---

## 问题九：Header 左右边缘对齐

### 现象
- Header 背景（白色）占据全屏宽度，没有明确的左边缘和右边缘。
- 用户希望 Header 左边缘对齐过滤器的左边缘，右边缘对齐论文表格的右边缘。

### 根因
- `<header>` 标签是 block 元素，默认 100% 宽度。
- 虽然内层 div 有 `max-w-7xl mx-auto` 居中，但外层 `<header>` 的背景延伸到了全屏，显得无边。
- `<main>` 也是 `max-w-7xl mx-auto`，但内层有 grid，内容区域实际宽度 = sidebar(280px 调整后) + gap + section。
- Header 的内层 div 也是 `max-w-7xl`，但由于有 `px-8`，内容区宽度 = 1280 - 64 = 1216px。
- Main 的 `px-4`，内容区宽度 = 1280 - 32 = 1248px，但 grid 把 1248px 分给 sidebar + gap + section。

### 修改方案
- **方案 A**：把 `<header>` 的背景色和 sticky 也移到内层 div，让整个 header 视觉上居中。
  ```tsx
  <header className="sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-8 py-3 flex ... bg-white dark:bg-zinc-900 border-b ...">
  ```
- **方案 B**：让 `<header>` 的背景填满，不修改。而是确保内层内容对齐即可（实际上已经基本对齐了）。

### 涉及文件
- `src/components/layout/Header.tsx`

### 注意事项
- `sticky` 必须留在外层 `<header>` 才有效。
- 如果背景移到内层 div，在页面滚动时，内容区外的空白部分会透出 body 的背景色，可能出现视觉断节。

---

## 执行顺序建议

| 优先级 | 问题 | 改动量 | 说明 |
|---|---|---|---|
| 1 | 问题二（默认年份动态化） | 1 行 | 最简单，先改 |
| 2 | 问题四（默认全选会议） | 1 行 | 和年份一起影响总论文数 |
| 3 | 问题七（领域顺序） | 1 行 | 纯顺序调整 |
| 4 | 问题一（sidebar 加宽） | 1 行 | App.tsx 改 grid 列宽 |
| 5 | 问题三（年份放上面 + 改标题） | 2-3 个文件 | 结构调整 |
| 6 | 问题九（Header 对齐） | 1 个文件 | CSS 调整 |
| 7 | 问题八（表格右边缘固定） | 1 个文件 | 需要浏览器实测 |
| 8 | 问题六（Copy 按钮布局） | 1 个文件 | 表头布局调整 |
| 9 | 问题五（结果数居中） | 1 个文件 | 表头布局调整 |

---

## 汇总修改文件清单

| 文件 | 涉及问题 |
|---|---|
| `src/App.tsx` | 问题一、二、四、八 |
| `src/components/layout/Header.tsx` | 问题九 |
| `src/components/layout/Sidebar.tsx` | 问题三 |
| `src/components/features/FieldFilter.tsx` | 问题七 |
| `src/components/features/PapersTable.tsx` | 问题五、六、八 |
| `src/i18n/en.ts` | 问题三 |
| `src/i18n/zh.ts` | 问题三 |

---

*文档版本：2026-05-17*
