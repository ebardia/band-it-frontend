'use client';

interface ProposalContentProps {
  proposal: any;
}

export default function ProposalContent({ proposal }: ProposalContentProps) {
  return (
    <div className="space-y-6">
      {/* Objective */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-earth-900 mb-3">Objective</h2>
        <p className="text-earth-700">{proposal.objective}</p>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-earth-900 mb-3">Description</h2>
        <p className="text-earth-700 whitespace-pre-wrap">{proposal.description}</p>
      </div>

      {/* Rationale */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-earth-900 mb-3">Rationale</h2>
        <p className="text-earth-700 whitespace-pre-wrap">{proposal.rationale}</p>
      </div>

      {/* Success Criteria */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-earth-900 mb-3">Success Criteria</h2>
        <p className="text-earth-700 whitespace-pre-wrap">{proposal.successCriteria}</p>
      </div>

      {/* Review Feedback */}
      {proposal.reviewFeedback && (
        <div className="bg-brass-light bg-opacity-20 border border-brass-light rounded-xl p-6">
          <h2 className="text-lg font-semibold text-earth-900 mb-3">Review Feedback</h2>
          <p className="text-earth-700">{proposal.reviewFeedback}</p>
          <p className="text-sm text-earth-600 mt-2">
            by {proposal.reviewer?.user.displayName || `${proposal.reviewer?.user.firstName} ${proposal.reviewer?.user.lastName}`}
          </p>
        </div>
      )}

      {/* Votes */}
      {proposal.votes && proposal.votes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-earth-900 mb-4">Votes ({proposal.votes.length})</h2>
          <div className="space-y-3">
            {proposal.votes.map((vote: any) => (
              <div key={vote.id} className="border-b border-earth-200 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-earth-900">
                    {vote.member.user.displayName || `${vote.member.user.firstName} ${vote.member.user.lastName}`}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    vote.vote === 'approve' ? 'bg-brass-light text-brass-dark' :
                    vote.vote === 'reject' ? 'bg-red-100 text-red-800' :
                    'bg-earth-100 text-earth-800'
                  }`}>
                    {vote.vote}
                  </span>
                </div>
                {vote.comment && (
                  <p className="text-sm text-earth-700">{vote.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}