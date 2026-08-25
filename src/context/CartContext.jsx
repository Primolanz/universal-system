import { createContext, useContext, useEffect, useMemo, useState } from "react";
const C = createContext(null);
export function CartProvider({ children }) {
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem("universal-store-cart") || "[]"),
  );
  useEffect(
    () => localStorage.setItem("universal-store-cart", JSON.stringify(items)),
    [items],
  );
  const value = useMemo(
    () => ({
      items,
      addProduct: (p) =>
        setItems((x) =>
          x.some((i) => i.id === p.id)
            ? x.map((i) =>
                i.id === p.id && i.quantity < Number(p.stock || 0)
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              )
            : Number(p.stock || 0) > 0
              ? [...x, { ...p, quantity: 1 }]
              : x,
        ),
      removeProduct: (id) => setItems((x) => x.filter((i) => i.id !== id)),
      increaseQuantity: (id) =>
        setItems((x) =>
          x.map((i) =>
            i.id === id && i.quantity < Number(i.stock || 0)
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        ),
      decreaseQuantity: (id) =>
        setItems((x) =>
          x.flatMap((i) =>
            i.id === id
              ? i.quantity > 1
                ? [{ ...i, quantity: i.quantity - 1 }]
                : []
              : [i],
          ),
        ),
      clearCart: () => setItems([]),
      total: items.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
    }),
    [items],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useCart = () => useContext(C);
