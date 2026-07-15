import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListProducts,
  checkIsAdmin,
  createProduct,
  deleteProduct,
  toggleProductStock,
  updateProduct,
} from "@/lib/products.functions";
import { formatNgn, type ColorVariant, type Product } from "@/lib/products";
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
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — TWOFOURSEVEN" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type AuthState =
  | { status: "checking" }
  | { status: "signed_out" }
  | { status: "not_admin"; email: string | null }
  | { status: "admin"; email: string | null };

function AdminDashboard() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!userData.user) {
        router.navigate({ to: "/admin_/login" as string as never });
        return;
      }
      try {
        const res = await checkIsAdmin();
        if (cancelled) return;
        if (res.isAdmin) {
          setAuth({ status: "admin", email: userData.user.email ?? null });
        } else {
          setAuth({ status: "not_admin", email: userData.user.email ?? null });
        }
      } catch {
        if (!cancelled) setAuth({ status: "signed_out" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
          {auth.email ?? "This account"} is signed in but is not an administrator. Ask the site
          owner to grant admin access, or sign in with a different account.
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            router.navigate({ to: "/admin_/login" as string as never });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return <AdminContent email={auth.email} />;
}

function AdminContent({ email }: { email: string | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts(),
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; inStock: boolean }) =>
      toggleProductStock({ data: v }),
    onSuccess: () => {
      toast.success("Stock updated");
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
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="eyebrow text-muted-foreground hover:text-foreground">
            TWOFOURSEVEN
          </Link>
          <span className="text-sm font-medium text-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{email}</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View site
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              router.navigate({ to: "/admin_/login" as string as never });
            }}
          >
            <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
              Products
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, edit, and manage stock. Changes are live immediately.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-4 w-4" /> New product
          </Button>
        </div>

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In stock</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {productsQuery.error && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-destructive">
                    {(productsQuery.error as Error).message}
                  </TableCell>
                </TableRow>
              )}
              {!productsQuery.isLoading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              )}
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="h-12 w-12 rounded object-cover bg-secondary"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-secondary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-sm">{formatNgn(p.priceNgn)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.inStock}
                      onCheckedChange={(v) =>
                        p.id && toggleMut.mutate({ id: p.id, inStock: v })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.colors && p.colors.length > 0
                      ? p.colors.map((c) => c.name).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(p)}
                        aria-label="Edit"
                      >
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
      </main>

      {(creating || editing) && (
        <ProductForm
          product={editing}
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
              This action cannot be undone.
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
    </div>
  );
}

// -------- Form --------

type FormState = {
  slug: string;
  name: string;
  category: string;
  priceNgn: string;
  description: string;
  image: string;
  gallery: string;
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
    category: p?.category ?? "T-Shirt",
    priceNgn: p?.priceNgn?.toString() ?? "0",
    description: p?.description ?? "",
    image: p?.image ?? "",
    gallery: (p?.gallery ?? []).join("\n"),
    sizes: (p?.sizes ?? []).join(", "),
    colors: JSON.stringify(p?.colors ?? [], null, 2),
    inStock: p?.inStock ?? true,
    isArchived: p?.isArchived ?? false,
    sortOrder: (p?.sortOrder ?? 0).toString(),
  };
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
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
        description: form.description,
        image: form.image.trim(),
        gallery: form.gallery
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
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
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
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
            <Label htmlFor="image">Main image URL</Label>
            <Input
              id="image"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gallery">Gallery image URLs (one per line)</Label>
            <Textarea
              id="gallery"
              rows={3}
              value={form.gallery}
              onChange={(e) => setForm({ ...form, gallery: e.target.value })}
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
              placeholder={`[\n  { "name": "Black", "swatch": "#000000", "images": ["https://…"], "inStock": true }\n]`}
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
