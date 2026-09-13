import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  createHeroSlide,
  deleteHeroSlide,
  listHeroSlides,
  updateHeroSlide,
} from "@/lib/store.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { resolveImageUrl } from "@/lib/image-url";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin_/hero")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Header images — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: HeroPage,
});

function HeroPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["hero-slides"], queryFn: () => listHeroSlides() });
  const [pending, setPending] = useState<string[]>([]);
  const [alt, setAlt] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["hero-slides"] });

  const addMut = useMutation({
    mutationFn: async (urls: string[]) => {
      let order = (query.data ?? []).length;
      for (const url of urls) {
        await createHeroSlide({ data: { imageUrl: url, alt, sortOrder: order } });
        order += 1;
      }
    },
    onSuccess: () => {
      toast.success("Header images added");
      setPending([]);
      setAlt("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (v: { id: string; alt?: string; sortOrder?: number; isActive?: boolean }) =>
      updateHeroSlide({ data: v }),
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteHeroSlide({ data: { id } }),
    onSuccess: () => {
      toast.success("Image removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const slides = query.data ?? [];

  return (
    <AdminShell
      title="Header images"
      description="These are the big images in the slideshow at the top of the homepage."
    >
      <div className="mb-10 max-w-xl space-y-4 rounded-md border border-border bg-card p-5">
        <div className="space-y-2">
          <Label>Upload new header images</Label>
          <ImageUploader value={pending} multiple onChange={setPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alt">Short image description (optional)</Label>
          <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <Button
          disabled={pending.length === 0 || addMut.isPending}
          onClick={() => addMut.mutate(pending)}
        >
          {addMut.isPending ? "Adding…" : "Add to slideshow"}
        </Button>
      </div>

      {query.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!query.isLoading && slides.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No custom header images yet — the homepage is showing the built-in ones.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-md border border-border bg-card">
            <img src={resolveImageUrl(s.imageUrl)} alt={s.alt} className="aspect-[4/5] w-full object-cover" />
            <div className="space-y-3 p-4">
              <Input
                defaultValue={s.alt}
                placeholder="Description"
                onBlur={(e) =>
                  e.target.value !== s.alt && updateMut.mutate({ id: s.id, alt: e.target.value })
                }
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Order</Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-9 w-20"
                    defaultValue={s.sortOrder}
                    onBlur={(e) => {
                      const n = Number(e.target.value) || 0;
                      if (n !== s.sortOrder) updateMut.mutate({ id: s.id, sortOrder: n });
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Visible</Label>
                  <Switch
                    checked={s.isActive}
                    onCheckedChange={(v) => updateMut.mutate({ id: s.id, isActive: v })}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteMut.mutate(s.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
