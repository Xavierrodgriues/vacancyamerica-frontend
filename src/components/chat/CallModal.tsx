import { Phone, PhoneOff, Mic, MicOff, User, Volume2, Check, Mic2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type CallStatus, type IncomingCallData } from "@/hooks/use-web-rtc";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CallModalProps {
    status: CallStatus;
    incomingCall: IncomingCallData | null;
    otherUserName?: string;
    otherUserAvatar?: string | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    onAnswer: () => void;
    onReject: () => void;
    onEnd: () => void;
    onToggleMute: () => void;
    onSwitchInput?: (deviceId: string) => Promise<void>;
}

export function CallModal({
    status,
    incomingCall,
    otherUserName,
    otherUserAvatar,
    localStream,
    remoteStream,
    isMuted,
    onAnswer,
    onReject,
    onEnd,
    onToggleMute,
    onSwitchInput
}: CallModalProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [duration, setDuration] = useState(0);
    const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);

    // Track selected devices
    const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
    const [selectedMicId, setSelectedMicId] = useState<string>("");

    const [isSpeakerSupported, setIsSpeakerSupported] = useState(false);

    // Initial audio setup and device enumeration
    useEffect(() => {
        // Check for setSinkId support
        // @ts-ignore - setSinkId is not yet in all TS definitions: it is non-standard but widely supported in Chromiums
        const isSupported = typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype;
        setIsSpeakerSupported(isSupported);

        const getDevices = async () => {
            try {
                // We need to request permissions first OR wait for localStream to be active
                // enumeration labels are empty until permission is granted.
                const devices = await navigator.mediaDevices.enumerateDevices();

                const audioOutputs = devices.filter(device => device.kind === "audiooutput");
                const audioInputs = devices.filter(device => device.kind === "audioinput");

                setAudioOutputDevices(audioOutputs);
                setAudioInputDevices(audioInputs);

                // Determine current output device (default)
                const currentSpeaker = audioOutputs.find(d => d.deviceId === "default")?.deviceId ||
                    (audioOutputs.length > 0 ? audioOutputs[0].deviceId : "");

                if (!selectedSpeakerId) setSelectedSpeakerId(currentSpeaker);

                // Determine current input device
                // If we have a local stream, try to match the track settings
                if (localStream) {
                    const track = localStream.getAudioTracks()[0];
                    if (track) {
                        const settings = track.getSettings();
                        if (settings.deviceId) {
                            setSelectedMicId(settings.deviceId);
                        } else {
                            // Fallback to default if no specific ID on track
                            const currentMic = audioInputs.find(d => d.deviceId === "default")?.deviceId ||
                                (audioInputs.length > 0 ? audioInputs[0].deviceId : "");
                            if (!selectedMicId) setSelectedMicId(currentMic);
                        }
                    }
                }
            } catch (err) {
                console.error("Error enumerating devices:", err);
            }
        };

        // Run enumeration when components mounts AND when localStream changes (implies permissions granted)
        getDevices();

        // Listen for device changes
        navigator.mediaDevices.addEventListener("devicechange", getDevices);
        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", getDevices);
        };
    }, [localStream]); // Re-run when localStream becomes available (permissions granted)

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

    const handleSpeakerChange = async (deviceId: string) => {
        if (audioRef.current) {
            try {
                // @ts-ignore - setSinkId
                await audioRef.current.setSinkId(deviceId);
                setSelectedSpeakerId(deviceId);
            } catch (err) {
                console.error("Error setting audio output:", err);
            }
        }
    };

    const handleMicChange = async (deviceId: string) => {
        if (onSwitchInput) {
            await onSwitchInput(deviceId);
            setSelectedMicId(deviceId);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (status === "idle") return null;

    const displayName = status === "receiving" ? incomingCall?.name : otherUserName;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-300">
                {/* Audio Element (Hidden) */}
                <audio ref={audioRef} autoPlay playsInline className="hidden" />

                {/* Avatar / User Info */}
                <div className="flex flex-col items-center gap-6 mt-2">
                    <div className="relative">
                        {status === "calling" || status === "receiving" ? (
                            <>
                                <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-[-15px] rounded-full border-2 border-blue-500/20 animate-ping opacity-50" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                                <div className="absolute inset-[-30px] rounded-full border-2 border-blue-500/10 animate-ping opacity-25" style={{ animationDuration: '2s', animationDelay: '1s' }} />
                            </>
                        ) : null}
                        <div className="relative w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
                            {otherUserAvatar ? (
                                <img src={otherUserAvatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-zinc-400" />
                            )}
                        </div>
                    </div>
                    <div className="text-center space-y-1.5">
                        <h3 className="text-2xl font-bold text-white tracking-wide">{displayName}</h3>
                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            {status === "calling" && "Calling..."}
                            {status === "receiving" && "Incoming call..."}
                            {status === "connected" && (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-green-400">{formatTime(duration)}</span>
                                </>
                            )}
                            {status === "ended" && "Call ended"}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-5 w-full justify-center mb-2">
                    {status === "receiving" ? (
                        <>
                            <button
                                onClick={onReject}
                                className="w-16 h-16 rounded-full bg-red-500/20 hover:bg-red-500 flex items-center justify-center text-red-500 hover:text-white transition-all hover:scale-105 backdrop-blur-md border border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                            >
                                <PhoneOff className="w-7 h-7" />
                            </button>
                            <button
                                onClick={onAnswer}
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all hover:scale-105 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                            >
                                <Phone className="w-7 h-7" />
                            </button>
                        </>
                    ) : (
                        <>
                            {status === "connected" && (
                                <>
                                    <button
                                        onClick={onToggleMute}
                                        className={cn(
                                            "w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105",
                                            isMuted ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5"
                                        )}
                                    >
                                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    </button>

                                    {/* Mic Selection (Input) */}
                                    {onSwitchInput && audioInputDevices.length > 0 && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5">
                                                    <Mic2 className="w-6 h-6" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-2 bg-zinc-900 border-zinc-800 text-zinc-100" align="center">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-xs text-zinc-500 px-2 py-1.5 uppercase tracking-wider">Select Microphone</h4>
                                                    {audioInputDevices.map((device) => {
                                                        const label = device.label ? device.label : `Microphone ${device.deviceId.slice(0, 5)}...`;
                                                        return (
                                                            <button
                                                                key={device.deviceId}
                                                                onClick={() => handleMicChange(device.deviceId)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors hover:bg-zinc-800",
                                                                    selectedMicId === device.deviceId && "bg-zinc-800 font-medium text-white"
                                                                )}
                                                            >
                                                                <span className="truncate text-left flex-1">{label}</span>
                                                                {selectedMicId === device.deviceId && (
                                                                    <Check className="w-4 h-4 ml-2 text-blue-400" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    {/* Speaker Selection (Output) */}
                                    {isSpeakerSupported && audioOutputDevices.length > 0 && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5">
                                                    <Volume2 className="w-6 h-6" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56 p-2 bg-zinc-900 border-zinc-800 text-zinc-100" align="center">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-xs text-zinc-500 px-2 py-1.5 uppercase tracking-wider">Select Speaker</h4>
                                                    {audioOutputDevices.map((device) => {
                                                        const label = device.label ? device.label : `Speaker ${device.deviceId.slice(0, 5)}...`;
                                                        return (
                                                            <button
                                                                key={device.deviceId}
                                                                onClick={() => handleSpeakerChange(device.deviceId)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors hover:bg-zinc-800",
                                                                    selectedSpeakerId === device.deviceId && "bg-zinc-800 font-medium text-white"
                                                                )}
                                                            >
                                                                <span className="truncate text-left flex-1">{label}</span>
                                                                {selectedSpeakerId === device.deviceId && (
                                                                    <Check className="w-4 h-4 ml-2 text-blue-400" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </>
                            )}

                            <button
                                onClick={onEnd}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.3)] ml-2"
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
