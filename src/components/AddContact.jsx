import React, { useState } from "react";
import api from "../services/api";

export default function AddContact() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msgType, setMsgType] = useState("success"); // 'success' or 'error'

  const addContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await api.post("/users/add-contact", { email });
      setMsg("✅ Contact added successfully.");
      setMsgType("success");
      setEmail(""); // Clear input
    } catch (err) {
      setMsg(
        err.response?.data?.message || "❌ Failed to add contact. Try again."
      );
      setMsgType("error");
    } finally {
      setLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <form onSubmit={addContact}>
      <input
        placeholder="Contact Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Contact"}
      </button>

      {msg && (
        <p style={{ color: msgType === "success" ? "green" : "red" }}>{msg}</p>
      )}
    </form>
  );
}
