import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="landing-nav">
      <nav className="landing-container landing-nav__inner" aria-label="Main">
        <a className="brand" href="#top" aria-label="LeadFlow CRM home">
          <span className="brand__mark" aria-hidden="true"><i className="fa-solid fa-arrow-trend-up"></i></span>
          <span className="brand__text">
            <span className="brand__name">LeadFlow</span>
            <span className="brand__tag">CRM</span>
          </span>
        </a>

        <div className="landing-nav__links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div className="landing-nav__actions">
          <button type="button" className="landing-nav__theme" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`} aria-hidden="true"></i>
          </button>
          <Link className="landing-nav__login" to="/login">Login</Link>
          <Link className="landing-btn landing-btn--primary landing-btn--sm" to="/onboarding">
            Get Started Free <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </Link>
          <button
            type="button"
            className="landing-nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden="true"></i>
          </button>
        </div>
      </nav>

      {open && (
        <div className="landing-nav__mobile landing-nav__mobile--open">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <Link to="/onboarding" onClick={() => setOpen(false)}>Get Started Free</Link>
        </div>
      )}
    </header>
  );
}
