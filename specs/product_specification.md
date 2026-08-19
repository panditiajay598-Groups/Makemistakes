# MakeMistakes Product Specification & Clickable Prototype
*Authored by: Head of Product (Apple), former VP of Product (Airbnb), Staff Product Designer (Linear), Senior UX Researcher (IDEO), and Founding SaaS Engineer.*

---

## 1. Executive Summary & Design System

### The Paradigm Shift
Most learning platforms optimization loops look like: **Friction Reduction → Copy-Paste → Pseudo-Success**. 
*MakeMistakes* reverses this loop: **Deliberate Friction → Active Struggle → Cognitive Realignment**. 

We do not teach syntax. We teach the psychological recovery process of failing in public. This specification details the entire student journey, from sign-up to hiring, followed by the founder evaluation loop.

### Design Language & System Tokens
To implement this seamlessly in modern UI code (e.g. React/Tailwind/CSS modules), we establish the following tokens:
*   **Background (SaaS Dark Mode):** `#09090B` (Slate-Black) / `#18181B` (Zinc-900)
*   **Primary Action (Linear Amber):** `#F59E0B` (Warm warning/focus amber) - represents energy, attention, and work-in-progress.
*   **System Green (Airbnb Mint):** `#10B981` - representing successful iteration and hiring signals.
*   **System Red (Apple Crimson):** `#EF4444` - representing execution errors, runtime crashes, and compiler alerts.
*   **Typography:** Outfit (Headings - clean geometry) / Inter (Body - high readability UI text) / JetBrains Mono (Code & CLI components)
*   **Transitions:** `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-premium ease-out, 300ms)

---

## 2. Interactive Screen-by-Screen Prototypes (1 to 26)

Below are the blueprints for every screen in the customer journey. Each screen is defined with 25 product attributes to ensure zero implementation ambiguity.

---

### Screen 1: The Landing Page (The Hook)
* **Screen Name:** The Landing Page (`/`)
* **Purpose:** Convert high-intent, self-directed learners by confronting them with their fear of failing.
* **User Emotion:** Mild impostor syndrome, curiosity, frustration with traditional tutorials.
* **User Goal:** Understand what MakeMistakes is and decide if it's worth their scarce time.
* **Information Shown:** Hero message ("Learn by crashing code. Get hired by showing how you fixed it."), interactive mini terminal simulating a live server crash, case studies of hired engineers, and pricing transparency ($0 to build, founders pay to hire).
* **Information Intentionally Hidden:** Complex syllabus, videos, standard corporate badges, fluff marketing copy, pricing tiers (it is free for builders).
* **Primary CTA:** `[Start Crashing Code]` (Navigates to `/signup`).
* **Secondary CTA:** `[Watch a 60s Debug Run]` (Opens inline overlay video player).
* **Components:** Hero block, interactive CSS terminal module, live "Hiring Now" ticker showing roles and startup logos, minimalist footer.
* **Layout Hierarchy:** 
  1. H1 (Bold Outfit font, centered)
  2. Mini-CLI sandbox (interactive, fixed height, center-stage)
  3. Primary CTA (pulse glow border)
  4. Minimalist value propositions (3 columns, large icons).
* **Mobile Behaviour:** Stacked layout, Terminal collapses to a static, readable code-diff container with a play button.
* **Desktop Behaviour:** Two-column grid: left is copy and CTA, right is the live interactive mini terminal.
* **Empty State:** N/A (Marketing landing page).
* **Loading State:** Bare minimum SVG skeletons for startup logos, instant font loading with fallback sans-serif.
* **Success State:** Interactive terminal accepts keystrokes, runs mock compilation, triggers a mock `NullPointerException`, then transforms into the CTA.
* **Error State:** If mock sandbox environment crashes, display static fallback SVG representing a real terminal error message: `"Process finished with exit code 1"`.
* **AI Behaviour:** A subtle mock chatbot inside the mini terminal reacts to user typing with Socratic hints.
* **Backend Events:** N/A (Static assets via CDN).
* **Database Updates:** None.
* **Analytics Events:** `landing_page_viewed`, `hero_cta_clicked`, `mock_terminal_interaction_count`.
* **Accessibility Notes:** Terminal text uses high-contrast JetBrains Mono with `aria-live="polite"` announcing CLI states.
* **Edge Cases:** User enters command injections in the mock CLI; the JS-based mock sandbox intercepts and outputs a humorous response: `"Nice try. We sandbox everything here too."`
* **Micro Interactions:** Hovering over the Primary CTA increases the amber outline intensity and shifts the background gradient.
* **Animations:** Subtle blinking terminal cursor (`#F59E0B`), slow scrolling hiring ticker.
* **Why this screen exists:** Traditional landing pages sell comfort. This screen sells the discomfort of hard engineering, filtering for users who want to build real systems.

---

### Screen 2: Sign Up (The Threshold)
* **Screen Name:** Sign Up (`/signup`)
* **Purpose:** Create an account with the absolute minimum friction possible.
* **User Emotion:** Impatient, hopeful, cautious about spam.
* **User Goal:** Authenticate and cross into the onboarding flow under 5 seconds.
* **Information Shown:** Single sign-on options (Google, GitHub), single text field for email, privacy policy agreement checkbox, legal assurance ("We will never sell your data or email you without permission").
* **Information Intentionally Hidden:** Standard password fields, password confirmation, phone numbers, addresses, user profile configurations.
* **Primary CTA:** `[Continue with GitHub]` (Redirects to OAuth page).
* **Secondary CTA:** `[Continue with Google]` (Redirects to Google OAuth page).
* **Components:** OAuth container card, custom "Terms of Service" custom checkbox, minimalistic input card.
* **Layout Hierarchy:** Centered container, prominent logo, oauth button stack, email fallback input, footer disclaimer.
* **Mobile Behaviour:** Full screen width card, touch targets expanded to 48px height.
* **Desktop Behaviour:** Floating layout card (width: 420px) centered vertically and horizontally on Zinc-950 background.
* **Empty State:** N/A.
* **Loading State:** Clicking OAuth initiates a spinning amber ring on the active button; all other options disable.
* **Success State:** Redirects directly to `/welcome`.
* **Error State:** Display alert banner: `"Authentication failed: Account already linked via another provider"`.
* **AI Behaviour:** None.
* **Backend Events:** Initialize JWT session, issue authentication token.
* **Database Updates:** Create `users` record with generated UUID, empty settings profile, and set `auth_provider` token.
* **Analytics Events:** `signup_started`, `oauth_clicked` (label: provider), `signup_completed`.
* **Accessibility Notes:** Full keyboard navigation support (tab index), elements have explicit `aria-label` settings.
* **Edge Cases:** User has blocked third-party cookies; detect this and show a descriptive fallback message suggesting email login link.
* **Micro Interactions:** Google and GitHub logos display color hover states; the main checkbox scales slightly when toggled.
* **Animations:** Clean card fade-in (`opacity: 0` to `1` over 150ms).
* **Why this screen exists:** Standard sign-ups drop conversion by asking for usernames, passwords, and bios. We bypass all of it to get them building.

---

### Screen 3: Google Login (Third Party Handshake)
* **Screen Name:** Google Login API (`/api/auth/callback/google`)
* **Purpose:** Process the OAuth callback handshake from Google.
* **User Emotion:** Neutral, expecting a fast redirection.
* **User Goal:** Fast return to the application workspace.
* **Information Shown:** Animated loader saying "Verifying secure handshake with Google..."
* **Information Intentionally Hidden:** Entire UI (it is a system transition screen).
* **Primary CTA:** N/A.
* **Secondary CTA:** N/A.
* **Components:** Fullscreen loader.
* **Layout Hierarchy:** Absolute center loader on slate black canvas.
* **Mobile Behaviour:** Identical to desktop.
* **Desktop Behaviour:** Identical to mobile.
* **Empty State:** N/A.
* **Loading State:** Centered loader showing: "Securing keys..."
* **Success State:** Redirects immediately to `/welcome`.
* **Error State:** If callback fails or state token is invalid: display a retry button and redirection links.
* **AI Behaviour:** None.
* **Backend Events:** Exchange auth code for access token, query user details from Google userinfo API, create session cookie.
* **Database Updates:** Store `google_id`, `avatar_url`, and verified `email`.
* **Analytics Events:** `google_auth_callback_received`, `google_auth_success`.
* **Accessibility Notes:** Accessible spinner with screen reader description "Loading OAuth handshake state".
* **Edge Cases:** Google returns authorization error (e.g., user clicked cancel); handle gracefully by returning to `/signup` with a toast alert.
* **Micro Interactions:** Spinner speed increases as verification completes.
* **Animations:** Rotation loop of the amber loader ring.
* **Why this screen exists:** Intermediate security screen required to securely handle third-party auth callbacks without leaving the browser in a vulnerable state.

---

### Screen 4: Welcome Screen (Setting the Rules of Engagement)
* **Screen Name:** Welcome Onboarding (`/welcome`)
* **Purpose:** Introduce the philosophical rules of MakeMistakes: No copy-pasting, Socratic AI coaching, and proof of work validation.
* **User Emotion:** Slightly nervous but motivated.
* **User Goal:** Accept the terms of the learning experience and start onboarding.
* **Information Shown:** 3 Core Principles ("1. We will never write your code. 2. Your mistakes are your portfolio. 3. You only pass when your system works under heavy simulation.").
* **Information Intentionally Hidden:** Project catalogs, pricing, profile settings.
* **Primary CTA:** `[I Accept the Challenge]` (Redirects to `/onboarding/career-goal`).
* **Secondary CTA:** `[Cancel Account]` (Deletes temporary session, returns to landing).
* **Components:** Multi-step horizontal stepper, rule cards, signature interaction block.
* **Layout Hierarchy:** Progress indicator (Step 1 of 3) at top, large title, centered checklist cards, full-width footer with primary action.
* **Mobile Behaviour:** Scrollable cards vertical layout, fixed footer CTA.
* **Desktop Behaviour:** Sleek horizontal row of cards with interactive hover effects.
* **Empty State:** N/A.
* **Loading State:** Transition to next step displays a fading layout effect.
* **Success State:** Acceptance recorded, transitions user to the career selection UI.
* **Error State:** N/A.
* **AI Behaviour:** None.
* **Backend Events:** Update user profile state to `accepted_terms = true`.
* **Database Updates:** `UPDATE users SET accepted_terms = TRUE WHERE id = user_id`.
* **Analytics Events:** `welcome_screen_viewed`, `terms_accepted`.
* **Accessibility Notes:** High contrast text elements, focus traps prevented during keyboard navigation.
* **Edge Cases:** User attempts to click continue without checking the confirmation box; prompt with screen shake and alert label.
* **Micro Interactions:** Hovering over rule cards expands their shadow and border width.
* **Animations:** Slide-in transitions from the right edge for content blocks.
* **Why this screen exists:** To establish the social contract. If users expect GPT-4 to write code for them here, they will churn immediately. We set expectations upfront.

