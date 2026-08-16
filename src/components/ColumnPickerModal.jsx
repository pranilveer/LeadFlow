import { useState, useEffect } from "react";
import Modal from "./Modal";

export default function ColumnPickerModal({ open, title = "Customize Columns", columns, initial, hint, onApply, onClose }) {
  const [draft, setDraft] = useState([]);

  useEffect(() => {
    if (open) setDraft(initial || []);
  }, [open, initial]);

  if (!open) return null;

  const allChecked = columns.length > 0 && draft.length === columns.length;

  const toggle = (key) => {
    setDraft(d => {
      if (d.includes(key)) return d.filter(k => k !== key);
      return columns.filter(c => d.includes(c.key) || c.key === key).map(c => c.key);
    });
  };

  const reset = () => setDraft(columns.map(c => c.key));

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <button type="button" className="btn btn--ghost" onClick={reset}><i className="fa-solid fa-rotate-left"></i> Reset</button>
        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn--primary" disabled={draft.length === 0} onClick={() => onApply(draft)}><i className="fa-solid fa-check"></i> Apply</button>
      </>}>
      <div className="column-picker__header">
        <span className="column-picker__title">Choose which columns to show in the table</span>
        <label className="checkbox">
          <input type="checkbox" checked={allChecked} onChange={() => setDraft(allChecked ? [] : columns.map(c => c.key))} />
          <span className="checkbox__box"><i className="fa-solid fa-check"></i></span>
          <span className="checkbox__label">Select All</span>
        </label>
      </div>
      <div className="column-picker__list">
        {columns.map(c => (
          <label key={c.key} className={`column-picker__item ${draft.includes(c.key) ? "column-picker__item--checked" : ""}`}>
            <span className="checkbox">
              <input type="checkbox" checked={draft.includes(c.key)} onChange={() => toggle(c.key)} />
              <span className="checkbox__box"><i className="fa-solid fa-check"></i></span>
            </span>
            <span className="column-picker__label">{c.label}</span>
          </label>
        ))}
      </div>
      <p className="form-hint column-picker__hint">{hint || "The Actions column is always visible. Your selection is saved for this account."}</p>
    </Modal>
  );
}
