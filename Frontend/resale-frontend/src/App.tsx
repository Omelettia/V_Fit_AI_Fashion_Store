import { Routes, Route } from "react-router-dom"
import { Header } from "@/components/Header"
import { ProductCard } from "@/components/ProductCard"
import RegisterPage from "@/pages/Register/RegisterPage"
import LoginPage from "@/pages/Login/LoginPage"
import ProfilePage from "@/pages/Profile/ProfilePage"

// Move your MOCK_PRODUCTS to a separate file later, but keep it here for now
const MOCK_PRODUCTS = [
  { id: 1, name: "Vintage Leather Jacket", price: 120, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" },
  { id: 2, name: "Oversized Beige Hoodie", price: 85, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500" },
  { id: 3, name: "Classic Denim Jeans", price: 65, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500" },
  { id: 4, name: "Designer Sunglasses", price: 210, image: "https://images.unsplash.com/photo-1511499767390-90342f54b207?w=500" },
];

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white pb-16">
      <Header />

      <main className="flex-1 px-4 py-6">
        <Routes>
          {/* Route 1: The Home Page */}
          <Route path="/" element={
            <>
              <h2 className="mb-4 text-xl font-bold italic">Latest Arrivals</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {MOCK_PRODUCTS.map((item) => (
                  <ProductCard key={item.id} {...item} />
                ))}
              </div>
            </>
          } />
          {/* Route 2: The Login Page */}
          <Route path="/login" element={<LoginPage />} />
          {/* Route 3: The Register Page */}
          <Route path="/register" element={<RegisterPage />} />
          {/* Route 4: The Profile Page */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* Persistent Bottom Nav (Always visible) */}
      <nav className="fixed bottom-0 flex w-full border-t bg-white p-4 justify-around z-50">
        <button className="text-sm">Home</button>
        <button className="text-sm">Sell</button>
        <button className="text-sm">Profile</button>
      </nav>
    </div>
  )
}

export default App