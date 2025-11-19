import {Task} from '../types/task';

export const STORAGE_KEY = 'tasks';

export const loadTasksFromStorage = (): Task[] => {
  try {
    // Fix for localStorage returning null, and therefore no seed tasks being loaded
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const getTaskById = (tasks: Task[], id: string): Task | undefined => {
  return tasks.find((task) => task.id === id);
};

export const filterTasksByStatus = (tasks: Task[], status: string) => {
  const filtered = tasks.filter((task) => task.status === status);
  // Just inlined the sorting by createdAt here for simplicity
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
