export default function Message({ message, isOwn, senderName, time }) {
  return (
    <div
      style={{
        textAlign: isOwn ? "right" : "left",
        marginBottom: "10px",
      }}
    >
      <div style={{ fontWeight: "bold" }}>{senderName}</div>
      <div
        style={{
          display: "inline-block",
          backgroundColor: isOwn ? "#DCF8C6" : "#FFF",
          padding: "8px",
          borderRadius: "10px",
          maxWidth: "60%",
        }}
      >
        {message.content}
      </div>
      <div style={{ fontSize: "0.8em", color: "#888" }}>{time}</div>
    </div>
  );
}
