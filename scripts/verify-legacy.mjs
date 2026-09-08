import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

export function verifyFiles(directory, manifest) {
  assert.equal(manifest.algorithm, 'sha256')
  assert.equal(manifest.baselineFileCount, 54)
  assert.equal(manifest.protectedFileCount, 53)
  assert.equal(manifest.files.length, 53)
  assert.equal(new Set(manifest.files.map((file) => file.path)).size, 53)
  assert.equal(manifest.replaceable.path, 'index.html')
  for (const file of manifest.files) {
    assert(!file.path.startsWith('/') && !file.path.includes('..') && !file.path.includes('\\'))
    assert.notEqual(file.path, 'index.html', 'Homepage must not be in the invariant set')
    assert.match(file.sha256, /^[a-f0-9]{64}$/)
    const location = join(directory, file.path)
    assert(statSync(location).isFile(), `Missing legacy file: ${location}`)
    assert.equal(sha256(readFileSync(location)), file.sha256, `Legacy hash mismatch: ${location}`)
  }
  const cli = readFileSync(join(directory, 'cli-course.html'), 'utf8')
  assert.match(cli, /var STORE_KEY=['"]cli-course\.save\.v1['"];/, 'CLI storage key changed')
}

export function verifyReferences(directory, resources) {
  assert.equal(resources.length, 23, 'All 23 legacy resources must remain')
  assert.equal(new Set(resources.map((resource) => resource.id)).size, 23)
  const base = new URL('https://mrzhanggit.github.io/personal-nav/')
  let internal = 0
  let external = 0
  for (const resource of resources) {
    assert.equal(typeof resource.url, 'string')
    assert(resource.url.trim(), `Empty URL: ${resource.id}`)
    const url = new URL(resource.url, base)
    assert(['http:', 'https:'].includes(url.protocol), `Unsupported URL: ${resource.id}`)
    if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) {
      let relative = decodeURIComponent(url.pathname.slice(base.pathname.length))
      assert(!relative.split('/').includes('..') && !relative.includes('\\'))
      if (!relative || relative.endsWith('/')) relative += 'index.html'
      assert(statSync(join(directory, relative)).isFile(), `Unresolved reference: ${resource.id}`)
      internal++
    } else {
      assert.notEqual(resource.hostingType, 'internal-static', `Internal URL escapes base: ${resource.id}`)
      assert(URL.canParse(resource.url), `External URL must be absolute: ${resource.id}`)
      external++
    }
  }
  return { internal, external }
}

function main() {
  const manifest = JSON.parse(readFileSync(join(root, 'docs/zcb-personal-os/data/legacy-hash-manifest.json')))
  const resources = JSON.parse(readFileSync(join(root, 'docs/zcb-personal-os/data/links.v1.json')))
  // Verify the checked-in manifest against the original Git objects, never regenerate it on build.
  assert.match(manifest.baselineCommit, /^[a-f0-9]{40}$/)
  const baselinePaths = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', manifest.baselineCommit, '--', 'dist/'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
  assert.equal(baselinePaths.length, 54)
  assert.deepEqual(manifest.files.map((file) => `dist/${file.path}`).sort(), baselinePaths.filter((path) => path !== 'dist/index.html').sort())
  for (const file of [...manifest.files, manifest.replaceable]) {
    const bytes = execFileSync('git', ['show', `${manifest.baselineCommit}:dist/${file.path}`], { cwd: root })
    assert.equal(sha256(bytes), file.sha256, `Manifest differs from baseline: ${file.path}`)
  }
  for (const directory of ['.', 'public', 'dist', '.phase-a-build']) {
    verifyFiles(join(root, directory), manifest)
    const counts = verifyReferences(join(root, directory), resources)
    console.log(`PASS ${directory}: 53 legacy hashes; CLI key unchanged; ${counts.internal} local references, ${counts.external} external URLs parsed`)
  }
  assert(statSync(join(root, 'nav.html')).isFile(), 'Keep nav.html for rollback')
  const homepage = readFileSync(join(root, '.phase-a-build/index.html'), 'utf8')
  const scripts = [...homepage.matchAll(/<script\b[^>]*src="([^"]+)"/g)]
  assert(scripts.length > 0, 'Built React entry missing')
  for (const [, url] of scripts) {
    assert(url.startsWith('/personal-nav/'), 'Built entry must use the Pages base')
    assert(statSync(join(root, '.phase-a-build', url.slice('/personal-nav/'.length))).isFile())
  }
  console.log('PASS built homepage and /personal-nav/ asset paths')
  console.log('KNOWN ISSUE (not fixed): timeline/{france,renaissance}/00-风格选择.html is absent; see 07-phase-a-legacy-safety-layer.md')
  console.log('External URL parsing does not assert remote availability. No network requests made.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() } catch (error) {
    console.error(`FAIL legacy verification: ${error.message}`)
    process.exitCode = 1
  }
}
