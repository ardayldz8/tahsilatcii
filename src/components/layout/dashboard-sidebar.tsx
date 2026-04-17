"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Panel", icon: LayoutDashboard, href: "/panel" },
  { label: "Faturalar", icon: FileText, href: "/faturalar" },
  { label: "Musteriler", icon: Users, href: "/musteriler" },
  { label: "Hatirlatmalar", icon: Bell, href: "/hatirlatmalar" },
  { label: "Fiyatlandirma", icon: CreditCard, href: "/fiyatlandirma" },
  { label: "Ayarlar", icon: Settings, href: "/ayarlar" },
];

interface SidebarContentProps {
  onClose?: () => void;
  onLogout: () => void;
}

export default function SidebarContent({ onClose, onLogout }: SidebarContentProps) {
  const pathname = usePathname();

  const handleNav = () => {
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-5 py-5 border-b border-white/10">
        <Link
          href="/panel"
          onClick={handleNav}
          className="flex items-center gap-2.5 w-full"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">
            Tahsilat<span className="text-blue-400">CI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/panel" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              prefetch
               className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                 isActive
                   ? "bg-blue-600 text-white"
                   : "text-white/70 hover:text-white hover:bg-white/10"
               }`}
            >
               <Icon className="w-4 h-4 flex-shrink-0" />
               {item.label}
             </Link>
           );
         })}
      </nav>

      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cikis Yap
        </button>
      </div>
    </div>
  );
}
