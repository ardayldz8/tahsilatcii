"use client";

import { ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import DashboardMockup from "@/components/landing/dashboard-mockup";

const trustItems = [
  "Kredi kartı gerekmez",
  "30 saniyede kayıt",
  "Hemen kullanmaya başla",
];

export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-blue-50/60 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6"
              data-testid="hero-badge"
            >
              <Zap className="w-3.5 h-3.5 fill-primary" />
              127+ esnaf TahsilatCI ile tahsilat yapıyor
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground mb-5"
              data-testid="hero-heading"
            >
              Fatura gönder,{" "}
              <span className="text-primary relative">
                gerisi otomatik
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9C60 3 120 1 180 5C220 8 260 9 298 7"
                    stroke="hsl(25 95% 53%)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
              data-testid="hero-subtitle"
            >
              Tesisatci, elektrikci, boyaci... Isini yap, fatura gir. Musteri hatirlatmalarini biz halledelim.
              Bir daha ödeme takibi için zaman harcama.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <a
                href="/kayit"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-7 py-4 rounded-xl text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 group"
                data-testid="button-ucretsiz-basla-hero"
              >
                Ücretsiz Başla
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#nasil-calisir"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-border text-foreground font-semibold px-7 py-4 rounded-xl text-base hover:border-primary/40 hover:bg-primary/5 transition-all"
                data-testid="button-nasil-calisir-hero"
              >
                Nasıl Calisir?
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-x-6 gap-y-2"
              data-testid="trust-signals"
            >
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
