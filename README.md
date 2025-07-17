# Top AI Papers - 顶级AI论文检索系统

Top AI Papers 是一个专门用于检索和浏览顶级AI会议论文的Web应用程序。该系统收录了来自CVPR、ICCV、ECCV、NeurIPS、ICML、ICLR、AAAI、IJCAI等知名会议的论文标题，并提供了直观的检索和浏览界面。

## ✨ 主要特性

### 🏛️ 广泛的会议覆盖
- **计算机视觉 (CV)**: CVPR, ICCV, ECCV
- **机器学习 (ML)**: NeurIPS, ICML, ICLR  
- **人工智能 (AI)**: AAAI, IJCAI, ACM MM
- **其他领域**: WACV, SIGGRAPH, EMNLP, CoRL, WWW等

### 📅 历史数据丰富
- 收录从2013年至2025年的论文数据
- 总计包含数万篇论文标题
- 持续更新最新会议论文

### 🔍 强大的检索功能
- **实时搜索**: 支持论文标题的实时模糊搜索
- **多维筛选**: 按会议、年份、领域进行筛选
- **高级过滤**: 支持多条件组合筛选

### 🎨 现代化界面
- **响应式设计**: 完美适配桌面端和移动端
- **双视图模式**: 支持网格视图和列表视图切换
- **夜间模式**: 护眼的深色主题
- **无限滚动**: 流畅的论文浏览体验

### 📱 用户体验优化
- **一键复制**: 快速复制论文标题
- **统计信息**: 实时显示搜索结果统计
- **加载优化**: 分页加载，提升性能
- **快捷操作**: 键盘快捷键支持

## 🛠️ 技术架构

### 前端技术栈
- **HTML5**: 语义化标记结构
- **CSS3**: 现代化样式设计和响应式布局
- **JavaScript (ES6+)**: 交互逻辑和数据处理
- **Font Awesome**: 图标库

### 数据处理
- **Python**: 数据预处理脚本
- **JSON**: 数据存储格式
- **文本处理**: 论文标题标准化和索引

### 部署方式
- **静态网站**: 纯前端实现，无需后端服务器
- **GitHub Pages**: 支持免费托管

## 📁 项目结构

```
top/
├── README.md                 # 项目说明文档
├── pre_data.py              # 数据预处理脚本
├── papers/                  # 论文数据目录
│   ├── cvpr/               # CVPR会议论文
│   │   ├── 2024.txt
│   │   ├── 2023.txt
│   │   └── ...
│   ├── iccv/               # ICCV会议论文
│   ├── eccv/               # ECCV会议论文
│   ├── nips/               # NeurIPS会议论文
│   └── ...                 # 其他会议
└── docs/                   # 网站文件
    ├── index.html          # 主页面
    ├── papers.json         # 论文数据JSON
    ├── conferences.json    # 会议配置JSON
    ├── css/               # 样式文件
    └── js/                # JavaScript文件
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd top
```

### 2. 数据预处理
```bash
python pre_data.py
```

### 3. 启动本地服务器
```bash
# 使用Python内置服务器
cd docs
python -m http.server 8000
```

### 4. 访问应用
打开浏览器访问 `http://localhost:8000`


## 📞 联系我们

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件反馈
- 参与社区讨论

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！ 