# Contributing

## Gelistirme Prensipleri

- Kod dili: `English`
- Aciklama ve dokumantasyon dili: `Turkish`
- Naming:
  - degisken/fonksiyon: `camelCase`
  - React component/type: `PascalCase`
  - dosya adi: `kebab-case`
- Commit standardi: `Conventional Commits`

## Branch Stratejisi

- `main`: production'a yakin stabil branch
- `feature/*`: yeni ozellikler
- `fix/*`: bug fix'ler
- `refactor/*`: yapisal iyilestirmeler
- `docs/*`: dokumantasyon guncellemeleri

## Gelistirme Akisi

1. Guncel branch'i cekin.
2. Yeni bir branch olusturun.
3. Degisikliklerinizi kucuk ve izlenebilir parcalar halinde yapin.
4. Lint, test ve gerekiyorsa build komutlarini calistirin.
5. Conventional Commit mesaji ile commit atin.
6. Pull request acin.

## Pull Request Kurallari

- PR aciklamasi problem, cozum ve riskleri ayirmalidir.
- UI degisikliginde ekran goruntusu veya kisa video ekleyin.
- API veya DB degisikliginde ilgili `docs/` dosyasini guncelleyin.
- Migration eklendi ise deployment etkisini belirtin.

## Kod Standartlari

- Tekrari azaltin, merkezi helper/service kullanin.
- Guvenlik gerektiren anahtarlari kod icine yazmayin.
- Supabase sorgularinda kullanici izolasyonunu bozacak kisayollardan kacinin.
- Route handler'larda input validation ve acik hata mesajlari kullanin.
- Test edilebilirlik icin saf helper fonksiyonlarini `src/lib/` altinda izole tutun.

## Test Stratejisi

- `src/**/*.test.ts`: mevcut unit seviyesindeki helper ve route testleri
- `tests/unit/`: yeni saf unit testler
- `tests/integration/`: entegrasyon senaryolari
- `tests/e2e/`: tarayici tabanli uc uca testler

Calistirilmasi gereken temel komutlar:

```bash
npm run lint
npm run test
npm run build
```

## Review Checklist

- Is kurali degisikligi dokumante edildi mi?
- API degisikligi `docs/API.md` ile uyumlu mu?
- Schema degisikligi `docs/DATABASE.md` ile uyumlu mu?
- Yeni env degiskeni varsa `.env.example` guncellendi mi?
- Guvenlik ve yetkilendirme kontrol edildi mi?
