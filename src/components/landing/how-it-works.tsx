"use client";

import { UserPlus, Settings, TrendingUp, ArrowRight, Play, Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Müşteri ve Fatura Ekle",
    description:
      "Müşterinizi kaydedin, fatura bilgilerini girin. Fotoğrafını çekin veya CSV ile toplu yükleyin.",
    bullets: ["30 saniyede kayıt", "Fotoğraflı fatura", "CSV toplu içe aktarma"],
    gradient: "from-blue-500 via-blue-600 to-indigo-600",
    ringColor: "ring-blue-500/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    glowColor: "bg-blue-500/20",
    outlineText: "text-blue-100",
  },
  {
    number: "02",
    icon: Settings,
    title: "Otomatik Hatırlatma Ayarla",
    description:
      "Vade öncesi, günü ve sonrası için kurallar tanımlayın. WhatsApp, SMS veya e-posta ile otomatik gönderilsin.",
    bullets: ["Çok kanallı gönderim", "Akıllı zamanlama", "Özelleştirilebilir mesaj"],
    gradient: "from-orange-500 via-amber-500 to-orange-600",
    ringColor: "ring-orange-500/20",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    glowColor: "bg-orange-500/20",
    outlineText: "text-orange-100",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Ödemeyi Takip Edin",
    description:
      "Dashboard'dan tahsilat oranlarınızı canlı görün, raporları analiz edin, işletmenizi büyütün.",
    bullets: ["Canlı tahsilat raporu", "Müşteri bazlı analiz", "Trend grafikleri"],
    gradient: "from-emerald-500 via-emerald-600 to-teal-600",
    ringColor: "ring-emerald-500/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    glowColor: "bg-emerald-500/20",
    outlineText: "text-emerald-100",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="nasil-calisir"
      className="py-24 md:py-32 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.04)_0%,_transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 via-orange-100/20 to-emerald-100/30 rounded-full blur-3xl -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            Nasıl Çalışır
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tight">
            3 Adımda{" "}
            <span className="bg-gradient-to-r from-blue-600 via-orange-500 to-emerald-500 bg-clip-text text-transparent">
              Tahsilat
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Karmaşık muhasebe programlarına gerek yok. Bu kadar basit.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting dashed line */}
          <div
            className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px z-0"
            aria-hidden
          >
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 2"
            >
              <line
                x1="0"
                y1="1"
                x2="100"
                y2="1"
                stroke="url(#stepGradient)"
                strokeWidth="0.5"
                strokeDasharray="1 1"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="stepGradient" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isMiddle = i === 1;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative z-10 ${isMiddle ? "md:-translate-y-4" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    {/* Number badge with glow */}
                    <div className="relative mb-6">
                      <div
                        className={`absolute inset-0 rounded-2xl ${step.glowColor} blur-xl scale-125`}
                      />
                      <div
                        className={`relative w-[96px] h-[96px] rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl ring-4 ring-white`}
                      >
                        <span className="text-[32px] font-black text-white leading-none tracking-tight">
                          {step.number}
                        </span>
                        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-white">
                          <div
                            className={`w-full h-full rounded-full bg-gradient-to-br ${step.gradient}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      className={`group relative bg-white rounded-3xl p-7 border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 w-full overflow-hidden`}
                    >
                      {/* Gradient top border */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`}
                      />

                      {/* Watermark number */}
                      <span
                        className={`absolute -top-4 -right-4 text-[120px] font-black ${step.outlineText} opacity-50 select-none pointer-events-none leading-none`}
                        aria-hidden
                      >
                        {step.number}
                      </span>

                      {/* Hover glow */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`}
                      />

                      <div className="relative">
                        <div
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.iconBg} mb-5 shadow-lg ring-4 ${step.ringColor}`}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        <h3 className="font-black text-xl text-foreground mb-3 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                          {step.description}
                        </p>

                        <ul className="space-y-2">
                          {step.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <span
                                className={`flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}
                              >
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </span>
                              <span className="font-medium">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center mt-20"
        >
          <Link
            href="/kayit"
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-10 py-5 rounded-xl text-base overflow-hidden shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-3">
              <span>Hemen Deneyin - Ücretsiz</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </Link>

          <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
              Kredi kartı gerekmez
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
              30 saniyede başlayın
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
