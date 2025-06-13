import React, { createContext, useState, useRef, useEffect } from "react";
import Peer from "simple-peer";
import socket from "../websocket/socket";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [call, setCall] = useState(null); // Incoming call data
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerRef = useRef();

  // 📞 Start call (as caller)
  const startCall = async ({ to, isVideo, from }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setLocalStream(stream);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("signal", (signalData) => {
        socket.emit("callUser", {
          userToCall: to,
          signalData,
          from,
          isVideo,
        });
      });

      peer.on("stream", (remote) => {
        setRemoteStream(remote);
      });

      peerRef.current = peer;
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // ✅ Answer incoming call
  const answerCall = async ({ signal, from, isVideo }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setLocalStream(stream);
      setCallAccepted(true);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (signalData) => {
        socket.emit("answerCall", {
          to: from,
          signal: signalData,
        });
      });

      peer.on("stream", (remote) => {
        setRemoteStream(remote);
      });

      peer.signal(signal);
      peerRef.current = peer;
    } catch (error) {
      console.error("Error answering call:", error);
    }
  };

  // ❌ End the call
  const endCall = (to) => {
    setCallEnded(true);
    peerRef.current?.destroy();
    localStream?.getTracks().forEach((track) => track.stop());

    setCall(null);
    setCallAccepted(false);
    setLocalStream(null);
    setRemoteStream(null);

    if (to) {
      socket.emit("endCall", { to });
    }
  };

  // 📡 Handle socket events
  useEffect(() => {
    const handleIncomingCall = ({ from, signal, isVideo }) => {
      setCall({ from, signal, isVideo });
    };

    const handleCallAccepted = ({ signal }) => {
      setCallAccepted(true);
      peerRef.current?.signal(signal);
    };

    const handleCallEnded = () => {
      setCallEnded(true);
      peerRef.current?.destroy();
      localStream?.getTracks().forEach((track) => track.stop());

      setCall(null);
      setCallAccepted(false);
      setLocalStream(null);
      setRemoteStream(null);
    };

    socket.on("call:user", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("call:user", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:ended", handleCallEnded);
    };
  }, [localStream]);

  return (
    <CallContext.Provider
      value={{
        call,
        callAccepted,
        callEnded,
        localStream,
        remoteStream,
        startCall,
        answerCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
