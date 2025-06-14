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

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await api.get(`/messages/${contactId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    }
    if (contactId) loadMessages();
  }, [contactId, setMessages]);

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

  useWebSocket(handleReceive);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const payload = { receiverId: contactId, content: input };
      const res = await api.post("/messages", payload);
      setMessages((prev) => [...prev, res.data]);
      socket.emit("sendMessage", res.data);
      setInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // ✅ Create unique room for both users (sorted to ensure both sides generate same ID)
  const handleStartCall = () => {
    const roomId = [user._id, contactId].sort().join("_");
    callUser(roomId); // Only one button for video call
  };

  if (!user || !user._id || !contactId) return <p>Loading...</p>;

  return (
    <div>
      <h2>Chat with {contactId}</h2>

      <ChatBox messages={messages} currentUserId={user._id} />

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          style={{ flex: 1 }}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} style={{ marginLeft: 5 }}>
          Send
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={handleStartCall}>📹 Start Video Call</button>
      </div>

      <CallScreen currentUserId={user._id} remoteUserId={contactId} />
    </div>
  );
}
