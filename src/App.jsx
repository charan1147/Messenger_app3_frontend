import React, { useContext } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { CallProvider } from "./context/CallContext";
import { AuthProvider,AuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { ContactProvider } from "./context/ContactContext";

import Navbar from "./components/Navbar"
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import Chat from "./pages/Chat";
import AddContact from "./components/AddContact";

// 🔒 PrivateRoute (only for logged-in users)
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

// 🌐 PublicRoute (only for guests)
function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);
  return !user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ContactProvider>
          <CallProvider>
            <Router>
              <Navbar />
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/contacts"
                  element={
                    <PrivateRoute>
                      <>
                        <Contacts />
                        <AddContact />
                      </>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat/:contactId"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Router>
          </CallProvider>
        </ContactProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
