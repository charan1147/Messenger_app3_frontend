import { useContacts } from "../context/ContactContext";

export default function ContactList() {
  const { contacts } = useContacts();

  if (!contacts || contacts.length === 0) {
    return <p>No contacts added yet.</p>;
  }

  return (
    <div>
      <h3>📇 Your Contacts</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {contacts.map((contact) => (
          <li
            key={contact._id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <strong>{contact.username || contact.name}</strong>
            <br />
            <small>{contact.email}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
