import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type Category,
} from "@/lib/store.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin_/categories")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categories — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [name, setName] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["categories"] });

  const createMut = useMutation({
    mutationFn: (v: { name: string }) => createCategory({ data: { name: v.name, sortOrder: 0 } }),
    onSuccess: () => {
      toast.success("Category added");
      setName("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (c: Category) =>
      updateCategory({ data: { id: c.id, name: c.name, slug: c.slug, sortOrder: c.sortOrder } }),
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      title="Categories"
      description="Add, rename, reorder or remove the categories shown in the shop menu."
    >
      <form
        className="mb-8 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMut.mutate({ name: name.trim() });
        }}
      >
        <div className="flex-1 min-w-[220px]">
          <Input
            placeholder="New category name (e.g. Hoodies)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={createMut.isPending}>
          <Plus className="mr-1 h-4 w-4" /> Add category
        </Button>
      </form>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link slug</TableHead>
              <TableHead className="w-28">Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {(query.data ?? []).map((c) => (
              <CategoryRow
                key={c.id}
                category={c}
                onSave={(next) => updateMut.mutate(next)}
                onDelete={() => deleteMut.mutate(c.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

function CategoryRow({
  category,
  onSave,
  onDelete,
}: {
  category: Category;
  onSave: (c: Category) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Category>(category);
  const dirty =
    draft.name !== category.name ||
    draft.slug !== category.slug ||
    draft.sortOrder !== category.sortOrder;

  return (
    <TableRow>
      <TableCell>
        <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </TableCell>
      <TableCell>
        <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
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
      <TableCell className="text-right">
        <div className="inline-flex items-center gap-2">
          <Button size="sm" disabled={!dirty} onClick={() => onSave(draft)}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete category">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
