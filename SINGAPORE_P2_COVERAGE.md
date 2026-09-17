# SAYMERA — Singapore Primary 2 Coverage Audit

Kaynak omurga: Singapore Ministry of Education, **Primary Mathematics Syllabus P1–P6 (Updated Oct 2025)**.

Resmî kaynak: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf

Bu dosya SAYMERA'nın 2. sınıf içeriğini Singapore Primary 2 (P2) kapsamına göre yeniden kurmak için kullanılan denetim ve geçiş haritasıdır. Amaç konu başlıklarını yalnız Türkçeye çevirmek değil; her beceriyi SAYMERA'nın öğrenme döngüsünde gerçek bir bilişsel eyleme dönüştürmektir:

**Ön bilgiyi yokla → nesne/modelle çalış → farklı temsilini gör → sembolleştir → nedenini düşün → gündelik durumda kullan → farklı örneklerle pekiştir → daha sonra geri çağır.**

## P2 resmî kapsam özeti

### Whole Numbers
- 1000'e kadar sayma; onluklar ve yüzlükler halinde sayma
- yüzlük–onluk–birlik basamak değeri
- sayıları rakamla ve sözcükle okuma/yazma
- karşılaştırma ve sıralama
- sayı dizileri ve örüntüler
- tek ve çift sayılar
- bir sayının 1, 10 veya 100 fazlası/eksiği

### Addition and Subtraction
- 3 basamaklı sayılara kadar standart toplama ve çıkarma algoritmaları
- 3 basamaklı sayı ile birlik/onluk/yüzlük zihinsel işlemleri
- yeniden gruplama
- 1 ve 2 adımlı problemler
- parça–bütün ve karşılaştırma modelleri

### Multiplication and Division
- 2, 3, 4, 5 ve 10 çarpım tabloları
- `÷` sembolü
- çarpma ile bölme arasındaki ters ilişki
- eşit gruplama ve eşit paylaşma problemleri

### Fractions
- bir bütünün kesri
- kesirleri okuma ve yazma
- birim kesirleri ve eş paydalı kesirleri karşılaştırma/sıralama
- paydası 12'yi aşmayan eş paydalı kesirlerle bir bütün içinde toplama/çıkarma

### Measurement
- uzunluk: metre (m)
- kütle: gram (g) ve kilogram (kg)
- sıvı hacmi: litre (L)
- uygun standart birimi seçme
- aynı tür ölçüleri karşılaştırma ve sıralama
- **P2'de m↔cm, kg↔g veya L↔mL dönüşümü çekirdek hedef değildir; bileşik birim dönüşümleri P3'e bırakılır.** P1'de santimetre zaten öğrenilmiştir.

### Time
- analog/dijital zamanı **dakikaya kadar** okuma
- süreyi saat ve dakika cinsinden ölçme/ifade etme
- `saat + dakika ↔ yalnız dakika` dönüşümü
- P1'deki 5 dakikalık saat ve ÖÖ/ÖS bilgisi ön bilgidir; P2'nin yeni hedefi dakikaya hassasiyet ve süre dönüşümüdür.

### Money
- lira/kuruş miktarını sayma ve oluşturma
- para miktarını ondalık gösterimle okuma/yazma
- iki veya üç para miktarını karşılaştırma
- `ondalık TL ↔ yalnız kuruş` dönüşümü
- Türkiye yerelleştirmesi: TL/kuruş ve ondalık virgül; Singapore'daki dollar/cent matematiksel yapısı korunur

### Geometry
- 2B şekillerle boyut, şekil, renk ve yön özelliklerinden bir veya ikisine göre örüntü kurma/tamamlama
- küp, dikdörtgen prizma (cuboid), koni, silindir ve küreyi tanıma, adlandırma, betimleme ve sınıflandırma
- yarım/çeyrek daire, bileşik 2B figür ve ızgarada kopyalama P1 kapsamıdır; P2'ye tekrar çekirdek hedef olarak yazılmaz

### Data
- **ölçekli resimli grafikleri** okuma ve yorumlama
- P2 çekirdeği sütun grafiği değildir; sütun grafiği P3'e aittir

## Mevcut SAYMERA P2 denetimi

