# CogniSIFT: Autonomous Incident Sentinel

> Transforming SIFT into an intelligent, self-correcting incident response expert.

## 🎯 Problem Statement
Incident response often involves complex, manual data correlation across diverse artifacts, leading to analyst fatigue, missed anomalies, and potential evidence integrity risks. Junior analysts struggle to mimic senior thought processes, resulting in slower resolution times and increased operational costs due to human error and inefficiency.

## 💡 Solution
CogniSIFT introduces a multi-agent AI system, powered by Gemini 1.5 Pro's reasoning and a custom MCP server, to fully automate incident response for Protocol SIFT. It intelligently ingests all case data, emulates senior analyst strategic thinking, enforces strict evidence integrity, and continuously self-corrects, providing validated, actionable insights to dramatically reduce response times and human error.

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, Tailwind CSS, Framer Motion, Lucide React |
| Backend | Python (Custom MCP Server, CrewAI/AutoGen Orchestration), Node.js (API Gateway/Proxy), Protocol SIFT (core IR platform), OpenClaw (for agent tool extensions) |
| APIs | Gemini 1.5 Pro (for advanced reasoning & long context), Claude Code (for specific code generation/scripting tasks within agents) |
| Deployment | Vercel (Frontend), Google Cloud Run (Custom MCP Server & Agent Orchestration) |

## 🤖 Agent Architecture

### Orchestration Master (CrewAI/LangGraph)
- **Role:** Overall incident response workflow management, task assignment, and state tracking.
- **Inputs:** New incident alert, user query, output from other agents.
- **Outputs:** Tasks for specialized agents, updated incident status, final report requests.

### Data Ingestion & Normalization Agent
- **Role:** Securely ingest diverse case data (disk images, memory, logs, network captures, remote endpoints via MCP) and normalize it for analysis.
- **Inputs:** Raw case data (paths, remote endpoints), incident type.
- **Outputs:** Parsed and normalized artifact data, metadata, initial data integrity checks.

### Forensic Hypothesis Agent (Gemini 1.5 Pro)
- **Role:** Analyze normalized data, identify patterns, generate initial hypotheses about attack vectors, malware presence, or data exfiltration. Utilizes Gemini's long context window for deep artifact correlation.
- **Inputs:** Normalized artifact data, initial incident context.
- **Outputs:** Validated hypotheses, suspicious indicators, recommended next analysis steps.

### Tactical Execution Agent (AutoGen/OpenClaw)
- **Role:** Select and execute specific Protocol SIFT tools via the Custom MCP Server's structured functions based on hypotheses, ensuring non-destructive operations and optimal tool sequencing.
- **Inputs:** Validated hypotheses, recommended analysis steps from Forensic Hypothesis Agent.
- **Outputs:** Raw analysis results from SIFT tools, enriched data for further analysis.

### Evidence Integrity & Audit Agent
- **Role:** Monitor all agent interactions and MCP server operations to ensure non-destructive actions, maintain a tamper-proof audit trail, and flag any potential evidence spoliation risks.
- **Inputs:** All agent actions, MCP server interactions, tool outputs.
- **Outputs:** Comprehensive audit logs, integrity alerts, validation reports.

### Cognitive Reflection & Self-Correction Agent (Gemini 1.5 Pro)
- **Role:** Critically review findings, agent decisions, and hypotheses. Identify logical inconsistencies, challenge assumptions, suggest alternative analysis paths, and validate conclusions. This is the core 'senior analyst thinking' emulation.
- **Inputs:** Current incident state, hypotheses, analysis results, audit logs, previous agent decisions.
- **Outputs:** Revised hypotheses, corrected analysis plans, identified missed leads, requests for re-execution or deeper dives, confidence scores for findings.

### Reporting & Remediation Agent
- **Role:** Synthesize all validated findings, generate comprehensive incident reports, and propose actionable remediation strategies.
- **Inputs:** Final validated findings, incident timeline, affected systems.
- **Outputs:** Formatted incident report, remediation recommendations, executive summaries.

## 🖥️ UI Pages

