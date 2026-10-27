# İlbeyli Şantiye Yönetimi

Yüklenen Is_Takip.xlsx dosyasından 17 şantiye ve 73 iş notunu gösteren Türkçe, mobil uyumlu ilk sürüm.

## Başlatma

```sh
cd /workspace/ilbeyli-is-takip
python server.py
```

Varsayılan port 3000; `PORT` ile değiştirilebilir. Arayüz Python standart kütüphanesiyle sunulur; Node bağımlılığı yoktur.

## Excel verisini güncelleme

```sh
python -m venv --system-site-packages /workspace/.ilbeyli-venv
/workspace/.ilbeyli-venv/bin/python -m pip install --cache-dir /tmp/ilbeyli-pip-cache -r requirements.txt
/workspace/.ilbeyli-venv/bin/python scripts/import_excel.py /tam/yol/Is_Takip.xlsx
```

Aktarım web/data.json dosyasını değiştirir. Sayfadaki yenile düğmesi bu dosyayı tekrar okur. Google E-Tablolar'a canlı bağlantı veya geri yazma yoktur. Şantiye sekmelerinin kaynak hücreleri esas alınır; tarih ve durumlar notlardan tahmin edilmez. Sorumlu sadece SORUMLU sütunundan alınır; not içindeki isimlerden otomatik atama yapılmaz.

Arama, sorumlu filtresi, şantiye detayları ve filtrelenen işlerin CSV olarak dışa aktarımı bulunur. Tarihli işler ekranı kaynakta son teslim tarihi alanı bulunmadığını açıklar.

## Kontroller ve sınırlar

HTTP yanıtları ve Excel aktarım sayıları doğrulandı, JavaScript sözdizimi kontrolünden geçti. Playwright tarayıcı indirmesi ağ erişimi nedeniyle engellendiğinden tarayıcı etkileşim/görsel testleri tamamlanmadı.

Bu sürümde kullanıcı girişi yoktur. Kişisel iş kayıtları içeren bu uygulama yayınlanmadan önce yetkilendirme eklenmelidir.

## GitHub ve yayınlama

`web/data.json` ve Excel dosyaları özel iş kayıtları içerdiği için Git'e dahil edilmez. Kod bu veri dosyası olmadan açılır ve veri beklediğini gösterir; temsili şantiye veya rakamlar üretmez. Mevcut bulut ortamındaki gerçek veriler korunur.

Statik barındırma için kök dizin `web`, derleme komutu yoktur. GitHub'a kod yüklemek siteyi yayınlamaz. İş verileri bağlanmadan ve erişim kontrolü belirlenmeden canlıya kişisel veri eklemeyin.

## Tarayıcıda özel Excel açma

Üst menüdeki **Excel seç** düğmesi ile `.xlsx` dosyası seçilebilir (en fazla 10 MB). Dosya, yerel olarak paketlenmiş SheetJS CE 0.18.5 ile tarayıcıda okunur; ağ üzerinden gönderilmez, localStorage veya çerezlere kaydedilmez. Sayfa yeniden yüklenince dosya yeniden seçilir. Yenile simgesi açık sekmedeki veriyi korur. Google E-Tablolar ile canlı bağlantı değildir; diğer kullanıcılar seçilen dosyayı göremez. Paket lisansı web/vendor/XLSX-LICENSE.txt içindedir.

Tarayıcı aktarım kodu gerçek çalışma kitabıyla Node altında kontrol edildi: 17 şantiye, 73 not, özet sırası ve Kartal parsel hücresinin doğruluğu; boş çalışma kitabının reddi. Tam tarayıcı etkileşim testi henüz yapılmadı.

## Sabit şantiye kontrol listesi ve bilgi kartı

Şantiye detayında elektrik, su, doğalgaz, ruhsat, iş yeri teslim tutanağı, %20/%40/%60/%80/%95/%100 seviye onayları ve iskân kutuları vardır. Kutu durumları `site.milestones` içinde görevlerden bağımsız saklanır; boş kutu doğrulanmamış, işaretlenen kutu tamamlanmış demektir. Görev düzenlerken bir kontrol maddesi seçilip durum Tamamlandı yapılırsa ilgili kutu işaretlenir. Görev Tekrar listeye al ile veya düzenleme formundan Tamamlandı durumundan çıkarıldığında aktif listeye döner; ilişkili kutunun işareti kaldırılır. Yetkili kutuyu ayrıca değiştirebilir. Tamamlanan işler aktif listeden ayrılır, şantiye detayındaki arşivde kalır. Ekip işleri ekranında Tamamlananları göster seçeneği vardır.

