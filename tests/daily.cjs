const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements={},node=()=>({addEventListener(){},elements:{date:{addEventListener(){}},report7:{addEventListener(){}},report28:{addEventListener(){}}},dataset:{}});
const context={window:{addEventListener(){}},document:{addEventListener(){}},$:id=>elements[id]??=node(),setInterval(){},normalize:s=>s.toLocaleLowerCase('tr-TR'),esc:s=>String(s??''),Cloud:{enabled:false},canEdit:false,MILESTONES:[['permit','Yapı ruhsatı']],data:{sites:[]}};
vm.createContext(context);vm.runInContext(fs.readFileSync('web/concrete.js','utf8'),context);vm.runInContext(fs.readFileSync('web/daily.js','utf8'),context);
assert.equal(context.istanbulDay('2026-10-29T22:30:00Z'),'2026-10-30');assert.equal(context.istanbulDay('invalid'),'');
const site={id:'a',name:'Test',ada:'1',parcel:'2',tasks:[
 {id:'due',text:'Bugün bitmeli',owner:'Esra',due:'2026-10-30'},
 {id:'late',text:'Gecikmiş iş',due:'2026-10-29'},
 {id:'future',text:'Gelecek iş',due:'2026-11-02'},
 {id:'unknown',text:'30.10 bir not ama son tarih değil',status:'pending'},
 {id:'done',text:'Biten iş',status:'done',completedAt:'2026-10-29T22:30:00Z'},
 {id:'old',text:'Eskiden tamamlandı',status:'done'}
],milestones:{permit:{done:true}}};
const archived={id:'archive',name:'Arşiv',ada:'2',parcel:'3',archived:true,tasks:[{text:'Arşivdeki görev',due:'2026-10-30'}]};
const records={rows:[
 {location:'Test 1/2',element:'Bugünkü döküm',date:'2026-10-30',completed:false},
 {location:'Test 1/2',element:'Döküldü',date:'2026-10-02',completed:true,report28:'2026-10-30',report7:'2026-10-09',report7Received:true,report7ReceivedAt:'2026-10-29T22:30:00Z'},
 {location:'Test 1/2',element:'Numune yok',date:'2026-10-01',completed:true,report7:'NUMUNE ALINMADI',report28:'NUMUNE ALINMADI'},
 {location:'Test 1/2',element:'Plan ama döküldü işaretli değil',date:'2026-10-01',completed:null,report28:'2026-10-29'},
 {location:'Arşiv 2/3',element:'Arşiv beton',date:'2026-10-30',completed:false}
]};
const result=context.buildDailySummary({sites:[site,archived]},records,'2026-10-30');
assert.equal(result.today.length,2);assert.equal(result.overdue.length,2);assert.equal(result.reports.length,1);assert(result.reports[0].text.includes('28 günlük raporun beklenen tarihi bugün'));assert.equal(result.finished.length,2);assert.equal(result.upcoming.length,1);assert(result.missing.some(e=>e.text.includes('son tarihi yok')));assert(result.missing.some(e=>e.text.includes('tamamlanma zamanı kayıtlı değil')));assert(!Object.values(result).flat().some(e=>e.text.includes('Arşivdeki')||e.text.includes('Arşiv beton')));assert(!result.finished.some(e=>e.text.includes('Yapı ruhsatı')));assert(!result.reports.some(e=>e.text.includes('Numune yok')||e.text.includes('Plan ama')));
records.rows[1].report28Received=true;assert.equal(context.buildDailySummary({sites:[site,archived]},records,'2026-10-30').reports.length,0);
console.log('PASS: Istanbul date boundary, today/overdue/upcoming, timestamped completion, no invented completion, unreceived report reminders, special report text, archived exclusions, missing date visibility');
