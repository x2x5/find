# 实时搜索 AI 顶会论文

[English](README-en.md)

这个网站把多个 AI 顶会历年的论文标题放在一起，让你可以直接搜索关键词、筛选会议和年份，快速找到值得继续阅读的论文。

在线地址：<https://x2x5.top/find/>

## 支持的会议

- 机器学习：NeurIPS、ICML、ICLR
- 计算机视觉：CVPR、ECCV、ICCV
- 人工智能：AAAI、ACM MM、IJCAI

## 主要功能

- 按关键词、会议和年份筛选论文
- 点击标题中的单词继续搜索
- 复制论文标题
- 在 arXiv 搜索论文
- 搜索相关 GitHub 仓库
- 根据当前结果生成词云
- 查看会议投稿倒计时和时间轴
- 支持中文、英文和深色模式
- 支持桌面端和移动端

会议截止日期优先读取 [CCFDDL](https://ccfddl.com/) 的公开数据。

```bash
git clone https://github.com/x2x5/find.git
cd find
npm ci
npm run dev
```

打开终端中显示的本地地址。项目的 Vite 基础路径是 `/find/`。

## 构建

```bash
npm run build
```

构建结果位于 `dist/`。

## 更新论文数据

论文标题存放在：

```text
papers/<会议>/<年份>.txt
```

每行填写一个论文标题。例如：

```text
papers/icml/2026.txt
```

修改数据后，在项目根目录运行：

```bash
npm run gen:data
```

该命令会重新生成 `public/data/` 下的 JSON 文件和清单。

## 项目结构

```text
papers/        原始论文标题
public/data/   生成后的网页数据
scripts/       数据生成脚本
src/           React 前端代码
```

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS

## 部署

推送到 `main` 分支后，GitHub Actions 会构建项目并部署到 GitHub Pages。