---

### Screen 5: Career Goal Selection (Target Setup)
* **Screen Name:** Career Goal Selection (`/onboarding/career-goal`)
* **Purpose:** Define the precise professional endpoint the user wants to reach.
* **User Emotion:** Ambivalent, wanting guidance on what roles are actually hiring.
* **User Goal:** Set their target career track.
* **Information Shown:** 3 Curated Tracks: Backend Engineer (Distributed Systems), Frontend Engineer (Complex Client Architectures), Full Stack Engineer (AI-First Products), each with real startup open roles, salary ranges, and difficulty ratings.
* **Information Intentionally Hidden:** Fluff curricula, generalist certificates.
* **Primary CTA:** `[Select Track & Continue]` (Initially disabled until a track is chosen).
* **Secondary CTA:** `[Customize My Own Track]` (Opens modal for advanced custom skills).
* **Components:** Grid of 3 role cards, interactive salary/demand chart, active job matching preview sidebar.
* **Layout Hierarchy:** Heading, 3-column track selector, details drawer showing required skills for selected track.
* **Mobile Behaviour:** Swipeable cards layout, details drawer opens from bottom of screen.
* **Desktop Behaviour:** Grid layout with interactive hover state displaying job demand trends.
* **Empty State:** Drawer is empty until a track is clicked.
* **Loading State:** Shimmer effects on the startup hiring data panels.
* **Success State:** Selecting a track updates the details panel dynamically with active roles.
* **Error State:** Unable to fetch jobs from API; shows fallback static target jobs list.
* **AI Behaviour:** Dynamically processes choice to draft personalized roadmap parameters in background.
* **Backend Events:** Save user target role, query mock market statistics.
* **Database Updates:** `UPDATE user_profiles SET target_role = selected_role WHERE user_id = current_user`.
* **Analytics Events:** `career_goal_selected` (role: selected_role), `custom_track_modal_opened`.
* **Accessibility Notes:** `role="radiogroup"` wrapping the selection cards, clear screen-reader state announcements.
* **Edge Cases:** Internet drops while updating selected role; fallback local storage keeps selection until connection returns.
* **Micro Interactions:** Hovering over cards scales up hiring company logos inside the preview module.
* **Animations:** Fade-in-up transition for the skill list drawer.
* **Why this screen exists:** Alignment. Without a clear target, the Socratic AI cannot contextualize why a specific error or bug matters.

---

### Screen 6: Skill Assessment (The Baseline)
* **Screen Name:** Skill Assessment Onboarding (`/onboarding/assessment`)
* **Purpose:** Determine the user's initial technical capabilities to calibrate the AI Coach's initial difficulty.
* **User Emotion:** Defensive, fearing failure, expecting a boring trivia quiz.
* **User Goal:** Complete assessment fast without feeling stupid.
* **Information Shown:** An interactive terminal prompt asking: "Choose your level: Senior, Mid, Junior, or Complete Beginner" along with a quick 3-question diagnostic run in JS/TS/Go.
* **Information Intentionally Hidden:** Standard multiple-choice questions with obvious answers.
* **Primary CTA:** `[Submit Answers]` (Submits code snippet fixes).
* **Secondary CTA:** `[Skip to Junior Track]` (Defaults baseline to minimum, skips test).
* **Components:** Code terminal panel, interactive syntax highlighter editor, diagnostic output logs.
* **Layout Hierarchy:** Split view: left side has prompt text and timer (no pressure, just tracking), right side has editable code editor.
* **Mobile Behaviour:** Editor replaced with clean multiple-choice debugging options due to mobile coding constraints.
* **Desktop Behaviour:** Full IDE simulator built with Monaco Editor.
* **Empty State:** Sandbox defaults to code templates.
* **Loading State:** "Evaluating code patterns..." loader with typing skeleton.
* **Success State:** Dynamic calibration complete, shows success message: `"Calibrated. Level: Mid-Backend"`.
* **Error State:** Compilation fails; prompts user to edit syntax and re-submit.
* **AI Behaviour:** Analyzes user code formatting, syntax correction speed, and comment quality to estimate baseline capabilities.
* **Backend Events:** Spin temporary container, execute code against test cases, evaluate AST (Abstract Syntax Tree).
* **Database Updates:** Write diagnostic score and detected proficiency level to `user_profiles`.
* **Analytics Events:** `assessment_completed`, `assessment_skipped`, `calibration_level` (detected: level).
* **Accessibility Notes:** High contrast theme options (light/dark) for the editor panel, screen-reader focus transitions.
* **Edge Cases:** Code timeouts (infinite loop protection limits run to 1000ms); terminates run and returns descriptive runtime error.
* **Micro Interactions:** Code line changes trigger live compiler indicator changes in the border color.
* **Animations:** Compilation output logs scroll up automatically in terminal console.
* **Why this screen exists:** Calibrating. Starting too hard causes churn; starting too easy causes boredom. We calibrate dynamically.

---

### Screen 7: AI Understanding User (The Calibration Screen)
* **Screen Name:** AI Calibration Engine (`/onboarding/calibration`)
* **Purpose:** Bridge the gap between user choice and platform experience by displaying the personalized learning persona the AI built.
* **User Emotion:** Validated, understood, curious.
* **User Goal:** Confirm their profile parameters.
* **Information Shown:** AI's analytical summary of user's skills ("Pragmatic, good with APIs, struggles with state and database indexing"), personalized roadmap title, estimated hours to target role.
* **Information Intentionally Hidden:** Complicated machine learning weight vectors.
* **Primary CTA:** `[Generate My Roadmap]` (Triggers full graph creation).
* **Secondary CTA:** `[Adjust Profile Parameters]` (Returns to Assessment).
* **Components:** Dynamic graph generation widget, AI conversational breakdown panel.
* **Layout Hierarchy:** Centered block. Left: AI message block with customized parameters. Right: Dynamic SVG spider map showing skill areas.
* **Mobile Behaviour:** Horizontal scrolling tabs to toggle between AI summary text and the spider chart.
* **Desktop Behaviour:** Side-by-side interactive dynamic layout.
* **Empty State:** N/A.
* **Loading State:** Loading state showing: "Synthesizing career targets, job market data, and code diagnostics..."
* **Success State:** Spider chart rendering points and glowing indicators.
* **Error State:** Network failure: local storage retrieves offline profile model.
* **AI Behaviour:** Dynamic synthesis text generation based on skill assessment and selected tracks.
* **Backend Events:** Generate initial custom milestone graph based on profile variables.
* **Database Updates:** Insert records into `user_roadmaps` mapping milestone dependencies.
* **Analytics Events:** `calibration_confirmed`, `spider_chart_interacted`.
* **Accessibility Notes:** Table-equivalent representation of the spider chart for visually impaired users.
* **Edge Cases:** Socratic AI engine determines inconsistent profile data; triggers a warning text asking user to retry code diagnostic.
* **Micro Interactions:** Hovering over points on the spider map displays detailed skill tooltip definitions.
* **Animations:** Spider graph nodes slide outwards from center on initial load.
* **Why this screen exists:** Psychological hook. Showing the user a custom-designed analysis of their strengths builds confidence and trust in the AI Coach.

---

### Screen 8: Personalized Roadmap (The Plan)
* **Screen Name:** Custom Roadmap Visualizer (`/roadmap`)
* **Purpose:** Give users a clear path of progressive milestones leading to employment.
* **User Emotion:** Determined, organized, clear on next actions.
* **User Goal:** Start the first milestone project.
* **Information Shown:** Interactive map of 4 key milestones, milestone locks, prerequisites, job match score indicators.
* **Information Intentionally Hidden:** Internal sub-tasks (revealed only when inside a milestone to avoid cognitive overload).
* **Primary CTA:** `[Enter Milestone 1: Distributed Cache]` (Unlocks workspace).
* **Secondary CTA:** `[View Hiring Startups for this Milestone]` (Slide drawer displaying logos).
* **Components:** Interconnected node graph path, progress line indicator, milestone details panel.
* **Layout Hierarchy:** Linear vertical timeline, active node glows, upcoming nodes semi-opaque, completed nodes checked.
* **Mobile Behaviour:** Vertically stacked card deck list view instead of the node graph.
* **Desktop Behaviour:** SVG-based interactive canvas layout.
* **Empty State:** N/A.
* **Loading State:** Node connection lines animate from top to bottom.
* **Success State:** User clicks milestone node, panel slides open revealing project brief.
* **Error State:** Failed state fallback resets view to basic CSS list outline.
* **AI Behaviour:** Dynamically changes milestone requirements based on market job listings fetched in background.
* **Backend Events:** Set active milestone progress parameters.
* **Database Updates:** `UPDATE user_roadmaps SET active_milestone_id = milestone_id WHERE user_id = current_user`.
* **Analytics Events:** `roadmap_viewed`, `milestone_expanded` (id: milestone_id).
* **Accessibility Notes:** Full keyboard tab-navigation flow, SVG nodes include distinct accessible text descriptors.
* **Edge Cases:** User tries to skip to Milestone 3; system blocks execution, shakes node, displays message: "Unlock Milestone 2 first".
* **Micro Interactions:** Hovering over locked milestones displays a lock shake animation and dynamic tooltips listing prerequisites.
* **Animations:** Connection lines glow with flowing light particles.
* **Why this screen exists:** It changes an overwhelming career transformation into a structured, step-by-step game.

---

