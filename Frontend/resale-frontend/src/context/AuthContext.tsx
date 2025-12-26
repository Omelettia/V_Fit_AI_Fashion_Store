import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const userData = await apiFetch("/users/me");
      setUser(userData);
      return userData; // Return data so callers can await the result
    } catch (err) {
      console.error("Auth refresh failed", err);
     
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await refreshUser(); 
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  return (
    // Added refreshUser to the Provider value
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);