# SAYMERA — Preschool v2 Ürün ve Pedagojik Kabul Matrisi

**Tarih:** 22 Kasım 2026  
**Durum:** V1 denetim / ürün kabulü **BLOCKED**; teknik aday PR #24 incelemede  
**Denetlenen kod:** `nel-spatial-relations-ui-wip` — `2418fe6af81aa0c93952d8c98fd9072deb29bf24`  
**Canlı temel:** `main` — `b3ca3bdc03e70a44d3441d9331877495f11c274e` (`package.json`: v1.26.1)  
**PR:** https://github.com/mehmetyildiz03/saymera/pull/24  
**Kapsam sınırı:** Yalnız Preschool v2 ürün kabulü. P1, P2 ve SayıYolu değiştirilmez.

## 22 Kasım devam kaydı — referans eşleştirme dilimi

- **Aday PR:** https://github.com/mehmetyildiz03/saymera/pull/25 — `codex/preschool-match-active-lesson-v2`, PR #24 üzerine kurulmuş ve **taslak**.
- `nelMatchAttributes` Learn 8→10 adım: seç+yerleştir; aynı nesnelerde renk→şekil kural değişimi; yeni oyuncak rafı örneği.
- `Anlat` hazır gerekçeyi tanıma olarak etiketlendi; gerçek nesneyle `Denedim` butonu doğrulanmış fiziksel transfer kanıtı sayılmıyor.
- GitHub Actions son run **45041099142**, commit **9db1e598**, **20/20 PASS**; ana test paketi ve Chromium/WebKit telefon-tablet tarayıcı işlerinin tamamı başarılı. Bu otomatik PASS, fiziksel cihaz/gerçek çocuk denetimi veya pedagojik ürün kabulü değildir.
- **G2/G3/G4/G5/G6 kapanmadı.** `main` değiştirilmedi; yalnız gizli referans beceri adayı geliştirildi.

## Eşleştirme görsel inceleme kaydı — 22 Kasım

**Gerçek görüntü kaynağı:** PR #25'in [CI 45041099142 ekran görüntüsü paketi](https://github.com/mehmetyildiz03/saymera/actions/runs/45041099142) (`preschool-match-browser-screenshots`); Chromium/WebKit telefon (390×844), Chromium tablet (1024×768), WebKit tablet (820×1180). Pakette dört etkinliğin **doğru işlem sonrası** hâli var: `same-object`, `switch-match-rule`, `toy-shelf-match`, `real-world-match`. Diğer altı adımın ekran ekran incelemesi bu pakette bulunmuyor. PR #25'in yeni test sürümü tüm 10 adımın ilk ekranını da kaydedecek.

| Görsel bulgu | Kanıt | Değişiklik | Kabul durumu |
|---|---|---|---|
| Öğretim ekranında üstteki ♪ düğmesi çalışmıyordu | `speakCurrent()` `currentQuestion===null` durumunda hemen çıkıyordu, NEL Learn bunu `null` yapıyor | Gizli Match Learn için adım/evre odaklı seslendirme; ayrıca görünür `🔊 Dinle` | Kod değişti; yeni browser QA sonucu bekleniyor |
| Telefonda yönergeler küçük, başlıklar yetişkin odaklı | 390×844 görüntüler + `styles.css` eski `p{font-size:12px}` | 15px kısa yönergeler, kısa başlıklar, belirgin ses tuşu | Görsel yeniden inceleme bekleniyor |
| Dört adet küçük sekme tekrarlı bilgi gösteriyordu | Telefon ekranında EŞLEŞTİR/ÖZELLİĞE BAK/ANLAT/TAŞI şeridi ve üstte ilerleme zaten var | Yalnız Match Learn'de sekme şeridi gizlendi; üstteki ilerleme korundu | Görsel yeniden inceleme bekleniyor |
| Nesne yerleştirme alanı ekrana sığıyor | Telefon ve tablet ekran görüntüleri; mevcut Playwright genişlik kontrolleri | Mevcut dokunma alanları korunuyor | Otomatik yerleşim PASS; fiziksel cihaz açık |
| Yeni kuralın sesli anlaşılması gerekiyordu | `switch-match-rule` önce renk sonra şekil yönlendiriyor; eski ses yoktu | Dinle düğmesi o anki renk/şekil evresini de okur | Yeni evre-seslendirme testi sonucu bekleniyor |
| "TAŞI" gerçek yaşam öğrenmesini kanıtlamıyor | `real-world-match` yalnız `Gerçek nesnelerle denedim` düğmesine dayanıyor | Etiket özbildirim olarak tutulur | Fiziksel transfer **doğrulanmadı** |

