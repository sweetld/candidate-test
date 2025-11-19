import {Task, TaskPriority, TaskStatus, TASK_PRIORITY_BADGE_CLASSES, TASK_STATUS_BADGE_CLASSES} from '../types/task';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleStatusToggle = () => {
    const statuses: Task['status'][] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    onUpdate(task.id, { status: nextStatus });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
      // Added date formatting to improve readability for the user, also guard against invalid dates
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
          {/*Corrected CSS className from "wrap-break-word" to "break-words" as expected by Tailwind */}
        <h3 className="text-lg font-semibold text-gray-800 break-words">
          {task.title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              TASK_PRIORITY_BADGE_CLASSES[task.priority]
            }`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              TASK_STATUS_BADGE_CLASSES[task.status]
            }`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{task.description}</p>

      <div className="text-sm text-gray-700 mb-3">
        <p>Due: {formatDate(task.dueDate)}</p>
        <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-2 flex-wrap">
            {task.tags.map(tag => (
              <span
                // Changed to key from the tag, rather than index, to ensure unique keys and avoid potential React warnings
                key={tag}
                className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-col sm:flex-row">
        <button
          onClick={handleStatusToggle}
          className="flex-1 bg-blue-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-blue-600 transition-colors min-h-11 sm:min-h-0"
        >
          Change Status
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-red-600 transition-colors min-h-11 sm:min-h-0"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
