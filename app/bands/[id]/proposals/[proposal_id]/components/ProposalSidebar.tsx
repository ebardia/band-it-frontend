'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

interface ProposalSidebarProps {
  proposal: any;
  bandId: string;
  proposalId: string;
  userVote: any;
  projects: any[];
  onSubmit: () => void;
  onReview: (action: 'approve' | 'request_changes') => void;
  onVote: (type: 'approve' | 'reject' | 'abstain') => void;
  submitting: boolean;
}

export default function ProposalSidebar({
  proposal,
  bandId,
  proposalId,
  userVote,
  projects,
  onSubmit,
  onReview,
  onVote,
  submitting,
}: ProposalSidebarProps) {
  const [infoExpanded, setInfoExpanded] = useState(false);
  
  const totalVotes = proposal.votesApprove + proposal.votesReject + proposal.votesAbstain;

  return (
    <div className="space-y-6">
      {/* Collapsible Info Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-100 transition"
        >
          <span className="font-semibold text-earth-900">Proposal Info</span>
          <span className="text-earth-600">{infoExpanded ? '−' : '+'}</span>
        </button>
        
        {infoExpanded && (
          <div className="px-6 pb-4 text-sm text-earth-700 space-y-2 border-t border-earth-200 pt-4">
            <p><strong>Created:</strong> {new Date(proposal.createdAt).toLocaleString()}</p>
            {proposal.votingStartsAt && (
              <p><strong>Voting started:</strong> {new Date(proposal.votingStartsAt).toLocaleString()}</p>
            )}
            {proposal.financialRequest && (
              <p><strong>Financial request:</strong> ${Number(proposal.financialRequest).toFixed(2)}</p>
            )}
            
            {/* Voting Stats */}
            {proposal.state === 'voting' && (
              <div className="mt-4 pt-4 border-t border-earth-200">
                <h4 className="font-semibold text-earth-900 mb-3">Voting Results</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brass font-medium">Approve</span>
                      <span className="text-earth-700">{proposal.votesApprove}</span>
                    </div>
                    <div className="w-full bg-earth-200 rounded-full h-2">
                      <div 
                        className="bg-brass h-2 rounded-full" 
                        style={{ width: `${totalVotes > 0 ? (proposal.votesApprove / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-600 font-medium">Reject</span>
                      <span className="text-earth-700">{proposal.votesReject}</span>
                    </div>
                    <div className="w-full bg-earth-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${totalVotes > 0 ? (proposal.votesReject / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-earth-700 font-medium">Abstain</span>
                      <span className="text-earth-700">{proposal.votesAbstain}</span>
                    </div>
                    <div className="w-full bg-earth-200 rounded-full h-2">
                      <div 
                        className="bg-earth-400 h-2 rounded-full" 
                        style={{ width: `${totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-earth-600 mt-3">
                  Ends: {new Date(proposal.votingEndsAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Vote Status */}
      {userVote && (
        <div className="bg-cyber-50 border border-cyber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-cyber-900">You voted: {userVote.vote}</p>
          {userVote.comment && (
            <p className="text-sm text-cyber-700 mt-1">{userVote.comment}</p>
          )}
        </div>
      )}

      {/* Projects (if approved) */}
      {proposal.state === 'approved' && projects.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-earth-900 mb-3">Projects ({projects.length})</h3>
          <div className="space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/bands/${bandId}/projects/${project.id}`}
                className="block p-3 bg-cream-100 rounded-lg hover:bg-earth-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-earth-900">{project.name}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    project.status === 'completed' ? 'bg-brass text-white' :
                    project.status === 'active' ? 'bg-rust-light text-rust-dark' :
                    'bg-earth-100 text-earth-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="text-xs text-earth-600">
                  {project.progressPercentage}% complete
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}