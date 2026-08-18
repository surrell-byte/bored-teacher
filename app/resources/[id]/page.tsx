'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { onAuthStateChanged } from '@/lib/firebase';

export default function ResourceViewerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [ready, setReady] = useState(false);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) { setReady(true); return; }
    const unsub = onAuthStateChanged(user => {
      if (!user) { router.replace('/auth'); return; }
      setReady(true);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!ready || !id) return;

    const resourceMap: Record<string, { file: string; title: string }> = {
      'r6': { file: '/resources/esl-teaching-guide.md', title: 'A Beginner\'s Guide to Teaching ESL' },
      'r7': { file: '/resources/classroom-management-guide.md', title: 'Classroom Management and Conflict Resolution' },
      'b1': { file: '/resources/blog-section-1.md', title: 'Getting Started as an ESL Teacher' },
      'b2': { file: '/resources/blog-section-2.md', title: 'Lesson Planning & Teaching Methodology' },
      'b3': { file: '/resources/blog-section-3.md', title: 'Classroom Management' },
      'b4': { file: '/resources/blog-section-4.md', title: 'Teaching Different Students' },
      'b5': { file: '/resources/blog-section-5.md', title: 'Assessment & Student Progress' },
      'b6': { file: '/resources/blog-section-6.md', title: 'Teaching English Effectively' },
      'b7': { file: '/resources/blog-section-7.md', title: 'Technology & Modern ESL Teaching' },
      'b8': { file: '/resources/blog-section-8.md', title: 'Professional Development' },
      'b9': { file: '/resources/blog-section-9.md', title: 'Career & Money' },
      'b10': { file: '/resources/blog-section-10.md', title: 'Advanced Teaching & Teacher Leadership' },
      'b11': { file: '/resources/blog-section-11.md', title: 'The Human Side of Teaching' },
      'b12': { file: '/resources/blog-section-12.md', title: 'Practical "Teacher Survival" Posts' },
    };

    const resource = resourceMap[id];
    if (!resource) {
      setLoading(false);
      return;
    }

    setTitle(resource.title);

    fetch(resource.file)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('# Coming Soon\n\nThis content is coming soon. Check back later!');
        setLoading(false);
      });
  }, [ready, id]);

  if (!ready) return null;

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(20px, 3vw, 40px)' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '1.1rem', color: 'var(--muted)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(20px, 3vw, 40px) clamp(14px, 3vw, 24px) 80px' }}>
      {/* Back button */}
      <Link href="/resources">
        <button
          className="pill-btn"
          style={{
            fontSize: '0.85rem',
            marginBottom: 24,
            gap: 8,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ← Back to Resources
        </button>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-display, Syne)',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        <div style={{ height: 3, width: 60, background: 'var(--teal)', borderRadius: 2, marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Content */}
      <div
        className="blog-content"
        style={{
          fontSize: '1rem',
          lineHeight: 1.8,
          color: 'var(--text)',
        }}
      >
        <Markdown
          components={{
            h1: ({ children }) => (
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: 40, marginBottom: 20, letterSpacing: '-0.02em' }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 32, marginBottom: 16, letterSpacing: '-0.01em', color: 'var(--teal)' }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 24, marginBottom: 12 }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p style={{ marginBottom: 16, lineHeight: 1.8 }}>{children}</p>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: 8, marginLeft: 24, lineHeight: 1.8 }}>{children}</li>
            ),
            ul: ({ children }) => (
              <ul style={{ marginBottom: 20, lineHeight: 1.8 }}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol style={{ marginBottom: 20, lineHeight: 1.8 }}>{children}</ol>
            ),
            blockquote: ({ children }) => (
              <blockquote style={{
                borderLeft: '4px solid var(--teal)',
                paddingLeft: 20,
                marginLeft: 0,
                marginBottom: 16,
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}>
                {children}
              </blockquote>
            ),
            code: (props: any) => {
              const { inline, children } = props;
              return inline ? (
                <code style={{
                  background: 'rgba(77,217,196,0.1)',
                  color: 'var(--teal)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}>
                  {children}
                </code>
              ) : (
                <pre style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: 8,
                  overflow: 'auto',
                  marginBottom: 16,
                }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {children}
                  </code>
                </pre>
              );
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--teal)',
                  textDecoration: 'underline',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </Markdown>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 16 }}>
          Found this helpful? Share it with other teachers.
        </p>
        <Link href="/resources">
          <button className="pill-btn" style={{ fontSize: '0.85rem' }}>
            Explore More Resources
          </button>
        </Link>
      </div>
    </div>
  );
}
