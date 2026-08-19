// MakeMistakes BuildOS — Dynamic Problem Content Generator

export interface QuizQuestion {
  id: number;
  questionNumber: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xp: number;
}

/** Optional authored Build Phase plan (PDF §7). When absent, derive client-side. */
export interface ProblemBuildTask {
  id?: string;
  title: string;
  description?: string;
  requirements?: string[];
  validationCriteria?: string[];
  hints?: string[];
  connectedTo?: string[];
}

export interface ProblemBuildSpec {
  objective: string;
  tasks: ProblemBuildTask[];
  constraints?: string[];
  hints?: string[];
  validationCriteria?: string[];
  expectedOutcome?: string;
}

export interface ProblemData {
  problemId: string;
  title: string;
  problemStatement: string;
  category?: string;
  country?: string;
  /** Library difficulty label (e.g. Beginner, Intermediate, Advanced, Expert). */
  difficulty?: string | null;
  learning?: { level?: string | null } | null;
  source?: { name: string; type: string };
  relatedInformation?: {
    context?: string;
    affectedParties?: string[];
    existingGaps?: string[];
    opportunity?: string;
  };
  /** Authored build engine fields — preferred when present. */
  build?: ProblemBuildSpec;
  quiz?: QuizQuestion[];
  metadata?: {
    itchScore?: number | null;
    sector?: string | null;
    country?: string | null;
    years?: { start?: number | null; end?: number | null };
    funding?: number | null;
    originalStartup?: string | null;
    failureReason?: string | null;
  };
}

export interface Question {
  id: number;
  questionNumber: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xp: number;
}

export interface ProblemContentResult {
  title: string;
  problemStatement: string;
  subtitle: string;
  category: string;
  isMedicationReminder: boolean;
  articleParagraphs: string[];
  questions: Question[];
}

