"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SifreSifirlaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setMode("reset");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function requestReset() {
    if (!email) {
      toast.error("Lutfen e-posta adresinizi girin.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sifre-sifirla`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Sifre sifirlama e-postasi gonderildi.");
      router.push("/giris?reset=gonderildi");
    } catch {
      toast.error("Bir hata olustu. Lutfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    if (password.length < 6) {
      toast.error("Sifre en az 6 karakter olmali.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Sifreler eslesmiyor.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Sifreniz guncellendi. Giris yapabilirsiniz.");
      router.push("/giris");
      router.refresh();
    } catch {
      toast.error("Bir hata olustu. Lutfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-600 via-blue-500 to-cyan-600 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="items-center gap-3 pb-2 pt-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white">
            {mode === "request" ? <Mail className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "request" ? "Sifre Sifirla" : "Yeni Sifre Belirle"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "request"
                ? "E-posta adresinizi girin, sifre yenileme baglantisini gonderelim."
                : "Yeni sifrenizi belirleyip hesabiniza guvenli sekilde donun."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-8" suppressHydrationWarning>
          {mode === "request" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="h-10"
                />
              </div>
              <Button onClick={requestReset} disabled={loading} className="h-10 w-full bg-sky-600 text-white hover:bg-sky-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gonderiliyor...
                  </>
                ) : (
                  "Sifirlama Baglantisi Gonder"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="password">Yeni Sifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Yeni Sifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Sifrenizi tekrar girin"
                  className="h-10"
                />
              </div>
              <Button onClick={updatePassword} disabled={loading} className="h-10 w-full bg-sky-600 text-white hover:bg-sky-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guncelleniyor...
                  </>
                ) : (
                  "Sifreyi Guncelle"
                )}
              </Button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/giris" className="font-medium text-sky-600 hover:underline">
              Giris sayfasina don
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
