import { useState } from 'react'
import workspaces from '../../docs/zcb-personal-os/data/workspaces.v1.json'
import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import { resolveWorkspace, launchWorkspace, openWorkspaceWindow, launchMessage } from '../lib/workspaces'
import type { Workspace } from '../lib/workspaces'
import { resourceHref } from '../lib/search'
import { useRecordWorkspaceSuccess } from './RecentResources'
import { Icon } from './Icon'
import './workspace-view.css'

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const { items, invalidIds } = resolveWorkspace(workspace, resources)
  const [status, setStatus] = useState('')
  const recordSuccess = useRecordWorkspaceSuccess()
  function launch() {
    setStatus(launchMessage(launchWorkspace(items, {
      href: resource => resourceHref(resource, import.meta.env.BASE_URL),
      open: openWorkspaceWindow,
      recordSuccess,
    })))
  }
  return <article className="workspace-card" aria-labelledby={`${workspace.id}-heading`}>
    <header><span className="workspace-icon"><Icon name={workspace.icon} /></span><div><h2 id={`${workspace.id}-heading`}>{workspace.name}</h2><p>{workspace.description}</p></div></header>
    <span className="workspace-count">{items.length} 个资源</span>
    {items.length ? <ul className="workspace-resources">{items.map(resource => <li key={resource.id}><span aria-hidden="true">{resource.icon}</span><span>{resource.name}</span></li>)}</ul> : <p className="workspace-empty">尚未配置资源</p>}
    {invalidIds.length > 0 && <p className="workspace-warning">{invalidIds.length} 个资源暂不可用，已忽略</p>}
    <button type="button" className="workspace-launch" aria-label={`启动${workspace.name}`} disabled={!items.length} onClick={launch}>启动 <Icon name="arrow" /></button>
    <p className="workspace-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
  </article>
}

export function WorkspaceView() {
  return <section className="workspace-view" aria-labelledby="workspace-heading"><header className="workspace-heading"><h1 id="workspace-heading">快速启动</h1><p>一次打开一个工作场景</p><span>查看下方资源，点击启动将在新标签页打开。</span></header><div className="workspace-grid">{workspaces.map(workspace => <WorkspaceCard key={workspace.id} workspace={workspace} />)}</div></section>
}
