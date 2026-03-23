import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Ban, Loader2 } from "lucide-react";
import {
    useSendFriendRequest,
    useAcceptFriendRequest,
    useCancelFriendRequest,
    useUnfriendUser,
    useBlockUser,
    useFriendRequests,
    FriendRequest
} from "@/hooks/use-friends";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface FriendActionButtonsProps {
    userId: string;
    username: string; // Needed for optimistically updating or checks?
    variant?: "default" | "compact";
}

export function FriendActionButtons({ userId, username, variant = "default" }: FriendActionButtonsProps) {
    const { user } = useAuth();
    const { data: myProfile } = useProfile();
    const { data: requests, isLoading: requestsLoading } = useFriendRequests();

    const sendRequest = useSendFriendRequest();
    const acceptRequest = useAcceptFriendRequest();
    const cancelRequest = useCancelFriendRequest();
    const unfriend = useUnfriendUser();
    const block = useBlockUser();

    if (!user || user._id === userId) return null;

    const isBlocked = myProfile?.blocked_users?.includes(userId);
    const isFriend = myProfile?.friends?.includes(userId);

    // Check for pending request
    const incomingRequest = requests?.find(r => r.sender._id === userId && r.status === 'pending');
    const outgoingRequest = requests?.find(r => r.receiver._id === userId && r.status === 'pending');

    const handleBlock = async () => {
        if (confirm(`Are you sure you want to block this user?`)) {
            await block.mutateAsync(userId);
        }
    };

    if (isBlocked) {
        return (
            <Button variant="destructive" size="sm" disabled>
                <Ban className="w-4 h-4 mr-2" />
                Blocked
            </Button>
        );
    }

    if (isFriend) {
        return (
            <div className="flex gap-2 items-center">
                {variant === 'compact' ? (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="font-semibold text-[13px] rounded-lg bg-slate-100 hover:bg-slate-200 text-foreground px-4 h-8"
                        onClick={async () => {
                            if (confirm("Unfriend this user?")) await unfriend.mutateAsync(userId);
                        }}
                        disabled={unfriend.isPending}
                    >
                        Following
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700">
                            <UserCheck className="w-4 h-4 mr-2" />
                            Friends
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={async () => {
                                if (confirm("Unfriend this user?")) await unfriend.mutateAsync(userId);
                            }}
                            disabled={unfriend.isPending}
                        >
                            <UserX className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-secondary"
                            onClick={handleBlock}
                            disabled={block.isPending}
                            title="Block User"
                        >
                            <Ban className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>
        );
    }

    if (incomingRequest) {
        return (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={() => acceptRequest.mutateAsync(incomingRequest._id)}
                    disabled={acceptRequest.isPending}
                >
                    {acceptRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept Request"}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelRequest.mutateAsync(incomingRequest._id)}
                    disabled={cancelRequest.isPending}
                >
                    Reject
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-secondary"
                    onClick={handleBlock}
                    disabled={block.isPending}
                    title="Block User"
                >
                    <Ban className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    if (outgoingRequest) {
        return (
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => cancelRequest.mutateAsync(outgoingRequest._id)}
                    disabled={cancelRequest.isPending}
                >
                    {cancelRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Sent"}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-secondary"
                    onClick={handleBlock}
                    disabled={block.isPending}
                    title="Block User"
                >
                    <Ban className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                onClick={() => sendRequest.mutateAsync(userId)}
                disabled={sendRequest.isPending}
            >
                {sendRequest.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                    </>
                )}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:bg-secondary"
                onClick={handleBlock}
                disabled={block.isPending}
                title="Block User"
            >
                <Ban className="w-4 h-4" />
            </Button>
        </div>
    );
}
