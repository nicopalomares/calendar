import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, createItem, openPopup, allItems, startOf, endOf, resizeItem } from './helpers';

test.describe('B4: Edit', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B4.1 detail popup → edit shows current title and type pre-filled', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Standup', type: 'Task' });
    await openPopup(page, item);
    await page.getByTestId('popup-edit').click(); // Q3: assumed to be an edit button in the popup

    await expect(page.getByTestId('title-input')).toHaveValue('Standup');
    const selected = await page
      .getByTestId('type-select')
      .evaluate((el: HTMLSelectElement) => el.selectedOptions[0].textContent?.trim());
    expect(selected).toBe('Task');
  });

  test('B4.2 changing the title updates the item in place (day, start, duration unchanged)', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Standup' });
    await resizeItem(page, item, DAYS.sun, '10:00'); // non-default duration to prove it is preserved
    const id = await item.getAttribute('data-testid');
    const start = await startOf(item);
    const end = await endOf(item);

    await openPopup(page, item);
    await page.getByTestId('popup-edit').click();
    await page.getByTestId('title-input').fill('Daily sync');
    await page.getByTestId('save-button').click();

    await expect(allItems(page)).toHaveCount(1);
    const same = page.getByTestId(id!);
    await expect(same.getByTestId('title')).toHaveText('Daily sync');
    expect(await startOf(same)).toBe(start);
    expect(await endOf(same)).toBe(end);
  });
});
