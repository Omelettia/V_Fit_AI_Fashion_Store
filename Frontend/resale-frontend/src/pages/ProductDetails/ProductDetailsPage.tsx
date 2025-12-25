import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShoppingBag, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

// Sub-components
import { ImageGallery } from "./components/ImageGallery";
import { VariantPicker } from "./components/VariantPicker";

interface ProductDetailsProps {
  onOpenCart: () => void;
}

export default function ProductDetailsPage({ onOpenCart }: ProductDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
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
    if (!selectedVariant) {
      return toast.error("Please select a size/color first");
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.imageUrls?.[0],
      size: selectedVariant.size,
      color: selectedVariant.color,
      variantId: selectedVariant.id,
      stockQuantity: selectedVariant.stockQuantity
    });

    //Toast Notification with Shortcut to Cart
    toast.success(`${product.name} added to bag`, {
      description: `Size: ${selectedVariant.size} • $${product.basePrice.toFixed(2)}`,
      action: {
        label: "VIEW BAG",
        onClick: () => onOpenCart(), // Opens the Drawer via prop
      },
      className: "rounded-2xl font-bold italic tracking-tighter uppercase border-none shadow-2xl",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-zinc-400 hover:text-black mb-10 transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Gallery (7 columns) */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.imageUrls || []} name={product.name} />
        </div>

        {/* Right: Product Info (5 columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-10">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-full px-4 bg-zinc-100 text-zinc-900 border-none font-bold text-[10px] uppercase tracking-widest">
                {product.condition}
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 border-zinc-200 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                {product.brand || "Vintage"}
              </Badge>
            </div>
            
            <h1 className="text-6xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
              {product.name}
            </h1>
            
            <p className="text-3xl font-black italic tracking-tighter text-zinc-900">
              ${product.basePrice.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
            <p className="text-zinc-500 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          <VariantPicker 
            variants={product.variants} 
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <div className="pt-6 space-y-6">
            <Button 
              onClick={handleAddToCart}
              className="w-full h-20 rounded-[2rem] bg-black text-white text-xl font-black italic tracking-tighter shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 flex gap-3"
            >
              <ShoppingBag size={24} /> ADD TO BAG
            </Button>
            
            <div className="grid grid-cols-1 gap-4 py-6 border-y border-zinc-100">
              <div className="flex items-center gap-3 text-zinc-500 text-xs font-medium">
                <div className="p-2 bg-zinc-50 rounded-full text-zinc-900"><ShieldCheck size={18} /></div>
                Verified Authenticity & Condition
              </div>
              <div className="flex items-center gap-3 text-zinc-500 text-xs font-medium">
                <div className="p-2 bg-zinc-50 rounded-full text-zinc-900"><Truck size={18} /></div>
                Priority Shipping from {product.sellerShopName || "The Studio"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}