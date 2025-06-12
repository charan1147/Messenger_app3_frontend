import React, { useRef, useEffect } from "react";

export default function AudioCall({ localStream, remoteStream }) {
  const localAudioRef = useRef();
  const remoteAudioRef = useRef();

  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div>
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
      <p>🔊 Audio Call in Progress</p>
    </div>
  );
}
