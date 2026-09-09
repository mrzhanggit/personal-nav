import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveWorkspace, launchWorkspace, openWorkspaceWindow, launchMessage } from '../src/lib/workspaces.ts'
import { resourceHref } from '../src/lib/search.ts'
import { createRecentStore, RECENT_KEY } from '../src/lib/recent.ts'
import { createFavoritesStore, FAVORITES_KEY } from '../src/lib/favorites.ts'
const read = file => JSON.parse(readFileSync(new URL(`../docs/zcb-personal-os/data/${file}`, import.meta.url)))
const resources = read('links.v1.json'), workspaces = read('workspaces.v1.json')
const href = resource => resourceHref(resource, '/personal-nav/')
const resolve = links => resolveWorkspace({ links }, resources)

test('real Workspace configuration maps only real IDs with counts 0/3/3/2', () => {
  assert.deepEqual(workspaces.map(w => resolveWorkspace(w, resources).items.length), [0,3,3,2])
  for (const workspace of workspaces) {
    const parsed = resolveWorkspace(workspace, resources)
    assert.deepEqual(parsed.invalidIds, [], `Invalid resource IDs in ${workspace.id}: ${parsed.invalidIds}`)
    assert.deepEqual(parsed.items.map(r => r.id), workspace.links)
    parsed.items.forEach(r => assert.equal(r, resources.find(original => original.id === r.id)))
  }
})
test('empty, invalid and duplicate IDs resolve safely in first-occurrence order', () => {
  assert.deepEqual(resolve([]), {items:[], invalidIds:[]})
  const result = resolve(['cli-course','missing','cli-course','python-course','missing'])
  assert.deepEqual(result.items.map(r => r.id), ['cli-course','python-course'])
  assert.deepEqual(result.invalidIds, ['missing'])
})
test('empty launch never opens or records and explains empty state', () => {
  const result = launchWorkspace([], {href, open:()=>assert.fail(), recordSuccess:()=>assert.fail()})
  assert.equal(launchMessage(result), '没有可启动资源')
})
test('single internal resource uses BASE_URL; duplicates open and record only once', () => {
  const resource = resources.find(r => r.id === 'cli-course'), calls=[]
  const result = launchWorkspace([resource,resource], {href, open:url=>{calls.push(url);return 'success'}, recordSuccess:r=>calls.push(r.id)})
  assert.deepEqual(calls, ['/personal-nav/cli-course.html','cli-course'])
  assert.deepEqual(result, [{resourceId:'cli-course',status:'success'}])
})
test('multi launch preserves external URLs and records only success without touching Favorites', () => {
  const values = new Map(), storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}
  const ids=new Set(resources.map(r=>r.id)), recent=createRecentStore(()=>storage,ids), favorites=createFavoritesStore(()=>storage,ids)
  favorites.addFavorite('cli-course')
  const before=values.get(FAVORITES_KEY), items=resolveWorkspace(workspaces[2],resources).items, calls=[]
  const result=launchWorkspace(items,{href,open:url=>{calls.push(url); if(calls.length===3)throw Error('navigation failed');return calls.length===1?'success':'blocked'},recordSuccess:(r,url)=>recent.openResource(r.id,url,()=>{})})
  assert.deepEqual(calls,items.map(r=>r.url))
  assert.deepEqual(result.map(r=>r.status),['success','blocked','failed'])
  assert.deepEqual(recent.getSnapshot().map(r=>r.resourceId),[items[0].id])
  assert.deepEqual(Object.keys(JSON.parse(values.get(RECENT_KEY))[0]).sort(),['lastOpenedAt','openCount','resourceId'])
  assert.equal(values.get(FAVORITES_KEY),before)
  assert.match(launchMessage(result),/已打开 1 \/ 3.*1 个窗口被浏览器阻止.*1 个资源启动失败/)
})
test('invalid URL fails before opening; later resources still launch; recording failure does not stop launch', () => {
  let opens=0
  const items=[{...resources[0],id:'bad',url:'javascript:alert(1)'},...resolve(['cli-course','python-course']).items]
  const result=launchWorkspace(items,{href,open:()=>{opens++;return 'success'},recordSuccess:()=>{throw Error('subscriber')}})
  assert.equal(opens,2)
  assert.deepEqual(result.map(r=>r.status),['failed','success','success'])
})
function fakeBrowser({blocked=false,closed=false,fail=false}={}) {
  const events=[], link={remove(){events.push('remove')},click(){events.push(['navigate',this.href,this.target,this.rel,this.referrerPolicy]);if(fail)throw Error('navigation')}}
  const popup={closed, set opener(value){events.push(['opener',value])},document:{createElement:()=>link,body:{append(){}}},close(){events.push('close')}}
  return {events,browser:{location:{href:'https://nav.example/personal-nav/'},open:(...args)=>{events.push(args);return blocked?null:popup}}}
}
test('browser adapter obtains blank window, severs opener then navigates with noreferrer', () => {
  const {events,browser}=fakeBrowser()
  assert.equal(openWorkspaceWindow('/personal-nav/cli-course.html',browser),'success')
  assert.deepEqual(events.slice(0,3),[['about:blank','_blank'],['opener',null],['navigate','https://nav.example/personal-nav/cli-course.html','_self','noopener noreferrer','no-referrer']])
})
test('null window is blocked; closed or throwing navigation fails and closes unused window', () => {
  assert.equal(openWorkspaceWindow('https://example.com',fakeBrowser({blocked:true}).browser),'blocked')
  for(const options of [{closed:true},{fail:true}]) {
    const {events,browser}=fakeBrowser(options)
    assert.throws(()=>openWorkspaceWindow('https://example.com',browser))
    assert.equal(events.at(-1),'close')
  }
})
test('malformed and unsupported URLs never allocate windows', () => {
  for(const url of ['https://[','javascript:alert(1)','data:text/html,test']) {
    const {events,browser}=fakeBrowser()
    assert.throws(()=>openWorkspaceWindow(url,browser))
    assert.deepEqual(events,[])
  }
})
test('all-success batch increments existing Recent counts once per distinct resource', () => {
  const store=createRecentStore(()=>({getItem:()=>null,setItem:()=>{}}),new Set(resources.map(r=>r.id)))
  const items=resolve(['cli-course','python-course']).items
  const launch=()=>launchWorkspace(items,{href,open:()=> 'success',recordSuccess:(r,url)=>store.openResource(r.id,url,()=>{})})
  launch();launch()
  assert.equal(store.getSnapshot().length,2)
  assert.ok(store.getSnapshot().every(r=>r.openCount===2))
})
