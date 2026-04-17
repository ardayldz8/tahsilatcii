"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "127+", label: "Aktif Esnaf" },
  { value: "₺2.4M+", label: "Tahsil Edilen" },
  { value: "15.000+", label: "Hatirlatma Gonderildi" },
  { value: "%94", label: "Tahsilat Orani" },
];

export default function StatsStrip() {
  return (
    <section className="bg-primary py-10" data-testid="stats-strip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
              data-testid={`stat-${i}`}
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/75 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
