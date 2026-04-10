import { UserPlus, UserCheck, UserX, Ban, Loader2, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import {
    useSendFriendRequest,
    useAcceptFriendRequest,
    useCancelFriendRequest,
    useUnfriendUser,
    useBlockUser,
    useConnectionStatus,
} from "@/hooks/use-friends";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/lib/auth-context";
import { useState, useRef, useEffect } from "react";

interface FriendActionButtonsProps {
    userId: string;
    username: string;
    variant?: "default" | "compact";
    fullWidth?: boolean;
}

export function FriendActionButtons({ userId, username, variant = "default", fullWidth = false }: FriendActionButtonsProps) {
    const { user } = useAuth();
    const { data: myProfile } = useProfile();
    const { data: connection, isLoading } = useConnectionStatus(userId);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sendRequest = useSendFriendRequest();
    const acceptRequest = useAcceptFriendRequest();
    const cancelRequest = useCancelFriendRequest();
    const unfriend = useUnfriendUser();
    const block = useBlockUser();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!user || user._id === userId) return null;

    const isBlocked = myProfile?.blocked_users?.includes(userId);
    const isFriend = connection?.status === "accepted";
    const incomingRequest = connection?.status === "pending" && connection.senderId === userId;
    const outgoingRequest = connection?.status === "pending" && connection.senderId === user?._id;

    const handleBlock = async () => {
        setDropdownOpen(false);
        if (confirm(`Are you sure you want to block @${username}?`)) {
            await block.mutateAsync(userId);
        }
    };

    const containerStyle = `flex flex-wrap items-center gap-2 ${fullWidth ? "w-full" : ""}`;
    const primaryBtnStyle = `flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#E63946] hover:bg-[#d32f3f] text-white text-xs sm:text-[14px] font-bold shadow-sm transition-all disabled:opacity-60 ${fullWidth ? "flex-1 h-10" : "rounded-full"}`;
    const secondaryBtnStyle = `flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-[14px] font-bold shadow-sm transition-all disabled:opacity-60 ${fullWidth ? "flex-1 h-10" : "rounded-full"}`;
    const dangerBtnStyle = `flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-xs sm:text-sm font-semibold transition-all disabled:opacity-60 ${fullWidth ? "h-10 px-4" : "rounded-full"}`;

    // ── Already blocked ──
    if (isBlocked) {
        return (
            <div className={containerStyle}>
                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-semibold select-none ${fullWidth ? "w-full justify-center h-10" : "rounded-full"}`}>
                    <Ban className="w-3.5 h-3.5" />
                    Blocked
                </div>
            </div>
        );
    }

    // ── Friends ──
    if (isFriend) {
        if (variant === "compact") {
            return (
                <button
                    className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                    onClick={async () => {
                        if (confirm("Unfriend this user?")) await unfriend.mutateAsync(userId);
                    }}
                    disabled={unfriend.isPending}
                >
                    {unfriend.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    Following
                </button>
            );
        }

        return (
            <div className={containerStyle}>
                {/* Friends pill (as a full width button if needed) */}
                <div className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold shadow-sm select-none ${fullWidth ? "flex-1 h-10" : "rounded-full"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    Friends
                </div>

                {/* More actions dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(v => !v)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-sm transition-all ${fullWidth ? "h-10" : "rounded-full"}`}
                    >
                        {fullWidth ? <ChevronDown className="w-4 h-4" /> : <>More <ChevronDown className="w-3.5 h-3.5" /></>}
                    </button>
                    {dropdownOpen && (
                        <div className={`absolute ${fullWidth ? "right-0" : "right-0"} top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden`}>
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                onClick={async () => {
                                    setDropdownOpen(false);
                                    if (confirm("Unfriend this user?")) await unfriend.mutateAsync(userId);
                                }}
                                disabled={unfriend.isPending}
                            >
                                {unfriend.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4 text-slate-500" />}
                                Unfriend
                            </button>
                            <div className="h-px bg-slate-100 mx-3 my-1" />
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                onClick={handleBlock}
                                disabled={block.isPending}
                            >
                                {block.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                Block User
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Incoming request ──
    if (incomingRequest) {
        return (
            <div className={containerStyle}>
                <button
                    className={primaryBtnStyle}
                    onClick={() => acceptRequest.mutateAsync(connection!.requestId!)}
                    disabled={acceptRequest.isPending}
                >
                    {acceptRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Accept
                </button>
                <button
                    className={secondaryBtnStyle}
                    onClick={() => cancelRequest.mutateAsync(connection!.requestId!)}
                    disabled={cancelRequest.isPending}
                >
                    {cancelRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4 hidden sm:block" />}
                    Decline
                </button>
                
                {/* More dropdown for incoming request, specifically for Block */}
                {fullWidth ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(v => !v)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-200 rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden">
                                <button
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    onClick={handleBlock}
                                    disabled={block.isPending}
                                >
                                    {block.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                    Block
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className={dangerBtnStyle}
                        onClick={handleBlock}
                        disabled={block.isPending}
                    >
                        {block.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                        Block
                    </button>
                )}
            </div>
        );
    }

    // ── Outgoing pending ──
    if (outgoingRequest) {
        return (
            <div className={containerStyle}>
                <button
                    className={secondaryBtnStyle}
                    onClick={() => cancelRequest.mutateAsync(connection!.requestId!)}
                    disabled={cancelRequest.isPending}
                >
                    {cancelRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 hidden sm:block" />}
                    Requested
                </button>
                
                {fullWidth ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(v => !v)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-200 rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden">
                                <button
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    onClick={handleBlock}
                                    disabled={block.isPending}
                                >
                                    {block.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                    Block User
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className={dangerBtnStyle}
                        onClick={handleBlock}
                        disabled={block.isPending}
                    >
                        {block.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                        Block
                    </button>
                )}
            </div>
        );
    }

    // ── Default: Add Friend ──
    return (
        <div className={containerStyle}>
            <button
                className={primaryBtnStyle}
                onClick={() => sendRequest.mutateAsync(userId)}
                disabled={sendRequest.isPending || isLoading}
            >
                {sendRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Add Friend
            </button>
            {fullWidth ? (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(v => !v)}
                        className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-200 rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden">
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                onClick={handleBlock}
                                disabled={block.isPending}
                            >
                                {block.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                Block
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    className={dangerBtnStyle}
                    onClick={handleBlock}
                    disabled={block.isPending}
                >
                    {block.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    Block
                </button>
            )}
        </div>
    );
}