### Screen 9: Dashboard (Home Base)
* **Screen Name:** Dashboard Workspace (`/dashboard`)
* **Purpose:** Central hub tracking current project status, upcoming deadlines, code analytics, and active startup interviews.
* **User Emotion:** Productive, focused, in control of their career pathway.
* **User Goal:** Resume active coding workspace immediately.
* **Information Shown:** Active project status block, live debugging metrics (e.g. "Total Crashes: 14", "Lines Iterated: 1,420"), founder activity tracker, direct workspace link.
* **Information Intentionally Hidden:** Global leaderboards, forums, points systems.
* **Primary CTA:** `[Resume Coding Workspace]` (Navigates straight to active project IDE).
* **Secondary CTA:** `[Analyze My Career Data]` (Navigates to analytics dashboard).
* **Components:** Main status component card, metric grid, founder pipeline widget.
* **Layout Hierarchy:** Top bar with page navigation, left is active work module (larger size), right is career activity module.
* **Mobile Behaviour:** Bottom tab bar navigation, active card takes full screen area.
* **Desktop Behaviour:** Grid layout with sticky left workspace control module.
* **Empty State:** If user has no active project: display select screen selector block.
* **Loading State:** Content shimmers representing metrics data loading.
* **Success State:** Metrics load, showing green indicator lights on founder activity pipeline.
* **Error State:** DB connectivity error; dashboard falls back to cached local storage parameters.
* **AI Behaviour:** Custom recommendations text banner: "Startups are viewing Distributed Cache projects today. Finish yours to stand out."
* **Backend Events:** Fetch aggregate user statistics, fetch startup tracking counts.
* **Database Updates:** Record `dashboard_viewed_timestamp`.
* **Analytics Events:** `dashboard_loaded`, `workspace_resume_clicked`.
* **Accessibility Notes:** Table structures have explicit captions, landmarks defined via main, section, nav.
* **Edge Cases:** Active project was archived/reset; handle by automatically displaying project picker panel.
* **Micro Interactions:** Hovering over crash metrics shows tooltip breakdown: "Null Pointers: 8, Connection Refused: 6".
* **Animations:** Small pulsing dot representing active server connection.
* **Why this screen exists:** Provide a calm, daily starting point that emphasizes real coding activity and career signals over game points.

---

### Screen 10: Choose First Startup Problem (The Choice)
* **Screen Name:** Project Selection (`/projects`)
* **Purpose:** Select a concrete startup engineering challenge to solve.
* **User Emotion:** Curious, looking for practical, real-world relevance.
* **User Goal:** Commit to a project matching their skill path.
* **Information Shown:** 3 Project options: 1. "Design a Rate Limiter for an Auth Service" (Hard), 2. "Build a Write-Through Cache for Product Listings" (Medium), 3. "Implement a Event Logging Queue" (Medium). Show specific startups hiring for these problems.
* **Information Intentionally Hidden:** Academic textbook exercises, syntax cheatsheets.
* **Primary CTA:** `[Commit to Project]` (Navigates to `/workspace/project-brief`).
* **Secondary CTA:** `[Preview Repository Template]` (Opens slide-out code preview modal).
* **Components:** Grid selection layout cards, tech stack badge indicators, job match preview tags.
* **Layout Hierarchy:** Heading, category tab selector (Backend/Frontend), 3-column project selector grid, preview modal drawer.
* **Mobile Behaviour:** Scrollable cards deck, long tap previews template content.
* **Desktop Behaviour:** Detailed split screen showing listing cards on left, active card details preview panel on right.
* **Empty State:** N/A.
* **Loading State:** Card shimmers for dynamic project data.
* **Success State:** Clicking cards highlights borders in glow amber, active details pane updates instantly.
* **Error State:** API loading failure displays retry container with connection check.
* **AI Behaviour:** Ranks options based on user's assessment performance and highlights recommended track.
* **Backend Events:** Set active project configuration details on user session.
* **Database Updates:** `UPDATE user_projects SET status = 'selected' WHERE user_id = user AND project_id = selected`.
* **Analytics Events:** `project_selected` (id: project_id), `project_previewed`.
* **Accessibility Notes:** Visual labels match accessible labels, keypress triggers selection toggle.
* **Edge Cases:** Network disconnects during project selection; local cache preserves choice, retries database update when connection restores.
* **Micro Interactions:** Stack list icons animate inside badges on hover.
* **Animations:** Slide-in transition for the details pane.
* **Why this screen exists:** Ownership. Letting users choose their problems increases project completion rates and simulates real agency.

---

### Screen 11: Project Brief (The Requirements)
* **Screen Name:** Project Specification Brief (`/workspace/brief`)
* **Purpose:** Read and understand the business and technical constraints of the project.
* **User Emotion:** Determined, structured, starting to plan.
* **User Goal:** Grasp project constraints before writing any code.
* **Information Shown:** User story description, functional requirements ("Must scale to 10k request/sec", "Latency must be < 50ms"), system architecture block diagram, evaluation criteria.
* **Information Intentionally Hidden:** Code solutions, step-by-step tutorial instructions.
* **Primary CTA:** `[I Understand. Start Workspace]` (Redirects to active IDE).
* **Secondary CTA:** `[Download Spec PDF]` (Saves static copy).
* **Components:** Split specs panel, interactive architecture schematic viewer, system SLA metric tables.
* **Layout Hierarchy:** Header brief title, left layout is spec markdown document, right layout is interactive architecture map.
* **Mobile Behaviour:** Responsive vertical view, architecture diagram viewable via full-screen overlay toggle.
* **Desktop Behaviour:** Dual-pane split panel with customizable width slider.
* **Empty State:** N/A.
* **Loading State:** SVG shimmer animations for architecture schematics.
* **Success State:** Transitioning unlocks code workspace repositories.
* **Error State:** Asset server failure displays inline Markdown-formatted text specifications.
* **AI Behaviour:** None (Requirements must remain static and consistent to simulate real-world specifications).
* **Backend Events:** Provision dynamic workspace sandbox container.
* **Database Updates:** `UPDATE user_projects SET status = 'in_brief' WHERE id = user_project_id`.
* **Analytics Events:** `brief_viewed`, `architecture_diagram_interacted`.
* **Accessibility Notes:** Images have detailed descriptive tags, high-contrast table grid lines.
* **Edge Cases:** Workspace provisioning fails in backend; show warning panel with automatic retrying status bar.
* **Micro Interactions:** Hovering over architecture diagram highlights connected system components (e.g. database, queue).
* **Animations:** Smooth width adjustments when adjusting split-panel slider.
* **Why this screen exists:** In the real world, developers read briefs, not tutorials. This establishes professional coding habits.

---

### Screen 12: Understanding Phase (The Socratic Check)
* **Screen Name:** Workspace - Understanding Check (`/workspace/understanding`)
* **Purpose:** Validate that the user actually read the brief before writing code.
* **User Emotion:** Challenged, thinking critically, slightly frustrated but focused.
* **User Goal:** Pass the conceptual check to unlock the code repository.
* **Information Shown:** Socratic check prompt ("What is the primary trade-off of using a write-through cache here?"), free-text input box, validation indicator.
* **Information Intentionally Hidden:** Multiple-choice answers (user must think and type).
* **Primary CTA:** `[Validate My Understanding]` (Submits input to Socratic AI).
* **Secondary CTA:** `[Re-read Project Brief]` (Navigates back to spec).
* **Components:** Socratic prompt box, rich-text response editor, validation indicator panel.
* **Layout Hierarchy:** Centered question prompt, prominent response text area, bottom control actions.
* **Mobile Behaviour:** Mobile layout, text input optimized with autocorrect deactivated for technical terms.
* **Desktop Behaviour:** Sleek dual pane: brief on left, Socratic editor on right.
* **Empty State:** Empty text editor with placeholder prompt: `"Explain in your own words..."`.
* **Loading State:** CTA changes to `"Analyzing reasoning..."` with animated amber loading bar.
* **Success State:** Socratic feedback: `"Perfect logic. You identified the write latency trade-off. Code workspace unlocked."`
* **Error State:** Socratic feedback: `"Not quite. You mentioned latency, but what about data consistency if the cache server goes down?"` (Blocks lock, allows rewrite).
* **AI Behaviour:** Real-time LLM validation of user's conceptual answer using semantic schema check (not exact keyword matching).
* **Backend Events:** Route user input through the Socratic Analysis Engine.
* **Database Updates:** Save conceptual response draft to database progress log.
* **Analytics Events:** `understanding_checked`, `understanding_passed`, `understanding_failed_count`.
* **Accessibility Notes:** Editor has descriptive tags, validation results announced via screen reader.
* **Edge Cases:** User enters garbage text; AI detects low-effort input: `"That doesn't seem to address the question. Please write a real response."`
* **Micro Interactions:** Text area border glows amber as the user types; changes to red on failure, green on success.
* **Animations:** Success transition shifts background gradient, sliding the workspace modules into view.
* **Why this screen exists:** Prevents developers from writing code for a system they do not conceptually understand, saving hours of wasted syntax edits.

---

### Screen 13: Research Phase (The Source Engine)
* **Screen Name:** Workspace - Research (`/workspace/research`)
* **Purpose:** Help users research concepts, read documentation, and gather technical patterns within the context of their project.
* **User Emotion:** Analytical, seeking technical details.
* **User Goal:** Find code patterns, RFCs, and documentation for libraries like Redis, PostgreSQL, or system specs.
* **Information Shown:** Curated internal docs reader, linked reference articles, code block patterns, search bar.
* **Information Intentionally Hidden:** Direct stack-overflow solutions, code templates.
* **Primary CTA:** `[Add to Project Notes]` (Saves pattern snippet).
* **Secondary CTA:** `[Back to Code Editor]` (Returns to active code panel).
* **Components:** Search interface, article viewer, clipboard history module.
* **Layout Hierarchy:** Sidebar layout: Left is search results and index, right is selected article viewer.
* **Mobile Behaviour:** Full screen documentation list, tapping article overrides view.
* **Desktop Behaviour:** Contextual drawer overlay inside the IDE workspace.
* **Empty State:** Help prompt listing recommended queries (e.g. "How does Redis LRU eviction work?").
* **Loading State:** Shimmering lines for documents.
* **Success State:** Article loads, highlighting key paragraphs.
* **Error State:** Search returns zero matches; fallback offers simple Google developer links.
* **AI Behaviour:** Recommends research articles based on active bugs or gaps detected in code.
* **Backend Events:** N/A (Client-side search routing).
* **Database Updates:** Track research paths visited by user to build learning profiles.
* **Analytics Events:** `research_article_viewed` (url: url), `research_search_performed` (query: query).
* **Accessibility Notes:** Proper headers index structure, clear contrast ratios for code snippets.
* **Edge Cases:** Sandbox environment offline; falls back to embedded cached Markdown copies of documentation.
* **Micro Interactions:** Clicking code snippets copies to clipboard and shows brief success bubble.
* **Animations:** Slide drawer animation on desktop workspace.
* **Why this screen exists:** Developers spend 70% of their time reading documentation. We build this workflow directly into the platform workspace.

