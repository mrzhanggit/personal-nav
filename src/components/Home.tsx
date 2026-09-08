import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import spaces from '../../docs/zcb-personal-os/data/spaces.v1.json'
import { Icon } from './Icon'

export function Hero() {
  return <section className="hero" aria-labelledby="greeting"><p className="eyebrow">YOUR SPACE. YOUR PACE.</p><h1 id="greeting">下午好，今天想做什么？</h1><p className="hero-subtitle">专注当下 · 构建更好的自己</p><div className="command-search" role="search" aria-label="搜索预览"><Icon name="search" /><input aria-label="搜索网站、项目、工具或输入命令（尚未开放）" placeholder="搜索网站、项目、工具或输入命令…" disabled /><kbd>⌘ K</kbd></div><div className="space-chips" aria-label="空间预览">{spaces.map(space => <span key={space.id} className={`chip ${space.id === 'ai' ? 'is-active' : ''}`}><Icon name={space.icon} />{space.name}</span>)}</div></section>
}

function ResourceLink({ resource }: { resource: typeof resources[number] }) {
  const href = resource.hostingType === 'internal-static' ? `${import.meta.env.BASE_URL}${resource.url}` : resource.url
  return <a className="resource-link" href={href} target="_blank" rel="noopener noreferrer" title={`${resource.name}：${resource.description}（新标签页打开）`}><span className="resource-icon" aria-hidden="true">{resource.icon}</span><span className="resource-name">{resource.name}</span><Icon name="arrow" className="resource-arrow" /></a>
}

export function BentoGrid() {
  return <section className="spaces-section" aria-labelledby="spaces-heading"><div className="section-label"><h2 id="spaces-heading">我的空间 <span>MY SPACES</span></h2><span>让每一个入口，都有归处</span></div><div className="bento-grid">{spaces.map(space => {
    const items = resources.filter(resource => resource.space === space.id)
    const active = space.id === 'ai'
    return <article key={space.id} className={`space-card space-${space.id} ${active ? 'expanded' : 'compact'}`}><div className="space-card-heading"><span className="space-icon"><Icon name={space.icon} /></span><div><h3>{space.name}</h3><p>{space.subtitle}</p></div>{active && <span className="active-indicator" aria-label="当前空间" />}</div>{items.length ? <div className="resource-grid">{items.slice(0, active ? 8 : 3).map(resource => <ResourceLink key={resource.id} resource={resource} />)}</div> : <div className="space-empty"><span className="empty-line" /><span>尚未添加资源</span><span className="empty-line" /></div>}<div className="space-card-footer"><span>{items.length ? `${items.length} 个资源` : '待补充'}</span>{active ? <span className="current-label">当前空间 <span>↗</span></span> : <span className="card-index">0{space.order}</span>}</div></article>
  })}</div></section>
}

export function ActivitySection({ recent = false }: { recent?: boolean }) {
  const title = recent ? '最近使用' : '继续'
  return <section className="activity-section" aria-labelledby={recent ? 'recent-heading' : 'continue-heading'}><div className="activity-heading"><Icon name={recent ? 'clock' : 'pause'} /><div><h2 id={recent ? 'recent-heading' : 'continue-heading'}>{title}</h2><p>{recent ? '快速回到你常用的工具' : '从上次中断的地方继续'}</p></div></div><div className="activity-empty"><span className="empty-symbol"><Icon name={recent ? 'clock' : 'folder'} /></span><div><p>{recent ? '暂无最近使用记录' : '尚未添加进行中的项目'}</p><span>{recent ? '给下一次出发，留一个熟悉的入口' : '留一点空间，给正在发生的事'}</span></div><span className="empty-dash">—</span></div></section>
}