Şantiye kartı ve detayı yapı denetim firması, mimarlık ofisi, toplam/planlanan kat, mevcut kat ve güncel aşamayı gösterir. Yetkili Şantiye bilgilerini düzenle düğmesini kullanabilir. Kaynaktaki çalışılan kişi alanı mimarlık ofisi diye varsayılmaz. Excel özetindeki 9 yapı denetim firması eski kayıtlar için eşleşen ilçe/ada/parsel üzerinden tamamlanır; elle girilmiş değerler değiştirilmez. Diğer alanlar eksikse Belirtilmemiş gösterilir. Hiçbir aşama serbest notlardan otomatik tamamlanmış sayılmaz.

Bütün değişiklikler Değişiklikleri kaydet düğmesiyle ortak veritabanına aktarılır. Şantiye detayında da Kaydet düğmesi vardır. Yeni tablo/SQL değişikliği gerekmez. Excel tekrar seçildiğinde aynı ilçe/ada/parseldeki sabit kontrol listesi ve şantiye bilgileri korunur (görev listesi dosyadan yenilenir). Yedek indir düğmesi görevlerin yanı sıra kontrol kutuları ve şantiye bilgilerini de içeren JSON dosyası üretir. Bu yedek için otomatik geri yükleme arayüzü henüz yoktur.

UI testleri tamamlanan işin arşivlenmesini, bağlantılı kontrol kutusunun işaretlenmesini, görev kaldırıldığında kutunun korunmasını, site bilgilerinin kaydedilmesini, Excel yenilemede bilgi korumayı ve ziyaretçinin salt okuma yetkisini kapsar.

## Yeni şantiye ve arşiv

Yetkili kullanıcı üstteki Yeni şantiye ekle düğmesiyle ilçe/ada/parsel ve diğer bilgileri girebilir. Ada 0 geçerlidir. Aynı ilçe/ada/parsel için yinelenen kayıt engellenir; arşivde mevcutsa geri alma önerilir. Yeni şantiye boş iş listesi ve kontrol listesiyle açılır.

Şantiye detayındaki Şantiyeyi arşivle düğmesi onay sorar. Arşiv fiziksel silme değildir: işler, kontrol kutuları ve bilgiler saklanır; aktif kartlar, iş listeleri ve ana sayfa toplamlarından çıkar. Soldaki Arşivlenen şantiyeler üzerinden görüntülenir ve yetkili tarafından Ana listeye geri al düğmesiyle geri alınabilir. Arşivdeki şantiye geri alınana kadar düzenlenmez. Ekleme, arşivleme ve geri alma işlemleri Değişiklikleri kaydet ile ortak kayda aktarılır. Yeni SQL kurulumu gerekmez. Kullanıcı ayrıca kaydetmeden canlı kayıtlar otomatik arşivlenmez.

Excel yenilemesi arşiv durumunu korur. Dosyada artık bulunmayan arşivlenmiş şantiyeler ve sitede oluşturulmuş şantiyeler de saklanır. Yedek indir bütün şantiyeleri, arşiv dahil, içerir. UI testleri ekleme/kalıcı kayıt, arşivleme/geri alma, iptal, tekrarlanan kayıt kontrolü ve salt okuma yetkisini kapsar.

## Kontrol kutularında konum ve görev ilişkilendirmesi

Kontrol kutusuna basıldığında detay penceresi kapatılıp açılmaz; checkbox düğümü, odağı ve kaydırma konumu korunur. Diğer detay güncellemelerinde de kaydırma konumu ve tamamlanan işler bölümünün açık/kapalı durumu korunur.

