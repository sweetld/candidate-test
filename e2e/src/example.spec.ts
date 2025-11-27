import {test, expect} from '@playwright/test';

test.describe('App shell', () => {
    test('shows Task Management System heading', async ({page}) => {
        await page.goto('/');

        await expect(
            page.getByRole('heading', {
                level: 1,
                name: /task management system/i,
            }),
        ).toBeVisible();

        await expect(
            page.getByText(/organize and track your tasks efficiently/i),
        ).toBeVisible();
    });
});
