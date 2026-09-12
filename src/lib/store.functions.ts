import { createServerFn } from "@tanstack/react-start";
import { resolveImageUrl } from "./image-url";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Category = { id: string; slug: string; name: string; sortOrder: number };
export type HeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
  isActive: boolean;
};
export type DeliveryLocation = {
  id: string;
  name: string;
  feeNgn: number;
  sortOrder: number;
  isActive: boolean;
};

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

async function assertAdmin(
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  },
  userId: string,
) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error("Failed to verify admin role");
  if (data !== true) throw new Error("Forbidden");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------- Categories ----------------

export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const { data, error } = await publicClient()
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id as string,
      slug: r.slug as string,
      name: r.name as string,
      sortOrder: r.sort_order as number,
    }));
  },
);

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().trim().min(1).max(80),
        slug: z.string().trim().max(80).optional(),
        sortOrder: z.number().int().min(0).max(10000).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const slug = slugify(data.slug && data.slug.length > 0 ? data.slug : data.name);
    if (!slug) throw new Error("Invalid category name");
    const { error } = await context.supabase
      .from("categories")
      .insert({ name: data.name, slug, sort_order: data.sortOrder });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(80),
        slug: z.string().trim().min(1).max(80),
        sortOrder: z.number().int().min(0).max(10000).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("categories")
      .update({ name: data.name, slug: slugify(data.slug), sort_order: data.sortOrder })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------------- Hero slides ----------------

export const listHeroSlides = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroSlide[]> => {
    const { data, error } = await publicClient()
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id as string,
      imageUrl: resolveImageUrl(r.image_url as string),
      alt: r.alt as string,
      sortOrder: r.sort_order as number,
      isActive: r.is_active as boolean,
    }));
  },
);

export const createHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        imageUrl: z.string().trim().min(1).max(2000),
        alt: z.string().trim().max(200).default(""),
        sortOrder: z.number().int().min(0).max(10000).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("hero_slides")
      .insert({ image_url: data.imageUrl, alt: data.alt, sort_order: data.sortOrder });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        alt: z.string().trim().max(200).optional(),
        sortOrder: z.number().int().min(0).max(10000).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const patch: { alt?: string; sort_order?: number; is_active?: boolean } = {};
    if (data.alt !== undefined) patch.alt = data.alt;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    if (Object.keys(patch).length === 0) return { ok: true as const };
    const { error } = await context.supabase.from("hero_slides").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("hero_slides").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------------- Delivery locations ----------------

export const listDeliveryLocations = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeliveryLocation[]> => {
    const { data, error } = await publicClient()
      .from("delivery_locations")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      feeNgn: r.fee_ngn as number,
      sortOrder: r.sort_order as number,
      isActive: r.is_active as boolean,
    }));
  },
);

const LocationInput = z.object({
  name: z.string().trim().min(1).max(120),
  feeNgn: z.number().int().min(0).max(10_000_000),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export const createDeliveryLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LocationInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("delivery_locations").insert({
      name: data.name,
      fee_ngn: data.feeNgn,
      sort_order: data.sortOrder,
      is_active: data.isActive,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateDeliveryLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid() }).merge(LocationInput).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("delivery_locations")
      .update({
        name: data.name,
        fee_ngn: data.feeNgn,
        sort_order: data.sortOrder,
        is_active: data.isActive,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteDeliveryLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("delivery_locations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
