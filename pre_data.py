import json
import os
import datetime

DOCS_DIR = 'docs'
DATA_DIR = os.path.join(DOCS_DIR, 'data')

# Create site directory if it doesn't exist
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# 清理旧的数据文件，避免遗留
for filename in os.listdir(DATA_DIR):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.isfile(file_path):
        os.remove(file_path)

# 移除 legacy 数据（如果存在）
legacy_papers_path = os.path.join(DOCS_DIR, 'papers.json')
if os.path.exists(legacy_papers_path):
    os.remove(legacy_papers_path)

manifest = {
    "version": 1,
    "generated_at": datetime.datetime.utcnow().isoformat() + 'Z',
    "conferences": {}
}

papers_dir = "./papers"

def read_conference_papers(conf_name: str, conf_path: str):
    entries = []
    for year_file in os.listdir(conf_path):
        if not year_file.endswith('.txt'):
            continue
        year = year_file.replace('.txt', '')
        with open(os.path.join(conf_path, year_file), 'r', encoding='utf-8') as f:
            for line in f:
                title = line.strip()
                if not title:
                    continue
                entries.append({"y": year, "t": title})
    # 按年份倒序、标题正序排序，方便前端分页
    entries.sort(key=lambda item: (-int(item["y"]), item["t"]))
    return entries

# 生成按会议拆分的数据文件
if os.path.exists(papers_dir) and os.path.isdir(papers_dir):
    for conf_dir in sorted(os.listdir(papers_dir)):
        conf_path = os.path.join(papers_dir, conf_dir)

        if not os.path.isdir(conf_path):
            continue

        papers = read_conference_papers(conf_dir, conf_path)
        if not papers:
            continue

        output_path = os.path.join(DATA_DIR, f"{conf_dir}.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                "conference": conf_dir,
                "papers": papers
            }, f, separators=(',', ':'))

        manifest["conferences"][conf_dir] = {
            "file": f"data/{conf_dir}.json",
            "count": len(papers)
        }

# 写入 manifest
manifest_path = os.path.join(DATA_DIR, 'manifest.json')
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, separators=(',', ':'))

# 创建conferences.json文件，用于静态网站的会议和年份数据
# 定义会议分类到不同领域
CONFERENCE_CATEGORIES = {
    "CV": ["cvpr", "eccv", "iccv"],
    "AI": ["aaai", "ijcai", "mm", "acmmm"],
    "ML": ["nips", "icml", "iclr"]
}

# 其他会议分类到Other类别
OTHER_CONFERENCES = ["wacv", "siggraph", "siggraphasia", "emnlp", "aistats", "corl", "colm", "www"]

conferences = {}

# 获取所有会议及其年份
if os.path.exists(papers_dir) and os.path.isdir(papers_dir):
    for conf_dir in os.listdir(papers_dir):
        conf_path = os.path.join(papers_dir, conf_dir)
        
        # 确保是目录而不是文件
        if not os.path.isdir(conf_path):
            continue
            
        years = []
        for year_file in os.listdir(conf_path):
            if year_file.endswith(".txt"):
                year = year_file.replace(".txt", "")
                years.append(year)
        
        # 按年份排序
        years.sort(reverse=True)
        
        if years:  # 只添加有论文的会议
            conferences[conf_dir] = years

# 将会议分到各个领域
categorized_conferences = {}

for field, confs in CONFERENCE_CATEGORIES.items():
    field_confs = {}
    for conf in confs:
        if conf in conferences:
            field_confs[conf] = conferences.pop(conf, [])
    
    if field_confs:  # 只添加有会议的领域
        categorized_conferences[field] = field_confs

# 处理其他未分类会议
other_confs = {}
for conf in OTHER_CONFERENCES:
    if conf in conferences:
        other_confs[conf] = conferences.pop(conf, [])

# 将剩余会议添加到其他类别
for conf, years in conferences.items():
    other_confs[conf] = years

if other_confs:
    categorized_conferences["Other"] = other_confs

# 获取当前年份计算最近5年
current_year = datetime.datetime.now().year
recent_years = [str(year) for year in range(current_year-4, current_year+1)]

# 写入conferences.json文件
with open('docs/conferences.json', 'w') as f:
    json.dump({
        "categories": categorized_conferences,
        "recent_years": recent_years
    }, f)

print("Deployment script completed successfully!") 