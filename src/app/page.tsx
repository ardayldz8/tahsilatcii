import dynamic from "next/dynamic";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Footer from "@/components/landing/footer";
import type { Metadata } from "next";

const StatsStrip = dynamic(() => import("@/components/landing/stats-strip"));
const Features = dynamic(() => import("@/components/landing/features"));
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works"));
const Testimonials = dynamic(() => import("@/components/landing/testimonials"));
const Pricing = dynamic(() => import("@/components/landing/pricing"));
const FAQ = dynamic(() => import("@/components/landing/faq"));
const FinalCTA = dynamic(() => import("@/components/landing/final-cta"));

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TahsilatCI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "TRY", name: "Ucretsiz Plan" },
    { "@type": "Offer", price: "99", priceCurrency: "TRY", name: "Esnaf Plan", billingIncrement: "P1M" },
    { "@type": "Offer", price: "199", priceCurrency: "TRY", name: "Usta Plan", billingIncrement: "P1M" },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "127" },
  description:
    "Turkiye'deki esnaflar icin fatura hatirlatma ve odeme takip sistemi. WhatsApp, SMS ile otomatik hatirlatma.",
};

export const metadata: Metadata = {
  title: "TahsilatCI - Esnaf Fatura Hatirlatma ve Odeme Takip Sistemi",
  description:
    "Tesisatci, elektrikci, boyaci gibi esnaflar icin fatura hatirlatma ve odeme takip sistemi. WhatsApp, SMS ile otomatik hatirlatma. Ucretsiz baslayin.",
  keywords: [
    "fatura hatirlatma",
    "odeme takip",
    "esnaf fatura",
    "tahsilat takip",
    "whatsapp hatirlatma",
    "sms hatirlatma",
    "tesisatci fatura",
    "elektrikci fatura",
    "boyaci fatura",
    "odeme hatirlatma sistemi",
    "esnaf yazilim",
    "fatura takip programi",
  ],
  openGraph: {
    title: "TahsilatCI - Fatura Gonder, Gerisi Otomatik",
    description:
      "Turkiye'nin esnaf odeme takip sistemi. WhatsApp ve SMS ile otomatik hatirlatma. 30 saniyede kayit, kredi karti gerekmez.",
    type: "website",
    locale: "tr_TR",
    url: "https://tahsilatci.com",
    siteName: "TahsilatCI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TahsilatCI - Esnaf Fatura Hatirlatma",
    description: "Fatura gonder, gerisi otomatik. Turkiye'deki esnaflar icin odeme takip sistemi.",
  },
  alternates: { canonical: "https://tahsilatci.com" },
  robots: { index: true, follow: true },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Hero />
          <StatsStrip />
          <Features />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
