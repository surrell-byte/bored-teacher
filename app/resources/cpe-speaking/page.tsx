'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CPE_PRACTICE_THEMES, CPE_SPEAKING_LESSONS } from '@/lib/cpeSpeakingCourse';

const PROGRESS_KEY = 'cpe-speaking-course-progress-v1';

export default function CpeSpeakingCoursePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const lesson = CPE_SPEAKING_LESSONS[activeIndex];
  const progress = Math.round((completed.length / CPE_SPEAKING_LESSONS.length) * 100);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompleted(parsed.filter((id): id is string => typeof id === 'string'));
      }
    } catch {
      // Keep the course usable when browser storage is unavailable.
    }
    setReady(true);
  }, []);

  function toggleComplete() {
    const next = completed.includes(lesson.id)
      ? completed.filter(id => id !== lesson.id)
      : [...completed, lesson.id];
    setCompleted(next);
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    } catch {
      // Progress remains available until this page is closed.
    }
  }

  function selectLesson(index: number) {
    setActiveIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!ready) return null;

  return (
    <main className="cpe-course-page">
      <div className="cpe-course-wrap">
        <Link href="/resources" className="cpe-course-back">← Resource library</Link>

        <header className="cpe-course-hero">
          <div className="cpe-course-kicker">Cambridge English · C2 Proficiency</div>
          <div className="cpe-course-hero-layout">
            <div>
              <h1>Speak with confidence</h1>
              <p className="cpe-course-subtitle">A practical course for the Proficiency Speaking paper</p>
              <p className="cpe-course-intro">Build clear, flexible answers, sustain an individual turn, collaborate with a partner, and discuss wider ideas. Work through seven short lessons and practise with fresh prompts.</p>
            </div>
            <div className="cpe-course-badge" aria-label="7 lessons, approximately 2 hours 35 minutes">🎙️<span>7 lessons</span><small>~2 hr 35 min</small></div>
          </div>
          <div className="cpe-course-progress-row">
            <div className="cpe-course-progress-copy"><strong>Your progress</strong><span>{completed.length} of {CPE_SPEAKING_LESSONS.length} lessons · {progress}%</span></div>
            <div className="cpe-course-progress-track" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        <div className="cpe-course-layout">
          <nav className="cpe-course-nav" aria-label="Course lessons">
            <h2>Course lessons</h2>
            <ol>
              {CPE_SPEAKING_LESSONS.map((item, index) => (
                <li key={item.id}>
                  <button className={index === activeIndex ? 'active' : ''} onClick={() => selectLesson(index)} aria-current={index === activeIndex ? 'step' : undefined}>
                    <span className="cpe-course-nav-number">{completed.includes(item.id) ? '✓' : index + 1}</span>
                    <span className="cpe-course-nav-label"><strong>{item.title}</strong><small>{item.duration}</small></span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="cpe-course-nav-note">Your completion is saved in this browser.</p>
          </nav>

          <article className="cpe-course-lesson">
            <div className="cpe-course-lesson-meta"><span>LESSON {activeIndex + 1} OF {CPE_SPEAKING_LESSONS.length}</span><span>{lesson.duration}</span></div>
            <h2>{lesson.title}</h2>
            <p className="cpe-course-focus">{lesson.focus}</p>

            <section className="cpe-course-section">
              <h3>By the end, you can</h3>
              <ul className="cpe-course-objectives">{lesson.objectives.map(item => <li key={item}>{item}</li>)}</ul>
            </section>

            <section className="cpe-course-section cpe-course-teaching">
              <h3>Learn</h3>
              {lesson.teaching.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>

            <section className="cpe-course-activity">
              <div className="cpe-course-activity-label">PRACTISE</div>
              <h3>{lesson.activity.title}</h3>
              <p className="cpe-course-prompt">{lesson.activity.prompt}</p>
              <ol>{lesson.activity.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
              <p className="cpe-course-activity-tip">If you can, record your response or practise with a partner. Then use the checklist below to choose one thing to improve.</p>
            </section>

            <section className="cpe-course-section cpe-course-check">
              <h3>Reflect on your attempt</h3>
              <ul>{lesson.selfCheck.map(item => <li key={item}><span aria-hidden="true">□</span>{item}</li>)}</ul>
            </section>

            <div className="cpe-course-actions">
              <button className={`cpe-course-complete${completed.includes(lesson.id) ? ' done' : ''}`} onClick={toggleComplete}>
                {completed.includes(lesson.id) ? '✓ Lesson complete' : 'Mark lesson complete'}
              </button>
              <div className="cpe-course-step-actions">
                <button className="cpe-course-step-btn" onClick={() => selectLesson(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>Previous</button>
                <button className="cpe-course-step-btn next" onClick={() => selectLesson(Math.min(CPE_SPEAKING_LESSONS.length - 1, activeIndex + 1))} disabled={activeIndex === CPE_SPEAKING_LESSONS.length - 1}>Next lesson →</button>
              </div>
            </div>
          </article>
        </div>

        <section className="cpe-course-themes">
          <div className="cpe-course-activity-label">FROM THE EIGHT PRACTICE TESTS</div>
          <h2>Explore the book’s speaking themes</h2>
          <p>Use these themes to repeat the course activities with fresh subject matter. The supplied PDF contains the Speaking section for Tests 1–8, plus the exam overview and extra Part 1 topics.</p>
          <div className="cpe-course-theme-grid">
            {CPE_PRACTICE_THEMES.map(theme => <article key={theme.test}><span>TEST {theme.test}</span><h3>{theme.title}</h3><p>{theme.detail}</p></article>)}
          </div>
        </section>

        <footer className="cpe-course-source">Course reference: <em>Succeed in Cambridge English: Proficiency — 8 Practice Tests</em> (Speaking section). Explanations and activities in this course are newly written. <a href="https://www.cambridgeenglish.org/exams-and-tests/qualifications/proficiency/format/" target="_blank" rel="noreferrer">Check Cambridge’s current exam format ↗</a></footer>
      </div>
    </main>
  );
}
