import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/products.functions";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

type AuthState =
  | { status: "checking" }
  | { status: "signed_out" }
  | { status: "not_admin"; email: string | null }
  | { status: "admin"; email: string | null };

const NAV = [
  { to: "/admin", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/hero", label: "Header images" },
  { to: "/admin/delivery", label: "Delivery" },
  { to: "/admin/orders", label: "Orders" },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!userData.user) {
        router.navigate({ to: "/admin/login" });
        return;
      }
      try {
        const res = await checkIsAdmin();
        if (cancelled) return;
        setAuth({
          status: res.isAdmin ? "admin" : "not_admin",
          email: userData.user.email ?? null,
        });
      } catch {
        if (!cancelled) setAuth({ status: "signed_out" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/admin/login" });
  }

  if (auth.status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading admin…
      </div>
    );
  }
  if (auth.status === "signed_out") return null;
  if (auth.status === "not_admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <h1 className="font-serif text-2xl font-light">Not authorised</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {auth.email ?? "This account"} is signed in but is not an administrator.
        </p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <header className="border-b border-border px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="eyebrow text-muted-foreground hover:text-foreground">
              TWOFOURSEVEN
            </Link>
            <span className="text-sm font-medium text-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{auth.email}</span>
            <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </Link>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-foreground [&.active]:text-background"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
              {title}
            </h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
