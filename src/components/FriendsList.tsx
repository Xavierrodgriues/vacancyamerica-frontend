import { useInfiniteFriends, useFriendRequests, useAcceptFriendRequest, useCancelFriendRequest } from "@/hooks/use-friends";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export function FriendsList() {
    const { data: friendsData, isLoading: friendsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFriends();
    const { data: requests, isLoading: requestsLoading } = useFriendRequests();

    const acceptRequest = useAcceptFriendRequest();
    const cancelRequest = useCancelFriendRequest();

    const { containerRef, isVisible } = useIntersectionObserver({ rootMargin: "400px" });

    useEffect(() => {
        if (isVisible && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const friends = friendsData?.pages.flatMap(page => page.friends) || [];
    
    // We filter incoming requests. Based on backend, receiver is current user.
    // The backend `getFriendRequests` returns all pending requests where you are sender or receiver.
    // In actual implementation, we'd need to know if `request.sender._id !== myAuthId` to be "incoming".
    // For now, we assume requests listed are to be accepted.
    const incomingRequests = requests; 

    return (
        <div className="w-full">
            <Tabs defaultValue="friends" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-transparent">
                    <TabsTrigger value="friends" className="data-[state=active]:bg-secondary rounded-lg font-semibold">
                        Connections
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="data-[state=active]:bg-secondary rounded-lg font-semibold flex items-center gap-2">
                        Requests {requests?.length ? <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full leading-none">{requests.length}</span> : null}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="mt-4">
                    {friendsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-bold text-foreground mb-2">Build your network</h3>
                            <p className="text-muted-foreground">Find people to connect with and grow your audience.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {friends.map(friend => (
                                <div key={friend._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                                    <Link to={`/profile/${friend.username}`} className="flex items-center gap-3 min-w-0 pr-3 flex-1">
                                        <UserAvatar avatarUrl={friend.avatar_url} displayName={friend.display_name} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-[15px] truncate text-foreground leading-tight">{friend.display_name}</span>
                                            <span className="text-[13px] text-muted-foreground truncate leading-tight mt-0.5">@{friend.username}</span>
                                        </div>
                                    </Link>
                                    <Button variant="outline" size="sm" className="rounded-full shadow-sm" asChild>
                                        <Link to={`/profile/${friend.username}`}>
                                            Profile
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                            
                            {/* Infinite scroll trigger */}
                            <div ref={containerRef} className="h-10 mt-2 flex justify-center items-center">
                                {isFetchingNextPage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                    {requestsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : incomingRequests?.length === 0 ? (
                        <div className="text-center py-12 px-4 shadow-sm rounded-xl border border-post-border bg-white mt-4">
                             <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserCheck className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">No pending requests</h3>
                            <p className="text-sm text-muted-foreground">When people want to connect with you, their requests will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {incomingRequests?.map(request => (
                                <div key={request._id} className="flex items-start gap-3 bg-white border border-post-border p-4 rounded-2xl shadow-sm">
                                    <Link to={`/profile/${request.sender.username}`} className="flex-shrink-0 mt-0.5">
                                        <UserAvatar avatarUrl={request.sender.avatar_url} displayName={request.sender.display_name} size="md" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/profile/${request.sender.username}`} className="font-bold text-[15px] text-foreground hover:underline truncate block max-w-[200px]">
                                            {request.sender.display_name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground mt-0.5 mb-3 leading-snug">Wants to connect with you</p>
                                        <div className="flex gap-2 w-full">
                                            <Button 
                                                className="flex-1 h-8 rounded-full text-xs font-bold" 
                                                onClick={() => acceptRequest.mutateAsync(request._id)} 
                                                disabled={acceptRequest.isPending}
                                            >
                                                {acceptRequest.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 h-8 rounded-full text-xs font-bold" 
                                                onClick={() => cancelRequest.mutateAsync(request._id)} 
                                                disabled={cancelRequest.isPending}
                                            >
                                                {cancelRequest.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
                                            </Button>
                                        </div>
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
