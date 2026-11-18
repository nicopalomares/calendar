import { test, expect, type Locator, type Page } from '@playwright/test';
import { DAYS, openCalendar, createItem, moveItem, openPopup, timeRange, column, startOf } from './helpers';

/** Reference (overlap.png): "Lunch" 1–2pm and "(Sin título)" 1–1:45pm, both starting at 13:00. */
async function setupReference(page: Page) {
  const lunch = await createItem(page, { day: DAYS.sun, time: '13:00', title: 'Lunch', durationMin: 60 });
  // Created elsewhere (13:00 is already covered by Lunch) and then moved onto it.
  const untitled = await createItem(page, { day: DAYS.sun, time: '16:00', title: '', durationMin: 45 });
  await moveItem(page, untitled, DAYS.sun, '13:00');
  return { lunch, untitled };
}

const zIndex = (l: Locator) => l.evaluate((el) => parseInt(getComputedStyle(el).zIndex, 10) || 0);

test.describe('B7: Overlap', () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test('B7.1 both items remain visible and clickable', async ({ page }) => {
    const { lunch, untitled } = await setupReference(page);
    expect(await startOf(untitled)).toBe(`${DAYS.sun}T13:00`);
    await expect(lunch).toBeVisible();
    await expect(untitled).toBeVisible();

    // behind item: click its uncovered left strip
    await lunch.click({ position: { x: 4, y: 20 } });
    await expect(page.getByTestId('popup')).toContainText('Lunch');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('popup')).toBeHidden();

    // top item
    const box = (await untitled.boundingBox())!;
    await page.mouse.click(box.x + box.width - 6, box.y + 6);
    await expect(page.getByTestId('popup')).toBeVisible();
    await expect(page.getByTestId('popup')).toContainText('(Sin título)');
  });

  test('B7.2 the longer item goes behind, aligned to the left edge of the column', async ({ page }) => {
    const { lunch, untitled } = await setupReference(page);
    const col = (await column(page, DAYS.sun).boundingBox())!;
    const l = (await lunch.boundingBox())!;
    expect(Math.abs(l.x - col.x)).toBeLessThanOrEqual(3);
    expect(await zIndex(lunch)).toBeLessThan(await zIndex(untitled));
  });

  test('B7.3 the other item is on top, shifted right to about half the column', async ({ page }) => {
    const { untitled } = await setupReference(page);
    const col = (await column(page, DAYS.sun).boundingBox())!;
    const u = (await untitled.boundingBox())!;
    const offset = (u.x - col.x) / col.width;
    expect(offset).toBeGreaterThan(0.4);
    expect(offset).toBeLessThan(0.6);
  });

  test('B7.4 the top item has a white outline', async ({ page }) => {
    const { untitled } = await setupReference(page);
    const style = await untitled.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        outline: { style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor },
        border: { style: s.borderTopStyle, width: parseFloat(s.borderTopWidth), color: s.borderTopColor },
      };
    });
    const isWhite = (c: string) => /^rgba?\(255,\s*255,\s*255/.test(c);
    const hasOutline = style.outline.style !== 'none' && style.outline.width > 0 && isWhite(style.outline.color);
    const hasBorder = style.border.style !== 'none' && style.border.width > 0 && isWhite(style.border.color);
    expect(hasOutline || hasBorder).toBe(true);
  });

  test('B7.5 each item keeps its title/time range; the uncovered part of the item behind stays visible', async ({ page }) => {
    const { lunch, untitled } = await setupReference(page);
    await expect(lunch.getByTestId('title')).toHaveText('Lunch');
    await expect(untitled.getByTestId('title')).toHaveText('(Sin título)');
    expect(await timeRange(lunch)).toBe('1 – 2pm');
    expect(await timeRange(untitled)).toBe('1 – 1:45pm');

    for (const el of [lunch, untitled]) {
      const bg = await el.evaluate((n) => getComputedStyle(n).backgroundColor);
      expect(bg).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    }

    // Hit-test: left side of Lunch (next to the top item) and its tail after 1:45pm belong to Lunch.
    const lunchId = await lunch.getAttribute('data-testid');
    const l = (await lunch.boundingBox())!;
    const hit = (x: number, y: number) =>
      page.evaluate(
        ([px, py]) => document.elementFromPoint(px, py)?.closest('[data-testid^="item-"]')?.getAttribute('data-testid'),
        [x, y],
      );
    expect(await hit(l.x + 4, l.y + l.height / 2)).toBe(lunchId);
    expect(await hit(l.x + l.width * 0.75, l.y + l.height - 4)).toBe(lunchId);
  });

  // Q2: unverified against the recording — enable once answered.
  test.fixme('Q2 overlap with different start times (1pm and 1:30pm)', async ({ page }) => {
    const first = await createItem(page, { day: DAYS.sun, time: '13:00', title: 'First', durationMin: 60 });
    const second = await createItem(page, { day: DAYS.sun, time: '16:00', title: 'Second' });
    await moveItem(page, second, DAYS.sun, '13:30');
    expect(await zIndex(first)).toBeLessThan(await zIndex(second));
  });
});
