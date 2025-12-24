'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { organizationsAPI } from '@/lib/api';

export default function OrganizationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadOrganizations();
  }, [isAuthenticated, router]);

  const loadOrganizations = async () => {
    try {
      const response = await organizationsAPI.getUserOrgs();
      setOrganizations(response.data.organizations);
    } catch (error) {
      console.error('Failed to load organizations:', error);
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Organizations</h1>
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
              href="/organizations/new"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              + Create Organization
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations yet</h3>
            <p className="text-gray-600 mb-6">Create your first organization to get started</p>
            <Link
              href="/organizations/new"
              className="inline-block px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create Organization
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Link
                key={org.id}
                href={`/organizations/${org.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{org.name}</h3>
                    <p className="text-sm text-gray-500">
                      {org.city}, {org.stateProvince}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                    {org.role}
                  </span>
                </div>

                {org.shortDescription && (
                  <p className="text-gray-600 text-sm mb-4">{org.shortDescription}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{org.memberCount} members</span>
                  <span className="text-gray-500">
                    Treasury: ${Number(org.treasuryBalance).toFixed(2)}
                  </span>
                </div>

                {org.tags && org.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {org.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
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