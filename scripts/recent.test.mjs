import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRecentStore, parseRecent, RECENT_KEY, relativeTime } from '../src/lib/recent.ts'
import { resourceHref } from '../src/lib/search.ts'

const resources = JSON.parse(readFileSync(new URL('../docs/zcb-personal-os/data/links.v1.json', import.meta.url)))
const ids = new Set(resources.map(r => r.id))
function fixture(initial = null) {
  const values = new Map([[RECENT_KEY, initial], ['cli-course.save.v1', 'untouched']])
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  return { values, storage, store: createRecentStore(() => storage, ids) }
}

test('first open records only the three fields before navigation; reads do not record', () => {
  const { store, values } = fixture()
  assert.deepEqual(store.getSnapshot(), [])
  store.openResource(resources[0].id, resources[0].url, url => {
    assert.equal(url, resources[0].url)
    assert.deepEqual(JSON.parse(values.get(RECENT_KEY)), [{ resourceId: resources[0].id, lastOpenedAt: 1000, openCount: 1 }])
  }, 1000)
  assert.equal(values.get('cli-course.save.v1'), 'untouched')
})

test('repeated open updates count and time, deduplicates and moves to front', () => {
  const { store } = fixture()
  store.openResource(resources[0].id, '/', () => {}, 1000)
  store.openResource(resources[1].id, '/', () => {}, 2000)
  store.openResource(resources[0].id, '/', () => {}, 3000)
  assert.equal(store.getSnapshot().length, 2)
  assert.deepEqual(store.getSnapshot()[0], { resourceId: resources[0].id, lastOpenedAt: 3000, openCount: 2 })
  assert.equal(store.getSnapshot()[1].resourceId, resources[1].id)
})

test('all 23 resources navigate correctly, retaining only the latest 20', () => {
  const { store } = fixture()
  const opened = []
  resources.forEach((resource, index) => store.openResource(resource.id, resourceHref(resource, '/personal-nav/'), url => opened.push(url), 1000 + index))
  assert.equal(opened.length, 23)
  resources.forEach((resource, index) => assert.equal(opened[index], resource.hostingType === 'internal-static' ? '/personal-nav/' + resource.url : resource.url))
  assert.deepEqual(store.getSnapshot().map(r => r.resourceId), resources.slice(3).reverse().map(r => r.id))
})

test('reload preserves records, sorts and filters duplicates and unexpected entries', () => {
  const row = { resourceId: resources[0].id, lastOpenedAt: 2000, openCount: 3 }
  const data = [null, {}, 3, { ...row, resourceId:'not-real' }, { ...row, openCount:-1 }, { ...row, lastOpenedAt:'yesterday' },
    { ...row, lastOpenedAt:Date.now() + 100000 }, { ...row, lastOpenedAt:1000 }, { ...row, extra:'not stored' }]
  assert.deepEqual(parseRecent(JSON.stringify(data), ids), [row])
  const { store, storage } = fixture()
  store.openResource(resources[0].id, '/', () => {}, 2000)
  assert.deepEqual(createRecentStore(() => storage, ids).getSnapshot(), store.getSnapshot())
})

test('missing, malformed and non-array storage safely fall back to empty', () => {
  for (const raw of [null, '{broken', '{}', 'null', '42', '"hello"']) assert.deepEqual(fixture(raw).store.getSnapshot(), [])
})

test('storage getter, read and write failures never prevent opening', () => {
  const fail = () => { throw new Error('Storage unavailable') }
  for (const storage of [fail, () => ({ getItem:fail, setItem:fail }), () => ({ getItem:() => null, setItem:fail })]) {
    const store = createRecentStore(storage, ids)
    let opens = 0
    store.openResource(resources[0].id, '/', () => opens++)
    assert.equal(opens, 1)
    assert.equal(store.getSnapshot().length, 1)
    store.openResource(resources[0].id, '/', () => opens++)
    assert.equal(store.getSnapshot()[0].openCount, 2)
    assert.equal(opens, 2)
  }
})

test('subscribers update once per open, unknown IDs do not create fake records', () => {
  const { store } = fixture()
  let updates = 0, opens = 0
  const unsubscribe = store.subscribe(() => updates++)
  store.openResource('not-real', '/', () => opens++)
  assert.equal(opens, 0)
  store.openResource(resources[0].id, '/', () => opens++)
  assert.equal(updates, 1)
  unsubscribe()
  store.openResource(resources[0].id, '/', () => opens++)
  assert.equal(updates, 1)
})

test('relative times are calculated from render time without timers', () => {
  const now = 100000000
  assert.equal(relativeTime(now, now), '刚刚')
  assert.equal(relativeTime(now - 5 * 60000, now), '5 分钟前')
  assert.equal(relativeTime(now - 2 * 3600000, now), '2 小时前')
  assert.equal(relativeTime(now - 2 * 86400000, now), '2 天前')
})
