import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
import { Task, TaskPriority, TaskStatus } from '../types/task';

// Mock TaskCard to simplify assertions & isolate TaskList behaviour
vi.mock('./TaskCard', () => {
    return {
        TaskCard: ({ task }: { task: Task }) => (
            <div>{task.title}</div>
        ),
    };
});

const createTask = (overrides: Partial<Task>): Task => ({
    id: overrides.id ?? Math.random().toString(),
    title: overrides.title ?? 'Task',
    description: overrides.description ?? 'Desc',
    status: overrides.status ?? TaskStatus.TODO,
    priority: overrides.priority ?? TaskPriority.MEDIUM,
    createdAt:
        overrides.createdAt ?? new Date('2025-01-01T00:00:00.000Z').toISOString(),
    dueDate: overrides.dueDate,
    tags: overrides.tags ?? [],
});

describe('TaskList', () => {
    it('shows "No tasks yet" message when there are no tasks at all', () => {
        render(
            <TaskList
                tasks={[]}
                filter="all"
                searchQuery=""
                onUpdateTask={() => {}}
                onDeleteTask={() => {}}
            />,
        );

        screen.getByText('No tasks yet');
        screen.getByText('Click "Add New Task" to create your first task!');
    });

    it('shows message when search yields no results', () => {
        const tasks = [
            createTask({ id: '1', title: 'Alpha', description: 'something' }),
        ];

        render(
            <TaskList
                tasks={tasks}
                filter="all"
                searchQuery="zzz"
                onUpdateTask={() => {}}
                onDeleteTask={() => {}}
            />,
        );

        screen.getByText('No tasks match "zzz"');
        screen.getByText('Try a different search term');
    });

    it('shows message when filter yields no results', () => {
        const tasks = [
            createTask({
                id: '1',
                title: 'Alpha',
                status: TaskStatus.TODO,
            }),
        ];

        render(
            <TaskList
                tasks={tasks}
                filter={TaskStatus.DONE}
                searchQuery=""
                onUpdateTask={() => {}}
                onDeleteTask={() => {}}
            />,
        );

        screen.getByText('No tasks with status: Done');
        screen.getByText('Try a different filter or create a new task');
    });

    it('renders tasks and allows sorting and search filtering', async () => {
        const user = userEvent.setup();
        const tasks: Task[] = [
            createTask({
                id: '1',
                title: 'Alpha',
                status: TaskStatus.TODO,
                priority: TaskPriority.LOW,
                createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
                dueDate: '2025-02-01',
            }),
            createTask({
                id: '2',
                title: 'Bravo',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH,
                createdAt: new Date('2025-01-02T00:00:00.000Z').toISOString(),
                dueDate: '2025-01-01',
            }),
            createTask({
                id: '3',
                title: 'Charlie',
                status: TaskStatus.DONE,
                priority: TaskPriority.MEDIUM,
                createdAt: new Date('2025-01-03T00:00:00.000Z').toISOString(),
            }),
        ];

        render(
            <TaskList
                tasks={tasks}
                filter="all"
                searchQuery=""
                onUpdateTask={() => {}}
                onDeleteTask={() => {}}
            />,
        );

        // All tasks rendered initially
        screen.getByText('Alpha');
        screen.getByText('Bravo');
        screen.getByText('Charlie');

        // Sorting controls
        const sortCreated = screen.getByRole('radio', { name: /created date/i });
        const sortDueDate = screen.getByRole('radio', { name: /due date/i });
        const sortPriority = screen.getByRole('radio', { name: /priority/i });
        const sortTitle = screen.getByRole('radio', { name: /title/i });
        const sortOrderButton = screen.getByRole('button', {
            name: /change sort order/i,
        });

        // Click each sort option to exercise all switch cases
        await user.click(sortCreated);
        await user.click(sortDueDate);
        await user.click(sortPriority);
        await user.click(sortTitle);

        // Toggle sort order from desc to asc
        expect(sortOrderButton.textContent?.includes('↓ Desc')).toBe(true);
        await user.click(sortOrderButton);
        expect(sortOrderButton.textContent?.includes('↑ Asc')).toBe(true);
    });

    it('applies search filter when there are matching tasks', () => {
        const tasks = [
            createTask({ id: '1', title: 'Alpha Task', description: 'foo' }),
            createTask({ id: '2', title: 'Bravo', description: 'bar' }),
        ];

        render(
            <TaskList
                tasks={tasks}
                filter="all"
                searchQuery="alpha"
                onUpdateTask={() => {}}
                onDeleteTask={() => {}}
            />,
        );

        // Only Alpha Task should be present
        screen.getByText('Alpha Task');
        expect(screen.queryByText('Bravo')).toBeNull();
    });

    it('applies status filter when filter is not "all"', () => {
        const tasks = [
            createTask({ id: '1', title: 'Todo Task', status: TaskStatus.TODO }),
            createTask({
                id: '2',
                title: 'Done Task',
                status: TaskStatus.DONE,
            }),
        ];

        render(
            <TaskList
                tasks={tasks}
                filter={TaskStatus.DONE}
                searchQuery=""
                onUpdateTask={() => {}}
                onDeleteTask={() => {}}
            />,
        );

        screen.getByText('Done Task');
        expect(screen.queryByText('Todo Task')).toBeNull();
    });
});
