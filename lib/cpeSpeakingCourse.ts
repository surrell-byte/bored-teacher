export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  focus: string;
  objectives: string[];
  teaching: string[];
  activity: { title: string; prompt: string; steps: string[] };
  selfCheck: string[];
}

export const CPE_PRACTICE_THEMES = [
  { test: 1, title: 'Technology and language learning', detail: 'Technology’s influence on people and the reasons people learn languages.' },
  { test: 2, title: 'Outdoor life and the environment', detail: 'How people use outdoor spaces and what encourages care for nature.' },
  { test: 3, title: 'Medicine and living arrangements', detail: 'Working in healthcare, independence, and changing family patterns.' },
  { test: 4, title: 'Natural threats and success', detail: 'Risks from the natural world, achievement, sport, and opportunity.' },
  { test: 5, title: 'Careers and wealth', detail: 'The contribution of different professions and the social effects of wealth.' },
  { test: 6, title: 'Animal welfare and education', detail: 'Human responsibility for animals and different approaches to learning.' },
  { test: 7, title: 'Group behaviour and competition', detail: 'How groups shape behaviour and where competition helps or harms.' },
  { test: 8, title: 'Public speaking and friendship', detail: 'Speaking in front of others, close relationships, and social networks.' },
];

export const CPE_SPEAKING_LESSONS: CourseLesson[] = [
  {
    id: 'know-the-test',
    title: 'Understand the three-part Speaking paper',
    duration: '15 min',
    focus: 'Understand the paired speaking test and plan your practice.',
    objectives: ['Describe the three parts and their timing in the book’s 2013 exam format.', 'Name the four analytical criteria used to assess speaking.'],
    teaching: [
      'At C2 level, a strong speaker does more than use advanced vocabulary. They answer the task, develop ideas, make their meaning easy to follow, and respond to another person naturally.',
      'This book prepares learners for the 2013 Cambridge English: Proficiency format. It describes a paired Speaking paper of about 16 minutes with three parts: a short interview; a two-stage collaborative task; and individual long turns followed by discussion.',
      'In Part 2, candidates first discuss a focused question about selected pictures, then discuss options and agree which best meets a wider goal. In Part 3, each candidate gives an individual long turn, responds to a brief follow-up exchange, and joins a final discussion.',
      'The book describes four analytical scales in its introduction. Current Cambridge guidance names five: grammatical resource, lexical resource, discourse management, pronunciation, and interactive communication, plus a separate Global Achievement mark. This course uses the current assessment framing while following the same three-part task structure.',
    ],
    activity: { title: 'Set a baseline', prompt: 'Speak for one minute about a skill you have learned outside school or work.', steps: ['Record one attempt without stopping.', 'Listen once for grammar and vocabulary, organisation, pronunciation, and responsiveness.', 'Choose one goal for this course: fluency, precision, organisation, pronunciation, or interaction.'] },
    selfCheck: ['I can describe how the three-part exam is organised.', 'I have chosen one specific skill to improve.'],
  },
  {
    id: 'interview',
    title: 'Answer interview questions with depth',
    duration: '20 min',
    focus: 'Give direct, developed answers without sounding memorised.',
    objectives: ['Answer the question in the first sentence.', 'Add a reason, example, or contrast to extend the answer.'],
    teaching: [
      'In the opening interview, the examiner asks each candidate about familiar experiences and opinions. Aim for a natural response of a few connected sentences, not a speech prepared in advance.',
      'Use a simple expansion pattern: answer, explain why, then add a small example or qualification. If asked whether you enjoy travelling, for example, say what you enjoy and give one concrete reason.',
      'Listen to the exact wording. A question about what you would change invites a hypothetical answer; a question about what you usually do asks about a habit. Relevance matters more than length.',
    ],
    activity: { title: 'Three-sentence answers', prompt: 'How has technology changed the way people learn new skills?', steps: ['Give a direct answer.', 'Explain one effect.', 'Add an example or mention a limitation.', 'Repeat with: What makes a place enjoyable to live in?'] },
    selfCheck: ['My first sentence answers the question directly.', 'I add a reason or example instead of repeating the same idea.', 'My answer sounds spontaneous.'],
  },
  {
    id: 'long-turn',
    title: 'Collaborate through the two-stage task',
    duration: '25 min',
    focus: 'Discuss a focused question, then compare options and agree on a choice.',
    objectives: ['Use the first stage to compare selected pictures against one focused question.', 'Use the longer stage to evaluate options and reach a shared decision.'],
    teaching: [
      'In Part 2, candidates work together for about four minutes. They first discuss a focused question about two selected pictures for roughly one minute. Then they consider a wider set of ideas and decide which would best meet the task goal for about three minutes.',
      'The first stage is not a race to describe every picture. Identify a useful contrast, connect it to the question, and react to your partner. In the second stage, explore a few options, compare them against the goal, and state a joint choice.',
      'Share the work: propose an idea, explain why it fits, and invite a response. If you disagree, acknowledge the useful part of your partner’s suggestion and add a reason for another option. Keep an eye on time so you can reach a decision.',
    ],
    activity: { title: 'Run a two-stage paired task', prompt: 'A public radio programme is planning an episode about how people share knowledge. Imagine pictures showing a family member teaching a craft, people learning through an online tutorial, and a group at a practical workshop.', steps: ['Stage 1 (about one minute): compare two situations and discuss how people might benefit from them.', 'Stage 2 (about three minutes): discuss which situation would make the most engaging radio episode and agree on one.', 'Use a timer and make sure both partners contribute before deciding.', 'Afterwards, note one moment when you built on your partner’s idea.'] },
    selfCheck: ['I responded to my partner during the focused picture discussion.', 'I compared options against the wider task goal.', 'We reached a shared decision within the time.'],
  },
  {
    id: 'collaborate',
    title: 'Give a well-shaped individual long turn',
    duration: '25 min',
    focus: 'Speak for about two minutes from a question card, then join the follow-up exchange.',
    objectives: ['Organise a sustained response around the card’s main question.', 'Use the suggested ideas selectively and listen for the follow-up discussion.'],
    teaching: [
      'In Part 3, each candidate receives a question card with a main question and optional ideas. Each speaks alone for about two minutes. The other candidate listens and is then invited into a short exchange with the speaker.',
      'Plan a clear route: state your view, develop two or three relevant ideas, and connect them back to the question. The prompts are support, not a checklist. Choose the points you can explain well.',
      'Use examples to make abstract points concrete, but leave room to finish. When your partner speaks, listen for one point you can respond to rather than planning your own answer. In the exchange, agree, qualify, or offer a different perspective with a reason.',
    ],
    activity: { title: 'Deliver a two-minute answer', prompt: 'What makes a public space valuable to the people who use it? You may consider accessibility, activities, safety, or a sense of community.', steps: ['Take 30 seconds to choose two ideas and one example.', 'Speak for up to two minutes, answering the main question throughout.', 'Let your partner ask: “Which of those qualities matters most to you, and why?”', 'Respond directly, then invite your partner’s view.'] },
    selfCheck: ['My response stayed connected to the main question.', 'I developed ideas instead of listing them.', 'I listened and responded during the follow-up.'],
  },
  {
    id: 'discussion',
    title: 'Take part in the final discussion',
    duration: '20 min',
    focus: 'Discuss the broader theme with both candidates for several minutes.',
    objectives: ['Explain and qualify an opinion.', 'Build on a partner’s contribution before adding a new point.'],
    teaching: [
      'After both long turns and follow-up exchanges, the examiner invites both candidates to discuss the wider topic. In the book’s format this discussion lasts up to about four minutes. Questions may ask about society, motivations, advantages, drawbacks, or ways to evaluate an idea.',
      'Support an opinion with a reason, then show its limits: “That may be true when…, although…” or “The benefit is…, provided that…”. Qualification shows careful thinking and gives your partner something to respond to.',
      'Avoid turning every answer into a personal story. A brief example can help, but return to the wider issue and invite another perspective.',
    ],
    activity: { title: 'Develop a balanced discussion', prompt: 'How can communities encourage people to share useful skills and knowledge?', steps: ['Candidate A gives one way and explains why it might work.', 'Candidate B responds and offers a different approach.', 'Consider what makes learning effective for different people.', 'Finish by discussing whether formal classes are always the best way to learn.'] },
    selfCheck: ['I supported my view with a reason.', 'I recognised a limitation or alternative.', 'I built on a previous contribution.'],
  },
  {
    id: 'language-and-clarity',
    title: 'Improve accuracy, organisation, and clarity',
    duration: '20 min',
    focus: 'Use flexible vocabulary, clear signposting, and intelligible pronunciation.',
    objectives: ['Paraphrase when a word is missing.', 'Use emphasis and pausing to make key ideas clear.'],
    teaching: [
      'Range is strongest when it is controlled. Choose collocations that fit the meaning, vary sentence structures when useful, and prefer a precise familiar word to an impressive but inaccurate one.',
      'Use signposts to show relationships: contrast (“whereas”), cause (“as a result”), qualification (“to some extent”), or a new point (“another consideration”). Do not stack them mechanically at the start of every sentence.',
      'Pronunciation is about being understood. Stress the important word in a phrase, group related words together, and pause at a boundary between ideas. If you cannot recall a word, describe its function or give an example.',
    ],
    activity: { title: 'Paraphrase and signpost', prompt: 'Explain the idea of “a flexible working schedule” without using those exact words. Then compare its benefits with a fixed schedule.', steps: ['Describe the idea in different words.', 'Add one benefit and one possible drawback.', 'Use a contrast marker naturally.', 'Say the answer again, pausing between the benefit and drawback.'] },
    selfCheck: ['I can explain an idea when I forget a specific word.', 'My linking phrases clarify the relationship between points.', 'My key words are easy to hear.'],
  },
  {
    id: 'mock-test',
    title: 'Complete a three-part mock speaking session',
    duration: '30 min',
    focus: 'Practise switching between individual speech and interaction.',
    objectives: ['Complete a sequence of varied speaking tasks.', 'Review performance using observable evidence.'],
    teaching: [
      'A full practice session should follow the book’s three-part sequence: a short interview; a two-stage collaborative task; then individual long turns, brief follow-up exchanges, and a final discussion. In the book’s version, the test takes about 16 minutes for a pair.',
      'Review evidence, not impressions. Notice whether you answered the prompt, developed relevant ideas, shared the interaction, and made the structure easy to follow. Choose one priority for the next attempt.',
      'Repeat the task after feedback. A second attempt helps turn one observation into a practical change, such as adding clearer comparisons or inviting your partner earlier.',
    ],
    activity: { title: 'Three-part practice', prompt: 'Use one theme throughout: how people learn and share skills.', steps: ['Part 1: answer a couple of personal questions about learning, work, or leisure.', 'Part 2: compare two ways people learn; then discuss options for a short community programme and agree on the best one.', 'Part 3: each candidate speaks for two minutes about an effective way to learn a skill, then responds to a follow-up question.', 'Finish with a joint discussion about why people learn new skills and whether learning is more effective alone or with others.', 'Review one strength and choose one specific change for your next attempt.'] },
    selfCheck: ['I adapted my response to each task type.', 'I shared the discussion rather than dominating or withdrawing.', 'I identified a specific next step.'],
  },
];
