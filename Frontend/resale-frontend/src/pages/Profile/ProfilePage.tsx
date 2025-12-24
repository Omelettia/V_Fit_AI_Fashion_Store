import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2, Store } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileDetailsForm } from "./components/ProfileDetailsForm";
import { WalletCard } from "./components/WalletCard";
import { ProfileGallery } from "./components/ProfileGallery";
import { Button } from "@/components/ui/button";

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await apiFetch("/users/me");
      setUser(data);
    } catch (err) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleUpgradeToSeller = async () => {
    if (!user) return;
    setIsUpgrading(true);
    try {
      const updatedUser = await apiFetch(`/users/${user.id}/upgrade-to-seller`, {
        method: 'POST'
      });
      setUser(updatedUser);
    } catch (err) {
      alert("Failed to upgrade account.");
    } finally {
      setIsUpgrading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  if (!user) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const isSeller = user.roles.some(r => r.name === "ROLE_SELLER");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      <ProfileHeader user={user} isEditing={isEditing} setIsEditing={setIsEditing} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProfileDetailsForm 
            user={user} 
            isEditing={isEditing} 
            onSave={(updated: UserProfile) => { setUser(updated); setIsEditing(false); }} 
          />
          <div id="photo-gallery">
            <ProfileGallery user={user} onUpdate={loadProfile} />
          </div>
        </div>

        <div className="space-y-6">
          <WalletCard balance={user.balance} />

          {/* Seller Evolution Card */}
          {!isSeller ? (
            <div className="p-8 rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm"><Store size={24} className="text-zinc-400" /></div>
              <div className="space-y-1">
                <h3 className="font-bold text-zinc-900">Become a Seller</h3>
                <p className="text-xs text-zinc-500">List items and start earning from your wardrobe.</p>
              </div>
              <Button onClick={handleUpgradeToSeller} disabled={isUpgrading} className="w-full rounded-xl bg-black text-white hover:bg-zinc-800">
                {isUpgrading ? <Loader2 className="animate-spin h-4 w-4" /> : "Activate Seller Mode"}
              </Button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border bg-zinc-900 text-white flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-zinc-800 rounded-2xl"><Store size={24} className="text-white" /></div>
              <div className="space-y-1">
                <h3 className="font-bold">Seller Dashboard</h3>
                <p className="text-xs text-zinc-400">Manage your active listings and sales.</p>
              </div>
              <Button variant="secondary" className="w-full rounded-xl" asChild>
                <a href="/seller/dashboard">Go to Dashboard</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}