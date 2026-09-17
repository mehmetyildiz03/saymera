# SAYMERA v1.2 — Representation Task Engine

## 1. Sorun

Eski risk şuydu:

`aynı 4 seçenekli soru + farklı pencere etiketi`

Bu durumda Kur/Gör/Yaz/Anlat/Taşı ürün iddiası gerçek bir öğrenme modeli değil, UI metni olurdu.

v1.2 kalite kapısı bu davranışı teknik olarak engeller. Her 1. sınıf becerisi aynı concept instance için beş ayrı `taskKind` üretmek zorundadır ve en az üç farklı response family kullanır.

## 2. Görev modeli

```text
curriculum objective
  -> atomic skill
  -> concept instance
  -> representation task
  -> response contract
  -> evidence
  -> review / bridge / retention
```

### Concept instance

Bir beceri için üç ayrı örnek tutulur:

- `anchor`: Kur/Gör/Anlat için ortak matematiksel yapı
- `symbol`: Yaz için taze örnek
- `transfer`: Taşı için taze örnek

Bu ayrım önceki sorunun cevabını ezberleyip sonraki pencereye taşıma riskini azaltır.

## 3. Beş pencerenin zorunlu anlamı

| Pencere | `taskKind` | Çocuğun eylemi |
|---|---|---|
| Kur | `manipulative-build` | İlişkiyi aktif olarak oluşturur |
| Gör | `visual-discrimination` | Doğru matematiksel modeli benzer modellerden ayırır |
| Yaz | `symbol-entry` | Temsili sayı/sembol diline dönüştürür |
| Anlat | `reasoning-choice` | Strateji/ilişki nedenini ayırt eder |
| Taşı | `context-transfer` | Aynı yapıyı yeni bağlamda kullanır |

## 4. v1.2 P1 kalite kapısı

Bir P1 becerisi şu koşullar sağlanmadan tamamlanmış sayılmaz:

1. Beş pencere beş farklı `taskKind` üretir.
2. En az üç farklı `response.kind` bulunur.
3. Kur dekoratif görsel değil, gerçek kullanıcı manipülasyonu ister.
4. Gör görevinde model ayrımı vardır; işlem yalnız yeniden sorulmaz.
5. Yaz yeni bir concept instance üzerinden sembolik dönüşüm ister.
6. Anlat çeldiricileri sonuç hatası değil kavramsal/stratejik yanılgı temsil eder.
7. Taşı yalnız nesne adını değiştirmez; yeni bağlam/temsil yükü taşır.
8. Yanlış cevap daha erişilebilir pencereye köprü oluşturabilir.
9. Motorun ürettiği her visual type için UI renderer bulunması otomatik test edilir.
10. Motorun ürettiği her manipülatif interaction için handler bulunması otomatik test edilir.
11. Standalone build içindeki JS parse edilmeden teslim kabul edilmez.

## 5. Strateji seçimi örneği

`add20` tek stratejili değildir:

- küçük ikinci toplanan → ileri sayma,
- 10 sınırını anlamlı biçimde geçen örnek → 10'a tamamlama,
- eşit toplananlar → çift,
- ardışık toplananlar → yakın çift.

`Anlat` penceresi “hangi sonucu buldun?” yerine “bu sayılarda neden bu strateji kısa?” sorusunu taşır.

## 6. Problem şemaları

`word1` en az şu yapıları üretir:

- birleştirme / sonuç bilinmiyor,
- birleştirme / değişim bilinmiyor,
- ayırma / sonuç bilinmiyor,
- parça–bütün / eksik parça,
- karşılaştırma / fark bilinmiyor.

Bu nedenle kelime değiştirerek aynı `a+b=?` kalıbını tekrar etmek kalite kapısını geçmez.

## 7. Ölçme ve geometri v1.2

### Santimetre

`lengthMeasure1 / Kur`: çocuk 0 başlangıçlı dijital cetvelde çizginin bitiş cm işaretini seçer. Yanlış başlangıç ve yanlış bitiş Gör çeldiricileridir.

### Saat

`time1 / Kur`: saat 1–12, dakika 00–55 arasında 5'er dakikalık seçeneklerle ayarlanır. Transfer 30/60 dakika süre ve ÖÖ/ÖS + a.m./p.m. bağlamı kullanır.

### 2B şekiller

`shapes1` yarım ve çeyrek daireyi de içerir. Kur görevinde düz/eğri sınır özellikleri seçilir; yön/boyut renk gibi yüzey özellikleri adlandırmayı değiştirmez.

`shapePattern1` internal ID'si korunmakla birlikte içerik artık şekil örüntüsü değil; **bileşik figür oluşturma → bileşenleri tanıma → ızgarada kopyalama**dır.

## 8. Kanıt ve adaptasyon

History kaydı:

```text
skillId
representation
taskKind
responseKind
conceptKey
correct
usedHint
delayedReview
```

gibi alanları tutar. Böylece “toplamada zayıf” yerine, örneğin “görsel stratejiyi ayırıyor fakat sembolik dönüşümde kopuyor” düzeyinde pilot analizi yapılabilir.

## 9. Dürüst sınır

Bu mimari kanıta dayalı öğretim ilkeleriyle uyumlu bir ürün tasarımıdır. SAYMERA'nın beş pencere protokolünün kendisi yayımlanmış, bağımsız araştırmalarla etkinliği kanıtlanmış hazır bir eğitim programı değildir. Yazılım doğrulaması öğrenme etkisi kanıtı değildir.
