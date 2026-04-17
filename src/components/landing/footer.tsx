import Link from "next/link";
import { FileText } from "lucide-react";

const footerLinks = {
  Urun: [
    { label: "Ozellikler", href: "#ozellikler" },
    { label: "Fiyatlandirma", href: "#fiyatlandirma" },
    { label: "SSS", href: "#sss" },
  ],
  Kaynaklar: [
    { label: "Blog", href: "/blog" },
    { label: "Giris Yap", href: "/giris" },
    { label: "Kayit Ol", href: "/kayit" },
  ],
  Yasal: [
    { label: "Gizlilik Politikasi", href: "/gizlilik" },
    { label: "Kullanim Sartlari", href: "/sartlar" },
    { label: "KVKK", href: "/kvkk" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="footer-logo">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">
                Tahsilat<span className="text-primary">CI</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Esnaflar icin gelistirilmis otomatik fatura takip ve odeme hatirlatma sistemi.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <span data-testid="footer-copyright">
            © 2025 TahsilatCI. Tum haklari saklidir.
          </span>
          <span data-testid="footer-tagline">Turkiye&apos;de sevgiyle yapildi</span>
        </div>
      </div>
    </footer>
  );
}
