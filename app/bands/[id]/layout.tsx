'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { bandsAPI } from '@/lib/api';

export default function BandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [band, setBand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated() && bandId) {
      loadBandData();
    }
  }, [bandId, isAuthenticated]);

  const loadBandData = async () => {
    try {
      const bandResponse = await bandsAPI.getBand(bandId);
      setBand(bandResponse.data.Band);
    } catch (error) {
      console.error('Failed to load band:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation items
const navigation = [
  { name: 'Dashboard', href: `/bands/${bandId}`, icon: '🏠', exact: true },
  { name: 'Proposals', href: `/bands/${bandId}/proposals`, icon: '📋' },
  { name: 'Projects', href: `/bands/${bandId}/projects`, icon: '🚀' },
  { name: 'Members', href: `/bands/${bandId}/members`, icon: '👥' },
  { name: 'Discussions', href: `/bands/${bandId}/discussions`, icon: '💬' },
  { name: 'Captain\'s Log', href: `/bands/${bandId}/log`, icon: '📖' },
  { name: 'Media', href: `/bands/${bandId}/media`, icon: '🖼️' },
  { name: 'AI Usage', href: `/bands/${bandId}/ai-usage`, icon: '🤖' },
];
  
  // Check if link is active
  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-earth-200 flex flex-col">
        {/* Band Header */}
        <div className="p-4 border-b border-earth-200">
          <Link href="/bands" className="text-xs text-earth-600 hover:text-rust mb-2 block">
            ← All Bands
          </Link>
          <div>
            <h2 className="font-bold text-earth-900 text-lg truncate">{band?.name}</h2>
            <p className="text-xs text-earth-600">{band?.city}, {band?.stateProvince}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-rust text-white'
                    : 'text-earth-700 hover:bg-cream-100 hover:text-rust'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings at Bottom */}
        <div className="p-4 border-t border-earth-200">
          <Link
            href={`/bands/${bandId}/settings`}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === `/bands/${bandId}/settings`
                ? 'bg-rust text-white'
                : 'text-earth-700 hover:bg-cream-100 hover:text-rust'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}