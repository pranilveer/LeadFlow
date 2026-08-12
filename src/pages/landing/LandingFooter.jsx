import { Link } from "react-router-dom";

const COLS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Roles", href: "#roles" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Login", to: "/login" },
      { label: "Get Started", to: "/onboarding" },
      { label: "Join a workspace", to: "/join" },
    ],
  },
];

const SOCIALS = [
  { label: "GitHub", icon: "fa-brands fa-github", href: "https://github.com/pranilveer" },
  { label: "X (Twitter)", icon: "fa-brands fa-x-twitter", href: "https://x.com/pranilveer" },
  { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", href: "https://linkedin.com/in/pranilveer" },
  { label: "Instagram", icon: "fa-brands fa-instagram", href: "https://instagram.com/veerpranil" },
  { label: "YouTube", icon: "fa-brands fa-youtube", href: "https://youtube.com/@veerpranil" },
];

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <a className="brand" href="#top" aria-label="LeadFlow CRM home">
              <span className="brand__mark" aria-hidden="true"><i className="fa-solid fa-arrow-trend-up"></i></span>
              <span className="brand__text">
                <span className="brand__name">LeadFlow</span>
                <span className="brand__tag">CRM</span>
              </span>
            </a>
            <p>A clean and powerful CRM for sales teams to track, manage, and close leads.</p>
          </div>

          <div className="landing-footer__cols">
            {COLS.map((col) => (
              <nav className="landing-footer__col" key={col.heading} aria-label={col.heading}>
                <h4>{col.heading}</h4>
                <ul role="list">
                  {col.links.map((link) =>
                    link.to ? (
                      <li key={link.label}><Link to={link.to}>{link.label}</Link></li>
                    ) : (
                      <li key={link.label}><a href={link.href}>{link.label}</a></li>
                    )
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>&copy; {new Date().getFullYear()} LeadFlow CRM. All rights reserved.</p>
          <div className="landing-footer__social">
            {SOCIALS.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label}>
                <i className={social.icon} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
