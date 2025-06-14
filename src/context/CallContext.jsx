import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Peer from "simple-peer";
import socket from "../websocket/socket";
import { getRoomId } from "../utils/room";

export const CallContext = createContext();

export const CallProvider = ({ children, currentUser }) => {
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerRef = useRef();
  const currentCallRoom = useRef(null);

  useEffect(() => {
    socket.on("call:user", ({ from, signal, isVideo }) => {
      setCall({ from, signal, isVideo });
    });

    socket.on("call:ended", () => {
      endCallCleanup();
    });

    return () => {
      socket.off("call:user");
      socket.off("call:ended");
    };
  }, []);

  const callUser = async (remoteUserId, isVideo = true) => {
    const roomId = getRoomId(currentUser._id, remoteUserId);
    currentCallRoom.current = roomId;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });
    setLocalStream(stream);

    const peer = new Peer({ initiator: true, trickle: false, stream });
    peerRef.current = peer;

    socket.emit("joinRoom", { roomId });

    peer.on("signal", (signalData) => {
      socket.emit("callUser", {
        roomId,
        from: currentUser._id,
        signalData,
        isVideo,
      });
    });

    socket.on("call:accepted", ({ signal }) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
    });
  };

  const answerCall = async ({ from, signal, isVideo }) => {
    const roomId = getRoomId(currentUser._id, from);
    currentCallRoom.current = roomId;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });
    setLocalStream(stream);

    const peer = new Peer({ initiator: false, trickle: false, stream });
    peerRef.current = peer;

    socket.emit("joinRoom", { roomId });

    peer.on("signal", (signalResp) => {
      socket.emit("answerCall", {
        roomId,
        signal: signalResp,
      });
    });

    peer.signal(signal);

    peer.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
    });

    setCallAccepted(true);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
  };

  const endCall = () => {
    if (currentCallRoom.current) {
      socket.emit("endCall", { roomId: currentCallRoom.current });
    }
    endCallCleanup();
  };

  const endCallCleanup = () => {
    peerRef.current?.destroy();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setCall(null);
    setCallAccepted(false);
    setCallEnded(true);
    setLocalStream(null);
    setRemoteStream(null);
    currentCallRoom.current = null;
  };

  return (
    <CallContext.Provider
      value={{
        call,
        callAccepted,
        callEnded,
        localStream,
        remoteStream,
        callUser,
        answerCall,
        endCall,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
