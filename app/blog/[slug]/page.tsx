'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase';
import { getBlogPostBySlug, getBlogSection, getAllBlogPosts } from '@/lib/blogData';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [ready, setReady] = useState(false);
  const post = getBlogPostBySlug(slug);
  const section = post ? getBlogSection(post.section) : null;
  const allPosts = getAllBlogPosts();

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

  if (!post) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(14px,3vw,28px) clamp(14px,3vw,24px) 80px' }}>
        <div className="shell-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Article Not Found</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>This article doesn't exist or has been removed.</p>
          <Link href="/blog">
            <button className="pill-btn">Back to Blog</button>
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts from same section
  const relatedPosts = allPosts
    .filter((p) => p.section === post.section && p.slug !== post.slug)
    .slice(0, 4);

  // Get previous and next posts
  const postIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const previousPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
  const nextPost = postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;

  return (
    <div className="blog-route-page">
      <div className="blog-route-background" aria-hidden="true" />
      <div className="blog-route-content blog-post-page" style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(14px,3vw,28px) clamp(14px,3vw,24px) 80px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--muted)' }}>
        <Link href="/blog" style={{ color: 'var(--teal)', textDecoration: 'none', cursor: 'pointer' }}>
          Blog
        </Link>
        <span>/</span>
        <Link href={`/blog?section=${post.section}`} style={{ color: 'var(--teal)', textDecoration: 'none', cursor: 'pointer' }}>
          {section?.title}
        </Link>
        <span>/</span>
        <span>{post.title}</span>
      </div>

      {/* Article Header */}
      <article>
        <header style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 182, 77, 0.2)',
              color: 'var(--gold)',
              fontWeight: 600
            }}>
              {section?.title}
            </span>
            {post.published ? (
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(76, 175, 175, 0.2)',
                color: '#4cffff',
                fontWeight: 600
              }}>
                Published
              </span>
            ) : (
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--muted)',
                fontWeight: 600
              }}>
                Coming Soon
              </span>
            )}
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.8rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            {post.title}
          </h1>
        </header>

        {/* Article Content */}
        <div className="shell-card blog-article-content" style={{
          padding: 'clamp(24px, 4vw, 40px)',
          borderRadius: '20px',
          marginBottom: '40px',
          minHeight: '400px',
          lineHeight: 1.75,
          color: 'var(--text)'
        }}>
          {post.published ? (
            <ReactMarkdown>{post.content ?? 'This article is being prepared.'}</ReactMarkdown>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔜</div>
              <div style={{ color: 'var(--muted)' }}>
                <p style={{ marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}>Article Coming Soon</p>
                <p style={{ fontSize: '0.95rem', maxWidth: '400px' }}>
                  This article is currently in development. Check back soon for this comprehensive guide on <strong>{post.title}</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Table of Contents / Placeholder */}
        {post.published && (
          <div className="shell-card" style={{
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '40px',
            backgroundColor: 'rgba(76, 175, 175, 0.05)',
            border: '1px solid rgba(76, 175, 175, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Article Sections</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '8px 0', color: 'var(--muted)', fontSize: '0.95rem' }}>📚 Introduction</li>
              <li style={{ padding: '8px 0', color: 'var(--muted)', fontSize: '0.95rem' }}>✅ Key Takeaways</li>
              <li style={{ padding: '8px 0', color: 'var(--muted)', fontSize: '0.95rem' }}>💡 Practical Tips</li>
              <li style={{ padding: '8px 0', color: 'var(--muted)', fontSize: '0.95rem' }}>🎯 Best Practices</li>
            </ul>
          </div>
        )}
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Related Articles</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {relatedPosts.map((relPost) => (
              <Link key={relPost.slug} href={`/blog/${relPost.slug}`}>
                <div className="shell-card" style={{
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(76, 175, 175, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = '';
                }}>
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    marginBottom: '12px',
                    flex: 1
                  }}>
                    {relPost.title}
                  </h3>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '8px'
                  }}>
                    {relPost.published ? '📖 Read' : '🔜 Coming Soon'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '48px'
      }}>
        {previousPost ? (
          <Link href={`/blog/${previousPost.slug}`}>
            <div className="shell-card" style={{
              padding: '20px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px' }}>← Previous Article</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{previousPost.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextPost ? (
          <Link href={`/blog/${nextPost.slug}`}>
            <div className="shell-card" style={{
              padding: '20px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'right'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px' }}>Next Article →</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{nextPost.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Back to Blog */}
      <div style={{ textAlign: 'center', paddingBottom: '24px' }}>
        <Link href="/blog">
          <button className="pill-btn">← Back to Blog</button>
        </Link>
      </div>
      </div>
    </div>
  );
}