---

### Screen 14: Planning Phase (The Architecture Sketch)
* **Screen Name:** Workspace - Design Spec Planner (`/workspace/plan`)
* **Purpose:** Create a step-by-step implementation checklist and simple schema plan.
* **User Emotion:** Organized, logical, ready to build.
* **User Goal:** Define the database schemas, API contracts, and dev steps before coding.
* **Information Shown:** Markdown editor for design notes, visual DB schema designer widget, milestone tasks checklist.
* **Information Intentionally Hidden:** Automatic schema builders, drag-and-drop generators (user must define using text/code schemas).
* **Primary CTA:** `[Lock Plan & Start Coding]` (Saves plan details, unlocks repo editing).
* **Secondary CTA:** `[Share Plan with Coach]` (Requests Socratic feedback on architecture).
* **Components:** Markdown task list, dynamic visual table schema viewer.
* **Layout Hierarchy:** Dual pane: Schema design definitions on left, checklist planner on right.
* **Mobile Behaviour:** Single pane view toggled with a switch tab at bottom.
* **Desktop Behaviour:** Split panel synced with the main code editor workspace.
* **Empty State:** DB schema editor pre-filled with minimal baseline table templates.
* **Loading State:** Plan synchronization loader in header.
* **Success State:** Plan saved, workspace moves to building phase.
* **Error State:** Syntax error in schema configuration; highlights broken line.
* **AI Behaviour:** Socratic AI checks plan for obvious design flaws (e.g. "Missing primary key", "No indexing on search query").
* **Backend Events:** Parse schema text to check model validity.
* **Database Updates:** `INSERT INTO project_plans (user_id, plan_schema, step_checklist) VALUES (...)`.
* **Analytics Events:** `plan_created`, `schema_defined`, `plan_ai_feedback_requested`.
* **Accessibility Notes:** Visual database diagrams have table descriptions for screen readers.
* **Edge Cases:** Database modeling has cycles; AI alerts with feedback explaining relational cycle problems.
* **Micro Interactions:** Interactive checkboxes highlight text in strike-through states on completion.
* **Animations:** Checked items slide smoothly to the bottom of the list.
* **Why this screen exists:** System failures happen because of poor database modeling or step ordering. Designing first prevents code rewrite loops.

---

### Screen 15: Build Phase (The Workspace IDE)
* **Screen Name:** The Workspace IDE (`/workspace/ide`)
* **Purpose:** The core programming environment where the user edits code, runs compiler diagnostics, and triggers test pipelines.
* **User Emotion:** Immersed, focused, dealing with compiler errors, determined.
* **User Goal:** Implement system logic and resolve tests.
* **Information Shown:** Sidebar file browser tree, code editor (Monaco), integrated terminal console, active tests list, real-time error output.
* **Information Intentionally Hidden:** Standard IDE extensions, distracting customization themes.
* **Primary CTA:** `[Run Tests]` (Executes test suite, updates compiler logs).
* **Secondary CTA:** `[Consult Coach]` (Initiates Coach panel context overlay).
* **Components:** File explorer, Code Editor, Integrated Terminal Console, Tests Panel.
* **Layout Hierarchy:** Sidebar left, code editor top-right, integrated terminal bottom-right.
* **Mobile Behaviour:** Viewing repository template code is permitted; editing disabled on screens under 768px (prompt suggests switching to desktop).
* **Desktop Behaviour:** Responsive 3-pane layout with flexible pane handles.
* **Empty State:** Welcome splash dashboard inside the editor panel indicating selected file path.
* **Loading State:** Provisioning IDE container displays terminal spinner.
* **Success State:** Passing compiling test cycles updates tests sidebar status indicators to mint-green.
* **Error State:** Compilation crashes trigger compiler stacktraces outputting inside the console terminal.
* **AI Behaviour:** Observes compiler runs; does not suggest code fixes but flags pattern bugs Socratically.
* **Backend Events:** Run code container pipeline, execute test suites, capture stdout/stderr stream data.
* **Database Updates:** Track files modified counts, lines written counts.
* **Analytics Events:** `code_run_triggered`, `tests_executed`, `compilation_failed`.
* **Accessibility Notes:** Monaco editor keyboard shortcuts supported, high contrast dark theme.
* **Edge Cases:** Code loops indefinitely; sandbox halts process and returns CPU limit alerts.
* **Micro Interactions:** Tabs change with hover effects, lines highlighting error indicators display inline warning details.
* **Animations:** Test status indicator transitions from amber to green.
* **Why this screen exists:** This is the core sandbox workspace. It simulates the exact development workflow used at real tech startups.

---

### Screen 16: AI Coach Conversation (The Socratic Dialogue)
* **Screen Name:** Coach Workspace Panel (`/workspace/coach`)
* **Purpose:** Ask the Coach questions about errors and receive conceptual, step-by-step guidance without code answers.
* **User Emotion:** Stuck, looking for answers, forced to think.
* **User Goal:** Find the root cause of an error and resume coding.
* **Information Shown:** Chat message stream, contextual reference selector (e.g. attach error stack trace), question helpers.
* **Information Intentionally Hidden:** Paste code button, "Give me code" shortcut option.
* **Primary CTA:** `[Send Question]` (Transmits text to Coach).
* **Secondary CTA:** `[Attach Console Error]` (Injects active stack trace context).
* **Components:** Message log, text editor input, context attachment pills.
* **Layout Hierarchy:** Threaded log container inside slide drawer on the right workspace edge.
* **Mobile Behaviour:** Full screen conversation overlay.
* **Desktop Behaviour:** Right sidebar drawer (width: 380px) next to the main editor.
* **Empty State:** Default Socratic prompts ("I don't know what to do next", "My API is returning a 500 error").
* **Loading State:** AI typing animation.
* **Success State:** AI message streams in, highlighting technical concepts.
* **Error State:** Network connection error displays connection status message.
* **AI Behaviour:** Generates Socratic prompt responses using specialized technical rules.
* **Backend Events:** Trigger Socratic analysis engine using prompt history context.
* **Database Updates:** Save conversation exchange to message table log.
* **Analytics Events:** `coach_message_sent`, `stack_trace_attached`, `coach_helpful_rated`.
* **Accessibility Notes:** Thread container has `role="log"`, active input focuses dynamically.
* **Edge Cases:** User enters code syntax and asks Socratic AI to fix it; AI declines and provides debugging advice.
* **Micro Interactions:** Input box border pulses as AI synthesizes response content.
* **Animations:** Subtle typing dots jumping animation.
* **Why this screen exists:** Teaches engineers to debug from fundamentals instead of copy-pasting from AI prompts.

---

### Screen 17: Project Progress (The Simulation Runway)
* **Screen Name:** Project Progress Hub (`/workspace/progress`)
* **Purpose:** Show detailed progress metrics, test executions, and historical crash indicators.
* **User Emotion:** Competitive, analytical, progress-driven.
* **User Goal:** Track development metrics towards completion.
* **Information Shown:** Total runs count, passes count, file changes history, active debugging duration, and crash tracking logs.
* **Information Intentionally Hidden:** Peer comparison leaderboards (focus is purely on personal iteration).
* **Primary CTA:** `[Return to Work]` (Navigates to workspace IDE).
* **Secondary CTA:** `[Generate Review Draft]` (Initiates code evaluation analysis).
* **Components:** Analytics cards list, Git commit log visualization card, test results tracker.
* **Layout Hierarchy:** Sidebar left, metric panels right layout.
* **Mobile Behaviour:** Simplified list of recent runs with status indicators.
* **Desktop Behaviour:** Clean dashboard layout with interactive chart displays.
* **Empty State:** N/A (Populated from first workspace compiler execution).
* **Loading State:** Chart render shimmers.
* **Success State:** Metrics display system stability climbing over time.
* **Error State:** Server error displays static cache indicators.
* **AI Behaviour:** None.
* **Backend Events:** Compute user project workspace git history metrics.
* **Database Updates:** Update project runtime statistics metadata.
* **Analytics Events:** `progress_dashboard_viewed`, `commit_history_expanded`.
* **Accessibility Notes:** Visual charts include clean descriptive tabular views.
* **Edge Cases:** Project has zero commits; default state display suggests performing an initial commit in terminal.
* **Micro Interactions:** Hovering over timeline shows git hash metadata and status indicators.
* **Animations:** Line chart transitions from left-to-right.
* **Why this screen exists:** Translates coding sessions into a visual story of resilience and troubleshooting.

---

### Screen 18: Project Submission (The Simulation Lab)
* **Screen Name:** Workspace - Submission (`/workspace/submit`)
* **Purpose:** Trigger the system simulation suite to test the user's code against production loads and edge cases.
* **User Emotion:** Apprehensive, excited, hoping their code survives the simulation.
* **User Goal:** Run full system simulation and pass all test cases.
* **Information Shown:** Simulator status pane, mock traffic volume metric (e.g. "0 req/s -> 10,000 req/s"), system latency metrics, memory usage alerts, active error logs.
* **Information Intentionally Hidden:** Debugging logs (errors are presented exactly as a real monitoring tool like Datadog would show them).
* **Primary CTA:** `[Start Simulation]` (Runs build and triggers traffic simulation run).
* **Secondary CTA:** `[Cancel Run]` (Stops simulation execution).
* **Components:** Simulation dashboard, performance metrics monitors, live terminal log feed.
* **Layout Hierarchy:** Top panel displays system status (e.g., "Idle", "Simulating..."), bottom panel displays logs and metrics charts.
* **Mobile Behaviour:** Warning modal advising desktop usage for submission execution monitoring.
* **Desktop Behaviour:** Dual-pane split-screen: left is performance monitors, right is the CLI feedback stream.
* **Empty State:** Idle panel showing start CTA.
* **Loading State:** "Compiling build..." state with active progress bar tracker.
* **Success State:** All performance criteria met; shows a screen overlay: `"All tests passed. System survived production load."`
* **Error State:** System crashes at 4k req/s; displays crash log: `"OutOfMemoryError: Heap allocation exceeded"`.
* **AI Behaviour:** Analyzes performance profile logs to determine optimization recommendations.
* **Backend Events:** Deploy project build in sandbox container; run simulated HTTP traffic generation, capture memory metrics.
* **Database Updates:** `UPDATE user_projects SET test_runs = test_runs + 1 WHERE id = user_project_id`.
* **Analytics Events:** `submission_triggered`, `simulation_passed`, `simulation_failed` (load_reached: value).
* **Accessibility Notes:** Real-time updates utilize `aria-live` containers for accessibility.
* **Edge Cases:** Simulation timeout; sandbox kills processes, reporting resource limit failures.
* **Micro Interactions:** Gauges spin as simulated traffic rates scale upward.
* **Animations:** Live charting graphs update real-time request metrics.
* **Why this screen exists:** Simulates production scaling issues, shifting focus from "does it compile?" to "does it run under load?".

