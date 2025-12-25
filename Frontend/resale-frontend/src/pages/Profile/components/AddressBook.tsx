import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { UserProfile, Address } from "@/types";

/**
 * Main AddressBook Component
 * Handles the display and deletion of saved shipping destinations.
 */
export function AddressBook({ user, onUpdate }: { user: UserProfile; onUpdate: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = async (addressId: number) => {
    try {
      // Security: Ownership is verified on the backend via the JWT and user.id
      await apiFetch(`/users/${user.id}/addresses/${addressId}`, { method: "DELETE" });
      toast.success("Address deleted");
      onUpdate();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-zinc-100 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight">Address Book</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full gap-2"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} /> Add New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user.addresses?.map((addr: Address) => (
          <div key={addr.id} className="p-4 border rounded-2xl relative group">
            {addr.isDefault && (
              <span className="absolute top-3 right-3 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                Default
              </span>
            )}
            <div className="flex gap-3">
              <MapPin className="text-zinc-400 shrink-0" size={18} />
              <div className="space-y-1">
                <p className="font-bold text-sm">{addr.fullName}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {addr.streetAddress}, {addr.city}<br />
                  {addr.state}, {addr.postalCode}
                </p>
                <p className="text-xs font-medium">{addr.phoneNumber}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(addr.id)}
              className="absolute bottom-3 right-3 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      
      {showAddForm && (
         <AddressForm 
            user={user} 
            onSuccess={() => { setShowAddForm(false); onUpdate(); }} 
         />
      )}
    </div>
  );
}

/**
 * AddressForm Sub-component
 * Uses auto-fill logic to improve checkout conversion rates.
 */
function AddressForm({ user, onSuccess }: { user: UserProfile; onSuccess: () => void }) {
    // Defaults to the account name but remains editable for gifts/office deliveries
    const defaultName = `${user.firstName} ${user.lastName}`;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await apiFetch(`/users/${user.id}/addresses`, {
                method: "POST",
                body: JSON.stringify({ ...data, isDefault: false })
            });
            onSuccess();
            toast.success("Address saved to profile");
        } catch (err) {
            toast.error("Failed to add address");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-6 bg-zinc-50 rounded-2xl grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <input 
                name="fullName" 
                placeholder="Full Name" 
                defaultValue={defaultName} 
                className="col-span-2 p-3 rounded-xl border font-medium focus:ring-1 focus:ring-black outline-none" 
                required 
            />
            <input name="phoneNumber" placeholder="Phone Number" className="col-span-2 p-3 rounded-xl border outline-none" required />
            <input name="streetAddress" placeholder="Street Address" className="col-span-2 p-3 rounded-xl border outline-none" required />
            <input name="city" placeholder="City" className="p-3 rounded-xl border outline-none" required />
            <input name="state" placeholder="State" className="p-3 rounded-xl border outline-none" required />
            <input name="postalCode" placeholder="Postal Code" className="p-3 rounded-xl border outline-none" required />
            <Button type="submit" className="col-span-2 bg-black text-white rounded-xl h-12 font-bold uppercase tracking-widest italic">
              Save Address
            </Button>
        </form>
    );
}