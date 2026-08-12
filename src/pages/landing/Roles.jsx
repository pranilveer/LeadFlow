const ADMIN_PERMS = [
  "Manage all users & roles",
  "Full access to every lead",
  "Create & manage categories",
  "Backup & restore data",
  "View company-wide activity",
];

const USER_PERMS = [
  "Manage their own leads",
  "See shared pipeline & stats",
  "Import & export CSV",
  "Follow-up activity history",
  "Personal profile & theme",
];

export default function Roles() {
  return (
    <section className="landing-section landing-band" id="roles">
      <div className="landing-container">
        <div className="landing-section__head landing-section__head--center reveal">
          <span className="landing-eyebrow">Secure by design</span>
          <h2 className="landing-h2">Roles that respect your team</h2>
          <p className="landing-sub">
            Everyone gets exactly the access they need — nothing more, nothing less.
          </p>
        </div>

        <div className="landing-roles">
          <article className="landing-role-card landing-role-card--admin reveal">
            <div className="landing-role-card__head">
              <span className="landing-role-card__icon" aria-hidden="true">
                <i className="fa-solid fa-user-shield"></i>
              </span>
              <div>
                <h3>Admin</h3>
                <small>Full workspace control</small>
              </div>
            </div>
            <p>Admins own the workspace — from team access to data safety.</p>
            <ul className="landing-role-list" role="list">
              {ADMIN_PERMS.map((perm) => (
                <li key={perm}><i className="fa-solid fa-circle-check" aria-hidden="true"></i>{perm}</li>
              ))}
            </ul>
          </article>

          <article className="landing-role-card landing-role-card--user reveal" style={{ transitionDelay: "120ms" }}>
            <div className="landing-role-card__head">
              <span className="landing-role-card__icon" aria-hidden="true">
                <i className="fa-solid fa-user"></i>
              </span>
              <div>
                <h3>User</h3>
                <small>Focused on their leads</small>
              </div>
            </div>
            <p>Teammates get everything they need to be productive and nothing they don't.</p>
            <ul className="landing-role-list" role="list">
              {USER_PERMS.map((perm) => (
                <li key={perm}><i className="fa-solid fa-circle-check" aria-hidden="true"></i>{perm}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
