import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const code=fs.readFileSync('src/platform.js','utf8');
async function bridge(overrides={}){
 const calls=[],data=new Map(),events=[];
 const mini={getStorage:async x=>({data:data.get(x.key)||null}),setStorage:async x=>{calls.push(['storage',x]);data.set(x.key,x.data);},getWindowInfo:async()=>({safeArea:{top:24},menuButtons:{me:{bottom:55}}}),submitScore:async x=>{calls.push(['score',x]);return {score:x.score};},getRankList:async()=>({data:[]}),getMyRank:async()=>({status:'NO_SCORE',rank:null,score:null}),...overrides};
 const ctx=vm.createContext({console,Map,Date,Promise,Event:class {constructor(type){this.type=type;}},setTimeout:(f,ms)=>setTimeout(f,ms>=1500?30:0),clearTimeout,localStorage:{getItem:()=>null,setItem:()=>{}},document:{documentElement:{style:{setProperty:(...x)=>calls.push(['style',...x])}}}});
 ctx.window=ctx;ctx.xhs={launchOptions:{miniToolEnv:{buildVersion:9533000}},miniTool:mini};ctx.dispatchEvent=e=>events.push(e.type);vm.runInContext(fs.readFileSync('src/storage.js','utf8'),ctx);vm.runInContext(code,ctx);await ctx.VaultPlatform.ready;return {p:ctx.VaultPlatform,calls,data,events};
}
let b=await bridge();assert(b.p.canRank);b.p.storage.setItem('kanto-vault-v1','{"wallet":3}');await b.p.flush();assert.equal(JSON.parse(b.data.get('kanto-vault-v1')).vaultJournal,1);assert.equal(b.p.storage.getItem('kanto-vault-v1'),'{"wallet":3}');assert(b.calls.some(x=>x[0]==='style'&&x[2]==='55px'));await b.p.submit({total:123456,best:42000});assert.equal(b.calls.filter(x=>x[0]==='score')[0][1].score,12.3456);assert.equal(b.calls.filter(x=>x[0]==='score')[1][1].board,2);
b=await bridge({getStorage:async()=>{throw {errCode:2001};}});assert(b.p.error);
b=await bridge({setStorage:async()=>{throw Error('disk full');}});b.p.storage.setItem('kanto-vault-v1','{}');await assert.rejects(b.p.flush());await assert.rejects(b.p.submit({total:1,best:1}));assert(!b.calls.some(x=>x[0]==='score'));
b=await bridge({getRankList:async()=>{throw {errCode:1005};}});await assert.rejects(b.p.records(1));assert.equal(b.p.canRank,false);
let tries=0;b=await bridge({getRankList:async()=>{if(++tries<3)throw {errCode:2002};return {data:[]};}});await b.p.records(1);await b.p.records(1);assert.equal(tries,3);
console.log('Platform checks passed: native persistence, safe area, read/write failures, score units, unauthorized fallback, bounded retry and cache.');

let partial=0;b=await bridge({submitScore:async x=>{if(x.board===2&&++partial===1)throw {errCode:2999};return {score:x.score};}});await assert.rejects(b.p.submit({total:100,best:50}));await b.p.submit({total:100,best:50});assert.equal(partial,2);await b.p.submit({total:100,best:50});assert.equal(partial,2);await assert.rejects(b.p.submit({total:Infinity,best:5}));console.log('PASS partial score submission resumes, repeated scores suppressed, invalid score rejected');
