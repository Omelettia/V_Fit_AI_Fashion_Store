interface Variant {
  id: number;
  size: string;
  color?: string;
  stockQuantity: number;
}

export function VariantPicker({ variants, selectedVariant, onSelect }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
        Select Variant
      </label>
      <div className="flex flex-wrap gap-3">
        {variants?.map((v: Variant) => (
          <button
            key={v.id}
            disabled={v.stockQuantity === 0}
            onClick={() => onSelect(v)}
            className={`px-6 py-3 rounded-2xl border-2 font-bold transition-all text-sm ${
              selectedVariant?.id === v.id 
                ? "border-black bg-black text-white" 
                : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
            }`}
          >
            {v.size} {v.color && `• ${v.color}`}
            {v.stockQuantity < 5 && v.stockQuantity > 0 && (
              <span className="block text-[8px] uppercase text-amber-500 mt-0.5">
                {v.stockQuantity} Left
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}