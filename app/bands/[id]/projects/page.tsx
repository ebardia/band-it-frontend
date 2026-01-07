'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { projectsAPI } from '@/lib/api';

export default function ProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (!bandId) return;

      try {
        const response = await projectsAPI.getProjects(bandId);
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [isAuthenticated, router, bandId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream-100"><div className="text-earth-600">Loading...</div></div>;
  }

  return <div className="min-h-screen bg-cream-100"><header className="bg-white border-b border-earth-200"><div className="max-w-7xl mx-auto px-8 py-6"><div><h1 className="text-3xl font-bold text-earth-900">Projects</h1><p className="text-earth-700 mt-1">Track work on approved proposals</p></div></div></header><main className="max-w-7xl mx-auto px-8 py-8">{projects.length === 0 ? <div className="text-center py-16 bg-white rounded-xl"><h3 className="text-lg font-medium text-earth-900 mb-2">No projects yet</h3><p className="text-earth-700">Projects are created from approved proposals</p></div> : <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="min-w-full divide-y divide-earth-200"><thead className="bg-earth-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Project Name</th><th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Progress</th><th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Tasks</th><th className="px-6 py-3 text-left text-xs font-medium text-earth-600 uppercase tracking-wider">Target Date</th></tr></thead><tbody className="bg-white divide-y divide-earth-200">{projects.map((project) => <tr key={project.id} onClick={() => router.push(`/bands/${bandId}/projects/${project.id}`)} className="hover:bg-cream-100 cursor-pointer transition"><td className="px-6 py-4"><div className="text-sm font-medium text-earth-900">{project.name}</div><div className="text-sm text-earth-600">From: {project.proposal.title}</div></td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'completed' ? 'bg-brass text-white' : project.status === 'active' ? 'bg-rust-light text-rust-dark' : project.status === 'on_hold' ? 'bg-brass-light text-brass-dark' : 'bg-earth-100 text-earth-800'}`}>{project.status}</span></td><td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="w-24 bg-earth-200 rounded-full h-2 mr-2"><div className="bg-rust h-2 rounded-full" style={{ width: `${project.progressPercentage}%` }} /></div><span className="text-sm text-earth-900 font-medium">{project.progressPercentage}%</span></div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">{project.completedTasks}/{project.totalTasks}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">{project.targetDate ? new Date(project.targetDate).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div>}</main></div>;
}