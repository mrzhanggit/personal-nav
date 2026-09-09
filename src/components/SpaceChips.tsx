import spaces from '../../docs/zcb-personal-os/data/spaces.v1.json'
import { Icon } from './Icon'
import './space-browsing.css'

export function SpaceChips({ activeId, onOpenSpace }: { activeId?: string; onOpenSpace: (id: string) => void }) {
  return <nav className="space-chips" aria-label="选择空间">{spaces.map(space =>
    <button key={space.id} type="button" className={`chip ${activeId === space.id ? 'is-active' : ''}`}
      aria-current={activeId === space.id ? 'page' : undefined} onClick={() => onOpenSpace(space.id)}>
      <Icon name={space.icon} />{space.name}
    </button>)}
  </nav>
}
