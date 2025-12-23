import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react" // Icons for industrial polish
import { apiFetch } from "@/lib/api" // Centralized API client

export function LoginForm() {
  // 1. State Management
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })

  // 2. Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setLoginData((prev) => ({ ...prev, [id]: value }))
    if (error) setError("") // Clear errors as user types
  }

  // 3. Authentication Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Calls your Spring Boot authenticate method
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      })

      // Industrial Standard: Store the JWT and user info
      localStorage.setItem("token", data.token)
      localStorage.setItem("userEmail", data.email)

      // Redirect to the Home page upon successful login
      window.location.href = "/"
    } catch (err: any) {
      // Handles "Invalid password" or "User not found" from backend
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="w-full shadow-2xl shadow-zinc-200/50 border border-zinc-100">
        <CardContent className="space-y-4 pt-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={loginData.email}
              onChange={handleChange}
              className="autofill:shadow-[0_0_0_30px_white_inset]" // Overrides yellow autofill
              required 
            />
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" className="px-0 h-auto font-normal text-xs text-zinc-500">
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={loginData.password} 
                onChange={handleChange} 
                className="pr-10 autofill:shadow-[0_0_0_30px_white_inset]"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-md">
              <p className="text-xs font-medium text-red-600 text-center">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black hover:bg-zinc-800 text-white py-6 text-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}