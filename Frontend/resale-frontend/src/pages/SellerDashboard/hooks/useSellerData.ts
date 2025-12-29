import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export function useSellerData(sellerId: number | undefined) {
  const [stats, setStats] = useState({ totalRevenue: 0, activeListings: 0, totalSales: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
   
    if (!sellerId) return;
    
    setLoading(true);
    try {
      const [statsData, productsData] = await Promise.all([
        apiFetch("/seller/stats"),    
        apiFetch("/seller/products")  
      ]);

      setStats(statsData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading seller data:", err);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { stats, products, loading, refreshData };
}