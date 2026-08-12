import { Link } from "react-router-dom";

const STEPS = [
  {
    num: "01",
    icon: "fa-user-plus",
    title: "Create your account",
    desc: "Set up your company workspace in under a minute and invite your team.",
  },
  {
    num: "02",
    icon: "fa-file-import",
    title: "Add or import leads",
    desc: "Create leads manually or import an existing CSV — organized into categories instantly.",
  },
  {
    num: "03",
    icon: "fa-flag-checkered",
    title: "Track & close deals",
    desc: "Watch your pipeline move with live stats, follow-ups, and a full activity history.",
  },
];

export default function HowItWorks() {
  return (
    <section className="landing-section" id="how-it-works">
      <div className="landing-container">
        <div className="landing-section__head landing-section__head--center reveal">
          <span className="landing-eyebrow">Simple by design</span>
          <h2 className="landing-h2">Up and running in three steps</h2>
          <p className="landing-sub">
            No long onboarding, no complex setup. Start managing leads the same day.
          </p>
        </div>

        <div className="landing-steps">
          {STEPS.map((step, idx) => (
            <div className="landing-step reveal" key={step.num} style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="landing-step__num" aria-hidden="true">
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link className="landing-link-arrow" to="/onboarding">
            Try the first step free <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
