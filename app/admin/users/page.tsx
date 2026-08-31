'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isCreatorUser, loadUsersForCreator, onAuthStateChanged, type UserSummary } from '@/lib/firebase';
import { buildCreatorCohortSummary, buildCreatorConversionFunnel, buildCreatorMonetisationSnapshot, buildCreatorRevenueTrend, estimateTeacherProRevenue } from '@/lib/monetisation-utils';

export default function UsersAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (!user) {
        router.replace('/auth');
        return;
      }

      if (!isCreatorUser(user)) {
        setStatus('denied');
        return;
      }

      try {
        const rows = await loadUsersForCreator();
        setUsers(rows);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    });

    return unsubscribe;
  }, [router]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesText = !normalizedQuery ||
        [user.name, user.username, user.email, user.role ?? '', user.classId ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesText && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const activeUsers = useMemo(() => users.filter((user) => user.isActive).length, [users]);
  const teacherUsers = useMemo(() => users.filter((user) => user.role === 'teacher').length, [users]);
  const studentUsers = useMemo(() => users.filter((user) => user.role === 'student').length, [users]);
  const teacherProUsers = useMemo(() => users.filter((user) => user.teacherPro).length, [users]);
  const activeRate = users.length ? Math.round((activeUsers / users.length) * 100) : 0;
  const teacherProRate = users.length ? Math.round((teacherProUsers / users.length) * 100) : 0;
  const monetisation = useMemo(() => estimateTeacherProRevenue({ totalUsers: users.length, teacherProUsers, monthlyPrice: 10, annualPrice: 110 }), [users.length, teacherProUsers]);
  const monetisationSnapshot = useMemo(() => buildCreatorMonetisationSnapshot(users, new Date()), [users]);
  const revenueTrend = useMemo(() => buildCreatorRevenueTrend(users, new Date()), [users]);
  const conversionFunnel = useMemo(() => buildCreatorConversionFunnel(users), [users]);
  const cohortSummary = useMemo(() => buildCreatorCohortSummary(users, new Date()), [users]);

  if (status === 'loading') return null;

  if (status === 'denied') {
    return (
      <div className="admin-feedback-page">
        <section className="shell-card admin-feedback-empty">
          <h1>Creator access required</h1>
          <p>This users page is reserved for the app creator.</p>
        </section>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="admin-feedback-page">
        <section className="shell-card admin-feedback-empty">
          <h1>Could not load users</h1>
          <p>Check that your Firestore rules allow read access for the creator account and that the signed-in user is the allowed creator.</p>
        </section>
      </div>
    );
  }

  const formatDate = (value?: Date | null) => {
    if (!value) return 'Not available';
    return value.toLocaleString();
  };

  return (
    <div className="admin-feedback-page">
      <header className="admin-feedback-header">
        <div>
          <p className="suggestions-kicker">Creator workspace</p>
          <h1 className="hub-welcome-title">Users dashboard</h1>
          <p className="hub-welcome-sub">Track active accounts, account metadata, and signup dates.</p>
        </div>
        <div className="admin-feedback-count">
          <strong>{users.length}</strong>
          <span>total users</span>
        </div>
      </header>

      <section className="admin-feedback-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">👥 Total users</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{users.length}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">✅ Active</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{activeUsers}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">👩‍🏫 Teachers</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{teacherUsers}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">🎒 Students</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{studentUsers}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">⭐ Teacher Pro</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{teacherProUsers}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">📈 Active rate</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{activeRate}%</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">💸 Pro conversion</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{teacherProRate}%</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">📦 Monthly revenue</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>${monetisation.monthlyRevenue}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">🧾 Annualized value</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>${monetisation.annualizedRevenue}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">📈 Recent Pro signups</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{monetisationSnapshot.recentProUsers}</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">🧠 Active premium retention</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{monetisationSnapshot.activePremiumRetention}%</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">👩‍🏫 Teacher conversion</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{conversionFunnel.teacherConversionRate}%</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">🎒 Student conversion</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{conversionFunnel.studentConversionRate}%</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">🆕 New-user conversion</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{cohortSummary.newUserConversionRate}%</p>
        </article>
        <article className="shell-card admin-feedback-item">
          <div className="admin-feedback-item-top"><span className="admin-feedback-type">🔁 Returning-user conversion</span></div>
          <p style={{ margin: '0.9rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{cohortSummary.returningUserConversionRate}%</p>
        </article>
      </section>

      <section className="shell-card" style={{ marginTop: 18, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
          {revenueTrend.months.map((month) => (
            <div key={month.label} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{month.label}</div>
              <div style={{ marginTop: 8, fontWeight: 800, fontSize: '1.3rem' }}>${month.revenue}</div>
              <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: '0.72rem' }}>{month.signups} new users</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <input
            aria-label="Search users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, username, email, class..."
            style={{ flex: '1 1 230px', minWidth: 180, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }}
          />

          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | 'student' | 'teacher')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }}>
            <option value="all">All activity</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </section>

      <section className="admin-feedback-list" style={{ marginTop: 20 }}>
        {filteredUsers.length ? (
          filteredUsers.map((user) => (
            <article key={user.uid} className="shell-card admin-feedback-item" style={{ marginBottom: 14 }}>
              <div className="admin-feedback-item-top">
                <span className="admin-feedback-type">
                  {user.isActive ? '✅ Active' : '⏳ Inactive'} · {user.role === 'teacher' ? 'Teacher' : user.role === 'student' ? 'Student' : 'Account'}
                </span>
                <time>{formatDate(user.createdAt)}</time>
              </div>

              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Username:</strong> @{user.username}</div>
                <div><strong>Email:</strong> {user.email || 'No email'}</div>
                <div><strong>Class:</strong> {user.classId || 'None'}</div>
                <div><strong>Teacher Pro:</strong> {user.teacherPro ? 'Active' : 'Not active'}</div>
                <div><strong>Sign up date:</strong> {formatDate(user.createdAt)}</div>
                <div><strong>Last login:</strong> {formatDate(user.lastLogin)}</div>
                <div><strong>UID:</strong> {user.uid}</div>
              </div>
            </article>
          ))
        ) : (
          <section className="shell-card admin-feedback-empty">
            <h2>No users match your filters</h2>
            <p>Try resetting the search or changing the role and activity filters.</p>
          </section>
        )}
      </section>
    </div>
  );
}
