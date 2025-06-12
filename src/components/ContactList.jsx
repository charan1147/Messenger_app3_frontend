import { useContacts } from "../context/ContactContext";

export default function ContactList() {
  const { contacts } = useContacts();

  if (!contacts.length) return <p>No contacts yet.</p>;

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact._id}>
          {contact.username} ({contact.email})
        </li>
      ))}
    </ul>
  );
}
