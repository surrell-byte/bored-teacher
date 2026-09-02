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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(14px, 3vw, 28px) clamp(14px, 3vw, 24px) 80px' }}>
      <section
        className="shell-card"
        style={{
          padding: 'clamp(24px, 5vw, 52px)',
          borderRadius: 32,
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(255, 197, 57, 0.14), rgba(72, 201, 176, 0.08), rgba(125, 131, 255, 0.12))',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(260px, 0.9fr)',
            gap: 'clamp(20px, 4vw, 40px)',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.74rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, marginBottom: 12 }}>
              About the platform
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 1.05,
              margin: '0 0 16px',
              letterSpacing: '-0.05em',
              fontFamily: 'var(--font-display, Syne)',
            }}>
              We Learn. We Grow. We Belong.
            </h1>

            <p style={{ maxWidth: '60ch', margin: 0, color: 'var(--muted)', fontSize: '1.02rem', lineHeight: 1.8 }}>
              Bored Teacher is based on the ideology of "ubuntu". "We" are powerful because we are "one".
            </p>

            <p style={{ maxWidth: '60ch', margin: '18px 0 0', color: 'var(--text)', fontSize: '.94rem', lineHeight: 1.7, fontWeight: 700 }}>
              Bored Teacher believes learning is stronger when it is shared, supported, and rooted in belonging.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <Link href="/hub" className="pill-btn" style={{ textDecoration: 'none' }}>
                Explore the hub
              </Link>
              <Link href="/games" className="pill-btn alt" style={{ textDecoration: 'none' }}>
                Browse games
              </Link>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 28,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 18px 40px rgba(15,23,42,0.18)',
              background: '#0f172a',
            }}
          >
            <img
              src="/images/ubuntu.png"
              alt="Ubuntu community image"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      </section>

      <section className="shell-card" style={{ padding: 'clamp(24px, 5vw, 52px)', borderRadius: 28, marginBottom: 24 }}>
        <div style={{ fontSize: '0.74rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, marginBottom: 12 }}>
          Our starting point
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, margin: '0 0 16px', fontFamily: 'var(--font-display, Syne)' }}>
          Making learning feel less like work and more like play.
        </h2>
        <p style={{ maxWidth: '70ch', margin: 0, color: 'var(--muted)', lineHeight: 1.8 }}>
          Bored Teacher is a game-based classroom hub for learning, practice, and motivation. It brings together short-form educational games, progress tracking, teacher resources, and rewarding milestones so students stay focused while teachers keep momentum high.
        </p>
        <p style={{ margin: '18px 0 0', color: 'var(--text)', lineHeight: 1.7, fontWeight: 700 }}>
          Created by Russell Mkahanana, a Zimbabwean educator and software developer.
        </p>
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
