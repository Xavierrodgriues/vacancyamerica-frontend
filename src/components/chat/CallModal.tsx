import { Phone, PhoneOff, Mic, MicOff, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type CallStatus, type IncomingCallData } from "@/hooks/use-web-rtc";

interface CallModalProps {
    status: CallStatus;
    incomingCall: IncomingCallData | null;
    otherUserName?: string;
    otherUserAvatar?: string | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    onAnswer: () => void;
    onReject: () => void;
    onEnd: () => void;
    onToggleMute: () => void;
}

export function CallModal({
    status,
    incomingCall,
    otherUserName,
    otherUserAvatar,
    remoteStream,
    isMuted,
    onAnswer,
    onReject,
    onEnd,
    onToggleMute
}: CallModalProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [duration, setDuration] = useState(0);

    // Handle remote audio stream
    useEffect(() => {
        if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        }
    }, [remoteStream]);

    // Call duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === "connected") {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (status === "idle") return null;

    const displayName = status === "receiving" ? incomingCall?.name : otherUserName;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-background w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Audio Element (Hidden) */}
                <audio ref={audioRef} autoPlay playsInline className="hidden" />

                {/* Avatar / User Info */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                        {otherUserAvatar ? (
                            <img src={otherUserAvatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-muted-foreground" />
                        )}
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-foreground">{displayName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {status === "calling" && "Calling..."}
                            {status === "receiving" && "Incoming call..."}
                            {status === "connected" && formatTime(duration)}
                            {status === "ended" && "Call ended"}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 w-full justify-center">
                    {status === "receiving" ? (
                        <>
                            <button
                                onClick={onReject}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-transform hover:scale-105"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                            <button
                                onClick={onAnswer}
                                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-transform hover:scale-105 animate-pulse"
                            >
                                <Phone className="w-6 h-6" />
                            </button>
                        </>
                    ) : (
                        <>
                            {status === "connected" && (
                                <button
                                    onClick={onToggleMute}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-white text-black" : "bg-muted text-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            )}

                            <button
                                onClick={onEnd}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-transform hover:scale-105"
                            >
                                <PhoneOff className="w-7 h-7" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
