"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section
      className="py-20 md:py-28 bg-gradient-to-br from-primary via-blue-600 to-blue-700 relative overflow-hidden"
      data-testid="final-cta-section"
    >
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight"
            data-testid="final-cta-heading"
          >
            Odeme takibini otomatiklestirin
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Ucretsiz baslayin, isletmeniz buyudukce yukseltin. Kredi karti gerekmez.
          </p>
          <a
            href="/kayit"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl text-base hover:bg-white/95 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group"
            data-testid="button-final-cta"
          >
            Hemen Ucretsiz Basla
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
