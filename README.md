# Top AI Papers

一个静态网页工具，用来按关键词、会议、年份快速筛选 AI 顶会论文标题。

## 你能用它做什么

- 按关键词搜索论文标题
- 按领域筛选（ML / CV / AI）
- 按会议筛选（如 NeurIPS、ICML、CVPR、ICLR、AAAI 等）
- 按年份区间筛选（含“近两年”快捷选项）
- 查看会议投稿/接收时间轴（用于大致规划）

## 项目结构（最常改的文件）

```text
.
├── docs/                    # 静态网站目录（直接部署这个目录即可）
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── conferences.json     # 会议与年份索引（由脚本生成）
│   └── data/*.json          # 每个会议的论文数据（由脚本生成）
├── papers/                  # 原始论文标题数据（按会议/年份分 txt）
└── pre_data.py              # 数据预处理脚本：从 papers 生成 docs/data 与 conferences.json
```

## 快速开始（本地运行）

### 1) 准备环境

- Python 3.8+（建议 3.9 及以上）

### 2) 生成前端数据

在项目根目录执行：

```bash
python3 pre_data.py
```

### 3) 启动本地预览

```bash
cd docs
python3 -m http.server 8000
```

浏览器打开：

`http://localhost:8000`

## 日常更新数据怎么做

当你新增或修改了 `papers/<conference>/<year>.txt` 里的标题后，执行：

```bash
python3 pre_data.py
```

然后刷新网页即可看到更新结果。

## 数据格式说明

每个 txt 文件一行一篇标题，例如：

```text
Attention Is All You Need
Diffusion Models Beat GANs on Image Synthesis
```

文件路径示例：

- `papers/icml/2026.txt`
- `papers/cvpr/2025.txt`

## 常见问题

### 页面打开了但没有数据

通常是 `docs/data/*.json` 没更新。先运行：

```bash
python3 pre_data.py
```

再刷新页面。

### 端口 8000 被占用

换一个端口即可：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 部署说明

这是纯静态站点，部署 `docs/` 目录即可（GitHub Pages / Vercel 静态托管都可以）。

