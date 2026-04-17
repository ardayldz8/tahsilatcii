# TahsilatCI - Esnaf Fatura Hatirlatma SaaS

## Urun Vizyonu

**Tek cumle:** Turkiye'deki esnaflar icin "fatura gonder, gerisi otomatik" odeme takip sistemi.

**Problem:** Tesisatci, elektrikci, boyaci gibi esnaflar is bitince fatura kesiyor ama takip etmeyi unutuyor. Musteri odememezlik degil, hatirlatma olmadigindan odeme gecikiyor. Esnaf bir sonraki ise gidince tahsilat unutuluyor, nakit akisi bozuluyor.

**Cozum:** Esnaf fatura bilgisini girer, sistem otomatik olarak WhatsApp + SMS ile musteriye hatirlatma gonderir. Basit bir dashboardda kimin odedigini, kimin odemedigini gorur.

---

## Hedef Kitle

- Tesisatci, elektrikci, boyaci, klima teknisyeni, oto tamircisi
- 1-10 calisanli kucuk esnaf isletmeleri
- Turkiye genelinde ~250.000 hedef isletme
- Dijitallesme orani dusuk (%20-30), buyuk firsat

---

## Rekabet Avantajlari

1. **Fiyat:** Rakiplerin 1/3-1/4 fiyatinda (99-199 TL/ay vs 300-640 TL/ay)
2. **Sadelik:** Muhasebe programi degil, tek is yapar: odeme tahsil eder
3. **WhatsApp-First:** TR'de %90+ WhatsApp penetrasyonu, ana kanal olarak kullanim
4. **Mobil-First:** Esnaf sahada, telefondan kullanir
5. **Esnaf Dili:** Teknik jargon yok, herkesin anladigi dil

---

## Teknoloji Stack'i

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Veritabani:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Depolama:** Supabase Storage
- **Mesajlasma:** WhatsApp Business API + Netgsm SMS + Resend Email
- **Odeme:** iyzico Abonelik
- **Kuyruk:** Upstash Queue
- **Deploy:** Vercel
- **Dil:** TypeScript

---

## Faz Plani

### FAZ 1: Temel MVP (Hafta 1-2)
- [x] Proje kurulumu (Next.js 15 + Supabase + Tailwind + shadcn/ui)
- [x] Supabase Auth ile kayit/giris (telefon + e-posta)
- [x] Musteri yonetimi CRUD (isim, telefon, e-posta)
- [x] Fatura olusturma formu (tutar, vade tarihi, not, musteri secimi)
- [x] Fatura listesi dashboard (odenmis/odenmemis/vadesi gecmis filtreleri)
- [x] Manuel "Hatirlatma Gonder" butonu (tek tikla WhatsApp linki)
- [x] Responsive/mobil-first tasarim
- [ ] Vercel deploy

### FAZ 2: Otomatik Hatirlatma Motoru (Hafta 3-4)
- [x] Hatirlatma kurallari motoru (vade oncesi/gunu/sonrasi + 2. hatirlatma)
- [x] Vercel Cron ile zamanlanmis gonderim (her gun 09:00)
- [x] Hatirlatma gecmisi sayfasi (/hatirlatmalar)
- [x] Hatirlatma ayarlari (zamanlama, kanallar, ozel mesaj sablonlari)
- [x] Mesajlasma altyapisi (WhatsApp/SMS/Email abstraction)
- [x] WhatsApp link-based hatirlatma (Business API hazir, key bekleniyor)
- [x] Netgsm SMS API entegrasyonu (key bekleniyor)
- [x] Resend e-posta entegrasyonu (key bekleniyor)