---

### Screen 19: AI Review (The Code Roast)
* **Screen Name:** AI Code Evaluation (`/workspace/review`)
* **Purpose:** Provide an automated, critical review of the user's architecture, patterns, security, and edge cases.
* **User Emotion:** Vulnerable, analytical, seeking constructive feedback.
* **User Goal:** Understand system gaps and get clear pointers on how to improve.
* **Information Shown:** Code quality score, architecture evaluation ("Good separation of concerns"), critical flaws checklist, Socratic feedback cards.
* **Information Intentionally Hidden:** Code rewrites (refuses to show corrected files).
* **Primary CTA:** `[Apply Feedback & Refactor]` (Reopens IDE workspace).
* **Secondary CTA:** `[Ask Coach for Clarification]` (Opens chatbot sidebar).
* **Components:** Review score card, interactive code diff panel displaying marked issues, feedback detail blocks.
* **Layout Hierarchy:** Left side has code quality overview card, right side has code display highlighting issues.
* **Mobile Behaviour:** Simplified review dashboard, highlighting issues by file names.
* **Desktop Behaviour:** Code diff split view with nested inline comment boxes.
* **Empty State:** N/A.
* **Loading State:** "Evaluating system architecture..." with dynamic typing skeletons.
* **Success State:** High scores trigger positive feedback cards and startup match notifications.
* **Error State:** Network failure defaults to showing local validation results.
* **AI Behaviour:** Performs deep code analysis to identify performance traps, security leaks, and architecture issues.
* **Backend Events:** Execute lint checking, run AST security sweeps, process Socratic review feedback draft.
* **Database Updates:** Save review reports.
* **Analytics Events:** `review_generated`, `feedback_item_expanded`.
* **Accessibility Notes:** Visual alerts include text label indicators, high contrast inline diff coloring.
* **Edge Cases:** Code has major syntax errors; AI aborts detailed review and suggests running standard compilation tests first.
* **Micro Interactions:** Hovering over highlighted issue code boxes opens detail popups.
* **Animations:** Score card numbers increment on initial load.
* **Why this screen exists:** Teaches engineers to handle code reviews, iterate on code design, and accept technical critique.

---

### Screen 20: Revision (The Refactoring Cycle)
* **Screen Name:** Revision Workspace (`/workspace/refactor`)
* **Purpose:** Refactor implementation code addressing the issues identified during the review phase.
* **User Emotion:** Determined, detail-oriented, persistent.
* **User Goal:** Refactor implementation to pass code quality and simulation checks.
* **Information Shown:** Interactive checklist of feedback issues, code editor workspace, active compiler outputs.
* **Information Intentionally Hidden:** Direct patch code applications.
* **Primary CTA:** `[Re-Run Simulation]` (Initiates new submission check).
* **Secondary CTA:** `[Dismiss Review Option]` (Skips non-critical review feedback).
* **Components:** Task list checklist panel, code editor pane, console outputs.
* **Layout Hierarchy:** Left panel is the issue checklist, right panel is the code editor workspace.
* **Mobile Behaviour:** Reading checklist layout supported.
* **Desktop Behaviour:** Dynamic split panel layout.
* **Empty State:** Displays empty state message if all review checklist issues have been resolved.
* **Loading State:** Compilation state loader indicator.
* **Success State:** Resolving issues checks checklist boxes, turning them mint-green.
* **Error State:** Refactoring introduces syntax breaks; compiler logs output details.
* **AI Behaviour:** Socratic AI compares changes to original implementations to track user's coding reasoning.
* **Backend Events:** Spin compilation docker container, compile source.
* **Database Updates:** Track refactoring iteration counts.
* **Analytics Events:** `refactoring_started`, `revision_resolved_item` (id: issue_id).
* **Accessibility Notes:** Interactive checklist options support screen reader toggles.
* **Edge Cases:** Code conflicts; workspace allows restoration of previously saved files from history logs.
* **Micro Interactions:** Checking issue checkbox applies line-through styles to text.
* **Animations:** Completed items fade out slightly.
* **Why this screen exists:** Engineering is primarily refactoring. This screen emphasizes that code is never finished on the first run.

---

### Screen 21: Publish Proof of Work (The Graduation)
* **Screen Name:** Publish Proof of Work (`/workspace/publish`)
* **Purpose:** Package the project's code, architectural decisions, and error logs into a readable portfolio page.
* **User Emotion:** Proud, relieved, excited to share.
* **User Goal:** Publish project details and make them visible to recruiters and founders.
* **Information Shown:** Form fields for reflection ("What was the hardest bug?"), architecture overview, live demo URL, Git commit logs tracker.
* **Information Intentionally Hidden:** Private environment variables, credentials keys.
* **Primary CTA:** `[Publish Portfolio Page]` (Saves details and generates public link).
* **Secondary CTA:** `[Back to Code Workspace]` (Aborts publishing, returns to editor).
* **Components:** Form cards, reflection textarea editor, preview card mockup.
* **Layout Hierarchy:** Left: input forms. Right: real-time preview showing what founders will see.
* **Mobile Behaviour:** Sequential step forms, mobile preview card modal.
* **Desktop Behaviour:** Two-column split-screen layout with real-time preview panel.
* **Empty State:** N/A.
* **Loading State:** "Packaging portfolio assets..." loaders.
* **Success State:** Success screen showing: `"Published. Your Proof of Work is now active."` and the URL.
* **Error State:** Form validation fails; displays error notifications above fields.
* **AI Behaviour:** Analyzes reflection inputs for low-effort text, suggesting improvement details Socratically.
* **Backend Events:** Build public portfolio page layout, index project in founder search.
* **Database Updates:** `UPDATE user_projects SET is_published = TRUE, published_at = NOW() WHERE id = ID`.
* **Analytics Events:** `proof_of_work_published`, `portfolio_previewed`.
* **Accessibility Notes:** Form labels explicitly mapped to fields via `htmlFor`, accessible validation messages.
* **Edge Cases:** Network timeout; autosave caches inputs locally so no data is lost.
* **Micro Interactions:** Typing inside inputs reflects inside the right side preview card live.
* **Animations:** Success transition changes the CTA into a clickable share link with a confetti pop.
* **Why this screen exists:** Standard portfolios show working code, but founders care about decision-making. This screen captures the developer's reasoning.

---

### Screen 22: Public Portfolio (The Proof of Work page)
* **Screen Name:** Public Portfolio Profile (`/p/:username`)
* **Purpose:** Public profile displaying user projects, error tracking, and performance scores for founders.
* **User Emotion:** Proud (Student) / Interested, analytical (Founder).
* **User Goal:** Showcase actual engineering capability to prospective employers.
* **Information Shown:** Profile metrics header, verified projects checklist, system architectural diagrams, error log history, developer reflections.
* **Information Intentionally Hidden:** Standard text resume bullet points (e.g. "Team player").
* **Primary CTA:** `[Request Interview]` (Recruiter action).
* **Secondary CTA:** `[View Source Code on GitHub]` (Opens Github link).
* **Components:** Profile bio card, project deck panels, performance metrics graphs.
* **Layout Hierarchy:** Sidebar with contact options, main area containing projects list.
* **Mobile Behaviour:** Single-column layout with project selection drawer.
* **Desktop Behaviour:** Two-column profile dashboard.
* **Empty State:** Dynamic helper message for owner user explaining how to publish their first project.
* **Loading State:** CSS shimmer animations on metrics components.
* **Success State:** Request Interview triggers success confirmation pop.
* **Error State:** Profile path not found returns 404 page.
* **AI Behaviour:** Dynamically displays summary analysis tags for the user's code performance.
* **Backend Events:** Query user profile metadata, fetch published projects lists.
* **Database Updates:** Log profile page visitor count.
* **Analytics Events:** `public_portfolio_viewed`, `recruiter_cta_clicked`.
* **Accessibility Notes:** Visual charts include tables, semantic content layout.
* **Edge Cases:** Anonymous visitor; hides private recruiter action buttons.
* **Micro Interactions:** Hovering over metrics graphs highlights detail tooltips.
* **Animations:** Interactive cards hover elevations.
* **Why this screen exists:** Traditional portfolios hide the messy reality of code. This screen reveals how the developer solves real engineering problems.

---

### Screen 23: Sharing (The Network Loop)
* **Screen Name:** Share Portfolio Modal (`/p/:username/share`)
* **Purpose:** Enable sharing of portfolio links across LinkedIn, X/Twitter, and email.
* **User Emotion:** Motivated, seeking visibility.
* **User Goal:** Copy portfolio link and post it to social platforms.
* **Information Shown:** Share link URL input field, quick share platform buttons list.
* **Information Intentionally Hidden:** Internal tracking parameters.
* **Primary CTA:** `[Copy Link]` (Copies link, updates text to "Copied!").
* **Secondary CTA:** `[Share to X/Twitter]` (Opens Twitter share intent).
* **Components:** Share container card, copy link panel, social action buttons.
* **Layout Hierarchy:** Centered overlay card.
* **Mobile Behaviour:** Opens native mobile share menu using Web Share API.
* **Desktop Behaviour:** Floating overlay card module.
* **Empty State:** N/A.
* **Loading State:** Short loading indicator during link construction.
* **Success State:** URL copied toast alert displays.
* **Error State:** Copy API fails; displays URL text highlighted inside select box.
* **AI Behaviour:** None.
* **Backend Events:** None (Client-side share handlers).
* **Database Updates:** None.
* **Analytics Events:** `portfolio_shared` (platform: platform_name).
* **Accessibility Notes:** Interactive targets are accessible via keyboard focus.
* **Edge Cases:** Browser does not support Clipboard API; falls back to text highlight inputs.
* **Micro Interactions:** Clicking Copy Link changes the button's icon to a checkmark.
* **Animations:** Confetti burst on successful copy.
* **Why this screen exists:** Network loop. Encouraging users to share their work drives high-quality organic developer signups to the platform.

