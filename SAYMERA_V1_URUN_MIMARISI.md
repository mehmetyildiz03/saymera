> **v1.2 notu:** 1. sınıf çekirdeği 22 atomik beceriye genişletildi. Güncel durum için `SINGAPORE_P1_COVERAGE.md` ve `REPRESENTATION_ENGINE_V1_2.md` esas alınmalıdır.

# v1.1 durum notu — 2026-09-16

Bu belgenin v1 tasarım gerekçesi korunur. v1.1 ile görev motoru `concept instance → representation task → response contract → evidence` yapısına taşınmaya başlanmıştır. 1. sınıfın 10 becerisinin tamamı referans kaliteye geçirilmiştir; kalan okul öncesi ve 2. sınıf becerileri için güncel teknik sözleşme `REPRESENTATION_ENGINE_V1_1.md`, geçiş durumu `TASK_MIGRATION_MATRIX.md` içindedir.

---

# SAYMERA — Matematik Laboratuvarı
## Ürün mimarisi, pedagojik gerekçe ve v1 uygulama kararı

**Durum:** Çalışan bağımsız web/PWA uygulaması  
**Kapsam:** Okul öncesi, 1. sınıf, 2. sınıf  
**Proje sınırı:** SAYMERA, SayıYolu değildir. SayıYolu kaynaklarına, depolamasına veya ürün kimliğine dokunmaz.

---

## 1. Ürün tezi

Çoğu çocuk matematik uygulaması şu döngüyü kullanır:

`Soru → cevap → doğru/yanlış → puan → daha zor soru`

SAYMERA'nın çekirdek döngüsü farklıdır:

`Kavram → Kur → Gör → Yaz → Anlat → Taşı → daha sonra hatırla`

Amaç, aynı soru tipini tanımayı “kavramı öğrendi” sanmamaktır. Bir çocuk aynı matematiksel ilişkiyi nesneyle kurabiliyor, görselde okuyabiliyor, sembolle ifade edebiliyor, nedenini ayırt edebiliyor ve yeni bir bağlama taşıyabiliyorsa daha güçlü bir kavrayış kanıtı oluşur.

Bu yüzden ürünün ana nesnesi **soru değil kavram**, ana ilerleme göstergesi **puan değil kanıt profili**dir.

---

## 2. Müfredat sentezi

### Singapur — problem çözme omurgası

Singapur MOE'nun güncel Primary Mathematics Syllabus'ı matematiksel problem çözmeyi merkeze alır; kavramlar, beceriler, süreçler, metabiliş ve tutumları birbirine bağlı bileşenler olarak tanımlar. 2025 güncellemesi ayrıca akıl yürütme, temsil/iletişim, uygulama ve gerçek dünya problemlerini açık biçimde vurgular.

Kaynak: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf

### Japonya — matematiksel etkinlik ve ifade

Japon yaklaşımından alınan temel ürün ilkesi, çocuğun yalnızca sonucu üretmesi değil; somut nesne, şekil, sayı, işlem ve dil arasında bağ kurmasıdır. Uygulamada bunun karşılığı “Anlat” kanıtı ve bir kavramın birden çok temsil üzerinden dönüştürülmesidir.

Kaynak: https://www.mext.go.jp/a_menu/shotou/new-cs/youryou/syo/san.htm

### Türkiye — sınıf ve içerik uyumluluğu

SAYMERA'nın sınıf haritası Türkiye Yüzyılı Maarif Modeliyle uyumlu tutulur. 1. sınıfta 20'ye kadar sayı ve nicelik, karşılaştırma, örüntü, toplama/çıkarma, eşitlik ve günlük yaşam problemleri; 2. sınıfta sayı sistemi, işlemler, geometri, ölçme, zaman, para ve veri gibi alanlar ürünün beceri grafında karşılık bulur.

Kaynaklar:
- https://tymm.meb.gov.tr/ilkokul-matematik-dersi/unite/45
- https://tymm.meb.gov.tr/ilkokul-matematik-dersi/unite/99
- https://tymm.meb.gov.tr/upload/program/2024programmat1234Onayli.pdf

### IES / What Works Clearinghouse — öğretim bileşenleri

Üründe somut ve yarı-somut temsiller, sayı doğrusu, sözel problemler, gelişimsel ilerleme ve ilerleme izleme kullanılır. Bunlar IES/WWC rehberlerindeki önerilerle uyumludur.

Kaynaklar:
- https://ies.ed.gov/ncee/wwc/practiceguide/18
- https://ies.ed.gov/ncee/wwc/PracticeGuide/26

