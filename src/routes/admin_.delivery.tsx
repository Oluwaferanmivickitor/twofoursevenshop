import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  createDeliveryLocation,
  deleteDeliveryLocation,
  listDeliveryLocations,
  updateDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/store.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin_/delivery")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Delivery — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["delivery-locations"],
    queryFn: () => listDeliveryLocations(),
  });
  const [name, setName] = useState("");
  const [fee, setFee] = useState("3000");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["delivery-locations"] });

  const createMut = useMutation({
    mutationFn: () =>
      createDeliveryLocation({
        data: {
          name: name.trim(),
          feeNgn: Number(fee) || 0,
          sortOrder: (query.data ?? []).length,
          isActive: true,
        },
      }),
    onSuccess: () => {
      toast.success("Location added");
      setName("");
      setFee("3000");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (l: DeliveryLocation) =>
      updateDeliveryLocation({
        data: {
          id: l.id,
          name: l.name,
          feeNgn: l.feeNgn,
          sortOrder: l.sortOrder,
          isActive: l.isActive,
        },
      }),
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDeliveryLocation({ data: { id } }),
    onSuccess: () => {
      toast.success("Location removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      title="Delivery locations"
      description="Customers pick one of these at checkout and the fee is added to their total."
    >
      <form
        className="mb-8 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMut.mutate();
        }}
      >
        <Input
          className="min-w-[220px] flex-1"
          placeholder="Location name (e.g. Lagos Island)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="number"
          min={0}
          className="w-36"
          placeholder="Fee (₦)"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
        <Button type="submit" disabled={createMut.isPending}>
          <Plus className="mr-1 h-4 w-4" /> Add location
        </Button>
      </form>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead className="w-40">Fee (₦)</TableHead>
              <TableHead className="w-28">Order</TableHead>
              <TableHead className="w-28">Shown</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {(query.data ?? []).map((l) => (
              <LocationRow
                key={l.id}
                location={l}
                onSave={(next) => updateMut.mutate(next)}
                onDelete={() => deleteMut.mutate(l.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Customers whose area isn't listed can choose "Other location" at checkout and are sent to
        WhatsApp to agree the delivery fee.
      </p>
    </AdminShell>
  );
}

function LocationRow({
  location,
  onSave,
  onDelete,
}: {
  location: DeliveryLocation;
  onSave: (l: DeliveryLocation) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<DeliveryLocation>(location);
  const dirty =
    draft.name !== location.name ||
    draft.feeNgn !== location.feeNgn ||
    draft.sortOrder !== location.sortOrder ||
    draft.isActive !== location.isActive;

  return (
    <TableRow>
      <TableCell>
        <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={draft.feeNgn}
          onChange={(e) => setDraft({ ...draft, feeNgn: Number(e.target.value) || 0 })}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          className="w-20"
          value={draft.sortOrder}
          onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={draft.isActive}
          onCheckedChange={(v) => setDraft({ ...draft, isActive: v })}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center gap-2">
          <Button size="sm" disabled={!dirty} onClick={() => onSave(draft)}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete location">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
