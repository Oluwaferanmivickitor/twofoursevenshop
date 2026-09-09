import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { adminGetReceiptUrl, adminListOrders } from "@/lib/orders.functions";
import { formatNgn } from "@/lib/products";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin_/orders")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Orders — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrdersPage,
});

type OrderItem = { name: string; color?: string; size?: string; quantity: number };

function OrdersPage() {
  const query = useQuery({ queryKey: ["admin", "orders"], queryFn: () => adminListOrders() });
  const [busy, setBusy] = useState<string | null>(null);

  async function openReceipt(path: string) {
    setBusy(path);
    try {
      const { url } = await adminGetReceiptUrl({ data: { path } });
      window.open(url, "_blank", "noopener");
    } finally {
      setBusy(null);
    }
  }

  const orders = (query.data ?? []) as Array<Record<string, unknown>>;

  return (
    <AdminShell title="Orders" description="Every order placed on the store, newest first.">
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!query.isLoading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => {
              const items = (Array.isArray(o.items) ? o.items : []) as OrderItem[];
              const path = (o.receipt_path as string | null) ?? null;
              return (
                <TableRow key={String(o.id)}>
                  <TableCell className="font-mono text-xs">
                    {String(o.reference)}
                    <div className="mt-1 text-[0.65rem] text-muted-foreground">
                      {new Date(String(o.created_at)).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-foreground">{String(o.full_name)}</div>
                    <div className="text-xs text-muted-foreground">{String(o.email)}</div>
                    <div className="text-xs text-muted-foreground">{String(o.phone)}</div>
                    <div className="mt-1 max-w-xs text-xs text-muted-foreground">
                      {String(o.address)}, {String(o.city)}, {String(o.country)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {items.map((i, idx) => (
                      <div key={idx}>
                        {i.name}
                        {i.color ? ` / ${i.color}` : ""}
                        {i.size ? ` / ${i.size}` : ""} × {i.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{String(o.delivery_location ?? "") || "—"}</div>
                    <div className="text-muted-foreground">
                      {formatNgn(Number(o.shipping_ngn) || 0)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatNgn(Number(o.total_ngn) || 0)}
                  </TableCell>
                  <TableCell>
                    {path ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === path}
                        onClick={() => openReceipt(path)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        {busy === path ? "Opening…" : "View"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
