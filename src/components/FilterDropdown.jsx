import { useState, useEffect, useRef } from "react";

export default function FilterDropdown({ className, label, icon, options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);
  const selected = options.find(o => o.value === value);
  const displayLabel = selected && selected.value !== "" ? selected.label : label;
  const isActive = selected && selected.value !== "";

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = ref.current && ref.current.querySelector(".filter-dropdown__trigger");
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 120;
      const menuWidth = Math.max(rect.width, 160);
      const spaceBelow = window.innerHeight - rect.bottom;
      const flip = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
      setPos({
        position: "fixed",
        top: flip ? rect.top - menuHeight - 8 : rect.bottom + 8,
        left,
        width: menuWidth,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  return (
    <div className={`filter-dropdown${className ? " " + className : ""}`} ref={ref}>
      <button
        type="button"
        className={`filter-dropdown__trigger ${open ? "filter-dropdown__trigger--open" : ""} ${isActive ? "filter-dropdown__trigger--active" : ""} ${disabled ? "filter-dropdown__trigger--disabled" : ""}`}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        disabled={disabled}
      >
        <span className="filter-dropdown__content">
          {icon && <i className={icon}></i>}
          <span className="filter-dropdown__label">{displayLabel}</span>
        </span>
        <i className={`fa-solid fa-chevron-down filter-dropdown__chevron ${open ? "filter-dropdown__chevron--open" : ""}`}></i>
      </button>
      {open && (
        <div className="filter-dropdown__menu" ref={menuRef} style={pos}>
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
