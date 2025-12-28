'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { proposalsAPI, projectsAPI } from '@/lib/api';

export default function ProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const proposalId = params.proposal_id as string;
  const { user } = useAuthStore();
  
  const [voting, setVoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const [proposal, setProposal] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't try to load if we're on the "new" proposal page
    if (proposalId === 'new') {
      setLoading(false);
      return;
    }
    
    loadProposal();
  }, [bandId, proposalId]);

  const loadProposal = async () => {
  try {
    const response = await proposalsAPI.getProposal(bandId, proposalId);
    setProposal(response.data.proposal);
    
    // Load projects for this proposal
    const projectsResponse = await projectsAPI.getProjects(bandId);
    const proposalProjects = projectsResponse.data.projects.filter(
      (p: any) => p.proposalId === proposalId
    );
    setProjects(proposalProjects);
  } catch (error) {
    console.error('Failed to load proposal:', error);
  } finally {
    setLoading(false);
  }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await proposalsAPI.submit(bandId, proposalId);
      await loadProposal();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (action: 'approve' | 'request_changes') => {
    const feedback = prompt(action === 'approve' ? 'Approval feedback:' : 'What needs to change?');
    if (!feedback) return;

    setReviewing(true);
    try {
      await proposalsAPI.review(bandId, proposalId, action, feedback);
      await loadProposal();
    } catch (error) {
      console.error('Failed to review:', error);
    } finally {
      setReviewing(false);
    }
  };

  const handleVote = async (vote: 'approve' | 'reject' | 'abstain') => {
    const comment = prompt(`Why are you voting to ${vote}? (optional)`);
    
    setVoting(true);
    try {
      await proposalsAPI.vote(bandId, proposalId, vote, comment || undefined);
      await loadProposal();
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to vote. You may have already voted.');
    } finally {
      setVoting(false);
    }
  };

  const getStateColor = (state: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      needs_revision: 'bg-orange-100 text-orange-800',
      submitted: 'bg-blue-100 text-blue-800',
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

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Proposal not found</div>
      </div>
    );
  }

  const userVote = proposal.votes?.find((v: any) => v.member.userId === user?.id);
  const totalVotes = proposal.votesApprove + proposal.votesReject + proposal.votesAbstain;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href={`/bands/${bandId}`} 
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Band
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
              <p className="text-gray-600">
                by {proposal.creator.user.displayName || `${proposal.creator.user.firstName} ${proposal.creator.user.lastName}`}
              </p>
            </div>
            <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStateColor(proposal.state)}`}>
              {proposal.state.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Objective */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Objective</h2>
              <p className="text-gray-700">{proposal.objective}</p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
            </div>

            {/* Rationale */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Rationale</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.rationale}</p>
            </div>

            {/* Success Criteria */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Success Criteria</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.successCriteria}</p>
            </div>

            {/* Review Feedback */}
            {proposal.reviewFeedback && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Review Feedback</h2>
                <p className="text-gray-700">{proposal.reviewFeedback}</p>
                <p className="text-sm text-gray-500 mt-2">
                  by {proposal.reviewer?.user.displayName || `${proposal.reviewer?.user.firstName} ${proposal.reviewer?.user.lastName}`}
                </p>
              </div>
            )}

            {/* Votes */}
            {proposal.votes && proposal.votes.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Votes ({proposal.votes.length})</h2>
                <div className="space-y-3">
                  {proposal.votes.map((vote: any) => (
                    <div key={vote.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {vote.member.user.displayName || `${vote.member.user.firstName} ${vote.member.user.lastName}`}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          vote.vote === 'approve' ? 'bg-green-100 text-green-800' :
                          vote.vote === 'reject' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vote.vote}
                        </span>
                      </div>
                      {vote.comment && (
                        <p className="text-sm text-gray-600">{vote.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Stats */}
            {proposal.state === 'voting' && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Results</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600 font-medium">Approve</span>
                      <span className="text-gray-600">{proposal.votesApprove}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${totalVotes > 0 ? (proposal.votesApprove / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600 font-medium">Reject</span>
                      <span className="text-gray-600">{proposal.votesReject}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${totalVotes > 0 ? (proposal.votesReject / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">Abstain</span>
                      <span className="text-gray-600">{proposal.votesAbstain}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full" 
                        style={{ width: `${totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Ends: {new Date(proposal.votingEndsAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              {proposal.state === 'draft' && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              )}

              {proposal.state === 'in_review' && (
                <>
                  <button
                    onClick={() => handleReview('approve')}
                    disabled={reviewing}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReview('request_changes')}
                    disabled={reviewing}
                    className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
                  >
                    ← Request Changes
                  </button>
                </>
              )}

              {proposal.state === 'voting' && !userVote && (
                <>
                  <button
                    onClick={() => handleVote('approve')}
                    disabled={voting}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    ✓ Vote Approve
                  </button>
                  <button
                    onClick={() => handleVote('reject')}
                    disabled={voting}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    ✗ Vote Reject
                  </button>
                  <button
                    onClick={() => handleVote('abstain')}
                    disabled={voting}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    ⊘ Abstain
                  </button>
                </>
              )}

              {userVote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">You voted: {userVote.vote}</p>
                  {userVote.comment && (
                    <p className="text-sm text-blue-700 mt-1">{userVote.comment}</p>
                  )}
                </div>
              )}
            </div>

            {proposal.state === 'approved' && (
  <>
                {/* Projects List */}
                {projects.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Projects ({projects.length})</h3>
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/bands/${bandId}/projects/${project.id}`}
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{project.name}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.progressPercentage}% complete
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                                      
                <Link
                  href={`/bands/${bandId}/proposals/${proposalId}/create-project`}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center block"
                >
                  ✓ Create Project
                </Link>
              </>
            )}

            {/* Info */}
            <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600 space-y-2">
              <p><strong>Created:</strong> {new Date(proposal.createdAt).toLocaleString()}</p>
              {proposal.votingStartsAt && (
                <p><strong>Voting started:</strong> {new Date(proposal.votingStartsAt).toLocaleString()}</p>
              )}
              {proposal.financialRequest && (
                <p><strong>Financial request:</strong> ${Number(proposal.financialRequest).toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}