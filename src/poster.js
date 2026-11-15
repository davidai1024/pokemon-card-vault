window.VaultPoster=(()=>{
'use strict';
const loads=new Map();
function image(src){if(!loads.has(src))loads.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{loads.delete(src);reject(Error('海报素材加载失败'));};im.src=src;}));return loads.get(src);}
async function draw(r,meta){
 const cards=(r.cards||[]).slice().sort((a,b)=>b.value-a.value).slice(0,3);if(!cards.length)throw Error('卡包尚未揭晓');
 const art=await Promise.all(cards.map(c=>image(meta.image(c))));
 const [bg,back,coin]=await Promise.all([image('assets/ui/share-comic-bg.webp'),image('assets/ui/card-back-v4.svg'),image('assets/ui/reward-coin.svg')]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const x=canvas.getContext('2d');x.imageSmoothingEnabled=true;if('imageSmoothingQuality' in x)x.imageSmoothingQuality='high';
 const fmt=n=>Math.round(n).toLocaleString('en-US'),font='"PingFang SC","Heiti SC","Microsoft YaHei",sans-serif';
 function poly(points,fill,stroke='#14141a',width=5){x.beginPath();points.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.strokeStyle=stroke;x.lineWidth=width;x.lineJoin='round';x.stroke();}}
 function round(a,b,w,h,radius,fill,stroke='#15151a',width=3){x.beginPath();x.moveTo(a+radius,b);x.arcTo(a+w,b,a+w,b+h,radius);x.arcTo(a+w,b+h,a,b+h,radius);x.arcTo(a,b+h,a,b,radius);x.arcTo(a,b,a+w,b,radius);if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.lineWidth=width;x.strokeStyle=stroke;x.stroke();}}
 function text(t,a,b,size,fill='#101015',max=1000,outline=true,align='center',angle=0){x.save();x.translate(a,b);x.rotate(angle);x.font='italic 1000 '+size+'px '+font;const w=x.measureText(t).width;if(w>max)x.scale(max/w,1);x.textAlign=align;x.textBaseline='middle';x.lineJoin='round';if(outline){const white=fill==='white'||fill==='#fff';x.strokeStyle=white?'#fffef3':'#111116';x.lineWidth=Math.max(8,size*.20);x.strokeText(t,0,0);x.strokeStyle=white?'#111116':'#fffef3';x.lineWidth=Math.max(5,size*.135);x.strokeText(t,0,0);}x.fillStyle=fill;x.fillText(t,0,0);x.restore();}
 function ball(a,b,size){x.save();x.translate(a,b);x.lineWidth=size*.055;x.strokeStyle='#10101a';x.beginPath();x.arc(0,0,size/2,0,Math.PI*2);x.fillStyle='white';x.fill();x.stroke();x.beginPath();x.arc(0,0,size/2,Math.PI,Math.PI*2);x.fillStyle='#fa294d';x.fill();x.stroke();x.beginPath();x.moveTo(-size/2,0);x.lineTo(size/2,0);x.stroke();x.beginPath();x.arc(0,0,size*.16,0,Math.PI*2);x.fillStyle='white';x.fill();x.stroke();x.restore();}
 function burst(cx,cy,rx,ry,fill,n=13){const pts=[];for(let i=0;i<n*2;i++){const t=-Math.PI/2+i*Math.PI/n,k=i%2?.73:1;pts.push([cx+Math.cos(t)*rx*k,cy+Math.sin(t)*ry*k]);}poly(pts,fill,'#121218',5);}
 function tilted(img,cx,cy,w,h,angle){x.save();x.translate(cx,cy);x.rotate(angle);x.shadowColor='#15213566';x.shadowBlur=8;x.shadowOffsetY=5;round(-w/2-3,-h/2-3,w+6,h+6,16,'#fff',null);x.shadowColor='transparent';x.drawImage(img,-w/2,-h/2,w,h);x.restore();}
 x.drawImage(bg,0,0,1080,1440);
 // Top lockup and date use live data, while the scenery remains independent artwork.
 ball(72,63,86);text('宝可梦：抽卡暴富',132,58,58,'#fff',550,true,'left',-.04);text('拆开一包，收藏惊喜',148,108,23,'#fff',420,false,'left',-.04);
 round(732,23,320,67,32,'#ffe452','#111',4);round(738,22,309,57,28,'#fffdf2',null);x.strokeStyle='#111';x.lineWidth=4;round(760,39,36,30,3,'#fff','#111',3);x.fillStyle='#f7474b';x.fillRect(762,40,32,8);x.beginPath();x.moveTo(768,34);x.lineTo(768,44);x.moveTo(788,34);x.lineTo(788,44);x.stroke();const date=new Date(r.completedAt||Date.now()).toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'}).replace(/-/g,'.');text(date,918,55,34,'#111',230,false);
 poly([[80,273],[157,169],[1019,132],[926,227],[668,258],[696,239]],'#ffeb2b','#101018',4);
 text('这一包，值得收藏！',548,188,100,'#060609',905,true,'center',-.07);
 // Fan is a deliberate two-card stack, always behind the hero face.
 tilted(back,430,550,382,538,-.24);tilted(back,503,550,382,538,.12);tilted(art[0],530,537,425,590,-.065);
 burst(879,421,194,147,'#fff334');text(r.isGift?'估值 / 原包价':'本包回报',880,365,r.isGift?42:51,'#0a0a0c',295,true,'center',-.05);text(Number(r.multiple||0).toFixed(1)+'×',880,466,126,'#e0142c',315,true,'center',-.04);
 burst(223,745,150,62,'#f92843',10);text('本包最佳',223,749,52,'white',250,true,'center',-.06);
 round(67,794,288,54,25,'#fff9df','#111',3);text(meta.name(cards[0])+' · '+fmt(cards[0].value),211,821,31,'#101012',255,false);
 // The headline shows actual inventory value gained after the real cost, including gifts.
 const total=Number.isFinite(r.total)?r.total:(r.cards||[]).reduce((n,c)=>n+c.value,0),cost=r.actualCost??(r.isGift?0:r.cost||0),net=total-cost;
 round(97,866,871,97,43,'#ffe938','#111',5);round(102,856,855,96,43,'#f22c48','#111',4);
 text('估值净增',324,906,76,'white',343,true);x.drawImage(coin,505,865,81,81);text((net>=0?'+':'−')+fmt(Math.abs(net)),768,896,124,'#df1027',347,true);
 poly([[47,884],[88,902],[61,919],[22,914]],'#ffeb35');poly([[51,846],[94,879],[78,893],[40,874]],'#ffeb35');poly([[993,853],[1014,866],[986,906],[971,895]],'#ffeb35');poly([[1015,892],[1038,918],[998,928],[990,911]],'#ffeb35');
 // Lower three-card rail mirrors the reference rather than a separate preview template.
 round(19,958,1042,442,30,'#fffbed','#17151a',4);
 poly([[85,988],[348,988],[318,1053],[47,1055]],'#f92843','#111',4);text('本包精选',200,1018,53,'white',244,true);round(329,1001,244,40,20,'#fff9e6','#111',3);text((r.count||r.cards.length)+'张中的'+cards.length+'张',448,1022,28,'#111',213,false);
 for(let i=0;i<art.length;i++){const cx=226+i*316;if(i){x.strokeStyle='#e8c595';x.lineWidth=2;x.beginPath();x.moveTo(cx-158,1120);x.lineTo(cx-158,1368);x.stroke();}round(cx-104,1058,208,272,10,'#fff','#111',2);x.drawImage(art[i],cx-101,1061,202,266);round(cx-101,1336,202,29,15,'#fff9e5','#15151a',2);text(meta.name(cards[i]),cx,1350,26,'#101012',184,false);round(cx-91,1369,182,31,16,'#ffe559',null);x.drawImage(coin,cx-66,1368,31,31);text(fmt(cards[i].value),cx+23,1385,30,'#111',117,false);}
 poly([[302,1402],[787,1402],[771,1437],[282,1437]],'#f52542','#13131a',3);ball(337,1420,31);text('游戏金币估值 · 出售后才到账',574,1420,25,'#fff',411,false);
 for(const a of [202,224,246,794,816,838])poly([[a,1411],[a+13,1411],[a-4,1430],[a-17,1430]],'#fff',null);
 return canvas;
}
function collectionCards(inventory,limit=12){const seen=new Set();return inventory.slice().sort((a,b)=>b.value-a.value||a.cardId.localeCompare(b.cardId)).filter(c=>{if(seen.has(c.cardId))return false;seen.add(c.cardId);return true;}).slice(0,limit);}
async function collection(snapshot,meta){
 const cards=collectionCards(snapshot.cards||[]),art=await Promise.all(cards.map(c=>image(meta.image(c)))),[bg,coin,trainer,pika]=await Promise.all([image('assets/ui/share-comic-bg.webp'),image('assets/ui/reward-coin.svg'),image('assets/ui/trainer.webp'),image('assets/ui/species/25.webp')]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const x=canvas.getContext('2d');x.imageSmoothingEnabled=true;if('imageSmoothingQuality' in x)x.imageSmoothingQuality='high';
 const font='"PingFang SC","Heiti SC","Microsoft YaHei",sans-serif',fmt=n=>Math.round(n).toLocaleString('en-US');
 function poly(points,fill,stroke='#171516',line=4){x.beginPath();points.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fillStyle=fill;x.fill();if(stroke){x.strokeStyle=stroke;x.lineWidth=line;x.lineJoin='round';x.stroke();}}
 function text(t,cx,cy,size,color,max,bold=true,outline=false){x.save();x.textAlign='center';x.textBaseline='middle';x.font=(bold?'italic 900 ':'500 ')+size+'px '+font;const w=x.measureText(t).width;if(w>max){x.translate(cx,cy);x.scale(max/w,1);cx=0;cy=0;}if(outline){x.lineJoin='round';x.strokeStyle='#151313';x.lineWidth=size*.21;x.strokeText(t,cx,cy);x.strokeStyle='#fffbed';x.lineWidth=size*.13;x.strokeText(t,cx,cy);}x.fillStyle=color;x.fillText(t,cx,cy);x.restore();}
 function dots(a,b,w,h,color){const tile=document.createElement('canvas');tile.width=18;tile.height=18;const t=tile.getContext('2d');t.fillStyle=color;t.beginPath();t.arc(5,5,2.2,0,Math.PI*2);t.fill();x.save();x.fillStyle=x.createPattern(tile,'repeat');x.fillRect(a,b,w,h);x.restore();}
 function star(cx,cy,r){const points=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?.44:1;points.push([cx+Math.cos(a)*r*k,cy+Math.sin(a)*r*k]);}poly(points,'#ffd42f','#171516',4);}
 x.drawImage(bg,0,0,1080,1440);x.fillStyle='rgba(255,248,231,.96)';x.fillRect(10,10,1060,1420);dots(14,10,1052,245,'#e93433');dots(15,270,53,1060,'#ea5039');dots(1010,270,54,1060,'#ea5039');
 x.strokeStyle='#171516';x.lineWidth=5;x.strokeRect(15,15,1050,1410);
 poly([[25,45],[403,20],[380,96],[27,123]],'#d6202d');text('我的收藏手帖',218,70,43,'#fff',340);
 poly([[235,240],[487,112],[1025,117],[963,237],[566,263],[611,226]],'#ffdb27');text('晒晒我的',350,181,108,'#111',515,true,true);text('收藏池',849,181,119,'#d7212a',413,true,true);
 // Existing artwork is reused; all collection figures and card faces are live data.
 x.save();x.beginPath();x.arc(130,373,106,0,Math.PI*2);x.clip();x.drawImage(trainer,24,267,212,212);x.restore();x.strokeStyle='#191516';x.lineWidth=5;x.beginPath();x.arc(130,373,106,0,Math.PI*2);x.stroke();x.drawImage(pika,900,278,173,194);
 poly([[265,284],[575,274],[558,459],[249,466]],'#fffbed');poly([[592,278],[899,267],[884,462],[576,466]],'#fffbed');dots(267,315,285,130,'#efcbb1');dots(596,315,270,130,'#efcbb1');
 poly([[278,266],[579,253],[570,311],[269,324]],'#ffdc37');text('收藏数量',424,287,38,'#151212',260);
 poly([[601,262],[904,251],[890,310],[590,319]],'#ffdc37');text('收藏总价值',747,284,35,'#151212',270);
 text(fmt(snapshot.count||0),395,382,89,'#d7192d',199);text('张',516,398,33,'#17120e',39);x.drawImage(coin,602,337,44,44);text(fmt(snapshot.total||0),758,363,64,'#d7192d',216);text('游戏金币估值',744,423,23,'#6c6257',250,false);
 poly([[23,487],[1046,487],[1054,1336],[24,1347]],'#fffbed');dots(27,502,40,817,'#edb398');dots(1015,502,36,817,'#edb398');
 poly([[22,471],[291,454],[274,521],[13,536],[37,501]],'#da2130');text('珍藏一览',150,494,45,'#fff',232,true,true);star(1000,507,26);star(46,973,23);
 const w=176,h=246,startX=116,startY=548,gapX=48,gapY=14;
 for(let i=0;i<art.length;i++){const a=startX+(i%4)*(w+gapX),b=startY+Math.floor(i/4)*(h+gapY);x.save();x.shadowColor='#30201230';x.shadowBlur=8;x.shadowOffsetY=3;x.fillStyle='#fffdf2';x.fillRect(a-3,b-3,w+6,h+6);x.shadowColor='transparent';x.drawImage(art[i],a,b,w,h);x.restore();}
 if(!art.length){text('下一包，会遇见谁？',540,850,58,'#c2252c',800);text('拆开卡包，把喜欢一张张收齐。',540,935,30,'#8d7863',800,false);}
 text('持有数量含重复卡 · 精选 '+cards.length+' 张不同卡号 · 游戏金币估值',540,1325,17,'#8d7863',860,false);
 poly([[115,1364],[373,1359],[345,1411],[86,1415]],'#ffd42f');text('职场咸鱼',233,1387,36,'#151212',240);text('把喜欢，一张张收齐。',720,1388,44,'#151212',610);return canvas;
}
return {draw,collection,collectionCards};

})();
