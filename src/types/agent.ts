/**
 * Represents the high-level state of an incident.
 */
export interface Incident {
  id: string;
  status: 'active' | 'resolved' | 'pending_review' | 'archived';
  title: string;
  description: string;
  createdAt: string;
  lastUpdated: string;
  assignedAgents: string[];
  // Add more incident-specific fields as needed
}

/**
 * Represents a single log entry from an agent's activity.
 */
export interface AgentLogEntry {
  timestamp: string;
  agentName: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'action' | 'hypothesis' | 'reflection';
  data?: Record<string, any>; // Optional additional data related to the log
}

/**
 * Represents the current operational state of an individual agent.
 */
export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'running_tool' | 'waiting_for_llm' | 'error' | 'paused';
  currentTask: string;
  confidenceScore?: number; // Optional, useful for cognitive agents
  lastHeartbeat: string; // Timestamp of last activity
}

/**
 * Represents normalized artifact data.
 */
export interface NormalizedArtifactData {
  type: string; // e.g., 'log', 'disk_image_metadata', 'network_flow'
  source: string; // e.g., 'server-prod-db01', 'forensic_workstation'
  timestamp: string;
  content: any; // The parsed and structured data
  metadata: Record<string, any>;
}

/**
 * Represents a forensic hypothesis.
 */
export interface Hypothesis {
  id: string;
  statement: string;
  confidence: number; // 0-1
  evidenceIds: string[]; // IDs of supporting evidence artifacts
  attackVector?: string; // e.g., 'SQLi', 'RCE', 'Phishing'
  malwareFamily?: string;
}

/**
 * Represents a remediation recommendation.
 */
export interface RemediationRecommendation {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionableSteps: string[];
  affectedSystems: string[];
}
