import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapProductRow, type Product } from "./products";

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
  description: z.string().max(4000).default(""),
  image: z.string().trim().max(2000).default(""),
  gallery: z.array(z.string().trim().min(1)).max(20).default([]),
  sizes: z.array(z.string().trim().min(1).max(20)).max(20).default([]),
  colors: z.array(ColorVariantSchema).max(20).default([]),
  inStock: z.boolean().default(true),
  isArchived: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100000).default(0),
});

async function assertAdmin(supabase: {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}, userId: string) {
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

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error } = await context.supabase
      .from("products")
      .insert({
        slug: data.slug,
        name: data.name,
        category: data.category,
        price_ngn: data.priceNgn,
        description: data.description,
        image: data.image,
        gallery: data.gallery,
        sizes: data.sizes,
        colors: data.colors,
        in_stock: data.inStock,
        is_archived: data.isArchived,
        sort_order: data.sortOrder,
      })
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
      .update({
        slug: data.data.slug,
        name: data.data.name,
        category: data.data.category,
        price_ngn: data.data.priceNgn,
        description: data.data.description,
        image: data.data.image,
        gallery: data.data.gallery,
        sizes: data.data.sizes,
        colors: data.data.colors,
        in_stock: data.data.inStock,
        is_archived: data.data.isArchived,
        sort_order: data.data.sortOrder,
      })
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

// Admin uploads a product image (base64) and returns a long-lived signed URL.
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
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 100);
    if (signErr || !signed) throw new Error(signErr?.message ?? "Failed to sign URL");
    return { url: signed.signedUrl, path };
  });
