import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Starter",
    price: "₹0",
    period: "/ forever",
    desc: "For individuals getting their leads organized.",
    features: ["Up to 3 team members", "Core lead management", "Categories & dashboard", "CSV import / export"],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/ user / mo",
    desc: "For growing sales teams that need full control.",
    features: ["Unlimited members", "Role-based access", "Activity log & audit trail", "Backup & restore", "Priority support"],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Scale",
    price: "₹2,499",
    period: "/ user / mo",
    desc: "For organizations with advanced needs.",
    features: ["Everything in Pro", "Advanced reporting", "Dedicated onboarding", "Custom integrations"],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section className="landing-section" id="pricing">
      <div className="landing-container">
        <div className="landing-section__head landing-section__head--center reveal">
          <span className="landing-eyebrow">Simple pricing</span>
          <h2 className="landing-h2">Start free. Scale when you're ready.</h2>
          <p className="landing-sub">Transparent plans that grow with your team. No hidden fees, cancel anytime.</p>
        </div>

        <div className="landing-pricing">
          {PLANS.map((plan, idx) => (
            <article
              className={`landing-price-card reveal ${plan.featured ? "landing-price-card--featured" : ""}`}
              key={plan.name}
              style={{ transitionDelay: `${idx * 90}ms` }}
            >
              <div className="landing-price-card__name">{plan.name}</div>
              <div className="landing-price-card__price">
                {plan.price}<small>{plan.period}</small>
              </div>
              <p className="landing-price-card__desc">{plan.desc}</p>
              <ul className="landing-price-list" role="list">
                {plan.features.map((feature) => (
                  <li key={feature}><i className="fa-solid fa-check" aria-hidden="true"></i>{feature}</li>
                ))}
              </ul>
              <Link
                className={`landing-btn ${plan.featured ? "landing-btn--primary" : "landing-btn--ghost"}`}
                to="/onboarding"
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
