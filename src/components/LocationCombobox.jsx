import { useState, useEffect, useRef, useMemo, useId } from "react";
import { createPortal } from "react-dom";

const PAGE = 100;

export default function LocationCombobox({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select\u2026",
  searchPlaceholder = "Type to search\u2026",
  disabled = false,
  required = false,
  clearable = true,
  loading = false,
  loadingText = "Loading\u2026",
  emptyText = "No matching options found.",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const [count, setCount] = useState(PAGE);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const id = useId();
  const listId = `lc-${id}-list`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selectedValue = value ? value.value : "";
  const visible = filtered.slice(0, count);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCount(PAGE);
    setHighlight(-1);
    requestAnimationFrame(() => {
      if (searchRef.current) searchRef.current.focus();
    });
  }, [open]);

  useEffect(() => {
    setHighlight(-1);
  }, [query, options]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && rootRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const position = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      const menuH = menu.offsetHeight;
      const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 16);
      const spaceBelow = window.innerHeight - rect.bottom;
      const flip = spaceBelow < menuH + 8 && rect.top > menuH + 8;
      menu.style.position = "fixed";
      menu.style.width = `${width}px`;
      menu.style.top = `${flip ? Math.max(8, rect.top - menuH - 8) : rect.bottom + 4}px`;
      menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, visible.length, loading]);

  useEffect(() => {
    if (highlight < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${highlight}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const select = (opt) => {
    onSelect(opt);
    setOpen(false);
    setQuery("");
    setHighlight(-1);
  };

  const moveHighlight = (next) => {
    if (filtered.length === 0) return;
    const idx = Math.max(0, Math.min(next, filtered.length - 1));
    setHighlight(idx);
    if (idx >= count) setCount((c) => Math.min(filtered.length, c + PAGE));
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(highlight + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(highlight - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = highlight >= 0 && highlight < filtered.length ? highlight : 0;
      if (filtered[idx]) select(filtered[idx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const onTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setCount((c) => Math.min(filtered.length, c + PAGE));
    }
  };

  return (
    <div className="location-combobox" ref={rootRef}>
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span className="form-label__required"> *</span>}
      </label>
      <div
        id={id}
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-disabled={disabled}
        className={`location-combobox__trigger ${value ? "" : "location-combobox__trigger--placeholder"} ${open ? "location-combobox__trigger--open" : ""} ${disabled ? "location-combobox__trigger--disabled" : ""}`}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="location-combobox__value">
          {value && value.flag && <span className="location-combobox__flag">{value.flag}</span>}
          <span className="location-combobox__label">{value ? value.label : placeholder}</span>
        </span>
        <span className="location-combobox__end">
          {value && clearable && !disabled && (
            <button
              type="button"
              className="location-combobox__clear"
              aria-label={`Clear ${label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); onSelect(null); }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          {loading && !value ? (
            <i className="fa-solid fa-spinner fa-spin location-combobox__spinner"></i>
          ) : (
            <i className={`fa-solid fa-chevron-down location-combobox__chevron ${open ? "location-combobox__chevron--open" : ""}`}></i>
          )}
        </span>
      </div>
      {open && createPortal(
        <div className="location-combobox__menu" ref={menuRef} role="listbox" id={listId}>
          <div className="location-combobox__search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCount(PAGE); setHighlight(-1); }}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label="Search"
            />
          </div>
          <div className="location-combobox__list" ref={listRef} onScroll={onListScroll}>
            {loading && filtered.length === 0 ? (
              <div className="location-combobox__status">
                <i className="fa-solid fa-spinner fa-spin"></i>{loadingText}
              </div>
            ) : visible.length === 0 ? (
              <div className="location-combobox__status">{emptyText}</div>
            ) : (
              visible.map((opt, i) => (
                <button
                  key={`${opt.value}${opt.label}`}
                  type="button"
                  role="option"
                  aria-selected={opt.value === selectedValue}
                  data-index={i}
                  className={`location-combobox__option ${i === highlight ? "location-combobox__option--highlight" : ""} ${opt.value === selectedValue ? "location-combobox__option--selected" : ""}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(opt)}
                >
                  {opt.flag && <span className="location-combobox__flag">{opt.flag}</span>}
                  <span className="location-combobox__optlabel">{opt.label}</span>
                </button>
              ))
            )}
            {filtered.length > count && (
              <div className="location-combobox__more">Scroll for more ({filtered.length - count} more)\u2026</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
