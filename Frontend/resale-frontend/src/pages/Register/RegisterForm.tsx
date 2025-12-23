import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react" // Icons for polish
import { apiFetch } from "@/lib/api" // Our centralized API client

export function RegisterForm() {
  // 1. State Management
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleName: "ROLE_BUYER" 
  })

  // 2. Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    if (error) setError("") // Clear error messages when user resumes typing
  }

  // 3. Form Submission Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Using the centralized client instead of hardcoded URLs
      await apiFetch("/users/register", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      // On success, redirect to login
      window.location.href = "/login"
    } catch (err: any) {
      // Captures backend exceptions like "Email already in use"
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="w-full shadow-2xl shadow-zinc-200/50 border border-zinc-100">
        <CardContent className="space-y-4 pt-6">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="Justin" 
                value={formData.firstName}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Mason" 
                value={formData.lastName}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          {/* Password Field with Toggle */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={handleChange} 
                className="pr-10"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Backend Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-md">
              <p className="text-xs font-medium text-red-600 text-center">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black hover:bg-zinc-800 text-white py-6 text-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}