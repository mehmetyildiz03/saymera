# SAYMERA — Matematik Laboratuvarı v1.2

SAYMERA; okul öncesi, 1. sınıf ve 2. sınıf için **Kur · Gör · Yaz · Anlat · Taşı** kavrayış modelini kullanan, SayıYolu'ndan tamamen bağımsız, local-first bir matematik öğrenme uygulamasıdır.

v1.2'nin ana işi, 1. sınıf çekirdeğini Singapur Ministry of Education'ın **Primary Mathematics Syllabus P1–P6 — Updated Oct 2025** kapsamıyla denetlenebilir biçimde eşlemek ve v1.1'de kurulan Representation Task Engine'i 1. sınıfın tamamına yaymaktır.

## En kolay kullanım

`SAYMERA_v1_2_TEK_DOSYA.html` dosyasını açın. CSS ve JavaScript dosyanın içine gömülüdür; komşu dosyalara ihtiyaç duymaz.

Kaynak proje için:

```bash
npm test
npm run build:standalone
python3 -m http.server 4173
```

## v1.2'de ne değişti?

1. sınıf profili artık **22 atomik beceri** içerir ve her biri beş farklı bilişsel görev ailesi üretir:

- Kur → `manipulative-build`
- Gör → `visual-discrimination`
- Yaz → `symbol-entry`
- Anlat → `reasoning-choice`
- Taşı → `context-transfer`

Böylece “aynı soruyu beş farklı başlıkla sorma” davranışı kalite testinde doğrudan başarısız olur.

### Singapur P1 kapsamı

- 100'e kadar sayı, basamak değeri, sayı sözcüğü/rakam, karşılaştırma-sıralama, sayı dizileri, sıra sayıları
- sayı bağları, 10'a tamamlama, 20 içinde zihinsel toplama/çıkarma stratejileri
- birden fazla tek basamaklı sayıyı toplama, toplama–çıkarma ilişkisi ve eşitlik
- 100 içinde toplama/çıkarma ve yeniden gruplama
- eşit gruplar ile çarpma; paylaşma/gruplama ile bölme
- para değeri/eşdeğerlik ve tek birim içinde alışveriş problemleri
- santimetre ile ölçme ve uzunluk karşılaştırma
- 5 dakikalık saat, ÖÖ/ÖS + a.m./p.m., `h` / `min`, 1 saat ve yarım saat süre
- dikdörtgen, kare, üçgen, daire, yarım daire, çeyrek daire
- 2B şekillerden figür oluşturma, bileşenleri bulma ve nokta ızgarada kopyalama
- resimli grafik okuma ve yorumlama

Para görevleri Singapur'un dolar/sent yapısını birebir kopyalamaz; **TL/kuruş ile yerelleştirilmiştir**, ancak aynı görevde birimleri karıştırmama, eşdeğerlik ve değer-parça sayısı ayrımı korunur.

## Strateji çeşitliliği

Toplama motoru yalnız “10 yap” demez. Örnek yapısına göre:

- ileri sayma,
- 10'a tamamlama,
- çift,
- yakın çift

stratejilerini üretir. Çıkarma tarafında geri sayma, 10'dan geçme ve ters işlem/eksik toplanan ilişkisi bulunur.

Sözel problemler de yalnız “vardı, geldi” kalıbı değildir; sonuç bilinmeyen, değişim bilinmeyen, ayırma, eksik parça ve karşılaştırma-fark yapıları bulunur.

## Yeni gerçek etkileşimler

v1.2 ile özellikle şu görevler gerçek kullanıcı eylemine dönüştürüldü:

- 0'dan başlayan **cm cetvelinde bitiş noktası seçerek çizgi uzunluğu kurma**,
- analog saati **:00–:55 arasında 5'er dakikalık adımlarla ayarlama**,
- bileşik figür için gerekli **2B şekil parçalarını çoklu seçerek oluşturma**,
- yarım/çeyrek daireyi doğrudan adlandırma ve sınır özellikleriyle ayırt etme,
- TL/kuruş için birim-duyarlı para oluşturma.

## Oturum ve kanıt modeli

Beş pencere navigasyon menüsü değil, ayrı kanıt boyutlarıdır. İlk temas geniş bir profil çıkarır; sonraki oturumlar görülmemiş veya zayıf pencereleri önceliklendirir. Yanlışta aynı soru anında tekrar edilmez; daha görünür bir temsil birkaç adım sonra köprü görevi olarak gelir.

History kaydı `skillId`, `representation`, `taskKind`, `responseKind`, `conceptKey`, doğru/yanlış, ipucu ve gecikmeli tekrar bilgisini tutar.

## Proje sınırı

Bu uygulama **SayıYolu değildir** ve SayıYolu dosyalarını/depolamasını değiştirmez. SAYMERA `saymera.math.v2` alanını kullanır.

Singapur eşleme ayrıntısı için `SINGAPORE_P1_COVERAGE.md`, görev mimarisi için `REPRESENTATION_ENGINE_V1_2.md`, 22 becerinin pencere-bazlı görev auditi için `P1_WINDOW_QUALITY_AUDIT.md`, doğrulama için `VALIDATION.md` dosyasına bakın.
