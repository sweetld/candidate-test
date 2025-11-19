import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import { Task, TaskPriority, TaskStatus } from '../types/task';

const baseTask: Task = {
    id: '1',
    title: 'T',
    description: 'D',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date().toISOString(),
    tags: ['x', 'y'],
};

describe('TaskCard', () => {
    it('advances todo -> in-progress when Change Status is clicked', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();
        const onDelete = vi.fn();

        render(<TaskCard task={baseTask} onUpdate={onUpdate} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: /change status/i }));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith('1', {
            status: TaskStatus.IN_PROGRESS,
        });
    });

    it('advances in-progress -> done', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(
            <TaskCard
                task={{ ...baseTask, status: TaskStatus.IN_PROGRESS }}
                onUpdate={onUpdate}
                onDelete={() => {}}
            />,
        );

        await user.click(screen.getByRole('button', { name: /change status/i }));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith('1', {
            status: TaskStatus.DONE,
        });
    });

    it('advances done -> todo (wraps around)', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(
            <TaskCard
                task={{ ...baseTask, status: TaskStatus.DONE }}
                onUpdate={onUpdate}
                onDelete={() => {}}
            />,
        );

        await user.click(screen.getByRole('button', { name: /change status/i }));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith('1', {
            status: TaskStatus.TODO,
        });
    });

    it('calls onDelete with the task id when Delete is clicked', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();
        const onDelete = vi.fn();

        render(<TaskCard task={baseTask} onUpdate={onUpdate} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: /delete/i }));

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('shows "No due date" when dueDate is missing', () => {
        const onUpdate = vi.fn();
        const onDelete = vi.fn();

        render(
            <TaskCard
                task={{ ...baseTask, dueDate: undefined }}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />,
        );

        expect(screen.getByText(/Due: No due date/i)).not.toBeNull();
    });

    it('renders the raw due date string for an invalid date', () => {
        const onUpdate = vi.fn();
        const onDelete = vi.fn();

        render(
            <TaskCard
                task={{ ...baseTask, dueDate: 'not-a-valid-date' }}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />,
        );

        // Exercises the isNaN(date.getTime()) branch in formatDate
        expect(
            screen.getByText(/Due: not-a-valid-date/i),
        ).not.toBeNull();
    });

    it('renders formatted due date, created date and tags when provided', () => {
        const onUpdate = vi.fn();
        const onDelete = vi.fn();

        const dueDate = '2025-02-01T00:00:00.000Z';
        const createdAt = '2025-01-15T12:00:00.000Z';

        const expectedDue = new Date(dueDate).toLocaleDateString();
        const expectedCreated = new Date(createdAt).toLocaleDateString();

        const taskWithDatesAndTags: Task = {
            ...baseTask,
            id: '2',
            title: 'Task with dates and tags',
            dueDate,
            createdAt,
            tags: ['work', 'urgent'],
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
        };

        render(
            <TaskCard
                task={taskWithDatesAndTags}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />,
        );

        // Valid-date branch of formatDate
        expect(
            screen.getByText(`Due: ${expectedDue}`),
        ).not.toBeNull();
        // Created date uses toLocaleDateString directly
        expect(
            screen.getByText(`Created: ${expectedCreated}`),
        ).not.toBeNull();

        // Tags block is rendered
        expect(screen.getByText('#work')).not.toBeNull();
        expect(screen.getByText('#urgent')).not.toBeNull();

        // Priority & status labels (indirectly exercising badge class lookup)
        expect(screen.getByText(TaskPriority.HIGH)).not.toBeNull();
        expect(screen.getByText(TaskStatus.IN_PROGRESS)).not.toBeNull();
    });

    it('does not render tags section when tags array is empty', () => {
        const onUpdate = vi.fn();
        const onDelete = vi.fn();

        render(
            <TaskCard
                task={{ ...baseTask, id: 'no-tags', tags: [] }}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />,
        );

        // Original tags from baseTask should not appear
        expect(screen.queryByText('#x')).toBeNull();
        expect(screen.queryByText('#y')).toBeNull();
    });
});
