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
- uzunluk: cm ve m
- kütle: g ve kg
- sıvı hacmi: l
- uygun birimi seçme, tahmin etme, ölçme, karşılaştırma ve problem çözme
- verilen uzunlukta doğru parçası çizme/ölçme

### Time
- 5 dakikalık aralıklarla saat okuma/yazma
- a.m./p.m. karşılığı olarak ÖÖ/ÖS
- h ve min
- saat kollarını verilen zamana ayarlama
- 1 saat ve yarım saat süre

### Money
- banknot ve madeni paralarla miktar oluşturma
- ana para birimi + alt birim ve ondalık gösterim
- miktarları karşılaştırma
- ondalık gösterim ↔ yalnız alt birim dönüşümü
- aynı birim içinde para problemleri
- Türkiye yerelleştirmesi: TL/kuruş; matematiksel yapı korunur

### Geometry
- yarım daire ve çeyrek daire dahil 2B şekiller
- bileşik 2B figürleri çözümleme/oluşturma
- nokta/kare ızgarada kopyalama
- küp, dikdörtgen prizma, koni, silindir, küre
- yüz/kenar/köşe ve düz/eğri yüzey özellikleri
- 2B ve 3B şekil örüntüleri

### Data
- ölçekli resimli grafik oluşturma
- yatay/dikey ölçekli resimli grafik okuma ve yorumlama
- grafikten 1 adımlı problem çözme

## Mevcut SAYMERA P2 denetimi

| Mevcut beceri | Mevcut kapsam | P2 kararı |
|---|---|---|
| `place100` | onluk–birlik, 100 altı | **Yetersiz** — 1000 ve yüzlük basamağı gerekli |
| `add100` | 100 içinde toplama | **Yetersiz** — 3 basamaklı toplama gerekli |
| `sub100` | 100 içinde çıkarma | **Yetersiz** — 3 basamaklı çıkarma gerekli |
| `multiply5` | küçük eşit gruplar | **Yetersiz** — 2/3/4/5/10 tabloları gerekli |
| `divide20` | 20 içinde paylaşma | **Yetersiz** — tablo ilişkisi ve ÷ gerekli |
| `fraction` | yalnız yarım/çeyrek | **Yetersiz** — daha geniş kesir yapısı gerekli |
| `word2` | tek tip iki adımlı problem | **Dar** — parça-bütün/karşılaştırma model çeşitliliği gerekli |
| `numberPattern2` | genel örüntü | **Yeniden tasarlanmalı** — 1000'e kadar örüntü ve 1/10/100 ilişkisi |
| `shapes2` | 3B cisim ilişkileri | **Kısmi referans** — koni ve daha geniş P2 özellik seti eklenecek |
| `lengthCm` | yalnız cm | **Yetersiz** — m/cm + g/kg + l gerekli |
| `time2` | tam/yarım saat | **Yetersiz** — 5 dakika, ÖÖ/ÖS, süre gerekli |
| `moneyTL` | yalnız tam TL | **Yetersiz** — TL/kuruş ve ondalık gösterim gerekli |
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
7. `times23510` — 2/3/4/5/10 tabloları
8. `divisionTables2` — bölme sembolü ve ters işlem ilişkisi
9. `fractionsWhole2` — bütünün kesri, okuma/yazma, karşılaştırma
10. `fractionsAddSub2` — eş paydalı kesirlerde toplama/çıkarma

### P2-C — Measurement + Time + Money
11. `lengthMetric2` — cm/m
12. `massMetric2` — g/kg
13. `volumeLitre2` — litre
14. `timeP2` — 5 dakika, ÖÖ/ÖS, h/min ve süre
15. `moneyP2` — TL/kuruş, ondalık gösterim, karşılaştırma ve problem

### P2-D — Geometry + Data
16. `shapes2D2` — yarım/çeyrek daire, bileşik figür ve ızgara
17. `solids2` — küp/prizma/koni/silindir/küre ve özellikleri
18. `shapePatterns2` — 2B/3B şekil örüntüleri
19. `pictureGraphScale2` — ölçekli resimli grafik

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
