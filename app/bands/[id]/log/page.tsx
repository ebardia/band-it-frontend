'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { captainsLogAPI } from '@/lib/api';

export default function CaptainsLogPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLog = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (!bandId) return;

      try {
        const response = await captainsLogAPI.getLog(bandId, { limit: 100 });
        setEntries(response.data.entries);
      } catch (error) {
        console.error('Failed to load log:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [isAuthenticated, router, bandId]);

  const getEntityIcon = (entityType: string) => {
    const icons: any = {
      proposal: '📋',
      project: '🚀',
      task: '✓',
      member: '👤',
      band: '🏢',
    };
    return icons[entityType] || '📝';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-earth-900">Captain's Log</h1>
          <p className="text-earth-700 mt-1">All activity in this band</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        {entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-earth-900 mb-2">No activity yet</h3>
            <p className="text-earth-700">Activity will appear here as members work on proposals, projects, and tasks</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="flex gap-4 pb-4 border-b border-earth-200 last:border-b-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-rust-light bg-opacity-20 rounded-full flex items-center justify-center text-xl">
                    {getEntityIcon(entry.entityType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-earth-900">
                      <span className="font-medium">
                        {entry.actor.user.displayName || `${entry.actor.user.firstName} ${entry.actor.user.lastName}`}
                      </span>
                      {' '}{entry.actionPast}{' '}
                      {entry.entityName && (
                        <span className="font-medium">"{entry.entityName}"</span>
                      )}
                    </p>
                    {entry.context && entry.context.changes && (
                      <div className="mt-1 text-xs text-earth-600">
                        {Object.entries(entry.context.changes).map(([field, change]: [string, any]) => (
                          <div key={field}>
                            {field}: {change.from} → {change.to}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-earth-600 mt-1">
                      {formatTimestamp(entry.timestamp)}
                    </p>
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