'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, HardDrive, Search, Hammer, Shield, RefreshCcw, FileText, Bot } from 'lucide-react';

interface AgentState {
  id: string;
  name: string;
  icon: React.ElementType;
  status: 'Idle' | 'Active' | 'Analyzing' | 'Correcting' | 'Reporting' | 'Error';
  confidence: number; // 0-100
  currentTask: string;
  lastUpdate: string;
  color: string;
}

interface LogEntry {
  id: number;
  agent: string;
  timestamp: string;
  message: string;
  type: 'info' | 'hypothesis' | 'action' | 'correction' | 'error';
}

const agentIcons = {
  OrchestrationMaster: Brain,
  DataIngestionNormalizationAgent: HardDrive,
  ForensicHypothesisAgent: Search,
  TacticalExecutionAgent: Hammer,
  EvidenceIntegrityAuditAgent: Shield,
  CognitiveReflectionSelfCorrectionAgent: RefreshCcw,
  ReportingRemediationAgent: FileText,
};

const agentColors: Record<string, string> = {
  OrchestrationMaster: 'text-purple-400',
  DataIngestionNormalizationAgent: 'text-cyan-400',
  ForensicHypothesisAgent: 'text-orange-400',
  TacticalExecutionAgent: 'text-red-400',
  EvidenceIntegrityAuditAgent: 'text-green-400',
  CognitiveReflectionSelfCorrectionAgent: 'text-blue-400',
  ReportingRemediationAgent: 'text-yellow-400',
  System: 'text-slate-400',
};

const logTypeColors: Record<LogEntry['type'], string> = {
  info: 'text-slate-400',
  hypothesis: 'text-orange-300',
  action: 'text-cyan-300',
  correction: 'text-blue-300',
  error: 'text-red-500',
};

const initialAgentStates: AgentState[] = [
  { id: 'agent-om', name: 'Orchestration Master', icon: agentIcons.OrchestrationMaster, status: 'Active', confidence: 95, currentTask: 'Coordinating overall IR workflow', lastUpdate: 'Just now', color: agentColors.OrchestrationMaster },
  { id: 'agent-din', name: 'Data Ingestion & Normalization', icon: agentIcons.DataIngestionNormalizationAgent, status: 'Analyzing', confidence: 80, currentTask: 'Ingesting disk image from server X', lastUpdate: '30s ago', color: agentColors.DataIngestionNormalizationAgent },
  { id: 'agent-fh', name: 'Forensic Hypothesis', icon: agentIcons.ForensicHypothesisAgent, status: 'Idle', confidence: 0, currentTask: 'Waiting for normalized data', lastUpdate: '1min ago', color: agentColors.ForensicHypothesisAgent },
  { id: 'agent-te', name: 'Tactical Execution', icon: agentIcons.TacticalExecutionAgent, status: 'Idle', confidence: 0, currentTask: 'Waiting for hypothesis', lastUpdate: '1min ago', color: agentColors.TacticalExecutionAgent },
  { id: 'agent-eia', name: 'Evidence Integrity & Audit', icon: agentIcons.EvidenceIntegrityAuditAgent, status: 'Active', confidence: 99, currentTask: 'Monitoring all operations', lastUpdate: '5s ago', color: agentColors.EvidenceIntegrityAuditAgent },
  { id: 'agent-crsc', name: 'Cognitive Reflection & Self-Correction', icon: agentIcons.CognitiveReflectionSelfCorrectionAgent, status: 'Idle', confidence: 0, currentTask: 'Awaiting initial findings', lastUpdate: '2min ago', color: agentColors.CognitiveReflectionSelfCorrectionAgent },
  { id: 'agent-rr', name: 'Reporting & Remediation', icon: agentIcons.ReportingRemediationAgent, status: 'Idle', confidence: 0, currentTask: 'Awaiting validated findings', lastUpdate: '5min ago', color: agentColors.ReportingRemediationAgent },
];

const mockLogs: LogEntry[] = [
  { id: 1, agent: 'OrchestrationMaster', timestamp: '10:00:05', message: 'New incident alert received: Server Breach on Prod-DB01.', type: 'info' },
  { id: 2, agent: 'OrchestrationMaster', timestamp: '10:00:15', message: 'Assigned Data Ingestion Agent to collect data.', type: 'action' },
  { id: 3, agent: 'DataIngestionNormalizationAgent', timestamp: '10:00:30', message: 'Starting ingestion of remote logs from Prod-DB01.', type: 'info' },
  { id: 4, agent: 'EvidenceIntegrityAuditAgent', timestamp: '10:00:40', message: 'Initiated real-time monitoring of data ingestion process.', type: 'info' },
  { id: 5, agent: 'DataIngestionNormalizationAgent', timestamp: '10:01:30', message: 'Normalized 5GB of web server logs. Detected unusual access patterns.', type: 'info' },
  { id: 6, agent: 'OrchestrationMaster', timestamp: '10:01:45', message: 'Data ingestion complete. Notifying Forensic Hypothesis Agent.', type: 'action' },
  { id: 7, agent: 'ForensicHypothesisAgent', timestamp: '10:02:00', message: 'Analyzing normalized data for initial attack vectors.', type: 'info' },
  { id: 8, agent: 'ForensicHypothesisAgent', timestamp: '10:02:45', message: 'Hypothesis: Potential SQL Injection due to anomalous query strings from IP 192.168.1.100.', type: 'hypothesis' },
  { id: 9, agent: 'OrchestrationMaster', timestamp: '10:03:00', message: 'Hypothesis generated. Instructing Tactical Execution Agent to validate.', type: 'action' },
  { id: 10, agent: 'TacticalExecutionAgent', timestamp: '10:03:15', message: 'Executing SIFT query for SQL injection patterns against database logs.', type: 'action' },
  { id: 11, agent: 'EvidenceIntegrityAuditAgent', timestamp: '10:03:30', message: 'Monitored SIFT tool execution: non-destructive operation confirmed.', type: 'info' },
  { id: 12, agent: 'TacticalExecutionAgent', timestamp: '10:04:30', message: 'SIFT tool results: Found multiple successful SQLi attempts from 192.168.1.100.', type: 'info' },
  { id: 13, agent: 'CognitiveReflectionSelfCorrectionAgent', timestamp: '10:05:00', message: 'Reviewing current findings. Is exfiltration confirmed? Checking for lateral movement.', type: 'correction' },
  { id: 14, agent: 'ForensicHypothesisAgent', timestamp: '10:05:45', message: 'New hypothesis: Data exfiltration confirmed, now correlating with network flow data for destination.', type: 'hypothesis' },
];

