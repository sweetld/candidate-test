import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TaskForm} from './TaskForm';
import {Task, TaskPriority, TaskStatus} from '../types/task';

describe('TaskForm', () => {
    it('submits a new task with form values and then resets the form (create mode)', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TaskForm onSubmit={onSubmit}/>);

        const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
        const descriptionInput = screen.getByLabelText(
            'Description',
        ) as HTMLTextAreaElement;
        const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
        const prioritySelect = screen.getByLabelText(
            'Priority',
        ) as HTMLSelectElement;
        const dueDateInput = screen.getByLabelText('Due Date') as HTMLInputElement;
        const tagsInput = screen.getByLabelText(
            'Tags (comma separated)',
        ) as HTMLInputElement;

        await user.type(titleInput, 'My Task');
        await user.type(descriptionInput, 'Some description');
        await user.selectOptions(statusSelect, TaskStatus.IN_PROGRESS);
        await user.selectOptions(prioritySelect, TaskPriority.HIGH);
        await user.type(dueDateInput, '2025-02-01');
        await user.type(tagsInput, 'work, personal');

        await user.click(
            screen.getByRole('button', {name: /add task/i}),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);

        const submittedArg = onSubmit.mock.calls[0][0];
        expect(submittedArg).toEqual({
            title: 'My Task',
            description: 'Some description',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            dueDate: '2025-02-01',
            tags: [ "work", "personal"],
        });

        // After submit, form should reset (because no initialTask)
        expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
            '',
        );
        expect(
            (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
        ).toBe('');
        // status reset to TODO
        expect(
            (screen.getByLabelText('Status') as HTMLSelectElement).value,
        ).toBe(TaskStatus.TODO);
        // priority reset to MEDIUM
        expect(
            (screen.getByLabelText('Priority') as HTMLSelectElement).value,
        ).toBe(TaskPriority.MEDIUM);
        // due date cleared
        expect(
            (screen.getByLabelText('Due Date') as HTMLInputElement).value,
        ).toBe('');
        // tags reset; tags state becomes [""] -> join(', ') === ''
        expect(
            (screen.getByLabelText(
                'Tags (comma separated)',
            ) as HTMLInputElement).value,
        ).toBe('');
    });

    it('prefills with initialTask, shows "Update Task" and does not reset after submit (edit mode)', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        const onCancel = vi.fn();

        const initialTask: Task = {
            id: '1',
            title: 'Existing Task',
            description: 'Existing description',
            status: TaskStatus.DONE,
            priority: TaskPriority.LOW,
            createdAt: new Date().toISOString(),
            dueDate: '2025-03-01',
            tags: ['existing', 'tag'],
        };

        render(
            <TaskForm
                onSubmit={onSubmit}
                initialTask={initialTask}
                onCancel={onCancel}
            />,
        );

        // Prefilled values
        (screen.getByLabelText('Title') as HTMLInputElement).value === 'Existing Task';
        (screen.getByLabelText('Description') as HTMLTextAreaElement).value === 'Existing description';
        (screen.getByLabelText('Status') as HTMLSelectElement).value === TaskStatus.DONE;
        (screen.getByLabelText('Priority') as HTMLSelectElement).value === TaskPriority.LOW;
        (screen.getByLabelText('Due Date') as HTMLInputElement).value === '2025-03-01';
        (screen.getByLabelText('Tags (comma separated)',) as HTMLInputElement).value === 'existing, tag';

        // Button text reflects edit mode
        screen.getByRole('button', {name: /update task/i});

        // Cancel button is rendered and works
        const cancelButton = screen.getByRole('button', {name: /cancel/i});
        await user.click(cancelButton);
        expect(onCancel).toHaveBeenCalledTimes(1);

        // Clear due date to trigger the "dueDate || undefined" branch
        const dueDateInput = screen.getByLabelText('Due Date') as HTMLInputElement;
        dueDateInput.value = '';
        await user.click(
            screen.getByRole('button', {name: /update task/i}),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
        const submittedArg = onSubmit.mock.calls[0][0];
        expect(submittedArg.dueDate).toBe("2025-03-01");

        // In edit mode, form is not reset; title remains as initialTask.title
        expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
            'Existing Task',
        );
    });
});
