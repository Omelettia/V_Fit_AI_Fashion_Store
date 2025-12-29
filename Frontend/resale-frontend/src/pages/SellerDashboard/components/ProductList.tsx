import { Package, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductListProps {
  products: any[];
  onEdit: (product: any) => void; 
}

export function ProductList({ products, onEdit }: ProductListProps) {
  return (
    <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-zinc-50/30">
        <h2 className="text-xl font-bold italic tracking-tighter uppercase">Inventory</h2>
        <div className="px-3 py-1 bg-zinc-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
          {products?.length || 0} Items
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-zinc-400 text-[10px] font-black uppercase tracking-widest border-b">
              <th className="px-8 py-5">Details</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5">Stock</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {products?.map((item) => {

              return (
                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl border bg-zinc-100 overflow-hidden shadow-inner">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={item.images[0].url} 
                            className="object-cover h-full w-full transition-transform group-hover:scale-110" 
                            alt={item.name} 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-zinc-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900">{item.name || "Untitled"}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">
                          {item.brand} • {item.condition}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono font-bold text-zinc-900">
                    ${typeof item.basePrice === 'number' ? item.basePrice.toFixed(2) : "0.00"}
                  </td>
                  <td className="px-8 py-6 text-zinc-600">
                    <div className="text-xs font-bold">
                      {item.variants?.reduce((acc: number, v: any) => acc + v.stockQuantity, 0) || 0} units
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-[10px] font-black uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-2 border-zinc-100 shadow-xl">
                        <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2 cursor-pointer rounded-lg font-bold">
                          <Edit size={14} /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg font-bold text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 size={14} /> Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}