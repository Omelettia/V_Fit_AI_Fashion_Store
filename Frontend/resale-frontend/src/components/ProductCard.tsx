import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ProductCard() {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-[3/4] bg-gray-200 relative">
          {/* This represents your UserPhoto/Storage logic */}
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" 
            alt="Fashion Item"
            className="object-cover w-full h-full"
          />
          <Badge className="absolute top-2 left-2 bg-white/80 text-black hover:bg-white">New</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-sm font-medium">Vintage Leather Jacket</CardTitle>
        <p className="text-lg font-bold mt-1">$120.00</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button variant="secondary" className="w-full text-xs h-8">Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}