import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import socket from "../websocket/socket"; // ✅ Import the socket

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ Register user with socket server when user is ready
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", user._id);
      console.log("✅ Socket registered with user ID:", user._id);
    }
  }, [user]);

  // Fetch logged-in user on first load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    };

    const token = localStorage.getItem("token");
    if (!user && token) {
      fetchUser();
    }
  }, []); // ✅ Runs only once

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    if (res.data?.user && res.data?.token) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
    }

    return res.data;
  };

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
