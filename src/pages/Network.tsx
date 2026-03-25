import { AppLayout } from "@/components/AppLayout";
import { FriendsList } from "@/components/FriendsList";
import { useFriendRealtimeUpdates } from "@/hooks/use-friends";

export default function Network() {
    // Enable real-time websocket updates for connections on this page
    useFriendRealtimeUpdates();

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-background min-h-screen pb-20">
                <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-post-border p-4">
                    <h1 className="text-xl font-bold leading-tight">My Network</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your connections and followers</p>
                </header>

                <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                    <FriendsList />
                </main>
            </div>
        </AppLayout>
    );
}