Görev durumunu Tamamlandı yapmak veya hızlı Tamamla düğmesini kullanmak, ilişkilendirilmiş sabit maddeyi tamamlandı olarak işaretler. Sil düğmesi onay sorar; ilişkili madde varsa bu onay metninde açıkça belirtilir. Onaydan sonra görev listeden kaldırılır, site.deletedTasks içinde geçmiş kopyası tutulur, sabit kutu işaretli kalır. Silme iptal edilirse görev ve kutu değişmez. Bağlantısız görev tamamlamak/silmek diğer kutulara dokunmaz. Silinen görevler için ayrı geri yükleme ekranı yoktur; tam JSON yedeğinde bulunurlar. Serbest nottan tamamlanma tahmin edilmez; görev durumu veya kullanıcının Tamamla/Sil işlemi esas alınır. Ortak kalıcılık için Değişiklikleri kaydet kullanılır.

DOM testleri kutu düğümünün/odağın/scrollTop değerinin korunmasını, hızlı tamamlamayı, silmenin iptalini ve onayını, bağlantılı kutuların ve geçmişin ortak kayıt yüküne dahil olmasını doğrular. Gerçek tarayıcıda görsel kaydırma testi ayrıca yapılmamıştır.

Tamamlanan işlerde Tekrar listeye al düğmesi bulunur. Geri alınan iş Devam ediyor durumuna geçer ve kendi ilişkili sabit kutusu Tamamlanmadı olarak güncellenir. Ortak kayda kalıcı aktarım için Değişiklikleri kaydet gerekir. Başka kutulara dokunulmaz. Hızlı geri alma ve düzenleme formundan yeniden açma, kutu sıfırlaması ve kayıt yükü testlerle doğrulanır.

## Beton programı

Çalışma alanı menüsündeki Beton programı bütün dökümleri gösterir. Şantiye detayındaki Beton programı bölümü ise ilçe/ada/parsel ile kesin eşleşen kayıtları gösterir. Tablo, tarih/saat, miktar, sınıf, 7/28 günlük rapor tarihleri, kaynak notları ve tamamlanma sütununu korur. İlk kurulum için supabase/concrete.sql gerekir; Google E-Tablolar otomatik bağlantısının ve Excel ilk aktarımının adımları integrations/README.md içindedir. Mevcut iş kayıtlarından ayrı tabloda saklanır; ana iş listesini/kat bilgisini/kontrol kutularını otomatik değiştirmez. Otomatik bağlantı kullanıcı hesabında Apps Script tetikleyicileri kurulmadan aktif değildir.

## Günlük özet

Yalnızca Günlük özet menüsünde seçilen günün işleri, gecikenler/engeller, beton döküm planları, rapor takibi, tamamlanma bildirimleri, sonraki 7 gün ve eksik bilgiler gösterilir. Bu özet mevcut kayıtlardan yerel olarak hesaplanır; harici yapay zekâ servisine veya e-postaya veri gönderilmez. Gün sınırı Europe/Istanbul saat dilimidir. Tarih, bildirim türü ve şantiye/kişi aramasıyla süzülebilir. Bildirimlerin şantiye bağlantıları detayı açar. Ana sayfa filtreleri özetin kapsamını daraltmaz; özet kendi filtresini kullanır. Açık sayfada tarih/bildirimler dakikada bir güncellenir.

İş son tarihleri yalnızca ayrı due alanından alınır; serbest notlardan tarih tahmin edilmez. Yeni tamamlamalarda completedAt kaydedilir, tekrar aktif yapılınca kaldırılır; eski kayıtlarda zaman yoksa bugünkü tamamlananlara dahil edilmez. Sabit kutular için mevcut updatedAt kullanılır. Arşivdeki şantiyeler ve işleri günlük hatırlatmalara dahil edilmez. Eksik tarih, sorumlu ve şantiye bilgileri açıkça belirtilir. Kaydedilmemiş taslaklar özete dahilse kutuda açıklanır.

Beton rapor hatırlatmaları döküldü işaretli kayıtların rapor tarihlerine göre hesaplanır. Beklenen tarihin gelmesi sonucun çıktığı/olumlu olduğu anlamına gelmez. Beton düzenleme formunda 7 günlük rapor alındı / 28 günlük rapor alındı seçenekleri vardır; işaretlenince hatırlatma kalkar ve alındı olarak işaretlenme zamanı tutulur. Rapor içerik değerlendirmesi yapılmaz. NUMUNE ALINMADI gibi açıklamalar hatalı tarih sayılıp vade üretilmez. İşaretli olmayan geçmiş döküm için sadece plan tarihinin geçtiği ve tamamlanma teyidi olmadığı söylenir.

