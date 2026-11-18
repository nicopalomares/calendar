import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, createItem, resizeItem, startOf, endOf, timeRange, slot } from './helpers';

test.describe('B6: Resize', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B6.1 dragging the bottom edge of a 09:00 item to 11:00 ends it at 11:00, start unchanged', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Resize' });
    await resizeItem(page, item, DAYS.sun, '11:00');
    expect(await startOf(item)).toBe(`${DAYS.sun}T09:00`);
    expect(await endOf(item)).toBe(`${DAYS.sun}T11:00`);
  });

  test('B6.2 the rendered height matches the new duration', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Resize' });
    await resizeItem(page, item, DAYS.sun, '11:00');
    const hourH = (await slot(page, DAYS.sun, '09:00').boundingBox())!.height;
    const box = (await item.boundingBox())!;
    expect(Math.abs(box.height - 2 * hourH)).toBeLessThanOrEqual(2);
  });

  test('B6.3 resizing snaps to the nearest 15 minutes', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Snap' });
    await resizeItem(page, item, DAYS.sun, '10:40');
    expect(await endOf(item)).toBe(`${DAYS.sun}T10:45`);

    await resizeItem(page, item, DAYS.sun, '10:20');
    expect(await endOf(item)).toBe(`${DAYS.sun}T10:15`);
  });

  test('B6.4 the displayed time range updates (e.g. "9 – 11am")', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Resize' });
    expect(await timeRange(item)).toBe('9 – 9:30am');
    await resizeItem(page, item, DAYS.sun, '11:00');
    expect(await timeRange(item)).toBe('9 – 11am');
  });
});
