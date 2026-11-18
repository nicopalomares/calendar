import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, slot, column, allItems, itemByTitle, startOf, endOf } from './helpers';

test.describe('B2 / B3: Create', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B2.1 clicking an empty slot opens the create modal', async ({ page }) => {
    await slot(page, DAYS.sun, '09:00').click();
    await expect(page.getByTestId('create-modal')).toBeVisible();
  });

  test('B2.2 modal has a title input and a type selector with exactly 3 options', async ({ page }) => {
    await slot(page, DAYS.sun, '09:00').click();
    await expect(page.getByTestId('title-input')).toBeVisible();
    const options = await page.getByTestId('type-select').locator('option').allTextContents();
    expect(options.map((o) => o.trim())).toEqual(['Event', 'Task', 'Appointment schedule']);
  });

  test('B3.1 saving "Standup" creates a 09:00–09:30 item in the Sunday 15 column', async ({ page }) => {
    await slot(page, DAYS.sun, '09:00').click();
    await page.getByTestId('title-input').fill('Standup');
    await page.getByTestId('type-select').selectOption({ label: 'Event' });
    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('create-modal')).toBeHidden();
    const item = column(page, DAYS.sun).getByTestId(/^item-/).filter({ hasText: 'Standup' });
    await expect(item).toHaveCount(1);
    expect(await startOf(item)).toBe(`${DAYS.sun}T09:00`);
    expect(await endOf(item)).toBe(`${DAYS.sun}T09:30`);
    await expect(item.getByTestId('title')).toHaveText('Standup');
  });

  test('B3.2 closing the modal without saving creates nothing', async ({ page }) => {
    await slot(page, DAYS.sun, '09:00').click();
    await page.getByTestId('title-input').fill('Never saved');
    await page.getByTestId('close-modal').click();

    await expect(page.getByTestId('create-modal')).toBeHidden();
    await expect(allItems(page)).toHaveCount(0);
    await expect(itemByTitle(page, 'Never saved')).toHaveCount(0);
  });
});