export const AgentStatusHUD = ({ incidentId }: { incidentId: string }) => {
  const [agentStates, setAgentStates] = useState<AgentState[]>(initialAgentStates);
  const [liveLog, setLiveLog] = useState<LogEntry[]>(mockLogs);

  useEffect(() => {
    // Simulate agent activity and log streaming
    const interval = setInterval(() => {
      setAgentStates(prevStates => prevStates.map(agent => {
        if (Math.random() < 0.5) { // 50% chance to update status/task
          const newStatus = ['Idle', 'Active', 'Analyzing', 'Correcting', 'Reporting'][Math.floor(Math.random() * 5)] as AgentState['status'];
          const newConfidence = Math.min(100, agent.confidence + Math.floor(Math.random() * 10) - 3);
          const newTasks = {
            'Orchestration Master': ['Coordinating next steps', 'Reviewing agent outputs', 'Assigning tasks'],
            'Data Ingestion & Normalization': ['Ingesting memory dump', 'Normalizing network captures', 'Checking remote endpoints'],
            'Forensic Hypothesis': ['Correlating findings', 'Generating new hypotheses', 'Identifying patterns'],
            'Tactical Execution': ['Executing SIFT tool X', 'Running OpenClaw script', 'Verifying artifact Y'],
            'Evidence Integrity & Audit': ['Monitoring tool usage', 'Auditing data access', 'Logging actions'],
            'Cognitive Reflection & Self-Correction': ['Critiquing assumptions', 'Suggesting alternative paths', 'Validating conclusions'],
            'Reporting & Remediation': ['Drafting incident report', 'Proposing remediation steps', 'Generating executive summary'],
          }[agent.name] || ['Performing general tasks'];
          const newCurrentTask = newTasks[Math.floor(Math.random() * newTasks.length)];

          return {
            ...agent,
            status: newStatus,
            confidence: newConfidence,
            currentTask: newCurrentTask,
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        return agent;
      }));

      // Add a new random log entry
      const randomAgent = agentStates[Math.floor(Math.random() * agentStates.length)];
      const newLogEntry: LogEntry = {
        id: liveLog.length + 1,
        agent: randomAgent.name.replace(/ /g, ''), // Simplify name for log key
        timestamp: new Date().toLocaleTimeString(),
        message: `Agent ${randomAgent.name} performed a mock action.`, // Placeholder for dynamic message
        type: ['info', 'hypothesis', 'action', 'correction', 'error'][Math.floor(Math.random() * 5)] as LogEntry['type'],
      };
      setLiveLog(prevLog => [...prevLog, newLogEntry]);

    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [agentStates, liveLog.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-dark p-6 rounded-lg shadow-lg border border-slate-700"
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center"><Bot className="h-6 w-6 mr-2 text-primary-dark" /> Multi-Agent System Status</h2>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {agentStates.map((agent) => (
          <motion.div
            key={agent.id}
            className="bg-slate-800 p-4 rounded-md border border-slate-700 flex flex-col justify-between h-36"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <agent.icon className={`h-6 w-6 ${agent.color}`} />
                <span className="font-semibold text-white">{agent.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${agent.status === 'Active' ? 'bg-green-600' : agent.status === 'Error' ? 'bg-red-600' : 'bg-slate-600'} text-white`}>
                {agent.status}
              </span>
            </div>
            <p className="text-sm text-text-muted flex-grow overflow-hidden text-ellipsis whitespace-nowrap">Task: {agent.currentTask}</p>
            <div className="flex justify-between items-center text-xs text-text-muted mt-2">
              <span>Confidence: {agent.confidence}%</span>
              <span>{agent.lastUpdate}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Reasoning Log */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center"><Brain className="h-5 w-5 mr-2 text-secondary-dark" /> Live Reasoning Log</h3>
        <div className="bg-slate-800 p-4 rounded-md border border-slate-700 h-64 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
          {liveLog.map((entry) => (
            <motion.p
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-1 ${logTypeColors[entry.type]}`}
            >
              <span className="text-slate-500">[{entry.timestamp}]</span>
              <span className={`font-bold ${agentColors[entry.agent] || 'text-slate-400'}`}> {entry.agent}:</span>
              <span> {entry.message}</span>
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
