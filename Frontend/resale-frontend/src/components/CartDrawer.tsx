import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeFromCart, updateQuantity, count, subtotal } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 rounded-l-[3rem] border-l shadow-2xl">
        <SheetHeader className="p-8 border-b bg-zinc-50/50">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase">Your Bag</SheetTitle>
            <div className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{count} Items</div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-8">
          <div className="py-8 space-y-8">
            {items.map((item) => {
              const uniqueKey = `${item.id}-${item.size}-${item.color}`;
              return (
                <div key={uniqueKey} className="flex gap-4 group">
                  <div className="h-24 w-20 rounded-2xl overflow-hidden bg-zinc-100 border shrink-0">
                    <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-zinc-900">{item.name}</h4>
                      <button onClick={() => removeFromCart(uniqueKey)} className="text-zinc-300">✕</button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3 bg-zinc-50 rounded-full p-1 border">
                        <button onClick={() => updateQuantity(uniqueKey, item.quantity - 1)} className="h-7 w-7 rounded-full bg-white">-</button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(uniqueKey, item.quantity + 1)} disabled={item.quantity >= item.stockQuantity} className="h-7 w-7 rounded-full bg-white">+</button>
                      </div>
                      <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {items.length > 0 && (
          <SheetFooter className="p-8 border-t bg-zinc-50/50 flex flex-col gap-6">
            <div className="flex justify-between text-lg font-black italic tracking-tighter uppercase">
              <span>Total</span>
              <span className="text-2xl">${subtotal.toFixed(2)}</span>
            </div>
            <Button onClick={onClose} asChild className="w-full h-16 rounded-2xl bg-black text-white text-lg font-black italic tracking-tighter">
              <Link to="/checkout">CHECKOUT NOW</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}