import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TahsilatCI - Esnaf Fatura Hatirlatma Sistemi",
  description:
    "Tesisatci, elektrikci, boyaci... Faturani gir, hatirlatmalari biz halledelim. Otomatik WhatsApp ve SMS ile odeme takibi.",
  keywords: [
    "fatura takip",
    "esnaf",
    "odeme hatirlatma",
    "whatsapp hatirlatma",
    "tahsilat",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
