# SAYMERA v1.2 — Doğrulama Raporu

Doğrulama tarihi: 2026-09-16

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
- Standalone inline JavaScript parse guard — PASS
- Yerel HTTP smoke: `/`, kaynak JS/CSS, manifest, iki PWA ikonu ve standalone dosya → **HTTP 200** — PASS

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

## v1.2'de düzeltilen kök problemler

1. **Pencere etiketi ≠ farklı görev** problemi: kalite kapısı task family çeşitliliğini zorunlu yaptı.
2. Singapur güncel P1 kapsamı eski sürümden dar alınmıştı; 1. sınıf 10 beceriden 22 atomik beceriye çıkarıldı.
3. Uzunluk eski “paperclip/non-standard unit” prototipinden güncel P1 **cm** kapsamına geçirildi.
4. Saat yalnız tam/yarım saatten **5 dakikalık aralık, ÖÖ/ÖS + a.m./p.m., h/min ve 30/60 dk süre** kapsamına geçirildi.
5. Geometri yalnız dört temel şekilden çıkarılıp **yarım daire, çeyrek daire, bileşik figür, bileşen analizi ve ızgaraya kopyalama** kapsamına genişletildi.
6. Bölme P1'de kavramsal paylaşma/gruplama üzerinden tutuldu; sembolik kanıtta eksik çarpan ilişkisi kullanıldı.
7. Para görevleri birim-duyarlı hale getirildi; TL/kuruş aynı görevde karıştırılmıyor.
8. Tek-dosya build için önceki siyah-ekran regresyonuna karşı inline JS parse testi korunuyor.
9. UI testi artık motorun ürettiği her P1 görseli ve manipülatifi için renderer/handler bulunduğunu otomatik denetliyor.
10. Günlük-nesne şekil transferi artık clip-path yaklaşımı yerine aynı kanonik şekil renderer'ını kullanıyor; yarım/çeyrek daire geometri tutarlılığı korunuyor.

## Tarayıcı E2E sınırı

Bu container'daki Chromium headless süreci sayfadan bağımsız olarak sonlanmadan askıda kaldığı için gerçek tıklama akışını otomatik PASS olarak işaretlemiyorum. Standalone parse, dosya bütünlüğü, motor invariantları ve motor→UI renderer/interaction sözleşmesi otomatik olarak doğrulandı.

Gerçek telefon/tarayıcı testinde özellikle şu noktalar kontrol edilmeli:

- 390–430 px ekranda cm cetvelinin yatay kaydırma ergonomisi,
- 12 dakika butonunun (00–55) dokunma hedefleri,
- bileşik şekil parça bankasında çoklu seçim,
- yarım/çeyrek daire görsellerinin küçük ekranda ayırt edilebilirliği,
- 100 sayısı için 10 onluk çubuğunun düzeni,
- köprü/review görevlerinin beklenen pencereye dönmesi.

## Pedagojik sınır

Bu testler yazılımın ve içerik sözleşmesinin tutarlı olduğunu gösterir. Öğrenme etkisini göstermez. Kullanılabilirlik pilotu ve daha sonra pre/post + yakın transfer + gecikmeli retention ölçümü gerekir.
