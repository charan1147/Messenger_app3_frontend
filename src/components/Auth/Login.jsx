import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      setError("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoComplete="email"
        required
      />
      <input
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </form>
  );
}
