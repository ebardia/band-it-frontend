'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { tasksAPI, projectsAPI } from '@/lib/api';
import Button from '@/components/Button';
import CommentsSection from '../../../../proposals/[proposal_id]/components/CommentsSection';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const projectId = params.project_id as string;
  const taskId = params.task_id as string;
  const { user } = useAuthStore();
  
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoExpanded, setInfoExpanded] = useState(false);

  useEffect(() => {
    loadData();
    loadComments();
  }, [bandId, projectId, taskId]);

  const loadData = async () => {
    try {
      const projectResponse = await projectsAPI.getProject(bandId, projectId);
      const projectData = projectResponse.data.project;
      const taskData = projectData.tasks.find((t: any) => t.id === taskId);
      
      setProject(projectData);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await tasksAPI.getComments(bandId, projectId, taskId);
      
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
      await tasksAPI.addComment(bandId, projectId, taskId, { body });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleReply = async (commentId: string, body: string) => {
    try {
      await tasksAPI.addComment(bandId, projectId, taskId, { body, parentCommentId: commentId });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert('Failed to add reply');
    }
  };

  const handleEditComment = async (commentId: string, newBody: string) => {
    try {
      await tasksAPI.updateComment(bandId, projectId, taskId, commentId, { body: newBody });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('Failed to edit comment');
    }
  };

  const handleEditReply = async (commentId: string, replyId: string, newBody: string) => {
    try {
      await tasksAPI.updateComment(bandId, projectId, taskId, replyId, { body: newBody });
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to edit reply:', error);
      alert('Failed to edit reply');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await tasksAPI.deleteComment(bandId, projectId, taskId, commentId);
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm('Delete this reply?')) return;
    
    try {
      await tasksAPI.deleteComment(bandId, projectId, taskId, replyId);
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await tasksAPI.update(bandId, projectId, taskId, { status });
      await loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await tasksAPI.complete(bandId, projectId, taskId);
      await loadData();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;

    try {
      await tasksAPI.delete(bandId, projectId, taskId);
      router.push(`/bands/${bandId}/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      not_started: 'bg-earth-100 text-earth-800',
      in_progress: 'bg-rust-light text-rust-dark',
      blocked: 'bg-red-100 text-red-800',
      completed: 'bg-brass text-white',
    };
    return colors[status] || 'bg-earth-100 text-earth-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-earth-100 text-earth-700',
      medium: 'bg-cyber-100 text-cyber-700',
      high: 'bg-rust-light text-rust-dark',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-earth-100 text-earth-700';
  };

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

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Task not found</div>
      </div>
    );
  }

  const currentUserName = user?.displayName || `${user?.firstName} ${user?.lastName}`;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header with Actions */}
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link 
            href={`/bands/${bandId}/projects/${projectId}`} 
            className="text-sm text-rust hover:text-rust-dark mb-3 inline-block"
          >
            ← Back to Project
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-earth-900">{task.title}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-earth-700">Project: {project?.name}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>

              {task.status === 'not_started' && (
                <Button variant="primary" onClick={() => handleUpdateStatus('in_progress')}>
                  Start Task
                </Button>
              )}

              {task.status === 'in_progress' && (
                <>
                  <Button variant="primary" onClick={handleComplete}>
                    Mark Complete
                  </Button>
                  <Button variant="secondary" onClick={() => handleUpdateStatus('blocked')}>
                    Block
                  </Button>
                </>
              )}

              {task.status === 'blocked' && (
                <Button variant="primary" onClick={() => handleUpdateStatus('in_progress')}>
                  Unblock
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                href={`/bands/${bandId}/projects/${projectId}/tasks/${taskId}/edit`}
              >
                ✏️ Edit
              </Button>
              
              <Button variant="danger" size="sm" onClick={handleDelete}>
                🗑️
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content - 60/40 split */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Task Details - 60% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Description */}
            {task.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-earth-900 mb-3">Description</h2>
                <p className="text-earth-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-earth-600">Status:</span>
                  <span className="font-medium text-earth-900">{task.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Priority:</span>
                  <span className="font-medium text-earth-900">{task.priority}</span>
                </div>
                {task.assignee && (
                  <div className="flex justify-between">
                    <span className="text-earth-600">Assigned to:</span>
                    <span className="font-medium text-earth-900">
                      {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
                    </span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-earth-600">Due Date:</span>
                    <span className="font-medium text-earth-900">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-earth-600">Created:</span>
                  <span className="font-medium text-earth-900">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                {task.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-earth-600">Completed:</span>
                    <span className="font-medium text-earth-900">{new Date(task.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Sidebar - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collapsible Info Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setInfoExpanded(!infoExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-100 transition"
              >
                <span className="font-semibold text-earth-900">Task Info</span>
                <span className="text-earth-600">{infoExpanded ? '−' : '+'}</span>
              </button>
              
              {infoExpanded && (
                <div className="px-6 pb-4 text-sm text-earth-700 space-y-2 border-t border-earth-200 pt-4">
                  <p><strong>Project:</strong> {project?.name}</p>
                  <p><strong>Status:</strong> {task.status.replace('_', ' ')}</p>
                  <p><strong>Priority:</strong> {task.priority}</p>
                  {task.assignee && (
                    <p><strong>Assignee:</strong> {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}</p>
                  )}
                  {task.dueDate && (
                    <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>

            {/* Discussion Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-earth-200">
                <input
                  type="text"
                  placeholder="🔍 Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none text-sm"
                />
              </div>

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
    </div>
  );
}