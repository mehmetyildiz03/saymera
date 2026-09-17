# SAYMERA v1.2.1 — Doğrulama Raporu

Doğrulama tarihi: 2026-09-17

## Son durum

- `node --check engine.mjs` — PASS
- `node --check app.js` — PASS
- `npm run build:standalone` — PASS
- `npm test` — PASS
- **8.600 üretken görev vakası**: 43 beceri × 5 pencere × 40 tohum — PASS
- **22 P1 becerinin tamamında** beş ayrı `taskKind` — PASS
- Her P1 beceride en az üç response family — PASS
- `anchor`, `symbol`, `transfer` örnek ayrımı — PASS
- Üretilen P1 visual type → UI renderer sözleşmesi — PASS
- Üretilen P1 manipülatif interaction → UI handler sözleşmesi — PASS
- **Grade 2 `shapes2`**: beş ayrı `taskKind`, gerçek `solid-properties` manipülatifi ve motor→UI render sözleşmesi — PASS
- Çocuk yüzeylerinde yasaklanan ürün-motoru / puanlama / kanıt dili regresyon kapısı — PASS
- Standalone inline JavaScript parse guard — PASS
- Kalıcı GitHub Actions `SAYMERA CI` (`npm test`) — PASS
- GitHub Pages build & deployment — PASS

## v1.2.1 özel kalite kapıları

### Çocuk yüzeyi

Çocuk ekranlarında aşağıdaki türden ürün-içi açıklamaların yeniden görünmesi static testte başarısız olur:

- “Burada puanlanan şey hız değil...”
- “HATA DEĞİL · KANIT”
- “kanıt profili kaydedildi”
- “tamamlanmayan pencereler daha sonra yeniden gelir”
- “Aynı fikir, beş kanıt.”
- `KAVRAM ATLASI` gibi ürün mimarisini çocuğa açıklayan ifadeler

Teknik öğrenme resmi ve motor açıklaması Ebeveyn / Eğitmen alanında tutulabilir.

### Grade 2 `shapes2`

- Kur → `manipulative-build` — PASS
- Gör → `visual-discrimination` — PASS
- Yaz → `symbol-entry` — PASS
- Anlat → `reasoning-choice` — PASS
- Taşı → `context-transfer` — PASS
- `solid-properties` interaction handler — PASS
- `solid-property-builder` renderer — PASS
- `solid`, `solid-pair`, `solid-scene`, `symbol-card` renderer sözleşmesi — PASS
- Döndürmeyle cismin biçimsel özelliğinin değişmediğini gerekçelendiren Anlat görevi — PASS

## Singapore P1 özel kalite kapıları

- 100 uç değeri sayı motorunda üretilebiliyor — PASS
- Sayı dizisi adımları ±1, ±2, ±5, ±10 — PASS
- Toplama stratejileri: ileri sayma / 10'a tamamlama / çift / yakın çift — PASS
- Çıkarma stratejileri: geri sayma / 10'dan geçme / ters işlem — PASS
- Problem yapıları: join-result / join-change / separate-result / part-missing / compare-difference — PASS
- Üç veya daha fazla tek basamaklı sayıyı toplama — PASS
- Bölme sembol görevinde zorunlu `÷` yerine eksik çarpan `×` ilişkisi — PASS
- TL ve kuruş para vakaları; aynı görevde birim karıştırmama — PASS
- cm cetvel manipülatifi ve cm görsel modelleri — PASS
- Saat dakika seti :00–:55, 5'in katları — PASS
- 30 ve 60 dakika süre vakaları — PASS
- Yarım daire ve çeyrek daire dahil P1 şekil kapsamı — PASS
- Yarım/çeyrek dairenin yalnız bileşik figürde değil doğrudan `shapes1` tanıma/özellik görevlerinde üretimi — PASS
- Bileşik figür oluşturma ve nokta ızgarada kopyalama — PASS

## Düzeltilen kök problemler

1. **Pencere etiketi ≠ farklı görev** problemi: P1 kalite kapısı task family çeşitliliğini zorunlu yaptı; Grade 2 `shapes2` aynı reference sözleşmesine taşındı.
2. 2. sınıf geometrisindeki eski **KUR = cismi adlandır** davranışı kaldırıldı; Kur artık gerçekten özellik modeli kurduruyor.
3. 2. sınıf geometrisindeki eski **ANLAT = doğru bilgi şıkkını bul** davranışı kaldırıldı; Anlat artık “neden aynı cisim?” gerekçesini ölçüyor.
4. Belirsiz 3B cisim görseli yerine kanonik küp, dikdörtgen prizma, silindir ve küre renderer'ları kullanılıyor.
5. Çocuk doğru/yanlış/oturum sonu ekranlarından ürün motoru, kanıt ve puanlama açıklamaları çıkarıldı.
6. Çocuk ana sayfası ve konu alanından mastery yüzdeleri / zayıf pencere / motor seçimi açıklamaları kaldırıldı.
7. `symbol-card` renderer eksikliği giderildi; Grade 2 Yaz görevi boş görsel üretmiyor.
8. Service worker cache anahtarı `saymera-v1-2-1-child-ui` olarak yenilendi; eski kurulu PWA'ların yeni çocuk yüzeyini alması sağlandı.
9. Kalıcı CI eklendi; `main` ve pull request değişikliklerinde `npm test` otomatik çalışır.
10. Tek-dosya build için önceki siyah-ekran regresyonuna karşı inline JS parse testi korunuyor.

## Tarayıcı E2E sınırı

Bu çalışma ortamındaki Chromium headless süreci geçmiş denemelerde sayfadan bağımsız olarak sonlanmadan askıda kaldığı için gerçek tıklama akışını otomatik PASS olarak işaretlemiyorum. Standalone parse, dosya bütünlüğü, motor invariantları, çocuk-copy guard ve motor→UI renderer/interaction sözleşmesi otomatik olarak doğrulandı.

Gerçek telefon/tablet testinde özellikle şu noktalar kontrol edilmeli:

- Grade 2 `shapes2` Kur ekranında özellik kartlarının rahat dokunulması,
- küp / dikdörtgen prizma / silindir / küre görsellerinin küçük ekranda açıkça ayırt edilmesi,
- Yaz görevindeki `symbol-card` görselinin ve cevap seçeneklerinin birlikte dengeli yerleşimi,
- 390–430 px ekranda cm cetvelinin yatay kaydırma ergonomisi,
- saat dakika butonlarının dokunma hedefleri,
- bileşik şekil parça bankasında çoklu seçim,
- yarım/çeyrek daire görsellerinin küçük ekranda ayırt edilebilirliği,
- köprü/review görevlerinin beklenen pencereye dönmesi.

## Pedagojik sınır

Bu testler yazılımın ve içerik sözleşmesinin tutarlı olduğunu gösterir. Öğrenme etkisini göstermez. Kullanılabilirlik pilotu ve daha sonra pre/post + yakın transfer + gecikmeli retention ölçümü gerekir.
