import { Button } from "@/components/ui/button";
import { CreditCard, ArrowUpRight } from "lucide-react";

export function WalletCard({ balance }: { balance: number }) {
  return (
    <div className="p-8 rounded-3xl border bg-zinc-900 text-white space-y-6 shadow-xl">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
            Wallet Balance
          </p>
          <p className="text-4xl font-mono font-medium">
            ${balance.toFixed(2)}
          </p>
        </div>
        <div className="p-2 bg-zinc-800 rounded-full">
          <CreditCard size={20} className="text-zinc-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button variant="secondary" className="w-full rounded-xl bg-white text-black hover:bg-zinc-200">
          <ArrowUpRight className="mr-2 h-4 w-4" /> Top Up
        </Button>
        <Button variant="ghost" className="w-full rounded-xl text-zinc-400 hover:text-white">
          View History
        </Button>
      </div>
    </div>
  );
}