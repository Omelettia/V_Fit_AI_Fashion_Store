import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { Loader2, UploadCloud, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddProductModal({ isOpen, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  // MATCHING YOUR POSTMAN STRUCTURE
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    basePrice: "", 
    brand: "",       // Added from Postman
    condition: "New", // Added from Postman
    categoryId: "",
  });

  // Example Variant State (Simple version)
  const [variant, setVariant] = useState({
    size: "",
    color: "",
    stockQuantity: 1
  });

  useEffect(() => {
    if (isOpen) {
      apiFetch("/categories")
        .then(setCategories)
        .catch(console.error);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0) return alert("Please upload photos");
    
    setLoading(true);
    try {
      // 1. Create Product with Variants (Matching Postman)
      const productPayload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        categoryId: parseInt(formData.categoryId),
        variants: [variant] // Sending as an array as per your Postman example
      };

      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(productPayload)
      });

      // 2. Upload Images
      const imageFormData = new FormData();
      selectedImages.forEach(file => imageFormData.append("files", file));

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${product.id}/upload-images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: imageFormData
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to list product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic tracking-tighter text-zinc-900">LIST ITEM</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Visuals Section */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visuals</Label>
            <div className="grid grid-cols-3 gap-3">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border bg-zinc-50 shadow-inner">
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"><X size={14} /></button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50">
                <UploadCloud size={24} className="text-zinc-300" />
                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Item Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Leather Boots" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price ($)</Label>
              <Input required type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          {/* New Fields: Brand and Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Brand</Label>
              <Input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Timber" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Condition</Label>
              <Input required value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} placeholder="New / Used" />
            </div>
          </div>

          {/* Simple Variant Inputs */}
          <div className="p-4 bg-zinc-50 rounded-2xl space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Single Variant (Quick Stock)</Label>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Size" value={variant.size} onChange={e => setVariant({...variant, size: e.target.value})} />
                <Input placeholder="Color" value={variant.color} onChange={e => setVariant({...variant, color: e.target.value})} />
                <Input type="number" placeholder="Qty" value={variant.stockQuantity} onChange={e => setVariant({...variant, stockQuantity: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</Label>
            <Select 
              onValueChange={(value) => setFormData({...formData, categoryId: value})}
              value={formData.categoryId}
            >
              <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:ring-2 focus:ring-black outline-none">
                <SelectValue placeholder="Select a sub-category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((lvl1) => (
                  <SelectGroup key={lvl1.id}>
                    <SelectLabel className="px-2 py-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50/50">
                      {lvl1.name}
                    </SelectLabel>
                    
                    {lvl1.subCategories?.map((lvl2: any) => (
                      <div key={lvl2.id}>
                        {/* If lvl2 has no children, it's selectable */}
                        {!lvl2.subCategories || lvl2.subCategories.length === 0 ? (
                          <SelectItem value={lvl2.id.toString()} className="pl-4">
                            {lvl2.name}
                          </SelectItem>
                        ) : (
                          <>
                            {/* If lvl2 HAS children, it acts as a header for lvl3 */}
                            <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 italic">
                              — {lvl2.name}
                            </div>
                            {lvl2.subCategories.map((lvl3: any) => (
                              <SelectItem key={lvl3.id} value={lvl3.id.toString()} className="pl-6">
                                {lvl3.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </div>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
            <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 bg-black text-white rounded-2xl font-bold">
            {loading ? <Loader2 className="animate-spin" /> : "PUBLISH LISTING"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}