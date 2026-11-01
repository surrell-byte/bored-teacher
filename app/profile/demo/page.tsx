import Link from 'next/link';
import ProfileAvatar from '@/components/profile/ProfileAvatar';

const demoProfiles = [
  {
    role: 'Student profile',
    name: 'Maya Chen',
    username: '@maya_chen',
    avatar: '🎒',
    summary: 'Maple Class · Year 5',
    stats: [
      { label: 'Level', value: '7' },
      { label: 'XP', value: '420' },
      { label: 'Streak', value: '4 days' },
    ],
    heading: 'Learning snapshot',
    details: [
      ['Recent games', 'Vocab Valley, Grammar Hoop Slam'],
      ['Current focus', 'Vocabulary and sentence building'],
      ['Classroom', 'Maple Class'],
    ],
    action: 'Open student dashboard',
    href: '/hub',
  },
  {
    role: 'Teacher profile',
    name: 'Jordan Reed',
    username: '@jordanreed',
    avatar: '🍎',
    summary: 'ESL teacher · Maple Primary',
    stats: [
      { label: 'Classes', value: '2' },
      { label: 'Students', value: '27' },
      { label: 'Resources', value: '8' },
    ],
    heading: 'Classroom snapshot',
    details: [
      ['Maple Class', '15 students'],
      ['Cedar Class', '12 students'],
      ['Teaching focus', 'Vocabulary games and speaking practice'],
    ],
    action: 'Open class manager',
    href: '/teacher/classes',
  },
];

export default function DemoProfilesPage() {
  return (
    <main className="profile-page hub-page">
      <div className="profile-page-header">
        <div>
          <p className="suggestions-kicker">Local preview</p>
          <h1 className="hub-welcome-title">Student &amp; teacher profiles</h1>
          <p className="hub-welcome-sub">Two separate examples of role-specific profile information.</p>
        </div>
        <Link href="/profile" className="pill-btn">← Your profile</Link>
      </div>

      <section className="shell-card" style={{ padding: 18, marginBottom: 22 }} role="note">
        <strong>Demo data only.</strong> These fictional profiles are previews; nothing is saved or sent to Firebase.
      </section>

      {demoProfiles.map((profile) => (
        <article className="profile-layout" key={profile.role} aria-label={profile.role}>
          <section className="shell-card profile-preview">
            <div className="profile-preview-avatar">
              <ProfileAvatar value={profile.avatar} size={112} />
            </div>
            <p className="suggestions-kicker">{profile.role}</p>
            <h2>{profile.name}</h2>
            <p>{profile.username}</p>
            <p style={{ marginTop: 8 }}>{profile.summary}</p>
            <div className="profile-preview-stats">
              {profile.stats.map((stat) => (
                <span key={stat.label}>
                  <b>{stat.value}</b>
                  <small>{stat.label}</small>
                </span>
              ))}
            </div>
          </section>

          <section className="shell-card profile-form">
            <h2>{profile.heading}</h2>
            <dl style={{ display: 'grid', gap: 14, margin: '12px 0 8px' }}>
              {profile.details.map(([label, value]) => (
                <div key={label}>
                  <dt className="lb-field-label">{label}</dt>
                  <dd style={{ margin: '4px 0 0' }}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="profile-save-row">
              <Link href={profile.href} className="btn-primary">{profile.action}</Link>
            </div>
          </section>
        </article>
      ))}
    </main>
  );
}
