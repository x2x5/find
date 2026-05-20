import SlideShow from '@/components/features/SlideShow';
import type { SlideData } from '@/components/features/SlideShow';

const slides: SlideData[] = [
  {
    tag: { text: '📌 给人看的 README', variant: 'what' },
    title: <><span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">淘顶网</span> · 淘点顶会</>,
    body: (
      <>
        <p><strong>淘顶网</strong>是一个 AI 顶会论文浏览器。你可以在上面浏览 <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 mx-0.5">ML</span><span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 mx-0.5">CV</span><span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 mx-0.5">AI</span> 三大领域 9 个顶级会议的所有论文。</p>
        <p>论文<strong>随机打乱</strong>展示——就像逛淘宝一样，每次刷新结果都不一样，总有惊喜等着你。</p>
      </>
    ),
    right: (
      <div
        className="w-full text-center rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #6366f1 15%, transparent), color-mix(in srgb, #6366f1 5%, transparent))' }}
      >
        <div className="text-6xl mb-2">🛒</div>
        <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">淘 顶 网</div>
        <div className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">淘点顶会 · 逛着找论文</div>
      </div>
    ),
    theme: '#6366f1',
  },
  {
    tag: { text: '💡 为什么这样设计', variant: 'why' },
    title: <>一条流畅的<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">工作流</span></>,
    body: (
      <>
        <p><strong>筛选 → 浏览 → 收集</strong>，三步一气呵成：</p>
        <p>◀️ <strong>筛选</strong>（左侧栏）— 按领域、年份精准过滤，数据分布一目了然</p>
        <p>⏺️ <strong>浏览</strong>（中间栏）— 论文列表随手翻，点任意词继续搜索</p>
        <p>▶️ <strong>收集</strong>（右侧栏）— 倒计时催投稿，购物车集中管论文</p>
      </>
    ),
    right: (
      <div className="flex gap-2.5 w-full">
        {[
          { emoji: '◀️', label: '筛选', sub: '领域 · 年份', idx: 0 },
          { emoji: '⏺️', label: '浏览', sub: '论文列表', idx: 1 },
          { emoji: '▶️', label: '收集', sub: '倒计时 · 购物车', idx: 2 },
        ].map((c) => (
          <div key={c.idx} className="flex-1 rounded-xl p-5 text-center font-semibold leading-relaxed" style={{ background: `linear-gradient(180deg, color-mix(in srgb, #8b5cf6 ${20 - c.idx * 5}%, transparent), color-mix(in srgb, #8b5cf6 ${8 - c.idx * 3}%, transparent))`, color: '#8b5cf6' }}>
            <div className="text-3xl block mb-2">{c.emoji}</div>
            <div className="text-base font-bold mt-0.5">{c.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>
    ),
    theme: '#8b5cf6',
  },
  {
    tag: { text: '🎯 怎么用', variant: 'how' },
    title: <>快速找到<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">你想要的</span></>,
    body: (
      <>
        <p>左侧栏是你筛选论文的控制台：</p>
        <p>🎯 <strong>领域分布</strong> — ML / CV / AI 三大类，点击色块切换会议</p>
        <p>📅 <strong>年份范围</strong> — 滑动起止年，一键回到最近两年</p>
        <p>📊 <strong>年份分布</strong> — 颜色越深年份越新，论文量趋势一目了然</p>
      </>
    ),
    right: (
      <div className="v-card w-full rounded-2xl p-5 border bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
        <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wider uppercase">论文分布</div>
        {[
          { section: 'ML', color: '#059669', items: [{ name: 'NeurIPS', pct: 85 }, { name: 'ICML', pct: 78 }, { name: 'ICLR', pct: 72 }] },
          { section: 'CV', color: '#2563eb', items: [{ name: 'CVPR', pct: 92 }, { name: 'ECCV', pct: 68 }] },
          { section: 'AI', color: '#d97706', items: [{ name: 'AAAI', pct: 100 }, { name: 'IJCAI', pct: 65 }] },
        ].map((group) => (
          <div key={group.section}>
            <div className="flex items-center gap-2.5 my-1.5 text-sm">
              <span className="w-[52px] text-right font-semibold shrink-0 text-xs" style={{ color: group.color }}>{group.section}</span>
            </div>
            {group.items.map((item) => (
              <div key={item.name} className="flex items-center gap-2.5 my-1.5 text-sm">
                <span className="w-[52px] text-right font-medium shrink-0 text-xs" style={{ color: group.color }}>{item.name}</span>
                <span className="flex-1 h-2.5 rounded overflow-hidden bg-zinc-200/60 dark:bg-zinc-700/40">
                  <span className="h-full block rounded" style={{ width: `${item.pct}%`, background: group.color }} />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
    theme: '#3b82f6',
  },
  {
    tag: { text: '👆 怎么用', variant: 'how' },
    title: <>点一点就能<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">继续探索</span></>,
    body: (
      <>
        <p>每行包含 <strong>年份</strong> · <strong>会议标签</strong> · <strong>标题</strong> 三要素。</p>
        <p>点击标题中<strong>任意单词</strong> → 自动加入搜索框，精准过滤。比如点 <code>Diffusion</code>，列表只剩相关论文。</p>
        <p>左边 <strong>±</strong> 收藏到购物车，右边 <strong>📋</strong> 一键复制标题。每页 10 条。</p>
      </>
    ),
    right: (
      <div className="w-full rounded-2xl border p-4 bg-zinc-50/50 dark:bg-zinc-900/30" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
        {[
          { year: '2025', badge: 'ml', conf: 'ICML', title: 'On the Impact of Hard Adversarial...' },
          { year: '2025', badge: 'cv', conf: 'CVPR', title: 'Tracking The Best Expert Privately...' },
          { year: '2026', badge: 'pink', conf: 'ICLR', title: 'Detecting and Mitigating Memorization...' },
          { year: '2024', badge: 'ml', conf: 'NeurIPS', title: 'Scaling Laws for Neural Language...' },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-2 py-2 text-sm border-b last:border-b-0" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{row.year}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.badge === 'ml' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : row.badge === 'cv' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'}`}>{row.conf}</span>
            <span className="text-indigo-500 font-bold text-base shrink-0">+</span>
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-zinc-500 dark:text-zinc-400">{row.title}</span>
            <span className="text-zinc-400 text-sm shrink-0">📋</span>
          </div>
        ))}
      </div>
    ),
    theme: '#06b6d4',
  },
  {
    tag: { text: '⏰ 为什么需要', variant: 'why' },
    title: <>不要错过<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">截止时间</span></>,
    body: (
      <>
        <p>右侧栏帮你做两件重要的事：</p>
        <p>⏱️ <strong>会议倒计时</strong> — 设置关心的会议和截止日，每天看还剩多少天。点击会议名改名字，⚙️ 调时间。</p>
        <p>🛒 <strong>购物车</strong> — 好论文先 <strong>±</strong> 收藏，最后一次性复制导出。结算还能查 GitHub Star 数。</p>
      </>
    ),
    right: (
      <div className="w-full flex flex-col gap-3">
        <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">距 <span className="text-pink-500 font-bold text-sm">AAAI</span> 投稿截止</div>
          <div className="flex gap-2">
            {[
              { val: '42', label: '天', grad: true },
              { val: '07', label: '时', grad: false },
              { val: '32', label: '分', grad: false },
              { val: '18', label: '秒', grad: false },
            ].map((u) => (
              <div key={u.label} className="flex-1 text-center bg-white dark:bg-zinc-800 rounded-lg py-2">
                <div className={`text-xl font-bold tabular-nums ${u.grad ? 'bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 bg-clip-text text-transparent' : 'text-zinc-800 dark:text-zinc-200'}`}>{u.val}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{u.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="flex justify-between text-sm font-semibold"><span>🛒 购物车 (3)</span><span className="font-normal text-zinc-400 dark:text-zinc-500 text-xs">复制 · 清空 · 结算</span></div>
          <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}><span>总 ★</span><span className="text-amber-500 font-bold text-sm">1,284</span></div>
        </div>
      </div>
    ),
    theme: '#f43f5e',
  },
  {
    tag: { text: '🎲 这是什么', variant: 'what' },
    title: <>每一次搜索都有<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">意外收获</span></>,
    body: (
      <>
        <p><strong>GET</strong> —— 每次搜索关键词后，顶部会随机展示一篇当前结果中的论文。它不是什么算法推荐，就是纯粹的随机 —— 像开盲盒一样好玩。</p>
        <p><strong>数据来源</strong> —— 论文标题来自 <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">DBLP</span> 学术数据库和 <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Paper Copilot</span>。存放在 <code>papers/会议/年份.txt</code>，每行一个标题。</p>
      </>
    ),
    right: (
      <div className="w-full text-center rounded-2xl p-6 border" style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#fce7f3 50%,#fef3c7 100%)', borderColor: 'rgba(255,255,255,0.3)' }}>
        <span className="inline-block bg-pink-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-2">GET</span>
        <div className="text-sm font-semibold text-zinc-800 leading-relaxed">One-Step is Enough: Sparse Autoencoders<br />for Text-to-Image Diffusion Models</div>
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">← 左右拖动查看完整标题 →</div>
      </div>
    ),
    theme: '#f59e0b',
  },
  {
    tag: { text: '🛠️ 怎么部署', variant: 'how' },
    title: <>三步跑起来<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent"></span></>,
    body: (
      <>
        <p>想自己在本地跑？只需要三步：</p>
        <p>1️⃣ 确保装了 <strong>Node.js</strong></p>
        <p>2️⃣ <strong>克隆项目</strong>到本地</p>
        <p>3️⃣ <strong>安装依赖</strong>并启动</p>
        <p>想更新论文数据？编辑 <code>papers/会议/年份.txt</code>，运行 <code>cd scripts && npx tsx gen-data.ts</code> 即可。</p>
      </>
    ),
    right: (
      <div className="w-full rounded-xl p-5 text-sm leading-relaxed font-mono" style={{ background: '#1e1e2e', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color: '#6b7280' }}># 1. 安装 Node.js</span><br />
        brew install node<br />
        <br />
        <span style={{ color: '#6b7280' }}># 2. 克隆项目</span><br />
        git clone https://github.com/x2x5/find.git<br />
        cd find<br />
        <br />
        <span style={{ color: '#6b7280' }}># 3. 安装并启动</span><br />
        npm install<br />
        npm run dev<br />
        <span style={{ color: '#34d399' }}>→ http://localhost:5173/find/</span>
      </div>
    ),
    theme: '#10b981',
  },
  {
    tag: { text: '⚡ 用了什么', variant: 'what' },
    title: <>技术栈<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent"></span></>,
    body: (
      <>
        <p>一个现代的前端项目该有的都有：</p>
        <p><strong>React 18</strong> + <strong>TypeScript</strong> 保证类型安全<br />
        <strong>Tailwind CSS</strong> 快速构建 UI<br />
        <strong>Vite</strong> 极速开发和构建<br />
        <strong>Lucide</strong> 统一的开源图标风格</p>
      </>
    ),
    right: (
      <div className="flex gap-2.5 flex-wrap w-full">
        {[
          { icon: '⚛️', name: 'React', grad: 'from-indigo-100 to-blue-100', color: '#4f46e5' },
          { icon: '🔷', name: 'TypeScript', grad: 'from-pink-100 to-pink-50', color: '#be185d' },
          { icon: '🎨', name: 'Tailwind', grad: 'from-amber-100 to-amber-50', color: '#b45309' },
          { icon: '⚡', name: 'Vite', grad: 'from-emerald-100 to-emerald-50', color: '#2e7d32' },
          { icon: '🖼️', name: 'Lucide', grad: 'from-purple-100 to-purple-50', color: '#7b1fa2' },
        ].map((t) => (
          <div key={t.name} className={`flex-1 text-center py-4 min-w-[60px] rounded-xl bg-gradient-to-b ${t.grad}`}>
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="text-xs font-bold" style={{ color: t.color }}>{t.name}</div>
          </div>
        ))}
      </div>
    ),
    theme: '#db2777',
  },
  {
    tag: { text: '💬 有话说？', variant: 'why' },
    title: <>你的意见<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">很重要</span></>,
    body: (
      <>
        <p>用得不爽？有想法？欢迎来 GitHub 提 Issue，或者直接发邮件：</p>
        <p className="mt-3">
          <a href="https://github.com/x2x5/find/issues/new" className="inline-block px-7 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #ec4899)' }}>→ 去 GitHub 提 Issue</a>
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm">
          📧 <a href="mailto:x2x5.blog@outlook.com" className="text-indigo-500 dark:text-indigo-400 no-underline font-medium">x2x5.blog@outlook.com</a>
          <button onClick={() => navigator.clipboard.writeText('x2x5.blog@outlook.com')} className="bg-transparent border-none cursor-pointer text-sm p-0.5 rounded text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all" title="复制邮箱">📋</button>
        </p>
      </>
    ),
    right: (
      <div
        className="w-full text-center rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #14b8a6 15%, transparent), color-mix(in srgb, #14b8a6 5%, transparent))' }}
      >
        <div className="text-5xl mb-2">💬</div>
        <div className="text-base font-semibold">说出来，我们才能改</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">每一个反馈都让淘顶网变得更好</div>
      </div>
    ),
    theme: '#14b8a6',
  },
];

export default function About() {
  return <SlideShow slides={slides} backHref="/find/" />;
}
