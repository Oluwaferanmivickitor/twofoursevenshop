import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./products.functions";
import { validateOrderTransition, type Order, type OrderStage } from "./order-lifecycle";

const ItemSchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  image: z.string().max(2000).optional(),
  color: z.string().max(80).optional(),
  size: z.string().max(20).optional(),
  priceNgn: z.number().int().min(0).max(1_000_000_000),
  quantity: z.number().int().min(1).max(999),
});

const OrderSchema = z.object({
  reference: z.string().min(4).max(60),
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(3).max(40),
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).default(""),
  country: z.string().trim().min(1).max(120),
  postal: z.string().trim().max(40).default(""),
  deliveryLocation: z.string().trim().max(160).default(""),
  items: z.array(ItemSchema).min(1).max(50),
  subtotalNgn: z.number().int().min(0),
  shippingNgn: z.number().int().min(0),
  totalNgn: z.number().int().min(0),
  paymentMethod: z.enum(["bank", "card"]).default("bank"),
  receipt: z
    .object({
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(120),
      dataBase64: z.string().min(1).max(15_000_000),
    })
    .nullable()
    .optional(),
});

async function sendAdminEmail(subject: string, text: string) {
  const to = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!to) return { attempted: false, ok: false, reason: "ADMIN_EMAIL not set" };

  // Prefer Resend via the Lovable connector gateway if a Resend API key is configured.
  if (resendKey && lovableKey) {
    try {
      const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": resendKey,
        },
        body: JSON.stringify({
          from: "TWOFOURSEVEN Orders <onboarding@resend.dev>",
          to: [to],
          subject,
          text,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return { attempted: true, ok: false, reason: `Resend ${res.status}: ${body}` };
      }
      return { attempted: true, ok: true };
    } catch (e) {
      return { attempted: true, ok: false, reason: (e as Error).message };
    }
  }
  return { attempted: false, ok: false, reason: "No email provider configured" };
}

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => OrderSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let receiptPath: string | null = null;
    if (data.receipt) {
      const safe = data.receipt.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      receiptPath = `${data.reference}/${Date.now()}-${safe}`;
      const bytes = Buffer.from(data.receipt.dataBase64, "base64");
      const { error: upErr } = await supabaseAdmin.storage
        .from("order-receipts")
        .upload(receiptPath, bytes, { contentType: data.receipt.contentType, upsert: false });
      if (upErr) throw new Error(`Receipt upload failed: ${upErr.message}`);
    }

    const { error: insErr } = await supabaseAdmin.from("orders").insert({
      reference: data.reference,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal: data.postal,
      delivery_location: data.deliveryLocation,
      items: data.items,
      subtotal_ngn: data.subtotalNgn,
      shipping_ngn: data.shippingNgn,
      total_ngn: data.totalNgn,
      payment_method: data.paymentMethod,
      receipt_path: receiptPath,
    });
    if (insErr) throw new Error(insErr.message);

    // Compose order notification
    const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
    const itemLines = data.items
      .map(
        (i) =>
          `- ${i.name}${i.color ? ` / ${i.color}` : ""}${i.size ? ` / ${i.size}` : ""} × ${i.quantity} — ${fmt(i.priceNgn * i.quantity)}`,
      )
      .join("\n");
    const text = [
      `New order — ${data.reference}`,
      "",
      "CUSTOMER",
      `Name: ${data.fullName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      "",
      "SHIPPING",
      data.address,
      `${data.city}, ${data.state} ${data.postal}`.trim(),
      data.country,
      data.deliveryLocation ? `Delivery zone: ${data.deliveryLocation}` : "",
      "",
      "ITEMS",
      itemLines,
      "",
      `Subtotal: ${fmt(data.subtotalNgn)}`,
      `Shipping: ${fmt(data.shippingNgn)}`,
      `Total:    ${fmt(data.totalNgn)}`,
      "",
      `Payment: ${data.paymentMethod === "bank" ? "Bank Transfer" : "Card"}`,
      receiptPath ? `Receipt: uploaded (${receiptPath})` : "Receipt: not attached",
      "",
    ].join("\n");

    const emailResult = await sendAdminEmail(
      `New order ${data.reference} — ${data.fullName}`,
      text,
    );
    if (emailResult.ok) {
      await supabaseAdmin
        .from("orders")
        .update({ notified: true })
        .eq("reference", data.reference);
    } else if (emailResult.reason) {
      console.warn(`[order ${data.reference}] email skipped: ${emailResult.reason}`);
    }

    return { ok: true as const, reference: data.reference, emailed: emailResult.ok };
  });

// ---------- Admin ----------

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetReceiptUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("order-receipts")
      .createSignedUrl(data.path, 60 * 60);
    if (error || !signed) throw new Error(error?.message ?? "Failed to sign receipt URL");
    return { url: signed.signedUrl };
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["payment_confirmed", "processing", "packed", "shipped", "delivered", "cancelled", "refunded", "payment_failed", "awaiting_payment"]), courierName: z.string().trim().max(160).default(""), trackingNumber: z.string().trim().max(160).default("") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error: readError } = await context.supabase.from("orders").select("*").eq("id", data.id).single();
    if (readError || !row) throw new Error("Order not found");
    validateOrderTransition(row.lifecycle_status as OrderStage, data.status, row.payment_status as Order["payment_status"], data.courierName || row.courier_name, data.trackingNumber || row.tracking_number);
    const { error } = await context.supabase
      .from("orders")
      .update({ lifecycle_status: data.status, payment_status: data.status === "payment_confirmed" ? "paid" : data.status === "refunded" ? "refunded" : data.status === "payment_failed" ? "failed" : row.payment_status, courier_name: data.courierName || row.courier_name, tracking_number: data.trackingNumber || row.tracking_number })
      .eq("id", data.id).eq("lifecycle_status", row.lifecycle_status).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminOrderActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const result = await context.supabase.from("order_activity").select("*").eq("order_id", data.id).order("created_at", { ascending: false });
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const adminSaveOrderNote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), notes: z.string().max(5000) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("orders").update({ internal_notes: data.notes }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUploadOrderProof = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), receipt: z.object({ filename: z.string().max(200), contentType: z.enum(["image/jpeg", "image/png", "application/pdf"]), dataBase64: z.string().max(12_000_000) }) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `${data.id}/${crypto.randomUUID()}-${data.receipt.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const upload = await supabaseAdmin.storage.from("order-receipts").upload(path, Buffer.from(data.receipt.dataBase64, "base64"), { contentType: data.receipt.contentType });
    if (upload.error) throw new Error(upload.error.message);
    const { error } = await context.supabase.from("orders").update({ receipt_path: path }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ reference: z.string().trim().min(4).max(60), email: z.string().trim().email().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.from("orders").select("reference,full_name,items,subtotal_ngn,shipping_ngn,total_ngn,delivery_location,lifecycle_status,payment_status,courier_name,tracking_number,stage_timestamps,created_at").eq("reference", data.reference).ilike("email", data.email.replace(/[%_\\]/g, "\\$&")).maybeSingle();
    if (result.error) throw new Error("Unable to check this order right now");
    return result.data;
  });
