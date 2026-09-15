import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { mapProductRow, type Product } from "./products";

// Client for public reads (using Vite env variables)
function publicClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key);
}

// ---------- Public reads ----------

export async function listProducts(): Promise<Product[]> {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapProductRow(r as never));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = publicClient();
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

// Direct upload function using standard Supabase client storage
export async function uploadProductImage(input: z.infer<typeof UploadSchema>) {
  const parsed = UploadSchema.parse(input);
  const supabase = publicClient();
  
  const safeName = parsed.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  
  // Convert base64 to binary buffer/blob for upload
  const byteCharacters = atob(parsed.dataBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: parsed.contentType });

  const { error: upErr } = await supabase.storage
    .from("product-images")
    .upload(path, blob, { contentType: parsed.contentType, upsert: false });
    
  if (upErr) throw new Error(upErr.message);

  const { data: signed, error: signErr } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 100);
    
  if (signErr || !signed) throw new Error(signErr?.message ?? "Failed to sign URL");
  
  return { url: signed.signedUrl, path };
}
