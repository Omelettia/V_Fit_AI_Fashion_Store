import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"

// 1. Define what info the card needs
interface ProductProps {
  name: string;
  price: number;
  image: string;
}

export function ProductCard({ name, price, image }: ProductProps) {
  const addToCart = useCartStore((state) => state.addToCart)
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-[3/4] bg-gray-200 relative">
          {/* This represents your UserPhoto/Storage logic */}
          <img src={image} alt={name} className="object-cover w-full h-full" />
          <Badge className="absolute top-2 left-2 bg-white/80 text-black hover:bg-white">New</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <p className="text-lg font-bold mt-1">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button 
            onClick={addToCart}
            variant="secondary"
            className="w-full text-xs h-8"
         >
            Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}