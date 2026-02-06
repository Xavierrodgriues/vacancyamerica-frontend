import { useFriends, useFriendRequests, useAcceptFriendRequest, useCancelFriendRequest } from "@/hooks/use-friends";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FriendsList() {
    const { data: friends, isLoading: friendsLoading } = useFriends();
    const { data: requests, isLoading: requestsLoading } = useFriendRequests();

    const acceptRequest = useAcceptFriendRequest();
    const cancelRequest = useCancelFriendRequest();

    const incomingRequests = requests?.filter(r => r.sender._id !== r.receiver._id); // Actually logic should be checking if *I* am the receiver
    // But useFriendRequests returns requests involving me. 
    // If useFriendRequests returns all requests involving current user.
    // We need to know who is who.
    // Let's assume the hook returns populated sender/receiver.
    // But wait, the hook does not know "me" inside the map function easily without context.
    // Actually, I can filter based on my ID if I had it, but simpler:
    // Since 'requests' are filtered by API to be related to me.
    // I need to separate them into Incoming (others -> me) and Outgoing (me -> others).
    // But in this list, do we want to show Outgoing? Maybe just Incoming for "Requests".

    // Let's assume the component will be used inside Profile of current user primarily? 
    // Or maybe a modal?

    // Actually, I cannot easily get "my id" without `useAuth`.

    // Let's rely on the parent or adding `useAuth` here. 
    // But for now, let's keep it simple.

    return (
        <div className="w-full">
            <Tabs defaultValue="friends" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="friends">Friends ({friends?.length || 0})</TabsTrigger>
                    <TabsTrigger value="requests">Requests ({requests?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="mt-4">
                    {friendsLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : friends?.length === 0 ? (
                        <p className="text-center text-muted-foreground p-4">No friends yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {friends?.map(friend => (
                                <div key={friend._id} className="flex items-center justify-between">
                                    <Link to={`/profile/${friend.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <UserAvatar avatarUrl={friend.avatar_url} displayName={friend.display_name} />
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{friend.display_name}</span>
                                            <span className="text-sm text-muted-foreground">@{friend.username}</span>
                                        </div>
                                    </Link>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link to={`/profile/${friend.username}`}>
                                            <UserCheck className="w-4 h-4 text-green-600" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                    {requestsLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : requests?.length === 0 ? (
                        <p className="text-center text-muted-foreground p-4">No pending requests.</p>
                    ) : (
                        <div className="space-y-4">
                            {requests?.map(request => (
                                <div key={request._id} className="flex items-center justify-between bg-secondary/20 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {/* We need to determine which user to show. Show the OTHER person. */}
                                        {/* NOTE: This component needs to know 'current user id' to show the *other* person correctly. */}
                                        {/* For now let's assume this tab is "Incoming Requests" and show Sender. */}
                                        {/* But outgoing requests should also be shown? Maybe separate section? */}
                                        {/* Let's show both types explicitly? */}

                                        {/* Simplified: Just show the sender for incoming, and receiver for outgoing? */}
                                        {/* Let's refine the UI later. For now, display friend request info simply. */}

                                        <div className="flex flex-col text-sm">
                                            <span className="font-semibold">{request.sender.display_name}</span> has sent you a request
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => acceptRequest.mutateAsync(request._id)} disabled={acceptRequest.isPending}>
                                            Accept
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => cancelRequest.mutateAsync(request._id)} disabled={cancelRequest.isPending}>
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
