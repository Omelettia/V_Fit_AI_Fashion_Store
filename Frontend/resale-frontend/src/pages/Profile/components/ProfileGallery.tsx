import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, CheckCircle2, Image as ImageIcon } from "lucide-react";

export function ProfileGallery({ user, onUpdate }: any) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user.id}/upload-photo`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });
      onUpdate();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await apiFetch(`/users/${user.id}/select-profile-picture/${photoId}`, {
        method: "POST"
      });
      onUpdate();
    } catch (err) {
      alert("Failed to update profile picture");
    }
  };

  return (
    <div id="photo-gallery" className="p-8 rounded-3xl border bg-white space-y-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Photo Gallery</h2>
          <p className="text-sm text-zinc-500">Upload body shots for Virtual Try-On</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Add Photo</>}
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {user.photos?.map((photo: any) => (
          <div key={photo.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border bg-zinc-50">
            <img src={photo.url} className="object-cover h-full w-full" alt="Gallery item" />
            
            {/* Primary Indicator */}
            {user.profilePicture?.id === photo.id && (
              <div className="absolute top-2 left-2 bg-black text-white p-1 rounded-full">
                <CheckCircle2 size={14} />
              </div>
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
              {user.profilePicture?.id !== photo.id && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="text-[10px] h-8"
                  onClick={() => handleSetPrimary(photo.id)}
                >
                  Set as Profile
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {(!user.photos || user.photos.length === 0) && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-zinc-400">
            <ImageIcon size={40} className="mb-2 opacity-20" />
            <p className="text-sm">No photos uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}