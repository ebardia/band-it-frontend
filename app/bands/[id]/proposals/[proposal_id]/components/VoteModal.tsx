'use client';

import { useState } from 'react';
import Button from '@/components/Button';

interface VoteModalProps {
  voteType: 'approve' | 'reject' | 'abstain';
  onSubmit: (comment: string) => Promise<void>;
  onClose: () => void;
}

export default function VoteModal({ voteType, onSubmit, onClose }: VoteModalProps) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(comment);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-earth-900 mb-4">
          Vote {voteType.charAt(0).toUpperCase() + voteType.slice(1)}
        </h3>
        <p className="text-earth-700 mb-4">Why are you voting to {voteType}? (optional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none mb-4"
          placeholder="Add a comment..."
        />
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={handleSubmit} loading={submitting}>
            Submit Vote
          </Button>
        </div>
      </div>
    </div>
  );
}