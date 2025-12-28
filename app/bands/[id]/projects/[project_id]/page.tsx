'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { projectsAPI, tasksAPI, bandsAPI } from '@/lib/api';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const projectId = params.project_id as string;
  const { user } = useAuthStore();
  
  const [project, setProject] = useState<any>(null);
  const [band, setBand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [bandId, projectId]);

  const loadData = async () => {
    try {
      const [projectResponse, bandResponse] = await Promise.all([
        projectsAPI.getProject(bandId, projectId),
        bandsAPI.getBand(bandId),
      ]);
      
      setProject(projectResponse.data.project);
      setBand(bandResponse.data.Band);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksAPI.complete(bandId, projectId, taskId);
      await loadData();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await tasksAPI.update(bandId, projectId, taskId, { status });
      await loadData();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project? All tasks will also be deleted. This cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.delete(bandId, projectId);
      router.push(`/bands/${bandId}?tab=projects`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task? This cannot be undone.')) {
      return;
    }

    try {
      await tasksAPI.delete(bandId, projectId, taskId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      planning: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (status: string) => {
    const colors: any = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      blocked: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Project not found</div>
      </div>
    );
  }

  const tasksByStatus = {
    not_started: project.tasks.filter((t: any) => t.status === 'not_started'),
    in_progress: project.tasks.filter((t: any) => t.status === 'in_progress'),
    blocked: project.tasks.filter((t: any) => t.status === 'blocked'),
    completed: project.tasks.filter((t: any) => t.status === 'completed'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href={`/bands/${bandId}/proposals/${project?.proposalId}`} 
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Proposal
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600 mb-3">From: {project.proposal.title}</p>
              {project.description && (
                <p className="text-gray-600">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <Link
                href={`/bands/${bandId}/projects/${projectId}/edit`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                🗑️ Delete
              </button>
              <Link
                href={`/bands/${bandId}/projects/${projectId}/tasks/new`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Add Task
              </Link>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Overall Progress</span>
              <span className="text-gray-900 font-bold">{project.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all" 
                style={{ width: `${project.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2 text-gray-600">
              <span>{project.completedTasks} of {project.totalTasks} tasks completed</span>
              {project.targetDate && (
                <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {project.tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6">Break down this project into tasks</p>
            <Link
              href={`/bands/${bandId}/projects/${projectId}/tasks/new`}
              className="inline-block px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Add First Task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Not Started */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">
                Not Started ({tasksByStatus.not_started.length})
              </h3>
              {tasksByStatus.not_started.map((task: any) => (
                <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}
                  {task.assignee && (
                    <p className="text-xs text-gray-500 mb-2">
                      👤 {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mb-2">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                    className="w-full mt-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Start Task
                  </button>
                  <Link
                    href={`/bands/${bandId}/projects/${projectId}/tasks/${task.id}/edit`}
                    className="w-full mt-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 block text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-full mt-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* In Progress */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">
                In Progress ({tasksByStatus.in_progress.length})
              </h3>
              {tasksByStatus.in_progress.map((task: any) => (
                <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}
                  {task.assignee && (
                    <p className="text-xs text-gray-500 mb-2">
                      👤 {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mb-2">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="w-full mt-2 px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                  >
                    Mark Complete
                  </button>
                  <Link
                    href={`/bands/${bandId}/projects/${projectId}/tasks/${task.id}/edit`}
                    className="w-full mt-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 block text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-full mt-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Blocked */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">
                Blocked ({tasksByStatus.blocked.length})
              </h3>
              {tasksByStatus.blocked.map((task: any) => (
                <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}
                  {task.assignee && (
                    <p className="text-xs text-gray-500 mb-2">
                      👤 {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
                    </p>
                  )}
                  <button
                    onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                    className="w-full mt-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Unblock
                  </button>
                  <Link
                    href={`/bands/${bandId}/projects/${projectId}/tasks/${task.id}/edit`}
                    className="w-full mt-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 block text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-full mt-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Completed */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">
                Completed ({tasksByStatus.completed.length})
              </h3>
              {tasksByStatus.completed.map((task: any) => (
                <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition opacity-75 border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 line-through">{task.title}</h4>
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  {task.assignee && (
                    <p className="text-xs text-gray-500 mb-2">
                      👤 {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
                    </p>
                  )}
                  {task.completedAt && (
                    <p className="text-xs text-gray-500 mb-2">
                      ✓ {new Date(task.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  <Link
                    href={`/bands/${bandId}/projects/${projectId}/tasks/${task.id}/edit`}
                    className="w-full mt-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 block text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-full mt-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}