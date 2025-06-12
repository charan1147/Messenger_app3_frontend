import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // 🔥 sync on success
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      }
    }

    // Only fetch if no user is in localStorage
    if (!user) {
      fetchUser();
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
