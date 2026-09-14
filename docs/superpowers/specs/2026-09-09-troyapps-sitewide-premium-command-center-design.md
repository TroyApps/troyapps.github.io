# TroyApps Site Geneli Premium Komuta Merkezi Tasarımı

**Tarih:** 9 Eylül 2026  
**Durum:** Görsel yön onaylandı; uygulama öncesi kullanıcı incelemesinde  
**Yayın ilkesi:** Yerel çalışma tamamlanıp kullanıcı onaylamadan commit veya push yapılmayacak

## 1. Amaç

TroyApps sitesinin tamamını siyah, koyu kırmızı ve sıcak beyaz tonlarında; teknoloji odaklı, premium ve kendine özgü bir “Komuta Merkezi” görünümüne taşımak.

Yeni tasarımın ilk izlenimi profesyonel ve güvenilir olacak. Troy maskotu, sinyal animasyonları ve oyun arayüzü detayları markaya karakter katacak ancak uygulamaları, Radar içeriğini ve temel gezinmeyi gölgelemeyecek.

## 2. Temel ilkeler

- Mevcut statik GitHub Pages mimarisi korunacak; yeni framework eklenmeyecek.
- Radar veri üretimi ve HTML enjeksiyon işaretleri değişmeyecek.
- Türkçe ve İngilizce sayfalar aynı yapısal sözleşmeyi koruyacak.
- Troy’un mevcut 3D modeli, animasyon klipleri, durum makinesi ve etkileşim mantığı korunacak.
- Yeni hareketler bilgiye erişimi engellemeyecek ve hareket azaltma tercihine uyacak.
- Gerçek üyelik sistemi hazır olmadan auth/giriş arayüzü gösterilmeyecek.
- Site kodu yayınlanmadan önce masaüstü, mobil ve bağlantı testleri yerelde tamamlanacak.

## 3. Kapsam

### 3.1 Yenilenecek sayfalar

- Türkçe ana sayfa: `/`
- İngilizce ana sayfa: `/en/`
- Türkçe Morse Flash: `/morse-flash/`
- İngilizce Morse Flash: `/en/morse-flash/`
- Türkçe Radar: `/radar/`
- İngilizce Radar: `/en/radar/`
- 404 sayfası
- Morse Flash gizlilik politikası
- Air Mouse Hand gizlilik politikası

### 3.2 Bu çalışmanın dışında kalanlar

- Gerçek kullanıcı hesabı ve oturum açma
- Google Auth
- Kullanıcı verisi saklama
- Analitik veya izleme sistemi
- Ödeme, abonelik ve hesap silme akışları
- Yeni Troy animasyonu veya yeni 3D ekipman üretimi
- Mevcut uygulamaların işlevsel kodlarında değişiklik

## 4. Seçilen görsel yön

Seçilen yön **Premium Komuta Merkezi** yaklaşımıdır.

Kurumsal iskelet temiz kalacak; kırmızı ışıklar, devre çizgileri, Morse/sinyal öğeleri ve Troy etkileşimleri kontrollü vurgu olarak kullanılacak. Eski TroyApps tasarımından fiziksel buton hissi, piksel/Morse akışı, belirgin çerçeveler ve etkileşimli kart enerjisi alınacak. Neon yeşil ve magenta yerine yeni kırmızı/siyah palete uyarlanacak.

### 4.1 Renk sistemi

- Ana arka plan: neredeyse siyah, sıcak alt tonlu
- Panel yüzeyi: siyaha yakın antrasit
- Ana vurgu: Troy kırmızısı
- İkincil vurgu: koyu bordo ve kırmızı parıltı
- Ana metin: sıcak beyaz
- İkincil metin: nötr sıcak gri
- Çizgiler: düşük opaklıklı beyaz veya koyu kırmızı

Renkler CSS özel değişkenleri olarak ortak tema dosyasında tanımlanacak. Sayfa dosyalarında doğrudan renk tekrarları en aza indirilecek.

