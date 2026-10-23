/* Excel parsing stays in the user's browser. No file upload or storage. */
function workbookData(book, filename) {
 const clean=v=>v==null?'':String(v).replace(/\s+/g,' ').trim();
 const sites=[];
 for(const name of book.SheetNames){
  const sheet=book.Sheets[name];
  const value=(r,c)=>sheet[XLSX.utils.encode_cell({r:r-1,c:c-1})]?.v;
  if(value(1,1)!=='SORUMLU'||!value(2,3))continue;
  const end=sheet['!ref']?Math.min(XLSX.utils.decode_range(sheet['!ref']).e.r+1,100000):2;
  const tasks=[];
  for(let row=3;row<=end;row++){
   const text=clean(value(row,2));
   if(text)tasks.push({id:`${sites.length+1}-${row}`,text,owner:clean(value(row,1))||'Atanmamış',row});
  }
  sites.push({id:String(sites.length+1),name:clean(value(2,3)),ada:clean(value(2,4)),parcel:clean(value(2,5)),contact:clean(value(2,6)),area:clean(value(2,7)),units:clean(value(2,8)),period:clean(value(2,9)),sheet:name,tasks});
 }
 if(!sites.length)throw Error('Şantiye sekmeleri bulunamadı. SORUMLU ve İŞ sütunlarını içeren İş Takip Excel dosyasını seçin.');
 const overview=book.Sheets['Tüm İşler'];
 if(overview){const order=new Map();for(let c=2;c<37;c+=2){const a=clean(overview[XLSX.utils.encode_cell({r:1,c})]?.v),p=clean(overview[XLSX.utils.encode_cell({r:2,c})]?.v);order.set(a+'|'+p,c)}for(const site of sites){const col=order.get(site.ada+'|'+site.parcel);if(col!=null)site.inspection=clean(overview[XLSX.utils.encode_cell({r:4,c:col})]?.v);}sites.sort((a,b)=>(order.get(a.ada+'|'+a.parcel)??999)-(order.get(b.ada+'|'+b.parcel)??999))}
 return {source:filename,importedAt:new Date().toISOString(),sites};
}
window.workbookData=workbookData;
