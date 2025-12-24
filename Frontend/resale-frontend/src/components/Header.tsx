import { Search, ShoppingCart, LogOut, User, LayoutDashboard } from "lucide-react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  // 1. Reactive Auth State via Context
  const { user, setUser } = useAuth(); 
  const navigate = useNavigate();
  const cartCount = useCartStore((state) => state.count);

  // 2. Logout Handler using Global State
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); 
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Link */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-black tracking-tighter uppercase">FASHION_RE</h1>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input 
            placeholder="Search brands, items..." 
            className="pl-10 rounded-full bg-zinc-100 border-none focus-visible:ring-1 focus-visible:ring-zinc-300" 
          />
        </div>

        <div className="flex items-center gap-5">
          {/* Cart Icon */}
          <Link to="/cart" className="relative cursor-pointer hover:opacity-70 transition-opacity">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-black text-white border-2 border-white">
                {cartCount}
              </Badge>
            )}
          </Link>

          {/* 3. Conditional Authentication UI */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity border border-zinc-200">
                  <AvatarImage src={user.profilePicture?.url} alt={user.firstName} />
                  <AvatarFallback className="bg-white text-zinc-400">
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-zinc-100">
                <DropdownMenuLabel className="font-bold px-2 py-1.5">
                  <div className="flex flex-col">
                    <span className="text-sm">{user.firstName} {user.lastName}</span>
                    <span className="text-[10px] font-medium text-zinc-400">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>

                {/*Only show Studio for Sellers */}
                {user.roles?.some((r: any) => r.name === "ROLE_SELLER") && (
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/seller/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> My Studio
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-full px-6 font-bold text-xs" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button className="rounded-full px-6 bg-black text-white font-bold text-xs" asChild>
                <Link to="/register">Join</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}