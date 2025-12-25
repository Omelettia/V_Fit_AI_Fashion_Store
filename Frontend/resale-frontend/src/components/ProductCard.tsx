import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

interface ProductProps {
  id: number;      
  name: string;
  price: number;   // Maps to basePrice in DTO
  image?: string;  // Maps to imageUrls[0] in DTO
  brand?: string;
}

export function ProductCard({ id, name, price, image, brand }: ProductProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-none hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white cursor-pointer">
      {/* Wrapping the entire card in a Link ensures the user is directed 
         to the Details Page to select specific variants 
      */}
      <Link to={`/product/${id}`}>
        <CardHeader className="p-0">
          <div className="aspect-[3/4] bg-zinc-50 relative overflow-hidden">
            {image ? (
              <img 
                src={image} 
                alt={name} 
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-200">
                <Package size={48} strokeWidth={1} />
              </div>
            )}
            
            {/* Visual Indicator of New Stock */}
            <Badge className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-black hover:bg-white border-none font-black text-[9px] px-4 py-1.5 rounded-full shadow-sm tracking-widest">
              NEW
            </Badge>

            {/* Hover Overlay for Premium Feel */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {brand || "Essential"}
            </p>
            <CardTitle className="text-base font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
              {name}
            </CardTitle>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black italic tracking-tighter text-zinc-900">
              ${typeof price === 'number' ? price.toFixed(2) : "0.00"}
            </span>
            {/* Optional: Add "View Details" text that appears on hover */}
            <span className="text-[10px] font-bold uppercase text-zinc-300 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-500">
              → View
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}