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
        const res = await api.get("/users/me"); // assumes backend at /api/users/me
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
      }
    }

    fetchUser(); // ✅ fetch only once
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    // ✅ if you're using tokens instead of cookies:
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }

    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅ if using token
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
