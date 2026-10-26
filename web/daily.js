function istanbulDay(value=new Date()){const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;}
function summaryDate(value){const parsed=parseConcreteDate(value);return parsed?parsed.toISOString().slice(0,10):'';}
function buildDailySummary(payload,concreteRecord,day){
 const groups={today:[],overdue:[],reports:[],finished:[],upcoming:[],missing:[]},sites=(payload?.sites||[]).filter(s=>!s.archived),nextWeek=concreteReportDate(day,7);
 const add=(group,text,site=null,kind='task')=>groups[group].push({text,siteId:site?.id||'',kind});
 const label=s=>`${s.name} · ${s.ada}/${s.parcel}`;
 let noDue=0,noOwner=0,undatedDone=0;
 for(const site of sites){
  for(const task of site.tasks){const title=`${label(site)} — ${task.text}${task.owner?' ('+task.owner+')':''}`,due=summaryDate(task.due);
   if(task.status==='done'){if(istanbulDay(task.completedAt||'invalid')===day)add('finished',`${title} — bugün tamamlandı olarak işaretlendi.`,site);else if(!istanbulDay(task.completedAt||'invalid'))undatedDone++;continue;}
   if(!due)noDue++;else if(due===day)add('today',`${title} — son gün bugün.`,site);else if(due<day)add('overdue',`${title} — son tarih ${concreteDate(due)}, tamamlandı işaretli değil.`,site);else if(due<=nextWeek)add('upcoming',`${title} — son tarih ${concreteDate(due)}.`,site);
   if(!task.owner||task.owner==='Atanmamış')noOwner++;
   if(task.status==='blocked')add('overdue',`${title} — engel bildirildi.`,site);
  }
  const absent=[['stage','güncel aşama'],['plannedFloors','toplam kat'],['currentFloor','mevcut kat'],['architect','mimarlık ofisi'],['inspection','yapı denetim']].filter(([key])=>!String(site[key]||'').trim()).map(([,label])=>label);
  if(absent.length)add('missing',`${label(site)} — eksik şantiye bilgileri: ${absent.join(', ')}.`,site,'site');
  for(const [key,title]of MILESTONES){const m=site.milestones?.[key];if(m?.done&&istanbulDay(m.updatedAt||'invalid')===day)add('finished',`${label(site)} — ${title}, bugün tamamlandı olarak işaretlendi.`,site,'site');}
 }
 if(noDue)add('missing',`${noDue} aktif işin son tarihi yok veya geçersiz; bugünkü ve geciken işler hesabına dahil edilmedi.`);
 if(noOwner)add('missing',`${noOwner} aktif işin sorumlu alanı boş veya Atanmamış.`);
 if(undatedDone)add('missing',`${undatedDone} iş tamamlandı işaretli, ancak tamamlanma zamanı kayıtlı değil; bugün bitenler arasında gösterilmedi.`);
 let unmatched=0;
 for(const row of concreteRecord?.rows||[]){const site=matchConcreteSite(row,payload?.sites||[]);if(site?.archived)continue;if(!site)unmatched++;const name=`${row.location} — ${row.element}`,date=summaryDate(row.date);
  if(!date)add('missing',`${name} — döküm tarihi eksik veya geçersiz.`,site,'concrete');
  else if(row.completed!==true){if(date===day)add('today',`${name} — bugün beton dökümü planlı${row.time?' ('+row.time+')':''}.`,site,'concrete');else if(date<day)add('overdue',`${name} — plan tarihi ${concreteDate(date)} geçti; döküldü işaretlenmemiş.`,site,'concrete');else if(date<=nextWeek)add('upcoming',`${name} — ${concreteDate(date)} için beton planı var.`,site,'concrete');}
  else{if(date===day)add('finished',`${name} — bugün tarihli döküm, döküldü olarak işaretli.`,site,'concrete');
   for(const days of [7,28]){const field='report'+days,reportDate=summaryDate(row[field]);if(row[field+'Received']===true){if(istanbulDay(row[field+'ReceivedAt']||'invalid')===day)add('finished',`${name} — ${days} günlük rapor bugün alındı olarak işaretlendi; sonuç değerlendirmesi kaydedilmedi.`,site,'concrete');continue;}
    if(reportDate&&reportDate<=day)add('reports',`${name} — ${days} günlük raporun beklenen tarihi ${reportDate===day?'bugün':concreteDate(reportDate)+' (tarihi geçti)'}. Raporun alındığı henüz işaretlenmemiş; kontrol edin.`,site,'concrete');
    else if(!String(row[field]||'').trim())add('missing',`${name} — ${days} günlük rapor tarihi girilmemiş.`,site,'concrete');
   }
  }
 }
 if(unmatched)add('missing',`${unmatched} beton kaydı şantiyeyle kesin eşleşmiyor; Beton programı listesinden kontrol edin.`,null,'concrete');
 return groups;
}
function renderDailySummary(){const panel=$('#daily-summary');if(!panel)return;panel.hidden=!['sites','summary'].includes(view);$('.section-head').hidden=view==='summary';if(panel.hidden||!data)return;const date=$('#daily-date');if(!date.value)date.value=istanbulDay();const day=date.value;if(!summaryDate(day))return;const groups=buildDailySummary(data,concreteState.record,day),q=normalize($('#daily-query').value.trim()),filter=$('#daily-filter').value;const names={today:'Bugün yapılması planlananlar',overdue:'Gecikenler ve engeller',reports:'Rapor takibi',finished:'Bugün tamamlandı / alındı olarak işaretlenenler',upcoming:'Önümüzdeki 7 gün',missing:'Eksik bilgiler'};const selected=Object.entries(groups).map(([key,items])=>[key,items.filter(item=>(!q||normalize(item.text).includes(q))&&(filter!=='concrete'||item.kind==='concrete'))]).filter(([key])=>!['overdue','finished','missing','reports'].includes(filter)||key===filter);let total=0;const itemHtml=item=>`<li>${esc(item.text)} ${item.siteId?`<button data-site="${esc(item.siteId)}">Şantiyeyi aç ↗</button>`:item.kind==='concrete'?'<button data-view="concrete">Beton programını aç ↗</button>':''}</li>`;$('#daily-output').innerHTML=selected.map(([key,items])=>{total+=items.length;if(!items.length)return '';return `<section class="daily-group daily-${key}"><h3>${names[key]} <span>${items.length}</span></h3><ul>${items.slice(0,4).map(itemHtml).join('')}</ul>${items.length>4?`<details><summary>Diğer ${items.length-4} kaydı göster</summary><ul>${items.slice(4).map(itemHtml).join('')}</ul></details>`:''}</section>`}).join('')||'<p>Seçilen gün ve filtre için kayıtlı bir bildirim bulunmuyor. Tarihi girilmemiş işler bu hesabın dışındadır.</p>';$('#daily-intro').textContent=`${concreteDate(day)} · ${total} bildirim${dirty?' · Kaydedilmemiş değişiklikler özete dahil.':''}${concreteState.record?'':' · Beton kayıtları henüz yüklenmedi; özet eksik olabilir.'}${concreteState.error?' · Beton bağlantısında sorun var; son alınan kayıtlar kullanılıyor.':''}`;}
for(const id of ['daily-filter','daily-query'])$('#'+id).addEventListener(id==='daily-query'?'input':'change',renderDailySummary);
$('#daily-date').addEventListener('change',()=>{$('#daily-date').dataset.manual='yes';renderDailySummary();});$('#daily-today').onclick=()=>{delete $('#daily-date').dataset.manual;$('#daily-date').value=istanbulDay();renderDailySummary();};
setInterval(()=>{if(!$('#daily-date').dataset.manual)$('#daily-date').value=istanbulDay();renderDailySummary();},60000);
