# Top AI Papers

中文 | [English](#english)

一个用于检索 AI 顶会论文标题的静态网页工具，支持关键词、会议、年份筛选，以及会议时间轴查看。

## 中文

### 1. 功能概览

- 关键词搜索论文标题
- 领域筛选：`ML / CV / AI / All`
- 会议筛选：`NeurIPS / ICML / ICLR / CVPR / ECCV / AAAI / IJCAI / MM ...`
- 年份区间筛选：默认“最近两年（今年+去年）”
- 会议时间轴（投稿 / 接受 / Today）
- 中英文界面切换
- 论文标题点击复制；表头可复制当前页标题

### 2. 项目结构

```text
.
├── docs/                    # 静态网站目录（部署目录）
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── conferences.json     # 会议与年份索引（由脚本生成）
│   └── data/*.json          # 各会议论文数据（由脚本生成）
├── papers/                  # 原始标题数据（按会议/年份分 txt）
└── pre_data.py              # 数据预处理脚本
```

### 3. 本地启动

```bash
cd /Users/25tian/x2x5/find
python3 pre_data.py
cd docs
python3 -m http.server 8000
```

浏览器访问：`http://localhost:8000`

### 4. 数据更新流程

当你修改或新增 `papers/<conference>/<year>.txt` 后，执行：

```bash
cd /Users/25tian/x2x5/find
python3 pre_data.py
```

然后刷新网页。

### 5. 数据格式

每个 `.txt` 文件一行一个标题，例如：

```text
Attention Is All You Need
Diffusion Models Beat GANs on Image Synthesis
```

示例路径：

- `papers/icml/2026.txt`
- `papers/cvpr/2025.txt`

### 6. 当前页面规则（便于维护）

- 年份下拉框按“新到旧”排序。
- 时间轴事件先统一按日期排序，再绘制。
- 时间轴点位按“月份区间内均匀分布”显示，避免重叠。
- 表格分页后，每页内部按“字母总数（A-Z）从少到多”排序。

### 7. 常见问题

1. 页面空白或无数据

先执行：

```bash
python3 pre_data.py
```

2. 8000 端口占用

```bash
python3 -m http.server 8080
```

访问：`http://localhost:8080`

3. GitHub Pages 发布后没更新

- 确认已提交并推送 `docs/` 下变更。
- 强制刷新浏览器缓存（`Cmd/Ctrl + Shift + R`）。

### 8. 部署

这是纯静态站点，部署 `docs/` 目录即可（GitHub Pages、Vercel、Netlify 都可）。

---

## English

A static web tool for exploring top AI conference paper titles with keyword, conference, and year filters, plus a conference timeline view.

### 1. Features

- Keyword search on paper titles
- Field filters: `ML / CV / AI / All`
- Conference filters: `NeurIPS / ICML / ICLR / CVPR / ECCV / AAAI / IJCAI / MM ...`
- Year range filtering; default is recent two years (current + previous)
- Conference timeline (`Submit / Accept / Today`)
- Chinese/English UI switch
- Click title to copy; click header to copy current-page titles

### 2. Project Layout

```text
.
├── docs/                    # Static site root (deployment target)
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── conferences.json     # Conference-year index (generated)
│   └── data/*.json          # Per-conference paper data (generated)
├── papers/                  # Raw title sources (txt by conference/year)
└── pre_data.py              # Data preprocessing script
```

### 3. Run Locally

```bash
cd /Users/25tian/x2x5/find
python3 pre_data.py
cd docs
python3 -m http.server 8000
```

Open: `http://localhost:8000`

### 4. Update Data

After editing files like `papers/<conference>/<year>.txt`, run:

```bash
cd /Users/25tian/x2x5/find
python3 pre_data.py
```

Then refresh the page.

### 5. Data Format

One paper title per line in each `.txt` file, e.g.:

```text
Attention Is All You Need
Diffusion Models Beat GANs on Image Synthesis
```

Example paths:

- `papers/icml/2026.txt`
- `papers/cvpr/2025.txt`

### 6. Current UI/Logic Rules

- Year dropdowns are sorted descending (newest to oldest).
- Timeline events are globally date-sorted before rendering.
- Timeline points are evenly distributed within month intervals to reduce overlap.
- Inside each page, table entries are sorted by total letter count (A-Z), ascending.

### 7. Troubleshooting

1. No data shown

Run:

```bash
python3 pre_data.py
```

2. Port 8000 is busy

```bash
python3 -m http.server 8080
```

Open: `http://localhost:8080`

3. GitHub Pages not updating

- Make sure changes under `docs/` are committed and pushed.
- Hard refresh the browser cache (`Cmd/Ctrl + Shift + R`).

### 8. Deployment

This is a pure static site. Deploy the `docs/` directory to GitHub Pages / Vercel / Netlify.
