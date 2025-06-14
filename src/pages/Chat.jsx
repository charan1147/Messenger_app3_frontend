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
  const { contactId } = useParams(); // URL param
  const { user } = useContext(AuthContext);
  const { messages, setMessages } = useContext(ChatContext);
  const { callUser } = useContext(CallContext);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // ✅ Fetch messages and contact info
  useEffect(() => {
    async function fetchData() {
      try {
        if (!contactId) return;

        setLoading(true);
        setError("");

        // Fetch chat messages and contact email in parallel
        const [msgRes, contactRes] = await Promise.all([
          api.get(`/messages/${contactId}`),
          api.get(`/contacts/${contactId}`),
        ]);

        setMessages(msgRes.data);
        setContactEmail(contactRes.data?.email || contactId);
      } catch (err) {
        console.error("❌ Error fetching chat:", err);
        setError("Failed to load chat.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [contactId, setMessages]);

  // ✅ Handle receiving a new message in real-time
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

  // ✅ Listen for messages via WebSocket
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

  // ✅ Render loading or error
  if (!user || !user._id || !contactId || loading) {
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
