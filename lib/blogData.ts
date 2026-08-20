export interface BlogPost {
  slug: string;
  title: string;
  section: number;
  sectionTitle: string;
  content?: string; // Markdown or HTML content
  published: boolean;
}

export const BLOG_SECTIONS = [
  {
    id: 1,
    title: 'Getting Started as an ESL Teacher',
    description: 'These are ideal for new teachers.',
    posts: [
      { slug: 'beginners-guide-teaching-esl', title: 'A Beginner\'s Guide to Teaching ESL', published: true, content: `# A Beginner's Guide to Teaching ESL

    Teaching English as a second language is a practical, people-first job. Your students need clear language, useful repetition, and enough confidence to try. You do not need a perfect lesson every time; you need a dependable structure that helps learners participate.

    ## Start with a clear objective

    Choose one outcome students can demonstrate by the end of the lesson. For example: "Students can ask and answer three questions about their daily routine." Keep the objective visible, model the target language, and return to it during the closing activity.

    ## Build a predictable lesson rhythm

    1. Warm up with a short question, image, or review game.
    2. Present a small amount of new language in context.
    3. Practise together before asking students to work independently.
    4. Give students a meaningful reason to speak, read, listen, or write.
    5. End with a quick check of the objective.

    ## Make participation achievable

    Give thinking time before calling on students, allow pair rehearsal, and offer sentence starters for learners who need support. Correct selectively: focus on the language that matters for the objective, then let the conversation continue.

    ## Keep improving one lesson at a time

    After class, note one activity that produced useful language and one moment when students became confused or quiet. Adjust that single part for next time. Small, deliberate changes build strong teaching habits faster than trying to redesign everything at once.

    The best ESL lessons are clear, active, and humane. Plan less content, create more opportunities to use it, and let student communication guide your next decision.`, },
      { slug: 'first-esl-class', title: 'Your First ESL Class: What to Do Before, During, and After', published: false },
      { slug: 'plan-first-lesson', title: 'How to Plan Your First ESL Lesson', published: false },
      { slug: 'first-month-teaching', title: 'What to Expect During Your First Month of Teaching', published: false },
      { slug: 'common-mistakes-new-teachers', title: 'Common Mistakes New ESL Teachers Make', published: false },
      { slug: 'build-confidence-new-teacher', title: 'How to Build Confidence as a New ESL Teacher', published: false },
      { slug: 'create-professional-portfolio', title: 'How to Create a Professional ESL Teacher Portfolio', published: false },
      { slug: 'choose-specialization', title: 'How to Choose Your ESL Teaching Specialization', published: false },
      { slug: 'set-professional-goals', title: 'How to Set Professional Goals as an ESL Teacher', published: false },
      { slug: 'dont-know-answer', title: 'What to Do When You Don\'t Know the Answer to a Student\'s Question', published: false },
      { slug: 'survive-difficult-class', title: 'How to Survive Your First Difficult Class', published: false },
    ],
  },
  {
    id: 2,
    title: 'Lesson Planning & Teaching Methodology',
    description: 'This could become one of the biggest sections.',
    posts: [
      { slug: 'plan-effective-lesson', title: 'How to Plan an Effective ESL Lesson', published: false },
      { slug: 'write-learning-objectives', title: 'How to Write Good ESL Learning Objectives', published: false },
      { slug: 'structure-lesson-times', title: 'How to Structure a 30-, 45-, 60-, or 90-Minute ESL Lesson', published: false },
      { slug: 'teach-grammar-engaging', title: 'How to Teach Grammar Without Boring Your Students', published: false },
      { slug: 'teach-vocabulary-effectively', title: 'How to Teach Vocabulary Effectively', published: false },
      { slug: 'teach-speaking', title: 'How to Teach Speaking', published: false },
      { slug: 'teach-listening', title: 'How to Teach Listening', published: false },
      { slug: 'teach-reading', title: 'How to Teach Reading', published: false },
      { slug: 'teach-writing', title: 'How to Teach Writing', published: false },
      { slug: 'teach-pronunciation', title: 'How to Teach Pronunciation', published: false },
      { slug: 'teach-phonics', title: 'How to Teach Phonics', published: false },
      { slug: 'teach-conversation-skills', title: 'How to Teach Conversation Skills', published: false },
      { slug: 'teach-functional-english', title: 'How to Teach Functional English', published: false },
      { slug: 'teach-through-stories', title: 'How to Teach English Through Stories', published: false },
      { slug: 'teach-through-games', title: 'How to Teach English Through Games', published: false },
      { slug: 'use-role-plays', title: 'How to Use Role-Plays in ESL Classes', published: false },
      { slug: 'use-songs-music', title: 'How to Use Songs and Music in ESL Teaching', published: false },
      { slug: 'use-videos-effectively', title: 'How to Use Videos Effectively in ESL Lessons', published: false },
      { slug: 'use-real-world-materials', title: 'How to Use Real-World Materials in ESL Classes', published: false },
      { slug: 'teach-without-textbook', title: 'How to Teach Without a Textbook', published: false },
    ],
  },
  {
    id: 3,
    title: 'Classroom Management',
    description: 'You already have a great starting point here.',
    posts: [
      { slug: 'classroom-management-conflict-resolution', title: 'Classroom Management and Conflict Resolution', published: true, content: `# Classroom Management and Conflict Resolution

    Good classroom management is not about controlling every movement. It is about making expectations visible, routines familiar, and repair possible when something goes wrong. Students participate more readily when they know what will happen next and believe they will be treated fairly.

    ## Establish routines before problems appear

    Teach the small procedures explicitly: how students enter, get materials, change partners, ask for help, and finish an activity. Practise the routine briefly, then reinforce it with specific feedback such as, "This group moved to pairs quickly and quietly."

    ## Address behaviour calmly and specifically

    Describe the behaviour and its impact rather than judging the student. A useful sequence is: remind the class expectation, give the student a private choice, and explain the next step. Keep your voice neutral and your instruction short.

    ## Resolve conflict with a reset

    Separate students from the audience when possible. Let each person explain what happened without interruption, identify the shared classroom expectation, and agree on one repair action. The goal is restored participation, not a public victory.

    ## Prevent recurring disruption

    Look for patterns: time of day, task difficulty, seating, unclear instructions, or a student who needs a more active role. Change the condition that is feeding the problem, then check in privately with the learner.

    Consistent routines and respectful follow-through create a safer classroom than punishment alone. Be firm about the boundary, curious about the cause, and ready to welcome students back into the lesson.`, },
      { slug: 'deal-disruptive-students', title: 'How to Deal With Disruptive Students', published: false },
      { slug: 'students-refuse-participate', title: 'How to Deal With Students Who Refuse to Participate', published: false },
      { slug: 'handle-chatty-students', title: 'How to Handle Chatty Students', published: false },
      { slug: 'handle-quiet-students', title: 'How to Handle Extremely Quiet Students', published: false },
      { slug: 'manage-large-classes', title: 'How to Manage Large ESL Classes', published: false },
      { slug: 'manage-small-classes', title: 'How to Manage Small ESL Classes', published: false },
      { slug: 'manage-mixed-level-classes', title: 'How to Manage Mixed-Level Classes', published: false },
      { slug: 'manage-group-pair-work', title: 'How to Manage Group and Pair Work', published: false },
      { slug: 'deal-difficult-parents', title: 'How to Deal With Difficult Parents', published: false },
      { slug: 'handle-student-complaints', title: 'How to Handle Student Complaints', published: false },
      { slug: 'establish-rules-routines', title: 'How to Establish Classroom Rules and Routines', published: false },
      { slug: 'deal-bullying', title: 'How to Deal With Bullying in the ESL Classroom', published: false },
      { slug: 'handle-student-arguments', title: 'How to Handle Student Arguments', published: false },
      { slug: 'manage-classroom-noise', title: 'How to Manage Classroom Noise', published: false },
      { slug: 'keep-students-engaged', title: 'How to Keep Students Engaged', published: false },
      { slug: 'manage-transitions', title: 'How to Manage Transitions Between Activities', published: false },
    ],
  },
  {
    id: 4,
    title: 'Teaching Different Students',
    description: 'This is extremely important because children, teenagers, and adults require different approaches.',
    posts: [
      { slug: 'teach-young-children', title: 'How to Teach ESL to Young Children', published: false },
      { slug: 'teach-teenagers', title: 'How to Teach ESL to Teenagers', published: false },
      { slug: 'teach-adults', title: 'How to Teach ESL to Adults', published: false },
      { slug: 'teach-complete-beginners', title: 'How to Teach Complete Beginners', published: false },
      { slug: 'teach-intermediate-students', title: 'How to Teach Intermediate ESL Students', published: false },
      { slug: 'teach-advanced-students', title: 'How to Teach Advanced ESL Students', published: false },
      { slug: 'teach-mixed-ability', title: 'How to Teach Mixed-Ability Classes', published: false },
      { slug: 'teach-shy-students', title: 'How to Teach Shy Students', published: false },
      { slug: 'teach-highly-motivated', title: 'How to Teach Highly Motivated Students', published: false },
      { slug: 'teach-low-motivation', title: 'How to Teach Students With Low Motivation', published: false },
      { slug: 'teach-afraid-mistakes', title: 'How to Teach Students Who Are Afraid of Making Mistakes', published: false },
      { slug: 'teach-already-know-english', title: 'How to Teach Students Who Already Know a Lot of English', published: false },
      { slug: 'teach-different-cultures', title: 'How to Teach Students From Different Cultural Backgrounds', published: false },
      { slug: 'adapt-lessons-learning-needs', title: 'How to Adapt Lessons for Different Learning Needs', published: false },
    ],
  },
  {
    id: 5,
    title: 'Assessment & Student Progress',
    description: 'A lot of teachers don\'t think deeply enough about assessment.',
    posts: [
      { slug: 'assess-esl-students', title: 'How to Assess ESL Students', published: false },
      { slug: 'give-useful-feedback', title: 'How to Give Useful ESL Feedback', published: false },
      { slug: 'correct-errors-effectively', title: 'How to Correct Student Errors Effectively', published: false },
      { slug: 'test-vocabulary-no-translation', title: 'How to Test Vocabulary Without Relying on Translation', published: false },
      { slug: 'assess-speaking', title: 'How to Assess Speaking', published: false },
      { slug: 'assess-writing', title: 'How to Assess Writing', published: false },
      { slug: 'assess-listening', title: 'How to Assess Listening', published: false },
      { slug: 'assess-reading', title: 'How to Assess Reading', published: false },
      { slug: 'formative-summative-assessment', title: 'Formative vs. Summative Assessment for ESL Teachers', published: false },
      { slug: 'track-student-progress', title: 'How to Track Student Progress', published: false },
      { slug: 'give-grades-fairly', title: 'How to Give Grades Fairly', published: false },
      { slug: 'create-esl-quiz', title: 'How to Create an ESL Quiz', published: false },
      { slug: 'create-esl-test', title: 'How to Create an ESL Test', published: false },
      { slug: 'identify-real-english-level', title: 'How to Identify a Student\'s Real English Level', published: false },
      { slug: 'give-progress-report', title: 'How to Give a Useful Student Progress Report', published: false },
    ],
  },
  {
    id: 6,
    title: 'Teaching English Effectively',
    description: 'These could become more advanced methodology articles.',
    posts: [
      { slug: 'accuracy-vs-fluency', title: 'Accuracy vs. Fluency: What Should ESL Teachers Prioritize?', published: false },
      { slug: 'understand-cant-speak', title: 'Why Students Understand English but Can\'t Speak It', published: false },
      { slug: 'why-forget-vocabulary', title: 'Why Students Forget Vocabulary', published: false },
      { slug: 'repetition-language-learning', title: 'How Repetition Improves Language Learning', published: false },
      { slug: 'use-spaced-repetition', title: 'How to Use Spaced Repetition in ESL', published: false },
      { slug: 'think-in-english', title: 'How to Encourage Students to Think in English', published: false },
      { slug: 'increase-student-talking-time', title: 'How to Increase Student Talking Time', published: false },
      { slug: 'reduce-teacher-talking-time', title: 'How to Reduce Teacher Talking Time', published: false },
      { slug: 'teach-learn-independently', title: 'How to Teach Students to Learn Independently', published: false },
      { slug: 'build-student-confidence', title: 'How to Build Student Confidence', published: false },
      { slug: 'learn-from-mistakes', title: 'How to Teach Students to Learn From Their Mistakes', published: false },
      { slug: 'encourage-questions', title: 'How to Encourage Students to Ask Questions', published: false },
      { slug: 'develop-critical-thinking', title: 'How to Develop Critical Thinking Through ESL', published: false },
      { slug: 'teach-communication-memorization', title: 'How to Teach Communication Instead of Memorization', published: false },
    ],
  },
  {
    id: 7,
    title: 'Technology & Modern ESL Teaching',
    description: 'This would be especially valuable for teachers today.',
    posts: [
      { slug: 'use-ai-esl-teacher', title: 'How to Use AI as an ESL Teacher', published: false },
      { slug: 'students-use-ai-responsibly', title: 'How Students Can Use AI Without Becoming Dependent on It', published: false },
      { slug: 'digital-tools-esl', title: 'Best Digital Tools for ESL Teachers', published: false },
      { slug: 'create-interactive-activities', title: 'How to Create Interactive ESL Activities', published: false },
      { slug: 'create-digital-games', title: 'How to Create Digital ESL Games', published: false },
      { slug: 'use-online-whiteboards', title: 'How to Use Online Whiteboards', published: false },
      { slug: 'teach-esl-online', title: 'How to Teach ESL Online', published: false },
      { slug: 'manage-online-classroom', title: 'How to Manage an Online ESL Classroom', published: false },
      { slug: 'keep-online-students-engaged', title: 'How to Keep Online Students Engaged', published: false },
      { slug: 'teach-zoom-platforms', title: 'How to Teach ESL Using Zoom or Similar Platforms', published: false },
      { slug: 'create-digital-worksheets', title: 'How to Create Digital Worksheets', published: false },
      { slug: 'create-interactive-quizzes', title: 'How to Create Interactive Quizzes', published: false },
      { slug: 'use-educational-videos', title: 'How to Use Educational Videos', published: false },
      { slug: 'use-technology-without-distraction', title: 'How to Use Technology Without Distracting Students', published: false },
      { slug: 'ai-changing-esl', title: 'How AI Is Changing ESL Teaching', published: false },
    ],
  },
  {
    id: 8,
    title: 'Professional Development',
    description: 'This is where the blog can move beyond beginners.',
    posts: [
      { slug: 'become-better-teacher', title: 'How to Become a Better ESL Teacher', published: false },
      { slug: 'reflect-on-teaching', title: 'How to Reflect on Your Teaching', published: false },
      { slug: 'record-evaluate-lessons', title: 'How to Record and Evaluate Your Own Lessons', published: false },
      { slug: 'build-teaching-philosophy', title: 'How to Build Your Teaching Philosophy', published: false },
      { slug: 'find-teaching-niche', title: 'How to Find Your ESL Teaching Niche', published: false },
      { slug: 'develop-own-materials', title: 'How to Develop Your Own Teaching Materials', published: false },
      { slug: 'build-resource-library', title: 'How to Build an ESL Resource Library', published: false },
      { slug: 'continue-learning-after-tefl', title: 'How to Continue Learning After Getting TEFL Certified', published: false },
      { slug: 'esl-teacher-qualifications', title: 'Qualifications Every ESL Teacher Should Consider', published: false },
      { slug: 'find-mentor', title: 'How to Find a Mentor as an ESL Teacher', published: false },
      { slug: 'give-receive-feedback', title: 'How to Give and Receive Feedback From Other Teachers', published: false },
      { slug: 'experienced-teachers-improve', title: 'How Experienced Teachers Continue Improving', published: false },
      { slug: 'avoid-teacher-burnout', title: 'How to Avoid Teacher Burnout', published: false },
      { slug: 'maintain-work-life-balance', title: 'How to Maintain Work-Life Balance as an ESL Teacher', published: false },
      { slug: 'build-long-term-career', title: 'How to Build a Long-Term ESL Teaching Career', published: false },
    ],
  },
  {
    id: 9,
    title: 'Career & Money',
    description: 'This is a huge area that many ESL blogs neglect.',
    posts: [
      { slug: 'find-first-esl-job', title: 'How to Find Your First ESL Teaching Job', published: false },
      { slug: 'find-online-esl-jobs', title: 'How to Find Online ESL Teaching Jobs', published: false },
      { slug: 'compare-esl-jobs', title: 'How to Compare ESL Teaching Jobs', published: false },
      { slug: 'know-if-job-worth-taking', title: 'How to Know If an ESL Teaching Job Is Worth Taking', published: false },
      { slug: 'negotiate-salary', title: 'How to Negotiate Your ESL Teaching Salary', published: false },
      { slug: 'increase-teaching-income', title: 'How to Increase Your ESL Teaching Income', published: false },
      { slug: 'start-private-lessons', title: 'How to Start Teaching Private ESL Lessons', published: false },
      { slug: 'find-private-students', title: 'How to Find Private ESL Students', published: false },
      { slug: 'build-teaching-business', title: 'How to Build an ESL Teaching Business', published: false },
      { slug: 'create-esl-course', title: 'How to Create an ESL Course', published: false },
      { slug: 'sell-esl-courses-online', title: 'How to Sell ESL Courses Online', published: false },
      { slug: 'create-materials-to-sell', title: 'How to Create ESL Teaching Materials to Sell', published: false },
      { slug: 'build-personal-brand', title: 'How to Build a Personal Brand as an ESL Teacher', published: false },
      { slug: 'use-linkedin', title: 'How to Use LinkedIn as an ESL Teacher', published: false },
      { slug: 'market-yourself', title: 'How to Market Yourself as an ESL Teacher', published: false },
      { slug: 'low-paid-higher-paid', title: 'How to Move From Low-Paid ESL Work to Higher-Paid Teaching', published: false },
      { slug: 'teach-business-english', title: 'How to Teach Business English', published: false },
      { slug: 'specialize-exam-prep', title: 'How to Specialize in Exam Preparation', published: false },
      { slug: 'build-premium-service', title: 'How to Build a Premium ESL Service', published: false },
      { slug: 'stop-trading-hours', title: 'How to Stop Trading Hours for Money as an ESL Teacher', published: false },
    ],
  },
  {
    id: 10,
    title: 'Advanced Teaching & Teacher Leadership',
    description: 'For experienced teachers, more sophisticated teaching strategies.',
    posts: [
      { slug: 'become-senior-teacher', title: 'How to Become a Senior ESL Teacher', published: false },
      { slug: 'mentor-new-teachers', title: 'How to Mentor New ESL Teachers', published: false },
      { slug: 'observe-lesson', title: 'How to Observe Another Teacher\'s Lesson', published: false },
      { slug: 'give-constructive-feedback', title: 'How to Give Constructive Feedback to Teachers', published: false },
      { slug: 'lead-teaching-team', title: 'How to Lead an ESL Teaching Team', published: false },
      { slug: 'design-esl-curriculum', title: 'How to Design an ESL Curriculum', published: false },
      { slug: 'create-school-program', title: 'How to Create a School-Wide ESL Program', published: false },
      { slug: 'standardize-assessments', title: 'How to Standardize ESL Assessments', published: false },
      { slug: 'train-esl-teachers', title: 'How to Train ESL Teachers', published: false },
      { slug: 'conduct-workshops', title: 'How to Conduct Effective Teacher Development Workshops', published: false },
      { slug: 'use-data-improve-programs', title: 'How to Use Data to Improve ESL Programs', published: false },
      { slug: 'evaluate-materials', title: 'How to Evaluate ESL Teaching Materials', published: false },
      { slug: 'develop-framework', title: 'How to Develop a Teaching Framework', published: false },
      { slug: 'build-professional-community', title: 'How to Build a Professional Teaching Community', published: false },
    ],
  },
  {
    id: 11,
    title: 'The Human Side of Teaching',
    description: 'About the realities teachers don\'t always talk about.',
    posts: [
      { slug: 'what-nobody-tells-you', title: 'What Nobody Tells You About Being an ESL Teacher', published: false },
      { slug: 'deal-bad-day', title: 'How to Deal With a Bad Teaching Day', published: false },
      { slug: 'recover-terrible-lesson', title: 'How to Recover After a Terrible Lesson', published: false },
      { slug: 'feel-like-bad-teacher', title: 'What to Do When You Feel Like a Bad Teacher', published: false },
      { slug: 'handle-imposter-syndrome', title: 'How to Handle Teacher Imposter Syndrome', published: false },
      { slug: 'stop-comparing-yourself', title: 'How to Stop Comparing Yourself to Other Teachers', published: false },
      { slug: 'difficult-students-personally', title: 'How to Deal With Difficult Students Without Taking It Personally', published: false },
      { slug: 'protect-your-energy', title: 'How to Protect Your Energy as a Teacher', published: false },
      { slug: 'avoid-burnout', title: 'How to Avoid Burnout', published: false },
      { slug: 'know-when-to-leave', title: 'How to Know When It\'s Time to Leave a Teaching Job', published: false },
      { slug: 'stay-motivated-years', title: 'How to Stay Motivated After Years of Teaching', published: false },
      { slug: 'keep-teaching-fun', title: 'How to Keep Teaching Fun for Yourself', published: false },
    ],
  },
  {
    id: 12,
    title: 'Practical "Teacher Survival" Posts',
    description: 'Highly searchable articles for common classroom challenges.',
    posts: [
      { slug: 'finish-lesson-early', title: 'What to Do When You Finish Your Lesson Early', published: false },
      { slug: 'activity-doesnt-work', title: 'What to Do When an Activity Doesn\'t Work', published: false },
      { slug: 'technology-stops-working', title: 'What to Do When Technology Stops Working', published: false },
      { slug: 'students-dont-understand-instructions', title: 'What to Do When Students Don\'t Understand Your Instructions', published: false },
      { slug: 'students-dont-speak', title: 'What to Do When Students Don\'t Speak', published: false },
      { slug: 'students-speak-too-much', title: 'What to Do When Students Speak Too Much', published: false },
      { slug: 'lesson-too-difficult', title: 'What to Do When Your Lesson Is Too Difficult', published: false },
      { slug: 'lesson-too-easy', title: 'What to Do When Your Lesson Is Too Easy', published: false },
      { slug: 'run-out-of-activities', title: 'What to Do When You Run Out of Activities', published: false },
      { slug: 'students-hate-lesson', title: 'What to Do When Students Hate Your Lesson', published: false },
      { slug: 'make-mistake-in-class', title: 'What to Do When You Make a Mistake in Class', published: false },
      { slug: 'student-asks-cant-answer', title: 'What to Do When a Student Asks a Question You Can\'t Answer', published: false },
      { slug: 'unexpected-substitute-class', title: 'What to Do When You Have an Unexpected Substitute Class', published: false },
      { slug: 'esl-activities-ready', title: '10 ESL Activities Every Teacher Should Have Ready', published: false },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  const allPosts: BlogPost[] = [];
  BLOG_SECTIONS.forEach((section) => {
    section.posts.forEach((post) => {
      allPosts.push({
        slug: post.slug,
        title: post.title,
        section: section.id,
        sectionTitle: section.title,
        content: post.content,
        published: post.published,
      });
    });
  });
  return allPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

export function getBlogSection(sectionId: number) {
  return BLOG_SECTIONS.find((s) => s.id === sectionId);
}
