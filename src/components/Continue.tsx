import { createContext, useContext, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import spaces from '../../docs/zcb-personal-os/data/spaces.v1.json'
import { createContinueStore } from '../lib/continue'
import type { Resource } from '../lib/search'
import { useOpenResource } from './RecentResources'
import { Icon } from './Icon'
import './continue.css'

const ContinueContext = createContext<ReturnType<typeof createContinueStore> | null>(null)
export function ContinueProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createContinueStore(() => window.localStorage, new Set(resources.map(resource => resource.id))))
  return <ContinueContext.Provider value={store}>{children}</ContinueContext.Provider>
}
function useContinue() {
  const store = useContext(ContinueContext)
  if (!store) throw new Error('ContinueProvider is required')
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return { ...store, entries }
}
export function ContinueButton({ resource }: { resource: Resource }) {
  const { entries, isInContinue, addToContinue, removeFromContinue } = useContinue()
  const [rejected, setRejected] = useState(false)
  const selected = isInContinue(resource.id)
  const label = `${selected ? '从继续中移除' : '加入继续'}：${resource.name}`
  return <div className="continue-secondary"><button type="button" aria-label={label} aria-pressed={selected} title={label} onClick={() => {
    setRejected(false)
    if (selected) removeFromContinue(resource.id)
    else setRejected(addToContinue(resource.id) === 'full')
  }}><Icon name="clock" />{selected ? '从继续中移除' : '加入继续'}</button><span role="status" aria-live="polite">{rejected && !selected && entries.length === 3 ? '继续列表最多保留 3 项，请先移除一项。' : ''}</span></div>
}
export function ContinueSection() {
  const { entries, removeFromContinue, continueResource } = useContinue()
  const openResource = useOpenResource()
  const sectionRef = useRef<HTMLElement>(null)
  return <section className="activity-section" aria-labelledby="continue-heading" ref={sectionRef}>
    <div className="activity-heading"><Icon name="pause" /><div><h2 id="continue-heading" tabIndex={-1}>继续</h2><p>专注当前想继续推进的事 · 最多 3 项</p></div></div>
    {entries.length ? <div className="continue-grid">{entries.map(entry => {
      const resource = resources.find(resource => resource.id === entry.resourceId)
      if (!resource) return null
      return <article className="continue-card" key={resource.id}><span className="resource-icon" aria-hidden="true">{resource.icon}</span><h3>{resource.name}</h3><p>{resource.description || spaces.find(space => space.id === resource.space)?.name}</p><div className="continue-actions"><button type="button" className="continue-open" aria-label={`继续：${resource.name}`} onClick={() => continueResource(resource.id, () => openResource(resource))}>继续 <Icon name="arrow" /></button><button type="button" className="continue-remove" aria-label={`从继续中移除：${resource.name}`} onClick={() => {
        removeFromContinue(resource.id)
        // Keep focus inside the queue when the focused removal button unmounts.
        sectionRef.current?.querySelector<HTMLElement>('#continue-heading')?.focus({ preventScroll: true })
      }}>移除</button></div></article>
    })}</div> : <div className="activity-empty"><span className="empty-symbol"><Icon name="folder" /></span><div><p>尚未添加进行中的项目</p><span>留一点空间，给正在发生的事</span></div><span className="empty-dash">—</span></div>}
  </section>
}
