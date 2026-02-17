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
                                <>
                                    <button
                                        onClick={onToggleMute}
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                            isMuted ? "bg-white text-black" : "bg-muted text-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>

                                    {/* Mic Selection (Input) */}
                                    {onSwitchInput && audioInputDevices.length > 0 && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-muted text-foreground hover:bg-muted/80">
                                                    <Mic2 className="w-5 h-5" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-2" align="center">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-xs text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Select Microphone</h4>
                                                    {audioInputDevices.map((device) => {
                                                        // Explicit check for undefined or empty label
                                                        const label = device.label ? device.label : `Microphone ${device.deviceId.slice(0, 5)}...`;
                                                        return (
                                                            <button
                                                                key={device.deviceId}
                                                                onClick={() => handleMicChange(device.deviceId)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors hover:bg-muted",
                                                                    selectedMicId === device.deviceId && "bg-muted font-medium"
                                                                )}
                                                            >
                                                                <span className="truncate text-left flex-1">{label}</span>
                                                                {selectedMicId === device.deviceId && (
                                                                    <Check className="w-4 h-4 ml-2 text-primary" />
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
                                                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-muted text-foreground hover:bg-muted/80">
                                                    <Volume2 className="w-5 h-5" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56 p-2" align="center">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-xs text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Select Speaker</h4>
                                                    {audioOutputDevices.map((device) => {
                                                        const label = device.label ? device.label : `Speaker ${device.deviceId.slice(0, 5)}...`;
                                                        return (
                                                            <button
                                                                key={device.deviceId}
                                                                onClick={() => handleSpeakerChange(device.deviceId)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors hover:bg-muted",
                                                                    selectedSpeakerId === device.deviceId && "bg-muted font-medium"
                                                                )}
                                                            >
                                                                <span className="truncate text-left flex-1">{label}</span>
                                                                {selectedSpeakerId === device.deviceId && (
                                                                    <Check className="w-4 h-4 ml-2 text-primary" />
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
