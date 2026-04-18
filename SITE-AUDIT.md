# Site Audit — TODO

> Siteyi sistematik olarak tarayarak çıkan eksikler. Önceliğe göre sıralanmış.

---

## 🔴 Yüksek Öncelik

- [ ] **Türkçe karakter tutarsızlığı** — 20 dosyada 83+ yerde ASCII yaklaşım kullanılmış, profesyonel durmuyor
  - [ ] `src/components/landing/navbar.tsx` → `Ozellikler / Nasil Calisir / Giris Yap / Ucretsiz Basla` → `Özellikler / Nasıl Çalışır / Giriş Yap / Ücretsiz Başla`
  - [ ] `src/components/landing/hero.tsx` → `Tesisatci, elektrikci, boyaci... Isini yap... Musteri hatirlatmalarini` → proper Türkçe
  - [ ] `src/components/landing/faq.tsx` → `Verilerim guvenli mi? / Planimi istedigim zaman degistirebilir miyim?`
  - [ ] `src/components/landing/final-cta.tsx` → `Odeme takibini otomatiklestirin / Ucretsiz baslayin`
  - [ ] `src/components/landing/footer.tsx` → ASCII ifadeler
  - [ ] `src/components/landing/dashboard-mockup.tsx` → `Tumu / Odendi / Gecikti` → `Tümü / Ödendi / Gecikti`
  - [ ] `src/app/(auth)/giris/page.tsx` → `Sifre / Giris / Hesabiniza giris yapin / Hesabiniz yok mu / Ucretsiz kayit olun`
  - [ ] `src/app/(auth)/kayit/page.tsx` → `Isletme Adi / Meslek seciniz / Ucretsiz Kayit Ol / Zaten hesabiniz var mi`
  - [ ] `src/app/(auth)/sifre-sifirla/page.tsx` → `Sifre Sifirla / Sifirlama Baglantisi Gonder / Giris sayfasina don`
  - [ ] `src/components/dashboard/*.tsx` → `Musteri / Iptal / Sifre` vb.
  - [ ] `src/components/layout/dashboard-sidebar.tsx`
  - [ ] `src/app/(dashboard)/musteriler/page.tsx`
  - [ ] `src/app/blog/page.tsx` ve `src/app/blog/[slug]/page.tsx`

- [ ] **Error boundary yok** — Veri çekme hatası olursa default Next.js error page görünüyor
  - [ ] `src/app/error.tsx` oluştur (root error boundary)
  - [ ] `src/app/not-found.tsx` oluştur (404 sayfası)
  - [ ] `src/app/(dashboard)/error.tsx` oluştur (dashboard için özel hata sayfası)

- [ ] **Stats strip navbar altında kırpılıyor** — Sticky header (z-50) stats'ın üst kısmını kapatıyor
  - [ ] `src/components/landing/stats-strip.tsx` → `pt-` arttır veya scroll-padding ekle

---

## 🟡 Orta Öncelik

- [ ] **Framer-motion animasyon takılması** — Hızlı scroll'da testimonials/FAQ bir an boş kalıp sonra doluyor
  - [ ] `viewport={{ once: true, amount: 0.1 }}` → `amount: 0` yap veya `initial={false}` ekle

- [ ] **Üretim kodunda console.warn** — Gerçek logger'a geçir
  - [ ] `src/lib/invoices/photos.ts:94`
  - [ ] `src/app/api/invoices/[id]/photo/route.ts:133`

- [ ] **SEO metadata eksik** — Sadece root layout'ta metadata var
  - [ ] `src/app/(auth)/giris/page.tsx` → `export const metadata` ekle
  - [ ] `src/app/(auth)/kayit/page.tsx` → metadata
  - [ ] `src/app/(auth)/sifre-sifirla/page.tsx` → metadata
  - [ ] `src/app/(dashboard)/panel/page.tsx` → metadata
  - [ ] `src/app/(dashboard)/musteriler/page.tsx` → metadata
  - [ ] `src/app/(dashboard)/faturalar/page.tsx` → metadata
  - [ ] `src/app/(dashboard)/hatirlatmalar/page.tsx` → metadata
  - [ ] `src/app/(dashboard)/ayarlar/page.tsx` → metadata

