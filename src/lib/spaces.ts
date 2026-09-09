export type AppView = { kind: 'home' } | { kind: 'favorites' } | { kind: 'workspace' } | { kind: 'space'; spaceId: string }

export function resourcesForSpace<T extends { space: string }>(resources: readonly T[], spaceId: string): T[] {
  return resources.filter(resource => resource.space === spaceId)
}
