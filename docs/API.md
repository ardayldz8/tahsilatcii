# API

## Genel Kurallar

- Taban prefix: `/api`
- Cogu endpoint Supabase session gerektirir.
- Yanitlar `JSON` formatindadir; odeme callback GET akisi redirect doner.
- Validation, auth ve business rule hatalari ortak response formati ile doner.

## Standart Hata Formati

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "path": "amount",
      "message": "amount must be greater than 0"
    }
  ]
}
```

- `error`: kullaniciya veya istemciye donen insan-okunur mesaj
- `code`: makine tarafinda islenebilir hata tipi
- `details`: validation veya business rule ayrintilari

Sik kullanilan kodlar:

- `VALIDATION_ERROR`
- `INVALID_JSON`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `INTERNAL_ERROR`

## Authentication

### `GET, PUT /api/profile`

- Amac: aktif kullanici profilini okumak ve guncellemek
- Auth: gerekli
- Request body (`PUT`): `full_name`, `phone`, `business_name`, `business_type`
- Response: profil nesnesi

### `POST /api/profile/setup`

- Amac: onboarding veya fallback senaryosunda profil kaydi olusturmak/guncellemek
- Auth: route icinde session kontrolu zorunlu degil; body tabanli setup yapar
- Request body: `user_id`, `email`, opsiyonel `full_name`, `phone`, `business_name`, `business_type`, `referred_by`
- Response:

```json
{
  "success": true
}
```

## Customers

### `GET /api/customers`

- Amac: kullanicinin musterilerini listelemek
- Auth: gerekli
- Query:
  - `compact=1`: hafif listeleme
- Response: musteri dizisi

### `POST /api/customers`

- Amac: yeni musteri olusturmak
- Auth: gerekli
- Body:

```json
{
  "name": "Ali Veli",
  "phone": "+905551112233",
  "email": "ali@example.com",
  "address": "Istanbul",
  "notes": "Oncelikli musteri"
}
```

- Response: olusturulan musteri nesnesi

### `GET, PUT, DELETE /api/customers/[id]`

- Amac: tek musteri kaydi ile calismak
- Auth: gerekli
- Path param: `id`
- Body (`PUT`): `name`, `phone`, `email`, `address`, `notes`
- Response:
  - `GET`: musteri nesnesi
  - `PUT`: guncellenen musteri
  - `DELETE`: `{ "success": true }`

## Invoices

### `GET /api/invoices`

- Amac: faturalarin filtreli listesi
- Auth: gerekli
- Query:
  - `status`: `pending | paid | overdue | cancelled`
  - `limit`: sonuc limiti
  - `compact=1`: hafif listeleme

### `POST /api/invoices`

- Amac: yeni fatura olusturmak
- Auth: gerekli
- Body:

```json
{
  "customer_id": "uuid",
  "amount": 2500,
  "due_date": "2026-04-30",
  "notes": "Montaj sonrasi odeme"
}
```

- Response: olusturulan fatura ve iliskili musteri ozeti

### `GET, PUT, DELETE /api/invoices/[id]`

- Amac: tek fatura uzerinde CRUD islemleri
- Auth: gerekli
- Path param: `id`
- Body (`PUT`): `status`, `notes`, `photo_url`, `amount`, `due_date`
- Response:
  - `GET`: fatura nesnesi
  - `PUT`: guncellenen fatura
  - `DELETE`: `{ "success": true }`

### `POST /api/invoices/[id]/photo`

- Amac: fatura fotografini yuklemek ve `photo_url` alanini guncellemek
- Auth: gerekli
- Path param: `id`
- Content-Type: `multipart/form-data`
- Form field: `file`
- Kurallar:
  - yalnizca `image/*`
  - maksimum `5 MB`
- Response:

```json
{
  "photo_url": "https://..."
}
```

### `DELETE /api/invoices/[id]/photo`

- Amac: faturaya bagli fotografi silmek
- Auth: gerekli
- Path param: `id`
- Response:

```json
{
  "success": true
}
```

### `POST /api/invoices/[id]/remind`

- Amac: manuel reminder gondermek
- Auth: gerekli
- Path param: `id`
- Body:

```json
{
  "channel": "whatsapp",
  "message": "Merhaba, odemeniz icin hatirlatma."
}
```

- Response:

```json
{
  "reminder": {},
  "delivery": {
    "status": "sent"
  },
  "whatsapp_link": "https://wa.me/..."
}
```

### `POST /api/invoices/import`

- Amac: toplu fatura import islemi
- Auth: gerekli
- Body:

```json
[
  {
    "customer_name": "Ali Veli",
    "amount": 1500,
    "due_date": "2026-05-01",
    "notes": "Toplu aktarim"
  }
]
```

- Response:

```json
{
  "success": 1,
  "failed": 0,
  "errors": []
}
```

### `GET, PUT /api/settings/reminders`

- Amac: otomatik reminder ayarlarini okumak/guncellemek
- Auth: gerekli
- Body (`PUT`): `enabled`, `days_before`, `days_after`, `due_day`, `channels`

Ornek body:

```json
{
  "enabled": true,
  "days_before": 3,
  "days_after": 2,
  "due_day": true,
  "channels": ["whatsapp", "sms"]
}
```

### `GET, PUT /api/settings/templates`

- Amac: mesaj sablonlarini okumak/guncellemek
- Auth: gerekli
- Body (`PUT`): `templates` anahtar-deger map'i

## Payments

### `POST /api/payments/create-checkout`

- Amac: plan yukseltme checkout akisini baslatmak
- Auth: gerekli
- Body:

```json
{
  "plan": "esnaf"
}
```

- Response:

```json
{
  "plan": "esnaf",
  "amount": 99,
  "currency": "TRY",
  "paymentId": "uuid",
  "providerReference": "ref",
  "checkoutUrl": "https://...",
  "mode": "checkout"
}
```

### `GET, POST /api/payments/callback`

- Amac: provider callback/redirect islemek
- Auth:
  - `GET`: provider redirect mantigi
  - `POST`: `x-payment-callback-secret` bekler
- `GET` query: `token`, `payment_id`, `status`
- `POST` body: `user_id`, `plan`, `payment_id`, `status`
- Response:
  - `GET`: dashboard veya pricing sayfasina redirect
  - `POST`: `{ "success": true }`

## Scheduled Jobs

### `GET /api/cron/check-reminders`

- Amac: otomatik reminder cron'unu calistirmak
- Auth: `Authorization: Bearer <CRON_SECRET>`
- Response:

```json
{
  "message": "Cron completed",
  "processed": 0,
  "created": 0,
  "skipped": 0
}
```

## Guvenlik Notlari

- Session gerektiren tum endpoint'lerde Supabase user baglami zorunlu tutulmalidir.
- `profile/setup` route'u body tabanli oldugu icin ek server-side sertlestirme adayidir.
- Payment callback ve cron endpoint'leri sir korumali tutulmalidir.
