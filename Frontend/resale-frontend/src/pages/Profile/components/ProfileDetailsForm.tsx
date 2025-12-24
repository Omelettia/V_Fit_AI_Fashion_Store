import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Ruler, Weight, Store, Loader2 } from "lucide-react";

export function ProfileDetailsForm({ user, isEditing, onSave }: any) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    height: user.height || "",
    weight: user.weight || "",
    shopName: user.shopName || ""
  });
  const [loading, setLoading] = useState(false);

  // Sync internal state if user prop updates (e.g. after upgrade)
  useEffect(() => {
    setFormData(prev => ({ ...prev, shopName: user.shopName || "" }));
  }, [user.shopName]);

  const isSeller = user.roles.some((r: any) => r.name === "ROLE_SELLER");

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updated = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      onSave(updated);
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl border bg-white space-y-6 shadow-sm">
      <h2 className="text-xl font-bold">Personal Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input disabled={!isEditing} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input disabled={!isEditing} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Ruler size={14} /> Height (cm)</Label>
          <Input type="number" disabled={!isEditing} value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Weight size={14} /> Weight (kg)</Label>
          <Input type="number" disabled={!isEditing} value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
        </div>
      </div>

      {/* Conditional Shop Name */}
      {isSeller && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label className="flex items-center gap-2"><Store size={14} /> Shop Name</Label>
          <Input disabled={!isEditing} value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
        </div>
      )}

      {isEditing && (
        <Button onClick={handleUpdate} disabled={loading} className="w-full bg-black text-white h-12 rounded-xl">
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </Button>
      )}
    </div>
  );
}