# TahsilatCI

TahsilatCI, Turkiye'deki kucuk isletmeler ve sahada calisan esnaflar icin gelistirilmis bir fatura, tahsilat ve hatirlatma yonetim uygulamasidir. Uygulama; musteri kaydi, fatura takibi, manuel/otomatik hatirlatma, plan yonetimi ve temel dashboard analitiklerini tek bir panelde toplar.

## Rozetler

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4)
![Vitest](https://img.shields.io/badge/Vitest-4-729b1b)

## Proje Ozeti

- Landing page, blog, auth ve dashboard deneyimi `Next.js 16 App Router` ile sunulur.
- Kimlik dogrulama ve veritabani erisimi `Supabase Auth + Postgres + RLS` ile yonetilir.
- Fatura ve musteri islemleri API route'lari uzerinden yapilir.
- Hatirlatma akisi; manuel tetikleme, zamanlanmis cron ve kanal bazli teslimat soyutlamasi ile calisir.
- Plan ve odeme akisi `iyzico` tabanli checkout/callback yapisi ile genislemeye hazirdir.

## Teknoloji Stack'i

| Katman | Teknolojiler |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Recharts |
| Backend | Next.js Route Handlers, Supabase Server Client |
| Veri | Supabase Postgres, SQL migrations, Row Level Security |
| Test | Vitest |
| Deploy | Vercel, Vercel Cron |

## Kurulum

### 1. Prerequisites

- `Node.js 20+`
- `npm 10+`
- aktif bir `Supabase` projesi
- opsiyonel olarak `Docker` ve `Docker Compose`

### 2. Clone

```bash
git clone <repository-url>
cd proje-31
```

### 3. Install

```bash
npm install
```

### 4. Environment

`.env.example` dosyasini kopyalayip `.env.local` olusturun:

```bash
cp .env.example .env.local
```

Windows PowerShell kullaniyorsaniz:

```powershell
Copy-Item .env.example .env.local
```

### 5. Run

```bash
npm run dev
```

Uygulama varsayilan olarak `http://localhost:3000` adresinde calisir.

## Yararlı Komutlar

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Ortam Degiskenleri

| Degisken | Zorunlu | Aciklama |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet | Server-side admin islemleri icin service role key |
| `NEXT_PUBLIC_SITE_URL` | Evet | Uygulamanin public base URL'i |
| `CRON_SECRET` | Cron icin | `/api/cron/check-reminders` endpoint kimlik dogrulamasi |
| `NETGSM_USERCODE` | SMS icin | Netgsm kullanici kodu |
| `NETGSM_PASSWORD` | SMS icin | Netgsm sifresi |
| `NETGSM_HEADER` | SMS icin | Gonderici basligi |
| `RESEND_API_KEY` | E-posta icin | Resend API key |
| `RESEND_FROM_EMAIL` | E-posta icin | Gonderici e-posta adresi |
| `WHATSAPP_API_URL` | WhatsApp entegrasyonu icin | Provider endpoint URL'i |
| `WHATSAPP_API_KEY` | WhatsApp entegrasyonu icin | Provider API key |
| `IYZICO_API_KEY` | Odeme icin | iyzico API key |
| `IYZICO_SECRET_KEY` | Odeme icin | iyzico secret key |
| `IYZICO_BASE_URL` | Odeme icin | iyzico API base URL |
| `PAYMENT_CALLBACK_SECRET` | Callback icin onerilir | Payment callback imza/secret dogrulamasi |

Notlar:

- `SUPABASE_SERVICE_ROLE_KEY` istemci tarafina asla expose edilmemelidir.
- `PAYMENT_CALLBACK_SECRET` tanimli degilse callback dogrulama mekanizmasi `IYZICO_SECRET_KEY` fallback'i kullanir.
- WhatsApp, SMS ve e-posta saglayicilari eksikse uygulama degrade modda calisir; bazi reminder kanallari aktif teslimat yapmaz.

## Proje Yapisi

```text
project-root/
|-- src/
|   |-- app/                  # App Router sayfa ve API route'lari
|   |   |-- (auth)/
|   |   |-- (dashboard)/
|   |   |-- api/
|   |-- components/           # UI ve sayfa bilesenleri
|   |   |-- dashboard/
|   |   |-- landing/
|   |   |-- layout/
|   |   |-- ui/
|   |-- hooks/                # Custom hooks
|   |-- lib/                  # Domain/service/helper mantigi
|   |   |-- blog/
|   |   |-- dashboard/
|   |   |-- invoices/
|   |   |-- payments/
|   |   |-- profile/
|   |   |-- reminders/
|   |   |-- supabase/
|   |   |-- utils/
|   |-- types/                # TypeScript tipleri
|   |-- proxy.ts              # Next.js 16 proxy/session katmani
|-- docs/                     # Teknik dokumantasyon
|-- public/                   # Statik dosyalar
|-- supabase/migrations/      # SQL migration dosyalari
|-- .env.example
|-- .gitignore
|-- README.md
```

Not: Mevcut testler dosyalara yakin sekilde `src/**/*.test.ts` deseninde tutulur.

## Production Dosyalari

### Runtime icin gerekli

- `src/`
- `public/`
- `package.json`
- `next.config.ts`
- `vercel.json` (Vercel cron kullaniminda)
- ortam degiskenleri (`.env.local` yerine deployment secret'lari)

### Repoda kalmasi mantikli ama runtime zorunlu olmayanlar

- `supabase/`
- `docs/`
- `README.md`
- `.env.example`
- `.gitignore`
- `package-lock.json`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `vitest.config.mts`
- `components.json`

## API Endpoint Ozeti

| Method | Path | Aciklama |
| --- | --- | --- |
| `GET, POST` | `/api/customers` | Musteri listeleme ve olusturma |
| `GET, PUT, DELETE` | `/api/customers/[id]` | Tek musteri okuma, guncelleme, silme |
| `GET, POST` | `/api/invoices` | Fatura listeleme ve olusturma |
| `GET, PUT, DELETE` | `/api/invoices/[id]` | Tek fatura okuma, guncelleme, silme |
| `POST` | `/api/invoices/[id]/photo` | Fatura fotografi yukleme |
| `POST` | `/api/invoices/[id]/remind` | Manuel hatirlatma gonderme |
| `POST` | `/api/invoices/import` | Toplu fatura import |
| `GET, PUT` | `/api/settings/reminders` | Otomatik hatirlatma ayarlari |
| `GET, PUT` | `/api/settings/templates` | Mesaj sablonlari |
| `GET, PUT` | `/api/profile` | Profil okuma ve guncelleme |
| `POST` | `/api/profile/setup` | Ilk profil/bootstrap kurulumu |
| `POST` | `/api/payments/create-checkout` | Plan checkout baslatma |
| `GET, POST` | `/api/payments/callback` | Odeme callback/redirect |
| `GET` | `/api/cron/check-reminders` | Gunluk otomatik reminder cron'u |

Detayli API aciklamalari icin `docs/API.md` dosyasina bakin.

## Veritabani ve Migrasyonlar

- SQL migration dosyalari `supabase/migrations/` altindadir.
- Ana tablolar: `profiles`, `customers`, `invoices`, `reminders`, `payments`, `message_templates`, `referrals`, `reminder_settings`
- Tablolar `Row Level Security` ile kullanici bazli erisime kapatilmis durumdadir.
- Fatura fotografi akisi icin `invoice-photos` isimli Supabase Storage bucket'i migration'lar ile olusturulur ve private bucket + signed URL modeli ile kullanilir.

Detaylar icin `docs/DATABASE.md` dosyasina bakin.

## Dokumantasyon Haritasi

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATABASE.md`
- `docs/DEPLOYMENT.md`
- `docs/CONTRIBUTING.md`
- `docs/CHANGELOG.md`
- `docs/PRD.md`

## Katki Rehberi

1. Yeni branch acin: `feature/...`, `fix/...`, `refactor/...`
2. Kod degisikliklerinde mevcut naming ve folder convention'larina uyun
3. `npm run lint` ve `npm run test` komutlarini calistirin
4. Conventional Commits kullanin
5. Pull request acmadan once degisiklik ozetini ve risklerini yazin

Detayli surec icin `docs/CONTRIBUTING.md` dosyasina bakin.

## Lisans

Bu proje icin acik bir lisans dosyasi henuz eklenmemistir. Dagitim veya ticari kullanim karari verilmeden once bir `LICENSE` dosyasi eklenmesi onerilir.
