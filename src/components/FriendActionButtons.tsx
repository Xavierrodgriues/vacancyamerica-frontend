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
}

export function FriendActionButtons({ userId, username, variant = "default" }: FriendActionButtonsProps) {
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

    // ── Already blocked ──
    if (isBlocked) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-500 text-sm font-semibold select-none">
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
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
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
            <div className="flex items-center gap-2">
                {/* Friends pill */}
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold select-none">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Friends
                </div>

                {/* More actions dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(v => !v)}
                        className="flex items-center gap-1 px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
                    >
                        More <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden">
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
            <div className="flex items-center gap-2">
                <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E63946] hover:bg-[#d32f3f] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                    onClick={() => acceptRequest.mutateAsync(connection!.requestId!)}
                    disabled={acceptRequest.isPending}
                >
                    {acceptRequest.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    Accept Request
                </button>
                <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors disabled:opacity-60"
                    onClick={() => cancelRequest.mutateAsync(connection!.requestId!)}
                    disabled={cancelRequest.isPending}
                >
                    {cancelRequest.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                    Decline
                </button>
                <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium transition-colors disabled:opacity-60"
                    onClick={handleBlock}
                    disabled={block.isPending}
                >
                    {block.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    Block
                </button>
            </div>
        );
    }

    // ── Outgoing pending ──
    if (outgoingRequest) {
        return (
            <div className="flex items-center gap-2">
                <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors disabled:opacity-60"
                    onClick={() => cancelRequest.mutateAsync(connection!.requestId!)}
                    disabled={cancelRequest.isPending}
                >
                    {cancelRequest.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Clock className="w-3.5 h-3.5" />
                    )}
                    Request Sent
                </button>
                <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium transition-colors disabled:opacity-60"
                    onClick={handleBlock}
                    disabled={block.isPending}
                >
                    {block.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    Block
                </button>
            </div>
        );
    }

    // ── Default: Add Friend ──
    return (
        <div className="flex items-center gap-2">
            <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E63946] hover:bg-[#d32f3f] text-white text-sm font-semibold transition-colors shadow-sm shadow-red-200 disabled:opacity-60"
                onClick={() => sendRequest.mutateAsync(userId)}
                disabled={sendRequest.isPending || isLoading}
            >
                {sendRequest.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                )}
                Add Friend
            </button>
            <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium transition-colors disabled:opacity-60"
                onClick={handleBlock}
                disabled={block.isPending}
            >
                {block.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                Block
            </button>
        </div>
    );
}
