import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, createItem, moveItem, startOf, endOf, column } from './helpers';

test.describe('B5: Move', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B5.1 dragging Sunday 09:00 → Tuesday 14:00 places the item on Tuesday at 14:00', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Move me' });
    await moveItem(page, item, DAYS.tue, '14:00');

    expect(await startOf(item)).toBe(`${DAYS.tue}T14:00`);
    await expect(column(page, DAYS.tue).getByTestId((await item.getAttribute('data-testid'))!)).toBeVisible();
  });

  test('B5.2 the item keeps its original duration after moving', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Long', durationMin: 90 });
    expect(await endOf(item)).toBe(`${DAYS.sun}T10:30`);
    await moveItem(page, item, DAYS.tue, '14:00');

    expect(await startOf(item)).toBe(`${DAYS.tue}T14:00`);
    expect(await endOf(item)).toBe(`${DAYS.tue}T15:30`);
  });

  test('B5.3 no other item changes position as a result of the move', async ({ page }) => {
    const a = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'A' });
    const b = await createItem(page, { day: DAYS.wed, time: '11:00', title: 'B' });
    const c = await createItem(page, { day: DAYS.fri, time: '16:00', title: 'C', durationMin: 60 });
    const snapshot = async () => [await startOf(b), await endOf(b), await startOf(c), await endOf(c)];
    const before = await snapshot();
    const boxB = await b.boundingBox();

    await moveItem(page, a, DAYS.tue, '14:00');

    expect(await snapshot()).toEqual(before);
    expect(await b.boundingBox()).toEqual(boxB);
  });

  // Q1: unverified against the recording — enable once answered.
  test.fixme('Q1 moving snaps to 15-minute steps', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Snap' });
    await moveItem(page, item, DAYS.sun, '10:40');
    expect(await startOf(item)).toBe(`${DAYS.sun}T10:45`);
  });
});
