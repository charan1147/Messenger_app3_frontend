import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/contacts" style={styles.link}>
          Contacts
        </Link>
        {user ? (
          <span style={styles.welcome}>Welcome, {user.email}</span>
        ) : (
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        )}
      </div>

      {user && (
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "white",
  },
  link: {
    color: "white",
    marginRight: "15px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  welcome: {
    marginLeft: "10px",
    fontStyle: "italic",
    color: "#ccc",
  },
  logoutBtn: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
