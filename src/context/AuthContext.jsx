import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Fetch logged-in user on first load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data.user); // assume response is { user: {...} }
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    };

    // Fetch only if user or token not in localStorage
    const token = localStorage.getItem("token");
    if (!user && token) {
      fetchUser();
    }
  }, []); // ✅ empty array — runs only once

  // Login function
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    if (res.data?.user && res.data?.token) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token); // ✅ store token
    }

    return res.data;
  };

  // Logout function
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
