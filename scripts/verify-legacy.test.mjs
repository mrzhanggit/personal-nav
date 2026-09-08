import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, cpSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyFiles, verifyReferences } from './verify-legacy.mjs'

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
  verifyFiles(directory, manifest)
  assert.deepEqual(verifyReferences(directory, resources), { internal: 10, external: 13 })
})

test('missing protected file fails', (t) => {
  const directory = fixture(t)
  renameSync(join(directory, 'links.json'), join(directory, 'links.missing'))
  assert.throws(() => verifyFiles(directory, manifest), /ENOENT/)
})

test('changed bytes fail', (t) => {
  const directory = fixture(t)
  writeFileSync(join(directory, 'links.json'), '{}')
  assert.throws(() => verifyFiles(directory, manifest), /hash mismatch/)
})

test('changed CLI storage key fails', (t) => {
  const directory = fixture(t)
  const file = join(directory, 'cli-course.html')
  writeFileSync(file, readFileSync(file, 'utf8').replace('cli-course.save.v1', 'cli-course.save.v2'))
  assert.throws(() => verifyFiles(directory, manifest), /hash mismatch/)
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
