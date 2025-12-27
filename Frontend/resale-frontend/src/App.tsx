import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// UI Components
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

// Pages
import RegisterPage from "@/pages/Register/RegisterPage";
import LoginPage from "@/pages/Login/LoginPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import SellerDashboardPage from "./pages/SellerDashboard/SellerDashboardPage";
import ProductDetailsPage from "./pages/ProductDetails/ProductDetailsPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import OrderHistoryPage from "@/pages/OrderHistory/OrderHistoryPage";

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Industrial Standard: Centralized Drawer State
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. Fetch products from the Spring Boot backend
  const fetchProducts = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/products?page=${pageNum}&size=8&sort=createdAt,desc`);
      
      if (pageNum === 0) {
        setProducts(data.content); 
      } else {
        setProducts(prev => [...prev, ...data.content]);
      }
      setHasMore(!data.last); 
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-16">
      {/* 2. Pass open handler to Header */}
      <Header onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={
            <div className="space-y-8">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-900">
                Latest Arrivals
              </h2>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {products.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    id={item.id}
                    name={item.name}
                    price={item.basePrice}
                    image={item.images?.[0]?.url} 
                    brand={item.brand}
                  />
                ))}
                
                {loading && products.length === 0 && (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-zinc-100 rounded-3xl animate-pulse" />
                  ))
                )}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore} 
                    disabled={loading}
                    className="rounded-full px-10 h-12 border-2 border-zinc-100 font-bold"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "SHOW MORE"}
                  </Button>
                </div>
              )}
            </div>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile/orders" element={<OrderHistoryPage />} />         
          
          <Route 
            path="/product/:id" 
            element={<ProductDetailsPage onOpenCart={() => setIsCartOpen(true)} />} 
          />
        </Routes>
      </main>

      {/* Persistent Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Global Toast Provider */}
      <Toaster position="bottom-center" richColors />

      <nav className="fixed bottom-0 flex w-full border-t bg-white p-4 justify-around z-50 md:hidden">
        <button onClick={() => window.location.href = "/"} className="text-[10px] font-black uppercase tracking-widest">Home</button>
        <button onClick={() => window.location.href = "/seller/dashboard"} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sell</button>
        <button onClick={() => window.location.href = "/profile"} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile</button>
      </nav>
    </div>
  );
}

export default App;