import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, createItem, openPopup, allItems, startOf, endOf, resizeItem } from './helpers';

test.describe('B4: Edit', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B4.1 detail popup → clicking the title opens edit with current title and type pre-filled', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Standup', type: 'Task' });
    await openPopup(page, item);
    await page.getByTestId('popup-title').click(); // Q3: editing is opened by clicking the title

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
    await page.getByTestId('popup-title').click();
    await page.getByTestId('title-input').fill('Daily sync');
    await page.getByTestId('save-button').click();

    await expect(allItems(page)).toHaveCount(1);
    const same = page.getByTestId(id!);
    await expect(same.getByTestId('title')).toHaveText('Daily sync');
    expect(await startOf(same)).toBe(start);
    expect(await endOf(same)).toBe(end);
  });

  test('B4.3 Event, Task and Appointment schedule have distinct colors', async ({ page }) => {
    const types = ['Event', 'Task', 'Appointment schedule'] as const;
    const colors: string[] = [];
    for (const [i, type] of types.entries()) {
      const item = await createItem(page, { day: DAYS.sun, time: `${String(9 + i * 2).padStart(2, '0')}:00`, title: type, type });
      colors.push(await item.evaluate((el) => getComputedStyle(el).backgroundColor));
    }
    expect(new Set(colors).size).toBe(3);
  });
});
