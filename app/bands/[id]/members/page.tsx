'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { bandsAPI } from '@/lib/api';

export default function MembersPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [band, setBand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (!bandId) return;

      try {
        const response = await bandsAPI.getBand(bandId);
        setBand(response.data.Band);
      } catch (error) {
        console.error('Failed to load band:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, router, bandId]);

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
          <h1 className="text-3xl font-bold text-earth-900">Members</h1>
          <p className="text-earth-700 mt-1">{band?.memberCount} members in this band</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-3">
            {band?.members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between py-3 border-b border-earth-200 last:border-b-0">
                <div>
                  <p className="font-medium text-earth-900">
                    {member.user.displayName || `${member.user.firstName} ${member.user.lastName}`}
                  </p>
                  <p className="text-sm text-earth-600">{member.user.email}</p>
                </div>
                <span className="px-3 py-1 bg-earth-100 text-earth-700 text-sm rounded-full">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}