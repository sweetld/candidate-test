import {test, expect, type Page} from '@playwright/test';

type StatusValue = 'ToDo' | 'In-Progress' | 'Done';
type StatusInput = StatusValue | 'To Do' | 'In Progress';

async function openNewTaskForm(page: Page) {
    await page
        .getByRole('button', {name: /\+?\s*add new task/i})
        .click();
}

function normaliseStatus(status: StatusInput | undefined): StatusValue {
    if (!status) return 'ToDo';

    switch (status) {
        case 'ToDo':
        case 'To Do':
            return 'ToDo';
        case 'In-Progress':
        case 'In Progress':
            return 'In-Progress';
        case 'Done':
            return 'Done';
        default:
            return 'ToDo';
    }
}

async function createTask(
    page: Page,
    options: {
        title: string;
        description?: string;
        status?: StatusInput;
        priority?: 'Low' | 'Medium' | 'High';
        dueDate?: string; // yyyy-mm-dd
        tags?: string;
    },
) {
    const {
        title,
        description = '',
        status,
        priority = 'Medium',
        dueDate,
        tags,
    } = options;

    await openNewTaskForm(page);

    // 👇 Scope all queries to the TaskForm <form> so we don't clash with TaskFilter
    const form = page.locator('form').filter({hasText: 'Title'}).first();

    await form.getByLabel('Title').fill(title);
    await form.getByLabel('Description').fill(description);

    const statusValue = normaliseStatus(status);
    // Select by VALUE ("ToDo" | "In-Progress" | "Done")
    await form.getByLabel('Status').selectOption(statusValue);

    // Priority values are "Low" | "Medium" | "High"
    await form.getByLabel('Priority').selectOption(priority);

    if (dueDate) {
        await form.getByLabel('Due Date').fill(dueDate);
    }

    if (tags) {
        await form.getByLabel('Tags (comma separated)').fill(tags);
    }

    await form.getByRole('button', {name: /add task/i}).click();

    // Wait for form to close and card to appear
    await expect(
        page.getByRole('button', {name: /\+?\s*add new task/i}),
    ).toBeVisible();

    // Card title is an <h3> inside TaskCard
    const cardHeading = page.getByRole('heading', {level: 3, name: title});
    await expect(cardHeading).toBeVisible();

    return cardHeading;
}

