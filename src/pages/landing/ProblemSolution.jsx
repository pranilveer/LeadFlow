const ITEMS = [
  {
    icon: "fa-bars-staggered",
    iconMod: "rose",
    title: "Leads scattered everywhere",
    pain: "Contacts sitting in inboxes, spreadsheets, and sticky notes — no single source of truth.",
    fix: "Every lead lives in one clean, searchable list you can sort, filter, and export.",
  },
  {
    icon: "fa-eye-low-vision",
    iconMod: "amber",
    title: "No visibility into the pipeline",
    pain: "You can't tell which deals are stalling or where the next win is coming from.",
    fix: "Live pipeline stats and dashboard overviews surface momentum at a glance.",
  },
  {
    icon: "fa-bolt",
    iconMod: "accent",
    title: "Messy, missed follow-ups",
    pain: "Important follow-ups slip through the cracks with no history of what happened.",
    fix: "A full activity log keeps every touch, update, and note auditable and on time.",
  },
];

export default function ProblemSolution() {
  return (
    <section className="landing-section" id="benefits">
      <div className="landing-container">
        <div className="landing-section__head landing-section__head--center reveal">
          <span className="landing-eyebrow">From chaos to control</span>
          <h2 className="landing-h2">The mess your sales team deals with every day</h2>
          <p className="landing-sub">
            Disorganized lead tracking quietly costs you deals. LeadFlow replaces the chaos with a system that works.
          </p>
        </div>

        <div className="landing-problem">
          {ITEMS.map((item, idx) => (
            <article className="landing-pain-card reveal" key={item.title} style={{ transitionDelay: `${idx * 90}ms` }}>
              <span className={`landing-pain-card__icon landing-pain-card__icon--${item.iconMod}`} aria-hidden="true">
                <i className={`fa-solid ${item.icon}`}></i>
              </span>
              <h3>{item.title}</h3>
              <p>{item.pain}</p>
              <div className="landing-pain-card__fix">
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                <span>{item.fix}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
