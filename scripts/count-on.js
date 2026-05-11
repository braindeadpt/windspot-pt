const fs = require('fs');
const conditions = JSON.parse(fs.readFileSync('public/data/conditions.json', 'utf-8'));
const spotsText = fs.readFileSync('src/lib/spots.ts', 'utf-8');
const allIds = [...spotsText.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map(m => m[1]);
const coastMap = {};
for (const m of spotsText.matchAll(/id:\s*'([a-z0-9-]+)'[\s\S]*?coastOrientation:\s*(\d+)/g)) coastMap[m[1]] = parseInt(m[2]);
const compatMap = {};
for (const m of spotsText.matchAll(/id:\s*'([a-z0-9-]+)'[\s\S]*?compatibleSports:\s*\[([^\]]*)\]/g)) {
  compatMap[m[1]] = [...m[2].matchAll(/'([a-z]+)'/g)].map(x => x[1]);
}

function sc(c,co){const wk=c.windSpeed*1.94384;let s=Math.min(c.waveHeight*15,40);s+=Math.max(0,Math.min((c.wavePeriod-5)*3,20));let ad=Math.abs(c.windDirection-(co||270)),nd=ad>180?360-ad:ad,io=nd>90;s+=io?Math.max(0,25-wk*0.5):Math.max(0,15-wk*0.3);s+=Math.min(c.waterTemp*0.5,15);return Math.round(Math.min(100,Math.max(0,s)));}
function kt(c){const wk=c.windSpeed*1.94384;let s=0;if(wk>=15&&wk<=30)s=60;else if(wk>30)s=50;else if(wk>=10)s=wk*2;const gd=c.windGust-c.windSpeed;s+=gd<10?15:gd<20?10:5;if(c.waveHeight<1.5)s+=15;else if(c.waveHeight<2.5)s+=8;s+=Math.min(c.waterTemp*0.3,10);return Math.round(Math.min(100,Math.max(0,s)));}
function ws(c){const wk=c.windSpeed*1.94384;let s=0;if(wk>=15&&wk<=28)s=55;else if(wk>=10)s=wk*2;if(1<c.waveHeight&&c.waveHeight<3)s+=20;else if(c.waveHeight<4)s+=10;s+=15+Math.min(c.waterTemp*0.3,10);return Math.round(Math.min(100,Math.max(0,s)));}
function bb(c){const wk=c.windSpeed*1.94384;let s=Math.min(c.waveHeight*18,45);s+=Math.max(0,Math.min((c.wavePeriod-4)*3,20));s+=Math.max(0,25-wk*0.4);s+=Math.min(c.waterTemp*0.4,10);return Math.round(Math.min(100,Math.max(0,s)));}
function sp(c){const wk=c.windSpeed*1.94384;let s=c.waveHeight<0.5?40:c.waveHeight<1?30:c.waveHeight<1.5?15:0;s+=wk<15?30:wk<25?15:0;s+=Math.min(c.waterTemp*0.6,20);s+=Math.max(0,10-c.wavePeriod*0.5);return Math.round(Math.min(100,Math.max(0,s)));}

const scorers={surf:sc,kitesurf:kt,windsurf:ws,bodyboard:bb,sup:sp,wakeboard:()=>80};

console.log('\n=== ON CRITERION: compatibleSports + score >= threshold ===');
for(const th of [60,65,70,75,80]){
  let cnt=0;
  for(const id of allIds){
    const c=conditions[id]; if(!c) continue;
    const sports=compatMap[id]||[];
    const ok=sports.some(sp=>(scorers[sp]?.(c,coastMap[id])||0)>=th);
    if(ok) cnt++;
  }
  console.log(`Threshold ${th}: ${cnt} spots ON`);
}

console.log('\n=== Distribution by sport (score >= 70, only if in compatibleSports) ===');
for(const sport of ['surf','kitesurf','windsurf','bodyboard','sup','wakeboard']){
  let cnt=0;
  for(const id of allIds){
    const c=conditions[id]; if(!c) continue;
    const sports=compatMap[id]||[];
    if(!sports.includes(sport)) continue;
    const score=(scorers[sport]?.(c,coastMap[id])||0);
    if(score>=70) cnt++;
  }
  console.log(`${sport}: ${cnt} spots`);
}
console.log(`\nTotal spots with conditions: ${Object.keys(conditions).filter(k=>conditions[k].waveHeight!==undefined).length}`);
console.log(`Total spots in spots.ts: ${allIds.length}`);
