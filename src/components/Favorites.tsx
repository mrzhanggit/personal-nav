import { createContext, useContext, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import resources from '../../docs/zcb-personal-os/data/links.v1.json'
import { createFavoritesStore } from '../lib/favorites'
import type { Resource } from '../lib/search'
import { Icon } from './Icon'
import './favorites.css'

const FavoritesContext = createContext<ReturnType<typeof createFavoritesStore> | null>(null)
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createFavoritesStore(() => window.localStorage, new Set(resources.map(resource => resource.id))))
  return <FavoritesContext.Provider value={store}>{children}</FavoritesContext.Provider>
}
export function useFavorites() {
  const store = useContext(FavoritesContext)
  if (!store) throw new Error('FavoritesProvider is required')
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return { entries, ...store }
}
export function FavoriteButton({ resource }: { resource: Resource }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(resource.id)
  const label = `${favorite ? '取消收藏' : '收藏'} ${resource.name}`
  return <button type="button" className="favorite-button" aria-label={label} aria-pressed={favorite} title={label}
    onClick={event => { event.stopPropagation(); toggleFavorite(resource.id) }}><Icon name="star" /></button>
}