---

### Screen 24: Startup Founder View (The Recruiter Hub)
* **Screen Name:** Recruiter Hub Dashboard (`/recruiter/candidates`)
* **Purpose:** Let founders search and filter candidates by actual codebase metrics and debug logs.
* **User Emotion:** Busy, looking for capable engineers, tired of resume spam.
* **User Goal:** Shortlist candidates who have solved the specific technical challenges they are hiring for.
* **Information Shown:** Candidate cards, problem difficulty filters, debugging metrics (e.g., lines refactored, simulation test passes), hiring actions.
* **Information Intentionally Hidden:** Candidates' university degrees, years of experience, current employer names (reduces bias).
* **Primary CTA:** `[Request Interview]` (Opens contact details modal).
* **Secondary CTA:** `[Inspect Code History]` (Opens candidate project diff log viewer).
* **Components:** Filters sidebar, candidates listing table, candidate summary drawer.
* **Layout Hierarchy:** Sidebar left, candidate main table grid right, details drawer slide-in right.
* **Mobile Behaviour:** Restricted access with responsive CSS layout prompting desktop usage for detailed resume inspection.
* **Desktop Behaviour:** Multi-column view with interactive candidate comparison panels.
* **Empty State:** Zero candidates match filters; displays search suggestions.
* **Loading State:** Row shimmers on candidate table.
* **Success State:** Requesting interview sends message and turns candidate status label to "Request Sent".
* **Error State:** Network error displays warning banner.
* **AI Behaviour:** Recommends candidates based on similarity of their projects to the startup's tech stack.
* **Backend Events:** Query candidate table matching search parameters.
* **Database Updates:** Create `interview_requests` record tracking recruiter and candidate details.
* **Analytics Events:** `recruiter_search_performed`, `candidate_inspected`, `interview_requested`.
* **Accessibility Notes:** Interactive elements utilize explicit grid navigation rules.
* **Edge Cases:** Recruiter hits monthly request cap; show pricing upgrade modal.
* **Micro Interactions:** Hovering over candidate metrics (e.g. "Crashes: 42") shows debugging details.
* **Animations:** Drawer slides out from screen right edge.
* **Why this screen exists:** This solves hiring by replacing resumes with verifiable code production data.

---

### Screen 25: Interview Request (The Connection)
* **Screen Name:** Interview Request Form (`/recruiter/request-interview`)
* **Purpose:** Send a personalized interview invite containing the specific coding project that caught the recruiter's eye.
* **User Emotion:** Eager to connect, hopeful.
* **User Goal:** Send a high-quality interview request directly to the candidate.
* **Information Shown:** Candidate name, project title, calendar link input, invitation note textbox.
* **Information Intentionally Hidden:** Candidate personal phone number, private email.
* **Primary CTA:** `[Send Interview Invitation]` (Dispatches email and notification).
* **Secondary CTA:** `[Cancel]` (Closes modal).
* **Components:** Invite editor panel, message template dropdown.
* **Layout Hierarchy:** Vertical container inside standard modal view.
* **Mobile Behaviour:** Full-height card overlay.
* **Desktop Behaviour:** Centered modal container (width: 500px).
* **Empty State:** N/A.
* **Loading State:** Spinner loader icon on button.
* **Success State:** Invite sent confirmation toast.
* **Error State:** Sending fails; displays error logs below message input.
* **AI Behaviour:** Pre-fills invitation message using details from the user's project logs.
* **Backend Events:** Dispatch email, create inbox message entry.
* **Database Updates:** `INSERT INTO messages (sender_id, receiver_id, content) VALUES (...)`.
* **Analytics Events:** `interview_invite_dispatched`.
* **Accessibility Notes:** Trap focus within modal, keyboard ESC key closes modal.
* **Edge Cases:** Recruiter session expires mid-write; draft saved to local memory, restored on login.
* **Micro Interactions:** Selecting templates replaces message area text with smooth fade.
* **Animations:** Scale-in transition for modal.
* **Why this screen exists:** To turn job hunting into an invite-only inbound flow based on merit.

---

### Screen 26: Success Dashboard (The Offer)
* **Screen Name:** Career Success Center (`/dashboard/success`)
* **Purpose:** Congratulate the student on landing a role and collect feedback to refine the system.
* **User Emotion:** Ecstatic, relieved, grateful.
* **User Goal:** Mark their profile as hired and share their success story.
* **Information Shown:** Congratulations banner, salary details, feedback forms, social share buttons.
* **Information Intentionally Hidden:** Daily learning tasks, roadmap tracks.
* **Primary CTA:** `[Mark Profile As Hired]` (Updates dashboard and stops email notifications).
* **Secondary CTA:** `[Share Story to LinkedIn]` (Opens LinkedIn share intent).
* **Components:** Celebration panel, testimonial form, social sharing cards.
* **Layout Hierarchy:** Single column centered layout with animated confetti canvas.
* **Mobile Behaviour:** Vertical stacked components, mobile-native share triggers.
* **Desktop Behaviour:** Wide screen card with decorative layout and animations.
* **Empty State:** N/A.
* **Loading State:** Loader during status updates.
* **Success State:** Page updates to "Hired Profile" status.
* **Error State:** Network connection error displays retry link.
* **AI Behaviour:** None.
* **Backend Events:** Mark user status as hired, pause roadmap triggers.
* **Database Updates:** `UPDATE user_profiles SET status = 'hired' WHERE user_id = current_user`.
* **Analytics Events:** `candidate_marked_hired`, `success_shared_social`.
* **Accessibility Notes:** Confetti animations are disabled if the system setting `prefers-reduced-motion` is active.
* **Edge Cases:** User mistakenly clicks hired; provide "Undo status change" link in footer.
* **Micro Interactions:** Confetti bursts on screen entry.
* **Animations:** Continuous slow rotations on celebrate graphic background.
* **Why this screen exists:** The ultimate conversion goal. Celebrating success motivates the community and validates the platform's value.

---

## 3. The Socratic AI Coach Engine

The AI Coach is not a chatbot; it is a system compiler monitor with a conversational wrapper. It works by keeping two states in memory:
1. **The System Specs:** The correct AST, performance limits, and test coverage maps.
2. **The Student Vector:** The history of changes, compiler errors, and conversations.

### AI Engine Guardrails
```
                   +------------------------+
                   |  Student Code & Logs   |
                   +-----------+------------+
                               |
                               v
                   +------------------------+
                   |   Has compilation or   |
                   |      syntax error?     |
                   +-----+------------+-----+
                         |            |
                    Yes  |            | No
                         v            v
            +--------------------+   +-----------------------+
            | Explain the stack  |   |  Is it an API / Logic  |
            | trace conceptually.|   |        failure?       |
            +--------------------+   +-----------+-----------+
                                                 |
                                                 v
                                     +-----------------------+
                                     | Ask the user:         |
                                     | "What does your log   |
                                     | print for variable X?"|
                                     +-----------------------+
```

