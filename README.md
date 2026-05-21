# CogniSIFT: Autonomous Incident Sentinel

> Transforming SIFT into an intelligent, self-correcting incident response expert.

## 🎯 Problem Statement
Incident response often involves complex, manual data correlation across diverse artifacts, leading to analyst fatigue, missed anomalies, and potential evidence integrity risks. Junior analysts struggle to mimic senior thought processes, resulting in slower resolution times and increased operational costs due to human error and inefficiency.

## 💡 Solution
CogniSIFT introduces a multi-agent AI system, powered by advanced reasoning models and a custom MCP server, to fully automate incident response for Protocol SIFT. It intelligently ingests all case data, emulates senior analyst strategic thinking, enforces strict evidence integrity, and continuously self-corrects, providing validated, actionable insights to dramatically reduce response times and human error.

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide React |
| Backend / MCP | Node.js, Custom stdio Model Context Protocol (MCP) Server, Protocol SIFT (Core Forensic Platform) |
| Core APIs | Gemini 1.5 Pro (via `@google/generative-ai` SDK - selected for its long-context capability to ingest massive forensic dumps without truncation) |
| Deployment | Vercel (Frontend, API endpoints, and Telemetry SSE Stream) |

*Note: While optimized for Gemini 1.5 Pro's massive context window, the custom stdio MCP interface is fully model-agnostic and JSON-RPC compliant.*

## 🤖 Agent Architecture

CogniSIFT operates a structured, multi-agent pipeline written in pure TypeScript (`src/agents/`), designed to emulate senior forensic analyst workflows:

### 1. Orchestration Master (`OrchestrationMaster.ts`)
- **Role:** Central coordination, task queue sequencing, state machine management, and agent-to-agent message passing.
- **Inputs:** New incident telemetry alert, analyst queries, and output streams from child agents.
- **Outputs:** Targeted tasks for specialized agents, synchronized status updates, and reports.

### 2. Data Ingestion & Normalization Agent
- **Role:** Securely ingests raw system artifacts (memory dumps, system logs, master file tables) and formats them into standardized JSON schemas.
- **Inputs:** Raw telemetry files, incident type.
- **Outputs:** Normalized data streams, file hash checks.

### 3. Forensic Hypothesis Agent
- **Role:** Performs semantic analysis, correlates logs, and develops incident hypothesis models using Gemini 1.5 Pro's massive context window to correlate thousands of telemetry rows in a single pass.
- **Inputs:** Normalized artifact structures and telemetry.
- **Outputs:** Target analysis vectors and suspected anomaly types.

### 4. Tactical Execution Agent
- **Role:** Safely interfaces with the **Custom SIFT MCP Server** to run non-destructive commands (e.g. Memory forensics, MFT parsing), parsing outputs for refinement.
- **Inputs:** Directives and query parameters from the Forensic Hypothesis Agent.
- **Outputs:** Structured query records and tool execution results.

### 5. Evidence Integrity & Audit Agent
- **Role:** Continuously monitors commands against our safe allowlists, verifying cryptographic custody records to guarantee zero data spoliation.
- **Inputs:** Outbound command structures and execution responses.
- **Outputs:** Append-only ledger updates and validation statuses.

### 6. Cognitive Reflection & Self-Correction Agent
- **Role:** Critically evaluates intermediate findings using Gemini 1.5 Pro's deep reasoning capabilities, matches findings against known patterns, and directs the Orchestration Master to re-query or adjust hypothesis paths if anomalies are detected.
- **Inputs:** Intermediate findings, hypothesis confidence metrics, and audit logs.
- **Outputs:** Workflow correction directives and confidence ratings.

### 7. Reporting & Remediation Agent
- **Role:** Compiles the validated findings, cryptographically verified chain of custody logs, and timeline visualizations into a structured incident report.
- **Inputs:** Complete validated forensic logs.
- **Outputs:** Final JSON/Markdown reports and actionable mitigation recommendations.

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

## 🔌 Custom SIFT MCP Server (Forensic Orchestration)

To comply with SANS evidence safety standards, CogniSIFT implements a **zero-dependency Custom Model Context Protocol (MCP) Server** running over Standard I/O (stdio). 

### Key Forensic Safeguards:
1. **Strict Binary Allowlist:** No arbitrary shell commands. MCP invokes only pre-approved SIFT binaries mapped to strict absolute paths (e.g., `volatility3`, `fls`, `amcache.py`).
2. **Argument Sanitization Grammar:** Arguments are validated against rigid regexes (e.g., `imagePath` must match `/^\/evidence\/[a-zA-Z0-9_\-\.]+\.(raw|img|dd|E01)$/`) preventing command or argument injection.
3. **Tamper-Evident Ledger:** Employs an append-only, chained cryptographic hash log for the `chain_of_custody_register` tool. Each entry includes the SHA-256 of the previous entry, establishing a mathematically verifiable audit path.
4. **No Silent Degradation:** Validates outputs before emission. If standard SIFT tools fail or emit corrupt data, the server fails loudly with an explicit JSON-RPC error `-32603` and a `"status": "tool_output_rejected"` signature, warning the agent instantly.

