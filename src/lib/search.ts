export type Resource = {
  id: string
  name: string
  url: string
  description?: string
  icon?: string
  space: string
  category?: string
  tags?: string[]
  keywords?: string[]
  aliases?: string[]
  hostingType?: string
}

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ')

export function createSearchIndex(resources: Resource[], spaces: { id: string; name: string }[]) {
  return resources.map(resource => ({
    resource,
    title: normalize(resource.name),
    tags: [...(resource.tags ?? []), ...(resource.keywords ?? []), ...(resource.aliases ?? [])].map(normalize),
    description: normalize(resource.description ?? ''),
    spaceName: spaces.find(space => space.id === resource.space)?.name ?? resource.space,
    metadata: [resource.space, spaces.find(space => space.id === resource.space)?.name ?? '', resource.category ?? ''].map(normalize),
  }))
}

// At most one insertion, deletion or substitution, on words of 3+ characters.
function oneEditApart(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++edits > 1) return false
    if (a.length <= b.length) j++
    if (a.length >= b.length) i++
  }
  return edits + Number(i < a.length || j < b.length) <= 1
}

export function searchResources(index: ReturnType<typeof createSearchIndex>, query: string) {
  const q = normalize(query)
  if (!q) return index
  return index.map((entry, order) => {
    let score = Infinity
    if (entry.title === q) score = 0
    else if (entry.title.startsWith(q)) score = 1
    else if (entry.title.includes(q)) score = 2
    else if (entry.tags.some(tag => tag.includes(q))) score = 3
    else if (entry.description.includes(q)) score = 4
    else if (entry.metadata.some(value => value.includes(q))) score = 5
    else {
      const fields = [entry.title, ...entry.tags, entry.description, ...entry.metadata]
      const terms = q.split(' ')
      if (terms.length > 1 && terms.every(term => fields.some(field => field.includes(term)))) score = 6
      else if (q.length >= 3 && fields.some(field => field.split(/[^\p{L}\p{N}]+/u).some(word => oneEditApart(q, word)))) score = 7
    }
    return { entry, score, order }
  }).filter(item => Number.isFinite(item.score)).sort((a, b) => a.score - b.score || a.order - b.order).map(item => item.entry)
}

export function resourceHref(resource: Pick<Resource, 'url' | 'hostingType'>, base: string) {
  if (/^https?:\/\//i.test(resource.url)) return resource.url
  if (/^[a-z][a-z\d+.-]*:/i.test(resource.url) || resource.url.startsWith('//')) throw new Error('Unsupported resource URL')
  return `${base.replace(/\/$/, '')}/${resource.url.replace(/^(\.\/|\/)+/, '')}`
}

export function paletteAction(event: { key: string; metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean; repeat?: boolean; isComposing?: boolean }) {
  if (event.isComposing) return null
  if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey) return event.repeat ? 'ignore' : 'toggle'
  if (event.key === 'Escape') return 'close'
  if (event.key === 'ArrowDown') return 'next'
  if (event.key === 'ArrowUp') return 'previous'
  if (event.key === 'Enter') return 'open'
  return null
}

export function nextSelection(current: number, direction: number, count: number) {
  return count ? (current + direction + count) % count : 0
}
