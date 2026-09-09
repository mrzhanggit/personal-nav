import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createFavoritesStore, readFavorites, FAVORITES_KEY } from '../src/lib/favorites.ts'
import { createRecentStore, RECENT_KEY } from '../src/lib/recent.ts'
import { resourceHref } from '../src/lib/search.ts'
const resources = JSON.parse(readFileSync(new URL('../docs/zcb-personal-os/data/links.v1.json', import.meta.url)))
const ids = new Set(resources.map(r => r.id))
const [a,b] = resources.map(r => r.id)
function fixture(raw = null) {
  const data = new Map([[FAVORITES_KEY,raw],['cli-course.save.v1','preserved']])
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value) }
  return { data, storage, store:createFavoritesStore(() => storage,ids) }
}
test('first favorite stores only ID/time; duplicate additions do not reorder or duplicate', () => {
  const {store,data} = fixture()
  assert.deepEqual(store.getSnapshot(),[])
  store.addFavorite(a,1000); store.addFavorite(b,2000); store.addFavorite(a,3000)
  assert.deepEqual(JSON.parse(data.get(FAVORITES_KEY)),[{resourceId:b,favoritedAt:2000},{resourceId:a,favoritedAt:1000}])
})
test('remove, toggle, re-add and refresh preserve latest-favorite-first order', () => {
  const {store,storage} = fixture()
  store.addFavorite(a,1000); store.addFavorite(b,2000); store.removeFavorite(a)
  assert.equal(store.isFavorite(a),false)
  store.toggleFavorite(a)
  assert.equal(store.getSnapshot()[0].resourceId,a)
  assert.deepEqual(createFavoritesStore(() => storage,ids).getSnapshot(),store.getSnapshot())
  store.toggleFavorite(a); store.removeFavorite(b)
  assert.deepEqual(store.getSnapshot(),[])
})
test('missing or corrupt storage falls back to empty', () => {
  for (const raw of [null,'{','{}','null','42','"text"']) assert.deepEqual(fixture(raw).store.getSnapshot(),[])
})
test('invalid IDs/timestamps, duplicates and removed resources are filtered and extra data stripped', () => {
  const row = {resourceId:a,favoritedAt:2000}
  assert.deepEqual(readFavorites(JSON.stringify([null,3,{},row,{...row,url:'private'}, {...row,favoritedAt:1000},
    {...row,resourceId:'missing'}, {...row,favoritedAt:-1}, {...row,favoritedAt:Date.now()+100000}]),ids),[row])
  assert.deepEqual(readFavorites(JSON.stringify([row]),new Set()),[])
  const {store} = fixture(); store.addFavorite('missing'); assert.deepEqual(store.getSnapshot(),[])
})
test('storage access/read/write exceptions retain functional in-memory state', () => {
  const fail = () => { throw Error('blocked') }
  for (const access of [fail, () => ({getItem:fail,setItem:fail}), () => ({getItem:() => null,setItem:fail})]) {
    const store = createFavoritesStore(access,ids)
    store.addFavorite(a); assert.equal(store.isFavorite(a),true)
    store.removeFavorite(a); assert.equal(store.isFavorite(a),false)
  }
})
test('all 23 real resources can be favorited without duplicates', () => {
  const {store} = fixture()
  for (const id of ids) { store.addFavorite(id); store.addFavorite(id) }
  assert.equal(store.getSnapshot().length,23)
})
test('subscribers synchronize and unsubscribe; unchanged operations do not notify', () => {
  const {store} = fixture(); let updates=0
  const off=store.subscribe(() => updates++)
  store.addFavorite(a); store.addFavorite(a); store.removeFavorite('missing')
  assert.equal(updates,1)
  store.removeFavorite(a); assert.equal(updates,2)
  off(); store.addFavorite(a); assert.equal(updates,2)
})
test('Favorites and Recent stay independent; opening a favorite records Recent using the shared open path', () => {
  const {store,storage,data} = fixture()
  const recent = createRecentStore(() => storage,ids)
  store.addFavorite(a)
  assert.equal(data.has(RECENT_KEY),false)
  const savedFavorites=data.get(FAVORITES_KEY)
  let opened
  const resource=resources.find(r => r.id === store.getSnapshot()[0].resourceId)
  recent.openResource(resource.id,resourceHref(resource,'/personal-nav/'),href => {opened=href})
  assert.equal(opened,resourceHref(resource,'/personal-nav/'))
  assert.equal(recent.getSnapshot()[0].resourceId,a)
  assert.equal(data.get(FAVORITES_KEY),savedFavorites)
  const savedRecent=data.get(RECENT_KEY)
  store.removeFavorite(a)
  assert.equal(data.get(RECENT_KEY),savedRecent)
  assert.equal(data.get('cli-course.save.v1'),'preserved')
})
