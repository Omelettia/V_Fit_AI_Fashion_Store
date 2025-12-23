import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ShoppingCart } from "lucide-react" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/useCartStore"
import { Link } from "react-router-dom"

export function Header() {
  const isLoggedIn = false; 
  const cartCount = useCartStore((state) => state.count)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Name Link */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold tracking-tighter">FASHION_RE resale</h1>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search brands, items..." 
            className="pl-10 rounded-full bg-gray-100 border-none" 
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <div className="relative cursor-pointer">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-black text-white">
                {cartCount}
              </Badge>
            )}
          </div>

          {/* Authentication State */}
          {isLoggedIn ? (
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          ) : (
            /* CORRECTION: Added 'asChild'. 
               This merges the Link's navigation logic with the Button's styling.
            */
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/login">Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}