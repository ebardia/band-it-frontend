'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { bandsAPI, aiAPI, uploadAPI } from '@/lib/api';

export default function BandSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;

  const [band, setBand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [tagline, setTagline] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [coreValues, setCoreValues] = useState<any[]>([]);
  const [decisionGuidelines, setDecisionGuidelines] = useState('');
  const [inclusionStatement, setInclusionStatement] = useState('');
  const [membershipPolicy, setMembershipPolicy] = useState('');

  // AI state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<any>(null);

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    loadBand();
  }, [bandId]);

  const loadBand = async () => {
    try {
      const response = await bandsAPI.getBand(bandId);
      const bandData = response.data.Band;
      setBand(bandData);

      // Pre-fill form with existing data
      setTagline(bandData.tagline || '');
      setFullDescription(bandData.fullDescription || '');
      setCoreValues(bandData.coreValues || []);
      setDecisionGuidelines(bandData.decisionGuidelines || '');
      setInclusionStatement(bandData.inclusionStatement || '');
      setMembershipPolicy(bandData.membershipPolicy || '');
      
      // Use existing description as default for AI
      setAiDescription(bandData.description || '');
    } catch (error) {
      console.error('Failed to load band:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiDescription.trim()) {
      alert('Please provide a description of your band!');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateProfile(aiDescription, bandId);

      if (response.success) {
        const { profile, aiMetrics } = response.data;

        // Auto-fill form fields
        setTagline(profile.tagline);
        setFullDescription(profile.fullDescription);
        setCoreValues(profile.coreValues);
        setDecisionGuidelines(profile.decisionGuidelines);
        setInclusionStatement(profile.inclusionStatement);
        setMembershipPolicy(profile.membershipPolicy);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt('Image title (optional):');
    const description = prompt('Image description (optional):');

    setUploadingImage(true);
    try {
      await uploadAPI.uploadImage(bandId, file, title || undefined, description || undefined);
      alert('Image uploaded successfully!');
      // Reset the input
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt('Document title (required):');
    if (!title) {
      alert('Title is required for documents');
      e.target.value = '';
      return;
    }

    const description = prompt('Document description (optional):');

    setUploadingDocument(true);
    try {
      await uploadAPI.uploadDocument(bandId, file, title, description || undefined);
      alert('Document uploaded successfully!');
      // Reset the input
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await bandsAPI.updateProfile(bandId, {
        tagline,
        fullDescription,
        coreValues,
        decisionGuidelines,
        inclusionStatement,
        membershipPolicy,
      });

      alert('Profile updated successfully!');
      router.push(`/bands/${bandId}`);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addValue = () => {
    setCoreValues([...coreValues, { name: '', description: '' }]);
  };

  const updateValue = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...coreValues];
    updated[index][field] = value;
    setCoreValues(updated);
  };

  const removeValue = (index: number) => {
    setCoreValues(coreValues.filter((_, i) => i !== index));
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/bands/${bandId}`}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Band
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Band Profile</h1>
              <p className="text-gray-600 mt-1">{band?.name}</p>
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
                <p className="text-purple-600 font-medium">Cost</p>
                <p className="text-purple-900">${aiMetrics.costUsd}</p>
              </div>
            </div>
          </div>
        )}

        <form className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
              <span className="text-gray-500 font-normal ml-2">(One compelling sentence)</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Building a more sustainable future together"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{tagline.length}/100 characters</p>
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description
              <span className="text-gray-500 font-normal ml-2">(Who you are and what you do)</span>
            </label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="We are a community-driven organization focused on..."
            />
          </div>

          {/* Core Values */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Core Values
                <span className="text-gray-500 font-normal ml-2">(4-6 values that guide your work)</span>
              </label>
              <button
                type="button"
                onClick={addValue}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                + Add Value
              </button>
            </div>
            <div className="space-y-4">
              {coreValues.map((value, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={value.name}
                        onChange={(e) => updateValue(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Value name (e.g., Transparency)"
                      />
                      <textarea
                        value={value.description}
                        onChange={(e) => updateValue(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Brief explanation of this value..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {coreValues.length === 0 && (
                <p className="text-gray-500 text-sm italic">No values added yet. Click "+ Add Value" to start.</p>
              )}
            </div>
          </div>

          {/* Decision Guidelines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decision Guidelines
              <span className="text-gray-500 font-normal ml-2">(How your band makes decisions)</span>
            </label>
            <textarea
              value={decisionGuidelines}
              onChange={(e) => setDecisionGuidelines(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="We make decisions through democratic voting with..."
            />
          </div>

          {/* Inclusion Statement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inclusion Statement
              <span className="text-gray-500 font-normal ml-2">(Your commitment to diversity and inclusion)</span>
            </label>
            <textarea
              value={inclusionStatement}
              onChange={(e) => setInclusionStatement(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="We are committed to creating an inclusive environment..."
            />
          </div>

          {/* Membership Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membership Policy
              <span className="text-gray-500 font-normal ml-2">(How people can join)</span>
            </label>
            <textarea
              value={membershipPolicy}
              onChange={(e) => setMembershipPolicy(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Membership is open to anyone who shares our values..."
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
              <span className="text-gray-500 font-normal ml-2">(Photos to showcase your band)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {uploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
            <p className="text-xs text-gray-500 mt-1">Max 5MB. Formats: JPG, PNG, GIF, WebP</p>
          </div>

          {/* Documents Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Documents
              <span className="text-gray-500 font-normal ml-2">(PDFs, bylaws, reports, etc.)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
              onChange={handleDocumentUpload}
              disabled={uploadingDocument}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {uploadingDocument && <p className="text-sm text-gray-500 mt-2">Uploading document...</p>}
            <p className="text-xs text-gray-500 mt-1">Max 10MB. Formats: PDF, DOC, DOCX, TXT, XLSX, XLS, CSV</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Link
              href={`/bands/${bandId}`}
              className="flex-1 px-4 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ Generate Profile with AI</h2>
            <p className="text-gray-600 mb-6">
              Describe your band in a few sentences. The AI will help expand it into a complete profile with values, policies, and more.
            </p>

            <textarea
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none mb-6"
              placeholder="Example: We're a community group in Portland focused on urban sustainability. We run community gardens, organize zero-waste workshops, and advocate for green policies. We believe in grassroots action, transparency, and inclusive decision-making."
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
                disabled={aiGenerating || !aiDescription.trim()}
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