import { useState, type FormEvent } from 'react';
import { ITEM_TYPES, type ItemType } from '../types';

interface Props {
  heading: string;
  initialTitle?: string;
  initialType?: ItemType;
  onSave: (title: string, type: ItemType) => void;
  onClose: () => void;
}

/** Used for both creating and editing an item. */
export function CreateModal({ heading, initialTitle = '', initialType = 'Event', onSave, onClose }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<ItemType>(initialType);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(title, type);
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-label={heading} data-testid="create-modal" onSubmit={submit}>
        <div className="modal-head">
          <span>{heading}</span>
          <button type="button" className="icon-btn" aria-label="Close" data-testid="close-modal" onClick={onClose}>
            ✕
          </button>
        </div>
        <input
          className="title-input"
          data-testid="title-input"
          placeholder="Add title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="type-select"
          data-testid="type-select"
          aria-label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as ItemType)}
        >
          {ITEM_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button type="submit" className="btn primary" data-testid="save-button">Save</button>
        </div>
      </form>
    </div>
  );
}
