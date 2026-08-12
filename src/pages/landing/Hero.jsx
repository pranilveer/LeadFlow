import { Link } from "react-router-dom";

const STATS = [
  { label: "Leads", value: "248", mod: "accent" },
  { label: "Conversion", value: "31%", mod: "green" },
  { label: "Pipeline", value: "$84k", mod: "amber" },
];

const COLUMNS = [
  {
    label: "New",
    icon: "fa-bolt",
    leads: [
      { name: "Acme Corp", chip: "Inbound", chipMod: "indigo", value: "$12k" },
      { name: "Northwind", chip: "Referral", chipMod: "rose", value: "$8.5k" },
    ],
  },
  {
    label: "Follow-up",
    icon: "fa-comment-dots",
    leads: [
      { name: "Globex Ltd", chip: "Demo done", chipMod: "amber", value: "$24k" },
      { name: "Initech", chip: "Warm", chipMod: "indigo", value: "$6k" },
    ],
  },
  {
    label: "Won",
    icon: "fa-check",
    leads: [
      { name: "Umbrella", chip: "Closed", chipMod: "green", value: "$32k" },
      { name: "Stark Co", chip: "Closed", chipMod: "green", value: "$18k" },
    ],
  },
];

export default function Hero() {
  return (
    <section className="landing-hero" id="top">
      <div className="landing-container landing-hero__inner">
        <div className="landing-hero__content reveal reveal--visible">
          <span className="landing-hero__badge">
            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
            Built for modern sales teams
          </span>

          <h1 className="landing-hero__headline">
            Manage your sales pipeline with <span className="gradient">clarity and control</span>
          </h1>

          <p className="landing-hero__sub">
            Track every lead, organize your categories, and keep your whole team aligned —
            in one clean workspace built to help you close deals faster.
          </p>

          <div className="landing-hero__cta">
            <Link className="landing-btn landing-btn--primary" to="/onboarding">
              Start Free <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link className="landing-btn landing-btn--ghost" to="/login">
              <i className="fa-solid fa-play" aria-hidden="true"></i> View Live Demo
            </Link>
          </div>

          <div className="landing-hero__proof">
            <div className="landing-hero__avatars" aria-hidden="true">
              <span style={{ background: "var(--accent)" }}>AK</span>
              <span style={{ background: "var(--green)" }}>JM</span>
              <span style={{ background: "var(--amber)" }}>SR</span>
              <span style={{ background: "var(--purple)" }}>+9</span>
            </div>
            <p>
              <span className="landing-hero__stars" aria-label="5 star rating">★★★★★</span>
              <br />
              Trusted by <strong>120+ sales teams</strong>
            </p>
          </div>
        </div>

        <div className="landing-hero__mockup reveal reveal--visible" aria-hidden="true">
          <div className="landing-mockup">
            <div className="landing-mockup__bar">
              <div className="landing-mockup__dots">
                <span></span><span></span><span></span>
              </div>
              <span className="landing-mockup__title">LeadFlow · Pipeline</span>
            </div>

            <div className="landing-mockup__stats">
              {STATS.map((s) => (
                <div className={`landing-mockup__stat landing-mockup__stat--${s.mod}`} key={s.label}>
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>

            <div className="landing-mockup__board">
              {COLUMNS.map((col) => (
                <div className="landing-mockup__col" key={col.label}>
                  <div className="landing-mockup__col-head">
                    <span>{col.label}</span>
                    <i className={`fa-solid ${col.icon}`}></i>
                  </div>
                  {col.leads.map((lead) => (
                    <div className="landing-mockup__card" key={lead.name}>
                      <div className="landing-mockup__card-name">{lead.name}</div>
                      <div className="landing-mockup__card-row">
                        <span className={`landing-mockup__chip landing-mockup__chip--${lead.chipMod}`}>{lead.chip}</span>
                        <span className="landing-mockup__value">{lead.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="landing-mockup__float landing-mockup__float--deal">
            <span className="landing-mockup__float-icon landing-mockup__float-icon--green">
              <i className="fa-solid fa-trophy"></i>
            </span>
            <span className="landing-mockup__float-text">
              <strong>$32k deal won</strong>
              <small>just now</small>
            </span>
          </div>

          <div className="landing-mockup__float landing-mockup__float--leads">
            <span className="landing-mockup__float-icon landing-mockup__float-icon--accent">
              <i className="fa-solid fa-users"></i>
            </span>
            <span className="landing-mockup__float-text">
              <strong>+12 leads this week</strong>
              <small>imported &amp; organized</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