`node tests/daily.cjs` günlük özetin tarih sınırları, arşiv hariç tutma, eksik tarih, eski tamamlanmış kayıt, rapor alınma işareti ve özel rapor açıklamaları davranışını doğrular. UI testleri yeni tamamlanma/alınma zamanlarının kayıt yüküne dahil olmasını da kontrol eder. Ek SQL değişikliği gerekmez.

## Beton programından otomatik şantiye durumu

Şantiye kartının Güncel aşama bölümü ve şantiye detayı, kesin eşleşen beton kayıtlarından otomatik özet üretir. Bugün veya gelecekteki en yakın tamamlanmamış döküm, döküm yeri/kat ve tarih-saatle plan olarak gösterilir. Döküldü işaretlenince varsa sıradaki plan öne geçer ve son dökülen beton da ayrıca görünür; başka plan yoksa en son tarihli tamamlanmış döküm gösterilir. Döküldü işareti geri alınırsa plan durumuna döner. Geçmiş plan, daha yeni doğrulanmış dökümü geçersiz kılmaz. Son tamamlanandan daha yeni geçmiş tarihli bir plan varsa Döküm teyidi bekleniyor gösterilir; tarihten tamamlanma tahmin edilmez.

Bu özet iki kaynağı okumayla birleştirir; normal şantiye kaydının stage/currentFloor alanlarını otomatik olarak değiştirmez. Elle girilen aşama doluysa kart ve detayda önceliklidir; beton özeti bu durumda onun yerine geçmez. Alan boşsa beton özeti kullanılır. Düzenleme formunda otomatik bilgi sadece yer tutucu olarak gösterilir; diğer bilgileri kaydetmek otomatik metni manuel aşamaya dönüştürmez. Beton kaydı olmayan şantiye eski manuel aşama görünümünü kullanır. Kaydetme veya periyodik beton verisi yenileme sonrası karttaki durumlar yenilenir; şantiye penceresi kapatılmaz ve kaydırma konumu korunur. Bu özellik için ek SQL kurulumu gerekmez. Testler ardışık planları, saat sırasını, tamamlamayı/geri almayı ve manuel bilgilerin korunmasını kapsar.

## Beton dökümünden mevcut kat bilgisi

Kart, şantiye detayı ve bilgi düzenleme formu Mevcut kat / yapılan kat alanında en son tarihli Döküldü işaretli betonun döküm yeri bilgisini kullanır. Sadece tamamlandı işaretli ve geçerli tarihli, kesin eşleşen kayıtlar dikkate alınır. Döküm metni aynen kullanılır; temel/kolon/tabliye açıklamasından kat sayısı tahmin edilmez. Bu görünüm beton verisinden hesaplanır ve kaydedilmiş beton kaydı sayesinde bütün cihazlarda aynıdır; arka planda normal workbook kaydına ikinci bir otomatik yazma yapılmaz.

Eski manuel currentFloor değeri korunur. Formda otomatik değer değiştirilmeden diğer bilgiler kaydedilirse otomatik metin manuel alana kopyalanmaz. Kullanıcı Mevcut kat bilgisini elle değiştirirse en son döküm imzası currentFloorBasis alanına kaydedilir; aynı döküm geçerliyken manuel düzeltme kullanılır. Yeni döküm tamamlandığında otomatik bilgi yeniden öncelik kazanır. Döküldü geri alınırsa önceki tamamlanmış döküm veya korunmuş manuel değer gösterilir. Yeni tamamlamalara completedAt eklenir. Güncel aşamanın önceki manuel-öncelikli kuralı korunur. SQL kurulumu gerektirmez.

API ile başka sistemler veri okuyorsa etkili mevcut kat bilgisinin workbook.currentFloor ile concrete_program.rows birlikte değerlendirilerek üretildiği dikkate alınmalıdır; yalnızca workbook okumak son beton bilgisini göstermeyebilir.