### 4.2 Tipografi

- Büyük marka ve bölüm başlıklarında güçlü, yoğun bir sans serif kullanılacak.
- Uzun açıklamalar ve politika metinlerinde yüksek okunabilirlikli gövde yazısı kullanılacak.
- Terminal/Morse hissi yalnız küçük etiketler, sistem durumları ve dekoratif metinlerde kullanılacak.
- Eski sitenin piksel fontu uzun içerikte kullanılmayacak.

### 4.3 Kart ve buton dili

- Paneller ince çerçeveli, düşük parlaklıklı ve kontrollü gölgeli olacak.
- Birincil CTA kırmızı dolgulu; ikincil CTA koyu yüzeyli olacak.
- CTA’larda ayrı ikon bölmesi, alt derinlik gölgesi ve hafif tarama parlaması bulunacak.
- Hover durumunda buton hafif yükselir; basıldığında fiziksel olarak çöker.
- Klavye odağı renk ve kalınlık bakımından açıkça görünür olacak.

## 5. Ortak site kabuğu

### 5.1 Navbar

Masaüstü düzeni:

1. TroyApps marka işareti ve yazısı
2. Anasayfa
3. Uygulamalar
4. Radar
5. İletişim
6. Belirgin dil seçici

Dil seçici küre ikonlu, kırmızı çerçeveli ve `TR / EN` durumunu gösteren açılır menü olarak hazırlanacak. Aşağı oku korunacak; ileride yeni diller eklenebilecek. Mevcut iki dilde geçiş doğrudan ilgili dil sayfasına gider.

Mobilde ana bağlantılar menü düğmesi altında açılır. Dil kontrolü menünün içinde kaybolmayacak; menü başlığında veya üst satırda görünür kalacak.

### 5.2 Footer

Footer kompakt olacak ve şu bilgileri taşıyacak:

- TroyApps kısa marka açıklaması
- `info@troyapps.app`
- `support@troyapps.app`
- Google Play geliştirici vitrini
- YouTube, Instagram, TikTok ve Facebook bağlantıları
- Küçük yasal satırda “Gizlilik” bağlantısı
- Telif bilgisi

Gizlilik bağlantısı navbar veya ana içerikte öne çıkarılmayacak. Uygulamaya özel politikalar aktif, herkese açık ve doğrudan erişilebilir URL’lerde korunacak.

## 6. Ana sayfa tasarımı

### 6.1 Hero

Auth kartı kaldırılacak. Hero masaüstünde iki ana sütundan oluşacak:

- Sol: sistem durumu, büyük TROYAPPS başlığı, açıklama ve CTA’lar
- Sağ: daha büyük Troy sahnesi, konuşma alanı ve etkileşim kontrolleri

CTA sırası:

1. **Uygulama Envanteri** — sayfa içindeki envanter bölümüne gider
2. **Google Play’de Gör** — `https://play.google.com/store/apps/developer?id=Troy+Apps` adresini yeni sekmede açar

“Biz Kimiz” hero CTA’sı olmayacak; navbar ve ana içerik bölümünde kalacak.

Mobilde sıralama marka metni, CTA’lar, Troy sahnesi ve etkileşim paneli şeklinde dikey akacak.

### 6.2 Arka plan sinyali

Hero ve ana sayfa arka planında koyu kırmızı devre yolları bulunacak. Belirli aralıklarla kalp ritmini andıran bir darbe bu yolları kısa süre aydınlatacak.

Animasyon kuralları:

- Düşük hız ve düşük opaklık kullanılacak.
- Metin ve kontrollerin kontrastını düşürmeyecek.
- Sürekli parlama yerine aralıklı nabız davranışı kullanılacak.
- `prefers-reduced-motion: reduce` durumunda statik devre dokusuna dönüşecek.
- Mobilde çizgi ve parçacık sayısı azaltılacak.

### 6.3 Sinyal şeridi

Hero altında tam genişlikte kayan bir şerit bulunacak. Örnek içerikler:

