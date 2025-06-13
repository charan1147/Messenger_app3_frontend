import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 🧠 Set token in headers if found
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // ✅ Fetch user info using token
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/users/me");
        setUser(res.data.user); // Fix: .user, not entire res.data
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("Auto-login failed", err.response?.data?.message);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    const token = localStorage.getItem("token");
    if (!user && token) {
      fetchUser();
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    if (res.data?.user && res.data?.token) {
      localStorage.setItem("token", res.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
