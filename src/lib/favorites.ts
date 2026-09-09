export const FAVORITES_KEY = 'zcb-os:favorites'
export type FavoriteEntry = { resourceId: string; favoritedAt: number }
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>

export function readFavorites(raw: string | null, validIds: Set<string>): FavoriteEntry[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(data)) return []
    const seen = new Set<string>()
    return data.filter((item): item is FavoriteEntry => Boolean(item &&
      validIds.has(item.resourceId) && Number.isSafeInteger(item.favoritedAt) &&
      item.favoritedAt > 0 && item.favoritedAt <= Date.now()))
      .sort((a, b) => b.favoritedAt - a.favoritedAt)
      .filter(item => { if (seen.has(item.resourceId)) return false; seen.add(item.resourceId); return true })
      .map(({ resourceId, favoritedAt }) => ({ resourceId, favoritedAt }))
  } catch { return [] }
}

export function createFavoritesStore(storage: StorageAccess, validIds: Set<string>) {
  let entries: FavoriteEntry[] = []
  try { entries = readFavorites(storage().getItem(FAVORITES_KEY), validIds) } catch { /* Optional storage. */ }
  const listeners = new Set<() => void>()
  function save(next: FavoriteEntry[]) {
    entries = next
    try { storage().setItem(FAVORITES_KEY, JSON.stringify(entries)) } catch { /* Continue in memory. */ }
    listeners.forEach(listener => listener())
  }
  const isFavorite = (id: string) => entries.some(entry => entry.resourceId === id)
  function addFavorite(id: string, now = Date.now()) {
    if (!validIds.has(id) || isFavorite(id)) return
    save([{ resourceId: id, favoritedAt: now }, ...entries])
  }
  function removeFavorite(id: string) {
    if (isFavorite(id)) save(entries.filter(entry => entry.resourceId !== id))
  }
  return {
    getSnapshot: () => entries,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    isFavorite, addFavorite, removeFavorite,
    toggleFavorite(id: string) { if (isFavorite(id)) removeFavorite(id); else addFavorite(id) },
  }
}
