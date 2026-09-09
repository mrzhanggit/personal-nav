import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import spaces from '../../docs/zcb-personal-os/data/spaces.v1.json'
import { resourcesForSpace } from '../lib/spaces'
import { ResourceItem } from './ResourceItem'
import { SpaceChips } from './SpaceChips'
import { Icon } from './Icon'

export function SpaceView({ spaceId, onOpenSpace, onHome }: { spaceId: string; onOpenSpace: (id: string) => void; onHome: () => void }) {
  const space = spaces.find(space => space.id === spaceId)
  if (!space) return <section className="space-view"><button type="button" className="space-back" onClick={onHome}>返回首页</button><h1>未找到这个空间</h1></section>
  const items = resourcesForSpace(resources, space.id)
  return <section className="space-view" aria-labelledby="space-view-heading">
    <button type="button" className="space-back" onClick={onHome}>‹ 返回首页</button>
    <header className="space-view-header"><span className="space-view-icon"><Icon name={space.icon} /></span>
      <div><h1 id="space-view-heading">{space.name}</h1><p>{space.subtitle}</p><span className="space-resource-count">{items.length} 个资源</span></div>
    </header>
    <SpaceChips activeId={space.id} onOpenSpace={onOpenSpace} />
    {items.length ? <div className="space-resource-grid">{items.map(resource => <ResourceItem key={resource.id} resource={resource} detailed />)}</div>
      : <div className="space-view-empty"><Icon name={space.icon} /><h2>尚未添加资源</h2></div>}
  </section>
}
