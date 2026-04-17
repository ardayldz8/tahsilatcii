"use client";

import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "sonsuza kadar",
    description: "Başlamak için ideal",
    features: [
      "3 müşteri",
      "10 hatırlatma/ay",
      "WhatsApp link",
      "Temel dashboard",
    ],
    cta: "Hemen Başla",
    ctaHref: "/kayit",
    popular: false,
    ctaClass:
      "border-2 border-border text-foreground hover:border-primary/40 hover:bg-primary/5",
  },
  {
    name: "Esnaf",
    price: "₺99",
    period: "ay",
    description: "Büyüyen esnaflar için",
    features: [
      "25 müşteri",
      "Sınırsız hatırlatma",
      "WhatsApp + SMS",
      "Detaylı raporlar",
      "Fatura fotoğrafi",
      "Öncelikli destek",
    ],
    cta: "14 Gün Ücretsiz Dene",
    ctaHref: "/kayit",
    popular: true,
    ctaClass: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25",
  },
  {
    name: "Usta",
    price: "₺199",
    period: "ay",
    description: "Büyük işletmeler için",
    features: [
      "Sınırsız müşteri",
      "Sınırsız hatırlatma",
      "WhatsApp + SMS + E-posta",
      "Gelişmiş analitik",
      "CSV toplu yükleme",
      "API erişimi",
      "7/24 destek",
    ],
    cta: "14 Gün Ücretsiz Dene",
    ctaHref: "/kayit",
    popular: false,
    ctaClass:
      "border-2 border-border text-foreground hover:border-primary/40 hover:bg-primary/5",
  },
];

export default function Pricing() {
  return (
    <section id="fiyatlandirma" className="py-20 md:py-28 bg-muted/40" data-testid="pricing-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4" data-testid="pricing-heading">
            Basit ve Şeffaf Fiyatlandırma
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bir tane tahsil edilen fatura bile yıllık aboneliği karşılar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 bg-white border transition-all duration-200 ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/15 scale-[1.02]"
                  : "border-border hover:shadow-md hover:-translate-y-1"
              }`}
              data-testid={`pricing-card-${i}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    <Zap className="w-3 h-3 fill-white" />
                    EN POPÜLER
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
              </div>

              <a
                href={plan.ctaHref}
                className={`block text-center font-semibold px-5 py-3 rounded-xl text-sm mb-6 transition-all ${plan.ctaClass}`}
                data-testid={`button-plan-${i}`}
              >
                {plan.cta}
              </a>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
