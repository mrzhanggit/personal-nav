import type { Resource } from './search'

export type Workspace = { id: string; name: string; description: string; icon: string; links: string[] }
export function resolveWorkspace(workspace: Workspace, resources: readonly Resource[]) {
  const byId = new Map(resources.map(resource => [resource.id, resource]))
  const items: Resource[] = [], invalidIds: string[] = []
  for (const id of new Set(workspace.links)) {
    const resource = byId.get(id)
    if (resource) items.push(resource)
    else invalidIds.push(id)
  }
  return { items, invalidIds }
}

export type LaunchResult = { resourceId: string; status: 'success' | 'blocked' | 'failed' }
type LaunchOptions = {
  href: (resource: Resource) => string
  open: (href: string) => 'success' | 'blocked'
  recordSuccess: (resource: Resource, href: string) => void
}
export function launchWorkspace(resources: readonly Resource[], options: LaunchOptions): LaunchResult[] {
  const seen = new Set<string>()
  const results: LaunchResult[] = []
  for (const resource of resources) {
    if (seen.has(resource.id)) continue
    seen.add(resource.id)
    let href: string
    let status: LaunchResult['status']
    try {
      href = options.href(resource)
      status = options.open(href)
    } catch {
      results.push({ resourceId: resource.id, status: 'failed' })
      continue
    }
    results.push({ resourceId: resource.id, status })
    // A recording error must not relabel an already dispatched navigation or stop later windows.
    if (status === 'success') {
      try { options.recordSuccess(resource, href) } catch { /* Navigation already succeeded. */ }
    }
  }
  return results
}

// Called synchronously in the click handler. Only a trusted blank document has an opener.
export function openWorkspaceWindow(href: string, browser: Pick<Window, 'open' | 'location'> = window): 'success' | 'blocked' {
  const url = new URL(href, browser.location.href)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported workspace URL')
  const popup = browser.open('about:blank', '_blank')
  if (!popup) return 'blocked'
  try {
    if (popup.closed) throw new Error('Window closed before navigation')
    popup.opener = null
    const link = popup.document.createElement('a')
    link.href = url.href
    link.target = '_self'
    link.rel = 'noopener noreferrer'
    link.referrerPolicy = 'no-referrer'
    popup.document.body.append(link)
    link.click()
    link.remove()
    return 'success'
  } catch (error) {
    try { popup.close() } catch { /* Best effort cleanup of an unused blank window. */ }
    throw error
  }
}

export function launchMessage(results: LaunchResult[]) {
  if (!results.length) return '没有可启动资源'
  const count = (status: LaunchResult['status']) => results.filter(result => result.status === status).length
  return `已打开 ${count('success')} / ${results.length} 个资源${count('blocked') ? ` · ${count('blocked')} 个窗口被浏览器阻止，请允许本站弹出窗口后重试` : ''}${count('failed') ? ` · ${count('failed')} 个资源启动失败` : ''}`
}
