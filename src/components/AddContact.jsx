import React, { useState } from "react";
import api from "../services/api";

export default function AddContact() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  const addContact = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/add-contact", { email });
      setMsg("Contact added");
    } catch {
      setMsg("Failed to add contact");
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
      />
      <button type="submit">Add Contact</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
