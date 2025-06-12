import { useEffect } from "react";
import socket from "../websocket/socket";

export default function useWebSocket(onReceive) {
  useEffect(() => {
    socket.on("receiveMessage", onReceive);
    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [onReceive]);
}
