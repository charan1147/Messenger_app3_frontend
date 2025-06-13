import React, { useContext, useEffect, useRef, useState } from "react";
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
  const [isMuted, setIsMuted] = useState(false);
  const ring = useRef(null);

  // Attach local stream to video
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video
  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle ringing sound on incoming call
  useEffect(() => {
    if (call && !callAccepted) {
      ring.current = new Audio("/ringtone.mp3");
      ring.current.loop = true;
      ring.current.play().catch((err) => console.log("Autoplay blocked:", err));
    }
    return () => {
      ring.current?.pause();
    };
  }, [call, callAccepted]);

  const handleAnswer = () => {
    if (call) {
      ring.current?.pause();
      answerCall(call);
    }
  };

  const handleReject = () => {
    ring.current?.pause();
    endCall(call?.from);
  };

  const handleEnd = () => {
    endCall(remoteUserId);
  };

  const toggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
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
      {/* Incoming call screen */}
      {call && !callAccepted && (
        <div
          style={{
            padding: 20,
            color: "white",
            zIndex: 10,
            position: "absolute",
            top: 20,
            left: 20,
            background: "rgba(0,0,0,0.7)",
            borderRadius: 10,
          }}
        >
          <p>
            📞 Incoming {call.isVideo ? "Video" : "Audio"} call from{" "}
            <strong>{call.from}</strong>
          </p>
          <button onClick={handleAnswer} style={buttonStyle("green")}>
            Answer
          </button>
          <button onClick={handleReject} style={buttonStyle("red")}>
            Reject
          </button>
        </div>
      )}

      {/* Video display */}
      {(callAccepted || localStream) && (
        <>
          {/* Remote stream */}
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

          {/* Local stream preview */}
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

          {/* Mute & End buttons */}
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
            <button onClick={toggleMute} style={buttonStyle("gray")}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={handleEnd}
              style={{ ...buttonStyle("red"), marginLeft: 10 }}
            >
              End Call
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Reusable button styles
const buttonStyle = (color) => ({
  padding: "8px 16px",
  marginTop: 10,
  backgroundColor: color,
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
});
