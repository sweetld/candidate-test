import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
    STORAGE_KEY,
    loadTasksFromStorage,
    saveTasksToStorage,
    getTaskById,
    filterTasksByStatus,
} from './taskHelpers';
import {Task, TaskStatus, TaskPriority} from '../types/task';

describe('taskHelpers', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('loadTasksFromStorage', () => {
        it('returns parsed tasks from localStorage when present', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'Test task',
                    description: 'A stored task',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.MEDIUM,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    tags: ['work'],
                },
            ];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

            const result = loadTasksFromStorage();

            expect(result).toEqual(tasks);
        });

        it('returns empty array when nothing is stored', () => {
            localStorage.removeItem(STORAGE_KEY);

            const result = loadTasksFromStorage();

            expect(result).toEqual([]);
        });

        it('returns empty array and logs error when parsing fails', () => {
            // Store invalid JSON
            localStorage.setItem(STORAGE_KEY, 'not-json');

            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {
                }); // silence output

            const result = loadTasksFromStorage();

            expect(result).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error loading tasks:');
        });
    });

    describe('saveTasksToStorage', () => {
        it('saves tasks as JSON to localStorage', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'Save me',
                    description: 'Task to be saved',
                    status: TaskStatus.IN_PROGRESS,
                    priority: TaskPriority.HIGH,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    tags: ['important'],
                },
            ];

            saveTasksToStorage(tasks);

            const stored = localStorage.getItem(STORAGE_KEY);
            expect(stored).not.toBeNull();
            expect(JSON.parse(stored as string)).toEqual(tasks);
        });

        it('logs an error if localStorage.setItem throws', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'Will fail to save',
                    description: 'This save should throw',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.LOW,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    tags: [],
                },
            ];

            // Grab the actual prototype behind localStorage in this env
            const storageProto = Object.getPrototypeOf(localStorage);

            const setItemSpy = vi
                .spyOn(storageProto, 'setItem')
                .mockImplementation(() => {
                    throw new Error('storage full');
                });

            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {
                });

            saveTasksToStorage(tasks);

            expect(setItemSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error saving tasks:');
        });
    });

    describe('getTaskById', () => {
        it('returns the task with the matching id', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'First',
                    description: 'First task',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.LOW,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    tags: [],
                },
                {
                    id: '2',
                    title: 'Second',
                    description: 'Second task',
                    status: TaskStatus.DONE,
                    priority: TaskPriority.MEDIUM,
                    createdAt: '2024-01-02T00:00:00.000Z',
                    tags: ['done'],
                },
            ];

            const result = getTaskById(tasks, '2');

            expect(result).toBeDefined();
            expect(result?.id).toBe('2');
            expect(result?.title).toBe('Second');
        });

        it('returns undefined when no task matches the id', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'Only',
                    description: 'Only task',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.LOW,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    tags: [],
                },
            ];

            const result = getTaskById(tasks, 'nonexistent');

            expect(result).toBeUndefined();
        });
    });

    describe('filterTasksByStatus', () => {
        it('filters tasks by status and sorts by createdAt descending', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'Old ToDo',
                    description: 'Older todo',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.LOW,
                    createdAt: '2024-01-01T10:00:00.000Z',
                    tags: [],
                },
                {
                    id: '2',
                    title: 'Done task',
                    description: 'Completed task',
                    status: TaskStatus.DONE,
                    priority: TaskPriority.MEDIUM,
                    createdAt: '2024-01-02T10:00:00.000Z',
                    tags: ['done'],
                },
                {
                    id: '3',
                    title: 'New ToDo',
                    description: 'Newer todo',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.HIGH,
                    createdAt: '2024-01-03T10:00:00.000Z',
                    tags: ['urgent'],
                },
            ];

            const result = filterTasksByStatus(tasks, TaskStatus.TODO);

            expect(result).toHaveLength(2);
            // Should be sorted newest -> oldest
            expect(result[0].id).toBe('3');
            expect(result[1].id).toBe('1');
        });

        it('returns empty array when no tasks match the status', () => {
            const tasks: Task[] = [
                {
                    id: '1',
                    title: 'Only',
                    description: 'Only task',
                    status: TaskStatus.TODO,
                    priority: TaskPriority.LOW,
                    createdAt: '2024-01-01T10:00:00.000Z',
                    tags: [],
                },
            ];

            const result = filterTasksByStatus(tasks, TaskStatus.DONE);

            expect(result).toEqual([]);
        });
    });
});