export function getProblemContent(problemData?: ProblemData | null): ProblemContentResult {
  // If problemData has quiz questions from MongoDB, use them directly as source of truth
  const hasDbQuiz = !!(problemData?.quiz && Array.isArray(problemData.quiz) && problemData.quiz.length > 0);
  const hasDbRelatedInfo = !!(problemData?.relatedInformation && typeof problemData.relatedInformation === "object");

  const isMedicationReminder =
    !!problemData &&
    (problemData.problemId === "medication-reminder" ||
      (problemData.title && problemData.title.toLowerCase().includes("medication reminder")));

  if (isMedicationReminder) {
    return {
      title: "Medication Reminder App",
      problemStatement:
        "Design and build a senior-accessible, low-friction medication tracking application with automatic caregiver SMS notifications for unconfirmed doses.",
      subtitle:
        "Before we build a solution, let's understand the real problem, who it affects, and why solving it matters.",
      category: "Healthcare",
      isMedicationReminder: true,
      articleParagraphs: [
        "Every single day, millions of elderly individuals living with chronic conditions face a quiet, high-stakes battle: taking the right medications at the right time. As prescription lists grow to five, eight, or even ten pills a day, keeping track becomes an overwhelming cognitive burden. For an aging parent, forgetting a morning dose or accidentally double-dosing at night isn't just a minor slip—it can trigger sudden health crashes, emergency room admissions, or irreversible medical complications.",
        "Existing solutions fail those who need them most. Physical plastic pillboxes sit silently on kitchen counters with zero reminders or accountability. Generic smartphone alarms ring without showing critical dosage instructions, and seniors routinely swipe them away during a moment's distraction. Meanwhile, bloated commercial health apps confuse older adults with tiny fonts, aggressive advertisements, complex sign-ins, and unwanted symptom tracking. On the other side of this crisis are anxious family caregivers—adult children who live in constant worry, making daily check-in calls just to verify if their loved ones took their life-saving pills.",
        "Solving this problem matters deeply because medication adherence isn't a complex medical mystery—it's a human routine problem. The real opportunity before us is to build a distraction-free, senior-accessible medication reminder system that makes dose tracking completely effortless while automatically alerting caregivers the moment a critical dose goes unconfirmed.",
      ],
      questions: [
        {
          id: 1,
          questionNumber: "01",
          question: "What is the primary problem described in this case study?",
          options: [
            "Elderly chronic patients struggle with complex schedules, causing missed or duplicated doses.",
            "Pharmacies overcharge for chronic prescription medications.",
            "Telemedicine video calls disconnect frequently during consultations.",
            "Hospitals lack sufficient intensive care beds for elderly patients.",
          ],
          correctIndex: 0,
          explanation:
            "The core problem is that elderly individuals managing multiple daily prescriptions face heavy cognitive overload, leading to missed or duplicated doses.",
          xp: 10,
        },
        {
          id: 2,
          questionNumber: "02",
          question: "Who are the primary people affected by this problem?",
          options: [
            "Hospital billing departments and medical insurance auditors.",
            "Elderly chronic disease patients and their anxious family caregivers.",
            "Clinical drug trial researchers and laboratory technicians.",
            "Software developers building hospital database servers.",
          ],
          correctIndex: 1,
          explanation:
            "Aging patients managing daily prescriptions and their family caregivers (who live in persistent worry) are the primary affected users.",
          xp: 10,
        },
        {
          id: 3,
          questionNumber: "03",
          question: "Why do current solutions like physical pillboxes and phone alarms fail?",
          options: [
            "They require expensive satellite subscription plans.",
            "They cannot run without continuous high-speed 5G connectivity.",
            "Pillboxes provide zero alerts, and alarms lack dosage context or are easily swiped away.",
            "They automatically lock the user's mobile device when ignored.",
          ],
          correctIndex: 2,
          explanation:
            "Physical pillboxes sit silently without active triggers, while basic phone alarms lack dosage details and are routinely dismissed without action.",
          xp: 10,
        },
        {
          id: 4,
          questionNumber: "04",
          question: "What is one major real-world consequence of medication non-adherence?",
          options: [
            "Sudden health crashes, emergency room visits, or dangerous double-dose toxicity.",
            "Immediate cancellation of health insurance coverage.",
            "Permanent cellular network disconnection.",
            "Inability to book routine dental appointments.",
          ],
          correctIndex: 0,
          explanation:
            "Forgetting doses accelerates disease progression, while accidental double-dosing can lead to acute toxicity and emergency hospitalization.",
          xp: 10,
        },
        {
          id: 5,
          questionNumber: "05",
          question: "What is the main opportunity for the Medication Reminder App?",
          options: [
            "To build a senior-accessible, 1-tap dose reminder system with fail-safe caregiver alerts.",
            "To create an online pharmacy delivering pills via autonomous drones.",
            "To launch a social network for senior exercise tracking.",
            "To manufacture plastic pill containers with embedded camera sensors.",
          ],
          correctIndex: 0,
          explanation:
            "The opportunity is to build a distraction-free, senior-accessible system with effortless 1-tap dose logging and automatic caregiver escalation.",
          xp: 10,
        },
      ],
    };
  }

  // Dynamic Content Generation for all database problems
  const title = problemData?.title || "Product Challenge";
  const statement = problemData?.problemStatement || title;
  const category = problemData?.category || "Product Challenge";
  const isFailedStartup = problemData?.source?.type === "failed_startup";
  const startup = problemData?.metadata?.originalStartup || (title.includes("—") ? title.split("—")[0].trim() : title);
  const failureReason = problemData?.metadata?.failureReason || "Market mismatch and unviable unit economics.";
  const country = problemData?.metadata?.country;
  const funding = problemData?.metadata?.funding;
  const itchScore = problemData?.metadata?.itchScore;

  // Use MongoDB relatedInformation if available, otherwise generate paragraphs
  let articleParagraphs: string[];
  if (hasDbRelatedInfo && problemData?.relatedInformation) {
    const ri = problemData.relatedInformation;
    articleParagraphs = [
      ri.context || `In the ${category} sector, stakeholders face: "${statement}"`,
      ri.existingGaps && ri.existingGaps.length > 0
        ? `Key gaps in existing solutions: ${ri.existingGaps.join("; ")}.`
        : `Existing traditional options rely on manual workarounds, fragmented offline channels, or opaque intermediary margins.`,
      ri.opportunity || `Solving this problem creates a direct product opportunity to build a dedicated, transparent digital platform.`,
    ];
  } else {
    const p1 = isFailedStartup
      ? `Post-mortem analysis of ${startup}${country ? ` (${country})` : ""}: ${statement} During its operations, ${startup} encountered critical market friction that impacted adoption and user retention.`
      : `In the ${category} sector${itchScore ? ` (Itch Score: ${itchScore})` : ""}, stakeholders face an unresolved friction: "${statement}" This operational bottleneck creates persistent inefficiency, loss of accountability, and inflated costs across the workflow.`;

    const p2 = isFailedStartup
      ? `Primary root cause of failure: ${failureReason} Existing legacy alternatives failed to address this underlying market reality, leading to unviable unit economics despite raising ${funding ? `$${(funding / 1e6).toFixed(1)}M in capital` : "substantial funding"}.`
      : `Existing traditional options rely on manual workarounds, fragmented offline channels, or opaque intermediary margins. These legacy approaches lack real-time visibility, automated validation, and seamless coordination for end users.`;

    const p3 = `Solving this problem matters deeply because modern engineering can eliminate manual friction through structured software workflows. The core product opportunity is to build a dedicated, transparent digital platform that directly solves: "${statement}"`;

    articleParagraphs = [p1, p2, p3];
  }

  // Use MongoDB quiz if available, otherwise generate questions dynamically
  const questions: Question[] = hasDbQuiz && problemData?.quiz
    ? problemData.quiz.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        xp: q.xp ?? 10,
      }))
    : [
        {
          id: 1,
          questionNumber: "01",
          question: `What is the primary problem statement identified in ${isFailedStartup ? startup : "this challenge"}?`,
          options: [
            statement,
            `High infrastructure costs due to legacy mainframe database maintenance in ${category}.`,
            `Unfavorable currency inflation and international payment gateway transaction fees.`,
            `Lack of senior executive technical talent in early-stage software companies.`,
          ],
          correctIndex: 0,
          explanation: `The core problem identified is: "${statement}"`,
          xp: 10,
        },
        {
          id: 2,
          questionNumber: "02",
          question: `Who are the primary target users/stakeholders affected in this ${category} domain?`,
          options: [
            isFailedStartup
              ? `Target customers of ${startup} in the ${category} market${country ? ` (${country})` : ""}.`
              : `Consumers and business operators in the ${category} sector facing this problem.`,
            `Global cloud hosting providers and database system administrators.`,
            `Government regulatory compliance auditors and tax accountants.`,
            `Offshore hardware manufacturing plant managers.`,
          ],
          correctIndex: 0,
          explanation: `The affected users are stakeholders operating within the ${category} domain experiencing this specific operational barrier.`,
          xp: 10,
        },
        {
          id: 3,
          questionNumber: "03",
          question: isFailedStartup
            ? `According to the post-mortem analysis of ${startup}, what was the main root cause of failure?`
            : `What is the primary operational friction preventing traditional solutions from solving this?`,
          options: [
            isFailedStartup
              ? failureReason
              : `Traditional solutions rely on fragmented manual channels, lack real-time transparency, or impose high margin overheads.`,
            `The product relied on obsolete 1990s dial-up internet connections.`,
            `Failure to secure international trademark rights in secondary markets.`,
            `High employee turnover in corporate human resource departments.`,
          ],
          correctIndex: 0,
          explanation: isFailedStartup
            ? `Post-mortem cause of failure: "${failureReason}"`
            : `Operational friction: Existing options lack real-time digital coordination and transparency.`,
          xp: 10,
        },
        {
          id: 4,
          questionNumber: "04",
          question: `What is the core product & engineering opportunity for solving this problem?`,
          options: [
            `Build a streamlined, dedicated digital workflow that directly eliminates the core friction: "${statement.length > 80 ? statement.slice(0, 80) + "..." : statement}"`,
            `Offer massive promotional discount codes on social media channels.`,
            `Outsource all core technical development to external dev shops.`,
            `Manufacture expensive custom hardware gadgets without software apps.`,
          ],
          correctIndex: 0,
          explanation: `The product opportunity is to design a software workflow that directly targets and solves the core problem statement.`,
          xp: 10,
        },
        {
          id: 5,
          questionNumber: "05",
          question: `What key metric or constraint should engineering teams prioritize when evaluating this ${category} solution?`,
          options: [
            isFailedStartup && funding
              ? `Achieving sustainable unit economics and product-market fit before burning through capital ($${(funding / 1e6).toFixed(1)}M raised).`
              : `Delivering low-friction user experience, high reliability, and sustainable unit economics.`,
            `Maximizing the count of decorative animations on the landing page.`,
            `Storing all data exclusively on physical magnetic tapes.`,
            `Replacing all human interaction with automated phone answering machines.`,
          ],
          correctIndex: 0,
          explanation: `Engineering teams must ensure unit economics, high user retention, and reliable execution.`,
          xp: 10,
        },
      ];

  return {
    title,
    problemStatement: statement,
    subtitle: `Analyze the core problem statement: "${statement}"`,
    category,
    isMedicationReminder: false,
    articleParagraphs,
    questions,
  };
}

