'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { proposalsAPI, projectsAPI } from '@/lib/api';
import Button from '@/components/Button';
import CommentsSection from './components/CommentsSection';
import ProposalContent from './components/ProposalContent';
import ProposalSidebar from './components/ProposalSidebar';
import VoteModal from './components/VoteModal';
import ReviewModal from './components/ReviewModal';

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

  const [comments, setComments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteType, setVoteType] = useState<'approve' | 'reject' | 'abstain'>('approve');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'request_changes'>('approve');

  useEffect(() => {
    if (proposalId === 'new') {
      setLoading(false);
      return;
    }
    loadProposal();
    loadComments();
  }, [bandId, proposalId]);

  const loadProposal = async () => {
    try {
      const response = await proposalsAPI.getProposal(bandId, proposalId);
      setProposal(response.data.proposal);
      
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

  const loadComments = async () => {
    try {
      const response = await proposalsAPI.getComments(bandId, proposalId);
      
      // Transform comments to match CommentsSection format
      const transformedComments = response.data.data.comments.map((c: any) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        author: {
          displayName: c.creator?.user?.displayName || 'Unknown',
        },
        replies: c.replies.map((r: any) => ({
          id: r.id,
          body: r.body,
          createdAt: r.createdAt,
          author: {
            displayName: r.creator?.user?.displayName || 'Unknown',
          },
        })),
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async (body: string) => {
    try {
      await proposalsAPI.addComment(bandId, proposalId, { body });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleReply = async (commentId: string, body: string) => {
    try {
      await proposalsAPI.addComment(bandId, proposalId, { body, parentCommentId: commentId });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert('Failed to add reply');
    }
  };

  const handleEditComment = async (commentId: string, newBody: string) => {
    try {
      await proposalsAPI.updateComment(bandId, proposalId, commentId, { body: newBody });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('Failed to edit comment');
    }
  };

  const handleEditReply = async (commentId: string, replyId: string, newBody: string) => {
    try {
      await proposalsAPI.updateComment(bandId, proposalId, replyId, { body: newBody });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to edit reply:', error);
      alert('Failed to edit reply');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await proposalsAPI.deleteComment(bandId, proposalId, commentId);
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm('Delete this reply?')) return;
    
    try {
      await proposalsAPI.deleteComment(bandId, proposalId, replyId);
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply');
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

  const handleReviewSubmit = async (feedback: string) => {
    setReviewing(true);
    try {
      await proposalsAPI.review(bandId, proposalId, reviewAction, feedback);
      await loadProposal();
      setShowReviewModal(false);
    } catch (error) {
      console.error('Failed to review:', error);
    } finally {
      setReviewing(false);
    }
  };

  const handleVoteSubmit = async (comment: string) => {
    setVoting(true);
    try {
      await proposalsAPI.vote(bandId, proposalId, voteType, comment || undefined);
      await loadProposal();
      setShowVoteModal(false);
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to vote. You may have already voted.');
    } finally {
      setVoting(false);
    }
  };

  const getStateColor = (state: string) => {
    const colors: any = {
      draft: 'bg-earth-100 text-earth-800',
      in_review: 'bg-brass-light text-brass-dark',
      needs_revision: 'bg-rust-light text-rust-dark',
      submitted: 'bg-cyber-100 text-cyber-800',
      voting: 'bg-rust-light text-rust-dark',
      approved: 'bg-brass text-white',
      rejected: 'bg-earth-300 text-earth-900',
      executed: 'bg-cyber-500 text-white',
    };
    return colors[state] || 'bg-earth-100 text-earth-800';
  };

  // Filter comments based on search
  const filteredComments = comments.filter(comment => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const bodyMatch = comment.body.toLowerCase().includes(searchLower);
    const authorMatch = comment.author.displayName.toLowerCase().includes(searchLower);
    const replyMatch = comment.replies?.some((r: any) => 
      r.body.toLowerCase().includes(searchLower) || 
      r.author.displayName.toLowerCase().includes(searchLower)
    );
    return bodyMatch || authorMatch || replyMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Loading...</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Proposal not found</div>
      </div>
    );
  }

  const userVote = proposal.votes?.find((v: any) => v.member.userId === user?.id);
  const currentUserName = user?.displayName || `${user?.firstName} ${user?.lastName}`;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header with Actions */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link 
            href={`/bands/${bandId}/proposals`} 
            className="text-sm text-rust hover:text-rust-dark mb-3 inline-block"
          >
            ← Back to Proposals
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-earth-900 mb-2">{proposal.title}</h1>
              <p className="text-earth-700">
                by {proposal.creator.user.displayName || `${proposal.creator.user.firstName} ${proposal.creator.user.lastName}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <span className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${getStateColor(proposal.state)}`}>
                {proposal.state.replace('_', ' ').toUpperCase()}
              </span>

              {/* Action Buttons */}
              {proposal.state === 'draft' && (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                >
                  Submit for Review
                </Button>
              )}

              {proposal.state === 'in_review' && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setReviewAction('approve');
                      setShowReviewModal(true);
                    }}
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReviewAction('request_changes');
                      setShowReviewModal(true);
                    }}
                  >
                    Request Changes
                  </Button>
                </div>
              )}

              {proposal.state === 'voting' && !userVote && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setVoteType('approve');
                      setShowVoteModal(true);
                    }}
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setVoteType('reject');
                      setShowVoteModal(true);
                    }}
                  >
                    ✗ Reject
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setVoteType('abstain');
                      setShowVoteModal(true);
                    }}
                  >
                    ⊘ Abstain
                  </Button>
                </div>
              )}

              {proposal.state === 'approved' && (
                <Button
                  variant="primary"
                  href={`/bands/${bandId}/proposals/${proposalId}/create-project`}
                >
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content - 60/40 split */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content - 60% */}
          <div className="lg:col-span-3">
            <ProposalContent proposal={proposal} />
          </div>

          {/* Discussion Sidebar - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card + Sidebar */}
            <ProposalSidebar
              proposal={proposal}
              bandId={bandId}
              proposalId={proposalId}
              userVote={userVote}
              projects={projects}
              onSubmit={handleSubmit}
              onReview={(action) => {
                setReviewAction(action);
                setShowReviewModal(true);
              }}
              onVote={(type) => {
                setVoteType(type);
                setShowVoteModal(true);
              }}
              submitting={submitting}
            />

            {/* Discussion Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-earth-200">
                <input
                  type="text"
                  placeholder="🔍 Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Comments */}
              <div className="p-6">
                <CommentsSection
                  comments={filteredComments}
                  currentUserName={currentUserName}
                  onAddComment={handleAddComment}
                  onReply={handleReply}
                  onEditComment={handleEditComment}
                  onEditReply={handleEditReply}
                  onDeleteComment={handleDeleteComment}
                  onDeleteReply={handleDeleteReply}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showVoteModal && (
        <VoteModal
          voteType={voteType}
          onSubmit={handleVoteSubmit}
          onClose={() => setShowVoteModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          action={reviewAction}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}