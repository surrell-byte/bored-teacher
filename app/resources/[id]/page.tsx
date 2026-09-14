'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const RESOURCE_DETAILS: Record<string, {
  icon: string;
  title: string;
  type: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
  download?: string;
}> = {
  r1: {
    icon: '📖',
    title: 'ESL Game Hub - Teacher Guide',
    type: 'Study Guide',
    intro: 'A practical starting point for planning vocabulary, grammar, phonics, and cross-curricular game sessions.',
    sections: [
      { heading: 'Before class', body: ['Choose a game that matches the target language and learner age.', 'Play one round yourself and decide which words or question types need a quick introduction.'] },
      { heading: 'During class', body: ['Model the first turn on a projector.', 'Pair confident readers with learners who benefit from support.', 'Pause between rounds to ask learners what strategy helped them.'] },
      { heading: 'After class', body: ['Use the score and accuracy information as a conversation starter, not a ranking.', 'Record one follow-up activity for the next lesson.'] },
    ],
    download: '/resources/esl-teaching-guide.md',
  },
  t2: {
    icon: '🏆',
    title: 'Running a Games Tournament',
    type: 'Tip Sheet',
    intro: 'A ready-to-use 30-minute tournament plan with grouping, timing, and reflection prompts.',
    sections: [
      { heading: 'Quick format', body: ['Run three short rounds with pairs or small teams.', 'Give points for accuracy, teamwork, and respectful turn-taking.', 'Finish with a reflection round so every learner can name one improvement.'] },
      { heading: 'Teacher checklist', body: ['Test the games before class.', 'Keep a visible score sheet.', 'Offer a quiet alternative for learners who need a break.'] },
    ],
    download: '/resources/games-tournament-guide.md',
  },
  w3: {
    icon: '🌍',
    title: 'Flags of the World - Reference Card',
    type: 'Worksheet',
    intro: 'Use visual clues such as stripes, stars, crosses, emblems, and colour combinations to prepare for Flagmaster.',
    sections: [
      { heading: 'Study routine', body: ['Look at a flag for five seconds.', 'Say one visual clue aloud.', 'Connect the clue to a country or region.', 'Explain your reasoning after checking the answer.'] },
    ],
    download: '/resources/flags-of-the-world-reference-card.md',
  },
  w4: {
    icon: '🔬',
    title: 'Ocean Creature Classification Grid',
    type: 'Worksheet',
    intro: 'Classify ocean creatures by their main group before playing Ocean Quest or Deep Sea Reveal.',
    sections: [
      { heading: 'How to use it', body: ['Complete the grid individually or in pairs.', 'Ask learners to explain one clue for each classification.', 'Use the explanations as a warm-up before the game.'] },
    ],
    download: '/resources/ocean-classification-grid.md',
  },
};

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const resource = RESOURCE_DETAILS[params?.id ?? ''];

  if (!resource) {
    return <main className="resource-detail-page"><section className="resource-detail-card"><h1>Resource not found</h1><Link href="/resources" className="pill-btn">Back to resources</Link></section></main>;
  }

  return (
    <main className="resource-detail-page">
      <article className="resource-detail-card">
        <Link href="/resources" className="resource-detail-back">← Resource library</Link>
        <div className="resource-detail-icon" aria-hidden="true">{resource.icon}</div>
        <p className="resource-detail-type">{resource.type}</p>
        <h1>{resource.title}</h1>
        <p className="resource-detail-intro">{resource.intro}</p>
        <div className="resource-detail-sections">
          {resource.sections.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map(item => <p key={item}>{item}</p>)}
            </section>
          ))}
        </div>
        {resource.download && <a className="pill-btn resource-detail-download" href={resource.download} download>Download resource</a>}
      </article>
    </main>
  );
}
