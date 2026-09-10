import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resourcesForSpace } from '../src/lib/spaces.ts'
import { createFavoritesStore, FAVORITES_KEY } from '../src/lib/favorites.ts'
import { createRecentStore, RECENT_KEY } from '../src/lib/recent.ts'
import { resourceHref } from '../src/lib/search.ts'
const read = file => JSON.parse(readFileSync(new URL(`../docs/zcb-personal-os/data/${file}`, import.meta.url)))
const resources = read('links.v1.json')
const spaces = read('spaces.v1.json')

test('six real Spaces partition all current unique resources exactly once', () => {
  assert.deepEqual(spaces.map(s => s.id), ['ai','work','learn','invest','create','life'])
  const mapped = spaces.flatMap(space => resourcesForSpace(resources,space.id))
  assert.equal(mapped.length,resources.length)
  assert.equal(new Set(mapped.map(r => r.id)).size,resources.length)
  assert.deepEqual(mapped.map(r => r.id).sort(),resources.map(r => r.id).sort())
  for (const resource of resources) {
    assert.deepEqual(spaces.filter(s => resourcesForSpace(resources,s.id).includes(resource)).map(s => s.id),[resource.space])
  }
})
test('Space selection retains original resource objects/order; complete counts and empty Spaces are honest', () => {
  assert.deepEqual(spaces.map(s => resourcesForSpace(resources,s.id).length),spaces.map(s => resources.filter(r => r.space === s.id).length))
  for (const space of spaces) {
    const selected=resourcesForSpace(resources,space.id)
    assert.deepEqual(selected,resources.filter(r => r.space === space.id))
    selected.forEach(r => assert.equal(resources.find(original => original.id === r.id),r))
  }
  assert.deepEqual(resourcesForSpace(resources,'unknown'),[])
})
test('browsing and favoriting Space resources do not affect Recent; opening uses original URL and records Recent', () => {
  const values=new Map()
  const storage={getItem:key => values.get(key) ?? null,setItem:(key,value) => values.set(key,value)}
  const ids=new Set(resources.map(r => r.id))
  const favorites=createFavoritesStore(() => storage,ids)
  const recent=createRecentStore(() => storage,ids)
  const resource=resourcesForSpace(resources,'ai').find(r => r.hostingType === 'internal-static')
  favorites.addFavorite(resource.id)
  spaces.forEach(s => resourcesForSpace(resources,s.id))
  assert.equal(values.has(RECENT_KEY),false)
  assert.equal(favorites.isFavorite(resource.id),true)
  let opened
  recent.openResource(resource.id,resourceHref(resource,'/personal-nav/'),href => {opened=href})
  assert.equal(opened,'/personal-nav/'+resource.url)
  assert.equal(recent.getSnapshot()[0].resourceId,resource.id)
  const previous=values.get(RECENT_KEY)
  favorites.removeFavorite(resource.id)
  assert.equal(values.get(RECENT_KEY),previous)
  assert.deepEqual(JSON.parse(values.get(FAVORITES_KEY)),[])
})
