import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Ruler, Weight, Store, Loader2 } from "lucide-react";

interface ProfileDetailsFormProps {
  user: any;
  isEditing: boolean;
  onSave: (updatedUser: any) => void;
}

export function ProfileDetailsForm({ user, isEditing, onSave }: ProfileDetailsFormProps) {
  // Local state for editing to avoid mutating the global user object immediately
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    height: user.height || "",
    weight: user.weight || "",
    shopName: user.shopName || ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Calls the PUT /{userId} endpoint we created in the Controller
      const updated = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      onSave(updated); // Notify parent of the success
    } catch (err) {
      alert("Failed to update profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl border bg-white space-y-6 shadow-sm">
      <h2 className="text-xl font-bold flex items-center gap-2">
        Personal Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Fields */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            disabled={!isEditing}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="rounded-xl border-zinc-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName"
            disabled={!isEditing}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="rounded-xl border-zinc-200"
          />
        </div>

        {/* Measurements - Critical for VTO logic */}
        <div className="space-y-2">
          <Label htmlFor="height" className="flex items-center gap-2">
            <Ruler size={14} /> Height (cm)
          </Label>
          <Input 
            id="height"
            type="number"
            placeholder="175"
            disabled={!isEditing}
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
            className="rounded-xl border-zinc-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight" className="flex items-center gap-2">
            <Weight size={14} /> Weight (kg)
          </Label>
          <Input 
            id="weight"
            type="number"
            placeholder="70"
            disabled={!isEditing}
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
            className="rounded-xl border-zinc-200"
          />
        </div>
      </div>

      {/* Marketplace Detail */}
      <div className="space-y-2">
        <Label htmlFor="shopName" className="flex items-center gap-2">
          <Store size={14} /> Shop Name
        </Label>
        <Input 
          id="shopName"
          placeholder="My Vintage Collection"
          disabled={!isEditing}
          value={formData.shopName}
          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          className="rounded-xl border-zinc-200"
        />
      </div>

      {isEditing && (
        <Button 
          onClick={handleUpdate} 
          disabled={isLoading}
          className="w-full bg-black text-white h-12 rounded-xl hover:bg-zinc-800 transition-all"
        >
          {isLoading ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save Changes</>
          )}
        </Button>
      )}
    </div>
  );
}