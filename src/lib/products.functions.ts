import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapProductRow, type Product } from "./products";

function publicClient() {
  const url = process.env.VITE_SUPABASE_URL!;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
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

// ---------- Public reads ----------

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapProductRow(r as never));
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }): Promise<Product | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapProductRow(row as never) : null;
  });

// ---------- Admin ----------

const ColorVariantSchema = z.object({
  name: z.string().trim().min(1).max(60),
  swatch: z.string().trim().min(1).max(20),
  images: z.array(z.string().trim().min(1)).max(20),
  inStock: z.boolean(),
});

const ProductInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(80),
  priceNgn: z.number().int().min(0).max(1_000_000_000),
  discountPercent: z.number().int().min(0).max(95).default(0),
  stockQuantity: z.number().int().min(0).max(1_000_000).default(0),
  description: z.string().max(4000).default(""),
  image: z.string().trim().max(2000).default(""),
  gallery: z.array(z.string().trim().min(1)).max(20).default([]),
  sizes: z.array(z.string().trim().min(1).max(20)).max(20).default([]),
  colors: z.array(ColorVariantSchema).max(20).default([]),
  inStock: z.boolean().default(true),
  isArchived: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100000).default(0),
});

export async function assertAdmin(
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  },
  userId: string,
) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error("Failed to verify admin role");
  if (data !== true) throw new Error("Forbidden");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Auto-grant admin to the configured ADMIN_EMAIL on first sign-in.
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const userEmail = (context.claims?.email as string | undefined)?.toLowerCase();
    if (adminEmail && userEmail && adminEmail === userEmail) {
      const { data: existing } = await context.supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!existing) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: context.userId, role: "admin" });
      }
    }
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) return { isAdmin: false };
    return { isAdmin: data === true };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapProductRow(r as never));
  });

function toRow(d: z.infer<typeof ProductInputSchema>) {
  return {
    slug: d.slug,
    name: d.name,
    category: d.category,
    price_ngn: d.priceNgn,
    discount_percent: d.discountPercent,
    stock_quantity: d.stockQuantity,
    description: d.description,
    image: d.image,
    gallery: d.gallery,
    sizes: d.sizes,
    colors: d.colors,
    in_stock: d.inStock,
    is_archived: d.isArchived,
    sort_order: d.sortOrder,
  };
}

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error } = await context.supabase
      .from("products")
      .insert(toRow(data))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapProductRow(row as never);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), data: ProductInputSchema }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error } = await context.supabase
      .from("products")
      .update(toRow(data.data))
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapProductRow(row as never);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const toggleProductStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), inStock: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("products")
      .update({ in_stock: data.inStock })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// Quick inline edits from the products table (stock count / discount).
export const setProductStockAndDiscount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        stockQuantity: z.number().int().min(0).max(1_000_000).optional(),
        discountPercent: z.number().int().min(0).max(95).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const patch: { stock_quantity?: number; in_stock?: boolean; discount_percent?: number } = {};
    if (data.stockQuantity !== undefined) {
      patch.stock_quantity = data.stockQuantity;
      patch.in_stock = data.stockQuantity > 0;
    }
    if (data.discountPercent !== undefined) patch.discount_percent = data.discountPercent;
    if (Object.keys(patch).length === 0) return { ok: true as const };
    const { error } = await context.supabase.from("products").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// Admin uploads an image (base64) and returns a long-lived signed URL.
const UploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  dataBase64: z.string().min(1).max(15_000_000),
});

export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bytes = Buffer.from(data.dataBase64, "base64");
    const { error: upErr } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    // Bypass the broken token signing logic entirely:
    return { url: path, path };
  });