import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, beforeEach} from 'vitest';

import {useTasks} from './useTasks';
import type {Task, TaskStatus, TaskPriority} from '../types/task';
import {STORAGE_KEY} from '../utils/taskHelpers';

describe('useTasks hook (no mocks)', () => {
    beforeEach(() => {
        // Reset storage before each test so they are isolated
        localStorage.clear();
    });

    it('loads tasks from storage on mount and sets loading=false', () => {
        const storedTasks: Task[] = [
            {
                id: '1',
                title: 'Stored task',
                description: '',
                status: 'ToDo' as TaskStatus.TODO,
                priority: 'Medium' as TaskPriority.MEDIUM,
                createdAt: '2024-01-01T00:00:00.000Z',
                tags: [],
            },
        ];

        // Arrange: seed localStorage the same way taskHelpers would
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedTasks));

        const {result} = renderHook(() => useTasks());

        expect(result.current.tasks).toEqual(storedTasks);
        expect(result.current.loading).toBe(false);
    });

    it('addTask adds a new task and persists to storage', () => {
        // start with empty storage
        localStorage.removeItem(STORAGE_KEY);

        const {result} = renderHook(() => useTasks());

        act(() => {
            result.current.addTask({
                title: 'New Task',
                description: 'From hook test',
                status: 'ToDo' as any,
                priority: 'High' as any,
                dueDate: '2030-01-01',
                tags: ['test'],
            } as any); // hook fills id/createdAt
        });

        const {tasks} = result.current;
        expect(tasks).toHaveLength(1);

        const [task] = tasks;
        expect(task.title).toBe('New Task');
        expect(typeof task.id).toBe('string');
        expect(task.id).not.toBe('');
        expect(typeof task.createdAt).toBe('string');

        // Assert that tasks were persisted to storage
        const raw = localStorage.getItem(STORAGE_KEY);
        expect(raw).toBeTruthy();

        const saved = JSON.parse(raw!) as Task[];
        expect(saved).toEqual(tasks);
    });

    it('updateTask updates the correct task and persists', () => {
        const initialTasks: Task[] = [
            {
                id: '1',
                title: 'Old title',
                description: '',
                status: 'ToDo' as any,
                priority: 'Medium' as any,
                createdAt: '2024-01-01T00:00:00.000Z',
                tags: [],
            },
            {
                id: '2',
                title: 'Another task',
                description: '',
                status: 'ToDo' as any,
                priority: 'Low' as any,
                createdAt: '2024-01-02T00:00:00.000Z',
                tags: [],
            },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));

        const {result} = renderHook(() => useTasks());

        act(() => {
            result.current.updateTask('1', {title: 'Updated title'});
        });

        const {tasks} = result.current;

        expect(tasks).toHaveLength(2);
        const updated = tasks.find((t) => t.id === '1')!;
        const unchanged = tasks.find((t) => t.id === '2')!;

        expect(updated.title).toBe('Updated title');
        expect(unchanged.title).toBe('Another task');

        // Storage should reflect the same state as in memory
        const raw = localStorage.getItem(STORAGE_KEY);
        expect(raw).toBeTruthy();

        const saved = JSON.parse(raw!) as Task[];
        expect(saved).toEqual(tasks);
    });

    it('deleteTask removes the task and persists', () => {
        const initialTasks: Task[] = [
            {
                id: '1',
                title: 'Task to remove',
                description: '',
                status: 'ToDo' as any,
                priority: 'Medium' as any,
                createdAt: '2024-01-01T00:00:00.000Z',
                tags: [],
            },
            {
                id: '2',
                title: 'Task to keep',
                description: '',
                status: 'ToDo' as any,
                priority: 'Low' as any,
                createdAt: '2024-01-02T00:00:00.000Z',
                tags: [],
            },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));

        const {result} = renderHook(() => useTasks());

        act(() => {
            result.current.deleteTask('1');
        });

        const {tasks} = result.current;

        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe('2');
        expect(tasks[0].title).toBe('Task to keep');

        const raw = localStorage.getItem(STORAGE_KEY);
        expect(raw).toBeTruthy();

        const saved = JSON.parse(raw!) as Task[];
        expect(saved).toEqual(tasks);
    });
});
