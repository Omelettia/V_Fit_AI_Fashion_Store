import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileDetailsForm } from "./components/ProfileDetailsForm";
import { WalletCard } from "./components/WalletCard";
import { ProfileGallery } from "./components/ProfileGallery";

// 1. Define the Interface to match your Backend Entity
interface Role { id: number; name: string; }
interface UserPhoto { id: number; url: string; gcsUri: string; isPrimary: boolean; }

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  balance: number;
  height?: number;
  weight?: number;
  shopName?: string;
  profilePicture?: UserPhoto;
  photos: UserPhoto[];
}

export default function ProfilePage() {
  // 2. Apply the interface to state instead of 'any'
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await apiFetch("/users/me");
      setUser(data);
    } catch (err) {
      console.error("Session invalid", err);
      // Industrial Standard: Clear local state before redirecting
      localStorage.removeItem("token");
      window.location.href = "/login?error=session_expired";
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-zinc-900" size={32} />
          <p className="text-zinc-500 font-medium animate-pulse">Loading your fashion profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Identity Section */}
      <ProfileHeader 
        user={user} 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Measurements & Marketplace Details */}
          <ProfileDetailsForm 
            user={user} 
            isEditing={isEditing} 
            onSave={(updated: UserProfile) => {
              setUser(updated);
              setIsEditing(false);
            }} 
          />

          {/* 3. Dedicated Gallery Management (with ID for jump-link) */}
          <div id="photo-gallery">
            <ProfileGallery 
              user={user} 
              onUpdate={loadProfile} 
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* 4. Financial Status */}
          <WalletCard balance={user.balance} />
          
          {/* Industrial Tip: Add a Profile Completion card here */}
          <div className="p-6 rounded-3xl border bg-white shadow-sm">
            <h4 className="font-bold text-sm mb-2">Profile Strength</h4>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-black transition-all duration-1000" 
                 style={{ width: user.height && user.profilePicture ? '100%' : '50%' }}
               />
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">
              {user.height ? "✓ Measurements added" : "○ Missing measurements"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}