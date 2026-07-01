import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // slug|color|size
  slug: string;
  name: string;
  color?: string;
  size?: string;
  image: string;
  priceNgn: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalNgn: number;
  addItem: (item: Omit<CartItem, "quantity" | "id"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, q: number) => void;
  clear: () => void;
  openCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "twofourseven.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextValue["addItem"] = useCallback((item) => {
    const id = [item.slug, item.color ?? "", item.size ?? ""].join("|");
    setItems((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        return prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + (item.quantity ?? 1) } : p,
        );
      }
      return [...prev, { ...item, id, quantity: item.quantity ?? 1 }];
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart:open"));
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQty = useCallback((id: string, q: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: Math.max(0, q) } : p))
        .filter((p) => p.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart:open"));
    }
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotalNgn = items.reduce((n, i) => n + i.quantity * i.priceNgn, 0);
    return { items, count, subtotalNgn, addItem, removeItem, updateQty, clear, openCart };
  }, [items, addItem, removeItem, updateQty, clear, openCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
