import spaces from '../../docs/zcb-personal-os/data/spaces.v1.json'
import type { Resource } from '../lib/search'
import { ResourceAnchor } from './RecentResources'
import { FavoriteButton } from './Favorites'
import { Icon } from './Icon'

export function ResourceItem({ resource, detailed = false }: { resource: Resource; detailed?: boolean }) {
  return <div className={`resource-item ${detailed ? 'resource-item-detailed' : ''}`}>
    <ResourceAnchor className="resource-link" resource={resource}>
      <span className="resource-icon" aria-hidden="true">{resource.icon}</span>
      <span className="resource-copy"><span className="resource-name">{resource.name}</span>
        {detailed && <><span className="resource-description">{resource.description}</span><span className="resource-space">{spaces.find(space => space.id === resource.space)?.name ?? resource.space}</span><span className="resource-open">打开 <Icon name="arrow" /></span></>}
      </span>{!detailed && <Icon name="arrow" className="resource-arrow" />}
    </ResourceAnchor><FavoriteButton resource={resource} />
  </div>
}
