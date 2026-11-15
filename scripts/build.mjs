import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as esbuild from 'esbuild';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
const src='src',out='dist',compiled='.cache/compiled';await fs.mkdir(compiled,{recursive:true});
// No library, framework or discarded custom card renderer is shipped.
for(const name of (await fs.readdir(src)).filter(x=>x.endsWith('.js'))){
 let code=await fs.readFile(path.join(src,name),'utf8');
 code=code.replace(/S\.history\.at\(-1\)/g,'S.history[S.history.length-1]');
 const result=await esbuild.transform(code,{target:'chrome61',charset:'utf8',minify:true,legalComments:'none'});
 await fs.writeFile(path.join(compiled,name),result.code);
}
let css=await fs.readFile(path.join(src,'clean.css'),'utf8')+'\n'+await fs.readFile(path.join(src,'physics.css'),'utf8')+'\n'+await fs.readFile(path.join(src,'fidelity.css'),'utf8')+'\n'+await fs.readFile(path.join(src,'reveal.css'),'utf8')+'\n'+await fs.readFile(path.join(src,'milestones.css'),'utf8');
const tree=postcss.parse(css);
tree.walkDecls(d=>{const clamp=d.value.match(/^clamp\(([^,]+),.*\)$/);if(clamp)d.cloneBefore({value:clamp[1].trim()});const limited=d.value.match(/^(min|max)\(([^,()]+),([^,()]+)\)$/);if(limited&&['width','height'].includes(d.prop)){d.cloneBefore({value:limited[2].trim()});d.cloneBefore({prop:(limited[1]==='min'?'max-':'min-')+d.prop,value:limited[3].trim()});}d.value=d.value.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{4})(?![0-9a-fA-F])/g,(_,hex)=>{if(hex.length===4)hex=hex.split('').map(c=>c+c).join('');return 'rgba('+[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),(parseInt(hex.slice(6,8),16)/255).toFixed(3)].join(',')+')';});d.value=d.value.replace(/env\(safe-area-inset-bottom\)/g,'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))');if(/svh|dvh/.test(d.value))d.cloneBefore({value:d.value.replace(/svh|dvh/g,'vh')});if(d.prop==='inset'){const v=d.value.split(/\s+/);const vals=[v[0],v[1]||v[0],v[2]||v[0],v[3]||v[1]||v[0]];['top','right','bottom','left'].forEach((p,i)=>d.cloneBefore({prop:p,value:vals[i]}));}});let gapFallback='';tree.walkRules(rule=>{const gap=rule.nodes?.find(n=>n.type==='decl'&&n.prop==='gap'),display=rule.nodes?.find(n=>n.type==='decl'&&n.prop==='display');if(!gap||!display)return;if(display.value.includes('grid')){gap.cloneBefore({prop:'grid-gap'});return;}if(!display.value.includes('flex'))return;const direction=rule.nodes.find(n=>n.prop==='flex-direction')?.value||'row',value=gap.value.split(/\s+/)[direction==='column'?0:1]||gap.value;const selectors=rule.selectors.map(sel=>'.no-flex-gap '+sel+' > * + *').join(',');gapFallback+=selectors+'{'+(direction==='column'?'margin-top:':'margin-left:')+value+'}';});css=tree.toString()+'\n'+gapFallback;
const result=await postcss([autoprefixer({overrideBrowserslist:['Chrome 61','iOS >= 18.4']}),cssnano({preset:['default',{discardUnused:true,colormin:false}]})]).process(css,{from:undefined});
await fs.writeFile(path.join(out,'style.css'),result.css);
let html=await fs.readFile(path.join(src,'index.html'),'utf8');
html=html.replace('>K</span>','>藏</span>');
const scripts=Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g)).map(m=>m[1]);let bundle=[];for(const name of scripts)bundle.push(await fs.readFile(path.join(compiled,name),'utf8'));await fs.writeFile(path.join(out,'game.js'),bundle.join(';\n'));html=html.replace(/<script src="[^"]+"><\/script>/g,'');html=html.replace('</body>','<script src="game.js"></script></body>');for(const name of await fs.readdir(out))if(name.endsWith('.js')&&name!=='game.js')await fs.unlink(path.join(out,name));
for(const match of Array.from(html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g))){const file=match[1],content=await fs.readFile(path.join(out,file)),hash=createHash('sha256').update(content).digest('hex').slice(0,10);html=html.replaceAll('"'+file+'"','"'+file+'?v='+hash+'"');}
await fs.writeFile(path.join(out,'index.html'),html);
async function outputFiles(dir){let files=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await outputFiles(p));else if(e.isFile())files.push(p);}return files;}const count=(await outputFiles(out)).length;if(count>500)throw Error('小工具文件数量超过 500：'+count);console.log('Built Chrome 61 compatible scripts and optimized styles; '+count+' / 500 files.');
