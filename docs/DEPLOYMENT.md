# Deployment

## Hedef Ortam

- Uygulama platformu: `Vercel`
- Veritabani/Auth: `Supabase`
- Zamanlanmis gorev: `Vercel Cron`
- Paket yoneticisi: `npm`

## Ortamlar

| Ortam | Amac | Not |
| --- | --- | --- |
| `local` | gelistirme | `.env.local` kullanir |
| `preview` | PR / branch onizleme | Vercel preview deployment |
| `production` | canli trafik | production environment variables gerekir |

## Kurulum Akisi

### 1. Supabase Hazirligi

1. Yeni Supabase projesi olusturun.
2. `supabase/migrations/` altindaki SQL dosyalarini sirasiyla uygulayin.
3. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` degerlerini alin.
4. `004_invoice_photos_storage.sql` ve `006_invoice_photos_private_bucket.sql` migration'larinin calistigini, `invoice-photos` bucket'inin olustugunu ve private oldugunu dogrulayin.

### 2. Vercel Kurulumu

1. Repository'yi Vercel'e baglayin.
2. Build command olarak `npm run build`, output olarak Next.js default ayarlarini kullanin.
3. Asagidaki environment variable'lari tanimlayin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `CRON_SECRET`
   - odeme ve mesajlasma entegrasyonlari icin gerekli diger sirlar

### 3. Cron Yapilandirmasi

`vercel.json` dosyasi her gun `06:00 UTC` zamaninda su endpoint'i tetikler:

```json
{
  "path": "/api/cron/check-reminders",
  "schedule": "0 6 * * *"
}
```

Uygulama tarafinda bu endpoint `Authorization: Bearer <CRON_SECRET>` bekler.

## CI/CD Onerisi

Minimum pipeline akisi:

1. `npm ci`
2. `npm run lint`
3. `npm run test`
4. `npm run build`
5. Preview deployment
6. Production promotion

## Ornek GitHub Actions Akisi

```yaml
name: ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Rollback Stratejisi

- Vercel tarafinda son saglikli deployment'a rollback yapin.
- Supabase migration rollback ihtiyaci icin ters migration script'i hazir tutun.
- Odeme ve reminder entegrasyonlarinda gizli anahtar degisikligi gerekiyorsa secret rotation uygulayin.

## Operasyonel Kontrol Listesi

- Production env degiskenleri eksiksiz mi?
- `NEXT_PUBLIC_SITE_URL` production domain ile uyumlu mu?
- `CRON_SECRET` production ortaminda tanimli mi?
- iyzico callback URL'i production domaine isaret ediyor mu?
- Reminder provider anahtarlari aktif mi?
- `invoice-photos` storage bucket'i ve policy'leri olustu mu?
- Cron secret dogru ve retry queue akislarini tetikleyebilecek durumda mi?

## Bilinen Riskler

- Payment callback ve cron endpoint'lerinin production secret'lari yanlis ise kritik akislar durur.
- Mesajlasma saglayicilari eksikse reminder sistemi yalnizca kismi/fallback modda calisir.
- Storage bucket migration'i eksikse fatura fotograf yukleme akisi calismaz.
- Reminder provider'lari timeout veya 5xx donerse sistem retry planlar; cron'un duzenli calismamasi bu retry'leri aksatir.
