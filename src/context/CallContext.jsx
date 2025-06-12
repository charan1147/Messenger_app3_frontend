import React, { createContext, useState, useRef, useEffect } from "react";
import Peer from "simple-peer";
import socket from "../websocket/socket";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [call, setCall] = useState(null); // { from, isVideo, signal }
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerRef = useRef();

  const startCall = async ({ to, isVideo, from }) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });
    setLocalStream(stream);

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: to,
        signalData: data,
        from,
        isVideo,
      });
    });

    peer.on("stream", (remote) => setRemoteStream(remote));
    peerRef.current = peer;
  };

  const answerCall = async ({ signal, from, isVideo }) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });
    setLocalStream(stream);
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { to: from, signal: data });
    });
    peer.on("stream", (remote) => setRemoteStream(remote));
    peer.signal(signal);

    peerRef.current = peer;
  };

  const endCall = (to) => {
    setCallEnded(true);
    peerRef.current?.destroy();
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    socket.emit("endCall", { to });
  };

  useEffect(() => {
    socket.on("call:user", ({ from, signal, isVideo }) => {
      setCall({ from, signal, isVideo });
    });

    socket.on("call:accepted", ({ signal }) => {
      setCallAccepted(true);
      peerRef.current?.signal(signal);
    });

    socket.on("call:ended", () => {
      setCallEnded(true);
      peerRef.current?.destroy();
      localStream?.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setRemoteStream(null);
    });

    return () => {
      socket.off("call:user");
      socket.off("call:accepted");
      socket.off("call:ended");
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