**Önemli sınır:** Bu incelemede ekranlar gerçek çocuk tarafından kullanılmadı; Playwright görselleri okul öncesi kullanılabilirlik veya öğrenme etkililiği kanıtı değildir. `same-object` ve `toy-shelf-match` **dokun-seç + hedefe dokun** etkileşimidir; serbest sürükleme olarak sunulmamalıdır. Bu adayda yalnız gizli `nelMatchAttributes` referansı değişmektedir.

**Teknik kod:** [PR #25](https://github.com/mehmetyildiz03/saymera/pull/25). Seslendirme, okunabilirlik ve başlangıç ekranı testleri için PR'ın **en son** SHA'sının CI sonucu esastır; eski 20/20 PASS yeni değişikliklerin PASS olduğu anlamına gelmez.

## On adımın ekran ekran ilk görünüm denetimi — 22 Kasım

**Yeni kaynak:** [Run 45044289277'in matching screenshot artifaktı](https://github.com/mehmetyildiz03/saymera/actions/runs/45044289277/artifacts/14763311294). Chromium telefon için 10 adımın **işlem öncesi** ekran görüntüsü elde edilip görsel olarak incelendi. Bu run **FAIL** (WebKit ikinci kuralın seslendirilmesini doğrulayan test); görüntüler kullanışlı olsa da teknik kabul kanıtı değildir. Son aday kod ve testler [PR #25](https://github.com/mehmetyildiz03/saymera/pull/25)'te ilerliyor.

| Adım | Görsel ilk görünümde gözlenen davranış | Öğretim değerlendirmesi |
|---|---|---|
| 1 `same-object` | Aynı renk/şekil/boyutu hedef + boş yer + 3 nesne | Aktif seç/yerleştir iyi; fiziksel manipülasyon değil |
| 2 `same-colour` | Hedef ve 3 seçenek | Rengi ayırma anlaşılır; tek tıklamalı tanıma |
| 3 `same-shape` | Hedef ve 3 seçenek | Şekil sabitliğini gösterir; tek tıklamalı tanıma |
| 4 `switch-match-rule` | Hedef, yerleştirme alanı, aynı üç nesne | Kural değiştirme güçlü; sesli ikinci evre WebKit test engeli |
| 5 `same-size` | Hedef/3 farklı büyüklük | Sözel yük az; yine tek tık |
| 6 `same-length` | Yatay çubuk ve iki farklı uzunluk + dikey nesne | Uzunluk/görünüş ayrımı; yön/ölçek karışıklığı çocukla gözlenecek |
| 7 `same-height` | Dikey hedef ve çeşitli biçimler | Yükseklik/uzunluk ayrımı çocukla gözlenecek |
| 8 `explain-match` | İki nesne + üç hazır cümle | Önce sadece yazılı açıklama, okuma yükü yüksek. Adaya her cevap için ayrı ses tuşu eklendi; hâlâ bağımsız sözlü açıklama kanıtı değil |
| 9 `toy-shelf-match` | İlk sürümde etiket `OYUNCAK RAFI`, görseller ise yine kare/daire/üçgendi | Sahte bağlam zenginliği riski; aday şimdi araba/top/uçurtma siluetleri kullanıyor, görsel yeniden test şart |
| 10 `real-world-match` | Üç yetişkin destekli yönerge ve `Denedim` | Ekran dışı görev değerli; uygulama fiziksel icrayı **doğrudan doğrulamıyor** |

**Açık pedagojik risk:** 10 adımın beşi (renk, şekil, büyüklük, uzunluk, yükseklik) hâlâ tek seçimle tamamlanıyor. Bunlar kısa rehberli tanıma alıştırması olarak kullanılabilir; her biri bağımsız nesne kurma veya kuralın transferi gibi etiketlenmemeli. Gelecek dilimde aktif kanıtın kapsamı artırılacak.

**Görsel rapor kararı:** Düzen/okuma/ses erişimi **iyileştirildi**; ancak WebKit ses, son oyuncak çizimleri, gerçek cihaz ve 4–6 yaş kullanılabilirlik testi geçmeden Preschool G2 kabulü verilmez.

## 22 Kasım — Renk/şekil iki hedefli eşleştirme dilimi

- PR #25'in son kodu `92e7df2883b08eebfbe81f399b22ec4ef000c115`, GitHub Actions **45045218587 — 20/20 PASS**. 36 Chromium/WebKit telefon/tablet ekran görüntüsü de gözden geçirildi; oyuncak arabası, top, uçurtma, yönerge ve açıklamaları dinleme kontrolleri görünür. Bu hâlâ `main` ile birleştirilmemiş, gizli NEL v2 prototipidir.
- **Yeni taslak PR #26:** https://github.com/mehmetyildiz03/saymera/pull/26 (`codex/preschool-match-multiple-targets-v3`, PR #25'in üzerine eklenir).
- `same-colour` ve `same-shape` tek dokunuşla yanıt verilen alıştırmadan, **iki hedef + dört seçenek + iki ayrı doğru yerleştirme** gerektiren öğrenme görevlerine çevrildi.
- Yanlış hedefe eşleştirme ilerletmez, seçmek tek başına kanıt sayılmaz, bir nesne ikinci kez yerleştirilemez. İki bağımsız eşleştirme olmadan sonraki adım açılamaz.
- Bu, rehberli ve kısıtlı bir **ekran içi eşleştirme** eylemidir. Serbest sürükle-bırak/serbest üretim, çocuğun özgün sözel açıklaması veya fiziksel dünyaya doğrulanmış transferi olarak raporlanmaz.
- Diğer üç `choice` Learn adımı (büyüklük, uzunluk, yükseklik) şimdilik tanıma etkinliği olarak kalır. Bu iki hedefli tasarımın çocuk kullanım değeri doğrulanmadan körü körüne bu üçüne çoğaltılmayacaktır.
- **PR bağımlılığı:** #24 → #25 → #26. Hiçbiri doğrudan teknik PASS gerekçesiyle canlı Preschool'a yayımlanmaz.
- PR #26 teknik testleri tamamlansa bile **G2 gerçek çocuk/kullanılabilirlik**, **G4 canlı yol**, **G5 fiziksel cihaz** ve **G6 pilot** açık kalır.

## 1. Sonuç ve kanıt seviyesi

**Üç ayrı kabul düzeyi vardır:**

- **Kapsam / kaynak sözleşmesi:** 18 resmî NEL Numeracy KSD kodu kaydedilmiş; 1.1 ve 1.2 dersler arası, 17 ürün becerisi üç yolda düzenlenmiştir. Statik sözleşme ve otomatik QA, tanımlanmış kapsamı destekliyor.
- **Teknik aday:** PR #24 açık ve draft; main'den 18 commit ileride, 0 commit geride; son GitHub Actions run `36636564171` **success**, 20 işin tamamı PASS. Teknik birleştirme yapılmadı. PR'ın son incelemesi, merge sonrası regresyon ve fiziksel cihaz kabulü ayrıca gereklidir.
- **Öğrenme / canlı çocuk ürünü:** **KABUL EDİLMEDİ.** Yeni 17 beceri `hidden:true`; `skillsFor(profile)` gizlileri filtreliyor ve normal Preschool Atlas `renderLegacyAtlas()` kullanıyor. Inspector sandbox ile QA yapılması, çocuk uygulamasında yolun yayımlandığı anlamına gelmez.

Kaynak kanıtları: `engine.mjs` (NEL curriculum, paths, SKILLS, skillsFor); `app.js` (LESSON_FIRST_SKILLS, runtimeSkillsForProfile, renderAtlas); `PRESCHOOL_NEL_RESEARCH_CONTRACT.md`; `tests/nel-preschool-contract.test.mjs`; PR #24 ve GitHub Actions.

**Statik içerik sayımı:** 17 NEL v2 beceride toplam **160** tanımlı Learn adımı. Bu, 160 bağımsız öğrenci çıktısı veya gerçek çocukta 160 başarı kanıtı anlamına gelmez.

## 2. Kabul matrisi: 17 beceri

Aşağıdaki her satırda **kod + tarayıcı QA mevcut**, **normal canlı erişim kapalı**, **gerçek çocuk kabulü yok**. `Öncelikli doğrulama` bir hata kesinliği değil; yayın öncesi denetim ve gerekli tasarım eşiğidir.

| Öğrenme yolu / beceri | Learn adımı | Kaydedilmiş davranış | Öncelikli doğrulama / kabul koşulu |
|---|---:|---|---|
| A · `nelMatchAttributes` | 8 | Aynılık, renk, şekil, büyüklük, uzunluk, yükseklik; hazır gerekçe | Aynı nesneleri farklı kurallarla **etkin eşleştirme**, yeni örneğe aktarım; açıklama yalnız seçeneğe indirgenmesin. **İlk referans ders**. |
| A · `nelSortAttributes` | 8 | Renk, şekil, büyüklük, uzunluk, yükseklik ve yeniden sınıflama | **Aynı nesneleri** değişen kuralla yeniden gruplayabilme; yardımcı ipucuyla düzelme; çocuk dilindeki yönerge. |
| A · `nelCompareAttributes` | 8 | Büyük/küçük, uzunluk, yükseklik, hizalama | Karşılaştırma mantığı: doğru hizalama ve eşdeğer ölçek; yanlış görsel ipuçlarının elenmesi. |
| A · `nelOrderAttributes` | 11 | Büyüklük, uzunluk, yükseklik, ters sıralama, olay dizisi | Çocuk bağımsız sıralasın ve **kural tersine döndüğünde** yeni diziyi kurabilsin. |
| A · `nelPatterns` | 10 | AB/AAB/ABB/AABB/ABC tekrar birimi, kopyala/uzat/kur | Kopyalamanın ötesinde **yeni örüntü üretme**, tekrar birimini fark etme ve farklı bağlama genelleme. |
| B · `nelRoteCount20` | 10 | Sesli sayma, sıra, geri sayma, seçme | Rakam tıklamayı çocuğun **gerçekte sesli sayması** gibi raporlamama; yetişkin gözlemi gerekirse açıkça ayrılmalı. |
| B · `nelReliableCount10` | 10 | Tek tek sayma, sabit sıra, kardinalite, farklı yönden sayma | Dört sayma ilkesinin ayrı somut kanıtı; tekrar sayma ve çift sayma hatasında hedefli destek. |
| B · `nelSubitise5` | 10 | Kısa gösterim, hafızadan kurma, farklı dizilim | Tek tek saymadan miktar kavrama; 650 ms sabit gösterimin erişilebilirlik/gelişimsel uygunluk denetimi. |
| B · `nelConservation10` | 8 | Düzen değişince miktarın korunması | Aynı nesneler yeniden dizildiğinde sayı değişmediğini anlayabilme; görsel ezbere dayanmama. |
| B · `nelNumberRepresentations10` | 10 | Nesne grubu, rakam, sayı sözcüğü arasında ilişki | Görsel, yazılı ve **sesli** yolları eşleştirme; okuma bilmeyen 4–6 yaş için bağımsız kullanım. |
| B · `nelNumeralFormation10` | 10 | Çizim/izleme ve malzemeyle rakam oluşturma | İnce motor beceriyi sayı kavrayışına eşitlememe; alternatif giriş ve destekli yönlendirme. |
| B · `nelCompareQuantities10` | 10 | Bire bir eşleştirme, daha fazla/az/eşit | Miktar ilişkisini somutlaştırma; `< >` sembolleri Preschool ustalığına zorunlu olmamalı. |
| B · `nelPartWhole10` | 10 | Bütün/parça ayırma, farklı bölüşümler, 3 parça | Aynı bütünü birden fazla şekilde kurma ve koruma; sembolik toplama eşitliğine zorlamama. |
| C · `nelBasicShapes` | 10 | Dört temel şekil, dönüş/yön/boyut varyasyonları | Prototip ezberini aşma, yeni görünümde adlandırma; sesli/okuma-dışı erişim. |
| C · `nelShapeAttributes` | 10 | Kenar, köşe, eşit kenar, değişmezlik | Resimde gösterilen şekle dayalı gerçek kenar/köşe işaretleme ve yanılgısız geometri dili. |
| C · `nelShapeCompose` | 7 | 2 kare + 1 üçgen tekne ve başka figür montajı | Parçaları **gerçekten konumlandırma**; sürükle-bırak ve dokun-seç/dokun-hedef, gerçek cihaz doğrulaması. |
| C · `nelSpatialRelations` | 10 | Konum, yön, uzaklık: 10 ilişki için hedef dokunma | Hedefe dokunma ile **bağımsız uzamsal yerleştirme** ayrımını denetleme; sağ/sol hareketi fiziksel hareket gözlemi diye sunmama. |

Önemli çapraz bulgu: 17 `explain` Practice üreticisinin **14'ü `qBase` ile hazır yanıt seçenekleri** oluşturuyor; üçü yapılandırılmış `qTask` mekanizması kullanıyor. Hiçbiri tek başına çocuğun kendi sözleriyle açıklama yaptığı veya cihazın sesini ölçtüğü kanıt olarak sunulamaz. `Anlat` boyutunda seçenekli tanıma, manipülasyonla gösterme ve yetişkin tarafından gözlenen özgün açıklama **ayrı kanıt türleri** olarak tutulmalıdır.

## 3. P0 — Yayından önce çözülmesi gereken beş ürün boşluğu

1. **Gerçek kullanıcı yolu:** 17 v2 beceri Inspector dışında gizli; normal Preschool, eski sekiz becerilik Atlas'ı sunuyor. Yeni üç yol için kademeli, geriye uyumlu gezinme tasarlanmalı. Eski kullanıcı geçmişi silinmemeli; eski kanıtlar yeni becerilerde sessiz tamamlanmış sayılmamalı.
2. **Göstermek / seçmek / gerçekten kurmak:** Çoktan seçmeli doğru cevabı vermek nesne kurma veya yeni durumda kullanma ile aynı kanıt değil. Her becerinin kritik hedefinde etkin öğrenci üretimi aranmalı.
3. **`Anlat` ölçümünün dürüstlüğü:** Hazır gerekçeyi seçme, bağımsız açıklama gibi etiketlenmemeli. Yerel/mikrofonsuz ürün politikası korunurken çocuğa sözel açıklama fırsatı ve isteğe bağlı yetişkin gözlem kaydı sağlanabilir. Yetişkin bildiriminden otomatik doğrulanmış konuşma sonucu türetilmez.
4. **Dijitalden fiziksel oyuna transfer:** Ekran dışı etkinlik talimatları ve `Yaptım` düğmesi, gerçek fiziksel performansı doğrudan doğrulamaz. Ürün bunun gözlemlenmediğini açıkça ayırmalı.
5. **Uygulama bütünlüğü ve saha kabulü:** Üç yol arasında geçiş, sesli yönlendirme, dokunma boyutları, erişilebilirlik, kaydet/devam et, tekrar ve hata sonrası destek tek bir çocuk yolculuğu olarak denenmeli. Gerçek 4–6 yaş kullanıcısı ile kullanılabilirlik pilotu yapılmadan ürün tamamlandı denmez.

## 4. İlk referans düzeltme: `nelMatchAttributes`

Amaç: eşleştirmede başarılı bir **referans öğretim deneyimi**, ardından ortak kalitenin diğer becerilere çoğaltılması.

**Hedef akış**

1. **Keşfet:** Çocuk aynı nesneyi bulur; hemen cevap açıklanmadan fiziksel/görsel özelliklere dikkat çekilir.
2. **Birlikte kur:** Dokun-seç/dokun-hedef ve gerekliyse sürükle-bırak ile eşleştirir. Yanlışta ipucu ilgili **özelliğe** odaklanır.
3. **Kural değiştir:** Aynı nesne setinde bir kez renk, başka kez şekil; gerekirse büyüklük/uzunluk/yükseklik.
4. **Yeni örnek:** Daha önceki görselle aynı olmayan nesnelerde aynı ilişkiyi kullanır.
5. **Anlat / göster:** Hangi özellik eşleştirmeyi sağladı sorusuna işaretleme/nesne gösterme yolu sunulur; özgün sözel açıklama için yetişkin eşliği seçenek olabilir. Hazır gerekçe seçimi bağımsız açıklama kanıtı değildir.
6. **Pekiştir ve geri çağır:** Birkaç farklı örnek, sonra gecikmeli kısa geri çağırma; yalnız sabit 8 adımdan geçme başarı olarak işaretlenmez.

**Kabul koşulları**

- Eşleştirme ve kural değiştirme, gerçek öğrenci eylemi olarak doğrulanır.
- Yanlış yanıt sonraki adımı açmaz; çocuk anlaşılır bir destekten sonra yeniden deneyebilir.
- Yeni nesne/renk/şekil örnekleriyle en az iki varyasyon ailesi çalıştırılır; ezberden ayrışma denenir.
- Görsel metinler seslendirilebilir; okumayı bilmeyen çocuk ana görevi yetişkin müdahalesi olmadan kavrayabilir (pilotla doğrulanacak).
- Telefon ve tablette kaydırma, dokunma, yön değişimi ve devam etme E2E testlerinden geçer.
- Ekran dışı etkinlik **doğrulanmış dijital başarı** olarak yazılmaz.
- Eski sekiz canlı Preschool becerisi ve P1/P2 davranışı etkilenmez.
- Bir eğitimci/ebeveyn ve çocuk pilotundaki anlaşılabilirlik ve bağımsız kullanım engelleri ayrı raporlanır.

## 5. Yayın kapıları

| Kapı | Geçme koşulu | 22 Kasım durumu |
|---|---|---|
| G0 — Kaynak/kapsam | 18 NEL KSD; yatay 1.1/1.2, tüm v2 beceri sözleşmeleri | Kod/sözleşme düzeyinde PASS |
| G1 — Teknik aday | PR kod incelemesi + yeşil CI + merge sonrası regresyon | CI PASS; PR açık draft, **merge yok** |
| G2 — Pedagojik referans | Eşleştirme dersi aktif üretim, açıklama dürüstlüğü, destek, yeni örnek | **Açık** |
| G3 — Diğer 16 beceri | Referans kaliteye göre satır satır kabul | **Açık** |
| G4 — Canlı v2 yol/ilerleme | 3 yol, güvenli geçiş ve eski ilerlemenin korunması | **Açık** |
| G5 — Gerçek cihaz/erişilebilirlik | Gerçek telefon/tablet + sesli yönergeler + okunabilirlik, yerleşim ve dokunma | **Açık** |
| G6 — Çocuk kullanılabilirlik pilotu | 4–6 yaş grubu küçük pilot: yönerge anlama, eylem, yardım, hatalar, transfer | **Açık** |
| G7 — Öğrenme etkisi iddiası | Ayrı karşılaştırmalı ve gecikmeli ölçüm; yapılmazsa etki iddiası yok | **Doğrulanmadı; etki iddiası yasak** |

**Not:** Otomatik QA = yazılım/kontrat doğruluğu; çocukta öğrenme etkisinin deneysel kanıtı değildir. Teknik PR merge kararı ile Preschool v2 yayın kararı ayrı verilir.

## 6. Sıralı iş planı

1. **Denetim kaydı:** Bu matrisin karşılık gelen kod satırları ve mevcut regresyon testleri korunur.
2. **PR #24 teknik değerlendirme:** Açık draft PR; mevcut 20/20 CI yeşil. Kodun main'e alınması ayrıca kontrollü karardır; bu rapor merge gerçekleştirmez.
3. **`nelMatchAttributes` küçük dilim:** Önce referans dersi iyileştir; yeni bir kod dalında ayrı değerlendir.
4. **A/B/C beceri denetimi:** 16 kalan beceriyi etkin kurma, kavramsal açıklama, varyasyon, adaptasyon ve transfer koşullarıyla kabul et.
5. **Canlı Preschool v2 entegrasyonu:** Üç yol, eski kayıt göçü, erişilebilirlik, otomatik + fiziksel cihaz QA.
6. **Çocuk pilotu:** Önce kullanılabilirlik; ayrı tasarlanmış çalışma olmadan öğrenme etkisi iddiası yok.

## 7. Pedagoji kaynakları

- Singapore MOE NEL Numeracy: https://nel.moe.edu.sg/la/numeracy/overview/
- Manipülatifler ve oyunlar: https://nel.moe.edu.sg/la/numeracy/how-can-you-do-it-/using-manipulatives-and-games/
- IES/WWC *Teaching Math to Young Children*: https://ies.ed.gov/ncee/wwc/practiceguide/18
- Proje sözleşmesi: `PRESCHOOL_NEL_RESEARCH_CONTRACT.md`

**Karar:** Şimdi P1/P2'yi genişletmek veya tüm Preschool'u birden yayımlamak yerine, G1 ve G2 üzerinde kontrollü ilerle. G2'ye geçiş, v2'nin canlıya alınması anlamına gelmez.