- Sinyal akışı aktif
- Yeni araçlar yükleniyor
- Radar çevrimiçi
- Morse işaretleri ve kalp ritmi sembolleri

Metin iki kopyalı kesintisiz marquee tekniğiyle akar. Hareket azaltma tercihinde animasyon durur; metin yine okunabilir kalır.

### 6.4 Ana içerik oranları

Masaüstünde tek satır:

- Uygulama Envanteri: `%40`
- Radar: `%35`
- Biz Kimiz: `%25`

Mobil sıralama:

1. Uygulama Envanteri
2. Radar
3. Biz Kimiz

Radar ve Biz Kimiz kartları ana sayfada özet gösterir; ayrıntılar kendi sayfalarında veya ilgili bölümde devam eder.

## 7. Uygulama Envanteri

Seçilen düzen **simge dok’u + seçili uygulama detayı** yaklaşımıdır.

- Küçük uygulama simgeleri yatay olarak yan yana dizilir.
- Morse Flash ilk aktif öğedir.
- Kullanıcı bir simgeyi seçtiğinde kısa açıklama ve uygulama bağlantısı aynı kartın alt bölümünde güncellenir.
- Henüz yayınlanmamış yerler sade “yakında” yuvaları olarak gösterilebilir; yanıltıcı indirme butonu kullanılmaz.
- Uygulama sayısı kart genişliğini geçtiğinde raf yatay kaydırılır; sayfa yüksekliği büyümez.
- Klavye yön tuşları ve Tab ile uygulama seçimi yapılabilir.
- Yeni uygulama çıktığında Türkçe ve İngilizce ana sayfa listelerine simge, isim, kısa açıklama ve bağlantı eklenir.

İlk sürümde uygulama verisi mevcut statik HTML içinde tutulacak. Uygulama sayısı yönetimi zorlaştıracak seviyeye ulaştığında ortak veri dosyası ve üretim adımı ayrıca tasarlanacak; bu sürümde gereksiz veri katmanı eklenmeyecek.

## 8. Troy sahnesi ve kontroller

### 8.1 Korunacak mevcut davranışlar

- Dürtme tepki kademeleri
- Bazuka nişan alma, roket uçuşu, patlama ve piksel dağılması
- Kırbaç tepki kademeleri ve üçüncü vuruşta savunma/yakalama
- Piksel hâlindeyken konuşma ve tıklayarak yeniden birleşme
- Konuşma metinlerinin parçacıklı giriş/çıkışı
- Kuyruk yayı ve boşta sekme
- Komut menüsü yönlendirmeleri

### 8.2 Yeni kontrol görünümü

Kontroller aynı fiziksel komuta paneli içinde dört düğme olarak kalacak:

1. Dürt
2. Bazuka
3. Kırbaç
4. Komut Ver

Seçili araç kırmızı dolgu ve parlama ile gösterilecek. Diğer araçlar koyu yüzeyli kalacak. Mobilde panel `2 × 2` düzene inecek ve metin etiketleri korunacak.

### 8.3 Ekipman ikonları

Çizgi ikonları kullanılmayacak.

- Bazuka ikonu mevcut `bazooka.glb` modelinden üretilecek.
- Kırbaç ikonu mevcut `whip.glb` modelinden üretilecek.
- İki model aynı kamera, ışık ve kırmızı/siyah arka plan varsayımıyla şeffaf WebP olarak dışa aktarılacak.
- Buton içinde ek Three.js sahnesi çalıştırılmayacak.
- Ana animasyonda gerçek GLB modelleri kullanılmaya devam edecek.

Bu yöntem ekipmanın buton ve animasyon görünümünü aynı tutarken GPU ve bellek maliyetini düşük tutar.

### 8.4 Komut menüsü

Komut Ver düğmesi mevcut hedefleri korur:

- Uygulamaları göster
- Radar’a götür
- Biz kimiz?
- İletişimi aç

