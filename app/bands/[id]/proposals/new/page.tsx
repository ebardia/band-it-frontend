'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { proposalsAPI, aiAPI } from '@/lib/api';

export default function NewProposalPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');
  const [rationale, setRationale] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [financialRequest, setFinancialRequest] = useState('');
  const [votingPeriodHours, setVotingPeriodHours] = useState('72');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AI state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiIdea, setAiIdea] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await proposalsAPI.create(bandId, {
        title,
        objective,
        description,
        rationale,
        successCriteria,
        financialRequest: financialRequest ? parseFloat(financialRequest) : undefined,
        votingPeriodHours: parseInt(votingPeriodHours),
      });

      if (response.success) {
        router.push(`/bands/${bandId}/proposals/${response.data.proposal.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiIdea.trim()) {
      alert('Please describe your idea first!');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateProposal(aiIdea, bandId);
      
      if (response.success) {
        const { proposal, aiMetrics } = response.data;
        
        // Convert successCriteria array to string if needed
        const successCriteriaString = Array.isArray(proposal.successCriteria)
          ? proposal.successCriteria.join('\n')
          : proposal.successCriteria;
        
        // Auto-fill form fields
        setTitle(proposal.title);
        setObjective(proposal.objective);
        setDescription(proposal.description);
        setRationale(proposal.rationale);
        setSuccessCriteria(successCriteriaString);
        
        // Save metrics
        setAiMetrics(aiMetrics);
        
        // Close modal
        setShowAIModal(false);
      }
    } catch (err: any) {
      alert('AI generation failed: ' + (err.response?.data?.error?.message || 'Unknown error'));
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/bands/${bandId}`}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Band
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Proposal</h1>
              <p className="text-gray-600 mt-1">Propose an action for the collective</p>
            </div>
            <button
              onClick={() => setShowAIModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              ✨ Generate with AI
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Metrics Display */}
        {aiMetrics && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">🤖 AI Generation Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-purple-600 font-medium">Model</p>
                <p className="text-purple-900">{aiMetrics.model}</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Energy</p>
                <p className="text-purple-900">{aiMetrics.energyKwh} kWh</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Water</p>
                <p className="text-purple-900">{aiMetrics.waterLiters}L</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Carbon</p>
                <p className="text-purple-900">{aiMetrics.carbonKg} kg CO₂</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Tokens</p>
                <p className="text-purple-900">{aiMetrics.tokensUsed}</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Duration</p>
                <p className="text-purple-900">{(aiMetrics.durationMs / 1000).toFixed(2)}s</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">Cost</p>
                <p className="text-purple-900">${aiMetrics.costUsd}</p>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-3">
              💡 Equivalent to running an LED light bulb for {(aiMetrics.energyKwh * 100).toFixed(1)} hours
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Implement AI Proposal Assistant"
            />
          </div>

          {/* Objective */}
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
              Objective * <span className="text-gray-500 font-normal">(What are we trying to achieve?)</span>
            </label>
            <textarea
              id="objective"
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Make proposal writing more accessible and higher quality through AI assistance"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description * <span className="text-gray-500 font-normal">(What will we do?)</span>
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Add AI-powered proposal generation feature..."
            />
          </div>

          {/* Rationale */}
          <div>
            <label htmlFor="rationale" className="block text-sm font-medium text-gray-700 mb-2">
              Rationale * <span className="text-gray-500 font-normal">(Why should we do this?)</span>
            </label>
            <textarea
              id="rationale"
              required
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Writing good proposals is hard. AI can help structure ideas better..."
            />
          </div>

          {/* Success Criteria */}
          <div>
            <label htmlFor="successCriteria" className="block text-sm font-medium text-gray-700 mb-2">
              Success Criteria * <span className="text-gray-500 font-normal">(How will we know it's done?)</span>
            </label>
            <textarea
              id="successCriteria"
              required
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="AI button works, generates quality proposals, users can edit results"
            />
          </div>

          {/* Financial Request & Voting Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="financialRequest" className="block text-sm font-medium text-gray-700 mb-2">
                Financial Request (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  id="financialRequest"
                  type="number"
                  step="0.01"
                  value={financialRequest}
                  onChange={(e) => setFinancialRequest(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="votingPeriodHours" className="block text-sm font-medium text-gray-700 mb-2">
                Voting Period (Hours)
              </label>
              <input
                id="votingPeriodHours"
                type="number"
                value={votingPeriodHours}
                onChange={(e) => setVotingPeriodHours(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Link
              href={`/bands/${bandId}`}
              className="flex-1 px-4 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ Generate Proposal with AI</h2>
            <p className="text-gray-600 mb-6">
              Describe your idea in plain language. The AI will help structure it into a complete proposal.
            </p>
            
            <textarea
              value={aiIdea}
              onChange={(e) => setAiIdea(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none mb-6"
              placeholder="Example: We should add an AI assistant to help people write better proposals. It should check if proposals are clear, realistic, and aligned with our band's values. We want to use sustainable AI options and track resource usage."
              disabled={aiGenerating}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setShowAIModal(false)}
                disabled={aiGenerating}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithAI}
                disabled={aiGenerating || !aiIdea.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                {aiGenerating ? 'Generating...' : '✨ Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}