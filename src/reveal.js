window.VaultReveal=(()=>{
'use strict';
// Four visual and musical signatures. Explanations stay here, never on the card face.
const TIERS=[{id:'small',min:0,flip:60,impact:190,duration:420},{id:'medium',min:300,flip:110,impact:300,duration:680},{id:'high',min:1280,flip:230,impact:470,duration:1150},{id:'epic',min:12800,flip:340,impact:620,duration:1550}];
function tier(value,rarityLevel=0){const priced=TIERS.slice().reverse().find(t=>value>=t.min)||TIERS[0];return TIERS[Math.max(TIERS.indexOf(priced),rarityLevel>=4?3:rarityLevel>=3?2:rarityLevel>=2?1:0)];}
function size(root){const stage=root.querySelector('.card-stage'),deck=root.querySelector('.deck');if(!stage||!deck)return;const h=Math.max(70,Math.min(560,stage.clientHeight-12,(stage.clientWidth-28)/.7142857));deck.style.width=(h*.7142857)+'px';deck.style.height=h+'px';}
async function run({root,front,back,value,sound,settings,ledger,rarityLevel=0}){
 const t=tier(value,rarityLevel),level=TIERS.indexOf(t),reduced=!settings.motion||matchMedia('(prefers-reduced-motion: reduce)').matches,inner=root.querySelector('.flip-inner'),body=root.querySelector('.card-motion'),amount=root.querySelector('#reveal-value');if(!inner||!body)return;
 // Keep both face nodes alive through the entire flip to avoid WebView texture flashing.
 if(!inner.querySelector('.card-front'))inner.insertAdjacentHTML('beforeend',front);if(!inner.querySelector('.card-back'))inner.insertAdjacentHTML('afterbegin',back);
 await Promise.all(Array.from(inner.querySelectorAll('.card-front img')).map(img=>new Promise(resolve=>{if(img.complete){img.classList.toggle('image-unavailable',!img.naturalWidth);resolve();return;}const done=error=>{clearTimeout(timer);img.removeEventListener('load',ok);img.removeEventListener('error',fail);img.classList.toggle('image-unavailable',error);resolve();},ok=()=>done(false),fail=()=>done(true),timer=setTimeout(fail,1200);img.addEventListener('load',ok);img.addEventListener('error',fail);})));
 const before=performance.now(),at=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,ms-(performance.now()-before)))),animations=[];
 const animate=(el,frames,options)=>{if(!el?.animate)return;const a=el.animate(frames,{fill:'both',...options});animations.push(a);};
 root.dataset.fxTier=t.id;root.dataset.fxDuration=reduced?0:t.duration;root.dataset.fxPhase='charge';root.classList.add('value-cinematic');root.querySelectorAll('.cinematic-layer').forEach(el=>el.remove());
 const finish=()=>{inner.querySelector('.card-front')?.setAttribute('aria-hidden','false');inner.querySelector('.card-back')?.setAttribute('aria-hidden','true');animations.forEach(a=>a.cancel());body.style.transform='';inner.style.transition='none';inner.style.transform='rotateY(180deg)';root.querySelector('#flip-card')?.classList.add('revealed');root.querySelector('#rarity-chip')?.classList.add('visible');amount.classList.add('is-visible');root.dataset.fxPhase='settled';root.dataset.fxElapsed=Math.round(performance.now()-before);root.classList.remove('value-cinematic');root.querySelectorAll('.cinematic-layer').forEach(el=>el.remove());sound.restore?.();};
 if(reduced){sound.revealCue?.(level,'soft');try{await ledger(0);}finally{finish();}return {tier:t.id,duration:0};}
 const layer=document.createElement('div');layer.className='cinematic-layer reveal-effects tier-'+t.id;layer.setAttribute('aria-hidden','true');
 // Medium: cyan edge sweep; high: gold bolts and foil shards; epic: prismatic crown and stars.
 // No captions, duplicate amounts, floating coins or secondary score compete with the card.
 layer.innerHTML=`<div class="reveal-halo"></div><div class="reveal-iris"></div><div class="reveal-sweep"></div><div class="reveal-ring"></div><div class="reveal-ring ring-second"></div><svg class="reveal-bolts" viewBox="0 0 300 420" preserveAspectRatio="none"><path d="M28 15L70 100 35 98 82 192M272 405L230 320 265 322 218 228"/></svg><div class="reveal-sparks">${Array.from({length:level===3?16:level===2?10:4},(_,i)=>{const angle=i*2.39996;return `<i style="--i:${i};--dx:${Math.round(Math.cos(angle)*(120+i%3*28))}px;--dy:${Math.round(Math.sin(angle)*(150+i%3*35))}px;--turn:${i*47}deg"></i>`;}).join('')}</div>`;
 const rect=root.querySelector('.deck').getBoundingClientRect(),host=root.getBoundingClientRect();layer.style.left=(rect.left-host.left)+'px';layer.style.top=(rect.top-host.top)+'px';layer.style.width=rect.width+'px';layer.style.height=rect.height+'px';layer.style.setProperty('--burst-time',(t.duration-t.impact)+'ms');root.appendChild(layer);
 try{
  sound.revealCue?.(level,'charge');sound.haptic?.(level>=2?'medium':'light');
  animate(body,level<2?[{transform:'translateY(0)'},{transform:'translateY(-5px) scale(.985)'}]:[{transform:'scale(1)'},{transform:'scale(.94) rotate(-2deg)'}],{duration:t.flip,easing:'ease-out'});
  await at(t.flip);if(!root.isConnected)return;root.dataset.fxPhase='flip';sound.revealCue?.(level,'flip');
  const half=(t.impact-t.flip)/2;inner.style.transition=`transform ${half}ms ease-in`;inner.style.transform='rotateY(90deg)';
  await at(t.flip+half);inner.style.transition=`transform ${half}ms ease-out`;inner.style.transform='rotateY(180deg)';
  await at(t.impact);animations.forEach(a=>a.cancel());inner.style.transition='none';inner.style.transform='rotateY(180deg)';root.querySelector('#flip-card')?.classList.add('revealed');root.querySelector('#rarity-chip')?.classList.add('visible');root.dataset.fxPhase='impact';layer.classList.add('has-burst');sound.revealCue?.(level,'impact');sound.haptic?.(level>=2?'heavy':'light');
  animate(body,[{transform:`scale(${[1.025,1.045,1.08,1.10][level]})`},{transform:'scale(.99)',offset:.45},{transform:'scale(1)'}],{duration:level>=2?360:200,easing:'ease-out'});
  // One value above the card; ledger animates in place while the card stays readable.
  amount.classList.add('is-visible');await ledger(Math.min(420,t.duration-t.impact-80));await at(t.duration);sound.revealCue?.(level,'settle');
 }finally{finish();}
 return {tier:t.id,duration:performance.now()-before};
}
return {TIERS,tier,size,run};
})();
