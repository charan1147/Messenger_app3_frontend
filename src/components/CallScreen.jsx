import React, { useContext, useEffect, useRef } from "react";
import { CallContext } from "../context/CallContext";

export default function CallScreen({ currentUserId, remoteUserId }) {
  const {
    call,
    callAccepted,
    callEnded,
    localStream,
    remoteStream,
    answerCall,
    endCall,
  } = useContext(CallContext);

  const localRef = useRef();
  const remoteRef = useRef();

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleAnswer = () => {
    if (call) answerCall(call);
  };

  if (!call && !callAccepted && !localStream) return null;

  return (
    <div
      style={{
        marginTop: 20,
        padding: 10,
        border: "2px solid #444",
        background: "#f5f5f5",
      }}
    >
      {call && !callAccepted && (
        <div>
          <p>
            Incoming {call.isVideo ? "Video" : "Audio"} call from{" "}
            <strong>{call.from}</strong>
          </p>
          <button onClick={handleAnswer}>Answer</button>
        </div>
      )}

      {(callAccepted || localStream) && (
        <div>
          <h4>{call?.isVideo ? "Video Call" : "Audio Call"} in Progress</h4>
          <div style={{ display: "flex", gap: 20 }}>
            <video
              ref={localRef}
              autoPlay
              muted
              playsInline
              style={{ width: 200, height: 150, border: "1px solid black" }}
            />
            {call?.isVideo && (
              <video
                ref={remoteRef}
                autoPlay
                playsInline
                style={{ width: 200, height: 150, border: "1px solid black" }}
              />
            )}
          </div>
          <button
            onClick={() => endCall(remoteUserId)}
            style={{
              marginTop: 10,
              padding: "5px 15px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
