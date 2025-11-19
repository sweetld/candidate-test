import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFilter } from './TaskFilter';
import { TaskStatus } from '../types/task';

describe('TaskFilter', () => {
    it('calls onSearchChange whenever the search input changes', async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn();
        const onSearchChange = vi.fn();

        render(
            <TaskFilter
                onFilterChange={onFilterChange}
                onSearchChange={onSearchChange}
            />,
        );

        const input = screen.getByLabelText('Search tasks') as HTMLInputElement;

        await user.type(input, 'abc');

        // Called at least once (initial call in useEffect with '')
        expect(onSearchChange.mock.calls.length).toBeGreaterThan(0);

        const lastCallArg =
            onSearchChange.mock.calls[onSearchChange.mock.calls.length - 1][0];
        expect(lastCallArg).toBe('abc');
    });

    it('calls onFilterChange with the correct status when a filter button is clicked', async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn();
        const onSearchChange = vi.fn();

        render(
            <TaskFilter
                onFilterChange={onFilterChange}
                onSearchChange={onSearchChange}
                activeFilter="all"
            />,
        );

        const inProgressButton = screen.getByRole('radio', {
            name: TaskStatus.IN_PROGRESS,
        });

        await user.click(inProgressButton);

        expect(onFilterChange).toHaveBeenCalledWith(TaskStatus.IN_PROGRESS);
    });

    it('reflects the activeFilter state via aria-checked and styles', () => {
        const onFilterChange = vi.fn();
        const onSearchChange = vi.fn();

        render(
            <TaskFilter
                onFilterChange={onFilterChange}
                onSearchChange={onSearchChange}
                activeFilter={TaskStatus.DONE}
            />,
        );

        const doneButton = screen.getByRole('radio', {
            name: TaskStatus.DONE,
        }) as HTMLButtonElement;

        const allButton = screen.getByRole('radio', {
            name: 'All Tasks',
        }) as HTMLButtonElement;

        // aria-checked reflects activeFilter
        expect(doneButton.getAttribute('aria-checked')).toBe('true');
        expect(allButton.getAttribute('aria-checked')).toBe('false');

        // active filter should have the "selected" classes
        expect(doneButton.className.includes('bg-blue-500')).toBe(true);
        expect(allButton.className.includes('bg-blue-500')).toBe(false);
    });
});
