import React, { useState } from "react";
import api from "../../services/api";

export default function Register() {
  const [name, setName] = useState(""); // Add name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password }); // Include name
      setMessage("Registration successful. Please login.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text"
        required
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
      />
      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
      />
      <button type="submit">Register</button>
      {message && <p>{message}</p>}
    </form>
  );
}
