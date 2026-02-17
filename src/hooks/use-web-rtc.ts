import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/lib/socket-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export type CallStatus = "idle" | "calling" | "receiving" | "connected" | "ended";

export interface IncomingCallData {
    from: string;
    name: string;
    signal: any;
}

export function useWebRTC() {
    const { socket } = useSocket();
    const { user } = useAuth();

    // State
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Refs
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const otherUserId = useRef<string | null>(null);

    // Initialize Peer Connection
    const createPeerConnection = useCallback(() => {
        if (peerConnection.current) return peerConnection.current;

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && otherUserId.current && socket) {
                socket.emit("iceCandidate", {
                    target: otherUserId.current,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            remoteStreamRef.current = event.streams[0];
        };

        peerConnection.current = pc;
        return pc;
    }, [socket]);

    // Get User Media
    const getUserMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
            toast.error("Could not access microphone.");
            return null;
        }
    }, []);

    // Cleanup resources
    const cleanup = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setCallStatus("idle");
        setIncomingCall(null);
        otherUserId.current = null;
        setIsMuted(false);
    }, []);

    // ─── Socket Event Handlers ────────────────────────────────────────────────

    useEffect(() => {
        if (!socket) return;

        socket.on("callUser", async ({ from, name, signal }) => {
            console.log("Incoming call from:", name);
            setIncomingCall({ from, name, signal });
            setCallStatus("receiving");
        });

        socket.on("callAccepted", async (signal) => {
            setCallStatus("connected");
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
            }
        });

        socket.on("iceCandidate", async (candidate) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        });

        socket.on("endCall", () => {
            toast.info("Call ended");
            cleanup();
        });

        return () => {
            socket.off("callUser");
            socket.off("callAccepted");
            socket.off("iceCandidate");
            socket.off("endCall");
        };
    }, [socket, cleanup]);


    // ─── Actions ──────────────────────────────────────────────────────────────

    const callUser = async (userId: string) => {
        if (!socket) return;
        otherUserId.current = userId;

        const stream = await getUserMedia();
        if (!stream) return;

        const pc = createPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        setCallStatus("calling");
        socket.emit("callUser", {
            userToCall: userId,
            signalData: offer,
            from: user?._id,
            name: user?.display_name || user?.username
        });
    };

    const answerCall = async () => {
        if (!socket || !incomingCall) return;

        setCallStatus("connected");
        otherUserId.current = incomingCall.from;

        const stream = await getUserMedia();
        if (!stream) {
            endCall();
            return;
        }

        const pc = createPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answerCall", {
            signal: answer,
            to: incomingCall.from
        });
    };

    const endCall = () => {
        if (socket && otherUserId.current) {
            socket.emit("endCall", { to: otherUserId.current });
        }
        cleanup();
    };

    const rejectCall = () => {
        if (socket && incomingCall) {
            socket.emit("endCall", { to: incomingCall.from });
        }
        cleanup();
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    return {
        callStatus,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        callUser,
        answerCall,
        endCall,
        rejectCall,
        toggleMute
    };
}
