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

Şantiye detayında elektrik, su, doğalgaz, ruhsat, iş yeri teslim tutanağı, %20/%40/%60/%80/%95/%100 seviye onayları ve iskân kutuları vardır. Kutu durumları `site.milestones` içinde görevlerden bağımsız saklanır; boş kutu doğrulanmamış, işaretlenen kutu tamamlanmış demektir. Görev düzenlerken bir kontrol maddesi seçilip durum Tamamlandı yapılırsa ilgili kutu işaretlenir. Görevin yeniden açılması kutuyu geri almaz; yetkili kutuyu ayrıca değiştirebilir. Tamamlanan işler aktif listeden ayrılır, şantiye detayındaki arşivde kalır. Ekip işleri ekranında Tamamlananları göster seçeneği vardır.

Şantiye kartı ve detayı yapı denetim firması, mimarlık ofisi, toplam/planlanan kat, mevcut kat ve güncel aşamayı gösterir. Yetkili Şantiye bilgilerini düzenle düğmesini kullanabilir. Kaynaktaki çalışılan kişi alanı mimarlık ofisi diye varsayılmaz. Excel özetindeki 9 yapı denetim firması eski kayıtlar için eşleşen ilçe/ada/parsel üzerinden tamamlanır; elle girilmiş değerler değiştirilmez. Diğer alanlar eksikse Belirtilmemiş gösterilir. Hiçbir aşama serbest notlardan otomatik tamamlanmış sayılmaz.

Bütün değişiklikler Değişiklikleri kaydet düğmesiyle ortak veritabanına aktarılır. Şantiye detayında da Kaydet düğmesi vardır. Yeni tablo/SQL değişikliği gerekmez. Excel tekrar seçildiğinde aynı ilçe/ada/parseldeki sabit kontrol listesi ve şantiye bilgileri korunur (görev listesi dosyadan yenilenir). Yedek indir düğmesi görevlerin yanı sıra kontrol kutuları ve şantiye bilgilerini de içeren JSON dosyası üretir. Bu yedek için otomatik geri yükleme arayüzü henüz yoktur.

UI testleri tamamlanan işin arşivlenmesini, bağlantılı kontrol kutusunun işaretlenmesini, görev kaldırıldığında kutunun korunmasını, site bilgilerinin kaydedilmesini, Excel yenilemede bilgi korumayı ve ziyaretçinin salt okuma yetkisini kapsar.

## Yeni şantiye ve arşiv

Yetkili kullanıcı üstteki Yeni şantiye ekle düğmesiyle ilçe/ada/parsel ve diğer bilgileri girebilir. Ada 0 geçerlidir. Aynı ilçe/ada/parsel için yinelenen kayıt engellenir; arşivde mevcutsa geri alma önerilir. Yeni şantiye boş iş listesi ve kontrol listesiyle açılır.

Şantiye detayındaki Şantiyeyi arşivle düğmesi onay sorar. Arşiv fiziksel silme değildir: işler, kontrol kutuları ve bilgiler saklanır; aktif kartlar, iş listeleri ve ana sayfa toplamlarından çıkar. Soldaki Arşivlenen şantiyeler üzerinden görüntülenir ve yetkili tarafından Ana listeye geri al düğmesiyle geri alınabilir. Arşivdeki şantiye geri alınana kadar düzenlenmez. Ekleme, arşivleme ve geri alma işlemleri Değişiklikleri kaydet ile ortak kayda aktarılır. Yeni SQL kurulumu gerekmez. Kullanıcı ayrıca kaydetmeden canlı kayıtlar otomatik arşivlenmez.

Excel yenilemesi arşiv durumunu korur. Dosyada artık bulunmayan arşivlenmiş şantiyeler ve sitede oluşturulmuş şantiyeler de saklanır. Yedek indir bütün şantiyeleri, arşiv dahil, içerir. UI testleri ekleme/kalıcı kayıt, arşivleme/geri alma, iptal, tekrarlanan kayıt kontrolü ve salt okuma yetkisini kapsar.
