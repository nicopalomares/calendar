import { useEffect, useRef, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { Grid } from './components/Grid';
import { CreateModal } from './components/CreateModal';
import { ItemPopup } from './components/ItemPopup';
import { useItems } from './state/useItems';
import { addDays, isoDay, toMin, weekDays } from './lib/time';
import type { ViewMode } from './types';

type ModalState = { mode: 'create'; day: string; time: string } | { mode: 'edit'; id: string };

export function App() {
  const today = isoDay(new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [focusDay, setFocusDay] = useState(today);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [popupId, setPopupId] = useState<string | null>(null);
  const { items, add, update, remove } = useItems();
  const popupRef = useRef<HTMLDivElement>(null);

  const days = view === 'week' ? weekDays(focusDay) : [focusDay];
  const popupItem = items.find((i) => i.id === popupId) ?? null;
  const editing = modal?.mode === 'edit' ? items.find((i) => i.id === modal.id) : undefined;

  // Escape closes the modal first, then the popup. Clicking outside the popup closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modal) setModal(null);
      else setPopupId(null);
    };
    const onDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopupId(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [modal]);

  return (
    <div className="app" data-testid="app">
      <Toolbar
        view={view}
        focusDay={focusDay}
        onView={setView}
        onToday={() => setFocusDay(today)}
        onShift={(dir) => setFocusDay(addDays(focusDay, dir * (view === 'week' ? 7 : 1)))}
      />
      <Grid
        days={days}
        today={today}
        items={items}
        onSlotClick={(day, time) => {
          setPopupId(null);
          setModal({ mode: 'create', day, time });
        }}
        onItemClick={setPopupId}
        onUpdate={update}
      />

      {popupItem && !modal && (
        <ItemPopup
          ref={popupRef}
          item={popupItem}
          onClose={() => setPopupId(null)}
          onEdit={() => {
            setModal({ mode: 'edit', id: popupItem.id });
            setPopupId(null);
          }}
          onDelete={() => {
            remove(popupItem.id);
            setPopupId(null);
          }}
        />
      )}

      {modal?.mode === 'create' && (
        <CreateModal
          heading="New item"
          onClose={() => setModal(null)}
          onSave={(title, type) => {
            add(modal.day, toMin(modal.time), title, type);
            setModal(null);
          }}
        />
      )}
      {modal?.mode === 'edit' && editing && (
        <CreateModal
          heading="Edit item"
          initialTitle={editing.title}
          initialType={editing.type}
          onClose={() => setModal(null)}
          onSave={(title, type) => {
            update(editing.id, { title, type });
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
