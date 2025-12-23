import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ShoppingCart, LogOut, User } from "lucide-react" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/useCartStore"
import { Link, useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Standard industrial dropdown

export function Header() {
  // 1. Dynamic Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const cartCount = useCartStore((state) => state.count)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  // 2. Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userEmail")
    setIsLoggedIn(false)
    navigate("/login")
  }

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
            className="pl-10 rounded-full bg-gray-100 border-none focus-visible:ring-1 focus-visible:ring-zinc-300" 
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <div className="relative cursor-pointer hover:opacity-70 transition-opacity">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-black text-white">
                {cartCount}
              </Badge>
            )}
          </div>

          {/* 3. Authentication State UI */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback><User size={18} /></AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="rounded-full px-6 border-zinc-300" asChild>
              <Link to="/login">Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}