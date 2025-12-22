import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User } from "lucide-react" // These are the icons
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  // Kindergarten Logic: Later, we will use your 'UserService' here
  const isLoggedIn = false; 

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        
        {/* 1. Brand Name */}
        <h1 className="text-xl font-bold tracking-tighter">FASHION_RE resale</h1>

        {/* 2. Search Bar with Auto-Suggest (Functional Essential) */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search brands, items..." 
            className="pl-10 rounded-full bg-gray-100 border-none" 
          />
        </div>

        {/* 3. Authentication State Check */}
        <div>
          {isLoggedIn ? (
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="outline" className="rounded-full">Log In</Button>
          )}
        </div>
      </div>
    </header>
  )
}