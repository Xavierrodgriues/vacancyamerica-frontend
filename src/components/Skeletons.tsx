import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
    return (
        <div className="border-b border-post-border p-4 w-full">
            <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-[300px] w-full rounded-2xl mt-3" />
                    <div className="flex items-center gap-6 mt-3">
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeedSkeleton() {
    return (
        <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
            ))}
        </div>
    );
}

export function CommentSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex-1 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className={`h-10 w-2/3 rounded-2xl ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`} />
                    </div>
                ))}
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
        </div>
    );
}
