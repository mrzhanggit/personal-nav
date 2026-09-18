import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createContinueStore,readContinue,CONTINUE_KEY} from '../src/lib/continue.ts'
import {createRecentStore,RECENT_KEY} from '../src/lib/recent.ts'
import {createFavoritesStore,FAVORITES_KEY} from '../src/lib/favorites.ts'
import {launchWorkspace} from '../src/lib/workspaces.ts'
import {resourceHref} from '../src/lib/search.ts'
const resources=JSON.parse(readFileSync(new URL('../docs/zcb-personal-os/data/links.v1.json',import.meta.url))),ids=new Set(resources.map(r=>r.id)), names=[...ids]
function setup(){const values=new Map(), storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};return {values,storage,store:createContinueStore(()=>storage,ids)}}
test('first add stores minimal fields; duplicate is unchanged; removal permits re-add',()=>{
 const {store,values}=setup();assert.equal(store.addToContinue(names[0],100),'added');const snapshot=store.getSnapshot();assert.equal(store.addToContinue(names[0],200),'exists');assert.equal(store.getSnapshot(),snapshot)
 assert.deepEqual(JSON.parse(values.get(CONTINUE_KEY)),[{resourceId:names[0],addedAt:100,lastContinuedAt:null}]);store.removeFromContinue(names[0]);assert.equal(store.isInContinue(names[0]),false);assert.equal(store.addToContinue(names[0],300),'added')
})
test('three-item limit rejects fourth without replacing or writing',()=>{
 const {store,values}=setup();names.slice(0,3).forEach(id=>store.addToContinue(id));const before=values.get(CONTINUE_KEY);assert.equal(store.addToContinue(names[3]),'full');assert.equal(values.get(CONTINUE_KEY),before);assert.equal(store.getSnapshot().length,3)
})
test('reload restores order; touch updates only lastContinuedAt and sorts by effective time',()=>{
 const {store,storage}=setup();store.addToContinue(names[0],100);store.addToContinue(names[1],200);store.touchContinue(names[0],300)
 const restored=createContinueStore(()=>storage,ids);assert.deepEqual(restored.getSnapshot(),[{resourceId:names[0],addedAt:100,lastContinuedAt:300},{resourceId:names[1],addedAt:200,lastContinuedAt:null}]);restored.addToContinue(names[2],400);assert.equal(restored.getSnapshot()[0].resourceId,names[2])
})
test('missing, corrupt and non-array storage are empty; invalid IDs never enter',()=>{
 for(const raw of [null,'{','null','{}'])assert.deepEqual(readContinue(raw,ids),[])
 const {store}=setup();assert.equal(store.addToContinue('missing'),'invalid');store.touchContinue('missing');store.continueResource('missing',()=>assert.fail());assert.deepEqual(store.getSnapshot(),[])
})
test('historical data filters invalid timestamps/removed IDs, deduplicates, strips fields and caps at three',()=>{
 const data=names.slice(0,5).map((resourceId,i)=>({resourceId,addedAt:100+i,lastContinuedAt:null,extra:'discard'}));data.push({...data[0],lastContinuedAt:300},{resourceId:'removed',addedAt:999,lastContinuedAt:null},{resourceId:names[5],addedAt:0,lastContinuedAt:null},{resourceId:names[6],addedAt:100,lastContinuedAt:50})
 const parsed=readContinue(JSON.stringify(data),ids);assert.equal(parsed.length,3);assert.deepEqual(parsed.map(x=>x.resourceId),[names[0],names[4],names[3]]);assert.deepEqual(Object.keys(parsed[0]),['resourceId','addedAt','lastContinuedAt']);assert.deepEqual(readContinue(JSON.stringify(parsed),new Set()),[])
})
test('storage read/write errors retain in-memory operations and never block opening',()=>{
 for(const storage of [()=>{throw Error('access')},()=>({getItem(){throw Error('read')},setItem(){throw Error('write')}})]){
 const store=createContinueStore(storage,ids);store.addToContinue(names[0]);let opened=0;store.continueResource(names[0],()=>opened++);assert.equal(opened,1);assert.ok(store.getSnapshot()[0].lastContinuedAt);store.removeFromContinue(names[0]);assert.equal(store.getSnapshot().length,0)
 }
})
test('subscribers synchronize, unsubscribe, and no-op operations do not notify',()=>{
 const {store}=setup();let calls=0;const stop=store.subscribe(()=>calls++);store.addToContinue(names[0]);store.addToContinue(names[0]);store.touchContinue(names[0]);store.removeFromContinue('missing');assert.equal(calls,2);stop();store.removeFromContinue(names[0]);assert.equal(calls,2)
})
test('Favorites and Continue remain independent across add/remove in both directions',()=>{
 const {store,storage,values}=setup(), favorites=createFavoritesStore(()=>storage,ids);favorites.addFavorite(names[0]);assert.equal(store.getSnapshot().length,0);store.addToContinue(names[1]);assert.equal(favorites.isFavorite(names[1]),false);store.addToContinue(names[0]);favorites.removeFavorite(names[0]);assert.equal(store.isInContinue(names[0]),true);favorites.addFavorite(names[1]);const before=values.get(FAVORITES_KEY);store.removeFromContinue(names[1]);assert.equal(values.get(FAVORITES_KEY),before)
})
test('Continue add/remove do not affect Recent; continue uses existing openResource and updates both timestamps',()=>{
 const {store,storage,values}=setup(),recent=createRecentStore(()=>storage,ids),r=resources.find(r=>r.id==='cli-course');store.addToContinue(r.id,100);assert.equal(values.has(RECENT_KEY),false);let opened
 store.continueResource(r.id,()=>recent.openResource(r.id,resourceHref(r,'/personal-nav/'),href=>{opened=href},300),300)
 assert.equal(opened,'/personal-nav/cli-course.html');assert.equal(store.getSnapshot()[0].lastContinuedAt,300);assert.equal(recent.getSnapshot()[0].resourceId,r.id);const before=values.get(RECENT_KEY);store.removeFromContinue(r.id);assert.equal(values.get(RECENT_KEY),before)
})
test('Workspace launch and Continue never modify each other',()=>{
 const {store,storage,values}=setup(),recent=createRecentStore(()=>storage,ids);store.addToContinue(names[0]);const before=values.get(CONTINUE_KEY),items=resources.slice(1,3),original=JSON.stringify(items)
 launchWorkspace(items,{href:r=>resourceHref(r,'/personal-nav/'),open:()=> 'success',recordSuccess:(r,url)=>recent.openResource(r.id,url,()=>{})});assert.equal(values.get(CONTINUE_KEY),before);store.removeFromContinue(names[0]);assert.equal(JSON.stringify(items),original)
})
test('all 23 real resources are valid Continue references',()=>{
 assert.equal(resources.length,23);for(const r of resources){const {store}=setup();assert.equal(store.addToContinue(r.id),'added');assert.equal(store.isInContinue(r.id),true)}
})