**Önemli sınır:** `Kur · Gör · Yaz · Anlat · Taşı` adıyla yayımlanmış ve doğrudan doğrulanmış tek bir akademik protokol yoktur. Bu beş pencere, güçlü öğretim ilkelerinin SAYMERA için oluşturulmuş ürün sentezidir. Uygulama “kanıta dayalı bileşenler kullanıyor” diyebilir; “öğrenme etkisi klinik/akademik olarak kanıtlandı” diyemez.

---

## 3. Kavrayış Prizması

Her beceri beş ayrı kanıt penceresinde izlenir:

| Pencere | Çocuğun yaptığı | Ölçülen ilişki |
|---|---|---|
| **Kur** | Nesne, grup, parça veya manipülatifle yapıyı kurar | Somut kavram yapısı |
| **Gör** | Görsel modeli okur | Temsil tanıma |
| **Yaz** | Sayı ve sembolle ifade eder | Matematik dili |
| **Anlat** | Strateji/gerekçe seçer | Muhakeme ve metabiliş |
| **Taşı** | Yeni günlük bağlamda uygular | Yakın transfer |

Bir kavramın tek bir yüzdesi gösterilebilir; ancak bu yüzde beş kanıt penceresinin görünür profilini gizlemez.

---

## 4. Oturum motoru

Yeni oturum tasarımı özellikle rastgele “soru yağmuru”ndan kaçınır.

1. Motor, ön koşulları açık olan beceriler arasında en yüksek öğrenme ihtiyacını seçer.
2. Oturumun **odak kavramı sabitlenir**.
3. Aynı kavram beş temsil penceresinde çalışılır.
4. Önceden zamanı gelmiş bir gecikmeli geri çağırma varsa oturum başına en fazla bir kısa hatırlama öne alınabilir.
5. Yanlış cevap, ceza veya puan kaybı değildir; motor birkaç adım sonrasına alternatif bir temsil “köprüsü” ekler.
6. Zorluk tek doğru serisiyle sıçramaz; histerezis kullanır.
7. Kavramın “sağlam” sayılması için yalnızca yüksek doğruluk değil, çoklu temsil ve gecikmeli hatırlama gerekir.

Bu akışın amacı oturum içinde **derinlik**, oturumlar arasında **geri çağırma** sağlamaktır.

---

## 5. Yanlış cevap tasarımı

SAYMERA yanlış cevabı üç şey için kullanır:

- hangi temsil bağlantısının zayıf olduğunu belirlemek,
- bir sonraki açıklama/temsili seçmek,
- aynı kavramı gecikmeli olarak yeniden sormak.

Çocuğa “başarısız oldun” dili gösterilmez. Uygulama:

**Hata değil · ipucu → temsili değiştir → ilişkiyi görünür yap → birkaç adım sonra yeniden dene**

akışını kullanır.

---

## 6. İçerik haritası — mevcut çalışan kapsam

### Okul öncesi — 8 atomik beceri

Bir bakışta miktar, 10'a kadar sayma, miktar karşılaştırma, parça–bütün, AB örüntüsü, temel şekiller, özelliğe göre sınıflama, konum-yön.

### 1. sınıf — 10 atomik beceri

20 içinde sayı ve miktar, 10'u tamamlama, 20 içinde toplama, 20 içinde çıkarma, eşitliğin anlamı, tek adımlı problem, artan/azalan örüntü, şekil özellikleri, uzunluk karşılaştırma, basit veri okuma.

### 2. sınıf — 13 atomik beceri

Onluk-birlik, 100 içinde toplama/çıkarma, gruplarla çarpma, paylaştırarak bölme, yarım/çeyrek, iki ilişkili problem, sayı örüntüsü, şekil-cisim ilişkileri, santimetre, saat/yarım saat, lira problemleri, sütun grafiği.

Toplam: **31 beceri × 5 temsil penceresi**.

---

## 7. Arayüz mimarisi

### Çocuk ana ekranı

Ana ekran tek soruya cevap verir: **“Şimdi hangi kavramı neden çalışıyorum?”**

- Büyük birincil eylem: “Keşfi başlat”
- “Şimdi Odak” kartı
- Kavrayış Prizması: beş pencerenin durumu
- “Neden bu kavram?” açıklaması
- kısa geri çağırma ve sağlamlaşma özeti
- Kavram Atlası ön izlemesi

