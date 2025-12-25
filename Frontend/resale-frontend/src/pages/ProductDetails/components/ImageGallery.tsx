import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      {/* Main Showcase */}
      <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-100 border border-zinc-100 shadow-inner">
        <img 
          src={activeImage} 
          className="w-full h-full object-cover transition-all duration-500" 
          alt={name} 
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setActiveImage(url)}
            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
              activeImage === url ? "border-black scale-95" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={url} className="w-full h-full object-cover" alt={`${name} view ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}