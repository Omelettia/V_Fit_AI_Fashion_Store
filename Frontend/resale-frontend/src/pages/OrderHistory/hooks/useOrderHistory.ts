import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { Order } from "@/types"; 

export function useOrderHistory(mode: "buying" | "selling") {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const endpoint = mode === "buying" ? "/orders/my-history" : "/orders/my-sales";
        const data = await apiFetch(endpoint);
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [mode]); // Re-run when mode changes

  return { orders, loading };
}