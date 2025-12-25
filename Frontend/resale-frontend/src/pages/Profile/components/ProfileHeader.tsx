import { Button } from "@/components/ui/button";
import { Pencil, X, User as UserIcon, ShieldCheck, Store, Images } from "lucide-react";

import type { UserProfile } from "@/types"; 

interface ProfileHeaderProps {
  user: UserProfile;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}

export function ProfileHeader({ user, isEditing, setIsEditing }: ProfileHeaderProps) {
  const avatarUrl = user.profilePicture?.url;
  const photoCount = user.photos?.length || 0;

  const scrollToGallery = () => {
    const element = document.getElementById("photo-gallery");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-3xl border shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Interactive Avatar Container */}
        <div className="relative group">
          <button 
            onClick={scrollToGallery}
            className="relative h-32 w-32 rounded-full bg-zinc-100 overflow-hidden border-4 border-white shadow-xl ring-1 ring-zinc-200 transition-all duration-300 group-hover:ring-zinc-400 group-hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="Manage Photo Gallery"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Avatar" 
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <UserIcon size={48} className="text-zinc-300" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Images className="text-white mb-1" size={20} />
              <span className="text-[10px] text-white font-bold uppercase tracking-widest">Gallery</span>
            </div>
          </button>

          {/* Photo Count Badge */}
          <div className="absolute -bottom-1 -right-1 bg-white px-2 py-1 rounded-lg border shadow-sm flex items-center gap-1.5 animate-in fade-in zoom-in duration-500">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-600">{photoCount} Photos</span>
          </div>
        </div>
        
        {/* User Identity Details */}
        <div className="text-center md:text-left space-y-3">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-zinc-500 text-lg font-medium">{user.email}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {user.roles?.map((role) => (
              <span 
                key={role.id} 
                className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-zinc-900 text-white uppercase tracking-wider shadow-sm"
              >
                {role.name === "ROLE_ADMIN" && <ShieldCheck size={12} className="mr-1.5 text-blue-400" />}
                {role.name === "ROLE_SELLER" && <Store size={12} className="mr-1.5 text-amber-400" />}
                {role.name.replace("ROLE_", "")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <Button 
          variant={isEditing ? "ghost" : "outline"} 
          onClick={() => setIsEditing(!isEditing)} 
          className={`rounded-full px-8 h-12 font-bold transition-all ${
            isEditing ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-50"
          }`}
        >
          {isEditing ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Pencil className="mr-2 h-4 w-4" /> Edit Profile</>
          )}
        </Button>
      </div>
    </div>
  );
}