# 年份步进器减号按钮失效问题

## 错误现象

年份步进器的 `−` 按钮点击后年份不变，显示值不更新。

## 根本原因

`rebuildYearSliderModel()` 中通过 `collectAvailableYears()` 获取可选年份列表，该函数仅从 `<select>` 的 `<option>` 中读取已有年份。初始时 `<select>` 被设为空（`<option>` 从 HTML 中移除），经过 `setRecentThreeYears()` 后只添加了 `2025` 和 `2026` 两个年份。因此 `availableYears` 只有 `[2025, 2026]`，后续 `normalizeYearSelectOptions` 重建选项时也只保留这两个年份。

点击 `−` 按钮时，`val = 2025 - 1 = 2024`，但 `<select>` 中没有 `2024` 的 `<option>`，虽然代码会动态创建 `<option>`，但 `validateYearRange()` 没有触发重建，而后续点击操作依赖的选项范围仍然受限。

## 修复方案

在 `rebuildYearSliderModel()` 中，获取 `collectAvailableYears()` 的年份列表后，补充完整范围（从最小年份到当前年份），确保全部年份的 `<option>` 都存在。
