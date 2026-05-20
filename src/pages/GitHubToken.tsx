import SlideShow from '@/components/features/SlideShow';
import type { SlideData } from '@/components/features/SlideShow';

const slides: SlideData[] = [
  {
    tag: { text: '🔑 为什么要填', variant: 'why' },
    title: <>不填也能用，但会<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">限流</span></>,
    body: (
      <>
        <p>购物车的 <strong>结算</strong> 按钮会搜每篇论文的 GitHub 仓库 Star 数。这个查询走 GitHub Search API，<strong>不带 Token 每小时只能搜 10 次</strong>，填了之后额度大幅提升。</p>
        <p>简单说：不带 Token 也能用，但搜几篇就停了。带 Token 基本够你一次查完。</p>
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
      </div>
    ),
    theme: '#6366f1',
  },
  {
    tag: { text: '📝 怎么创建', variant: 'how' },
    title: <>几分钟就搞定<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent"></span></>,
    body: (
      <ol className="ml-4 mt-1 space-y-1.5">
        <li>打开 <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 no-underline font-medium">GitHub Token 设置页</a></li>
        <li>点 <code>Generate new token</code></li>
        <li>起个名字，比如 <code>find-local</code></li>
        <li>过期时间随意，权限不用额外勾</li>
        <li>生成后复制那一串 Token</li>
        <li>回淘顶网购物车底部，点钥匙按钮 🔑 粘贴</li>
      </ol>
    ),
    right: (
      <div className="w-full max-w-[320px] flex flex-col gap-2.5">
        <div className="rounded-xl border p-4 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
          <div className="text-3xl mb-1">⚙️</div>
          <div className="text-sm font-semibold">GitHub Settings</div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500">Developer settings → Tokens</div>
        </div>
        <div className="flex gap-2 items-center">
          {[
            { icon: '✏️', label: '起名' },
            { icon: '📋', label: '复制' },
            { icon: '🔑', label: '粘贴' },
          ].map((step, i) => (
            <>
              {i > 0 && <span className="text-base text-zinc-300 dark:text-zinc-600 shrink-0">→</span>}
              <div key={step.label} className="flex-1 rounded-xl border p-3 text-center bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border, rgba(148,163,184,0.10))' }}>
                <div className="text-2xl mb-0.5">{step.icon}</div>
                <div className="text-xs font-semibold">{step.label}</div>
              </div>
            </>
          ))}
        </div>
      </div>
    ),
    theme: '#8b5cf6',
  },
  {
    tag: { text: '💾 存哪了', variant: 'what' },
    title: <>只在你的<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">本地浏览器</span></>,
    body: (
      <>
        <p>Token 保存在浏览器 <code>localStorage</code> 里。<strong>不会上传到任何服务器</strong>，也不会写进仓库代码。</p>
        <p>换电脑、换浏览器、清缓存后需要重新设置一次。</p>
      </>
    ),
    right: (
      <div
        className="w-full text-center rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #10b981 15%, transparent), color-mix(in srgb, #10b981 5%, transparent))' }}
      >
        <div className="text-5xl mb-2">🔒</div>
        <div className="text-base font-semibold" style={{ color: '#10b981' }}>本地存储 · 不上传</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">换浏览器需要重新设置</div>
      </div>
    ),
    theme: '#10b981',
  },
  {
    tag: { text: '⚠️ 为啥还失败', variant: 'why' },
    title: <>填了也不一定<span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">100% 成功</span></>,
    body: (
      <>
        <p><strong>Token 过期了</strong> — 去 GitHub 重新生成一个</p>
        <p><strong>API 限流</strong> — 每个 Token 也有频率限制，等一会再试</p>
        <p><strong>搜不到仓库</strong> — 很正常，很多论文没有开源</p>
      </>
    ),
    right: (
      <div className="w-full flex flex-col gap-2.5">
        {[
          { icon: '🕐', text: 'Token 过期 → 重新生成' },
          { icon: '🚦', text: 'API 限流 → 等一会' },
          { icon: '🔍', text: '搜不到 → 论文没开源' },
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