Menü yeni panel dilinde açılır; klavye ile erişilebilir olur ve dışarı tıklama veya Escape ile kapanır.

## 9. İkincil sayfalar

### 9.1 Morse Flash

Morse Flash sayfaları ortak navbar/footer ve yeni tasarım değişkenlerini kullanacak. Ürün sayfası şu hiyerarşiyi koruyacak:

1. Uygulama adı ve net değer önerisi
2. Google Play CTA’sı
3. Özellikler
4. Uygulama ekran görüntüleri
5. Kullanım veya güven açıklamaları
6. İletişim ve gizlilik bağlantısı

Mevcut uygulama bağlantıları, ekran görüntüleri ve içerik kaybolmayacak. Ürün sayfasında Troy isteğe bağlı küçük yönlendirici olarak kullanılabilir; ana sayfadaki tam etkileşim paneli tekrarlanmayacak.

### 9.2 Radar

Radar sayfaları ortak tema içinde veri yoğun, okunabilir bir kontrol paneli gibi görünecek.

Korunacak sözleşmeler:

- `<!-- RADAR:START -->`
- `<!-- RADAR:END -->`
- `<!-- RADARBOX:START -->`
- `<!-- RADARBOX:END -->`
- `scripts/radar.mjs` üretim ve enjeksiyon akışı
- Günlük JSON arşivleri
- Türkçe ve İngilizce render çıktıları

Yeni CSS, scriptin ürettiği mevcut sınıfları destekleyecek. Render scriptinin beklediği HTML sınırları değiştirilmeden görsel kabuk yenilenecek.

### 9.3 404

404 sayfası ortak marka kabuğunu kullanacak. Kısa bir hata mesajı, ana sayfa ve uygulamalar bağlantısı bulunacak. Tam Troy etkileşim sistemi yüklenmeyecek; hafif bir görsel veya poster kullanılabilir.

### 9.4 Gizlilik sayfaları

Politika içerikleri hukuki anlamı değiştirecek şekilde yeniden yazılmayacak.

- Ortak logo, renkler, navbar ve kompakt footer kullanılacak.
- Okuma genişliği sınırlı tutulacak.
- Arka plan hareketleri kaldırılacak veya statik olacak.
- Troy animasyonu yüklenmeyecek.
- Sayfa JavaScript kapalıyken de tamamen okunabilir olacak.

## 10. Teknik mimari

### 10.1 Dosya katmanları

Önerilen yapı:

```text
assets/
├── css/
│   ├── site.css                  # mevcut temel ve eski sayfalar
│   ├── theme-v3.css              # ortak renk, tipografi, navbar, footer, düğmeler
│   ├── home-v3.css               # ana sayfa ve Troy yerleşimi
│   ├── product-v3.css            # uygulama ve politika sayfaları
│   └── radar-v3.css              # Radar'a özel veri kartları
├── img/
│   └── troy/
│       └── controls/
│           ├── bazooka.webp
│           └── whip.webp
└── js/
    ├── site.js                   # mevcut ortak menü/reveal davranışları
    ├── home-v3.js                # envanter seçimi, dil menüsü, sinyal/ticker durumu
    └── troy/                     # mevcut Troy modülleri
```

`theme-v3.css` yalnız yeni temanın ortak sözleşmesini taşır. Ana sayfa, ürün ve Radar farklı sorumluluklara sahip dosyalarda kalır. `home-v3.js`, Troy durum makinesini kopyalamaz veya yönetmez; yalnız ana sayfanın Troy dışındaki etkileşimlerinden sorumludur.

### 10.2 Sayfa ağacı

