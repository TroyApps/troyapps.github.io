# Yeni tasarıma geçiş — uygulama talimatı (terminal Claude için)

Bu zip, reponun **tam yeni hâli**dir (`.git` hariç). Eski dosyaların hiçbiri kalmayacak;
zip içinde olmayan her şey silinir. Aşağıdaki adımları sırayla uygula, sonucu Enes'e özetle.

## 0. Hazırlık
- Repoda başka bir iş yarım kaldıysa önce onu commit'le/push'la, sonra başla. Çalışma ağacı temiz olmalı: `git status` boş.
- `git fetch origin && git checkout main && git pull --ff-only`.

## 1. Eskiyi sil, yeniyi koy
```
# repo kökünde:
git rm -rq --cached .            # indeksi boşalt
# .git dışındaki her şeyi sil (Windows PowerShell):  Get-ChildItem -Force | Where-Object Name -ne '.git' | Remove-Item -Recurse -Force
# (bash):  find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
# zip'i repo köküne aç (zip'in içindeki dosyalar doğrudan kökte olmalı: index.html, content/, assets/ ...)
git add -A
git status --short | wc -l       # ~250 satır değişiklik beklenir (silinen 7 dil, Troy, Radar, vendor)
```

## 2. Doğrula (push'tan önce)
```
node scripts/build-pages.mjs --check     # "hepsi guncel" demeli
node --test tests/site.test.mjs          # 7/7 geçmeli
python3 -m http.server 8123              # http://localhost:8123 ve /en/ ve /privacy/ göz kontrolü
```
Kontrol listesi: ana sayfada iki ikon; ikona tıklayınca görsel şeridi açılıyor; TR/EN geçişi çalışıyor;
alt satırda Gizlilik + iki politika linki var; `/morse-flash/` ana sayfaya yönlendiriyor; 404 sayfası yeni tarzda.

## 3. Commit + push
```
git commit -m "Redesign: sketch theme, TR+EN only, remove Troy/Radar/ad rails"
git push origin main
```
GitHub Pages ~10 dk içinde yayınlar. Yayın sonrası https://troyapps.app/ , /en/ , /privacy/ , /morse-flash-policy/ , /airmousehand-policy/ , /app-ads.txt adreslerini aç, 200 döndüğünü gör.

## 4. Yayın sonrası (isteğe bağlı ama önerilir)
- **Morse Flash tam boy görseller:** cloud oturumu Play Store görsellerini ancak 720px genişlikte alabildi. Bu makinede engel yok:
  Play Store listesi https://play.google.com/store/apps/details?id=com.troyapps.morseflash&hl=tr sayfasındaki 8 dikey ekran görüntüsünü
  (`play-lh.googleusercontent.com/...`, sonuna `=w1080-h1920-rw` ekleyerek) indir, 720 veya 1080 genişlikte webp yap,
  `assets/img/shots/morse-flash/tr-1..8.webp` üzerine yaz (sıra: LED tabela, 13 stil, LED yazı tasarla, neon, bildirim flaşı, Morse, ritim, fener&SOS).
  `hl=en` listesinde İngilizce görseller varsa `en-1..8.webp` olarak ekle; üretici otomatik kullanır. Sonra `node scripts/build-pages.mjs` (görsel değişince HTML değişmez ama alışkanlık olsun) ve commit.
- Google Search Console'da eski dil adresleri 404/yönlendirme olarak görünecek; normal. Sitemap yeni: `/`, `/en/`, 3 politika.
- AdSense paneline dokunma; yükleyici betik yerinde, inceleme devam eder.

## Neler değişti (özet)
- Kaldırıldı: Troy 3D maskot (`assets/js/troy`, `assets/models`, `assets/vendor/three`), Radar (`radar/`, `scripts/radar*.mjs`, `.github/workflows/radar.yml`, `assets/data`), 7 dil (`ar de es fr hi id it pt-br` — artık yalnızca yönlendirme stub'u), eski tema CSS/JS, eski testler, eski fontlar.
- Eklendi: `content/` (metinler), `scripts/build-pages.mjs` (üretici), `assets/css/site.css`, `assets/js/site.js`, `assets/fonts/` (Space Mono, Archivo Black), `assets/img/shots/morse-flash/`, yeni `og-home.png`, `tests/site.test.mjs`, yönlendirme sayfaları.
- Korundu: `CNAME`, `ads.txt`, `app-ads.txt`, `robots.txt`, politika metinleri (yeni kabukta; Radar/Troy cümleleri çıkarıldı), favicon/ikonlar, `docs/superpowers` arşivi.
- Ayrıntı: `CLAUDE.md`.
