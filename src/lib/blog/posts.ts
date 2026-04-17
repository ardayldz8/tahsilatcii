export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readTime: string;
  author: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "tahsilat-orani-nasil-artirilir",
    title: "Tahsilat Oraninizi %94'e Cikartmanin 7 Yolu",
    excerpt:
      "Esnaf olarak en buyuk sorunlardan biri odeme tahsilati. Bu 7 pratik yontemle tahsilat oraninizi ciddi sekilde artirabilirsiniz.",
    tags: ["Tahsilat", "Ipuclari", "Esnaf"],
    date: "2025-01-15",
    readTime: "6 dk",
    author: "TahsilatCI Ekibi",
    content: `## Neden Tahsilat Orani Dusuk?

Turkiye'deki kucuk esnaflar icin en buyuk sorunlardan biri, yapilan isin parasini zamaninda tahsil edememektir. Arastirmalara gore esnaflarinin **%62'si** odeme gecikmesi yasayarak nakit akisi sorunu cekiyor.

> "Is bittikten sonra fatura kesiyorum ama takip etmeyi unutuyorum. Musteri de odemezlik etmiyor aslinda, sadece hatirlatma olmuyor." — Ahmet Usta, Tesisatci

## 7 Etkili Yontem

## 1. Fatura Kesildigi Gun Hatirlatma Gonderin

Fatura kesildikten hemen sonra musterinize bir hatirlatma gondermek, odeme surecini hizlandirir. Ilk bildirim, musterinin aklinda kalmanizi saglar.

- Fatura kesilir kesilmez otomatik bildirim ayarlayin
- WhatsApp uzerinden profesyonel bir mesaj gonderin
- Fatura detaylarini mesaja ekleyin

## 2. Vade Tarihinden 3 Gun Once Hatirlatin

Vade tarihi yaklastiginda nazik bir hatirlatma, musterinin odemeyi planlamasini saglar.

- "Sayın musterimiz, 3 gun sonra vadesi dolacak faturaniz bulunmaktadir" seklinde mesaj gonderin
- Odeme yontemlerini belirtin
- Tek tikla odeme linki ekleyin

## 3. WhatsApp'i Ana Kanal Olarak Kullanin

Turkiye'de WhatsApp kullanim orani **%90'in** uzerinde. SMS veya e-posta yerine WhatsApp tercih edin.

- Acilma orani SMS'ten 3 kat yuksek
- Musteri aninda gorup cevaplayabiliyor
- Fatura gorseli bile gonderilebilir

## 4. Duzenli Takip Sistemi Kurun

Manuel takip yerine otomatik bir sistem kullanin. Her hafta "kimler odemedi?" diye bakmak yerine sistem size bildirsin.

- Otomatik hatirlatma kurallari olusturun
- Vadesi gecen faturalar icin eskalasyon plani belirleyin
- Haftalik tahsilat raporlarini inceleyin

## 5. Profesyonel ve Nazik Olun

Hatirlatma mesajlarinizin tonu cok onemlidir. Sert bir dil musteri kaybina yol acar.

- "Degerli musterimiz" diye baslayan mesajlar kullanin
- Odeme kolayligi sunun
- Tesekkur mesaji gondermeyi unutmayin

## 6. Erken Odeme Tesvik Edin

Erken odeme yapan musterilere kucuk indirimler sunmak, tahsilat oranini artirabilir.

- %2-3 erken odeme indirimi
- Sadik musterilere ozel kampanyalar
- Hizli odeme icin bonus puan sistemi

## 7. Dijital Arac Kullanin

Kagit defter ve Excel yerine dijital tahsilat araci kullanin. TahsilatCI gibi bir sistem ile:

- Tum faturalarinizi tek ekranda gorun
- Otomatik hatirlatmalar gonderin
- Tahsilat oraninizi anlik takip edin
- Musterilerinize profesyonel gorunun

> Bu 7 yontemi uygulayan esnaflar, ortalama tahsilat oranini **%67'den %94'e** cikarmistir.`,
  },
  {
    slug: "fatura-fotografi-sistemi",
    title: "Kagit Faturayi Dijitallestirmenin En Kolay Yolu",
    excerpt:
      "Kagit fatura yuiginiyla ugrasmayin. Telefonunuzun kamerasini kullanarak saniyeler icinde faturalarinizi dijitallestirin.",
    tags: ["Fatura", "Dijitallestirme", "Teknoloji"],
    date: "2025-01-10",
    readTime: "4 dk",
    author: "TahsilatCI Ekibi",
    content: `## Kagit Fatura Problemi

Her esnafin en buyuk derdi: kagit fatura yiginlari. Dosyalar arasinda kaybolmus faturalar, yipranmis kagitlar ve "ben bu faturayi nereye koydum?" sorusu...

> "Aracimin torpido gozunde 50 tane fatura var. Hangisi odenilmis hangisi odenmemis bilmiyorum." — Mehmet Usta, Elektrikci

## Cozum: Fotograf Cek, Sisteme Yukle

TahsilatCI'nin fatura fotografi ozelligi ile kagit faturalarinizi saniyeler icinde dijitallestirin.

## Nasil Calisiyor?

- Telefonunuzun kamerasini acin
- Faturayi ceketin veya galeriden secin
- Fatura bilgilerini sisteme girin
- Fotograf otomatik olarak faturaya eklenir

## Avantajlari

## Her Yerden Erisim

Faturalariniz bulutta guvenle saklanir. Ister sahada, ister ofiste, istediginiz zaman erisebilirsiniz.

- Telefondan, tabletten veya bilgisayardan erisim
- Kayip fatura sorunu ortadan kalkar
- Yedekleme otomatik yapilir

## Musteriye Kanit Gosterme

Musteri "ben boyle bir fatura almadim" dediginde, fotografli kanit elinizin altinda.

- Tartismalari hizla cozun
- Profesyonel gorunun
- Guveni artirin

## Vergi Zamani Kolayligi

Yil sonunda muhasebeciye kagit yigini tasimak yerine, dijital arsivizi paylasin.

- Tum faturalar kategorize edilmis
- Tarih ve tutara gore filtreleme
- PDF olarak disari aktarim

## Ipuclari

- Faturayi duz bir zemine koyarak cekin
- Isik yeterli olmalidir
- Tum koselerin gorundugundan emin olun
- Bulanik fotograflar tekrar cekin

> TahsilatCI ile kagit faturalarinizi dijitallestirin, zamandan ve emekten tasarruf edin.`,
  },
  {
    slug: "whatsapp-hatirlatma-rehberi",
    title: "WhatsApp Hatirlatma ile Musterinize Nasil Ulasirsiniz?",
    excerpt:
      "WhatsApp uzerinden profesyonel odeme hatirlatmasi gondermenin puf noktalari ve ornek mesaj sablonlari.",
    tags: ["WhatsApp", "Hatirlatma", "Iletisim"],
    date: "2025-01-05",
    readTime: "5 dk",
    author: "TahsilatCI Ekibi",
    content: `## WhatsApp Neden En Etkili Kanal?

Turkiye'de **50 milyonun** uzerinde aktif WhatsApp kullanicisi var. Gonderdiginiz mesajin okunma orani SMS'e gore **3 kat** daha yuksek.

> "SMS gonderiyordum ama kimse okumuyordu. WhatsApp'a gecince musteriler aninda donmeye basladi." — Ayse Hanim, Boyaci

## WhatsApp Hatirlatma Avantajlari

- **%95+** acilma orani
- Aninda iletim ve okundu bilgisi
- Gorsel (fatura fotografi) gonderebilme
- Musteri kolayca yanit verebilir
- Ucretsiz (internet baglantisi yeterli)

## Ornek Mesaj Sablonlari

## Fatura Kesildiginde

Degerli musterimiz, 1.500 TL tutarindaki faturaniz kesilmistir. Vade tarihi: 15.02.2025. Odeme icin asagidaki linki kullanabilirsiniz. Tesekkurler!

## Vade Yaklastiginda

Merhaba! 3 gun sonra vadesi dolacak 1.500 TL tutarindaki faturaniz bulunmaktadir. Odemenizi simdi yaparak gecikme olmamasini saglayabilirsiniz.

## Vade Gectiginde

Sayın musterimiz, vadesi 2 gun gecmis 1.500 TL tutarinda faturaniz bulunmaktadir. Odemenizi en kisa surede yapmanizi rica ederiz.

## Dogru Zamanlama

Hatirlatma mesajlarini dogru saatte gondermek cok onemlidir.

- **Sabah 09:00-10:00:** En yuksek acilma orani
- **Ogle 12:00-13:00:** Iyi acilma orani
- **Aksam 18:00-19:00:** Orta acilma orani
- Gece gondermekten kacinin (rahatsiz edici)
- Hafta sonlari mesaj gondermeyin

## Profesyonel Gorunmek Icin

- Isletme adinizi mesajin basina ekleyin
- Fatura numarasini belirtin
- Odeme tutarini ve vadesini net yazin
- Odeme linkini veya IBAN bilgisini ekleyin
- Kibarca ve profesyonelce yazin

## TahsilatCI ile Otomatik WhatsApp

TahsilatCI, tum bu sablonlari ve zamanlama kurallarini otomatik olarak yonetir.

- Fatura olusturdugunuzda otomatik ilk hatirlatma
- Vade yaklastiginda otomatik ikinci hatirlatma
- Vade gectiginde otomatik eskalasyon
- Ozellestirilmis mesaj sablonlari
- Toplu hatirlatma gonderimi

> WhatsApp hatirlatma kullanan esnaflar, ortalama odeme suresini **12 gunden 4 gune** dusurmustur.`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}
