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

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const ring = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  // Attach local stream
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Ringtone on incoming call
  useEffect(() => {
    if (call && call.from !== currentUserId && !callAccepted) {
      ring.current = new Audio("/ringtone.mp3");
      ring.current.loop = true;
      ring.current.play().catch((err) => console.log("Autoplay blocked:", err));
    }
    return () => {
      ring.current?.pause();
    };
  }, [call, callAccepted, currentUserId]);

  const handleAnswer = () => {
    ring.current?.pause();
    answerCall(call);
  };

  const handleReject = () => {
    ring.current?.pause();
    endCall(call?.from);
  };

  const handleEndCall = () => {
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

  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOff(!videoTrack.enabled);
    }
  };

  // No call active
  if (!call && !callAccepted && !localStream) return null;

  return (
    <div style={wrapperStyle}>
      {/* Incoming Call */}
      {call && call.from !== currentUserId && !callAccepted && (
        <div style={incomingCallBox}>
          <p>
            📞 Incoming {call.isVideo ? "Video" : "Audio"} Call from{" "}
            <strong>{call.fromName || call.from}</strong>
          </p>
          <button onClick={handleAnswer} style={buttonStyle("green")}>
            Answer
          </button>
          <button onClick={handleReject} style={buttonStyle("red")}>
            Reject
          </button>
        </div>
      )}

      {/* Calling Screen */}
      {call && call.from === currentUserId && !callAccepted && (
        <div style={incomingCallBox}>
          <p>
            ⏳ Calling <strong>{call.toName || remoteUserId}</strong>...
          </p>
          <button onClick={handleEndCall} style={buttonStyle("red")}>
            Cancel
          </button>
        </div>
      )}

      {/* Active Call UI */}
      {(callAccepted || localStream) && (
        <>
          <video ref={remoteRef} autoPlay playsInline style={videoStyle} />
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
              borderRadius: 8,
              objectFit: "cover",
              zIndex: 2,
            }}
          />

          {/* Controls */}
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
            <button onClick={toggleMute} style={buttonStyle("gray")}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={toggleVideo}
              style={{ ...buttonStyle("gray"), marginLeft: 8 }}
            >
              {videoOff ? "Start Video" : "Stop Video"}
            </button>
            <button
              onClick={handleEndCall}
              style={{ ...buttonStyle("red"), marginLeft: 8 }}
            >
              End Call
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Styles
const wrapperStyle = {
  marginTop: 20,
  width: "100%",
  height: "80vh",
  background: "#000",
  position: "relative",
};

const videoStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: 1,
};

const incomingCallBox = {
  padding: 20,
  background: "rgba(0, 0, 0, 0.8)",
  color: "white",
  borderRadius: 10,
  position: "absolute",
  top: 30,
  left: 30,
  zIndex: 10,
  maxWidth: "80%",
};

const buttonStyle = (color) => ({
  padding: "8px 16px",
  marginTop: 10,
  backgroundColor: color,
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
});
