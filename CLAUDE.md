# TroyApps — proje el kitabı (CLAUDE.md)

Bu dosya, klasörü açan her Claude/terminal oturumunun ilk okuması için yazıldı.
Site: https://troyapps.app — GitHub Pages, statik HTML. Repo: TroyApps/troyapps.github.io (main dalı = yayın).
Sahibi: Enes (TroyApps). Konuşma dili Türkçe, samimi. Kod yorumları Türkçe (ASCII).

## Altın kurallar
1. **Önce sor, sonra dokun.** Enes "plan yapıyoruz" dediyse dosya değiştirme, push etme. Onay verince yap.
2. **Sayfaları elle düzenleme, üret.** `index.html`, `en/index.html`, `404.html`, politika sayfaları, yönlendirme sayfaları ve `sitemap.xml` üretilir.
   Metin/link değişikliği → `content/*.json` veya `content/policy/*.html` → `node scripts/build-pages.mjs` → hepsini commit'le. Test bunu denetler.
3. **Şifre / API anahtarı / ödeme bilgisi asla sohbete veya koda girmez.** Giriş işlemlerini Enes kendisi yapar.
4. **Kalıcı adreslere dokunma:** `/privacy/`, `/morse-flash-policy/`, `/airmousehand-policy/`, `app-ads.txt`, `ads.txt`, `CNAME`. Play Store ve AdMob bunlara bakıyor.
5. Commit mesajları İngilizce, kısa. Cloud oturumundan push 403 verirse GitHub web upload ile yayınlanır (tek klasör = tek commit) ya da zip terminal Claude'a verilir.
6. Haber/başkasının görselini hotlink'leme (telif). Uygulama görselleri kendi Play Store listemizden.

## Tasarım (28 Eyl 2026 — "karalama" teması)
İlham: karolortyl.com. Koyu degrade zemin, mürekkep (SVG feTurbulence + feDisplacementMap) filtreli `TROYAPPS` çizgi logosu,
sarı/kırmızı/gri yapışkan not etiketleri, "Fig. N" indeks dili, Space Mono + Archivo Black (self-host, `assets/fonts/`).
Sayfa tek ekranlık üç bölüm: **hero** → **uygulamalar** (iki ikon yan yana; ikona tıklayınca altında o uygulamanın görsel şeridi açılır,
üzerine gelince büyür, tıklayınca büyük görünüm) → **iletişim** (e-posta, sosyal linkler, "yeni araç? hazırlanıyor" etiketi — Enes istedi, kalsın).
Troy maskotu, Radar, 7 ek dil ve reklam rayları **kaldırıldı** (Enes kararı). Diller: TR (`/`) + EN (`/en/`).

## Yapı
```
content/site.json          ortak veri: uygulamalar (Play linki, ikon, görsel klasörü, adet), sosyal linkler, yönlendirmeler
content/tr.json, en.json   sayfa metinleri (nav, hero etiketleri, özellik çipleri, görsel altyazıları, footer, 404)
content/policy/*.html      politika metinleri (<article> gövdesi; ilk satır title|description yorumu)
scripts/build-pages.mjs    üretici → index.html, en/index.html, 404.html, */index.html (politika + yönlendirme), sitemap.xml
assets/css/site.css        tek CSS (font-face'ler dahil). ?v= hash'i üretici hesaplar, elle etiket gerekmez
assets/js/site.js          menü vurgusu, ikon→panel, büyüme yönü, lightbox, e-posta kopyala (kütüphane yok)
assets/img/shots/morse-flash/tr-1..8.webp     Play Store dikey görselleri (720×1562). en-N.webp varsa EN sayfa onu kullanır, yoksa tr-N
assets/img/shots/airmousehand/{tr,en}-1..8.webp
assets/img/*-icon-192.png, favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192/512.png, og-home.png
assets/fonts/*.woff2       Space Mono 400/700, Archivo Black 400 (latin + latin-ext; Türkçe karakterler ext'te)
tests/site.test.mjs        node --test tests/site.test.mjs  (üretim güncel mi, kırık link, eski tema sızıntısı, politika/ads dosyaları)
docs/superpowers/          eski plan notları (arşiv, dokunma)
```
Yönlendirmeler (`content/site.json` → `redirects`): eski `/morse-flash/`, `/airmousehand/`, `/radar/`, `/en/...` ve 7 dil kökü
meta-refresh ile `/`, `/#morse-flash`, `/en/` vb. adreslere gider (noindex). Silme; dışarıdan gelen eski linkler için.

## Yeni uygulama eklemek
1. `content/site.json` → `apps` dizisine yeni giriş (id, name, icon, play, policy, shots_dir, shots, rot).
2. Görseller `assets/img/shots/<id>/tr-1..N.webp` (dikey, ~720px genişlik yeter; EN için en-N.webp isteğe bağlı).
3. `content/tr.json` ve `en.json` → `apps.<id>` (get, lead, feats, caps) ve `legal.<id>`.
4. Politika sayfası: `content/policy/<id>-policy.html`.
5. `node scripts/build-pages.mjs` + `node --test tests/site.test.mjs`. Fig numaraları kendiliğinden kayar.

## AdSense durumu
- Yayıncı: `ca-pub-9329708777375659`. Ana sayfaların `<head>`inde yalnızca **yükleyici betik** var (Google'ın site incelemesi için; görünmez).
- Reklam birimi / panel / ray **yok**. Onay gelince ve Enes isterse eklenir; test şu an `<ins class="adsbygoogle">` görürse kırılır (bilinçli).
- Otomatik reklamlar kapalı kalsın (tasarımı bozar). Site incelemesi AdSense panelinden takip edilir; Enes kendisi girer.

## Bekleyen fikirler (hepsi plan, onaysız başlama)
- Yeni araç (Enes hazırlıyor; iletişimdeki etiket bunun için).
- Morse Flash EN görselleri: Play Store `hl=en` listesinden `assets/img/shots/morse-flash/en-1..8.webp` (yoksa TR görselleri kullanılır).
- Site içi sohbet botu, "repo analiz et" aracı, bağış seçeneği — hepsi fikir aşamasında.

## Yerel test
```
node scripts/build-pages.mjs          # sayfaları üret (--check: sadece kontrol)
node --test tests/site.test.mjs       # sözleşme testleri
python3 -m http.server 8123           # http://localhost:8123
```
