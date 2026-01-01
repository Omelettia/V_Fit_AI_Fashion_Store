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
  isOpen, onClose, categories, selectedCategory, onSelectCategory, minPrice, maxPrice, onPriceChange 
}: FilterDrawerProps) {
  
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

  // RECURSIVE COMPONENT FOR 3+ LEVELS
  const renderCategoryTree = (nodes: any[], level = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.subCategories && node.subCategories.length > 0;
      const isSelected = selectedCategory === node.id;

      if (hasChildren) {
        return (
          <AccordionItem key={node.id} value={`item-${node.id}`} className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <span className={`text-sm font-bold uppercase tracking-tight ${isSelected ? "text-black" : "text-zinc-500"}`}>
                {node.name}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pl-4 pb-2 border-l border-zinc-100 ml-1 space-y-1">
              {/* This is the recursion: It calls itself for the next level */}
              {renderCategoryTree(node.subCategories, level + 1)}
            </AccordionContent>
          </AccordionItem>
        );
      }

      // LEAF NODE (The actual clickable product categories like "Jackets")
      return (
        <button
          key={node.id}
          onClick={() => { onSelectCategory(node.id); onClose(); }}
          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
            isSelected ? "bg-zinc-900 text-white shadow-lg" : "hover:bg-zinc-50 text-zinc-500"
          }`}
        >
          {node.name}
          {isSelected && <Check size={14} />}
        </button>
      );
    });
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
              <div className="space-y-6">
                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Browse Hierarchy
                </Label>
                <Accordion type="multiple" className="w-full">
                  {renderCategoryTree(categories)}
                </Accordion>
              </div>

              <div className="space-y-6">
                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Price Threshold ($)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Min Price</span>
                    <Input 
                      type="number" 
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value)}
                      className="h-14 bg-zinc-50 border-none rounded-2xl font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Max Price</span>
                    <Input 
                      type="number" 
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value)}
                      className="h-14 bg-zinc-50 border-none rounded-2xl font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-8 border-t bg-zinc-50/50 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-16 font-black text-[10px] uppercase border-zinc-200" onClick={handleReset}>
              Reset
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