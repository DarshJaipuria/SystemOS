import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const artifactDir = 'C:/Users/ektak/.gemini/antigravity/brain/2862eeec-f417-433d-a24f-fd36e06847bf';
const outputHtmlPath = path.join(process.cwd(), 'scratch', 'submission_document.html');
const outputPdfPath = path.join(process.cwd(), 'SystemOS_Final_Project_Submission_Report.pdf');
const artifactPdfPath = path.join(artifactDir, 'SystemOS_Final_Project_Submission_Report.pdf');

// Helper to convert image to base64
function getBase64Image(filename) {
  const fullPath = path.join(artifactDir, filename);
  if (fs.existsSync(fullPath)) {
    const fileBuffer = fs.readFileSync(fullPath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }
  return '';
}

const dashboardImg = getBase64Image('media__1785478954761.png');
const calendarImg = getBase64Image('media__1785476839926.png');
const analyticsImg = getBase64Image('media__1785479905978.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SystemOS - Project Submission Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 12mm 15mm 12mm 15mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.45;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }

    .page {
      page-break-after: always;
      position: relative;
      min-height: 268mm;
      padding-bottom: 20px;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Header & Footer */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }

    .header-logo {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 15pt;
      color: #6366f1;
      letter-spacing: -0.5px;
    }

    .header-tag {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .footer-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 8.5pt;
      color: #94a3b8;
    }

    /* Typography */
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 13.5pt;
      font-weight: 700;
      color: #1e1b4b;
      border-left: 4px solid #6366f1;
      padding-left: 8px;
      margin: 14px 0 8px 0;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin: 10px 0 4px 0;
    }

    p {
      margin: 0 0 8px 0;
      color: #334155;
      text-align: justify;
    }

    ul, ol {
      margin: 0 0 10px 0;
      padding-left: 18px;
      color: #334155;
    }

    li {
      margin-bottom: 3px;
    }

    /* Cover Styling */
    .cover-banner {
      background: linear-gradient(135deg, #0b111e 0%, #151e2e 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
    }

    .cover-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22pt;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px 0;
    }

    .cover-subtitle {
      font-size: 11pt;
      color: #818cf8;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .cover-meta {
      display: flex;
      gap: 12px;
      font-size: 8.5pt;
      color: #94a3b8;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 8px;
    }

    .cover-badge {
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      padding: 2px 8px;
      border-radius: 99px;
      font-weight: 600;
      border: 1px solid rgba(165, 180, 252, 0.3);
    }

    /* Cards & Boxes */
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }

    .highlight-box {
      background: rgba(99, 102, 241, 0.05);
      border-left: 4px solid #6366f1;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 10px;
      font-size: 10pt;
    }

    /* Image Container */
    .img-container {
      width: 100%;
      text-align: center;
      margin: 10px 0;
      background: #0b111e;
      padding: 6px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .img-container img {
      max-width: 100%;
      max-height: 110mm;
      border-radius: 4px;
      object-fit: contain;
    }

    .img-caption {
      font-size: 8pt;
      color: #94a3b8;
      margin-top: 4px;
      font-style: italic;
    }

    /* Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9pt;
    }

    th {
      background-color: #1e1b4b;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #1e1b4b;
    }

    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
    }

    .tag-blue { background: #e0e7ff; color: #3730a3; }
    .tag-green { background: #d1fae5; color: #065f46; }
    .tag-purple { background: #f3e8ff; color: #6b21a8; }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1: PROBLEM STATEMENT & CONTEXT ==================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SystemOS</div>
      <div class="header-tag">Final Project Submission Document</div>
    </div>

    <div class="cover-banner">
      <div class="cover-title">SystemOS — Habit Tracker & Digital Wellness Monitor</div>
      <div class="cover-subtitle">An On-Device AI Powered Student Performance & Behavioral Analytics System</div>
      <div class="cover-meta">
        <div><span class="cover-badge">Domain</span> Habit Tracking & Digital Health</div>
        <div><span class="cover-badge">Architecture</span> Next.js 16 + Local LLM (Ollama)</div>
        <div><span class="cover-badge">Submission</span> Official Project Report</div>
      </div>
    </div>

    <h2>1. Problem Statement & Context</h2>

    <div class="highlight-box">
      <strong>Core Challenge:</strong> High academic and professional competition demands extreme daily consistency, yet hyper-connected digital environments subject students and workers to severe distraction overload, burnout, and privacy vulnerabilities in cloud habit apps.
    </div>

    <p>
      In today’s modern world, competition is omnipresent. Every sector—from competitive examinations (JEE, NEET, Civil Services) to corporate technology roles—is saturated with qualified candidates. While everyone aspires to achieve a successful life, getting there requires long, sustained, and hard work paired with unwavering daily consistency.
    </p>
    <p>
      Unfortunately, in this modern era, the abundance of knowledge at our fingertips is accompanied by an unprecedented volume of distractive sources. Social media, constant notifications, and entertainment algorithms fragment human attention spans, making long-term habit formation extremely difficult.
    </p>

    <h3>A. Key Issues Tackled</h3>
    <ul>
      <li><strong>Cognitive Friction & Distraction Overload:</strong> Constant digital interruptions break study flow and prevent deep work habits from taking root.</li>
      <li><strong>The Consistency Deficit & Burnout:</strong> Most individuals start with high motivation but drop off within 14 days due to a lack of feedback mechanisms and unmanaged stress.</li>
      <li><strong>Passive Tracking Without Diagnosis:</strong> Conventional habit tools only log missed checkmarks. They fail to find mistakes in oneself, analyze patterns, or provide actionable feedback for self-correction.</li>
      <li><strong>Privacy Compromises in Cloud Applications:</strong> Existing wellness monitors upload sensitive user habits, stress logs, and personal health metrics to third-party cloud servers.</li>
    </ul>

    <h3>B. Urgency & Societal Relevance</h3>
    <p>
      Helping individuals reduce unnecessary friction, identify personal flaws, and build positive behavioral momentum directly improves productivity, mental health, and societal contribution. SystemOS converts habit tracking from a passive checklist into an active, privacy-first diagnostic operating system.
    </p>

    <div class="footer-bar">
      <div>SystemOS Project Report</div>
      <div>Page 1 of 5</div>
    </div>
  </div>

  <!-- ==================== PAGE 2: IDEATION & APPROACH ==================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SystemOS</div>
      <div class="header-tag">Ideation & Architectural Approach</div>
    </div>

    <h2>2. Ideation & Approach</h2>

    <p>
      Our project began by researching popular habit tracking applications inspired by platforms across Instagram ads, YouTube videos, and productivity blogs. While these apps offered initial inspiration, every existing tool presented significant caveats:
    </p>

    <table>
      <thead>
        <tr>
          <th>Existing App Pattern</th>
          <th>Key Caveat / Drawback</th>
          <th>SystemOS Solution & Approach</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cloud API AI Chatbots</td>
          <td>Uploads personal health logs; expensive cloud subscriptions</td>
          <td><strong>Local Ollama LLM (qwen3:4b)</strong> — 100% private on-device execution</td>
        </tr>
        <tr>
          <td>Simple Daily Checkboxes</td>
          <td>No month-scoped boundaries; allows manipulating future dates</td>
          <td><strong>Future-Date Protection Engine</strong> & Month-Scoped 35-Day Grid</td>
        </tr>
        <tr>
          <td>Isolated Text Lists</td>
          <td>Lacks analytical visual correlations between habits & wellness</td>
          <td><strong>Analytical Graphs</strong> (Radar Chart, Heatmap, Health Score Gauges)</td>
        </tr>
        <tr>
          <td>Unregulated Goals</td>
          <td>Allows invalid habit goals (e.g. setting 35 days in 30-day month)</td>
          <td><strong>Dynamic Goal Clamping (1–31 Days)</strong> scoped to active month</td>
        </tr>
      </tbody>
    </table>

    <h3>A. Our Technical Rationale & Key Requirements</h3>
    <p>
      To build a frictionless habit tracking system, we established 5 essential requirements:
    </p>
    <ol>
      <li><strong>Analytical Graphs & Radial Metrics:</strong> Recharts SVG Radar charts, 365-day heatmaps, and Area trend graphs to visualize mistakes and growth.</li>
      <li><strong>Sleek Single-View GUI:</strong> Japandi Soft Stone & Deep Space Navy Dark Mode design system showing metrics in a unified dashboard without tedious scrolling.</li>
      <li><strong>Social Leaderboard & Peer Motivation:</strong> Healthy competition and status badges to induce accountability and constructive regret over bad habits.</li>
      <li><strong>Gamified Reward System:</strong> Level progression (10 tiers), 15 unlockable badges, coin economy, and confetti celebrations to make consistency rewarding.</li>
      <li><strong>Streak & Failure Prediction System:</strong> Multi-month streak tracking paired with a 14-day rolling failure prediction algorithm to detect slumps before habits fail.</li>
    </ol>

    ${dashboardImg ? `
    <div class="img-container">
      <img src="${dashboardImg}" alt="SystemOS Dashboard Interface" />
      <div class="img-caption">Figure 1: SystemOS Executive Dashboard featuring Student Health Score (78), Exam Readiness (70), Current Streak, and AI Coach Aria.</div>
    </div>` : ''}

    <div class="footer-bar">
      <div>SystemOS Project Report</div>
      <div>Page 2 of 5</div>
    </div>
  </div>

  <!-- ==================== PAGE 3: FUNCTIONALITY & KEY FEATURES ==================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SystemOS</div>
      <div class="header-tag">Functionality & Key Features</div>
    </div>

    <h2>3. Functionality & Key Features</h2>

    <p>
      SystemOS is structured into 7 core functional modules providing a complete walkthrough of student productivity, focus, and digital wellness.
    </p>

    <h3>A. System Modules & Functional Walkthrough</h3>

    <table>
      <thead>
        <tr>
          <th>Module Name</th>
          <th>Functional Description & UI Elements</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Executive Dashboard</strong></td>
          <td>Dynamic greeting, 4 Live Ring Gauges (Health Score, Exam Readiness, Streak, Today's Progress %), Quick List checklist, AI Motivation.</td>
        </tr>
        <tr>
          <td><strong>2. Calendar Habit Tracker</strong></td>
          <td>Scoped 35-Day Month Grid, Future-Date Protection (future checkboxes disabled), Goal Clamping (1-31), Daily Rewards Claiming Modal.</td>
        </tr>
        <tr>
          <td><strong>3. Wellness Monitor</strong></td>
          <td>Screen Time, Sleep, Study, Exercise, Water Stepper (💧), Mood Selector, Stress/Energy/Focus sliders, Health Score Breakdown Gauge.</td>
        </tr>
        <tr>
          <td><strong>4. Pomodoro Focus Studio</strong></td>
          <td>Circular Timer Ring, Web Audio Synth Beep Engine, Subject Focus Tagger, Study Task Planner, 14-Day Subject Distribution Bar Chart.</td>
        </tr>
        <tr>
          <td><strong>5. Performance Analytics</strong></td>
          <td>365-Day Activity Heatmap, 30-Day Area Chart, Radar Chart (7-Day Avg), Habit Consistency Table, 1-Click PDF Exporter.</td>
        </tr>
        <tr>
          <td><strong>6. Gamification Engine</strong></td>
          <td>10 Level Tiers (Seedling → Legend), 15 Achievement Badges, Daily Missions, Coin Economy, Canvas Particle Confetti.</td>
        </tr>
        <tr>
          <td><strong>7. Social Community Feed</strong></td>
          <td>Peer Leaderboard, Live Activity Stream, Peer Badges & Milestone Feed.</td>
        </tr>
      </tbody>
    </table>

    ${calendarImg ? `
    <div class="img-container">
      <img src="${calendarImg}" alt="SystemOS Calendar Tracker View" />
      <div class="img-caption">Figure 2: SystemOS Scoped 35-Day Month Calendar Tracker featuring color-coded weeks, goal progress bars, and reward claim row.</div>
    </div>` : ''}

    <div class="footer-bar">
      <div>SystemOS Project Report</div>
      <div>Page 3 of 5</div>
    </div>
  </div>

  <!-- ==================== PAGE 4: REAL-WORLD APPLICATION & IMPACT ==================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SystemOS</div>
      <div class="header-tag">Real-World Application & Impact</div>
    </div>

    <h2>4. Real-World Application & Impact</h2>

    <h3>A. Intended Use Cases</h3>
    <p>
      SystemOS is specifically crafted for individuals willing to improve their lives by analyzing self-data, discovering personal flaws, and enforcing daily consistency:
    </p>
    <ul>
      <li><strong>Competitive Examination Aspirants (JEE, NEET, UPSC, GATE):</strong> Students managing 8–10 hour study routines, tracking sleep stability, and allocating subject study time without experiencing burnout.</li>
      <li><strong>Corporate Professionals & Remote Engineers:</strong> Knowledge workers balancing project milestones with screen time boundaries, hydration, and exercise goals.</li>
      <li><strong>Self-Directed Learners & Habit Builders:</strong> Individuals establishing daily coding, reading, or mindfulness habits with structured gamified rewards.</li>
    </ul>

    <h3>B. How SystemOS Solves the Core Problem</h3>
    <div class="info-card">
      <ol>
        <li><strong>Demotivates Bad Habits:</strong> Explicit screen time warnings, failure prediction alerts, and stress penalty scoring highlight negative behaviors before habits fail.</li>
        <li><strong>Motivates Consistent Good Habits:</strong> Instant XP rewards, level titles, flame streaks, and daily mission coins build strong positive momentum.</li>
        <li><strong>Healthy Competition via Leaderboard:</strong> Peer standings and activity feeds induce positive social accountability and constructive regret over missed goals.</li>
        <li><strong>100% Privacy Preservation:</strong> Local Ollama LLM execution guarantees sensitive health and routine data remains strictly on-device.</li>
      </ol>
    </div>

    ${analyticsImg ? `
    <div class="img-container">
      <img src="${analyticsImg}" alt="SystemOS Analytics & Intelligence View" />
      <div class="img-caption">Figure 3: SystemOS Performance Analytics View displaying the 365-Day Activity Heatmap, Wellness Balance Radar Chart, and Smart Insights.</div>
    </div>` : ''}

    <div class="footer-bar">
      <div>SystemOS Project Report</div>
      <div>Page 4 of 5</div>
    </div>
  </div>

  <!-- ==================== PAGE 5: TECH SPECS & CONCLUSION ==================== -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SystemOS</div>
      <div class="header-tag">Technical Specs & Conclusion</div>
    </div>

    <h2>5. Technical Specifications & Formulations</h2>

    <h3>A. Core Mathematical Formulations</h3>
    <div class="highlight-box">
      <strong>Student Health Score Formula (0–100 pts):</strong><br/>
      Health Score = Sleep(25) + Habits(20) + ScreenTime⁻¹(15) + Hydration(15) + Exercise(10) + Study(10) + Stress⁻¹(5)
    </div>

    <div class="highlight-box">
      <strong>Exam Readiness Score Formula (0–100 pts):</strong><br/>
      Exam Readiness = StudyHoursAvg(35) + SleepConsistency(20) + ScreenPenalty(20) + Pomodoros/10(15) + HabitPct(10)
    </div>

    <h3>B. System Architecture Summary</h3>
    <table>
      <thead>
        <tr>
          <th>Layer</th>
          <th>Technologies Used</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend Framework</strong></td>
          <td>Next.js 16 (App Router), React 19, Lucide Icons, Recharts</td>
        </tr>
        <tr>
          <td><strong>AI Engine</strong></td>
          <td>On-Device Ollama ('qwen3:4b'), 4s AbortController Timeout, Rule Engine Fallback</td>
        </tr>
        <tr>
          <td><strong>Backend & Database</strong></td>
          <td>Prisma ORM, SQLite / MySQL, LocalStorage Zero-Latency Cache</td>
        </tr>
        <tr>
          <td><strong>Styling & Design</strong></td>
          <td>CSS Modules, Japandi Light Theme, Deep Space Navy Dark Mode, Glassmorphism</td>
        </tr>
      </tbody>
    </table>

    <h2>6. Conclusion</h2>
    <p>
      SystemOS successfully fulfills the vision of an intelligent, privacy-first habit tracker and digital wellness monitor. By integrating analytical graphs, a single-view GUI, peer leaderboards, gamified rewards, and local AI coaching, SystemOS helps students and professionals eliminate distractions, correct personal mistakes, and achieve sustainable daily consistency.
    </p>

    <div class="info-card" style="text-align: center; margin-top: 24px; background: linear-gradient(135deg, #1e1b4b, #312e81); color: #ffffff;">
      <h3 style="color: #ffffff; margin-top: 0;">SystemOS Final Submission Report</h3>
      <p style="color: #c7d2fe; margin-bottom: 0; font-size: 9pt;">Generated for Final Hackathon Evaluation | Privacy-First Habit & Digital Health OS</p>
    </div>

    <div class="footer-bar">
      <div>SystemOS Project Report</div>
      <div>Page 5 of 5</div>
    </div>
  </div>

</body>
</html>`;

fs.mkdirSync(path.dirname(outputHtmlPath), { recursive: true });
fs.writeFileSync(outputHtmlPath, htmlContent);
console.log('✅ HTML compilation complete at:', outputHtmlPath);

// Execute Edge headless PDF conversion
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `& "${edgePath}" --headless --print-to-pdf="${outputPdfPath}" --no-pdf-header-footer "${outputHtmlPath}"`;

try {
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('✅ PDF compiled successfully at:', outputPdfPath);
  
  // Copy to artifact dir as well
  fs.copyFileSync(outputPdfPath, artifactPdfPath);
  console.log('✅ PDF copied to artifact directory at:', artifactPdfPath);
} catch (err) {
  console.error('❌ Error compiling PDF:', err);
}