| Mevcut beceri | Mevcut kapsam | P2 kararı |
|---|---|---|
| `place100` | onluk–birlik, 100 altı | **Yetersiz** — 1000 ve yüzlük basamağı gerekli |
| `add100` | 100 içinde toplama | **Yetersiz** — 3 basamaklı toplama gerekli |
| `sub100` | 100 içinde çıkarma | **Yetersiz** — 3 basamaklı çıkarma gerekli |
| `times23510` | 2/3/4/5/10 tabloları ve örüntüler | **P2-REFERENCE** |
| `divisionTables2` | paylaşma/gruplama, `÷`, tablo içi bölme | **P2-REFERENCE** |
| `multDivFamilies2` | çarpma–bölme ters ilişkisi | **P2-REFERENCE** |
| `fractionMeaning2`–`fractionAddSub2` | anlam → gösterim → karşılaştırma → eş paydalı işlemler | **P2-REFERENCE** |
| `word2` | tek tip iki adımlı problem | **Dar** — parça-bütün/karşılaştırma model çeşitliliği gerekli |
| `numberPattern2` | genel örüntü | **Yeniden tasarlanmalı** — 1000'e kadar örüntü ve 1/10/100 ilişkisi |
| `shapes2` | 3B cisim ilişkileri | **Kısmi referans** — koni ve daha geniş P2 özellik seti eklenecek |
| `lengthMetre2` | metre ile ölçme/karşılaştırma | **P2-REFERENCE** |
| `massMetric2` | gram/kilogram ve uygun birim | **P2-REFERENCE** |
| `volumeLitre2` | litre ve sıvı hacmi | **P2-REFERENCE** |
| `timeMinute2` | dakikaya kadar saat okuma | **P2-REFERENCE** |
| `timeDuration2` | saat+dakika ↔ dakika dönüşümü | **P2-REFERENCE** |
| `moneyP2` | TL/kuruş ve ondalık gösterim | **P2-REFERENCE** |
| `data2` | sütun grafiği | **Yanlış çekirdek** — P2 çekirdeği ölçekli resimli grafiktir |

## Geçiş sırası

### P2-A — Whole Numbers + Addition/Subtraction
1. `number1000` — 1000'e kadar sayı ve yüzlük–onluk–birlik
2. `compareOrder1000` — 1000'e kadar karşılaştırma/sıralama
3. `numberPattern1000` — 1/10/100 ilişkileri ve sayı örüntüleri
4. `oddEven1000` — tek/çift sayılar
5. `addSub1000` — 3 basamaklı toplama/çıkarma ve yeniden gruplama
6. `wordAddSub2` — 1–2 adımlı parça-bütün/karşılaştırma problemleri

### P2-B — Multiplication/Division + Fractions
7. `times23510` — 2/3/4/5/10 tabloları ve tablo örüntüleri
8. `divisionTables2` — eşit paylaşma/gruplama ve `÷` gösterimi
9. `multDivFamilies2` — çarpma–bölme ters ilişkisi ve dört temel işlem ailesi
10. `fractionMeaning2` — eş parçalar ve bütün
11. `fractionNotation2` — kesirleri okuma/yazma
12. `fractionCompare2` — birim ve eş paydalı kesirleri karşılaştırma/sıralama
13. `fractionAddSub2` — eş paydalı kesirlerde toplama/çıkarma

### P2-C — Measurement + Time + Money
14. `lengthMetre2` — metre ile ölçme, karşılaştırma ve uygun uzunluk birimi
15. `massMetric2` — g/kg ile kütle, uygun birim, karşılaştırma/sıralama
16. `volumeLitre2` — litre ile sıvı hacmi, karşılaştırma/sıralama
17. `timeMinute2` — dakikaya kadar analog/dijital saat
18. `timeDuration2` — saat+dakika ↔ yalnız dakika
19. `moneyP2` — TL/kuruş, ondalık gösterim ve karşılaştırma

### P2-D — Geometry + Data
20. `shapePatterns2` — 2B şekillerde boyut/şekil/renk/yön ile örüntü
21. `solids2` — küp/dikdörtgen prizma/koni/silindir/küre ve sınıflandırma
22. `pictureGraphScale2` — ölçekli resimli grafik okuma/yorumlama

## Kalite kapısı

Bir P2 becerisi ancak şu koşullarda **P2-REFERENCE** sayılır:

1. Singapore P2 kapsamındaki hedefi açıkça karşılar.
2. Hazırbulunuşluk sorusu hedef becerinin kolay kopyası değildir; gerçek ön koşulu ölçer.
3. Kur, Gör, Yaz, Anlat ve Taşı beş farklı bilişsel görev ailesidir.
4. İlk öğrenmede 8 aşamalı döngü kullanılır.
5. Hata/ipucu durumunda pekiştirme adaptif uzar.
6. Son pekiştirme başarısızken oturum tamamlanmış sayılmaz.
7. Başarılı ilk döngüden sonra gecikmeli geri çağırma planlanır.
8. Çocuk ekranı motorun iç çalışma mantığını açıklamaz.
9. Otomatik generator, UI/render ve öğrenme-döngüsü testleri geçer.

P2 geçişi kademeli yapılacaktır; LEGACY beceriler sırf etiketi değiştirilerek referans kabul edilmeyecektir.


## Uygulama ilerlemesi — v1.4.0 / P2-A1

İlk temel katman **P2-REFERENCE** seviyesine taşındı:

