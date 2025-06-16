import React, { useState, useContext, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { CallContext } from "../context/CallContext";
import api from "../services/api";
import socket from "../websocket/socket";
import ChatBox from "../components/Chat/ChatBox";
import useWebSocket from "../hooks/useWebSocket";
import CallScreen from "../components/CallScreen";

export default function Chat() {
  const { contactId } = useParams();
  const { user } = useContext(AuthContext);
  const { messages, setMessages } = useContext(ChatContext);
  const { callUser } = useContext(CallContext);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // ✅ Fetch messages
  useEffect(() => {
    async function fetchData() {
      if (!contactId) return;

      try {
        setLoading(true);
        setError("");
        const msgRes = await api.get(`/messages/${contactId}`);
        setMessages(msgRes.data);
        setContactEmail(contactId); // Update this to display name if available
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load chat.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [contactId, setMessages]);

  // ✅ WebSocket receive handler
  const handleReceive = useCallback(
    (msg) => {
      const isFromOrToContact =
        (msg.sender === contactId && msg.receiver === user._id) ||
        (msg.sender === user._id && msg.receiver === contactId);

      if (isFromOrToContact) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    [contactId, user._id, setMessages]
  );

  useWebSocket(handleReceive);

  // ✅ Send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const payload = { receiverId: contactId, content: input };
      const res = await api.post("/messages", payload);
      setMessages((prev) => [...prev, res.data]);
      socket.emit("sendMessage", res.data);
      setInput("");
      setError("");
    } catch (err) {
      console.error("❌ Send error:", err);
      setError("Failed to send message.");
    }
  };

  // ✅ Support Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStartCall = () => {
    const roomId = [user._id, contactId].sort().join("_");
    callUser(contactId, true); // Ensure remote ID is passed to `callUser`
  };

  // ✅ Guard for invalid users
  if (!user || !user._id || !contactId) {
    return <p style={{ color: "red" }}>⚠️ Invalid user or contact ID.</p>;
  }

  if (loading) return <p>Loading chat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>
        Chat with <span style={{ color: "blue" }}>{contactEmail}</span>
      </h2>

      <ChatBox messages={messages} currentUserId={user._id} />

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, padding: "8px", fontSize: "16px" }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 8 }}>
          Send
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleStartCall}>📹 Start Video Call</button>
      </div>

      <CallScreen currentUserId={user._id} remoteUserId={contactId} />
    </div>
  );
}
