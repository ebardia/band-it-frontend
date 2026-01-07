'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { discussionsAPI } from '@/lib/discussionsAPI';
import Button from '@/components/Button';

export default function DiscussionsPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (bandId) {
      loadThreads();
    }
  }, [isAuthenticated, router, bandId]);

  const loadThreads = async () => {
    try {
      const response = await discussionsAPI.getDiscussions(bandId);
      console.log('API Response:', response);
      setThreads(response.data.data.discussions || []); // FIXED: added extra .data
    } catch (error) {
      console.error('Failed to load discussions:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter and search threads
  const filteredThreads = threads
    .filter(thread => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const authorName = thread.creator?.user?.displayName || '';
      return (
        thread.title.toLowerCase().includes(searchLower) ||
        thread.body.toLowerCase().includes(searchLower) ||
        authorName.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (filterBy === 'recent') {
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      } else if (filterBy === 'popular') {
        return b.replyCount - a.replyCount;
      } else if (filterBy === 'unanswered') {
        if (a.replyCount === 0 && b.replyCount === 0) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (a.replyCount === 0) return -1;
        if (b.replyCount === 0) return 1;
        return 0;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-earth-900">Discussions</h1>
              <p className="text-earth-700 mt-1">General conversations and community topics</p>
            </div>
            <Button variant="primary" href={`/bands/${bandId}/discussions/new`}>
              + New Discussion
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="🔍 Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none text-sm"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="recent">Recent Activity</option>
              <option value="popular">Most Replies</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-8 py-8">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-earth-900 mb-2">
              {searchQuery ? 'No discussions found' : 'No discussions yet'}
            </h3>
            <p className="text-earth-700 mb-6">
              {searchQuery ? 'Try a different search term' : 'Start a conversation with your community'}
            </p>
            {!searchQuery && (
              <Button variant="primary" href={`/bands/${bandId}/discussions/new`} size="lg">
                Start Discussion
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-earth-200">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => router.push(`/bands/${bandId}/discussions/${thread.id}`)}
                  className="p-6 hover:bg-cream-100 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-earth-900 mb-2">{thread.title}</h3>
                      <p className="text-earth-700 text-sm mb-3 line-clamp-2">{thread.body}</p>
                      <div className="flex items-center gap-4 text-xs text-earth-600">
                        <span>by {thread.creator?.user?.displayName || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatTimestamp(thread.createdAt)}</span>
                        <span>•</span>
                        <span className={thread.replyCount === 0 ? 'text-rust font-medium' : ''}>
                          {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-earth-600 whitespace-nowrap">
                      <div>Last activity</div>
                      <div className="font-medium text-earth-900">{formatTimestamp(thread.lastActivityAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}