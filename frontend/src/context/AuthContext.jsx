import { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("petshop_admin");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("petshop_admin_token", data.token);
    localStorage.setItem("petshop_admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }

  function logout() {
    localStorage.removeItem("petshop_admin_token");
    localStorage.removeItem("petshop_admin");
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
