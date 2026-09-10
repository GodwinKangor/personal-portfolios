import { profile } from "../data/profile";

export const WhoNow = () => {
  const hasNow = profile.now && profile.now.length > 0;

  return (
    <section className="who-now" id="about">
      <div className="section-shell who-now__grid">
        <div className="who-now__column">
          <p className="section-label">Who</p>
          {profile.who.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {hasNow && (
          <div className="who-now__column">
            <p className="section-label">Now</p>
            {profile.now.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
