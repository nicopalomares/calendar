import { test, expect } from '@playwright/test';
import { DAYS, openCalendar, createItem, openPopup, allItems } from './helpers';

test.describe('B8: Delete', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B8.1 the detail popup shows a trash icon', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Bye' });
    await openPopup(page, item);
    await expect(page.getByTestId('popup-delete')).toBeVisible();
  });

  test('B8.2 clicking trash removes the item immediately (no confirmation) and closes the popup', async ({ page }) => {
    let dialogSeen = false;
    page.on('dialog', async (d) => {
      dialogSeen = true;
      await d.dismiss();
    });
    const item = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'Bye' });
    await openPopup(page, item);
    await page.getByTestId('popup-delete').click();

    await expect(page.getByTestId('popup')).toBeHidden();
    await expect(allItems(page)).toHaveCount(0);
    expect(dialogSeen).toBe(false);
    await expect(page.getByText(/confirm|are you sure|seguro/i)).toHaveCount(0);
  });

  test('B8.3 the deleted item is gone from both views', async ({ page }) => {
    const item = await createItem(page, { day: DAYS.wed, time: '09:00', title: 'Bye' });
    const id = await item.getAttribute('data-testid');
    await openPopup(page, item);
    await page.getByTestId('popup-delete').click();

    await expect(page.getByTestId(id!)).toHaveCount(0);
    await page.getByTestId('view-toggle-day').click();
    await expect(page.getByTestId(id!)).toHaveCount(0);
    await page.getByTestId('view-toggle-week').click();
    await expect(page.getByTestId(id!)).toHaveCount(0);
  });

  test('B8.4 deleting one item does not affect the others', async ({ page }) => {
    const a = await createItem(page, { day: DAYS.sun, time: '09:00', title: 'A' });
    const b = await createItem(page, { day: DAYS.tue, time: '11:00', title: 'B', durationMin: 60 });
    const bId = await b.getAttribute('data-testid');
    const bStart = await b.getAttribute('data-start');
    const bEnd = await b.getAttribute('data-end');
    const bBox = await b.boundingBox();

    await openPopup(page, a);
    await page.getByTestId('popup-delete').click();

    await expect(allItems(page)).toHaveCount(1);
    const bAfter = page.getByTestId(bId!);
    await expect(bAfter.getByTestId('title')).toHaveText('B');
    expect(await bAfter.getAttribute('data-start')).toBe(bStart);
    expect(await bAfter.getAttribute('data-end')).toBe(bEnd);
    expect(await bAfter.boundingBox()).toEqual(bBox);
  });
});