### Exposed MCP Forensic Tools:
* `volatility_pslist`: Lists running memory processes (PIDs, PPIDs, paths).
* `volatility_malfind`: Scans memory pages for injected shellcode.
* `suspicious_parent_child_analyzer`: Audits memory process trees to highlight masquerading or parentage anomalies.
* `get_amcache`: Extracts Windows program execution and compile timeline records.
* `extract_mft_timeline`: Bodyfile parser extracting system creation and write times from `$MFT`.
* `chain_of_custody_register`: Creates a cryptographically linked custody entry.

### 🛡️ SANS Judging Rubric Alignment

CogniSIFT directly addresses SANS key evaluation criteria with solid engineering, moving past simple chat prompts:

* **Architectural Constraint Enforcement (Criterion 4)**: To guarantee zero evidence spoliation, we enforce strict architectural controls rather than prompt-based rules. The AI has absolutely no raw shell or terminal execution access. The custom MCP server sits as an impenetrable boundary, only executing pre-approved binaries under sanitized path grammars.
* **Tamper-Evident Audit Ledgers (Criterion 5)**: Every tool invocation, output hash, and agent reasoning step is logged on an append-only, cryptographically chained register. If a judge needs to trace any finding, they can instantly audit the mathematically chained blocks to verify exactly which tool run produced the result.
* **Genuine Real-Time Self-Correction (Criterion 1)**: By leveraging Gemini 1.5 Pro's long context, our Reflection loop constantly cross-references findings. If memory and disk timeline data present conflicting anomalies, the Orchestration Master dynamically adjusts the analysis queue mid-flight to re-verify hypotheses.

---

## 🚀 Getting Started

### 1. Launch SIFT MCP Server
The server is implemented in [mcp-server.js](file:///C:/Users/Administrator/Downloads/Agents%20Assemble/output/cognisift-autonomous-incident-sentinel/mcp-server.js) and runs completely offline with zero dependency overhead. 

```bash
# Standard Live Mode (requires local SIFT binaries installed)
npm run mcp

# Demo/Simulation Mode (runs realistic scenarios with synthetic tagging)
npm run mcp:demo

# Replay Mode (replays saved incident streams deterministically)
npm run mcp:replay
```

### 2. Client Integration (Cursor / Cline)
To register the server inside your AI Agent IDE:

**For Cline (`sift_mcp_config.json`):**
```json
"mcpServers": {
  "cognisift-sift-mcp": {
    "command": "node",
    "args": ["/absolute/path/to/mcp-server.js", "--demo-mode"]
  }
}
```

### 3. Run the Next.js HUD Dashboard
Start the Next.js visual HUD dashboard console:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live dashboard. Click any case incident to stream real-time SIFT MCP event telemetry via Server-Sent Events (SSE).


## 🎬 Demo Flow

1. Step 1: Landing Page - Highlight the critical problem of manual incident response and introduce CogniSIFT's unique autonomous, self-correcting capabilities, emphasizing 'zero evidence spoliation risk' and 'fewer hallucinated findings'.
2. Step 2: Dashboard - Case Overview - Show an existing incident or initiate a new one, uploading diverse case data (e.g., a disk image, memory dump, and log files).
3. Step 3: Dashboard - Live Incident Analysis - The Multi-Agent HUD activates. The 'Data Ingestion Agent' processes data via the Custom MCP Server, populating the 'Evidence Timeline'.
4. Step 4: Reasoning & Execution - The 'Forensic Hypothesis Agent' begins generating initial hypotheses, visible in the 'Live Reasoning Log'. The 'Tactical Execution Agent' then invokes SIFT tools via the Custom MCP Server for deeper analysis.
5. Step 5: Self-Correction & Validation - Crucially, the 'Cognitive Reflection Agent' reviews a detected anomaly, flags a potential misinterpretation, and directs the Orchestration Master to adjust the analysis path, demonstrating genuine self-correction. The 'Evidence Integrity & Audit Agent' continuously confirms safe operations.
6. Step 6: High-Impact Resolution - The 'Reporting & Remediation Agent' synthesizes the validated findings into a concise report with actionable recommendations shown in the 'Action/Recommendation Panel', demonstrating demonstrable accuracy improvement and the reduction of human effort.
7. Step 7: Conclude with a focus on the speed, accuracy, and integrity achieved, directly addressing all judging criteria.

## 📊 Engineering & Design Strategy

CogniSIFT is engineered from the ground up as a complete, high-fidelity platform designed to solve the real-world operational challenges of modern incident response teams:

1. **Evidence Safety & Zero-Spoliation by Design**: Instead of running unvalidated LLM-generated shell commands directly, CogniSIFT interfaces through a zero-dependency Model Context Protocol (MCP) server with a strict execution allowlist, rigid argument parsing grammars, and loud error state transitions. This guarantees complete forensic integrity throughout automated analysis.
2. **True Cognitive Self-Correction**: By introducing the Cognitive Reflection and Self-Correction loop using Gemini 1.5 Pro, CogniSIFT mimics the reasoning of a senior forensic lead. It audits intermediate hypotheses against anomalous indicators and automatically adjusts execution plans mid-incident, rather than executing static analysis playbooks.
3. **Robust Custom State Orchestration**: The multi-agent system relies on a fully typed, custom TypeScript state machine (`OrchestrationMaster.ts`) with structured interfaces rather than unpredictable scripting wrappers.
4. **Immersive Real-Time Telemetry HUD**: The Next.js frontend utilizes Server-Sent Events (SSE) to stream live reasoning steps, tool invocation sequences, and cryptographic audit ledgers. This provides incident response teams with complete transparency and real-time oversight of the autonomous workflow.