- `number1000` — 1000'e kadar sayı ve yüzlük–onluk–birlik
- `compareOrder1000` — 1000'e kadar karşılaştırma ve sıralama
- `numberPattern1000` — ±1, ±10, ±100 sabit değişim örüntüleri
- `addSub1000` — zihinsel basamak işlemleri, 3 basamaklı standart işlemler ve yeniden gruplama

Eski `place100`, `add100`, `sub100` ve `numberPattern2` becerileri görünür P2 haritasından çıkarıldı. Yeni beceriler yeni kimliklerle oluşturuldu; böylece eski, daha kolay içeriğe ait yerel ilerleme yeni Singapore P2 içeriğine yanlışlıkla taşınmaz.

Sıradaki P2-A2: tek/çift sayılar + 1–2 adımlı toplama/çıkarma problem yapıları.


## Uygulama ilerlemesi — v1.4.1 / P2-A2

P2 sayı ve toplama/çıkarma temel katmanı genişletildi:

- `oddEven1000` — birliklerin ikişerli eşleşmesinden tek/çift genellemesine
- `wordAddSub2` — dört farklı iki-adımlı işlem planı (`+−`, `−+`, `++`, `−−`) ve bağımlı ara sonuç mantığı

Her iki beceri de gerçek ön-bilgi kontrolü, beş ayrı görev ailesi, adaptif pekiştirme ve gecikmeli geri çağırma sözleşmesine dahildir. Eski `word2` görünür içerik haritasından çıkarılmıştır.

Sıradaki katman: P2-B — 2/3/4/5/10 çarpım tabloları, bölme ve kesirler.


## Uygulama ilerlemesi — v1.4.2 / P2-B Kesirler

Kesir katmanı tek bir legacy beceriden dört aşamalı P2-REFERENCE zincirine ayrıldı: eş parça/bütün → gösterim → karşılaştırma/sıralama → eş paydalı toplama/çıkarma. Kesir sembolü anlam kurulmadan sınanmıyor.

## Uygulama ilerlemesi — v1.4.3 / P2-B Çarpma ve Bölme

Legacy `multiply5` ve `divide20` görünür haritadan çıkarıldı. Yerlerine:

- `times23510` — 2, 3, 4, 5 ve 10 tabloları; sabit-adım örüntüsü, zihinsel fact ve tek adımlı problem
- `divisionTables2` — önce eşit paylaşma/gruplama modeli, ardından `÷` gösteriminin açık öğretimi ve tablo içi bölme
- `multDivFamilies2` — iki çarpma + iki bölme cümlesinden oluşan fact family ve ters işlem düşüncesi

eklendi. Üçü de gerçek ön-bilgi kaynağı, beş farklı görev ailesi, adaptif pekiştirme ve gecikmeli geri çağırma sözleşmesine dahildir.

Sıradaki katman: P2-C — ölçme (m/cm, kg/g, litre), zaman ve para.


## Uygulama ilerlemesi — v1.4.4 / P2-C Ölçme, Zaman ve Para

Güncel **Oct 2025** P2 kapsamı yeniden doğrulandı ve önceki audit'teki iki eski varsayım düzeltildi:
- P2 zamanı 5 dakikalık aralık değil, **dakikaya kadar** okumadır; ayrıca saat+dakika ↔ dakika dönüşümü vardır.
- P2 ölçme çekirdeğinde yeni uzunluk birimi **metre**, kütle **g/kg**, sıvı hacmi **litre**dir. Bileşik birim dönüşümleri P3'e bırakılır; cm zaten P1'de vardır.

Legacy `lengthCm`, `time2`, `moneyTL` görünür haritadan çıkarıldı. Yerlerine altı P2-REFERENCE beceri geldi: `lengthMetre2`, `massMetric2`, `volumeLitre2`, `timeMinute2`, `timeDuration2`, `moneyP2`.

Sıradaki katman P2-D: 2B şekil örüntüleri, beş P2 3B cismi ve ölçekli resimli grafik.


## Uygulama ilerlemesi — v1.5.0 / P2-D Geometri ve Veri

Güncel P2 geometri/veri çekirdeği tamamlandı:
- `shapePatterns2`: boyut, şekil, renk ve yön özelliklerinden bir veya ikisini kullanarak örüntü kurma/tamamlama/açıklama
- `solids2`: küp, dikdörtgen prizma, koni, silindir ve küreyi tanıma, adlandırma, betimleme ve sınıflandırma
- `pictureGraphScale2`: ölçekli resimli grafikleri okuma/yorumlama ve grafikten tek adımlı problem çözme

Legacy `shapes2` ve yanlış P2 çekirdeği olan `data2` görünür haritadan çıkarıldı. Böylece Singapore Primary 2 çekirdek kapsamındaki 22 atomik becerinin tamamı SAYMERA öğrenme döngüsü ve beş gerçek bilişsel görev ailesiyle P2-REFERENCE durumuna geldi.
