# SAYMERA v1.5.2 — Görev Motoru Geçiş Matrisi

Durum:

- **P1-REFERENCE:** Singapur P1 coverage matrix'ine bağlı, beş ayrı task family ve otomatik kalite kapısı var.
- **P2-REFERENCE:** Singapur P2 kapsamına bağlı, aynı beş görev ailesi + 8 aşamalı öğrenme döngüsü + adaptif pekiştirme + gecikmeli geri çağırma kalite kapısı var.
- **REFERENCE:** Kur · Gör · Yaz · Anlat · Taşı görevleri gerçekten farklı bilişsel eylemler olarak yeniden tasarlandı ve otomatik kalite/render kapısına alındı.
- **LEGACY:** Çalışır; reference görev mimarisine henüz taşınmadı.

| Profil | ID | Beceri | Durum |
|---|---|---|---|
| Okul öncesi | `subitize5` | Bir bakışta miktar | LEGACY |
| Okul öncesi | `count10` | 10'a kadar sayma | LEGACY |
| Okul öncesi | `compare10` | Miktar karşılaştırma | LEGACY |
| Okul öncesi | `partwhole5` | Parça–bütün | LEGACY |
| Okul öncesi | `patternAB` | Örüntü kurma | LEGACY |
| Okul öncesi | `shapesBasic` | Şekilleri fark etme | LEGACY |
| Okul öncesi | `sortAttribute` | Özelliğe göre sınıflama | LEGACY |
| Okul öncesi | `positionWords` | Konum ve yön | LEGACY |
| 1. sınıf | `number20` | 20 içinde sayı ve miktar | **P1-REFERENCE** |
| 1. sınıf | `numberBonds10` | 10'a kadar sayı bağları | **P1-REFERENCE** |
| 1. sınıf | `make10` | 10'u tamamlama | **P1-REFERENCE** |
| 1. sınıf | `add20` | 20 içinde toplama stratejileri | **P1-REFERENCE** |
| 1. sınıf | `addMany1` | 3+ tek basamaklı sayıyı toplama | **P1-REFERENCE** |
| 1. sınıf | `sub20` | 20 içinde çıkarma stratejileri | **P1-REFERENCE** |
| 1. sınıf | `equality` | Eşitlik ve işlem aileleri | **P1-REFERENCE** |
| 1. sınıf | `word1` | Toplama–çıkarma problem yapıları | **P1-REFERENCE** |
| 1. sınıf | `number100` | 100'e kadar sayı ve basamak | **P1-REFERENCE** |
| 1. sınıf | `compareOrder100` | 100'e kadar karşılaştırma/sıralama | **P1-REFERENCE** |
| 1. sınıf | `ordinal10` | Sıra sayıları 1–10 | **P1-REFERENCE** |
| 1. sınıf | `numberPattern1` | Sayı dizilerinde örüntü/sabit adım | **P1-REFERENCE** |
| 1. sınıf | `addSub100` | 100 içinde toplama/çıkarma | **P1-REFERENCE** |
| 1. sınıf | `multiply40` | Eşit gruplarla çarpma | **P1-REFERENCE** |
| 1. sınıf | `divide20g1` | Paylaşma/gruplama ile bölme | **P1-REFERENCE** |
| 1. sınıf | `money1` | Para değeri/eşdeğerlik/alışveriş | **P1-REFERENCE** |
| 1. sınıf | `lengthCompare1` | cm ile uzunluk karşılaştırma | **P1-REFERENCE** |
| 1. sınıf | `lengthMeasure1` | cm ile ölçme/çizgi uzunluğu | **P1-REFERENCE** |
| 1. sınıf | `time1` | 5 dakikalık saat, dönem ve süre | **P1-REFERENCE** |
| 1. sınıf | `shapes1` | 2B şekilleri tanı/adlandır/sınıflandır | **P1-REFERENCE** |
| 1. sınıf | `shapePattern1` | 2B figür oluşturma/çözümleme/kopyalama | **P1-REFERENCE** |
| 1. sınıf | `data1` | Resimli grafik | **P1-REFERENCE** |
| 2. sınıf | `number1000` | 1000’e kadar sayı ve basamak | **P2-REFERENCE** |
| 2. sınıf | `compareOrder1000` | 1000’e kadar karşılaştırma/sıralama | **P2-REFERENCE** |
| 2. sınıf | `numberPattern1000` | 1/10/100 ile sayı örüntüleri | **P2-REFERENCE** |
| 2. sınıf | `oddEven1000` | 1000’e kadar tek/çift sayılar | **P2-REFERENCE** |
| 2. sınıf | `addSub1000` | 1000 içinde toplama/çıkarma | **P2-REFERENCE** |
| 2. sınıf | `wordAddSub2` | 1–2 adımlı toplama/çıkarma problemleri | **P2-REFERENCE** |
| 2. sınıf | `times23510` | 2/3/4/5/10 çarpım tabloları | **P2-REFERENCE** |
| 2. sınıf | `divisionTables2` | Bölme ve ÷ gösterimi | **P2-REFERENCE** |
| 2. sınıf | `multDivFamilies2` | Çarpma–bölme işlem aileleri | **P2-REFERENCE** |
| 2. sınıf | `fractionMeaning2` | Eş parçalar ve bütün | **P2-REFERENCE** |
| 2. sınıf | `fractionNotation2` | Kesirleri okuma ve yazma | **P2-REFERENCE** |
| 2. sınıf | `fractionCompare2` | Kesirleri karşılaştırma/sıralama | **P2-REFERENCE** |
| 2. sınıf | `fractionAddSub2` | Eş paydalı kesirlerde toplama/çıkarma | **P2-REFERENCE** |
| 2. sınıf | `lengthMetre2` | Metre ile uzunluk | **P2-REFERENCE** |
| 2. sınıf | `massMetric2` | Gram/kilogram ile kütle | **P2-REFERENCE** |
| 2. sınıf | `volumeLitre2` | Litre ile sıvı hacmi | **P2-REFERENCE** |
| 2. sınıf | `timeMinute2` | Dakikaya kadar saat okuma | **P2-REFERENCE** |
| 2. sınıf | `timeDuration2` | Saat ve dakika cinsinden süre | **P2-REFERENCE** |
| 2. sınıf | `moneyP2` | TL/kuruş ve ondalık para gösterimi | **P2-REFERENCE** |
| 2. sınıf | `shapePatterns2` | 2B şekillerle bir/iki özellikli örüntüler | **P2-REFERENCE** |
| 2. sınıf | `solids2` | Küp/dikdörtgen prizma/koni/silindir/küre | **P2-REFERENCE** |
| 2. sınıf | `pictureGraphScale2` | Ölçekli resimli grafik | **P2-REFERENCE** |

Toplam: **52 beceri**. Bunun **22'si P1-REFERENCE**, **22'si P2-REFERENCE** ve **8'i okul öncesi LEGACY** durumundadır. Singapore P1 ve P2 çekirdek kapsamı artık referans kalite kapısından geçmektedir.
