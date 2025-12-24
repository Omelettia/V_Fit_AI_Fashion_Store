import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/context/AuthContext" // Import the context hook

export function LoginForm() {
  const { setUser } = useAuth(); // Access the global state setter
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginData, setLoginData] = useState({ email: "", password: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setLoginData((prev) => ({ ...prev, [id]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 1. Authenticate with the backend
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      })

      // 2. Persist the token for page refreshes
      localStorage.setItem("token", data.token)

      // 3. IMPORTANT: Update the global Auth State immediately
      // This tells all other components (Header, Dashboard) that the user is now logged in.
      // We fetch the full user details to ensure the state is complete.
      const fullUserData = await apiFetch("/users/me");
      setUser(fullUserData);

      // 4. Redirect
      window.location.href = "/"
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="w-full shadow-2xl shadow-zinc-200/50 border border-zinc-100">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={loginData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
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

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-md animate-in fade-in zoom-in duration-300">
              <p className="text-xs font-medium text-red-600 text-center">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black hover:bg-zinc-800 text-white py-6 text-lg transition-all rounded-xl"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
            ) : (
              "Log In"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}