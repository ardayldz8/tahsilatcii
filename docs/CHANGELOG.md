# Changelog

Bu proje `Semantic Versioning` prensibine gore versiyonlanmasi hedeflenerek tutulur.

## [0.1.0] - 2026-04-15

### Added

- Next.js 16 tabanli landing, auth, blog ve dashboard yapisi
- Supabase Auth ve Postgres tabanli temel domain modeli
- Musteri, fatura, reminder, profil, referral ve payment API route'lari
- Reminder ayarlari, template yonetimi ve Vercel cron entegrasyonu
- Teknik dokumantasyon seti: architecture, API, database, deployment ve contributing belgeleri
- `.env.example`, `docker-compose.yml` ve `tests/` klasor iskeleti

### Changed

- README kapsamli kurulum, ortam degiskenleri ve proje yapisi bilgileriyle yeniden yazildi
- Fatura kartindaki reminder ve fotograf akislarindaki bozuk endpoint kullanimi duzeltildi
- Reminder delivery akisina timeout, retry scheduling ve fallback metadata destegi eklendi
- Fatura fotograflari private bucket + signed URL modeli ile servis edilmeye baslandi
- Kullanilmayan dashboard, reminder ve referral API endpoint'leri temizlenerek veri akisi sadeleştirildi

### Known Issues

- Gercek iyzico checkout deneyimi ve provider entegrasyonlari kismen placeholder/fallback seviyesinde
