import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function EditProductModal({ isOpen, onClose, product, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null); // Track specific image deletion
  const [formData, setFormData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        brand: product.brand,
        condition: product.condition,
        categoryId: product.categoryId,
        variants: product.variants || [],
        images: product.images || [] 
      });
    }
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);

    const data = new FormData();
    Array.from(e.target.files).forEach(file => data.append("files", file));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${product.id}/upload-images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: data
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const updatedProduct = await response.json();
      setFormData({ ...formData, images: updatedProduct.images });
      toast.success("Media assets uploaded");
      onRefresh();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    setDeletingId(imageId);
    try {
      await apiFetch(`/products/${product.id}/images/${imageId}`, {
        method: "DELETE"
      });
      
      setFormData({
        ...formData,
        images: formData.images.filter((img: any) => img.id !== imageId)
      });
      toast.success("Asset removed");
      onRefresh();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ... handleVariantChange, addVariant, removeVariant remain same ...
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: "", color: "", stockQuantity: 1 }]
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      toast.success("Listing details updated");
      onRefresh();
      onClose();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] max-h-[90vh] overflow-y-auto p-12 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">
            Edit Listing
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-10 pt-6">
          <div className="space-y-4">
            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Product Media
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images.map((img: any) => (
                <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border transition-all hover:border-black">
                  <img src={img.url} className="object-cover w-full h-full" alt="Product" />
                  
                  {/* PROFESSIONAL ALERT DIALOG FOR IMAGES */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        type="button"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        {deletingId === img.id ? <Loader2 className="animate-spin" /> : <Trash2 size={20} />}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] p-8">
                      <AlertDialogHeader>
                        <div className="bg-red-50 text-red-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
                            <AlertTriangle size={24} />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                            Remove Image
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 font-medium">
                          Are you sure? This will permanently delete this product photo from your listing and storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="rounded-2xl font-bold uppercase text-xs h-12">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteImage(img.id)}
                          className="rounded-2xl font-bold uppercase text-xs h-12 bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-black hover:text-black transition-all bg-zinc-50/50"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <><Plus size={24} /><span className="text-[9px] font-black uppercase mt-1">Add</span></>}
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleImageUpload} accept="image/*" />
          </div>

          {/* ... Rest of form inputs (Name, Price, Variants, Description) same as before ... */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Product Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl h-14 bg-zinc-50 border-none shadow-inner" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Base Price ($)</Label>
              <Input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} className="rounded-2xl h-14 bg-zinc-50 border-none shadow-inner" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Inventory Variants</Label>
              <Button type="button" onClick={addVariant} variant="outline" size="sm" className="rounded-full gap-2 border-zinc-900 h-9 px-5 font-bold text-[10px] uppercase"><Plus size={14} /> Add Size</Button>
            </div>
            <div className="space-y-3">
              {formData.variants.map((v: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-end p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase italic">Size</span>
                    <Input value={v.size} onChange={e => handleVariantChange(idx, "size", e.target.value)} placeholder="M" className="h-11 rounded-xl bg-white border-none shadow-sm" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase italic">Color</span>
                    <Input value={v.color} onChange={e => handleVariantChange(idx, "color", e.target.value)} placeholder="Black" className="h-11 rounded-xl bg-white border-none shadow-sm" />
                  </div>
                  <div className="w-24 space-y-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase italic">Stock</span>
                    <Input type="number" value={v.stockQuantity} onChange={e => handleVariantChange(idx, "stockQuantity", parseInt(e.target.value))} className="h-11 rounded-xl bg-white border-none shadow-sm" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(idx)} className="text-zinc-300 hover:text-red-500 hover:bg-red-50 mb-0.5"><X size={20} /></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-2xl min-h-[120px] bg-zinc-50 border-none shadow-inner p-4" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-16 bg-black text-white rounded-[1.5rem] font-black text-xl shadow-2xl hover:bg-zinc-800 transition-all hover:scale-[1.01] active:scale-[0.99]">
            {loading ? <Loader2 className="animate-spin" /> : "UPDATE LISTING"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}