test.describe('Task Management System', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/');
    });

    test('can create a new task and show it in the list', async ({page}) => {
        const title = 'Write Playwright tests';

        await createTask(page, {
            title,
            description: 'Ensure core task flows are covered',
            status: 'ToDo',
            priority: 'High',
            dueDate: '2030-01-01',
            tags: 'e2e, testing',
        });

        const card = page
            .getByRole('heading', {level: 3, name: title})
            .locator('..')
            .locator('..'); // up to the card container

        await expect(card.getByText('High')).toBeVisible();
        // TaskCard renders the enum VALUE: "ToDo" | "In-Progress" | "Done"
        await expect(card.getByText('ToDo')).toBeVisible();
        await expect(card.getByText(/Due:/i)).toBeVisible();
        await expect(card.getByText(/Created:/i)).toBeVisible();
        await expect(card.getByText('#e2e')).toBeVisible();
        await expect(card.getByText('#testing')).toBeVisible();
    });

    test('can update a task status via "Change Status" button', async ({
                                                                           page,
                                                                       }) => {
        const title = 'Status workflow task';

        await createTask(page, {
            title,
            status: 'ToDo',
            priority: 'Medium',
        });

        const cardRoot = page
            .getByRole('heading', {level: 3, name: title})
            .locator('..')
            .locator('..');

        const statusBadge = cardRoot.getByText(/ToDo|In-Progress|Done/);
        const changeStatusButton = cardRoot.getByRole('button', {
            name: /change status/i,
        });

        await expect(statusBadge).toHaveText(/ToDo/);

        // ToDo -> In-Progress
        await changeStatusButton.click();
        await expect(statusBadge).toHaveText(/In-Progress/);

        // In-Progress -> Done
        await changeStatusButton.click();
        await expect(statusBadge).toHaveText(/Done/);

        // Done -> ToDo (wraps)
        await changeStatusButton.click();
        await expect(statusBadge).toHaveText(/ToDo/);
    });

    test('can delete a task', async ({page}) => {
        const title = 'Task to delete';

        await createTask(page, {
            title,
            status: 'ToDo',
        });

        const cardRoot = page
            .getByRole('heading', {level: 3, name: title})
            .locator('..')
            .locator('..');

        await cardRoot.getByRole('button', {name: /delete/i}).click();

        await expect(
            page.getByRole('heading', {level: 3, name: title}),
        ).toHaveCount(0);
    });

    test('can filter tasks by status using TaskFilter', async ({page}) => {
        await createTask(page, {
            title: 'Todo Task',
            status: 'ToDo',
        });

        await createTask(page, {
            title: 'In Progress Task',
            status: 'In-Progress',
        });

        await createTask(page, {
            title: 'Done Task',
            status: 'Done',
        });

        const filterGroup = page.getByRole('radiogroup', {
            name: /filter tasks by status/i,
        });

        // Show only "ToDo"
        await filterGroup.getByRole('radio', {name: 'ToDo'}).click();
        await expect(page.getByText('Todo Task')).toBeVisible();
        await expect(page.getByText('In Progress Task')).toBeHidden();
        await expect(page.getByText('Done Task')).toBeHidden();

        // Show only "In-Progress"
        await filterGroup.getByRole('radio', {name: 'In-Progress'}).click();
        await expect(page.getByText('In Progress Task')).toBeVisible();
        await expect(page.getByText('Todo Task')).toBeHidden();
        await expect(page.getByText('Done Task')).toBeHidden();

        // Show only "Done"
        await filterGroup.getByRole('radio', {name: 'Done'}).click();
        await expect(page.getByText('Done Task')).toBeVisible();
        await expect(page.getByText('Todo Task')).toBeHidden();
        await expect(page.getByText('In Progress Task')).toBeHidden();

        // Back to all
        await filterGroup.getByRole('radio', {name: 'All Tasks'}).click();
        await expect(page.getByText('Todo Task')).toBeVisible();
        await expect(page.getByText('In Progress Task')).toBeVisible();
        await expect(page.getByText('Done Task')).toBeVisible();
    });

    test('can search tasks by title and description', async ({page}) => {
        await createTask(page, {
            title: 'Frontend work',
            description: 'Implement UI',
            status: 'ToDo',
        });

        await createTask(page, {
            title: 'Backend work',
            description: 'Implement API',
            status: 'ToDo',
        });

        const searchInput = page
            .getByLabel('Search tasks')
            .or(page.getByPlaceholder('Search tasks...'));

        await searchInput.fill('frontend');

        await expect(page.getByText('Frontend work')).toBeVisible();
        await expect(page.getByText('Backend work')).toBeHidden();

        // Clear & search by description
        await searchInput.fill('');
        await searchInput.fill('API');

        await expect(page.getByText('Backend work')).toBeVisible();
        await expect(page.getByText('Frontend work')).toBeHidden();
    });

    test('analytics dashboard updates total tasks when adding a task', async ({
                                                                                  page,
                                                                              }) => {
        // Wait for the "Total Tasks" metric card to be visible
        const totalHeading = page.getByRole('heading', {
            level: 3,
            name: 'Total Tasks',
        });
        await expect(totalHeading).toBeVisible();

        // Card container is the parent of the <h3>
        const totalCard = totalHeading.locator('..');

        const getTotal = async () => {
            // There is exactly one <p> in this card
            const text = await totalCard.locator('p').first().innerText();
            const digits = text.replace(/[^\d]/g, '');
            return digits ? Number(digits) : 0;
        };

        const before = await getTotal();

        await createTask(page, {
            title: 'Analytics task',
            status: 'ToDo',
        });

        // Wait for the metric to actually increase
        await expect(async () => {
            const after = await getTotal();
            expect(after).toBeGreaterThan(before);
        }).toPass();
    });

    test('full end-to-end flow with persistence, filtering, search and analytics', async ({ page }) => {
        // Helper to read a metric card value by its <h3> heading text
        const getMetricValue = async (headingText: string) => {
            const heading = page.getByRole('heading', {
                level: 3,
                name: headingText,
            });
            await expect(heading).toBeVisible();

            const card = heading.locator('..'); // parent card
            const text = await card.locator('p').first().innerText();
            const digits = text.replace(/[^\d]/g, '');
            return digits ? Number(digits) : 0;
        };

        // Capture initial total (in case the app ever has seeded tasks)
        const initialTotal = await getMetricValue('Total Tasks');

        // Create three tasks with different statuses
        const titles = {
            todo: 'E2E Scenario - ToDo',
            inProgress: 'E2E Scenario - In Progress',
            done: 'E2E Scenario - Done',
        };

        await createTask(page, {
            title: titles.todo,
            description: 'End-to-end flow: ToDo task',
            status: 'ToDo',
            priority: 'High',
            dueDate: '2030-01-01',
            tags: 'e2e, todo',
        });

        await createTask(page, {
            title: titles.inProgress,
            description: 'End-to-end flow: In-Progress task',
            status: 'In-Progress',
            priority: 'Medium',
            dueDate: '2030-01-02',
            tags: 'e2e, in-progress',
        });

        await createTask(page, {
            title: titles.done,
            description: 'End-to-end flow: Done task',
            status: 'Done',
            priority: 'Low',
            dueDate: '2030-01-03',
            tags: 'e2e, done',
        });

        // All three cards should be visible
        await expect(
            page.getByRole('heading', { level: 3, name: titles.todo }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.inProgress }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.done }),
        ).toBeVisible();

        // Analytics: total tasks should have increased by 3
        const totalAfterCreate = await getMetricValue('Total Tasks');
        expect(totalAfterCreate).toBe(initialTotal + 3);

        // Reload the page to verify persistence via localStorage
        await page.reload();

        // After reload, the same tasks should still be present
        await expect(
            page.getByRole('heading', { level: 3, name: titles.todo }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.inProgress }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.done }),
        ).toBeVisible();

        const totalAfterReload = await getMetricValue('Total Tasks');
        expect(totalAfterReload).toBe(totalAfterCreate);

        // Use TaskFilter to show only Done tasks
        const filterGroup = page.getByRole('radiogroup', {
            name: /filter tasks by status/i,
        });

        await filterGroup.getByRole('radio', { name: 'Done' }).click();

        await expect(
            page.getByRole('heading', { level: 3, name: titles.done }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.todo }),
        ).toBeHidden();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.inProgress }),
        ).toBeHidden();

        // Back to all tasks
        await filterGroup.getByRole('radio', { name: 'All Tasks' }).click();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.todo }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.inProgress }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.done }),
        ).toBeVisible();

        // Use the search box to narrow down by title
        const searchInput = page
            .getByLabel('Search tasks')
            .or(page.getByPlaceholder('Search tasks...'));

        await searchInput.fill('In Progress');

        await expect(
            page.getByRole('heading', { level: 3, name: titles.inProgress }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.todo }),
        ).toBeHidden();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.done }),
        ).toBeHidden();

        // Clear search to restore list
        await searchInput.fill('');
        await expect(
            page.getByRole('heading', { level: 3, name: titles.todo }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.inProgress }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { level: 3, name: titles.done }),
        ).toBeVisible();
    });

});
