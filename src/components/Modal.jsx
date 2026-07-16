import { useEffect } from "react";

export default function Modal({ open, onClose, title, size, children, footer }) {
  useEffect(() => {
    if (open) document.body.classList.add("modal-active");
    else document.body.classList.remove("modal-active");
    return () => document.body.classList.remove("modal-active");
  }, [open]);

  if (!open) return null;

  const sizeClass = size === "sm" ? "modal__dialog--sm" : size === "lg" ? "modal__dialog--lg" : "";

  return (
    <div className={`modal ${open ? "modal--open" : ""}`} aria-hidden={!open} role="dialog">
      <div className="modal__backdrop" onClick={onClose}></div>
      <div className={`modal__dialog ${sizeClass}`}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