```text
SiteShell
├── SkipLink
├── GlobalHeader
│   ├── Brand
│   ├── PrimaryNavigation
│   ├── LanguageMenu
│   └── MobileMenuToggle
├── PageMain
│   ├── HomePage
│   │   ├── CommandHero
│   │   │   ├── HeroCopy
│   │   │   ├── HeroActions
│   │   │   └── TroyStage
│   │   │       ├── TroyCanvasOrPoster
│   │   │       ├── TroyDialogue
│   │   │       └── TroyControlPanel
│   │   ├── SignalTicker
│   │   └── HomeDashboard
│   │       ├── AppInventory
│   │       ├── RadarSummary
│   │       └── AboutSummary
│   ├── ProductPage
│   ├── RadarPage
│   ├── PolicyPage
│   └── NotFoundPage
└── GlobalFooter
```

Bu statik HTML projesinde “component” sınırları framework componentleri değil, aynı sınıf ve veri sözleşmesini kullanan semantik HTML bloklarıdır.

## 11. Durum ve veri akışları

### 11.1 Dil

Dil seçimi runtime çeviri yapmayacak. Kullanıcı doğrudan diğer dildeki eş URL’ye yönlendirilecek. Yeni diller eklendiğinde dil menüsüne yeni bağlantı ve ilgili statik sayfa eklenir.

### 11.2 Envanter

Her uygulama öğesi simge, ad, açıklama ve hedef bağlantıyı kendi HTML veri niteliklerinde taşır. `home-v3.js` yalnız seçili öğeyi ve detay panelini günceller. JavaScript çalışmazsa ilk uygulama bilgisi ve bütün uygulama bağlantıları HTML içinde erişilebilir kalır.

### 11.3 Radar

Radar verisi mevcut Node scriptleriyle oluşturulur. Ana sayfa ve Radar sayfalarındaki işaretli alanlar script tarafından güncellenir. Yeni tema bu çıktıların çevresindeki kabuğu ve sınıf görünümlerini sağlar; verinin kaynağına veya üretim zamanlamasına müdahale etmez.

### 11.4 Troy

Troy kontrolü mevcut `troy-controller.js` üzerinden devam eder. Yeni markup, mevcut `data-troy-*` niteliklerini korur. Görsel tema bu veri durumlarını seçili düğme, efekt ve panel görünümüne dönüştürür.

## 12. Hata ve fallback davranışları

- WebGL açılamazsa Troy poster görseli gösterilir.
- GLB yüklenemezse sayfa ve bütün CTA’lar çalışmaya devam eder.
- Troy modülü hata verirse uygulama, Radar, dil ve iletişim bağlantıları etkilenmez.
- JavaScript kapalıysa navbar bağlantıları, ilk envanter öğesi, Radar içeriği ve politika metinleri erişilebilir kalır.
- Güncel Radar verisi bulunamazsa repodaki son üretilmiş HTML görünür.
- Şeffaf ekipman ikonları yüklenemezse düğme metni kontrolün ne olduğunu anlatmaya devam eder.
- Hareket azaltma tercihinde ticker, devre darbesi, hover tilt ve dekoratif parçacıklar durur.

## 13. Responsive yaklaşım

### Masaüstü

- Hero iki sütun
- Ana içerik `%40 / %35 / %25`
- Troy araçları tek satırda dört düğme

### Tablet

- Hero iki sütunda kalabildiği sürece korunur
- Daraldığında Troy ikinci satıra iner
- İçerik `Envanter + Radar` ve ardından `Biz Kimiz` düzenine geçebilir

### Mobil

- Tek sütun akış
- CTA’lar tam genişlik veya iki eşit düğme
- Troy paneli `2 × 2`
- Envanter simgeleri yatay kaydırılabilir
- Radar özetleri kısa tutulur
- Dil kontrolü menünün üst kısmında görünür kalır

## 14. Erişilebilirlik ve performans

- Renk tek başına durum bildirmeyecek; seçili kontrol `aria-pressed` ile işaretlenecek.
- Açılır menüler `aria-expanded`, Escape ve odak yönetimini destekleyecek.
- Canvas ve dekoratif SVG’ler yardımcı teknolojilerden gizlenecek.
- Konuşma metinleri erişilebilir DOM içinde kalacak.
- Metin ve arka plan kontrastı okunabilir düzeyde tutulacak.
- Sayfada yalnız bir ana Three.js Troy sahnesi çalışacak.
- Ekipman düğmeleri statik WebP kullanacak.
- DPR üst sınırı ve mevcut parçacık bütçeleri korunacak.
- Görünmeyen ağır animasyonlar duraklatılacak.
- Font ve kritik görseller yerel kalacak.

