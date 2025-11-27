import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

import {TaskAnalyticsDashboard} from './TaskAnalyticsDashboard';
import type {Task} from '../types/task';
import {TaskStatus} from '../types/task';

describe('TaskAnalyticsDashboard', () => {
    it('renders empty state and zero metrics when there are no tasks', () => {
        const {container} = render(<TaskAnalyticsDashboard tasks={[]}/>);

        // Total Tasks card
        const totalCardHeading = screen.getByRole('heading', {
            level: 3,
            name: /total tasks/i,
        });
        const totalCard = totalCardHeading.closest('div');
        expect(totalCard).not.toBeNull();
        const totalValue = (totalCard as HTMLElement).querySelector('p');
        expect(totalValue).not.toBeNull();
        expect(totalValue!.textContent).toBe('0');

        // Completion Rate card
        const completionCardHeading = screen.getByRole('heading', {
            level: 3,
            name: /completion rate/i,
        });
        const completionCard = completionCardHeading.closest('div');
        expect(completionCard).not.toBeNull();
        const completionValue = (completionCard as HTMLElement).querySelector('p');
        expect(completionValue).not.toBeNull();
        expect(completionValue!.textContent).toBe('0%');

        // Overdue Tasks card
        const overdueCardHeading = screen.getByRole('heading', {
            level: 3,
            name: /overdue tasks/i,
        });
        const overdueCard = overdueCardHeading.closest('div');
        expect(overdueCard).not.toBeNull();
        const overdueValue = (overdueCard as HTMLElement).querySelector('p');
        expect(overdueValue).not.toBeNull();
        expect(overdueValue!.textContent).toBe('0');

        // Tasks by Status card
        const byStatusHeading = screen.getByRole('heading', {
            level: 3,
            name: /tasks by status/i,
        });
        const byStatusCard = byStatusHeading.closest('div');
        expect(byStatusCard).not.toBeNull();
        const byStatusText = (byStatusCard as HTMLElement).textContent || '';
        expect(byStatusText).toContain('0 ToDo');
        expect(byStatusText).toContain('0 In-Progress');
        expect(byStatusText).toContain('0 Done');

        // Chart empty state message
        const emptyMsg = screen.getByText(
            /no tasks yet — add some to see analytics/i,
        );
        expect(emptyMsg).toBeTruthy();

        // We *expect* no chart in this case, but Recharts may or may not render <svg>;
        // to keep the test robust, we simply don't assert on svg here.
        const svg = container.querySelector('svg');
        expect(svg).toBeNull();
    });

    it('computes metrics correctly for mixed-status tasks and shows chart heading instead of empty state', () => {
        // Make "today" deterministic so overdue logic is stable
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2030-01-05T12:00:00.000Z'));

        const tasks: Task[] = [
            {
                id: '1',
                title: 'Todo overdue',
                description: '',
                status: TaskStatus.TODO,
                priority: 'High' as any,
                createdAt: '2030-01-01T00:00:00.000Z',
                dueDate: '2030-01-01',
                tags: [],
            },
            {
                id: '2',
                title: 'In progress future',
                description: '',
                status: TaskStatus.IN_PROGRESS,
                priority: 'Medium' as any,
                createdAt: '2030-01-02T00:00:00.000Z',
                dueDate: '2030-01-10',
                tags: [],
            },
            {
                id: '3',
                title: 'Done in past',
                description: '',
                status: TaskStatus.DONE,
                priority: 'Low' as any,
                createdAt: '2030-01-03T00:00:00.000Z',
                dueDate: '2030-01-02',
                tags: [],
            },
        ];

        render(<TaskAnalyticsDashboard tasks={tasks}/>);

        // Total tasks = 3
        const totalCardHeading = screen.getByRole('heading', {
            level: 3,
            name: /total tasks/i,
        });
        const totalCard = totalCardHeading.closest('div') as HTMLElement;
        const totalValue = totalCard.querySelector('p');
        expect(totalValue).not.toBeNull();
        expect(totalValue!.textContent).toBe('3');

        // Completion rate = 1/3 ≈ 33%
        const completionCardHeading = screen.getByRole('heading', {
            level: 3,
            name: /completion rate/i,
        });
        const completionCard = completionCardHeading.closest('div') as HTMLElement;
        const completionValue = completionCard.querySelector('p');
        expect(completionValue).not.toBeNull();
        expect(completionValue!.textContent).toBe('33%');

        // Overdue: only TODO with past due date and not DONE => 1
        const overdueCardHeading = screen.getByRole('heading', {
            level: 3,
            name: /overdue tasks/i,
        });
        const overdueCard = overdueCardHeading.closest('div') as HTMLElement;
        const overdueValue = overdueCard.querySelector('p');
        expect(overdueValue).not.toBeNull();
        expect(overdueValue!.textContent).toBe('1');

        // Tasks by status: 1 ToDo · 1 In-Progress · 1 Done
        const byStatusHeading = screen.getByRole('heading', {
            level: 3,
            name: /tasks by status/i,
        });
        const byStatusCard = byStatusHeading.closest('div') as HTMLElement;
        const byStatusText = byStatusCard.textContent || '';
        expect(byStatusText).toContain('1 ToDo');
        expect(byStatusText).toContain('1 In-Progress');
        expect(byStatusText).toContain('1 Done');

        // Chart heading should be visible
        const chartHeading = screen.getByText(/task status distribution/i);
        expect(chartHeading).toBeTruthy();

        // No empty-state message when there is data
        const emptyMsg = screen.queryByText(
            /no tasks yet — add some to see analytics/i,
        );
        expect(emptyMsg).toBeNull();

        vi.useRealTimers();
    });
});
