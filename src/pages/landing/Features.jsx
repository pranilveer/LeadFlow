const FEATURES = [
  {
    icon: "fa-user-plus",
    title: "Lead Management",
    desc: "Create, edit, and organize every prospect with rich detail — quickly and cleanly.",
  },
  {
    icon: "fa-chart-line",
    iconMod: "green",
    title: "Pipeline Dashboard & Stats",
    desc: "Live counters and overview charts show you exactly where your pipeline stands.",
  },
  {
    icon: "fa-tags",
    iconMod: "amber",
    title: "Category Organization",
    desc: "Group leads into color-coded categories so nothing ever gets lost.",
  },
  {
    icon: "fa-shield-halved",
    iconMod: "rose",
    title: "Role-Based Access",
    desc: "Admins control the workspace; teammates manage their own leads with clear permissions.",
  },
  {
    icon: "fa-file-csv",
    title: "CSV Import & Export",
    desc: "Bring your existing leads in and take your data out — in a couple of clicks.",
  },
  {
    icon: "fa-clock-rotate-left",
    iconMod: "green",
    title: "Activity Log",
    desc: "Every action is tracked, so your follow-up history is always audit-ready.",
  },
  {
    icon: "fa-circle-half-stroke",
    iconMod: "amber",
    title: "Dark / Light Theme",
    desc: "A polished workspace that adapts to your environment and your eyes.",
  },
  {
    icon: "fa-database",
    iconMod: "rose",
    title: "Data Backup & Restore",
    desc: "One-click backups and full restore give you total peace of mind.",
  },
];

export default function Features() {
  return (
    <section className="landing-section landing-band" id="features">
      <div className="landing-container">
        <div className="landing-section__head landing-section__head--center reveal">
          <span className="landing-eyebrow">Everything you need</span>
          <h2 className="landing-h2">One workspace to run your whole pipeline</h2>
          <p className="landing-sub">
            LeadFlow combines the essentials of a modern CRM into a fast, focused tool your team will actually enjoy using.
          </p>
        </div>

        <div className="landing-features">
          {FEATURES.map((feature, idx) => (
            <article className="landing-feature-card reveal" key={feature.title} style={{ transitionDelay: `${(idx % 4) * 80}ms` }}>
              <span className={`landing-feature-card__icon ${feature.iconMod ? `landing-feature-card__icon--${feature.iconMod}` : ""}`} aria-hidden="true">
                <i className={`fa-solid ${feature.icon}`}></i>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
