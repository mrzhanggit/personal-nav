import { createContext, useContext, useState, useSyncExternalStore } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import { createRecentStore, relativeTime } from '../lib/recent'
import { resourceHref } from '../lib/search'
import type { Resource } from '../lib/search'
import { Icon } from './Icon'
import './recent-resources.css'

const RecentContext = createContext<ReturnType<typeof createRecentStore> | null>(null)

export function RecentProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createRecentStore(() => window.localStorage, new Set(resources.map(resource => resource.id))))
  return <RecentContext.Provider value={store}>{children}</RecentContext.Provider>
}

function useStore() {
  const store = useContext(RecentContext)
  if (!store) throw new Error('RecentProvider is required')
  return store
}

export function useOpenResource() {
  const store = useStore()
  return (resource: Resource) => store.openResource(resource.id, resourceHref(resource, import.meta.env.BASE_URL),
    href => { window.open(href, '_blank', 'noopener,noreferrer') })
}

// Workspace calls this only after obtaining a window and dispatching target navigation.
export function useRecordWorkspaceSuccess() {
  const store = useStore()
  return (resource: Resource, href: string) => store.openResource(resource.id, href, () => {})
}

export function ResourceAnchor({ resource, className, children }: { resource: Resource; className: string; children: ReactNode }) {
  const store = useStore()
  function activate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented) return
    if (event.type === 'auxclick' && event.button !== 1) return
    // Let the anchor preserve native modifier-key and middle-click navigation.
    store.openResource(resource.id, event.currentTarget.href, () => {})
  }
  return <a className={className} href={resourceHref(resource, import.meta.env.BASE_URL)} target="_blank" rel="noopener noreferrer"
    title={`${resource.name}${resource.description ? `：${resource.description}` : ''}（新标签页打开）`} onClick={activate} onAuxClick={activate}>{children}</a>
}

export function RecentResources() {
  const store = useStore()
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot).slice(0, 5)
  return <section className="activity-section" aria-labelledby="recent-heading"><div className="activity-heading"><Icon name="clock" /><div><h2 id="recent-heading">最近使用</h2><p>快速回到你常用的工具</p></div></div>
    {entries.length ? <div className="recent-list">{entries.map(entry => {
      const resource = resources.find(item => item.id === entry.resourceId)!
      return <ResourceAnchor key={entry.resourceId} resource={resource} className="recent-item"><span className="resource-icon" aria-hidden="true">{resource.icon}</span><span className="recent-copy"><span>{resource.name}</span><time dateTime={new Date(entry.lastOpenedAt).toISOString()}>{relativeTime(entry.lastOpenedAt)}</time></span></ResourceAnchor>
    })}</div> : <div className="activity-empty"><span className="empty-symbol"><Icon name="clock" /></span><div><p>暂无最近使用记录</p><span>给下一次出发，留一个熟悉的入口</span></div><span className="empty-dash">—</span></div>}
  </section>
}
