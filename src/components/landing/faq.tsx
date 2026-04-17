"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "TahsilatCI nedir?",
    answer:
      "TahsilatCI, esnaflar için geliştirilmiş bir ödeme hatırlatma ve fatura takip sistemidir. Faturalarınızı girersiniz, sistem otomatik olarak WhatsApp veya SMS ile müşterilerinize hatırlatma gönderir.",
  },
  {
    question: "Ucretsiz plan gercekten ucretsiz mi?",
    answer:
      "Evet! Ücretsiz plan ile 3 müşteri ve ayda 10 hatırlatma gönderebilirsiniz. Kredi kartı bilgisi gerekmez, süre sınırı yoktur.",
  },
  {
    question: "WhatsApp hatırlatma nasıl çalışıyor?",
    answer:
      "Sistem, fatura vadesine göre otomatik hatırlatma mesajları oluşturur ve WhatsApp üzerinden müşterinize gönderir. Mesaj şablonlarını kendinize göre özelleştirebilirsiniz.",
  },
  {
    question: "Telefonumdan kullanabilir miyim?",
    answer:
      "Evet! TahsilatCI tamamen mobil uyumludur. Herhangi bir uygulama indirmenize gerek yok, tarayıcınızdan erişebilirsiniz.",
  },
  {
    question: "Verilerim guvenli mi?",
    answer:
      "Kesinlikle. 256-bit SSL şifreleme kullanıyoruz, verileriniz Avrupa merkezli güvenli sunucularda saklanır ve KVKK uyumludur.",
  },
  {
    question: "Planimi istedigim zaman degistirebilir miyim?",
    answer:
      "Evet, istediğiniz zaman planınızı yükseltebilir veya düşebilirsiniz. Yükseltme anında uygulanır.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden transition-all duration-200 ${
        open ? "shadow-sm" : ""
      }`}
      data-testid={`faq-item-${index}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-secondary/50 transition-colors"
        data-testid={`faq-toggle-${index}`}
      >
        <span className="font-semibold text-foreground text-sm">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 bg-white border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed pt-3">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="sss" className="py-20 md:py-28 bg-white" data-testid="faq-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4" data-testid="faq-heading">
            Sıkça Sorulan Sorular
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
