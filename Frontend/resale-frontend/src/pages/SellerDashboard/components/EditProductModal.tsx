import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, X } from "lucide-react";

export function EditProductModal({ isOpen, onClose, product, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Pre-fill the form when a product is selected
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        brand: product.brand,
        condition: product.condition,
        categoryId: product.categoryId,
        variants: product.variants || []
      });
    }
  }, [product]);

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
        method: "PUT", // Use PUT for industrial standard updates
        body: JSON.stringify(formData)
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] max-h-[90vh] overflow-y-auto p-10">
        <DialogHeader><DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Edit Listing</DialogTitle></DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price</Label>
              <Input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} className="rounded-xl h-12" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Inventory Variants</Label>
              <Button type="button" onClick={addVariant} variant="outline" size="sm" className="rounded-full gap-2 border-zinc-900 h-8"><Plus size={14} /> Add Size</Button>
            </div>
            {formData.variants.map((v: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-end p-4 bg-zinc-50 rounded-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Size</span>
                  <Input value={v.size} onChange={e => handleVariantChange(idx, "size", e.target.value)} placeholder="M" className="h-10 rounded-lg bg-white border-none shadow-sm" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Color</span>
                  <Input value={v.color} onChange={e => handleVariantChange(idx, "color", e.target.value)} placeholder="Black" className="h-10 rounded-lg bg-white border-none shadow-sm" />
                </div>
                <div className="w-20 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Qty</span>
                  <Input type="number" value={v.stockQuantity} onChange={e => handleVariantChange(idx, "stockQuantity", parseInt(e.target.value))} className="h-10 rounded-lg bg-white border-none shadow-sm" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(idx)} className="text-zinc-300 hover:text-red-500"><X size={18} /></Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[100px]" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 bg-black text-white rounded-2xl font-black text-lg shadow-xl hover:bg-zinc-800 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : "SAVE CHANGES"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}