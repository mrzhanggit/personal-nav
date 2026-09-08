import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createSearchIndex, searchResources, resourceHref, paletteAction, nextSelection } from '../src/lib/search.ts'

const read = name => JSON.parse(readFileSync(new URL(`../docs/zcb-personal-os/data/${name}.v1.json`, import.meta.url)))
const resources = read('links')
const index = createSearchIndex(resources, read('spaces'))

test('all 23 real resources are indexed and individually searchable', () => {
  assert.equal(index.length, 23)
  assert.equal(searchResources(index, '').length, 23)
  for (const resource of resources) assert.equal(searchResources(index, resource.name)[0].resource.id, resource.id)
})
test('Chinese, English, case, substring, Space and typo matching', () => {
  for (const query of ['Python', 'PYTHON', 'pyth', 'pyton']) assert(searchResources(index, query).some(x => x.resource.id === 'python-course'))
  assert(searchResources(index, '历史').length > 0)
  assert(searchResources(index, 'Claude').some(x => x.resource.id === 'claude-code-course'))
  assert.equal(searchResources(index, '阅读学习').filter(x => x.resource.space === 'learn').length, 15)
  assert.deepEqual(searchResources(index, 'zzzz不存在的资源zzzz'), [])
})
test('ranking respects title, tags, description and metadata priorities', () => {
  const rows = [
    { name:'other', space:'python' }, { name:'other', description:'python', space:'x' },
    { name:'other', tags:['python'], space:'x' }, { name:'learn python', space:'x' },
    { name:'python course', space:'x' }, { name:'python', space:'x' },
  ].map((r,i) => ({ ...r, id:String(i), url:'course.html' }))
  assert.deepEqual(searchResources(createSearchIndex(rows, []), 'python').map(x => x.resource.id), ['5','4','3','2','1','0'])
})
test('base paths and every external URL are preserved', () => {
  for (const resource of resources) {
    for (const base of ['/personal-nav/', '/']) {
      assert.equal(resourceHref(resource, base), resource.hostingType === 'internal-static' ? base + resource.url : resource.url)
    }
  }
  assert.equal(resourceHref({url:'/timeline/rome/index.html'}, '/personal-nav/'), '/personal-nav/timeline/rome/index.html')
  assert.throws(() => resourceHref({url:'javascript:alert(1)'}, '/'), /Unsupported/)
})
test('keyboard mapping: toggles, Escape, arrows, Enter; composing input is ignored', () => {
  assert.equal(paletteAction({key:'k',metaKey:true}), 'toggle')
  assert.equal(paletteAction({key:'K',ctrlKey:true}), 'toggle')
  assert.equal(paletteAction({key:'k',ctrlKey:true,repeat:true}), 'ignore')
  assert.equal(paletteAction({key:'Escape'}), 'close')
  assert.equal(paletteAction({key:'ArrowDown'}), 'next')
  assert.equal(paletteAction({key:'ArrowUp'}), 'previous')
  assert.equal(paletteAction({key:'Enter'}), 'open')
  assert.equal(paletteAction({key:'Enter',isComposing:true}), null)
})
test('selection wraps safely, including no results', () => {
  assert.equal(nextSelection(0,-1,23),22)
  assert.equal(nextSelection(22,1,23),0)
  assert.equal(nextSelection(0,1,0),0)
})
