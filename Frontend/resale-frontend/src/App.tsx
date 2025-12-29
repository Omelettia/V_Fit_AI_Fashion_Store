import { Routes, Route } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

// UI Components
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Button } from "@/components/ui/button";
import { Loader2, SlidersHorizontal } from "lucide-react"; 
import { Toaster } from "@/components/ui/sonner";

// Pages
import RegisterPage from "@/pages/Register/RegisterPage";
import LoginPage from "@/pages/Login/LoginPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import SellerDashboardPage from "./pages/SellerDashboard/SellerDashboardPage";
import ProductDetailsPage from "./pages/ProductDetails/ProductDetailsPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import OrderHistoryPage from "@/pages/OrderHistory/OrderHistoryPage";
import PaymentSuccessPage from './pages/Checkout/PaymentSuccessPage';

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Overlay States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Price Filter States
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  //  Fetch Categories Tree (For hierarchy in Drawer and Parents in Bar)
  useEffect(() => {
    apiFetch("/categories")
      .then((data) => {
        setCategories(data);
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const fetchProducts = useCallback(async (
    pageNum: number, 
    search = searchQuery, 
    catId = selectedCategory,
    min = minPrice,
    max = maxPrice
  ) => {
    setLoading(true);
    try {
      let url = `/products?page=${pageNum}&size=8&sort=createdAt,desc`;
      
      // Append Filters to URL
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (catId) url += `&categoryId=${catId}`;
      if (min) url += `&minPrice=${min}`;
      if (max) url += `&maxPrice=${max}`;

      const data = await apiFetch(url);
      
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
  }, [searchQuery, selectedCategory, minPrice, maxPrice]);

  // Sync products on any filter/search/price change
  useEffect(() => {
    setPage(0);
    fetchProducts(0);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-16">
      <Header 
        onOpenCart={() => setIsCartOpen(true)} 
        onSearch={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={
            <div className="space-y-10">
              
              {/* Filter Section */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Horizontal Category Bar (Top Level/Parent Categories Only) */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                      selectedCategory === null ? "bg-black text-white border-black shadow-xl" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                    }`}
                  >
                    All Items
                  </button>
                  {/* Using parentId check to only show main departments in the bar */}
                  {categories.filter(cat => cat.parentId === null).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                        selectedCategory === cat.id ? "bg-black text-white border-black shadow-xl" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <Button 
                    onClick={() => setIsFilterOpen(true)}
                    variant="outline" 
                    className="flex rounded-full px-6 h-11 border-zinc-100 gap-2 text-[10px] font-black uppercase tracking-widest hover:border-black transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Detailed Filters
                  {(minPrice || maxPrice || (selectedCategory && !categories.find(c => c.id === selectedCategory)?.parentId === null)) && (
                     <span className="w-2 h-2 bg-black rounded-full ml-1" />
                  )}
                </Button>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h2 className="text-5xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                    {searchQuery ? `Results for "${searchQuery}"` : "Latest Arrivals"}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-black"></span>
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                      {products.length} {products.length === 1 ? 'Object' : 'Objects'} Synced
                    </p>
                  </div>
                </div>

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
                    [...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-[3/4] bg-zinc-50 rounded-[2.5rem] animate-pulse border border-zinc-100" />
                    ))
                  )}
                </div>

                {!loading && products.length === 0 && (
                   <div className="py-32 text-center space-y-6">
                      <div className="text-6xl text-zinc-100 font-black">NULL_SET</div>
                      <p className="text-zinc-400 font-mono italic text-sm">No items found matching your current filters.</p>
                      <Button 
                        variant="link" 
                        className="uppercase text-[10px] font-black tracking-widest text-zinc-900 underline underline-offset-4"
                        onClick={clearFilters}
                      >
                        Reset Workspace
                      </Button>
                   </div>
                )}

                {hasMore && products.length > 0 && (
                  <div className="flex justify-center pt-12">
                    <Button 
                      variant="outline" 
                      onClick={handleLoadMore} 
                      disabled={loading}
                      className="rounded-[2rem] px-14 h-16 border-2 border-zinc-900 font-black text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all shadow-2xl active:scale-95 group"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Synchronize More <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile/orders" element={<OrderHistoryPage />} />     
          <Route path="/payment-success" element={<PaymentSuccessPage />} />     
          
          <Route 
            path="/product/:id" 
            element={<ProductDetailsPage onOpenCart={() => setIsCartOpen(true)} />} 
          />
        </Routes>
      </main>

      {/* Global Overlays */}
      <FilterDrawer 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
        }}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <Toaster position="bottom-center" richColors />

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 flex w-full border-t bg-white/90 backdrop-blur-xl p-5 justify-around z-50 md:hidden">
        <button onClick={() => window.location.href = "/"} className="text-[10px] font-black uppercase tracking-widest">Home</button>
        <button onClick={() => window.location.href = "/seller/dashboard"} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sell</button>
        <button onClick={() => window.location.href = "/profile"} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile</button>
      </nav>
    </div>
  );
}

export default App;