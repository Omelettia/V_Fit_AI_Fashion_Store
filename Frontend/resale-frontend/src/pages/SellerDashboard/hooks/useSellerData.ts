import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export function useSellerData(sellerId: number) {
  const [stats, setStats] = useState({ totalRevenue: 0, activeListings: 0, totalSales: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    
    try {
      const [statsData, productsData] = await Promise.all([
        apiFetch(`/seller/stats?sellerId=${sellerId}`),
        apiFetch(`/seller/products?sellerId=${sellerId}`)
        
      ]);
      setStats(statsData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading seller data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) refreshData();
  }, [sellerId]);

  return { stats, products, loading, refreshData };
}