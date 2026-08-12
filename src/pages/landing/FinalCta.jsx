import { Link } from "react-router-dom";

export default function FinalCta() {
  return (
    <section className="landing-section landing-section--tight">
      <div className="landing-container">
        <div className="landing-cta reveal">
          <h2>Start managing leads today</h2>
          <p>Join sales teams who replaced scattered spreadsheets with a pipeline they can trust.</p>
          <div className="landing-cta__actions">
            <Link className="landing-btn landing-btn--primary" to="/onboarding">
              Get Started Free <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link className="landing-btn landing-btn--ghost" to="/login">
              View Live Demo
            </Link>
          </div>
          <p className="landing-cta__note">No credit card required · Free forever plan · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}
