import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, CreditCard, Clock } from "lucide-react";
import { format, parseISO } from "date-fns"; 
import type { OrderDetail, OrderItem } from "@/types";
interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-10 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
              Order Details
            </DialogTitle>
            <Badge className="rounded-full bg-zinc-100 text-zinc-900 px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none">
              {order.status}
            </Badge>
          </div>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
            ID: #{order.orderId}
          </p>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
            {order.orderDate && (
              <span className="flex items-center gap-1.5 border-l pl-4 border-zinc-200">
                <Clock size={14} className="text-zinc-300" />
                {format(parseISO(order.orderDate), "MMM dd, yyyy '•' hh:mm a")}
              </span>
            )}
        </div>
        <div className="space-y-10 mt-8">
          {/* Shipping Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Shipping Destination
              </span>
            </div>
            <div className="bg-zinc-50 p-6 rounded-[1.5rem] border border-zinc-100 space-y-1">
              {/* receiverName comes from OrderResponseDto */}
              <p className="font-bold text-zinc-900">
                {order.receiverName || "Customer"}
              </p>
              {/* shippingAddress is a pre-formatted string from the backend */}
              <p className="text-sm text-zinc-500 leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Package size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Purchased Items
              </span>
            </div>
            <div className="space-y-3">
              {/* Explicitly typing 'item' and 'idx' fixes the 'any' type errors */}
              {order.items?.map((item: OrderItem, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-2xl hover:border-black transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden border">
                       <img 
                         src={item.imageUrl || "/placeholder.png"} 
                         className="object-cover w-full h-full" 
                         alt={item.productName} 
                       />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-zinc-900">{item.productName}</p>
                      
                      {/* Variant Info: Size and Color badges */}
                      <div className="flex gap-1.5">
                        {item.size && (
                          <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-400 font-black uppercase">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-sm text-zinc-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="pt-6 border-t flex justify-between items-end">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Method
                </span>
                <div className="flex items-center gap-2 text-zinc-900 text-xs font-bold uppercase tracking-widest">
                   <CreditCard size={14} /> {order.paymentMethod}
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                  Grand Total
                </p>
                <p className="text-4xl font-black italic tracking-tighter text-zinc-900">
                  ${order.totalAmount.toFixed(2)}
                </p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}