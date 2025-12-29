import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
}

export function FilterDrawer({ 
  isOpen, 
  onClose, 
  categories, 
  selectedCategory, 
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange
}: FilterDrawerProps) {
  
  // Local state to manage inputs before "Show Results" is clicked
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleApply = () => {
    onPriceChange(localMin, localMax);
    onClose();
  };

  const handleReset = () => {
    setLocalMin("");
    setLocalMax("");
    onPriceChange("", "");
    onSelectCategory(null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 border-none shadow-2xl">
        <div className="flex flex-col h-full bg-white">
          <SheetHeader className="p-8 border-b">
            <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">
              Detailed Filters
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 p-8">
            <div className="space-y-12">
              {/* Category Hierarchy Section */}
              <div className="space-y-6">
                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Browse by Department
                </Label>
                <Accordion type="single" collapsible className="w-full">
                  {categories.map((parent) => (
                    <AccordionItem key={parent.id} value={`item-${parent.id}`} className="border-zinc-100">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className={`text-sm font-bold uppercase tracking-tight ${selectedCategory === parent.id ? "text-black" : "text-zinc-500"}`}>
                          {parent.name}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-6 space-y-2">
                        {/* Map through subCategories from Backend DTO */}
                        {parent.subCategories?.map((child: any) => (
                          <button
                            key={child.id}
                            onClick={() => { onSelectCategory(child.id); onClose(); }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                              selectedCategory === child.id 
                                ? "bg-zinc-900 text-white shadow-lg" 
                                : "hover:bg-zinc-50 text-zinc-500"
                            }`}
                          >
                            {child.name}
                            {selectedCategory === child.id && <Check size={14} />}
                          </button>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Price Range Section */}
              <div className="space-y-6">
                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Price Threshold ($)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Min Price</span>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value)}
                      className="h-14 bg-zinc-50 border-none rounded-2xl font-mono text-sm focus-visible:ring-1 focus-visible:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Max Price</span>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value)}
                      className="h-14 bg-zinc-50 border-none rounded-2xl font-mono text-sm focus-visible:ring-1 focus-visible:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-8 border-t bg-zinc-50/50 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-16 font-black text-[10px] uppercase border-zinc-200" onClick={handleReset}>
              Reset Workspace
            </Button>
            <Button className="flex-1 rounded-2xl h-16 bg-black text-white font-black text-[10px] uppercase shadow-xl hover:bg-zinc-800" onClick={handleApply}>
              Show Results
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}