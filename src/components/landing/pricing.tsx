"use client";

import { Check, Zap, Sparkles, Rocket, Crown, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Ücretsiz",
    tagline: "Başlamak için ideal",
    price: "0",
    currency: "₺",
    period: "sonsuza kadar",
    icon: Sparkles,
    popular: false,
    features: [
      { text: "3 müşteri", highlight: false },
      { text: "10 hatırlatma/ay", highlight: false },
      { text: "WhatsApp link", highlight: false },
      { text: "Temel dashboard", highlight: false },
    ],
    cta: "Hemen Başla",
    ctaHref: "/kayit",
    accent: {
      gradient: "from-slate-400 to-slate-600",
      iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
      iconColor: "text-slate-600",
      ring: "ring-slate-200",
      glow: "bg-slate-500/5",
      border: "border-slate-200",
      ctaClass:
        "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
      check: "from-slate-400 to-slate-500",
    },
  },
  {
    name: "Esnaf",
    tagline: "Büyüyen esnaflar için",
    price: "99",
    currency: "₺",
    period: "ay",
    icon: Rocket,
    popular: true,
    features: [
      { text: "25 müşteri", highlight: true },
      { text: "Sınırsız hatırlatma", highlight: true },
      { text: "WhatsApp + SMS", highlight: true },
      { text: "Detaylı raporlar", highlight: false },
      { text: "Fatura fotoğrafı", highlight: false },
      { text: "Öncelikli destek", highlight: false },
    ],
    cta: "14 Gün Ücretsiz Dene",
    ctaHref: "/kayit",
    accent: {
      gradient: "from-blue-600 via-indigo-600 to-blue-600",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconColor: "text-white",
      ring: "ring-blue-500/30",
      glow: "bg-blue-500/20",
      border: "border-blue-600",
      ctaClass:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5",
      check: "from-blue-500 to-indigo-600",
    },
  },
  {
    name: "Usta",
    tagline: "Büyük işletmeler için",
    price: "199",
    currency: "₺",
    period: "ay",
    icon: Crown,
    popular: false,
    features: [
      { text: "Sınırsız müşteri", highlight: true },
      { text: "Sınırsız hatırlatma", highlight: false },
      { text: "WhatsApp + SMS + E-posta", highlight: false },
      { text: "Gelişmiş analitik", highlight: false },
      { text: "CSV toplu yükleme", highlight: false },
      { text: "API erişimi", highlight: false },
      { text: "7/24 destek", highlight: false },
    ],
    cta: "14 Gün Ücretsiz Dene",
    ctaHref: "/kayit",
    accent: {
      gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
      iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
      iconColor: "text-white",
      ring: "ring-violet-500/20",
      glow: "bg-violet-500/10",
      border: "border-violet-200",
      ctaClass:
        "bg-white border-2 border-violet-200 text-violet-700 hover:border-violet-500 hover:bg-violet-50",
      check: "from-violet-500 to-fuchsia-600",
    },
  },
];

export default function Pricing() {
  return (
    <section
      id="fiyatlandirma"
      className="py-24 md:py-32 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden"
      data-testid="pricing-section"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_50%)]" />
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-3xl -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            Fiyatlandırma
          </div>
          <h2
            className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tight"
            data-testid="pricing-heading"
          >
            Basit ve{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Şeffaf
            </span>
            {" "}Fiyatlandırma
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Bir tane tahsil edilen fatura bile yıllık aboneliği karşılar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`relative ${plan.popular ? "lg:-translate-y-4 lg:scale-[1.03]" : ""}`}
                data-testid={`pricing-card-${i}`}
              >
                {/* Popular glow */}
                {plan.popular && (
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-3xl blur-xl opacity-30 -z-10" />
                )}

                {/* Popular badge — outside card to avoid clipping */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 blur-md opacity-60" />
                      <span className="relative flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        EN POPÜLER
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`relative h-full flex flex-col rounded-3xl bg-white border-2 ${plan.accent.border} ${
                    plan.popular ? "shadow-2xl shadow-blue-500/20" : "shadow-sm hover:shadow-xl hover:-translate-y-1"
                  } transition-all duration-500 overflow-hidden`}
                >
                  {/* Top gradient bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${plan.accent.gradient}`}
                  />

                  {/* Glow effect */}
                  <div
                    className={`absolute -top-20 -right-20 w-48 h-48 ${plan.accent.glow} rounded-full blur-3xl pointer-events-none`}
                  />

                  <div className="relative p-8 pt-10 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${plan.accent.iconBg} mb-5 shadow-lg ring-4 ${plan.accent.ring}`}
                    >
                      <Icon className={`w-7 h-7 ${plan.accent.iconColor}`} />
                    </div>

                    {/* Name + tagline */}
                    <h3 className="text-2xl font-black text-foreground mb-1.5 tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-border">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-muted-foreground">{plan.currency}</span>
                        <span className="text-6xl font-black text-foreground tracking-tight leading-none">
                          {plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          /{plan.period}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={plan.ctaHref}
                      className={`group relative block text-center font-bold px-5 py-3.5 rounded-xl text-sm mb-6 transition-all duration-300 ${plan.accent.ctaClass}`}
                      data-testid={`button-plan-${i}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </span>
                    </Link>

                    {/* Features */}
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${plan.accent.check} flex items-center justify-center shadow-sm`}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </span>
                          <span
                            className={`text-sm ${
                              feature.highlight
                                ? "font-semibold text-foreground"
                                : "text-gray-700"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Kredi kartı gerekmez
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            İstediğin zaman iptal et
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            KDV dahil
          </span>
        </motion.div>
      </div>
    </section>
  );
}
