"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    stars: 5,
    quote:
      "Eskiden defterime yazardım,çoğu zaman unuturdum. Simdi WhatsApp'tan otomatik gidiyor, müşteriler hemen öduyor.",
    name: "Ahmet K.",
    trade: "Tesisatcı",
    city: "İstanbul",
    initials: "AK",
    color: "bg-blue-500",
  },
  {
    stars: 5,
    quote:
      "Ayda en az 3-4 fatura unutuluyordu. TahsilatCI'dan beri tahsilat oranım %90'in üzerine çıktı.",
    name: "Mehmet D.",
    trade: "Elektrikçi",
    city: "Ankara",
    initials: "MD",
    color: "bg-orange-500",
  },
  {
    stars: 5,
    quote:
      "Telefonumdan kullanıyorum, çok pratik. Müşteri de mesaji alinca hemen ödeme yapıyor.",
    name: "Hasan T.",
    trade: "Boyacı",
    city: "İzmir",
    initials: "HT",
    color: "bg-emerald-500",
  },
];

export default function Testimonials() {
  return (
    <section id="yorumlar" className="py-20 md:py-28 bg-white" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4" data-testid="testimonials-heading">
            Esnaflar Ne Diyor?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Binlerce esnaf TahsilatCI ile tahsilatını hızlandırdı.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              data-testid={`testimonial-card-${i}`}
            >
              <div className="absolute top-5 right-5 text-primary/10">
                <Quote className="w-10 h-10 fill-current" />
              </div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 text-sm">
                &quot;{t.quote}&quot;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.trade}, {t.city}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
