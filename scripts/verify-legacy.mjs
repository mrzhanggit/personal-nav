import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

export function verifyFiles(directory, manifest, { currentData = false } = {}) {
  assert.equal(manifest.algorithm, 'sha256')
  assert.equal(manifest.baselineFileCount, 54)
  assert.equal(manifest.protectedFileCount, 53)
  assert.equal(manifest.files.length, 53)
  assert.equal(new Set(manifest.files.map((file) => file.path)).size, 53)
  assert.equal(manifest.replaceable.path, 'index.html')
  for (const file of manifest.files) {
    if (currentData && file.path === 'links.json') continue;
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
  assert.equal(new Set(resources.map((resource) => resource.id)).size, resources.length)
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

const requiredText = value => typeof value === 'string' && value.trim().length > 0
function validUrl(value) {
  assert(requiredText(value) && value === value.trim(), 'Invalid URL')
  assert(!/[\\\s]/u.test(value) && !value.startsWith('//'), 'Invalid URL')
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    const url = new URL(value)
    assert(['https:', 'http:'].includes(url.protocol) && !url.username && !url.password, 'Unsupported URL')
  } else {
    assert(!value.startsWith('/') && !decodeURIComponent(value).split('/').includes('..'), 'Invalid local URL')
    new URL(value, 'https://mrzhanggit.github.io/personal-nav/')
  }
}
export function validateNavigation(data, expectedCount) {
  assert(data && ['title', 'subtitle', 'footer'].every(key => requiredText(data[key])), 'Invalid navigation metadata')
  assert(Array.isArray(data.categories), 'Invalid categories')
  const categories = new Set(), titles = new Set(), urls = new Set(), rows = []
  for (const category of data.categories) {
    assert(requiredText(category.name) && !categories.has(category.name) && Array.isArray(category.links), 'Invalid/duplicate category')
    categories.add(category.name)
    for (const link of category.links) {
      assert(link && ['title', 'subtitle', 'emoji', 'tag'].every(key => requiredText(link[key])), 'Invalid navigation resource')
      validUrl(link.url)
      assert(!titles.has(link.title) && !urls.has(link.url), 'Duplicate navigation resource')
      titles.add(link.title); urls.add(link.url)
      rows.push({ ...link, legacyCategory: category.name })
    }
  }
  if (expectedCount !== undefined) assert.equal(rows.length, expectedCount, 'Unexpected navigation resource count')
  return rows
}
export function validateCurrentData(current, publicData, resources, spaces, original, baselineResources) {
  const rows = validateNavigation(current)
  validateNavigation(publicData)
  assert.deepEqual(publicData, current, 'Root/public navigation drift')
  const oldRows = validateNavigation(original, 23)
  assert.equal(resources.length, rows.length, 'Root/V1 resource count drift')
  const ids = new Set(), names = new Set(), urls = new Set(), spaceIds = new Set(spaces.map(space => space.id))
  const kinds = new Set(baselineResources.map(resource => resource.kind))
  const categories = new Set(baselineResources.map(resource => resource.category))
  const hostingTypes = new Set(baselineResources.map(resource => resource.hostingType))
  for (const resource of resources) {
    assert(resource && typeof resource.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource.id) && !ids.has(resource.id), 'Invalid/duplicate resource ID')
    assert(!names.has(resource.name) && !urls.has(resource.url), 'Duplicate V1 resource')
    ids.add(resource.id); names.add(resource.name); urls.add(resource.url)
    validUrl(resource.url)
    assert(spaceIds.has(resource.space), 'Invalid Space')
    assert(kinds.has(resource.kind) && categories.has(resource.category) && hostingTypes.has(resource.hostingType), 'Invalid resource enum')
    const row = rows.find(row => row.title === resource.name)
    assert(row, 'V1 resource missing from current navigation')
    assert.deepEqual([resource.description, resource.url, resource.icon, resource.legacyCategory], [row.subtitle, row.url, row.emoji, row.legacyCategory], 'Root/V1 semantic drift')
  }
  for (const old of oldRows) {
    const currentRow = rows.find(row => row.title === old.title)
    assert(currentRow, 'Original resource missing')
    if (old.title !== '个人资产看板') assert.deepEqual(currentRow, old, 'Unapproved original resource change')
  }
  for (const old of baselineResources) {
    const resource = resources.find(resource => resource.id === old.id)
    assert(resource, 'Original resource ID missing')
    const expected = old.id === 'asset-dashboard' ? { ...old, url: 'https://assets.mrzhang.ccwu.cc/', description: '港股 / 美股 / 加密货币持仓 · 🔒 密码保护 · 仅本人可见', hostingType: 'custom-domain' } : old
    assert.deepEqual(resource, expected, 'Unapproved V1 resource change')
  }
  const added = resources.find(resource => resource.id === 'fengtang-zhengdao')
  assert(added, 'Missing fengtang-zhengdao')
  assert.deepEqual([added.name, added.url, added.description, added.icon, added.space, added.legacyCategory, added.kind, added.category, added.hostingType],
    ['冯唐《正道》精读', 'https://chengbin.vip/fengtang-zhengdao/', '40 课交互式学习 · 讲《道德经》的管理哲学', '🌊', 'learn', '文章库', 'learning-project', '文章档案', 'custom-domain'])
}
export function verifySnapshot(bytes, manifest) {
  assert.equal(sha256(bytes), manifest.files.find(file => file.path === 'links.json').sha256, 'Historical snapshot changed')
  validateNavigation(JSON.parse(bytes), 23)
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
  const snapshot = readFileSync(join(root, 'docs/zcb-personal-os/data/legacy-links.original.json'))
  verifySnapshot(snapshot, manifest)
  const current = JSON.parse(readFileSync(join(root, 'links.json')))
  const publicBytes = readFileSync(join(root, 'public/links.json'))
  assert.deepEqual(publicBytes, readFileSync(join(root, 'links.json')), 'Root/public bytes drift')
  const baselineResources = JSON.parse(execFileSync('git', ['show', 'f8a92cb64230a1ccd87be99be679c3d4fd0eacbf:docs/zcb-personal-os/data/links.v1.json'], { cwd: root }))
  validateCurrentData(current, JSON.parse(publicBytes), resources,
    JSON.parse(readFileSync(join(root, 'docs/zcb-personal-os/data/spaces.v1.json'))), JSON.parse(snapshot), baselineResources)
  console.log(`PASS legacy snapshot: frozen 23 resources; root/public/V1 current data: ${resources.length} resources validated`)
  for (const directory of ['.', 'public', 'dist', '.phase-a-build']) {
    verifyFiles(join(root, directory), manifest, { currentData: directory !== 'dist' })
    if (directory === '.phase-a-build') assert.deepEqual(readFileSync(join(root, directory, 'links.json')), publicBytes, 'Built current navigation drift')
    const counts = verifyReferences(join(root, directory), resources)
    console.log(`PASS ${directory}: ${directory === 'dist' ? '53/53 frozen legacy' : '52/52 static legacy protected + current links validated'}; CLI key unchanged; ${counts.internal} local references, ${counts.external} external URLs parsed`)
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