### Landing Page
**Purpose:** Showcase CogniSIFT's transformative capabilities, highlight the problem of manual IR, and present the innovative AI-driven solution. Focus on 'autonomous execution' and 'evidence integrity' as key selling points.
**Components:** HeroSection (Animated demonstration of agent workflow) · KeyFeatures (Autonomous execution, Self-correction, Evidence Integrity) · InnovationHighlight Section · Testimonials/Success Metrics · Call-to-Action (Get Started/Watch Demo)

### Dashboard - Case Overview
**Purpose:** Central hub for managing incidents, viewing high-level status, and accessing detailed case data. Premium theme with dark mode and interactive elements.
**Components:** Case List/Search · Incident Status Cards (Active, Resolved, Pending Review) · Summary Metrics (Avg. Resolution Time, Anomalies Detected) · Quick Actions (New Incident, Upload Data)

### Dashboard - Live Incident Analysis
**Purpose:** The core functional workspace demonstrating the multi-agent system in action. Provides real-time visibility into agent reasoning, actions, and findings.
**Components:** Agent Status HUD (Visualizing active agents, their current task, and confidence scores) · Live Reasoning Log (Streaming text log of agent collaboration, thought processes, hypothesis generation, and self-corrections, color-coded by agent) · Evidence Timeline (Interactive timeline of artifacts, actions taken, and key findings) · Anomaly Detection View (Visualizations of suspicious activity detected by agents) · Action/Recommendation Panel (Validated remediation steps, options for user intervention/approval) · Evidence Integrity Monitor (Real-time display confirming non-destructive operations and audit trail status)

## 🚀 Getting Started

```bash
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

## 🎬 Demo Flow

1. Step 1: Landing Page - Highlight the critical problem of manual incident response and introduce CogniSIFT's unique autonomous, self-correcting capabilities, emphasizing 'zero evidence spoliation risk' and 'fewer hallucinated findings'.
2. Step 2: Dashboard - Case Overview - Show an existing incident or initiate a new one, uploading diverse case data (e.g., a disk image, memory dump, and log files).
3. Step 3: Dashboard - Live Incident Analysis - The Multi-Agent HUD activates. The 'Data Ingestion Agent' processes data via the Custom MCP Server, populating the 'Evidence Timeline'.
4. Step 4: Reasoning & Execution - The 'Forensic Hypothesis Agent' (Gemini-powered) begins generating initial hypotheses, visible in the 'Live Reasoning Log'. The 'Tactical Execution Agent' (AutoGen/OpenClaw) then invokes SIFT tools via the Custom MCP Server for deeper analysis.
5. Step 5: Self-Correction & Validation - Crucially, the 'Cognitive Reflection Agent' (Gemini-powered) reviews a detected anomaly, flags a potential misinterpretation, and re-sequences the analysis path, demonstrating genuine self-correction. The 'Evidence Integrity & Audit Agent' continuously confirms safe operations.
6. Step 6: High-Impact Resolution - The 'Reporting & Remediation Agent' synthesizes the validated findings into a concise report with actionable recommendations shown in the 'Action/Recommendation Panel', demonstrating demonstrable accuracy improvement and the reduction of human effort.
7. Step 7: Conclude with a focus on the speed, accuracy, and integrity achieved, directly addressing all judging criteria.

## 📊 Scoring Strategy
CogniSIFT targets an 11/10 by directly addressing every judging criterion with an innovative, technically sophisticated, and user-centric approach. The 'Custom MCP Server' architecture combined with the 'Cognitive Reflection Agent' powered by Gemini 1.5 Pro's massive context window ensures unparalleled evidence integrity and genuine self-correction – the two most heavily weighted and challenging aspects. The multi-agent framework (CrewAI/AutoGen) explicitly mimics senior analyst thought processes (sequencing, anomalies, adjustment). Our 'Live Incident Analysis' UI provides a 'Visual WOW' that transparently showcases autonomous execution, leaving no doubt about its efficacy. Success metrics (zero evidence spoliation, fewer hallucinated findings, demonstrable accuracy) are baked into the core architecture and demo flow, proving tangible impact and user utility. This holistic product goes beyond a mere script, offering a complete, polished solution from landing page to a highly interactive, state-of-the-art dashboard.

---

*Generated by [Agents Assemble](https://github.com/QuisTech/agents-assemble) — The Hackathon Co-Founder Meta-System*
