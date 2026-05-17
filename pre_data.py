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

# 目录名和展示名的别名映射
CONFERENCE_ALIASES = {
    "acmmm": "mm"
}

def get_conference_alias(conf_name: str) -> str:
    return CONFERENCE_ALIASES.get(conf_name, conf_name)

import re

LATEX_UNICODE = {
    'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
    'epsilon': 'ε', 'varepsilon': 'ε', 'zeta': 'ζ', 'eta': 'η',
    'theta': 'θ', 'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ',
    'mu': 'μ', 'nu': 'ν', 'xi': 'ξ', 'omicron': 'ο',
    'pi': 'π', 'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ',
    'upsilon': 'υ', 'phi': 'φ', 'chi': 'χ', 'psi': 'ψ',
    'omega': 'ω',
    'ell': 'ℓ', 'L': 'Ł', 'partial': '∂', 'infty': '∞',
    'sharp': '♯', 'neg': '¬', 'wedge': '∧', 'vee': '∨',
    'forall': '∀', 'exists': '∃', 'tau': 'τ', 'ell': 'ℓ',
}

def strip_text_braces(t: str, cmd: str) -> str:
    """Strip \cmd{...} and \cmd{...}{...}..., keeping inner content."""
    while cmd in t:
        start = t.find(cmd)
        i = start + len(cmd)
        parts = []
        while i < len(t) and t[i] == '{':
            depth = 0
            j = i
            while j < len(t):
                if t[j] == '{':
                    depth += 1
                elif t[j] == '}':
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            parts.append(t[i+1:j])
            i = j + 1
        t = t[:start] + ''.join(parts) + t[i:]
    return t

STRIP_CMDS = ['\\textbf', '\\textit', '\\texttt', '\\emph', '\\underline',
               '\\mathbf', '\\boldsymbol', '\\textrm', '\\text']

def process_math_block(s: str) -> str:
    """Clean up a math block: strip formatting, handle remaining."""
    for cmd in STRIP_CMDS:
        s = strip_text_braces(s, cmd)
    out = []
    j = 0
    while j < len(s):
        m = re.match(r'\\([a-zA-Z]+)((?:\{[^}]*\})+)', s[j:])
        if m:
            name = m.group(1)
            if name in LATEX_UNICODE:
                out.append(LATEX_UNICODE[name])
            else:
                out.append('$' + m.group(0) + '$')
            j += len(m.group(0))
            continue
        m = re.match(r'\\([a-zA-Z]+)', s[j:])
        if m:
            name = m.group(1)
            if name in LATEX_UNICODE:
                out.append(LATEX_UNICODE[name])
            else:
                out.append('$' + m.group(0) + '$')
            j += len(m.group(0))
            continue
        m = re.match(r'[_^](\{[^}]*\}|\w)', s[j:])
        if m:
            out.append('$' + m.group(0) + '$')
            j += len(m.group(0))
            continue
        out.append(s[j])
        j += 1
    return ''.join(out)

