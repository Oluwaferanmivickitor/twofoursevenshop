import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { mapProductRow, type Product } from "./products";

// Client for public reads and uploads
function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

// ---------- Public reads ----------

export async function listProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapProductRow(r as never));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  const { data: row, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return row ? mapProductRow(row as never) : null;
}

// ---------- Admin & Uploads ----------

const UploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  dataBase64: z.string().min(1).max(15_000_000),
});

// Direct browser-safe upload using Supabase client storage
export async function uploadProductImage(input: z.infer<typeof UploadSchema>) {
  const parsed = UploadSchema.parse(input);
  const supabase = getSupabaseClient();
  
  const safeName = parsed.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  
  // Convert base64 safely in any browser environment
  const binaryString = atob(parsed.dataBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: parsed.contentType });

  const { error: upErr } = await supabase.storage
    .from("product-images")
    .upload(path, blob, { contentType: parsed.contentType, upsert: false });
    
  if (upErr) throw new Error(upErr.message);

  // Get public URL or signed URL depending on your bucket configuration. 
  // If your bucket is public, getPublicUrl is much cleaner and doesn't expire:
  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return { url: publicUrlData.publicUrl, path };
}