- [ ] **Aria-label eksik** — Icon-only button'lar ekran okuyucularla anlaşılmıyor
  - [ ] `src/components/dashboard/customers-page-client.tsx` → MoreVertical, Search icon buttonları
  - [ ] `src/components/dashboard/invoice-dialogs.tsx`
  - [ ] Navbar mobil menü button'u

- [ ] **Mobil menüde Türkçe tutarsızlık** — Mobil menüde "Ucretsiz Basla" (ASCII), hemen altındaki hero'da "Ücretsiz Başla" (proper) — Türkçe fix'le birlikte çözülür

- [ ] **Form validasyonları eksik**
  - [ ] `NewInvoiceDialog` → vade tarihi bugünden öncesi girilememeli
  - [ ] `CustomerForm` → email formatı validasyonu yok
  - [ ] `NewInvoiceDialog` → tutar negatif/0 olamaz kontrolü

---

## 🟢 Düşük Öncelik (Polish)

- [ ] **`/sw.js` 404** — Stale service worker referansı, `public/`'te sw.js yok ama browser istiyor
  - [ ] `layout.tsx`'te serviceWorker register kodu var mı kontrol et, yoksa public/'e boş sw.js koy

- [ ] **Hardcoded pixel width'ler** — Tailwind size class'larına çevrilebilir
  - [ ] `src/components/landing/how-it-works.tsx:57` → `w-[600px] h-[600px]`
  - [ ] `src/components/landing/how-it-works.tsx:133` → `w-[96px] h-[96px]`
  - [ ] `src/components/landing/pricing.tsx:108-109` → `w-[400px] h-[400px]`

- [ ] **Dead code** — Kullanılmayan legacy fonksiyonlar
  - [ ] `src/lib/dashboard/overview.ts:220` → `getCachedDashboardOverview()` artık hiç import edilmiyor, silinebilir

- [ ] **Testimonial metin hatası** — `src/components/landing/testimonials.tsx` → `"defterime yazardım,çoğu zaman"` — virgülden sonra boşluk yok

- [ ] **Environment variable validation** — Non-null assertion yerine runtime check
  - [ ] `src/lib/supabase/server.ts:8-9` → `process.env.NEXT_PUBLIC_SUPABASE_URL!`
  - [ ] `src/lib/supabase/client.ts:5-6` → aynı pattern

- [ ] **`data-scroll-behavior="smooth"`** — Next.js 16 warning, `<html>` tag'e ekle

- [ ] **Next.js 16 uyarıları** — Console'daki kalan deprecation warning'ler için nodemodules docs kontrol

---

## ✅ İyi Durumda Olanlar

- Mobile responsive çalışıyor, menü doğru açılıyor
- Navigasyon hızı (hoisted shell sonrası) 170-250ms warm
- Landing görsel tasarım (how-it-works + pricing) yenilendi
- Horizontal overflow yok (1440px-375px arası)
- Landing'de 404 link yok
- Meta tags (title/description/og) root layout'ta tamam
- Hydration mismatch auth sayfalarında `suppressHydrationWarning` ile toleranslı

---

## 📝 Önceki Bekleyen İşler (session summary'den)

- [ ] Eski Seoul Supabase projesini sil (`slwynizpqypzcpwzcqcv`) — aylık faturalamayı durdur
- [ ] Hassas token'ları rotate et: eski PAT, eski service_role key'leri, CRON_SECRET
- [ ] `/faturalar`, `/musteriler`, `/hatirlatmalar` sayfalarına Suspense streaming pattern'i uygulama (performans iyileştirmesi için)
