"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Ozellikler", href: "#ozellikler" },
  { label: "Nasil Calisir", href: "#nasil-calisir" },
  { label: "Fiyatlandirma", href: "#fiyatlandirma" },
  { label: "SSS", href: "#sss" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white/80 backdrop-blur-sm"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Tahsilat<span className="text-primary">CI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/giris"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary"
              data-testid="button-giris"
            >
              Giris Yap
            </a>
            <a
              href="/kayit"
              className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              data-testid="button-ucretsiz-basla-nav"
            >
              Ucretsiz Basla
            </a>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-border overflow-hidden"
            data-testid="mobile-menu"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                  data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                <a
                  href="/giris"
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors"
                  data-testid="mobile-button-giris"
                >
                  Giris Yap
                </a>
                <a
                  href="/kayit"
                  className="block px-3 py-2 text-sm font-semibold bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
                  data-testid="mobile-button-ucretsiz-basla"
                >
                  Ucretsiz Basla
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
