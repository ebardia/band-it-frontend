'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { bandsAPI, captainsLogAPI } from '@/lib/api';
import Button from '@/components/Button';

export default function BandDashboard() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [band, setBand] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (bandId) {
      loadData();
    }
  }, [isAuthenticated, router, bandId]);

  const loadData = async () => {
    if (!bandId) return;
    
    try {
      const [bandResponse, logResponse] = await Promise.all([
        bandsAPI.getBand(bandId),
        captainsLogAPI.getLog(bandId, { limit: 10 }),
      ]);
      
      setBand(bandResponse.data.Band);
      setRecentActivity(logResponse.data.entries);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!band) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Band not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-earth-900 mb-2">{band.name}</h1>
              <p className="text-earth-700">{band.shortDescription || band.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-earth-600">
                <span>📍 {band.city}, {band.stateProvince}</span>
                <span>👥 {band.memberCount} members</span>
                <span>💰 ${Number(band.treasuryBalance).toFixed(2)}</span>
              </div>
            </div>
            <Button variant="primary" href={`/bands/${bandId}/proposals/new`}>
              + New Proposal
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Tagline */}
        {band.tagline && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-2xl font-semibold text-rust italic">"{band.tagline}"</p>
          </div>
        )}

        {/* Full Description */}
        {band.fullDescription && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-earth-900 mb-4">About Us</h2>
            <p className="text-earth-700 whitespace-pre-wrap">{band.fullDescription}</p>
          </div>
        )}

        {/* Core Values */}
        {band.coreValues && Array.isArray(band.coreValues) && band.coreValues.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-earth-900 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {band.coreValues.map((value: any, index: number) => (
                <div key={index} className="border border-earth-200 rounded-lg p-4">
                  <h3 className="font-semibold text-rust mb-2">{value.name}</h3>
                  <p className="text-earth-700 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-earth-900">Recent Activity</h2>
              <Link href={`/bands/${bandId}/log`} className="text-sm text-rust hover:text-rust-dark">
                View all →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                {recentActivity.map((entry) => (
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
                      <p className="text-xs text-earth-600 mt-1">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!band.tagline && !band.fullDescription && !band.coreValues?.length && recentActivity.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-earth-900 mb-2">Welcome to your band!</h3>
            <p className="text-earth-700 mb-6">Get started by creating your first proposal or completing your band profile</p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" href={`/bands/${bandId}/proposals/new`}>
                Create Proposal
              </Button>
              <Button variant="secondary" href={`/bands/${bandId}/settings`}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}