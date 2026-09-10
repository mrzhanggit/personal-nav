import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, cpSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyFiles, verifyReferences, validateCurrentData, validateNavigation, verifySnapshot } from './verify-legacy.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(readFileSync(join(root, 'docs/zcb-personal-os/data/legacy-hash-manifest.json')))
const resources = JSON.parse(readFileSync(join(root, 'docs/zcb-personal-os/data/links.v1.json')))

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'zcb-legacy-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  cpSync(join(root, 'public'), directory, { recursive: true })
  return directory
}

test('unchanged copies pass; replacement homepage is excluded', (t) => {
  const directory = fixture(t)
  writeFileSync(join(directory, 'index.html'), '<h1>Replacement</h1>')
  verifyFiles(directory, manifest, { currentData: true })
  assert.deepEqual(verifyReferences(directory, resources), { internal: 10, external: 14 })
})

test('missing protected file fails', (t) => {
  const directory = fixture(t)
  renameSync(join(directory, 'claude-code-course.html'), join(directory, 'course.missing'))
  assert.throws(() => verifyFiles(directory, manifest, { currentData: true }), /ENOENT/)
})

test('changed bytes fail', (t) => {
  const directory = fixture(t)
  writeFileSync(join(directory, 'claude-code-course.html'), '{}')
  assert.throws(() => verifyFiles(directory, manifest, { currentData: true }), /hash mismatch/)
})

test('changed CLI storage key fails', (t) => {
  const directory = fixture(t)
  const file = join(directory, 'cli-course.html')
  writeFileSync(file, readFileSync(file, 'utf8').replace('cli-course.save.v1', 'cli-course.save.v2'))
  assert.throws(() => verifyFiles(directory, manifest, { currentData: true }), /hash mismatch/)
})

test('broken local resource reference fails', (t) => {
  const directory = fixture(t)
  const broken = structuredClone(resources)
  broken.find((resource) => resource.hostingType === 'internal-static').url = 'missing.html'
  assert.throws(() => verifyReferences(directory, broken), /ENOENT/)
})

test('unsupported external URL fails', (t) => {
  const directory = fixture(t)
  const broken = structuredClone(resources)
  broken[0].url = 'javascript:alert(1)'
  assert.throws(() => verifyReferences(directory, broken), /Unsupported URL/)
})

const readData = name => JSON.parse(readFileSync(join(root, 'docs/zcb-personal-os/data', name)))
const current = JSON.parse(readFileSync(join(root, 'links.json')))
const original = readData('legacy-links.original.json')
const spaces = readData('spaces.v1.json')
const { execFileSync } = await import('node:child_process')
const baselineResources = JSON.parse(execFileSync('git', ['show', 'f8a92cb64230a1ccd87be99be679c3d4fd0eacbf:docs/zcb-personal-os/data/links.v1.json'], {cwd:root}))
const validate = (nav=current, pub=current, v1=resources) => validateCurrentData(nav,pub,v1,spaces,original,baselineResources)

test('current root/public/V1 agree while the historical snapshot remains immutable', () => {
  validate(current,JSON.parse(readFileSync(join(root,'public/links.json'))))
  const bytes=readFileSync(join(root,'docs/zcb-personal-os/data/legacy-links.original.json'))
  verifySnapshot(bytes,manifest)
  assert.throws(()=>verifySnapshot(Buffer.concat([bytes,Buffer.from(' ')]),manifest),/snapshot changed/)
})
test('dist retains all 53 frozen files, while public current JSON is not hash-frozen', t => {
  verifyFiles(join(root,'dist'),manifest)
  const directory=fixture(t)
  writeFileSync(join(directory,'links.json'),'{}')
  verifyFiles(directory,manifest,{currentData:true})
  assert.throws(()=>validateNavigation({}),/metadata/)
  assert.throws(()=>verifyFiles(directory,manifest),/hash mismatch/)
})
test('navigation rejects malformed schema, duplicate resources and invalid URLs', () => {
  for(const mutate of [d=>{d.categories[0].links[0].title=''},d=>{d.categories[0].links[1]={...d.categories[0].links[0]}},d=>{d.categories[0].links[0].url='javascript:alert(1)'},d=>{d.categories[0].links[0].url='https://['}]){
    const data=structuredClone(current);mutate(data);assert.throws(()=>validateNavigation(data))
  }
})
test('current validation rejects public drift, duplicate IDs, illegal Space and removed original IDs', () => {
  const pub=structuredClone(current);pub.categories[0].links[0].subtitle='drift';assert.throws(()=>validate(current,pub),/drift/)
  for(const mutate of [v=>{v[1].id=v[0].id},v=>{v[0].space='unknown'},v=>{v[0].id='replaced'},v=>{v.pop()},v=>{v.find(r=>r.id==='fengtang-zhengdao').url='https://wrong.example/'}]){
    const data=structuredClone(resources);mutate(data);assert.throws(()=>validate(current,current,data))
  }
})
test('confirmed asset update cannot drift even if root/public/V1 are changed together', () => {
  const nav=structuredClone(current),v1=structuredClone(resources)
  nav.categories.flatMap(c=>c.links).find(r=>r.title==='个人资产看板').url='https://wrong.example/'
  v1.find(r=>r.id==='asset-dashboard').url='https://wrong.example/'
  assert.throws(()=>validate(nav,nav,v1),/Unapproved V1/)
})

test('additional valid current resource passes without changing a total-count constant; missing mappings fail', () => {
  // Synthetic fixture only: never added to real navigation data.
  const nav=structuredClone(current), v1=structuredClone(resources)
  const added={...resources.find(r=>r.id==='fengtang-zhengdao'),id:'future-resource',name:'Future fixture',url:'https://example.com/future'}
  nav.categories.find(c=>c.name===added.legacyCategory).links.push({title:added.name,subtitle:added.description,url:added.url,emoji:added.icon,tag:'阅读'})
  v1.push(added)
  validate(nav,nav,v1)
  assert.throws(()=>validate(nav,nav,resources),/count drift/)
  const missing=structuredClone(current);missing.categories[0].links.pop()
  assert.throws(()=>validate(missing,missing,resources),/count drift/)
})
