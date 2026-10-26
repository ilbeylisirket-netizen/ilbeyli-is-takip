# Beton Programı bağlantısı

Hazırlanan kaynak: kullanıcının özel Google E-Tablolar dosyası (Sayfa2, gid 1892602527). Şantiye eşleştirmesi ilçe + ada + parselin kesin ve tek eşleşmesine dayanır. Parantezli mahalle eki ilçeden ayrılır; değiştirilmiş şantiye adları için önceki sourceKey de dikkate alınır. Eşleşmeyen veya belirsiz kayıtlar sadece Beton programı genel ekranında görünür. Kişi adı eşleştirme için kullanılmaz.

## 1. Veritabanı

Supabase SQL Editor içinde `supabase/concrete.sql` bir kez çalıştırılır. Bu, eski şantiye kayıtlarından ayrı public.concrete_program tablosunu ve dar yetkili aktarım fonksiyonlarını oluşturur. Siteyi görüntüleyen herkes beton kayıtlarını da görür. Editörler Beton Excel seç düğmesinden ilk dosyayı yükleyebilir; bu yükleme ayrı bir kayıttır, ayrıca iş takip Kaydet düğmesine basılmaz. Excel tek seferlik fotoğraftır; otomatik bağlantı değildir. Aynı sürüm üzerine iki aktarım çakışırsa ikincisi reddedilir.

Sitede genel Beton programı görünümü ve her şantiye detayında ilgili beton kayıtları bölümü vardır. Veri 60 saniyede bir yenilenir; yenile simgesi de yeniden okur. Başarısız okumada eski veri varsa korunur ve uyarı gösterilir. Rapor tarihleri rapor sonucu olarak yorumlanmaz; NUMUNE ALINMADI, 50+ m3 veya ? m3 gibi değerler aynen korunur. Tarihten dökümün tamamlandığı tahmin edilmez. Ana iş listesi, kat bilgisi ve kontrol kutuları değiştirilmez.

## 2. Özel Google tablosundan otomatik aktarım

Supabase SQL Editor'da aşağıdaki ayrı sorgu güçlü bir bağlantı anahtarı üretir ve sadece özetini veritabanında saklar. Yeniden çalıştırılırsa eski anahtarı iptal eder. Çıkan değeri sohbet, GitHub veya istemci config.js dosyasına koymayın; doğrudan Apps Script proje özelliklerine kaydedin.

```sql
with token as (select gen_random_uuid()::text || gen_random_uuid()::text as value),
saved as (
 insert into public.concrete_sync_access(id,token_hash)
 select 1,encode(sha256(convert_to(value,'UTF8')),'hex') from token
 on conflict(id) do update set token_hash=excluded.token_hash
)
select value as beton_sync_token from token;
```

Google E-Tablolar'da Uzantılar > Apps Script açılır. `BetonSync.gs` dosyasının tam içeriği yapıştırılır. Proje ayarları > Komut dosyası özellikleri bölümünde BETON_SYNC_TOKEN adında özellik eklenip üretilen değer buraya kaydedilir. Hizmet hesabı, service_role veya Google tablosunu herkese açmak gerekmez. Sabit kaynak dosya kimliği ve sekme kimliği kodda kayıtlıdır.

`setupBetonSync` fonksiyonu bir kez proje sahibince çalıştırılır. Google'ın gösterdiği izin kapsamları kaynak tabloyu okumak, Google'dan Supabase'e HTTPS çağrısı yapmak ve tetikleyicileri yönetmek içindir. İlk gerçek aktarım başarısızsa tetikleyiciler kurulmaz. İzinler kullanıcı tarafından tamamlanmadan otomatik aktarım çalışmaz.

Başarılı kurulumda aynı kaynak için düzenleme, değişiklik (satır ekleme/silme gibi) ve 15 dakikalık zaman tetikleyicileri kurulur. Aynı veriler tekrar yazılmaz. Formül/API kaynaklı değişiklikler onEdit'i çalıştırmayabilir; 15 dakikalık kontrol bunları alır. Apps Script ve API kotaları/servis gecikmeleri nedeniyle anlık teslim garantisi yoktur. Apps Script Executions ekranı başarısız çalışmaları gösterir. Kod anahtarı veya satır içeriklerini hata loguna yazmaz.

Otomatik aktarım kaynak sekmenin tam listesini yansıtır. Kaynak satır silinirse beton listesinden de kalkar. Kaynak boşaltılırsa beton kayıtları boşalabilir; şantiye iş takip listesi etkilenmez. Google tablosu yetkileri değişirse veya tetikleyiciyi kuran hesabın erişimi kaldırılırsa yeniden yetkilendirme gerekebilir. Otomatik aktarım devredeyken elle Excel yüklemesi geçicidir: sonraki tetikleyici Google tablosundaki asıl listeyi geri getirir. Site üzerinden düzenleme yapılmışsa güncel BetonSync.gs kodu source alanındaki İş takip sitesi işaretini görüp aktarımı durdurur. Önceden kopyalanmış eski Apps Script kodu kendiliğinden güncellenmez; böyle bir tetikleyici varsa durdurulmalı veya güncel kodla değiştirilmelidir.

## Doğrulama

`tests/concrete.cjs`, jsdom testleri için kurulan dizindeki @electric-sql/pglite ile çalışır. Excel veri tipleri, rapor açıklamaları, kimlik eşleştirmesi ve belirsizliğin reddi; gerçek PostgreSQL RLS/fonksiyon izinleri, hatalı anahtar, sürüm çakışması, normal şantiye kaydından yalıtım; Apps Script'in simüle edilmiş Google ortamında yinelenen aktarımı atlaması ve kimlik eksikse veriyi koruması kontrol edilir. Gerçek yüklenen çalışma kitabıyla ayrıca 19 kayıt ve 3 şantiyenin eşleşmesi doğrulandı. Canlı SQL kurulumu, ilk kalıcı dosya aktarımı ve gerçek Google tetikleyicisi kullanıcı hesabındaki adımlar tamamlanana kadar doğrulanmış sayılmaz.

## Site üzerinden beton takibi

Beton programında ve ilgili şantiye detayında + Yeni beton dökümü düğmesi vardır. Yetkili hesap şantiyeyi seçer, döküm yeri/tarih/saat/miktar/sınıf/rapor tarihleri/notları girer; Kaydet doğrudan ayrı beton tablosuna yazar. Mevcut satırdaki Düzenle formu aynı kaydı değiştirir. Döküldü kutusu işaretlenince doğrudan veritabanına kaydolur, satır yeşil olur; kaldırıldığında turuncu olur. İş takip Kaydet düğmesine ayrıca basılmaz. Giriş yapmayanlar kontrol düğmeleri olmadan görüntüler. Sürüm çakışmasında açık formun taslağı korunur. Aynı kaydı değiştirmeden önce güncel veriyi yeniden açmak gerekir. Yeni kayıt için mevcut şantiye seçilir ve doğrudan siteId ile bağlanır; şantiye adı daha sonra değişse de bağlantı korunur. Rapor açıklamaları metin olarak da saklanabilir. Bu özellik ek SQL değişikliği gerektirmez.
