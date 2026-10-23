const Cloud = (()=>{
 const cfg=window.CLOUD_CONFIG||{},enabled=Boolean(cfg.url&&cfg.key),base=String(cfg.url||'').replace(/\/$/,'');
 let session=null,refreshing=null;
 try{session=JSON.parse(sessionStorage.getItem('ilbeyli-session')||'null')}catch{}
 function store(s){session=s;try{if(s)sessionStorage.setItem('ilbeyli-session',JSON.stringify(s));else sessionStorage.removeItem('ilbeyli-session')}catch{}}
 async function request(path,options={},token=true){
  if(token&&session&&session.expires_at*1000<Date.now()+30000)await refresh();
  const r=await fetch(base+path,{...options,headers:{apikey:cfg.key,'Content-Type':'application/json',Authorization:'Bearer '+(token&&session?session.access_token:cfg.key),...options.headers}});
  const text=await r.text();let body;try{body=JSON.parse(text)}catch{body={message:text}}
  if(!r.ok){const err=new Error(body.message||body.msg||body.error_description||'Bağlantı kurulamadı');err.code=body.code;err.status=r.status;throw err}return body;
 }
 async function refresh(){if(!session?.refresh_token)throw Error('Yeniden giriş yapın.');if(!refreshing)refreshing=request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})},false).then(store).catch(e=>{store(null);throw e}).finally(()=>{refreshing=null});await refreshing;}
 return {enabled,get session(){return session},async read(){const rows=await request('/rest/v1/workbook?id=eq.1&select=payload,version,updated_at',{},false);if(!rows[0])throw Error('Ortak kayıt bulunamadı. Veritabanı kurulumunu kontrol edin.');return rows[0]},async login(email,password){store(await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})},false));},async editor(){if(!session)return false;const rows=await request('/rest/v1/editors?select=user_id');return rows.some(r=>r.user_id===session?.user?.id)},async logout(){try{if(session)await request('/auth/v1/logout',{method:'POST'})}finally{store(null)}},async save(version,payload){const rows=await request('/rest/v1/rpc/save_workbook',{method:'POST',body:JSON.stringify({expected_version:version,new_payload:payload})});return rows[0]}};
})();
