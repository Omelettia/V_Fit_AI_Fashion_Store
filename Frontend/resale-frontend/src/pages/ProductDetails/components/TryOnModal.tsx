import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { Loader2, Download, Save, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function TryOnModal({ isOpen, onClose, user, productImage, onUpdate }: any) {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedPhoto) return toast.error("Please select a photo first");
    
    setIsGenerating(true);
    try {
      const response = await apiFetch(`/products/try-on?personUri=${selectedPhoto.gcsUri}&productUri=${productImage}`, {
          method: "POST"
      });
      
      setResultImage(response.imageUrl); 
      toast.success("Look generated!");
    } catch (err) {
      toast.error("AI Generation failed. Check your cloud configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToProfile = async () => {
    if (!resultImage) return;
    
    setIsSaving(true);
    try {
      await apiFetch(`/users/${user.id}/save-ai-photo`, {
        method: "POST",
        body: JSON.stringify({ base64Image: resultImage })
      });
      
      toast.success("Added to your gallery!");
      
      // Refresh the profile gallery if the callback exists
      if (onUpdate) {
        await onUpdate(); 
    } 
      
    } catch (err) {
      toast.error("Failed to save to profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image saved to your device!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[3rem] p-8 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <Sparkles className="text-purple-500" /> Virtual Fitting Room
          </DialogTitle>
        </DialogHeader>

        {!resultImage ? (
          <div className="space-y-6">
            <p className="text-sm text-zinc-500 font-medium">Select a body shot to see how this item fits.</p>
            <div className="grid grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto p-1">
              {user?.photos?.map((photo: any) => (
                <div 
                  key={photo.id} 
                  onClick={() => setSelectedPhoto(photo)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-4 transition-all cursor-pointer ${
                    selectedPhoto?.id === photo.id ? "border-black scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={photo.url} className="object-cover h-full w-full" alt="Gallery" />
                  {selectedPhoto?.id === photo.id && (
                    <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full"><CheckCircle2 size={12} /></div>
                  )}
                </div>
              ))}
            </div>

            <Button 
              disabled={isGenerating || !selectedPhoto} 
              onClick={handleGenerate}
              className="w-full h-16 rounded-2xl bg-black text-white font-black italic tracking-tighter transition-transform active:scale-95"
            >
              {isGenerating ? <><Loader2 className="animate-spin mr-2" /> STYLING YOUR LOOK...</> : "GENERATE TRY-ON"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border shadow-2xl bg-zinc-50 relative">
              <img src={resultImage} className="w-full h-full object-cover animate-in zoom-in duration-700" alt="Result" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-14 rounded-2xl gap-2 font-bold uppercase" onClick={handleDownload}>
                <Download size={18} /> Download
              </Button>
              <Button 
                disabled={isSaving}
                onClick={handleSaveToProfile}
                className="h-14 rounded-2xl gap-2 font-bold uppercase bg-zinc-900 text-white"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Add to Profile</>}
              </Button>
            </div>
            
            <Button variant="ghost" onClick={() => setResultImage(null)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Try with another photo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}