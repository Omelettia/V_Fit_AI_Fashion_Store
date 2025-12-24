import { useState } from "react";
import { Loader2, Plus, LayoutDashboard, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

// Industrial Standard: Component decomposition for maintainability
import { ListingStats } from "./components/ListingStats";
import { ProductList } from "./components/ProductList";
import { AddProductModal } from "./components/AddProductModal";
import { EditProductModal } from "./components/EditProductModal";

// Auth and Data Management Hooks
import { useAuth } from "@/context/AuthContext"; 
import { useSellerData } from "./hooks/useSellerData";

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  
  // State management for Creation Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State management for Editing Workflow
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Initialize data with fallback to prevent rendering crashes
  const { stats, products = [], loading: dataLoading, refreshData } = useSellerData(user?.id);

  /**
   * Handler to trigger the edit workflow.
   * Captured by the ProductList and passed back up here.
   */
  const handleEditInitiated = (product: any) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // 1. Initial Identity Check (Global Auth Context)
  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50/50">
        <Loader2 className="animate-spin text-zinc-900 mb-4" size={40} />
        <p className="text-zinc-500 font-medium animate-pulse">Identifying seller session...</p>
      </div>
    );
  }

  // 2. Role-Based Access Control (RBAC)
  const isSeller = user?.roles?.some((r: any) => r.name === "ROLE_SELLER");
  if (!user || !isSeller) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <Store size={32} />
          </div>
          <h2 className="text-2xl font-bold italic tracking-tighter uppercase">Access Denied</h2>
          <p className="text-zinc-500">Activate Seller Mode in your profile to access the Studio.</p>
          <Button variant="outline" onClick={() => window.location.href = "/profile"}>Return to Profile</Button>
        </div>
      </div>
    );
  }

  // 3. Feature Data Syncing
  if (dataLoading && products.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50/50">
        <Loader2 className="animate-spin text-zinc-900 mb-4" size={40} />
        <p className="text-zinc-500 font-medium">Syncing your studio data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10 border-zinc-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <LayoutDashboard size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Workspace</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-zinc-900 leading-none uppercase">STUDIO</h1>
          <p className="text-zinc-500 text-sm font-medium max-w-sm">
            Welcome back, {user.firstName}. You have {products?.length || 0} active listings.
          </p>
        </div>

        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="rounded-2xl h-14 px-10 bg-black text-white hover:bg-zinc-800 shadow-2xl transition-all active:scale-95 group"
        >
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> 
          List New Item
        </Button>
      </div>

      {/* Stats Overview Component */}
      <ListingStats stats={stats} />

      {/* Inventory Table */}
      <div className="space-y-6">
        <h2 className="text-xl font-black italic text-zinc-900 uppercase tracking-tighter px-2">Inventory Management</h2>
        <ProductList 
          products={products} 
          onEdit={handleEditInitiated} // Fixes the Missing Property error
        />
      </div>

      {/* Creation Workflow Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onRefresh={refreshData} 
        sellerId={user.id}
      />

      {/* Editing Workflow Modal */}
      <EditProductModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onRefresh={refreshData}
      />

    </div>
  );
}