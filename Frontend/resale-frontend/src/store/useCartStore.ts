import { create } from 'zustand';
import { toast } from "sonner";

interface CartItem {
  id: number;
  variantId: number;
  name: string;
  price: number;
  image?: string;
  size: string;
  color: string;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (uniqueKey: string, newQty: number) => void;
  removeFromCart: (uniqueKey: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  count: 0,
  subtotal: 0,

  addToCart: (product) => set((state) => {
    const uniqueKey = `${product.id}-${product.size}-${product.color}`;
    const existingItem = state.items.find(i => `${i.id}-${i.size}-${i.color}` === uniqueKey);

    let newItems;
    if (existingItem) {
      if (existingItem.quantity >= existingItem.stockQuantity) {
        toast.error("Maximum stock reached");
        return state;
      }
      newItems = state.items.map((i) =>
        `${i.id}-${i.size}-${i.color}` === uniqueKey ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...state.items, { ...product, quantity: 1 }];
    }

    return { 
      items: newItems, 
      count: state.count + 1,
      subtotal: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
    };
  }),

  updateQuantity: (uniqueKey, newQty) => set((state) => {
    const item = state.items.find(i => `${i.id}-${i.size}-${i.color}` === uniqueKey);
    if (!item || newQty < 1 || newQty > item.stockQuantity) return state;

    const newItems = state.items.map((i) =>
      `${i.id}-${i.size}-${i.color}` === uniqueKey ? { ...i, quantity: newQty } : i
    );
    
    return { 
      items: newItems, 
      count: newItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
    };
  }),

  removeFromCart: (uniqueKey) => set((state) => {
    const newItems = state.items.filter((i) => `${i.id}-${i.size}-${i.color}` !== uniqueKey);
    return {
      items: newItems,
      count: newItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
    };
  }),

  clearCart: () => set({ items: [], count: 0, subtotal: 0 }),
}));