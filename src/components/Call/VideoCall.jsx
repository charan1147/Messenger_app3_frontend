export default function VideoCall({ localStream, remoteStream, endCall }) {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted style={{ width: 200 }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: 200 }} />
      <button
        onClick={endCall}
        style={{ backgroundColor: "red", color: "white" }}
      >
        End Call
      </button>
    </div>
  );
}
