// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import { apiFetch } from "@/lib/api"
// type User = { id: string; email: string; name?: string };
// type AuthContextType = {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// };
// const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     if (token && !user) {
//       fetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
//         .then((r) => r.ok ? r.json() : Promise.reject())
//         .then((u) => setUser(u))
//         .catch(() => { setUser(null); setToken(null); localStorage.removeItem("token"); });
//     }
//   }, [token]);

//   const login = async (email: string, password: string) => {
//     const res = await fetch("/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     if (!res.ok) throw new Error("Invalid credentials");
//     const { token: t } = await res.json();
//     localStorage.setItem("token", t);
//     setToken(t);
//     const me = await fetch("/auth/me", { headers: { Authorization: `Bearer ${t}` } });
//     setUser(await me.json());
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("token");
//   };

//   const value = useMemo(() => ({
//     user, token, isAuthenticated: !!token && !!user, login, logout
//   }), [user, token]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }
