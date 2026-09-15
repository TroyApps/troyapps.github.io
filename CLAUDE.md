# TroyApps — proje el kitabı (CLAUDE.md)

Bu dosya, klasörü açan her Claude/terminal oturumunun ilk okuması için yazıldı.
Site: https://troyapps.app — GitHub Pages, statik HTML. Repo: TroyApps/troyapps.github.io (main dalı = yayın).
Sahibi: Enes (TroyApps). Konuşma dili Türkçe, samimi. Kod yorumları Türkçe (ASCII).

## Altın kurallar
1. **Önce sor, sonra dokun.** Enes "plan yapıyoruz" dediyse dosya değiştirme, push etme. Onay verince yap.
2. **Mobil/tablet tasarımına dokunma.** Tüm reklam/geniş ekran işleri `@media (min-width: 1760px)` içinde kalır.
3. **RADAR işaretçi bölgeleri robotundur, elle düzenlenmez:** `<!-- RADAR:START/END -->` (radar sayfaları) ve `<!-- RADARBOX:START/END -->` (ana sayfalar). Aralarını `scripts/radar.mjs` yazar.
4. **Dil sayfalarını elle düzenleme.** `ar/ de/ es/ fr/ hi/ id/ it/ pt-br/` altındaki sayfalar `en/index.html` ve `en/morse-flash/index.html`'den üretilir:
   `node scripts/generate-locales.mjs` (önce `en/` kaynağını düzenle, sonra üret, sonra hepsini commit'le).
5. **Şifre / API anahtarı / ödeme bilgisi asla sohbete veya koda girmez.** Anahtarlar GitHub Secrets'ta (OPENROUTER_API_KEY, GROQ_API_KEY). Giriş işlemlerini Enes kendisi yapar.
6. Haber sitelerinin görsellerini hotlink'leme (telif). Radar'daki armalar kendi ürettiğimiz SVG.
7. Commit mesajları İngilizce, kısa. Cloud oturumundan push 403 verirse GitHub web upload ile yayınlanır (tek klasör = tek commit).

## Yapı
```
index.html                 TR ana sayfa (body: home-v2 home-v3 theme-command)
morse-flash/index.html     TR ürün sayfası (product-v3 theme-command)
radar/index.html           TR Radar (radar-v3 theme-command)
en/…                       EN karşılıkları (ana + morse-flash + radar)
ar/ de/ es/ fr/ hi/ id/ it/ pt-br/   üretilmiş diller (ana + morse-flash)
*-policy/                  gizlilik politikaları (reklam rayı yok)
assets/css/theme-v3.css    "command center" tema + REKLAM RAYLARI bloğu (en altta)
assets/css/home-v2.css home-v3.css product-v3.css radar-v3.css   sayfa düzenleri (.ad-rail{display:none} burada; theme-v3 daha yüksek özgünlükle açar)
assets/js/site.js          menü, decode efekti, reveal + REKLAM RAYI DOLDURUCU (en altta)
assets/js/troy/            3D maskot Troy (three.js, GLB) — troy-controller.js giriş noktası
assets/js/locales.js       dil listesi, radarHomeTargets()
assets/models/troy/*.glb   Troy modeli ve aksesuarlar
assets/img/favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192/512.png   kırmızı T (yeşil eski tema kaldırıldı)
scripts/radar*.mjs         günlük Radar taraması (trending scrape + Search API yedeği; OpenRouter→Groq→mekanik özet)
scripts/generate-locales.mjs  dil sayfası üretici
.github/workflows/radar.yml   her gün 05:13 UTC; workflow_dispatch ile elle
tests/*.test.mjs           node --test
```
Önbellek: GitHub Pages ~10 dk. CSS/JS linklerinde `?v=YYYYMMDD-etiket` var; HTML'e dokunmadan JS/CSS güncellersen aynı URL 10 dk içinde tazelenir.

## Reklam rayları (yayında, AdSense bekliyor)
- Sadece ≥1760px ekranlarda görünür. Sol/sağ `aside.ad-rail` → `.ad-rail-sticky` içinde `.ad-slot`'lar.
- `site.js` sondaki IIFE sayfa yüklenince rayları **sayfa uzunluğuna göre** 300×600 yuvalarla doldurur (en az 2/yan). Ana sayfa 2+2, Morse 4+4, Radar 5+5 civarı.
- Yuvalar sayfayla kayar (`position:absolute; top:92px`), ekranı takip etmez — Enes böyle istedi.
- İçerik `body.theme-command .page-rails { padding-inline: 288px }` ile daraltılır. Ana sayfayı daha da genişletme isteği geldi; 300×600 ile fiziksel sınır bu (1920 − 600 = 1320px). Değiştirmeden önce sor.
- Yuva kimlikleri sayfaya özel: `data-ad-slot="<sayfa>-<left|right>-<n>"` (ör. `morse-flash-right-2`). Her sayfaya ayrı reklam birimi bağlanabilsin diye.
- Etiket metni sayfadaki ilk `.ad-slot-tag`'den okunur (dil korunur).

### AdSense bağlama (15 Eyl 2026 durumu)
Yayıncı kimliği: `ca-pub-9329708777375659` (app-ads.txt'dekiyle aynı hesap, AdSense Hesap bilgileri'nde doğrulandı).
- YAPILDI: 22 sayfanın `<head>`inde AdSense yükleyici var (en/ kaynakları + üretilmiş diller + TR). Politika sayfaları ve 404 reklamsız; test bunu korur (`tests/site-contract.test.mjs`).
- YAPILDI: `site.js` `makeSlot()` AdSense'e hazır. `AD_UNITS` boş olduğu sürece yer tutucu gösterir; birim numarası girilince (`"home"`, `"morse-flash"`, `"radar"` ya da hepsi için `"*"`) 300×600 `<ins class="adsbygoogle">` basar ve push eder. Yalnızca raylar görünürken (≥1760px) gerçek birim üretir, dar ekranda boş push yapmaz.
- YAPILDI (15 Eyl 2026 04:30): Hesaba AdSense web ürünü eklendi (Siteler/Reklamlar menüsü açıldı), troyapps.app kod snippet'iyle doğrulandı, site incelemesi istendi. Durum: "Hazırlanıyor". ads.txt kök dizine eklendi (Google'ın taraması bir gün sürebilir).
- AÇIK SORU: AEA/UK için kullanıcı rızası mesajı (CMP) formu panelde bekliyor: Google CMP 2 seçenek / 3 seçenek / harici CMP. Enes karar verecek; onaysız gönderme.
- Onay gelince: AdSense > Reklamlar > Reklam birimi > Görüntülü, sabit 300×600 birim(ler) oluştur, numaraları `AD_UNITS`'e yaz, yayınla. Reklam yoğunluğu politikasına dikkat (içerikten fazla reklam olmasın).
Not: AdMob mobil uygulama içindir, web için AdSense kullanılır. Panel işleri otomasyon Chrome profiliyle (claude-tools\chrome-otomasyon, CDP 9222) yapılabiliyor; form kaydetmeden önce Enes'e sor.

