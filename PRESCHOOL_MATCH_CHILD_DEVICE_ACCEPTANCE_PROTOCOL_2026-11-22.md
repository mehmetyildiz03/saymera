# SAYMERA — Preschool Eşleştirme Referans Dersi: Gerçek Cihaz ve Çocuk Kabul Protokolü

**Tarih:** 22 Kasım 2026  
**Kapsam:** Gizli `nelMatchAttributes` v2/v3 referans dersi. PR #24 → PR #25 → PR #26.  
**Durum:** **UYGULANMADI**. Bu dosya ileride yapılacak gözlemler için protokoldür, gerçekleşmiş pilot veya ürün kabulü değildir.

## 1. Amaç

Otomatik testlerin ölçemediği dört soruyu gözlemek:
1. 4–6 yaşındaki çocuk **yönergeyi** okuyabilmeden dinleyip anlayabiliyor mu?
2. Nesneyi **seçme → doğru hedefe yerleştirme** hareketini bir yetişkin göstermeden kullanabiliyor mu?
3. **Renk**, **şekil** ve **kural değişimi** arasındaki farkı kavrayıp yeni bir örneğe uygulayabiliyor mu?
4. Yanlış eşleşmeden sonra gelen ipucu çocuğa yol gösteriyor mu, yoksa rastgele denemeye mi itiyor?

## 2. Örneklem / etik sınırlar

- İlk *kullanılabilirlik* pilotu için birbirinden farklı yaş ve deneyim düzeylerinde **5–10 gönüllü çocuk**, yetişkin izni ve çocuk istekliliğiyle kısa bireysel oturumlar. Bu büyüklük istatistiksel öğrenme etkisini kanıtlamaz.
- Çocuk istemediğinde etkinlik durur; sonuç “başarısız çocuk” değil “üründe gözlenen engel” olarak kaydedilir.
- İsim, doğum günü, yüz/ses kaydı, okul veya başka kişisel veri toplamadan anonim **oturum kodu** kullan. Gereksiz ekran/ses kaydı alma. İstenirse veli onayı ve güvenli saklama ayrıca gerekir.
- Yetişkin cevap vermez, nesneyi çocuk yerine yerleştirmez; yalnız nötr bir başlangıç cümlesi söyleyebilir: “Ne yapacağını anlamadıysan dinleme düğmesine basabilirsin.”

## 3. Cihaz doğrulaması

| Cihaz / koşul | Gözlem |
|---|---|
| Fiziksel telefon: Safari/WebKit (uygunsa iPhone) | Doğru dokunma, kaydırma, ekran boyutu, ses |
| Fiziksel tablet: Safari veya Chrome | Erişilebilir hedef boyutu, nesnelerin ayrışması, ses |
| Varsa Android Chrome telefon | Dokunma, seslendirme davranışı |
| Sessiz/ses kapalı kullanım | Nesnelerin görsel olarak anlaşılır kalması; ses zorunluluğu oluşmaması |
| Büyük yazı / erişilebilirlik tercihi | Kesilme, etkileşimsiz/erişilemeyen buton olmaması |
| Geri dönme / oturumu bırakma / tekrar | Yanlış ilerleme, veri kaybı ya da kazara tamamlama olmaması |

**Önce** en güncel PR'ın otomatik Chromium/WebKit testleri geçmeli; fiziksel cihaz kontrolü onları tamamlar, onların yerine geçmez.

## 4. Gözlem akışı (oturum ~10–15 dakika, çocuğun isteğine göre)

| Görev | Yetişkinin gözlediği kanıt | Kaçınılacak yanlış yorum |
|---|---|---|
| Aynısını bul (1) | Seçme ve boş alana yerleştirme, renk/şekil/boyutu birlikte ele alma | Yalnız doğru nesneye dokunmayı “yerleştirdi” sayma |
| Renk eşleştirme (2) | İki farklı hedefi, şekiller farklıyken doğru renkle eşleştirme | Tek hedef başarısını iki hedef ustalığı sayma |
| Şekil eşleştirme (3) | Renkler farklıyken iki doğru şekil eşleştirme | Renk benzerliğine dayalı rastgele yanıtı kavrayış sayma |
| Kural değişimi (4) | Aynı nesne grubunda renk ardından şekil; yeni kuralın farkına varma | İki rastgele doğruyu neden açıklaması gibi sunma |
| Oyuncak rafı (9) | Arabadan topa ortak rengi aktarabilme | Ekran içi transferi fiziksel dünya kanıtı sayma |
| Gerçek iki nesne (10) | Çocuk çevrede nesne seçip ortak özelliği gösteriyor veya söylüyor; isteğe bağlı yetişkin gözlemi | “Denedim” düğmesini gözlenmiş fiziksel performans sayma |

