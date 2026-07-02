import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { useCart } from "@/lib/cart";
import { formatNgn, formatEur } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — TWOFOURSEVEN" },
      { name: "description", content: "Secure on-site checkout with bank transfer and receipt upload." },
    ],
  }),
  component: CheckoutPage,
});

const bank = [
  { label: "Bank", value: "Access Bank" },
  { label: "Account Number", value: "8127106754" },
  { label: "Account Name", value: "Ibrahim Lekan Osho" },
];

type Details = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal: string;
};

const EMPTY: Details = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal: "",
};

function CheckoutPage() {
  const { items, subtotalNgn, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<Details>(EMPTY);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinueStep1 = useMemo(
    () =>
      details.fullName.trim() &&
      /.+@.+\..+/.test(details.email) &&
      details.phone.trim() &&
      details.address.trim() &&
      details.city.trim() &&
      details.country.trim(),
    [details],
  );

  const orderRef = useMemo(
    () => `247-${Date.now().toString(36).toUpperCase()}`,
    [],
  );

  function update<K extends keyof Details>(k: K, v: Details[K]) {
    setDetails((d) => ({ ...d, [k]: v }));
  }

  async function handleSubmit() {
    setError(null);
    if (!receipt) {
      setError("Please upload your payment receipt to continue.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setSubmitting(true);

    // Compose email body
    const lines = [
      `New order — ${orderRef}`,
      "",
      "CUSTOMER",
      `Name: ${details.fullName}`,
      `Email: ${details.email}`,
      `Phone: ${details.phone}`,
      "",
      "SHIPPING",
      `${details.address}`,
      `${details.city}, ${details.state} ${details.postal}`,
      `${details.country}`,
      "",
      "ITEMS",
      ...items.map(
        (i) =>
          `- ${i.name}${i.color ? ` / ${i.color}` : ""}${i.size ? ` / ${i.size}` : ""} × ${i.quantity} — ${formatNgn(i.priceNgn * i.quantity)}`,
      ),
      "",
      `Subtotal: ${formatNgn(subtotalNgn)} (${formatEur(subtotalNgn)})`,
      "",
      "PAYMENT",
      `Method: Bank Transfer — Access Bank 8127106754 (Ibrahim Lekan Osho)`,
      `Receipt file: ${receipt.name} (${Math.round(receipt.size / 1024)} KB) — attach the file downloaded to your device.`,
    ].join("\n");

    // Trigger a local download so the shop owner / customer keeps a copy of the receipt
    try {
      const url = URL.createObjectURL(receipt);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${orderRef}-${receipt.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {}

    // Open mail client prefilled to the shop
    const mailto = `mailto:247.freeworld@gmail.com?subject=${encodeURIComponent(
      `Order ${orderRef} — ${details.fullName}`,
    )}&body=${encodeURIComponent(lines)}`;
    window.location.href = mailto;

    // Clear cart and route to confirmation
    setTimeout(() => {
      clear();
      navigate({ to: "/thank-you", search: { ref: orderRef } });
    }, 400);
  }

  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-24 sm:px-8 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-muted-foreground">Checkout</p>
          <h1 className="mt-5 font-serif text-4xl font-light leading-[1.05] text-foreground sm:text-6xl">
            Complete your order.
          </h1>

          {/* Step indicator */}
          <ol className="mt-12 flex items-center gap-4 text-xs tracking-[0.25em] uppercase">
            {["Details", "Review", "Payment"].map((label, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const active = step === n;
              const done = step > n;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`grid h-7 w-7 place-items-center border ${
                      active || done
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {n}
                  </span>
                  <span className={active ? "text-foreground" : "text-muted-foreground"}>
                    {label}
                  </span>
                  {i < 2 && <span className="mx-2 h-px w-8 bg-border" />}
                </li>
              );
            })}
          </ol>

          {items.length === 0 && (
            <div className="mt-12 border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Your bag is empty.</p>
              <Link to="/shop" className="mt-4 inline-block underline underline-offset-4">
                Continue Shopping
              </Link>
            </div>
          )}

          {items.length > 0 && step === 1 && (
            <div className="mt-12 space-y-6">
              <h2 className="font-serif text-2xl font-light">Contact & Shipping</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full Name" value={details.fullName} onChange={(v) => update("fullName", v)} />
                <Field label="Email" type="email" value={details.email} onChange={(v) => update("email", v)} />
                <Field label="Phone" value={details.phone} onChange={(v) => update("phone", v)} />
                <Field label="Country" value={details.country} onChange={(v) => update("country", v)} />
                <Field className="sm:col-span-2" label="Shipping Address" value={details.address} onChange={(v) => update("address", v)} />
                <Field label="City" value={details.city} onChange={(v) => update("city", v)} />
                <Field label="State / Region" value={details.state} onChange={(v) => update("state", v)} />
                <Field label="Postal Code" value={details.postal} onChange={(v) => update("postal", v)} />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  disabled={!canContinueStep1}
                  onClick={() => setStep(2)}
                  className="eyebrow border border-foreground bg-foreground px-8 py-4 text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {items.length > 0 && step === 2 && (
            <div className="mt-12 space-y-8">
              <h2 className="font-serif text-2xl font-light">Review Order</h2>
              <ul className="divide-y divide-border border-y border-border">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-4 py-4">
                    <img src={i.image} alt={i.name} className="h-16 w-16 object-cover" />
                    <div className="flex-1 text-sm">
                      <p>{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[i.color, i.size].filter(Boolean).join(" / ")} · Qty {i.quantity}
                      </p>
                    </div>
                    <p className="text-sm">{formatNgn(i.priceNgn * i.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-muted-foreground">Subtotal</span>
                <span className="text-base">
                  {formatNgn(subtotalNgn)} <span className="text-muted-foreground text-sm">/ {formatEur(subtotalNgn)}</span>
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong className="text-foreground">Ship to:</strong> {details.fullName}</p>
                <p>{details.address}, {details.city}, {details.state} {details.postal}, {details.country}</p>
                <p>{details.email} · {details.phone}</p>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="eyebrow underline underline-offset-4">
                  ← Edit Details
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="eyebrow border border-foreground bg-foreground px-8 py-4 text-background transition-opacity hover:opacity-80"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {items.length > 0 && step === 3 && (
            <div className="mt-12 space-y-10">
              <div>
                <p className="eyebrow text-muted-foreground">Step 03</p>
                <h2 className="mt-3 font-serif text-2xl font-light">Payment — Bank Transfer</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Transfer the total below to the account, then upload your receipt.
                </p>
              </div>

              <div className="border border-foreground/20 bg-secondary/40 p-6 sm:p-8">
                <dl className="divide-y divide-border">
                  {bank.map((b) => (
                    <div key={b.label} className="flex items-center justify-between py-3">
                      <dt className="eyebrow text-muted-foreground">{b.label}</dt>
                      <dd className="text-sm font-medium text-foreground sm:text-base">{b.value}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3">
                    <dt className="eyebrow text-muted-foreground">Amount</dt>
                    <dd className="text-sm font-medium sm:text-base">{formatNgn(subtotalNgn)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="eyebrow text-muted-foreground">Reference</dt>
                    <dd className="text-sm font-mono">{orderRef}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="eyebrow text-foreground">Payment Verification</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a screenshot or PDF of your transfer receipt (.jpg, .png, .pdf).
                </p>
                <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border bg-background px-6 py-10 text-center transition-colors hover:border-foreground">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f && f.size > 8 * 1024 * 1024) {
                        setError("File too large. Max 8MB.");
                        return;
                      }
                      setError(null);
                      setReceipt(f);
                    }}
                  />
                  {receipt ? (
                    <>
                      <p className="text-sm text-foreground">{receipt.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(receipt.size / 1024)} KB · Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="eyebrow text-foreground">Upload Receipt</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG or PDF · up to 8MB</p>
                    </>
                  )}
                </label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                <button onClick={() => setStep(2)} className="eyebrow underline underline-offset-4">
                  ← Back to Review
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !receipt}
                  className="eyebrow border border-foreground bg-foreground px-8 py-4 text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {submitting ? "Submitting…" : "Complete Order"}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Submitting opens your email app to send the order to 247.freeworld@gmail.com.
                Please attach the receipt file (it will be downloaded automatically for convenience).
              </p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}
