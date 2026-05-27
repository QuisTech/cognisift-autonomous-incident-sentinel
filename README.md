# CogniSIFT: Autonomous Incident Response Platform

> Advanced forensic analysis and incident response automation with self-correcting intelligence.

## 🎯 Problem Statement
Incident response teams face overwhelming complexity in correlating diverse forensic artifacts, leading to prolonged investigations, potential evidence mishandling, and analyst fatigue. Junior analysts struggle to navigate complex forensic workflows, and organizations lack systematic approaches to incident triage and evidence validation.

Effective incident response requires intelligent automation for data correlation, forensic analysis, and quality validation. We built CogniSIFT to provide forensic teams with production-grade automation for evidence processing, anomaly detection, and self-validating incident analysis.

## 💡 Solution
CogniSIFT is a comprehensive incident response platform powered by advanced LLM reasoning and a custom Model Context Protocol (MCP) server for forensic tool integration. The system implements multi-stage analysis pipelines that autonomously process forensic artifacts, perform root cause analysis with self-correction capabilities, and generate validated incident reports with cryptographic chain-of-custody verification.

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide React |
| Backend / MCP | Node.js, Custom stdio Model Context Protocol (MCP) Server, SIFT Framework (Forensic Platform) |
| Core APIs | Gemini 1.5 Pro (for long-context forensic analysis without truncation) |
| Deployment | Vercel (Frontend, API endpoints, telemetry streaming) |

*Note: The custom stdio MCP interface is fully model-agnostic and JSON-RPC compliant.*

## 🏛️ System Architecture

CogniSIFT operates a structured multi-stage analysis pipeline implemented in TypeScript (`src/agents/`), designed to emulate forensic analyst workflows:

### 1. Orchestration Master (`OrchestrationMaster.ts`)
- **Function:** Central coordination, task sequencing, state management, and inter-component communication
- **Sources:** Incident alerts, analyst queries, component outputs
- **Outputs:** Task assignments, status updates, consolidated reports

### 2. Data Ingestion & Normalization Service
- **Function:** Ingests and normalizes raw forensic artifacts into standardized schemas
- **Processes:** Memory dumps, system logs, file system artifacts
- **Outputs:** Normalized data streams, integrity verification hashes

### 3. Forensic Analysis Engine
- **Function:** Performs semantic analysis and develops forensic hypotheses
- **Capabilities:** Large-context correlation, anomaly pattern matching, hypothesis generation
- **Outputs:** Analysis vectors, suspected anomaly classifications, confidence metrics

### 4. Tactical Execution Service
- **Function:** Safely interfaces with the Custom SIFT MCP Server for forensic analysis
- **Operations:** Memory forensics, file system parsing, process tree analysis
- **Outputs:** Structured query results, tool execution data

### 5. Evidence Integrity Verification
- **Function:** Validates and logs all forensic operations for compliance
- **Mechanisms:** Allowlist-based command validation, argument sanitization, cryptographic custody logging
- **Outputs:** Append-only audit ledger, verification status, compliance markers

### 6. Analysis Validation & Self-Correction
- **Function:** Validates intermediate findings against forensic patterns
- **Process:** Cross-reference evidence, confidence scoring, workflow correction
- **Outputs:** Validated findings, confidence ratings, remediation directives

### 7. Report Generation & Remediation
- **Function:** Synthesizes validated findings into structured incident reports
- **Content:** Forensic timeline, chain-of-custody logs, remediation recommendations
- **Outputs:** Incident reports (JSON/Markdown), actionable recommendations

## 🔌 Custom SIFT MCP Server (Forensic Orchestration)

CogniSIFT implements a zero-dependency Model Context Protocol server over Standard I/O for forensic tool orchestration.

### Security Architecture:
1. **Binary Allowlisting:** Only pre-approved forensic binaries execute (e.g., `volatility3`, `fls`, `amcache.py`)
2. **Argument Validation:** Strict regex-based parameter validation prevents injection attacks
3. **Cryptographic Audit Trail:** Append-only, SHA-256 chained ledger for all tool invocations
4. **Fail-Loud Design:** Validation errors produce explicit JSON-RPC errors, preventing silent failures

### Exposed Forensic Tools:
* `volatility_pslist`: Process enumeration from memory artifacts
* `volatility_malfind`: Malware injection detection and shellcode scanning
* `suspicious_parent_child_analyzer`: Process hierarchy anomaly detection
* `get_amcache`: Program execution and compile timeline extraction
* `extract_mft_timeline`: File system timeline from Master File Table
* `chain_of_custody_register`: Cryptographically verified custody logging

## 🖥️ UI Pages

### Landing Page
**Purpose:** Product positioning and problem demonstration
**Components:** Hero Section (Workflow visualization) · Key Features (Automation, Self-correction, Evidence Integrity) · Innovation Showcase · Use Cases

### Dashboard - Incident Management
**Purpose:** Central hub for case management and incident overview
**Components:** Active Incident List · Status Cards · Performance Metrics · Quick Actions

### Dashboard - Live Analysis View
**Purpose:** Real-time visibility into forensic analysis execution
**Components:** System Status Monitor (Active analysis pipeline) · Reasoning Log (Real-time analysis steps) · Evidence Timeline · Recommendations Panel

## 🚀 Getting Started

### 1. Launch SIFT MCP Server

The server is implemented in `mcp-server.js` and runs in multiple modes:

```bash
# Live mode (requires SIFT binaries installed)
npm run mcp

# Demo mode (simulates forensic operations with synthetic data)
npm run mcp:demo

# Replay mode (deterministic incident replay)
npm run mcp:replay
```

### 2. AI Agent IDE Integration

**For Cline (`sift_mcp_config.json`):**
```json
"mcpServers": {
  "cognisift-sift-mcp": {
    "command": "node",
    "args": ["/absolute/path/to/mcp-server.js", "--demo-mode"]
  }
}
```

### 3. Run the Analysis Dashboard

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the live analysis dashboard. Server-Sent Events (SSE) stream real-time forensic telemetry for active cases.

## 🎬 Demonstration Flow

1. **Introduction:** Present the operational challenges of manual incident response
2. **Case Upload:** Load diverse forensic artifacts (disk images, memory dumps, logs)
3. **Analysis Activation:** Multi-agent pipeline processes data through Custom MCP Server
4. **Hypothesis Generation:** Forensic Analysis Engine generates initial hypotheses
5. **Validation Loop:** Self-correction mechanism validates findings against forensic patterns
6. **Report Generation:** Synthesized report with chain-of-custody verification
7. **Impact Summary:** Demonstrate speed improvements and evidence integrity preservation

## 📊 Technical Implementation

CogniSIFT is engineered as a complete incident response platform addressing modern forensic automation challenges:

1. **Evidence Safety by Architecture:** Strict MCP interface prevents unvalidated command execution while enabling sophisticated forensic operations
2. **Cognitive Validation Loop:** Self-correcting analysis pipeline mimics senior forensic analyst reasoning through multi-stage validation
3. **Typed State Management:** Fully typed TypeScript orchestration (`OrchestrationMaster.ts`) with structured component interfaces
4. **Real-Time Telemetry:** Next.js frontend with Server-Sent Events (SSE) streams live reasoning, tool invocations, and audit logs for operational transparency

---

*Developed by [QuisTech](https://github.com/QuisTech) — Building intelligent forensic automation systems*