def clean_title(title: str) -> str:
    t = title
    t = t.replace('_x0008_', '')
    t = re.sub(r'\*\*(.+?)\*\*', r'\1', t)
    t = t.replace('<', '&lt;').replace('>', '&gt;')

    # Phase 1: strip formatting commands globally
    for cmd in STRIP_CMDS:
        t = strip_text_braces(t, cmd)

    # Phase 2: process remaining LaTeX
    result = []
    i = 0
    while i < len(t):
        c = t[i]
        # Skip existing $...$ math, clean it up
        if c == '$':
            j = t.find('$', i + 1)
            if j == -1:
                result.append(t[i:])
                break
            inner = process_math_block(t[i+1:j])
            if inner:
                result.append(inner)
            i = j + 1
            continue
        # Skip \(...\) math
        if t[i:i+2] == r'\(':
            j = t.find(r'\)', i + 2)
            if j == -1:
                result.append(t[i:])
                break
            inner = process_math_block(t[i+2:j])
            if inner:
                result.append(inner)
            i = j + 2
            continue
        # Skip \[...\] math
        if t[i:i+2] == r'\[':
            j = t.find(r'\]', i + 2)
            if j == -1:
                result.append(t[i:])
                break
            inner = process_math_block(t[i+2:j])
            if inner:
                result.append(inner)
            i = j + 2
            continue
        # {\command} → Unicode
        m = re.match(r'\{(\\([a-zA-Z]+))\}', t[i:])
        if m:
            name = m.group(2)
            if name in LATEX_UNICODE:
                result.append(LATEX_UNICODE[name])
            else:
                result.append('$' + m.group(1) + '$')
            i += len(m.group(0))
            continue
        # ^{...} or _{...} outside math → $^{...}$ or $_{...}$
        m = re.match(r'[_^](\{[^}]*\}|\w)', t[i:])
        if m:
            result.append('$' + m.group(0) + '$')
            i += len(m.group(0))
            continue
        # \command{...} outside math → $\command{...}$ (keep as math)
        m = re.match(r'\\([a-zA-Z]+)((?:\{[^}]*\})+)\s*', t[i:])
        if m:
            result.append('$' + m.group(0).strip() + '$')
            i += len(m.group(0))
            continue
        # \command with sub/super, e.g. \ell_1
        m = re.match(r'\\([a-zA-Z]+)[_^](?:\{[^}]*\}|\w)', t[i:])
        if m:
            result.append('$' + m.group(0) + '$')
            i += len(m.group(0))
            continue
        # standalone \command → Unicode if possible, else $\command$
        m = re.match(r'\\([a-zA-Z]+)', t[i:])
        if m:
            name = m.group(1)
            if name in LATEX_UNICODE:
                result.append(LATEX_UNICODE[name])
            else:
                result.append('$' + m.group(0) + '$')
            i += len(m.group(0))
            continue
        result.append(c)
        i += 1
    return ''.join(result)

def read_conference_papers(conf_name: str, conf_path: str):
    raw = []
    for year_file in os.listdir(conf_path):
        if not year_file.endswith('.txt'):
            continue
        year = year_file.replace('.txt', '')
        with open(os.path.join(conf_path, year_file), 'r', encoding='utf-8') as f:
            for line in f:
                title = line.strip()
                if not title:
                    continue
                raw.append({"y": year, "t": clean_title(title)})
    # Dedup by title, keep latest year
    best_year = {}
    for entry in raw:
        t = entry["t"]
        y = int(entry["y"])
        if t not in best_year or y > best_year[t][0]:
            best_year[t] = (y, entry)
    entries = [v[1] for v in best_year.values()]
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

        alias_name = get_conference_alias(conf_dir)
        output_path = os.path.join(DATA_DIR, f"{alias_name}.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                "conference": conf_dir,
                "papers": papers
            }, f, separators=(',', ':'))

        manifest["conferences"][alias_name] = {
            "file": f"data/{alias_name}.json",
            "count": len(papers)
        }

# 写入 manifest
manifest_path = os.path.join(DATA_DIR, 'manifest.json')
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, separators=(',', ':'))

# 创建conferences.json文件，用于静态网站的会议和年份数据
# 定义会议分类到不同领域（仅限顶级三大类）
CONFERENCE_CATEGORIES = {
    "CV": ["cvpr", "eccv", "iccv"],
    "AI": ["aaai", "ijcai", "mm"],
    "ML": ["nips", "icml", "iclr"]
}

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
            alias_name = get_conference_alias(conf_dir)
            conferences[alias_name] = years

# 将会议分到各个领域
categorized_conferences = {}

for field, confs in CONFERENCE_CATEGORIES.items():
    field_confs = {}
    for conf in confs:
        if conf in conferences:
            field_confs[conf] = conferences.pop(conf, [])
    
    if field_confs:  # 只添加有会议的领域
        categorized_conferences[field] = field_confs

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
