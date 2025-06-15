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
  const { contactId } = useParams(); // From URL
  const { user } = useContext(AuthContext);
  const { messages, setMessages } = useContext(ChatContext);
  const { callUser } = useContext(CallContext);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // ✅ Log user and contact info
  console.log("🧑 Authenticated user:", user);
  console.log("📨 Contact ID from URL:", contactId);

  // ✅ Fetch messages from backend
  useEffect(() => {
    async function fetchData() {
      try {
        if (!contactId) return;

        console.log("🔄 Fetching messages for:", contactId);
        setLoading(true);
        setError("");

        const msgRes = await api.get(`/messages/${contactId}`);
        console.log("✅ Messages fetched:", msgRes.data);

        setMessages(msgRes.data);
        setContactEmail(contactId); // You can enhance this later with contact details
      } catch (err) {
        console.error("❌ Error fetching chat:", err);
        setError("Failed to load chat.");
      } finally {
        console.log("🟢 Finished loading messages");
        setLoading(false);
      }
    }

    fetchData();
  }, [contactId, setMessages]);

  // ✅ Receive message in real time via WebSocket
  const handleReceive = useCallback(
    (msg) => {
      if (
        (msg.sender === contactId && msg.receiver === user._id) ||
        (msg.sender === user._id && msg.receiver === contactId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    [contactId, user, setMessages]
  );

  // ✅ Custom hook to handle WebSocket setup
  useWebSocket(handleReceive);

  // ✅ Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const payload = {
        receiverId: contactId,
        content: input,
      };

      const res = await api.post("/messages", payload);
      setMessages((prev) => [...prev, res.data]);
      socket.emit("sendMessage", res.data);
      setInput("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setError("Failed to send message.");
    }
  };

  // ✅ Start video call
  const handleStartCall = () => {
    const roomId = [user._id, contactId].sort().join("_");
    callUser(roomId);
  };

  // ✅ Early exits for invalid cases
  if (!user || !user._id || !contactId) {
    return <p style={{ color: "red" }}>⚠️ Invalid user or contact.</p>;
  }

  if (loading) {
    return <p>Loading chat...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>
        Chat with <span style={{ color: "blue" }}>{contactEmail}</span>
      </h2>

      <ChatBox messages={messages} currentUserId={user._id} />

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          type="text"
          style={{ flex: 1, padding: "6px" }}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
