import { Header } from "@/components/Header"
import { ProductCard } from "@/components/ProductCard"

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white pb-16">
      <Header /> {/* Your Top Nav logic */}

      <main className="flex-1 px-4 py-6">
        <h2 className="mb-4 text-xl font-bold italic">Latest Arrivals</h2>
        {/* This grid makes your feed look great on all screens */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* We will map real data here later! */}
          <ProductCard />
          <ProductCard />
        </div>
      </main>

      {/* Bottom Nav Bar - Your persistent anchor */}
      <nav className="fixed bottom-0 flex w-full border-t bg-white p-4 justify-around">
        <button>Home</button>
        <button>Sell</button> {/* This is your distinct CTA */}
        <button>Profile</button>
      </nav>
    </div>
  )
}

export default App