### FAZ 3: Odeme ve Abonelik (Hafta 5)
- [x] iyzico abonelik entegrasyonu (REST API ile Checkout Form)
- [x] Fiyatlandirma planlari sayfasi (Ucretsiz / Esnaf 99TL / Usta 199TL)
- [x] Plan limitleri kontrolu (musteri siniri, hatirlatma siniri)
- [x] Abonelik bilgi bileseni (dashboard'da kullanim durumu)
- [x] Odeme callback ve plan guncelleme API'leri
- [x] Payments tablosu ve RLS politikalari

### FAZ 4: Gelismis Ozellikler (Hafta 6-7)
- [x] Dashboard analitikleri (aylik gelir grafigi, fatura durum pastasi, tahsilat orani, en buyuk musteriler)
- [x] Fatura fotografi yukleme (Supabase Storage, kamera + dosya destegi)
- [x] Toplu fatura girisi (CSV import, musteri eslestirme, onizleme + dogrulama)
- [x] Ozellestirilabilir mesaj sablonlari (5 hatirlatma tipi, degisken ekleme, varsayilana don)

### FAZ 5: Buyume (Hafta 8+)
- [x] SEO-optimized landing page (JSON-LD, OpenGraph, sosyal kanit, SSS, testimonials)
- [x] Blog altyapisi (3 SEO makale, statik olusum, article schema)
- [x] Referans sistemi (davet linki, odul takibi, WhatsApp paylasim)
- [x] sitemap.xml ve robots.txt (otomatik olusum)
- [ ] Reklam kampanyalari (Google Ads, Facebook - deploy sonrasi)

---

## Veritabani Semasi

### users
- id (uuid, PK)
- email (string)
- phone (string)
- full_name (string)
- business_name (string)
- business_type (enum: tesisatci, elektrikci, boyaci, klimaci, diger)
- plan (enum: free, esnaf, usta)
- created_at (timestamp)
- updated_at (timestamp)

### customers
- id (uuid, PK)
- user_id (uuid, FK -> users)
- name (string)
- phone (string)
- email (string, nullable)
- address (string, nullable)
- notes (string, nullable)
- total_debt (decimal, default 0)
- created_at (timestamp)
- updated_at (timestamp)

### invoices
- id (uuid, PK)
- user_id (uuid, FK -> users)
- customer_id (uuid, FK -> customers)
- invoice_no (string)
- amount (decimal)
- due_date (date)
- status (enum: pending, paid, overdue, cancelled)
- notes (string, nullable)
- photo_url (string, nullable)
- paid_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)

### reminders
- id (uuid, PK)
- invoice_id (uuid, FK -> invoices)
- channel (enum: whatsapp, sms, email)
- status (enum: pending, sent, delivered, failed)
- message (string)
- sent_at (timestamp, nullable)
- delivered_at (timestamp, nullable)
- created_at (timestamp)

### subscriptions
- id (uuid, PK)
- user_id (uuid, FK -> users)
- plan (enum: free, esnaf, usta)
- status (enum: active, cancelled, past_due)
- iyzico_subscription_id (string, nullable)
- current_period_start (timestamp)
- current_period_end (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

---

## Fiyatlandirma

| Plan | Fiyat | Musteriler | Hatirlatma | Kanallar |
|------|-------|-----------|------------|----------|
| Ucretsiz | 0 TL | 3 | 10/ay | WhatsApp link |
| Esnaf | 99 TL/ay | 25 | Sinirsiz | WhatsApp + SMS |
| Usta | 199 TL/ay | Sinirsiz | Sinirsiz | Tumu + Raporlar |

---

## Dosya Yapisi

```
src/
  app/
    (auth)/giris/          - Login
    (auth)/kayit/          - Register
    (dashboard)/panel/     - Ana dashboard
    (dashboard)/faturalar/ - Fatura yonetimi
    (dashboard)/musteriler/- Musteri yonetimi
    (dashboard)/hatirlatmalar/ - Hatirlatma gecmisi
    (dashboard)/fiyatlandirma/ - Plan secimi ve odeme
    (dashboard)/ayarlar/   - Profil ayarlari
    api/                   - API routes
    layout.tsx
    page.tsx               - Landing page
  components/
    ui/                    - shadcn/ui
    dashboard/             - Dashboard bilesenler
    forms/                 - Form bilesenler
    layout/                - Layout (sidebar, header)
  lib/
    supabase/              - Supabase client/server
    messaging/             - WhatsApp/SMS/Email
    payments/              - iyzico + plan yonetimi
    utils/                 - Yardimci fonksiyonlar
  types/                   - TypeScript tipleri
  hooks/                   - Custom hooks
```
