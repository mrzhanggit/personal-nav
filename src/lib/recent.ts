export const RECENT_KEY = 'zcb-os:recent-resources'
export type RecentEntry = { resourceId: string; lastOpenedAt: number; openCount: number }
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>

export function parseRecent(raw: string | null, validIds: Set<string>): RecentEntry[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(data)) return []
    const entries = data.filter((item): item is RecentEntry => Boolean(item &&
      typeof item.resourceId === 'string' && validIds.has(item.resourceId) &&
      Number.isSafeInteger(item.lastOpenedAt) && item.lastOpenedAt > 0 && item.lastOpenedAt <= Date.now() &&
      Number.isSafeInteger(item.openCount) && item.openCount > 0))
      .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
    const seen = new Set<string>()
    return entries.filter(item => {
      if (seen.has(item.resourceId)) return false
      seen.add(item.resourceId)
      return true
    }).slice(0, 20).map(({ resourceId, lastOpenedAt, openCount }) => ({ resourceId, lastOpenedAt, openCount }))
  } catch { return [] }
}

export function createRecentStore(storage: StorageAccess, validIds: Set<string>) {
  let entries: RecentEntry[] = []
  try { entries = parseRecent(storage().getItem(RECENT_KEY), validIds) } catch { /* Storage is optional. */ }
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => entries,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    openResource(resourceId: string, href: string, open: (href: string) => void, now = Date.now()) {
      if (!validIds.has(resourceId)) return
      const previous = entries.find(entry => entry.resourceId === resourceId)
      entries = [{ resourceId, lastOpenedAt: now, openCount: Math.min((previous?.openCount ?? 0) + 1, Number.MAX_SAFE_INTEGER) },
        ...entries.filter(entry => entry.resourceId !== resourceId)].slice(0, 20)
      try { storage().setItem(RECENT_KEY, JSON.stringify(entries)) } catch { /* Keep an in-memory Recent list. */ }
      // Storage and rendering enhancements must never prevent the user's navigation.
      try { listeners.forEach(listener => listener()) } finally { open(href) }
    },
  }
}

export function relativeTime(timestamp: number, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.floor(hours / 24)} 天前`
}
