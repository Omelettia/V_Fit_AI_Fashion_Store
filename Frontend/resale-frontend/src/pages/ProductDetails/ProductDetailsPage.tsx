import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShoppingBag, ShieldCheck, Truck, ArrowLeft, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuth } from "@/context/AuthContext";

// Sub-components
import { ImageGallery } from "./components/ImageGallery";
import { VariantPicker } from "./components/VariantPicker";
import { TryOnModal } from "./components/TryOnModal"; 

export default function ProductDetailsPage({ onOpenCart }: { onOpenCart: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user,refreshUser } = useAuth(); 
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiFetch(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-zinc-900" size={48} />
    </div>
  );

  if (!product) return <div className="p-20 text-center">Listing not found.</div>;

  const handleAddToCart = () => {
    if (!selectedVariant) return toast.error("Please select a size first");
    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.images?.[0]?.url,
      size: selectedVariant.size,
      color: selectedVariant.color,
      variantId: selectedVariant.id,
      stockQuantity: selectedVariant.stockQuantity
    });
    toast.success(`${product.name} added to bag`, {
      action: { label: "VIEW BAG", onClick: onOpenCart },
    });
  };

  const handleUpdate = async () => {
    // If your AuthContext has a way to re-fetch the user profile, call it here
    if (refreshUser) {
      await refreshUser();
      toast.success("Gallery synchronized!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-black mb-10 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <ImageGallery 
            images={product.images?.map((img: any) => img.url) || []} 
            name={product.name} 
          />
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-10">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge className="rounded-full px-4 bg-zinc-100 text-zinc-900 border-none font-bold text-[10px] uppercase">{product.condition}</Badge>
              <Badge variant="outline" className="rounded-full px-4 border-zinc-200 text-zinc-400 font-bold text-[10px] uppercase">{product.brand || "Vintage"}</Badge>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-zinc-900 uppercase leading-none">{product.name}</h1>
            <p className="text-3xl font-black italic tracking-tighter text-zinc-900">${product.basePrice.toFixed(2)}</p>
          </div>

          <VariantPicker variants={product.variants} selectedVariant={selectedVariant} onSelect={setSelectedVariant} />

          <div className="pt-6 space-y-4">
            {/* AI TRY-ON TRIGGER BUTTON */}
            <Button 
              onClick={() => setIsTryOnOpen(true)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-zinc-200 hover:border-black flex gap-2 font-bold uppercase tracking-widest transition-all"
            >
              <Sparkles size={18} className="text-purple-500" /> Virtual Fitting Room
            </Button>

            <Button onClick={handleAddToCart} className="w-full h-20 rounded-[2rem] bg-black text-white text-xl font-black italic tracking-tighter shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 flex gap-3">
              <ShoppingBag size={24} /> ADD TO BAG
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 py-6 border-y border-zinc-100 text-zinc-500 text-xs font-medium">
              <div className="flex items-center gap-3"><ShieldCheck size={18} /> Verified Authenticity</div>
              <div className="flex items-center gap-3"><Truck size={18} /> Priority Shipping</div>
          </div>
        </div>
      </div>

      {/* AI MODAL COMPONENT */}
      <TryOnModal 
        isOpen={isTryOnOpen} 
        onClose={() => setIsTryOnOpen(false)} 
        user={user}
        productImage={product.images?.[0]?.gcsUri}
        onUpdate={handleUpdate}
      />
    </div>
  );
}