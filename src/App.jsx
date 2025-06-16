import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// 🧠 Contexts
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { ContactProvider } from "./context/ContactContext";
import { CallProvider } from "./context/CallContext";

// 📦 Components & Pages
import Navbar from "./components/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import Chat from "./pages/Chat";
import AddContact from "./components/AddContact";

// 🔐 PrivateRoute - accessible only if authenticated
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

// 🌐 PublicRoute - accessible only if NOT authenticated
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
                {/* Public Routes */}
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

                {/* Private Routes */}
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
                      <div>
                        <Contacts />
                        <AddContact />
                      </div>
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
