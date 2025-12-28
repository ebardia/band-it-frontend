'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { bandsAPI } from '@/lib/api';

export default function BandsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadBands();
  }, [isAuthenticated, router]);

  const loadBands = async () => {
    try {
      const response = await bandsAPI.getUserBands();
      console.log('API Response:', response.data);
      console.log('Bands:', response.data.bands);
      setBands(response.data.bands || []);
    } catch (error) {
      console.error('Failed to load bands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bands</h1>
            <p className="text-sm text-gray-600">Groups you belong to</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </Link>
            <Link
              href="/bands/new"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              + Create band
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!bands || bands.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bands yet</h3>
            <p className="text-gray-600 mb-6">Create your first band to get started</p>
            <Link
              href="/bands/new"
              className="inline-block px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create band
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bands.map((band, index) => (
              <Link
                key={band?.id || index}
                href={`/bands/${band?.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{band?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {band?.city}, {band?.stateProvince}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                    {band?.role}
                  </span>
                </div>

                {band?.shortDescription && (
                  <p className="text-gray-600 text-sm mb-4">{band.shortDescription}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{band?.memberCount} members</span>
                  <span className="text-gray-500">
                    Treasury: ${Number(band?.treasuryBalance || 0).toFixed(2)}
                  </span>
                </div>

                {band?.tags && band.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {band.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
