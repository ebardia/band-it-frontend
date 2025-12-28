'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { bandsAPI, proposalsAPI } from '@/lib/api';

export default function MyProposalsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadProposals();
  }, [isAuthenticated, router]);

  const loadProposals = async () => {
    try {
      // Get all user's bands
      const bandsResponse = await bandsAPI.getUserBands();
      const bands = bandsResponse.data.bands;

      // Get proposals from each band
      const allProposals = await Promise.all(
        bands.map(async (band: any) => {
          const proposalsResponse = await proposalsAPI.getProposals(band.id);
          return proposalsResponse.data.proposals.map((proposal: any) => ({
            ...proposal,
            bandName: band.name,
            bandId: band.id,
          }));
        })
      );

      // Flatten and sort by created date
      const flatProposals = allProposals.flat().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setProposals(flatProposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      voting: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      executed: 'bg-purple-100 text-purple-800',
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-600 mt-1">All proposals across your bands</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {proposals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
            <p className="text-gray-600 mb-6">Create your first proposal in a band</p>
            <Link
              href="/bands"
              className="inline-block px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Go to Bands
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Band
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr
                    key={proposal.id}
                    onClick={() => router.push(`/bands/${proposal.bandId}/proposals/${proposal.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{proposal.objective}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proposal.bandName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(proposal.state)}`}>
                        {proposal.state.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.creator.user.displayName || `${proposal.creator.user.firstName} ${proposal.creator.user.lastName}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}