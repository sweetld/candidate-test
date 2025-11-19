import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/taskHelpers';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedTasks = loadTasksFromStorage();
    setTasks(loadedTasks);
    setLoading(false);
  }, []);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, task];
      saveTasksToStorage(updatedTasks);    // ✅ persist new tasks
      return updatedTasks;
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    // Use functional state update to ensure we have the latest state
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      saveTasksToStorage(updatedTasks);
      return updatedTasks;
    })
  };

  const deleteTask = (id: string) => {
    // Use functional state update to ensure we have the latest state, also fixes issue with mutating state directly
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== id);
      saveTasksToStorage(updatedTasks);
      return updatedTasks;
    });
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
  };
};
