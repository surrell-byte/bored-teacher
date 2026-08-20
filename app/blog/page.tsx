'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { BLOG_SECTIONS } from '@/lib/blogData';
import Link from 'next/link';

export default function BlogPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isGuest = localStorage.getItem('guestUser') === 'true';
    if (isGuest) {
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      setReady(true);
    });
    return unsub;
  }, [router]);

  if (!ready) return null;

  return (
    <div className="blog-route-page">
      <div className="blog-route-background" aria-hidden="true" />
      <div className="blog-route-content" style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(14px,3vw,28px) clamp(14px,3vw,24px) 80px' }}>
      {/* Hero Section */}
      <div className="shell-card resources-hero" style={{ padding: 'clamp(20px, 4vw, 40px)', marginBottom: 24, borderRadius: 32 }}>
        <div>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 8 }}>
            📚 ESL Teaching Blog
          </div>
          <h1 style={{ fontFamily: 'var(--font-display, Syne)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
            ESL Teacher Resources & Guides
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.94rem', maxWidth: '70ch', lineHeight: 1.7 }}>
            Explore comprehensive guides covering everything from lesson planning and classroom management to career development and professional growth. Whether you're just starting out or an experienced teacher looking to improve, you'll find practical strategies and insights here.
          </p>
        </div>
      </div>

      {/* Blog Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {BLOG_SECTIONS.map((section) => (
          <section key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 182, 77, 0.1)',
                fontSize: '1.4rem',
                flexShrink: 0
              }}>
                {section.id}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', 
                  fontWeight: 700, 
                  marginBottom: '4px',
                  letterSpacing: '-0.02em'
                }}>
                  {section.title}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {section.description}
                </p>
              </div>
            </div>

            {/* Posts Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
              marginTop: '12px'
            }}>
              {section.posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <div className="shell-card" style={{
                    padding: '16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: '140px',
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(255, 182, 77, 0.02) 0%, rgba(76, 175, 175, 0.02) 100%)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 182, 77, 0.06) 0%, rgba(76, 175, 175, 0.06) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(255, 182, 77, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 182, 77, 0.02) 0%, rgba(76, 175, 175, 0.02) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        flex: 1,
                        color: '#fff',
                      }}>
                        {post.title}
                      </h3>
                      {post.published ? (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(76, 175, 175, 0.3)',
                          color: '#4cffff',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.05em'
                        }}>
                          Published
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'var(--muted)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.05em'
                        }}>
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      marginTop: 'auto',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      {post.published ? '📖 Read Article' : '🔜 Coming Soon'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Stats Footer */}
      <div style={{
        marginTop: '64px',
        padding: '32px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(255, 182, 77, 0.05) 0%, rgba(76, 175, 175, 0.05) 100%)',
        border: '1px solid rgba(255, 182, 77, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Blog Statistics
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '4px' }}>
              {BLOG_SECTIONS.reduce((acc, s) => acc + s.posts.length, 0)}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Total Articles</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '4px' }}>
              {BLOG_SECTIONS.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Categories</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)', marginBottom: '4px' }}>
              {BLOG_SECTIONS.reduce((acc, s) => acc + s.posts.filter(p => p.published).length, 0)}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Published</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
