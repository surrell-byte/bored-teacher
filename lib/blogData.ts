export interface BlogPost {
  slug: string;
  title: string;
  section: number;
  sectionTitle: string;
  content?: string; // Markdown or HTML content
  published: boolean;
}

const ARTICLE_CONTENT: Record<string, string> = {
  'first-esl-class': `# Your First ESL Class: What to Do Before, During, and After

Your first ESL class does not need to be perfect. The goal is to help students feel comfortable, learn something useful, and leave with a positive impression of English.

## Before class

Learn what you can about students' ages, levels, interests, class size, and learning goals. Choose one simple, measurable objective. Prepare only the materials that support it, test your technology, and keep a paper, board, or speaking activity ready as a backup.

## During class

Greet students warmly, introduce yourself, and use questions appropriate to their level. Keep instructions short: “Work with a partner. Ask these questions.” Demonstrate the task, check understanding with a specific question, and give students plenty of time to speak. Correct important errors without interrupting every sentence. Games are useful when they give students a clear reason to practise English.

## After class

Review what worked, what confused students, whether the objective was achieved, and what you would change. Keep notes about names, levels, interests, and useful activities. Your first class is not a final test; it is the first piece of evidence that helps you improve.`,
  'plan-first-lesson': `# How to Plan Your First ESL Lesson

Start with the end in mind. Write one objective describing what students will be able to do, such as “Students will be able to order food using three polite expressions.” Then identify the vocabulary, grammar, or functions they need.

## A simple sequence

Use a five-to-ten-minute warm-up to activate prior knowledge. Present a small amount of language in context, show examples, check meaning, and move into controlled practice such as matching or sentence completion. Finish with communication: a role-play, interview, information gap, or short presentation. Protect the final minutes for review and an exit task.

Write approximate timings beside each stage, but treat the plan as a guide rather than a script. Prepare concise instructions, model the activity, and plan support for learners who need sentence starters or word banks. Add an extension for faster students and a no-technology backup. After class, record what worked and revise one stage for next time.`,
  'first-month-teaching': `# What to Expect During Your First Month of Teaching

The first month is a period of observation, routine-building, experimentation, and reflection. In week one, learn names, levels, interests, school procedures, and how long activities really take. Your lessons may not follow the plan; treat those moments as useful information.

In week two, create predictable beginnings and endings. A greeting, review, objective, and closing question make classes feel organised. In week three, try different groupings, games, visual materials, and speaking tasks while noticing your natural strengths. Do not compare your first month with another teacher's years of experience.

In week four, review what students need next and keep a list of effective materials. You may still feel nervous, and difficult classes may still happen. Build calm routines, protect your energy, reuse good resources, and make one improvement each week. Confidence grows from repeated experience, not from getting everything right immediately.`,
  'common-mistakes-new-teachers': `# Common Mistakes New ESL Teachers Make

New teachers often try to teach too much, talk too long, give complicated instructions, and correct every error. A focused lesson with one clear objective and abundant student practice is usually more effective than a crowded lesson plan.

Use simple language, demonstrate activities, check understanding with specific questions, and give learners thinking time. Correct errors that affect meaning, repeat across the class, or connect to the lesson. Grammar matters, but students also need to use it in real communication. Games should have a learning purpose.

Adjust support for different ability levels with word banks, examples, sentence starters, or extension challenges. Avoid overloaded slides and dependence on technology; keep a backup activity ready. Be warm, clear, and consistent with expectations. After each lesson, write down what to keep, change, and try. Progress matters more than perfection, and a failed activity can become valuable feedback for the next class.`,
  'create-professional-portfolio': `# How to Create a Professional ESL Teacher Portfolio

A portfolio shows what you can do, not only what certificates you hold. Begin with a clear introduction explaining who you teach, what you offer, and how your lessons help learners. Add relevant qualifications, teaching experience, age groups, levels, and environments.

Explain your teaching philosophy in plain language. Show your style through sample lesson plans, worksheets, games, presentations, or speaking activities. Include three to five strong lesson examples with objectives, target language, timing, materials, and assessment. Genuine student feedback and measurable progress are useful when shared with permission and without private information.

Keep the portfolio easy to navigate with sections such as About, Qualifications, Experience, Specialisations, Materials, Feedback, and Contact. Use consistent typography, clear headings, good images, and generous space. Update it whenever you gain experience or create useful work. You do not need years of teaching before starting; your portfolio should grow alongside your career.`,
  'choose-specialization': `# How to Choose Your ESL Teaching Specialization

A specialization gives your teaching career direction without putting you in a permanent box. Consider the learners you enjoy, your existing strengths, subjects you understand, and problems you can genuinely help students solve. Possible directions include young learners, teenagers, adults, Business English, exam preparation, conversation, phonics, travel, or English for a specific profession.

Research student needs, qualifications, resources, and opportunities before committing. Try different classes and reflect on what you enjoyed, where you were effective, and what you want to learn next. You can combine areas, such as young learners and phonics or professionals and Business English.

Build expertise through reading, training, observation, and materials development. Let your portfolio and marketing show the specialisation clearly. Choose a direction based on interest, strengths, student need, and sustainable opportunity rather than money alone. Your first specialisation can change as your experience develops.`,
  'set-professional-goals': `# How to Set Professional Goals as an ESL Teacher

Professional goals help you move from one lesson to the next with a clear direction. Think about the students, subjects, environment, income, and responsibilities you want in the future. Then choose a small number of goals across teaching, professional development, career, or business.

Make goals SMART: specific, measurable, achievable, relevant, and time-bound. “Become a better teacher” can become “For the next three months, I will complete one course and use three new techniques.” Break large ambitions into small actions, track progress in a notebook or spreadsheet, and review goals monthly.

Include goals for classroom management, student participation, qualifications, resources, income, or specialisation. Avoid setting so many goals that none receives attention. Learn from missed targets, adjust goals when circumstances change, and celebrate small milestones. A sustainable career is built from consistent actions that match your life, not from an impressive plan that exhausts you.`,
  'dont-know-answer': `# What to Do When You Don't Know the Answer to a Student's Question

No teacher knows everything. When a difficult question appears, stay calm and acknowledge it: “That is a good question.” Be honest: “I am not sure, and I do not want to give you the wrong answer.” Then decide whether to investigate together, ask what students think, use context, or write the question down for later.

Check reliable dictionaries, grammar references, teaching materials, or other trusted sources. Be careful to distinguish incorrect language from language that is possible but unusual, informal, or regionally different. When you return with an answer, explain it at the learner's level and use clear examples.

A question can become a useful lesson in vocabulary, critical thinking, dictionary skills, or independent learning. Follow up when you promise to do so, keep a notebook of questions, and never invent an explanation just to appear confident. Saying “I don't know yet; let's find out” is professional teaching.`,
  'survive-difficult-class': `# How to Survive Your First Difficult Class

Stay calm, pause, and avoid shouting over students. Regain attention with a short reset such as “Books closed. Look at me.” Keep expectations few, clear, and consistent. Use proximity, students' names, positive reinforcement, and private choices before escalating a problem.

Check whether confusion, excessive difficulty, boredom, weak transitions, or too much teacher talk is feeding the behaviour. Simplify the task, demonstrate it, add movement, change the grouping, or switch to a backup activity when necessary. Do not embarrass students or turn a challenge into a public argument. Separate behaviour from the person and follow your school's procedures for consequences.

After class, identify the trigger and choose one or two changes for next time. Ask a mentor or experienced teacher for help. Serious bullying, threats, violence, or safeguarding concerns require institutional support. One difficult lesson does not define you; it is information that can help you become calmer, clearer, and more effective.`,
};

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
      { slug: 'first-esl-class', title: 'Your First ESL Class: What to Do Before, During, and After', published: true, content: ARTICLE_CONTENT['first-esl-class'] },
      { slug: 'plan-first-lesson', title: 'How to Plan Your First ESL Lesson', published: true, content: ARTICLE_CONTENT['plan-first-lesson'] },
      { slug: 'first-month-teaching', title: 'What to Expect During Your First Month of Teaching', published: true, content: ARTICLE_CONTENT['first-month-teaching'] },
      { slug: 'common-mistakes-new-teachers', title: 'Common Mistakes New ESL Teachers Make', published: true, content: ARTICLE_CONTENT['common-mistakes-new-teachers'] },
      { slug: 'build-confidence-new-teacher', title: 'How to Build Confidence as a New ESL Teacher', published: false },
      { slug: 'create-professional-portfolio', title: 'How to Create a Professional ESL Teacher Portfolio', published: true, content: ARTICLE_CONTENT['create-professional-portfolio'] },
      { slug: 'choose-specialization', title: 'How to Choose Your ESL Teaching Specialization', published: true, content: ARTICLE_CONTENT['choose-specialization'] },
      { slug: 'set-professional-goals', title: 'How to Set Professional Goals as an ESL Teacher', published: true, content: ARTICLE_CONTENT['set-professional-goals'] },
      { slug: 'dont-know-answer', title: 'What to Do When You Don\'t Know the Answer to a Student\'s Question', published: true, content: ARTICLE_CONTENT['dont-know-answer'] },
      { slug: 'survive-difficult-class', title: 'How to Survive Your First Difficult Class', published: true, content: ARTICLE_CONTENT['survive-difficult-class'] },
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
      { slug: 'custom-word-list-builder', title: 'How to Build a Custom Word List Activity', published: true, content: `# How to Build a Custom Word List Activity

    Start with the language your students actually need to use. A useful custom list is short, purposeful, and connected to the lesson rather than a collection of every unfamiliar word.

    ## Choose the words

    Select eight to twelve words that appear in the next reading, topic, or conversation. Include a mix of familiar words for confidence and new words for stretch. Add a simple definition, example, or picture prompt for each one.

    ## Turn the list into practice

    Use the list in three passes: students recognise the words, match them to meanings or images, and then use them in a sentence. Keep the first round quick, then spend more time on the words that cause difficulty.

    ## Revisit the list

    Bring the same words back later in the week through a game, exit ticket, or pair challenge. Spaced practice helps students remember more than one long vocabulary drill.

    The best word list is small enough to use well and flexible enough to return to. Let student errors tell you which words deserve another round.`, },
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
