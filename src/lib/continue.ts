export const CONTINUE_KEY = 'zcb-os:continue-resources'
export const CONTINUE_LIMIT = 3
export type ContinueEntry = { resourceId: string; addedAt: number; lastContinuedAt: number | null }
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>
const sortEntries = (entries: ContinueEntry[]) => entries.sort((a, b) => (b.lastContinuedAt ?? b.addedAt) - (a.lastContinuedAt ?? a.addedAt))

export function readContinue(raw: string | null, validIds: Set<string>): ContinueEntry[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(data)) return []
    const now = Date.now()
    const timestamp = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= now
    const seen = new Set<string>()
    return sortEntries(data.filter((item): item is ContinueEntry => Boolean(item && validIds.has(item.resourceId) &&
      timestamp(item.addedAt) && (item.lastContinuedAt === null || (timestamp(item.lastContinuedAt) && item.lastContinuedAt >= item.addedAt)))))
      .filter(item => { if (seen.has(item.resourceId)) return false; seen.add(item.resourceId); return true })
      .slice(0, CONTINUE_LIMIT).map(({ resourceId, addedAt, lastContinuedAt }) => ({ resourceId, addedAt, lastContinuedAt }))
  } catch { return [] }
}

export function createContinueStore(storage: StorageAccess, validIds: Set<string>) {
  let entries: ContinueEntry[] = []
  try { entries = readContinue(storage().getItem(CONTINUE_KEY), validIds) } catch { /* Optional storage. */ }
  const listeners = new Set<() => void>()
  function save(next: ContinueEntry[]) {
    entries = sortEntries(next)
    try { storage().setItem(CONTINUE_KEY, JSON.stringify(entries)) } catch { /* Keep working in memory. */ }
    listeners.forEach(listener => listener())
  }
  const isInContinue = (id: string) => entries.some(entry => entry.resourceId === id)
  function touchContinue(id: string, now = Date.now()) {
    if (isInContinue(id)) save(entries.map(entry => entry.resourceId === id ? { ...entry, lastContinuedAt: Math.max(now, entry.addedAt) } : entry))
  }
  return {
    getSnapshot: () => entries,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    isInContinue, touchContinue,
    addToContinue(id: string, now = Date.now()): 'added' | 'exists' | 'full' | 'invalid' {
      if (!validIds.has(id)) return 'invalid'
      if (isInContinue(id)) return 'exists'
      if (entries.length >= CONTINUE_LIMIT) return 'full'
      save([...entries, { resourceId: id, addedAt: now, lastContinuedAt: null }])
      return 'added'
    },
    removeFromContinue(id: string) {
      if (isInContinue(id)) save(entries.filter(entry => entry.resourceId !== id))
    },
    continueResource(id: string, open: () => void, now = Date.now()) {
      if (!validIds.has(id) || !isInContinue(id)) return
      // Continue enhancement must never prevent the existing single-resource navigation.
      try { touchContinue(id, now) } finally { open() }
    },
  }
}
