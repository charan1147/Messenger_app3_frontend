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
  const scrollRef = useRef(null);

  // Set local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.createdAt || msg.timestamp);
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div style={styles.wrapper}>
      {/* Message List */}
      <div style={styles.messageContainer}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div style={styles.dateLabel}>{date}</div>
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
                      ...styles.messageBubble,
                      backgroundColor: isCurrentUser ? "#dcf8c6" : "#f1f0f0",
                      alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={styles.senderLabel}>{senderLabel}</div>
                    <div>{msg.content}</div>
                    <div style={styles.timeLabel}>
                      {formatTime(msg.createdAt || msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Audio/Video Call Preview */}
      {(isAudioCallActive || isVideoCallActive) && (
        <div style={styles.callPreview}>
          <p>{isVideoCallActive ? "🎥 Video" : "🔊 Audio"} Call in Progress</p>

          {isVideoCallActive && (
            <div style={styles.videoContainer}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={styles.video}
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={styles.video}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#fff",
  },
  messageContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "5px",
    maxHeight: "60vh",
  },
  dateLabel: {
    textAlign: "center",
    margin: "10px 0 4px",
    fontWeight: "bold",
    color: "#555",
  },
  messageBubble: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "10px",
    maxWidth: "75%",
    position: "relative",
  },
  senderLabel: {
    fontSize: "0.75rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "3px",
  },
  timeLabel: {
    fontSize: "0.7rem",
    marginTop: "4px",
    color: "#666",
    textAlign: "right",
  },
  callPreview: {
    marginTop: 12,
    paddingTop: 8,
    borderTop: "1px solid #eee",
  },
  videoContainer: {
    display: "flex",
    gap: "10px",
    marginTop: 8,
  },
  video: {
    width: "200px",
    height: "150px",
    border: "1px solid #000",
    borderRadius: 6,
    objectFit: "cover",
  },
};
