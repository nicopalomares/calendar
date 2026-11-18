export type ItemType = 'Event' | 'Task' | 'Appointment schedule';
export type ViewMode = 'week' | 'day';

export interface CalendarItem {
  id: string;
  title: string; // empty string renders as "(Sin título)"
  type: ItemType;
  /** Local time, minutes since epoch are avoided on purpose: "YYYY-MM-DDTHH:mm" */
  start: string;
  end: string;
}

export const ITEM_TYPES: ItemType[] = ['Event', 'Task', 'Appointment schedule'];
export const DEFAULT_DURATION_MIN = 30;
export const SNAP_MIN = 15;
