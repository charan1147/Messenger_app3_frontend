import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <h1>Welcome to Chat App</h1>
      {user ? (
        <p style={styles.text}>
          You are logged in as <strong>{user.email}</strong>.
        </p>
      ) : (
        <p style={styles.text}>
          Please <Link to="/login">Login</Link> or{" "}
          <Link to="/register">Register</Link> to start chatting.
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "40px",
    textAlign: "center",
  },
  text: {
    fontSize: "18px",
    color: "#444",
  },
};
