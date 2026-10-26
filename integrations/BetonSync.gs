// Attach to the PRIVATE source Google spreadsheet through Extensions > Apps Script.
// Set BETON_SYNC_TOKEN in Project Settings > Script properties. Never put it in this source.
const BETON = {
 spreadsheetId: '1VKH1M-oPvBvG5u2My2CeBdyACAjd3Il3JrNqSfaCnW0', sheetId: 1892602527,
 url: 'https://jcsjpgbowdvekrvupbgm.supabase.co',
 publicKey: 'sb_publishable_mP24x5G-hUGeRR4MJBvqpw_VQoD9Pg0'
};
function syncBeton(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
 const properties=PropertiesService.getScriptProperties(),token=properties.getProperty('BETON_SYNC_TOKEN');
 if(!token)throw new Error('Script properties içinde BETON_SYNC_TOKEN eksik.');
 const ss=SpreadsheetApp.openById(BETON.spreadsheetId),sheet=ss.getSheets().find(s=>s.getSheetId()===BETON.sheetId);
 if(!sheet)throw new Error('Beton sekmesi bulunamadı.');
 const range=sheet.getDataRange(),raw=range.getValues(),display=range.getDisplayValues(),tz=ss.getSpreadsheetTimeZone();
 const required=['Ada Parsel','Şantiye İsmi','Beton Dökülecek Yer','Tarih','Saat','Miktar M3','Beton Sınıfı','7 Günlük Rapor Sonuçları Tarihi','28 Günlük Rapor Sonuçları Tarihi','Notlar','Tamamlandı'];
 const normalize=s=>String(s).trim().replace(/\s+/g,' ').toLocaleLowerCase('tr-TR');
 const columns=required.map(h=>display[0].findIndex(v=>normalize(v)===normalize(h)));
 if(columns.some(c=>c<0))throw new Error('Beklenen sütunlardan biri eksik; eski kayıtlar korunuyor.');
 const fields=['location','siteName','element','date','time','quantity','grade','report7','report28','notes','completed'];
 const rows=[];
 for(let row=1;row<raw.length;row++){
  if(!display[row].some(v=>String(v).trim()))continue;
  // Ignore unused checkbox-only rows, but reject real records missing identity.
  if(!columns.slice(0,10).some(c=>String(display[row][c]).trim()))continue;
  if(!String(display[row][columns[0]]).trim())throw new Error('Satır '+(row+1)+': Ada Parsel eksik; aktarım yapılmadı.');
  const item={sourceRow:row+1};
  fields.forEach((key,i)=>{const c=columns[i],v=raw[row][c];item[key]=key==='completed'?(v===true?true:v===false?false:null):(['date','report7','report28'].includes(key)&&v instanceof Date?Utilities.formatDate(v,tz,'yyyy-MM-dd'):String(display[row][c]).trim());});rows.push(item);
 }
 // Read the current database too, so a manual import cannot permanently block resync.
 const response=betonRequest('/rest/v1/concrete_program?id=eq.1&select=version,rows,source',null);
 if(!response[0])throw new Error('Beton tablosu kurulmamış.');
 if(String(response[0].source||'').startsWith('İş takip sitesi'))return; // Site is now the authoritative editor.
 const canonical=items=>JSON.stringify(items.map(r=>fields.map(k=>r[k]).concat([r.sourceRow])));
 if(canonical(response[0].rows)===canonical(rows))return;
 betonRequest('/rest/v1/rpc/sync_concrete',{sync_token:token,expected_version:response[0].version,new_rows:rows});
 properties.setProperty('BETON_LAST_SYNC',new Date().toISOString());
 }finally{lock.releaseLock();}
}
function betonRequest(path,payload){
 const options={method:payload?'post':'get',headers:{apikey:BETON.publicKey},muteHttpExceptions:true};
 if(payload){options.contentType='application/json';options.payload=JSON.stringify(payload);}
 const response=UrlFetchApp.fetch(BETON.url+path,options);
 if(response.getResponseCode()<200||response.getResponseCode()>=300)throw new Error('Beton aktarımı başarısız (HTTP '+response.getResponseCode()+'). Kaynak ve veritabanı ayarlarını kontrol edin.');
 return JSON.parse(response.getContentText());
}
function setupBetonSync(){
 syncBeton(); // Do not install triggers until a real import succeeds.
 ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='syncBeton').forEach(t=>ScriptApp.deleteTrigger(t));
 ScriptApp.newTrigger('syncBeton').forSpreadsheet(BETON.spreadsheetId).onEdit().create();
 ScriptApp.newTrigger('syncBeton').forSpreadsheet(BETON.spreadsheetId).onChange().create();
 ScriptApp.newTrigger('syncBeton').timeBased().everyMinutes(15).create();
}