## 15. Test ve doğrulama

### Otomatik kontroller

- Türkçe ve İngilizce yapı eşitliği
- Ortak navbar/footer bağlantıları
- Google Play geliştirici vitrini bağlantısı
- Bütün sosyal bağlantılar ve e-posta adresleri
- Gizlilik sayfalarının doğrudan erişilebilir olması
- Radar işaretlerinin tam ve tekil kalması
- Radar dry-run enjeksiyonu
- Troy `data-*` sözleşmesinin korunması
- Auth formu, veri toplama veya giriş kodu bulunmaması
- Kullanılan bütün yerel varlıkların dosya ağacında bulunması
- CSS/JS sözdizimi ve `git diff --check`

### Canlı yerel kontroller

- Ana sayfa: geniş masaüstü, tablet ve mobil
- Menü ve dil seçici
- Envanter seçimi
- Google Play ve sayfa içi CTA’lar
- Troy’un dört aracı ve komut menüsü
- Radar ana sayfa özeti ve tam sayfa
- Morse Flash içerik ve ekran görüntüleri
- 404 ve politika sayfaları
- Hareket azaltma modu
- Tarayıcı hata/uyarı kayıtları

## 16. Uygulama fazları

### Faz 1 — Ortak tasarım sistemi

- Tema değişkenleri
- Tipografi
- Kartlar ve fiziksel butonlar
- Navbar, mobil menü ve dil seçici
- Kompakt footer

### Faz 2 — Ana sayfa

- İki sütunlu Premium Komuta Merkezi hero’su
- Google Play CTA’sı
- Devre/kalp ritmi arka planı
- Kayan sinyal şeridi
- Envanter, Radar ve Biz Kimiz yerleşimi

### Faz 3 — Troy tema entegrasyonu

- Mevcut sahnenin yeni hero’ya taşınması
- Kontrol düğmelerinin yeni görünümü
- GLB kaynaklı bazuka ve kırbaç WebP ikonları
- Mobil `2 × 2` kontrol düzeni

### Faz 4 — İkincil sayfalar

- Morse Flash TR/EN
- Radar TR/EN
- 404
- Gizlilik sayfaları

### Faz 5 — Responsive, erişilebilirlik ve performans

- Tablet ve mobil düzenler
- Klavye/odak davranışları
- Hareket azaltma
- Animasyon ve görsel bütçe ayarları

### Faz 6 — Yerel final kontrolü

- Otomatik testler
- Canlı tarayıcı akışları
- Bağlantı ve locale kontrolleri
- Kullanıcı görsel incelemesi
- Kullanıcı onayından sonra commit/push kararı

## 17. Tamamlanma ölçütleri

Çalışma aşağıdaki koşullar sağlandığında uygulama açısından tamamlanmış sayılır:

- Bütün kapsam sayfaları aynı Premium Komuta Merkezi tasarım sisteminde görünür.
- Ana sayfa onaylanan hero, sinyal, envanter ve Troy kontrol düzenini taşır.
- Auth veya sahte giriş kontrolü görünmez.
- Google Play ve sosyal bağlantılar çalışır.
- Radar üretim ve enjeksiyon akışı bozulmaz.
- Türkçe ve İngilizce sayfalar yapısal olarak eşleşir.
- Politika içerikleri okunabilir ve doğrudan erişilebilir kalır.
- Troy’un mevcut onaylı davranışları regresyona uğramaz.
- Mobil ve masaüstü canlı kontrolleri geçer.
- Otomatik testler ve tarayıcı hata kontrolü temizdir.
- Commit veya push yalnız kullanıcının son onayından sonra yapılır.
