"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Copy, Check, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "@/lib/dashboard/display";
import { formatCurrency } from "@/lib/utils/format";
import type { Invoice } from "@/types/index";
import type { DashboardReferralSummary } from "@/lib/dashboard/overview";

export default function PanelActivitySection({
  invoices,
  referrals,
}: {
  invoices: Invoice[];
  referrals: DashboardReferralSummary;
}) {
  const [copied, setCopied] = useState(false);
  const referralLink = referrals.code
    ? `https://tahsilatci.com/davet/${referrals.code}`
    : "https://tahsilatci.com/davet/...";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    toast.success("Davet linki kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Son Faturalar</CardTitle>
            <Link
              href="/faturalar"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Tümü <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Henuz fatura yok.
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground">
                      {invoice.customer?.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      {invoice.invoice_no}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-sm text-foreground">
                      {formatCurrency(invoice.amount)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        INVOICE_STATUS_COLORS[invoice.status]
                      }`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Gift className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-semibold text-sm">Davet Et, Kazan</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Arkadaslarinizi davet edin, her başarılı kayıt icin 1 ay ucretsiz kazanın.
          </p>
          <div className="flex gap-2 mb-4">
            <input
              readOnly
              value={referralLink}
              className="flex-1 text-xs bg-muted rounded-md px-3 py-2 text-muted-foreground border border-border min-w-0 truncate"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={copyLink}
              className="flex-shrink-0 px-2.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Davet", value: String(referrals.total) },
              { label: "Tamamlanan", value: String(referrals.completed) },
              { label: "Ödül", value: referrals.reward },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-muted rounded-lg p-2"
              >
                <div className="font-bold text-sm text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
