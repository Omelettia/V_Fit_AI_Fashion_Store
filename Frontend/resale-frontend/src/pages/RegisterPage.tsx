import { RegisterForm } from "@/components/RegisterForm"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  return (
    // min-h-screen allows the page to expand if the form is tall
    <div className="flex min-h-screen bg-white">
      
      {/* LEFT SIDE: Brand/Inspiration */}
      {/* h-screen + sticky keeps the image locked in place while you scroll the form */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 items-center justify-center p-12 text-white relative h-screen sticky top-0">
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-bold tracking-tighter mb-6 leading-tight">
            Join the future of <br /> circular fashion.
          </h2>
          <p className="text-xl text-zinc-400 font-light leading-relaxed">
            Buy, sell, and discover unique vintage pieces from a global community of curators.
          </p>
        </div>
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800')] bg-cover grayscale" />
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-50/50 min-h-screen">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        {/* Top Navigation Bar */}
        <div className="w-full max-w-[480px] mx-auto px-8 pt-8 z-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-semibold text-zinc-400 hover:text-black transition-all group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to browsing
          </Link>
        </div>

        {/* Main Content Area */}
        {/* Changed justify-center to justify-start + pt-12 to move form higher as requested */}
        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-8 z-10">
           <div className="mb-6 text-left">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Welcome to the world of fashion
              </h1>
            </div>

          <div className="w-full max-w-[480px]">
            
           
            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-black underline underline-offset-4 hover:text-zinc-700">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center z-10">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">
            FASHION_RE resale &copy; 2025 — Secure Registration
          </p>
        </div>
      </div>
    </div>
  )
}