# UI 改进需求文档

记录所有待修改的问题、根因分析与修改方案。

---

## 问题一：Header 与下方内容左右不对齐 + 底边框"超出"

### 现象
- Header 左上角标题紧贴浏览器边缘，看起来比下方时间轴内容更靠左。
- Header 底边框看起来横跨整个屏幕，而下方内容有居中容器限制，视觉上边框"超出"内容区。

### 根因
1. **padding 不一致**：Header 内层 div 只有 `px-4`，而下方每个板块（时间轴/筛选器）内部有额外的 `p-4`。导致 Header 内容左边缘 = 容器左 + 16px，板块内容左边缘 = 容器左 + 16px + 16px = 32px，视觉上一定不对齐。
2. **边框位置错误**：`border-b` 加在 `<header>` 外层标签上（全屏宽），但内容约束 `max-w-7xl mx-auto` 加在内层 div 上。所以边框宽度 > 内容宽度，视觉上"超出"。

### 修改方案
- **方案 A（推荐）**：把 `border-b` 从 `<header>` 移到内层 `max-w-7xl` 的 div 上。这样边框左右边缘和内容区完全重合。
- 同时让 Header 和下方板块保持一致的左右内边距。最简单的方式是：Header 内层也加 `px-4`（已有），下方板块把 `p-4` 的内容区改为和 Header 对齐，或者给 Header 加一个和内容板块等宽的视觉容器。

