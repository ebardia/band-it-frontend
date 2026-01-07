'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { discussionsAPI } from '@/lib/discussionsAPI';
import Button from '@/components/Button';

export default function NewDiscussionPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Creating discussion...'); // DEBUG
      const response = await discussionsAPI.createDiscussion(bandId, {
        title: title.trim(),
        body: body.trim(),
      });
      
      console.log('Create response:', response); // DEBUG
      const discussionId = response.data.data.discussion.id; // FIXED: added extra .data
      router.push(`/bands/${bandId}/discussions/${discussionId}`);
    } catch (error) {
      console.error('Failed to create discussion:', error);
      alert('Failed to create discussion');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link 
            href={`/bands/${bandId}/discussions`} 
            className="text-sm text-rust hover:text-rust-dark mb-3 inline-block"
          >
            ← Back to Discussions
          </Link>
          
          <h1 className="text-3xl font-bold text-earth-900">Start a Discussion</h1>
          <p className="text-earth-700 mt-1">Share your thoughts with the community</p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-earth-900 mb-2">
                Title <span className="text-rust">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-earth-900 mb-2">
                Message <span className="text-rust">*</span>
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a conversation..."
                rows={12}
                className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none"
                required
              />
              <p className="text-xs text-earth-600 mt-2">
                Be respectful and constructive. Follow community guidelines.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={!title.trim() || !body.trim()}
              >
                Post Discussion
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 bg-brass-light bg-opacity-20 border border-brass-light rounded-xl p-6">
          <h3 className="font-semibold text-earth-900 mb-3">💡 Tips for great discussions:</h3>
          <ul className="space-y-2 text-sm text-earth-700">
            <li>• Use a clear, descriptive title</li>
            <li>• Provide context and details in your message</li>
            <li>• Ask specific questions to encourage responses</li>
            <li>• Be open to different perspectives</li>
            <li>• Keep conversations focused and on-topic</li>
          </ul>
        </div>
      </main>
    </div>
  );
}