Yıldız, seri, liderlik tablosu, hız yarışması veya kaybetme mekaniği yoktur.

### Kavram Atlası

Kazanım listesi yerine her kavram için:

- kavrayış yüzdesi,
- beş pencerenin ayrı durumu,
- ön koşul kilidi,
- karşılaşma sayısı,
- sağlam / gelişiyor / bekliyor durumu

gösterilir.

### Ebeveyn/Eğitmen alanı

Çocuğun ana ekranına veri yükü bindirilmez. Yetişkin alanında:

- temsil bazında ortalama kanıt,
- öncelikli destek,
- seviye,
- sesli yönerge,
- azaltılmış hareket,
- mola süresi

bulunur.

---

## 8. Mola ve ekran süresi kararı

Uygulama “10 dakika çalış, bilimsel olarak tam 30 dakika bekle” gibi evrensel bir optimum iddiası kullanmaz. Böyle bir tek sayı çocuğun yaşından, görev yükünden ve kullanım bağlamından bağımsız olarak savunulamaz.

Bunun yerine:

- oturum soru sayısıyla değil yaklaşık **çaba bütçesiyle** sınırlandırılır,
- okul öncesinde daha düşük, 2. sınıfta biraz daha yüksek bütçe kullanılır,
- oturum sonunda ekran dışı mola varsayılan olarak açılır,
- aynı gün tekrarlanan oturumlarda “akıllı” mod molayı uzatabilir,
- ebeveyn 5/10/30/60 dakika seçebilir,
- bu süreler “kanıtlanmış optimum” olarak sunulmaz.

---

## 9. Çocuk güvenliği ve mahremiyet

Mevcut sürüm **local-first**tir:

- hesap yok,
- reklam yok,
- üçüncü taraf analitik yok,
- konum yok,
- kamera yok,
- mikrofon kaydı yok,
- sosyal profil yok,
- ilerleme yalnız bu uygulamanın `saymera.math.v2` localStorage alanında tutulur.

Bu storage anahtarı SayıYolu ve önceki SAYMERA prototipinden ayrıdır.

---

## 10. Teknik yapı

- `index.html` — ürün kabuğu, onboarding, çocuk/atlas/yetişkin ekranları
- `styles.css` — responsive tasarım sistemi
- `engine.mjs` — beceri grafı, kanıt modeli, adaptasyon, 31 soru üreticisi
- `app.js` — oturum orkestrasyonu, UI, local state, mola, ses
- `manifest.webmanifest` — PWA tanımı
- `sw.js` — offline cache
- `tests/engine.test.mjs` — motor invariantları ve üretken soru testleri
- `tests/ui-static.test.mjs` — DOM/CSS/PWA/storage/standalone kontrolleri
- `SAYMERA_v1_TEK_DOSYA.html` — CSS/JS gömülü, doğrudan açılabilen sürüm

---

## 11. Üretim yol haritası

### Faz A — içerik derinliği

Her beceriyi 15–20 soru varyant ailesine çıkarmak; çeldiricileri hata türlerine bağlamak; MEB öğrenme çıktısı kodlarını veri katmanına eklemek.

### Faz B — gerçek manipülatifler

Onluk çerçevesi, sayı doğrusu, parça–bütün, sınıflama, şekil kurma ve ölçme etkinliklerini gerçek sürükle/dokun etkileşimlerine çevirmek.

### Faz C — kalibrasyon

Temsil geçiş matrisi, hata sınıflandırması, spaced retrieval aralıkları ve zorluk histerezisini çocuk pilot verisiyle kalibre etmek.

### Faz D — çocuk kullanılabilirliği

5–10 çocuk + ebeveynle yalnız kullanılabilirlik pilotu; yönerge, hedef büyüklüğü, yanlış geri bildirimi, ekran yoğunluğu, mola davranışı ve ebeveyn raporunun anlaşılabilirliği.

### Faz E — öğrenme pilotu

Pre/post ölçüm, yakın transfer, gecikmeli retention, bırakma oranı ve temsil değişiminde performans. Ancak bu fazdan sonra öğrenme etkisi hakkında ürün iddiası güçlendirilebilir.

---

## 12. Kuzey yıldızı

SAYMERA'nın başarı metriği “uygulamada geçirilen dakika” veya “çözülen soru sayısı” değildir.

**Kuzey yıldızı:** Bir çocuk bir matematiksel fikri kaç farklı temsil arasında güvenilir biçimde dönüştürebiliyor ve bunu daha sonra yeniden çağırabiliyor?
