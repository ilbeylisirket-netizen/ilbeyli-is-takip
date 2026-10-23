# Ortak kayıt bağlantısı — henüz canlıya bağlı değil

Kullanıcı tercihi: bağlantıyı bilen herkes görebilir. Yalnızca onaylanmış hesaplar değiştirebilir. Excel ilk aktarım ve toplu değiştirme içindir; iş notları, sorumlu, durum ve son tarih site üzerinden düzenlenebilir. Değişiklikleri kaydet düğmesi ortak veritabanına yazar. Diğer açık sekmeler yaklaşık 20 saniyede güncellenir. Aynı sürümü iki kişi değiştirirse ikinci kayıt reddedilir ve o kullanıcının taslağı sekmede kalır. CSV dışa aktarımıyla taslağı koruyabilir, güncel kaydı açıp değişikliği tekrar uygulayabilir. Otomatik birleştirme yoktur.

## Proje sahibinin yapacağı adımlar

1. Kendi Supabase hesabında yeni proje açın. Veritabanı parolasını sohbet veya GitHub'da paylaşmayın.
2. SQL Editor'da setup.sql dosyasını bir kez çalıştırın. Public okuma, onaylı editör yazma, atomik sürüm kontrolü ve değişiklik geçmişi oluşturulur.
3. Authentication > Users > Add user > Create new user ile ilk düzenleyici hesabı oluşturun. E-postayı doğrulanmış olarak işaretleyin. Şifreyi güvenli biçimde kullanıcıya iletin; GitHub'a koymayın. Sonraki hesapları da yönetici buradan oluşturur.
4. Oluşan kullanıcının UID değerini kullanarak SQL Editor'da `insert into public.editors(user_id) values ('KULLANICI_UUID');` çalıştırın. Authentication ayarlarında herkese açık hesap oluşturmayı kapatın. Rastgele hesap oluşturulsa bile editors tablosunda onay olmadan yazamaz.
5. Proje URL'si ve **publishable** (veya legacy **anon**) anahtarını web/config.js dosyasına koyun. Bunlar istemci için tasarlanmıştır. **service_role**, **secret** veya veritabanı parolası kesinlikle kullanmayın. Erişim yetkisini public anahtar değil veritabanı kuralları belirler.
6. Bu dalı yayınlanan main dalına aktarın. Vercel yayınının tamamlanmasını kontrol edin.
7. Sitede Yetkili girişi ile giriş yapın, Excel seç ile dosyayı alın, Değişiklikleri kaydet düğmesine basın. Toplu Excel aktarımı mevcut listenin tamamının yerine geçer; önce onay sorulur, ardından kaydetmek gerekir.
8. İkinci bilgisayar veya gizli pencerede verilerin kalıcı ve ortak olduğunu doğrulayın. Giriş yapmadan düzenleme yapılamadığını; iki yetkili sekmede aynı sürümün üzerine kayıt yapıldığında ikincinin reddedildiğini doğrulayın.

Yetkiyi kaldırmak için `delete from public.editors where user_id='KULLANICI_UUID';` çalıştırın. Sonraki kaydetme denemesi sunucu tarafından reddedilir.

Ortak veri herkese açıktır; giriş yalnızca düzenlemeyi sınırlar. Kaynak notlarda kişisel bilgi varsa bu da ortak içerikle görünür. Auth tokenları sadece sessionStorage'da tutulur. Veritabanı geçmişi her başarılı kaydı saklar; yönetici SQL Editor üzerinden görebilir. Geçmiş için uygulama arayüzü veya otomatik geri alma henüz yoktur. Yönetici hesap ekleme işlemleri Supabase panelinden yapılır. Mevcut yerel Excel modu, config boş olduğu sürece korunur.

## Doğrulama

Node paketleri: `jsdom@26.1.0` ve `@electric-sql/pglite`. Paketler ayrı test dizinine kurulduğunda `NODE_PATH=/yol/node_modules node tests/shared-ui.cjs` ve `NODE_PATH=/yol/node_modules node tests/shared-db.cjs` komutları proje kökünden çalıştırılır. UI testleri sentetik veri kullanır. Veritabanı testleri gömülü PostgreSQL üzerinde gerçek RLS/SQL fonksiyonlarını çalıştırır; Supabase auth.uid bağlamı test içinde taklit edilir. Canlı Supabase Auth/API ve gerçek tarayıcı testleri proje bağlanana kadar doğrulanmış sayılmaz.
