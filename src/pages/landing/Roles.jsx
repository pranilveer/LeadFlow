const SUPER_ADMIN_PERMS = [
  "Promote & demote any role",
  "Manage all admin accounts",
  "Full workspace control",
  "Delete the entire organization",
];

const ADMIN_PERMS = [
  "Manage users & categories",
  "Full access to every lead",
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
                <i className="fa-solid fa-crown"></i>
              </span>
              <div>
                <h3>Super Admin</h3>
                <small>Exclusive role management</small>
              </div>
            </div>
            <p>The workspace owner — the only role that can manage admins and roles.</p>
            <ul className="landing-role-list" role="list">
              {SUPER_ADMIN_PERMS.map((perm) => (
                <li key={perm}><i className="fa-solid fa-circle-check" aria-hidden="true"></i>{perm}</li>
              ))}
            </ul>
          </article>

          <article className="landing-role-card landing-role-card--user reveal" style={{ transitionDelay: "120ms" }}>
            <div className="landing-role-card__head">
              <span className="landing-role-card__icon" aria-hidden="true">
                <i className="fa-solid fa-user-shield"></i>
              </span>
              <div>
                <h3>Admin</h3>
                <small>Full workspace control</small>
              </div>
            </div>
            <p>Admins run day-to-day operations — from team access to data safety.</p>
            <ul className="landing-role-list" role="list">
              {ADMIN_PERMS.map((perm) => (
                <li key={perm}><i className="fa-solid fa-circle-check" aria-hidden="true"></i>{perm}</li>
              ))}
            </ul>
          </article>

          <article className="landing-role-card landing-role-card--user reveal" style={{ transitionDelay: "240ms" }}>
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
