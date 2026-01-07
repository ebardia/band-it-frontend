'use client';

import { useState } from 'react';
import Button from '@/components/Button';

interface ReviewModalProps {
  action: 'approve' | 'request_changes';
  onSubmit: (feedback: string) => Promise<void>;
  onClose: () => void;
}

export default function ReviewModal({ action, onSubmit, onClose }: ReviewModalProps) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    await onSubmit(feedback);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-earth-900 mb-4">
          {action === 'approve' ? 'Approve Proposal' : 'Request Changes'}
        </h3>
        <p className="text-earth-700 mb-4">
          {action === 'approve' ? 'Approval feedback:' : 'What needs to change?'}
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none mb-4"
          placeholder="Add your feedback..."
        />
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={submitting}
            disabled={!feedback.trim()}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
}