*   **Socratic Instruction Loop:** The AI must never output markdown code blocks (` ``` `) containing functional project code. It can only output pseudo-code snippets of abstract concepts.
*   **Shallow Thinking Detection:** If a user makes 5 commits with the same error, or copies a block of code, the AI triggers a "Code Roast" diagnostic: `"You are editing code lines without changing the system architecture. Let's trace the data path step by step."`

---

## 4. 100 Realistic Student-AI Conversations

Below are the 100 conversation pathways simulating interactions within the MakeMistakes workspace.

### Conversations 1–10: Onboarding & Setup Anxiety
1. **Student:** I don't know what to do next.  
   **AI:** Read the project brief first. What is the first functional requirement you need to implement?
2. **Student:** This interface looks too complicated.  
   **AI:** It's just a file explorer, an editor, and a console. Let's start by opening `src/index.js` and reading the comments.
3. **Student:** Do I need to pay for this assessment test?  
   **AI:** No, the assessment is free. It helps me calibrate the difficulty of your roadmap. Select a track to start.
4. **Student:** What if I fail this diagnostic challenge?  
   **AI:** There is no failing here. Failing is simply diagnostic data to tailor your roadmaps. Give it your best guess.
5. **Student:** Why can't I click Milestone 2?  
   **AI:** You need to complete Milestone 1 first. Let's open the brief for the Distributed Cache project.
6. **Student:** Is this a real coding environment or a mock sandbox?  
   **AI:** It's a real Linux container running Node/Go. What you run in the terminal runs in a real sandbox.
7. **Student:** How do I configure my environment files?  
   **AI:** We manage environment variables in the project settings panel. Try adding your credentials key there.
8. **Student:** The terminal is completely empty.  
   **AI:** Run the initialization command `npm install` or `go mod tidy` in the terminal to fetch your project dependencies.
9. **Student:** Can I use Python instead of TypeScript for this backend track?  
   **AI:** The selected track uses TypeScript to test systems types. If you prefer Python, return to Onboarding and customize your track.
10. **Student:** How long will this project take me?  
    **AI:** The average developer takes 12 hours to implement the Distributed Cache. Take your time; the quality of your refactoring log is what matters.

### Conversations 11–20: Syntax & Compilation Failures
11. **Student:** My code won't compile.  
    **AI:** Paste the compilation error from the terminal window, and let's read the error message together.
12. **Student:** Line 42 has `SyntaxError: Unexpected token`.  
    **AI:** Check the line above. Did you close all braces, brackets, and parentheses properly?
13. **Student:** `TypeError: Cannot read properties of undefined (reading 'map')`.  
    **AI:** The variable you are calling `.map()` on has no value. Where is it initialized, and what returns it?
14. **Student:** What is a `NullPointerException`?  
    **AI:** You are trying to read property data from an object variable pointing to nothing (`null`). Check where that object is set.
15. **Student:** The build fails with `module not found`.  
    **AI:** Did you import the package name correctly, and is it listed in your `package.json` package configuration file?
16. **Student:** How do I fix a missing semicolon?  
    **AI:** Some languages require semicolons, others don't. Double check the line highlight error in your terminal console logs.
17. **Student:** `undefined is not a function`.  
    **AI:** You are calling a variable as a function, but the runtime sees it as undefined. Double-check your import declarations.
18. **Student:** Why is this type variable marked as `any`?  
    **AI:** TypeScript requires explicit types to prevent bugs. Define a structured interface for the API response payload.
19. **Student:** `go: no go.mod file found`.  
    **AI:** You are executing commands from the wrong directory. Type `ls` in the terminal to verify your current folder path.
20. **Student:** My editor is highlighting every line in red.  
    **AI:** Check your configuration file syntax. A missing bracket at the top of the file can break the parser for all lines below.

### Conversations 21–30: API & Network Diagnostics
21. **Student:** My API isn't working.  
    **AI:** What HTTP status code is the endpoint returning? Let's check the console logs.
22. **Student:** I'm getting a `404 Not Found` response.  
    **AI:** The router cannot match your request path. Compare the URL template in your route definitions file to your fetch code.
23. **Student:** The server returns `401 Unauthorized`.  
    **AI:** The request is missing credentials headers. Check if you are attaching authorization keys inside the request wrapper.
24. **Student:** I am hitting a `403 Forbidden` response.  
    **AI:** Your client is authenticated, but does not have the permission scopes needed. Check the user profile setup in your test mock DB.
25. **Student:** I'm getting a `500 Internal Server Error`.  
    **AI:** This means your server crashed during the run. Check the terminal logs to see the exception trace.
26. **Student:** `ECONNREFUSED` error on database connection.  
    **AI:** The database port is closed or the host string is wrong. Verify your database connection string port config.
27. **Student:** The API keeps returning `400 Bad Request`.  
    **AI:** The request payload doesn't match the schema rules. Validate the body JSON fields against the specification requirements.
28. **Student:** How do I inspect HTTP response headers?  
    **AI:** Add a log line to print the headers, or use the networking tab in the workspace console.
29. **Student:** My fetch request is timing out.  
    **AI:** Are you resolving the promise? Or is your backend server waiting on a database lock that never unlocks?
30. **Student:** The API works locally but fails in the test suite.  
    **AI:** The test suite uses a different database mock profile. Verify you are reading database details from dynamic environment configs.

### Conversations 31–40: Socratic Gatekeeping (Refusing Code)
31. **Student:** Can you give me the code?  
    **AI:** I cannot write code for you. I can help you figure it out. What part of the design specification is confusing?
32. **Student:** Just write the function for me, please.  
    **AI:** Writing the function wouldn't help you pass the simulation. Tell me what operations you want this function to run.
33. **Student:** I need the syntax to initialize a Redis pool in Go.  
    **AI:** Look at the Redis documentation folder in your sidebar workspace. Search for `"Pool initialization"` patterns.
34. **Student:** Show me how to configure CORS.  
    **AI:** CORS blocks unauthorized domain requests. In your middleware file, what headers do you need to allow cross-origin requests?
35. **Student:** Give me the SQL schema query.  
    **AI:** Let's sketch it. What tables do we need, and how do we link users to their project submissions?
36. **Student:** I'm tired. Just give me the patch code so I can pass.  
    **AI:** If I patch this, you won't know how to fix it when it crashes under 10k requests. Let's take a break or trace the error loop.
37. **Student:** What is the answer to step 3?  
    **AI:** I don't give answers, only clues. Read the code file logic and tell me what value you think is passed there.
38. **Student:** Can you translate this JS function to Go?  
    **AI:** Compare how both handle interfaces. Let's write the Go struct signature first. What fields does it need?
39. **Student:** Give me the import path for the test mock.  
    **AI:** Check the folder tree on the left. The test helpers are located under `tests/helpers/`. Can you see them?
40. **Student:** If you don't write this code, I will use ChatGPT.  
    **AI:** Using ChatGPT is your choice, but copy-pasted code will trigger our copy checks and fail the final simulation checks. Let's solve it together.

### Conversations 41–50: Database & Query Performance
41. **Student:** My queries are running extremely slowly.  
    **AI:** How many records are in the database, and do you have indexes set on the search filter columns?
42. **Student:** What is an index in a database?  
    **AI:** Think of it like a book index. Instead of reading every page to find a word, you look at the index directory. How do you write an `INDEX` query?
43. **Student:** My tests crash with `Too many connections`.  
    **AI:** Are you opening a new database connection client on every request? Ensure you use a single connection pool.
44. **Student:** How do I write a transaction query?  
    **AI:** A transaction ensures multiple queries succeed together, or all fail together. Look up `BEGIN`, `COMMIT`, and `ROLLBACK` SQL patterns.
45. **Student:** My foreign key constraint is failing.  
    **AI:** You are trying to reference a row ID that does not exist in the parent table. Verify the order of your database seed inserts.
46. **Student:** Should I use NoSQL or SQL for storing logs?  
    **AI:** What are your query patterns? Do you need strict relation schemas, or simple, high-speed document appends?
47. **Student:** My database is locking up during tests.  
    **AI:** Check if you have overlapping transactions that update the same rows in different orders, causing deadlocks.
48. **Student:** What is a N+1 query problem?  
    **AI:** You are querying a user row, then running separate database queries to fetch details for each user. How can you use a `JOIN` query?
49. **Student:** How do I perform a migration?  
    **AI:** Look at the schema changes folder. You need to write an `UP` migration script to alter the table structure.
50. **Student:** The database is return empty values.  
    **AI:** Print the query parameter strings before execution. Are the variable names matching the table columns?

### Conversations 51–60: Systems Scaling & Simulation Crash
51. **Student:** The simulation keeps crashing at 1k requests.  
    **AI:** Check your memory monitoring graph. Is it rising continuously without dropping? You might have a memory leak.
52. **Student:** What is causing a memory leak in my JS server?  
    **AI:** Are you appending user tracking details to global arrays without clearing them after requests finish?
53. **Student:** My server response times are spiking.  
    **AI:** Are you performing synchronous file reads inside your request handlers? Switch to asynchronous method operations.
54. **Student:** The test suite reports `504 Gateway Timeout`.  
    **AI:** The proxy server is waiting for your app process to respond. What CPU utilization metrics does the dashboard show?
55. **Student:** My server survived 5k requests but crashed at 10k.  
    **AI:** You are running out of file descriptors. Are you closing your database client instances after querying?
56. **Student:** How does caching help my system scale?  
    **AI:** Instead of querying the database for identical data, you fetch it from memory. What happens if the database updates, though?
57. **Student:** What is cache stampede?  
    **AI:** When your cache expires under heavy load, many concurrent requests hit the database at once. How can we prevent this?
58. **Student:** The simulation says `System Out of Memory`.  
    **AI:** Trace where data is held. Are you reading entire table rows into memory instead of streaming chunks?
59. **Student:** My rate limiter is blocking normal requests.  
    **AI:** What window time are you using? Let's check if the bucket size is too small for concurrent users.
60. **Student:** Why did my event queue stop processing?  
    **AI:** Are workers crashing, leaving messages locked in the queue? Inspect the worker process error output.

### Conversations 61–70: Socratic Logical Checks
61. **Student:** I'm getting inconsistent test results.  
    **AI:** This points to race conditions. Are you modifying global states across async request routines without locks?
62. **Student:** What is a race condition?  
    **AI:** When two processes read and edit the same variable at the same time. The final value depends on which finish last.
63. **Student:** How do I implement a mutex in Go?  
    **AI:** Go provides a package helper called `sync.Mutex`. Research how `.Lock()` and `.Unlock()` keep variables safe.
64. **Student:** My system is returning stale values.  
    **AI:** When you write data to the database, are you invalidating the cached records? Walk me through your invalidate flow.
65. **Student:** What happens if the caching server goes down?  
    **AI:** Does your server gracefully fall back to the database, or does the entire system crash? Implement a recovery path.
66. **Student:** How do I handle retry logic?  
    **AI:** If a server request fails, retrying immediately can overload it. Have you researched exponential backoff delays?
67. **Student:** The test says my API is insecure.  
    **AI:** Are you exposing database record auto-increment IDs in your API paths instead of secure UUID keys?
68. **Student:** How do I secure passwords?  
    **AI:** Never save passwords as raw text. Research hashing algorithms like BCrypt or Argon2.
69. **Student:** Why should I use UUIDs instead of integer IDs?  
    **AI:** Integer IDs are easily guessable. UUIDs prevent attackers from scanning records sequentially.
70. **Student:** What is SQL injection?  
    **AI:** When user inputs are concatenated directly into SQL queries, letting attackers execute commands. How do you parameterize inputs?

### Conversations 71–80: Refactoring & Architecture Feedback
71. **Student:** Socratic review says my code is too complex.  
    **AI:** Look at your main handler function. It is over 200 lines long. Can you split it into separate, modular methods?
72. **Student:** Why should I split functions?  
    **AI:** Small, single-purpose functions are easier to test, debug, and maintain. Let's isolate the database query logic first.
73. **Student:** What is dependency injection?  
    **AI:** Passing database or service clients to your handlers, rather than hardcoding initializations inside them. Why does this make testing easier?
74. **Student:** How do I mock a database for testing?  
    **AI:** Create an interface for database operations. During tests, pass a mock struct that matches the interface without touching real databases.
75. **Student:** Socratic review flagged a security vulnerability.  
    **AI:** You are sending sensitive user fields (like password hashes) in the profile API response. Strip those fields before outputting JSON.
76. **Student:** What is a clean folder architecture for API projects?  
    **AI:** Keep handlers, controllers, models, and routes in separate folders. It helps teams navigate codebases.
77. **Student:** Socratic says I am violating DRY principles.  
    **AI:** "Don't Repeat Yourself". You have copied the authorization logic in five handlers. How can you rewrite this using middleware?
78. **Student:** How does middleware work in HTTP servers?  
    **AI:** Middleware is a function wrapper that executes before your route handler. It can check credentials and block requests early.
79. **Student:** Socratic says my code has tight coupling.  
    **AI:** Your HTTP handler is directly calling database queries. If you change databases, you have to rewrite your HTTP code. Let's decouple them.
80. **Student:** My code is passing tests, is it finished?  
    **AI:** Functional correctness is step one. Look at the Socratic feedback on naming, consistency, and readability.

### Conversations 81–90: Portfolios & Job Preparation
81. **Student:** How do I publish my portfolio project?  
    **AI:** Go to the Submission page, pass the final simulation run, and click "Publish Proof of Work".
82. **Student:** What do founders see on my profile?  
    **AI:** They see your system designs, reflection notes, commit histories, optimization records, and test outputs.
83. **Student:** Do they see my compiler errors and crash logs?  
    **AI:** Yes. Showing how you resolved crashes is the best evidence of your engineering capability.
84. **Student:** How can I write a good reflection log?  
    **AI:** Describe the hardest bug you hit, how you diagnosed it, and why your fix is the right solution.
85. **Student:** Can I share this on LinkedIn?  
    **AI:** Definitely. Generating a portfolio page provides you with a shareable URL to include on social profiles.
86. **Student:** A founder viewed my profile, what next?  
    **AI:** If they like your engineering proof of work, they will send an interview request directly to your inbox.
87. **Student:** How do I handle a system design interview?  
    **AI:** Focus on trade-offs. No system is perfect. Explain why you chose specific cache structures or database indices.
88. **Student:** Can I link my GitHub account?  
    **AI:** Yes, you can link your GitHub profile to showcase code repositories directly on your portfolio.
89. **Student:** I got an interview request! What should I prepare?  
    **AI:** Review your project architecture and reflection logs. Be ready to explain your debug logs.
90. **Student:** How do I change my target career track?  
    **AI:** Go to the dashboard settings page, select "Change Track", and update your career selection.

### Conversations 91–100: Advanced Edge Cases & Logic Errors
91. **Student:** My local changes are gone.  
    **AI:** Don't worry. Check the local workspace history log. You can restore code files to any past save state.
92. **Student:** I am hitting rate limits in the workspace.  
    **AI:** You are sending requests inside a loop. Refactor your code to batch requests and prevent server overloading.
93. **Student:** What is the difference between latency and throughput?  
    **AI:** Latency is how long a single request takes. Throughput is how many requests your system handles per second.
94. **Student:** Socratic review says my variables have bad names.  
    **AI:** Using names like `x`, `temp`, or `data` makes code hard to read. Use descriptive names like `cachedUserSession` instead.
95. **Student:** How do I prevent data drift between cache and database?  
    **AI:** Use a database trigger or write code logic to invalidate cache keys whenever record updates occur.
96. **Student:** Socratic review flagged a potential SQL deadlock.  
    **AI:** Look at your transaction locks. Ensure you are locking rows in the same order across different transactions.
97. **Student:** The test suite is passing, but the console displays warnings.  
    **AI:** Do not ignore warnings. They are indicators of potential runtime deprecation or resource leaks. Inspect them.
98. **Student:** How do I handle massive write traffic?  
    **AI:** You can batch writes in memory or queue them in a buffer stream before saving to database disks.
99. **Student:** Socratic says I have unhandled promise rejections.  
    **AI:** Ensure all async calls have `.catch()` wrappers or use `try/catch` blocks to prevent server process halts.
100. **Student:** My portfolio URL returns a 404 error.  
     **AI:** Check your project publishing status on the submission page. Make sure you have clicked "Publish Proof of Work".

---

## 5. Proof of Work Artifact Details

The Proof of Work page is the ultimate artifact that replaces resumes. It is structured to answer one question for the founder: **"Can this person build systems that work?"**

### 1. The Metadata Header
*   **System Score (0–100):** A normalized score based on system throughput, latency under simulation, test passes, and code quality linting.
*   **Hiring Signal Indicator:** Standard high-intent tags: `[Active Candidate]`, `[Ready to Interview]`, `[Looking for remote]`.

### 2. Interactive System Architecture Map
*   Rendered as an interactive SVG showing the system design.
*   Hovering over nodes (e.g. Rate Limiter, Redis Cache, PostgreSQL) reveals the specific file names that implement that component.

### 3. The Project Story (The Narrative)
A structured reflection answering three questions:
*   *What was the hardest bug you hit?* (e.g., "A race condition on Redis key updates during load tests.")
*   *How did you isolate the problem?* (e.g., "I added log prints tracking variable keys, then analyzed thread execution traces.")
*   *What are the system trade-offs of your final implementation?* (e.g., "I used optimistic locking, which increases write retries but keeps database access clean.")

### 4. Git Commit History & Code Diffs
*   An interactive timeline showing the developer's journey.
*   Founders can click commits (e.g., `"Fix: prevent memory leak on connection pool"`) and inspect code changes directly on the page.

### 5. Simulator Performance Metrics Dashboard
*   **Load Survivor Chart:** Interactive performance graph showing request success rates scaling from 0 to 10k req/s.
*   **Latency Profile:** Line chart showing average request response times under load.
*   **System Logs:** The exact stdout/stderr logs produced by the developer's app during simulation runs, preserving error messages.

---

## 6. The Startup Founder Evaluation Loop

To understand how MakeMistakes makes hiring seamless, we trace the recruiter's path through the workspace.

### The Recruiter Interface
Founders bypass candidates who submit generic resumes, using filtered search lists instead.

```
+------------------------------------------------------------+
|  MakeMistakes Recruiter Hub                               |
+------------------------------------------------------------+
|  [Filter by Project: Write-Through Cache] [Survives >5k r/s]|
+------------------------------------------------------------+
|  Candidates Found:                                         |
|                                                            |
|  1. Candidate #F7A82 (Passed: Go System Spec, 12 Iterations)|
|     -> View Proof of Work | Request Interview              |
|                                                            |
|  2. Candidate #C219B (Passed: TS API Spec, 8 Iterations)   |
|     -> View Proof of Work | Request Interview              |
+------------------------------------------------------------+
```

### The Evaluation Journey
1. **The Invitation (5 seconds):** Recruiter clicks a shared portfolio link.
2. **The System Score (15 seconds):** Recruiter scans the dashboard header. A score of `92/100` indicates high capability.
3. **The Project Story (45 seconds):** Recruiter reads the reflection notes. An explanation of how they resolved database locking reveals real experience.
4. **The Code Inspection (60 seconds):** Recruiter opens the code differences to verify logic patterns and file structures.
5. **The Conversion (10 seconds):** Recruiter clicks "Request Interview", pre-filling templates referencing the candidate's project.

---

## 7. YC Partner Critique & Redesign Iterations

### The Critique
*   **Critique 1 (Business Model Risk):** Monetizing only when candidates are hired is a long revenue loop. We need recurring platform subscriptions for enterprise recruiters.
*   **Critique 2 (AI Quality Control):** If Socratic coaching is too strict, users will copy answers from secondary browser screens. We need anti-cheat validation.
*   **Critique 3 (Conversion Friction):** Requiring projects to survive production scaling is too hard for junior developers. We need progressive difficulty settings.

### The Redesign Iterations

#### Redesign 1: Recruiter Subscription Plans
*   **The Problem:** Unstable revenue.
*   **The Fix:** Charge recruiters $199/month for access to developer candidate pipelines.
*   **Database Schema Update:**
    ```sql
    CREATE TABLE recruiter_subscriptions (
        id UUID PRIMARY KEY,
        recruiter_id UUID REFERENCES recruiters(id),
        plan_tier VARCHAR(50),
        status VARCHAR(20),
        current_period_end TIMESTAMP
    );
    ```

#### Redesign 2: Active Plagiarism Check
*   **The Problem:** Copy-pasting code bypasses the learning system.
*   **The Fix:** Track clipboard paste actions in the workspace. If massive code blocks are pasted at once, prompt the user with Socratic questions about the pasted lines before validating.
*   **IDE Workspace Code Update:**
    ```javascript
    // src/components/IDE.js
    editor.onDidPaste((e) => {
        if (e.text.length > 150) {
            triggerPastedCodeSocraticVerify(e.text);
        }
    });
    ```

#### Redesign 3: Progressive Milestone Difficulties
*   **The Problem:** High initial drop-off.
*   **The Fix:** Split projects into three tiers: Core, Intermediate, and Advanced. Unlocking the basic tier requires only syntax checks; intermediate requires unit tests; advanced requires production scaling.

---

## 8. Summary Walkthrough of the Prototype

### Onboarding Steps
*   Goes from [Landing Page](file:///c:/makemistakes/product_specification.md#screen-1-the-landing-page-the-hook) to [Sign Up](file:///c:/makemistakes/product_specification.md#screen-2-sign-up-the-threshold).
*   Completes [Google OAuth verification](file:///c:/makemistakes/product_specification.md#screen-3-google-login-third-party-handshake) and accepts [Welcome terms](file:///c:/makemistakes/product_specification.md#screen-4-welcome-screen-setting-the-rules-of-engagement).
*   Sets target career roles in the [Career Selection panel](file:///c:/makemistakes/product_specification.md#screen-5-career-goal-selection-target-setup).

### The Workspace Loop
*   Selects a target project from the [Project Picker](file:///c:/makemistakes/product_specification.md#screen-10-choose-first-startup-problem-the-choice).
*   Answers conceptual questions in the [Understanding Check](file:///c:/makemistakes/product_specification.md#screen-12-understanding-phase-the-socratic-check).
*   Writes implementation code in the [Workspace IDE](file:///c:/makemistakes/product_specification.md#screen-15-build-phase-the-workspace-ide), debugging via the Socratic chat panel.
*   Triggers performance tests in the [Simulation Suite](file:///c:/makemistakes/product_specification.md#screen-18-project-submission-the-simulation-lab).

### Recruiting Pipeline
*   Publishes the portfolio page via [Graduation View](file:///c:/makemistakes/product_specification.md#screen-21-publish-proof-of-work-the-graduation).
*   Founders search candidates in the [Recruiter Dashboard](file:///c:/makemistakes/product_specification.md#screen-24-startup-founder-view-the-recruiter-hub).
*   Founders issue calendar invites via the [Interview request panel](file:///c:/makemistakes/product_specification.md#screen-25-interview-request-the-connection).
