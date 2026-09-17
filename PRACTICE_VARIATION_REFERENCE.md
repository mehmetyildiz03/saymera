# SAYMERA v1.5.4 — Practice Variation Reference

Amaç: pekiştirmeyi kaldırmadan çocuğun aynı soruyu tekrar tekrar görüyormuş gibi hissetmesini engellemek.

## Karar

İlk öğrenme döngüsünde model → temsil → sembol → gerekçe → bağlam akışı korunur. Pekiştirme hâlâ yeni kavram örnekleriyle `symbol` ve `transfer` başta olmak üzere gerektiğinde 2–4 göreve uzayabilir. Bu pedagojik tekrar kasıtlıdır; aynı *tam görev* veya aynı *çocuk yüzeyi soru kalıbı* değildir.

- Fresh concept üretimi korunur.
- Uygulamadaki exact-repeat guard korunur.
- Practice görevleri `practiceIndex` ile çocuk dilinde yeni örnek olarak varyantlanır.
- Kesirlerde yalnız ön ek eklemekle yetinilmez; `fractionMeaning2`, `fractionNotation2`, `fractionCompare2` ve `fractionAddSub2` için sembol ve transfer pekiştirmelerinde ayrı soru cümleleri kullanılır.
- Kalıcı `practice-variation.test.mjs`, 44 P1/P2 referans becerinin ilk döngüsünde aynı temsil + normalize edilmiş prompt kalıbının ikinci kez görünmesini engeller.

## Kesir gösteriminin öğretildiği yer

`fractionMeaning2` yalnız bütün ve eş parça anlamını kurar; çocuk `1/2` gibi gösterimleri biliyor kabul edilmez. `fractionNotation2` içinde önce **Gör / representation** aşamasında `n/d` gösterimi açıkça öğretilir (alt sayı = toplam eş parça, üst sayı = seçilen parça). Bunun ardından **Yaz / symbol** aşamasında çocuk modelden kesir gösterimini üretir/seçer.

Bu sıra regressions testleriyle korunur.
