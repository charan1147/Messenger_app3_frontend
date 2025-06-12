import React, { useEffect, useRef } from "react";

export default function ChatBox({
  messages = [],
  currentUserId,
  isAudioCallActive,
  isVideoCallActive,
  localStream,
  remoteStream,
  userId,
  remoteUserId,
  callHandlers = {},
}) {
  const {
    callUser = () => {},
    answerCall = () => {},
    endCall = () => {},
    peerConnection = null,
  } = callHandlers;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (isoString) =>
    new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.createdAt || msg.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div
              style={{
                textAlign: "center",
                margin: "10px 0",
                fontWeight: "bold",
                color: "#555",
              }}
            >
              {date}
            </div>
            {msgs.map((msg) => {
              const isCurrentUser =
                msg.sender?._id === currentUserId ||
                msg.sender === currentUserId;
              const senderLabel = isCurrentUser
                ? "You"
                : msg.sender?.name || "Sender";

              return (
                <div
                  key={msg._id}
                  style={{
                    textAlign: isCurrentUser ? "right" : "left",
                    margin: "4px 0",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: isCurrentUser ? "#dcf8c6" : "#f1f0f0",
                      padding: "6px 12px",
                      borderRadius: "10px",
                      position: "relative",
                      maxWidth: "80%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "2px",
                      }}
                    >
                      {senderLabel}
                    </div>
                    <div>{msg.content}</div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        marginTop: "2px",
                        color: "#666",
                        textAlign: "right",
                      }}
                    >
                      {formatTime(msg.createdAt || msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {(isAudioCallActive || isVideoCallActive) && (
        <div style={{ marginTop: 10 }}>
          <p>{isVideoCallActive ? "Video" : "Audio"} Call in Progress</p>
          {isVideoCallActive && (
            <div style={{ display: "flex", gap: "10px" }}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "200px", border: "1px solid black" }}
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: "200px", border: "1px solid black" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
