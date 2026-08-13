import { useState, useEffect, useRef } from "react";

export default function RowActions({ items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest(".row-actions__menu")) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open) {
      const r = e.currentTarget.getBoundingClientRect();
      const menuH = 40 + items.length * 38;
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const anchor = align === "right" ? { right: window.innerWidth - r.right } : { left: r.left };
      const belowStyle = { position: "fixed", top: r.bottom + 6, ...anchor, zIndex: 300 };
      const aboveStyle = { position: "fixed", bottom: window.innerHeight - r.top + 6, ...anchor, zIndex: 300 };
      setPos(below < menuH && above > below ? aboveStyle : belowStyle);
    }
    setOpen(o => !o);
  };

  const handleClick = (item) => {
    setOpen(false);
    item.onClick();
  };

  return (
    <div className="row-actions">
      <button
        ref={btnRef}
        type="button"
        className="btn btn--ghost btn--sm row-actions__toggle"
        aria-label="Actions"
        aria-expanded={open}
        onClick={toggle}
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>
      {open && (
        <div className="actions-dropdown__menu row-actions__menu" style={pos}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={`actions-dropdown__item ${item.danger ? "row-actions__item--danger" : ""}`}
              onClick={() => handleClick(item)}
              disabled={item.disabled}
            >
              <i className={`fa-solid ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
