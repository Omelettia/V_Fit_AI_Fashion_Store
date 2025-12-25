import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Wallet, 
  Banknote,
  Globe 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Address } from "@/types";

type PaymentMethod = "WALLET" | "COD" | "DIGITAL";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCartStore();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.addresses) {
      const defaultAddr = user.addresses.find((a: Address) => a.isDefault) || user.addresses[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }
    // If user has balance, default to wallet as a nudge
    if ((user?.balance || 0) >= subtotal) {
        setPaymentMethod("WALLET");
    }
  }, [user, subtotal]);

  if (items.length === 0 && !isSubmitting) {
    navigate("/");
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error("Please select a shipping address");
    
    if (paymentMethod === "WALLET" && (user?.balance || 0) < subtotal) {
      return toast.error("Insufficient wallet balance.");
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        addressId: selectedAddress.id,
        paymentMethod: paymentMethod,
        items: items.map(item => ({
          productVariantId: item.variantId,
          quantity: item.quantity
        }))
      };

      const response = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });

      // Logic for Digital Redirect
      if (paymentMethod === "DIGITAL" && response.checkoutUrl) {
          window.location.href = response.checkoutUrl; // Redirect to Stripe/PayPal
          return;
      }

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
          
          {/* Address Selection */}
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 border-b pb-2">1. Delivery Destination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.addresses?.map((addr: Address) => (
                <button 
                  key={addr.id} 
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
                    selectedAddress?.id === addr.id ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-300"
                  }`}
                >
                  {selectedAddress?.id === addr.id && <CheckCircle2 size={16} className="absolute top-4 right-4 text-black" />}
                  <p className="font-bold text-sm uppercase">{addr.fullName}</p>
                  <p className="text-xs text-zinc-500 mt-1">{addr.streetAddress}, {addr.city}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Payment Method Selection */}
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 border-b pb-2">2. Payment Method</h2>
            <div className="space-y-3">
              
              {/* Wallet Option */}
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
                    <p className="font-bold text-sm">Fashion_RE Wallet</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Balance: ${user?.balance?.toFixed(2)}</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "WALLET" ? "border-black bg-black outline outline-2 outline-offset-2 outline-black" : "border-zinc-200"}`} />
              </button>

              {/* Digital/Card Option */}
              <button 
                onClick={() => setPaymentMethod("DIGITAL")}
                className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  paymentMethod === "DIGITAL" ? "border-black bg-zinc-50" : "border-zinc-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Globe className={paymentMethod === "DIGITAL" ? "text-black" : "text-zinc-300"} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Digital Payment</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Visa, Mastercard, Bank Transfer</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "DIGITAL" ? "border-black bg-black outline outline-2 outline-offset-2 outline-black" : "border-zinc-200"}`} />
              </button>

              {/* COD Option */}
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
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Pay at your doorstep</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "COD" ? "border-black bg-black outline outline-2 outline-offset-2 outline-black" : "border-zinc-200"}`} />
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 sticky top-24 space-y-8">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Order Summary</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center text-sm">
                  <span className="font-medium opacity-80">{item.name} ({item.size}) x{item.quantity}</span>
                  <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-zinc-800 flex justify-between text-3xl font-black italic tracking-tighter uppercase">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Button 
              disabled={isSubmitting || !selectedAddress} 
              onClick={handlePlaceOrder} 
              className="w-full h-20 rounded-3xl bg-white text-black text-xl font-black italic tracking-tighter hover:bg-zinc-200"
            >
              {isSubmitting ? "PROCESSING..." : "PLACE ORDER"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}