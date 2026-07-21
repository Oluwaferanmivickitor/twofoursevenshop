import { useEffect, useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/products.functions";
import { adminListOrders, adminGetReceiptUrl } from "@/lib/orders.functions";
import { formatNgn } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Orders — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdersPage,
});

type OrderRow = {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal: string | null;
  items: Array<{ name: string; color?: string; size?: string; quantity: number; priceNgn: number }>;
  subtotal_ngn: number;
  shipping_ngn: number;
  total_ngn: number;
  payment_method: string;
  receipt_path: string | null;
  status: string;
  notified: boolean;
  created_at: string;
};

function OrdersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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
        if (!res.isAdmin) {
          router.navigate({ to: "/admin" });
          return;
        }
        setReady(true);
      } catch {
        router.navigate({ to: "/admin/login" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const ordersQuery = useQuery<OrderRow[]>({
    queryKey: ["admin", "orders"],
    queryFn: async () => (await adminListOrders()) as unknown as OrderRow[],
    enabled: ready,
  });

  async function openReceipt(path: string) {
    try {
      const { url } = await adminGetReceiptUrl({ data: { path } });
      window.open(url, "_blank", "noopener");
    } catch (e) {
      alert(`Could not open receipt: ${(e as Error).message}`);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading orders…
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Products
          </Link>
          <span className="text-sm font-medium text-foreground">Orders</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every submitted order with attached payment receipt.
          </p>
        </div>

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Notified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Loading…</TableCell>
                </TableRow>
              )}
              {ordersQuery.error && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-destructive">
                    {(ordersQuery.error as Error).message}
                  </TableCell>
                </TableRow>
              )}
              {!ordersQuery.isLoading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.reference}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-foreground">{o.full_name}</div>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                    <div className="text-xs text-muted-foreground">{o.phone}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {o.address}, {o.city}, {o.state} {o.postal}, {o.country}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <ul className="space-y-0.5">
                      {(o.items ?? []).map((i, idx) => (
                        <li key={idx}>
                          {i.name}
                          {i.color ? ` / ${i.color}` : ""}
                          {i.size ? ` / ${i.size}` : ""} × {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatNgn(o.total_ngn)}</TableCell>
                  <TableCell>
                    {o.receipt_path ? (
                      <Button size="sm" variant="outline" onClick={() => openReceipt(o.receipt_path!)}>
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {o.notified ? (
                      <span className="text-emerald-600">Sent</span>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
