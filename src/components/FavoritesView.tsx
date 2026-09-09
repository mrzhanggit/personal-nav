import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import { useFavorites } from './Favorites'
import { ResourceItem } from './ResourceItem'
import { Icon } from './Icon'

export function FavoritesView() {
  const { entries } = useFavorites()
  const favorites = entries.flatMap(entry => {
    const resource = resources.find(resource => resource.id === entry.resourceId)
    return resource ? [resource] : []
  })
  return <section className="favorites-view" aria-labelledby="favorites-heading">
    <div className="favorites-heading"><h1 id="favorites-heading">收藏</h1><p>你标记的重要资源</p></div>
    {favorites.length ? <div className="favorites-grid">{favorites.map(resource => <ResourceItem key={resource.id} resource={resource} detailed />)}</div>
      : <div className="favorites-empty"><Icon name="star" /><h2>还没有收藏资源</h2><p>在资源或搜索结果中点击星标即可收藏。</p></div>}
  </section>
}
