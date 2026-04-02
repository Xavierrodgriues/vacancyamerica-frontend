import { X, Activity, Sparkles, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useActivity, useMarkActivityRead, useDeleteActivity } from "@/hooks/use-activity";
import { useSuggestedUsers } from "@/hooks/use-suggested-users";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { BASE_URL } from "@/lib/constants";
import { useEffect } from "react";

interface MobileActivityPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileActivityPanel({ isOpen, onClose }: MobileActivityPanelProps) {
    const { user } = useAuth();
    const { data: activityList } = useActivity();
    const { data: suggestedProfiles = [] } = useSuggestedUsers();
    const markRead = useMarkActivityRead();
    const deleteActivity = useDeleteActivity();

    // Mark all as read when panel opens
    useEffect(() => {
        if (isOpen) {
            markRead.mutate();
        }
    }, [isOpen]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "LIKE": return <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />;
            case "COMMENT": return <MessageCircle className="h-3.5 w-3.5 text-sky-500" />;
            case "FOLLOW": return <UserPlus className="h-3.5 w-3.5 text-emerald-500" />;
            default: return <Activity className="h-3.5 w-3.5 text-primary" />;
        }
    };

    const renderActivityText = (act: any) => {
        const isActor = (act.actor._id || act.actor) === user?._id;
        const isRecipient = (act.recipient?._id || act.recipient) === user?._id;
        const actorName = isActor ? "You" : act.actor.display_name;
        const ActorLink = isActor
            ? <span className="font-bold text-slate-800">You</span>
            : <Link to={`/profile/${act.actor.username}`} className="font-bold text-slate-800 hover:text-primary" onClick={onClose}>{actorName}</Link>;
        const TargetLink = isRecipient
            ? "your"
            : <Link to={`/profile/${act.recipient?.username}`} className="font-semibold hover:text-primary" onClick={onClose}>{act.recipient?.display_name || ""}'s</Link>;

        switch (act.type) {
            case "LIKE": return <>{ActorLink} liked {TargetLink} post</>;
            case "COMMENT": return <>{ActorLink} commented on {TargetLink} post</>;
            case "FOLLOW": return <>{ActorLink} started following {isRecipient ? "you" : <Link to={`/profile/${act.recipient?.username}`} className="font-semibold hover:text-primary" onClick={onClose}>{act.recipient?.display_name || ""}</Link>}</>;
            default: return <>{ActorLink} interacted with {TargetLink}</>;
        }
    };

    const getOtherUser = (act: any) => {
        const isActor = (act.actor._id || act.actor) === user?._id;
        return isActor ? user : act.actor;
    };

    const activities = activityList || [];
    const unreadCount = activities.filter((a) => !a.isRead).length;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Slide-up Panel */}
            <div
                className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"}`}
                style={{ maxHeight: "85vh" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4.5 w-4.5 text-primary" />
                        <h2 className="text-[16px] font-bold text-slate-800">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 80px)", scrollbarWidth: "thin" }}>

                    {/* ── Activity ── */}
                    <div className="px-5 pt-4 pb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                            <Activity className="h-3 w-3 text-primary" /> Activity
                        </h3>

                        {activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((act) => {
                                    const otherUser = getOtherUser(act);
                                    return (
                                        <div
                                            key={act._id}
                                            className={`relative flex items-start gap-3 p-2.5 rounded-xl transition-colors group ${!act.isRead ? "bg-primary/5 border border-primary/10" : "hover:bg-slate-50"}`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <Link
                                                    to={`/profile/${otherUser?.username}`}
                                                    className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 block shadow-sm"
                                                    onClick={onClose}
                                                >
                                                    <UserAvatar avatarUrl={otherUser?.avatar_url} displayName={otherUser?.display_name || ""} />
                                                </Link>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                    {getActivityIcon(act.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <p className="text-[13px] text-slate-700 leading-snug">
                                                    {renderActivityText(act)}
                                                </p>
                                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true }).replace("about ", "")}
                                                </span>
                                            </div>
                                            {act.post?.image_url && act.type !== "FOLLOW" && (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 mr-2">
                                                    <img
                                                        src={act.post.image_url.startsWith("http") ? act.post.image_url : `${BASE_URL}/uploads/${act.post.image_url}`}
                                                        alt="Post"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteActivity.mutate(act._id);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full border border-slate-100 shadow-sm text-slate-400 hover:text-rose-500 z-10 hover:bg-slate-50 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
                                    <Bell className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="text-[13px] text-slate-400 font-medium">No activity yet</p>
                                <p className="text-[12px] text-slate-300 mt-0.5">When someone likes or follows you, it'll show here</p>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="mx-5 my-3 h-px bg-slate-100" />

                    {/* ── Suggested For You ── */}
                    {suggestedProfiles.length > 0 && (
                        <div className="px-5 pb-6">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                <Sparkles className="h-3 w-3 text-amber-500" /> Suggested For You
                            </h3>
                            <div className="space-y-2">
                                {suggestedProfiles.map((p: any) => (
                                    <div key={p.username} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                        <Link
                                            to={`/profile/${p.username}`}
                                            className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-slate-100 shadow-sm"
                                            onClick={onClose}
                                        >
                                            <UserAvatar avatarUrl={p.avatar_url} displayName={p.display_name} size="md" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/profile/${p.username}`} onClick={onClose}>
                                                <p className="text-[13px] font-bold text-slate-800 truncate leading-tight hover:text-primary transition-colors">{p.display_name}</p>
                                            </Link>
                                            <p className="text-[11px] text-slate-400 truncate">@{p.username}</p>
                                        </div>
                                        <Link to={`/profile/${p.username}`} onClick={onClose}>
                                            <button className="text-[12px] font-bold text-primary border border-primary/30 hover:bg-primary hover:text-white rounded-full px-3 py-1 transition-all">
                                                Follow
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
