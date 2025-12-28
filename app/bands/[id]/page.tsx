'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { bandsAPI, proposalsAPI, projectsAPI, captainsLogAPI, aiAPI, uploadAPI } from '@/lib/api';
import AboutTab from './components/AboutTab';
import ImagesTab from './components/ImagesTab';
import DocumentsTab from './components/DocumentsTab';

export default function BandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [band, setBand] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [captainsLog, setCaptainsLog] = useState<any[]>([]);
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'about' | 'proposals' | 'members' | 'projects' | 'captains-log' | 'images' | 'documents'>(
    (searchParams.get('tab') as 'about' | 'proposals' | 'members' | 'projects' | 'captains-log' | 'images' | 'documents') || 'about'
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (bandId) {
      loadData();
    }
  }, [isAuthenticated, router, bandId]);

  const loadData = async () => {
    if (!bandId) return;
    
    try {
      const [bandResponse, proposalsResponse, projectsResponse, logResponse, aiUsageResponse, imagesResponse, documentsResponse] = await Promise.all([
        bandsAPI.getBand(bandId),
        proposalsAPI.getProposals(bandId),
        projectsAPI.getProjects(bandId),
        captainsLogAPI.getLog(bandId, { limit: 50 }),
        aiAPI.getBandUsage(bandId).catch(() => ({ data: { usage: null } })),
        uploadAPI.getBandImages(bandId).catch(() => ({ data: { images: [] } })),
        uploadAPI.getBandDocuments(bandId).catch(() => ({ data: { documents: [] } })),
      ]);
      
      setBand(bandResponse.data.Band);
      setProposals(proposalsResponse.data.proposals);
      setProjects(projectsResponse.data.projects);
      setCaptainsLog(logResponse.data.entries);
      setAiUsage(aiUsageResponse.data?.usage);
      setImages(imagesResponse.data?.images || []);
      setDocuments(documentsResponse.data?.documents || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      voting: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      executed: 'bg-purple-100 text-purple-800',
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
  };

  const getEntityIcon = (entityType: string) => {
    const icons: any = {
      proposal: '📋',
      project: '🚀',
      task: '✓',
      member: '👤',
      band: '🏢',
    };
    return icons[entityType] || '📝';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!band) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Band not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href="/bands" className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
                ← Back to Bands
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{band.name}</h1>
              <p className="text-gray-600">{band.shortDescription || band.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>📍 {band.city}, {band.stateProvince}</span>
                <span>👥 {band.memberCount} members</span>
                <span>💰 ${Number(band.treasuryBalance).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/bands/${bandId}/settings`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                ⚙️ Settings
              </Link>
              <Link href={`/bands/${bandId}/proposals/new`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                + New Proposal
              </Link>
            </div>
          </div>

          {/* AI Usage Widget */}
          {aiUsage && aiUsage.totals && aiUsage.totals.uses > 0 && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">🤖 AI Usage This Month</h3>
                <span className="text-sm text-purple-600">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Total Uses</p>
                  <p className="text-2xl font-bold text-purple-900">{aiUsage.totals.uses}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Energy</p>
                  <p className="text-2xl font-bold text-green-700">{aiUsage.totals.energyKwh.toFixed(4)}</p>
                  <p className="text-xs text-gray-500">kWh</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Water</p>
                  <p className="text-2xl font-bold text-blue-700">{aiUsage.totals.waterLiters.toFixed(4)}</p>
                  <p className="text-xs text-gray-500">liters</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Carbon</p>
                  <p className="text-2xl font-bold text-orange-700">{aiUsage.totals.carbonKg.toFixed(4)}</p>
                  <p className="text-xs text-gray-500">kg CO₂</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Cost</p>
                  <p className="text-2xl font-bold text-indigo-900">${aiUsage.totals.cost.toFixed(2)}</p>
                </div>
              </div>

              {Object.keys(aiUsage.byAgentType).length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-3">Usage by Agent Type</p>
                  <div className="space-y-2">
                    {Object.entries(aiUsage.byAgentType).map(([type, stats]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>{stats.count} uses</span>
                          <span>${stats.cost.toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-purple-600 mt-4">
                💡 This month's AI energy = running an LED bulb for {(aiUsage.totals.energyKwh * 100).toFixed(0)} hours
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b">
            <button onClick={() => setActiveTab('about')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'about' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              About
            </button>
            <button onClick={() => setActiveTab('proposals')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'proposals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Proposals ({proposals.length})
            </button>
            <button onClick={() => setActiveTab('projects')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'projects' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Projects ({projects.length})
            </button>
            <button onClick={() => setActiveTab('members')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'members' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Members ({band.memberCount})
            </button>
            <button onClick={() => setActiveTab('captains-log')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'captains-log' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Captain's Log ({captainsLog.length})
            </button>
            <button onClick={() => setActiveTab('images')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'images' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Images ({images.length})
            </button>
            <button onClick={() => setActiveTab('documents')} className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Documents ({documents.length})
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'about' && <AboutTab band={band} bandId={bandId} />}
        
        {activeTab === 'images' && <ImagesTab images={images} bandId={bandId} onReload={loadData} />}
        
        {activeTab === 'documents' && <DocumentsTab documents={documents} bandId={bandId} onReload={loadData} />}

        {activeTab === 'proposals' && (
          <div>
            {proposals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-6">Create your first proposal to get started</p>
                <Link href={`/bands/${bandId}/proposals/new`} className="inline-block px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Create Proposal
                </Link>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Proposals</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {proposals.map((proposal) => (
                        <tr key={proposal.id} onClick={() => router.push(`/bands/${bandId}/proposals/${proposal.id}`)} className="hover:bg-gray-50 cursor-pointer transition">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{proposal.objective}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(proposal.state)}`}>
                              {proposal.state.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {proposal.creator.user.displayName || `${proposal.creator.user.firstName} ${proposal.creator.user.lastName}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {proposal.state === 'voting' ? (
                              <div className="flex items-center gap-3">
                                <span className="text-green-600">✓ {proposal.votesApprove}</span>
                                <span className="text-red-600">✗ {proposal.votesReject}</span>
                                <span className="text-gray-600">⊘ {proposal.votesAbstain}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create projects from approved proposals</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} onClick={() => router.push(`/bands/${bandId}/projects/${project.id}`)} className="hover:bg-gray-50 cursor-pointer transition">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">From: {project.proposal.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${project.progressPercentage}%` }} />
                            </div>
                            <span className="text-sm text-gray-900 font-medium">{project.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.completedTasks}/{project.totalTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Members</h3>
            <div className="space-y-3">
              {band.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user.displayName || `${member.user.firstName} ${member.user.lastName}`}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'captains-log' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Captain's Log</h2>
            {captainsLog.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600">Activity will appear here as members work on proposals, projects, and tasks</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-4">
                  {captainsLog.map((entry) => (
                    <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                        {getEntityIcon(entry.entityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">
                            {entry.actor.user.displayName || `${entry.actor.user.firstName} ${entry.actor.user.lastName}`}
                          </span>
                          {' '}{entry.actionPast}{' '}
                          {entry.entityName && (
                            <span className="font-medium">"{entry.entityName}"</span>
                          )}
                        </p>
                        {entry.context && entry.context.changes && (
                          <div className="mt-1 text-xs text-gray-500">
                            {Object.entries(entry.context.changes).map(([field, change]: [string, any]) => (
                              <div key={field}>
                                {field}: {change.from} → {change.to}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}