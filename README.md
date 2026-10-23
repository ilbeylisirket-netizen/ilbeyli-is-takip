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
