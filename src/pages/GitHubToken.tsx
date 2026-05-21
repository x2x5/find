import SlideShow from '@/components/features/SlideShow';
import type { SlideData } from '@/components/features/SlideShow';

const slides: SlideData[] = [
  {
    tag: { text: '🤔 问题', variant: 'what' },
    title: <>根据论文题目，拿到 GitHub 仓库和 <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">⭐ 数</span></>,
    body: (
      <>
        <p>给一篇论文，找到它对应的 GitHub 开源仓库地址和 Star 数。<strong>这一切只能在浏览器里完成</strong>——纯前端，没有后端服务器。</p>
        <p className="font-semibold mt-3">为什么难？</p>
        <ul className="ml-4 mt-1 space-y-0.5 list-disc">
          <li>论文题目 ≠ 仓库名，没有现成的一一对应关系</li>
          <li>不存在免费、公开的「论文→仓库」查询服务</li>
          <li>GitHub API 对未认证请求<strong>每小时只给 10 次</strong></li>
          <li>纯静态页面，不能存数据、不能写后端</li>
        </ul>
        <p className="font-semibold mt-3">几种可行方案：</p>
      </>
    ),
    right: (
      <div className="w-full max-w-[380px] flex flex-col gap-2">
        {[
          { letter: 'A', title: '直接搜 GitHub Search API', pros: '最直接', cons: '标题和仓库名经常对不上；限流严格', color: '#6366f1' },
          { letter: 'B', title: '先搜 HuggingFace Papers', pros: 'HF 已收录大量 AI 论文与代码仓库的对应关系；匹配率高', cons: '只覆盖 AI 论文；需解析 HTML 页面', color: '#8b5cf6' },
          { letter: 'C', title: '自己搭后台 + 数据库', pros: '体验最好，无 API 限制', cons: '本项目没服务器；纯静态站做不到', color: '#ec4899' },
        ].map((item) => (
          <div key={item.letter} className="rounded-xl border p-3.5 bg-zinc-50 dark:bg-zinc-900/50 text-left" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold text-white" style={{ background: item.color }}>{item.letter}</span>
              <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</span>
            </div>
            <div className="text-[11px] space-y-0.5 ml-7">
              <div className="flex gap-1.5"><span className="text-emerald-500 font-semibold shrink-0">✅</span><span className="text-zinc-500 dark:text-zinc-400">{item.pros}</span></div>
              <div className="flex gap-1.5"><span className="text-red-400 font-semibold shrink-0">❌</span><span className="text-zinc-500 dark:text-zinc-400">{item.cons}</span></div>
            </div>
          </div>
        ))}
      </div>
    ),
    theme: '#6366f1',
  },
  {
    tag: { text: '💡 方案', variant: 'how' },
    title: <>本网站的选择：<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">A + B 组合</span></>,
    body: (
      <>
        <p>方案 C 做不到（没服务器），只能在 A 和 B 之间选。</p>
        <p>B 的匹配质量远高于 A，因为 HuggingFace 收录了大量 AI 论文与代码仓库的人工/自动关联，比纯文本搜索准确得多。</p>
        <p><strong>但 B 不可能覆盖所有论文</strong>，所以需要 A 兜底。</p>
        <p className="mt-2">最终策略：<strong>先 B 后 A</strong>，HF 优先，GitHub 兜底。</p>
      </>
    ),
    right: (
      <div className="w-full max-w-[360px] flex flex-col items-center gap-2.5">
        <div className="w-full rounded-xl border p-4 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-3xl mb-1">📄</div>
          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">论文题目</div>
        </div>
        <div className="text-lg text-zinc-400">↓</div>
        <div className="w-full rounded-xl border p-3 text-center bg-violet-50 dark:bg-violet-950/30" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-2xl mb-0.5">🤗</div>
          <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">① HuggingFace</div>
          <div className="text-[11px] text-violet-500 dark:text-violet-400">搜论文 → 提取仓库</div>
        </div>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 text-center rounded-lg border p-2 bg-emerald-50 dark:bg-emerald-950/30 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>找到了 → 拿⭐</div>
          <div className="flex-1 text-center rounded-lg border p-2 bg-amber-50 dark:bg-amber-950/30 text-[11px] font-semibold text-amber-600 dark:text-amber-400" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>没找到 ↓</div>
        </div>
        <div className="w-full rounded-xl border p-3 text-center bg-blue-50 dark:bg-blue-950/30" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-2xl mb-0.5">🐙</div>
          <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">② GitHub Search API</div>
          <div className="text-[11px] text-blue-500 dark:text-blue-400">直接搜仓库 → 拿⭐</div>
        </div>
      </div>
    ),
    theme: '#8b5cf6',
  },
  {
    tag: { text: '🔍 第一步', variant: 'how' },
    title: <>HuggingFace Papers <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">搜论文 → 找仓库</span></>,
    body: (
      <>
        <p>HuggingFace 的 Papers 板块收录了大量 AI 顶会论文，并且<strong>很多论文页面直接标注了关联的 GitHub 仓库</strong>，比直接搜 GitHub 准确得多。</p>
        <ol className="ml-4 mt-2 space-y-2">
          <li>拿论文标题前 12 个词去 <code>huggingface.co/papers?q=...</code> 搜索</li>
          <li>解析返回的 HTML，遍历所有 <code>/papers/xxx</code> 链接，用 <strong>Jaccard 相似度</strong>匹配标题（阈值 ≥ 72%）</li>
          <li>找到目标 paper ID 后，调 <code>huggingface.co/api/papers/xxx</code> 获取元数据</li>
          <li>从元数据中递归提取 GitHub 链接（可能是字符串、数组或嵌套对象）</li>
        </ol>
        <p className="mt-2 text-xs text-zinc-400">不直接用 HF 的搜索 API？因为那个是 private API，浏览器请求会被 CORS 拦截。用 HTML 页面 + DOMParser 解析反而能绕过。</p>
      </>
    ),
    right: (
      <div className="w-full max-w-[340px] flex flex-col gap-2">
        {[
          { icon: '🔗', step: '1', text: 'GET huggingface.co/papers?q={title}' },
          { icon: '📋', step: '2', text: 'DOMParser 解析 HTML，Jaccard 匹配标题' },
          { icon: '📦', step: '3', text: 'GET huggingface.co/api/papers/{id}' },
          { icon: '🐙', step: '4', text: '递归提取 github.com/xxx 链接' },
        ].map((item) => (
          <div key={item.step} className="flex items-center gap-3 rounded-xl border p-3 bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-indigo-400 mb-0.5">STEP {item.step}</div>
              <div className="text-[11px] text-zinc-600 dark:text-zinc-300 break-all font-mono">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    theme: '#8b5cf6',
  },
  {
    tag: { text: '🐙 第二步', variant: 'how' },
    title: <>GitHub Search API <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">兜底搜索</span></>,
    body: (
      <>
        <p>如果 HuggingFace 没收录这篇论文，或者页面里没有仓库链接，就退回到 GitHub Search API 直接搜索。</p>
        <p className="font-semibold mt-2">两轮搜索策略：</p>
        <ol className="ml-4 mt-1 space-y-2">
          <li><strong>精确匹配：</strong>用完整论文标题，限定搜索范围 <code>in:name,in:description,in:topics,in:readme</code>，按 Star 数排序取第一条</li>
          <li><strong>关键词兜底：</strong>如果精确匹配没结果，改用标题前 4 个关键词宽松搜索</li>
        </ol>
        <p className="mt-2 text-xs text-zinc-400">两次调用之间有 300ms 延迟，避免触发 GitHub 的速率限制保护。</p>
      </>
    ),
    right: (
      <div className="w-full max-w-[340px] flex flex-col gap-2.5">
        <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-xs font-bold text-indigo-500 mb-2">QUERY 1 · 精确匹配</div>
          <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 rounded-lg p-2.5 break-all">
            q=&quot;Paper Title Here&quot; in:name,in:description,in:topics,in:readme<br />
            sort=stars&nbsp;&nbsp;per_page=1
          </div>
        </div>
        <div className="text-center text-sm text-zinc-400">↓ 没结果则回退</div>
        <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-xs font-bold text-amber-500 mb-2">QUERY 2 · 关键词兜底</div>
          <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 rounded-lg p-2.5 break-all">
            q=paper title keywords<br />
            sort=stars&nbsp;&nbsp;per_page=1
          </div>
        </div>
      </div>
    ),
    theme: '#6366f1',
  },
  {
    tag: { text: '⭐ 第三步', variant: 'how' },
    title: <>拿到仓库后，<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">查 Star 数</span></>,
    body: (
      <>
        <p>无论仓库地址来自 HuggingFace 还是 GitHub Search，最后一步都一样：</p>
        <ol className="ml-4 mt-2 space-y-1.5">
          <li>从仓库 URL 中<strong>解析出 owner 和 repo 名称</strong>（去 .git 后缀、去多余的路径）</li>
          <li>调用 GitHub Repo API：<code>GET /repos/:owner/:repo</code></li>
          <li>从返回数据中读取 <code>stargazers_count</code></li>
        </ol>
        <p className="mt-2">最终每篇论文旁边显示它的 GitHub 仓库链接和 Star 数。</p>
        <p className="text-xs text-zinc-400 mt-1">仓库 URL 解析示例：<code>https://github.com/openai/whisper</code> → owner=openai, repo=whisper</p>
      </>
    ),
    right: (
      <div className="w-full max-w-[300px] flex flex-col items-center gap-2">
        <div className="w-full rounded-xl border p-3.5 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-xs text-zinc-400 mb-1">仓库 URL</div>
          <div className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-200 break-all">github.com/openai/whisper</div>
        </div>
        <div className="text-lg text-zinc-400">↓</div>
        <div className="w-full rounded-xl border p-3.5 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-xs text-zinc-400 mb-1">GET /repos/openai/whisper</div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 rounded p-2 mt-1.5 text-left">
            {'{'} &quot;stargazers_count&quot;: 12345 {'}'}
          </div>
        </div>
        <div className="text-lg text-zinc-400">↓</div>
        <div className="text-2xl font-bold text-amber-500">⭐ 12,345</div>
      </div>
    ),
    theme: '#f59e0b',
  },
  {
    tag: { text: '🚦 限流', variant: 'why' },
    title: <>GitHub API 有限制，需要<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">你的 Token</span></>,
    body: (
      <>
        <p>前几步调用 GitHub API 时，每个请求都受 GitHub 的速率限制：</p>
        <p className="mt-2"><strong>不带 Token：每小时只能 10 次</strong>——搜几篇论文就停了。</p>
        <p><strong>带了 Personal Access Token：每小时 5000 次</strong>——基本够一次查完所有论文。</p>
        <p className="mt-2">所以需要你提供自己的 GitHub Token。这个 Token 任何人都可以在 GitHub 免费创建，不需要任何付费。</p>
      </>
    ),
    right: (
      <div
        className="w-full text-center rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #6366f1 15%, transparent), color-mix(in srgb, #6366f1 5%, transparent))' }}
      >
        <div className="text-5xl mb-2">🔑</div>
        <div className="text-base font-semibold">不填 = 限流</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">填了 = 畅搜</div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">10</div>
            <div className="text-[10px] text-zinc-400">次/时（无Token）</div>
          </div>
          <div className="text-zinc-400">→</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">5000</div>
            <div className="text-[10px] text-zinc-400">次/时（有Token）</div>
          </div>
        </div>
      </div>
    ),
    theme: '#6366f1',
  },
  {
    tag: { text: '📝 获取', variant: 'how' },
    title: <>一分钟获取<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent"> GitHub Token</span></>,
    body: (
      <ol className="ml-4 mt-1 space-y-1.5">
        <li>打开 <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 no-underline font-medium">GitHub Token 设置页</a></li>
        <li>点 <code>Generate new token</code> → 选 <code>Tokens (classic)</code></li>
        <li>起个名字，比如 <code>find-local</code></li>
        <li>过期时间随意，权限不用额外勾选</li>
        <li>生成后复制那一串 Token</li>
        <li>粘贴到本网站设置页面的输入框里，点保存</li>
      </ol>
    ),
    right: (
      <div className="w-full max-w-[320px] flex flex-col gap-2.5">
        <div className="rounded-xl border p-4 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-3xl mb-1">⚙️</div>
          <div className="text-sm font-semibold">GitHub Settings</div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500">Developer settings → Tokens (classic)</div>
        </div>
        <div className="flex gap-2 items-center">
          {[
            { icon: '✏️', label: '起名' },
            { icon: '📋', label: '复制' },
            { icon: '🔑', label: '粘贴' },
          ].map((step) => (
            <div key={step.label} className="flex-1 rounded-xl border p-3 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
              <div className="text-2xl mb-0.5">{step.icon}</div>
              <div className="text-xs font-semibold">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    theme: '#8b5cf6',
  },
  {
    tag: { text: '🔒 隐私', variant: 'what' },
    title: <>Token 只在你<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">本地浏览器</span></>,
    body: (
      <>
        <p>Token 保存在浏览器 <code>localStorage</code> 里。</p>
        <p className="mt-1"><strong>本项目是 GitHub Pages 纯静态页面</strong>，没有后端服务器、没有数据库。Token 不会上传到任何地方，也不会写进仓库代码。</p>
        <p className="mt-2 text-xs text-zinc-400">换电脑、换浏览器、清缓存后需要重新设置一次。</p>
      </>
    ),
    right: (
      <div
        className="w-full text-center rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #10b981 15%, transparent), color-mix(in srgb, #10b981 5%, transparent))' }}
      >
        <div className="text-5xl mb-2">🔒</div>
        <div className="text-base font-semibold" style={{ color: '#10b981' }}>本地存储 · 不上传</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">纯静态站 · 无服务器 · 无数据库</div>
      </div>
    ),
    theme: '#10b981',
  },
  {
    tag: { text: '⚠️ 排错', variant: 'why' },
    title: <>填了 Token 也不一定<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">100% 成功</span></>,
    body: (
      <>
        <p><strong>Token 过期了</strong> — 去 GitHub 重新生成一个</p>
        <p><strong>API 限流</strong> — 短时间查太多，每个 Token 也有频率限制，等一会再试</p>
        <p><strong>搜不到仓库</strong> — 论文没开源，这很常见</p>
        <p><strong>HuggingFace 没收录</strong> — HF 并非万能，只覆盖部分 AI 论文</p>
        <p><strong>HF 有仓库但提取失败</strong> — 元数据格式不统一，偶尔漏掉</p>
      </>
    ),
    right: (
      <div className="w-full flex flex-col gap-2.5">
        {[
          { icon: '🕐', text: 'Token 过期 → 重新生成' },
          { icon: '🚦', text: 'API 限流 → 等一会再试' },
          { icon: '🔍', text: '搜不到 → 论文没开源' },
          { icon: '🤗', text: 'HF 没收录 → 没办法' },
          { icon: '🧩', text: '提取失败 → 元数据格式问题' },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3 rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.text}</span>
          </div>
        ))}
      </div>
    ),
    theme: '#f59e0b',
  },
];

export default function GitHubToken() {
  return <SlideShow slides={slides} backHref="/find/" />;
}
