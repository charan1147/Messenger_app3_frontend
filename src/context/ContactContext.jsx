// src/context/ContactContext.jsx
import React, { createContext, useState, useContext } from "react";

export const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);

  return (
    <ContactContext.Provider value={{ contacts, setContacts }}>
      {children}
    </ContactContext.Provider>
  );
};

// ✅ Custom hook for easier usage
export const useContacts = () => useContext(ContactContext);
