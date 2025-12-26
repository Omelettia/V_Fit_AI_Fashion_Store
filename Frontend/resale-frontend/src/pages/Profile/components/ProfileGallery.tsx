import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, CheckCircle2, Image as ImageIcon, Trash2, AlertTriangle } from "lucide-react";
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

export function ProfileGallery({ user, onUpdate }: any) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await apiFetch(`/users/${user.id}/select-profile-picture/${photoId}`, {
        method: "POST"
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Failed to update profile picture");
    }
  };

  const handleDelete = async (photoId: number) => {
    setDeletingId(photoId); 
    try {
      await apiFetch(`/users/${user.id}/photos/${photoId}`, {
        method: "DELETE"
      });
      toast.success("Asset removed from gallery");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Deletion failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div id="photo-gallery" className="p-8 rounded-[3rem] border bg-white space-y-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Photo Assets</h2>
          <p className="text-sm text-zinc-400 font-medium">Manage your body shots for AI Try-On.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full font-bold uppercase text-[10px] tracking-widest border-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Add Asset</>}
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {user.photos?.map((photo: any) => (
          <div key={photo.id} className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border-2 border-transparent bg-zinc-50 transition-all hover:border-black shadow-inner">
            <img src={photo.url} className="object-cover h-full w-full" alt="Gallery item" />
            
            {user.profilePicture?.id === photo.id && (
              <div className="absolute top-4 left-4 bg-black text-white p-1.5 rounded-full shadow-xl">
                <CheckCircle2 size={12} />
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
              {user.profilePicture?.id !== photo.id && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="w-full text-[10px] font-black uppercase h-10 rounded-xl"
                  onClick={() => handleSetPrimary(photo.id)}
                >
                  Set as Profile
                </Button>
              )}

              {/* PROFESSIONAL ALERT DIALOG */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    disabled={deletingId === photo.id}
                    className="w-full text-[10px] font-black uppercase h-10 rounded-xl gap-2"
                  >
                    {deletingId === photo.id ? <Loader2 className="animate-spin h-3 w-3" /> : <Trash2 size={12} />} 
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] p-8">
                  <AlertDialogHeader>
                    <div className="bg-red-50 text-red-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
                        <AlertTriangle size={24} />
                    </div>
                    <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                        Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-500 font-medium">
                      This will permanently remove this asset from your gallery and storage. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 gap-3">
                    <AlertDialogCancel className="rounded-2xl font-bold uppercase text-xs h-12">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(photo.id)}
                      className="rounded-2xl font-bold uppercase text-xs h-12 bg-red-600 hover:bg-red-700"
                    >
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
        
        {(!user.photos || user.photos.length === 0) && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-[2.5rem] text-zinc-400 bg-zinc-50/50">
            <ImageIcon size={48} className="mb-4 opacity-10" />
            <p className="text-xs font-black uppercase tracking-widest">No assets available</p>
          </div>
        )}
      </div>
    </div>
  );
}