// Switched TaskStatus and TaskPriority to enums for better type safety
export enum TaskStatus {
    TODO = "ToDo",
    IN_PROGRESS = "In-Progress",
    DONE = "Done",
}

export enum TaskPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  tags: string[];
}

/**
 * Tailwind classes for status chips/badges (used in TaskCard etc.)
 * Using Record to map priority and status to their respective color classes for better scalability
 */
export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-900',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-900',
    [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-900',
};

/**
 * Tailwind classes for priority chips/badges
 * Using Record to map priority and status to their respective color classes for better scalability
 */
export const TASK_PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'bg-emerald-100 text-emerald-900',
    [TaskPriority.MEDIUM]: 'bg-amber-100 text-amber-900',
    [TaskPriority.HIGH]: 'bg-rose-100 text-rose-900',
};

/**
 * Hex colors for charts, aligned with the same palette
 * and chosen to stand out clearly on light backgrounds.
 */
export const TASK_STATUS_CHART_COLORS: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: '#4b5563',     // gray-700
    [TaskStatus.IN_PROGRESS]: '#2563eb', // blue-600
    [TaskStatus.DONE]: '#16a34a',     // green-600
};
