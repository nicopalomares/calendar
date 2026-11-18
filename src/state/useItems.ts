import { useCallback, useState } from 'react';
import { DEFAULT_DURATION_MIN, type CalendarItem, type ItemType } from '../types';
import { makeTs } from '../lib/time';

let counter = 0;

export function useItems() {
  const [items, setItems] = useState<CalendarItem[]>([]);

  const add = useCallback((day: string, startMin: number, title: string, type: ItemType) => {
    const item: CalendarItem = {
      id: `i${++counter}`,
      title,
      type,
      start: makeTs(day, startMin),
      end: makeTs(day, startMin + DEFAULT_DURATION_MIN),
    };
    setItems((prev) => [...prev, item]);
    return item.id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<CalendarItem, 'id'>>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  return { items, add, update, remove };
}
