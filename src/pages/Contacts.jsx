import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContactContext } from "../context/ContactContext";
import api from "../services/api";

export default function Contacts() {
  const { contacts, setContacts } = useContext(ContactContext);
  const navigate = useNavigate(); // ✅ Initialize navigate

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await api.get("/users/contacts");
        setContacts(res.data.contacts);
      } catch (err) {
        console.error("Fetch contacts error:", err);
        setContacts([]);
      }
    }
    fetchContacts();
  }, []);

  const handleContactClick = (contactId) => {
    navigate(`/chat/${contactId}`); // ✅ Navigate to chat page with contact ID
  };

  return (
    <div>
      <h2>Your Contacts</h2>
      <ul>
        {contacts.map((c) => (
          <li
            key={c._id}
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => handleContactClick(c._id)} // ✅ Click handler
          >
            {c.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
