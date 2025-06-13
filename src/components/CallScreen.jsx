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
        position: "relative",
        width: "100%",
        height: "80vh",
        background: "#000",
      }}
    >
      {call && !callAccepted && (
        <div style={{ padding: 20 }}>
          <p>
            Incoming {call.isVideo ? "Video" : "Audio"} call from{" "}
            <strong>{call.from}</strong>
          </p>
          <button onClick={handleAnswer}>Answer</button>
        </div>
      )}

      {(callAccepted || localStream) && (
        <>
          {/* Remote video = fullscreen */}
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 1,
              backgroundColor: "black",
            }}
          />

          {/* Local video = small corner */}
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              width: 200,
              height: 150,
              border: "2px solid white",
              zIndex: 2,
              borderRadius: 8,
              objectFit: "cover",
              backgroundColor: "black",
            }}
          />

          <button
            onClick={() => endCall(remoteUserId)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "5px 15px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: 3,
            }}
          >
            End Call
          </button>
        </>
      )}
    </div>
  );
}
