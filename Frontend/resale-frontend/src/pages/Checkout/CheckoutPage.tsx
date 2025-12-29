import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Wallet, 
  Banknote,
  Globe,
  Plus,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Address } from "@/types";

type PaymentMethod = "WALLET" | "COD" | "VNPAY";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCartStore();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isManualAddress, setIsManualAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for manual address entry (Path B in Backend)
  const [manualAddress, setManualAddress] = useState({
    receiverName: "",
    receiverPhone: "",
    streetAddress: "",
    city: "",
    postalCode: ""
  });

  useEffect(() => {
    // Check for saved addresses
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a: Address) => a.isDefault) || user.addresses[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
      setIsManualAddress(false);
    } else {
      setIsManualAddress(true); 
    }

    // Default to WALLET if balance is sufficient
    if ((user?.balance || 0) >= subtotal) {
      setPaymentMethod("WALLET");
    }
  }, [user, subtotal]);

  if (items.length === 0 && !isSubmitting) {
    navigate("/");
    return null;
  }

  const handlePlaceOrder = async () => {
    // 1. Validation Logic
    if (!isManualAddress && !selectedAddress) {
      return toast.error("Please select a shipping address");
    }
    
    if (isManualAddress && (!manualAddress.streetAddress || !manualAddress.receiverName || !manualAddress.receiverPhone)) {
      return toast.error("Please fill in all required shipping details");
    }
    
    if (paymentMethod === "WALLET" && (user?.balance || 0) < subtotal) {
      return toast.error("Insufficient wallet balance.");
    }

    setIsSubmitting(true);
    try {
      // 2. Build Payload based on Backend logic
      const orderPayload = {
        paymentMethod: paymentMethod, 
        items: items.map(item => ({
          productVariantId: item.variantId,
          quantity: item.quantity
        })),
        // Path A: If using saved address, send addressId
        ...(!isManualAddress && selectedAddress ? { addressId: selectedAddress.id } : {}),
        // Path B: If manual, send raw strings
        ...(isManualAddress ? {
          receiverName: manualAddress.receiverName,
          receiverPhone: manualAddress.receiverPhone,
          streetAddress: manualAddress.streetAddress,
          city: manualAddress.city,
          postalCode: manualAddress.postalCode
        } : {})
      };

      const response = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });

      // 3. Handle VNPAY Redirect
      if (paymentMethod === "VNPAY" && response.paymentUrl) {
          toast.loading("Redirecting to VNPay Secure Gateway...");
          window.location.href = response.paymentUrl; 
          return;
      }

      // 4. Handle Wallet/COD Success
      toast.success("Order confirmed!");
      clearCart();
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 p-0">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          
          {/* Section 1: Address Selection */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">1. Delivery Destination</h2>
              {user?.addresses && user.addresses.length > 0 && (
                <button 
                  onClick={() => setIsManualAddress(!isManualAddress)}
                  className="text-xs font-bold text-zinc-900 underline underline-offset-4"
                >
                  {isManualAddress ? "Use Saved Address" : "Enter Manually"}
                </button>
              )}
            </div>

            {isManualAddress ? (
              <div className="space-y-4 p-6 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Receiver Name" 
                    value={manualAddress.receiverName}
                    onChange={e => setManualAddress({...manualAddress, receiverName: e.target.value})}
                  />
                  <Input 
                    placeholder="Receiver Phone" 
                    value={manualAddress.receiverPhone}
                    onChange={e => setManualAddress({...manualAddress, receiverPhone: e.target.value})}
                  />
                </div>
                <Input 
                  placeholder="Street Address" 
                  value={manualAddress.streetAddress}
                  onChange={e => setManualAddress({...manualAddress, streetAddress: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="City" 
                    value={manualAddress.city}
                    onChange={e => setManualAddress({...manualAddress, city: e.target.value})}
                  />
                  <Input 
                    placeholder="Postal Code" 
                    value={manualAddress.postalCode}
                    onChange={e => setManualAddress({...manualAddress, postalCode: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.addresses?.map((addr: Address) => (
                  <button 
                    key={addr.id} 
                    onClick={() => { setSelectedAddress(addr); setIsManualAddress(false); }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
                      selectedAddress?.id === addr.id && !isManualAddress ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-300"
                    }`}
                  >
                    {selectedAddress?.id === addr.id && !isManualAddress && <CheckCircle2 size={16} className="absolute top-4 right-4 text-black" />}
                    <p className="font-bold text-sm uppercase">{addr.fullName}</p>
                    <p className="text-xs text-zinc-500 mt-1">{addr.streetAddress}, {addr.city}</p>
                  </button>
                ))}
                <button 
                  onClick={() => setIsManualAddress(true)}
                  className="p-5 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                >
                  <Plus size={20} />
                  <span className="text-xs font-bold mt-2 uppercase">New Address</span>
                </button>
              </div>
            )}
          </section>

          {/* Section 2: Payment Method */}
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 border-b pb-2">2. Payment Method</h2>
            <div className="space-y-3">
              {/* Wallet Button */}
              <button 
                disabled={(user?.balance || 0) < subtotal}
                onClick={() => setPaymentMethod("WALLET")}
                className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  paymentMethod === "WALLET" ? "border-black bg-zinc-50" : "border-zinc-100 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Wallet className={paymentMethod === "WALLET" ? "text-black" : "text-zinc-300"} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Internal Wallet</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Balance: ${user?.balance?.toFixed(2)}</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "WALLET" ? "border-black bg-black outline outline-2 outline-offset-2 outline-black" : "border-zinc-200"}`} />
              </button>

              {/* VNPay Button */}
              <button 
                onClick={() => setPaymentMethod("VNPAY")}
                className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  paymentMethod === "VNPAY" ? "border-black bg-zinc-50" : "border-zinc-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Globe className={paymentMethod === "VNPAY" ? "text-blue-600" : "text-zinc-300"} />
                  <div className="text-left">
                    <p className="font-bold text-sm">VNPay Gateway</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">ATM, QR, Credit Card</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "VNPAY" ? "border-black bg-black outline outline-2 outline-offset-2 outline-black" : "border-zinc-200"}`} />
              </button>

              {/* COD Button */}
              <button 
                onClick={() => setPaymentMethod("COD")}
                className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  paymentMethod === "COD" ? "border-black bg-zinc-50" : "border-zinc-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Banknote className={paymentMethod === "COD" ? "text-black" : "text-zinc-300"} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Cash on Delivery</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Pay when you receive items</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "COD" ? "border-black bg-black outline outline-2 outline-offset-2 outline-black" : "border-zinc-200"}`} />
              </button>
            </div>
          </section>
        </div>

        {/* Section 3: Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 sticky top-24 space-y-8">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Order Summary</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar border-b border-zinc-800 pb-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center text-sm">
                  <span className="font-medium opacity-80">{item.name} ({item.size}) x{item.quantity}</span>
                  <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between text-zinc-400 text-xs uppercase font-bold tracking-widest">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-zinc-400 text-xs uppercase font-bold tracking-widest">
                  <span>Shipping</span>
                  <span>FREE</span>
               </div>
               <div className="pt-4 flex justify-between text-3xl font-black italic tracking-tighter uppercase">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
               </div>
            </div>

            <Button 
              disabled={isSubmitting || (!selectedAddress && !isManualAddress)} 
              onClick={handlePlaceOrder} 
              className="w-full h-20 rounded-3xl bg-white text-black text-xl font-black italic tracking-tighter hover:bg-zinc-200 transition-transform active:scale-95"
            >
              {isSubmitting ? "PROCESSING..." : "PLACE ORDER"}
            </Button>

            <div className="flex items-center justify-center gap-4 opacity-30 grayscale pt-4">
               <ShieldCheck size={20} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}