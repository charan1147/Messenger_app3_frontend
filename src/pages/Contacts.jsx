import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContactContext } from "../context/ContactContext";
import api from "../services/api";

export default function Contacts() {
  const { contacts, setContacts } = useContext(ContactContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get("/users/contacts");
        setContacts(res.data.contacts || []);
      } catch (err) {
        console.error("Fetch contacts error:", err);
        setContacts([]);
      }
    };

    fetchContacts();
  }, [setContacts]);

  const handleContactClick = (contactId) => {
    navigate(`/chat/${contactId}`);
  };

  if (!contacts || contacts.length === 0) {
    return <p>No contacts found. Add some to start chatting!</p>;
  }

  return (
    <div>
      <h2>Your Contacts</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {contacts.map((c) => (
          <li
            key={c._id}
            onClick={() => handleContactClick(c._id)}
            style={{
              cursor: "pointer",
              padding: "10px",
              marginBottom: "8px",
              backgroundColor: "#f1f1f1",
              borderRadius: "5px",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e0e0e0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#f1f1f1")
            }
          >
            <strong>{c.username || c.name || c.email}</strong>
            <br />
            <small>{c.email}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
