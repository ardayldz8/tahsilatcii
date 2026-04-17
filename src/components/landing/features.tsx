"use client";

import {
  MessageCircle,
  Bell,
  BarChart3,
  ShieldCheck,
  Smartphone,
  FilePlus,
  Camera,
  Upload,
  PieChart,
  Zap,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const primaryFeatures = [
  {
    icon: MessageCircle,
    title: "WhatsApp Hatırlatma",
    description:
      "Tek tikla WhatsApp uzerinden ödeme hatırlatması gönderin. Müşteriniz anında görür, tahsilat oranı ~40% artar.",
    stat: "+40% tahsilat",
    color: "emerald",
  },
  {
    icon: Bell,
    title: "Otomatik Takip",
    description:
      "Vade öncesi, günü ve sonrası için otomatik hatırlatma. Siz iş yaparken sistem sizin için çalışır.",
    stat: "7/24 otomatik",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Nakit Akış Kontrolü",
    description:
      "Kim ödedi, kim ödemedI? Tüm alacaklarınız tek ekranda, anlık takip. Kime ne zaman hatırlatma göndereceğinizi bilin.",
    stat: "Tek panel",
    color: "violet",
  },
];

const secondaryFeatures = [
  {
    icon: ShieldCheck,
    title: "Güvenli Altyapı",
    description: "256-bit SSL şifreleme, KVKK uyumlu altyapı.",
    color: "teal",
  },
  {
    icon: Smartphone,
    title: "Mobil Uyumlu",
    description: "Telefon, tablet, bilgisayar - her yerden erişin.",
    color: "sky",
  },
  {
    icon: FilePlus,
    title: "Kolay Fatura Girişi",
    description: "30 saniyede fatura oluşturun.",
    color: "orange",
  },
  {
    icon: Camera,
    title: "Fatura Fotoğrafi",
    description: "Telefonunuzla fotoğraf çekin, sisteme yükleyin.",
    color: "pink",
  },
  {
    icon: Upload,
    title: "Toplu Yükleme",
    description: "CSV ile yüzlerce fatura tek seferde.",
    color: "amber",
  },
  {
    icon: PieChart,
    title: "Detaylı Raporlar",
    description: "Gelir grafikleri ve tahsilat analizleri.",
    color: "indigo",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-200" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200" },
  sky: { bg: "bg-sky-50", icon: "text-sky-600", border: "border-sky-200" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
  pink: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-200" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200" },
};

export default function Features() {
  return (
    <section id="ozellikler" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Zap className="w-3.5 h-3.5" />
            Tüm Özellikler
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Neden TahsilatCI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Esnafın ihtiyacına göre tasarlandık. Basit, hızlı, etkili.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {primaryFeatures.map((feature, i) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 border overflow-hidden group hover:shadow-xl transition-all duration-300 ${colors.bg} ${colors.border}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
                  <Icon className="w-full h-full" />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm ${colors.icon}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white ${colors.icon}`}>
                      {feature.stat}
                    </span>
                  </div>

                  <h3 className="font-black text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {secondaryFeatures.map((feature, i) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                className={`group flex items-start gap-4 p-6 rounded-xl border bg-white hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 ${colors.border}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${colors.bg} ${colors.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              "Ücretsiz başlangıç",
              "Kredi kartı gerekmez",
              "30 saniyede kurulum",
              "7/24 destek",
              "KVKK uyumlu",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
