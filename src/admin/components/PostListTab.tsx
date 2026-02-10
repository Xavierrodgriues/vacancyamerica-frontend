import { FileText, Shield, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovePost, useRejectPost, AdminPost } from '../hooks/use-admin-posts';
import { AdminPostCard } from './AdminPostCard';
import { LoadingState, EmptyState } from './SharedUI';

interface PostListTabProps {
    posts: AdminPost[];
    isLoading: boolean;
    type: 'pending' | 'trusted' | 'rejected';
}

export function PostListTab({ posts, isLoading, type }: PostListTabProps) {
    const approvePost = useApprovePost();
    const rejectPost = useRejectPost();

    const config = {
        pending: {
            title: 'No Level 0 Requests',
            description: 'There are no pending posts from Level 0 admins.',
            icon: <FileText className="w-12 h-12" />
        },
        trusted: {
            title: 'No Trusted Requests',
            description: 'There are no pending posts from Trusted admins.',
            icon: <Shield className="w-12 h-12" />
        },
        rejected: {
            title: 'No Rejected Posts',
            description: 'There are no rejected posts.',
            icon: <XIcon className="w-12 h-12" />
        }
    };

    return (
        <div className="p-6 animate-fadeIn">
            {isLoading ? <LoadingState /> : (
                posts.length === 0 ? (
                    <EmptyState
                        icon={config[type].icon}
                        title={config[type].title}
                        description={config[type].description}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.map((post) => (
                            <AdminPostCard
                                key={post._id}
                                post={post}
                                onApprove={type !== 'rejected' ? () => {
                                    approvePost.mutate(post._id);
                                    toast.success('Post approved');
                                } : undefined}
                                onReject={type !== 'rejected' ? (reason) => {
                                    rejectPost.mutate({ postId: post._id, reason });
                                    toast.success('Post rejected');
                                } : undefined}
                                isTrusted={type === 'trusted'}
                                isRejected={type === 'rejected'}
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
