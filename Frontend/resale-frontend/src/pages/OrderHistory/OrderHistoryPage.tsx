import { useState } from "react";
import { useOrderHistory } from "./hooks/useOrderHistory";
import { OrderCard } from "./components/OrderCard";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { apiFetch } from "@/lib/api";

export default function OrderHistoryPage() {
  const [view, setView] = useState<"buying" | "selling">("buying");
  const { orders, loading } = useOrderHistory(view);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetails = async (orderId: string) => {
    try {
      const detail = await apiFetch(`/orders/${orderId}`);
      setSelectedOrder(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to load details");
    }
  };

  return (
  <div className="max-w-4xl mx-auto p-12">
    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
      <div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-zinc-900">
          Activity
        </h1>
        <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-2">
          Manage your transactions and history
        </p>
      </div>

      {/* --- THE TOGGLE UI --- */}
      <div className="flex bg-zinc-100 p-1 rounded-2xl border">
        <button
          onClick={() => setView("buying")}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            view === "buying" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Buying
        </button>
        <button
          onClick={() => setView("selling")}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            view === "selling" 
              ? "bg-white text-zinc-900 shadow-sm" 
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Selling
        </button>
      </div>
    </div>

    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-20 text-zinc-400 font-black uppercase animate-pulse">
          Loading history...
        </div>
      ) : orders.length > 0 ? (
        orders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            onClick={() => handleOpenDetails(order.orderId)}
          />
        ))
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-[2rem] text-zinc-400 font-bold">
          No {view} history found.
        </div>
      )}
    </div>

    <OrderDetailModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      order={selectedOrder}
    />
  </div>
);
}