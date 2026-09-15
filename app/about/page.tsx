import Link from 'next/link';

const HIGHLIGHTS = [
  {
    icon: '🎯',
    title: 'Built for classroom momentum',
    text: 'Bored Teacher turns learning into quick, playful challenges that keep students engaged without adding prep stress for teachers.',
  },
  {
    icon: '🌍',
    title: 'Language + confidence',
    text: 'Games are designed to support ESL learners with visual prompts, repetition, and low-pressure practice across speaking, reading, and vocabulary.',
  },
  {
    icon: '📚',
    title: 'Teacher-first tools',
    text: 'From resource packs to progress tracking, the hub is built to make classroom routines easier to plan, run, and measure.',
  },
];

const VALUES = [
  'Accessible, game-based learning for mixed-ability classrooms.',
  'Fast setup so teachers can launch lessons in minutes instead of hours.',
  'Encouragement that helps students feel successful while still stretching their skills.',
  'A growing library that blends curriculum support with playful challenge.',
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="shell-card about-hero">
        <div className="about-hero-grid">
          <div className="about-hero-copy">
            <div className="about-kicker">
              About the platform
            </div>

            <h1 className="about-hero-title">
              We Learn. We Grow. We Belong.
            </h1>

            <p className="about-hero-text">
              Bored Teacher is based on the ideology of "ubuntu". "We" are powerful because we are "one".
            </p>

            <p className="about-hero-text about-hero-text-strong">
              Bored Teacher believes learning is stronger when it is shared, supported, and rooted in belonging.
            </p>

            <div className="about-hero-actions">
              <Link href="/hub" className="pill-btn" style={{ textDecoration: 'none' }}>
                Explore the hub
              </Link>
              <Link href="/games" className="pill-btn alt" style={{ textDecoration: 'none' }}>
                Browse games
              </Link>
            </div>
          </div>

          <div className="about-hero-visual">
            <img
              src="/images/ubuntu.png"
              alt="Ubuntu community image"
            />
          </div>
        </div>
      </section>

      <section className="shell-card about-start-card">
        <div className="about-kicker">
          Our starting point
        </div>
        <h2 className="about-start-title">
          Making learning feel less like work and more like play.
        </h2>
        <p className="about-start-copy">
          Bored Teacher is a game-based classroom hub for learning, practice, and motivation. It brings together short-form educational games, progress tracking, teacher resources, and rewarding milestones so students stay focused while teachers keep momentum high.
        </p>

        <div className="about-creator">
          <img
            src="/surrell-ai-pic.png"
            alt="Russell Mkahanana"
            className="about-creator-avatar"
          />
          <div className="about-creator-copy">
            <span className="about-creator-label">Created by</span>
            <strong>Russell Mkahanana</strong>
            <small>Zimbabwean educator and software developer</small>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        {HIGHLIGHTS.map((item) => (
          <article key={item.title} className="shell-card" style={{ padding: 22, borderRadius: 24 }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>{item.icon}</div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.15rem' }}>{item.title}</h2>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>{item.text}</p>
          </article>
        ))}
      </div>

      <section className="shell-card" style={{ marginTop: 24, padding: 'clamp(20px, 4vw, 36px)', borderRadius: 28 }}>
        <div style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, marginBottom: 12 }}>
          Why it works
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {VALUES.map((value) => (
            <div key={value} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>✅</span>
              <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7 }}>{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