### 涉及文件
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`（可能需要调整板块 padding）

### 注意事项
- Header 是 `sticky top-0`，改动时不要破坏吸顶效果。
- 改完后要检查不同屏幕宽度下的对齐情况。

---

## 问题二：表格区域（PapersTable）太宽

### 现象
- 论文表格区域在宽屏幕上拉伸得很开，右侧表头按钮（Copy Page / Copy All）离左侧标题很远。
- 用户感觉"右边超出中英文切换按钮的范围"。

### 根因
1. `<section>` 是 `grid` 的 `1fr` 列，在宽屏幕上几乎撑满 `max-w-7xl` 减去 sidebar 后的全部剩余空间。
2. PapersTable 表头使用 `flex justify-between`，强制左右两端对齐，进一步拉大了视觉宽度。
3. 没有额外的 `max-w` 约束，表格可以无限拉伸。

### 修改方案
- 给右侧 `<section>` 或 PapersTable 外层加一个 `max-w` 约束，例如 `max-w-5xl`（约 1024px）或 `max-w-6xl`（约 1152px）。
- 同时把表头从 `flex justify-between` 改为 `flex items-center gap-4`，让按钮组跟在标题后面，而不是强制贴到最右。

### 涉及文件
- `src/App.tsx`（section 的 className）
- `src/components/features/PapersTable.tsx`（表头布局）

### 注意事项
- max-w 的值需要在浏览器里实测确定，不同屏幕下效果不同。
- 改了 max-w 后，Pagination 组件的宽度会跟着变，需要确保分页按钮仍然正常显示。

---

## 问题三：时间轴应放在筛选器下方

### 现象
- 当前 sidebar 里 Timeline 在最上面，FieldFilter 和 YearStepper 在下面。
- 用户希望时间轴放在筛选器下面。

### 根因
- `Sidebar.tsx` 里 Timeline 的 `div` 写在 FieldFilter 之前，顺序问题。

### 修改方案
- 在 `Sidebar.tsx` 里把两个 `div` 块交换顺序即可。

### 涉及文件
- `src/components/layout/Sidebar.tsx`

### 注意事项
- 纯结构调整，零风险。

---

## 问题四：会议和年份列固定宽度 + 左对齐

### 现象
- 会议标签（如 "NIPS" / "CVPR" / "ICCV"）长度不一，年份数字虽然用了 `tabular-nums`，但因为没有固定列宽，不同行之间视觉上对不齐。

### 根因
- 会议和年份都使用 `inline-flex` 且无固定宽度，内容多长，标签就多宽。

### 修改方案
- 给会议标签列加固定宽度，例如 `w-16`（约 64px，最长会议名 "NeurIPS" 7 个字符），并左对齐。
- 给年份标签列加固定宽度，例如 `w-12`（约 48px，4 位数字足够），并左对齐。
- 两个标签都从 `inline-flex` 改为块级或固定 flex-basis，保证每行视觉对齐。

### 涉及文件
- `src/components/features/PapersTable.tsx`

### 注意事项
- 暗色模式下颜色类也要保留（`dark:bg-xxx dark:text-xxx`）。
- 固定宽度后，如果未来加入更长名字的会议，可能需要调整宽度值。

---

## 问题五：点击标题复制（去掉右侧 Copy 按钮）

### 现象
- 当前每行右侧有一个 hover 才显示的 Copy 图标按钮，点击只复制标题文本。
- 用户希望：去掉右侧按钮，点击标题本身就能复制；复制内容包含会议名、年份、标题，格式如 `NeurIPS 2024 Attention Is All You Need`。

### 根因
- 交互设计不符合用户习惯，复制内容格式也不对。

### 修改方案
1. 去掉每行右侧的 `Copy` / `Check` 按钮及相关的 `copiedIndex` state。
2. 给标题 `<span>` 加 `onClick` 事件，点击时复制 `${conf} ${year} ${title}`。
3. Toast 提示文案改为类似 "已复制" 或 "Copied NeurIPS 2024 ..."。
4. 给标题加 `cursor-pointer` 和 hover 效果，让用户知道可以点击。

### 涉及文件
- `src/components/features/PapersTable.tsx`

### 注意事项
- 标题如果很长被 `truncate`，点击区域仍然是整个标题 span，没问题。
- 需要确保 MathJax 去掉后，标题是纯文本，onClick 事件能正常绑定。

---

## 问题六：去掉 MathJax，纯文本渲染标题

### 现象
- 部分论文标题包含 LaTeX 公式（如 `$x^2$`、`$\ell_0$`），当前用 `better-react-mathjax` 渲染。
- MathJax 会接管整个标题的 DOM，导致后续搜索高亮无法直接在 React 层面操作 DOM。

### 根因
- `better-react-mathjax` 把 `$...$` 包裹的内容转换成 SVG 图形，React 后续无法插入高亮标签。
- 数据预处理脚本 `clean-title.ts` 已经做了部分 LaTeX 清理（如 `\beta` → `β`），但不彻底，仍有大量标题保留 `$` 符号。

### 修改方案
1. **修改 `scripts/clean-title.ts`**：把下标/上标扁平化，去掉所有 `$` 符号。
   - `$x^2$` → `x2`
   - `$y_{ij}$` → `yij`
   - `$\ell_0$` → `l0`（或保留 Unicode ℓ0，但去掉 `$`）
   - 所有未被 `LATEX_UNICODE` 映射的 `\command` 直接保留命令名或简化。
2. **重新运行 `npm run gen:data`**，生成新的无 `$` 符号的数据文件。
3. **移除 `better-react-mathjax` 依赖**：从 `package.json` 删除，从 `src/main.tsx` 移除 `<MathJaxContext>` 包裹，从 `PapersTable.tsx` 移除 `MathJax` 组件引用和 `hasMath` 判断逻辑。
4. **所有标题统一按纯文本渲染**。

### 涉及文件
- `scripts/clean-title.ts`
- `src/main.tsx`
- `src/components/features/PapersTable.tsx`
- `package.json` / `package-lock.json`（可选，可以保留依赖暂不删，只是不用）

### 注意事项
- 扁平化后公式可读性会下降（如 `$x^2$` 变成 `x2`），但这是用户明确接受的选择。
- 重新生成数据后需要重新构建部署，CI 会自动处理。
- **此改动必须在"搜索高亮"之前完成**，否则高亮逻辑无法实施。

---

## 问题七：搜索关键词高亮

### 现象
- 用户输入关键词搜索后，论文标题中匹配的词没有视觉突出显示。

### 根因
- `PapersTable` 组件不知道用户当前搜了什么，`searchTrigger` 只存在于 `App.tsx` 中，没有向下传递。
- 之前因为有 MathJax，即使传递了关键词也无法高亮。去掉 MathJax 后，技术上已无障碍。

### 修改方案
1. **App.tsx**：把 `searchTrigger` 作为 prop 传给 `PapersTable`。
2. **PapersTable.tsx**：
   - 接收 `searchTrigger` prop。
   - 将关键词按空格拆分为多个词（如 `"cross view"` → `["cross", "view"]`）。
   - 对标题中的每个匹配词，用带背景色的 `<span>` 包裹，例如 `className="bg-yellow-200 dark:bg-yellow-900"`。
   - 使用正则匹配，忽略大小写。注意转义特殊字符。
3. **边界情况**：
   - 如果 `searchTrigger` 为空，不渲染任何高亮，直接显示原文。
   - 如果标题中一个词被多个搜索词同时匹配，只需要高亮一次。

### 涉及文件
- `src/App.tsx`（传 prop）
- `src/components/features/PapersTable.tsx`（高亮逻辑）

### 注意事项
- 拆分关键词时，连续空格要去重，空字符串要过滤。
- 高亮颜色要同时支持 light/dark 模式。
- 正则转义：如果用户搜了 `.*` 之类带特殊含义的字符，要用 `escapeRegExp` 转义。

---

## 执行顺序建议

按依赖关系和改动复杂度排序：

1. **问题六（去掉 MathJax）**：必须先做，否则问题七无法实现；同时会影响问题五的点击复制。
2. **问题三（时间轴位置）**：零风险，随时可做。
3. **问题一（Header 对齐）** + **问题二（表格宽度）**：都是布局层面，可以一起做，需要浏览器实测。
4. **问题四（列对齐）**：纯 CSS，简单。
5. **问题五（点击复制）**：依赖问题六完成（去掉 MathJax 和右侧按钮）。
6. **问题七（搜索高亮）**：依赖问题六完成，且是最后一个功能增强。

---

## 汇总修改文件清单

| 文件 | 涉及问题 |
|---|---|
| `scripts/clean-title.ts` | 问题六 |
| `src/main.tsx` | 问题六 |
| `src/components/layout/Header.tsx` | 问题一 |
| `src/components/layout/Sidebar.tsx` | 问题三 |
| `src/App.tsx` | 问题二、问题七 |
| `src/components/features/PapersTable.tsx` | 问题二、问题四、问题五、问题六、问题七 |

---

*文档版本：2026-05-17*
