import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminListProducts,
  createProduct,
  deleteProduct,
  setProductStockAndDiscount,
  toggleProductStock,
  updateProduct,
} from "@/lib/products.functions";
import { listCategories } from "@/lib/store.functions";
import { formatNgn, salePriceNgn, type ColorVariant, type Product } from "@/lib/products";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — TWOFOURSEVEN" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; inStock: boolean }) => toggleProductStock({ data: v }),
    onSuccess: () => {
      toast.success("Stock updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const quickMut = useMutation({
    mutationFn: (v: { id: string; stockQuantity?: number; discountPercent?: number }) =>
      setProductStockAndDiscount({ data: v }),
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      setDeletingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const products = productsQuery.data ?? [];
  const deletingProduct = useMemo(
    () => products.find((p) => p.id === deletingId) ?? null,
    [products, deletingId],
  );

  return (
    <AdminShell
      title="Products"
      description="Add, edit, discount and restock. Changes are live immediately."
      actions={
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" /> New product
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-28">% off</TableHead>
              <TableHead className="w-28">Qty left</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {productsQuery.error && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-destructive">
                  {(productsQuery.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {!productsQuery.isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image ? (
                    <img src={p.image} alt="" className="h-12 w-12 rounded bg-secondary object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-secondary" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                <TableCell className="text-sm">
                  {formatNgn(salePriceNgn(p))}
                  {(p.discountPercent ?? 0) > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground line-through">
                      {formatNgn(p.priceNgn)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <NumberCell
                    value={p.discountPercent ?? 0}
                    max={95}
                    onCommit={(v) => p.id && quickMut.mutate({ id: p.id, discountPercent: v })}
                  />
                </TableCell>
                <TableCell>
                  <NumberCell
                    value={p.stockQuantity ?? 0}
                    max={1000000}
                    onCommit={(v) => p.id && quickMut.mutate({ id: p.id, stockQuantity: v })}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={p.inStock}
                    onCheckedChange={(v) => p.id && toggleMut.mutate({ id: p.id, inStock: v })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => p.id && setDeletingId(p.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          categories={(categoriesQuery.data ?? []).map((c) => c.name)}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            invalidate();
          }}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deletingProduct?.name}</strong> from the store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMut.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function NumberCell({
  value,
  max,
  onCommit,
}: {
  value: number;
  max: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  return (
    <Input
      type="number"
      min={0}
      max={max}
      value={draft}
      className="h-9 w-20"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const n = Math.max(0, Math.min(max, Number(draft) || 0));
        setDraft(String(n));
        if (n !== value) onCommit(n);
      }}
    />
  );
}

// -------- Product form --------

type FormState = {
  slug: string;
  name: string;
  category: string;
  priceNgn: string;
  discountPercent: string;
  stockQuantity: string;
  description: string;
  image: string;
  gallery: string[];
  sizes: string;
  colors: string;
  inStock: boolean;
  isArchived: boolean;
  sortOrder: string;
};

function toFormState(p: Product | null): FormState {
  return {
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    category: p?.category ?? "Tees",
    priceNgn: p?.priceNgn?.toString() ?? "0",
    discountPercent: (p?.discountPercent ?? 0).toString(),
    stockQuantity: (p?.stockQuantity ?? 0).toString(),
    description: p?.description ?? "",
    image: p?.image ?? "",
    gallery: p?.gallery ?? [],
    sizes: (p?.sizes ?? []).join(", "),
    colors: JSON.stringify(p?.colors ?? [], null, 2),
    inStock: p?.inStock ?? true,
    isArchived: p?.isArchived ?? false,
    sortOrder: (p?.sortOrder ?? 0).toString(),
  };
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!product?.id;

  const saveMut = useMutation({
    mutationFn: async () => {
      let colors: ColorVariant[] = [];
      const rawColors = form.colors.trim();
      if (rawColors.length > 0) {
        try {
          const parsed = JSON.parse(rawColors);
          if (!Array.isArray(parsed)) throw new Error("Colors must be a JSON array");
          colors = parsed as ColorVariant[];
        } catch (err) {
          throw new Error(`Invalid colors JSON: ${(err as Error).message}`);
        }
      }
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        priceNgn: Number(form.priceNgn),
        discountPercent: Number(form.discountPercent) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
        description: form.description,
        image: form.image.trim(),
        gallery: form.gallery.filter((s) => s && s.trim().length > 0),
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors,
        inStock: form.inStock,
        isArchived: form.isArchived,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (isEdit && product?.id) {
        return updateProduct({ data: { id: product.id, data: payload } });
      }
      return createProduct({ data: payload });
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      onSaved();
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            Changes appear on the storefront immediately after saving.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            saveMut.mutate();
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              required
              placeholder="we-different-tee"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              required
              list="admin-categories"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <datalist id="admin-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceNgn">Price (₦)</Label>
            <Input
              id="priceNgn"
              type="number"
              min="0"
              required
              value={form.priceNgn}
              onChange={(e) => setForm({ ...form, priceNgn: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPercent">Discount (% off)</Label>
            <Input
              id="discountPercent"
              type="number"
              min="0"
              max="95"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Quantity in stock</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Main image</Label>
            <ImageUploader
              value={form.image ? [form.image] : []}
              multiple={false}
              onChange={(urls) => setForm({ ...form, image: urls[0] ?? "" })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Gallery images</Label>
            <ImageUploader
              value={form.gallery}
              multiple
              onChange={(urls) => setForm({ ...form, gallery: urls })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sizes">Sizes (comma separated)</Label>
            <Input
              id="sizes"
              placeholder="S, M, L, XL, XXL"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="colors">Colors (JSON)</Label>
            <Textarea
              id="colors"
              rows={5}
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Each entry: name, swatch (hex), images (array of URLs), inStock (true/false).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="inStock"
              checked={form.inStock}
              onCheckedChange={(v) => setForm({ ...form, inStock: v })}
            />
            <Label htmlFor="inStock">In stock</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="isArchived"
              checked={form.isArchived}
              onCheckedChange={(v) => setForm({ ...form, isArchived: v })}
            />
            <Label htmlFor="isArchived">Archived (shows in "Out of Stock")</Label>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