## Troy (3D maskot) notları
- `troy-controller.js` → `createTroyRenderer` (troy-three.js). Durumlar `data-troy-renderer`: loading / ready / fallback.
- F5'te beyaz kare sorunu çözüldü: `beforeunload`/`pagehide`'da tuval gizlenir (Chrome GPU tuvali boşaltıyordu). Yükleme sırasında poster gösterilmiyor, bilinçli tercih.
- Sekme arka plandayken render durur (document.hidden) — testte "ready" olmuyorsa sebebi bu.

## Radar notları
- Kaynaklar `scripts/radar-sources.mjs`; LIMITS.repos=8, news=10 (haber özelliği kaldırılacak, plan aşamasında).
- Planlanan (ONAY YOK, yapma): 25 repo, radar sayfasında ilk 3 + "tümünü gör" sayfası, salağın anlayacağı TR özetler, haber bölümünü kaldırma.
- Actions 60 gün hareketsizlikte kapanır; cron gecikebilir.

## Bekleyen fikirler (hepsi plan, onaysız başlama)
- Yeni tema (Enes şablon sitelerinden ilham topluyor).
- Site içi sohbet botu: Cloudflare Worker + ücretsiz model merdiveni, site verisine dayalı.
- Ziyaretçi için "repo analiz et" aracı.
- WhatsApp/Instagram'daki tasarım kayıtlarını ayıklama (sohbet adları + WhatsApp Web eşleşmesi bekleniyor).
- Bağış/destek seçeneği (yasal tarafı sonra).

## Yerel test
```
node --test tests/            # birim testler
python3 -m http.server 8123   # sonra http://localhost:8123
node scripts/radar.mjs --dry  # radar kuru çalışma
```
