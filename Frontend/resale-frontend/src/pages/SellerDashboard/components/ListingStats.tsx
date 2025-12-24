import { DollarSign, Package, TrendingUp } from "lucide-react";

interface ListingStatsProps {
  stats: { totalRevenue: number; activeListings: number; totalSales: number };
}

export function ListingStats({ stats }: ListingStatsProps) {
  const cards = [
    { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: <DollarSign />, color: "text-zinc-900" },
    { title: "Active Listings", value: stats.activeListings, icon: <Package />, color: "text-zinc-900" },
    { title: "Total Sales", value: stats.totalSales, icon: <TrendingUp />, color: "text-zinc-900" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="p-8 rounded-[2rem] border bg-white shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{card.title}</span>
            <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              {card.icon}
            </div>
          </div>
          <div className="text-4xl font-mono font-bold tracking-tighter">{card.value}</div>
        </div>
      ))}
    </div>
  );
}