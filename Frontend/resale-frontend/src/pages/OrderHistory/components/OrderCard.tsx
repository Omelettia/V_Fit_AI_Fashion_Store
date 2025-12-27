import { Calendar, CreditCard, Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group p-6 rounded-[2rem] border bg-white hover:border-black transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
    >
      <div className="flex gap-6 items-center">
        {/* Visual Icon Container */}
        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors">
          <Package size={28} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 uppercase tracking-tighter">
              Order #{order.orderId}
            </span>
            <Badge className="rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 border-none px-3 py-1">
              {order.status}
            </Badge>
          </div>
          
          <div className="text-xs text-zinc-400 font-bold flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> 
              {/* Ensure date-fns is installed for this formatting */}
              {order.orderDate ? format(new Date(order.orderDate), "MMM dd, yyyy") : "N/A"}
            </span>
            <span className="flex items-center gap-1 uppercase">
              <CreditCard size={12} /> {order.paymentMethod}
            </span>
          </div>
          
          {/* Displays the summarized item list from the Backend */}
          {order.itemSummaries && order.itemSummaries.length > 0 && (
            <p className="text-xs text-zinc-500 mt-2 italic line-clamp-1">
              {order.itemSummaries.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
            Total Value
          </p>
          <p className="text-2xl font-black italic tracking-tighter text-zinc-900">
            ${order.totalAmount?.toFixed(2) || "0.00"}
          </p>
        </div>
        
        {/* Interactive Chevron */}
        <div className="p-3 rounded-full bg-zinc-50 group-hover:bg-black group-hover:text-white transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}