'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { proposalsAPI } from '@/lib/api';
import Button from '@/components/Button';

export default function ProposalsPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (bandId) {
      loadProposals();
    }
  }, [isAuthenticated, router, bandId]);

  const loadProposals = async () => {
    try {
      const response = await proposalsAPI.getProposals(bandId);
      setProposals(response.data.proposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    const colors: any = {
      draft: 'bg-earth-100 text-earth-800',
      in_review: 'bg-brass-light text-brass-dark',
      voting: 'bg-rust-light text-rust-dark',
      approved: 'bg-brass text-white',
      rejected: 'bg-earth-300 text-earth-900',
      executed: 'bg-cyber-500 text-white',
    };
    return colors[state] || 'bg-earth-100 text-earth-800';
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
      {/* Header */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-earth-900">Proposals</h1>
              <p className="text-earth-700 mt-1">Propose actions for the collective to vote on</p>
            </div>
            <Button variant="primary" href={`/bands/${bandId}/proposals/new`}>
              + New Proposal
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {proposals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-earth-900 mb-2">No proposals yet</h3>
            <p className="text-earth-700 mb-6">Create your first proposal to get started</p>
            <Button variant="primary" href={`/bands/${bandId}/proposals/new`} size="lg">
              Create Proposal
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-earth-200">
              <thead className="bg-earth-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Votes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-earth-200">
                {proposals.map((proposal) => (
                  <tr 
                    key={proposal.id} 
                    onClick={() => router.push(`/bands/${bandId}/proposals/${proposal.id}`)} 
                    className="hover:bg-cream-100 cursor-pointer transition"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-earth-900">{proposal.title}</div>
                      <div className="text-sm text-earth-600 line-clamp-1">{proposal.objective}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(proposal.state)}`}>
                        {proposal.state.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                      {proposal.creator.user.displayName || `${proposal.creator.user.firstName} ${proposal.creator.user.lastName}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                      {proposal.state === 'voting' ? (
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">✓ {proposal.votesApprove}</span>
                          <span className="text-red-600">✗ {proposal.votesReject}</span>
                          <span className="text-earth-600">⊘ {proposal.votesAbstain}</span>
                        </div>
                      ) : (
                        <span className="text-earth-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
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