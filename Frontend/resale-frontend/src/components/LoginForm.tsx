import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  return (
    <Card className="w-full shadow-2xl shadow-zinc-200/50 border border-zinc-100">
      <CardContent className="space-y-4 pt-6">
        {/* Login only needs Email and Password to match your UserService.authenticate logic */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="flex items-center justify-between">
            <Input id="password" type="password" required />
          </div>
          <Button variant="link" className="px-0 font-normal text-xs text-muted-foreground">
            Forgot password?
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-black hover:bg-zinc-800 text-white py-6 text-lg">
          Log In
        </Button>
      </CardFooter>
    </Card>
  )
}