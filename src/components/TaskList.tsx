import { Task, TaskStatus, TaskPriority } from '../types/task';
import { TaskCard } from './TaskCard';
import {useMemo, useState} from 'react';

interface TaskListProps {
  tasks: Task[];
  filter: TaskStatus | 'all';
  searchQuery: string;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList = ({
  tasks,
  searchQuery,
  filter,
  onUpdateTask,
  onDeleteTask,
}: TaskListProps) => {
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'dueDate' | 'priority' | 'title'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Converted filtering, querying and sorting logic to use useMemo for performance optimization
    const displayableTasks = useMemo(() => {
        let filteredTasks = tasks;

        if (filter !== 'all') {
            filteredTasks = filteredTasks.filter((task) => task.status === filter);
        }

        if (searchQuery) {
            // Made search case-insensitive
            const query = searchQuery.toLowerCase();
            filteredTasks = filteredTasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query)
            );
        }

        return [...filteredTasks].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'createdAt':
                    comparison =
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'dueDate': {
                    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    comparison = aDate - bDate;
                    break;
                }
                case 'priority': {
                    const priorityOrder: Record<TaskPriority, number> = {
                        [TaskPriority.HIGH]: 3,
                        [TaskPriority.MEDIUM]: 2,
                        [TaskPriority.LOW]: 1,
                    };
                    // Sort was reversed compared to the others
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                }
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }, [tasks, filter, searchQuery, sortBy, sortOrder]);

  if (displayableTasks.length === 0) {
    let message = 'No tasks found';
    let suggestion = '';

    if (tasks.length === 0) {
      message = 'No tasks yet';
      suggestion = 'Click "Add New Task" to create your first task!';
    } else if (searchQuery) {
      message = `No tasks match "${searchQuery}"`;
      suggestion = 'Try a different search term';
    } else if (filter !== 'all') {
      message = `No tasks with status: ${filter}`;
      suggestion = 'Try a different filter or create a new task';
    }

    return (
      <div className="text-center py-12 text-gray-700" role="status" aria-live="polite">
        <p className="text-lg font-medium mb-2">{message}</p>
        <p className="text-sm">{suggestion}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sorting controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="sort-label">
            <button
              onClick={() => setSortBy('createdAt')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'createdAt'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              role="radio"
              aria-checked={sortBy === 'createdAt'}
            >
              Created Date
            </button>
            <button
              onClick={() => setSortBy('dueDate')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'dueDate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              role="radio"
              aria-checked={sortBy === 'dueDate'}
            >
              Due Date
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'priority'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              role="radio"
              aria-checked={sortBy === 'priority'}
            >
              Priority
            </button>
            <button
              onClick={() => setSortBy('title')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'title'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              role="radio"
              aria-checked={sortBy === 'title'}
            >
              Title
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              aria-label={
                  sortOrder === 'asc'
                      ? 'Change sort order to descending'
                      : 'Change sort order to ascending'
              }
              aria-pressed={sortOrder === 'desc'}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayableTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};
