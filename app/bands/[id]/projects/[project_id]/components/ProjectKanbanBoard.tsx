'use client';

import Link from 'next/link';
import Button from '@/components/Button';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignee?: any;
  dueDate?: string;
  completedAt?: string;
}

interface ProjectKanbanBoardProps {
  tasks: Task[];
  bandId: string;
  projectId: string;
  onUpdateStatus: (taskId: string, status: string) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

function getPriorityColor(priority: string) {
  const colors: any = {
    low: 'bg-earth-100 text-earth-700',
    medium: 'bg-cyber-100 text-cyber-700',
    high: 'bg-rust-light text-rust-dark',
    urgent: 'bg-red-100 text-red-700',
  };
  return colors[priority] || 'bg-earth-100 text-earth-700';
}

interface TaskCardProps {
  task: Task;
  borderColor?: string;
  bandId: string;
  projectId: string;
  onUpdateStatus: (taskId: string, status: string) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

function TaskCard({ task, borderColor, bandId, projectId, onUpdateStatus, onComplete, onDelete }: TaskCardProps) {
  const borderClass = borderColor ? `border-l-4 ${borderColor}` : '';
  const titleClass = task.status === 'completed' ? 'font-medium text-earth-900 line-through' : 'font-medium text-earth-900';

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition ${borderClass}`}>
      {/* Clickable Title */}
      <Link href={`/bands/${bandId}/projects/${projectId}/tasks/${task.id}`}>
        <div className="flex items-start justify-between mb-2 cursor-pointer hover:opacity-80 transition">
          <h4 className={titleClass}>{task.title}</h4>
          {task.status === 'completed' ? (
            <span className="text-brass text-xl">✓</span>
          ) : (
            <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
        </div>
      </Link>
      
      {task.description && (
        <p className="text-sm text-earth-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      {task.assignee && (
        <p className="text-xs text-earth-600 mb-2">
          👤 {task.assignee.user.displayName || `${task.assignee.user.firstName} ${task.assignee.user.lastName}`}
        </p>
      )}
      
      {task.dueDate && (
        <p className="text-xs text-earth-600 mb-2">
          📅 {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      
      {task.completedAt && (
        <p className="text-xs text-earth-600 mb-2">
          ✓ {new Date(task.completedAt).toLocaleDateString()}
        </p>
      )}

      <div className="space-y-1 mt-3">
        {task.status === 'not_started' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onUpdateStatus(task.id, 'in_progress')}
          >
            Start Task
          </Button>
        )}
        
        {task.status === 'in_progress' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onComplete(task.id)}
          >
            Mark Complete
          </Button>
        )}
        
        {task.status === 'blocked' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onUpdateStatus(task.id, 'in_progress')}
          >
            Unblock
          </Button>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          href={`/bands/${bandId}/projects/${projectId}/tasks/${task.id}/edit`}
        >
          Edit
        </Button>
        
        <Button
          variant="danger"
          size="sm"
          fullWidth
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function ProjectKanbanBoard({
  tasks,
  bandId,
  projectId,
  onUpdateStatus,
  onComplete,
  onDelete,
}: ProjectKanbanBoardProps) {
  const tasksByStatus = {
    not_started: tasks.filter((t) => t.status === 'not_started'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    blocked: tasks.filter((t) => t.status === 'blocked'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <h3 className="text-lg font-medium text-earth-900 mb-2">No tasks yet</h3>
        <p className="text-earth-600 mb-6">Break down this project into tasks</p>
        <Button
          variant="primary"
          href={`/bands/${bandId}/projects/${projectId}/tasks/new`}
        >
          Add First Task
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-earth-900 mb-3">
          Not Started ({tasksByStatus.not_started.length})
        </h3>
        {tasksByStatus.not_started.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            bandId={bandId}
            projectId={projectId}
            onUpdateStatus={onUpdateStatus}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-earth-900 mb-3">
          In Progress ({tasksByStatus.in_progress.length})
        </h3>
        {tasksByStatus.in_progress.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            borderColor="border-rust"
            bandId={bandId}
            projectId={projectId}
            onUpdateStatus={onUpdateStatus}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-earth-900 mb-3">
          Blocked ({tasksByStatus.blocked.length})
        </h3>
        {tasksByStatus.blocked.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            borderColor="border-red-500"
            bandId={bandId}
            projectId={projectId}
            onUpdateStatus={onUpdateStatus}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-earth-900 mb-3">
          Completed ({tasksByStatus.completed.length})
        </h3>
        {tasksByStatus.completed.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            borderColor="border-brass"
            bandId={bandId}
            projectId={projectId}
            onUpdateStatus={onUpdateStatus}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}