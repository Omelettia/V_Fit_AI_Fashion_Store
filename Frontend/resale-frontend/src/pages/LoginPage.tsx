import { LoginForm } from "@/components/LoginForm"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-white overflow-hidden">
      {/* LEFT SIDE: Brand/Inspiration */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 items-center justify-center p-12 text-white relative">
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-bold tracking-tighter mb-6 leading-tight">
            Welcome back to <br /> FASHION_RE.
          </h2>
          <p className="text-xl text-zinc-400 font-light leading-relaxed">
            Your curated wardrobe is waiting. Log in to manage your listings and discover new arrivals.
          </p>
        </div>
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800')] bg-cover grayscale" />
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-50/50">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        {/* Top Navigation */}
        <div className="p-8 pb-0 z-10 flex justify-between items-center w-full max-w-[480px] mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-semibold text-zinc-400 hover:text-black transition-all group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to browsing
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
          <div className="w-full max-w-[480px]">
            
            {/* Welcome Text - Positioned exactly like your RegisterPage */}
            <div className="mb-4 text-left"> 
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Log in to your account
              </h1>
            </div>

            <LoginForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                New to the community?{" "}
                <Link to="/register" className="font-bold text-black underline underline-offset-4 hover:text-zinc-700">
                  Join now
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0 text-center z-10">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">
            FASHION_RE resale &copy; 2025 — Secure Login
          </p>
        </div>
      </div>
    </div>
  )
}