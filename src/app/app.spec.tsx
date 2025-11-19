import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './app';
import { Task, TaskStatus, TaskPriority } from '../types/task';

// ----- Mocks for useTasks -----
const mockUseTasksState = {
    tasks: [] as Task[],
    loading: false,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
};

vi.mock('../hooks/useTasks', () => ({
    useTasks: () => mockUseTasksState,
}));

// ----- Mock child components to isolate App -----
vi.mock('../components/TaskAnalyticsDashboard', () => ({
    TaskAnalyticsDashboard: ({
                                 onStatusFilterChange,
                             }: {
        onStatusFilterChange: (status: TaskStatus | 'all') => void;
    }) => (
        <div>
            <div>Analytics Dashboard</div>
            <button
                onClick={() => onStatusFilterChange(TaskStatus.DONE)}
            >
                Set Filter Done From Analytics
            </button>
        </div>
    ),
}));

vi.mock('../components/TaskForm', () => ({
    TaskForm: ({
                   onSubmit,
                   onCancel,
               }: {
        onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
        onCancel?: () => void;
    }) => (
        <div>
            <div>Mock Task Form</div>
            <button
                onClick={() =>
                    onSubmit({
                        title: 'New Task',
                        description: 'From form',
                        status: TaskStatus.TODO,
                        priority: TaskPriority.MEDIUM,
                        dueDate: undefined,
                        tags: [],
                    })
                }
            >
                Submit Task
            </button>
            {onCancel && (
                <button onClick={onCancel}>Cancel Form</button>
            )}
        </div>
    ),
}));

vi.mock('../components/TaskFilter', () => ({
    TaskFilter: ({
                     onFilterChange,
                     onSearchChange,
                     activeFilter,
                 }: {
        onFilterChange: (status: TaskStatus | 'all') => void;
        onSearchChange: (q: string) => void;
        activeFilter: TaskStatus | 'all';
    }) => (
        <div>
            <div>Task Filter - {activeFilter}</div>
            <button onClick={() => onFilterChange('all')}>Set Filter All</button>
            <button onClick={() => onFilterChange(TaskStatus.TODO)}>
                Set Filter Todo
            </button>
            <button onClick={() => onSearchChange('hello')}>
                Set Search "hello"
            </button>
        </div>
    ),
}));

vi.mock('../components/TaskList', () => ({
    TaskList: ({
                   filter,
                   searchQuery,
               }: {
        filter: TaskStatus | 'all';
        searchQuery: string;
    }) => (
        <div>
            <div>Task List</div>
            <div>Current Filter: {filter}</div>
            <div>Current Search: {searchQuery}</div>
        </div>
    ),
}));

describe('App', () => {
    beforeEach(() => {
        mockUseTasksState.tasks = [];
        mockUseTasksState.loading = false;
        mockUseTasksState.addTask.mockReset();
        mockUseTasksState.updateTask.mockReset();
        mockUseTasksState.deleteTask.mockReset();
    });

    it('shows loading state when loading is true', () => {
        mockUseTasksState.loading = true;

        render(<App />);

        screen.getByText('Loading tasks...');
    });

    it('toggles the task form and calls addTask on submit', async () => {
        const user = userEvent.setup();
        mockUseTasksState.loading = false;

        render(<App />);

        const addButton = screen.getByRole('button', {
            name: /\+ Add New Task/i,
        });

        // Show form
        await user.click(addButton);
        screen.getByText('Mock Task Form');

        // Submit the mocked form
        await user.click(
            screen.getByRole('button', { name: /submit task/i }),
        );

        expect(mockUseTasksState.addTask).toHaveBeenCalledTimes(1);
        const submitted = mockUseTasksState.addTask.mock.calls[0][0];
        expect(submitted.title).toBe('New Task');

        // Form should be hidden again
        expect(screen.queryByText('Mock Task Form')).toBeNull();
    });

    it('allows cancelling the form', async () => {
        const user = userEvent.setup();

        render(<App />);

        const addButton = screen.getByRole('button', {
            name: /\+ Add New Task/i,
        });
        await user.click(addButton);

        screen.getByText('Mock Task Form');

        const cancelButton = screen.getByRole('button', {
            name: /cancel form/i,
        });
        await user.click(cancelButton);

        expect(screen.queryByText('Mock Task Form')).toBeNull();
    });

    it('wires filter and search state between analytics, filter, and task list', async () => {
        const user = userEvent.setup();

        render(<App />);

        // Initial filter is 'all'
        screen.getByText('Task Filter - all');
        screen.getByText('Current Filter: all');
        screen.getByText('Current Search:');

        // Analytics dashboard sets filter to DONE
        await user.click(
            screen.getByRole('button', {
                name: /set filter done from analytics/i,
            }),
        );

        screen.getByText(`Task Filter - ${TaskStatus.DONE}`);
        screen.getByText(`Current Filter: ${TaskStatus.DONE}`);

        // TaskFilter can change filter to TODO
        await user.click(
            screen.getByRole('button', {
                name: /set filter todo/i,
            }),
        );
        screen.getByText(`Task Filter - ${TaskStatus.TODO}`);
        screen.getByText(`Current Filter: ${TaskStatus.TODO}`);

        // TaskFilter can change search query
        await user.click(
            screen.getByRole('button', {
                name: /set search "hello"/i,
            }),
        );
        screen.getByText('Current Search: hello');
    });
});
