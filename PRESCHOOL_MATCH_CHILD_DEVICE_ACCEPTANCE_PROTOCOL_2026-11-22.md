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
