"use client";

import { UserPlus, Settings, TrendingUp, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Müşteri ve Fatura Ekle",
    description:
      "Müşterinizi kaydedin, fatura bilgilerini girin. Fotoğrafını çekin veya CSV ile toplu yükleyin. 30 saniyede tamamlanır.",
    color: "bg-primary",
    accentColor: "text-primary",
    lightBg: "bg-primary/10",
  },
  {
    number: "02",
    icon: Settings,
    title: "Otomatik Hatırlatma Ayarla",
    description:
      "Vade öncesi, günü ve sonrası için otomatik hatırlatma kuralları oluşturun. WhatsApp, SMS veya e-posta ile gönderin.",
    color: "bg-accent",
    accentColor: "text-accent",
    lightBg: "bg-accent/10",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Ödemeyi Takip Edin",
    description:
      "Dashboard'dan tahsilat oranlarınızı görüntüleyin, raporları inceleyin, işletmenizi büyütün.",
    color: "bg-emerald-500",
    accentColor: "text-emerald-500",
    lightBg: "bg-emerald-50",
  },
];

export default function HowItWorks() {
  return (
    <section id="nasil-calisir" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Play className="w-3.5 h-3.5" />
            Nasıl Çalışır
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            3 Adımda Tahsilat
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Karmaşık muhasebe programlarına gerek yok. Bu kadar basit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-[72px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-primary via-accent to-emerald-500 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div
                      className={`w-[72px] h-[72px] rounded-2xl ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-2xl font-black text-white">{step.number}</span>
                    </div>
                    <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${step.color.replace('bg-', 'bg-')}`} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-7 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.lightBg} mb-4`}>
                      <Icon className={`w-6 h-6 ${step.accentColor}`} />
                    </div>

                    <h3 className="font-black text-xl text-foreground mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center mt-14"
        >
          <Link
            href="/kayit"
            className="group relative inline-flex items-center gap-3 bg-primary text-white font-bold px-10 py-5 rounded-xl text-base overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-3">
              <span>Hemen Deneyin - Ücretsiz</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </Link>

          <p className="mt-4 text-sm text-muted-foreground">
            Kredi kartı gerekmez. 30 saniyede başlayın.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
