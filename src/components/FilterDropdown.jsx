import { useState, useEffect, useRef } from "react";

export default function FilterDropdown({ label, icon, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);
  const displayLabel = selected && selected.value !== "" ? selected.label : label;
  const isActive = selected && selected.value !== "";

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-dropdown__trigger ${open ? "filter-dropdown__trigger--open" : ""} ${isActive ? "filter-dropdown__trigger--active" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        {icon && <i className={icon}></i>}
        <span className="filter-dropdown__label">{displayLabel}</span>
        <i className={`fa-solid fa-chevron-down filter-dropdown__chevron ${open ? "filter-dropdown__chevron--open" : ""}`}></i>
      </button>
      {open && (
        <div className="filter-dropdown__menu">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`filter-dropdown__item ${opt.value === value ? "filter-dropdown__item--active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.value === value && <i className="fa-solid fa-check filter-dropdown__check"></i>}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