Ders boyunca çocuğun ilgisini yitirmesi, sıkışması veya zorlanması hâlinde görevi kısa kes; tüm 10 ekranı bitirmek zorunlu bir performans testi değildir.

## 5. Kayıt şablonu

Her görev için:

- **Başlangıç:** Ses düğmesini bağımsız keşfetti / yetişkin hatırlattı / ses çalışmadı.
- **Eylem:** Bağımsız yaptı / bir kavramsal ipucuyla yaptı / yetişkin hareketi gösterdi / yapamadı veya bıraktı.
- **Hata türü:** Renk ve şekli karıştırdı / hedef alanını bulamadı / seçmeyi yerleştirme sandı / okunamayan metin / yanlış ses / başka.
- **Geri bildirim:** Yardımcı oldu / anlaşılmadı / fazla bilgi verdi / yeniden denemeye imkân vermedi.
- **Anlatma:** Kendi sözü veya işaretle gösterdi / hazır seçenekten tanıdı / yetişkin gözlemleyemedi.
- **Not:** Kimliği belirlemeyen tek cümlelik somut davranış (ör. “İlk renkten sonra yeni şekil kuralını duymak için yeniden Dinle'ye bastı”).

Yetişkin müdahalesi ile elde edilen yanıt bağımsız cevapla karıştırılmaz. Prototipte toplanmamış olayları “sistem kaydetti” diye raporlama.

## 6. Ürün kabul kapıları

**Kritik engel bulunursa RED:** Herhangi bir cihazda doğru hedefe yerleştirilememesi, yanlış cevapla ilerlenmesi, sesli yönergenin kullanılamaması nedeniyle okuma bilmeyenin süreci anlayamaması, seansın kurtarılamaması veya gerçek hayatta yapılmamış görevin doğrulanmış ustalık sayılması.

**Tekrar tasarım gerektirir:** Çocukların birçoğunun hedef alanını bulamaması, iki hedefi birbirine karıştırması, ses düğmesinin fark edilmemesi, yardım metinlerinin rastgele denemeyi artırması veya sürekli yetişkin açıklaması gerektirmesi. Eşikler küçük pilotun bulgu ve bağlamıyla değerlendirilmeli, örneklemden topluma genelleme yapılmamalı.

**İlerlemeye aday:** Kritik engeller kapanmış, etkinlikler anlaşılır, ekran/ses erişimi doğrulanmış, birden fazla çocukta bağımsız kullanıma dair gözlem kaydedilmiş ve hata karşısındaki destek işe yarıyor. Bu **ürün kullanılabilirlik kabulü** için adaylıktır; klinik veya bilimsel öğrenme etkisi kanıtı değildir.

## 7. Bundan sonraki teknik karar

- PR #26 tam CI + ekran incelemesini bitir.
- PR #24, #25 ve #26 bağımlılıklarını ayrı ayrı gözden geçir; **main merge = Preschool canlı yayını** değildir.
- Gerçek cihaz + çocuk gözlem sonuçlarına göre yalnız gerekli tasarım noktalarını onar.
- Diğer 16 becerinin pedagojik denetimine geçmeden önce bu ilk dersin tekrar kullanılabilir kalite ölçütlerini netleştir.

## 8. Yerel ağda iPhone/iPad üzerinde açma — yayına alma değil

Bu yol **bilgisayarın ve telefonun aynı güvenilir Wi-Fi ağında** bulunmasını gerektirir. GitHub Pages bağlantısı `main` sürümünü gösterir ve bu PR adayını denemek için kullanılmamalıdır.

Windows bilgisayarda mevcut çalışmalarınızı bozmamak için ayrı bir test klasörüne klonlayın. Git ve Python 3 kuruluysa terminalde:

```powershell
git clone --branch codex/preschool-match-multiple-targets-v3 --single-branch https://github.com/mehmetyildiz03/saymera.git saymera-preschool-pilot
cd saymera-preschool-pilot
py -m http.server 4173 --bind 0.0.0.0
```

Ayrı bir terminalde `ipconfig` komutuyla bilgisayarın bağlı olduğu Wi-Fi adaptörünün IPv4 adresini öğrenin. iPhone/iPad Safari'de `http://BILGISAYARIN_YEREL_IP_ADRESI:4173/?inspect=1` adresini açın (ör. **adres şablonu**, gerçek IP değil). Windows güvenlik duvarı erişimi engelliyorsa yalnızca **özel/güvenilir ağ** için gerekli yerel izinleri değerlendirin; internete port yönlendirme, halka açık tünel veya public deploy açmayın.

Inspector ekranında **Okul Öncesi → Eşleştirme (nelMatchAttributes) → 1. adım → Bu adımdan aç** sırasını kullanın. Etkinliklere sırayla ilerleyin; ses için ekrandaki **🔊 Dinle** düğmesini deneyin.

**Veri sınırı:** `?inspect=1` **sandbox** açar. Gerçek kullanıcı verisi yazılmaz. Aynı sekme açıkken Ders Merkezi'ne gidip geri döndüğünüzde yarım kalan dersi sürdürebilme test edilir; **sayfa yenileme, sekme kapatma veya cihaz değiştirme** sonrasında sandbox ilerlemesinin korunması beklenmez. Bu durum canlı ürünün kalıcı ilerleme politikası için geçerli bir test değildir. Çocuğun kimlik, ses veya görüntü kaydını uygulamaya eklemeyin.

**Son sürüm sabitleme:** Deneme başlamadan hemen önce [PR #26](https://github.com/mehmetyildiz03/saymera/pull/26) head commit'ini, tüm otomatik testlerin o commit üzerinde PASS olduğunu ve yerel klasördeki `git rev-parse HEAD` sonucunun aynı commit olduğunu doğrulayın. PR değişirken eski kopyadan elde edilen gözlemler sürüme karıştırılmamalıdır.

## 9. Main sonrası kullanıcı denemesi (gizli özellik, normal ana menü değil)

Bu bölüm **main birleşmesi, main CI PASS ve GitHub Pages'in güncellenmesi sonrasında** uygulanacaktır. Taslak PR bağlantıları ile canlı `main` bağlantısını birbirine karıştırmayın.

**Test adresi:** https://mehmetyildiz03.github.io/saymera/?inspect=1

1. Safari'de bağlantıyı aç. Daha önce açtıysan sekmeyi yenile; eski PWA önbelleği nedeniyle eski ekran görünüyorsa yeni özel sekmede dene veya site önbelleğini kontrol et. Yeni önbellek adı en az `saymera-v1-27-0-` ile başlamalıdır.
2. Inspector'da **Okul Öncesi** profilini ve **Aynı özelliği eşleştir** dersini seç.
3. **Bu adımdan aç** ile ilk adımı başlat. Dinle düğmesi ses çıkarıyor mu; nesneye dokunup boş yere yerleştirebiliyor musun gözle.
4. Renk ve şekil adımlarında **iki hedefin ikisini** doldur; bir eşleştirmede Sonraki'nin açılmaması gerekir.
5. Kural değiştirmede ilk renk eşleştirmesinden sonra **Dinle**'ye yeniden bas; ikinci yönergenin şekil kuralı olduğunu kontrol et.
6. Üçüncü adımdayken **X ile kapat**, **Ders Merkezi**'ne gir ve **Öğrenmeye başla**'yı seç; aynı açık sekmede kaldığın adımdan devam edip etmediğini kontrol et.
7. Eşleştirmeyi tamamla ve **Yeniden aç** ile ilk adımın geldiğini doğrula. Tüm işlemlerin yanıtını yetişkin vermesin.
8. Denemenin sonunda `?inspect=1` adresinden çıktığında **gerçek ilerlemenin değişmediğini** kontrol et. Sandbox sekmesi/yenilenmesi arasında ilerleme korunmaz; bu beklenen davranıştır.

**Sınır:** GitHub Pages güncellemesinin tamamlandığını yalnız kodun `main`e birleşmesinden çıkarsamayın. `main` sonrası CI ve dağıtım kanıtı gerekir. Kullanıcıya “canlıya açıldı” denmez; okul öncesi v2 normal menüde gizli kalır ve yalnız test sorgu parametresiyle erişilir. Bu parametre gizlilik/giriş güvenliği değildir, sadece test arayüzü bayrağıdır. Gerçek çocuk ve fiziksel cihaz denemelerinin tamamı kullanıcı gözlemine dayanır; asistan yapıldı diye işaretleyemez.
