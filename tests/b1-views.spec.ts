import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, createItem, allItems, startOf, column } from './helpers';

test.describe('B1: Views', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B1.1 week view shows 7 day columns and one row per hour', async ({ page }) => {
    await expect(page.locator('[data-testid^="day-column-"]')).toHaveCount(7);
    for (const day of Object.values(DAYS)) await expect(column(page, day)).toBeVisible();

    // 24 hourly rows × 7 days
    await expect(page.locator('[data-testid^="slot-"]')).toHaveCount(7 * 24);
    for (let h = 0; h < 24; h++) {
      const hh = String(h).padStart(2, '0');
      await expect(page.getByTestId(`slot-${DAYS.sun}-${hh}:00`)).toHaveCount(1);
    }
  });

  test('B1.2 Day shows a single column for the selected day; Week shows 7 again', async ({ page }) => {
    await page.getByTestId('view-toggle-day').click();
    await expect(page.locator('[data-testid^="day-column-"]')).toHaveCount(1);
    await expect(column(page, DAYS.wed)).toBeVisible(); // selected day = today (fixed clock)

    await page.getByTestId('view-toggle-week').click();
    await expect(page.locator('[data-testid^="day-column-"]')).toHaveCount(7);
  });

  test('B1.3 items created in one view are visible in the other, same day and time', async ({ page }) => {
    // created in week view → visible in day view
    const a = await createItem(page, { day: DAYS.wed, time: '09:00', title: 'From week' });
    const aId = await a.getAttribute('data-testid');
    await page.getByTestId('view-toggle-day').click();
    const aInDay = page.getByTestId(aId!);
    await expect(aInDay).toBeVisible();
    expect(await startOf(aInDay)).toBe(`${DAYS.wed}T09:00`);

    // created in day view → visible in week view
    const b = await createItem(page, { day: DAYS.wed, time: '15:00', title: 'From day' });
    const bId = await b.getAttribute('data-testid');
    await page.getByTestId('view-toggle-week').click();
    await expect(allItems(page)).toHaveCount(2);
    expect(await startOf(page.getByTestId(bId!))).toBe(`${DAYS.wed}T15:00`);
    await expect(column(page, DAYS.wed).getByTestId(bId!)).toBeVisible();
  });
});
