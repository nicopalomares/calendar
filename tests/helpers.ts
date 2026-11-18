import { expect, type Locator, type Page } from '@playwright/test';

/** Fixed "now": Wednesday 2026-11-18. Visible week = Sun 15 … Sat 21 Nov 2026. */
export const FIXED_NOW = new Date('2026-11-18T10:00:00');

export const DAYS = {
  sun: '2026-11-15',
  mon: '2026-11-16',
  tue: '2026-11-17',
  wed: '2026-11-18', // "today"
  thu: '2026-11-19',
  fri: '2026-11-20',
  sat: '2026-11-21',
} as const;

export type ItemTypeLabel = 'Event' | 'Task' | 'Appointment schedule';

export async function openCalendar(page: Page) {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto('/');
  await expect(page.getByTestId('view-toggle-week')).toBeVisible();
}

export const slot = (page: Page, day: string, time: string) => page.getByTestId(`slot-${day}-${time}`);
export const column = (page: Page, day: string) => page.getByTestId(`day-column-${day}`);
export const allItems = (page: Page) => page.locator('[data-testid^="item-"]');
export const itemByTitle = (page: Page, title: string) => allItems(page).filter({ hasText: title });

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Pixel geometry derived from the rendered 00:00 slot of a given day. */
async function geometry(page: Page, day: string) {
  const box = await slot(page, day, '00:00').boundingBox();
  if (!box) throw new Error(`slot ${day} 00:00 not rendered`);
  const hourH = box.height;
  return {
    x: box.x + box.width / 2,
    left: box.x,
    width: box.width,
    yAt: (time: string) => box.y + (toMinutes(time) / 60) * hourH,
    hourH,
  };
}

async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + (to.x - from.x) / 2, from.y + (to.y - from.y) / 2, { steps: 5 });
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.mouse.up();
}

/** Drag the item so that its top edge lands on `day` `time`. */
export async function moveItem(page: Page, item: Locator, day: string, time: string) {
  const box = (await item.boundingBox())!;
  const g = await geometry(page, day);
  const grabY = 6; // px below the item's top edge
  await drag(page, { x: box.x + box.width / 4, y: box.y + grabY }, { x: g.x - g.width / 4, y: g.yAt(time) + grabY });
}

/** Drag the item's bottom handle so the item ends at `endTime` (item's own day). */
export async function resizeItem(page: Page, item: Locator, day: string, endTime: string) {
  const box = (await item.boundingBox())!;
  const handle = (await item.getByTestId('resize-handle').boundingBox())!;
  const g = await geometry(page, day);
  const from = { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
  const dy = g.yAt(endTime) - (box.y + box.height);
  await drag(page, from, { x: from.x, y: from.y + dy });
}

export interface NewItem {
  day: string;
  time: string;
  title: string;
  type?: ItemTypeLabel;
  /** Defaults to 30 (the app's default). Other values are reached by resizing. */
  durationMin?: number;
}

/** Create an item through the UI (click slot → modal → save) and return its locator. */
export async function createItem(page: Page, { day, time, title, type = 'Event', durationMin = 30 }: NewItem) {
  const before = new Set(await allItems(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-testid'))));
  await slot(page, day, time).click();
  await page.getByTestId('title-input').fill(title);
  await page.getByTestId('type-select').selectOption({ label: type });
  await page.getByTestId('save-button').click();
  await expect(page.getByTestId('create-modal')).toBeHidden();

  const ids = await allItems(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!));
  const fresh = ids.filter((id) => !before.has(id));
  expect(fresh).toHaveLength(1);
  const item = page.getByTestId(fresh[0]);

  if (durationMin !== 30) {
    const end = toMinutes(time) + durationMin;
    const hh = String(Math.floor(end / 60)).padStart(2, '0');
    const mm = String(end % 60).padStart(2, '0');
    await resizeItem(page, item, day, `${hh}:${mm}`);
  }
  return item;
}

/** Collapse any whitespace (incl. nbsp / narrow nbsp) so "9 – 11am" compares reliably. */
export const normalize = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

export const timeRange = async (item: Locator) => normalize(await item.getByTestId('time-range').textContent());
export const startOf = (item: Locator) => item.getAttribute('data-start');
export const endOf = (item: Locator) => item.getAttribute('data-end');

export async function openPopup(page: Page, item: Locator) {
  await item.click({ position: { x: 8, y: 5 } });
  await expect(page.getByTestId('popup')).toBeVisible();
}
