'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { discussionsAPI } from '@/lib/discussionsAPI';
import Button from '@/components/Button';
import CommentsSection from '../../proposals/[proposal_id]/components/CommentsSection';

export default function DiscussionThreadPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const threadId = params.thread_id as string;
  const { user, isAuthenticated } = useAuthStore();
  
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoExpanded, setInfoExpanded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (threadId) {
      loadThread();
    }
  }, [isAuthenticated, router, bandId, threadId]);

  const loadThread = async () => {
    try {
      const response = await discussionsAPI.getDiscussion(bandId, threadId);
      const discussion = response.data.data.discussion;
      setThread(discussion);
      
      // Transform comments to match CommentsSection format
      const transformedComments = discussion.comments.map((c: any) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        author: {
          displayName: c.creator?.user?.displayName || 'Unknown',
        },
        replies: c.replies.map((r: any) => ({
          id: r.id,
          body: r.body,
          createdAt: r.createdAt,
          author: {
            displayName: r.creator?.user?.displayName || 'Unknown',
          },
        })),
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Failed to load discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (body: string) => {
    try {
      await discussionsAPI.addComment(bandId, threadId, { body });
      loadThread(); // Reload to get updated comments
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleReply = async (commentId: string, body: string) => {
    try {
      await discussionsAPI.addComment(bandId, threadId, { body, parentCommentId: commentId });
      loadThread(); // Reload to get updated comments
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert('Failed to add reply');
    }
  };

  const handleEditComment = async (commentId: string, newBody: string) => {
    try {
      await discussionsAPI.updateComment(bandId, threadId, commentId, { body: newBody });
      loadThread(); // Reload to get updated comments
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('Failed to edit comment');
    }
  };

  const handleEditReply = async (commentId: string, replyId: string, newBody: string) => {
    try {
      await discussionsAPI.updateComment(bandId, threadId, replyId, { body: newBody });
      loadThread(); // Reload to get updated comments
    } catch (error) {
      console.error('Failed to edit reply:', error);
      alert('Failed to edit reply');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await discussionsAPI.deleteComment(bandId, threadId, commentId);
      loadThread(); // Reload to get updated comments
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm('Delete this reply?')) return;
    
    try {
      await discussionsAPI.deleteComment(bandId, threadId, replyId);
      loadThread(); // Reload to get updated comments
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply');
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Delete this discussion thread? This cannot be undone.')) return;

    try {
      await discussionsAPI.deleteDiscussion(bandId, threadId);
      router.push(`/bands/${bandId}/discussions`);
    } catch (error) {
      console.error('Failed to delete discussion:', error);
      alert('Failed to delete discussion');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const filteredComments = comments.filter(comment => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const bodyMatch = comment.body.toLowerCase().includes(searchLower);
    const authorMatch = comment.author.displayName.toLowerCase().includes(searchLower);
    const replyMatch = comment.replies?.some((r: any) => 
      r.body.toLowerCase().includes(searchLower) || 
      r.author.displayName.toLowerCase().includes(searchLower)
    );
    return bodyMatch || authorMatch || replyMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Loading...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Discussion not found</div>
      </div>
    );
  }

  const currentUserName = user?.displayName || `${user?.firstName} ${user?.lastName}`;
  const authorName = thread.creator?.user?.displayName || 'Unknown';
  const isAuthor = authorName === currentUserName;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link 
            href={`/bands/${bandId}/discussions`} 
            className="text-sm text-rust hover:text-rust-dark mb-3 inline-block"
          >
            ← Back to Discussions
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-earth-900 mb-2">{thread.title}</h1>
              <p className="text-earth-700">
                by {authorName} • {formatTimestamp(thread.createdAt)}
              </p>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteThread}
                >
                  🗑️ Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content - 60/40 split */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Thread Content - 60% */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-earth-700 whitespace-pre-wrap text-base leading-relaxed">{thread.body}</p>
            </div>
          </div>

          {/* Discussion Sidebar - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collapsible Info Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setInfoExpanded(!infoExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-100 transition"
              >
                <span className="font-semibold text-earth-900">Thread Info</span>
                <span className="text-earth-600">{infoExpanded ? '−' : '+'}</span>
              </button>
              
              {infoExpanded && (
                <div className="px-6 pb-4 text-sm text-earth-700 space-y-2 border-t border-earth-200 pt-4">
                  <p><strong>Created by:</strong> {authorName}</p>
                  <p><strong>Created:</strong> {formatTimestamp(thread.createdAt)}</p>
                  <p><strong>Replies:</strong> {comments.length}</p>
                </div>
              )}
            </div>

            {/* Discussion Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-earth-200">
                <input
                  type="text"
                  placeholder="🔍 Search replies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="p-6">
                <CommentsSection
                  comments={filteredComments}
                  currentUserName={currentUserName}
                  onAddComment={handleAddComment}
                  onReply={handleReply}
                  onEditComment={handleEditComment}
                  onEditReply={handleEditReply}
                  onDeleteComment={handleDeleteComment}
                  onDeleteReply={handleDeleteReply}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}